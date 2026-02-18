import { createClient } from '@/lib/supabase/server'

export interface TradeInsight {
  id: string
  category: 'morning' | 'performance' | 'risk' | 'psychology' | 'market' | 'checklist'
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  icon: string
  actionable: boolean
  actionText?: string
  value?: number | string
  trend?: 'up' | 'down' | 'neutral'
}

export interface InsightContext {
  morningCheck: any
  recentTrades: any[]
  weeklyStats: any
  tradingIdentity: any
  tradingPlan: any
}

export async function analyzeInsights(
  userId: string,
  morningCheckData: any
): Promise<TradeInsight[]> {
  const supabase = createClient()
  const insights: TradeInsight[] = []

  try {
    // Fetch recent trading history
    const { data: recentTrades } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Fetch weekly stats
    const { data: weeklyReviews } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    // Fetch trading identity
    const { data: tradingIdentity } = await supabase
      .from('trading_identity')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Fetch today's trading plan
    const today = new Date().toISOString().split('T')[0]
    const { data: tradingPlan } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    const context: InsightContext = {
      morningCheck: morningCheckData,
      recentTrades: recentTrades || [],
      weeklyStats: weeklyReviews?.[0],
      tradingIdentity,
      tradingPlan,
    }

    // Generate different types of insights
    insights.push(...analyzeMorningState(context))
    insights.push(...detectTradingPatterns(context))
    insights.push(...analyzePerformanceTrends(context))
    insights.push(...analyzePsychologicalState(context))
    insights.push(...generateMarketInsights(context))
    insights.push(...generatePreTradeChecklist(context))

    // Sort by priority and return top 8
    return insights
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 8)
  } catch (error) {
    console.error('[Insight Engine] Error analyzing insights:', error)
    return generateFallbackInsights(morningCheckData)
  }
}

function analyzeMorningState(context: InsightContext): TradeInsight[] {
  const insights: TradeInsight[] = []
  const check = context.morningCheck

  // Sleep quality analysis
  if (check.sleep_hours < 6) {
    insights.push({
      id: 'sleep_low',
      category: 'morning',
      title: '⚠️ Nizka kvalita spánku',
      description: `Slezl si jen ${check.sleep_hours}h. Snižuje to tvou schopnost dělat kvalitní rozhodnutí. Zvažte zkrácení obchodování nebo přidání extra verify kroků.`,
      priority: 'high',
      icon: '😴',
      actionable: true,
      actionText: 'Posunout start obchodování',
      value: check.sleep_hours,
    })
  }

  // Energy level analysis
  if (check.energy_level < 4) {
    insights.push({
      id: 'energy_low',
      category: 'morning',
      title: '🔋 Nizka energie',
      description:
        'Tvá energie je nízká. Doporučuji si dát kávou nebo si udělat aktivitu. Vysoká energie = lepší trades.',
      priority: 'high',
      icon: '🔋',
      actionable: true,
      actionText: 'Zvýšit energii',
      value: check.energy_level,
    })
  }

  // Stress level analysis
  if (check.stress_level > 7) {
    insights.push({
      id: 'stress_high',
      category: 'psychology',
      title: '🚨 Vysoký stres',
      description:
        'Stres je vysoký. To zvyšuje riziko emotionálního tradingu. Doporučuji krátkou meditaci nebo přírodu.',
      priority: 'critical',
      icon: '😰',
      actionable: true,
      actionText: 'Meditovat 5 min',
      value: check.stress_level,
    })
  }

  // Emotional state
  if (check.emotional_state < 3) {
    insights.push({
      id: 'emotion_low',
      category: 'psychology',
      title: '😔 Negativní emoce',
      description:
        'Emoční stav je negativní. Zvyšuje to riziko revenge trading. Dbej na risk management.',
      priority: 'high',
      icon: '😔',
      actionable: false,
    })
  }

  // Focus analysis
  if (check.focus < 4) {
    insights.push({
      id: 'focus_low',
      category: 'morning',
      title: '🧠 Nízká koncentrace',
      description: 'Těžko se ti soustředí. Zvažte vyřešit rozptylující faktory nebo posunout trading.',
      priority: 'medium',
      icon: '🧠',
      actionable: false,
    })
  }

  return insights
}

function detectTradingPatterns(context: InsightContext): TradeInsight[] {
  const insights: TradeInsight[] = []
  const trades = context.recentTrades

  if (!trades || trades.length === 0) return insights

  // Check for revenge trading pattern
  const lastFewTrades = trades.slice(0, 5)
  const revengeTrades = lastFewTrades.filter((t) => t.revenge_trade).length

  if (revengeTrades >= 2) {
    insights.push({
      id: 'revenge_trading',
      category: 'psychology',
      title: '🔥 Revenge Trading Risk',
      description: `V posledních trades vidím ${revengeTrades} revenge tradů. To je rizikové! Dnes se více soustředěte na disciplínu.`,
      priority: 'high',
      icon: '🔥',
      actionable: true,
      actionText: 'Aktivovat striktní disciplínu',
      value: revengeTrades,
      trend: 'up',
    })
  }

  // Check for early exits
  const earlyExits = lastFewTrades.filter((t) => t.exited_early).length
  if (earlyExits >= 2) {
    insights.push({
      id: 'early_exits',
      category: 'performance',
      title: '⏱️ Příliš brané profity',
      description: `Vidím vzor brání profitů příliš brzy (${earlyExits}x). Daj si cíl a drž se ho!`,
      priority: 'medium',
      icon: '⏱️',
      actionable: false,
    })
  }

  // Check for missed opportunities
  const missed = lastFewTrades.filter((t) => t.missed_due_to_hesitation).length
  if (missed >= 1) {
    insights.push({
      id: 'missed_opportunities',
      category: 'psychology',
      title: '🤔 Příliš opatrný trading',
      description: `Minul si ${missed} příležitostí kvůli váhání. Dneska si dej více důvěry v plán.`,
      priority: 'medium',
      icon: '🤔',
      actionable: true,
      actionText: 'Zvýšit důvěru v plán',
    })
  }

  return insights
}

