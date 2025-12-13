export interface RandomTradeData {
  id: string
  date: string
  type: "trade"
  title: string
  content: string
  pair: string
  tradeType: "LONG" | "SHORT"
  openDate: string
  closeDate: string
  openTime: string
  closeTime: string
  pips: number
  positionSize: number
  profitLoss: number
  pnl: number
  emotionBefore: string
  emotionDuring: string
  emotionAfter: string
  confidenceLevel: number
  stressLevel: number
  entryReason: string
  exitReason: string
  whatWorked: string
  whatDidntWork: string
  lessons: string
  marketConditions: string
  notes: string
  tags: string[]
  mood: number
  // Behavior fields
  symbol: string
  matchedPlan: boolean
  exitedEarly: boolean
  missedDueToHesitation: boolean
  revengeTrade: boolean
  tradingSession: string
  tradeTypeAuto: string
  timestamp: number
}

const PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "NZD/USD",
  "USD/CAD",
  "USD/CHF",
  "XAU/USD",
  "GBP/JPY",
  "EUR/GBP",
]
const SETUPS = [
  "Breakout",
  "Pullback",
  "Reversal",
  "Trend Follow",
  "Range Trading",
  "Gap Fill",
  "Support/Resistance",
  "Moving Average Cross",
]
const EMOTIONS = [
  "Klidný",
  "Sebevědomý",
  "Úzkostný",
  "Vzrušený",
  "Frustrovaný",
  "Neutrální",
  "Nervózní",
  "Chamtivý",
  "Trpělivý",
  "Netrpělivý",
]
const MARKET_CONDITIONS = [
  "Trending",
  "Ranging",
  "Volatile",
  "Choppy",
  "Low volume",
  "High volume",
  "News-driven",
  "Technical breakout",
]
const SESSIONS = ["Asian", "London", "New York", "London/NY Overlap"]
const TRADE_TYPES = ["Scalp", "Day Trade", "Swing", "Position"]
const ENTRY_REASONS = [
  "Breakout nad resistance",
  "Pullback do supportu",
  "Double bottom formace",
  "Divergence na RSI",
  "Break struktury",
  "Order block reakce",
  "Fibonacci retracement",
  "Trendline bounce",
]
const EXIT_REASONS = [
  "Target profit dosažen",
  "Stop loss hit",
  "Trailing stop",
  "Manuální výstup",
  "Časový výstup",
  "Reverse signal",
  "Break-even",
  "Partial profit",
]

