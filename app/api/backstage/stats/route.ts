import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSessionToken, COOKIE_NAME } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

let supabaseInstance: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  return supabaseInstance
}

const RANGE_TO_MS: Record<string, number> = {
  today: 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  all: Number.POSITIVE_INFINITY,
}

// Pages that count as "reached pricing" for the conversion stat.
const PRICING_PATHS = new Set(['/pricing', '/upgrade'])

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const range = request.nextUrl.searchParams.get('range') || '7d'
  const windowMs = RANGE_TO_MS[range] ?? RANGE_TO_MS['7d']
  const since = Number.isFinite(windowMs) ? new Date(Date.now() - windowMs).toISOString() : null

  let query = getSupabase()
    .from('analytics_pageviews')
    .select('session_id, path, entered_at, duration_seconds')
    .neq('path', '/backstage') // exclude the admin's own visits to this dashboard
    .order('entered_at', { ascending: true })
    .limit(20000)

  if (since) query = query.gte('entered_at', since)

  const { data: rows, error } = await query

  if (error) {
    console.error('[v0] Failed to load analytics:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }

  const pageviews = rows || []

  const sessions = new Map<
    string,
    { first: number; last: number; totalDuration: number; paths: Set<string> }
  >()
  const byPath = new Map<string, { views: number; totalDuration: number }>()

  for (const row of pageviews) {
    const enteredAt = new Date(row.entered_at).getTime()
    const duration = row.duration_seconds || 0

    const session = sessions.get(row.session_id) || {
      first: enteredAt,
      last: enteredAt,
      totalDuration: 0,
      paths: new Set<string>(),
    }
    session.first = Math.min(session.first, enteredAt)
    session.last = Math.max(session.last, enteredAt + duration * 1000)
    session.totalDuration += duration
    session.paths.add(row.path)
    sessions.set(row.session_id, session)

    const pathStats = byPath.get(row.path) || { views: 0, totalDuration: 0 }
    pathStats.views += 1
    pathStats.totalDuration += duration
    byPath.set(row.path, pathStats)
  }

  const sessionList = Array.from(sessions.values())
  const totalSessions = sessionList.length
  const totalPageviews = pageviews.length
  const avgSessionSeconds =
    totalSessions > 0
      ? Math.round(
          sessionList.reduce(
            (sum, s) => sum + Math.max(s.totalDuration, (s.last - s.first) / 1000),
            0,
          ) / totalSessions,
        )
      : 0

  const sessionsToPricing = sessionList.filter((s) =>
    Array.from(s.paths).some((p) => PRICING_PATHS.has(p)),
  ).length
  const pricingConversionRate = totalSessions > 0 ? (sessionsToPricing / totalSessions) * 100 : 0

  const topPages = Array.from(byPath.entries())
    .map(([path, stats]) => ({
      path,
      views: stats.views,
      avgSeconds: stats.views > 0 ? Math.round(stats.totalDuration / stats.views) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 25)

  return NextResponse.json({
    range,
    totalSessions,
    totalPageviews,
    avgSessionSeconds,
    sessionsToPricing,
    pricingConversionRate: Math.round(pricingConversionRate * 10) / 10,
    topPages,
  })
}
