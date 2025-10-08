import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

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
  console.log("Customer:", session.customer)
  console.log("Subscription:", session.subscription)
  console.log("Email:", session.customer_details?.email)

  // V reálné aplikaci byste zde aktualizovali databázi
  // Například: updateUserSubscription(session.customer, session.subscription)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("✅ Subscription created:", subscription.id)
  console.log("Customer:", subscription.customer)
  console.log("Status:", subscription.status)
  console.log("Trial end:", subscription.trial_end)

  // Aktualizovat databázi uživatele
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("🔄 Subscription updated:", subscription.id)
  console.log("New status:", subscription.status)
  console.log("Cancel at period end:", subscription.cancel_at_period_end)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("❌ Subscription deleted:", subscription.id)
  console.log("Customer downgraded to free:", subscription.customer)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("💰 Payment succeeded:", invoice.id)
  console.log("Amount:", invoice.amount_paid / 100, "EUR")
  console.log("Subscription:", invoice.subscription)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("❌ Payment failed:", invoice.id)
  console.log("Subscription:", invoice.subscription)

  // Zde byste mohli poslat email uživateli o neúspěšné platbě
}
