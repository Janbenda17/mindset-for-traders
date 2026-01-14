import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Check current day's requirements and advance if met
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Get completed days count
    const { data: completedDays } = await supabase
      .from("progression_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("day_completed", true)

    const currentDayNumber = (completedDays?.length || 0) + 1

    if (currentDayNumber > 10) {
      return NextResponse.json({
        message: "All 10 days completed!",
        currentDay: 10,
        isUnlocked: true,
      })
    }

    // Check if today's morning check exists
    const { data: morningCheck } = await supabase
      .from("morning_checks")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    // Count today's trades
    const { count: tradesCount } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("type", "trade")
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)

    const hasMorningCheck = !!morningCheck
    const hasTrades = (tradesCount || 0) >= 1
    const todayComplete = hasMorningCheck && hasTrades

    // Update or create progression entry for today
    const { data: existingProgress } = await supabase
      .from("progression_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("day_number", currentDayNumber)
      .maybeSingle()

    if (existingProgress) {
      // Update existing
      await supabase
        .from("progression_stages")
        .update({
          morning_check_completed: hasMorningCheck,
          morning_check_id: morningCheck?.id,
          trades_recorded: tradesCount || 0,
          day_completed: todayComplete,
          day_completed_at: todayComplete ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)
    } else {
      // Create new
      await supabase.from("progression_stages").insert({
        user_id: user.id,
        current_day: currentDayNumber,
        day_number: currentDayNumber,
        date: today,
        morning_check_completed: hasMorningCheck,
        morning_check_id: morningCheck?.id,
        trades_recorded: tradesCount || 0,
        day_completed: todayComplete,
        day_completed_at: todayComplete ? new Date().toISOString() : null,
      })
    }

    return NextResponse.json({
      currentDay: currentDayNumber,
      morningCheckDone: hasMorningCheck,
      tradesRecorded: tradesCount || 0,
      dayComplete: todayComplete,
      canAdvance: todayComplete,
      isUnlocked: currentDayNumber >= 10 && todayComplete,
      requiresMorningCheck: !hasMorningCheck,
      requiresTradeEntry: !hasTrades,
    })
  } catch (error: any) {
    console.error("[v0] [Progression] Error checking/advancing:", error)
    return NextResponse.json({ todayComplete: false, hasMorningCheck: false, hasTrades: false })
  }
}
