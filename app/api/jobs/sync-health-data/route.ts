import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Daily sync of health data from Terra API
export async function POST(request: NextRequest) {
  try {
    // Verify API key (to prevent unauthorized calls)
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with Terra integration enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, terra_id, terra_reference_id')
      .eq('sleep_sync_enabled', true)
      .not('terra_id', 'is', null)

    if (usersError) throw usersError

    let synced = 0
    let errors = 0

    for (const user of users || []) {
      try {
        // Get sleep data from Terra API for this user
        const sleepResponse = await fetch(
          `https://www.terraapi.com/api/v1/sleep?reference_id=${user.terra_reference_id}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.TERRA_API_KEY}`,
            },
          }
        )

        if (!sleepResponse.ok) {
          console.error('[v0] Terra API error for user', user.user_id, sleepResponse.status)
          errors++
          continue
        }

        const sleepData = await sleepResponse.json()
        const latestSleep = sleepData.data?.[0]

        if (latestSleep) {
          const date = new Date(latestSleep.start_time).toISOString().split('T')[0]

          // Check if already synced today
          const { data: existing } = await supabase
            .from('health_sync')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('date', date)
            .single()

          if (!existing) {
            // Insert new health data
            const { error: insertError } = await supabase
              .from('health_sync')
              .insert({
                user_id: user.user_id,
                date,
                sleep_hours: latestSleep.duration_seconds / 3600,
                sleep_start_time: latestSleep.start_time,
                sleep_end_time: latestSleep.end_time,
                heart_rate_avg: latestSleep.avg_hr || 0,
                heart_rate_min: latestSleep.min_hr || 0,
                heart_rate_max: latestSleep.max_hr || 0,
                sleep_quality: latestSleep.confidence_level / 100,
                source: 'terra_api',
                synced_at: new Date().toISOString(),
              })

            if (insertError) {
              console.error('[v0] Insert error for user', user.user_id, insertError)
              errors++
            } else {
              synced++
              
              // Trigger correlation analysis for this user
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze/correlations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.user_id,
                  date,
                }),
              }).catch(err => console.error('[v0] Correlation trigger failed:', err))
            }
          }
        }
      } catch (err) {
        console.error('[v0] Sync error for user', user.user_id, err)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      total: users?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Health sync job error:', error)
    return NextResponse.json(
      { error: 'Sync job failed' },
      { status: 500 }
    )
  }
}
