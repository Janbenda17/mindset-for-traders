import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Subscription check - not authenticated")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_tier, stripe_customer_id, stripe_subscription_id, is_premium")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("[v0] Subscription check for user:", user.id, "profile:", profile)

    if (error || !profile) {
      console.log("[v0] Profile not found - returning free tier")
      return NextResponse.json({
        isPremium: false,
        tier: "free",
        plan: "free",
        isActive: false,
        subscriptionId: null,
        customerId: null,
        status: "inactive",
      })
    }

    // Check if subscription is ACTIVE
    // Zdroj pravdy je is_premium flag v databázi!
    const isActive = profile?.is_premium === true || profile?.subscription_status === "active"
    const isPremium = profile?.is_premium === true

    const tier = profile?.subscription_tier || "free"

    console.log(
      "[v0] Subscription status:",
      {
        user_id: user.id,
        status: profile?.subscription_status,
        tier: profile?.subscription_tier,
        isPremium,
        isActive,
      },
    )

    return NextResponse.json({
      isPremium,  // TRUE = user has premium
      tier,       // "premium" or "free"
      plan: isPremium ? "premium" : "free",
      isActive,
      subscriptionId: profile?.stripe_subscription_id,
      customerId: profile?.stripe_customer_id,
      status: profile?.subscription_status,  // "active", "canceled", etc.
      cancelAtPeriodEnd: false,
    })
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request aborted" }, { status: 499 })
    }
    console.error("[v0] Error checking subscription status:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
