import Stripe from "stripe"
import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  // Get raw body and signature - DO NOT parse JSON before verification
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    console.error("[v0] WEBHOOK ERROR: Missing stripe-signature header")
    return new Response("Missing stripe-signature", { status: 400 })
  }

  // Get environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    console.error("[v0] WEBHOOK ERROR: Stripe credentials not configured")
    return new Response("Stripe not configured", { status: 500 })
  }

  // Initialize Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-12-18",
  })

  // Verify webhook signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("[v0] WEBHOOK: Event verified -", event.type, "id:", event.id)
  } catch (err: any) {
    console.error("[v0] WEBHOOK ERROR: Signature verification failed -", err?.message)
    return new Response("Invalid signature", { status: 400 })
  }

  // Initialize Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Process the event
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

      case "invoice.paid":
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice, supabase)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(failedInvoice, supabase)
        break

      default:
        console.log("[v0] WEBHOOK: Unhandled event type -", event.type)
    }

    // Always return 200 to acknowledge receipt
    return new Response("received", { status: 200 })
  } catch (error) {
    console.error("[v0] WEBHOOK ERROR: Processing failed -", error instanceof Error ? error.message : String(error))
    // Still return 200 to prevent Stripe from retrying
    return new Response("received", { status: 200 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log("[v0] WEBHOOK: checkout.session.completed - session:", session.id, "customer:", session.customer)
  console.log("[v0] WEBHOOK: session.metadata:", session.metadata)
  console.log("[v0] WEBHOOK: session.subscription:", session.subscription)

  // Try to get user_id from metadata - it can be in session.metadata or we need to look it up by customer
  let userId = session.metadata?.user_id
  const customerId = session.customer as string

  if (!userId && customerId) {
    // If no user_id in metadata, we'll let subscription event handle it
    console.log("[v0] WEBHOOK: No user_id in checkout metadata - will be handled by subscription event")
    return
  }

  if (!userId || !customerId) {
    console.error("[v0] WEBHOOK ERROR: Missing user_id or customer in checkout session")
    return
  }

  // Store customer ID
  const { error: customerError } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId)

  if (customerError) {
    console.error("[v0] WEBHOOK ERROR: Failed to store customer ID:", customerError)
  } else {
    console.log("[v0] WEBHOOK: Stored customer_id for user:", userId)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.created - subscription:", subscription.id, "status:", subscription.status)
  console.log("[v0] WEBHOOK: subscription.customer:", subscription.customer)
  console.log("[v0] WEBHOOK: subscription.metadata:", subscription.metadata)

  const customerId = subscription.customer as string

  if (!customerId) {
    console.error("[v0] WEBHOOK ERROR: No customer ID in subscription")
    return
  }

  // Find user by stripe_customer_id
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (lookupError) {
    console.error("[v0] WEBHOOK ERROR: Supabase error looking up customer:", lookupError)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: Could not find profile for customer:", customerId, "- checking if customer exists in stripe...")
    return
  }

  const userId = profile.user_id

  // Activate premium if subscription is active or trialing
  const isPremium = subscription.status === "active" || subscription.status === "trialing"

  console.log("[v0] WEBHOOK: Creating subscription for user:", userId, "premium:", isPremium, "subscription_status:", subscription.status)

  const { data: updateData, error: updateError } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_tier: isPremium ? "premium" : "free",
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("user_id", userId)
    .select()

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to create subscription:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription created for user:", userId, "premium:", isPremium, "updated data:", updateData)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log("[v0] WEBHOOK: customer.subscription.updated - subscription:", subscription.id, "status:", subscription.status)
  console.log("[v0] WEBHOOK: subscription.customer:", subscription.customer)
  console.log("[v0] WEBHOOK: subscription.metadata:", subscription.metadata)

  const customerId = subscription.customer as string

  if (!customerId) {
    console.error("[v0] WEBHOOK ERROR: No customer ID in subscription")
    return
  }

  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (lookupError) {
    console.error("[v0] WEBHOOK ERROR: Supabase error looking up customer:", lookupError)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: Could not find profile for customer:", customerId)
    return
  }

  const userId = profile.user_id

  // Set premium status based on subscription status
  const isPremium = subscription.status === "active" || subscription.status === "trialing"

  console.log("[v0] WEBHOOK: Updating subscription for user:", userId, "premium:", isPremium, "status:", subscription.status)

  const { data: updateData, error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.status,
      subscription_tier: isPremium ? "premium" : "free",
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("user_id", userId)
    .select()

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to update subscription:", updateError)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription updated for user:", userId, "premium:", isPremium, "updated data:", updateData)
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
  console.log("[v0] WEBHOOK: Removing premium access for user:", userId)

  // Set premium to false, but DO NOT delete user data
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to remove premium:", updateError)
  } else {
    console.log("[v0] WEBHOOK: Premium access removed for user:", userId)
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  console.log("[v0] WEBHOOK: invoice.paid - invoice:", invoice.id, "subscription:", invoice.subscription)

  if (!invoice.subscription) {
    console.log("[v0] WEBHOOK: No subscription attached, skipping")
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
  console.log("[v0] WEBHOOK: Payment received for user:", userId)

  // Activate premium on successful payment
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
    console.log("[v0] WEBHOOK: Premium activated for user:", userId)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log("[v0] WEBHOOK: invoice.payment_failed - invoice:", invoice.id, "subscription:", invoice.subscription)

  if (!invoice.subscription) {
    console.log("[v0] WEBHOOK: No subscription attached, skipping")
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
  console.log("[v0] WEBHOOK: Payment failed for user:", userId)

  // Remove premium access on payment failure - DO NOT delete user data
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      subscription_tier: "free",
    })
    .eq("user_id", userId)

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to update after payment failure:", updateError)
  } else {
    console.log("[v0] WEBHOOK: Premium access revoked for user:", userId)
  }
}
