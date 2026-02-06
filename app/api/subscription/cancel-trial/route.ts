import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Update profile to cancel trial
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
        subscription_tier: "free",
        is_premium: false,
      })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("[CANCEL_TRIAL] Error updating profile:", updateError.message)
      return NextResponse.json({ error: "Failed to cancel trial" }, { status: 500 })
    }

    // Update trial_subscriptions record if exists
    await supabase
      .from("trial_subscriptions")
      .update({ status: "canceled" })
      .eq("user_id", user.id)
      .eq("status", "active")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CANCEL_TRIAL] Error:", error)
    return NextResponse.json({ error: "Failed to cancel trial" }, { status: 500 })
  }
}
