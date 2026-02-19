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
        progress: 0,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      await supabase.from("user_badge_progress").insert(badgesToInsert)
      console.log("[v0] Stage update - Badges initialized!")
    }

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

      // Helper function to award badge XP
      const awardBadgeXP = async (badgeId: string, title: string, xp: number) => {
        const { data: existingLog } = await supabase
          .from("xp_log")
          .select("id")
          .eq("user_id", user.id)
          .eq("source", "badge")
          .eq("reason", `Odznak odemknut: ${title}`)
          .maybeSingle()

        if (!existingLog) {
          await supabase.from("xp_log").insert({
            user_id: user.id,
            amount: xp,
            source: "badge",
            reason: `Odznak odemknut: ${title}`,
          })
          console.log(`[v0] Badge completed: ${title} - awarded ${xp} XP`)
        }
      }

      // 1. Morning Bird - Count total morning checks completed (7 needed)
      const { data: allMorningChecks } = await supabase
        .from("daily_stages")
        .select("date")
        .eq("user_id", user.id)
        .eq("morning_check_completed", true)

      const totalMorningChecks = allMorningChecks?.length || 0
      console.log("[v0] Badge tracking - Total morning checks:", totalMorningChecks)

      await supabase
        .from("user_badge_progress")
        .upsert(
          {
            user_id: user.id,
            badge_id: "morning-bird",
            progress: Math.min(totalMorningChecks, 7),
            completed: totalMorningChecks >= 7,
            completed_at: totalMorningChecks >= 7 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,badge_id" }
        )

      if (totalMorningChecks >= 7) {
        await awardBadgeXP("morning-bird", "Ranní Pták", 100)
      }

      // 2. Trader Ten - Count trades (10 needed)
      const { data: trades } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "trade")

      const tradeCount = trades?.length || 0
      console.log("[v0] Badge tracking - Total trades:", tradeCount)

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
        await awardBadgeXP("trader-ten", "Dekáda Obchodů", 150)
      }

      // 3. Consistency Master - 14-day streak
      const { data: last14Days } = await supabase
        .from("daily_stages")
        .select("date, morning_check_completed")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(14)

      let consecutiveStreak = 0
      const today_ = new Date().toISOString().split("T")[0]

      for (let i = 0; i < (last14Days || []).length; i++) {
        const checkDate = new Date(last14Days[i].date)
        const expectedDate = new Date(today_)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (last14Days[i].morning_check_completed && checkDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
          consecutiveStreak++
        } else {
          break
        }
      }

      console.log("[v0] Badge tracking - Consecutive streak:", consecutiveStreak)

      await supabase
        .from("user_badge_progress")
        .upsert(
          {
            user_id: user.id,
            badge_id: "consistency-master",
            progress: Math.min(consecutiveStreak, 14),
            completed: consecutiveStreak >= 14,
            completed_at: consecutiveStreak >= 14 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,badge_id" }
        )

      if (consecutiveStreak >= 14) {
        await awardBadgeXP("consistency-master", "Mistr Konzistence", 200)
      }

      // 4. Perfect Readiness - 5 days with +80% readiness
      const { data: highReadinessDays } = await supabase
        .from("daily_stages")
        .select("readiness_score")
        .eq("user_id", user.id)
        .gte("readiness_score", 80)

      const perfectDays = highReadinessDays?.length || 0
      console.log("[v0] Badge tracking - Days with +80% readiness:", perfectDays)

      await supabase
        .from("user_badge_progress")
        .upsert(
          {
            user_id: user.id,
            badge_id: "perfect-readiness",
            progress: Math.min(perfectDays, 5),
            completed: perfectDays >= 5,
            completed_at: perfectDays >= 5 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,badge_id" }
        )

      if (perfectDays >= 5) {
        await awardBadgeXP("perfect-readiness", "Mistr Připravenosti", 150)
      }

      // 5. Loss Reset Master - Count loss resets (7 needed)
      // This will be tracked when user marks recovery_after_loss in journal
      const { data: lossResets } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("recovery_after_loss", true)

      const lossResetCount = lossResets?.length || 0
      console.log("[v0] Badge tracking - Loss resets:", lossResetCount)

      await supabase
        .from("user_badge_progress")
        .upsert(
          {
            user_id: user.id,
            badge_id: "loss-reset-master",
            progress: Math.min(lossResetCount, 7),
            completed: lossResetCount >= 7,
            completed_at: lossResetCount >= 7 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,badge_id" }
        )

      if (lossResetCount >= 7) {
        await awardBadgeXP("loss-reset-master", "Zvládnutí Ztrát", 175)
      }

      // 6. Goals Planner - Count trading goals (3 needed)
      const { data: goals } = await supabase
        .from("trading_goals")
        .select("id")
        .eq("user_id", user.id)

      const goalCount = goals?.length || 0
      console.log("[v0] Badge tracking - Trading goals:", goalCount)

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
        await awardBadgeXP("goals-planner", "Plánovač Cílů", 120)
      }

      // 7. Error Logger - Count lessons learned (5 needed)
      const { data: lessons } = await supabase
        .from("journal_entries")
        .select("id")
        .eq("user_id", user.id)
        .or("lesson_learned.eq.true,error_logged.eq.true")

      const lessonCount = lessons?.length || 0
      console.log("[v0] Badge tracking - Lessons learned:", lessonCount)

      await supabase
        .from("user_badge_progress")
        .upsert(
          {
            user_id: user.id,
            badge_id: "error-logger",
            progress: Math.min(lessonCount, 5),
            completed: lessonCount >= 5,
            completed_at: lessonCount >= 5 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,badge_id" }
        )

      if (lessonCount >= 5) {
        await awardBadgeXP("error-logger", "Mistr Analýzy Chyb", 140)
      }

      // 8. Trader Identity - Check if profile is completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("trader_identity_completed")
        .eq("user_id", user.id)
        .single()

      const identityCompleted = profile?.trader_identity_completed || false
      console.log("[v0] Badge tracking - Trader identity completed:", identityCompleted)

      await supabase
        .from("user_badge_progress")
        .upsert(
          {
            user_id: user.id,
            badge_id: "trader-identity",
            progress: identityCompleted ? 1 : 0,
            completed: identityCompleted,
            completed_at: identityCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,badge_id" }
        )

      if (identityCompleted) {
        await awardBadgeXP("trader-identity", "Identita Traderu", 200)
      }

      console.log("[v0] Badge tracking complete!")
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
