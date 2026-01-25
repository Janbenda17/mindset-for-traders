import Stripe from "stripe"
import { type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Disable body parsing - we need raw body for signature verification
export const preferredRegion = "auto"

export async function POST(req: NextRequest) {
  // CRITICAL: Read raw body FIRST before any other processing
  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")

  console.log("[WEBHOOK] ========== START ==========")
  console.log("[WEBHOOK] Received request - signature present:", !!signature)
  console.log("[WEBHOOK] Raw body length:", rawBody.length)

  if (!signature) {
    console.error("[WEBHOOK] ERROR: Missing stripe-signature header")
    return new Response("Missing stripe-signature", { status: 400 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  console.log("[WEBHOOK] ENV check - STRIPE_SECRET_KEY:", !!secretKey, "STRIPE_WEBHOOK_SECRET:", !!webhookSecret)

  if (!secretKey || !webhookSecret) {
    console.error("[WEBHOOK] ERROR: Missing Stripe environment variables")
    return new Response("Configuration error", { status: 500 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18" })

  let event: Stripe.Event
  try {
    // Verify webhook signature using RAW body
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    console.log("[WEBHOOK] Signature verified - event.type:", event.type, "event.id:", event.id)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[WEBHOOK] ERROR: Signature verification failed -", message)
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 })
  }

  // Create Supabase admin client (bypasses RLS)
  let supabase
  try {
    supabase = createAdminClient()
    console.log("[WEBHOOK] Supabase admin client created")
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
    if (error instanceof Error && error.stack) {
      console.error("[WEBHOOK] Stack:", error.stack)
    }
    // Return 200 to prevent Stripe from retrying (we logged the error)
    return new Response("OK", { status: 200 })
  }
}

/**
 * Handle checkout.session.completed - this is the FIRST event after payment
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>,
  stripe: Stripe
) {
  console.log("[WEBHOOK] >> handleCheckoutCompleted - session.id:", session.id)
  console.log("[WEBHOOK] session.customer:", session.customer)
  console.log("[WEBHOOK] session.metadata:", JSON.stringify(session.metadata))
  console.log("[WEBHOOK] session.client_reference_id:", session.client_reference_id)
  console.log("[WEBHOOK] session.mode:", session.mode)
  console.log("[WEBHOOK] session.subscription:", session.subscription)

  const customerId = session.customer as string
  // Get user_id from metadata OR client_reference_id
  const userId = session.metadata?.user_id || session.client_reference_id

  if (!userId) {
    console.error("[WEBHOOK] ERROR: No user_id found in session metadata or client_reference_id")
    // Try to find user by customer ID as fallback
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle()

    if (existingProfile) {
      console.log("[WEBHOOK] Found user by customer ID:", existingProfile.user_id)
      await updateProfilePremium(supabase, existingProfile.user_id, customerId, session.subscription as string | null)
    } else {
      console.error("[WEBHOOK] ERROR: Cannot find user for checkout session")
    }
    return
  }

  console.log("[WEBHOOK] User ID resolved:", userId)

  // First, ensure stripe_customer_id is saved (in case it wasn't saved during checkout creation)
  const { error: customerError } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("user_id", userId)

  if (customerError) {
    console.error("[WEBHOOK] ERROR saving customer_id:", customerError.message)
  } else {
    console.log("[WEBHOOK] Customer ID saved/updated for user:", userId)
  }

  // If this is a subscription checkout, get subscription details
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = session.subscription as string
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      console.log("[WEBHOOK] Retrieved subscription:", subscription.id, "status:", subscription.status)
      
      await updateProfileWithSubscription(supabase, userId, customerId, subscription)
    } catch (err) {
      console.error("[WEBHOOK] ERROR retrieving subscription:", err)
      // Fallback: just mark as premium based on checkout completion
      await updateProfilePremium(supabase, userId, customerId, subscriptionId)
    }
  } else {
    // Payment mode or no subscription - just mark as premium
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
  const priceId = subscription.items.data[0]?.price?.id || null

  console.log("[WEBHOOK] Updating profile with subscription - userId:", userId, "isPremium:", isPremium, "status:", subscription.status)

  const updateData = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    subscription_tier: isPremium ? "premium" : "free",
    is_premium: isPremium,
    subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    ...(priceId && { stripe_price_id: priceId }),
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("[WEBHOOK] ERROR updating profile:", error.message, "code:", error.code)
  } else {
    console.log("[WEBHOOK] Profile updated successfully:", JSON.stringify(data?.[0] || {}))
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
  console.log("[WEBHOOK] Activating premium for user:", userId)

  const updateData: Record<string, unknown> = {
    stripe_customer_id: customerId,
    subscription_status: "active",
    subscription_tier: "premium",
    is_premium: true,
  }

  if (subscriptionId) {
    updateData.stripe_subscription_id = subscriptionId
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("[WEBHOOK] ERROR activating premium:", error.message)
  } else {
    console.log("[WEBHOOK] Premium activated:", JSON.stringify(data?.[0] || {}))
  }
}

async function handleSubscription(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string
  
  console.log("[v0] WEBHOOK: >> handleSubscription START - id:", subscription.id, "status:", subscription.status, "customer:", customerId)

  const { data: profile, error: queryError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (queryError) {
    console.error("[v0] WEBHOOK ERROR - Query failed:", queryError.message)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: No profile found for customer:", customerId)
    return
  }

  const isPremium = subscription.status === "active" || subscription.status === "trialing"
  
  console.log("[v0] WEBHOOK: Updating user:", profile.user_id, "isPremium:", isPremium, "status:", subscription.status)

  const { data, error } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_tier: isPremium ? "premium" : "free",
      is_premium: isPremium,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("user_id", profile.user_id)
    .select()

  if (error) {
    console.error("[v0] WEBHOOK ERROR - Update failed:", error.message, "code:", error.code)
  } else {
    console.log("[v0] WEBHOOK: ✓ Subscription updated - is_premium:", data?.[0]?.is_premium, "subscription_tier:", data?.[0]?.subscription_tier)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string
  
  console.log("[v0] WEBHOOK: >> handleSubscriptionDeleted - id:", subscription.id)

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: No profile for customer:", customerId)
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", profile.user_id)

  if (error) {
    console.error("[v0] WEBHOOK ERROR:", error.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium removed for user:", profile.user_id)
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) {
    console.log("[v0] WEBHOOK: Invoice has no subscription - skipping")
    return
  }

  const customerId = invoice.customer as string
  
  console.log("[v0] WEBHOOK: >> handleInvoicePaid START - id:", invoice.id, "customer:", customerId)

  const { data: profile, error: queryError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (queryError) {
    console.error("[v0] WEBHOOK ERROR - Query failed:", queryError.message)
    return
  }

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: No profile for customer:", customerId)
    return
  }

  console.log("[v0] WEBHOOK: Activating premium for user:", profile.user_id)

  const { data, error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_tier: "premium",
      is_premium: true,
    })
    .eq("user_id", profile.user_id)
    .select()

  if (error) {
    console.error("[v0] WEBHOOK ERROR - Update failed:", error.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium activated - is_premium:", data?.[0]?.is_premium, "subscription_tier:", data?.[0]?.subscription_tier)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) return

  const customerId = invoice.customer as string

  console.log("[v0] WEBHOOK: >> handlePaymentFailed - id:", invoice.id, "customer:", customerId)

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (!profile) {
    console.error("[v0] WEBHOOK ERROR: No profile for customer:", customerId)
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", profile.user_id)

  if (error) {
    console.error("[v0] WEBHOOK ERROR:", error.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium revoked - user:", profile.user_id)
  }
}
