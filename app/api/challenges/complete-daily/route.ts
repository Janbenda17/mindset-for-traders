import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] POST /api/challenges/complete-daily: Completing daily task for", { userId, challengeId })

    // Check if already completed today
    const today = new Date().toISOString().split("T")[0]
    const { data: completedToday } = await supabaseAdmin
      .from("user_badge_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("date", today)
      .maybeSingle()

    if (completedToday) {
      console.log("[v0] User already completed this challenge today")
      return NextResponse.json({ error: "Already completed today", alreadyCompleted: true }, { status: 400 })
    }

    // Record today's completion
    const { error: insertError } = await supabaseAdmin
      .from("user_badge_progress")
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        date: today,
        completed: true,
      })

    if (insertError) {
      console.error("[v0] Failed to record daily completion:", insertError)
      return NextResponse.json({ error: "Failed to record completion" }, { status: 500 })
    }

    // Get the challenge to find the daily goal
    const { data: challengeData } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()

    if (!challengeData) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Count total completed days for this challenge
    const { data: completedDays } = await supabaseAdmin
      .from("user_badge_progress")
      .select("date")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    const totalCompletedDays = completedDays?.length || 0
    console.log("[v0] Total completed days:", totalCompletedDays)

    // Determine if challenge is completed (12 days for typical challenges)
    const isCompleted = totalCompletedDays >= 12

    // Update the challenge progress
    const { error: updateError } = await supabaseAdmin
      .from("user_challenge_progress")
      .update({
        progress: totalCompletedDays,
        completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (updateError) {
      console.error("[v0] Failed to update challenge progress:", updateError)
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    // If challenge is completed, award XP
    let xpAwarded = 0
    if (isCompleted) {
      // Get challenge reward from the mock data based on challenge ID
      const challengeRewards: { [key: string]: number } = {
        "challenge-1": 150,
        "challenge-2": 100,
        "challenge-3": 200,
        "challenge-4": 120,
      }
      xpAwarded = challengeRewards[challengeId] || 100

      // Update user XP
      const { data: xpData } = await supabaseAdmin
        .from("xp_progress")
        .select("current_xp")
        .eq("user_id", userId)
        .maybeSingle()

      const currentXp = xpData?.current_xp || 0
      const newXp = currentXp + xpAwarded

      await supabaseAdmin
        .from("xp_progress")
        .upsert({
          user_id: userId,
          current_xp: newXp,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      console.log("[v0] Challenge completed! Awarded", xpAwarded, "XP to user")
    }

    return NextResponse.json({
      success: true,
      progress: totalCompletedDays,
      completed: isCompleted,
      xpAwarded,
    })
  } catch (error) {
    console.error("[v0] Error in complete-daily:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    const challengeId = req.nextUrl.searchParams.get("challengeId")

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Check if user already completed today's task
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabaseAdmin
      .from("user_badge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("date", today)
      .maybeSingle()

    return NextResponse.json({
      completedToday: !!data,
    })
  } catch (error) {
    console.error("[v0] Error in GET complete-daily:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
