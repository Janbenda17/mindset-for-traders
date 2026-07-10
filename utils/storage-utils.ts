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
  ACTIVE_CHALLENGE: "trader-mindset-active-challenge",
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
  challengeId?: string // Associated challenge ID
}

export interface MoodEntry {
  id: string
  date: string
  mood: number
  confidence: number
  stress: number
  notes?: string
  // Mood entries jsou globální, neváží se k challenge
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
  challengeId?: string // Associated challenge ID
}

export interface PropFirmChallenge {
  id: string
  name: string
  firm: string
  initialBalance: number
  currentBalance: number
  status: "active" | "failed" | "passed" | "funded" | "withdrawn"
  phase: "challenge" | "verification" | "funded"
  startDate: string
  endDate?: string
  profitTarget?: number
  maxDailyLoss?: number
  maxTotalLoss?: number
  notes?: string
  createdAt: string
  updatedAt: string
  // Challenge-specific statistics
  stats?: {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalPnL: number
    bestTrade: number
    worstTrade: number
    averageWin: number
    averageLoss: number
    profitFactor: number
    maxDrawdown: number
  }
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

export interface ProfileSettings {
  nickname?: string
  bio?: string
  mentor?: string
  experienceLevel?: "beginner" | "intermediate" | "advanced"
  updatedAt?: string
}

export interface TradingSettings {
  style?: "scalper" | "day-trader" | "swing-trader"
  riskLevel?: "conservative" | "moderate" | "aggressive"
  timezone?: string
  tradingYears?: string
  mainMarkets?: string[]
  goals?: string
  averageTradesPerWeek?: string
  updatedAt?: string
}

export interface NotificationSettings {
  email?: boolean
  push?: boolean
  weeklyReport?: boolean
  tradingAlerts?: boolean
  dailyReminder?: boolean
  psychologyInsights?: boolean
  updatedAt?: string
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
  propFirmChallenges?: PropFirmChallenge[]
  profile?: ProfileSettings
  settings?: {
    trading?: TradingSettings
    notifications?: NotificationSettings
  }
}

function getStorageKey(): string {
  // Get current user from auth
  const currentUserStr = localStorage.getItem("trader-mindset-user")
  if (!currentUserStr) {
    return "trader-mindset-data" // Fallback for non-authenticated
  }

  const currentUser = JSON.parse(currentUserStr)
  return `user-${currentUser.id}-trader-mindset-data`
}

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
      mood: Math.floor(Math.random() * 4) + 6,
      confidence: Math.floor(Math.random() * 4) + 6,
      stress: Math.floor(Math.random() * 4) + 2,
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
    propFirmChallenges: [],
    profile: {
      experienceLevel: "intermediate",
    },
    settings: {
      trading: {
        style: "day-trader",
        riskLevel: "moderate",
        timezone: "Europe/Prague",
      },
      notifications: {
        email: true,
        push: true,
        weeklyReport: true,
        tradingAlerts: true,
        dailyReminder: false,
        psychologyInsights: true,
      },
    },
  }
}

