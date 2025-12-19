export const dynamic = "force-dynamic"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
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

    // Return default stages for unauthenticated users
    if (!user) {
      return Response.json({
        current_stage: 1,
        morning_check_completed: false,
        daily_intention_completed: false,
        trading_plan_completed: false,
        record_trades_completed: false,
      })
    }

    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("daily_stages")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    // Only treat non-PGRST116 errors as real errors
    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching stages:", error.message)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return Response.json({
        current_stage: 1,
        morning_check_completed: false,
        daily_intention_completed: false,
        trading_plan_completed: false,
        record_trades_completed: false,
      })
    }

    return Response.json(data)
  } catch (error: any) {
    console.error("[v0] Unexpected error in stages GET:", error)
    return Response.json(
      {
        error: error.message || "Internal server error",
        current_stage: 1,
        morning_check_completed: false,
        daily_intention_completed: false,
        trading_plan_completed: false,
        record_trades_completed: false,
      },
      { status: 500 },
    )
  }
}
