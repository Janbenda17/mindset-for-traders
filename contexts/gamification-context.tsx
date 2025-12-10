"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
  { name: "Beginner", description: "Začínáš svou cestu", phase: "Uvědomění", icon: "🧩" },
  { name: "Initiate", description: "Učíš se základy", phase: "Plánování", icon: "🎯" },
  { name: "Consistent", description: "Budujíš konzistenci", phase: "Akce", icon: "⚙️" },
  { name: "Disciplined", description: "Disciplína roste", phase: "Rovnováha", icon: "🌿" },
  { name: "Focused", description: "Soustředěný na cíl", phase: "Odolnost", icon: "🧘" },
  { name: "Self-aware", description: "Znáš sám sebe", phase: "Konzistence", icon: "🔥" },
  { name: "Growth Phase", description: "Fáze růstu", phase: "Kontrola emocí", icon: "🧱" },
  { name: "High Performance", description: "Vysoký výkon", phase: "Stabilita", icon: "🪷" },
  { name: "Elite Mindset", description: "Elitní myšlení", phase: "Integrace", icon: "🧠" },
  { name: "Mind Master", description: "Mistr mysli", phase: "Mistrovství", icon: "🕊️" },
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
    title: "Ranní ptáče",
    description: "Dokončil jsi Readiness Check 7 dní v řadě",
    icon: "🐦",
    xpReward: 60,
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "meditation-master",
    title: "Mistr meditace",
    description: "Meditoval jsi 21 dní v řadě",
    icon: "🧘",
    xpReward: 120,
    unlocked: false,
    progress: 0,
    target: 21,
  },
  {
    id: "perfect-week",
    title: "Perfektní týden",
    description: "Splnil jsi všechny stages 7 dní v řadě",
    icon: "⭐",
    xpReward: 80,
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "consistent-trader",
    title: "Konzistentní trader",
    description: "Zaznamenal jsi trade 30 dní v řadě",
    icon: "📈",
    xpReward: 150,
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "journaling-pro",
    title: "Profesionální deník",
    description: "Napsal jsi 50 journal entries",
    icon: "📝",
    xpReward: 100,
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "streak-master",
    title: "Mistr streaku",
    description: "Udržel jsi 30denní streak v Readiness Check",
    icon: "🔥",
    xpReward: 200,
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "fitness-warrior",
    title: "Fitness válečník",
    description: "Cvičil jsi 50krát",
    icon: "💪",
    xpReward: 100,
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "mindful-trader",
    title: "Mindful trader",
    description: "Meditoval jsi 100krát",
    icon: "🌟",
    xpReward: 150,
    unlocked: false,
    progress: 0,
    target: 100,
  },
  {
    id: "challenge-champion",
    title: "Šampion výzev",
    description: "Dokončil jsi 5 výzev",
    icon: "🏆",
    xpReward: 200,
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: "calm-master",
    title: "Mistr klidu",
    description: "Dosáhl jsi Calm Score 80+ po dobu 7 dní",
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
    title: "30 dní konzistence",
    description: "30 dní konzistentního trackování",
    type: "streak",
    target: 30,
    difficulty: "hard",
    xpReward: XP_REWARDS.challengeHard, // 240 XP
  },
  {
    id: "90-days-full-tracker",
    title: "90 dní plného trackeru",
    description: "90 dní s plně vyplněným trackerem",
    type: "streak",
    target: 90,
    difficulty: "elite",
    xpReward: XP_REWARDS.challengeElite, // 500 XP
  },
  {
    id: "21-day-meditation",
    title: "21 dní meditace",
    description: "Medituj 21 dní v řadě",
    type: "streak",
    target: 21,
    difficulty: "medium",
    xpReward: XP_REWARDS.challengeMedium, // 120 XP
  },
  {
    id: "perfect-week-challenge",
    title: "Perfektní týden",
    description: "Splň všechny stages 7 dní v řadě",
    type: "streak",
    target: 7,
    difficulty: "easy",
    xpReward: XP_REWARDS.challengeEasy, // 60 XP
  },
  {
    id: "14-day-exercise",
    title: "14 dní cvičení",
    description: "Cvič 14 dní v řadě",
    type: "streak",
    target: 14,
    difficulty: "medium",
    xpReward: XP_REWARDS.challengeMedium, // 120 XP
  },
  {
    id: "journal-master",
    title: "Mistr deníku",
    description: "Napiš 30 journal entries za 30 dní",
    type: "count",
    target: 30,
    difficulty: "hard",
    xpReward: XP_REWARDS.challengeHard, // 240 XP
  },
]

export function GamificationProvider({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    const saved = localStorage.getItem("gamification-data")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure dailyXPLog exists for backwards compatibility
      if (!parsed.dailyXPLog) {
        parsed.dailyXPLog = []
      }
      setData(parsed)
    }
  }, [])

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
          detail: { amount: xpToAdd, reason: "Záznam v obchodním deníku" },
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

  const unlockAchievement = (achievementId: string) => {
    setData((prev) => {
      const achievement = prev.achievements.find((a) => a.id === achievementId)
      if (!achievement || achievement.unlocked) return prev

      const updatedAchievements = prev.achievements.map((a) =>
        a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a,
      )

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
    throw new Error("useGamification must be used within GamificationProvider")
  }
  return context
}

export { LEVEL_XP_REQUIREMENTS, LEVEL_INFO, AVAILABLE_CHALLENGES, XP_REWARDS }
