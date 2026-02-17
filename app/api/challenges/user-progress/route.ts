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
      console.log("[v0] GET /api/challenges/user-progress: Missing userId")
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    console.log("[v0] GET /api/challenges/user-progress: Fetching for user:", userId)

    // Get user's challenge progress from Supabase
    const { data, error } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Failed to fetch challenge progress:", error)
      return NextResponse.json({ progress: [] }, { status: 200 })
    }

    console.log("[v0] GET /api/challenges/user-progress: Found", data?.length || 0, "challenges for user", userId)

    // Format the data
    const progress = (data || []).map((item: any) => ({
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      completed: item.completed || false,
      joinedAt: item.joined_at || new Date().toISOString(),
    }))

    console.log("[v0] GET /api/challenges/user-progress: Returning progress:", progress)
    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[v0] Error in user-progress GET:", error)
    return NextResponse.json({ progress: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId, progress, completed } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Saving challenge progress:", { userId, challengeId, progress, completed })

    // Check if this challenge progress already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()

    if (checkError) {
      console.error("[v0] Error checking existing challenge:", checkError)
    }

    if (existing?.id) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from("user_challenge_progress")
        .update({
          progress: progress ?? existing.progress,
          completed: completed ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)

      if (error) {
        console.error("[v0] Failed to update challenge progress:", error)
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
      }
    } else {
      // Insert new record
      const { error } = await supabaseAdmin.from("user_challenge_progress").insert({
        user_id: userId,
        challenge_id: challengeId,
        progress: progress || 0,
        completed: completed || false,
        joined_at: new Date().toISOString(),
      })

      if (error) {
        console.error("[v0] Failed to insert challenge progress:", error)
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
      }
    }

    console.log("[v0] Successfully saved challenge progress:", { userId, challengeId })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in user-progress POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Deleting challenge progress:", { userId, challengeId })

    const { error } = await supabaseAdmin
      .from("user_challenge_progress")
      .delete()
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (error) {
      console.error("[v0] Failed to delete challenge progress:", error)
      return NextResponse.json({ error: "Failed to delete progress" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in user-progress DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
