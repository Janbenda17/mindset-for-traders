import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-04-10" })

    // Get user profile to check if trial has ended
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, stripe_customer_id, subscription_status, trial_ends_at")
      .eq("user_id", userId)
      .maybeSingle()

    if (profileError || !profile) {
      console.error("[v0] Profile not found:", profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if trial has ended
    const now = new Date()
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null

    if (!trialEndsAt || now < trialEndsAt) {
      return NextResponse.json({
        error: "Trial has not ended yet",
        trialEndsAt: trialEndsAt?.toISOString(),
      }, { status: 400 })
    }

    // If user already has a subscription, don't create a new one
    if (profile.subscription_status === "active" || profile.subscription_status === "past_due") {
      return NextResponse.json({
        message: "User already has an active subscription",
      })
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const { data: user } = await supabase.auth.admin.getUserById(userId)

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: userId,
        },
      })

      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", userId)
    }

    // Create subscription - Pro plan
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO!,
        },
      ],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        supabase_user_id: userId,
        from_trial: "true",
      },
    })

    console.log("[v0] ✅ Subscription created:", subscription.id)

    // Update profile status
    await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_id: subscription.id,
        trial_ends_at: null,
      })
      .eq("user_id", userId)

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      message: "Subscription created after trial",
    })
  } catch (error) {
    console.error("[v0] Error converting trial to subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}
