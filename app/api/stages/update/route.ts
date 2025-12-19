import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { stage, completed } = await request.json()

  if (!stage || typeof completed !== "boolean") {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const today = new Date().toISOString().split("T")[0]
  const timestamp = new Date().toISOString()

  const updateData: Record<string, any> = {}

  if (stage === 1) {
    updateData.morning_check_completed = completed
    if (completed) updateData.morning_check_completed_at = timestamp
  } else if (stage === 2) {
    updateData.daily_intention_completed = completed
    if (completed) updateData.daily_intention_completed_at = timestamp
  } else if (stage === 3) {
    updateData.trading_plan_completed = completed
    if (completed) updateData.trading_plan_completed_at = timestamp
  } else if (stage === 4) {
    updateData.record_trades_completed = completed
    if (completed) updateData.record_trades_completed_at = timestamp
  }

  if (completed && stage < 4) {
    updateData.current_stage = stage + 1
  }

  const { data, error } = await supabase
    .from("daily_stages")
    .update(updateData)
    .eq("user_id", user.id)
    .eq("date", today)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating stages:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
