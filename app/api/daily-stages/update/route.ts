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

      // Auto-track "Trader Ten" badge - count journal entries (trades)
      const { data: trades } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "trade")

      const tradeCount = trades?.length || 0
      if (tradeCount > 0 && tradeCount <= 10) {
        await supabase
          .from("user_badge_progress")
          .upsert(
            {
              user_id: user.id,
              badge_id: "trader-ten",
              progress: Math.min(tradeCount, 10),
              completed: tradeCount >= 10,
              completed_at: tradeCount >= 10 ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,badge_id" }
          )

        if (tradeCount >= 10) {
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 150,
            source: "badge",
            reason: "Odznak odemknut: Dekáda Obchodů",
          })
        }
      }

      // Auto-track "Perfect Readiness" badge - count days with +80% readiness
      const { data: highReadinessDays } = await supabase
        .from("daily_stages")
        .select("readiness_score")
        .eq("user_id", user.id)
        .gte("readiness_score", 80)

      const perfectReadinessDays = highReadinessDays?.length || 0
      if (perfectReadinessDays >= 1) {
        await supabase
          .from("user_badge_progress")
          .upsert(
            {
              user_id: user.id,
              badge_id: "perfect-readiness",
              progress: Math.min(perfectReadinessDays, 5),
              completed: perfectReadinessDays >= 5,
              completed_at: perfectReadinessDays >= 5 ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,badge_id" }
          )

        if (perfectReadinessDays >= 5) {
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 150,
            source: "badge",
            reason: "Odznak odemknut: Mistr Připravenosti",
          })
        }
      }

      // Auto-track "Loss Reset Master" badge - count loss recovery events
      const { data: losses } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("recovery_after_loss", true)

      const lossResets = losses?.length || 0
      if (lossResets > 0 && lossResets <= 7) {
        await supabase
          .from("user_badge_progress")
          .upsert(
            {
              user_id: user.id,
              badge_id: "loss-reset-master",
              progress: Math.min(lossResets, 7),
              completed: lossResets >= 7,
              completed_at: lossResets >= 7 ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,badge_id" }
          )

        if (lossResets >= 7) {
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 175,
            source: "badge",
            reason: "Odznak odemknut: Zvládnutí Ztrát",
          })
        }
      }

      // Auto-track "Goals Planner" badge - count trading goals
      const { data: tradingGoals } = await supabase
        .from("trading_goals")
        .select("id")
        .eq("user_id", user.id)
        .eq("active", true)

      const goalCount = tradingGoals?.length || 0
      if (goalCount > 0 && goalCount <= 3) {
        await supabase
          .from("user_badge_progress")
          .upsert(
            {
              user_id: user.id,
              badge_id: "goals-planner",
              progress: Math.min(goalCount, 3),
              completed: goalCount >= 3,
              completed_at: goalCount >= 3 ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,badge_id" }
          )

        if (goalCount >= 3) {
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 120,
            source: "badge",
            reason: "Odznak odemknut: Plánovač Cílů",
          })
        }
      }

      // Auto-track "Error Logger" badge - count recorded errors/lessons
      const { data: errorLogs } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_learned", true)

      const errorCount = errorLogs?.length || 0
      if (errorCount > 0 && errorCount <= 5) {
        await supabase
          .from("user_badge_progress")
          .upsert(
            {
              user_id: user.id,
              badge_id: "error-logger",
              progress: Math.min(errorCount, 5),
              completed: errorCount >= 5,
              completed_at: errorCount >= 5 ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,badge_id" }
          )

        if (errorCount >= 5) {
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 140,
            source: "badge",
            reason: "Odznak odemknut: Mistr Analýzy Chyb",
          })
        }
      }

      // Auto-track "Trader Identity" badge - check if trader_identity is completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("trader_identity_completed")
        .eq("user_id", user.id)
        .single()

      if (profile?.trader_identity_completed) {
        const { data: identityBadge } = await supabase
          .from("user_badge_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("badge_id", "trader-identity")
          .maybeSingle()

        if (!identityBadge?.completed) {
          await supabase
            .from("user_badge_progress")
            .upsert(
              {
                user_id: user.id,
                badge_id: "trader-identity",
                progress: 1,
                completed: true,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id,badge_id" }
            )

          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: 200,
            source: "badge",
            reason: "Odznak odemknut: Identita Traderu",
          })
        }
      }
    }

    return NextResponse.json(data)
  } catch (error) {
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
