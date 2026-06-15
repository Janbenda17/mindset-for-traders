import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Automatically trigger goal generation if needed
 * Called from daily tracker or morning check completion
 */
export async function autoGenerateGoals(userId: string, date?: string): Promise<boolean> {
  try {
    const targetDate = date || new Date().toISOString().split("T")[0]
    const startOfWeek = getStartOfWeek(new Date(targetDate))
    const startOfMonth = getStartOfMonth(new Date(targetDate))

    console.log("[v0] Checking if goals need to be generated for user:", userId)

    // Check if weekly goal already exists for this week
    const { data: weeklyGoals, error: weeklyError } = await supabase
      .from("trading_goals")
      .select("id")
      .eq("user_id", userId)
      .eq("goal_type", "weekly")
      .gte("start_date", startOfWeek)
      .limit(1)

    // Check if monthly goal already exists for this month
    const { data: monthlyGoals, error: monthlyError } = await supabase
      .from("trading_goals")
      .select("id")
      .eq("user_id", userId)
      .eq("goal_type", "monthly")
      .gte("start_date", startOfMonth)
      .limit(1)

    const needsWeeklyGoal = !weeklyGoals || weeklyGoals.length === 0
    const needsMonthlyGoal = !monthlyGoals || monthlyGoals.length === 0

    if (!needsWeeklyGoal && !needsMonthlyGoal) {
      console.log("[v0] Goals already exist for this period")
      return true
    }

    console.log("[v0] Triggering goal generation - Weekly:", needsWeeklyGoal, "Monthly:", needsMonthlyGoal)

    // Call the goal generation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/goals/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        date: targetDate,
      }),
    })

    const data = await response.json()

    if (data.success) {
      console.log("[v0] Goals auto-generated successfully")
      return true
    } else {
      console.error("[v0] Goal generation failed:", data.error)
      return false
    }
  } catch (error) {
    console.error("[v0] Error auto-generating goals:", error)
    return false
  }
}

/**
 * Get the start of the week (Monday)
 */
function getStartOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split("T")[0]
}

/**
 * Get the start of the month
 */
function getStartOfMonth(date: Date): string {
  const d = new Date(date)
  d.setDate(1)
  return d.toISOString().split("T")[0]
}
