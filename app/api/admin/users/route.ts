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
    // Check if user is admin
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all users from the profiles table.
    //
    // IMPORTANT: profiles' primary key is `user_id` - the table has no `id`
    // column at all (see scripts/001_create_users_and_profiles.sql).
    // Likewise `full_name` was never a profiles column (only `display_name`
    // is), and `xp`/`level`/`win_rate`/`pnl` were never columns on profiles
    // either - xp/level live on the separate `user_xp` table, and
    // win_rate/pnl aren't stored as running totals anywhere, they're
    // derived from journal_entries below. Selecting any of those
    // nonexistent columns made Postgres reject the entire query with
    // "column profiles.id does not exist", which is why this endpoint
    // 500'd on every request.
    const { data: profiles, error } = await getSupabase()
      .from("profiles")
      .select("user_id, email, display_name, role, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // xp/level live on their own table, keyed by the same user_id.
    const { data: xpRows } = await getSupabase().from("user_xp").select("user_id, xp, level")
    const xpByUser = new Map((xpRows || []).map((row: any) => [row.user_id, row]))

    // Win rate / P&L aren't stored as running totals anywhere - derive them
    // from each user's trade-type journal entries, same source the rest of
    // the app's stats use.
    const transformedUsers = await Promise.all(
      (profiles || []).map(async (user: any) => {
        const { data: trades } = await getSupabase()
          .from("journal_entries")
          .select("pnl")
          .eq("user_id", user.user_id)
          .eq("type", "trade")

        const closedTrades = (trades || []).filter((t: any) => typeof t.pnl === "number")
        const winningTrades = closedTrades.filter((t: any) => t.pnl > 0)
        const totalPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
        const xpInfo = xpByUser.get(user.user_id)

        return {
          id: user.user_id,
          email: user.email || "",
          name: user.display_name || "Unknown",
          avatar: user.avatar_url || null,
          role: user.role || "user",
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          xp: xpInfo?.xp || 0,
          level: xpInfo?.level || 1,
          winRate,
          pnl: totalPnl,
        }
      }),
    )

    console.log(`[v0] Fetched ${transformedUsers.length} users for admin panel`)
    return NextResponse.json({ users: transformedUsers }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in users endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
