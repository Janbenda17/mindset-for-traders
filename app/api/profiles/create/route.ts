import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Unauthorized profile creation attempt")
      return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
    }

    const body = await request.json()
    const { email, name } = body

    console.log("[v0] Creating Supabase profile for authenticated user:", user.id)

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (checkError) {
      console.error("[v0] Error checking existing profile:", checkError.message)
      return NextResponse.json(
        { ok: false, error: { code: checkError.code, message: checkError.message } },
        { status: 500 },
      )
    }

    if (existingProfile) {
      console.log("[v0] Profile already exists for user:", user.id)
      return NextResponse.json({ ok: true, data: existingProfile }, { status: 200 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        email: email || user.email,
        display_name: name || email?.split("@")[0] || "Trader",
        trading_mode: "virtual",
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error creating profile:", error.message)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    console.log("[v0] New user defaults to virtual mode (set in database)")
    return NextResponse.json({ ok: true, data }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}
