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

    const supabaseFields = {
      user_id: user.id,
      type: "trade",
      title: tradeTitle,
      date: trade.date || new Date().toISOString().split("T")[0],
      pair: trade.pair,
      symbol: trade.pair,
      direction: trade.direction,
      entry_price: trade.entryPrice || null,
      exit_price: trade.exitPrice || null,
      quantity: trade.quantity || trade.positionSize || null,
      pnl: trade.pnl,
      pips: trade.pips || null,
      mood: trade.mood,
      confidence: trade.confidence || trade.confidenceBefore,
      confidence_level: trade.confidenceBefore,
      stress: trade.stress || trade.stressLevel,
      stress_level: trade.stressLevel,
      discipline: trade.discipline,
      emotion_before: trade.emotionBefore,
      emotion_during: trade.emotionDuring,
      emotion_after: trade.emotionAfter,
      notes: trade.notes || trade.detailedAnalysis,
      content: trade.detailedAnalysis,
      lessons: trade.lessons,
      mistakes: trade.mistakes,
      improvements: trade.improvements,
      what_worked: trade.whatWorked,
      what_didnt_work: trade.whatDidntWork,
      entry_reason: trade.entryReason,
      exit_reason: trade.exitReason,
      market_conditions: trade.marketConditions,
      revenge_trade: trade.revengeTrade || false,
      exited_early: trade.exitedEarly || false,
      missed_due_to_hesitation: trade.missedDueToHesitation || false,
      matched_plan: trade.matchedPlan || trade.followedPlan || false,
      tags: trade.tags || [],
      trade_type: trade.tradeType,
      position_size: trade.positionSize,
      profit_loss: trade.pnl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("journal_entries").insert(supabaseFields).select().maybeSingle()

    if (error) {
      console.error("[v0] Error inserting trade:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Trade inserted successfully with RLS protection")
    return NextResponse.json({ data: data || supabaseFields })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
