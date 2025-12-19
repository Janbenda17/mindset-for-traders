import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, review } = body

    if (!userId || !review) {
      return NextResponse.json({ error: "Missing userId or review data" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("weekly_reviews")
      .insert({
        user_id: userId,
        week_start_date: review.weekStartDate,
        week_end_date: review.weekEndDate,
        total_trades: review.totalTrades || 0,
        winning_trades: review.winningTrades || 0,
        losing_trades: review.losingTrades || 0,
        win_rate: review.winRate || 0,
        total_pnl: review.totalPnL || 0,
        highlights: review.highlights,
        challenges: review.challenges,
        lessons_learned: review.lessonsLearned,
        improvements_needed: review.improvementsNeeded,
        goals_for_next_week: review.goalsForNextWeek,
        emotional_consistency: review.emotionalConsistency,
        discipline_rating: review.disciplineRating,
        stress_management: review.stressManagement,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error inserting weekly review:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[v0] Error in weekly review API:", error)
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
      .from("weekly_reviews")
      .select("*")
      .eq("user_id", userId)
      .order("week_start_date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching weekly reviews:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error("[v0] Error in weekly review API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
