// Storage utility functions for Trader Mindset app

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: "trader-mindset-data",
  DASHBOARD_STATS: "trader-mindset-dashboard-stats",
  JOURNAL_ENTRIES: "trader-mindset-journal-entries",
  MOOD_ENTRIES: "trader-mindset-mood-entries",
  ANALYTICS_DATA: "trader-mindset-analytics-data",
  MINDTRADER_HISTORY: "trader-mindset-mindtrader-history",
  TEAM_CLUB_DATA: "trader-mindset-team-club-data",
}

// Utility functions
export function safeJSONParse(data: string | null, fallback: any = null) {
  if (!data) return fallback
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return fallback
  }
}

export function safeJSONStringify(data: any): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error("Error stringifying JSON:", error)
    return "{}"
  }
}

// Interfaces for data types
export interface JournalEntry {
  id: string
  date: string
  type: "trade" | "journal" | "behavior"
  title: string
  content: string
  pair?: string
  direction?: "LONG" | "SHORT"
  entryPrice?: number
  exitPrice?: number
  quantity?: number
  pnl?: number
  pips?: number
  moodBefore?: number
  moodDuring?: number
  moodAfter?: number
  confidence?: number
  stress?: number
  discipline?: number
  tags?: string[]
  lessons?: string
  mistakes?: string
  improvements?: string
  profitLoss?: number
  tradeType?: "LONG" | "SHORT"
  positionSize?: number
  emotionBefore?: string
  emotionDuring?: string
  emotionAfter?: string
  confidenceLevel?: number
  stressLevel?: number
  entryReason?: string
  exitReason?: string
  whatWorked?: string
  whatDidntWork?: string
  marketConditions?: string
  notes?: string
  symbol?: string
  matchedPlan?: boolean
  exitedEarly?: boolean
  missedDueToHesitation?: boolean
  revengeTrade?: boolean
  mood?: number
}

export interface MoodEntry {
  id: string
  date: string
  mood: number
  confidence: number
  stress: number
  notes?: string
}

