import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Challenge IDs matching the mock challenges
const ALL_CHALLENGE_IDS = ["challenge-1", "challenge-2", "challenge-3", "challenge-4"]

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

    // If user has ZERO challenges in database, auto-enroll them
    if (count === 0) {
      console.log("[v0] GET - User has no challenges, auto-enrolling in all challenges...")
      
      const enrollmentData = ALL_CHALLENGE_IDS.map(challengeId => ({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        completed: false,
        joined_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabaseAdmin
        .from("user_challenge_progress")
        .insert(enrollmentData)

      if (insertError) {
        console.error("[v0] GET - Error auto-enrolling user:", insertError)
        return NextResponse.json({ progress: [] })
      }

      console.log("[v0] GET - Successfully auto-enrolled user in all challenges")
      
      const formattedData = enrollmentData.map(item => ({
        challengeId: item.challenge_id,
        progress: item.progress,
        completed: item.completed,
        joinedAt: item.joined_at,
      }))
      
      return NextResponse.json({ progress: formattedData })
    }

    // User already has challenges - return their actual progress
    console.log("[v0] GET - Returning existing challenge progress for user", userId)
    
    const progress = (data || []).map((item: any) => ({
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      completed: item.completed || false,
      joinedAt: item.joined_at || new Date().toISOString(),
    }))

    console.log("[v0] GET - Returning', progress.length, 'challenges with progress:", progress.map((p: any) => `${p.challengeId}:${p.progress}/${p.completed}`).join(", "))
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

    if (existing?.id) {
      // Update existing record - ALWAYS use the new values if provided
      console.log("[v0] POST - Updating existing record:", existing.id, "from progress", existing.progress, "to", progress)
      const { error } = await supabaseAdmin
        .from("user_challenge_progress")
        .update({
          progress: progress !== undefined ? progress : existing.progress,
          completed: completed !== undefined ? completed : existing.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)

      if (error) {
        console.error("[v0] POST - Failed to update challenge progress:", error)
        return NextResponse.json({ error: "Failed to update progress", details: error }, { status: 500 })
      }
      console.log("[v0] POST - Successfully updated record")
    } else {
      // Insert new record
      console.log("[v0] POST - Inserting new record for userId:", userId, "challengeId:", challengeId)
      const { error } = await supabaseAdmin
        .from("user_challenge_progress")
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress: progress || 0,
          completed: completed || false,
          joined_at: new Date().toISOString(),
        })

      if (error) {
        console.error("[v0] POST - Failed to insert challenge progress:", error)
        return NextResponse.json({ error: "Failed to save progress", details: error }, { status: 500 })
      }
      console.log("[v0] POST - Successfully inserted new record")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] POST - Error:", error)
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

    console.log("[v0] DELETE - Deleting challenge progress:", { userId, challengeId })

    const { error } = await supabaseAdmin
      .from("user_challenge_progress")
      .delete()
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)

    if (error) {
      console.error("[v0] DELETE - Failed to delete challenge progress:", error)
      return NextResponse.json({ error: "Failed to delete progress" }, { status: 500 })
    }

    console.log("[v0] DELETE - Successfully deleted")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] DELETE - Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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
    } else {
      // User has no challenges - auto-enroll them in all challenges
      console.log("[v0] GET - User has no challenges, auto-enrolling in all challenges...")
      
      const enrollmentData = ALL_CHALLENGE_IDS.map(challengeId => ({
        user_id: userId,
        challenge_id: challengeId,
        progress: 0,
        completed: false,
        joined_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabaseAdmin
        .from("user_challenge_progress")
        .insert(enrollmentData)

      if (insertError) {
        console.error("[v0] GET - Error auto-enrolling user:", insertError)
        // Return empty array if auto-enrollment fails, but don't error
        return NextResponse.json({ progress: [] })
      }

      console.log("[v0] GET - Successfully auto-enrolled user in all challenges")
      
      // Return the newly created data
      const formattedData = enrollmentData.map(item => ({
        challengeId: item.challenge_id,
        progress: item.progress,
        completed: item.completed,
        joinedAt: item.joined_at,
      }))
      
      return NextResponse.json({ progress: formattedData })
    }

    // Format the data
    const progress = (data || []).map((item: any) => ({
      challengeId: item.challenge_id,
      progress: item.progress || 0,
      completed: item.completed || false,
      joinedAt: item.joined_at || new Date().toISOString(),
    }))

    console.log("[v0] GET - Returning", progress.length, "formatted challenges")
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
