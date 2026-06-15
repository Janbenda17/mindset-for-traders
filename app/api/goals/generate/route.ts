import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"
import { grok } from "@ai-sdk/grok"
import { format, startOfWeek, startOfMonth, addDays, addMonths } from "date-fns"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Generate weekly and monthly goals using AI based on trader performance
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, date = new Date().toISOString().split("T")[0] } = body

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    console.log("[v0] Generating weekly and monthly goals for user:", userId, "date:", date)

    // Fetch recent trades for analysis
    const { data: recentTrades, error: tradesError } = await supabase
      .from("mt4_trades")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_time", format(addDays(new Date(date), -30), "yyyy-MM-dd"))
      .order("entry_time", { ascending: false })
      .limit(100)

    if (tradesError) console.warn("[v0] Trades fetch warning:", tradesError)

    // Fetch morning check for psychological state
    const { data: morningCheck, error: morningError } = await supabase
      .from("morning_checks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle()

    if (morningError) console.warn("[v0] Morning check fetch warning:", morningError)

    // Calculate statistics
    const stats = calculateStats(recentTrades || [])

    // Generate AI goals
    const weeklyGoal = await generateWeeklyGoal(userId, stats, morningCheck)
    const monthlyGoal = await generateMonthlyGoal(userId, stats, morningCheck)

    // Save goals to database
    const weeklyRes = await saveGoal(userId, weeklyGoal, "weekly", date)
    const monthlyRes = await saveGoal(userId, monthlyGoal, "monthly", date)

    console.log("[v0] Goals generated and saved successfully")

    return NextResponse.json({
      success: true,
      data: {
        weekly: weeklyRes,
        monthly: monthlyRes,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating goals:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Calculate trading statistics from recent trades
 */
function calculateStats(trades: any[]) {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      totalPnL: 0,
    }
  }

  const winningTrades = trades.filter((t) => t.profit_loss > 0)
  const losingTrades = trades.filter((t) => t.profit_loss < 0)

  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.profit_loss, 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + Math.abs(t.profit_loss), 0) / losingTrades.length : 0

  return {
    totalTrades: trades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    avgWin,
    avgLoss,
    profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
    totalPnL: trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
  }
}

/**
 * Generate AI weekly goal
 */
async function generateWeeklyGoal(userId: string, stats: any, morningCheck: any) {
  try {
    const prompt = `
Based on this trader's performance and psychological state, generate ONE specific, measurable weekly trading goal.

Performance Stats (Last 30 days):
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Avg Win: $${stats.avgWin.toFixed(2)}
- Avg Loss: $${stats.avgLoss.toFixed(2)}
- Profit Factor: ${stats.profitFactor.toFixed(2)}
- Total P&L: $${stats.totalPnL.toFixed(2)}

Psychological State:
- Energy Level: ${morningCheck?.energyLevel || "N/A"}/10
- Stress Level: ${morningCheck?.stressLevel || "N/A"}/10
- Focus: ${morningCheck?.focus || "N/A"}/10

Generate a JSON response with this exact structure (and ONLY this JSON, no other text):
{
  "title": "specific goal title",
  "description": "detailed description of what success looks like",
  "target": "specific number or metric",
  "focus_area": "where to focus (e.g., 'risk management', 'entry accuracy', 'consistency')",
  "why_important": "one sentence why this matters"
}
`

    const result = await generateText({
      model: grok("grok-2-1212"),
      prompt,
    })

    const parsed = JSON.parse(result.text)
    return {
      ...parsed,
      goal_type: "weekly",
      start_date: format(startOfWeek(new Date()), "yyyy-MM-dd"),
      target_date: format(addDays(startOfWeek(new Date()), 7), "yyyy-MM-dd"),
    }
  } catch (error) {
    console.error("[v0] Error generating weekly goal:", error)
    return {
      title: "Improve Trade Consistency",
      description: "Focus on consistent execution of your trading plan",
      target: "80% rule adherence",
      focus_area: "consistency",
      why_important: "Consistency is the foundation of profitable trading",
      goal_type: "weekly",
      start_date: format(startOfWeek(new Date()), "yyyy-MM-dd"),
      target_date: format(addDays(startOfWeek(new Date()), 7), "yyyy-MM-dd"),
    }
  }
}

/**
 * Generate AI monthly goal
 */
async function generateMonthlyGoal(userId: string, stats: any, morningCheck: any) {
  try {
    const prompt = `
Based on this trader's 30-day performance, generate ONE ambitious but achievable monthly trading goal.

Performance Stats (Last 30 days):
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Avg Win: $${stats.avgWin.toFixed(2)}
- Avg Loss: $${stats.avgLoss.toFixed(2)}
- Profit Factor: ${stats.profitFactor.toFixed(2)}
- Total P&L: $${stats.totalPnL.toFixed(2)}

Generate a JSON response with this exact structure (and ONLY this JSON, no other text):
{
  "title": "ambitious but achievable monthly goal",
  "description": "detailed description of the monthly objective",
  "target": "specific metric (profit target, win rate, number of trades, etc)",
  "milestones": ["week 1 target", "week 2 target", "week 3 target", "week 4 target"],
  "success_metric": "how you'll measure success",
  "stretch_goal": "bonus if achieved"
}
`

    const result = await generateText({
      model: grok("grok-2-1212"),
      prompt,
    })

    const parsed = JSON.parse(result.text)
    return {
      ...parsed,
      goal_type: "monthly",
      start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      target_date: format(addMonths(startOfMonth(new Date()), 1), "yyyy-MM-dd"),
    }
  } catch (error) {
    console.error("[v0] Error generating monthly goal:", error)
    return {
      title: "Achieve 55% Win Rate and Positive P&L",
      description: "Maintain disciplined trading with focus on quality over quantity",
      target: "55% win rate with positive monthly P&L",
      milestones: ["15+ profitable trades", "50%+ win rate", "Consistent daily execution", "Zero revenge trading"],
      success_metric: "Monthly P&L > $0 with 55%+ win rate",
      stretch_goal: "Monthly P&L > $500 with 60%+ win rate",
      goal_type: "monthly",
      start_date: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      target_date: format(addMonths(startOfMonth(new Date()), 1), "yyyy-MM-dd"),
    }
  }
}

/**
 * Save goal to database
 */
async function saveGoal(userId: string, goal: any, type: "weekly" | "monthly", date: string) {
  try {
    const { data, error } = await supabase.from("trading_goals").insert({
      user_id: userId,
      title: goal.title,
      description: goal.description,
      goal_type: type,
      target_value: goal.target || goal.success_metric,
      start_date: goal.start_date,
      target_date: goal.target_date,
      status: "active",
      focus_area: goal.focus_area || goal.success_metric,
      milestones: goal.milestones || [],
      metadata: JSON.stringify({
        aiGenerated: true,
        generatedAt: new Date().toISOString(),
        focusArea: goal.focus_area,
        whyImportant: goal.why_important,
        stretchGoal: goal.stretch_goal,
      }),
    }).select()

    if (error) {
      console.error("[v0] Error saving goal:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("[v0] Error saving goal:", error)
    return null
  }
}