export interface TradingData {
  totalPnL: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  maxDrawdown: number
  averageMood: number
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface RegisteredUser extends User {
  password?: string
}

export interface TradingEntry {
  date: string
  symbol: string
  type: "long" | "short"
  entryPrice: number
  exitPrice: number
  profitLoss: number
  outcome: "profit" | "loss" | "breakeven"
  notes?: string
}

export interface CustomAffirmation {
  text: string
}

export interface Subscription {
  plan: "free" | "premium"
  startDate?: string
  endDate?: string
  isLiveMode?: boolean
}

export interface MindTraderDailyAssessment {
  date: string
  mood: number
  experience: string
  recommendation: string
}

export interface MindTraderNotificationSettings {
  dailyAssessment: boolean
  strategyRecommendations: boolean
}

export interface UserData {
  user: User | null
  registeredUsers: RegisteredUser[]
  moodEntries: MoodEntry[]
  journalEntries: JournalEntry[]
  tradingData: TradingEntry[]
  customAffirmations: CustomAffirmation[]
  subscription: Subscription | null
  mindTraderHistory: MindTraderDailyAssessment[]
  mindTraderNotifications: MindTraderNotificationSettings
}

const STORAGE_KEY = "trader-mindset-data"

// Sample data for demonstration (only for virtual mode)
function getSampleJournalEntries(): JournalEntry[] {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const fourDaysAgo = new Date(today)
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)
  const fiveDaysAgo = new Date(today)
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
  const sixDaysAgo = new Date(today)
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return [
    {
      id: "sample-1",
      date: today.toISOString().split("T")[0],
      title: "EUR/USD Long pozice - Breakout",
      content:
        "Výborný obchod podle strategie. Trh se choval přesně podle očekávání. Dodržel jsem risk management a vzal zisk na správném místě. Breakout z consolidace fungoval perfektně.",
      type: "trade",
      pair: "EUR/USD",
      direction: "LONG",
      entryPrice: 1.085,
      exitPrice: 1.089,
      quantity: 0.1,
      pnl: 150.0,
      pips: 40,
      moodBefore: 8,
      moodDuring: 7,
      moodAfter: 9,
      confidence: 8,
      stress: 3,
      discipline: 9,
      tags: ["EUR/USD", "breakout", "zisk", "disciplína"],
      lessons: "Důležitost čekání na správný setup a potvrzení breakoutu",
      notes: "Trpělivost a dodržení plánu se vyplatily",
      profitLoss: 150.0,
      confidenceLevel: 8,
      stressLevel: 3,
      entryReason: "Breakout z consolidace s vysokým objemem",
      exitReason: "Dosažení target profit na resistance",
      whatWorked: "Čekání na potvrzení, správný timing",
      whatDidntWork: "Nic, obchod proběhl podle plánu",
      marketConditions: "Trending market, vysoká volatilita",
    },
    {
      id: "sample-2",
      date: yesterday.toISOString().split("T")[0],
      title: "GBP/JPY Short - Ztráta z impulzu",
      content:
        "Bohužel jsem nedodržel stop loss a nechal ztrátu narůst. Emocionální rozhodování mě stálo více, než bylo nutné. Poučení do budoucna.",
      type: "trade",
      pair: "GBP/JPY",
      direction: "SHORT",
      entryPrice: 185.5,
      exitPrice: 186.2,
      quantity: 0.05,
      pnl: -85.0,
      pips: -70,
      moodBefore: 4,
      moodDuring: 3,
      moodAfter: 5,
      confidence: 6,
      stress: 8,
      discipline: 4,
      tags: ["GBP/JPY", "ztráta", "poučení", "emoce"],
      lessons: "Nikdy neposunovat stop loss proti sobě",
      notes: "Správná analýza vstupu, ale špatné řízení pozice",
      profitLoss: -85.0,
      confidenceLevel: 6,
      stressLevel: 8,
      entryReason: "Reversal pattern na resistance",
      exitReason: "Manuální exit po strachu z dalších ztrát",
      whatWorked: "Dobrá analýza entry pointu",
      whatDidntWork: "Nedodržení stop loss, emocionální rozhodování",
      marketConditions: "Choppy market, nízká volatilita",
    },
    {
      id: "sample-3",
      date: twoDaysAgo.toISOString().split("T")[0],
      title: "Ranní reflexe a příprava",
      content:
        "Dnes se cítím dobře a připravený na trading. Včera jsem si prošel své chyby a vím, na co se zaměřit. Plánujem být trpělivější a čekat na lepší setupy. Důležité je zůstat disciplinovaný.",
      type: "journal",
      moodBefore: 7,
      confidence: 8,
      stress: 2,
      discipline: 9,
      tags: ["reflexe", "příprava", "mindset", "disciplína"],
      notes: "Důležité je zůstat disciplinovaný a nepospíchat s rozhodnutími.",
      mood: 7,
      confidenceLevel: 8,
      stressLevel: 2,
    },
    {
      id: "sample-4",
      date: threeDaysAgo.toISOString().split("T")[0],
      title: "USD/CAD Swing Trade - Týdenní pozice",
      content:
        "Dlouhodobější pozice založená na týdenní analýze. Držím již 3 dny a zatím se vyvíjí podle plánu. Trpělivost je klíčová u swing tradingu.",
      type: "trade",
      pair: "USD/CAD",
      direction: "LONG",
      entryPrice: 1.352,
      exitPrice: 1.358,
      quantity: 0.15,
      pnl: 180.0,
      pips: 60,
      moodBefore: 8,
      moodDuring: 8,
      moodAfter: 9,
      confidence: 9,
      stress: 2,
      discipline: 10,
      tags: ["USD/CAD", "swing", "zisk", "trpělivost"],
      lessons: "Swing trading vyžaduje trpělivost, ale může být velmi ziskový",
      profitLoss: 180.0,
      confidenceLevel: 9,
      stressLevel: 2,
      entryReason: "Weekly trend continuation, support hold",
      exitReason: "Partial profit taking na resistance",
      whatWorked: "Trpělivost, správný timing entry",
      whatDidntWork: "Mohl jsem držet déle pro větší zisk",
      marketConditions: "Strong trending market",
    },
    {
      id: "sample-5",
      date: fourDaysAgo.toISOString().split("T")[0],
      title: "Impulzivní vstup - Behavioral Analysis",
      content:
        "Vstoupil jsem do obchodu bez řádné analýzy, pouze na základě FOMO. Naštěstí jsem rychle uzavřel s malou ztrátou. Musím pracovat na disciplíně.",
      type: "behavior",
      symbol: "EUR/GBP",
      matchedPlan: false,
      exitedEarly: true,
      missedDueToHesitation: false,
      revengeTrade: false,
      moodBefore: 5,
      confidence: 3,
      stress: 8,
      discipline: 2,
      tags: ["FOMO", "impulzivnost", "disciplína", "poučení"],
      notes: "Musím se více soustředit na disciplínu a čekat na správné signály.",
      mood: 5,
      confidenceLevel: 3,
      stressLevel: 8,
      profitLoss: -25.0,
    },
    {
      id: "sample-6",
      date: fiveDaysAgo.toISOString().split("T")[0],
      title: "AUD/USD Trend Following",
      content:
        "Perfektní trend following obchod. Vstup na pullback k moving average, exit na resistance. Vše podle knihy.",
      type: "trade",
      pair: "AUD/USD",
      direction: "LONG",
      entryPrice: 0.672,
      exitPrice: 0.678,
      quantity: 0.2,
      pnl: 240.0,
      pips: 60,
      moodBefore: 8,
      moodDuring: 8,
      moodAfter: 9,
      confidence: 9,
      stress: 2,
      discipline: 10,
      tags: ["AUD/USD", "trend", "zisk", "MA"],
      lessons: "Trend following s pullbacky je velmi efektivní strategie",
      profitLoss: 240.0,
      confidenceLevel: 9,
      stressLevel: 2,
      entryReason: "Pullback to 20 EMA in uptrend",
      exitReason: "Target reached at resistance level",
      whatWorked: "Čekání na pullback, správný entry timing",
      whatDidntWork: "Nic, perfektní execution",
      marketConditions: "Strong uptrend, good momentum",
    },
    {
      id: "sample-7",
      date: sixDaysAgo.toISOString().split("T")[0],
      title: "Večerní zhodnocení týdne",
      content:
        "Týden byl celkově úspěšný. 4 ziskové obchody z 6, dodržel jsem disciplínu až na jeden impulzivní vstup. Pracuji na zlepšení trpělivosti a čekání na A+ setupy.",
      type: "journal",
      moodBefore: 7,
      confidence: 8,
      stress: 3,
      discipline: 8,
      tags: ["týdenní review", "zhodnocení", "pokrok"],
      notes: "Celkově dobrý týden, ale stále je co zlepšovat",
      mood: 7,
      confidenceLevel: 8,
      stressLevel: 3,
    },
    {
      id: "sample-8",
      date: sevenDaysAgo.toISOString().split("T")[0],
      title: "GBP/USD Scalping Session",
      content: "Rychlá scalping session během London session. 3 malé zisky, dodržel jsem pravidla pro scalping.",
      type: "trade",
      pair: "GBP/USD",
      direction: "LONG",
      entryPrice: 1.268,
      exitPrice: 1.27,
      quantity: 0.3,
      pnl: 90.0,
      pips: 20,
      moodBefore: 7,
      moodDuring: 8,
      moodAfter: 8,
      confidence: 7,
      stress: 4,
      discipline: 8,
      tags: ["GBP/USD", "scalping", "London session"],
      lessons: "Scalping vyžaduje rychlé rozhodování a disciplínu",
      profitLoss: 90.0,
      confidenceLevel: 7,
      stressLevel: 4,
      entryReason: "London breakout, high volume",
      exitReason: "Quick profit target hit",
      whatWorked: "Rychlé rozhodování, dobrý timing",
      whatDidntWork: "Mohl jsem počkat na větší move",
      marketConditions: "High volatility London session",
    },
  ]
}

