import { createClient } from '@supabase/supabase-js'
import { generateObject, generateText } from 'ai'
import { xai } from '@ai-sdk/xai'
import { z } from 'zod'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return supabaseInstance
}

export interface LosingTrade {
  id?: string
  symbol: string
  entry: number
  exit: number
  loss: number
  duration: string
  reason?: string
  entry_time?: string
  exit_time?: string
  volume?: number
}

export interface FailLogSuggestion {
  trades: LosingTrade[]
  rootCauses: string[]
  lessons: string[]
  preventionSteps: string[]
  aiAnalysis?: string
}

export interface AutofillFailureLog {
  id?: string
  user_id: string
  date: string
  type: 'fail_logs' | 'daily_intentions' | 'both'
  status: 'started' | 'completed' | 'error' | 'partial'
  items_attempted: number
  items_succeeded: number
  error_message?: string
  created_at: string
}

const FailLogAnalysisSchema = z.object({
  title: z.string().describe('Concise title of what went wrong'),
  rootCause: z.string().describe('Root cause analysis of the failure'),
  actionPlan: z.string().describe('Specific action to prevent this in future'),
  category: z.enum(['entry_error', 'exit_error', 'risk_management', 'emotional', 'technical', 'other']).describe('Category of failure'),
  lesson: z.string().describe('Key lesson learned'),
})

/**
 * Fetch today's losing trades from MT4 data
 */
export async function getLosingTradesToday(userId: string, date?: string): Promise<LosingTrade[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    const { data, error } = await getSupabase()
      .from('mt4_trades')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_time', `${targetDate}T00:00:00`)
      .lt('entry_time', `${targetDate}T23:59:59`)
      .lt('profit_loss', 0)
      .order('entry_time', { ascending: false })

    if (error) throw error

    return (data || []).map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      entry: trade.entry_price,
      exit: trade.exit_price,
      loss: Math.abs(trade.profit_loss),
      duration: calculateDuration(trade.entry_time, trade.exit_time),
      reason: trade.notes || undefined,
      entry_time: trade.entry_time,
      exit_time: trade.exit_time,
      volume: trade.volume
    }))
  } catch (error) {
    console.error('[v0] Error fetching losing trades:', error)
    return []
  }
}

/**
 * Generate AI-powered fail log suggestions based on losing trades and morning state
 */
export async function generateFailLogSuggestions(
  losingTrades: LosingTrade[],
  morningPsychState: string,
  tradingIdentity?: string
): Promise<FailLogSuggestion> {
  if (losingTrades.length === 0) {
    return {
      trades: [],
      rootCauses: [],
      lessons: [],
      preventionSteps: [],
      aiAnalysis: 'No losing trades to analyze.'
    }
  }

  try {
    // Analyze patterns in losing trades
    const symbols = [...new Set(losingTrades.map(t => t.symbol))]
    const totalLoss = losingTrades.reduce((sum, t) => sum + t.loss, 0)
    const avgLoss = totalLoss / losingTrades.length

    // Generate intelligent root causes based on trade patterns and psychological state
    const rootCauses = generateRootCauses(losingTrades, morningPsychState, tradingIdentity)
    
    // Generate lessons learned
    const lessons = generateLessons(losingTrades, rootCauses)
    
    // Generate prevention steps
    const preventionSteps = generatePreventionSteps(rootCauses, tradingIdentity)

    // Get AI analysis
    const aiAnalysis = await getAIFailAnalysis(losingTrades, morningPsychState, rootCauses)

    return {
      trades: losingTrades,
      rootCauses,
      lessons,
      preventionSteps,
      aiAnalysis
    }
  } catch (error) {
    console.error('[v0] Error generating fail log suggestions:', error)
    return {
      trades: losingTrades,
      rootCauses: ['Unable to analyze - please review trades manually'],
      lessons: [],
      preventionSteps: [],
      aiAnalysis: 'AI analysis failed - manual review recommended'
    }
  }
}

/**
 * Intelligently identify root causes of losses
 */
function generateRootCauses(
  trades: LosingTrade[],
  morningState: string,
  tradingIdentity?: string
): string[] {
  const causes: string[] = []

  // Check for emotional triggers based on morning state
  if (morningState.toLowerCase().includes('anxiety') || morningState.toLowerCase().includes('fomo')) {
    causes.push('Emotional decision-making - FOMO/Anxiety driven entries')
  }

  if (morningState.toLowerCase().includes('frustrated') || morningState.toLowerCase().includes('revenge')) {
    causes.push('Revenge trading after previous loss')
  }

  // Check for technical patterns
  const avgDuration = trades.reduce((sum, t) => {
    const minutes = parseInt(t.duration.split(' ')[0])
    return sum + minutes
  }, 0) / trades.length

  if (avgDuration < 5) {
    causes.push('Scalping losses - holding positions too short, caught in noise')
  }

  if (trades.length > 5) {
    causes.push('Over-trading - too many trades in one day')
  }

  // Check for concentration risk
  if (trades.length > 1) {
    const symbols = trades.map(t => t.symbol)
    const duplicates = symbols.filter((s, i) => symbols.indexOf(s) !== i)
    if (duplicates.length > 0) {
      causes.push(`Concentration risk - repeated losses on ${[...new Set(duplicates)].join(', ')}`)
    }
  }

  return causes.length > 0 ? causes : ['Market conditions - unexpected volatility']
}

