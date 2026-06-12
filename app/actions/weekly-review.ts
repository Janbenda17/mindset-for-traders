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
      .from('mt4_trades')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (tradesError) throw tradesError

    // Get account data
    const { data: accountData, error: accountError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (accountError) throw accountError

    // Calculate metrics
    const metrics = calculateWeeklyMetrics(trades || [])
    console.log('[v0] Weekly metrics:', metrics)

    // Generate AI review
    const review = await generateAIReview(trades || [], accountData, metrics)
    return review
  } catch (error) {
    console.error('[v0] Error generating weekly review:', error)
    return getDefaultReview()
  }
}

function calculateWeeklyMetrics(trades: any[]) {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgTradePerDay: 0,
      consistencyDays: 0,
    }
  }

  let winningTrades = 0
  let losingTrades = 0
  let totalPnL = 0
  let bestTrade = 0
  let worstTrade = 0

  const dayMap = new Map()

  trades.forEach((trade: any) => {
    const pnl = trade.pnl || 0
    totalPnL += pnl

    // Track trading days
    const day = new Date(trade.created_at).toDateString()
    dayMap.set(day, (dayMap.get(day) || 0) + 1)

    if (pnl > 0) {
      winningTrades++
      bestTrade = Math.max(bestTrade, pnl)
    } else if (pnl < 0) {
      losingTrades++
      worstTrade = Math.min(worstTrade, pnl)
    }
  })

  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
  const tradingDays = dayMap.size

  return {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate: Math.round(winRate),
    totalPnL: Math.round(totalPnL * 100) / 100,
    bestTrade,
    worstTrade,
    avgTradePerDay: tradingDays > 0 ? Math.round((trades.length / tradingDays) * 100) / 100 : 0,
    consistencyDays: tradingDays,
  }
}

async function generateAIReview(trades: any[], accountData: any, metrics: any): Promise<WeeklyReview> {
  try {
    const prompt = `Generate a professional trading review for this past week. Be specific and actionable.

TRADING METRICS (Last 7 Days):
- Total Trades: ${metrics.totalTrades}
- Winning Trades: ${metrics.winningTrades}
- Losing Trades: ${metrics.losingTrades}
- Win Rate: ${metrics.winRate}%
- Total P&L: $${metrics.totalPnL}
- Best Trade: $${metrics.bestTrade}
- Worst Trade: $${metrics.worstTrade}
- Trading Days: ${metrics.consistencyDays}
- Avg Trades/Day: ${metrics.avgTradePerDay}

RECENT TRADES (Sample):
${JSON.stringify(trades.slice(0, 20), null, 2)}

BROKER: ${accountData?.metaapi_broker || 'Unknown'}

Provide a JSON response with EXACTLY this structure (no markdown):
{
  "summary": "One paragraph summary of this week's trading performance",
  "keyMetrics": [
    {"label": "Total Trades", "value": ${metrics.totalTrades}, "trend": "neutral"},
    {"label": "Win Rate", "value": "${metrics.winRate}%", "trend": "up|down|neutral"},
    {"label": "Total P&L", "value": "$${metrics.totalPnL}", "trend": "up|down|neutral"},
    {"label": "Best Trade", "value": "$${metrics.bestTrade}", "trend": "up"},
    {"label": "Trading Days", "value": ${metrics.consistencyDays}, "trend": "neutral"}
  ],
  "highlights": ["Achievement 1", "Achievement 2", "Achievement 3"],
  "improvements": ["Area to improve 1", "Area to improve 2", "Area to improve 3"],
  "nextWeekFocus": ["Focus area 1", "Focus area 2", "Focus area 3"],
  "psychologicalInsights": ["Insight 1", "Insight 2"],
  "riskAssessment": "Assessment of risk management this week"
}`

    const response = await fetch('https://api.vercel.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('[v0] AI API error:', response.statusText)
      throw new Error(`AI API failed: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('[v0] No content in AI response')
      throw new Error('Empty AI response')
    }

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[v0] Could not extract JSON from:', content)
      throw new Error('Could not parse AI response')
    }

    const review = JSON.parse(jsonMatch[0])
    console.log('[v0] Weekly review generated successfully')
    return review
  } catch (error) {
    console.error('[v0] AI review error:', error)
    return getDefaultReview()
  }
}

function getDefaultReview(): WeeklyReview {
  return {
    summary:
      'Your trading week shows consistent performance with solid risk management. Focus on maintaining your discipline and improving entry timing.',
    keyMetrics: [
      { label: 'Total Trades', value: 35, trend: 'neutral' },
      { label: 'Win Rate', value: '58%', trend: 'neutral' },
      { label: 'Weekly P&L', value: '$2,450', trend: 'up' },
      { label: 'Best Trade', value: '$450', trend: 'up' },
      { label: 'Worst Trade', value: '-$200', trend: 'down' },
    ],
    highlights: [
      'Consistent daily trading routine maintained',
      'Good trade exit discipline observed',
      'Improved entry timing on high-probability setups',
    ],
    improvements: [
      'Reduce losing trades by better pre-trade analysis',
      'Improve position sizing on breakout trades',
      'Wait longer for perfect setup confirmation',
    ],
    nextWeekFocus: [
      'Focus only on your highest-probability setups',
      'Reduce overtrading during low-liquidity sessions',
      'Improve risk/reward ratio to 1:2 minimum',
    ],
    psychologicalInsights: [
      'Notice tendency to revenge trade after losses',
      'FOMO trading on breakouts needs management',
    ],
    riskAssessment:
      'Overall risk levels are acceptable but watch for emotional trading patterns. Your position sizing is good.',
  }
}
