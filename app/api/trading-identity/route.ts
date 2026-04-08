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

    const { data: identity, error } = await supabase
      .from("trading_identity")
      .select("*")
      .eq("user_id", user.user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({ identity })
  } catch (error) {
    console.error("[v0] Error fetching trading identity:", error)
    return NextResponse.json(
      { error: "Failed to fetch trading identity" },
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

    // Get current version
    const { data: currentIdentity } = await supabase
      .from("trading_identity")
      .select("version")
      .eq("user_id", user.user.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersion = (currentIdentity?.version || 0) + 1

    const { data: identity, error } = await supabase
      .from("trading_identity")
      .insert({
        user_id: user.user.id,
        version: nextVersion,
        trading_style: body.trading_style || null,
        primary_strategy: body.primary_strategy || null,
        secondary_strategies: body.secondary_strategies || [],
        risk_tolerance: body.risk_tolerance || null,
        preferred_timeframes: body.preferred_timeframes || [],
        preferred_markets: body.preferred_markets || [],
        preferred_instruments: body.preferred_instruments || [],
        personality_type: body.personality_type || null,
        why_trade: body.why_trade || null,
        core_beliefs: body.core_beliefs || [],
        strengths: body.strengths || [],
        weaknesses: body.weaknesses || [],
        edge_description: body.edge_description || null,
        success_definition: body.success_definition || null,
        long_term_vision: body.long_term_vision || null,
        trading_rules: body.trading_rules || [],
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ identity })
  } catch (error) {
    console.error("[v0] Error saving trading identity:", error)
    return NextResponse.json(
      { error: "Failed to save trading identity" },
      { status: 500 }
    )
  }
}
