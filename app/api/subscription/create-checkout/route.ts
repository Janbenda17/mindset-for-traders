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

    // Create checkout session with 7-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Trader Mindset Premium",
              description: "Pokročilé funkce pro profesionální trading",
            },
            unit_amount: 5900, // €59.00
            recurring: {
              interval: "month",
            },
          },
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade`,
      metadata: {
        plan: "premium",
        user_email: userEmail,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
