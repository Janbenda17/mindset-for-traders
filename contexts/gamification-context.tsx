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
  startDate: string
  endDate?: string
  active: boolean
  completed: boolean
}

interface PsychologicalMetrics {
  calmScore: number // 0-100: AI měří stabilitu nálad
  focusRating: number // 0-100: Podíl dní bez rozptylování
  recoveryIndex: number // 0-100: Schopnost zvednout se po ztrátě
  disciplineStreak: number // Počet dní po sobě s plněním všech kroků
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
}

interface GamificationContextType {
  data: GamificationData
  addXP: (amount: number, reason: string) => void
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
  0, // Level 1: Observer
  400, // Level 2: Planner
  900, // Level 3: Executor
  1500, // Level 4: Balancer
  2200, // Level 5: Resilient Mind
  3200, // Level 6: Consistent Performer
  4700, // Level 7: Disciplined Warrior
  6500, // Level 8: Zen Trader
  9000, // Level 9: Mind Architect
  12000, // Level 10: Mind Master
]

const LEVEL_INFO = [
  { name: "🧩 Observer", description: "Učíš se sledovat sebe", phase: "Uvědomění" },
  { name: "🎯 Planner", description: "Vím, co chci dělat", phase: "Plánování" },
  { name: "⚙️ Executor", description: "Začínám dělat správné kroky", phase: "Akce" },
  { name: "🌿 Balancer", description: "Zvládám tlak", phase: "Rovnováha" },
  { name: "🧘 Resilient Mind", description: "Nenechávám se rozhodit", phase: "Odolnost" },
  { name: "🔥 Consistent Performer", description: "Mám svůj rytmus", phase: "Konzistence" },
  { name: "🧱 Disciplined Warrior", description: "Disciplína je moje síla", phase: "Kontrola emocí" },
  { name: "🪷 Zen Trader", description: "Klid je můj edge", phase: "Stabilita klidu" },
  { name: "🧠 Mind Architect", description: "Rozumím své mysli i ostatním", phase: "Integrace" },
  { name: "🕊️ Mind Master", description: "Mysl a trh jsou jedno", phase: "Mistrovství" },
]

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    title: "První kroky",
    description: "Dokončil jsi svůj první Morning Check",
    icon: "🌅",
    xpReward: 20, // Sníženo z 50 na 20 XP - základní achievement
    unlocked: false,
    progress: 0,
    target: 1,
  },
  {
    id: "early-bird",
    title: "Ranní ptáče",
    description: "Dokončil jsi Morning Check 7 dní v řadě",
    icon: "🐦",
    xpReward: 80, // Sníženo z 200 na 80 XP - 7denní streak
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "meditation-master",
    title: "Mistr meditace",
    description: "Meditoval jsi 21 dní v řadě",
    icon: "🧘",
    xpReward: 160, // Sníženo z 300 na 160 XP - 21denní streak
    unlocked: false,
    progress: 0,
    target: 21,
  },
  {
    id: "perfect-week",
    title: "Perfektní týden",
    description: "Splnil jsi všechny stages 7 dní v řadě",
    icon: "⭐",
    xpReward: 120, // Sníženo z 500 na 120 XP - náročnější 7denní achievement
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "consistent-trader",
    title: "Konzistentní trader",
    description: "Zaznamenal jsi trade 30 dní v řadě",
    icon: "📈",
    xpReward: 200, // Sníženo z 400 na 200 XP - 30denní streak
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "journaling-pro",
    title: "Profesionální deník",
    description: "Napsal jsi 50 journal entries",
    icon: "📝",
    xpReward: 150, // Sníženo z 300 na 150 XP - 50x aktivita
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "streak-master",
    title: "Mistr streaku",
    description: "Udržel jsi 30denní streak v Morning Check",
    icon: "🔥",
    xpReward: 250, // Sníženo z 600 na 250 XP - prestižní 30denní streak
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "fitness-warrior",
    title: "Fitness válečník",
    description: "Cvičil jsi 50krát",
    icon: "💪",
    xpReward: 150, // Sníženo z 250 na 150 XP - 50x aktivita
    unlocked: false,
    progress: 0,
    target: 50,
  },
  {
    id: "mindful-trader",
    title: "Mindful trader",
    description: "Meditoval jsi 100krát",
    icon: "🌟",
    xpReward: 250, // Sníženo z 400 na 250 XP - 100x aktivita
    unlocked: false,
    progress: 0,
    target: 100,
  },
  {
    id: "challenge-champion",
    title: "Šampion výzev",
    description: "Dokončil jsi 5 výzev",
    icon: "🏆",
    xpReward: 300, // Sníženo z 800 na 300 XP - speciální achievement
    unlocked: false,
    progress: 0,
    target: 5,
  },
  {
    id: "calm-master",
    title: "Mistr klidu",
    description: "Dosáhl jsi Calm Score 80+ po dobu 7 dní",
    icon: "🧘",
    xpReward: 180, // Sníženo z 400 na 180 XP - psychologický milestone
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "reset-hero",
    title: "Reset Hero",
    description: "Dokončil jsi 10 Loss Resetů bez revenge tradingu",
    icon: "💪",
    xpReward: 200, // Sníženo z 500 na 200 XP - důležitý skill
    unlocked: false,
    progress: 0,
    target: 10,
  },
  {
    id: "zen-trader-achievement",
    title: "Zen Trader",
    description: "Dosáhl jsi Level 8 a udržel ho 30 dní",
    icon: "🪷",
    xpReward: 0, // Sníženo z 1000 na 0 XP - milník, ne zdroj XP
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "mind-master-achievement",
    title: "Mind Master",
    description: "Dosáhl jsi Level 10 - vrchol mentálního mistrovství",
    icon: "🕊️",
    xpReward: 0, // Sníženo z 2000 na 0 XP - milník, ne zdroj XP
    unlocked: false,
    progress: 0,
    target: 1,
  },
]

