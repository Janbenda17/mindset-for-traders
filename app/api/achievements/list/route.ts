import { createClient } from "@supabase/supabase-js"

import { NextRequest, NextResponse } from "next/server"

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

export async function GET(req: NextRequest) {
  try {
    // Get user from cookie/session
    const cookieHeader = req.headers.get("cookie")
    const userIdMatch = cookieHeader?.match(/mt_user_id=([^;]+)/)
    const userId = userIdMatch?.[1]

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all achievements for this user
    const { data, error } = await getSupabase()
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Failed to load achievements:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const achievementIds = data?.map((row: any) => row.achievement_id) || []

    console.log(`[v0] Loaded ${achievementIds.length} achievements for user ${userId}`)

    return NextResponse.json({ success: true, achievements: achievementIds }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in achievements/list:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
