"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { LossResetMode, LossResetActivity, LossResetSession, CoachTone, ActivityConfig } from "@/types/loss-reset"
import { useGamification } from "./gamification-context"

interface LossResetContextType {
  isActive: boolean
  currentSession: LossResetSession | null
  mode: LossResetMode
  coachTone: CoachTone
  availableActivities: ActivityConfig[]
  recentSessions: LossResetSession[]
  startReset: (triggeredBy: "auto" | "manual", context?: any) => void
  selectMode: (mode: LossResetMode) => void
  selectActivity: (activity: LossResetActivity) => void
  completeActivity: () => void
  cancelReset: () => void
  setCoachTone: (tone: CoachTone) => void
  getRecommendedActivity: () => LossResetActivity
  logEvent: (event: string, data?: any) => void
}

const LossResetContext = createContext<LossResetContextType | undefined>(undefined)

const ACTIVITIES: ActivityConfig[] = [
  {
    id: "cold-shower",
    name: "Cold Shower",
    description: "Studená sprcha na reset nervového systému",
    why: "Aktivuje parasympatický nervový systém, snižuje kortizol, okamžitě přerušuje emoční smyčku",
    duration: 120, // 2 min
    instructions: [
      "Nastav timer na 2 minuty",
      "Začni vlažnou vodou, postupně snižuj teplotu",
      "Dýchej zhluboka a pomalu",
      "Soustřeď se na pocit vody, ne na myšlenky",
    ],
    icon: "❄️",
    color: "blue",
    completionType: "timer",
    cooldown: 24,
  },
  {
    id: "physical",
    name: "Physical Reset",
    description: "30 kliků nebo 60 dřepů",
    why: "Uvolňuje nahromaděnou tenzi, zvyšuje endorfiny, přerušuje mentální loop",
    duration: 180, // 3 min
    instructions: [
      "Vyber si: 30 kliků NEBO 60 dřepů",
      "Dělej pomalu, soustřeď se na techniku",
      "Dýchej pravidelně",
      "Počítej nahlas nebo v hlavě",
    ],
    icon: "💪",
    color: "orange",
    completionType: "manual",
    cooldown: 4,
  },
  {
    id: "meditation",
    name: "Meditation Reset",
    description: "7 minut řízeného dýchání",
    why: "Aktivuje prefrontální kortex, snižuje amygdala reaktivitu, obnovuje sebekontrolu",
    duration: 420, // 7 min
    instructions: [
      "Sedni pohodlně, zavři oči",
      "Sleduj vizuální kruh dýchání",
      "Nádech 4s, výdech 6s",
      "Když mysl odbíhá, jemně ji vrať k dechu",
    ],
    icon: "🧘",
    color: "purple",
    completionType: "timer",
    cooldown: 2,
  },
  {
    id: "write",
    name: "Write Reset",
    description: "Napiš 2 věty o tom, co se stalo",
    why: "Externalizuje emoce, aktivuje racionální myšlení, vytváří odstup od situace",
    duration: 120, // 2 min
    instructions: [
      "Odpověz na 2 otázky:",
      "1. Co jsem právě cítil?",
      "2. Co udělám příště jinak?",
      "Piš rychle, bez editace",
    ],
    icon: "✍️",
    color: "green",
    completionType: "input",
    cooldown: 1,
  },
  {
    id: "walk",
    name: "Walk Reset",
    description: "10 minut chůze venku nebo doma",
    why: "Bilaterální stimulace (EMDR efekt), změna prostředí, přirozený reset",
    duration: 600, // 10 min
    instructions: [
      "Opusť místo, kde jsi obchodoval",
      "Choď ven, nebo alespoň do jiné místnosti",
      "Dýchej čerstvý vzduch",
      "Všímej si okolí, ne myšlenek",
    ],
    icon: "🚶",
    color: "teal",
    completionType: "timer",
    cooldown: 2,
  },
]

