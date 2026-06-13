import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface LosingTrade {
  symbol: string
  entry: number
  exit: number
  loss: number
  duration: string
  reason?: string
}

export interface FailLogSuggestion {
  trades: LosingTrade[]
  rootCauses: string[]
  lessons: string[]
  preventionSteps: string[]
}

/**
 * Fetch today's losing trades from MT4 data
 */
export async function getLosingTradesToday(): Promise<LosingTrade[]> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('mt4_trades')
      .select('*')
      .gte('close_time', `${today}T00:00:00`)
      .lt('close_time', `${today}T23:59:59`)
      .lt('profit', 0)
      .order('close_time', { ascending: false })

    if (error) throw error

    return (data || []).map((trade) => ({
      symbol: trade.symbol,
      entry: trade.open_price,
      exit: trade.close_price,
      loss: Math.abs(trade.profit),
      duration: calculateDuration(trade.open_time, trade.close_time),
      reason: trade.notes || undefined
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
      preventionSteps: []
    }
  }

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

  return {
    trades: losingTrades,
    rootCauses,
    lessons,
    preventionSteps
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
 * Save generated fail log to database
 */
export async function saveFailLog(
  userId: string,
  suggestion: FailLogSuggestion
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fail_log')
      .insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        trade_count: suggestion.trades.length,
        total_loss: suggestion.trades.reduce((sum, t) => sum + t.loss, 0),
        root_causes: suggestion.rootCauses,
        lessons_learned: suggestion.lessons,
        prevention_steps: suggestion.preventionSteps,
        trades_data: suggestion.trades,
        ai_generated: true
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('[v0] Error saving fail log:', error)
    return false
  }
}
