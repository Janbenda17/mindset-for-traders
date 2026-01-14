"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useData } from "./data-context"
import { computeAnalytics, type ComputedAnalytics } from "@/lib/analytics-engine"

interface AnalyticsContextType {
  analytics: ComputedAnalytics | null
  isLoading: boolean
  refresh: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { getAllTrades, getAllJournalEntries, getAllMorningChecks, userId } = useData() // Add userId dependency
  const [analytics, setAnalytics] = useState<ComputedAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const trades = getAllTrades() || []
  const journalEntries = getAllJournalEntries() || []
  const morningChecks = getAllMorningChecks() || []

  useEffect(() => {
    if (!userId) {
      console.log("[v0] [Analytics] No user - skipping analytics computation")
      setAnalytics(null)
      setIsLoading(false)
      return
    }

    console.log("[v0] [Analytics] Recomputing analytics from live data...")
    setIsLoading(true)

    try {
      const computed = computeAnalytics({
        trades,
        morningChecks,
        journalEntries,
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
  }, [trades, journalEntries, morningChecks, userId]) // Added userId to deps - recompute when user changes

  const refresh = () => {
    setIsLoading(true)
    const computed = computeAnalytics({
      trades,
      morningChecks,
      journalEntries,
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
