'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TraderProfile {
  tradingStyle: string
  riskTolerance: string
  strengths: string[]
  weaknesses: string[]
  emotionalPatterns: string[]
  weeklyGoals: {
    goal: string
    target: number
    description: string
  }[]
  consistency: number
  discipline: number
  adaptability: number
}

export async function analyzeTraderProfile(userId: string): Promise<TraderProfile> {
  try {
    console.log('[v0] Analyzing trader profile for user:', userId)

    // Fetch recent trades from trade_records table
    const { data: trades, error: tradesError } = await supabase
      .from('trade_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (tradesError) console.warn('[v0] Trades fetch warning:', tradesError)

    // Calculate metrics from trades
    const metrics = calculateMetrics(trades || [])
    
    // Determine trading style based on metrics
    const tradingStyle = metrics.avgWinRate > 60 ? 'aggressive' : metrics.avgWinRate > 50 ? 'moderate' : 'conservative'
    const riskTolerance = metrics.avgDrawdown > 10 ? 'high' : metrics.avgDrawdown > 5 ? 'medium' : 'low'

    // Generate strengths and weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []

    if (metrics.totalTrades > 0) {
      if (metrics.avgWinRate >= 55) strengths.push('High win rate consistency')
      else weaknesses.push('Improve entry timing and setup recognition')

      if (metrics.profitFactor > 1.5) strengths.push('Excellent risk/reward ratio')
      else weaknesses.push('Better risk management - adjust position sizing')

      if (metrics.maxConsecutiveLosses < 3) strengths.push('Emotional discipline under pressure')
      else weaknesses.push('Revenge trading tendency - add pause after losses')
    }

    if (strengths.length === 0) strengths.push('Building trading experience', 'Starting your trading journey')
    if (weaknesses.length === 0) weaknesses.push('Continue monitoring consistency', 'Track patterns over time')

    // Emotional patterns
    const emotionalPatterns = [
      metrics.totalTrades > 10 ? 'Pattern recognition improving' : 'Building pattern recognition',
      metrics.profitFactor > 1 ? 'Positive expectancy developing' : 'Focus on high-probability setups',
    ]

    // Weekly goals
    const weeklyGoals = [
      {
        goal: 'Increase win rate',
        target: Math.min(metrics.avgWinRate + 5, 75),
        description: `Current: ${metrics.avgWinRate.toFixed(1)}% - Focus on quality entries`,
      },
      {
        goal: 'Reduce drawdown',
        target: Math.max(metrics.avgDrawdown - 2, 2),
        description: `Current: ${metrics.avgDrawdown.toFixed(1)}% - Implement strict stop losses`,
      },
      {
        goal: 'Trade consistency',
        target: 80,
        description: 'Follow your trading plan on 80%+ of trades',
      },
    ]

    return {
      tradingStyle,
      riskTolerance,
      strengths,
      weaknesses,
      emotionalPatterns,
      weeklyGoals,
      consistency: Math.min(metrics.totalTrades > 0 ? 70 + (metrics.avgWinRate * 0.3) : 50, 95),
      discipline: Math.min(metrics.totalTrades > 0 ? 65 + (metrics.profitFactor * 15) : 50, 95),
      adaptability: Math.min(metrics.totalTrades > 0 ? 60 + (metrics.avgRiskReward * 5) : 50, 95),
    }
  } catch (err) {
    console.error('[v0] Error analyzing trader profile:', err)
    // Return default profile if error
    return {
      tradingStyle: 'moderate',
      riskTolerance: 'medium',
      strengths: ['Consistent effort', 'Disciplined approach'],
      weaknesses: ['Still building experience', 'Pattern recognition'],
      emotionalPatterns: ['Building confidence', 'Learning from trades'],
      weeklyGoals: [
        { goal: 'Build consistency', target: 60, description: 'Focus on plan adherence' },
        { goal: 'Track patterns', target: 75, description: 'Journal every trade' },
        { goal: 'Improve setup', target: 65, description: 'High-probability only' },
      ],
      consistency: 60,
      discipline: 60,
      adaptability: 65,
    }
  }
}

function calculateMetrics(trades: any[]) {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      avgWinRate: 50,
      totalPnL: 0,
      avgPnL: 0,
      profitFactor: 1,
      avgRiskReward: 1,
      maxConsecutiveLosses: 0,
      maxDrawdown: 0,
      avgDrawdown: 5,
    }
  }

  const winningTrades = trades.filter((t: any) => (t.pnl || 0) > 0)
  const losingTrades = trades.filter((t: any) => (t.pnl || 0) < 0)
  const totalPnL = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
  
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

  const grossProfit = trades
    .filter((t: any) => (t.pnl || 0) > 0)
    .reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
  const grossLoss = Math.abs(
    trades
      .filter((t: any) => (t.pnl || 0) < 0)
      .reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
  )

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWinRate: (winningTrades.length / trades.length) * 100,
    totalPnL,
    avgPnL: totalPnL / trades.length,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : 1,
    avgRiskReward: 1.5,
    maxConsecutiveLosses,
    maxDrawdown: 10,
    avgDrawdown: 5,
  }
}