/**
 * Generate lessons from the losses
 */
function generateLessons(trades: LosingTrade[], causes: string[]): string[] {
  return [
    'Only trade when your psychological state is stable and confident',
    'Set maximum daily loss limit BEFORE opening first trade',
    'Each trade must have clear entry, exit, and risk/reward ratio defined',
    'Review the root causes: ' + causes.join(' | '),
    'Journal these trades to build pattern recognition'
  ]
}

/**
 * Generate prevention steps for future trades
 */
function generatePreventionSteps(causes: string[], tradingIdentity?: string): string[] {
  const steps: string[] = [
    'Schedule 15min timeout after loss - step away, don\'t revenge trade',
    'Set hard stop-loss on every trade BEFORE entering',
    'Maximum 3 trades per day limit',
    'Risk no more than 1% per trade'
  ]

  if (causes.some(c => c.includes('Emotional'))) {
    steps.push('Use mechanical entry signals only, no discretionary entries when stressed')
  }

  if (causes.some(c => c.includes('Over-trading'))) {
    steps.push('Set daily trade limit reminder on phone alarm')
  }

  return steps
}

/**
 * Helper: Calculate trade duration
 */
function calculateDuration(openTime: string, closeTime: string): string {
  const open = new Date(openTime).getTime()
  const close = new Date(closeTime).getTime()
  const minutes = Math.floor((close - open) / 60000)
  
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  return `${Math.floor(minutes / 1440)}d`
}

/**
 * Get AI-powered analysis of failed trades
 */
async function getAIFailAnalysis(
  trades: LosingTrade[],
  morningState: string,
  rootCauses: string[]
): Promise<string> {
  try {
    const tradesSummary = trades.map(t => `${t.symbol}: Lost ${t.loss.toFixed(2)} (${t.duration})`).join('\n')

    const result = await generateText({
      model: xai('grok-2-1212'),
      prompt: `
      Analyze these losing trades and provide insights:

      Morning Psychological State: ${morningState}
      
      Losing Trades:
      ${tradesSummary}

      Identified Root Causes:
      ${rootCauses.join('\n')}

      Provide a brief, actionable analysis (2-3 sentences) that helps the trader prevent similar losses. Focus on the specific pattern you see.
      `
    })

    return result.text
  } catch (error) {
    console.error('[v0] Error getting AI analysis:', error)
    return 'AI analysis unavailable - manual review recommended'
  }
}

/**
 * Log autofill attempt for tracking and debugging
 */
export async function logAutofillAttempt(
  userId: string,
  date: string,
  type: 'fail_logs' | 'daily_intentions' | 'both',
  status: 'started' | 'completed' | 'error' | 'partial',
  itemsSucceeded: number,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await getSupabase()
      .from('autofill_logs')
      .insert({
        user_id: userId,
        date,
        type,
        status,
        items_attempted: itemsSucceeded,
        items_succeeded: status === 'completed' ? itemsSucceeded : 0,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[v0] Error logging autofill attempt:', error)
    } else {
      console.log('[v0] Autofill log recorded:', { type, status, itemsSucceeded })
    }
  } catch (error) {
    console.error('[v0] Error in logAutofillAttempt:', error)
  }
}

/**
 * Get autofill failure logs for monitoring
 */
export async function getAutofillFailureLogs(
  userId: string,
  limit: number = 50
): Promise<AutofillFailureLog[]> {
  try {
    const { data, error } = await getSupabase()
      .from('autofill_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[v0] Error fetching autofill logs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[v0] Error getting autofill logs:', error)
    return []
  }
}

/**
 * Save generated fail log to database with autofill tracking
 */
export async function saveFailLog(
  userId: string,
  date: string,
  suggestion: FailLogSuggestion
): Promise<boolean> {
  try {
    // Start logging attempt
    await logAutofillAttempt(userId, date, 'fail_logs', 'started', suggestion.trades.length)

    if (suggestion.trades.length === 0) {
      await logAutofillAttempt(userId, date, 'fail_logs', 'completed', 0)
      return true
    }

    let successCount = 0

    // Save individual fail logs for each trade
    for (const trade of suggestion.trades) {
      try {
        const { error } = await getSupabase()
          .from('fail_log')
          .insert({
            user_id: userId,
            date: date,
            title: `${trade.symbol} loss: ${trade.loss.toFixed(2)}`,
            description: suggestion.rootCauses.join(' | '),
            root_cause: suggestion.rootCauses.join(' | '),
            action_plan: suggestion.preventionSteps.join('\n'),
            lesson_learned: suggestion.lessons.join(' | '),
            trade_id: trade.id,
            ai_generated: true,
            created_at: new Date().toISOString(),
          })

        if (!error) {
          successCount++
        } else {
          console.error('[v0] Error saving individual fail log:', error)
          await logAutofillAttempt(userId, date, 'fail_logs', 'error', 1, error.message)
        }
      } catch (error) {
        console.error('[v0] Error in trade analysis:', error)
      }
    }

    // Log completion
    await logAutofillAttempt(userId, date, 'fail_logs', successCount === suggestion.trades.length ? 'completed' : 'partial', successCount)
    
    return successCount > 0
  } catch (error) {
    console.error('[v0] Error saving fail log:', error)
    await logAutofillAttempt(userId, date, 'fail_logs', 'error', 0, String(error))
    return false
  }
}
