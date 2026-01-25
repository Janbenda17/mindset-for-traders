import Stripe from "stripe"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    console.error("[v0] WEBHOOK ERROR: Missing stripe-signature header")
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  const rawBody = await req.text()
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey) {
    console.error("[v0] WEBHOOK ERROR: STRIPE_SECRET_KEY not configured")
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  if (!webhookSecret) {
    console.error("[v0] WEBHOOK ERROR: STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-06-20",
  })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
    console.log("[v0] WEBHOOK: ✓ Event verified -", event.type, "id:", event.id)
  } catch (err: any) {
    console.error("[v0] WEBHOOK ERROR: Signature verification failed -", err?.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break

      case "customer.subscription.created":
        const created = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(created, supabase)
        break

      case "customer.subscription.updated":
        const updated = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updated, supabase)
        break

      case "customer.subscription.deleted":
        const deleted = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deleted, supabase)
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice, supabase)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(failedInvoice, supabase)
        break

      default:
        console.log("[v0] WEBHOOK: Unhandled event type -", event.type)
    }

    // Always return 200 OK for idempotence
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] WEBHOOK ERROR: Processing failed -", error instanceof Error ? error.message : String(error))
    // Still return 200 to prevent Stripe from retrying
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log("[v0] WEBHOOK: checkout.session.completed - session:", session.id, "customer:", session.customer)

  const userId = session.metadata?.user_id
  const customerId = session.customer as string

  if (!userId || !customerId) {
    console.error("[v0] WEBHOOK ERROR: Missing user_id or customer in checkout session")
    return
  }

  // Store customer ID if this is first checkout
  const { error: customerError } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId)

  if (customerError) {
    console.error("[v0] WEBHOOK ERROR: Failed to store customer ID:", customerError)
    return
  }

  console.log("[v0] WEBHOOK: ✓ Stored customer_id for user:", userId)

  // If subscription was created in this checkout, customer.subscription.created will also fire
  // So we just store the customer ID here and let subscription events handle activation
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.created - subscription:", subscription.id, "status:", subscription.status)

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

  // Map Stripe status to our status - activate if active or trialing
  const isActive = subscription.status === "active" || subscription.status === "trialing"
  const subscriptionStatus = isActive ? "active" : "pending"

  console.log("[v0] WEBHOOK: Activating premium for user:", userId, "subscription:", subscription.id, "status:", subscriptionStatus)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscriptionStatus,
      subscription_tier: isActive ? "premium" : "free",
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to activate premium:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium activated for user:", userId)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.updated - subscription:", subscription.id, "status:", subscription.status)

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
  let isPremium = false
  let subscriptionStatus = "inactive"

  if (subscription.status === "active" || subscription.status === "trialing") {
    isPremium = true
    subscriptionStatus = "active"
  } else if (subscription.status === "past_due") {
    isPremium = false
    subscriptionStatus = "past_due"
  } else if (subscription.status === "canceled" || subscription.status === "unpaid" || subscription.status === "incomplete_expired") {
    isPremium = false
    subscriptionStatus = "canceled"
  }

  console.log("[v0] WEBHOOK: Updating subscription for user:", userId, "isPremium:", isPremium, "status:", subscriptionStatus)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscriptionStatus,
      subscription_tier: isPremium ? "premium" : "free",
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to update subscription:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription updated for user:", userId, "isPremium:", isPremium)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.deleted - subscription:", subscription.id)

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

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
      stripe_subscription_id: null,
      subscription_current_period_end: null,
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to downgrade subscription:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ User downgraded to free:", userId)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log("[v0] WEBHOOK: invoice.payment_succeeded - invoice:", invoice.id, "subscription:", invoice.subscription)

  if (!invoice.subscription) {
    console.log("[v0] WEBHOOK: Payment succeeded but no subscription attached, skipping")
    return
  }

  const customerId = invoice.customer as string

  // Find user by customer ID
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
  console.log("[v0] WEBHOOK: Payment succeeded for user:", userId, "keeping premium status")

  // Ensure user stays premium after payment
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_tier: "premium",
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to update after payment:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium status confirmed for user:", userId)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log("[v0] WEBHOOK: invoice.payment_failed - invoice:", invoice.id, "subscription:", invoice.subscription)

  if (!invoice.subscription) {
    console.log("[v0] WEBHOOK: Payment failed but no subscription attached, skipping")
    return
  }

  const customerId = invoice.customer as string

  // Find user by customer ID
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
  console.log("[v0] WEBHOOK: Payment failed for user:", userId, "setting past_due")

  // Mark as past due - Stripe will retry, subscription.updated will handle further status
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      subscription_tier: "free", // No premium access until payment succeeds
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to update after payment failure:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ User marked as past_due:", userId)
  }
}
