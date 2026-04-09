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

    const { data: mistakes, error } = await supabase
      .from("fail_log")
      .select("*")
      .eq("user_id", user.user.id)
      .order("date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ mistakes: mistakes || [] })
  } catch (error) {
    console.error("[v0] Error fetching mistakes:", error)
    return NextResponse.json(
      { error: "Failed to fetch mistakes" },
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

    const { data: mistake, error } = await supabase
      .from("fail_log")
      .insert({
        user_id: user.user.id,
        date: body.date || new Date().toISOString().split("T")[0],
        title: body.title,
        description: body.description || null,
        category: body.category || "other",
        root_cause: body.root_cause || null,
        lesson_learned: body.lesson_learned || null,
        action_plan: body.action_plan || null,
        market_conditions: body.market_conditions || null,
        tags: body.tags || [],
        trade_id: body.trade_id || null,
        emotional_impact: body.emotional_impact || null,
        financial_impact: body.financial_impact || null,
        severity: body.severity || null,
        prevented_next_time: body.prevented_next_time || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ mistake })
  } catch (error) {
    console.error("[v0] Error saving mistake:", error)
    return NextResponse.json(
      { error: "Failed to save mistake" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
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

    const { id, ...updates } = await request.json()

    const { data: mistake, error } = await supabase
      .from("fail_log")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ mistake })
  } catch (error) {
    console.error("[v0] Error updating mistake:", error)
    return NextResponse.json(
      { error: "Failed to update mistake" },
      { status: 500 }
    )
  }
}
