import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Neplatný email" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: "Tento email je již na waitlistu",
        alreadyExists: true 
      }, { status: 409 })
    }

    // Generate unique discount code (5% off) - better random generation
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase()
    const discountCode = `EARLY5-${randomPart}`

    console.log("[v0] Generating discount code:", discountCode)

    // Add to waitlist
    const { data, error } = await supabase
      .from("waitlist")
      .insert({
        email: email.toLowerCase(),
        discount_code: discountCode,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Waitlist insert error:", error)
      return NextResponse.json({ success: false, error: "Chyba při přidání na waitlist" }, { status: 500 })
    }

    console.log("[v0] Waitlist - Email added:", email, "Code:", discountCode)

    return NextResponse.json({
      success: true,
      message: "Byl jsi přidán na waitlist!",
      discountCode,
      email: data.email,
    })
  } catch (error) {
    console.error("[v0] Waitlist error:", error)
    return NextResponse.json(
      { success: false, error: "Chyba na serveru" },
      { status: 500 }
    )
  }
}
