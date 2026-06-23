// Virtual data generator for demo mode
// Generates realistic trading data for new users to explore the app

export interface VirtualTrade {
  id: string
  date: string
  pair: string
  direction: string
  entryPrice: number
  exitPrice: number
  positionSize: number
  pnl: number
  pips: number
  mood: number
  confidence: number
  stressLevel: number
  discipline: number
  emotionBefore: string
  emotionDuring: string
  emotionAfter: string
  notes: string
  tags: string[]
  followedPlan: boolean
}

export interface VirtualMorningCheck {
  id: string
  date: string
  sleepQuality: number
  sleepHours: number
  energyLevel: number
  stressLevel: number
  focus: number
  physicalHealth: number
  emotionalState: number
  exercised: boolean
  meditationTime: number
  morningRoutine: boolean
  hydration: number
  score: number
}

export interface VirtualJournalEntry {
  id: string
  date: string
  title: string
  content: string
  mood: number
  tags: string[]
  type: string
}

export interface VirtualDailyTrackerData {
  morningCheck: VirtualMorningCheck
  todayScore: number
  insight: string
}

const CURRENCY_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "AUD/USD", "USD/CAD", "EUR/GBP", "NZD/USD"]

const EMOTIONS = ["Confident", "Calm", "Focused", "Anxious", "Excited", "Nervous", "Relaxed", "Stressed", "Disciplined"]

const TRADE_NOTES = [
  "Strong breakout above key resistance level",
  "Perfect rejection at support, clear reversal signal",
  "News-driven volatility, followed the plan",
  "Stopped out by unexpected price action",
  "Great risk-reward setup, patient entry",
  "Emotional decision, revenge trade after loss",
  "Clean technical setup, textbook execution",
  "Market conditions changed, adjusted position",
  "Took profit too early, but followed rules",
  "Held through drawdown, rewarded with target hit",
]

const JOURNAL_TITLES = [
  "Successful Trading Day - Stayed Disciplined",
  "Lesson Learned: Don't Trade on Emotions",
  "Perfect Execution of My Strategy",
  "Challenging Day But Good Risk Management",
  "Breakthrough: Finally Understanding Support/Resistance",
  "Reflection: What Worked This Week",
  "Mistake Analysis: Overtrading",
  "Great Week - Consistent Profits",
]

const JOURNAL_CONTENTS = [
  "Today was a great example of following my trading plan. I waited for the right setup and didn't force trades. The EUR/USD breakout was textbook and I executed perfectly.",
  "I made a mistake today by revenge trading after an initial loss. This is something I need to work on - accepting losses as part of the game and moving on.",
  "My technical analysis is improving significantly. I'm starting to see patterns before they fully develop and my entries are getting much better.",
  "The market was choppy today but I managed my risk well. Even though I didn't make much profit, I protected my capital which is the most important thing.",
  "Had an emotional trading session. Need to work on staying calm and not letting one bad trade affect my decision-making for the rest of the day.",
  "Really proud of how I handled today. Stuck to my max trades limit and took quality setups only. This is the consistency I've been working towards.",
]

function getRandomDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0]
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max))
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function generateVirtualTrades(count = 30): VirtualTrade[] {
  const trades: VirtualTrade[] = []
  const winRate = 0.6 // 60% win rate

  for (let i = 0; i < count; i++) {
    const isWin = Math.random() < winRate
    const pair = randomElement(CURRENCY_PAIRS)
    const direction = Math.random() > 0.5 ? "Long" : "Short"

    // Generate realistic price movement
    const basePrice = randomBetween(1.0, 150.0)
    const pips = isWin ? randomInt(10, 80) : -randomInt(10, 60)
    const pipValue = pair.includes("JPY") ? 0.01 : 0.0001
    const priceMove = pips * pipValue

    const entryPrice = basePrice
    const exitPrice = direction === "Long" ? basePrice + priceMove : basePrice - priceMove

    const positionSize = randomBetween(0.5, 2.0)
    const pnl = isWin ? randomInt(100, 800) : -randomInt(50, 500)

    // Emotional states
    const confidenceBefore = isWin ? randomInt(7, 10) : randomInt(5, 8)
    const mood = isWin ? randomInt(7, 10) : randomInt(4, 7)
    const stressLevel = isWin ? randomInt(2, 5) : randomInt(5, 9)
    const discipline = isWin ? randomInt(7, 10) : randomInt(4, 8)

    trades.push({
      id: `virtual-trade-${i + 1}`,
      date: getRandomDate(count - i - 1),
      pair,
      direction,
      entryPrice: Number(entryPrice.toFixed(5)),
      exitPrice: Number(exitPrice.toFixed(5)),
      positionSize: Number(positionSize.toFixed(2)),
      pnl,
      pips,
      mood,
      confidence: confidenceBefore,
      stressLevel,
      discipline,
      emotionBefore: randomElement(EMOTIONS),
      emotionDuring: randomElement(EMOTIONS),
      emotionAfter: isWin
        ? randomElement(["Satisfied", "Confident", "Proud"])
        : randomElement(["Frustrated", "Learning", "Disappointed"]),
      notes: randomElement(TRADE_NOTES),
      tags: isWin ? ["winning-trade", "strategy"] : ["learning", "improvement"],
      followedPlan: isWin ? Math.random() > 0.2 : Math.random() > 0.5,
    })
  }

  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function generateVirtualMorningChecks(count = 30): VirtualMorningCheck[] {
  const checks: VirtualMorningCheck[] = []

  for (let i = 0; i < count; i++) {
    const sleepQuality = randomInt(5, 10)
    const sleepHours = randomBetween(6, 9)
    const energyLevel = sleepQuality >= 7 ? randomInt(7, 10) : randomInt(4, 7)
    const stressLevel = randomInt(2, 8)
    const focus = energyLevel >= 7 ? randomInt(7, 10) : randomInt(5, 9)
    const physicalHealth = randomInt(6, 10)
    const emotionalState = randomInt(5, 10)
    const exercised = Math.random() > 0.4
    const meditationTime = Math.random() > 0.5 ? randomInt(5, 30) : 0
    const morningRoutine = Math.random() > 0.3
    const hydration = randomInt(5, 10)

    const score = Math.round(
      (sleepQuality +
        energyLevel +
        focus +
        physicalHealth +
        emotionalState +
        (exercised ? 8 : 4) +
        (morningRoutine ? 8 : 4)) /
        7,
    )

    checks.push({
      id: `virtual-check-${i + 1}`,
      date: getRandomDate(count - i - 1),
      sleepQuality,
      sleepHours: Number(sleepHours.toFixed(1)),
      energyLevel,
      stressLevel,
      focus,
      physicalHealth,
      emotionalState,
      exercised,
      meditationTime,
      morningRoutine,
      hydration,
      score,
    })
  }

  return checks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function generateVirtualJournalEntries(count = 15): VirtualJournalEntry[] {
  const entries: VirtualJournalEntry[] = []

  for (let i = 0; i < count; i++) {
    entries.push({
      id: `virtual-journal-${i + 1}`,
      date: getRandomDate(Math.floor((count - i) * 2)),
      title: randomElement(JOURNAL_TITLES),
      content: randomElement(JOURNAL_CONTENTS),
      mood: randomInt(5, 10),
      tags: [randomElement(["reflection", "learning", "success", "challenge", "breakthrough"])],
      type: "reflection",
    })
  }

  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function generateVirtualAnalytics() {
  const trades = generateVirtualTrades(30)

  const winningTrades = trades.filter((t) => t.pnl > 0)
  const losingTrades = trades.filter((t) => t.pnl < 0)

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  const winRate = (winningTrades.length / trades.length) * 100

  const averageWin =
    winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0

  const averageLoss =
    losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0

  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    breakEvenTrades: trades.filter((t) => t.pnl === 0).length,
    totalPnL,
    winRate,
    averageWin,
    averageLoss,
    largestWin: Math.max(...trades.map((t) => t.pnl)),
    largestLoss: Math.min(...trades.map((t) => t.pnl)),
    profitFactor,
    uniqueTradingDays: new Set(trades.map((t) => t.date)).size,
  }
}

export function generateVirtualDailyTrackerData() {
  // Generate realistic daily tracker data with filled stages
  const today = new Date().toISOString().split("T")[0]

  // Generate random but realistic metrics
  const sleepQuality = randomInt(6, 10)
  const sleepHours = randomBetween(6.5, 8.5)
  const energyLevel = sleepQuality >= 8 ? randomInt(7, 10) : randomInt(5, 8)
  const stressLevel = randomInt(2, 7)
  const focus = energyLevel >= 7 ? randomInt(7, 10) : randomInt(5, 9)
  const physicalHealth = randomInt(7, 10)
  const emotionalState = randomInt(6, 10)
  const exercised = Math.random() > 0.3
  const meditationTime = Math.random() > 0.4 ? randomInt(10, 30) : 0
  const morningRoutine = Math.random() > 0.2
  const hydration = randomInt(6, 10)

  // Calculate readiness score based on all metrics (0-100)
  const sleepScore = (sleepQuality * 10 + sleepHours * 8) / 2
  const energyScore = energyLevel * 10
  const stressScore = (10 - stressLevel) * 8
  const focusScore = focus * 10
  const healthScore = physicalHealth * 10
  const emotionalScore = emotionalState * 10
  const exerciseBonus = exercised ? 50 : 20
  const routineBonus = morningRoutine ? 40 : 10
  const hydrationScore = hydration * 8

  const totalScore =
    (sleepScore +
      energyScore +
      stressScore +
      focusScore +
      healthScore +
      emotionalScore +
      exerciseBonus +
      routineBonus +
      hydrationScore) /
    9
  const score = Math.max(0, Math.min(100, Math.round(totalScore / 10)))

  const morningCheck: VirtualMorningCheck = {
    id: `virtual-morning-${today}`,
    date: today,
    sleepQuality,
    sleepHours: Number(sleepHours.toFixed(1)),
    energyLevel,
    stressLevel,
    focus,
    physicalHealth,
    emotionalState,
    exercised,
    meditationTime,
    morningRoutine,
    hydration,
    score,
  }

  // Generate dynamic insight based on the metrics
  let insight = ""
  if (score >= 80) {
    insight = `Vynikající readiness (${score}%)! Jsi plně připravený na obchodování. Tvá vysoká úroveň focusu (${focus}/10) a ${stressLevel <= 4 ? "nízký stres" : "zvládnutelný stres"} (${stressLevel}/10) vytváří optimální podmínky pro disciplinované rozhodování.`
  } else if (score >= 70) {
    insight = `Dobrá readiness (${score}%). Jsi připravený obchodovat, ale sleduj své ${stressLevel > 5 ? "úrovně stresu" : energyLevel < 7 ? "energii" : "focus"}. ${exercised ? "Cvičení ti pomohlo!" : "Zkus krátké cvičení před tradingem."}`
  } else if (score >= 60) {
    insight = `Přijatelná readiness (${score}%). Zvaž redukci risku a počtu tradů. ${sleepQuality < 7 ? `Spánek (${sleepQuality}/10) není ideální.` : ""} ${stressLevel > 6 ? `Vysoký stres (${stressLevel}/10) může ovlivnit rozhodování.` : ""}`
  } else {
    insight = `Nízká readiness (${score}%). Dnes je lepší den na odpočinek nebo vzdělávání místo tradingu. ${sleepQuality < 6 ? `Nedostatečný spánek (${sleepQuality}/10).` : ""} ${stressLevel > 7 ? `Vysoký stres (${stressLevel}/10).` : ""} ${focus < 6 ? `Nízký focus (${focus}/10).` : ""}`
  }

  return {
    morningCheck,
    todayScore: score,
    insight,
  }
}

export function generateVirtualJournalStats() {
  const trades = generateVirtualTrades(30)
  const journalEntries = generateVirtualJournalEntries(10)

  const winningTrades = trades.filter((t) => t.pnl > 0)
  const losingTrades = trades.filter((t) => t.pnl < 0)

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)

  // This week stats (last 7 days)
  const weekTrades = trades.filter((t) => {
    const tradeDate = new Date(t.date)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return tradeDate >= weekAgo
  })

  const weekPnL = weekTrades.reduce((sum, t) => sum + t.pnl, 0)

  // This month stats (last 30 days)
  const monthTrades = trades.filter((t) => {
    const tradeDate = new Date(t.date)
    const today = new Date()
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    return tradeDate >= monthAgo
  })

  // Calculate best and worst days
  const tradeDays = new Map<string, number>()
  trades.forEach((trade) => {
    const current = tradeDays.get(trade.date) || 0
    tradeDays.set(trade.date, current + trade.pnl)
  })

  const bestDay = Math.max(...Array.from(tradeDays.values()), 0)
  const worstDay = Math.min(...Array.from(tradeDays.values()), 0)

  // Average mood from all entries (trades + journal)
  const allEntries = [...trades, ...journalEntries]
  const moodEntries = allEntries.filter((e) => e.mood !== undefined && e.mood !== null)
  const avgMood = moodEntries.length > 0 
    ? Math.min(Math.round((moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length) * 10) / 10, 10)
    : 7.5

  // Calculate streak (consecutive days with entries)
  const sortedDates = Array.from(new Set([...trades.map((t) => t.date), ...journalEntries.map((j) => j.date)]))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let streak = 0
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const dateStr of sortedDates) {
    const entryDate = new Date(dateStr)
    entryDate.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === streak) {
      streak++
    } else if (diffDays > streak) {
      break
    }
  }

  // Average win and loss
  const avgWin = winningTrades.length > 0 
    ? Math.round((winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length) * 100) / 100
    : 0

  const avgLoss = losingTrades.length > 0 
    ? Math.round((losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length) * 100) / 100
    : 0

  const totalEntries = trades.length + journalEntries.length

  return {
    totalEntries,
    celkem: totalEntries,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    thisWeek: weekTrades.length + journalEntries.filter((j) => {
      const entryDate = new Date(j.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    }).length,
    thisMonth: monthTrades.length + journalEntries.length,
    avgPerDay: (totalEntries / 30).toFixed(1),
    avgPerTrade: trades.length > 0 ? Math.round(totalPnL / trades.length) : 0,
    weekPnL: Math.round(weekPnL),
    totalPnL: Math.round(totalPnL * 100) / 100,
    winRate: trades.length > 0 ? Math.round((winningTrades.length / trades.length) * 100) : 0,
    streak,
    bestDay: Math.round(bestDay * 100) / 100,
    worstDay: Math.round(worstDay * 100) / 100,
    avgMood,
    avgWin,
    avgLoss,
  }
}