function getSampleMoodEntries(): MoodEntry[] {
  const today = new Date()
  const entries = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    entries.push({
      id: `mood-sample-${i}`,
      date: date.toISOString().split("T")[0],
      mood: Math.floor(Math.random() * 4) + 6, // 6-9 for good demo data
      confidence: Math.floor(Math.random() * 4) + 6,
      stress: Math.floor(Math.random() * 4) + 2, // 2-5 for reasonable stress
      notes:
        i === 0
          ? "Dobrý den, ziskový obchod"
          : i === 1
            ? "Ztráta, ale poučný den"
            : i === 2
              ? "Výborná příprava a disciplína"
              : i === 3
                ? "FOMO obchod, zklamání"
                : i === 4
                  ? "Perfektní swing trade"
                  : i === 5
                    ? "Týdenní review, celkově dobře"
                    : "Scalping session, rychlé zisky",
    })
  }

  return entries
}

function getSampleTradingData(): TradingEntry[] {
  const today = new Date()
  const entries = []

  const sampleTrades = [
    {
      symbol: "EUR/USD",
      type: "long",
      entryPrice: 1.085,
      exitPrice: 1.089,
      profitLoss: 150.0,
      outcome: "profit",
      notes: "Breakout trade",
    },
    {
      symbol: "GBP/JPY",
      type: "short",
      entryPrice: 185.5,
      exitPrice: 186.2,
      profitLoss: -85.0,
      outcome: "loss",
      notes: "Nedodržení SL",
    },
    {
      symbol: "USD/CAD",
      type: "long",
      entryPrice: 1.352,
      exitPrice: 1.358,
      profitLoss: 180.0,
      outcome: "profit",
      notes: "Swing trade",
    },
    {
      symbol: "EUR/GBP",
      type: "short",
      entryPrice: 0.865,
      exitPrice: 0.867,
      profitLoss: -25.0,
      outcome: "loss",
      notes: "FOMO vstup",
    },
    {
      symbol: "AUD/USD",
      type: "long",
      entryPrice: 0.672,
      exitPrice: 0.678,
      profitLoss: 240.0,
      outcome: "profit",
      notes: "Trend following",
    },
    {
      symbol: "GBP/USD",
      type: "long",
      entryPrice: 1.268,
      exitPrice: 1.27,
      profitLoss: 90.0,
      outcome: "profit",
      notes: "Scalping",
    },
    {
      symbol: "USD/JPY",
      type: "short",
      entryPrice: 148.5,
      exitPrice: 147.8,
      profitLoss: 120.0,
      outcome: "profit",
      notes: "Reversal trade",
    },
  ]

  sampleTrades.forEach((trade, index) => {
    const date = new Date(today)
    date.setDate(date.getDate() - index)

    entries.push({
      date: date.toISOString().split("T")[0],
      symbol: trade.symbol,
      type: trade.type as "long" | "short",
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      profitLoss: trade.profitLoss,
      outcome: trade.outcome as "profit" | "loss" | "breakeven",
      notes: trade.notes,
    })
  })

  return entries
}

