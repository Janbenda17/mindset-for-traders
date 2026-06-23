import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseInstance
}

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '')

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('sb-access-token')?.value
    if (!token) return null

    const verified = await jwtVerify(token, secret)
    return verified.payload.sub
  } catch {
    return null
  }
}

// GET daily trades summary
export async function GET(request: NextRequest) {
  const userId = await getUserFromToken(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 })
  }

  const { data: trades, error } = await getSupabase()
    .from('mt4_trades')
    .select('*')
    .eq('user_id', userId)
    .gte('closed_at', `${date}T00:00:00Z`)
    .lt('closed_at', `${date}T23:59:59Z`)
    .order('closed_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalPnL = trades?.reduce((sum, t) => sum + (t.profit_loss || 0), 0) || 0
  const winningTrades = trades?.filter((t) => t.profit_loss > 0).length || 0
  const winRate = trades && trades.length > 0 ? (winningTrades / trades.length) * 100 : 0

  return NextResponse.json({
    length: trades?.length || 0,
    trades: trades || [],
    totalPnL,
    winRate,
    winnersCount: winningTrades,
    losersCount: (trades?.length || 0) - winningTrades
  })
}
