"use client"

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase-client"
import {
  generateVirtualTrades,
  generateVirtualMorningChecks,
  generateVirtualJournalEntries,
} from "@/lib/virtual-data-generator"
import { useSubscription } from "@/hooks/use-subscription" // Import useSubscription hook

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

interface DataState {
  trades: Trade[]
  morningChecks: MorningCheck[]
  journalEntries: any[]
  isLiveMode: boolean
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
  | { type: "SET_LIVE_MODE"; payload: boolean }
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
    case "SET_LIVE_MODE": {
      if (typeof window !== "undefined") {
        localStorage.setItem("trader-mindset-live-mode", action.payload.toString())
      }
      return { ...state, isLiveMode: action.payload }
    }
    case "SET_EVER_SWITCHED_LIVE": {
      if (typeof window !== "undefined") {
        localStorage.setItem("trader-mindset-ever-switched-live", action.payload.toString())
      }
      return { ...state, hasEverSwitchedToLive: action.payload }
    }
    case "SET_SHOW_WARNING":
      return { ...state, showLiveWarning: action.payload }
    case "SET_PORTFOLIO_VALUE": {
      if (typeof window !== "undefined") {
        localStorage.setItem("trader-mindset-portfolio-value", action.payload.toString())
      }
      return { ...state, portfolioValue: action.payload }
    }
    case "SET_USER_ID":
      return { ...state, userId: action.payload }
    case "CLEAR_ALL_DATA": {
      return { ...state, trades: [], morningChecks: [], journalEntries: [] }
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
  isLiveMode: boolean
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
  setShowLiveWarning: (show: boolean) => void
  setPortfolioValue: (value: number) => void
  switchToLive: () => void
  switchToVirtual: () => void
  clearAllData: () => void
  setUserId: (userId: string | null) => void

  // Computed values (kept for backwards compatibility)
  getAllTrades: () => Trade[]
  getAllJournalEntries: () => any[]
  getTradingStats: () => any
  resetAllScores: () => void
  isOwner: boolean
  canSwitchModes: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialState: DataState = {
  trades: [],
  morningChecks: [],
  journalEntries: [],
  isLiveMode: false,
  hasEverSwitchedToLive: false,
  showLiveWarning: false,
  portfolioValue: 0,
  userId: null,
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const toast = useToast()

  const prevUserIdRef = React.useRef<string | null>(null)

  const supabase = createClient()

  const [state, dispatch] = useReducer(dataReducer, initialState)

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

  useEffect(() => {
    if (!state.userId) {
      console.log("[v0] No authenticated user")
      return
    }

    console.log(`[v0] User ID changed to: ${state.userId}, Live mode: ${state.isLiveMode}`)

    if (state.isLiveMode) {
      console.log("[v0] Loading LIVE data from Supabase")
      loadDataFromSupabase(state.userId)
    } else {
      console.log("[v0] Loading VIRTUAL data")
      loadVirtualData(state.userId)
    }
  }, [state.userId, state.isLiveMode])

  function loadVirtualData(userId: string) {
    console.log(`[v0] Generating virtual demo data for user: ${userId}`)

    const virtualTrades = generateVirtualTrades(30)
    const virtualChecks = generateVirtualMorningChecks(30)
    const virtualJournal = generateVirtualJournalEntries(15)

    console.log(`[v0] Generated ${virtualTrades.length} virtual trades`)
    console.log(`[v0] Generated ${virtualChecks.length} virtual morning checks`)
    console.log(`[v0] Generated ${virtualJournal.length} virtual journal entries`)

    dispatch({ type: "SET_TRADES", payload: virtualTrades as any })
    dispatch({ type: "SET_MORNING_CHECKS", payload: virtualChecks as any })
    dispatch({ type: "SET_JOURNAL_ENTRIES", payload: virtualJournal })

    toast({
      title: "Virtual Mode",
      description: "Zobrazují se demo data. Můžete přepnout na Live Mode pro reálná data.",
    })
  }

  async function loadDataFromSupabase(userId: string) {
    console.log(`[v0] Loading LIVE data for user: ${userId}`)

    try {
      const { data: trades, error: tradesError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (tradesError) throw tradesError

      console.log(`[v0] Loaded ${trades?.length || 0} trades from Supabase for user ${userId}`)
      dispatch({ type: "SET_TRADES", payload: trades || [] })

      const { data: checks, error: checksError } = await supabase
        .from("morning_checks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (checksError) throw checksError

      console.log(`[v0] Loaded ${checks?.length || 0} morning checks from Supabase for user ${userId}`)
      dispatch({ type: "SET_MORNING_CHECKS", payload: checks || [] })
    } catch (error) {
      console.error("[v0] Error loading data from Supabase:", error)
      dispatch({ type: "SET_TRADES", payload: [] })
      dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      toast({
        title: "Chyba načítání dat",
        description: "Nepodařilo se načíst data ze serveru",
        variant: "destructive",
      })
    }
  }

  const addTrade = async (trade: Trade) => {
    if (!state.userId) {
      console.error("[v0] Cannot add trade: No authenticated user")
      toast({
        title: "Chyba autentizace",
        description: "Musíte být přihlášeni",
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
          body: JSON.stringify({
            trade,
            userId: state.userId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to add trade")
        }

        const { data } = await response.json()

        if (data) {
          console.log(`[v0] Trade saved to Supabase: ${data.id}`)
          dispatch({ type: "ADD_TRADE", payload: data })
          toast({
            title: "Obchod uložen",
            description: "Data byla úspěšně uložena do cloudu",
          })
        }
      } catch (error) {
        console.error("[v0] Error adding trade to Supabase:", error)
        toast({
          title: "Chyba ukládání",
          description: error instanceof Error ? error.message : "Nepodařilo se uložit obchod",
          variant: "destructive",
        })
      }
    } else {
      console.log(`[v0] Adding trade to localStorage for user: ${state.userId}`)
      dispatch({ type: "ADD_TRADE", payload: trade })
      const newTrades = [...state.trades, trade]
      saveTradesForUser(newTrades)
      toast({
        title: "Obchod uložen",
        description: "Data byla uložena lokálně",
      })
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
        toast({
          title: "Chyba aktualizace",
          description: "Nepodařilo se aktualizovat obchod",
          variant: "destructive",
        })
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
        toast({
          title: "Chyba mazání",
          description: "Nepodařilo se smazat obchod",
          variant: "destructive",
        })
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
      return
    }

    if (state.isLiveMode) {
      try {
        const response = await fetch("/api/morning-checks/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            check,
            userId: state.userId,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to add morning check")
        }

        const { data } = await response.json()
        dispatch({ type: "ADD_MORNING_CHECK", payload: data })
      } catch (error: any) {
        console.error("[v0] Error adding morning check:", error.message)
        toast({
          title: "Chyba ukládání",
          description: "Nepodařilo se uložit ranní check",
          variant: "destructive",
        })
      }
    } else {
      dispatch({ type: "ADD_MORNING_CHECK", payload: check })
      const newChecks = [...state.morningChecks, check]
      saveMorningChecksForUser(newChecks)
    }
  }

  const addJournalEntry = async (entry: any) => {
    if (!state.userId) return

    if (state.isLiveMode) {
      try {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            ...entry,
            user_id: state.userId,
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          dispatch({ type: "ADD_JOURNAL_ENTRY", payload: data })
        }
      } catch (error) {
        console.error("[v0] Error adding journal entry:", error)
      }
    } else {
      dispatch({ type: "ADD_JOURNAL_ENTRY", payload: entry })
      const newEntries = [...state.journalEntries, entry]
      saveJournalEntriesForUser(newEntries)
    }
  }

  const switchToLive = async () => {
    if (!state.hasEverSwitchedToLive) {
      dispatch({ type: "SET_SHOW_WARNING", payload: true })
    } else {
      dispatch({ type: "SET_LIVE_MODE", payload: true })
      if (state.userId) {
        await loadDataFromSupabase(state.userId)
      }
    }
  }

  const switchToVirtual = () => {
    dispatch({ type: "SET_LIVE_MODE", payload: false })

    if (state.userId) {
      loadVirtualData(state.userId)
    }
  }

  const clearAllData = () => {
    if (!state.userId) return

    const tradesKey = `user-${state.userId}-mindtrader-trades`
    const checksKey = `user-${state.userId}-mindtrader-morning-checks`
    const journalKey = `user-${state.userId}-user-journal-entries`

    localStorage.removeItem(tradesKey)
    localStorage.removeItem(checksKey)
    localStorage.removeItem(journalKey)

    dispatch({ type: "CLEAR_ALL_DATA" })

    console.log(`[v0] Cleared all data for user ${state.userId}`)
  }

  const getAllTrades = () => state.trades
  const getAllJournalEntries = () => state.journalEntries

  const getTradingStats = () => {
    const trades = state.trades
    if (!trades.length) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
      }
    }

    const wins = trades.filter((t) => t.pnl > 0)
    const losses = trades.filter((t) => t.pnl < 0)
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
    const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0
    const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0

    return {
      totalTrades: trades.length,
      winRate: (wins.length / trades.length) * 100,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor,
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

  return (
    <DataContext.Provider
      value={{
        trades: state.trades,
        morningChecks: state.morningChecks,
        journalEntries: state.journalEntries,
        isLiveMode: state.isLiveMode,
        hasEverSwitchedToLive: state.hasEverSwitchedToLive,
        showLiveWarning: state.showLiveWarning,
        portfolioValue: state.portfolioValue,
        userId: state.userId,
        addTrade,
        updateTrade,
        deleteTrade,
        addMorningCheck,
        addJournalEntry,
        setShowLiveWarning,
        setPortfolioValue,
        switchToLive,
        switchToVirtual,
        clearAllData,
        setUserId,
        getAllTrades,
        getAllJournalEntries,
        getTradingStats,
        resetAllScores,
        isOwner,
        canSwitchModes,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
