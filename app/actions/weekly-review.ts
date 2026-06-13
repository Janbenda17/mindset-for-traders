'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface WeeklyReview {
  summary: string
  keyMetrics: {
    label: string
    value: string | number
    trend: 'up' | 'down' | 'neutral'
  }[]
  highlights: string[]
  improvements: string[]
  nextWeekFocus: string[]
  psychologicalInsights: string[]
  riskAssessment: string
}

export async function generateWeeklyReview(userId: string): Promise<WeeklyReview> {
  try {
    console.log('[v0] Generating weekly review for user:', userId)

    // Get trades from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: trades, error: tradesError } = await supabase
      .from('trade_records')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (tradesError) console.warn('[v0] Trades fetch warning:', tradesError)

    // Calculate metrics
    const metrics = calculateWeeklyMetrics(trades || [])

    // Generate insights
    const highlights: string[] = []
    const improvements: string[] = []
    const psychologicalInsights: string[] = []

    if (metrics.totalTrades > 0) {
      if (metrics.winRate >= 60) highlights.push('Strong win rate this week - keep focus on quality entries')
      else improvements.push('Focus on entry timing - analyze failed setups')

      if (metrics.totalPnL > 0) highlights.push(`Profitable week: +$${metrics.totalPnL.toFixed(2)}`)
      else improvements.push('Reduce losses - tighten stops and trade smaller when stressed')

      if (metrics.consecutiveLosses < 3) highlights.push('Good discipline - no revenge trading detected')
      else psychologicalInsights.push('Revenge trading pattern detected - add 15-min pause after losses')
    } else {
      highlights.push('Preparing for next trading opportunity')
      improvements.push('Focus on demo trading or paper trading to practice')
    }

    // Next week focus
    const nextWeekFocus = [
      'Focus on high-probability setups only',
      'Maintain 2% risk per trade maximum',
      'Trade only during peak hours (10am-2pm)',
    ]

    if (metrics.winRate < 50) {
      nextWeekFocus[0] = 'IMPORTANT: Review your entry rules - win rate below 50%'
    }

    // Risk assessment
    const riskAssessment =
      metrics.totalTrades === 0
        ? 'No trades this week. Ready to trade next week with fresh perspective.'
        : metrics.maxDrawdown > 10
          ? 'Risk levels are elevated - reduce position sizes and trade smaller'
          : metrics.maxDrawdown > 5
            ? 'Moderate risk - acceptable but monitor closely'
            : 'Risk levels are well-controlled - good job'

    return {
      summary:
        metrics.totalTrades === 0
          ? 'No trading activity this week. Use this time to review your strategy and prepare for next week.'
          : `This week you made ${metrics.totalTrades} trades with a ${metrics.winRate.toFixed(1)}% win rate and ${metrics.totalPnL > 0 ? '+' : ''}$${metrics.totalPnL.toFixed(2)} profit. Focus on consistency and discipline.`,
      keyMetrics: [
        { label: 'Total Trades', value: metrics.totalTrades, trend: 'neutral' },
        { label: 'Win Rate', value: `${metrics.winRate.toFixed(1)}%`, trend: metrics.winRate >= 55 ? 'up' : 'down' },
        { label: 'Weekly P&L', value: `$${metrics.totalPnL.toFixed(2)}`, trend: metrics.totalPnL > 0 ? 'up' : 'down' },
        { label: 'Best Trade', value: `$${metrics.bestTrade.toFixed(2)}`, trend: 'up' },
        { label: 'Avg Trade', value: `$${(metrics.totalPnL / Math.max(metrics.totalTrades, 1)).toFixed(2)}`, trend: 'neutral' },
      ],
      highlights,
      improvements,
      nextWeekFocus,
      psychologicalInsights,
      riskAssessment,
    }
  } catch (err) {
    console.error('[v0] Error generating weekly review:', err)
    // Return default review
    return {
      summary: 'Starting your trading journey. Focus on building a solid foundation.',
      keyMetrics: [
        { label: 'Total Trades', value: 0, trend: 'neutral' },
        { label: 'Win Rate', value: '50%', trend: 'neutral' },
        { label: 'Weekly P&L', value: '$0', trend: 'neutral' },
        { label: 'Best Trade', value: '$0', trend: 'neutral' },
        { label: 'Avg Trade', value: '$0', trend: 'neutral' },
      ],
      highlights: ['Great opportunity to learn', 'Focus on developing your strategy'],
      improvements: ['Practice on demo account', 'Paper trade to build confidence'],
      nextWeekFocus: ['Define your trading rules', 'Set risk limits', 'Create trade journal'],
      psychologicalInsights: ['Stay patient', 'Build trading discipline gradually'],
      riskAssessment: 'Use this time to prepare - no active trading risk this week',
    }
  }
}

function calculateWeeklyMetrics(trades: any[]) {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 50,
      totalPnL: 0,
      bestTrade: 0,
      maxDrawdown: 0,
      consecutiveLosses: 0,
    }
  }

  const winningTrades = trades.filter((t: any) => (t.pnl || 0) > 0)
  const losingTrades = trades.filter((t: any) => (t.pnl || 0) < 0)
  const totalPnL = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
  const bestTrade = Math.max(...trades.map((t: any) => t.pnl || 0))

  let maxConsecutiveLosses = 0
  let currentConsecutive = 0
  trades.forEach((t: any) => {
    if ((t.pnl || 0) < 0) {
      currentConsecutive++
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentConsecutive)
    } else {
      currentConsecutive = 0
    }
  })

  // Calculate drawdown
  let peak = 0
  let maxDrawdown = 0
  let runningBalance = 0

  trades
    .slice()
    .reverse()
    .forEach((t: any) => {
      runningBalance += t.pnl || 0
      peak = Math.max(peak, runningBalance)
      const drawdown = peak - runningBalance
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    })

  return {
    totalTrades: trades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    totalPnL,
    bestTrade,
    maxDrawdown,
    consecutiveLosses: maxConsecutiveLosses,
  }
}
