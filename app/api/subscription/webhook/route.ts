import Stripe from "stripe"
import { type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  // CRITICAL: Read raw body FIRST before any other processing
  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")

  console.log("[WEBHOOK] ========== START ==========")

  if (!signature) {
    console.error("[WEBHOOK] ERROR: Missing stripe-signature header")
    return new Response("Missing stripe-signature", { status: 400 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    console.error("[WEBHOOK] ERROR: Missing Stripe environment variables")
    return new Response("Configuration error", { status: 500 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18" })

  let event: Stripe.Event
  try {
    // Verify webhook signature using RAW body
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    console.log("[WEBHOOK] ✓ Signature verified - event.type:", event.type)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[WEBHOOK] ERROR: Signature verification failed -", message)
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 })
  }

  // Create Supabase admin client (bypasses RLS)
  let supabase
  try {
    supabase = createAdminClient()
    console.log("[WEBHOOK] ✓ Supabase admin client created")
  } catch (err) {
    console.error("[WEBHOOK] ERROR: Failed to create Supabase client -", err)
    return new Response("Database configuration error", { status: 500 })
  }

  try {
    console.log("[WEBHOOK] Processing event:", event.type)

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase, stripe)
        break
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscription(event.data.object as Stripe.Subscription, supabase)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, supabase)
        break
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break
      default:
        console.log("[WEBHOOK] Unhandled event type:", event.type)
    }

    console.log("[WEBHOOK] ========== SUCCESS ==========")
    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("[WEBHOOK] ERROR processing event:", error instanceof Error ? error.message : String(error))
    // Return 200 to prevent Stripe from retrying (we logged the error)
    return new Response("OK", { status: 200 })
  }
}

/**
 * Handle checkout.session.completed - after payment succeeds
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>,
  stripe: Stripe
) {
  console.log("[WEBHOOK] >> handleCheckoutCompleted")

  const customerId = session.customer as string
  const userId = session.metadata?.user_id || session.client_reference_id

  if (!userId) {
    console.error("[WEBHOOK]    ERROR: No user_id in metadata or client_reference_id")
    return
  }

  console.log("[WEBHOOK]    userId:", userId, "customerId:", customerId)

  // Save customer ID to profile
  const { error: customerError } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId)

  if (customerError) {
    console.error("[WEBHOOK]    ERROR saving customer_id:", customerError.message)
  }

  // If subscription, retrieve full details
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = session.subscription as string
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      console.log("[WEBHOOK]    Retrieved subscription, status:", subscription.status)
      await updateProfileWithSubscription(supabase, userId, customerId, subscription)
    } catch (err) {
      console.error("[WEBHOOK]    ERROR retrieving subscription:", err)
      // Fallback
      await updateProfilePremium(supabase, userId, customerId, subscriptionId)
    }
  } else {
    // One-time payment
    await updateProfilePremium(supabase, userId, customerId, null)
  }
}

/**
 * Update profile with full subscription details
 */
async function updateProfileWithSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const isPremium = subscription.status === "active" || subscription.status === "trialing"
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()

  console.log("[WEBHOOK]    >> updateProfileWithSubscription: status:", subscription.status, "isPremium:", isPremium)

  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_tier: isPremium ? "premium" : "free",
      subscription_current_period_end: periodEnd,
      is_premium: isPremium,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[WEBHOOK]       ERROR:", error.message)
  } else {
    console.log("[WEBHOOK]       ✓ Profile updated")
  }
}

/**
 * Simple premium activation (fallback)
 */
