import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY || ""
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: "2024-06-20",
}) : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 })
    }

    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: "trader-mindset-app",
      },
    })

    return NextResponse.json({
      customerId: customer.id,
      email: customer.email,
      name: customer.name,
    })
  } catch (error) {
    console.error("Error creating Stripe customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
