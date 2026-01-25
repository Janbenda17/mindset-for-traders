import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[v0] WEBHOOK: Received event, checking config...")
  console.log("[v0] WEBHOOK: Secret starts with:", webhookSecret?.substring(0, 15) + "...")
  console.log("[v0] WEBHOOK: Stripe key starts with:", secretKey?.substring(0, 10) + "...")

  // Validate required config
  if (!secretKey) {
    console.error("[v0] WEBHOOK ERROR: STRIPE_SECRET_KEY not configured")
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  if (!webhookSecret) {
    console.error("[v0] WEBHOOK ERROR: STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  if (!sig) {
    console.error("[v0] WEBHOOK ERROR: No stripe-signature header")
    return NextResponse.json({ error: "No signature header" }, { status: 400 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  })

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  let event: Stripe.Event

  try {
    console.log("[v0] WEBHOOK: Attempting to verify signature with secret:", webhookSecret.substring(0, 15) + "...")
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    console.log("[v0] WEBHOOK: ✓ Signature verified successfully for event:", event.type)
  } catch (err) {
    console.error("[v0] WEBHOOK ERROR: Signature verification failed!")
    console.error("[v0] WEBHOOK ERROR: Message:", err instanceof Error ? err.message : String(err))
    console.error("[v0] WEBHOOK ERROR: Secret used:", webhookSecret?.substring(0, 15) + "...")
    console.error("[v0] WEBHOOK ERROR: Sig header length:", sig?.length)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break

      default:
        console.log("[v0] WEBHOOK: Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] WEBHOOK ERROR: Processing failed:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log("[v0] WEBHOOK: checkout.session.completed - sessionId:", session.id)

  const userId = session.metadata?.user_id
  const userEmail = session.customer_details?.email

  if (!userId) {
    console.error("[v0] WEBHOOK: No user_id in metadata for session", session.id, "- Email:", userEmail)
    return
  }

  console.log("[v0] WEBHOOK: Updating profile for user:", userId, "with customer:", session.customer)

  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: session.customer as string,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[v0] WEBHOOK ERROR: Failed to update customer_id:", error)
  } else {
    console.log("[v0] WEBHOOK: ✓ Stored stripe_customer_id for user:", userId)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.created - subscriptionId:", subscription.id, "status:", subscription.status)

  const customerId = subscription.customer as string

  // Find user by stripe_customer_id
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (lookupError || !profile) {
    console.error("[v0] WEBHOOK ERROR: Could not find user for customer:", customerId)
    return
  }

  const userId = profile.user_id
  const status = subscription.status === "trialing" ? "trialing" : subscription.status === "active" ? "active" : "pending"

  console.log("[v0] WEBHOOK: Activating subscription for user:", userId, "status:", status)

  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      subscription_tier: status === "active" || status === "trialing" ? "premium" : "free",
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[v0] WEBHOOK ERROR: Failed to update subscription:", error)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription created for user:", userId, "status:", status)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.updated - subscriptionId:", subscription.id, "status:", subscription.status)

  const customerId = subscription.customer as string

  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (lookupError || !profile) {
    console.error("[v0] WEBHOOK ERROR: Could not find user for customer:", customerId)
    return
  }

  const userId = profile.user_id

  // Map Stripe status to app status
  let appStatus: string
  let tier: string

  if (subscription.status === "active") {
    appStatus = "active"
    tier = "premium"
  } else if (subscription.status === "trialing") {
    appStatus = "trialing"
    tier = "premium"
  } else if (subscription.status === "past_due") {
    appStatus = "past_due"
    tier = "premium"
  } else if (subscription.status === "canceled") {
    appStatus = "canceled"
    tier = "free"
  } else {
    appStatus = subscription.status
    tier = "free"
  }

  console.log("[v0] WEBHOOK: Updating subscription for user:", userId, "appStatus:", appStatus, "tier:", tier)

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: appStatus,
      subscription_tier: tier,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[v0] WEBHOOK ERROR: Failed to update subscription:", error)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription updated for user:", userId, "status:", appStatus)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.deleted - subscriptionId:", subscription.id)

  const customerId = subscription.customer as string

  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (lookupError || !profile) {
    console.error("[v0] WEBHOOK ERROR: Could not find user for customer:", customerId)
    return
  }

  const userId = profile.user_id
  console.log("[v0] WEBHOOK: Downgrading user to free:", userId)

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
      stripe_subscription_id: null,
      subscription_current_period_end: null,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[v0] WEBHOOK ERROR: Failed to downgrade subscription:", error)
  } else {
    console.log("[v0] WEBHOOK: ✓ User downgraded to free:", userId)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log("[v0] WEBHOOK: invoice.payment_succeeded - invoiceId:", invoice.id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log("[v0] WEBHOOK: invoice.payment_failed - invoiceId:", invoice.id)
}
