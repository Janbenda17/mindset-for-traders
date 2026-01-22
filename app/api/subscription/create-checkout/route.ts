import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    if (plan !== "premium") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Get user info from headers or session
    const userEmail = request.headers.get("x-user-email")
    const userName = request.headers.get("x-user-name")
    const customerId = request.headers.get("x-customer-id")

    if (!userEmail || !customerId) {
      return NextResponse.json({ error: "User information required" }, { status: 400 })
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.vercel.app"
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`

    const priceId = "price_1S59GOL0tgTNaSwwEqyW1brC" // Your MindTrader Premium price
    
    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan: "premium",
          user_email: userEmail,
        },
      },
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/upgrade`,
      metadata: {
        plan: "premium",
        user_email: userEmail,
        product_id: "prod_T1Bd0pGy0wj1AU",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