function getDefaultUserData(): UserData {
  return {
    user: null,
    registeredUsers: [],
    moodEntries: [],
    journalEntries: [],
    tradingData: [],
    customAffirmations: [],
    subscription: { plan: "free" },
    mindTraderHistory: [],
    mindTraderNotifications: { dailyAssessment: true, strategyRecommendations: true },
  }
}

// Check if we're in live mode
function isLiveMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("trader-mindset-live-mode") === "true"
}

// Main storage functions
export function getUserData(): UserData {
  if (typeof window === "undefined") {
    return getDefaultUserData()
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    const liveMode = isLiveMode()

    if (!data) {
      const defaultData = getDefaultUserData()

      // Add sample data only if NOT in live mode
      if (!liveMode) {
        defaultData.journalEntries = getSampleJournalEntries()
        defaultData.moodEntries = getSampleMoodEntries()
        defaultData.tradingData = getSampleTradingData()
      }

      setUserData(defaultData)
      return defaultData
    }

    const parsedData: Partial<UserData> = JSON.parse(data)
    const fullData = { ...getDefaultUserData(), ...parsedData }

    // If in virtual mode and no data exists, add sample data
    if (!liveMode) {
      if (!fullData.journalEntries || fullData.journalEntries.length === 0) {
        fullData.journalEntries = getSampleJournalEntries()
      }
      if (!fullData.moodEntries || fullData.moodEntries.length === 0) {
        fullData.moodEntries = getSampleMoodEntries()
      }
      if (!fullData.tradingData || fullData.tradingData.length === 0) {
        fullData.tradingData = getSampleTradingData()
      }
    } else {
      // In live mode, ensure we don't have sample data
      if (fullData.journalEntries && fullData.journalEntries.some((entry) => entry.id.startsWith("sample-"))) {
        fullData.journalEntries = fullData.journalEntries.filter((entry) => !entry.id.startsWith("sample-"))
      }
      if (fullData.moodEntries && fullData.moodEntries.some((entry) => entry.id.startsWith("mood-sample-"))) {
        fullData.moodEntries = fullData.moodEntries.filter((entry) => !entry.id.startsWith("mood-sample-"))
      }
    }

    return fullData
  } catch (error) {
    console.error("Error parsing user data from localStorage", error)
    localStorage.removeItem(STORAGE_KEY)
    const defaultData = getDefaultUserData()

    // Add sample data only if NOT in live mode
    if (!isLiveMode()) {
      defaultData.journalEntries = getSampleJournalEntries()
      defaultData.moodEntries = getSampleMoodEntries()
      defaultData.tradingData = getSampleTradingData()
    }

    setUserData(defaultData)
    return defaultData
  }
}

