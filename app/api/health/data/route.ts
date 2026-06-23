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

// GET health data for specific date
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

  const { data, error } = await getSupabase()
    .from('health_sync')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('synced_at', { ascending: false })
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data?.[0] || null)
}