function generateRandomTime(): string {
  const hours = Math.floor(Math.random() * 14) + 7 // 07:00 - 21:00
  const minutes = Math.floor(Math.random() * 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function generateRandomTrade(customDate?: Date): RandomTradeData {
  const date = customDate || new Date()
  const dateStr = date.toISOString().split("T")[0]

  const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)]
  const direction: "LONG" | "SHORT" = Math.random() > 0.5 ? "LONG" : "SHORT"
  const isWin = Math.random() > 0.4 // 60% win rate
  const pips = isWin ? Math.floor(Math.random() * 80) + 10 : -(Math.floor(Math.random() * 50) + 10)
  const positionSize = Math.round((Math.random() * 0.5 + 0.01) * 100) / 100 // 0.01 - 0.51 lots
  const profitLoss = isWin
    ? Math.round((Math.random() * 800 + 50) * 100) / 100
    : -Math.round((Math.random() * 400 + 30) * 100) / 100

  // Revenge trade logic - 15% chance after loss
  const isRevengeTrade = !isWin && Math.random() < 0.15

  // Emotions based on trade outcome
  let emotionBefore = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
  let emotionDuring = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
  const emotionAfter = isWin ? "Spokojený" : isRevengeTrade ? "Frustrovaný" : "Zklamaný"

  if (isRevengeTrade) {
    emotionBefore = "Frustrovaný"
    emotionDuring = "Netrpělivý"
  }

  const confidenceLevel = isWin ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 4) + 4
  const stressLevel = isRevengeTrade ? Math.floor(Math.random() * 3) + 7 : Math.floor(Math.random() * 5) + 3

  const setup = SETUPS[Math.floor(Math.random() * SETUPS.length)]
  const entryReason = ENTRY_REASONS[Math.floor(Math.random() * ENTRY_REASONS.length)]
  const exitReason = isWin ? EXIT_REASONS[0] : EXIT_REASONS[Math.floor(Math.random() * 4) + 1]

  const openTime = generateRandomTime()
  // Close time is 15min - 4hours after open
  const openHour = Number.parseInt(openTime.split(":")[0])
  const closeHour = Math.min(21, openHour + Math.floor(Math.random() * 4) + 1)
  const closeTime = `${closeHour.toString().padStart(2, "0")}:${Math.floor(Math.random() * 60)
    .toString()
    .padStart(2, "0")}`

  const tags: string[] = []
  if (isWin) tags.push("win")
  else tags.push("loss")
  if (isRevengeTrade) tags.push("revenge")
  if (Math.random() > 0.7) tags.push("A+ setup")
  if (!isWin && Math.random() > 0.6) tags.push("FOMO")
  if (isWin && Math.random() > 0.5) tags.push("disciplined")

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: dateStr,
    type: "trade",
    title: `${pair} ${direction} - ${setup}`,
    content: `${direction} trade na ${pair}. ${isWin ? "Ziskový" : "Ztrátový"} obchod s ${Math.abs(pips)} pips.`,
    pair,
    tradeType: direction,
    openDate: dateStr,
    closeDate: dateStr,
    openTime,
    closeTime,
    pips,
    positionSize,
    profitLoss,
    pnl: profitLoss,
    emotionBefore,
    emotionDuring,
    emotionAfter,
    confidenceLevel,
    stressLevel,
    entryReason,
    exitReason,
    whatWorked: isWin ? `${setup} setup fungoval perfektně. Dobrý timing vstupu.` : "",
    whatDidntWork: !isWin ? "Měl jsem počkat na lepší potvrzení. Vstup byl předčasný." : "",
    lessons: isWin
      ? "Držet se plánu se vyplácí. Trpělivost je klíč."
      : isRevengeTrade
        ? "Nedělat revenge trades! Počkat na další kvalitní setup."
        : "Lépe analyzovat market conditions před vstupem.",
    marketConditions: MARKET_CONDITIONS[Math.floor(Math.random() * MARKET_CONDITIONS.length)],
    notes: isRevengeTrade
      ? "Tohle byl revenge trade po předchozí ztrátě. Příště musím dodržet pravidla!"
      : `Trade podle ${setup} strategie. ${isWin ? "Dobrá exekuce." : "Příště lépe analyzovat."}`,
    tags,
    mood: isWin ? Math.floor(Math.random() * 2) + 7 : Math.floor(Math.random() * 3) + 4,
    symbol: pair,
    matchedPlan: !isRevengeTrade && Math.random() > 0.2,
    exitedEarly: !isWin && Math.random() > 0.6,
    missedDueToHesitation: !isWin && Math.random() > 0.7,
    revengeTrade: isRevengeTrade,
    tradingSession: SESSIONS[Math.floor(Math.random() * SESSIONS.length)],
    tradeTypeAuto: TRADE_TYPES[Math.floor(Math.random() * TRADE_TYPES.length)],
    timestamp: date.getTime(),
  }
}

export function generateRandomReadinessData(customDate?: Date) {
  const date = customDate || new Date()
  const dateStr = date.toISOString().split("T")[0]

  const sleep = Math.floor(Math.random() * 4) + 5 // 5-9 hours
  const mood = Math.floor(Math.random() * 4) + 6 // 6-10
  const focus = Math.floor(Math.random() * 4) + 6
  const energy = Math.floor(Math.random() * 4) + 6
  const stress = Math.floor(Math.random() * 5) + 1 // 1-5

  // Calculate readiness score based on factors
  const readinessScore = Math.round((sleep * 10 + mood * 10 + focus * 10 + energy * 10 + (10 - stress) * 10) / 5)

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: dateStr,
    timestamp: date.getTime(),
    sleep,
    mood,
    focus,
    energy,
    stress,
    readinessScore: Math.min(100, Math.max(0, readinessScore)),
    notes: `Dnešní readiness: ${readinessScore >= 75 ? "Cítím se dobře připravený." : readinessScore >= 50 ? "Průměrná kondice." : "Měl bych si dát pozor."}`,
    routines: {
      morning: Math.random() > 0.3,
      evening: Math.random() > 0.4,
    },
  }
}

