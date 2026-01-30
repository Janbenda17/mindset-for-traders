"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly"
  startDate: string
  endDate: string
  reward: number
  participants: number
  completed: number
  difficulty: "easy" | "medium" | "hard"
  category: string
}

interface LeaderboardEntry {
  rank: number
  username: string
  points: number
  challengesCompleted: number
  avatar: string
}

interface UserChallengeProgress {
  challengeId: string
  progress: number
  completed: boolean
  joinedAt: string
}

interface CommunityChallengesContextType {
  challenges: Challenge[]
  leaderboard: LeaderboardEntry[]
  userProgress: UserChallengeProgress[]
  joinChallenge: (challengeId: string) => Promise<void>
  leaveChallenge: (challengeId: string) => Promise<void>
  updateProgress: (challengeId: string, progress: number) => Promise<void>
  isLoading: boolean
}

const CommunityChallengesContext = createContext<CommunityChallengesContextType | undefined>(undefined)

export function CommunityChallengesProvider({ children }: { children: React.ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, authReady } = useAuth()

  useEffect(() => {
    if (authReady) {
      if (user) {
        loadChallenges()
        loadUserProgress()
      } else {
        setIsLoading(false)
      }
    }
  }, [authReady, user])

  const loadChallenges = async () => {
    try {
      const response = await fetch("/api/challenges", {
        credentials: "include",
      })

      if (response.status === 401) {
        console.log("[v0] Challenges: Not authenticated")
        setIsLoading(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges)
        setLeaderboard(data.leaderboard)
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("[v0] Failed to load challenges:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProgress = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/challenges/user-progress?userId=${user.id}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUserProgress(data.progress || [])
      } else {
        // Fallback to empty array if no progress exists
        setUserProgress([])
      }
    } catch (error) {
      console.error("[v0] Failed to load user progress:", error)
      // Still try to load from localStorage as fallback for non-premium users
      const stored = localStorage.getItem("community-challenges-progress")
      if (stored) {
        setUserProgress(JSON.parse(stored))
      }
    }
  }

  const saveUserProgress = async (progress: UserChallengeProgress[]) => {
    if (!user?.id) return

    try {
      await fetch("/api/challenges/user-progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, progress }),
      })
      setUserProgress(progress)
    } catch (error) {
      console.error("[v0] Failed to save user progress:", error)
      // Fallback to localStorage
      localStorage.setItem("community-challenges-progress", JSON.stringify(progress))
      setUserProgress(progress)
    }
  }

  const joinChallenge = async (challengeId: string) => {
    const existing = userProgress.find((p) => p.challengeId === challengeId)
    if (existing) return

    const newProgress: UserChallengeProgress = {
      challengeId,
      progress: 0,
      completed: false,
      joinedAt: new Date().toISOString(),
    }

    await saveUserProgress([...userProgress, newProgress])
  }

  const leaveChallenge = async (challengeId: string) => {
    const filtered = userProgress.filter((p) => p.challengeId !== challengeId)
    await saveUserProgress(filtered)
  }

  const updateProgress = async (challengeId: string, progress: number) => {
    const updated = userProgress.map((p) =>
      p.challengeId === challengeId ? { ...p, progress, completed: progress >= 100 } : p,
    )
    await saveUserProgress(updated)
  }

  return (
    <CommunityChallengesContext.Provider
      value={{
        challenges,
        leaderboard,
        userProgress,
        joinChallenge,
        leaveChallenge,
        updateProgress,
        isLoading,
      }}
    >
      {children}
    </CommunityChallengesContext.Provider>
  )
}

export function useChallenges() {
  const context = useContext(CommunityChallengesContext)
  if (!context) {
    throw new Error("useChallenges must be used within CommunityChallengesProvider")
  }
  return context
}
