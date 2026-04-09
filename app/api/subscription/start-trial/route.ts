import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    console.log("[v0] Starting trial for user:", userId)
    console.log("[v0] Trial ends at:", trialEndsAt.toISOString())

    // Update profile with trial information
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "trial",
        subscription_tier: "free",  // User is on FREE tier with trial access
        trial_ends_at: trialEndsAt.toISOString(),
        is_premium: false,  // NOT premium until they pay!
      })
      .eq("user_id", userId)

    if (updateError) {
      console.error("[v0] Error updating profile:", updateError)
      return NextResponse.json({ error: "Failed to start trial" }, { status: 500 })
    }

    // Create trial subscription record for tracking
    const { error: insertError } = await supabase
      .from("trial_subscriptions")
      .insert({
        user_id: userId,
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        status: "active",
      })

    if (insertError) {
      console.error("[v0] Error creating trial record:", insertError)
      // Don't fail - profile is already updated
    }

    console.log("[v0] ✅ Trial started successfully")

    return NextResponse.json({
      success: true,
      trialEndsAt: trialEndsAt.toISOString(),
      message: "14-day trial started successfully",
    })
  } catch (error) {
    console.error("[v0] Error starting trial:", error)
    return NextResponse.json({ error: "Failed to start trial" }, { status: 500 })
  }
}
