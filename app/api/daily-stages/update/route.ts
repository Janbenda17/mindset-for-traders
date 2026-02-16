import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { stageId, completed } = body

    const today = new Date().toISOString().split("T")[0]
    const completedAt = completed ? new Date().toISOString() : null

    const stageColumns: { [key: number]: { completed: string; completedAt: string } } = {
      1: { completed: "morning_check_completed", completedAt: "morning_check_completed_at" },
      2: { completed: "daily_intention_completed", completedAt: "daily_intention_completed_at" },
      3: { completed: "trading_plan_completed", completedAt: "trading_plan_completed_at" },
      4: { completed: "record_trades_completed", completedAt: "record_trades_completed_at" },
      5: { completed: "daily_summary_completed", completedAt: "daily_summary_completed_at" },
    }

    const stageColumn = stageColumns[stageId]
    if (!stageColumn) {
      return NextResponse.json({ error: "Invalid stage ID" }, { status: 400 })
    }

    const nextStage = completed ? Math.min(stageId + 1, 5) : stageId

    // First, get existing record to preserve all other stage completion data
    const { data: existingRecord } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    // Build update object preserving all existing stage data
    const updateData: any = {
      user_id: user.id,
      date: today,
      current_stage: nextStage,
      updated_at: new Date().toISOString(),
    }

    // Preserve existing stage completion data
    if (existingRecord) {
      updateData.morning_check_completed = existingRecord.morning_check_completed
      updateData.morning_check_completed_at = existingRecord.morning_check_completed_at
      updateData.daily_intention_completed = existingRecord.daily_intention_completed
      updateData.daily_intention_completed_at = existingRecord.daily_intention_completed_at
      updateData.trading_plan_completed = existingRecord.trading_plan_completed
      updateData.trading_plan_completed_at = existingRecord.trading_plan_completed_at
      updateData.record_trades_completed = existingRecord.record_trades_completed
      updateData.record_trades_completed_at = existingRecord.record_trades_completed_at
      updateData.daily_summary_completed = existingRecord.daily_summary_completed
      updateData.daily_summary_completed_at = existingRecord.daily_summary_completed_at
    }

    // Now update the specific stage being completed
    updateData[stageColumn.completed] = completed
    updateData[stageColumn.completedAt] = completedAt

    const { data, error } = await supabase
      .from("daily_stages")
      .upsert(updateData, {
        onConflict: "user_id,date",
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error updating daily stage:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] Stage ${stageId} ${completed ? "completed" : "uncompleted"} - next stage: ${nextStage}`)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error in daily-stages UPDATE:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
