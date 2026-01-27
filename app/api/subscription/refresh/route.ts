import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

/**
 * Endpoint to manually verify and update subscription status from Stripe
 * Useful for debugging and ensuring subscription status is correct
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] refresh-subscription: Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] refresh-subscription: user_id:", user.id)

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, is_premium")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] refresh-subscription: Profile error:", profileError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!profile?.stripe_customer_id) {
      console.log("[v0] refresh-subscription: No Stripe customer")
      return NextResponse.json({ 
        isPremium: false,
        message: "No Stripe customer found"
      })
    }

    // Get Stripe customer's subscription
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" })

    const customer = await stripe.customers.retrieve(profile.stripe_customer_id)
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      limit: 1,
    })

    const activeSubscription = subscriptions.data[0]
    const isPremium = activeSubscription?.status === "active" || activeSubscription?.status === "trialing"

    console.log("[v0] refresh-subscription: Active subscription:", activeSubscription?.id, "status:", activeSubscription?.status, "isPremium:", isPremium)

    // Update profile if needed
    if (isPremium !== profile.is_premium) {
      console.log("[v0] refresh-subscription: Updating profile - is_premium from", profile.is_premium, 'to', isPremium)
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_premium: isPremium,
          subscription_status: activeSubscription?.status || "inactive",
          subscription_tier: isPremium ? "premium" : "free",
        })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] refresh-subscription: Update error:", updateError)
      } else {
        console.log("[v0] refresh-subscription: ✓ Profile updated")
      }
    }

    return NextResponse.json({
      isPremium: isPremium,
      subscription_id: activeSubscription?.id,
      subscription_status: activeSubscription?.status,
      subscription_tier: isPremium ? "premium" : "free",
      message: isPremium ? "Premium subscription active" : "No active subscription",
    })
  } catch (error) {
    console.error("[v0] refresh-subscription error:", error)
    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 })
  }
}
