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
  let supabase: ReturnType<typeof createAdminClient>
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
 * Updates profile by EMAIL (most reliable method)
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createAdminClient>,
  stripe: Stripe
) {
  console.log("[WEBHOOK] >> handleCheckoutCompleted")
  console.log("[WEBHOOK]    session.id:", session.id)
  console.log("[WEBHOOK]    session.customer:", session.customer)
  console.log("[WEBHOOK]    session.mode:", session.mode)

  // Extract email - most reliable identifier
  const email = session.customer_details?.email || 
    (typeof session.customer_email === "string" ? session.customer_email : null)

  const customerId = typeof session.customer === "string" ? session.customer : null
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null

  console.log("[WEBHOOK]    email:", email)
  console.log("[WEBHOOK]    customerId:", customerId)
  console.log("[WEBHOOK]    subscriptionId:", subscriptionId)

  if (!email || !customerId) {
    console.error("[WEBHOOK]    ERROR: Missing email or customerId")
    return
  }

  // If subscription, get full details
  let isPremium = true
  let subscriptionStatus = "active"
  let periodEnd: string | null = null

  if (session.mode === "subscription" && subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      isPremium = subscription.status === "active" || subscription.status === "trialing"
      subscriptionStatus = subscription.status
      periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
      console.log("[WEBHOOK]    Retrieved subscription, status:", subscriptionStatus)
    } catch (err) {
      console.error("[WEBHOOK]    ERROR retrieving subscription:", err)
    }
  }

  // Update profile by EMAIL (bypasses user_id matching issues)
  const updateData: Record<string, unknown> = {
    stripe_customer_id: customerId,
    subscription_status: subscriptionStatus,
    subscription_tier: isPremium ? "premium" : "free",
    is_premium: isPremium,
  }

  if (subscriptionId) {
    updateData.stripe_subscription_id = subscriptionId
  }

  if (periodEnd) {
    updateData.subscription_current_period_end = periodEnd
  }

  // IMPORTANTE: When premium is active, switch to live mode automatically
  if (isPremium) {
    updateData.trading_mode = "live"
    console.log("[WEBHOOK]    🟢 Premium activated - switching trading_mode to LIVE")
  }

  console.log("[WEBHOOK]    Updating profile by email:", email)
  console.log("[WEBHOOK]    Update data:", JSON.stringify(updateData))

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("email", email)
    .select()

  if (error) {
    console.error("[WEBHOOK]    ERROR updating profile:", error.message)
    console.error("[WEBHOOK]    Full error:", JSON.stringify(error))
  } else if (data && data.length > 0) {
    console.log("[WEBHOOK]    ✓ Profile updated successfully")
    console.log("[WEBHOOK]    Updated profile user_id:", data[0].user_id, "is_premium:", data[0].is_premium, "trading_mode:", data[0].trading_mode)
  } else {
    console.error("[WEBHOOK]    ERROR: No profile found with email:", email)
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
    console.error("[WEBHOOK]    ERROR: Missing customerId")
    return
  }

  // Find user by stripe_customer_id
  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr || !profile) {
    console.error("[WEBHOOK]    ERROR: No profile found for customerId:", customerId)
    return
  }

  const isPremium = subscription.status === "active" || subscription.status === "trialing"
  const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()

  console.log("[WEBHOOK]    Updating user_id:", profile.user_id, "isPremium:", isPremium)

  const updateData: Record<string, unknown> = {
    subscription_status: subscription.status,
    subscription_tier: isPremium ? "premium" : "free",
    subscription_current_period_end: periodEnd,
    stripe_subscription_id: subscription.id,
    is_premium: isPremium,
  }

  // Switch to live mode when subscription is active
  if (isPremium) {
    updateData.trading_mode = "live"
    console.log("[WEBHOOK]    🟢 Subscription active - switching trading_mode to LIVE")
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", profile.user_id)
    .select()

  if (error) {
    console.error("[WEBHOOK]    ERROR:", error.message)
  } else if (data && data.length > 0) {
    console.log("[WEBHOOK]    ✓ Subscription updated, is_premium:", data[0].is_premium, "trading_mode:", data[0].trading_mode)
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log("[WEBHOOK] >> handleSubscriptionDeleted")

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

  if (findErr || !profile) {
    console.error("[WEBHOOK]    No profile found")
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
    console.error("[WEBHOOK]    ERROR:", error.message)
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
  console.log("[WEBHOOK] >> handleInvoicePaid")

  if (!invoice.subscription) return

  const customerId = typeof invoice.customer === "string" ? invoice.customer : null

  if (!customerId) return

  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr || !profile) return

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_tier: "premium",
      is_premium: true,
      trading_mode: "live",  // Switch to live when invoice is paid
    })
    .eq("user_id", profile.user_id)

  if (error) {
    console.error("[WEBHOOK]    ERROR:", error.message)
  } else {
    console.log("[WEBHOOK]    ✓ Premium confirmed, trading_mode set to LIVE")
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createAdminClient>
) {
  console.log("[WEBHOOK] >> handlePaymentFailed")

  if (!invoice.subscription) return

  const customerId = typeof invoice.customer === "string" ? invoice.customer : null

  if (!customerId) return

  const { data: profile, error: findErr } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (findErr || !profile) return

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", profile.user_id)

  if (error) {
    console.error("[WEBHOOK]    ERROR:", error.message)
  } else {
    console.log("[WEBHOOK]    ✓ Marked past_due")
  }
}
