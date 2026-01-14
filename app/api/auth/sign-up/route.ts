import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      console.error("[v0] Signup error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 400 })
    }

    console.log("[v0] User registered successfully:", data.user.id)

    let profile = null
    let attempts = 0
    const maxAttempts = 10

    while (!profile && attempts < maxAttempts) {
      attempts++
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle()

      if (profileData) {
        profile = profileData
        console.log("[v0] Profile created by trigger:", profile)
        break
      }
    }

    if (!profile) {
      console.error("[v0] Profile not created after", maxAttempts, "attempts")
      return NextResponse.json({ error: "Profile creation failed" }, { status: 500 })
    }

    const response = NextResponse.json(
      {
        user: data.user,
        session: data.session,
        message: "Account created successfully",
      },
      { status: 200 },
    )

    // Copy auth cookies if session exists
    if (data.session) {
      const supabaseResponse = await supabase.auth.setSession(data.session)
      if (supabaseResponse.data.session) {
        const cookiesList = supabaseResponse.data.session ? Object.entries(request.cookies.getAll()) : []
        cookiesList.forEach(([name, cookie]) => {
          if (typeof cookie === "object" && "value" in cookie) {
            response.cookies.set(name, cookie.value, cookie)
          }
        })
      }
    }

    return response
  } catch (error) {
    console.error("[v0] Signup API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
