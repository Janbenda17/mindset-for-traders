import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const BADGE_TEMPLATES = [
  {
    id: "morning-bird",
    title: "Ranní Pták",
    description: "Dokončit Readiness Check 7 dní po sobě",
    icon: "🌅",
    target: 7,
    xpReward: 100,
    category: "consistency",
  },
  {
    id: "trader-ten",
    title: "Dekáda Obchodů",
    description: "Zadat 10 obchodů",
    icon: "📊",
    target: 10,
    xpReward: 150,
    category: "trading",
  },
  {
    id: "consistency-master",
    title: "Mistr Konzistence",
    description: "Dodržet 14denní streak",
    icon: "⚙️",
    target: 14,
    xpReward: 200,
    category: "consistency",
  },
  {
    id: "perfect-readiness",
    title: "Mistr Připravenosti",
    description: "5 dní dokonalého Readiness skóre (+80%)",
    icon: "⭐",
    target: 5,
    xpReward: 150,
    category: "performance",
  },
  {
    id: "loss-reset-master",
    title: "Zvládnutí Ztrát",
    description: "7 resetů po ztrátě bez emocí",
    icon: "🔄",
    target: 7,
    xpReward: 175,
    category: "discipline",
  },
  {
    id: "goals-planner",
    title: "Plánovač Cílů",
    description: "Zapsat 3 trading cíle",
    icon: "🎯",
    target: 3,
    xpReward: 120,
    category: "planning",
  },
  {
    id: "trader-identity",
    title: "Identita Traderu",
    description: "Dokončit profil identity traderu",
    icon: "🪪",
    target: 1,
    xpReward: 200,
    category: "profile",
  },
  {
    id: "error-logger",
    title: "Mistr Analýzy Chyb",
    description: "Záznam 5 chyb a lekcí",
    icon: "📚",
    target: 5,
    xpReward: 140,
    category: "learning",
  },
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Badge tracking - Starting auto-track for user:", user.id)

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

      if (
        last14Days[i].morning_check_completed &&
        checkDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]
      ) {
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
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in badge tracking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
