import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] GET XP Profile - No authenticated user")
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] GET XP Profile - Fetching XP for user:", user.id)

    // Get user profile with XP
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching profile XP:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] GET XP Profile - Retrieved XP:", { userId: user.id, xp: profile?.xp, level: profile?.level })

    return NextResponse.json({
      success: true,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
    })
  } catch (error) {
    console.error("[v0] GET XP Profile error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
