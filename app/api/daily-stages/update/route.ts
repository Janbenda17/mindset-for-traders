import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Stage update - User:", user.id)

    const body = await request.json()
    const { stageId, completed } = body

    console.log("[v0] Stage update - Completing stage:", stageId, "completed:", completed)

    // Initialize user badges if not exists
    const badgeTemplates = [
      { id: "morning-bird", title: "Ranní Pták", description: "Dokončit Readiness Check 7 dní po sobě", icon: "🌅", target: 7, xpReward: 100 },
      { id: "trader-ten", title: "Dekáda Obchodů", description: "Zadat 10 obchodů", icon: "📊", target: 10, xpReward: 150 },
      { id: "consistency-master", title: "Mistr Konzistence", description: "Dodržet 14denní streak", icon: "⚙️", target: 14, xpReward: 200 },
      { id: "perfect-readiness", title: "Mistr Připravenosti", description: "5 dní dokonalého Readiness skóre (+80%)", icon: "⭐", target: 5, xpReward: 150 },
      { id: "loss-reset-master", title: "Zvládnutí Ztrát", description: "7 resetů po ztrátě bez emocí", icon: "🔄", target: 7, xpReward: 175 },
      { id: "goals-planner", title: "Plánovač Cílů", description: "Zapsat 3 trading cíle", icon: "🎯", target: 3, xpReward: 120 },
      { id: "trader-identity", title: "Identita Traderu", description: "Dokončit profil identity traderu", icon: "🪪", target: 1, xpReward: 200 },
      { id: "error-logger", title: "Mistr Analýzy Chyb", description: "Záznam 5 chyb a lekcí", icon: "📚", target: 5, xpReward: 140 },
    ]

    // Check if user has any badge progress
    const { data: existingBadges } = await supabase
      .from("user_badge_progress")
      .select("badge_id")
      .eq("user_id", user.id)

    if (!existingBadges || existingBadges.length === 0) {
      console.log("[v0] Stage update - Initializing badges for user...")
      // Initialize all badges
      const badgesToInsert = badgeTemplates.map((badge) => ({
        user_id: user.id,
        badge_id: badge.id,
        current_progress: 0,
        awarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      await supabase.from("user_badge_progress").insert(badgesToInsert)
      console.log("[v0] Stage update - Badges initialized!")
    }

    const today = new Date().toISOString().split("T")[0]

    // Get or create today's stage record
    let { data: stageRecord, error: fetchError } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Stage update - Error fetching stage:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!stageRecord) {
      console.log("[v0] Stage update - Creating new stage record for today")
      const { data: newRecord, error: createError } = await supabase
        .from("daily_stages")
        .insert({
          user_id: user.id,
          date: today,
          morning_check_completed: false,
          daily_intention_completed: false,
          trading_plan_completed: false,
          record_trades_completed: false,
          daily_summary_completed: false,
          readiness_score: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Stage update - Error creating stage:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      stageRecord = newRecord
    }

    // Update the specific stage
    const updateData: any = {}
    let nextStage = null

    if (stageId === 1) {
      updateData.morning_check_completed = completed
      nextStage = 2
    } else if (stageId === 2) {
      updateData.daily_intention_completed = completed
      nextStage = 3
    } else if (stageId === 3) {
      updateData.trading_plan_completed = completed
      nextStage = 4
    } else if (stageId === 4) {
      updateData.record_trades_completed = completed
      nextStage = 5
    } else if (stageId === 5) {
      updateData.daily_summary_completed = completed
      nextStage = null
    }

    const { data: data, error: updateError } = await supabase
      .from("daily_stages")
      .update(updateData)
      .eq("user_id", user.id)
      .eq("date", today)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Stage update - Error updating stage:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log("[v0] Stage update - Stage", stageId, completed ? "completed" : "uncompleted", "- next stage:", nextStage)

    // Trigger badge tracking when any stage is completed
    if (completed) {
      console.log("[v0] Stage update - Triggering badge tracking...")
      try {
        // Call badge tracking endpoint
        await fetch(new URL("/api/badges/track", request.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } catch (error) {
        console.error("[v0] Stage update - Error triggering badge tracking:", error)
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Stage update - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
