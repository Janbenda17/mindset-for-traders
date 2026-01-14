import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Unauthorized fail log add attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { entry } = body

    if (!entry) {
      return NextResponse.json({ error: "Missing entry data" }, { status: 400 })
    }

    console.log("[v0] Adding fail log entry for authenticated user:", user.id)

    const { data, error } = await supabase
      .from("fail_log")
      .insert({
        user_id: user.id,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        severity: entry.severity || 5,
        financial_impact: entry.financialImpact || 0,
        emotional_impact: entry.emotionalImpact,
        date: entry.date,
        trade_id: entry.tradeId,
        market_conditions: entry.marketConditions,
        root_cause: entry.rootCause,
        lesson_learned: entry.lessonLearned,
        action_plan: entry.actionPlan,
        prevented_next_time: entry.preventedNextTime || false,
        tags: entry.tags || [],
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error inserting fail log entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Fail log entry inserted successfully with RLS protection")
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Error in fail log API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("fail_log")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching fail log entries:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error("[v0] Error in fail log API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
