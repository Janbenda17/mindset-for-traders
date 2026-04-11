import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Correlation engine - detekuje fatigue errors
export async function POST(request: NextRequest) {
  try {
    const { userId, date, tradeId } = await request.json()

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing userId or date' },
        { status: 400 }
      )
    }

    // Get health data for this date
    const { data: healthData, error: healthError } = await supabase
      .from('health_sync')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('synced_at', { ascending: false })
      .limit(1)

    if (healthError || !healthData?.length) {
      console.log('No health data for analysis')
      return NextResponse.json({ message: 'No health data available' })
    }

    const sleepHours = healthData[0].sleep_hours
    const sleepQuality = healthData[0].sleep_quality

    // Get trades for this date
    const { data: trades, error: tradesError } = await supabase
      .from('mt4_trades')
      .select('*')
      .eq('user_id', userId)
      .gte('closed_at', `${date}T00:00:00Z`)
      .lt('closed_at', `${date}T23:59:59Z`)

    if (tradesError || !trades?.length) {
      return NextResponse.json({ message: 'No trades for analysis' })
    }

    const correlations = []

    for (const trade of trades) {
      let errorType = null
      let severity = 0
      const errorFactors = []

      // ============ FATIGUE DETECTION ============
      
      // Factor 1: Sleep deprivation
      if (sleepHours < 6) {
        severity += 40
        errorFactors.push(`Low sleep: ${sleepHours.toFixed(1)}h (target: 7-9h)`)
      } else if (sleepHours < 7) {
        severity += 20
        errorFactors.push(`Below optimal sleep: ${sleepHours.toFixed(1)}h`)
      }

      // Factor 2: Poor sleep quality
      if (sleepQuality && sleepQuality < 0.6) {
        severity += 30
        errorFactors.push(`Poor sleep quality: ${(sleepQuality * 100).toFixed(0)}%`)
      }

      // Factor 3: Loss after bad sleep
      if ((sleepHours < 6 || (sleepQuality && sleepQuality < 0.6)) && trade.profit_loss < 0) {
        errorType = 'FATIGUE_ERROR'
        severity += 30
        errorFactors.push(`Loss during fatigue: ${trade.profit_loss.toFixed(2)} (${trade.pnl_percent?.toFixed(2)}%)`)
      }

      // Factor 4: Rapid trades during fatigue (revenge trading indicator)
      if (errorType === 'FATIGUE_ERROR' && trade.duration_minutes && trade.duration_minutes < 15) {
        severity += 20
        errorFactors.push(`Rapid exit after loss: ${trade.duration_minutes}min`)
      }

      // Store correlation if detected
      if (errorType && severity > 0) {
        const { error: insertError } = await supabase
          .from('fatigue_errors')
          .insert({
            user_id: userId,
            trade_id: trade.id,
            error_type: errorType,
            severity: Math.min(100, severity),
            error_factors: errorFactors,
            sleep_hours: sleepHours,
            sleep_quality: sleepQuality,
            trade_details: {
              symbol: trade.symbol,
              profit_loss: trade.profit_loss,
              pnl_percent: trade.pnl_percent,
              duration_minutes: trade.duration_minutes
            },
            date,
            detected_at: new Date().toISOString()
          })

        if (!insertError) {
          correlations.push({
            tradeId: trade.id,
            errorType,
            severity: Math.min(100, severity),
            errorFactors
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      sleepHours,
      sleepQuality,
      tradesAnalyzed: trades.length,
      correlationsFound: correlations.length,
      correlations
    })
  } catch (error) {
    console.error('Correlation analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
