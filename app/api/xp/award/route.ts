import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, metadata } = await request.json()

    console.log("[v0] XP Award - action:", action, "user:", user.id)

    // Define XP rewards
    const XP_REWARDS: Record<string, number> = {
      morning_check: 10,
      daily_stage: 5,
      new_trade: 10,
      success_story: 50,
      loss_reset: 10,
    }

    const xpAmount = XP_REWARDS[action]
    if (!xpAmount) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Anti-abuse checks
    const today = new Date().toISOString().split("T")[0]

    // Check for success_story - only once per account
    if (action === "success_story") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("success_story_claimed")
        .eq("user_id", user.id)
        .single()

      if (profile?.success_story_claimed) {
        return NextResponse.json({ 
          error: "Success story XP already claimed",
          alreadyClaimed: true 
        }, { status: 400 })
      }
    }

    // Check for loss_reset - only once per day
    if (action === "loss_reset") {
      const { data: todayReset } = await supabase
        .from("xp_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("action", "loss_reset")
        .gte("awarded_at", `${today}T00:00:00`)
        .single()

      if (todayReset) {
        return NextResponse.json({ 
          error: "Loss reset XP already claimed today",
          alreadyClaimed: true 
        }, { status: 400 })
      }
    }

    // Check for morning_check - only once per day
    if (action === "morning_check") {
      const { data: todayCheck } = await supabase
        .from("xp_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("action", "morning_check")
        .gte("awarded_at", `${today}T00:00:00`)
        .single()

      if (todayCheck) {
        return NextResponse.json({ 
          error: "Morning check XP already claimed today",
          alreadyClaimed: true 
        }, { status: 400 })
      }
    }

    // Check for daily_stage - prevent duplicates
    if (action === "daily_stage" && metadata?.stage) {
      const { data: stageXP } = await supabase
        .from("xp_log")
        .select("id")
        .eq("user_id", user.id)
        .eq("action", "daily_stage")
        .eq("metadata->stage", metadata.stage)
        .gte("awarded_at", `${today}T00:00:00`)
        .single()

      if (stageXP) {
        return NextResponse.json({ 
          error: "Stage XP already claimed today",
          alreadyClaimed: true 
        }, { status: 400 })
      }
    }

    // Award XP
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    const currentXP = profile.xp || 0
    const newXP = currentXP + xpAmount
    const newLevel = Math.floor(newXP / 100) + 1 // 100 XP per level

    // Update profile
    const updateData: any = {
      xp: newXP,
      level: newLevel,
    }

    if (action === "success_story") {
      updateData.success_story_claimed = true
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("[v0] Error updating profile XP:", updateError)
      return NextResponse.json({ error: "Failed to update XP" }, { status: 500 })
    }

    // Log XP award
    const { error: logError } = await supabase.from("xp_log").insert({
      user_id: user.id,
      action,
      xp_amount: xpAmount,
      metadata: metadata || {},
    })

    if (logError) {
      console.error("[v0] Error logging XP:", logError)
    }

    console.log("[v0] XP Awarded:", { action, amount: xpAmount, newXP, newLevel })

    return NextResponse.json({
      success: true,
      xpAwarded: xpAmount,
      totalXP: newXP,
      level: newLevel,
      leveledUp: newLevel > profile.level,
    })
  } catch (error) {
    console.error("[v0] XP Award error:", error)
    return NextResponse.json(
      { error: "Failed to award XP", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
