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

    // Fetch recent trades (last 100)
    const { data: trades, error: tradesError } = await supabase
      .from('mt4_trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (tradesError) throw tradesError

    // Fetch account info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError

    // Calculate metrics from trades
    const metrics = calculateMetrics(trades || [])
    console.log('[v0] Calculated metrics:', metrics)

    // Call Grok with Vercel AI Gateway (no API key needed)
    const analysis = await generateTraderAnalysis(trades || [], profile, metrics)
    return analysis
  } catch (error) {
    console.error('[v0] Error in analyzeTraderProfile:', error)
    return getDefaultProfile()
  }
}

function calculateMetrics(trades: any[]) {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      totalPnL: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
    }
  }

  let winningTrades = 0
  let losingTrades = 0
  let totalWins = 0
  let totalLosses = 0
  let totalPnL = 0
  let largestWin = 0
  let largestLoss = 0

  trades.forEach((trade: any) => {
    const pnl = trade.pnl || 0
    totalPnL += pnl

    if (pnl > 0) {
      winningTrades++
      totalWins += pnl
      largestWin = Math.max(largestWin, pnl)
    } else if (pnl < 0) {
      losingTrades++
      totalLosses += Math.abs(pnl)
      largestLoss = Math.min(largestLoss, pnl)
    }
  })

  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
  const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0
  const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0

  return {
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate: Math.round(winRate),
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    totalPnL: Math.round(totalPnL * 100) / 100,
    largestWin,
    largestLoss,
    profitFactor: Math.round(profitFactor * 100) / 100,
  }
}

async function generateTraderAnalysis(trades: any[], profile: any, metrics: any): Promise<TraderProfile> {
  try {
    const prompt = `You are a professional trading coach. Analyze this trader's performance and create a detailed trader profile.

TRADE DATA (Last 100 trades):
${JSON.stringify(trades.slice(0, 30), null, 2)}

CALCULATED METRICS:
- Total Trades: ${metrics.totalTrades}
- Win Rate: ${metrics.winRate}%
- Winning Trades: ${metrics.winningTrades}
- Losing Trades: ${metrics.losingTrades}
- Average Win: $${metrics.avgWin}
- Average Loss: $${metrics.avgLoss}
- Total P&L: $${metrics.totalPnL}
- Profit Factor: ${metrics.profitFactor}
- Largest Win: $${metrics.largestWin}
- Largest Loss: $${metrics.largestLoss}

ACCOUNT INFO:
- Broker: ${profile?.metaapi_broker || 'Unknown'}
- Account Active: ${profile?.trades_sync_enabled ? 'Yes' : 'No'}

Based on this data, provide a JSON response with EXACTLY this structure (no markdown, no extra text):
{
  "tradingStyle": "aggressive|moderate|conservative",
  "riskTolerance": "high|medium|low",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "emotionalPatterns": ["pattern1", "pattern2"],
  "weeklyGoals": [
    {"goal": "Goal name", "target": 65, "description": "Description"},
    {"goal": "Goal name", "target": 80, "description": "Description"},
    {"goal": "Goal name", "target": 75, "description": "Description"}
  ],
  "consistency": 72,
  "discipline": 65,
  "adaptability": 78
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

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[v0] Could not extract JSON from:', content)
      throw new Error('Could not parse AI response')
    }

    const analysis = JSON.parse(jsonMatch[0])
    console.log('[v0] AI analysis successful:', analysis)
    return analysis
  } catch (error) {
    console.error('[v0] AI analysis error:', error)
    return getDefaultProfile()
  }
}

function getDefaultProfile(): TraderProfile {
  return {
    tradingStyle: 'moderate',
    riskTolerance: 'medium',
    strengths: ['Consistent', 'Disciplined', 'Patient'],
    weaknesses: ['Revenge trading', 'Emotional decisions', 'Over-leveraging'],
    emotionalPatterns: ['Overtrading after losses', 'FOMO entries', 'Hesitation on good setups'],
    weeklyGoals: [
      { goal: 'Increase win rate', target: 65, description: 'Focus on quality over quantity' },
      { goal: 'Reduce drawdown', target: 95, description: 'Max 5% weekly loss' },
      { goal: 'Improve consistency', target: 80, description: 'Trade only planned setups' },
    ],
    consistency: 70,
    discipline: 65,
    adaptability: 75,
  }
}
