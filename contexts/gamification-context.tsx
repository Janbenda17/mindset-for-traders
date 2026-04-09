"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  target?: number
}

interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "streak" | "count"
  target: number
  current: number
  xpReward: number
  difficulty: "easy" | "medium" | "hard" | "elite"
  startDate: string
  endDate?: string
  active: boolean
  completed: boolean
}

interface PsychologicalMetrics {
  calmScore: number
  focusRating: number
  recoveryIndex: number
  disciplineStreak: number
}

interface DailyXPLog {
  date: string
  readinessCompleted: boolean
  readinessAllStages: boolean
  journalCompleted: boolean
  lossResetCompleted: boolean
  aiReflectionCompleted: boolean
  xpEarned: number
}

interface GamificationData {
  xp: number
  level: number
  achievements: Achievement[]
  challenges: Challenge[]
  streaks: {
    morningCheck: number
    trading: number
    meditation: number
    exercise: number
    journal: number
  }
  stats: {
    totalMorningChecks: number
    totalTrades: number
    totalJournalEntries: number
    totalMeditations: number
    totalExercises: number
    challengesCompleted: number
    lossResetsCompleted: number
    revengeTradesAvoided: number
  }
  psychMetrics: PsychologicalMetrics
  aiPacingMultiplier: number
  lastActivityDate: string
  dailyXPLog: DailyXPLog[]
}

