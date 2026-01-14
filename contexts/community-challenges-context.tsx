"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context" // Import useAuth to check if user exists

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
  joinChallenge: (challengeId: string) => void
  leaveChallenge: (challengeId: string) => void
  updateProgress: (challengeId: string, progress: number) => void
  isLoading: boolean
}

const CommunityChallengesContext = createContext<CommunityChallengesContextType | undefined>(undefined)

export function CommunityChallengesProvider({ children }: { children: React.ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth() // Import useAuth to check if user exists

  // Load challenges and leaderboard
  useEffect(() => {
    if (user) {
      loadChallenges()
      loadUserProgress()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadChallenges = async () => {
    try {
      const response = await fetch("/api/challenges")
      const data = await response.json()
      setChallenges(data.challenges)
      setLeaderboard(data.leaderboard)
    } catch (error) {
      console.error("[v0] Failed to load challenges:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProgress = () => {
    const stored = localStorage.getItem("community-challenges-progress")
    if (stored) {
      setUserProgress(JSON.parse(stored))
    }
  }

  const saveUserProgress = (progress: UserChallengeProgress[]) => {
    localStorage.setItem("community-challenges-progress", JSON.stringify(progress))
    setUserProgress(progress)
  }

  const joinChallenge = (challengeId: string) => {
    const existing = userProgress.find((p) => p.challengeId === challengeId)
    if (existing) return

    const newProgress: UserChallengeProgress = {
      challengeId,
      progress: 0,
      completed: false,
      joinedAt: new Date().toISOString(),
    }

    saveUserProgress([...userProgress, newProgress])
  }

  const leaveChallenge = (challengeId: string) => {
    const filtered = userProgress.filter((p) => p.challengeId !== challengeId)
    saveUserProgress(filtered)
  }

  const updateProgress = (challengeId: string, progress: number) => {
    const updated = userProgress.map((p) =>
      p.challengeId === challengeId ? { ...p, progress, completed: progress >= 100 } : p,
    )
    saveUserProgress(updated)
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
