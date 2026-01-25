import Stripe from "stripe"
import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    console.error("[v0] WEBHOOK ERROR: Missing stripe-signature header")
    return new Response("Missing stripe-signature", { status: 400 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!secretKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
    console.error("[v0] WEBHOOK ERROR: Missing environment variables")
    return new Response("Configuration error", { status: 500 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18" })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log("[v0] WEBHOOK: Event verified -", event.type)
  } catch (err: any) {
    console.error("[v0] WEBHOOK ERROR: Signature failed -", err?.message)
    return new Response("Invalid signature", { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    switch (event.type) {
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
        console.log("[v0] WEBHOOK: Unhandled event -", event.type)
    }

    return new Response("received", { status: 200 })
  } catch (error) {
    console.error("[v0] WEBHOOK ERROR:", error instanceof Error ? error.message : String(error))
    return new Response("received", { status: 200 })
  }
}

async function handleSubscription(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string
  
  console.log("[v0] WEBHOOK: Subscription event -", subscription.id, "status:", subscription.status, "customer:", customerId)

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (!profile) {
    console.error("[v0] WEBHOOK: No profile found for customer:", customerId)
    return
  }

  const isPremium = subscription.status === "active" || subscription.status === "trialing"
  
  console.log("[v0] WEBHOOK: Updating user:", profile.user_id, "isPremium:", isPremium)

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
    console.error("[v0] WEBHOOK ERROR:", error.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Updated - is_premium:", data?.[0]?.is_premium)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const customerId = subscription.customer as string
  
  console.log("[v0] WEBHOOK: Subscription deleted -", subscription.id)

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (!profile) return

  await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", profile.user_id)

  console.log("[v0] WEBHOOK: ✓ Premium removed for user:", profile.user_id)
}

async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) return

  const customerId = invoice.customer as string
  
  console.log("[v0] WEBHOOK: Invoice paid -", invoice.id, "customer:", customerId)

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (!profile) {
    console.error("[v0] WEBHOOK: No profile for customer:", customerId)
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
    console.error("[v0] WEBHOOK ERROR:", error.message)
  } else {
    console.log("[v0] WEBHOOK: ✓ Premium activated - is_premium:", data?.[0]?.is_premium)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  if (!invoice.subscription) return

  const customerId = invoice.customer as string

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (!profile) return

  await supabase
    .from("profiles")
    .update({
      subscription_status: "past_due",
      subscription_tier: "free",
      is_premium: false,
    })
    .eq("user_id", profile.user_id)

  console.log("[v0] WEBHOOK: Payment failed - premium revoked for user:", profile.user_id)
}
