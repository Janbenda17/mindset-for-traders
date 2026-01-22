import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Get authenticated user from Supabase
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // If payment was successful, update user subscription in database
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      // Update profile with premium status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "premium",
          subscription_tier: "premium",
          stripe_customer_id: session.customer as string,
        })
        .eq("user_id", user.id)

      if (updateError) {
        console.error("[v0] Error updating subscription status:", updateError)
      } else {
        console.log("[v0] Updated subscription status for user:", user.id)
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
    console.error("Error verifying session:", error)
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 })
  }
}
