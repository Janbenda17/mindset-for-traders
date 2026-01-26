import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Verify Stripe checkout session and update Supabase profile.
 * This endpoint is called after successful payment redirect.
 * Format: POST /api/subscription/verify?session_id=cs_xxx
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    console.log("[VERIFY] ========== START ==========")
    console.log("[VERIFY] session_id:", sessionId)

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      console.error("[VERIFY] ERROR: STRIPE_SECRET_KEY not configured")
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18" })

    // Get authenticated user
    const supabaseAuth = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      console.log("[VERIFY] Not authenticated")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[VERIFY] Authenticated user:", user.id, user.email)

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })

    if (!session) {
      console.error("[VERIFY] ERROR: Session not found:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    console.log("[VERIFY] Session retrieved:")
    console.log("[VERIFY]   payment_status:", session.payment_status)
    console.log("[VERIFY]   customer:", session.customer)
    console.log("[VERIFY]   subscription:", session.subscription)
    console.log("[VERIFY]   customer_email:", session.customer_details?.email)

    const customerId = session.customer as string
    const customerEmail = session.customer_details?.email
    const isPaymentSuccessful = session.payment_status === "paid" || session.payment_status === "no_payment_required"

    // Use admin client to bypass RLS (same as webhook)
    const supabaseAdmin = createAdminClient()

    if (isPaymentSuccessful) {
      console.log("[VERIFY] Payment successful - updating profile")

      if (session.mode === "subscription" && session.subscription) {
        // Get full subscription details
        const subscription =
          typeof session.subscription === "string"
            ? await stripe.subscriptions.retrieve(session.subscription)
            : (session.subscription as Stripe.Subscription)

        console.log("[VERIFY] Subscription details:")
        console.log("[VERIFY]   id:", subscription.id)
        console.log("[VERIFY]   status:", subscription.status)
        console.log("[VERIFY]   current_period_end:", subscription.current_period_end)

        const isPremium = subscription.status === "active" || subscription.status === "trialing"

        const updateData = {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          subscription_tier: isPremium ? "premium" : "free",
          is_premium: isPremium,
          subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }

        console.log("[VERIFY] Updating profile with:", JSON.stringify(updateData))

        // Update by user_id (current user)
        const { data, error: updateError, count } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("user_id", user.id)
          .select()

        console.log("[VERIFY] Update response - affected rows:", count, "error:", updateError?.message || "null")

        if (updateError) {
          console.error("[VERIFY] ERROR updating profile:", updateError.message)
          console.error("[VERIFY] Full error:", JSON.stringify(updateError))
        } else if (data && data.length > 0) {
          console.log("[VERIFY] ✓ Profile updated successfully")
          console.log("[VERIFY]   user_id:", data[0].user_id)
          console.log("[VERIFY]   is_premium:", data[0].is_premium)
          console.log("[VERIFY]   subscription_tier:", data[0].subscription_tier)
        } else {
          console.error("[VERIFY] ERROR: No rows updated (user not found?)")
        }
      } else {
        // Non-subscription payment (shouldn't happen but handle anyway)
        const { data, error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            subscription_status: "active",
            subscription_tier: "premium",
            is_premium: true,
          })
          .eq("user_id", user.id)
          .select()

        if (updateError) {
          console.error("[VERIFY] ERROR updating profile:", updateError.message)
        } else {
          console.log("[VERIFY] ✓ Profile updated (non-subscription)")
        }
      }
    } else {
      console.log("[VERIFY] Payment not yet successful - status:", session.payment_status)
    }

    console.log("[VERIFY] ========== DONE ==========")

    return NextResponse.json({
      success: isPaymentSuccessful,
      message: isPaymentSuccessful ? "Předplatné aktivováno" : "Platba ještě není dokončena",
      session: {
        id: session.id,
        customer: session.customer,
        subscription: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
        payment_status: session.payment_status,
        customer_email: customerEmail,
      },
    })
  } catch (error) {
    console.error("[VERIFY] ERROR:", error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error("[VERIFY] Stack:", error.stack)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify session" },
      { status: 500 }
    )
  }
}
