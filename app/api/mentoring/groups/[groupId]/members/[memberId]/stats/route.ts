import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { groupId: string; memberId: string } }
) {
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

    // Check if user is mentor of this group
    const { data: group } = await supabase
      .from("mentoring_groups")
      .select("mentor_id")
      .eq("id", params.groupId)
      .single()

    if (group?.mentor_id !== user.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get member trades for today
    const today = new Date().toISOString().split("T")[0]
    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", params.memberId)
      .eq("recorded_date", today)

    if (tradesError) throw tradesError

    // Calculate stats
    const winningTrades = trades?.filter((t: any) => (t.pnl || 0) > 0) || []
    const totalPnL = trades?.reduce((acc: number, t: any) => acc + (t.pnl || 0), 0) || 0
    const winRate = trades?.length ? (winningTrades.length / trades.length) * 100 : 0

    // Get member's sleep and other data from daily stages
    const { data: stage } = await supabase
      .from("daily_stages")
      .select("sleep_hours")
      .eq("user_id", params.memberId)
      .eq("stage_date", today)
      .single()

    const stats = {
      sleep_hours: stage?.sleep_hours || 0,
      trades_count: trades?.length || 0,
      win_rate: winRate,
      pnl: totalPnL,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[v0] Error fetching member stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch member stats" },
      { status: 500 }
    )
  }
}
