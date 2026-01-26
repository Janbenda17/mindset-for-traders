import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Check subscription status by email
 * Used to load premium status when user has purchase on the same email
 * GET /api/subscription/check-by-email?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    console.log("[CHECK_EMAIL] Checking subscription for email:", email)

    const supabase = await createServerClient()

    // Find profile by email (not authenticated - email lookup is public info)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("user_id, subscription_status, subscription_tier, is_premium, stripe_customer_id, stripe_subscription_id")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("[CHECK_EMAIL] Error querying profile:", error.message)
      return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 })
    }

    if (!profile) {
      console.log("[CHECK_EMAIL] No profile found for email:", email)
      return NextResponse.json({
        isPremium: false,
        tier: "free",
        plan: "free",
        isActive: false,
        subscriptionStatus: null,
        customerId: null,
      })
    }

    const isActive = profile.subscription_status === "active" || profile.subscription_status === "trialing"
    const isPremium = profile.is_premium || isActive

    console.log("[CHECK_EMAIL] ✓ Found profile for email:", email, "isPremium:", isPremium)

    return NextResponse.json({
      isPremium,
      tier: profile.subscription_tier || "free",
      plan: isPremium ? "premium" : "free",
      isActive,
      subscriptionStatus: profile.subscription_status,
      customerId: profile.stripe_customer_id,
      subscriptionId: profile.stripe_subscription_id,
      userId: profile.user_id,
    })
  } catch (error: any) {
    console.error("[CHECK_EMAIL] ERROR:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
