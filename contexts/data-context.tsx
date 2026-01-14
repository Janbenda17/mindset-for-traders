"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef } from "react"
import { useAuth } from "./auth-context"
import { supabase } from "@/lib/supabase/browser"
import { useSubscription } from "@/hooks/use-subscription"
import { useLiveMode } from "./live-mode-context"
import { toast } from "@/hooks/use-toast"

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
  tradingGoals?: any[]
  dataLoaded: boolean // Track if data has been loaded
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
  | { type: "SET_TRADING_GOALS"; payload: any[] }
  | { type: "SET_DATA_LOADED"; payload: boolean }
  | { type: "CLEAR_ALL_DATA" }

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "ADD_TRADE":
      return { ...state, trades: [...state.trades, action.payload] }
    case "UPDATE_TRADE":
      return { ...state, trades: state.trades.map((t) => (t.id === action.payload.id ? action.payload : t)) }
    case "DELETE_TRADE":
      return { ...state, trades: state.trades.filter((t) => t.id !== action.payload) }
    case "SET_TRADES":
      return { ...state, trades: action.payload }
    case "ADD_MORNING_CHECK":
      return { ...state, morningChecks: [...state.morningChecks, action.payload] }
    case "SET_MORNING_CHECKS":
      return { ...state, morningChecks: action.payload }
    case "ADD_JOURNAL_ENTRY":
      return { ...state, journalEntries: [...state.journalEntries, action.payload] }
    case "SET_JOURNAL_ENTRIES":
      return { ...state, journalEntries: action.payload }
    case "ADD_WEEKLY_REVIEW":
      return { ...state, weeklyReviews: [...state.weeklyReviews, action.payload] }
    case "SET_WEEKLY_REVIEWS":
      return { ...state, weeklyReviews: action.payload }
    case "SET_LIVE_MODE":
      return { ...state, isLiveMode: action.payload }
    case "SET_EVER_SWITCHED_LIVE":
      return { ...state, hasEverSwitchedToLive: action.payload }
    case "SET_SHOW_WARNING":
      return { ...state, showLiveWarning: action.payload }
    case "SET_PORTFOLIO_VALUE":
      return { ...state, portfolioValue: action.payload }
    case "SET_USER_ID":
      return { ...state, userId: action.payload }
    case "SET_TRADING_GOALS":
      return { ...state, tradingGoals: action.payload }
    case "SET_DATA_LOADED":
      return { ...state, dataLoaded: action.payload }
    case "CLEAR_ALL_DATA":
      return { ...state, trades: [], morningChecks: [], journalEntries: [], weeklyReviews: [], dataLoaded: false }
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
  tradingGoals?: any[]
  currentReadiness: number | null
  dataLoaded: boolean

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
  setTradingGoals: (goals: any[]) => void // Added action type for tradingGoals
  refreshLiveData: () => void // Added refresh method to DataContextType

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
  getTraderProfile: (days: number) => any // Added getTraderProfile to DataContextType
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
  dataLoaded: false,
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authReady } = useAuth()
  const { isLiveMode, isLoading: modeLoading } = useLiveMode() // Use LiveModeContext instead of managing mode internally
  const [state, dispatch] = useReducer(dataReducer, initialState)

  const { isPremium } = useSubscription()

  const prevUserIdRef = useRef<string | null>(null)
  const loadingRef = useRef(false)

  const canSwitchModes = isPremium

  useEffect(() => {
    const newUserId = user?.id || null

    // Detect user change - clear data if user switched
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== newUserId) {
      console.log("[v0] User changed - clearing all data")
      dispatch({ type: "CLEAR_ALL_DATA" })
    }

    prevUserIdRef.current = newUserId
    dispatch({ type: "SET_USER_ID", payload: newUserId })
  }, [user?.id])

  const loadDataFromSupabase = useCallback(async () => {
    if (!user?.id || loadingRef.current) return

    loadingRef.current = true
    console.log("[v0] ✓ LIVE MODE ACTIVE - Loading ONLY from Supabase")

    try {
      // Load trades
      const { data: trades, error: tradesError } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!tradesError && trades) {
        console.log(`[v0] Loaded ${trades.length} trades from Supabase for user ${user.id}`)
        dispatch({ type: "SET_TRADES", payload: trades })
      } else if (tradesError) {
        console.error("[v0] Error loading trades:", tradesError)
        toast({
          title: "Chyba načítání obchodů",
          description: "Nepodařilo se načíst obchody z databáze.",
          variant: "destructive",
        })
      }

      // Load morning checks
      const { data: morningChecks, error: morningError } = await supabase
        .from("morning_checks")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (!morningError && morningChecks) {
        console.log(`[v0] Loaded ${morningChecks.length} morning checks from Supabase for user ${user.id}`)
        dispatch({ type: "SET_MORNING_CHECKS", payload: morningChecks })
      } else if (morningError) {
        console.error("[v0] Error loading morning checks:", morningError)
      }

      // Load journal entries
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!journalError && journalEntries) {
        console.log(`[v0] Loaded ${journalEntries.length} journal entries from Supabase for user ${user.id}`)
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: journalEntries })
      } else if (journalError) {
        console.error("[v0] Error loading journal entries:", journalError)
        toast({
          title: "Chyba načítání položek dne",
          description: "Nepodařilo se načíst položky dne z databáze.",
          variant: "destructive",
        })
      }

      // Load weekly reviews
      const { data: weeklyReviews, error: weeklyError } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!weeklyError && weeklyReviews) {
        console.log(`[v0] Loaded ${weeklyReviews.length} weekly reviews from Supabase for user ${user.id}`)
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: weeklyReviews })
      } else if (weeklyError) {
        console.error("[v0] Error loading weekly reviews:", weeklyError)
      }

      dispatch({ type: "SET_DATA_LOADED", payload: true })
    } catch (error) {
      console.error("[v0] Error loading data from Supabase:", error)
    } finally {
      loadingRef.current = false
    }
  }, [user?.id])

  useEffect(() => {
    // Wait for auth and mode to be ready
    if (!authReady || modeLoading) {
      console.log("[v0] Waiting for auth/mode to be ready...")
      return
    }

    // No user - clear data and return
    if (!user?.id) {
      console.log("[v0] No user - clearing data")
      dispatch({ type: "CLEAR_ALL_DATA" })
      return
    }

    if (isLiveMode === true) {
      console.log("[v0] Mode loaded, starting data load. isLiveMode:", isLiveMode)
      loadDataFromSupabase()
    }
  }, [user?.id, isLiveMode, authReady, modeLoading, loadDataFromSupabase])

  // Compute currentReadiness from today's morning check
  const currentReadiness = useMemo(() => {
    if (!state.morningChecks || state.morningChecks.length === 0) return null

    const today = new Date().toISOString().split("T")[0]
    const todayCheck = state.morningChecks.find((c) => c.date === today)

    return todayCheck?.score ?? null
  }, [state.morningChecks])

  const refreshLiveData = useCallback(() => {
    if (isLiveMode && user?.id) {
      dispatch({ type: "SET_DATA_LOADED", payload: false })
      loadDataFromSupabase()
    }
  }, [isLiveMode, user?.id, loadDataFromSupabase])

  const addTrade = useCallback(
    async (trade: Trade) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("trades").insert({
          ...trade,
          user_id: user.id,
        })

        if (error) {
          console.error("[v0] Error adding trade to Supabase:", error)
          toast({ title: "Chyba", description: "Nepodařilo se uložit obchod", variant: "destructive" })
          return
        }

        // Refresh to get the inserted row with server-generated ID
        refreshLiveData()
      } else {
        dispatch({ type: "ADD_TRADE", payload: trade })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const updateTrade = useCallback(
    async (trade: Trade) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("trades").update(trade).eq("id", trade.id).eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error updating trade:", error)
          toast({ title: "Chyba", description: "Nepodařilo se aktualizovat obchod", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "UPDATE_TRADE", payload: trade })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const deleteTrade = useCallback(
    async (id: string) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("trades").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error deleting trade:", error)
          toast({ title: "Chyba", description: "Nepodařilo se smazat obchod", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "DELETE_TRADE", payload: id })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const addMorningCheck = useCallback(
    async (check: MorningCheck) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("morning_checks").upsert(
          {
            ...check,
            user_id: user.id,
          },
          {
            onConflict: "user_id,date",
          },
        )

        if (error) {
          console.error("[v0] Error adding morning check:", error)
          toast({ title: "Chyba", description: "Nepodařilo se uložit ranní kontrolu", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "ADD_MORNING_CHECK", payload: check })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const addJournalEntry = useCallback(
    async (entry: any) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").insert({
          ...entry,
          user_id: user.id,
        })

        if (error) {
          console.error("[v0] Error adding journal entry:", error)
          toast({ title: "Chyba", description: "Nepodařilo se uložit položku deníku", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "ADD_JOURNAL_ENTRY", payload: entry })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const updateJournalEntry = useCallback(
    async (entry: any) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").update(entry).eq("id", entry.id).eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error updating journal entry:", error)
          toast({ title: "Chyba", description: "Nepodařilo se aktualizovat položku deníku", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [entry] })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const deleteJournalEntry = useCallback(
    async (id: string) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error deleting journal entry:", error)
          toast({ title: "Chyba", description: "Nepodařilo se smazat položku deníku", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const addWeeklyReview = useCallback(
    async (review: WeeklyReview) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("weekly_reviews").insert({
          ...review,
          user_id: user.id,
        })

        if (error) {
          console.error("[v0] Error adding weekly review:", error)
          toast({ title: "Chyba", description: "Nepodařilo se uložit týdenní shrnutí", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "ADD_WEEKLY_REVIEW", payload: review })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const updateWeeklyReview = useCallback(
    async (review: WeeklyReview) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase
          .from("weekly_reviews")
          .update(review)
          .eq("id", review.id)
          .eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error updating weekly review:", error)
          toast({ title: "Chyba", description: "Nepodařilo se aktualizovat týdenní shrnutí", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [review] })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const deleteWeeklyReview = useCallback(
    async (id: string) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("weekly_reviews").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error deleting weekly review:", error)
          toast({ title: "Chyba", description: "Nepodařilo se smazat týdenní shrnutí", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else {
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      }
    },
    [isLiveMode, user?.id, refreshLiveData],
  )

  const setShowLiveWarning = useCallback((show: boolean) => {
    dispatch({ type: "SET_SHOW_WARNING", payload: show })
  }, [])

  const setPortfolioValue = useCallback((value: number) => {
    dispatch({ type: "SET_PORTFOLIO_VALUE", payload: value })
  }, [])

  const switchToLive = useCallback(() => {
    dispatch({ type: "SET_LIVE_MODE", payload: true })
    dispatch({ type: "SET_EVER_SWITCHED_LIVE", payload: true })
  }, [])

  const clearAllData = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_DATA" })
  }, [])

  const setUserId = useCallback((userId: string | null) => {
    dispatch({ type: "SET_USER_ID", payload: userId })
  }, [])

  const setTradingGoals = useCallback((goals: any[]) => {
    dispatch({ type: "SET_TRADING_GOALS", payload: goals })
  }, [])

  const getAllTrades = useCallback(() => state.trades, [state.trades])
  const getAllJournalEntries = useCallback(() => state.journalEntries, [state.journalEntries])
  const getAllMorningChecks = useCallback(() => state.morningChecks, [state.morningChecks])
  const getAllWeeklyReviews = useCallback(() => state.weeklyReviews, [state.weeklyReviews])

  const getTradingStats = useCallback(() => {
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
  }, [state.trades])

  const resetAllScores = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_DATA" })

    console.log(`[v0] Reset all scores`)
  }, [])

  const getTraderProfile = useCallback(
    (days = 30) => {
      if (!state.userId) return null

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      const cutoffStr = cutoffDate.toISOString().split("T")[0]

      // Filter data by date range
      const recentTrades = state.trades.filter((t) => t.date >= cutoffStr)
      const recentChecks = state.morningChecks.filter((c) => c.date >= cutoffStr)
      const recentReviews = state.weeklyReviews.filter((r) => r.date >= cutoffStr) // Assuming 'date' field for reviews
      const recentJournals = state.journalEntries.filter((j) => j.date >= cutoffStr)

      // Calculate trading stats
      const wins = recentTrades.filter((t) => t.pnl > 0)
      const losses = recentTrades.filter((t) => t.pnl < 0)
      const totalPnL = recentTrades.reduce((sum, t) => sum + t.pnl, 0)
      const winRate = recentTrades.length > 0 ? (wins.length / recentTrades.length) * 100 : 0

      // Calculate psychological metrics
      const avgMood =
        recentChecks.length > 0
          ? recentChecks.reduce((sum, c) => sum + (c.mood || 0), 0) / recentChecks.length // Assuming 'mood' field in morning checks
          : 0
      const avgStress =
        recentChecks.length > 0
          ? recentChecks.reduce((sum, c) => sum + (c.stress || 0), 0) / recentChecks.length // Assuming 'stress' field in morning checks
          : 0
      const avgReadiness =
        recentChecks.length > 0 ? recentChecks.reduce((sum, c) => sum + (c.score || 0), 0) / recentChecks.length : 0

      // Detect trading patterns
      const revengeTrades = recentTrades.filter((t) => t.revengeTrade).length
      const revengeRate = recentTrades.length > 0 ? (revengeTrades / recentTrades.length) * 100 : 0

      // Calculate consecutive wins/losses
      let consecutiveWins = 0
      let consecutiveLosses = 0
      let currentStreak = 0
      let currentStreakType = ""

      for (const trade of recentTrades.slice().reverse()) {
        if (trade.pnl > 0) {
          if (currentStreakType === "win") {
            currentStreak++
          } else {
            consecutiveLosses = Math.max(consecutiveLosses, currentStreak)
            currentStreak = 1
            currentStreakType = "win"
          }
        } else if (trade.pnl < 0) {
          if (currentStreakType === "loss") {
            currentStreak++
          } else {
            consecutiveWins = Math.max(consecutiveWins, currentStreak)
            currentStreak = 1
            currentStreakType = "loss"
          }
        }
      }

      if (currentStreakType === "win") consecutiveWins = Math.max(consecutiveWins, currentStreak)
      if (currentStreakType === "loss") consecutiveLosses = Math.max(consecutiveLosses, currentStreak)

      // Best/worst trading days
      const bestTrade = recentTrades.length > 0 ? Math.max(...recentTrades.map((t) => t.pnl)) : 0
      const worstTrade = recentTrades.length > 0 ? Math.min(...recentTrades.map((t) => t.pnl)) : 0

      return {
        // Trading Performance
        performance: {
          totalTrades: recentTrades.length,
          winningTrades: wins.length,
          losingTrades: losses.length,
          winRate: winRate.toFixed(1),
          totalPnL: totalPnL.toFixed(2),
          bestTrade: bestTrade.toFixed(2),
          worstTrade: worstTrade.toFixed(2),
          consecutiveWins,
          consecutiveLosses,
          averageWin: wins.length > 0 ? (wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length).toFixed(2) : "0",
          averageLoss: losses.length > 0 ? (losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length).toFixed(2) : "0",
        },

        // Psychological Metrics
        psychology: {
          averageMood: avgMood.toFixed(1),
          averageStress: avgStress.toFixed(1),
          averageReadiness: avgReadiness.toFixed(1),
          morningChecksCompleted: recentChecks.length,
          morningCheckRate: days > 0 ? ((recentChecks.length / days) * 100).toFixed(0) : "0",
        },

        // Behavioral Patterns
        patterns: {
          revengeTradeRate: revengeRate.toFixed(1),
          revengeTrades: revengeTrades,
          emotionalTrades: recentTrades.filter(
            (t) => t.emotionBefore === "fear" || t.emotionBefore === "fomo" || t.emotionBefore === "revenge",
          ).length,
        },

        // Recent Activity
        recentActivity: {
          lastTrade: recentTrades.length > 0 ? recentTrades[recentTrades.length - 1] : null,
          lastCheck: recentChecks.length > 0 ? recentChecks[recentChecks.length - 1] : null,
          lastReview: recentReviews.length > 0 ? recentReviews[0] : null,
          lastJournal: recentJournals.length > 0 ? recentJournals[recentJournals.length - 1] : null,
        },

        // Goals Progress (if available)
        goals:
          state.tradingGoals?.slice(0, 3).map((g) => ({
            title: g.title,
            progress: g.progress_percentage || 0,
            status: g.status,
            targetValue: g.target_value,
            currentValue: g.current_value,
          })) || [],

        // Time period
        period: {
          days,
          startDate: cutoffStr,
          endDate: new Date().toISOString().split("T")[0],
        },
      }
    },
    [state.trades, state.morningChecks, state.weeklyReviews, state.journalEntries, state.tradingGoals],
  )

  const value = useMemo<DataContextType>(
    () => ({
      trades: state.trades,
      morningChecks: state.morningChecks,
      journalEntries: state.journalEntries,
      weeklyReviews: state.weeklyReviews,
      isLiveMode,
      hasEverSwitchedToLive: state.hasEverSwitchedToLive,
      showLiveWarning: state.showLiveWarning,
      portfolioValue: state.portfolioValue,
      userId: state.userId,
      tradingGoals: state.tradingGoals,
      currentReadiness, // Expose currentReadiness for MindTrader AI
      dataLoaded: state.dataLoaded,

      addTrade,
      updateTrade,
      deleteTrade,
      addMorningCheck,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      addWeeklyReview,
      updateWeeklyReview,
      deleteWeeklyReview,
      setShowLiveWarning,
      setPortfolioValue,
      switchToLive,
      clearAllData,
      setUserId,
      setTradingGoals,
      refreshLiveData, // Expose refresh method

      getAllTrades,
      getAllJournalEntries,
      getAllMorningChecks,
      getAllWeeklyReviews,
      getTradingStats,
      resetAllScores,
      isOwner: false,
      canSwitchModes,
      isVirtualMode: !isLiveMode,
      getTraderProfile,
    }),
    [
      state,
      isLiveMode,
      currentReadiness,
      canSwitchModes,
      addTrade,
      updateTrade,
      deleteTrade,
      addMorningCheck,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      addWeeklyReview,
      updateWeeklyReview,
      deleteWeeklyReview,
      setShowLiveWarning,
      setPortfolioValue,
      switchToLive,
      clearAllData,
      setUserId,
      setTradingGoals,
      refreshLiveData,
      getAllTrades,
      getAllJournalEntries,
      getAllMorningChecks,
      getAllWeeklyReviews,
      getTradingStats,
      resetAllScores,
      getTraderProfile,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    // Provide a safe default for server-side rendering or tests
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
        currentReadiness: null,
        dataLoaded: false,
        refreshLiveData: () => {},
        getTraderProfile: () => null,
        canSwitchModes: false,
        isVirtualMode: true,
        isOwner: false,
        setShowLiveWarning: () => {},
        setPortfolioValue: () => {},
        switchToLive: () => {},
        clearAllData: () => {},
        setUserId: () => {},
        setTradingGoals: () => {},
        resetAllScores: () => {},
      } as any
    }
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
