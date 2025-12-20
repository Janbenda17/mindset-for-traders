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
      date: getRandomDate(count - i),
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
    const focus = energyLevel >= 7 ? randomInt(7, 10) : randomInt(5, 8)
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
      date: getRandomDate(count - i),
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
