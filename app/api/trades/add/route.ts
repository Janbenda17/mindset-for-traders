import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trade, userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    console.log("[v0] Adding trade for user:", userId)

    const supabaseFields = {
      user_id: userId,
      type: "trade", // Required field
      date: trade.date || new Date().toISOString().split("T")[0],
      pair: trade.pair,
      symbol: trade.pair, // Also set symbol for compatibility
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

    const { data, error } = await supabase.from("journal_entries").insert(supabaseFields).select().single()

    if (error) {
      console.error("[v0] Error inserting trade:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Trade inserted successfully")
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
