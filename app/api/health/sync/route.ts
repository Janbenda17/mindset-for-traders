import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseInstance
}

// Terra API webhook pro Apple Health sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Terra API pošle:
    // {
    //   user_id: "terra-user-id",
    //   data: {
    //     sleep: { duration_seconds: 28800, quality_score: 0.85 },
    //     date: "2026-04-11"
    //   }
    // }

    const terraUserId = body.user_id
    const sleepData = body.data?.sleep
    const date = body.data?.date

    if (!terraUserId || !sleepData || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find MindTrader user by terra_id
    const { data: user, error: userError } = await getSupabase()
      .from('users')
      .select('id')
      .eq('terra_id', terraUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found or not linked to Terra' },
        { status: 404 }
      )
    }

    // Convert sleep duration (seconds) to hours
    const sleepHours = sleepData.duration_seconds / 3600
    const sleepQuality = sleepData.quality_score || null

    // Store in health_sync table
    const { error: insertError } = await getSupabase()
      .from('health_sync')
      .insert({
        user_id: user.id,
        date: new Date(date).toISOString().split('T')[0],
        sleep_hours: sleepHours,
        sleep_quality: sleepQuality,
        data_source: 'apple_health',
        synced_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to store health data' },
        { status: 500 }
      )
    }

    // Trigger correlation analysis for this user
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze/correlations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, date })
    }).catch(err => console.error('Correlation trigger failed:', err))

    return NextResponse.json({
      success: true,
      message: 'Health data synced',
      sleepHours,
      sleepQuality
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
