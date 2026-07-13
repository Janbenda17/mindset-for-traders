import { createClient } from "@supabase/supabase-js"

import { NextRequest, NextResponse } from "next/server"

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }
  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey)
  return supabaseInstance
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from the profiles table.
    //
    // IMPORTANT: profiles' primary key is `user_id` - the table has no `id`
    // column at all (see scripts/001_create_users_and_profiles.sql).
    // Likewise `full_name` was never a profiles column (only `display_name`
    // is). `win_rate`/`pnl` aren't stored as running totals anywhere either,
    // they're derived from journal_entries below.
    //
    // xp/level: profiles DOES have its own xp/level columns (added by
    // scripts/add-xp-system.sql) and that's the column pair every other part
    // of the app actually writes to and reads from (see app/api/xp/award and
    // app/api/leaderboard). There is also a separate, unrelated `user_xp`
    // table from the original schema, but nothing in the codebase ever
    // writes to it, so it's permanently stuck at defaults - an earlier
    // version of this route pulled xp/level from that dead table, which
    // silently showed 0 XP / level 1 for every user instead of their real
    // numbers. Select xp/level straight off profiles instead.
    const { data: profiles, error: usersError } = await getSupabase()
      .from("profiles")
      .select(`
        user_id,
        email,
        display_name,
        avatar_url,
        created_at,
        xp,
        level
      `)
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("[v0] Error fetching community users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Trade count, win rate and total P&L aren't stored as running totals
    // anywhere - they're derived here from each user's trade-type journal
    // entries (same source the rest of the app's stats use).
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile: any) => {
        const { data: trades } = await getSupabase()
          .from("journal_entries")
          .select("pnl")
          .eq("user_id", profile.user_id)
          .eq("type", "trade")

        const tradeList = trades || []
        const closedTrades = tradeList.filter((t: any) => typeof t.pnl === "number")
        const winningTrades = closedTrades.filter((t: any) => t.pnl > 0)
        const totalPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

        return {
          id: profile.user_id,
          name: profile.display_name || "Unknown",
          avatar: profile.avatar_url || null,
          email: profile.email || "",
          xp: profile.xp || 0,
          level: profile.level || 1,
          winRate,
          pnl: totalPnl,
          totalTrades: tradeList.length,
          joinedAt: profile.created_at,
        }
      }),
    )

    console.log(`[v0] Fetched ${usersWithStats.length} community users`)
    return NextResponse.json({ users: usersWithStats }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in community users endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
