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

    console.log("[v0] POST - Completing daily task for", { userId, challengeId })

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
      console.log("[v0] POST - User already completed this challenge today")
      return NextResponse.json({ error: "Already completed today", alreadyCompleted: true }, { status: 400 })
    }

    // Record today's completion
    console.log("[v0] POST - Recording daily completion in user_badge_progress")
    const { error: insertError } = await supabaseAdmin
      .from("user_badge_progress")
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        date: today,
        completed: true,
      })

    if (insertError) {
      console.error("[v0] POST - Failed to record daily completion:", insertError)
      return NextResponse.json({ error: "Failed to record completion", details: insertError }, { status: 500 })
    }

    console.log("[v0] POST - Daily completion recorded successfully")

    // Count total completed days for this challenge
    const { data: completedDays, error: countError } = await supabaseAdmin
      .from("user_badge_progress")
      .select("date")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (countError) {
      console.error("[v0] POST - Error counting completed days:", countError)
    }

    const totalCompletedDays = completedDays?.length || 0
    console.log("[v0] POST - Total completed days for challenge:", totalCompletedDays)

    // Determine if challenge is completed (12 days for typical challenges)
    const isCompleted = totalCompletedDays >= 12

    // Get the challenge record to ensure it exists
    const { data: challengeData, error: getError } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()

    if (getError) {
      console.error("[v0] POST - Error getting challenge data:", getError)
    }

    // Update the challenge progress
    console.log("[v0] POST - Updating challenge progress:", { progress: totalCompletedDays, completed: isCompleted })
    const { error: updateError } = await supabaseAdmin
      .from("user_challenge_progress")
      .upsert(
        {
          user_id: userId,
          challenge_id: challengeId,
          progress: totalCompletedDays,
          completed: isCompleted,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,challenge_id",
        }
      )

    if (updateError) {
      console.error("[v0] POST - Failed to update challenge progress:", updateError)
      return NextResponse.json({ error: "Failed to update progress", details: updateError }, { status: 500 })
    }

    console.log("[v0] POST - Challenge progress updated successfully")

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

      console.log("[v0] POST - Challenge completed! Attempting to award", xpAwarded, "XP")

      // Get current XP
      const { data: xpData, error: xpGetError } = await supabaseAdmin
        .from("xp_progress")
        .select("current_xp")
        .eq("user_id", userId)
        .maybeSingle()

      if (xpGetError) {
        console.error("[v0] POST - Error getting current XP:", xpGetError)
      }

      const currentXp = xpData?.current_xp || 0
      const newXp = currentXp + xpAwarded

      console.log("[v0] POST - Updating XP from', currentXp, 'to', newXp)

      // Update user XP using upsert
      const { error: xpError } = await supabaseAdmin.from("xp_progress").upsert(
        {
          user_id: userId,
          current_xp: newXp,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

      if (xpError) {
        console.error("[v0] POST - Failed to update XP:", xpError)
      } else {
        console.log("[v0] POST - XP updated successfully: +', xpAwarded, 'XP (new total:', newXp, ')')
      }
    }

    return NextResponse.json({
      success: true,
      progress: totalCompletedDays,
      completed: isCompleted,
      xpAwarded,
    })
  } catch (error) {
    console.error("[v0] POST - Error in complete-daily:", error)
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
    console.error("[v0] GET - Error in complete-daily:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
