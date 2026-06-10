import { createClient } from '@supabase/supabase-js'
import { terraClient } from '@/lib/integrations/terra'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-terra-signature') || ''

    // Verify webhook signature
    if (!terraClient.verifyWebhookSignature(body, signature)) {
      console.warn('[Terra Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    console.log('[Terra Webhook] Received event:', payload.type)

    // Handle different webhook types
    switch (payload.type) {
      case 'data.activity':
      case 'data.body':
      case 'data.sleep':
      case 'data.heart_rate':
      case 'data.mental_state':
        return await handleHealthDataSync(payload)

      case 'user.deauth':
        return await handleUserDeauth(payload)

      default:
        console.log('[Terra Webhook] Unknown event type:', payload.type)
        return NextResponse.json({ received: true })
    }
  } catch (err) {
    console.error('[Terra Webhook] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleHealthDataSync(payload: any) {
  try {
    const { user_id: terraUserId, data: healthData } = payload

    // Find user by terra_id (terra_id stored in profiles table)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('terra_id', terraUserId)
      .maybeSingle()

    if (profileError || !profile) {
      console.warn('[Terra Webhook] User not found for terra_id:', terraUserId)
      return NextResponse.json({ received: true })
    }

    const userId = profile.user_id

    // Prepare health sync data
    const syncData = {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      sleep_hours:
        healthData.sleep_duration_seconds &&
        Math.round(healthData.sleep_duration_seconds / 3600 * 10) / 10,
      sleep_start_time: healthData.sleep_start_time,
      sleep_end_time: healthData.sleep_end_time,
      heart_rate_avg: healthData.avg_heart_rate,
      heart_rate_max: healthData.max_heart_rate,
      heart_rate_min: healthData.min_heart_rate,
      heart_rate_variability: healthData.heart_rate_variability,
      steps: healthData.steps,
      calories_burned: healthData.calories,
      active_minutes: healthData.active_minutes,
      stress_level: healthData.stress_level,
      source: 'terra',
      synced_at: new Date().toISOString(),
    }

    // Upsert into health_sync table
    const { error: upsertError } = await supabase
      .from('health_sync')
      .upsert(syncData, {
        onConflict: 'user_id,date',
      })

    if (upsertError) {
      console.error('[Terra Webhook] Upsert error:', upsertError)
      return NextResponse.json({ received: true })
    }

    console.log('[Terra Webhook] Health data synced for user:', userId)

    // Update last_health_sync in profiles
    await supabase
      .from('profiles')
      .update({ last_health_sync: new Date().toISOString() })
      .eq('user_id', userId)

    // Broadcast real-time update to frontend
    supabase.channel(`health:${userId}`).send('broadcast', {
      event: 'health_updated',
      data: syncData,
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Terra Webhook] Health sync error:', err)
    return NextResponse.json({ received: true })
  }
}

async function handleUserDeauth(payload: any) {
  try {
    const { user_id: terraUserId } = payload

    // Find and update user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('terra_id', terraUserId)
      .maybeSingle()

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          terra_id: null,
          terra_reference_id: null,
          sleep_sync_enabled: false,
        })
        .eq('user_id', profile.user_id)

      console.log('[Terra Webhook] User deauthed:', profile.user_id)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Terra Webhook] Deauth error:', err)
    return NextResponse.json({ received: true })
  }
}