interface GamificationContextType {
  data: GamificationData
  addXP: (amount: number, reason: string) => void
  awardReadinessXP: (allStagesCompleted: boolean) => boolean
  awardJournalXP: () => boolean
  awardLossResetXP: () => boolean
  awardAIReflectionXP: (messageLength: number) => boolean
  getTodayXPLog: () => DailyXPLog | null
  calculateDailyXP: (factors: {
    readiness: number
    behavior: number
    journal: number
    reset: number
    streak: number
  }) => number
  unlockAchievement: (achievementId: string) => void
  updateChallenge: (challengeId: string, progress: number) => void
  startChallenge: (challengeId: string) => void
  completeChallenge: (challengeId: string) => void
  incrementStreak: (type: keyof GamificationData["streaks"]) => void
  incrementStat: (stat: keyof GamificationData["stats"]) => void
  updatePsychMetrics: (metrics: Partial<PsychologicalMetrics>) => void
  checkXPDecay: () => void
  updateAIPacing: (multiplier: number) => void
  getLevelInfo: (level: number) => (typeof LEVEL_INFO)[0]
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

const LEVEL_XP_REQUIREMENTS = [
  0, // Level 1: Beginner (0-399)
  400, // Level 2: Initiate (400-799)
  800, // Level 3: Consistent (800-1199)
  1200, // Level 4: Disciplined (1200-1799)
  1800, // Level 5: Focused (1800-2599)
  2600, // Level 6: Self-aware (2600-3599)
  3600, // Level 7: Growth Phase (3600-4799)
  4800, // Level 8: High Performance (4800-6399)
  6400, // Level 9: Elite Mindset (6400-8499)
  8500, // Level 10: Mind Master (8500-15000+)
]

const LEVEL_INFO = [
  { name: "Začátečník", description: "Začínáš svou cestu", phase: "Uvědomění", icon: "🧩" },
  { name: "Zasvěcenec", description: "Učíš se základy", phase: "Plánování", icon: "🎯" },
  { name: "Konzistentní", description: "Budujíš konzistenci", phase: "Akce", icon: "⚙️" },
  { name: "Disciplinovaný", description: "Disciplína roste", phase: "Rovnováha", icon: "🌿" },
  { name: "Soustředěný", description: "Soustředěný na cíl", phase: "Odolnost", icon: "🧘" },
  { name: "Sebeuvědomělý", description: "Znáš sám sebe", phase: "Konzistence", icon: "🔥" },
  { name: "Fáze růstu", description: "Fáze růstu", phase: "Kontrola emocí", icon: "🧱" },
  { name: "Vysoký výkon", description: "Vysoký výkon", phase: "Stabilita", icon: "🪷" },
  { name: "Elitní mindset", description: "Elitní myšlení", phase: "Integrace", icon: "🧠" },
  { name: "Mistr mysli", description: "Mistr mysli", phase: "Mistrovství", icon: "🕊️" },
]

const XP_REWARDS = {
  readinessCheck: 20, // +20 XP za dokončení Readiness Checku
  readinessAllStages: 10, // +10 XP bonus za všech 5 stages
  journalEntry: 15, // +15 XP za záznam v deníku
  lossReset: 10, // +10 XP za kompletní Loss Reset
  aiReflection: 5, // +5 XP za použití MindTrader AI
  challengeEasy: 60, // +60 XP (bylo 30)
  challengeMedium: 120, // +120 XP (bylo 60)
  challengeHard: 240, // +240 XP (bylo 120)
  challengeElite: 500, // +500 XP (bylo 250)
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "První kroky",
    description: "Dokončil jsi svůj první Readiness Check",
    icon: "🌅",
    xpReward: 20,
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Completed Readiness Check 7 days in a row",
    icon: "🐦",
    xpReward: 60,
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "meditation-master",
    title: "Meditation Master",
    description: "Meditated 21 days in a row",
    icon: "🧘",
    xpReward: 120,
    unlocked: false,
    progress: 0,
    target: 21,
  },
  {
    id: "perfect-week",
    title: "Perfect Week",
    description: "Completed all stages 7 days in a row",
    icon: "⭐",
    xpReward: 80,
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "consistent-trader",
    title: "Consistent Trader",
    description: "Recorded trades 30 days in a row",
    icon: "📈",
    xpReward: 150,
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "journaling-pro",
    title: "Journaling Pro",
    description: "Wrote 50 journal entries",
    icon: "📝",
    xpReward: 100,
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Maintained 30-day streak in Readiness Check",
    icon: "🔥",
    xpReward: 200,
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "fitness-warrior",
    title: "Fitness Warrior",
    description: "Exercised 50 times",
    icon: "💪",
    xpReward: 100,
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "mindful-trader",
    title: "Mindful Trader",
    description: "Meditated 100 times",
    icon: "🌟",
    xpReward: 150,
    unlocked: false,
    progress: 0,
    target: 100,
  },
  {
    id: "challenge-champion",
    title: "Challenge Champion",
    description: "Completed 5 challenges",
    icon: "🏆",
    xpReward: 200,
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: "calm-master",
    title: "Calm Master",
    description: "Achieved Calm Score 80+ for 7 days",
    icon: "🧘",
    xpReward: 120,
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "reset-hero",
    title: "Reset Hero",
    description: "Dokončil jsi 10 Loss Resetů bez revenge tradingu",
    icon: "💪",
    xpReward: 150,
    unlocked: false,
    progress: 0,
    target: 10,
  },
]

