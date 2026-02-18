"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useData } from "./data-context"
import { useAuth } from "./auth-context"
import { useLiveMode } from "./live-mode-context"
import { computeAnalytics, type ComputedAnalytics } from "@/lib/analytics-engine"

interface AnalyticsContextType {
  analytics: ComputedAnalytics | null
  isLoading: boolean
  refresh: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth()
  const { isLoading: modeLoading } = useLiveMode()
  const { 
    getAllTrades, 
    getAllJournalEntries, 
    getAllMorningChecks,
    getAllDailyTrackerEntries,
    getAllTradingPlans,
    getAllDailyIntentions,
    getAllTradingRoutines,
    userId, 
    dataOwnerUserId, 
    dataLoaded 
  } = useData()

  const [analytics, setAnalytics] = useState<ComputedAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const trades = getAllTrades() || []
  const journalEntries = getAllJournalEntries() || []
  const morningChecks = getAllMorningChecks() || []
  const dailyTrackerEntries = getAllDailyTrackerEntries() || []
  const tradingPlans = getAllTradingPlans() || []
  const dailyIntentions = getAllDailyIntentions() || []
  const tradingRoutines = getAllTradingRoutines() || []

  useEffect(() => {
    if (!authReady) {
      console.log("[v0] [Analytics] Waiting for authReady...")
      setIsLoading(true)
      return
    }

    if (modeLoading) {
      console.log("[v0] [Analytics] Waiting for modeLoading...")
      setIsLoading(true)
      return
    }

    if (!user?.id) {
      console.log("[v0] [Analytics] No user - skipping analytics computation")
      setAnalytics(null)
      setIsLoading(false)
      return
    }

    if (dataOwnerUserId !== user.id) {
      console.log(
        `[v0] [Analytics] Data owner mismatch: dataOwnerUserId=${dataOwnerUserId}, userId=${user.id} - waiting for data reload`,
      )
      setIsLoading(true)
      return
    }

    if (!dataLoaded) {
      console.log("[v0] [Analytics] Data not loaded yet - waiting")
      // Only wait if we have no trades yet (initialization phase)
      if (trades.length === 0 && journalEntries.length === 0 && morningChecks.length === 0) {
        setIsLoading(true)
        return
      }
      // But if we have data, proceed with computation even if dataLoaded flag hasn't updated
    }

    console.log(`[v0] [Analytics] Computing analytics for user ${user.id} (data owner: ${dataOwnerUserId})`)
    setIsLoading(true)

    try {
      const computed = computeAnalytics({
        trades,
        morningChecks,
        journalEntries,
        dailyTrackerEntries,
        tradingPlans,
        dailyIntentions,
        tradingRoutines,
      })

      setAnalytics(computed)
      console.log("[v0] [Analytics] ✓ Analytics computed successfully")
      console.log(
        `[v0] [Analytics] Summary: ${computed.summary.totalTrades} trades, ${computed.summary.winRate.toFixed(1)}% win rate, ${computed.psychology.revengeIncidents} revenge incidents`,
      )
    } catch (error) {
      console.error("[v0] [Analytics] Error computing analytics:", error)
      setAnalytics(null)
    } finally {
      setIsLoading(false)
    }
  }, [trades, journalEntries, morningChecks, dailyTrackerEntries, tradingPlans, dailyIntentions, tradingRoutines, user?.id, authReady, modeLoading, dataOwnerUserId, dataLoaded])

  const refresh = () => {
    if (!user?.id || dataOwnerUserId !== user.id) {
      console.log("[v0] [Analytics] Refresh blocked - user/owner mismatch")
      return
    }

    setIsLoading(true)
    const computed = computeAnalytics({
      trades,
      morningChecks,
      journalEntries,
      dailyTrackerEntries,
      tradingPlans,
      dailyIntentions,
      tradingRoutines,
    })
    setAnalytics(computed)
    setIsLoading(false)
  }

  return <AnalyticsContext.Provider value={{ analytics, isLoading, refresh }}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        analytics: null,
        isLoading: true,
        refresh: () => {},
      }
    }
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
