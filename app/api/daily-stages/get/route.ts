import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        current_stage: 1,
        morning_check_completed: false,
        daily_intention_completed: false,
        trading_plan_completed: false,
        record_trades_completed: false,
      })
    }

    const today = new Date().toISOString().split("T")[0]

    // Try to get today's stages
    const { data: existingStages, error: fetchError } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    if (fetchError) {
      console.error("[v0] Error fetching daily stages:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // If no stages for today, create new record
    if (!existingStages) {
      const { data: newStages, error: insertError } = await supabase
        .from("daily_stages")
        .insert({
          user_id: user.id,
          date: today,
          current_stage: 1,
          morning_check_completed: false,
          daily_intention_completed: false,
          trading_plan_completed: false,
          record_trades_completed: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error creating daily stages:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json(newStages)
    }

    return NextResponse.json(existingStages)
  } catch (error: any) {
    console.error("[v0] Error in daily-stages GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
