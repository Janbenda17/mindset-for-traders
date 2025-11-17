import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader) {
      return NextResponse.json({
        plan: "free",
        isActive: false,
        trialEndsAt: null,
        subscriptionId: null,
        customerId: null,
      })
    }

    // Extract token and get user
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({
        plan: "free",
        isActive: false,
        trialEndsAt: null,
        subscriptionId: null,
        customerId: null,
      })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_status, stripe_customer_id, stripe_subscription_id, subscription_current_period_end, trial_ends_at")
      .eq("id", user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({
        plan: "free",
        isActive: false,
        trialEndsAt: null,
        subscriptionId: null,
        customerId: null,
      })
    }

    const periodEnd = profile.subscription_current_period_end ? new Date(profile.subscription_current_period_end) : null
    const isActive = (profile.subscription_status === "premium" || profile.subscription_status === "trial") && 
                    (!periodEnd || periodEnd > new Date())

    const plan = isActive ? "premium" : "free"

    return NextResponse.json({
      plan,
      isActive,
      trialEndsAt: profile.trial_ends_at,
      subscriptionId: profile.stripe_subscription_id,
      customerId: profile.stripe_customer_id,
      status: profile.subscription_status,
      cancelAtPeriodEnd: false,
    })
  } catch (error) {
    console.error("Error checking subscription status:", error)
    return NextResponse.json({
      plan: "free",
      isActive: false,
      trialEndsAt: null,
      subscriptionId: null,
      customerId: null,
    })
  }
}
