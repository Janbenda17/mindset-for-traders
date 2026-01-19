// Enhanced demo trade generator for VIRTUAL mode
// Generates deterministic, realistic trading data

export interface DemoTrade {
  id: string
  user_id: string
  date: string
  time: string
  pair: string
  direction: "LONG" | "SHORT"
  session: "Asian" | "London" | "New York" | "London/NY Overlap"
  
  // Prices
  entry: number
  stopLoss: number
  takeProfit: number
  exitPrice: number
  
  // Position sizing
  positionSize: number
  riskPercent: number
  
  // Outcome
  pnl: number
  pips: number
  rr: number // actual risk-reward ratio
  
  // Setup details
  setup: string
  timeframe: string
  tradeType: "Scalp" | "Day Trade" | "Swing"
  bias: string
  
  // Psychology
  confidence: number // 1-10
  emotionBefore: string
  emotionDuring: string
  emotionAfter: string
  mood: number // 1-10
  stressLevel: number // 1-10
  
  // Execution
  followedPlan: boolean
  exitedEarly: boolean
  missedDueToHesitation: boolean
  revengeTrade: boolean
  mistakes: string[]
  
  // Analysis
  notes: string
  whatWorked: string
  whatDidntWork: string
  entryReason: string
  exitReason: string
  marketConditions: string
  
  // Tags
  tags: string[]
  
  // Screenshots (optional)
  screenshots?: string[]
  
  // Metadata
  created_at: string
  updated_at: string
}

const CURRENCY_PAIRS = [
  { symbol: "EUR/USD", basePrice: 1.09, pipValue: 0.0001, volatility: 0.0015 },
  { symbol: "GBP/USD", basePrice: 1.27, pipValue: 0.0001, volatility: 0.002 },
  { symbol: "USD/JPY", basePrice: 148.5, pipValue: 0.01, volatility: 0.5 },
  { symbol: "GBP/JPY", basePrice: 189.0, pipValue: 0.01, volatility: 0.8 },
  { symbol: "AUD/USD", basePrice: 0.66, pipValue: 0.0001, volatility: 0.0012 },
  { symbol: "EUR/GBP", basePrice: 0.86, pipValue: 0.0001, volatility: 0.001 },
  { symbol: "USD/CHF", basePrice: 0.88, pipValue: 0.0001, volatility: 0.0011 },
  { symbol: "NZD/USD", basePrice: 0.61, pipValue: 0.0001, volatility: 0.0013 },
]

const SETUPS = [
  "Breakout",
  "Reversal",
  "Trend Continuation",
  "Support/Resistance",
  "Supply & Demand",
  "Moving Average Bounce",
  "Fibonacci Retracement",
  "Double Bottom",
  "Double Top",
  "Head & Shoulders",
  "Triangle Breakout",
  "Channel Trading",
]

const TIMEFRAMES = ["M5", "M15", "M30", "H1", "H4", "D1"]

const EMOTIONS_BEFORE = ["Klidný", "Sebevědomý", "Nervózní", "Nejistý", "Nadšený", "Unavený", "Soustředěný"]
const EMOTIONS_DURING = ["Klidný", "Stresovaný", "Sebevědomý", "Panický", "Soustředěný", "Trpělivý", "Netrpělivý"]
const EMOTIONS_AFTER = ["Spokojený", "Frustrovaný", "Hrdý", "Zklamaný", "Poučený", "Klidný", "Euforický"]

const MISTAKES = [
  "Vstup příliš brzy",
  "Vstup příliš pozdě",
  "Nedodržení stop loss",
  "Příliš velká pozice",
  "Obchodování během news",
  "Ignorování trendu",
  "Emocionální rozhodnutí",
  "Přeobchodování",
]

// Seeded random number generator for deterministic output
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }
}

