export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    // Get trades
    let tradesQuery = supabase.from("journal_entries").select("*").eq("user_id", user.id).eq("type", "trade")

    if (startDate) tradesQuery = tradesQuery.gte("date", startDate)
    if (endDate) tradesQuery = tradesQuery.lte("date", endDate)

    const { data: trades, error: tradesError } = await tradesQuery

    if (tradesError) {
      return NextResponse.json({ error: tradesError.message }, { status: 500 })
    }

    // Return insufficient data state if no trades
    if (!trades || trades.length === 0) {
      return NextResponse.json({
        insufficientData: true,
        message: "No trades found for the selected period",
        stats: null,
      })
    }

    // Compute real statistics
    const winningTrades = trades.filter((t) => (t.pnl || 0) > 0)
    const losingTrades = trades.filter((t) => (t.pnl || 0) < 0)

    const stats = {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: trades.filter((t) => (t.pnl || 0) === 0).length,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      averageWin:
        winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0,
      averageLoss:
        losingTrades.length > 0
          ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
          : 0,
      largestWin: Math.max(...trades.map((t) => t.pnl || 0), 0),
      largestLoss: Math.min(...trades.map((t) => t.pnl || 0), 0),
      profitFactor: 0,
      uniqueTradingDays: new Set(trades.map((t) => t.date)).size,
    }

    // Calculate profit factor
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0))
    stats.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Number.POSITIVE_INFINITY : 0

    // Get morning checks for correlation
    const { data: morningChecks } = await supabase.from("morning_checks").select("*").eq("user_id", user.id)

    // Mood-performance correlation
    let moodCorrelation = null
    if (morningChecks && morningChecks.length > 0) {
      const tradeDates = new Set(trades.map((t) => t.date))
      const matchedChecks = morningChecks.filter((c) => tradeDates.has(c.date))

      if (matchedChecks.length >= 5) {
        // Simple correlation: high mood days vs low mood days
        const highMoodDays = matchedChecks.filter((c) => (c.emotional_state || 0) >= 7)
        const lowMoodDays = matchedChecks.filter((c) => (c.emotional_state || 0) < 5)

        const highMoodPnL = trades
          .filter((t) => highMoodDays.some((h) => h.date === t.date))
          .reduce((sum, t) => sum + (t.pnl || 0), 0)

        const lowMoodPnL = trades
          .filter((t) => lowMoodDays.some((l) => l.date === t.date))
          .reduce((sum, t) => sum + (t.pnl || 0), 0)

        moodCorrelation = {
          highMoodAvgPnL: highMoodDays.length > 0 ? highMoodPnL / highMoodDays.length : 0,
          lowMoodAvgPnL: lowMoodDays.length > 0 ? lowMoodPnL / lowMoodDays.length : 0,
          sampleSize: matchedChecks.length,
        }
      }
    }

    return NextResponse.json({
      insufficientData: false,
      stats,
      moodCorrelation,
      tradingDays: stats.uniqueTradingDays,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
