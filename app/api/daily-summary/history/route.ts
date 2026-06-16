import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(req: NextRequest) {
  try {
    // Get user from cookie or use demo userId
    let userId = "demo_user"
    const cookieHeader = req.headers.get("cookie")
    const userIdMatch = cookieHeader?.match(/mt_user_id=([^;]+)/)
    if (userIdMatch?.[1]) {
      userId = userIdMatch[1]
    }

    console.log("[v0] Fetching history for user:", userId)

    // For demo_user, return empty array (no archival needed in demo mode)
    if (userId === "demo_user") {
      return NextResponse.json({
        success: true,
        entries: [],
        count: 0,
      })
    }

    // Fetch all daily tracker entries (archived summaries) for real users
    const { data, error } = await supabase
      .from("daily_tracker_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the data for the frontend
    const entries = (data || []).map((entry) => ({
      id: entry.id || `${entry.user_id}_${entry.date}`,
      date: entry.date,
      total_pnl: entry.total_pnl || 0,
      trades_count: entry.trades_count || 0,
      winning_trades: entry.winning_trades || 0,
      losing_trades: entry.losing_trades || 0,
      mood: entry.mood,
      notes: entry.notes ? JSON.stringify(entry.notes) : undefined,
      created_at: entry.created_at,
    }))

    console.log("[v0] Found", entries.length, "history entries")

    return NextResponse.json({
      success: true,
      entries: entries,
      count: entries.length,
    })
  } catch (error) {
    console.error("[v0] History fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
