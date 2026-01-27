import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie
    const response = await fetch("http://localhost:3000/api/auth/session", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    }).catch(() => null)

    if (!response?.ok) {
      // Try direct Supabase auth
      const authHeader = request.headers.get("authorization")
      if (!authHeader) {
        return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
      }

      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
      }

      // Get user profile with XP
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("xp, level")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("[v0] Error fetching profile:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      console.log("[v0] GET XP Profile - user:", user.id, "xp:", profile?.xp)

      return NextResponse.json({
        success: true,
        xp: profile?.xp || 0,
        level: profile?.level || 1,
      })
    }

    const sessionData = await response.json()
    if (!sessionData.user?.id) {
      return NextResponse.json({ success: false, error: "No session" }, { status: 401 })
    }

    // Get user profile with XP
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", sessionData.user.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching profile:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] GET XP Profile - user:", sessionData.user.id, "xp:", profile?.xp)

    return NextResponse.json({
      success: true,
      xp: profile?.xp || 0,
      level: profile?.level || 1,
    })
  } catch (error) {
    console.error("[v0] XP get-profile error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
