import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Unauthorized trade add attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { trade } = body

    console.log("[v0] Adding trade for authenticated user:", user.id)

    const tradeTitle =
      trade.title ||
      `${trade.pair || trade.symbol || "Trade"} ${trade.direction || ""} - ${trade.date || new Date().toISOString().split("T")[0]}`

    const tradeDate = trade.date || new Date().toISOString().split("T")[0]
    const recordedDate = trade.recordedDate || new Date().toISOString().split("T")[0]

    const supabaseFields = {
      user_id: user.id,
      type: "trade",
      title: tradeTitle,
      date: tradeDate, // The date when the trade actually happened
      recorded_date: recordedDate, // The date when the trade was recorded
      pair: trade.pair || trade.symbol,
      symbol: trade.pair || trade.symbol,
      direction: trade.direction || "long",
      entry_price: Number(trade.entryPrice) || null,
      exit_price: Number(trade.exitPrice) || null,
      quantity: Number(trade.quantity || trade.positionSize) || null,
      pnl: Number(trade.pnl) || 0,
      pips: Number(trade.pips) || null,
      mood: Number(trade.mood) || null,
      confidence: Number(trade.confidence || trade.confidenceBefore) || null,
      confidence_level: Number(trade.confidenceBefore || trade.confidence) || null,
      confidence_before: Number(trade.confidenceBefore || trade.confidence) || null,
      stress: Number(trade.stress || trade.stressLevel) || null,
      stress_level: Number(trade.stressLevel || trade.stress) || null,
      discipline: Number(trade.discipline) || null,
      emotion_before: trade.emotionBefore || null,
      emotion_during: trade.emotionDuring || null,
      emotion_after: trade.emotionAfter || null,
      notes: trade.notes || trade.detailedAnalysis || null,
      content: trade.detailedAnalysis || trade.notes || null,
      detailed_analysis: trade.detailedAnalysis || null,
      lessons: trade.lessons || [],
      mistakes: trade.mistakes || [],
      improvements: trade.improvements || [],
      what_worked: trade.whatWorked || null,
      what_didnt_work: trade.whatDidntWork || null,
      entry_reason: trade.entryReason || null,
      exit_reason: trade.exitReason || null,
      market_conditions: trade.marketConditions || null,
      revenge_trade: Boolean(trade.revengeTrade),
      exited_early: Boolean(trade.exitedEarly),
      missed_due_to_hesitation: Boolean(trade.missedDueToHesitation),
      matched_plan: Boolean(trade.matchedPlan || trade.followedPlan),
      followed_plan: Boolean(trade.followedPlan || trade.matchedPlan),
      tags: trade.tags || [],
      trade_type: trade.tradeType || null,
      position_size: Number(trade.positionSize || trade.quantity) || null,
      profit_loss: Number(trade.pnl) || 0,
      open_time: trade.openTime || null,
      close_time: trade.closeTime || null,
      open_date: trade.openDate || tradeDate,
      close_date: trade.closeDate || tradeDate,
      session: trade.session || null,
      behavior_description: trade.behaviorDescription || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("journal_entries").insert(supabaseFields).select().maybeSingle()

    if (error) {
      console.error("[v0] Error inserting trade:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error("[v0] No data returned after insert - possible RLS issue")
      return NextResponse.json({ error: "Failed to insert trade - check permissions" }, { status: 500 })
    }

    console.log("[v0] Trade inserted successfully with RLS protection")
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
