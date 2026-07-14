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
      .select("subscription_status, subscription_tier, stripe_customer_id, stripe_subscription_id, is_premium, subscription_current_period_end, created_at")
      .eq("user_id", user.id)
      .maybeSingle()

    console.log("[v0] Subscription check for user:", user.id, "profile:", profile, "error:", error)

    if (error || !profile) {
      console.log("[v0] Profile not found - returning free tier")
      return NextResponse.json({
        isPremium: false,
        tier: "free",
        plan: "free",
        isActive: false,
        isTrialing: false,
        trialDaysLeft: 0,
        hasSubscribed: false,
        subscriptionId: null,
        customerId: null,
        status: "inactive",
      })
    }

    // The 14-day trial is a REAL Stripe subscription trial now (card
    // required up front - see /api/subscription/create-checkout), not a
    // freebie computed from created_at. The webhook
    // (/api/subscription/webhook) writes subscription_status="trialing"
    // and subscription_current_period_end (= trial end while trialing) the
    // moment Stripe confirms the trial started, so isTrialing/trialDaysLeft
    // just read that back.
    let isTrialing = false
    let trialDaysLeft = 0
    if (profile.subscription_status === "trialing" && profile.subscription_current_period_end) {
      const periodEnd = new Date(profile.subscription_current_period_end).getTime()
      const msLeft = periodEnd - Date.now()
      if (msLeft > 0) {
        isTrialing = true
        trialDaysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
      }
    }

    // is_premium is set by the webhook whenever the Stripe subscription
    // status is "active" or "trialing", so it already covers both a paying
    // customer and someone mid-trial - no need to OR it with isTrialing here.
    const isPremium = profile.is_premium === true
    const isActive = isPremium || profile.subscription_status === "active"
    const tier = isPremium ? "premium" : "free"

    // hasSubscribed = this user has gone through Stripe checkout at least
    // once before (trialing/active/canceled/past_due). Used by the UI to
    // tell "never started a trial" apart from "trial/subscription ended",
    // and by create-checkout to decide whether a new checkout still gets a
    // free trial or goes straight to a paid subscription.
    //
    // IMPORTANT: this must NOT be derived from subscription_status - that
    // column defaults to 'inactive' on profile creation (see
    // scripts/001_create_users_and_profiles.sql), so !!profile.subscription_status
    // was true for every single new signup, before they ever touched Stripe.
    // That made every brand-new user see "Your trial/subscription has
    // ended" instead of "Activate your 14-day trial" the moment they
    // finished signing up - confirmed live on 2026-07-13 with a fresh test
    // account.
    //
    // It also must NOT be derived from stripe_customer_id: that gets
    // written the moment a checkout session is CREATED (see
    // app/api/subscription/create-checkout), before the user ever finishes
    // entering card details. So a user who opens the Stripe checkout page
    // and abandons it (closes the tab, back button, etc.) already has
    // stripe_customer_id set despite never having had a trial or
    // subscription - confirmed live on 2026-07-13 with the same test
    // account right after an abandoned checkout attempt. Only a real
    // Stripe subscription status (written by the webhook once Stripe
    // actually creates/updates a subscription) means this user has ever
    // truly subscribed.
    const REAL_STRIPE_SUBSCRIPTION_STATUSES = [
      "trialing",
      "active",
      "past_due",
      "canceled",
      "unpaid",
      "incomplete",
      "incomplete_expired",
      "paused",
    ]
    const hasSubscribed = REAL_STRIPE_SUBSCRIPTION_STATUSES.includes(profile.subscription_status ?? "")

    console.log(
      "[v0] Subscription status:",
      {
        user_id: user.id,
        status: profile.subscription_status,
        tier: profile.subscription_tier,
        isTrialing,
        trialDaysLeft,
        isPremium,
        isActive,
        hasSubscribed,
      },
    )

    return NextResponse.json({
      isPremium,  // TRUE = user has premium (paid OR trialing)
      tier,       // "premium" or "free"
      plan: isPremium ? "premium" : "free",
      isActive,
      isTrialing,
      trialDaysLeft,
      hasSubscribed,
      subscriptionId: profile.stripe_subscription_id ?? null,
      customerId: profile.stripe_customer_id,
      status: profile.subscription_status,  // "trialing", "active", "canceled", etc.
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