const AVAILABLE_CHALLENGES: Omit<Challenge, "current" | "startDate" | "active" | "completed">[] = [
  {
    id: "2-days-no-fomo",
    title: "2 dny bez FOMO",
    description: "Obchoduj 2 dny bez FOMO vstupů",
    type: "streak",
    target: 2,
    difficulty: "easy",
    xpReward: XP_REWARDS.challengeEasy, // 60 XP
  },
  {
    id: "week-no-revenge",
    title: "Týden bez revenge trades",
    description: "Týden s 0 revenge trades",
    type: "streak",
    target: 7,
    difficulty: "medium",
    xpReward: XP_REWARDS.challengeMedium, // 120 XP
  },
  {
    id: "30-days-consistency",
    title: "30 days consistency",
    description: "30 days of consistent tracking",
    type: "streak",
    target: 30,
    difficulty: "hard",
    xpReward: XP_REWARDS.challengeHard, // 240 XP
  },
  {
    id: "90-days-full-tracker",
    title: "90 days full tracker",
    description: "90 days with fully completed tracker",
    type: "streak",
    target: 90,
    difficulty: "elite",
    xpReward: XP_REWARDS.challengeElite, // 500 XP
  },
  {
    id: "21-day-meditation",
    title: "21 days meditation",
    description: "Meditate 21 days in a row",
    type: "streak",
    target: 21,
    difficulty: "medium",
    xpReward: XP_REWARDS.challengeMedium, // 120 XP
  },
  {
    id: "perfect-week-challenge",
    title: "Perfektní týden",
    description: "Complete all stages 7 days in a row",
    type: "streak",
    target: 7,
    difficulty: "easy",
    xpReward: XP_REWARDS.challengeEasy, // 60 XP
  },
  {
    id: "14-day-exercise",
    title: "14 days exercise",
    description: "Exercise 14 days in a row",
    type: "streak",
    target: 14,
    difficulty: "medium",
    xpReward: XP_REWARDS.challengeMedium, // 120 XP
  },
  {
    id: "journal-master",
    title: "Mistr deníku",
    description: "Write 30 journal entries in 30 days",
    type: "count",
    target: 30,
    difficulty: "hard",
    xpReward: XP_REWARDS.challengeHard, // 240 XP
  },
]

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<GamificationData>({
    xp: 0,
    level: 1,
    achievements: INITIAL_ACHIEVEMENTS,
    challenges: [],
    streaks: {
      morningCheck: 0,
      trading: 0,
      meditation: 0,
      exercise: 0,
      journal: 0,
    },
    stats: {
      totalMorningChecks: 0,
      totalTrades: 0,
      totalJournalEntries: 0,
      totalMeditations: 0,
      totalExercises: 0,
      challengesCompleted: 0,
      lossResetsCompleted: 0,
      revengeTradesAvoided: 0,
    },
    psychMetrics: {
      calmScore: 50,
      focusRating: 50,
      recoveryIndex: 50,
      disciplineStreak: 0,
    },
    aiPacingMultiplier: 1.0,
    lastActivityDate: new Date().toISOString(),
    dailyXPLog: [],
  })

  // Load XP from Supabase when user logs in
  useEffect(() => {
    const loadXPFromSupabase = async () => {
      if (!user?.id) {
        console.log("[v0] GamificationProvider - No user, skipping XP load")
        return
      }

      try {
        console.log("[v0] GamificationProvider - Loading XP for user:", user.id)
        const response = await fetch("/api/xp/get-profile", {
          credentials: "include",
        })

        // Check if response is actually JSON
        const contentType = response.headers.get("content-type")
        if (!contentType?.includes("application/json")) {
          console.error("[v0] API returned non-JSON response:", contentType, "status:", response.status)
          throw new Error(`Invalid response type: ${contentType}`)
        }

        const profileData = await response.json()

        if (profileData.success && profileData.xp !== undefined) {
          console.log("[v0] GamificationProvider - Loaded XP from Supabase:", profileData.xp)
          
          // Also load unlocked achievements from database
          try {
            const achievementsResponse = await fetch("/api/achievements/list", {
              credentials: "include",
            })
            if (achievementsResponse.ok) {
              const achievementsData = await achievementsResponse.json()
              const unlockedIds = new Set(achievementsData.achievements || [])
              
              setData((prev) => ({
                ...prev,
                xp: profileData.xp || 0,
                level: profileData.level || 1,
                achievements: prev.achievements.map((a) =>
                  unlockedIds.has(a.id) ? { ...a, unlocked: true } : a,
                ),
              }))
            } else {
              setData((prev) => ({
                ...prev,
                xp: profileData.xp || 0,
                level: profileData.level || 1,
              }))
            }
          } catch (error) {
            console.error("[v0] Failed to load achievements:", error)
            setData((prev) => ({
              ...prev,
              xp: profileData.xp || 0,
              level: profileData.level || 1,
            }))
          }
        } else {
          console.log("[v0] GamificationProvider - API returned non-success:", profileData)
          // Try to load from localStorage as fallback
          const saved = localStorage.getItem("gamification-data")
          if (saved) {
            try {
              const parsed = JSON.parse(saved)
              if (!parsed.dailyXPLog) {
                parsed.dailyXPLog = []
              }
              console.log("[v0] GamificationProvider - Loaded from localStorage:", parsed.xp)
              setData(parsed)
            } catch (e) {
              console.error("[v0] Failed to parse gamification data:", e)
              localStorage.removeItem("gamification-data")
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error loading XP from Supabase:", error instanceof Error ? error.message : String(error))
        // Fallback to localStorage
        const saved = localStorage.getItem("gamification-data")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (!parsed.dailyXPLog) {
              parsed.dailyXPLog = []
            }
            console.log("[v0] GamificationProvider - Fallback to localStorage XP:", parsed.xp)
            setData(parsed)
          } catch (e) {
            console.error("[v0] Failed to parse gamification data from fallback:", e)
          }
        }
      }
    }

    loadXPFromSupabase()
  }, [user?.id])

  // Save XP to localStorage (for session persistence)
  useEffect(() => {
    localStorage.setItem("gamification-data", JSON.stringify(data))
  }, [data])

  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
        return i + 1
      }
    }
    return 1
  }

  const getTodayString = (): string => {
    return new Date().toISOString().split("T")[0]
  }

  const getTodayXPLog = (): DailyXPLog | null => {
    const today = getTodayString()
    return data.dailyXPLog.find((log) => log.date === today) || null
  }

  const getOrCreateTodayLog = (): DailyXPLog => {
    const today = getTodayString()
    const existingLog = data.dailyXPLog.find((log) => log.date === today)
    if (existingLog) return existingLog

    return {
      date: today,
      readinessCompleted: false,
      readinessAllStages: false,
      journalCompleted: false,
      lossResetCompleted: false,
      aiReflectionCompleted: false,
      xpEarned: 0,
    }
  }

  const awardReadinessXP = (allStagesCompleted: boolean): boolean => {
    const todayLog = getOrCreateTodayLog()

    // Už bylo dnes uděleno
    if (todayLog.readinessCompleted) {
      return false
    }

    let xpToAdd = XP_REWARDS.readinessCheck // +20 XP
    if (allStagesCompleted && !todayLog.readinessAllStages) {
      xpToAdd += XP_REWARDS.readinessAllStages // +10 XP bonus
    }

    setData((prev) => {
      const today = getTodayString()
      const updatedLog = prev.dailyXPLog.filter((log) => log.date !== today)

      const newLog: DailyXPLog = {
        ...todayLog,
        readinessCompleted: true,
        readinessAllStages: allStagesCompleted,
        xpEarned: todayLog.xpEarned + xpToAdd,
      }

      const newXP = prev.xp + xpToAdd
      const newLevel = calculateLevel(newXP)

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        dailyXPLog: [...updatedLog, newLog],
        lastActivityDate: new Date().toISOString(),
      }
    })

    // Emit XP event
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const event = new CustomEvent("xp-gained", {
          detail: {
            amount: xpToAdd,
            reason: allStagesCompleted ? "Readiness Check + všech 5 stages" : "Readiness Check dokončen",
            leveledUp: false,
            newLevel: data.level,
          },
        })
        window.dispatchEvent(event)
      }, 0)
    }

    return true
  }

  const awardJournalXP = (): boolean => {
    const todayLog = getOrCreateTodayLog()

    if (todayLog.journalCompleted) {
      return false
    }

    const xpToAdd = XP_REWARDS.journalEntry // +15 XP

    setData((prev) => {
      const today = getTodayString()
      const updatedLog = prev.dailyXPLog.filter((log) => log.date !== today)

      const newLog: DailyXPLog = {
        ...todayLog,
        journalCompleted: true,
        xpEarned: todayLog.xpEarned + xpToAdd,
      }

      const newXP = prev.xp + xpToAdd
      const newLevel = calculateLevel(newXP)

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        dailyXPLog: [...updatedLog, newLog],
        lastActivityDate: new Date().toISOString(),
      }
    })

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const event = new CustomEvent("xp-gained", {
          detail: { amount: xpToAdd, reason: "Trading journal entry" },
        })
        window.dispatchEvent(event)
      }, 0)
    }

    return true
  }

  const awardLossResetXP = (): boolean => {
    const todayLog = getOrCreateTodayLog()

    if (todayLog.lossResetCompleted) {
      return false
    }

    const xpToAdd = XP_REWARDS.lossReset // +10 XP

    setData((prev) => {
      const today = getTodayString()
      const updatedLog = prev.dailyXPLog.filter((log) => log.date !== today)

      const newLog: DailyXPLog = {
        ...todayLog,
        lossResetCompleted: true,
        xpEarned: todayLog.xpEarned + xpToAdd,
      }

      const newXP = prev.xp + xpToAdd
      const newLevel = calculateLevel(newXP)

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        dailyXPLog: [...updatedLog, newLog],
        lastActivityDate: new Date().toISOString(),
        stats: {
          ...prev.stats,
          lossResetsCompleted: prev.stats.lossResetsCompleted + 1,
        },
      }
    })

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const event = new CustomEvent("xp-gained", {
          detail: { amount: xpToAdd, reason: "Loss Reset dokončen" },
        })
        window.dispatchEvent(event)
      }, 0)
    }

    return true
  }

  const awardAIReflectionXP = (messageLength: number): boolean => {
    const todayLog = getOrCreateTodayLog()

    // Už bylo dnes uděleno
    if (todayLog.aiReflectionCompleted) {
      return false
    }

    // Minimálně 3 věty (přibližně 50 znaků)
    if (messageLength < 50) {
      return false
    }

    const xpToAdd = XP_REWARDS.aiReflection // +5 XP

    setData((prev) => {
      const today = getTodayString()
      const updatedLog = prev.dailyXPLog.filter((log) => log.date !== today)

      const newLog: DailyXPLog = {
        ...todayLog,
        aiReflectionCompleted: true,
        xpEarned: todayLog.xpEarned + xpToAdd,
      }

      const newXP = prev.xp + xpToAdd
      const newLevel = calculateLevel(newXP)

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        dailyXPLog: [...updatedLog, newLog],
        lastActivityDate: new Date().toISOString(),
      }
    })

    if (typeof window !== "undefined") {
      setTimeout(() => {
        const event = new CustomEvent("xp-gained", {
          detail: { amount: xpToAdd, reason: "MindTrader AI reflexe" },
        })
        window.dispatchEvent(event)
      }, 0)
    }

    return true
  }

  const calculateDailyXP = (factors: {
    readiness: number
    behavior: number
    journal: number
    reset: number
    streak: number
  }): number => {
    const baseScore =
      factors.readiness * 0.25 +
      factors.behavior * 0.35 +
      factors.journal * 0.2 +
      factors.reset * 0.1 +
      factors.streak * 0.1

    const adjustedScore = baseScore * data.aiPacingMultiplier

    return Math.min(Math.round(adjustedScore), 70)
  }

  const checkXPDecay = () => {
    const lastActivity = new Date(data.lastActivityDate)
    const now = new Date()
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceActivity >= 5) {
      const decayAmount = Math.floor(data.xp * 0.05)
      setData((prev) => ({
        ...prev,
        xp: Math.max(0, prev.xp - decayAmount),
      }))
    }
  }

  const updateAIPacing = (multiplier: number) => {
    setData((prev) => ({
      ...prev,
      aiPacingMultiplier: multiplier,
    }))
  }

  const updatePsychMetrics = (metrics: Partial<PsychologicalMetrics>) => {
    setData((prev) => ({
      ...prev,
      psychMetrics: {
        ...prev.psychMetrics,
        ...metrics,
      },
    }))
  }

  const getLevelInfo = (level: number) => {
    return LEVEL_INFO[Math.min(level - 1, LEVEL_INFO.length - 1)]
  }

  const addXP = (amount: number, reason: string) => {
    setData((prev) => {
      const newXP = prev.xp + amount
      const newLevel = calculateLevel(newXP)
      const leveledUp = newLevel > prev.level

      const updatedData = {
        ...prev,
        xp: newXP,
        level: newLevel,
        lastActivityDate: new Date().toISOString(),
      }

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const event = new CustomEvent("xp-gained", {
            detail: { amount, reason, leveledUp, newLevel, levelInfo: getLevelInfo(newLevel) },
          })
          window.dispatchEvent(event)
        }, 0)
      }

      return updatedData
    })
  }

  const unlockAchievement = async (achievementId: string) => {
    setData((prev) => {
      const achievement = prev.achievements.find((a) => a.id === achievementId)
      if (!achievement || achievement.unlocked) return prev

      const updatedAchievements = prev.achievements.map((a) =>
        a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a,
      )

      // Save to database
      if (user?.id) {
        fetch("/api/achievements/unlock", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            achievementId: achievementId,
            title: achievement.title,
          }),
        }).catch((error) => console.error("[v0] Failed to save achievement:", error))
      }

      setTimeout(() => {
        addXP(achievement.xpReward, `Odemknutí: ${achievement.title}`)
      }, 0)

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const event = new CustomEvent("achievement-unlocked", {
            detail: achievement,
          })
          window.dispatchEvent(event)
        }, 0)
      }

      return {
        ...prev,
        achievements: updatedAchievements,
      }
    })
  }

  const updateChallenge = (challengeId: string, progress: number) => {
    setData((prev) => {
      const updatedChallenges = prev.challenges.map((c) => (c.id === challengeId ? { ...c, current: progress } : c))

      const challenge = updatedChallenges.find((c) => c.id === challengeId)
      if (challenge && challenge.current >= challenge.target && !challenge.completed) {
        completeChallenge(challengeId)
      }

      return {
        ...prev,
        challenges: updatedChallenges,
      }
    })
  }

  const startChallenge = (challengeId: string) => {
    const template = AVAILABLE_CHALLENGES.find((c) => c.id === challengeId)
    if (!template) return

    const newChallenge: Challenge = {
      ...template,
      current: 0,
      startDate: new Date().toISOString(),
      active: true,
      completed: false,
    }

    setData((prev) => ({
      ...prev,
      challenges: [...prev.challenges, newChallenge],
    }))
  }

  const completeChallenge = (challengeId: string) => {
    setData((prev) => {
      const challenge = prev.challenges.find((c) => c.id === challengeId)
      if (!challenge || challenge.completed) return prev

      const updatedChallenges = prev.challenges.map((c) =>
        c.id === challengeId ? { ...c, completed: true, active: false, endDate: new Date().toISOString() } : c,
      )

      setTimeout(() => {
        addXP(challenge.xpReward, `Dokončení výzvy: ${challenge.title}`)
      }, 0)

      const newStats = {
        ...prev.stats,
        challengesCompleted: prev.stats.challengesCompleted + 1,
      }

      if (newStats.challengesCompleted >= 5) {
        setTimeout(() => {
          unlockAchievement("challenge-champion")
        }, 0)
      }

      return {
        ...prev,
        challenges: updatedChallenges,
        stats: newStats,
      }
    })
  }

  const incrementStreak = (type: keyof GamificationData["streaks"]) => {
    setData((prev) => {
      const newStreaks = {
        ...prev.streaks,
        [type]: prev.streaks[type] + 1,
      }

      if (type === "morningCheck") {
        if (newStreaks.morningCheck === 7) {
          setTimeout(() => unlockAchievement("early-bird"), 0)
        }
        if (newStreaks.morningCheck === 30) {
          setTimeout(() => unlockAchievement("streak-master"), 0)
        }
      }
      if (type === "meditation" && newStreaks.meditation === 21) {
        setTimeout(() => unlockAchievement("meditation-master"), 0)
      }
      if (type === "trading" && newStreaks.trading === 30) {
        setTimeout(() => unlockAchievement("consistent-trader"), 0)
      }

      return {
        ...prev,
        streaks: newStreaks,
      }
    })
  }

  const incrementStat = (stat: keyof GamificationData["stats"]) => {
    setData((prev) => {
      const newStats = {
        ...prev.stats,
        [stat]: prev.stats[stat] + 1,
      }

      if (stat === "totalMorningChecks" && newStats.totalMorningChecks === 1) {
        setTimeout(() => unlockAchievement("first-steps"), 0)
      }
      if (stat === "totalJournalEntries" && newStats.totalJournalEntries === 50) {
        setTimeout(() => unlockAchievement("journaling-pro"), 0)
      }
      if (stat === "totalExercises" && newStats.totalExercises === 50) {
        setTimeout(() => unlockAchievement("fitness-warrior"), 0)
      }
      if (stat === "totalMeditations" && newStats.totalMeditations === 100) {
        setTimeout(() => unlockAchievement("mindful-trader"), 0)
      }

      return {
        ...prev,
        stats: newStats,
      }
    })
  }

  return (
    <GamificationContext.Provider
      value={{
        data,
        addXP,
        awardReadinessXP,
        awardJournalXP,
        awardLossResetXP,
        awardAIReflectionXP,
        getTodayXPLog,
        calculateDailyXP,
        unlockAchievement,
        updateChallenge,
        startChallenge,
        completeChallenge,
        incrementStreak,
        incrementStat,
        updatePsychMetrics,
        checkXPDecay,
        updateAIPacing,
        getLevelInfo,
      }}
    >
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    // During SSR or build, return safe defaults instead of throwing
    if (typeof window === "undefined") {
      return {
        data: {
          xp: 0,
          level: 1,
          achievements: [],
          challenges: [],
          streaks: {
            morningCheck: 0,
            trading: 0,
            meditation: 0,
            exercise: 0,
            journal: 0,
          },
          stats: {
            totalMorningChecks: 0,
            totalTrades: 0,
            totalJournalEntries: 0,
            totalMeditations: 0,
            totalExercises: 0,
            challengesCompleted: 0,
            lossResetsCompleted: 0,
            revengeTradesAvoided: 0,
          },
          psychMetrics: {
            calmScore: 50,
            focusRating: 50,
            recoveryIndex: 50,
            disciplineStreak: 0,
          },
          aiPacingMultiplier: 1.0,
          lastActivityDate: "",
          dailyXPLog: [],
        },
        addXP: () => {},
        awardReadinessXP: () => false,
        awardJournalXP: () => false,
        awardLossResetXP: () => false,
        awardAIReflectionXP: () => false,
        getTodayXPLog: () => null,
        calculateDailyXP: () => 0,
        unlockAchievement: () => {},
        updateChallenge: () => {},
        startChallenge: () => {},
        completeChallenge: () => {},
        incrementStreak: () => {},
        incrementStat: () => {},
        updatePsychMetrics: () => {},
        checkXPDecay: () => {},
        updateAIPacing: () => {},
        getLevelInfo: () => LEVEL_INFO[0],
      } as GamificationContextType
    }
    throw new Error("useGamification must be used within GamificationProvider")
  }
  return context
}

export { LEVEL_XP_REQUIREMENTS, LEVEL_INFO, AVAILABLE_CHALLENGES, XP_REWARDS }
