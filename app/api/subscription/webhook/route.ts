import Stripe from "stripe"
import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  // Get raw body and signature - DO NOT parse JSON before verification
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  console.log("[v0] WEBHOOK: Request received -", signature ? "has signature" : "NO SIGNATURE")

  if (!signature) {
    console.error("[v0] WEBHOOK ERROR: Missing stripe-signature header")
    return new Response("Missing stripe-signature", { status: 400 })
  }

  // Get environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log("[v0] WEBHOOK: Env vars check:")
  console.log("[v0]   STRIPE_SECRET_KEY:", secretKey ? "✓" : "✗")
  console.log("[v0]   STRIPE_WEBHOOK_SECRET:", webhookSecret ? "✓" : "✗")
  console.log("[v0]   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.log("[v0]   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✓" : "✗")

  if (!secretKey || !webhookSecret) {
    console.error("[v0] WEBHOOK ERROR: Stripe credentials not configured")
    return new Response("Stripe not configured", { status: 500 })
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] WEBHOOK ERROR: Supabase credentials not configured")
    return new Response("Supabase not configured", { status: 500 })
  }

  // Initialize Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: "2024-12-18",
  })

  // Verify webhook signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("[v0] WEBHOOK: ✓ Event verified -", event.type, "id:", event.id)
  } catch (err: any) {
    console.error("[v0] WEBHOOK ERROR: Signature verification failed -", err?.message)
    return new Response("Invalid signature", { status: 400 })
  }

  // Initialize Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseKey)

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

    console.log("[v0] WEBHOOK: ✓ Event processed successfully")
    // Always return 200 to acknowledge receipt
    return new Response("received", { status: 200 })
  } catch (error) {
    console.error("[v0] WEBHOOK ERROR: Processing failed -", error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error("[v0] WEBHOOK ERROR: Stack -", error.stack)
    }
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
  console.log("[v0] WEBHOOK: >> handleSubscriptionCreated START")
  console.log("[v0] WEBHOOK:   subscription.id:", subscription.id)
  console.log("[v0] WEBHOOK:   subscription.status:", subscription.status)
  console.log("[v0] WEBHOOK:   subscription.customer:", subscription.customer)

  const customerId = subscription.customer as string

  if (!customerId) {
    console.error("[v0] WEBHOOK ERROR: No customer ID in subscription")
    return
  }

  console.log("[v0] WEBHOOK:   Looking up profile with customer_id:", customerId)

  // Find user by stripe_customer_id
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  console.log("[v0] WEBHOOK:   Lookup result - profile:", profile ? "FOUND" : "NOT FOUND", "error:", lookupError ? "YES" : "NO")

  if (lookupError) {
    console.error("[v0] WEBHOOK ERROR: Supabase error looking up customer:", lookupError)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: No profile found for customer:", customerId)
    console.log("[v0] WEBHOOK: Customer probably just created - subscription event will be handled by invoice.paid")
    return
  }

  const userId = profile.user_id
  const isPremium = subscription.status === "active" || subscription.status === "trialing"

  console.log("[v0] WEBHOOK:   Found user_id:", userId)
  console.log("[v0] WEBHOOK:   isPremium:", isPremium, "subscription.status:", subscription.status)
  console.log("[v0] WEBHOOK:   Updating profile...")

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
    console.error("[v0] WEBHOOK ERROR: Failed to update subscription:")
    console.error("[v0]   Code:", updateError.code)
    console.error("[v0]   Message:", updateError.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription created!")
    console.log("[v0] WEBHOOK:   subscription_tier:", updateData?.[0]?.subscription_tier)
    console.log("[v0] WEBHOOK:   subscription_status:", updateData?.[0]?.subscription_status)
  }
}

  console.log("[v0] WEBHOOK:   Looking up profile with customer_id:", customerId)

  // Find user by stripe_customer_id
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  console.log("[v0] WEBHOOK:   Lookup result - profile:", profile ? "FOUND" : "NOT FOUND", "error:", lookupError ? "YES" : "NO")

  if (lookupError) {
    console.error("[v0] WEBHOOK ERROR: Supabase error looking up customer:")
    console.error("[v0]   Code:", lookupError.code)
    console.error("[v0]   Message:", lookupError.message)
    console.error("[v0]   Details:", lookupError.details)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: No profile found for customer:", customerId)
    console.log("[v0] WEBHOOK: This means customer_id was NOT stored before webhook fired!")
    console.log("[v0] WEBHOOK: Customer probably just got created in checkout, need to wait for subscription metadata")
    return
  }

  const userId = profile.user_id
  const isPremium = subscription.status === "active" || subscription.status === "trialing"

  console.log("[v0] WEBHOOK:   Found user_id:", userId)
  console.log("[v0] WEBHOOK:   isPremium:", isPremium)
  console.log("[v0] WEBHOOK:   Updating profile...")

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
    console.error("[v0] WEBHOOK ERROR: Failed to update subscription:")
    console.error("[v0]   Code:", updateError.code)
    console.error("[v0]   Message:", updateError.message)
    console.error("[v0]   Details:", updateError.details)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription updated!")
    console.log("[v0] WEBHOOK:   subscription_tier:", updateData?.[0]?.subscription_tier)
    console.log("[v0] WEBHOOK:   subscription_status:", updateData?.[0]?.subscription_status)
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
  console.log("[v0] WEBHOOK: >> handleInvoicePaid START")
  console.log("[v0] WEBHOOK:   invoice.id:", invoice.id)
  console.log("[v0] WEBHOOK:   invoice.subscription:", invoice.subscription)
  console.log("[v0] WEBHOOK:   invoice.customer:", invoice.customer)
  console.log("[v0] WEBHOOK:   invoice.status:", invoice.status)

  if (!invoice.subscription) {
    console.log("[v0] WEBHOOK: No subscription attached, skipping")
    return
  }

  const customerId = invoice.customer as string

  if (!customerId) {
    console.error("[v0] WEBHOOK ERROR: No customer ID in invoice")
    return
  }

  console.log("[v0] WEBHOOK:   Looking up profile with customer_id:", customerId)

  // Find user by customer ID
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("user_id, stripe_customer_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (lookupError) {
    console.error("[v0] WEBHOOK ERROR: Supabase error:", lookupError)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: Could not find profile for customer:", customerId)
    return
  }

  const userId = profile.user_id
  console.log("[v0] WEBHOOK:   Found user_id:", userId)
  console.log("[v0] WEBHOOK:   Setting subscription_status=active, subscription_tier=premium")

  // Activate premium on successful payment
  const { data: updateData, error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_tier: "premium",
    })
    .eq("user_id", userId)
    .select()

  if (updateError) {
    console.error("[v0] WEBHOOK ERROR: Failed to update after payment:")
    console.error("[v0]   Code:", updateError.code)
    console.error("[v0]   Message:", updateError.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium activated!")
    console.log("[v0] WEBHOOK:   subscription_tier:", updateData?.[0]?.subscription_tier)
    console.log("[v0] WEBHOOK:   subscription_status:", updateData?.[0]?.subscription_status)
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
