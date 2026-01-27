"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef } from "react"
import { useAuth } from "./auth-context"
import { supabase } from "@/lib/supabase/browser"
import { useSubscription } from "@/hooks/use-subscription"
import { useLiveMode } from "./live-mode-context"
import { toast } from "@/hooks/use-toast"
import { getScoped, setScoped, type StorageScope } from "@/lib/storage"
import {
  generateVirtualTrades,
  generateVirtualJournalEntries,
  generateVirtualMorningChecks,
} from "@/lib/virtual-data-generator"

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
  // NEW FIELDS
  openTime?: string
  closeTime?: string
  session?: string
  tradeType?: string
  pips?: number
  positionSize?: number
  confidenceBefore?: number
  stressLevel?: number
  detailedAnalysis?: string
  behaviorDescription?: string
  openDate?: string
  closeDate?: string
}

interface MorningCheck {
  id: string
  date: string
  score: number
  emotionalState?: number
  stressLevel?: number
  sleepHours?: number
  sleepQuality?: number
  energyLevel?: number
  focus?: number
  physicalHealth?: number
  exercised?: boolean
  morningRoutine?: boolean
  meditation?: number
  locked?: boolean
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
  dataLoaded: boolean
  dataOwnerUserId: string | null
}

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
  | { type: "RESET_FOR_USER"; payload: string | null }
  | { type: "SET_DATA_OWNER"; payload: string | null }

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
      return {
        ...state,
        trades: [],
        morningChecks: [],
        journalEntries: [],
        weeklyReviews: [],
        dataLoaded: false,
        dataOwnerUserId: null,
      }
    case "RESET_FOR_USER":
      return {
        ...state,
        trades: [],
        morningChecks: [],
        journalEntries: [],
        weeklyReviews: [],
        dataLoaded: false,
        userId: action.payload,
        dataOwnerUserId: action.payload,
      }
    case "SET_DATA_OWNER":
      return { ...state, dataOwnerUserId: action.payload }
    default:
      return state
  }
}

interface DataContextType {
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
  dataOwnerUserId: string | null
  addTrade: (trade: Trade) => Promise<boolean>
  updateTrade: (trade: Trade) => void
  deleteTrade: (id: string) => void
  addMorningCheck: (check: MorningCheck) => Promise<boolean>
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
  setTradingGoals: (goals: any[]) => void
  refreshLiveData: () => void
  getAllTrades: () => Trade[]
  getAllJournalEntries: () => any[]
  getAllMorningChecks: () => MorningCheck[]
  getAllWeeklyReviews: () => WeeklyReview[]
  getTradingStats: () => any
  resetAllScores: () => void
  isOwner: boolean
  canSwitchModes: boolean
  isVirtualMode: boolean
  getTraderProfile: (days: number) => any
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialState: DataState = {
  trades: [],
  morningChecks: [],
  journalEntries: [],
  weeklyReviews: [],
  isLiveMode: undefined as any,
  hasEverSwitchedToLive: false,
  showLiveWarning: false,
  portfolioValue: 10000,
  userId: null,
  dataLoaded: false,
  dataOwnerUserId: null,
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authReady } = useAuth()
  const { isLiveMode, isLoading: modeLoading } = useLiveMode()
  const [state, dispatch] = useReducer(dataReducer, initialState)

  const { isPremium } = useSubscription()

  const prevUserIdRef = useRef<string | null>(null)
  const prevModeRef = useRef<boolean | null>(null)
  const loadingRef = useRef(false)

  const canSwitchModes = isPremium

  const getScope = useCallback((): StorageScope => {
    return isLiveMode ? "live" : "virtual"
  }, [isLiveMode])

  useEffect(() => {
    const newUserId = user?.id || null

    if (prevUserIdRef.current !== newUserId) {
      if (prevUserIdRef.current !== null) {
        console.log(`[v0] User changed from ${prevUserIdRef.current} to ${newUserId} - resetting all data atomically`)
      }
      // Use RESET_FOR_USER to atomically clear data and set new owner
      dispatch({ type: "RESET_FOR_USER", payload: newUserId })
    }

    prevUserIdRef.current = newUserId
  }, [user?.id])

