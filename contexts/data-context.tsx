"use client"

import React, { createContext, useContext, useReducer, useEffect, useMemo } from "react"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client" // Fixed import to use createClient singleton instead of createBrowserClient
import {
  generateVirtualTrades,
  generateVirtualMorningChecks,
  generateVirtualJournalEntries,
} from "@/lib/virtual-data-generator"
import { useSubscription } from "@/hooks/use-subscription" // Import useSubscription hook
import { useLiveMode } from "./live-mode-context" // Import useLiveMode hook
import { toast } from "@/hooks/use-toast" // Added toast import for error notifications

// Demo trades data for virtual mode
const DEMO_TRADES = [
  {
    id: "demo-1",
    date: "2024-01-15",
    pair: "EUR/USD",
    type: "Long",
    entry: 1.095,
    exit: 1.098,
    size: 1.0,
    pnl: 300,
    notes: "Strong bullish momentum after ECB announcement",
    mood: 8,
    confidence: 9,
    tags: ["breakout", "news"],
  },
  {
    id: "demo-2",
    date: "2024-01-16",
    pair: "GBP/JPY",
    type: "Short",
    entry: 185.5,
    exit: 184.8,
    size: 0.5,
    pnl: 350,
    notes: "Perfect rejection at resistance level",
    mood: 9,
    confidence: 8,
    tags: ["resistance", "technical"],
  },
  {
    id: "demo-3",
    date: "2024-01-17",
    pair: "USD/CAD",
    type: "Long",
    entry: 1.342,
    exit: 1.338,
    size: 0.8,
    pnl: -320,
    notes: "Stopped out by unexpected oil price surge",
    mood: 4,
    confidence: 6,
    tags: ["stop-loss", "commodities"],
  },
  {
    id: "demo-4",
    date: "2024-01-18",
    pair: "AUD/USD",
    type: "Long",
    entry: 0.665,
    exit: 0.672,
    size: 1.2,
    pnl: 840,
    notes: "Great follow-through after RBA hawkish stance",
    mood: 9,
    confidence: 9,
    tags: ["central-bank", "momentum"],
  },
  {
    id: "demo-5",
    date: "2024-01-19",
    pair: "EUR/GBP",
    type: "Short",
    entry: 0.858,
    exit: 0.862,
    size: 0.6,
    pnl: -240,
    notes: "Wrong direction, UK data stronger than expected",
    mood: 5,
    confidence: 7,
    tags: ["data-miss", "reversal"],
  },
  {
    id: "demo-6",
    date: "2024-01-20",
    pair: "USD/JPY",
    type: "Long",
    entry: 148.2,
    exit: 148.9,
    size: 1.0,
    pnl: 700,
    notes: "Clean break above key resistance",
    mood: 8,
    confidence: 8,
    tags: ["breakout", "yen-weakness"],
  },
  {
    id: "demo-7",
    date: "2024-01-21",
    pair: "GBP/USD",
    type: "Short",
    entry: 1.272,
    exit: 1.268,
    size: 0.7,
    pnl: 280,
    notes: "Nice scalp on London open volatility",
    mood: 7,
    confidence: 7,
    tags: ["scalp", "session-open"],
  },
]

// Demo journal entries for virtual mode
const DEMO_JOURNAL_ENTRIES = [
  {
    id: "demo-journal-1",
    date: "2024-01-15",
    mood: 8,
    confidence: 9,
    notes: "Great trading day! Stayed disciplined and followed my plan perfectly. The EUR/USD setup was textbook.",
    tags: ["discipline", "plan-execution"],
    type: "trade",
  },
  {
    id: "demo-journal-2",
    date: "2024-01-16",
    mood: 9,
    confidence: 8,
    notes: "Another solid day. The technical analysis is really paying off. GBP/JPY resistance held perfectly.",
    tags: ["technical-analysis", "consistency"],
    type: "trade",
  },
  {
    id: "demo-journal-3",
    date: "2024-01-17",
    mood: 6,
    confidence: 6,
    notes:
      "Tough day with the stop loss, but risk management saved me from bigger losses. Oil news caught me off guard.",
    tags: ["risk-management", "learning"],
    type: "reflection",
  },
  {
    id: "demo-journal-4",
    date: "2024-01-18",
    mood: 9,
    confidence: 9,
    notes: "Excellent read on the RBA decision. Fundamental analysis combined with technicals worked perfectly.",
    tags: ["fundamentals", "central-banks"],
    type: "trade",
  },
  {
    id: "demo-journal-5",
    date: "2024-01-19",
    mood: 7,
    confidence: 7,
    notes: "Mixed day. Need to be more careful with UK data releases. The market reaction was stronger than expected.",
    tags: ["data-releases", "improvement"],
    type: "reflection",
  },
  {
    id: "demo-journal-6",
    date: "2024-01-20",
    mood: 8,
    confidence: 8,
    notes: "USD/JPY breakout was textbook. Love when the setup works exactly as planned.",
    tags: ["breakouts", "plan-execution"],
    type: "trade",
  },
  {
    id: "demo-journal-7",
    date: "2024-01-21",
    mood: 7,
    confidence: 7,
    notes: "Quick scalp worked well. Need to be more selective with these setups to improve consistency.",
    tags: ["scalping", "selectivity"],
    type: "trade",
  },
]

