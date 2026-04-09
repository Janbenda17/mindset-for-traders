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

    const { data: rewards, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.user.id)
      .order("earned_date", { ascending: false })

    if (error) throw error

    return NextResponse.json({ rewards: rewards || [] })
  } catch (error) {
    console.error("[v0] Error fetching rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
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

    const { data: reward, error } = await supabase
      .from("rewards")
      .insert({
        user_id: user.user.id,
        title: body.title,
        description: body.description || null,
        reward_type: body.reward_type || "badge",
        icon: body.icon || null,
        badge_color: body.badge_color || null,
        points: body.points || 0,
        monetary_value: body.monetary_value || null,
        status: body.status || "unclaimed",
        condition_description: body.condition_description || null,
        condition_met: body.condition_met || false,
        earned_date: body.earned_date || new Date().toISOString().split("T")[0],
        claimed_date: body.claimed_date || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ reward })
  } catch (error) {
    console.error("[v0] Error creating reward:", error)
    return NextResponse.json(
      { error: "Failed to create reward" },
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

    const { data: reward, error } = await supabase
      .from("rewards")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ reward })
  } catch (error) {
    console.error("[v0] Error updating reward:", error)
    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 }
    )
  }
}