// Main storage functions
export function getUserData(): UserData {
  if (typeof window === "undefined") {
    return getDefaultUserData()
  }

  try {
    const STORAGE_KEY = getStorageKey()
    const data = localStorage.getItem(STORAGE_KEY)

    // First-ever visit from a signed-out browser (no saved data yet, and not
    // tied to a real logged-in user's key): seed it with sample entries so
    // Daily Tracker/Journal/Weekly Review/Fail Log have something to show
    // instead of a blank state, matching what the product tour promises
    // ("demo data is already in the app"). Only applies to the anonymous
    // fallback key - a signed-in user's own key is never auto-seeded, so a
    // real new account still starts genuinely empty.
    if (data === null && STORAGE_KEY === "trader-mindset-data") {
      const seeded: UserData = {
        ...getDefaultUserData(),
        journalEntries: getSampleJournalEntries(),
        moodEntries: getSampleMoodEntries(),
        tradingData: getSampleTradingData(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    const parsedData: Partial<UserData> = JSON.parse(data)
    const fullData = { ...getDefaultUserData(), ...parsedData }

    return fullData
  } catch (error) {
    console.error("Error parsing user data from localStorage", error)
    localStorage.removeItem("trader-mindset-data")
    const defaultData = getDefaultUserData()

    setUserData(defaultData)
    return defaultData
  }
}

export function setUserData(data: Partial<UserData>): void {
  if (typeof window === "undefined") return

  try {
    const STORAGE_KEY = getStorageKey()
    const currentData = getUserData()
    const updatedData = { ...currentData, ...data, lastUpdated: new Date().toISOString() }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))

    window.dispatchEvent(
      new CustomEvent("storage-updated", {
        detail: { key: STORAGE_KEY },
      }),
    )
  } catch (error) {
    console.error("Error saving user data to localStorage:", error)
  }
}

export function saveUserData(data: Partial<UserData>): void {
  setUserData(data)
}

export function clearUserData(): void {
  if (typeof window === "undefined") return
  const STORAGE_KEY = getStorageKey()
  localStorage.removeItem(STORAGE_KEY)
}

export function clearAllDemoData(): void {
  if (typeof window === "undefined") return

  const keysToRemove = [
    getStorageKey(),
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
    "daily-tracker-entries",
    STORAGE_KEYS.ACTIVE_CHALLENGE,
  ]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  const emptyData = getDefaultUserData()
  setUserData(emptyData)
}

export const getJournalEntries = (): JournalEntry[] => {
  if (typeof window === "undefined") return []

  const userData = getUserData()
  return userData.journalEntries || []
}

export const saveJournalEntry = (entry: any): void => {
  if (typeof window === "undefined") return

  if (!entry.id) {
    entry.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

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

  // Update challenge stats if this is a trade entry
  if (entry.type === "trade" && entry.challengeId && entry.pnl !== undefined) {
    updateChallengeStats(entry.challengeId)
  }
}

export const deleteJournalEntry = (id: string): void => {
  if (typeof window === "undefined") return

  const userData = getUserData()
  const deletedEntry = userData.journalEntries?.find((e) => e.id === id)
  userData.journalEntries = (userData.journalEntries || []).filter((entry) => entry.id !== id)
  setUserData(userData)

  // Update challenge stats if this was a trade entry
  if (deletedEntry?.type === "trade" && deletedEntry.challengeId) {
    updateChallengeStats(deletedEntry.challengeId)
  }
}

export const getMoodEntries = (): MoodEntry[] => {
  if (typeof window === "undefined") return []

  const userData = getUserData()
  return userData.moodEntries || []
}

export const saveMoodEntry = (entry: MoodEntry): void => {
  if (typeof window === "undefined") return

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

export const getTradingData = (): TradingEntry[] => {
  if (typeof window === "undefined") return []

  const userData = getUserData()
  return userData.tradingData || []
}

export const saveTradingData = (data: TradingEntry[]): void => {
  if (typeof window === "undefined") return

  const userData = getUserData()
  userData.tradingData = data
  setUserData(userData)
}

export const calculateTradingStats = (challengeId?: string): TradingData => {
  const entries = getTradingData()
  const filteredEntries = challengeId ? entries.filter((e) => e.challengeId === challengeId) : entries

  const totalPnL = filteredEntries.reduce((sum, entry) => sum + entry.profitLoss, 0)
  const totalTrades = filteredEntries.length
  const winningTrades = filteredEntries.filter((entry) => entry.outcome === "profit").length
  const losingTrades = filteredEntries.filter((entry) => entry.outcome === "loss").length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  const wins = filteredEntries.filter((entry) => entry.outcome === "profit").map((entry) => entry.profitLoss)
  const losses = filteredEntries.filter((entry) => entry.outcome === "loss").map((entry) => entry.profitLoss)

  const averageWin = wins.length > 0 ? wins.reduce((sum, win) => sum + win, 0) / wins.length : 0
  const averageLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0

  const maxDrawdown = Math.min(...filteredEntries.map((entry) => entry.profitLoss), 0)

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
    profitFactor: averageLoss !== 0 ? Math.abs(averageWin / averageLoss) : 0,
    maxDrawdown,
    averageMood,
  }

  return stats
}

// Active Challenge Management
export const getActiveChallenge = (): PropFirmChallenge | null => {
  if (typeof window === "undefined") return null
  const activeChallengeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHALLENGE)
  if (!activeChallengeId) return null

  const challenges = getPropFirmChallenges()
  return challenges.find((c) => c.id === activeChallengeId) || null
}

export const setActiveChallenge = (challengeId: string | null): void => {
  if (typeof window === "undefined") return
  if (challengeId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGE, challengeId)
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE)
  }
  window.dispatchEvent(new Event("active-challenge-changed"))
}

// Prop Firm Challenge functions
export const getPropFirmChallenges = (): PropFirmChallenge[] => {
  const userData = getUserData()
  return userData.propFirmChallenges || []
}

