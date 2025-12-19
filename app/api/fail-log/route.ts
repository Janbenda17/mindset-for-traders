import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, entry } = body

    if (!userId || !entry) {
      return NextResponse.json({ error: "Missing userId or entry data" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("fail_log")
      .insert({
        user_id: userId,
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

    if (error) {
      console.error("[v0] Error inserting fail log entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data?.[0] })
  } catch (error: any) {
    console.error("[v0] Error in fail log API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("fail_log")
      .select("*")
      .eq("user_id", userId)
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
