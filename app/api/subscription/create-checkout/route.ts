import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (plan !== "premium") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    console.log("[v0] Creating checkout for user:", user.id, user.email)

    // Get or create Stripe customer for this user
    let customerId = null
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
      console.log("[v0] Using existing customer:", customerId)
    } else {
      // Create new Stripe customer
      console.log("[v0] Creating new Stripe customer for:", user.email)
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          app: "mindtrader",
        },
      })
      customerId = customer.id
      console.log("[v0] New customer created:", customerId)

      // Store customer ID in profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)
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
          user_id: user.id,
          user_email: user.email,
        },
      },
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/upgrade`,
      metadata: {
        plan: "premium",
        user_id: user.id,
        user_email: user.email,
        product_id: "prod_T1Bd0pGy0wj1AU",
      },
    })

    console.log("[v0] Checkout session created:", session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
