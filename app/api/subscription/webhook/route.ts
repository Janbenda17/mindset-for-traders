import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case "customer.subscription.created":
        const createdSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(createdSubscription)
        break

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("✅ Checkout completed:", session.id)
  
  const customerEmail = session.customer_details?.email
  if (!customerEmail) return

  // Find user by email and update subscription info
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", customerEmail)
    .single()

  if (error || !profile) {
    console.error("Profile not found for email:", customerEmail)
    return
  }

  // Update profile with Stripe customer ID
  await supabase
    .from("profiles")
    .update({
      stripe_customer_id: session.customer as string,
      subscription_status: session.subscription ? "premium" : "free",
    })
    .eq("id", profile.id)

  console.log("Updated profile with Stripe customer ID for:", customerEmail)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("✅ Subscription created:", subscription.id)
  
  const customerId = subscription.customer as string
  const status = subscription.status === "trialing" ? "trial" : "premium"
  
  // Update user subscription in database
  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("Error updating subscription:", error)
  } else {
    console.log("Subscription activated for customer:", customerId)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("🔄 Subscription updated:", subscription.id)
  
  const customerId = subscription.customer as string
  let status = "premium"
  
  // Map Stripe status to our status
  if (subscription.status === "trialing") status = "trial"
  else if (subscription.status === "canceled" || subscription.cancel_at_period_end) status = "canceled"
  else if (subscription.status === "active") status = "premium"
  
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("Error updating subscription:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("❌ Subscription deleted:", subscription.id)
  
  const customerId = subscription.customer as string
  
  // Downgrade user to free
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_status: "free",
      stripe_subscription_id: null,
      subscription_current_period_end: null,
    })
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("Error downgrading to free:", error)
  } else {
    console.log("User downgraded to free:", customerId)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("💰 Payment succeeded:", invoice.id)
  
  // Ensure subscription is active
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionUpdated(subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("❌ Payment failed:", invoice.id)
  
  const customerId = invoice.customer as string
  
  // Mark subscription as having payment issues
  // Don't immediately downgrade - Stripe will retry
  console.warn("Payment failed for customer:", customerId)
}