function getSeed(userId: string, year: number, month: number): number {
  let hash = 0
  const str = `${userId}-${year}-${month}`
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getDayString(date: Date): string {
  return date.toISOString().split("T")[0]
}

function determineSession(hour: number): DemoTrade["session"] {
  if (hour >= 0 && hour < 9) return "Asian"
  if (hour >= 14 && hour < 17) return "London/NY Overlap"
  if (hour >= 9 && hour < 17) return "London"
  return "New York"
}

export function generateDemoTradesForMonth(
  userId: string,
  year: number,
  month: number,
): DemoTrade[] {
  const trades: DemoTrade[] = []
  const rng = new SeededRandom(getSeed(userId, year, month))
  
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  let tradeId = 0
  
  // Generate 1-3 trades per day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayStr = getDayString(date)
    const tradesPerDay = rng.nextInt(1, 3)
    
    for (let i = 0; i < tradesPerDay; i++) {
      const pair = rng.choice(CURRENCY_PAIRS)
      const direction = rng.next() > 0.5 ? "LONG" : "SHORT"
      const hour = rng.nextInt(8, 20)
      const minute = rng.nextInt(0, 59)
      const session = determineSession(hour)
      
      // Determine if win/loss (65% win rate)
      const isWin = rng.next() < 0.65
      const isBreakeven = !isWin && rng.next() < 0.15
      
      // Generate realistic prices
      const basePrice = pair.basePrice + rng.nextFloat(-pair.volatility, pair.volatility)
      const setup = rng.choice(SETUPS)
      const timeframe = rng.choice(TIMEFRAMES)
      
      // Position sizing (1-2% risk)
      const riskPercent = rng.nextFloat(1, 2)
      const positionSize = rng.nextFloat(0.5, 2.0)
      
      // Calculate SL/TP based on direction and risk
      const pipDistance = rng.nextInt(15, 50)
      const rrTarget = rng.nextFloat(1.5, 3.0)
      const slDistance = pipDistance * pair.pipValue
      const tpDistance = slDistance * rrTarget
      
      const entry = Number(basePrice.toFixed(pair.symbol.includes("JPY") ? 2 : 5))
      const stopLoss = Number((direction === "LONG" ? basePrice - slDistance : basePrice + slDistance).toFixed(pair.symbol.includes("JPY") ? 2 : 5))
      const takeProfit = Number((direction === "LONG" ? basePrice + tpDistance : basePrice - tpDistance).toFixed(pair.symbol.includes("JPY") ? 2 : 5))
      
      // Calculate exit and P&L
      let exitPrice: number
      let pips: number
      let actualRR: number
      
      if (isBreakeven) {
        exitPrice = entry
        pips = 0
        actualRR = 0
      } else if (isWin) {
        const partialExit = rng.next() < 0.3
        if (partialExit) {
          const exitPercentage = rng.nextFloat(0.5, 0.9)
          exitPrice = Number((direction === "LONG" 
            ? entry + (takeProfit - entry) * exitPercentage 
            : entry - (entry - takeProfit) * exitPercentage).toFixed(pair.symbol.includes("JPY") ? 2 : 5))
        } else {
          exitPrice = takeProfit
        }
        pips = Math.abs(Math.round((exitPrice - entry) / pair.pipValue))
        actualRR = Math.abs((exitPrice - entry) / (entry - stopLoss))
      } else {
        exitPrice = stopLoss
        pips = -pipDistance
        actualRR = -1
      }
      
      // Calculate P&L (simplified)
      const pnl = isBreakeven ? 0 : isWin ? rng.nextInt(100, 800) : -rng.nextInt(50, 400)
      
      // Psychology based on outcome
      const confidence = isWin ? rng.nextInt(7, 10) : rng.nextInt(5, 8)
      const mood = isWin ? rng.nextInt(7, 10) : rng.nextInt(4, 7)
      const stressLevel = isWin ? rng.nextInt(2, 5) : rng.nextInt(5, 9)
      
      // Trade type based on timeframe
      let tradeType: DemoTrade["tradeType"]
      if (["M5", "M15"].includes(timeframe)) tradeType = "Scalp"
      else if (["M30", "H1"].includes(timeframe)) tradeType = "Day Trade"
      else tradeType = "Swing"
      
      // Generate mistakes for losing trades
      const mistakes: string[] = []
      if (!isWin && rng.next() < 0.6) {
        mistakes.push(rng.choice(MISTAKES))
        if (rng.next() < 0.3) mistakes.push(rng.choice(MISTAKES.filter(m => !mistakes.includes(m))))
      }
      
      const followedPlan = isWin ? rng.next() > 0.2 : rng.next() > 0.5
      const exitedEarly = isWin && rng.next() < 0.3
      const missedDueToHesitation = !isWin && rng.next() < 0.2
      const revengeTrade = !isWin && i > 0 && rng.next() < 0.15
      
      const tags: string[] = []
      tags.push(isWin ? "výhra" : isBreakeven ? "breakeven" : "ztráta")
      tags.push(setup.toLowerCase())
      if (followedPlan) tags.push("plán-dodržen")
      if (revengeTrade) tags.push("revenge-trade")
      
      tradeId++
      
      trades.push({
        id: `demo-trade-${year}-${month}-${tradeId}`,
        user_id: userId,
        date: dayStr,
        time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        pair: pair.symbol,
        direction,
        session,
        
        entry,
        stopLoss,
        takeProfit,
        exitPrice,
        
        positionSize: Number(positionSize.toFixed(2)),
        riskPercent: Number(riskPercent.toFixed(1)),
        
        pnl,
        pips,
        rr: Number(actualRR.toFixed(2)),
        
        setup,
        timeframe,
        tradeType,
        bias: direction === "LONG" ? "Bullish" : "Bearish",
        
        confidence,
        emotionBefore: rng.choice(EMOTIONS_BEFORE),
        emotionDuring: rng.choice(EMOTIONS_DURING),
        emotionAfter: rng.choice(EMOTIONS_AFTER),
        mood,
        stressLevel,
        
        followedPlan,
        exitedEarly,
        missedDueToHesitation,
        revengeTrade,
        mistakes,
        
        notes: isWin 
          ? `Skvělý ${setup} setup na ${timeframe}. Trh se pohyboval podle očekávání.`
          : `${setup} setup na ${timeframe}. ${mistakes.length > 0 ? mistakes.join(", ") + "." : "Market podmínky se změnily."}`,
        whatWorked: isWin ? `Čistý technický setup, ${followedPlan ? "dodržení plánu" : "dobrý timing"}` : "",
        whatDidntWork: !isWin ? `${mistakes.join(", ") || "Neočekávaná volatilita"}` : "",
        entryReason: `${setup} formace na ${timeframe} s ${direction === "LONG" ? "býčím" : "medvědím"} biasem`,
        exitReason: isWin 
          ? (exitedEarly ? "Částečný profit pro jistotu" : "Dosažení TP") 
          : "Hit stop loss",
        marketConditions: session === "London/NY Overlap" ? "Vysoká volatilita" : "Normální podmínky",
        
        tags,
        
        created_at: new Date(year, month, day, hour, minute).toISOString(),
        updated_at: new Date(year, month, day, hour, minute).toISOString(),
      })
    }
  }
  
  return trades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Get or generate demo trades for current month
export function getDemoTrades(userId: string): DemoTrade[] {
  if (typeof window === "undefined") return []
  
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  const storageKey = `virtual:${userId}:trades`
  const seedKey = `virtual:${userId}:trades-seed`
  
  const currentSeed = `${year}-${month}`
  const storedSeed = localStorage.getItem(seedKey)
  
  // Check if we need to regenerate (new month or first time)
  if (storedSeed !== currentSeed) {
    console.log(`[v0] [DemoTrades] Generating new trades for ${year}-${month}`)
    const trades = generateDemoTradesForMonth(userId, year, month)
    localStorage.setItem(storageKey, JSON.stringify(trades))
    localStorage.setItem(seedKey, currentSeed)
    return trades
  }
  
  // Return existing trades
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    return JSON.parse(stored)
  }
  
  // Generate if not found
  console.log(`[v0] [DemoTrades] Generating initial trades for ${year}-${month}`)
  const trades = generateDemoTradesForMonth(userId, year, month)
  localStorage.setItem(storageKey, JSON.stringify(trades))
  localStorage.setItem(seedKey, currentSeed)
  return trades
}

