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
      .select("subscription_status, subscription_tier, stripe_customer_id, stripe_subscription_id, is_premium, created_at")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("[v0] Subscription check for user:", user.id, "profile:", profile)

    // 14-day free trial: every new account gets full Premium access for 14
    // days from profile creation, no card required. This lets people
    // actually experience the AI coach / pattern insights before paying.
    const TRIAL_DAYS = 14
    let isTrialing = false
    let trialDaysLeft = 0
    if (profile?.created_at) {
      const createdAt = new Date(profile.created_at).getTime()
      const msElapsed = Date.now() - createdAt
      const daysElapsed = msElapsed / (1000 * 60 * 60 * 24)
      if (daysElapsed < TRIAL_DAYS) {
        isTrialing = true
        trialDaysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - daysElapsed))
      }
    }

    if (error || !profile) {
      console.log("[v0] Profile not found - returning free tier")
      return NextResponse.json({
        isPremium: false,
        tier: "free",
        plan: "free",
        isActive: false,
        isTrialing: false,
        trialDaysLeft: 0,
        subscriptionId: null,
        customerId: null,
        status: "inactive",
      })
    }

    // Check if subscription is ACTIVE
    // Zdroj pravdy je is_premium flag v databázi, NEBO aktivní trial.
    const isPaidPremium = profile?.is_premium === true
    const isActive = isPaidPremium || profile?.subscription_status === "active" || isTrialing
    const isPremium = isPaidPremium || isTrialing

    const tier = isPremium ? "premium" : "free"

    console.log(
      "[v0] Subscription status:",
      {
        user_id: user.id,
        status: profile?.subscription_status,
        tier: profile?.subscription_tier,
        isPaidPremium,
        isTrialing,
        trialDaysLeft,
        isPremium,
        isActive,
      },
    )

    return NextResponse.json({
      isPremium,  // TRUE = user has premium (paid OR trial)
      tier,       // "premium" or "free"
      plan: isPremium ? "premium" : "free",
      isActive,
      isTrialing,
      trialDaysLeft,
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
