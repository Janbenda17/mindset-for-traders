import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from profiles table with their stats
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select(`
        id, 
        email, 
        full_name, 
        avatar_url, 
        created_at, 
        xp, 
        level, 
        win_rate, 
        pnl
      `)
      .order("xp", { ascending: false })

    if (usersError) {
      console.error("[v0] Error fetching community users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Count trades for each user
    const usersWithStats = await Promise.all(
      users.map(async (user: any) => {
        const { count: tradeCount } = await supabase
          .from("journal_entries")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)

        return {
          id: user.id,
          name: user.full_name || "Unknown",
          avatar: user.avatar_url || null,
          email: user.email || "",
          xp: user.xp || 0,
          level: user.level || 1,
          winRate: user.win_rate || 0,
          pnl: user.pnl || 0,
          totalTrades: tradeCount || 0,
          joinedAt: user.created_at,
        }
      })
    )

    console.log(`[v0] Fetched ${usersWithStats.length} community users`)
    return NextResponse.json({ users: usersWithStats }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in community users endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