export function LossResetProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentSession, setCurrentSession] = useState<LossResetSession | null>(null)
  const [mode, setMode] = useState<LossResetMode>("ai-recommended")
  const [coachTone, setCoachTone] = useState<CoachTone>("calm-mentor")
  const [recentSessions, setRecentSessions] = useState<LossResetSession[]>([])
  const { addXP } = useGamification()

  // Load recent sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("loss-reset-sessions")
    if (stored) {
      setRecentSessions(JSON.parse(stored))
    }
    const storedMode = localStorage.getItem("loss-reset-mode") as LossResetMode
    if (storedMode) {
      setMode(storedMode)
    }
    const storedTone = localStorage.getItem("loss-reset-tone") as CoachTone
    if (storedTone) {
      setCoachTone(storedTone)
    }
  }, [])

  const logEvent = useCallback((event: string, data?: any) => {
    console.log(`[Loss Reset Event] ${event}`, data)
    // Here you would send to analytics
  }, [])

  const getRecommendedActivity = useCallback((): LossResetActivity => {
    // AI logic for recommending activity based on context
    const morningCheck = localStorage.getItem("morning-check")
    if (morningCheck) {
      const data = JSON.parse(morningCheck)

      // Low sleep → meditation or walk
      if (data.sleep < 6 || data.sleepQuality < 6) {
        return Math.random() > 0.5 ? "meditation" : "walk"
      }

      // High stress/tension → physical or cold shower
      if (data.stress > 7) {
        return Math.random() > 0.5 ? "physical" : "cold-shower"
      }

      // Low focus → meditation
      if (data.focus < 6) {
        return "meditation"
      }

      // Late hour → meditation (no physical)
      const hour = new Date().getHours()
      if (hour > 20 || hour < 6) {
        return "meditation"
      }
    }

    // Check cooldowns
    const lastSessions = recentSessions.slice(0, 5)
    const recentActivities = lastSessions.map((s) => s.activity)

    // 2+ losses today → cold shower (if not done today)
    const today = new Date().toDateString()
    const todaySessions = recentSessions.filter((s) => new Date(s.triggeredAt).toDateString() === today)
    if (todaySessions.length >= 2 && !recentActivities.includes("cold-shower")) {
      return "cold-shower"
    }

    // Default: avoid last 2 activities
    const availableActivities = ACTIVITIES.filter((a) => !recentActivities.slice(0, 2).includes(a.id))

    return availableActivities[Math.floor(Math.random() * availableActivities.length)].id
  }, [recentSessions])

  const startReset = useCallback(
    (triggeredBy: "auto" | "manual", context?: any) => {
      const session: LossResetSession = {
        id: Date.now().toString(),
        triggeredAt: new Date(),
        triggeredBy,
        mode,
        activity: "cold-shower", // Will be selected later
        duration: 0,
        completed: false,
        context: context || {},
      }

      setCurrentSession(session)
      setIsActive(true)

      logEvent("loss_reset_triggered", { triggeredBy, context })
    },
    [mode, logEvent],
  )

  const selectMode = useCallback(
    (newMode: LossResetMode) => {
      setMode(newMode)
      localStorage.setItem("loss-reset-mode", newMode)

      if (currentSession) {
        setCurrentSession({ ...currentSession, mode: newMode })
      }

      logEvent("loss_reset_mode_selected", { mode: newMode })
    },
    [currentSession, logEvent],
  )

  const selectActivity = useCallback(
    (activity: LossResetActivity) => {
      if (!currentSession) return

      const activityConfig = ACTIVITIES.find((a) => a.id === activity)
      if (!activityConfig) return

      setCurrentSession({
        ...currentSession,
        activity,
        duration: activityConfig.duration,
      })

      logEvent("loss_reset_activity_started", { activity })
    },
    [currentSession, logEvent],
  )

  const completeActivity = useCallback(() => {
    if (!currentSession) return

    const completedSession: LossResetSession = {
      ...currentSession,
      completed: true,
      completedAt: new Date(),
    }

    // Save to history
    const updatedSessions = [completedSession, ...recentSessions].slice(0, 50)
    setRecentSessions(updatedSessions)
    localStorage.setItem("loss-reset-sessions", JSON.stringify(updatedSessions))

    // Award XP
    addXP(50, "Loss Reset dokončen")

    // Update daily tracker readiness
    const dailyTracker = localStorage.getItem("daily-tracker")
    if (dailyTracker) {
      const data = JSON.parse(dailyTracker)
      data.readinessAdjustment = (data.readinessAdjustment || 0) - 5
      data.disciplineXP = (data.disciplineXP || 0) + 10
      localStorage.setItem("daily-tracker", JSON.stringify(data))
    }

    logEvent("loss_reset_activity_completed", {
      activity: currentSession.activity,
      duration: currentSession.duration,
      success: true,
    })

    setCurrentSession(completedSession)
  }, [currentSession, recentSessions, addXP, logEvent])

  const cancelReset = useCallback(() => {
    if (currentSession) {
      logEvent("loss_reset_cancelled", { activity: currentSession.activity })
    }
    setIsActive(false)
    setCurrentSession(null)
  }, [currentSession, logEvent])

  return (
    <LossResetContext.Provider
      value={{
        isActive,
        currentSession,
        mode,
        coachTone,
        availableActivities: ACTIVITIES,
        recentSessions,
        startReset,
        selectMode,
        selectActivity,
        completeActivity,
        cancelReset,
        setCoachTone,
        getRecommendedActivity,
        logEvent,
      }}
    >
      {children}
    </LossResetContext.Provider>
  )
}

export function useLossReset() {
  const context = useContext(LossResetContext)
  if (!context) {
    if (typeof window === "undefined") {
      return {
        isActive: false,
        currentSession: null,
        mode: "ai-recommended" as const,
        coachTone: "calm-mentor" as const,
        availableActivities: [],
        recentSessions: [],
        startReset: () => {},
        selectMode: () => {},
        selectActivity: () => {},
        completeActivity: () => {},
        cancelReset: () => {},
        setCoachTone: () => {},
        getRecommendedActivity: () => "meditation" as const,
        logEvent: () => {},
      }
    }
    throw new Error("useLossReset must be used within LossResetProvider")
  }
  return context
}