const AVAILABLE_CHALLENGES: Omit<Challenge, "current" | "startDate" | "active" | "completed">[] = [
  {
    id: "21-day-meditation",
    title: "21 dní meditace",
    description: "Medituj 21 dní v řadě",
    type: "streak",
    target: 21,
    xpReward: 150, // Sníženo z 500 na 150 XP (21 dní = ~3 dny práce)
  },
  {
    id: "30-day-morning-check",
    title: "30 dní Morning Check",
    description: "Dokončit Morning Check 30 dní v řadě",
    type: "streak",
    target: 30,
    xpReward: 200, // Sníženo z 600 na 200 XP (30 dní = ~4 dny práce)
  },
  {
    id: "perfect-week-challenge",
    title: "Perfektní týden",
    description: "Splň všechny stages 7 dní v řadě",
    type: "streak",
    target: 7,
    xpReward: 80, // Sníženo z 400 na 80 XP (7 dní = ~1.5 dne práce)
  },
  {
    id: "14-day-exercise",
    title: "14 dní cvičení",
    description: "Cvič 14 dní v řadě",
    type: "streak",
    target: 14,
    xpReward: 100, // Sníženo z 350 na 100 XP (14 dní = ~2 dny práce)
  },
  {
    id: "journal-master",
    title: "Mistr deníku",
    description: "Napiš 30 journal entries za 30 dní",
    type: "count",
    target: 30,
    xpReward: 180, // Sníženo z 450 na 180 XP (30 dní = ~3.5 dne práce)
  },
  {
    id: "profitable-week",
    title: "Profitabilní týden",
    description: "Zaznamenej 7 profitabilních tradů v řadě",
    type: "streak",
    target: 7,
    xpReward: 80, // Sníženo z 500 na 80 XP (7 dní = ~1.5 dne práce)
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
  })

  useEffect(() => {
    const saved = localStorage.getItem("gamification-data")
    if (saved) {
      setData(JSON.parse(saved))
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

export { LEVEL_XP_REQUIREMENTS, LEVEL_INFO, AVAILABLE_CHALLENGES }
