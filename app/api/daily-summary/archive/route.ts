import { createClient } from "@supabase/supabase-js"

import { NextRequest, NextResponse } from "next/server"
import { formatISO } from "date-fns"

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials")
  }
  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey)
  return supabaseInstance
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      date,
      totalPnl,
      winRate,
      tradesCount,
      mood,
      aiInsights,
      morningCheck,
      tradingPlan,
      dailyIntention,
      userId: bodyUserId // Allow userId to be passed in body
    } = body

    // Get user from cookie/session or use provided userId
    let userId = bodyUserId
    
    if (!userId) {
      const cookieHeader = req.headers.get("cookie")
      const userIdMatch = cookieHeader?.match(/mt_user_id=([^;]+)/)
      userId = userIdMatch?.[1]
    }

    // In demo mode, use a demo userId
    if (!userId) {
      userId = "demo_user_" + date
      console.log("[v0] Demo mode - using temporary userId:", userId)
    }

    // Save to daily_tracker_entries (existing table)
    const { data, error } = await getSupabase()
      .from("daily_tracker_entries")
      .upsert({
        user_id: userId,
        date: date,
        total_pnl: totalPnl,
        trades_count: tradesCount,
        winning_trades: Math.round((tradesCount * winRate) / 100),
        losing_trades: Math.round(tradesCount * (1 - winRate / 100)),
        mood: mood,
        notes: JSON.stringify({
          aiInsights,
          archived: true,
          archivedAt: formatISO(new Date()),
          morningCheck,
          tradingPlan,
          dailyIntention
        })
      },
      { onConflict: "date,user_id" }
    )

    if (error) {
      console.error("[v0] Error archiving summary:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Summary archived successfully for user:", userId, "date:", date)

    return NextResponse.json({
      success: true,
      message: "Summary archived successfully",
      data
    })
  } catch (error) {
    console.error("[v0] Archive error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 })
  }
}