export const savePropFirmChallenge = (challenge: PropFirmChallenge): void => {
  const userData = getUserData()
  const challenges = userData.propFirmChallenges || []
  const existingIndex = challenges.findIndex((c) => c.id === challenge.id)

  if (existingIndex >= 0) {
    challenges[existingIndex] = challenge
  } else {
    challenges.push(challenge)
    // Set as active if it's the first challenge
    if (challenges.length === 1) {
      setActiveChallenge(challenge.id)
    }
  }

  userData.propFirmChallenges = challenges
  setUserData(userData)

  // Calculate and save stats
  updateChallengeStats(challenge.id)
}

export const deletePropFirmChallenge = (id: string): void => {
  const userData = getUserData()
  userData.propFirmChallenges = (userData.propFirmChallenges || []).filter((c) => c.id !== id)
  setUserData(userData)

  // If this was the active challenge, clear it
  const activeChallenge = getActiveChallenge()
  if (activeChallenge?.id === id) {
    setActiveChallenge(null)
  }
}

export const updateChallengeStats = (challengeId: string): void => {
  const userData = getUserData()
  const challenges = userData.propFirmChallenges || []
  const challengeIndex = challenges.findIndex((c) => c.id === challengeId)

  if (challengeIndex === -1) return

  // Get all trades for this challenge
  const trades = getJournalEntries().filter(
    (e) => e.type === "trade" && e.challengeId === challengeId && e.pnl !== undefined,
  )

  const totalTrades = trades.length
  const winningTrades = trades.filter((t) => (t.pnl || 0) > 0).length
  const losingTrades = trades.filter((t) => (t.pnl || 0) < 0).length
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = trades.filter((t) => (t.pnl || 0) > 0).map((t) => t.pnl || 0)
  const losses = trades.filter((t) => (t.pnl || 0) < 0).map((t) => t.pnl || 0)

  challenges[challengeIndex].stats = {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
    totalPnL,
    bestTrade: wins.length > 0 ? Math.max(...wins) : 0,
    worstTrade: losses.length > 0 ? Math.min(...losses) : 0,
    averageWin: wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0,
    averageLoss: losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0,
    profitFactor:
      losses.length > 0 && wins.length > 0
        ? Math.abs(wins.reduce((s, w) => s + w, 0) / losses.reduce((s, l) => s + l, 0))
        : 0,
    maxDrawdown: losses.length > 0 ? Math.min(...losses) : 0,
  }

  // Update current balance
  challenges[challengeIndex].currentBalance = challenges[challengeIndex].initialBalance + totalPnL

  userData.propFirmChallenges = challenges
  setUserData(userData)
}

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

export function createBackup() {
  const backup = exportUserData()
  const backupString = safeJSONStringify(backup)

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

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

// New functions for managing trades
export function saveTrade(trade: any): void {
  if (typeof window === "undefined") return

  const userData = getUserData()
  const trades = userData.tradingData || []
  const existingIndex = trades.findIndex((t) => t.id === trade.id)

  if (existingIndex >= 0) {
    trades[existingIndex] = trade
  } else {
    trades.push(trade)
  }

  userData.tradingData = trades
  setUserData(userData)
}

export function deleteTrade(id: string): void {
  if (typeof window === "undefined") return

  const userData = getUserData()
  userData.tradingData = (userData.tradingData || []).filter((trade) => trade.id !== id)
  setUserData(userData)
}

export function addJournalEntry(entry: JournalEntry): void {
  if (typeof window === "undefined") return

  const userData = getUserData()
  const entries = userData.journalEntries || []
  entries.push(entry)
  userData.journalEntries = entries
  setUserData(userData)
}

export function updateJournalEntry(id: string, updates: Partial<JournalEntry>): void {
  if (typeof window === "undefined") return

  const userData = getUserData()
  const entries = userData.journalEntries || []
  const entryIndex = entries.findIndex((e) => e.id === id)

  if (entryIndex >= 0) {
    entries[entryIndex] = { ...entries[entryIndex], ...updates }
    userData.journalEntries = entries
    setUserData(userData)
  }
}

export function addWeeklyReview(review: any): void {
  if (typeof window === "undefined") return

  const userData = getUserData()
  const reviews = userData.journalEntries || []
  reviews.push(review)
  userData.journalEntries = reviews
  setUserData(userData)
}

export function addMoodEntry(entry: MoodEntry): void {
  if (typeof window === "undefined") return

  const userData = getUserData()
  const entries = userData.moodEntries || []
  entries.push(entry)
  userData.moodEntries = entries
  setUserData(userData)
}

export function getAllTrades(): any[] {
  if (typeof window === "undefined") return []

  const userData = getUserData()
  return userData.tradingData || []
}
