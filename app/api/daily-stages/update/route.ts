import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { stageId, completed } = body

    const today = new Date().toISOString().split("T")[0]
    const completedAt = completed ? new Date().toISOString() : null

    const stageColumns: { [key: number]: { completed: string; completedAt: string } } = {
      1: { completed: "morning_check_completed", completedAt: "morning_check_completed_at" },
      2: { completed: "daily_intention_completed", completedAt: "daily_intention_completed_at" },
      3: { completed: "trading_plan_completed", completedAt: "trading_plan_completed_at" },
      4: { completed: "record_trades_completed", completedAt: "record_trades_completed_at" },
      5: { completed: "daily_summary_completed", completedAt: "daily_summary_completed_at" },
    }

    const stageColumn = stageColumns[stageId]
    if (!stageColumn) {
      return NextResponse.json({ error: "Invalid stage ID" }, { status: 400 })
    }

    const nextStage = completed ? Math.min(stageId + 1, 5) : stageId

    // First, get existing record to preserve all other stage completion data
    const { data: existingRecord } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    // Build update object - ALWAYS initialize all stage completion flags for the day
    const updateData: any = {
      user_id: user.id,
      date: today,
      current_stage: nextStage,
      updated_at: new Date().toISOString(),
      // Initialize all stages to false first (for new days)
      morning_check_completed: false,
      daily_intention_completed: false,
      trading_plan_completed: false,
      record_trades_completed: false,
      daily_summary_completed: false,
    }

    // Preserve existing stage completion data if record exists
    if (existingRecord) {
      updateData.morning_check_completed = existingRecord.morning_check_completed
      updateData.morning_check_completed_at = existingRecord.morning_check_completed_at
      updateData.daily_intention_completed = existingRecord.daily_intention_completed
      updateData.daily_intention_completed_at = existingRecord.daily_intention_completed_at
      updateData.trading_plan_completed = existingRecord.trading_plan_completed
      updateData.trading_plan_completed_at = existingRecord.trading_plan_completed_at
      updateData.record_trades_completed = existingRecord.record_trades_completed
      updateData.record_trades_completed_at = existingRecord.record_trades_completed_at
      updateData.daily_summary_completed = existingRecord.daily_summary_completed
      updateData.daily_summary_completed_at = existingRecord.daily_summary_completed_at
    }

    // Now update the specific stage being completed
    updateData[stageColumn.completed] = completed
    updateData[stageColumn.completedAt] = completedAt

    const { data, error } = await supabase
      .from("daily_stages")
      .upsert(updateData, {
        onConflict: "user_id,date",
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error updating daily stage:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] Stage ${stageId} ${completed ? "completed" : "uncompleted"} - next stage: ${nextStage}`)

    // Check if all 5 stages are now completed for today
    if (completed && stageId === 5) {
      const allStagesCompleted =
        updateData.morning_check_completed &&
        updateData.daily_intention_completed &&
        updateData.trading_plan_completed &&
        updateData.record_trades_completed &&
        updateData.daily_summary_completed

      if (allStagesCompleted) {
        console.log("[v0] All stages completed for today! Updating challenge progress...")

        // Update the "Zero Revenge Trading Week" challenge (challenge-1) progress
        // Count how many unique days this user has completed all stages
        const { data: completedDays } = await supabase
          .from("daily_stages")
          .select("date")
          .eq("user_id", user.id)
          .eq("morning_check_completed", true)
          .eq("daily_intention_completed", true)
          .eq("trading_plan_completed", true)
          .eq("record_trades_completed", true)
          .eq("daily_summary_completed", true)

        const totalDaysCompleted = completedDays?.length || 0
        console.log("[v0] Total days with all stages completed:", totalDaysCompleted)

        // Update or create challenge progress record
        const { error: challengeError } = await supabase
          .from("user_challenge_progress")
          .upsert(
            {
              user_id: user.id,
              challenge_id: "challenge-1", // Zero Revenge Trading Week challenge
              progress: Math.min(totalDaysCompleted, 7), // 7 days = 1 week
              completed: totalDaysCompleted >= 7,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,challenge_id",
            }
          )

        if (challengeError) {
          console.error("[v0] Error updating challenge progress:", challengeError)
        } else {
          console.log("[v0] Challenge progress updated: challenge-1 progress =", Math.min(totalDaysCompleted, 7))
        }
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error in daily-stages UPDATE:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
