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
  completeStage: (stageId: number) => void
  resetStages: () => void
  getProgress: () => number
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

  // Load stages from localStorage on mount
  useEffect(() => {
    const savedStages = localStorage.getItem("daily-stages")
    const today = new Date().toDateString()
    const lastReset = localStorage.getItem("daily-stages-date")

    if (lastReset !== today) {
      // Reset stages for new day
      localStorage.setItem("daily-stages-date", today)
      localStorage.setItem("daily-stages", JSON.stringify(initialStages))
      setStages(initialStages)
      setCurrentStage(1)
    } else if (savedStages) {
      const parsedStages = JSON.parse(savedStages)
      setStages(parsedStages)

      // Find first incomplete stage
      const firstIncomplete = parsedStages.findIndex((s: Stage) => !s.completed)
      setCurrentStage(firstIncomplete !== -1 ? parsedStages[firstIncomplete].id : parsedStages.length)
    }
  }, [])

  const completeStage = (stageId: number) => {
    setStages((prev) => {
      const newStages = prev.map((stage) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            completed: true,
            completedAt: new Date().toISOString(),
          }
        }
        // Unlock next stage
        if (stage.id === stageId + 1) {
          return {
            ...stage,
            unlocked: true,
          }
        }
        return stage
      })

      localStorage.setItem("daily-stages", JSON.stringify(newStages))

      // Update current stage to next incomplete
      const nextIncomplete = newStages.findIndex((s) => !s.completed)
      if (nextIncomplete !== -1) {
        setCurrentStage(newStages[nextIncomplete].id)
      }

      return newStages
    })
  }

  const resetStages = () => {
    setStages(initialStages)
    setCurrentStage(1)
    localStorage.setItem("daily-stages", JSON.stringify(initialStages))
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