export function setUserData(data: UserData): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    // Dispatch custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent("storage-updated", {
        detail: { key: STORAGE_KEY },
      }),
    )
  } catch (error) {
    console.error("Error saving user data to localStorage:", error)
  }
}

export function saveUserData(data: UserData): void {
  setUserData(data)
}

export function clearUserData(): void {
  if (typeof window === "undefined") {
    return
  }
  localStorage.removeItem(STORAGE_KEY)
}

// Clear all data when switching to live mode
export function clearAllDemoData(): void {
  if (typeof window === "undefined") {
    return
  }

  // Clear all demo data storage keys
  const keysToRemove = [
    STORAGE_KEY,
    "trader-mindset-dashboard-stats",
    "trader-mindset-performance-data",
    "trader-mindset-trading-data",
    "trader-mindset-journal-entries",
    "trader-mindset-mood-entries",
    "trader-mindset-analytics-data",
    "trader-mindset-emotional-data",
    "trader-mindset-trading-patterns",
    "trader-mindset-risk-data",
    "trader-mindset-mindtrader-history",
    "trader-mindset-custom-affirmations",
    "trader-mindset-team-club-data",
  ]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  // Initialize empty data for live mode
  const emptyData = getDefaultUserData()
  setUserData(emptyData)
}

// Journal entries
export const getJournalEntries = (): JournalEntry[] => {
  if (typeof window === "undefined") return []

  const liveMode = isLiveMode()

  if (liveMode) {
    // Live mode - get real user data
    const userData = getUserData()
    return userData.journalEntries || []
  } else {
    // Virtual mode - return demo data
    return getSampleJournalEntries()
  }
}

export const saveJournalEntry = (entry: any): void => {
  if (typeof window === "undefined") return

  // Generate ID if not provided
  if (!entry.id) {
    entry.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  const liveMode = isLiveMode()

  if (liveMode) {
    // Only save in live mode
    const userData = getUserData()
    const entries = userData.journalEntries || []
    const existingIndex = entries.findIndex((e) => e.id === entry.id)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    userData.journalEntries = entries
    setUserData(userData)
  }
  // In virtual mode, don't save - just use demo data
}

export const deleteJournalEntry = (id: string): void => {
  if (typeof window === "undefined") return

  const liveMode = isLiveMode()

  if (liveMode) {
    // Only delete in live mode
    const userData = getUserData()
    userData.journalEntries = (userData.journalEntries || []).filter((entry) => entry.id !== id)
    setUserData(userData)
  }
  // In virtual mode, don't delete demo data
}

// Mood entries
export const getMoodEntries = (): MoodEntry[] => {
  if (typeof window === "undefined") return []

  const liveMode = isLiveMode()

  if (liveMode) {
    const userData = getUserData()
    return userData.moodEntries || []
  } else {
    // Virtual mode - return demo data
    return getSampleMoodEntries()
  }
}

export const saveMoodEntry = (entry: MoodEntry): void => {
  if (typeof window === "undefined") return

  const liveMode = isLiveMode()

  if (liveMode) {
    const userData = getUserData()
    const entries = userData.moodEntries || []
    const existingIndex = entries.findIndex((e) => e.date === entry.date)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    userData.moodEntries = entries
    setUserData(userData)
  }
}

// Trading data
export const getTradingData = (): TradingEntry[] => {
  if (typeof window === "undefined") return []

  const liveMode = isLiveMode()

  if (liveMode) {
    const userData = getUserData()
    return userData.tradingData || []
  } else {
    // Virtual mode - return demo data
    return getSampleTradingData()
  }
}

export const saveTradingData = (data: TradingEntry[]): void => {
  if (typeof window === "undefined") return

  const liveMode = isLiveMode()

  if (liveMode) {
    const userData = getUserData()
    userData.tradingData = data
    setUserData(userData)
  }
}

export const calculateTradingStats = (): TradingData => {
  const entries = getTradingData()
  const totalPnL = entries.reduce((sum, entry) => sum + entry.profitLoss, 0)
  const totalTrades = entries.length
  const winningTrades = entries.filter((entry) => entry.outcome === "profit").length
  const losingTrades = entries.filter((entry) => entry.outcome === "loss").length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  const wins = entries.filter((entry) => entry.outcome === "profit").map((entry) => entry.profitLoss)
  const losses = entries.filter((entry) => entry.outcome === "loss").map((entry) => entry.profitLoss)

  const averageWin = wins.length > 0 ? wins.reduce((sum, win) => sum + win, 0) / wins.length : 0
  const averageLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0

  const profitFactor = averageLoss !== 0 ? Math.abs(averageWin / averageLoss) : 0
  const maxDrawdown = Math.min(...entries.map((entry) => entry.profitLoss), 0)

  const moodEntries = getMoodEntries()
  const averageMood =
    moodEntries.length > 0 ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length : 0

  const stats: TradingData = {
    totalPnL,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    averageWin,
    averageLoss,
    profitFactor,
    maxDrawdown,
    averageMood,
  }

  return stats
}

// Analytics data
export function getAnalyticsData() {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS_DATA)
  return safeJSONParse(stored, null)
}

