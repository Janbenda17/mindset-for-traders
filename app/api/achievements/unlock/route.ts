import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const { userId, achievementId, title } = await req.json()

    if (!userId || !achievementId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, message: "Already unlocked" }, { status: 200 })
    }

    // Insert new achievement
    const { error } = await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Failed to unlock achievement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] Achievement unlocked: ${achievementId} for user ${userId}`)

    return NextResponse.json({ success: true, achievement: achievementId }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in achievements/unlock:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
