import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autofillDailyIntentions } from '@/lib/services/autofill-intentions'
import { getLosingTradesToday, generateFailLogSuggestions, saveFailLog, logAutofillAttempt } from '@/lib/services/autofill-logs'
import { autoGenerateGoals } from '@/lib/services/auto-generate-goals'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, date, types = ['both'] } = body

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'Missing userId or date' },
        { status: 400 }
      )
    }

    console.log('[v0] Starting autofill for user:', userId, 'date:', date, 'types:', types)

    const results: Record<string, any> = {
      daily_intentions: null,
      fail_logs: null,
      goals: null
    }

    // Autofill Daily Intentions
    if (types.includes('both') || types.includes('daily_intentions')) {
      try {
        await logAutofillAttempt(userId, date, 'daily_intentions', 'started', 1)
        
        const intentions = await autofillDailyIntentions(userId, date)
        
        if (intentions) {
          results.daily_intentions = intentions
          await logAutofillAttempt(userId, date, 'daily_intentions', 'completed', 1)
          console.log('[v0] Daily intentions autofilled successfully')
        } else {
          await logAutofillAttempt(userId, date, 'daily_intentions', 'error', 0, 'AI generation failed')
        }
      } catch (error) {
        console.error('[v0] Error autofilling daily intentions:', error)
        await logAutofillAttempt(userId, date, 'daily_intentions', 'error', 0, String(error))
      }
    }

    // Autofill Fail Logs
    if (types.includes('both') || types.includes('fail_logs')) {
      try {
        await logAutofillAttempt(userId, date, 'fail_logs', 'started', 0)
        
        const losingTrades = await getLosingTradesToday(userId, date)
        
        if (losingTrades.length > 0) {
          const suggestion = await generateFailLogSuggestions(losingTrades, 'neutral')
          const saved = await saveFailLog(userId, date, suggestion)
          
          if (saved) {
            results.fail_logs = suggestion
            await logAutofillAttempt(userId, date, 'fail_logs', 'completed', losingTrades.length)
            console.log('[v0] Fail logs autofilled successfully')
          }
        } else {
          await logAutofillAttempt(userId, date, 'fail_logs', 'completed', 0)
          console.log('[v0] No losing trades to analyze')
        }
      } catch (error) {
        console.error('[v0] Error autofilling fail logs:', error)
        await logAutofillAttempt(userId, date, 'fail_logs', 'error', 0, String(error))
      }
    }

    // Auto-generate Weekly and Monthly Goals
    try {
      console.log('[v0] Auto-generating trading goals...')
      const goalsGenerated = await autoGenerateGoals(userId, date)
      
      if (goalsGenerated) {
        results.goals = { success: true }
        console.log('[v0] Trading goals auto-generated successfully')
      } else {
        console.warn('[v0] Goal generation completed with warnings')
        results.goals = { success: false, warning: 'Partial generation' }
      }
    } catch (error) {
      console.error('[v0] Error auto-generating goals:', error)
      results.goals = { success: false, error: String(error) }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('[v0] Autofill error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
    if (types.includes('both') || types.includes('fail_logs')) {
      try {
        await logAutofillAttempt(userId, date, 'fail_logs', 'started', 1)

        // Fetch losing trades
        const losingTrades = await getLosingTradesToday(userId, date)

        if (losingTrades.length > 0) {
          // Get morning check for context
          const { data: morningCheck } = await supabase
            .from('morning_checks')
            .select('emotional_state')
            .eq('user_id', userId)
            .eq('date', date)
            .maybeSingle()

          // Generate suggestions
          const suggestions = await generateFailLogSuggestions(
            losingTrades,
            morningCheck?.emotional_state || 'neutral'
          )

          // Save fail logs
          const saved = await saveFailLog(userId, date, suggestions)

          if (saved) {
            results.fail_logs = {
              trades_analyzed: losingTrades.length,
              suggestions: suggestions
            }
            console.log('[v0] Fail logs autofilled successfully')
          }
        } else {
          console.log('[v0] No losing trades to analyze')
          await logAutofillAttempt(userId, date, 'fail_logs', 'completed', 0)
        }
      } catch (error) {
        console.error('[v0] Error autofilling fail logs:', error)
        await logAutofillAttempt(userId, date, 'fail_logs', 'error', 0, String(error))
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('[v0] Autofill API error:', error)
    return NextResponse.json(
      { error: 'Autofill failed', details: String(error) },
      { status: 500 }
    )
  }
}
