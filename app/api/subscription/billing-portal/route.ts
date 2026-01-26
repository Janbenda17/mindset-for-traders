import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      console.error("[BILLING_PORTAL] ERROR: STRIPE_SECRET_KEY not configured")
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[BILLING_PORTAL] Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[BILLING_PORTAL] User:", user.id)

    // Get user's stripe_customer_id from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[BILLING_PORTAL] ERROR fetching profile:", profileError.message)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    if (!profile || !profile.stripe_customer_id) {
      console.error("[BILLING_PORTAL] ERROR: No Stripe customer ID found for user:", user.id)
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18" })
    const returnUrl = new URL(request.url)
    returnUrl.pathname = "/account"

    console.log("[BILLING_PORTAL] Creating session for customer:", profile.stripe_customer_id)

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl.toString(),
    })

    console.log("[BILLING_PORTAL] ✓ Portal session created:", portalSession.id)

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("[BILLING_PORTAL] ERROR:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
