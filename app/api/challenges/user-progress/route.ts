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
      console.log("[v0] GET - Missing userId parameter")
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    console.log("[v0] GET - Fetching challenges for user:", userId)

    // Get user's challenge progress from Supabase using admin client
    const { data, error } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] GET - Database query error:", error)
      return NextResponse.json({ error: "Failed to fetch", details: error }, { status: 500 })
    }

    const count = data?.length || 0
    console.log("[v0] GET - Found", count, "challenges for user", userId)

    if (count > 0) {
      console.log("[v0] GET - Raw data:", JSON.stringify(data))
    }

    // Format the data
    const progress = (data || []).map((item: any) => ({
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      completed: item.completed || false,
      joinedAt: item.joined_at || new Date().toISOString(),
    }))

    console.log("[v0] GET - Returning', progress.length, 'formatted challenges')
    return NextResponse.json({ progress })
  } catch (error) {
    console.error("[v0] GET - Error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId, progress, completed } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] POST - Saving challenge progress:", { userId, challengeId, progress, completed })

    // Check if this challenge progress already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("user_challenge_progress")
      .select("id, progress, completed")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()

    console.log("[v0] POST - Existing record check:", { exists: !!existing, checkError })

    if (existing?.id) {
      // Update existing record
      console.log("[v0] POST - Updating existing record:", existing.id)
      const { error, data } = await supabaseAdmin
        .from("user_challenge_progress")
        .update({
          progress: progress !== undefined ? progress : existing.progress,
          completed: completed !== undefined ? completed : existing.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .select()

      if (error) {
        console.error("[v0] POST - Failed to update challenge progress:", error)
        return NextResponse.json({ error: "Failed to update progress", details: error }, { status: 500 })
      }
      console.log("[v0] POST - Successfully updated:", data)
    } else {
      // Insert new record
      console.log("[v0] POST - Inserting new record for userId:", userId, "challengeId:", challengeId)
      const { error, data } = await supabaseAdmin
        .from("user_challenge_progress")
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress: progress || 0,
          completed: completed || false,
          joined_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("[v0] POST - Failed to insert challenge progress:", error)
        return NextResponse.json({ error: "Failed to save progress", details: error }, { status: 500 })
      }
      console.log("[v0] POST - Successfully inserted:", data)
    }

    console.log("[v0] POST - Challenge progress saved successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in user-progress POST:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
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
