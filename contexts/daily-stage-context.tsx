"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Stage {
  id: number
  name: string
  title: string
  description: string
  icon: string
  href: string
  completed: boolean
  unlocked: boolean
  completedAt?: string
}

interface DailyStageContextType {
  stages: Stage[]
  currentStage: number
  completeStage: (stageId: number) => Promise<void>
  resetStages: () => void
  getProgress: () => number
  isLoading: boolean
}

const DailyStageContext = createContext<DailyStageContextType | undefined>(undefined)

const initialStages: Stage[] = [
  {
    id: 1,
    name: "morning-assessment",
    title: "Morning Assessment",
    description: "Check your physical and mental state",
    icon: "🌅",
    href: "/morning-check",
    completed: false,
    unlocked: true,
  },
  {
    id: 2,
    name: "daily-intention",
    title: "Daily Intention",
    description: "Set your goals and emotional targets",
    icon: "🎯",
    href: "/daily-intention",
    completed: false,
    unlocked: false,
  },
  {
    id: 3,
    name: "trading-plan",
    title: "Trading Plan",
    description: "Define your strategy for today",
    icon: "📋",
    href: "/trading-plan",
    completed: false,
    unlocked: false,
  },
  {
    id: 4,
    name: "record-trades",
    title: "Record Trades",
    description: "Log your trades and emotions",
    icon: "💼",
    href: "/record-trades",
    completed: false,
    unlocked: false,
  },
  {
    id: 5,
    name: "daily-summary",
    title: "Daily Summary",
    description: "Review your day and key learnings",
    icon: "🌙",
    href: "/daily-summary",
    completed: false,
    unlocked: false,
  },
]

export function DailyStageProvider({ children }: { children: React.ReactNode }) {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [currentStage, setCurrentStage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStagesFromSupabase()
  }, [])

  const loadStagesFromSupabase = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/daily-stages/get")

      if (!response.ok) {
        console.error(`[v0] Failed to load daily stages: ${response.status} ${response.statusText}`)
        setStages(initialStages)
        setIsLoading(false)
        return
      }

      const data = await response.json()

      const stagesWithCompletion = initialStages.map((stage) => {
        let completed = false
        let completedAt: string | undefined

        switch (stage.id) {
          case 1:
            completed = data.morning_check_completed || false
            completedAt = data.morning_check_completed_at
            break
          case 2:
            completed = data.daily_intention_completed || false
            completedAt = data.daily_intention_completed_at
            break
          case 3:
            completed = data.trading_plan_completed || false
            completedAt = data.trading_plan_completed_at
            break
          case 4:
            completed = data.record_trades_completed || false
            completedAt = data.record_trades_completed_at
            break
          case 5:
            completed = data.daily_summary_completed || false
            completedAt = data.daily_summary_completed_at
            break
        }

        return {
          ...stage,
          completed,
          completedAt,
          unlocked: false, // Will be set in second pass
        }
      })

      const updatedStages = stagesWithCompletion.map((stage, index) => ({
        ...stage,
        unlocked: stage.id === 1 || (index > 0 && stagesWithCompletion[index - 1].completed),
      }))

      setStages(updatedStages)

      // Find current stage (first incomplete, unlocked stage)
      const firstIncomplete = updatedStages.findIndex((s) => !s.completed && s.unlocked)
      setCurrentStage(firstIncomplete !== -1 ? updatedStages[firstIncomplete].id : updatedStages.length)

      console.log(
        `[v0] Loaded daily stages - current stage: ${firstIncomplete !== -1 ? updatedStages[firstIncomplete].id : "all completed"}`,
      )
      console.log(
        `[v0] Stage completion status:`,
        updatedStages.map((s) => `${s.id}: ${s.completed ? "completed" : s.unlocked ? "unlocked" : "locked"}`),
      )
    } catch (error) {
      console.error("[v0] Error loading daily stages:", error)
      setStages(initialStages)
    } finally {
      setIsLoading(false)
    }
  }

  const completeStage = async (stageId: number) => {
    try {
      console.log(`[v0] Completing stage ${stageId}...`)

      const response = await fetch("/api/daily-stages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId, completed: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to complete stage:", errorData)
        return
      }

      const data = await response.json()
      console.log(`[v0] Stage ${stageId} completed successfully:`, data)

      await loadStagesFromSupabase()
    } catch (error) {
      console.error("[v0] Error completing stage:", error)
    }
  }

  const resetStages = () => {
    setStages(initialStages)
    setCurrentStage(1)
    loadStagesFromSupabase()
  }

  const getProgress = () => {
    const completed = stages.filter((s) => s.completed).length
    return Math.round((completed / stages.length) * 100)
  }

  return (
    <DailyStageContext.Provider
      value={{
        stages,
        currentStage,
        completeStage,
        resetStages,
        getProgress,
        isLoading,
      }}
    >
      {children}
    </DailyStageContext.Provider>
  )
}

export function useDailyStage() {
  const context = useContext(DailyStageContext)
  if (context === undefined) {
    throw new Error("useDailyStage must be used within a DailyStageProvider")
  }
  return context
}
