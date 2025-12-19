import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[v0] Creating Supabase profile for user:", userId)

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (existingProfile) {
      console.log("[v0] Profile already exists for user:", userId)
      return NextResponse.json({ data: existingProfile }, { status: 200 })
    }

    // Create new profile
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
      .single()

    if (error) {
      console.error("[v0] Error creating profile:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Profile created successfully for user:", userId)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// This API route is no longer needed as Supabase Auth triggers handle profile creation
