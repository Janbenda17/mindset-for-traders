import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import VitalClient from '@/lib/integrations/vital'

/**
 * POST /api/webhooks/vital
 * Receives health data from Vital webhook
 * Stores sleep, heart rate, stress, activity into health_sync table
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-vital-signature') || ''

    // Verify webhook signature
    const vital = new VitalClient()
    let payload

    try {
      payload = vital.parseWebhook(body, signature)
    } catch (error) {
      console.error('[v0] Webhook verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 },
      )
    }

    // Create Supabase client for server action
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          },
        },
      },
    )

    // Extract health metrics from Vital payload
    const vitalUserId = payload.user_id
    const event = payload.event
    const data = payload.data

    console.log(
      `[v0] Vital webhook received: event=${event}, user_id=${vitalUserId}`,
    )

    // Get user_id from database using vital_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('vital_id', vitalUserId)
      .single()

    if (profileError || !profile) {
      console.error('[v0] Profile not found for vital_id:', vitalUserId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      )
    }

    const userId = profile.id
    const today = new Date().toISOString().split('T')[0]

    // Prepare health data for upsert
    const healthData: Record<string, any> = {
      user_id: userId,
      date: today,
    }

    // Map Vital data to our schema
    if (data.sleep) {
      healthData.sleep_hours = data.sleep.total_sleep_duration / 3600
      healthData.sleep_start_time = data.sleep.sleep_start_time
      healthData.sleep_end_time = data.sleep.sleep_end_time
      healthData.sleep_efficiency = data.sleep.sleep_efficiency || null
    }

    if (data.heart_rate) {
      healthData.heart_rate_avg = data.heart_rate.average
      healthData.heart_rate_min = data.heart_rate.min
      healthData.heart_rate_max = data.heart_rate.max
    }

    if (data.heart_rate_variability) {
      healthData.heart_rate_variability = data.heart_rate_variability.average
    }

    if (data.activity) {
      healthData.steps = data.activity.steps
      healthData.active_minutes = data.activity.active_duration / 60
      healthData.calories_burned = data.activity.calories_active
    }

    if (data.stress) {
      healthData.stress_level = data.stress.average
    }

    if (data.body?.temperature) {
      healthData.body_temperature = data.body.temperature
    }

    healthData.source = 'vital'
    healthData.synced_at = new Date().toISOString()

    // Upsert into health_sync (merge today's data)
    const { data: inserted, error: insertError } = await supabase
      .from('health_sync')
      .upsert(
        {
          ...healthData,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date', // Unique constraint
        },
      )
      .select()

    if (insertError) {
      console.error('[v0] Failed to insert health data:', insertError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 },
      )
    }

    console.log('[v0] Health data synced for user:', userId)

    // Notify real-time subscribers
    // (Supabase real-time will automatically broadcast changes)

    return NextResponse.json(
      {
        success: true,
        message: 'Health data synced',
        data: inserted,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[v0] Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