// Get trades for a specific day
export function getDemoTradesForDay(userId: string, date: Date): DemoTrade[] {
  const allTrades = getDemoTrades(userId)
  const dayStr = getDayString(date)
  return allTrades.filter(trade => trade.date === dayStr)
}

// Get stats from demo trades
export interface TradeStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
  winRate: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  avgRR: number
  bestDay: number
  worstDay: number
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  tradesByPair: Record<string, number>
  tradesBySetup: Record<string, number>
}

export function calculateDemoStats(trades: DemoTrade[]): TradeStats {
  const wins = trades.filter(t => t.pnl > 0)
  const losses = trades.filter(t => t.pnl < 0)
  const breakevens = trades.filter(t => t.pnl === 0)
  
  const totalWin = wins.reduce((sum, t) => sum + t.pnl, 0)
  const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))
  
  // Calculate daily P&L
  const dailyPnL: Record<string, number> = {}
  trades.forEach(trade => {
    if (!dailyPnL[trade.date]) dailyPnL[trade.date] = 0
    dailyPnL[trade.date] += trade.pnl
  })
  
  const dailyPnLValues = Object.values(dailyPnL)
  const bestDay = dailyPnLValues.length > 0 ? Math.max(...dailyPnLValues) : 0
  const worstDay = dailyPnLValues.length > 0 ? Math.min(...dailyPnLValues) : 0
  
  // Calculate streaks
  let currentStreak = 0
  let longestWinStreak = 0
  let longestLossStreak = 0
  let tempWinStreak = 0
  let tempLossStreak = 0
  
  for (const trade of trades) {
    if (trade.pnl > 0) {
      tempWinStreak++
      tempLossStreak = 0
      currentStreak = tempWinStreak
    } else if (trade.pnl < 0) {
      tempLossStreak++
      tempWinStreak = 0
      currentStreak = -tempLossStreak
    } else {
      tempWinStreak = 0
      tempLossStreak = 0
    }
    
    longestWinStreak = Math.max(longestWinStreak, tempWinStreak)
    longestLossStreak = Math.max(longestLossStreak, tempLossStreak)
  }
  
  // Group by pair and setup
  const tradesByPair: Record<string, number> = {}
  const tradesBySetup: Record<string, number> = {}
  
  trades.forEach(trade => {
    tradesByPair[trade.pair] = (tradesByPair[trade.pair] || 0) + 1
    tradesBySetup[trade.setup] = (tradesBySetup[trade.setup] || 0) + 1
  })
  
  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakevenTrades: breakevens.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    totalPnL: trades.reduce((sum, t) => sum + t.pnl, 0),
    avgWin: wins.length > 0 ? totalWin / wins.length : 0,
    avgLoss: losses.length > 0 ? totalLoss / losses.length : 0,
    profitFactor: totalLoss > 0 ? totalWin / totalLoss : 0,
    avgRR: trades.length > 0 ? trades.reduce((sum, t) => sum + Math.abs(t.rr), 0) / trades.length : 0,
    bestDay,
    worstDay,
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    tradesByPair,
    tradesBySetup,
  }
}

// Alias for backward compatibility
export const generateDemoTrades = getDemoTrades
