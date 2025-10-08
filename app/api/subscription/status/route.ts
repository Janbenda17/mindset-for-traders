import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: NextRequest) {
  try {
    const customerId = request.headers.get("x-customer-id")

    if (!customerId) {
      return NextResponse.json({
        plan: "free",
        isActive: false,
        trialEndsAt: null,
        subscriptionId: null,
        customerId: null,
      })
    }

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        plan: "free",
        isActive: false,
        trialEndsAt: null,
        subscriptionId: null,
        customerId,
      })
    }

    const subscription = subscriptions.data[0]
    const isActive = ["active", "trialing"].includes(subscription.status)
    const plan = isActive ? "premium" : "free"

    return NextResponse.json({
      plan,
      isActive,
      trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  } catch (error) {
    console.error("Error checking subscription status:", error)
    return NextResponse.json({
      plan: "free",
      isActive: false,
      trialEndsAt: null,
      subscriptionId: null,
      customerId: null,
    })
  }
}
