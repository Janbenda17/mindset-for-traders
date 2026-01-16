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
      return NextResponse.json({
        current_stage: 1,
        morning_check_completed: false,
        daily_intention_completed: false,
        trading_plan_completed: false,
        record_trades_completed: false,
      })
    }

    return NextResponse.json(existingStages)
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request aborted" }, { status: 499 })
    }
    console.error("[v0] Unexpected error in daily-stages GET:", error.message)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
