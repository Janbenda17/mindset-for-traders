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
        console.log("[v0] Challenges: User logged in, loading challenges for user:", user.id)
        setIsLoading(true)
        // Don't clear challenges immediately - just load them
        loadChallenges()
        loadUserProgress()
      } else {
        console.log("[v0] Challenges: No user, clearing challenges")
        setChallenges([])
        setUserProgress([])
        setIsLoading(false)
      }
    }
  }, [authReady, user?.id])

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
    if (!user?.id) {
      console.log("[v0] Challenges: No user ID, skipping loadUserProgress")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Challenges: Loading user progress from API for user:", user.id)
      const response = await fetch(`/api/challenges/user-progress?userId=${user.id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        const status = response.status
        console.error("[v0] Challenges: API returned", status, "- attempting to parse error")
        const errorData = await response.text()
        console.error("[v0] Challenges: Error response body:", errorData)
        setUserProgress([])
      } else {
        const data = await response.json()
        console.log("[v0] Challenges: Loaded progress from API:", data.progress)
        setUserProgress(data.progress || [])
      }
    } catch (error) {
      console.error("[v0] Challenges: Failed to load user progress - exception:", error)
      setUserProgress([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveUserProgress = async (progress: UserChallengeProgress[]) => {
    if (!user?.id) return

    try {
      // Save each challenge individually to prevent data loss
      for (const p of progress) {
        await fetch("/api/challenges/user-progress", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            challengeId: p.challengeId,
            progress: p.progress,
            completed: p.completed,
          }),
        })
      }
      setUserProgress(progress)
    } catch (error) {
      console.error("[v0] Failed to save user progress:", error)
      // Fallback to localStorage
      localStorage.setItem("community-challenges-progress", JSON.stringify(progress))
      setUserProgress(progress)
    }
  }

  const joinChallenge = async (challengeId: string) => {
    console.log("[v0] Challenges: joinChallenge called for:", challengeId)
    
    const existing = userProgress.find((p) => p.challengeId === challengeId)
    if (existing) {
      console.log("[v0] Challenges: Already joined - skipping")
      return
    }

    const newProgress: UserChallengeProgress = {
      challengeId,
      progress: 0,
      completed: false,
      joinedAt: new Date().toISOString(),
    }

    // Immediately save the new challenge to database
    if (user?.id) {
      try {
        console.log("[v0] Challenges: Saving challenge to database...")
        const response = await fetch("/api/challenges/user-progress", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            challengeId,
            progress: 0,
            completed: false,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Challenges: Save failed with status", response.status, ":", errorText)
        } else {
          const result = await response.json()
          console.log("[v0] Challenges: Challenge joined and saved successfully:", challengeId)
        }
      } catch (error) {
        console.error("[v0] Challenges: Failed to join challenge - exception:", error)
      }
    }

    // Update local state
    setUserProgress([...userProgress, newProgress])
    console.log("[v0] Challenges: Local state updated with new challenge")
  }

  const leaveChallenge = async (challengeId: string) => {
    const filtered = userProgress.filter((p) => p.challengeId !== challengeId)
    
    // Remove from database
    if (user?.id) {
      try {
        await fetch("/api/challenges/user-progress", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            challengeId,
          }),
        })
      } catch (error) {
        console.error("[v0] Failed to leave challenge:", error)
      }
    }
    
    setUserProgress(filtered)
  }

  const updateProgress = async (challengeId: string, progress: number) => {
    console.log("[v0] Challenges: Updating progress for challenge:", challengeId, "progress:", progress)
    
    const updated = userProgress.map((p) =>
      p.challengeId === challengeId ? { ...p, progress, completed: progress >= 100 } : p,
    )
    
    // Save immediately to database
    if (user?.id) {
      try {
        const response = await fetch("/api/challenges/user-progress", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            challengeId,
            progress,
            completed: progress >= 100,
          }),
        })
        
        if (!response.ok) {
          console.error("[v0] Challenges: Failed to update progress - status:", response.status)
        } else {
          console.log("[v0] Challenges: Challenge progress updated and saved to database:", challengeId, progress)
        }
      } catch (error) {
        console.error("[v0] Challenges: Failed to update challenge progress:", error)
      }
    }
    
    setUserProgress(updated)
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