export function setAnalyticsData(data: any) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS_DATA, safeJSONStringify(data))
  } catch (error) {
    console.error("Error saving analytics data:", error)
  }
}

// Dashboard stats
export function getDashboardStats() {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATS)
  return safeJSONParse(stored, null)
}

export function setDashboardStats(stats: any) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATS, safeJSONStringify(stats))
  } catch (error) {
    console.error("Error saving dashboard stats:", error)
  }
}

// MindTrader history
export function getMindTraderHistory() {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEYS.MINDTRADER_HISTORY)
  return safeJSONParse(stored, [])
}

export function addMindTraderEntry(entry: any) {
  const entries = getMindTraderHistory()
  const newEntry = {
    ...entry,
    id: entry.id || Date.now().toString(),
    createdAt: entry.createdAt || new Date().toISOString(),
  }

  entries.push(newEntry)
  localStorage.setItem(STORAGE_KEYS.MINDTRADER_HISTORY, JSON.stringify(entries))

  return newEntry
}

// Team Club data
export function getTeamClubData() {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(STORAGE_KEYS.TEAM_CLUB_DATA)
  return safeJSONParse(stored, null)
}

export function setTeamClubData(data: any) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_CLUB_DATA, safeJSONStringify(data))
  } catch (error) {
    console.error("Error saving team club data:", error)
  }
}

// Export/Import functions
export function exportUserData() {
  const userData = getUserData()
  const analyticsData = getAnalyticsData()
  const dashboardStats = getDashboardStats()

  return {
    userData,
    analyticsData,
    dashboardStats,
    exportDate: new Date().toISOString(),
    version: "1.0",
  }
}

export function importUserData(importData: any) {
  try {
    if (importData.userData) {
      setUserData(importData.userData)
    }
    if (importData.analyticsData) {
      setAnalyticsData(importData.analyticsData)
    }
    if (importData.dashboardStats) {
      setDashboardStats(importData.dashboardStats)
    }
    return true
  } catch (error) {
    console.error("Error importing user data:", error)
    return false
  }
}

// Backup functions
export function createBackup() {
  const backup = exportUserData()
  const backupString = safeJSONStringify(backup)

  // Create and download backup file
  const blob = new Blob([backupString], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `trader-mindset-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function restoreBackup(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupData = safeJSONParse(e.target?.result as string)
        const success = importUserData(backupData)
        resolve(success)
      } catch (error) {
        console.error("Error restoring backup:", error)
        resolve(false)
      }
    }
    reader.onerror = () => resolve(false)
    reader.readAsText(file)
  })
}

// Get today's date string for date utilities
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}
