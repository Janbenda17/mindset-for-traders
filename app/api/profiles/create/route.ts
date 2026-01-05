import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_USER_ID", message: "User ID is required" } },
        { status: 400 },
      )
    }

    console.log("[v0] Creating Supabase profile for user:", userId)

    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle()

    if (existingProfile) {
      console.log("[v0] Profile already exists for user:", userId)
      return NextResponse.json({ ok: true, data: existingProfile }, { status: 200 })
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        name: name || "Trader",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error creating profile:", error.message)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    console.log("[v0] Profile created successfully for user:", userId)
    return NextResponse.json({ ok: true, data }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}