// TypeScript interfaces for trades and data
interface Trade {
  id: string
  date: string
  pair: string
  direction: string
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  mood?: number
  confidence?: number
  stress?: number
  discipline?: number
  emotionBefore?: string
  emotionDuring?: string
  emotionAfter?: string
  notes?: string
  lessons?: string[]
  mistakes?: string[]
  improvements?: string[]
  whatWorked?: string
  whatDidntWork?: string
  entryReason?: string
  exitReason?: string
  marketConditions?: string
  revengeTrade?: boolean
  exitedEarly?: boolean
  missedDueToHesitation?: boolean
  matchedPlan?: boolean
  tags?: string[]
  followedPlan?: boolean
}

interface MorningCheck {
  id: string
  date: string
  score: number
  [key: string]: any
}

interface WeeklyReview {
  id: string
  date: string
  notes: string
  [key: string]: any
}

interface DataState {
  trades: Trade[]
  morningChecks: MorningCheck[]
  journalEntries: any[]
  weeklyReviews: WeeklyReview[]
  isLiveMode: boolean | undefined
  hasEverSwitchedToLive: boolean
  showLiveWarning: boolean
  portfolioValue: number
  userId: string | null
}

// Action types for reducer
type DataAction =
  | { type: "ADD_TRADE"; payload: Trade }
  | { type: "UPDATE_TRADE"; payload: Trade }
  | { type: "DELETE_TRADE"; payload: string }
  | { type: "SET_TRADES"; payload: Trade[] }
  | { type: "ADD_MORNING_CHECK"; payload: MorningCheck }
  | { type: "SET_MORNING_CHECKS"; payload: MorningCheck[] }
  | { type: "ADD_JOURNAL_ENTRY"; payload: any }
  | { type: "SET_JOURNAL_ENTRIES"; payload: any[] }
  | { type: "ADD_WEEKLY_REVIEW"; payload: WeeklyReview }
  | { type: "SET_WEEKLY_REVIEWS"; payload: WeeklyReview[] }
  | { type: "SET_LIVE_MODE"; payload: boolean | undefined }
  | { type: "SET_EVER_SWITCHED_LIVE"; payload: boolean }
  | { type: "SET_SHOW_WARNING"; payload: boolean }
  | { type: "SET_PORTFOLIO_VALUE"; payload: number }
  | { type: "SET_USER_ID"; payload: string | null }
  | { type: "CLEAR_ALL_DATA" }

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "ADD_TRADE": {
      const newTrades = [...state.trades, action.payload]
      return { ...state, trades: newTrades }
    }
    case "UPDATE_TRADE": {
      const updatedTrades = state.trades.map((t) => (t.id === action.payload.id ? action.payload : t))
      return { ...state, trades: updatedTrades }
    }
    case "DELETE_TRADE": {
      const filteredTrades = state.trades.filter((t) => t.id !== action.payload)
      return { ...state, trades: filteredTrades }
    }
    case "SET_TRADES":
      return { ...state, trades: action.payload }
    case "ADD_MORNING_CHECK": {
      const newChecks = [...state.morningChecks, action.payload]
      return { ...state, morningChecks: newChecks }
    }
    case "SET_MORNING_CHECKS":
      return { ...state, morningChecks: action.payload }
    case "ADD_JOURNAL_ENTRY": {
      const newEntries = [...state.journalEntries, action.payload]
      return { ...state, journalEntries: newEntries }
    }
    case "SET_JOURNAL_ENTRIES":
      return { ...state, journalEntries: action.payload }
    case "ADD_WEEKLY_REVIEW": {
      const newReviews = [...state.weeklyReviews, action.payload]
      return { ...state, weeklyReviews: newReviews }
    }
    case "SET_WEEKLY_REVIEWS":
      return { ...state, weeklyReviews: action.payload }
    case "SET_LIVE_MODE": {
      console.log(`[v0] SET_LIVE_MODE: ${action.payload}`)
      return { ...state, isLiveMode: action.payload }
    }
    case "SET_EVER_SWITCHED_LIVE": {
      console.log(`[v0] SET_EVER_SWITCHED_LIVE: ${action.payload}`)
      return { ...state, hasEverSwitchedToLive: action.payload }
    }
    case "SET_SHOW_WARNING":
      return { ...state, showLiveWarning: action.payload }
    case "SET_PORTFOLIO_VALUE": {
      return { ...state, portfolioValue: action.payload }
    }
    case "SET_USER_ID":
      return { ...state, userId: action.payload }
    case "CLEAR_ALL_DATA": {
      return { ...state, trades: [], morningChecks: [], journalEntries: [], weeklyReviews: [] }
    }
    default:
      return state
  }
}

