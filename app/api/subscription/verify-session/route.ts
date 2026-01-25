import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    console.log("[v0] verify-session: sessionId:", sessionId)

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Get environment variables for Stripe
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      console.error("[v0] verify-session: STRIPE_SECRET_KEY not configured")
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })

    // Get authenticated user from Supabase
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] verify-session: Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] verify-session: user_id:", user.id)

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      console.error("[v0] verify-session: Session not found:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    console.log("[v0] verify-session: payment_status:", session.payment_status, "customer:", session.customer)

    // If payment was successful, update user subscription in database
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      console.log("[v0] verify-session: Payment successful, updating profile")
      
      // Store customer ID so webhook can find the user later
      const customerId = session.customer as string
      
      // Update profile with Stripe customer ID
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
        })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] verify-session: Error storing customer_id:", updateError)
      } else {
        console.log("[v0] verify-session: ✓ Stored customer_id:", customerId)
        console.log("[v0] verify-session: Now webhook can match this customer to user")
      }
    }

    return NextResponse.json({
      success: session.payment_status === 'paid' || session.payment_status === 'no_payment_required',
      session: {
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
      },
    })
  } catch (error) {
    console.error("[v0] verify-session error:", error)
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 })
  }
}
