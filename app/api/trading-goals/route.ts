import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, goal } = body

    if (!userId || !goal) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "Missing userId or goal data" } },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("trading_goals")
      .insert({
        user_id: userId,
        title: goal.title,
        description: goal.description,
        goal_type: goal.goalType,
        category: goal.category,
        target_value: goal.targetValue,
        current_value: goal.currentValue || 0,
        unit: goal.unit,
        status: goal.status || "active",
        progress_percentage: goal.progressPercentage || 0,
        start_date: goal.startDate,
        target_date: goal.targetDate,
        notes: goal.notes,
        milestones: goal.milestones || [],
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error inserting goal:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Error in trading goals API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_USER_ID", message: "Missing userId" } },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("trading_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching goals:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (error: any) {
    console.error("[v0] Error in trading goals API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { userId, goalId, updates } = body

    if (!userId || !goalId || !updates) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "Missing required fields" } },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from("trading_goals")
      .update(updates)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error updating goal:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || null })
  } catch (error: any) {
    console.error("[v0] Error in trading goals API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}