async function updateProfilePremium(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  customerId: string,
  subscriptionId: string | null
) {
  console.log("[WEBHOOK]    >> updateProfilePremium")

  const updateData: Record<string, unknown> = {
    stripe_customer_id: customerId,
    subscription_status: "premium",
    subscription_tier: "premium",
    is_premium: true,
  }

  if (subscriptionId) {
    updateData.stripe_subscription_id = subscriptionId
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", userId)

  if (error) {
    console.error("[WEBHOOK]       ERROR:", error.message)
  } else {
    console.log("[WEBHOOK]       ✓ Premium activated")
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscription(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log("[WEBHOOK] >> handleSubscription: id:", subscription.id, "status:", subscription.status)

  const customerId = typeof subscription.customer === "string" ? subscription.customer : null

  if (!customerId) {
    console.error("[WEBHOOK]    ERROR: Missing customerId in subscription")
    return
  }

  // Find user by stripe_customer_id
  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr) {
    console.error("[WEBHOOK]    ERROR finding profile:", findErr.message)
    return
  }

  if (!profile) {
    console.error("[WEBHOOK]    ERROR: No profile found for customerId:", customerId)
    return
  }

  const userId = profile.user_id
  const isPremium = subscription.status === "active" || subscription.status === "trialing"
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()

  console.log("[WEBHOOK]    userId:", userId, "isPremium:", isPremium)

  const { error: updErr } = await supabase
    .from("profiles")
    .update({
      subscription_status: subscription.status,
      subscription_tier: isPremium ? "premium" : "free",
      subscription_current_period_end: periodEnd,
      stripe_subscription_id: subscription.id,
      is_premium: isPremium,
    })
    .eq("user_id", userId)

  if (updErr) {
    console.error("[WEBHOOK]    ERROR:", updErr.message)
  } else {
    console.log("[WEBHOOK]    ✓ Subscription updated")
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log("[WEBHOOK] >> handleSubscriptionDeleted: id:", subscription.id)

  const customerId = typeof subscription.customer === "string" ? subscription.customer : null

  if (!customerId) {
    console.error("[WEBHOOK]    ERROR: Missing customerId")
    return
  }

  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr) {
    console.error("[WEBHOOK]    ERROR finding profile:", findErr.message)
    return
  }

  if (!profile) {
    console.log("[WEBHOOK]    No profile found for customerId")
    return
  }

  const userId = profile.user_id
  console.log("[WEBHOOK]    userId:", userId)

  const { error: updErr } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", userId)

  if (updErr) {
    console.error("[WEBHOOK]    ERROR:", updErr.message)
  } else {
    console.log("[WEBHOOK]    ✓ Subscription canceled")
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log("[WEBHOOK] >> handleInvoicePaid: id:", invoice.id)

  if (!invoice.subscription) {
    console.log("[WEBHOOK]    Skipping: no subscription")
    return
  }

  const customerId = typeof invoice.customer === "string" ? invoice.customer : null

  if (!customerId) {
    console.log("[WEBHOOK]    Skipping: no customerId")
    return
  }

  // Already handled by subscription events, but ensure premium is active
  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr || !profile) {
    console.log("[WEBHOOK]    No profile found")
    return
  }

  const userId = profile.user_id
  console.log("[WEBHOOK]    userId:", userId)

  const { error: updErr } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_tier: "premium",
      is_premium: true,
    })
    .eq("user_id", userId)

  if (updErr) {
    console.error("[WEBHOOK]    ERROR:", updErr.message)
  } else {
    console.log("[WEBHOOK]    ✓ Premium confirmed")
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log("[WEBHOOK] >> handlePaymentFailed: id:", invoice.id)

  if (!invoice.subscription) {
    console.log("[WEBHOOK]    Skipping: no subscription")
    return
  }

  const customerId = typeof invoice.customer === "string" ? invoice.customer : null

  if (!customerId) {
    console.log("[WEBHOOK]    Skipping: no customerId")
    return
  }

  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr || !profile) {
    console.log("[WEBHOOK]    No profile found")
    return
  }

  const userId = profile.user_id
  console.log("[WEBHOOK]    userId:", userId)

  const { error: updErr } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", userId)

  if (updErr) {
    console.error("[WEBHOOK]    ERROR:", updErr.message)
  } else {
    console.log("[WEBHOOK]    ✓ Marked past_due")
  }
}
