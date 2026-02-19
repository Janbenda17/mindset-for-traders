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
      console.error("[v0] Stage update - No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Stage update - User:", user.id)

    const body = await request.json()
    const { stageId, completed } = body

    console.log("[v0] Stage update - Completing stage:", stageId, "completed:", completed)

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
    const { data: existingRecord, error: getError } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    console.log("[v0] Stage update - Existing record:", existingRecord ? "found" : "not found")

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

    console.log("[v0] Stage update - Upserting data:", updateData)

    const { data, error } = await supabase
      .from("daily_stages")
      .upsert(updateData, {
        onConflict: "user_id,date",
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Stage update - Error upserting daily stage:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Stage update - Stage", stageId, completed ? "completed" : "uncompleted", "- next stage:", nextStage)

    // Auto-track badges when morning check (stage 1) is completed
    if (completed && stageId === 1) {
      console.log("[v0] Stage update - Morning check completed! Incrementing badges...")

      // Increment "Morning Bird" badge (7-day streak)
      const { data: morningBirdData } = await supabase
        .from("user_badge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("badge_id", "morning-bird")
        .maybeSingle()

      if (!morningBirdData?.completed) {
        // Count consecutive days with morning check
        const { data: lastDays } = await supabase
          .from("daily_stages")
          .select("date, morning_check_completed")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(7)

        let consecutiveDays = 0
        const sortedDays = (lastDays || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const today_ = new Date().toISOString().split("T")[0]

        for (let i = 0; i < sortedDays.length; i++) {
          const checkDate = new Date(sortedDays[i].date)
          const expectedDate = new Date(today_)
          expectedDate.setDate(expectedDate.getDate() - i)

          if (sortedDays[i].morning_check_completed && checkDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
            consecutiveDays++
          } else {
            break
          }
        }

        console.log("[v0] Stage update - Consecutive morning checks:", consecutiveDays)

        const morningBirdProgress = Math.min(consecutiveDays, 7)
        const isMorningBirdCompleted = morningBirdProgress >= 7

        const { error: morningBirdError } = await supabase
          .from("user_badge_progress")
          .upsert(
            {
              user_id: user.id,
              badge_id: "morning-bird",
              progress: morningBirdProgress,
              completed: isMorningBirdCompleted,
              completed_at: isMorningBirdCompleted ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,badge_id" }
          )

        if (!morningBirdError && isMorningBirdCompleted) {
          // Award XP for completing badge
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 100,
            source: "badge",
            reason: "Odznak odemknut: Ranní Pták",
          })
          console.log("[v0] Stage update - Morning Bird badge completed! XP awarded")
        }
      }
    }

    // Auto-track all badges for milestone completion
    if (completed) {
      console.log("[v0] Stage update - Incrementing consistency badges...")

      // Count total days with morning checks to update consistency badges
      const { data: allMorningChecks } = await supabase
        .from("daily_stages")
        .select("date")
        .eq("user_id", user.id)
        .eq("morning_check_completed", true)

      const totalMorningChecks = allMorningChecks?.length || 0

      // Update consistency-master badge (14-day streak)
      if (totalMorningChecks >= 14) {
        const { data: consistencyData } = await supabase
          .from("user_badge_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("badge_id", "consistency-master")
          .maybeSingle()

        if (!consistencyData?.completed) {
          const { error: consistencyError } = await supabase
            .from("user_badge_progress")
            .upsert(
              {
                user_id: user.id,
                badge_id: "consistency-master",
                progress: Math.min(totalMorningChecks, 14),
                completed: totalMorningChecks >= 14,
                completed_at: totalMorningChecks >= 14 ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id,badge_id" }
            )

          if (!consistencyError && totalMorningChecks >= 14) {
            await supabase.from("xp_log").insert({
              user_id: user.id,
              amount: 200,
              source: "badge",
              reason: "Odznak odemknut: Mistr Konzistence",
            })
            console.log("[v0] Stage update - Consistency Master badge completed!")
          }
        }
      }
    }

    return NextResponse.json(data)
      const allStagesCompleted =
        updateData.morning_check_completed &&
        updateData.daily_intention_completed &&
        updateData.trading_plan_completed &&
        updateData.record_trades_completed &&
        updateData.daily_summary_completed

      console.log("[v0] Stage update - All stages check:", allStagesCompleted)

      if (allStagesCompleted) {
        console.log("[v0] Stage update - All stages completed for today! Updating challenge progress...")

        // Count how many unique days this user has completed all stages
        const { data: completedDays, error: countError } = await supabase
          .from("daily_stages")
          .select("date")
          .eq("user_id", user.id)
          .eq("morning_check_completed", true)
          .eq("daily_intention_completed", true)
          .eq("trading_plan_completed", true)
          .eq("record_trades_completed", true)
          .eq("daily_summary_completed", true)

        const totalDaysCompleted = completedDays?.length || 0
        console.log("[v0] Stage update - Total days with all stages completed:", totalDaysCompleted)

        // Update or create challenge progress record
        const { error: challengeError, data: challengeData } = await supabase
          .from("user_challenge_progress")
          .upsert(
            {
              user_id: user.id,
              challenge_id: "challenge-1",
              progress: Math.min(totalDaysCompleted, 7),
              completed: totalDaysCompleted >= 7,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,challenge_id",
            }
          )
          .select()

        if (challengeError) {
          console.error("[v0] Stage update - Error updating challenge progress:", challengeError)
        } else {
          console.log("[v0] Stage update - Challenge progress updated:", Math.min(totalDaysCompleted, 7))
        }
      }
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Stage update - Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
