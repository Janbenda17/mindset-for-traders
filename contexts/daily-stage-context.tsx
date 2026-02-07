"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAnalytics } from "./analytics-context"
import { useAuth } from "./auth-context" // Import useAuth
import { showXPNotification, showLevelUpNotification } from "@/lib/xp-notifications"

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
  completeStage: (stageId: number | string) => Promise<void>
  resetStages: () => void
  getProgress: () => number
  isLoading: boolean
}

const DailyStageContext = createContext<DailyStageContextType | undefined>(undefined)

const initialStages: Stage[] = [
  {
    id: 1,
    name: "morning-assessment",
    title: "Ranní Hodnocení",
    description: "Zkontroluj svůj fyzický a psychický stav",
    icon: "🌅",
    href: "/morning-check",
    completed: false,
    unlocked: true,
  },
  {
    id: 2,
    name: "daily-intention",
    title: "Denní Záměr",
    description: "Nastav si cíle a emoční záměry",
    icon: "🎯",
    href: "/daily-intention",
    completed: false,
    unlocked: false,
  },
  {
    id: 3,
    name: "trading-plan",
    title: "Obchodní Plán",
    description: "Definuj svou strategii na dnešek",
    icon: "📋",
    href: "/trading-plan",
    completed: false,
    unlocked: false,
  },
  {
    id: 4,
    name: "record-trades",
    title: "Záznam Obchodů",
    description: "Zaznamenej své obchody a emoce",
    icon: "💼",
    href: "/record-trades",
    completed: false,
    unlocked: false,
  },
  {
    id: 5,
    name: "daily-summary",
    title: "Denní Shrnutí",
    description: "Zhodnoť svůj den a klíčové poznatky",
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
  const { analytics } = useAnalytics()
  const { user } = useAuth() // Add useAuth to guard against null user

  useEffect(() => {
    if (user) {
      loadStagesFromSupabase()
    } else {
      console.log("[v0] [DailyStage] No user - skipping stage load")
      setStages(initialStages)
      setIsLoading(false)
    }
  }, [user])

  const loadStagesFromSupabase = async () => {
    if (!user) {
      console.log("[v0] [DailyStage] No user - cannot load stages")
      setStages(initialStages)
      setIsLoading(false)
      return
    }

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

  const stageNameToId: { [key: string]: number } = {
    "morning-assessment": 1,
    "daily-intention": 2,
    "trading-plan": 3,
    "record-trades": 4,
    "daily-summary": 5,
  }

  const completeStage = async (stageIdOrName: number | string) => {
    try {
      const stageId =
        typeof stageIdOrName === "string"
          ? stageNameToId[stageIdOrName] || Number.parseInt(stageIdOrName)
          : stageIdOrName

      if (!stageId || stageId < 1 || stageId > 5) {
        console.error(`[v0] Invalid stage ID: ${stageIdOrName} (resolved to: ${stageId})`)
        return
      }

      console.log(`[v0] Completing stage ${stageId} (from: ${stageIdOrName})...`)

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
      console.log(`[v0] ✓ Stage ${stageId} completed successfully`)

      // Award 5 XP for stage completion (except stage 1 which awards 10 XP via morning check)
      if (stageId > 1) {
        try {
          const xpResponse = await fetch("/api/xp/award", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "daily_stage", 
              metadata: { stage: stageId } 
            }),
          })
          const xpData = await xpResponse.json()
          if (xpData.success) {
            console.log(`[v0] Stage ${stageId} XP awarded: ${xpData.xpAwarded}`)
            showXPNotification(xpData.xpAwarded, `Fáze ${stageId} dokončena!`)
            if (xpData.leveledUp) {
              showLevelUpNotification(xpData.level)
            }
          }
        } catch (error) {
          console.error("[v0] Error awarding stage XP:", error)
        }
      }

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

  useEffect(() => {
    if (!analytics || isLoading) return

    const autoProgressStages = async () => {
      const { stages: stageConditions } = analytics

      // Auto-unlock stages based on data conditions
      if (stageConditions.shouldUnlockStage2 && !stages[1].unlocked && !stages[1].completed) {
        console.log("[v0] [Stages] Auto-unlocking Stage 2: Daily Intention (morning check completed)")
        await completeStage(1)
      }
      if (stageConditions.shouldUnlockStage3 && !stages[2].unlocked && !stages[2].completed) {
        console.log("[v0] [Stages] Auto-unlocking Stage 3: Trading Plan (daily intention set)")
        await completeStage(2)
      }
      if (stageConditions.shouldUnlockStage5 && !stages[4].unlocked && !stages[4].completed) {
        console.log("[v0] [Stages] Auto-unlocking Stage 5: Daily Summary (trades recorded)")
        await completeStage(4)
      }
    }

    autoProgressStages()
  }, [analytics])

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
    if (typeof window === "undefined") {
      return {
        stages: [],
        currentStage: 1,
        completeStage: async () => {},
        resetStages: () => {},
        getProgress: () => 0,
        isLoading: true,
      }
    }
    throw new Error("useDailyStage must be used within a DailyStageProvider")
  }
  return context
}
