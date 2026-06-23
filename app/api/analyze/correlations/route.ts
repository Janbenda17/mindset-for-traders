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

interface FatigueAnalysis {
  hasFatigue: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number
  sleepHours: number
  factors: string[]
  recommendations: string[]
}

async function analyzeFatigueError(
  userId: string,
  date: string,
  profitLoss: number
): Promise<FatigueAnalysis> {
  // Get health data for this date
  const { data: healthData } = await getSupabase()
    .from('health_sync')
    .select('sleep_hours, sleep_start_time, sleep_end_time, heart_rate_variability')
    .eq('user_id', userId)
    .eq('date', date)
    .order('synced_at', { ascending: false })
    .limit(1)

  const sleepHours = healthData?.sleep_hours || 0
  const heartRateVariability = healthData?.heart_rate_variability || 0

  let score = 0
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  const factors: string[] = []
  const recommendations: string[] = []
  let hasFatigue = false

  // Rule 1: Sleep < 6 hours = HIGH FATIGUE
  if (sleepHours < 6) {
    hasFatigue = true
    score += 50
    severity = 'high'
    factors.push(`Only ${sleepHours}h sleep (critical: <6h)`)
    recommendations.push('Your sleep is critically low. Consider not trading today.')
  } else if (sleepHours < 7) {
    score += 30
    severity = 'medium'
    factors.push(`Suboptimal sleep: ${sleepHours}h (target: 7-9h)`)
    recommendations.push('Your sleep is below optimal. Trade with caution.')
  }

  // Rule 2: Loss + Low Sleep = FATIGUE ERROR
  if (sleepHours < 6 && profitLoss < 0) {
    hasFatigue = true
    score += 40
    factors.push(`Loss during fatigue: $${profitLoss}`)
    recommendations.push('This loss is likely due to impaired decision-making from fatigue.')
    recommendations.push('Review the trade - was it aligned with your plan?')
    
    if (score > 80) severity = 'critical'
    else if (score > 60) severity = 'high'
  }

  // Rule 3: Low heart rate variability (stress/fatigue indicator)
  if (heartRateVariability > 0 && heartRateVariability < 20) {
    score += 20
    factors.push(`Low HRV: ${heartRateVariability} (stress indicator)`)
    recommendations.push('Your body shows signs of stress. Consider taking a break.')
  }

  score = Math.min(score, 100)

  return {
    hasFatigue,
    severity,
    score,
    sleepHours,
    factors,
    recommendations,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, tradeId, date, profitLoss } = await request.json()

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing userId or date' },
        { status: 400 }
      )
    }

    // Analyze trade for fatigue correlation
    const analysis = await analyzeFatigueError(userId, date, profitLoss || 0)

    // If fatigue error detected, save it
    if (analysis.hasFatigue) {
      const { error: insertError } = await getSupabase()
        .from('fatigue_errors')
        .insert({
          user_id: userId,
          trade_id: tradeId,
          date,
          sleep_hours: analysis.sleepHours,
          loss_amount: profitLoss || 0,
          fatigue_score: analysis.score,
          severity: analysis.severity,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('[v0] Error saving fatigue error:', insertError)
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      fatigueDetected: analysis.hasFatigue,
      severity: analysis.severity,
      score: analysis.score,
    })
  } catch (error) {
    console.error('[v0] Correlation analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