  const loadVirtualData = useCallback((userId: string) => {
    console.log(`[v0] ✓ VIRTUAL MODE - Loading from localStorage (virtual:${userId}:*)`)

    // Try to load existing virtual data
    const storedTrades = getScoped<Trade[]>("virtual", userId, "trades", [])
    const storedMorningChecks = getScoped<MorningCheck[]>("virtual", userId, "morning-checks", [])
    const storedJournalEntries = getScoped<any[]>("virtual", userId, "journal-entries", [])
    const storedWeeklyReviews = getScoped<WeeklyReview[]>("virtual", userId, "weekly-reviews", [])

    // If no data exists, generate demo data and save it
    if (storedTrades.length === 0 && storedMorningChecks.length === 0 && storedJournalEntries.length === 0) {
      console.log("[v0] No virtual data found - generating demo data")
      const demoTrades = generateVirtualTrades(30)
      const demoMorningChecks = generateVirtualMorningChecks(30)
      const demoJournalEntries = generateVirtualJournalEntries(15)

      // Save to namespaced localStorage
      setScoped("virtual", userId, "trades", demoTrades)
      setScoped("virtual", userId, "morning-checks", demoMorningChecks)
      setScoped("virtual", userId, "journal-entries", demoJournalEntries)

      dispatch({ type: "SET_TRADES", payload: demoTrades })
      dispatch({ type: "SET_MORNING_CHECKS", payload: demoMorningChecks })
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: demoJournalEntries })

      console.log(
        `[v0] Generated and saved ${demoTrades.length} trades, ${demoMorningChecks.length} morning checks, ${demoJournalEntries.length} journal entries`,
      )
    } else {
      // Load existing data
      dispatch({ type: "SET_TRADES", payload: storedTrades })
      dispatch({ type: "SET_MORNING_CHECKS", payload: storedMorningChecks })
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: storedJournalEntries })
      dispatch({ type: "SET_WEEKLY_REVIEWS", payload: storedWeeklyReviews })

      console.log(
        `[v0] Loaded from localStorage: ${storedTrades.length} trades, ${storedMorningChecks.length} morning checks, ${storedJournalEntries.length} journal entries`,
      )
    }

    dispatch({ type: "SET_DATA_OWNER", payload: userId })
    dispatch({ type: "SET_DATA_LOADED", payload: true })
  }, [])

  const loadDataFromSupabase = useCallback(async () => {
    if (!user?.id || loadingRef.current) return

    loadingRef.current = true
    console.log(`[v0] ✓ LIVE MODE ACTIVE - Loading ONLY from Supabase for user ${user.id}`)

    try {
      const { data: journalData, error: tradesError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .not("pair", "is", null)
        .order("created_at", { ascending: false })

      if (!tradesError && journalData) {
        const trades = journalData.map((entry: any) => ({
          id: entry.id,
          date: entry.date,
          pair: entry.pair,
          direction: entry.direction || "long",
          entryPrice: entry.entry_price || 0,
          exitPrice: entry.exit_price || 0,
          quantity: entry.quantity || 0,
          pnl: entry.pnl || 0,
          mood: entry.mood,
          confidence: entry.confidence,
          stress: entry.stress,
          discipline: entry.discipline,
          emotionBefore: entry.emotion_before,
          emotionDuring: entry.emotion_during,
          emotionAfter: entry.emotion_after,
          notes: entry.notes,
          entryReason: entry.entry_reason,
          exitReason: entry.exit_reason,
          marketConditions: entry.market_conditions,
          revengeTrade: entry.revenge_trade,
          exitedEarly: entry.exited_early,
          missedDueToHesitation: entry.missed_due_to_hesitation,
          matchedPlan: entry.matched_plan,
          tags: entry.tags,
        }))
        console.log(`[v0] Loaded ${trades.length} trades from journal_entries for user ${user.id}`)
        dispatch({ type: "SET_TRADES", payload: trades })
      } else if (tradesError) {
        console.error("[v0] Error loading trades:", tradesError.message)
        dispatch({ type: "SET_TRADES", payload: [] })
      }

      const { data: morningChecks, error: morningError } = await supabase
        .from("morning_checks")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (!morningError && morningChecks) {
        const mappedChecks = morningChecks.map((check: any) => ({
          id: check.id,
          date: check.date,
          score: check.score,
          emotionalState: check.emotional_state,
          stressLevel: check.stress_level,
          sleepHours: check.sleep_hours,
          sleepQuality: check.sleep_quality,
          energyLevel: check.energy_level,
          focus: check.focus,
          physicalHealth: check.physical_health,
          hydration: check.hydration,
          exercised: check.exercised,
          morningRoutine: check.morning_routine,
          meditation: check.meditation,
          locked: check.locked,
        }))
        console.log(`[v0] Loaded ${mappedChecks.length} morning checks from Supabase for user ${user.id}`)
        dispatch({ type: "SET_MORNING_CHECKS", payload: mappedChecks })
      } else if (morningError) {
        console.error("[v0] Error loading morning checks:", morningError.message)
        dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      }

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
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      }

      const { data: weeklyReviews, error: weeklyError } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!weeklyError && weeklyReviews) {
        console.log(`[v0] Loaded ${weeklyReviews.length} weekly reviews from Supabase for user ${user.id}`)
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: weeklyReviews })
      } else if (weeklyError) {
        if (weeklyError.message !== "signal is aborted without reason") {
          console.error("[v0] Error loading weekly reviews:", weeklyError)
        }
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      }

      dispatch({ type: "SET_DATA_OWNER", payload: user.id })
      dispatch({ type: "SET_DATA_LOADED", payload: true })
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
        return
      }
      console.error("[v0] Error loading data from Supabase:", error)
      dispatch({ type: "SET_TRADES", payload: [] })
      dispatch({ type: "SET_MORNING_CHECKS", payload: [] })
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      dispatch({ type: "SET_WEEKLY_REVIEWS", payload: [] })
      dispatch({ type: "SET_DATA_LOADED", payload: true })
    } finally {
      loadingRef.current = false
    }
  }, [user?.id])

  useEffect(() => {
    if (!authReady || modeLoading) {
      console.log("[v0] Waiting for auth/mode to be ready...")
      return
    }

    if (!user?.id) {
      console.log("[v0] No user - skipping data load")
      return
    }

    // Detect mode change
    if (prevModeRef.current !== null && prevModeRef.current !== isLiveMode) {
      console.log(
        `[v0] Mode changed from ${prevModeRef.current ? "LIVE" : "VIRTUAL"} to ${isLiveMode ? "LIVE" : "VIRTUAL"} - clearing data`,
      )
      dispatch({ type: "CLEAR_ALL_DATA" })
    }
    prevModeRef.current = isLiveMode

    console.log(`[v0] Mode debug: isLiveMode=${isLiveMode}, userId=${user.id}`)

    if (isLiveMode) {
      loadDataFromSupabase()
    } else {
      loadVirtualData(user.id)
    }
  }, [user?.id, isLiveMode, authReady, modeLoading, loadDataFromSupabase, loadVirtualData])

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
    async (trade: Trade): Promise<boolean> => {
      if (isLiveMode && user?.id) {
        const tradeTitle = `${trade.pair} ${trade.direction.toUpperCase()}`
        const tradeContent = `Trade: ${trade.pair} ${trade.direction.toUpperCase()} | Entry: ${trade.entryPrice} | Exit: ${trade.exitPrice} | PnL: ${trade.pnl >= 0 ? "+" : ""}$${trade.pnl}${trade.notes ? ` | Notes: ${trade.notes}` : ""}`

        const { error } = await supabase.from("journal_entries").insert({
          user_id: user.id,
          title: tradeTitle,
          content: tradeContent,
          date: trade.date,
          pair: trade.pair,
          direction: trade.direction,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          quantity: trade.quantity,
          pnl: trade.pnl,
          mood: trade.mood,
          confidence: trade.confidence,
          stress: trade.stress,
          discipline: trade.discipline,
          emotion_before: trade.emotionBefore,
          emotion_during: trade.emotionDuring,
          emotion_after: trade.emotionAfter,
          notes: trade.notes,
          entry_reason: trade.entryReason,
          exit_reason: trade.exitReason,
          market_conditions: trade.marketConditions,
          revenge_trade: trade.revengeTrade,
          exited_early: trade.exitedEarly,
          missed_due_to_hesitation: trade.missedDueToHesitation,
          matched_plan: trade.matchedPlan,
          tags: trade.tags,
          type: "trade",
          // NEW FIELDS
          open_time: trade.openTime,
          close_time: trade.closeTime,
          session: trade.session,
          trade_type: trade.tradeType,
          pips: trade.pips,
          position_size: trade.positionSize,
          confidence_before: trade.confidenceBefore,
          stress_level: trade.stressLevel,
          detailed_analysis: trade.detailedAnalysis,
          behavior_description: trade.behaviorDescription,
          open_date: trade.openDate,
          close_date: trade.closeDate,
          followed_plan: trade.followedPlan,
        })

        if (error) {
          console.error("[LIVE] insert trade FAIL:", error.message)
          toast({
            title: "Chyba",
            description: "Nepodařilo se uložit obchod: " + error.message,
            variant: "destructive",
          })
          return false
        }

        console.log("[LIVE] insert trade OK")
        refreshLiveData()
        return true
      } else if (user?.id) {
        const newTrades = [...state.trades, trade]
        dispatch({ type: "ADD_TRADE", payload: trade })
        setScoped("virtual", user.id, "trades", newTrades)
        return true
      }
      return false
    },
    [isLiveMode, user?.id, refreshLiveData, state.trades],
  )

  const updateTrade = useCallback(
    async (trade: Trade) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").update(trade).eq("id", trade.id).eq("user_id", user.id)
        if (error) {
          console.error("[v0] Error updating trade:", error)
          toast({ title: "Chyba", description: "Nepodařilo se aktualizovat obchod", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        dispatch({ type: "UPDATE_TRADE", payload: trade })
        const updatedTrades = state.trades.map((t) => (t.id === trade.id ? trade : t))
        setScoped("virtual", user.id, "trades", updatedTrades)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.trades],
  )

  const deleteTrade = useCallback(
    async (id: string) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id)
        if (error) {
          console.error("[v0] Error deleting trade:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se smazat obchod", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        dispatch({ type: "DELETE_TRADE", payload: id })
        const filteredTrades = state.trades.filter((t) => t.id !== id)
        setScoped("virtual", user.id, "trades", filteredTrades)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.trades],
  )

  const addMorningCheck = useCallback(
    async (check: MorningCheck): Promise<boolean> => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("morning_checks").upsert(
          {
            user_id: user.id,
            date: check.date,
            sleep_hours: check.sleepHours,
            sleep_quality: check.sleepQuality,
            energy_level: check.energyLevel,
            stress_level: check.stressLevel,
            emotional_state: check.emotionalState,
            focus: check.focus,
            physical_health: check.physicalHealth,
            score: check.score,
            exercised: check.exercised,
            morning_routine: check.morningRoutine,
            meditation: check.meditation,
          },
          {
            onConflict: "user_id,date", // Changed from "date" to "user_id,date"
          },
        )

        if (error) {
          console.error("[LIVE] insert morning_check FAIL:", error.message)
          toast({
            title: "Chyba",
            description: "Nepodařilo se uložit ranní kontrolu: " + error.message,
            variant: "destructive",
          })
          return false
        }

        console.log("[LIVE] insert morning_check OK")
        refreshLiveData()
        return true
      } else if (user?.id) {
        const newChecks = [...state.morningChecks, check]
        dispatch({ type: "ADD_MORNING_CHECK", payload: check })
        setScoped("virtual", user.id, "morning-checks", newChecks)
        return true
      }
      return false
    },
    [isLiveMode, user?.id, refreshLiveData, state.morningChecks],
  )

  const addJournalEntry = useCallback(
    async (entry: any) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").insert({ ...entry, user_id: user.id })
        if (error) {
          console.error("[v0] Error adding journal entry:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se uložit položku deníku", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        dispatch({ type: "ADD_JOURNAL_ENTRY", payload: entry })
        const newEntries = [...state.journalEntries, entry]
        setScoped("virtual", user.id, "journal-entries", newEntries)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.journalEntries],
  )

  const updateJournalEntry = useCallback(
    async (entry: any) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").update(entry).eq("id", entry.id).eq("user_id", user.id)
        if (error) {
          console.error("[v0] Error updating journal entry:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se aktualizovat položku deníku", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        const updatedEntries = state.journalEntries.map((e) => (e.id === entry.id ? entry : e))
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: updatedEntries })
        setScoped("virtual", user.id, "journal-entries", updatedEntries)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.journalEntries],
  )

  const deleteJournalEntry = useCallback(
    async (id: string) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", user.id)
        if (error) {
          console.error("[v0] Error deleting journal entry:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se smazat položku deníku", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        const filteredEntries = state.journalEntries.filter((e) => e.id !== id)
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: filteredEntries })
        setScoped("virtual", user.id, "journal-entries", filteredEntries)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.journalEntries],
  )

  const addWeeklyReview = useCallback(
    async (review: WeeklyReview) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("weekly_reviews").insert({ ...review, user_id: user.id })
        if (error) {
          console.error("[v0] Error adding weekly review:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se uložit týdenní shrnutí", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        dispatch({ type: "ADD_WEEKLY_REVIEW", payload: review })
        const newReviews = [...state.weeklyReviews, review]
        setScoped("virtual", user.id, "weekly-reviews", newReviews)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.weeklyReviews],
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
          console.error("[v0] Error updating weekly review:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se aktualizovat týdenní shrnutí", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        const updatedReviews = state.weeklyReviews.map((r) => (r.id === review.id ? review : r))
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: updatedReviews })
        setScoped("virtual", user.id, "weekly-reviews", updatedReviews)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.weeklyReviews],
  )

  const deleteWeeklyReview = useCallback(
    async (id: string) => {
      if (isLiveMode && user?.id) {
        const { error } = await supabase.from("weekly_reviews").delete().eq("id", id).eq("user_id", user.id)
        if (error) {
          console.error("[v0] Error deleting weekly review:", error.message)
          toast({ title: "Chyba", description: "Nepodařilo se smazat týdenní shrnutí", variant: "destructive" })
          return
        }
        refreshLiveData()
      } else if (user?.id) {
        const filteredReviews = state.weeklyReviews.filter((r) => r.id !== id)
        dispatch({ type: "SET_WEEKLY_REVIEWS", payload: filteredReviews })
        setScoped("virtual", user.id, "weekly-reviews", filteredReviews)
      }
    },
    [isLiveMode, user?.id, refreshLiveData, state.weeklyReviews],
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
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averagePnL: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        averageWin: 0,
        averageLoss: 0,
      }
    }

    const winningTrades = trades.filter((t) => t.pnl > 0)
    const losingTrades = trades.filter((t) => t.pnl < 0)
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      totalPnL,
      averagePnL: totalPnL / trades.length,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Number.POSITIVE_INFINITY : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map((t) => t.pnl)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map((t) => t.pnl)) : 0,
      averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
    }
  }, [state.trades])

  const resetAllScores = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_DATA" })
  }, [])

  const isOwner = useMemo(() => {
    return user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL
  }, [user?.email])

  const getTraderProfile = useCallback(
    (days: number) => {
      const stats = getTradingStats()
      const now = new Date()
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      const recentTrades = state.trades.filter(
        (t) => new Date(t.entryTime) >= startDate
      )
      
      const recentMorningChecks = state.morningChecks.filter(
        (m) => new Date(m.date) >= startDate
      )
      
      const avgMood = recentMorningChecks.length > 0
        ? recentMorningChecks.reduce((sum, m) => sum + m.mood, 0) / recentMorningChecks.length
        : 5
      
      const avgStress = recentMorningChecks.length > 0
        ? recentMorningChecks.reduce((sum, m) => sum + (m.stress || 5), 0) / recentMorningChecks.length
        : 5
      
      return {
        performance: {
          totalTrades: recentTrades.length,
          winRate: String(stats.winRate),
          totalPnL: String(stats.totalPnL || 0),
          consecutiveWins: stats.currentStreak > 0 ? stats.currentStreak : 0,
          consecutiveLosses: stats.currentStreak < 0 ? Math.abs(stats.currentStreak) : 0,
        },
        psychology: {
          averageMood: String(avgMood.toFixed(1)),
          averageStress: String(avgStress.toFixed(1)),
          averageReadiness: String(currentReadiness),
        },
        patterns: {
          revengeTradeRate: "0",
          emotionalTrades: 0,
        },
        period: {
          days,
          startDate: startDate.toISOString().split("T")[0],
          endDate: now.toISOString().split("T")[0],
        },
        goals: state.tradingGoals || [],
      }
    },
    [getTradingStats, state.trades, state.morningChecks, state.tradingGoals, currentReadiness],
  )

  const value = useMemo(
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
      currentReadiness,
      dataLoaded: state.dataLoaded,
      dataOwnerUserId: state.dataOwnerUserId,
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
      isOwner,
      canSwitchModes,
      isVirtualMode: !isLiveMode,
      getTraderProfile,
    }),
    [
      state,
      isLiveMode,
      currentReadiness,
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
      isOwner,
      canSwitchModes,
      getTraderProfile,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