const STAGE_THOUGHTS = {
  stage1: [
    "Cítím se připravený, mám jasný plán na dnešní session.",
    "Prošel jsem si svůj trading plán a vím co hledám.",
    "Market vypadá zajímavě, ale počkám na správný setup.",
    "Udělal jsem ranní analýzu, vím kde jsou klíčové levely.",
  ],
  stage2: [
    "První trade šel dobře, držím se plánu.",
    "Zatím bez tradesů, ale to je OK - čekám na kvalitu.",
    "Udělal jsem jeden trade, teď evaluuji situaci.",
    "Market se chová podle očekávání.",
  ],
  stage3: [
    "Neukvapuji se, čekám na správný setup.",
    "Zůstávám trpělivý, disciplína je klíč.",
    "Market je choppy, snižuji velikost pozic.",
    "Dodržuji risk management, žádné revenge trades.",
  ],
  stage4: [
    "Příležitost se objevila, vstoupil jsem disciplinovaně.",
    "Dobrý entry podle plánu.",
    "Trade běží, mám nastavený trailing stop.",
    "Částečný profit uzavřen, zbytek běží.",
  ],
  stage5: [
    "Dobrá session, dodržel jsem risk management.",
    "Dnes jsem spokojený s mým tradingem.",
    "I přes ztráty jsem se držel plánu.",
    "Naučil jsem se něco nového, zítra budu lepší.",
  ],
}

export function generateRandom5Stages(customDate?: Date) {
  const date = customDate || new Date()
  const baseTime = date.getTime()

  return {
    date: date.toISOString().split("T")[0],
    stage1: {
      completed: true,
      thoughts: STAGE_THOUGHTS.stage1[Math.floor(Math.random() * STAGE_THOUGHTS.stage1.length)],
      timestamp: baseTime - 4 * 60 * 60 * 1000, // 4 hours ago
      mood: Math.floor(Math.random() * 3) + 7,
    },
    stage2: {
      completed: true,
      thoughts: STAGE_THOUGHTS.stage2[Math.floor(Math.random() * STAGE_THOUGHTS.stage2.length)],
      timestamp: baseTime - 3 * 60 * 60 * 1000,
      mood: Math.floor(Math.random() * 3) + 6,
    },
    stage3: {
      completed: true,
      thoughts: STAGE_THOUGHTS.stage3[Math.floor(Math.random() * STAGE_THOUGHTS.stage3.length)],
      timestamp: baseTime - 2 * 60 * 60 * 1000,
      mood: Math.floor(Math.random() * 3) + 6,
    },
    stage4: {
      completed: true,
      thoughts: STAGE_THOUGHTS.stage4[Math.floor(Math.random() * STAGE_THOUGHTS.stage4.length)],
      timestamp: baseTime - 1 * 60 * 60 * 1000,
      mood: Math.floor(Math.random() * 3) + 6,
    },
    stage5: {
      completed: true,
      thoughts: STAGE_THOUGHTS.stage5[Math.floor(Math.random() * STAGE_THOUGHTS.stage5.length)],
      timestamp: baseTime,
      mood: Math.floor(Math.random() * 3) + 6,
    },
  }
}

export function getSimulatedDate(): Date {
  if (typeof window === "undefined") return new Date()
  const stored = localStorage.getItem("demo-simulated-date")
  if (stored) {
    return new Date(stored)
  }
  return new Date()
}

export function setSimulatedDate(date: Date): void {
  if (typeof window === "undefined") return
  localStorage.setItem("demo-simulated-date", date.toISOString())
}
