import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Get environment variables - must use process.env directly
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    console.log("[v0] STRIPE_SECRET_KEY available:", !!secretKey)
    if (secretKey) {
      console.log("[v0] STRIPE_SECRET_KEY starts with:", secretKey.substring(0, 10))
      console.log("[v0] STRIPE_SECRET_KEY is live key:", secretKey.startsWith("sk_live_"))
    }

    if (!secretKey) {
      console.error("[v0] STRIPE_SECRET_KEY not configured in environment")
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    if (!secretKey.startsWith("sk_live_") && !secretKey.startsWith("sk_test_")) {
      console.error("[v0] STRIPE_SECRET_KEY format invalid")
      return NextResponse.json({ error: "Invalid Stripe key" }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })

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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

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

      // Store customer ID in profile IMMEDIATELY so webhook can find it
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] Error storing customer ID:", updateError)
        return NextResponse.json({ error: "Failed to store customer" }, { status: 500 })
      }
      console.log("[v0] ✓ Customer ID stored in profile")
    }

    const origin = request.headers.get("origin")
    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || "https://mindtrader.vercel.app"

    console.log("[v0] Request origin:", origin)
    console.log("[v0] NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL)
    console.log("[v0] Final base URL:", baseUrl)

    // IMPORTANT: Find correct price ID from YOUR account
    // You can find this by running: stripe prices list --product prod_***
    const priceId = process.env.STRIPE_PRICE_ID || "price_1S59GOL0tgTNaSwwEqyW1brC"
    console.log("[v0] Using price ID:", priceId)

    // Create checkout session with discount codes enabled
    // IMPORTANT: Include user_id in metadata AND client_reference_id for webhook to identify user
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id, // CRITICAL: This allows webhook to identify user
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          plan: "premium",
          user_id: user.id,
          user_email: user.email || "",
        },
      },
      success_url: `${baseUrl}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        plan: "premium",
        user_id: user.id,
        user_email: user.email || "",
      },
      // Enable discount codes in checkout
      allow_promotion_codes: true,
    })

    console.log("[v0] Checkout session created:", session.id)
    console.log("[v0] Checkout URL:", session.url)

    if (!session.url) {
      console.error("[v0] ERROR: No checkout URL returned from Stripe")
      return NextResponse.json({ error: "Failed to create checkout session - no URL" }, { status: 500 })
    }

    // Return Stripe URL directly - client will redirect to it
    return NextResponse.json({ 
      url: session.url
    })
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
