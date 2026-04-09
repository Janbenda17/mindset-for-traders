import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    const { data: routine, error } = await supabase
      .from("trading_routines")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("date", today)
      .maybeSingle()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({ routine })
  } catch (error) {
    console.error("[v0] Error fetching routines:", error)
    return NextResponse.json(
      { error: "Failed to fetch routines" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )

  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const today = new Date().toISOString().split("T")[0]

    const { data: routine, error } = await supabase
      .from("trading_routines")
      .upsert(
        {
          user_id: user.user.id,
          date: today,
          pre_market_checklist: body.pre_market_checklist || [],
          pre_market_completed: body.pre_market_completed || false,
          pre_market_time: body.pre_market_time || null,
          post_market_checklist: body.post_market_checklist || [],
          post_market_completed: body.post_market_completed || false,
          post_market_time: body.post_market_time || null,
          trading_rules: body.trading_rules || [],
          max_trades_per_day: body.max_trades_per_day || null,
          max_loss_per_day: body.max_loss_per_day || null,
          daily_reflection: body.daily_reflection || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ routine })
  } catch (error) {
    console.error("[v0] Error saving routines:", error)
    return NextResponse.json(
      { error: "Failed to save routines" },
      { status: 500 }
    )
  }
}
