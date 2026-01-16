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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_tier, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error || !profile) {
      return NextResponse.json({
        isPremium: false,
        tier: "free",
        plan: "free",
        isActive: false,
        trialEndsAt: null,
        subscriptionId: null,
        customerId: null,
      })
    }

    const isActive = profile?.subscription_status === "premium" || profile?.subscription_status === "pro"

    const tier = profile?.subscription_tier || "free"
    const isPremium = isActive && tier !== "free"

    return NextResponse.json({
      isPremium,
      tier,
      plan: isPremium ? "premium" : "free",
      isActive,
      trialEndsAt: null,
      subscriptionId: null,
      customerId: profile?.stripe_customer_id,
      status: profile?.subscription_status,
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