export function generateDemoData(tradingStyle: string) {
  const trades = generateVirtualTrades(30)
  const journalEntries = generateVirtualJournalEntries(15)
  const morningChecks = generateVirtualMorningChecks(30)

  // Calculate psychological analysis metrics
  const avgMood = trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + t.mood, 0) / trades.length) : 0
  const avgStress =
    trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + t.stressLevel, 0) / trades.length) : 0
  const avgDiscipline =
    trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + t.discipline, 0) / trades.length) : 0
  const avgConfidence =
    trades.length > 0 ? Math.round(trades.reduce((sum, t) => sum + t.confidence, 0) / trades.length) : 0

  const winRate = trades.length > 0 ? Math.round((trades.filter((t) => t.pnl > 0).length / trades.length) * 100) : 0
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)

  return {
    summary: {
      totalTrades: trades.length,
      weeks: 4,
      uniqueDays: new Set(trades.map((t) => t.date)).size,
      totalPnL,
      winRate,
      avgMood,
      avgStress,
      avgDiscipline,
      avgConfidence,
    },
    weeklyPerformanceData: [],
    dailyMoodData: [],
    weekdayChartData: [],
    psychInsights: [
      {
        category: "Discipline",
        score: avgDiscipline,
        message: `Tvá disciplína je na úrovni ${avgDiscipline}%. ${avgDiscipline > 75 ? "Excelentní!" : avgDiscipline > 60 ? "Dobré, ale máš prostor pro zlepšení." : "Potřebuješ se zaměřit na dodržování plánu."}`,
      },
      {
        category: "Stress Management",
        score: 100 - avgStress,
        message: `Stres na úrovni ${avgStress}%. ${avgStress < 50 ? "Velmi dobré zvládání stresu!" : avgStress < 70 ? "Moderovaný stres, pracuj na técích relaxace." : "Vysoký stres, zvaž užívání krizovych technik."}`,
      },
      {
        category: "Emotional Control",
        score: avgMood,
        message: `Emoční stabilita: ${avgMood}/10. ${avgMood > 7 ? "Velmi stabilní!" : avgMood > 5 ? "Dobrá, ale nepředvídatelná." : "Potřebuješ delší práci na emočním řízení."}`,
      },
      {
        category: "Trading Consistency",
        score: winRate,
        message: `Win rate: ${winRate}%. ${winRate > 60 ? "Skvělá konzistentnost!" : winRate > 50 ? "Slušné, ale máš prostor." : "Pracuj na kvalitě setupů."}`,
      },
    ],
    actionPlan: [
      {
        priority: "high" as const,
        emoji: "📊",
        title: "Analyze Your Patterns",
        description: "Review your virtual trades to understand your trading patterns.",
        action: "Look at the trades above and identify what worked best.",
        impact: "Better understanding of your strengths and weaknesses.",
      },
      {
        priority: "medium" as const,
        emoji: "✍️",
        title: "Journal Your Insights",
        description: "Document what you've learned from this virtual trading session.",
        action: "Write down 3 key learnings and your action items.",
        impact: "Faster improvement and better decision-making.",
      },
    ],
  }
}
