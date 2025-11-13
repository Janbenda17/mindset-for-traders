"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useGamification } from "./gamification-context"

interface StreakData {
  journaling: {
    current: number
    longest: number
    lastEntry: string | null
  }
  morningCheck: {
    current: number
    longest: number
    lastEntry: string | null
  }
  dailyTracker: {
    current: number
    longest: number
    lastEntry: string | null
  }
}

interface StreakContextType {
  streaks: StreakData
  updateStreak: (type: "journaling" | "morningCheck" | "dailyTracker") => void
  checkStreaks: () => void
  getTotalStreak: () => number
  getStreakMultiplier: () => number
}

const StreakContext = createContext<StreakContextType | undefined>(undefined)

const STREAK_STORAGE_KEY = "trader-mindset-streaks"

function getDefaultStreaks(): StreakData {
  return {
    journaling: { current: 0, longest: 0, lastEntry: null },
    morningCheck: { current: 0, longest: 0, lastEntry: null },
    dailyTracker: { current: 0, longest: 0, lastEntry: null },
  }
}

function isToday(dateString: string | null): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isYesterday(dateString: string | null): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [streaks, setStreaks] = useState<StreakData>(getDefaultStreaks())
  const { toast } = useToast()
  const { addXP, removeXP } = useGamification()

  // Load streaks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY)
    if (stored) {
      try {
        setStreaks(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading streaks:", error)
      }
    }
  }, [])

  // Save streaks to localStorage
  const saveStreaks = useCallback((newStreaks: StreakData) => {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreaks))
    setStreaks(newStreaks)
  }, [])

  const updateStreak = useCallback(
    (type: "journaling" | "morningCheck" | "dailyTracker") => {
      const newStreaks = { ...streaks }
      const streak = newStreaks[type]

      if (isToday(streak.lastEntry)) {
        // Already logged today, no change
        return
      }

      if (isYesterday(streak.lastEntry) || streak.current === 0) {
        // Continue streak
        streak.current += 1
        streak.longest = Math.max(streak.longest, streak.current)
        streak.lastEntry = new Date().toISOString()

        // Award XP for streak milestones
        if (streak.current === 7) {
          addXP(50, "7-day streak!")
          toast({
            title: "7-Day Streak!",
            description: `You've maintained your ${type} streak for a week! +50 XP`,
          })
        } else if (streak.current === 30) {
          addXP(200, "30-day streak!")
          toast({
            title: "30-Day Streak!",
            description: `Amazing! You've maintained your ${type} streak for a month! +200 XP`,
          })
        } else if (streak.current === 100) {
          addXP(1000, "100-day streak!")
          toast({
            title: "100-Day Streak!",
            description: `Legendary! You've maintained your ${type} streak for 100 days! +1000 XP`,
          })
        }
      } else {
        // Streak broken - apply consequences
        const lostStreak = streak.current
        streak.current = 1
        streak.lastEntry = new Date().toISOString()

        if (lostStreak >= 7) {
          // Lose XP based on streak length
          const xpLoss = Math.min(lostStreak * 5, 500)
          removeXP(xpLoss, `Lost ${type} streak`)

          toast({
            title: "Streak Lost!",
            description: `You lost your ${lostStreak}-day ${type} streak. -${xpLoss} XP`,
            variant: "destructive",
          })
        }
      }

      saveStreaks(newStreaks)
    },
    [streaks, saveStreaks, addXP, removeXP, toast],
  )

  const checkStreaks = useCallback(() => {
    const newStreaks = { ...streaks }
    let hasChanges = false

    Object.keys(newStreaks).forEach((key) => {
      const type = key as keyof StreakData
      const streak = newStreaks[type]

      if (!isToday(streak.lastEntry) && !isYesterday(streak.lastEntry) && streak.current > 0) {
        // Streak broken
        const lostStreak = streak.current
        streak.current = 0

        if (lostStreak >= 7) {
          const xpLoss = Math.min(lostStreak * 5, 500)
          removeXP(xpLoss, `Lost ${type} streak`)
        }

        hasChanges = true
      }
    })

    if (hasChanges) {
      saveStreaks(newStreaks)
    }
  }, [streaks, saveStreaks, removeXP])

  const getTotalStreak = useCallback(() => {
    return streaks.journaling.current + streaks.morningCheck.current + streaks.dailyTracker.current
  }, [streaks])

  const getStreakMultiplier = useCallback(() => {
    const total = getTotalStreak()
    if (total >= 100) return 2.0
    if (total >= 50) return 1.5
    if (total >= 21) return 1.3
    if (total >= 7) return 1.2
    return 1.0
  }, [getTotalStreak])

  // Check streaks daily
  useEffect(() => {
    checkStreaks()
    const interval = setInterval(checkStreaks, 60 * 60 * 1000) // Check every hour
    return () => clearInterval(interval)
  }, [checkStreaks])

  return (
    <StreakContext.Provider
      value={{
        streaks,
        updateStreak,
        checkStreaks,
        getTotalStreak,
        getStreakMultiplier,
      }}
    >
      {children}
    </StreakContext.Provider>
  )
}

export function useStreak() {
  const context = useContext(StreakContext)
  if (context === undefined) {
    throw new Error("useStreak must be used within a StreakProvider")
  }
  return context
}
