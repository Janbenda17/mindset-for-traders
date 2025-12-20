import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { check, userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[v0] Adding morning check for user:", userId)

    const { data, error } = await supabase
      .from("morning_checks")
      .insert({
        user_id: userId,
        date: check.date || new Date().toISOString().split("T")[0],
        sleep_quality: Number(check.sleepQuality) || 0,
        sleep_hours: Number(check.sleepHours) || 0,
        energy_level: Number(check.energyLevel) || 0,
        stress_level: Number(check.stressLevel) || 0,
        focus: Number(check.focus) || 0,
        physical_health: Number(check.physicalHealth) || 0,
        emotional_state: Number(check.emotionalState) || 0,
        exercised: check.exercised === true || check.exercised === "true",
        meditation: Number(check.meditationTime) || 0,
        morning_routine: check.morningRoutine === true || check.morningRoutine === "true",
        hydration: Number(check.hydration) || 0,
        locked: check.locked === true || check.locked === "true",
        score: Number(check.score) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error inserting morning check:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Morning check inserted successfully")
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
