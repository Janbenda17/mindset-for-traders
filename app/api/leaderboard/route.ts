import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from profiles table sorted by XP (descending)
    const { data: allProfiles, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url, xp, level")
      .not("xp", "is", null)
      .order("xp", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching leaderboard:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    if (!allProfiles || allProfiles.length === 0) {
      console.log("[v0] No profiles found for leaderboard")
      return NextResponse.json({ leaderboard: [] }, { status: 200 })
    }

    // Map to leaderboard format with ranking
    const leaderboard = allProfiles.map((profile, index) => ({
      rank: index + 1,
      name: profile?.display_name || profile?.username || `Trader ${index + 1}`,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
      avatar: profile?.avatar_url || "/trader-avatar.png",
      userId: profile?.user_id,
      discipline: 0,
      streak: 0,
      pnl: 0,
    }))

    console.log(`[v0] Loaded ${leaderboard.length} traders for leaderboard`)
    return NextResponse.json({ leaderboard }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in leaderboard endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
