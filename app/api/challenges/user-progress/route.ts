import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Get user's challenge progress from Supabase
    const { data, error } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Failed to fetch challenge progress:", error)
      return NextResponse.json({ progress: [] }, { status: 200 })
    }

    // Format the data
    const progress = data.map((item: any) => ({
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      completed: item.completed || false,
      joinedAt: item.joined_at || new Date().toISOString(),
    }))

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[v0] Error in user-progress GET:", error)
    return NextResponse.json({ progress: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, progress } = await req.json()

    if (!userId || !progress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Clear existing progress for this user
    await supabaseAdmin.from("user_challenge_progress").delete().eq("user_id", userId)

    // Insert new progress entries
    const entries = progress.map((p: any) => ({
      user_id: userId,
      challenge_id: p.challengeId,
      progress: p.progress || 0,
      completed: p.completed || false,
      joined_at: p.joinedAt || new Date().toISOString(),
    }))

    if (entries.length > 0) {
      const { error } = await supabaseAdmin.from("user_challenge_progress").insert(entries)

      if (error) {
        console.error("[v0] Failed to save challenge progress:", error)
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in user-progress POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
