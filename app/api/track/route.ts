import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// Public pageview beacon - sent by components/site-analytics-tracker.tsx via
// navigator.sendBeacon whenever a visitor leaves a page, carrying how long
// they spent on it. No auth (a visitor isn't logged in on the homepage), so
// input is treated as untrusted: lengths are clamped and types checked
// before writing.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.slice(0, 100) : null
    const path = typeof body?.path === 'string' ? body.path.slice(0, 500) : null
    const durationSeconds = Number.isFinite(body?.durationSeconds)
      ? Math.max(0, Math.min(3600, Math.round(body.durationSeconds)))
      : 0
    const referrer = typeof body?.referrer === 'string' ? body.referrer.slice(0, 500) : null

    if (!sessionId || !path) {
      return NextResponse.json({ error: 'Missing sessionId or path' }, { status: 400 })
    }

    const { error } = await getSupabase().from('analytics_pageviews').insert({
      session_id: sessionId,
      path,
      duration_seconds: durationSeconds,
      referrer,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) || null,
    })

    if (error) {
      console.error('[v0] Failed to record pageview:', error)
      return NextResponse.json({ error: 'Failed to record' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in track endpoint:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
