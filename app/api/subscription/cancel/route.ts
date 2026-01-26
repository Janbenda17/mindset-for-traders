import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    // Get authenticated user
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[CANCEL] Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[CANCEL] User:", user.id)

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription" }, { status: 404 })
    }

    console.log("[CANCEL] Subscription ID:", profile.stripe_subscription_id)

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" })

    // Cancel subscription at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    console.log("[CANCEL] ✓ Subscription scheduled for cancellation at period end")

    // Update profile in database
    await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_tier: "free",
        is_premium: false,
      })
      .eq("user_id", user.id)

    return NextResponse.json({
      success: true,
      message: "Předplatné bude zrušeno na konci aktuálního období",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      },
    })
  } catch (error: any) {
    console.error("[CANCEL] ERROR:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    )
  }
}
