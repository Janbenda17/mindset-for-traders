import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Available challenges templates
const AVAILABLE_CHALLENGES = [
  {
    id: "challenge-1",
    title: "Zero Revenge Trading Week",
    description: "Complete a full week without any revenge trades",
    type: "daily",
    target: 7,
    difficulty: "hard",
    xpReward: 500,
    category: "discipline",
  },
  {
    id: "challenge-2",
    title: "Morning Check Consistency",
    description: "Complete morning check 7 days in a row",
    type: "streak",
    target: 7,
    difficulty: "medium",
    xpReward: 300,
    category: "consistency",
  },
  {
    id: "challenge-3",
    title: "Perfect Readiness Streak",
    description: "Maintain 75%+ readiness for 5 consecutive days",
    type: "daily",
    target: 5,
    difficulty: "hard",
    xpReward: 400,
    category: "performance",
  },
  {
    id: "challenge-4",
    title: "Journal Every Trade",
    description: "Document all trades with detailed journal entries",
    type: "count",
    target: 10,
    difficulty: "easy",
    xpReward: 250,
    category: "journaling",
  },
]

export async function GET(request: NextRequest) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's challenge progress
    const { data: progress, error: progressError } = await supabase
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", user.id)

    if (progressError) {
      console.error("[v0] Error loading challenge progress:", progressError)
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    console.log(`[v0] GET /api/challenges - Loaded ${progress?.length || 0} challenges for user ${user.id}`)

    // Categorize challenges
    const active = progress?.filter((c) => !c.completed) || []
    const completed = progress?.filter((c) => c.completed) || []
    const available = AVAILABLE_CHALLENGES.filter((t) => !progress?.some((c) => c.challenge_id === t.id))

    return NextResponse.json({
      active: active.map((c) => ({ ...AVAILABLE_CHALLENGES.find((t) => t.id === c.challenge_id), ...c })),
      available: available,
      completed: completed.map((c) => ({ ...AVAILABLE_CHALLENGES.find((t) => t.id === c.challenge_id), ...c })),
    })
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { challengeId, action, progress } = body

    if (!challengeId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const challenge = AVAILABLE_CHALLENGES.find((c) => c.id === challengeId)
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    if (action === "start") {
      // Check if challenge already started
      const { data: existing } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .single()

      if (existing) {
        return NextResponse.json({ error: "Challenge already started" }, { status: 400 })
      }

      // Start new challenge
      const { data, error } = await supabase
        .from("user_challenge_progress")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          completed: false,
          joined_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("[v0] Error starting challenge:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(`[v0] User ${user.id} started challenge ${challengeId}`)
      return NextResponse.json({ success: true, data: data[0] })
    } else if (action === "update") {
      // Update challenge progress
      if (progress === undefined) {
        return NextResponse.json({ error: "Progress value required" }, { status: 400 })
      }

      // Check if should be completed
      const shouldComplete = progress >= challenge.target

      const updateData: any = {
        progress: Math.min(progress, challenge.target),
        updated_at: new Date().toISOString(),
      }

      if (shouldComplete) {
        updateData.completed = true
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from("user_challenge_progress")
        .update(updateData)
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .select()

      if (error) {
        console.error("[v0] Error updating challenge:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // If completed, add XP
      if (shouldComplete) {
        await supabase
          .from("xp_log")
          .insert({
            user_id: user.id,
            amount: challenge.xpReward,
            source: "challenge",
            reason: `Completed challenge: ${challenge.title}`,
          })

        console.log(`[v0] User ${user.id} completed challenge ${challengeId} - awarded ${challenge.xpReward} XP`)
      } else {
        console.log(`[v0] User ${user.id} updated challenge ${challengeId} progress to ${progress}`)
      }

      return NextResponse.json({ success: true, data: data[0], completed: shouldComplete, xpAwarded: challenge.xpReward })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/challenges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
