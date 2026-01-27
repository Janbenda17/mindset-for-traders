import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { story, title } = await request.json()

    if (!story || story.length < 50) {
      return NextResponse.json({ error: "Story must be at least 50 characters" }, { status: 400 })
    }

    // Check if user already submitted success story
    const { data: profile } = await supabase
      .from("profiles")
      .select("success_story_claimed")
      .eq("user_id", user.id)
      .single()

    if (profile?.success_story_claimed) {
      return NextResponse.json({ 
        error: "You have already submitted your success story",
        alreadyClaimed: true 
      }, { status: 400 })
    }

    // Award 50 XP for success story
    const xpResponse = await fetch(`${request.nextUrl.origin}/api/xp/award`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ 
        action: "success_story",
        metadata: { title, storyLength: story.length }
      }),
    })

    const xpData = await xpResponse.json()

    if (!xpData.success) {
      return NextResponse.json({ 
        error: xpData.error || "Failed to award XP",
        alreadyClaimed: xpData.alreadyClaimed
      }, { status: 400 })
    }

    console.log("[v0] Success story submitted, XP awarded:", xpData.xpAwarded)

    return NextResponse.json({
      success: true,
      xpAwarded: xpData.xpAwarded,
      totalXP: xpData.totalXP,
      level: xpData.level,
      message: "Success story submitted! You earned 50 XP!",
    })
  } catch (error) {
    console.error("[v0] Success story submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit success story", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
