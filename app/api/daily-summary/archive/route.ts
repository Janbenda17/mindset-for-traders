import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { formatISO } from "date-fns"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    // Get user from cookie/session
    const cookieHeader = req.headers.get("cookie")
    const userIdMatch = cookieHeader?.match(/mt_user_id=([^;]+)/)
    const userId = userIdMatch?.[1]

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      date,
      totalPnl,
      winRate,
      tradesCount,
      readinessScore,
      mood,
      aiInsights,
      morningCheck,
      tradingPlan,
      dailyIntention
    } = body

    // Save to daily_tracker_entries (existing table)
    const { data, error } = await supabase
      .from("daily_tracker_entries")
      .upsert({
        user_id: userId,
        date: date,
        total_pnl: totalPnl,
        trades_count: tradesCount,
        winning_trades: Math.round((tradesCount * winRate) / 100),
        losing_trades: Math.round(tradesCount * (1 - winRate / 100)),
        readiness: readinessScore,
        mood: mood,
        notes: JSON.stringify({
          aiInsights,
          archived: true,
          archivedAt: formatISO(new Date())
        })
      },
      { onConflict: "date,user_id" }
    )

    if (error) {
      console.error("Error archiving summary:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Summary archived successfully",
      data
    })
  } catch (error) {
    console.error("Archive error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
