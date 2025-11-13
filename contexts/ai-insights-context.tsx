"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { useData } from "./data-context"

interface AIInsights {
  keyInsights: string[]
  predictions: string[]
  recommendations: string[]
  riskFactors: string[]
  strengths: string[]
}

interface AIInsightsContextType {
  insights: AIInsights | null
  isLoading: boolean
  lastGenerated: Date | null
  generateInsights: (type?: "daily" | "weekly" | "monthly") => Promise<void>
}

const AIInsightsContext = createContext<AIInsightsContextType | undefined>(undefined)

export function AIInsightsProvider({ children }: { children: React.ReactNode }) {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const { journalEntries, dailyTrackerEntries, morningChecks } = useData()

  const generateInsights = useCallback(
    async (type: "daily" | "weekly" | "monthly" = "weekly") => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journalEntries,
            dailyTrackerEntries,
            morningChecks,
            type,
          }),
        })

        if (!response.ok) throw new Error("Failed to generate insights")

        const data = await response.json()
        setInsights(data.insights)
        setLastGenerated(new Date())

        console.log("[v0] AI Insights generated:", data.insights)
      } catch (error) {
        console.error("[v0] Error generating insights:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [journalEntries, dailyTrackerEntries, morningChecks],
  )

  return (
    <AIInsightsContext.Provider
      value={{
        insights,
        isLoading,
        lastGenerated,
        generateInsights,
      }}
    >
      {children}
    </AIInsightsContext.Provider>
  )
}

export function useAIInsights() {
  const context = useContext(AIInsightsContext)
  if (context === undefined) {
    throw new Error("useAIInsights must be used within an AIInsightsProvider")
  }
  return context
}
