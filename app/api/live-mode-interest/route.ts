import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: "Neplatný email" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("[v0] Chybí Supabase config")
      return NextResponse.json(
        { error: "Server error" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if email already exists
    const { data: existing } = await supabase
      .from("live_mode_waitlist")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: "Už si zaregistrován na waitlist", email },
        { status: 200 }
      )
    }

    // Insert new email
    const { data, error } = await supabase
      .from("live_mode_waitlist")
      .insert({
        email,
        created_at: new Date(),
      })
      .select()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json(
        { error: "Chyba při ukládání" },
        { status: 500 }
      )
    }

    console.log("[v0] Email uložen do waitlistu:", email)
    return NextResponse.json(
      { message: "Díky! Brzy ti pošleme info o Live verzi", email },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json(
      { error: "Chyba serveru" },
      { status: 500 }
    )
  }
}