interface DataContextType {
  // State
  trades: Trade[]
  morningChecks: MorningCheck[]
  journalEntries: any[]
  weeklyReviews: WeeklyReview[]
  isLiveMode: boolean | undefined
  hasEverSwitchedToLive: boolean
  showLiveWarning: boolean
  portfolioValue: number
  userId: string | null

  // Actions
  addTrade: (trade: Trade) => void
  updateTrade: (trade: Trade) => void
  deleteTrade: (id: string) => void
  addMorningCheck: (check: MorningCheck) => void
  addJournalEntry: (entry: any) => void
  updateJournalEntry: (entry: any) => void
  deleteJournalEntry: (id: string) => void
  addWeeklyReview: (review: WeeklyReview) => void
  updateWeeklyReview: (review: WeeklyReview) => void
  deleteWeeklyReview: (id: string) => void
  setShowLiveWarning: (show: boolean) => void
  setPortfolioValue: (value: number) => void
  switchToLive: () => void
  clearAllData: () => void
  setUserId: (userId: string | null) => void

  // Computed values (kept for backwards compatibility)
  getAllTrades: () => Trade[]
  getAllJournalEntries: () => any[]
  getAllMorningChecks: () => MorningCheck[]
  getAllWeeklyReviews: () => WeeklyReview[]
  getTradingStats: () => any
  resetAllScores: () => void
  isOwner: boolean
  canSwitchModes: boolean
  isVirtualMode: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialState: DataState = {
  trades: [],
  morningChecks: [],
  journalEntries: [],
  weeklyReviews: [],
  isLiveMode: undefined as any, // Will be set from profile.mode
  hasEverSwitchedToLive: false,
  showLiveWarning: false,
  portfolioValue: 10000,
  userId: null,
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { isLiveMode, isLoading: modeLoading } = useLiveMode() // Use LiveModeContext instead of managing mode internally
  const [state, dispatch] = useReducer(dataReducer, initialState)
  const supabase = useMemo(() => createClient(), [])

  const { profile } = useAuth()
  const { isPremium } = useSubscription()

  const isOwner = user?.email === "honza.newage@gmail.com"
  const canSwitchModes = isPremium || isOwner

  const getUserKey = React.useCallback(
    (baseKey: string): string => {
      if (!state.userId) return baseKey
      return `user-${state.userId}-${baseKey}`
    },
    [state.userId],
  )

  const saveTradesForUser = React.useCallback(
    (trades: Trade[]) => {
      if (typeof window === "undefined" || !state.userId) return
      const key = getUserKey("mindtrader-trades")
      localStorage.setItem(key, JSON.stringify(trades))
      console.log(`[v0] Saved ${trades.length} trades to ${key}`)
    },
    [state.userId, getUserKey],
  )

  const saveMorningChecksForUser = React.useCallback(
    (checks: MorningCheck[]) => {
      if (typeof window === "undefined" || !state.userId) return
      const key = getUserKey("mindtrader-morning-checks")
      localStorage.setItem(key, JSON.stringify(checks))
      console.log(`[v0] Saved ${checks.length} checks to ${key}`)
    },
    [state.userId, getUserKey],
  )

  const saveJournalEntriesForUser = React.useCallback(
    (entries: any[]) => {
      if (typeof window === "undefined" || !state.userId) return
      const key = getUserKey("user-journal-entries")
      localStorage.setItem(key, JSON.stringify(entries))
      console.log(`[v0] Saved ${entries.length} journal entries to ${key}`)
    },
    [state.userId, getUserKey],
  )

  const saveWeeklyReviewsForUser = React.useCallback(
    (reviews: WeeklyReview[]) => {
      if (typeof window === "undefined" || !state.userId) return
      const key = getUserKey("user-weekly-reviews")
      localStorage.setItem(key, JSON.stringify(reviews))
      console.log(`[v0] Saved ${reviews.length} weekly reviews to ${key}`)
    },
    [state.userId, getUserKey],
  )

  const resetState = () => {
    dispatch({ type: "SET_TRADES", payload: [] })
    dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
    dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
    dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
    dispatch({ type: "SET_PORTFOLIO_VALUE", payload: 10000 })
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const newUserId = session?.user?.id || null

      if (state.userId && newUserId && state.userId !== newUserId) {
        console.log(`[v0] User changed from ${state.userId} to ${newUserId} - resetting all state`)
        resetState()
      }

      if (newUserId !== state.userId) {
        dispatch({ type: "SET_USER_ID", payload: newUserId })
      }
    })
  }, []) // Empty dependency array - runs once on mount to get initial session

  useEffect(() => {
    if (!state.userId) {
      console.log("[v0] No authenticated user - showing empty state")
      return
    }

    if (modeLoading) {
      console.log("[v0] Mode still loading - waiting...")
      return
    }

    console.log("[v0] Mode loaded, starting data load. isLiveMode:", isLiveMode)

    if (isLiveMode) {
      console.log("[v0] Loading LIVE data from Supabase")
      loadDataFromSupabase(state.userId)
    } else {
      console.log("[v0] Loading VIRTUAL data")
      loadVirtualData(state.userId)
    }
  }, [state.userId, isLiveMode, modeLoading])

  function loadVirtualData(userId: string) {
    if (isLiveMode) {
      console.log("[v0] Skipping virtual data - user is in LIVE mode")
      return false
    }

    console.log(`[v0] Generating virtual demo data for user: ${userId}`)

    const virtualTrades = generateVirtualTrades(30)
    const virtualChecks = generateVirtualMorningChecks(30)
    const virtualJournal = generateVirtualJournalEntries(15)
    const virtualReviews = [] // Placeholder for virtual weekly reviews

    console.log(`[v0] Generated ${virtualTrades.length} virtual trades`)
    console.log(`[v0] Generated ${virtualChecks.length} virtual morning checks`)
    console.log(`[v0] Generated ${virtualJournal.length} virtual journal entries`)
    console.log(`[v0] Generated ${virtualReviews.length} virtual weekly reviews`)

    dispatch({ type: "SET_TRADES", payload: virtualTrades as any })
    dispatch({ type: "SET_MORNING_CHECKS", payload: virtualChecks as any })
    dispatch({ type: "SET_JOURNAL_ENTRIES", payload: virtualJournal })
    dispatch({ type: "SET_WEEKLY_REVIEWS", payload: virtualReviews })

    return true
  }

  async function loadDataFromSupabase(userId: string) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50))

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        console.error("[v0] No active session - cannot load data")
        toast({
          title: "Chyba autentizace",
          description: "Není aktivní relace. Přihlaš se prosím znovu.",
          variant: "destructive",
        })
        resetState()
        return
      }

      const [tradesResult, checksResult, reviewsResult, journalResult] = await Promise.all([
        supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId)
          .eq("type", "trade")
          .order("created_at", { ascending: false }),
        supabase.from("morning_checks").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("weekly_reviews").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId)
          .eq("type", "journal")
          .order("created_at", { ascending: false }),
      ])

      if (tradesResult.error) {
        console.error("[v0] Error loading trades:", tradesResult.error)
        toast({
          title: "Chyba načítání obchodů",
          description: "Nepodařilo se načíst obchody z databáze.",
          variant: "destructive",
        })
        dispatch({ type: "SET_TRADES", payload: [] })
      } else {
        console.log(`[v0] Loaded ${tradesResult.data?.length || 0} trades from Supabase for user ${userId}`)
        dispatch({ type: "SET_TRADES", payload: tradesResult.data || [] })
      }

      if (checksResult.error) {
        console.error("[v0] Error loading morning checks:", checksResult.error)
        toast({
          title: "Chyba načítání ranních kontrol",
          description: "Nepodařilo se načíst ranní kontroly z databáze.",
          variant: "destructive",
        })
        dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      } else {
        console.log(`[v0] Loaded ${checksResult.data?.length || 0} morning checks from Supabase for user ${userId}`)
        dispatch({ type: "SET_MORNING_CHECKS", payload: checksResult.data || [] })
      }

      if (reviewsResult.error) {
        console.error("[v0] Error loading weekly reviews:", reviewsResult.error)
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      } else {
        console.log(`[v0] Loaded ${reviewsResult.data?.length || 0} weekly reviews from Supabase for user ${userId}`)
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: reviewsResult.data || [] })
      }

      if (journalResult.error) {
        console.error("[v0] Error loading journal entries:", journalResult.error)
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      } else {
        console.log(`[v0] Loaded ${journalResult.data?.length || 0} journal entries from Supabase for user ${userId}`)
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: journalResult.data || [] })
      }
    } catch (error) {
      console.error("[v0] Error loading data from Supabase:", error)
      toast({
        title: "Kritická chyba",
        description: "Nepodařilo se načíst data z databáze. Zkus to prosím znovu.",
        variant: "destructive",
      })
      dispatch({ type: "SET_TRADES", payload: [] })
      dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
    }
  }

  const addTrade = async (trade: Trade) => {
    if (!state.userId) {
      toast({
        title: "Chyba autentizace",
        description: "Musíš být přihlášený pro přidání obchodu.",
        variant: "destructive",
      })
      return
    }

    if (state.isLiveMode) {
      console.log(`[v0] Adding trade to Supabase for user: ${state.userId}`)

      try {
        const response = await fetch("/api/trades/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trade, userId: state.userId }),
        })

        const { data } = await response.json()

        if (data) {
          console.log(`[v0] Trade saved to Supabase: ${data.id}`)
          dispatch({ type: "ADD_TRADE", payload: data })
        }
      } catch (error) {
        console.error("[v0] Error adding trade to Supabase:", error)
      }
    } else {
      console.log(`[v0] Adding trade to localStorage for user: ${state.userId}`)
      dispatch({ type: "ADD_TRADE", payload: trade })
      const newTrades = [...state.trades, trade]
      saveTradesForUser(newTrades)
    }
  }

  const updateTrade = async (trade: Trade) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .update(trade)
          .eq("id", trade.id)
          .eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "UPDATE_TRADE", payload: trade })
      } catch (error) {
        console.error("[v0] Error updating trade:", error)
      }
    } else {
      dispatch({ type: "UPDATE_TRADE", payload: trade })
      const updatedTrades = state.trades.map((t) => (t.id === trade.id ? trade : t))
      saveTradesForUser(updatedTrades)
    }
  }

  const deleteTrade = async (id: string) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "DELETE_TRADE", payload: id })
      } catch (error) {
        console.error("[v0] Error deleting trade:", error)
      }
    } else {
      dispatch({ type: "DELETE_TRADE", payload: id })
      const filteredTrades = state.trades.filter((t) => t.id !== id)
      saveTradesForUser(filteredTrades)
    }
  }

  const addMorningCheck = async (check: MorningCheck) => {
    if (!state.userId) {
      console.error("[v0] Cannot add morning check: No authenticated user")
      toast({
        title: "Chyba autentizace",
        description: "Musíš být přihlášený pro přidání ranní kontroly.",
        variant: "destructive",
      })
      return
    }

    if (state.isLiveMode) {
      try {
        const response = await fetch("/api/morning-checks/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ check, userId: state.userId }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to add morning check")
        }

        const { data } = await response.json()
        dispatch({ type: "ADD_MORNING_CHECK", payload: data })
      } catch (error: any) {
        console.error("[v0] Error adding morning check:", error.message)
      }
    } else {
      dispatch({ type: "ADD_MORNING_CHECK", payload: check })
      const newChecks = [...state.morningChecks, check]
      saveMorningChecksForUser(newChecks)
    }
  }

  const updateMorningCheck = async (check: MorningCheck) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase
          .from("morning_checks")
          .update(check)
          .eq("id", check.id)
          .eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "SET_MORNING_CHECKS", payload: [check] })
      } catch (error) {
        console.error("[v0] Error updating morning check:", error)
      }
    } else {
      dispatch({ type: "SET_MORNING_CHECKS", payload: [check] })
      const updatedChecks = state.morningChecks.map((c) => (c.id === check.id ? check : c))
      saveMorningChecksForUser(updatedChecks)
    }
  }

  const deleteMorningCheck = async (id: string) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase.from("morning_checks").delete().eq("id", id).eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      } catch (error) {
        console.error("[v0] Error deleting morning check:", error)
      }
    } else {
      dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      const filteredChecks = state.morningChecks.filter((c) => c.id !== id)
      saveMorningChecksForUser(filteredChecks)
    }
  }

  const addJournalEntry = async (entry: any) => {
    if (!state.userId) return

    const entryWithTitle = {
      ...entry,
      title: entry.title || `Journal Entry - ${entry.date || new Date().toISOString().split("T")[0]}`,
      date: entry.date || new Date().toISOString().split("T")[0],
    }

    if (state.isLiveMode) {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({ ...entryWithTitle, user_id: state.userId })
          .select()
          .single()

        if (error) {
          console.error("[v0] Error adding journal entry:", error)
          throw error
        }
        if (data) {
          dispatch({ type: "ADD_JOURNAL_ENTRY", payload: data })
          console.log("[v0] Journal entry added successfully to database")
        }
      } catch (error) {
        console.error("[v0] Error adding journal entry:", error)
      }
    } else {
      dispatch({ type: "ADD_JOURNAL_ENTRY", payload: entryWithTitle })
      const newEntries = [...state.journalEntries, entryWithTitle]
      saveJournalEntriesForUser(newEntries)
    }
  }

  const updateJournalEntry = async (entry: any) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase
          .from("journal_entries")
          .update(entry)
          .eq("id", entry.id)
          .eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [entry] })
      } catch (error) {
        console.error("[v0] Error updating journal entry:", error)
      }
    } else {
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [entry] })
      const updatedEntries = state.journalEntries.map((e) => (e.id === entry.id ? entry : e))
      saveJournalEntriesForUser(updatedEntries)
    }
  }

  const deleteJournalEntry = async (id: string) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      } catch (error) {
        console.error("[v0] Error deleting journal entry:", error)
      }
    } else {
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      const filteredEntries = state.journalEntries.filter((e) => e.id !== id)
      saveJournalEntriesForUser(filteredEntries)
    }
  }

  const addWeeklyReview = async (review: WeeklyReview) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { data, error } = await supabase
          .from("weekly_reviews")
          .insert({ ...review, user_id: state.userId })
          .select()
          .single()

        if (error) throw error
        if (data) {
          dispatch({ type: "ADD_WEEKLY_REVIEW", payload: data })
        }
      } catch (error) {
        console.error("[v0] Error adding weekly review:", error)
      }
    } else {
      dispatch({ type: "ADD_WEEKLY_REVIEW", payload: review })
      const newReviews = [...state.weeklyReviews, review]
      saveWeeklyReviewsForUser(newReviews)
    }
  }

  const updateWeeklyReview = async (review: WeeklyReview) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase
          .from("weekly_reviews")
          .update(review)
          .eq("id", review.id)
          .eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [review] })
      } catch (error) {
        console.error("[v0] Error updating weekly review:", error)
      }
    } else {
      dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [review] })
      const updatedReviews = state.weeklyReviews.map((r) => (r.id === review.id ? review : r))
      saveWeeklyReviewsForUser(updatedReviews)
    }
  }

  const deleteWeeklyReview = async (id: string) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { error } = await supabase.from("weekly_reviews").delete().eq("id", id).eq("user_id", state.userId)

        if (error) throw error
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      } catch (error) {
        console.error("[v0] Error deleting weekly review:", error)
      }
    } else {
      dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      const filteredReviews = state.weeklyReviews.filter((r) => r.id !== id)
      saveWeeklyReviewsForUser(filteredReviews)
    }
  }

  const clearAllData = () => {
    if (!state.userId) return

    const tradesKey = `user-${state.userId}-mindtrader-trades`
    const checksKey = `user-${state.userId}-mindtrader-morning-checks`
    const journalKey = `user-${state.userId}-user-journal-entries`
    const reviewsKey = `user-${state.userId}-user-weekly-reviews`

    localStorage.removeItem(tradesKey)
    localStorage.removeItem(checksKey)
    localStorage.removeItem(journalKey)
    localStorage.removeItem(reviewsKey)

    dispatch({ type: "CLEAR_ALL_DATA" })

    console.log(`[v0] Cleared all data for user ${state.userId}`)
  }

  const getAllTrades = () => state.trades
  const getAllJournalEntries = () => state.journalEntries
  const getAllMorningChecks = () => state.morningChecks
  const getAllWeeklyReviews = () => state.weeklyReviews

  const getTradingStats = () => {
    const trades = state.trades
    if (!trades.length) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        bestTrade: 0,
        worstTrade: 0,
      }
    }

    const wins = trades.filter((t) => t.pnl > 0)
    const losses = trades.filter((t) => t.pnl < 0)
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
    const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0
    const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

    const maxDrawdown = 0
    const sharpeRatio = 0
    const consecutiveWins = 0
    const consecutiveLosses = 0
    const bestTrade = 0
    const worstTrade = 0

    return {
      totalTrades: trades.length,
      winRate: (wins.length / trades.length) * 100,
      totalPnL,
      averageWin: avgWin,
      averageLoss: avgLoss,
      profitFactor,
      maxDrawdown,
      sharpeRatio,
      consecutiveWins,
      consecutiveLosses,
      bestTrade,
      worstTrade,
    }
  }

  const resetAllScores = () => {
    if (!state.userId) return

    const gamificationKey = `user-${state.userId}-gamification-state`
    localStorage.removeItem(gamificationKey)

    console.log(`[v0] Reset all scores for user ${state.userId}`)
  }

  const setShowLiveWarning = (show: boolean) => {
    dispatch({ type: "SET_SHOW_WARNING", payload: show })
  }

  const setPortfolioValue = (value: number) => {
    dispatch({ type: "SET_PORTFOLIO_VALUE", payload: value })
  }

  const setUserId = (userId: string | null) => {
    dispatch({ type: "SET_USER_ID", payload: userId })
  }

  const value = {
    ...state,
    isLiveMode, // Use value from LiveModeContext
    isVirtualMode: !isLiveMode,
    getAllTrades,
    getAllJournalEntries,
    getAllMorningChecks,
    getAllWeeklyReviews,
    addTrade,
    updateTrade,
    deleteTrade,
    addMorningCheck,
    updateMorningCheck,
    deleteMorningCheck,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    addWeeklyReview,
    updateWeeklyReview,
    deleteWeeklyReview,
    setShowLiveWarning,
    setPortfolioValue,
    clearAllData,
    setUserId,
    getTradingStats,
    resetAllScores,
    isOwner,
    canSwitchModes,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        getTradingStats: () => ({
          totalTrades: 0,
          winRate: 0,
          totalPnL: 0,
          averageWin: 0,
          averageLoss: 0,
          profitFactor: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
          bestTrade: 0,
          worstTrade: 0,
        }),
        trades: [],
        journalEntries: [],
        morningChecks: [],
        weeklyReviews: [],
        isLiveMode: false,
        toggleMode: () => {},
        portfolioValue: 10000,
        addTrade: async () => {},
        updateTrade: async () => {},
        deleteTrade: async () => {},
        getAllTrades: async () => [],
        addJournalEntry: async () => {},
        addMorningCheck: async () => {},
        addWeeklyReview: async () => {},
        getAllJournalEntries: async () => [],
        getAllMorningChecks: async () => [],
        getAllWeeklyReviews: async () => [],
      } as any
    }
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
