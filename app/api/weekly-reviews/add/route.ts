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
      console.error("[v0] Unauthorized weekly review add attempt")
      return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
    }

    const body = await request.json()
    const { review } = body

    if (!review) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "Missing review data" } },
        { status: 400 },
      )
    }

    console.log("[v0] Adding weekly review for authenticated user:", user.id)

    const { data, error } = await supabase
      .from("weekly_reviews")
      .insert({
        user_id: user.id,
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
      .maybeSingle()

    if (error) {
      console.error("[v0] Error inserting weekly review:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    console.log("[v0] Weekly review inserted successfully with RLS protection")
    return NextResponse.json({ ok: true, data })
  } catch (error: any) {
    console.error("[v0] Error in weekly review API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
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
      return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start_date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching weekly reviews:", error)
      return NextResponse.json({ ok: false, error: { code: error.code, message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: data || [] })
  } catch (error: any) {
    console.error("[v0] Error in weekly review API:", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 })
  }
}
