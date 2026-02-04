import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json() // "morning_check" or "record_trade"
    
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log(`[v0] Marking ${type} as completed for user ${user.id}`)

    const today = new Date().toISOString().split('T')[0]

    // Get or create today's daily stage
    const { data: dailyStage, error: fetchError } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!dailyStage) {
      console.log("[v0] No daily stage found for today")
      return NextResponse.json({ success: false, message: "No daily stage found" })
    }

    // Update completed flags
    const updates: any = {}
    if (type === "morning_check") {
      updates.morning_check_completed = true
    } else if (type === "record_trade") {
      updates.record_trade_completed = true
    }

    const { error: updateError } = await supabase
      .from("daily_stages")
      .update(updates)
      .eq("id", dailyStage.id)

    if (updateError) throw updateError

    console.log(`[v0] ✓ Marked ${type} as completed`)

    return NextResponse.json({
      success: true,
      message: `${type} marked as completed`,
      stageName: dailyStage.stage_name,
    })
  } catch (error) {
    console.error("[v0] Error marking as completed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
