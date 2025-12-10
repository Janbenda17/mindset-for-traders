"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useGamification } from "./gamification-context"

interface Milestone {
  id: string
  title: string
  description: string
  type: "level" | "streak" | "trades" | "xp" | "achievement"
  threshold: number
  badge: string
  reward: number
  unlocked: boolean
  unlockedAt?: string
}

interface MilestoneCelebration {
  milestone: Milestone
  message: string
  showConfetti: boolean
}

interface MilestoneCelebrationsContextType {
  milestones: Milestone[]
  currentCelebration: MilestoneCelebration | null
  checkMilestones: () => void
  dismissCelebration: () => void
  getUnlockedMilestones: () => Milestone[]
}

const MilestoneCelebrationsContext = createContext<MilestoneCelebrationsContextType | undefined>(undefined)

const MILESTONES: Omit<Milestone, "unlocked" | "unlockedAt">[] = [
  {
    id: "level-5",
    title: "Rising Star",
    description: "Reach Level 5",
    type: "level",
    threshold: 5,
    badge: "⭐",
    reward: 100,
  },
  {
    id: "level-10",
    title: "Experienced Trader",
    description: "Reach Level 10",
    type: "level",
    threshold: 10,
    badge: "🌟",
    reward: 250,
  },
  {
    id: "level-20",
    title: "Master Trader",
    description: "Reach Level 20",
    type: "level",
    threshold: 20,
    badge: "💫",
    reward: 500,
  },
  {
    id: "streak-30",
    title: "Consistency Champion",
    description: "Maintain a 30-day streak",
    type: "streak",
    threshold: 30,
    badge: "🔥",
    reward: 300,
  },
  {
    id: "streak-90",
    title: "Unstoppable Force",
    description: "Maintain a 90-day streak",
    type: "streak",
    threshold: 90,
    badge: "⚡",
    reward: 1000,
  },
  {
    id: "trades-100",
    title: "Century Club",
    description: "Complete 100 trades",
    type: "trades",
    threshold: 100,
    badge: "💯",
    reward: 500,
  },
  {
    id: "trades-500",
    title: "Trading Veteran",
    description: "Complete 500 trades",
    type: "trades",
    threshold: 500,
    badge: "🏆",
    reward: 2000,
  },
  {
    id: "xp-5000",
    title: "XP Collector",
    description: "Earn 5,000 XP",
    type: "xp",
    threshold: 5000,
    badge: "💎",
    reward: 500,
  },
  {
    id: "xp-10000",
    title: "XP Master",
    description: "Earn 10,000 XP",
    type: "xp",
    threshold: 10000,
    badge: "👑",
    reward: 1000,
  },
]

export function MilestoneCelebrationsProvider({ children }: { children: React.ReactNode }) {
  const { level, xp } = useGamification()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [currentCelebration, setCurrentCelebration] = useState<MilestoneCelebration | null>(null)

  // Load milestones from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem("milestones")
    if (stored) {
      setMilestones(JSON.parse(stored))
    } else {
      const initial = MILESTONES.map((m) => ({ ...m, unlocked: false }))
      setMilestones(initial)
      localStorage.setItem("milestones", JSON.stringify(initial))
    }
  }, [])

  // Check milestones whenever relevant data changes
  useEffect(() => {
    if (milestones.length > 0) {
      checkMilestones()
    }
  }, [level, xp])

  const checkMilestones = () => {
    if (typeof window === "undefined") return

    const journalEntries = JSON.parse(localStorage.getItem("journal-entries") || "[]")
    const streakData = JSON.parse(localStorage.getItem("streak-data") || "{}")

    const stats = {
      level,
      xp,
      trades: journalEntries.length,
      streak: Math.max(
        streakData.journaling?.current || 0,
        streakData.morningCheck?.current || 0,
        streakData.dailyTracker?.current || 0,
      ),
    }

    const updated = milestones.map((milestone) => {
      if (milestone.unlocked) return milestone

      let shouldUnlock = false
      switch (milestone.type) {
        case "level":
          shouldUnlock = stats.level >= milestone.threshold
          break
        case "xp":
          shouldUnlock = stats.xp >= milestone.threshold
          break
        case "trades":
          shouldUnlock = stats.trades >= milestone.threshold
          break
        case "streak":
          shouldUnlock = stats.streak >= milestone.threshold
          break
      }

      if (shouldUnlock) {
        const unlockedMilestone = {
          ...milestone,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        }

        // Trigger celebration
        triggerCelebration(unlockedMilestone)

        return unlockedMilestone
      }

      return milestone
    })

    if (JSON.stringify(updated) !== JSON.stringify(milestones)) {
      setMilestones(updated)
      localStorage.setItem("milestones", JSON.stringify(updated))
    }
  }

  const triggerCelebration = (milestone: Milestone) => {
    const messages = [
      `Incredible achievement! You've unlocked ${milestone.title}!`,
      `Congratulations! ${milestone.title} is now yours!`,
      `Amazing work! You've earned the ${milestone.title} milestone!`,
      `Outstanding! ${milestone.title} unlocked!`,
      `Phenomenal! You've reached ${milestone.title}!`,
    ]

    const celebration: MilestoneCelebration = {
      milestone,
      message: messages[Math.floor(Math.random() * messages.length)],
      showConfetti: true,
    }

    setCurrentCelebration(celebration)

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setCurrentCelebration(null)
    }, 5000)
  }

  const dismissCelebration = () => {
    setCurrentCelebration(null)
  }

  const getUnlockedMilestones = () => {
    return milestones.filter((m) => m.unlocked)
  }

  return (
    <MilestoneCelebrationsContext.Provider
      value={{
        milestones,
        currentCelebration,
        checkMilestones,
        dismissCelebration,
        getUnlockedMilestones,
      }}
    >
      {children}
    </MilestoneCelebrationsContext.Provider>
  )
}

export function useMilestoneCelebrations() {
  const context = useContext(MilestoneCelebrationsContext)
  if (!context) {
    throw new Error("useMilestoneCelebrations must be used within MilestoneCelebrationsProvider")
  }
  return context
}
