import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        currentDay: 1,
        daysCompleted: 0,
        todayComplete: false,
        isUnlocked: false,
      })
    }

    const today = new Date().toISOString().split("T")[0]

    // Get all days with morning checks
    const { data: morningChecks } = await supabase
      .from("morning_checks")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    // Get all days with trades
    const { data: trades } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("type", "trade")
      .order("created_at", { ascending: false })

    // Count completed days (days with both morning check AND at least 1 trade)
    const morningCheckDates = new Set((morningChecks || []).map((m) => m.date).filter(Boolean))
    const tradeDates = new Set(
      (trades || []).map((t) => new Date(t.created_at).toISOString().split("T")[0]).filter(Boolean),
    )

    const completedDays = Array.from(morningCheckDates).filter((date) => tradeDates.has(date)).length

    // Check today's completion status
    const hasMorningCheckToday = morningCheckDates.has(today)
    const hasTradeToday = Array.from(tradeDates).some((date) => date === today)
    const todayComplete = hasMorningCheckToday && hasTradeToday

    return NextResponse.json({
      currentDay: Math.min(completedDays + 1, 10),
      daysCompleted: completedDays,
      todayComplete,
      isUnlocked: completedDays >= 10,
    })
  } catch (error: any) {
    console.error("[v0] [Progression] Error:", error)
    // Return safe fallback
    return NextResponse.json({
      currentDay: 1,
      daysCompleted: 0,
      todayComplete: false,
      isUnlocked: false,
    })
  }
}
