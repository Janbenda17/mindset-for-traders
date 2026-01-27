import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is in VIRTUAL mode
    const { data: profile } = await supabase
      .from("profiles")
      .select("trading_mode")
      .eq("user_id", user.id)
      .maybeSingle()

    const isVirtualMode = profile?.trading_mode === "virtual"

    const today = new Date().toISOString().split("T")[0]

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

    if (!existingStages) {
      // Demo data for VIRTUAL mode - with stage 5 unlocked
      if (isVirtualMode) {
        return NextResponse.json({
          current_stage: 1,
          morning_check_completed: true,
          morning_check_completed_at: new Date(Date.now() - 3600000).toISOString(),
          daily_intention_completed: true,
          daily_intention_completed_at: new Date(Date.now() - 2400000).toISOString(),
          trading_plan_completed: true,
          trading_plan_completed_at: new Date(Date.now() - 1800000).toISOString(),
          record_trades_completed: true,
          record_trades_completed_at: new Date(Date.now() - 600000).toISOString(),
          daily_summary_completed: false,
          completedToday: ["morning_check", "daily_intention", "trading_plan", "record_trade"],
        })
      }

      return NextResponse.json({
        current_stage: 1,
        morning_check_completed: false,
        daily_intention_completed: false,
        trading_plan_completed: false,
        record_trades_completed: false,
        completedToday: [],
      })
    }

    // Map completion status to array for easier checking
    const completedToday = []
    if (existingStages.morning_check_completed) completedToday.push("morning_check")
    if (existingStages.daily_intention_completed) completedToday.push("daily_intention")
    if (existingStages.trading_plan_completed) completedToday.push("trading_plan")
    if (existingStages.record_trades_completed) completedToday.push("record_trade")
    if (existingStages.daily_summary_completed) completedToday.push("daily_summary")

    return NextResponse.json({
      ...existingStages,
      completedToday,
    })
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request aborted" }, { status: 499 })
    }
    console.error("[v0] Unexpected error in daily-stages GET:", error.message)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
