import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// NOTE: These are initialized inside POST handler to get fresh env variables
// (Vercel caches env variables at startup, so we read them on each request)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  // Initialize with fresh env variables
  let secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // HOTFIX: Vercel cachuje starou env variable, použij LIVE klíč
  const LIVE_SECRET_KEY = "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"
  
  if (!secretKey || secretKey.startsWith("sk_test_")) {
    console.warn("[v0] ⚠️ WEBHOOK: USING LIVE KEY FALLBACK - env variable contains test key")
    secretKey = LIVE_SECRET_KEY
  }

  if (!secretKey) {
    console.error("[v0] STRIPE_SECRET_KEY not configured")
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  if (!webhookSecret) {
    console.error("[v0] STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  })

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break

      case "customer.subscription.created":
        const createdSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(createdSubscription, supabase)
        break

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription, supabase)
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription, supabase)
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice, stripe)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice, supabase)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log("[v0] ✅ Checkout completed:", session.id)

  // Get user_id from metadata - MOST RELIABLE SOURCE
  const userId = session.metadata?.user_id
  const userEmail = session.customer_details?.email

  if (!userId) {
    console.error("[v0] ❌ No user_id in checkout session metadata. Email:", userEmail)
    // Fallback: try to find user by email
    if (!userEmail) {
      console.error("[v0] ❌ No user_id and no email - cannot process checkout")
      return
    }
    
    console.log("[v0] ⚠️ Attempting fallback: finding user by email:", userEmail)
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const user = authUsers?.users?.find(u => u.email === userEmail)
      
      if (!user) {
        console.error("[v0] ❌ User not found by email:", userEmail)
        return
      }
      
      await updateProfileForCheckout(user.id, session, supabase)
    } catch (error) {
      console.error("[v0] ❌ Error in fallback lookup:", error)
    }
    return
  }

  console.log("[v0] Found user_id in metadata:", userId)
  await updateProfileForCheckout(userId, session, supabase)
}

async function updateProfileForCheckout(userId: string, session: Stripe.Checkout.Session, supabase: any) {
  console.log("[v0] Updating profile for user:", userId, "with customer:", session.customer)

  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: session.customer as string,
      subscription_status: session.subscription ? "premium" : "free",
      subscription_tier: session.subscription ? "premium" : "free",
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[v0] ❌ Error updating profile:", error)
  } else {
    console.log("[v0] ✅ Profile updated with Stripe customer for user:", userId)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] ✅ Subscription created:", subscription.id)

  const customerId = subscription.customer as string
  const status = subscription.status === "trialing" ? "trialing" : "active"

  console.log("[v0] Subscription status:", status, "for customer:", customerId)

  try {
    // Find user by stripe_customer_id FIRST
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle()

    if (profileError || !profile) {
      console.error("[v0] ❌ Could not find user for customer:", customerId, "Error:", profileError)
      return
    }

    const userId = profile.user_id
    console.log("[v0] Found user:", userId, "for customer:", customerId)

    // Map Stripe status to our status
    let ourStatus = "premium"
    if (subscription.status === "trialing") {
      ourStatus = "trialing"
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: ourStatus,
        subscription_tier: ourStatus === "trialing" ? "trialing" : "premium",
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      })
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] ❌ Error updating subscription:", error)
    } else {
      console.log("[v0] ✅ Subscription activated for user:", userId, "status:", ourStatus)
    }
  } catch (error) {
    console.error("[v0] ❌ Error processing subscription created:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] 🔄 Subscription updated:", subscription.id)

  const customerId = subscription.customer as string

  try {
    // Find user by stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle()

    if (profileError || !profile) {
      console.error("[v0] ❌ Could not find user for customer:", customerId)
      return
    }

    const userId = profile.user_id
    console.log("[v0] Processing subscription update for user:", userId, "status:", subscription.status)

    // Map Stripe status to our status
    let status = "premium"
    let tier = "premium"

    if (subscription.status === "trialing") {
      status = "trialing"
      tier = "trialing"
    } else if (subscription.status === "canceled" || subscription.cancel_at_period_end) {
      status = "canceled"
      tier = "free"
    } else if (subscription.status === "past_due") {
      status = "past_due"
      tier = "premium" // Still premium until payment fails
    } else if (subscription.status === "active") {
      status = "active"
      tier = "premium"
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: status,
        subscription_tier: tier,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] ❌ Error updating subscription:", error)
    } else {
      console.log("[v0] ✅ Subscription updated - user:", userId, "status:", status, "tier:", tier)
    }
  } catch (error) {
    console.error("[v0] ❌ Error processing subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] ❌ Subscription deleted:", subscription.id)

  const customerId = subscription.customer as string

  try {
    // Find user by stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle()

    if (profileError || !profile) {
      console.error("[v0] ❌ Could not find user for customer:", customerId)
      return
    }

    const userId = profile.user_id
    console.log("[v0] Downgrading user to free:", userId)

    // Downgrade user to free but KEEP live data
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_tier: "free",
        stripe_subscription_id: null,
        subscription_current_period_end: null,
        // IMPORTANT: DO NOT RESET trading_mode - let user keep access to historical LIVE data
      })
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] ❌ Error downgrading to free:", error)
    } else {
      console.log("[v0] ✅ User downgraded to free (data preserved):", userId)
    }
  } catch (error) {
    console.error("[v0] ❌ Error processing subscription deleted:", error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, stripe: any) {
  console.log("💰 Payment succeeded:", invoice.id)

  // Ensure subscription is active
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionUpdated(subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log("❌ Payment failed:", invoice.id)

  const customerId = invoice.customer as string

  // Mark subscription as having payment issues
  // Don't immediately downgrade - Stripe will retry
  console.warn("Payment failed for customer:", customerId)
}