function analyzePerformanceTrends(context: InsightContext): TradeInsight[] {
  const insights: TradeInsight[] = []

  if (!context.weeklyStats) return insights

  const week = context.weeklyStats
  const winRate = (week.winning_trades / (week.total_trades || 1)) * 100

  // Check win rate
  if (winRate > 60) {
    insights.push({
      id: 'high_win_rate',
      category: 'performance',
      title: '📈 Výborná win rate',
      description: `Tvá win rate je ${winRate.toFixed(1)}%! Pokračuj v tom samém. Máš dobrý setup.`,
      priority: 'low',
      icon: '📈',
      actionable: false,
      value: `${winRate.toFixed(1)}%`,
      trend: 'up',
    })
  } else if (winRate < 40) {
    insights.push({
      id: 'low_win_rate',
      category: 'performance',
      title: '📉 Nízká win rate',
      description: `Win rate je jen ${winRate.toFixed(1)}%. Udělej si analýzu posledních tradů a vylepši setup.`,
      priority: 'high',
      icon: '📉',
      actionable: true,
      actionText: 'Analyzovat selhavé trades',
      value: `${winRate.toFixed(1)}%`,
      trend: 'down',
    })
  }

  // Check P&L trend
  if (week.total_pnl > 0) {
    const profitPercent = ((week.total_pnl / (context.tradingIdentity?.total_capital || 1000)) * 100).toFixed(2)
    if (week.total_pnl > 500) {
      insights.push({
        id: 'high_profit',
        category: 'performance',
        title: '💰 Skvělý týden!',
        description: `Zarobil si ${week.total_pnl}$ (+${profitPercent}%). Pokračuj v disciplíně!`,
        priority: 'low',
        icon: '💰',
        actionable: false,
        value: `$${week.total_pnl.toFixed(0)}`,
        trend: 'up',
      })
    }
  }

  return insights
}

function analyzePsychologicalState(context: InsightContext): TradeInsight[] {
  const insights: TradeInsight[] = []
  const check = context.morningCheck

  // Calculate readiness score
  const readinessScore =
    (check.sleep_quality +
      check.energy_level +
      check.focus +
      (10 - check.stress_level) +
      check.emotional_state) /
    5

  if (readinessScore < 4) {
    insights.push({
      id: 'low_readiness',
      category: 'morning',
      title: '⚠️ Nízká připravenost',
      description: `Tvá připravenost je nízká (${readinessScore.toFixed(1)}/10). Zvažte zkrácení dne nebo demo trading.`,
      priority: 'high',
      icon: '⚠️',
      actionable: true,
      actionText: 'Přejít na demo',
      value: `${readinessScore.toFixed(1)}/10`,
    })
  }

  // Confidence check
  const meditation = check.meditation || 0
  if (meditation >= 5 && check.focus >= 6) {
    insights.push({
      id: 'confident_mindset',
      category: 'psychology',
      title: '💪 Sebevědomý mindset',
      description: 'Meditoval si a soustředíš se. Perfektní mentální stav pro trading!',
      priority: 'low',
      icon: '💪',
      actionable: false,
    })
  }

  return insights
}

function generateMarketInsights(context: InsightContext): TradeInsight[] {
  const insights: TradeInsight[] = []

  if (!context.tradingPlan) return insights

  const plan = context.tradingPlan
  const dayOfWeek = new Date().getDay()

  // Day-based insights
  const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']

  if (dayOfWeek === 5) {
    // Friday
    insights.push({
      id: 'friday_caution',
      category: 'market',
      title: '⚠️ Pátek - buď opatrný',
      description: 'Dnes je pátek. Volatilita se zvyšuje. Zvýšené riziko před víkendem.',
      priority: 'medium',
      icon: '⚠️',
      actionable: false,
    })
  }

  // Market bias awareness
  if (plan?.market_bias) {
    insights.push({
      id: 'market_bias',
      category: 'market',
      title: '📊 Market bias',
      description: `Tvůj plán Today: ${plan.market_bias}. Drž se toho.`,
      priority: 'low',
      icon: '📊',
      actionable: false,
      value: plan.market_bias,
    })
  }

  return insights
}

function generatePreTradeChecklist(context: InsightContext): TradeInsight[] {
  const insights: TradeInsight[] = []

  insights.push({
    id: 'pre_trade_checklist',
    category: 'checklist',
    title: '✅ Pre-Trade Checklist',
    description:
      '1. Procvičit risk management (%) 2. Zopakovat si svůj setup 3. Zkontrolovat economic calendar 4. Připravit se na emoci',
    priority: 'medium',
    icon: '✅',
    actionable: true,
    actionText: 'Pustit si interaktivní checklist',
  })

  return insights
}

function generateFallbackInsights(morningCheckData: any): TradeInsight[] {
  return [
    {
      id: 'morning_greeting',
      category: 'morning',
      title: '👋 Vítej zpět!',
      description: 'Morning check je hotov. Máš dobrý den pro trading?',
      priority: 'low',
      icon: '👋',
      actionable: false,
    },
    {
      id: 'risk_reminder',
      category: 'risk',
      title: '⚠️ Risk Management First',
      description: 'Pamatuj si: Risk management je důležitější než profit. Drž se svého plánu.',
      priority: 'medium',
      icon: '⚠️',
      actionable: false,
    },
  ]
}
