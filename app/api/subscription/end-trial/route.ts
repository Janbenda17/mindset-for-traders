import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Lets a user who is currently mid-trial convert to a paid subscription
// immediately instead of waiting for the 14-day trial to run out.
//
// Why this exists: /upgrade previously showed trialing users only a static
// "you already have Premium during your trial" message with no button at
// all - there was no way for someone actively looking at the pricing page
// to just pay now. Ending the Stripe trial early (trial_end: "now") makes
// Stripe immediately attempt to charge the card already on file and flips
// the subscription to "active" (or "past_due" if the charge fails), which
// the existing webhook (customer.subscription.updated / invoice.paid)
// already handles - this route does not need to touch profiles itself.
export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[END-TRIAL] Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[END-TRIAL] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active trial found" }, { status: 404 })
    }

    if (profile.subscription_status !== "trialing") {
      return NextResponse.json({ error: "Subscription is not currently trialing" }, { status: 400 })
    }

    console.log("[END-TRIAL] Ending trial early for user:", user.id, "subscription:", profile.stripe_subscription_id)

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" })

    const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      trial_end: "now",
      proration_behavior: "none",
    })

    console.log("[END-TRIAL] ✓ Trial ended, new status:", subscription.status)

    return NextResponse.json({
      success: true,
      status: subscription.status,
    })
  } catch (error: any) {
    console.error("[END-TRIAL] ERROR:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to end trial" },
      { status: 500 },
    )
  }
}
