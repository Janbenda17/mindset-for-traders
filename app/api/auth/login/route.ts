import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    console.log("[v0] [AUTH-LOGIN] Attempting login for:", email)

    // Use server Supabase client which handles session cookies
    const supabase = await createClient()

    console.log("[v0] [AUTH-LOGIN] Calling Supabase signInWithPassword...")
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] [AUTH-LOGIN] Supabase error:", error.message)

      // If rate limited, return rate limit error
      if (error.message.includes("rate limit")) {
        console.log("[v0] [AUTH-LOGIN] Rate limited by Supabase")
        return NextResponse.json(
          { error: "Too many requests, please try again in a moment" },
          { status: 429 },
        )
      }

      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 })
    }

    console.log("[v0] [AUTH-LOGIN] Login successful:", email)

    // Create response with session data
    const response = NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })

    // Set session cookie so subsequent API calls work
    response.cookies.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: data.session.expires_in,
    })

    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return response
  } catch (error) {
    console.error("[v0] [AUTH-LOGIN] Exception:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
