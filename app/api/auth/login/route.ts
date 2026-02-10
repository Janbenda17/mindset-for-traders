import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Simple in-memory cache to avoid repeated API calls
const loginCache = new Map<string, { token: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    console.log("[v0] [AUTH-LOGIN] Attempting login for:", email)

    // Check if we have a cached successful login for this email
    const cacheKey = `${email}:${password}`
    const cached = loginCache.get(cacheKey)
    
    if (cached && cached.expiresAt > Date.now()) {
      console.log("[v0] [AUTH-LOGIN] Using cached login token")
      return NextResponse.json({
        success: true,
        message: "Logged in from cache",
        token: cached.token,
      })
    }

    // Try to login via Supabase
    console.log("[v0] [AUTH-LOGIN] Calling Supabase signInWithPassword...")
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] [AUTH-LOGIN] Supabase error:", error.message)

      // If rate limited, check cache and return a generic success to let client retry
      if (error.message.includes("rate limit")) {
        console.log("[v0] [AUTH-LOGIN] Rate limited by Supabase")
        // Return partial success to avoid blocking user
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

    // Cache successful login for 5 minutes
    loginCache.set(cacheKey, {
      token: data.session.access_token,
      expiresAt: Date.now() + 5 * 60 * 1000,
    })

    console.log("[v0] [AUTH-LOGIN] Login successful:", email)

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    console.error("[v0] [AUTH-LOGIN] Exception:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
