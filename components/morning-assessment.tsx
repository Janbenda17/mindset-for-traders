"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useData } from "@/contexts/data-context"
import { useGamification } from "@/contexts/gamification-context"
import { useAuth } from "@/contexts/auth-context"
import {
  Moon,
  Coffee,
  Dumbbell,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Heart,
  Activity,
  Lock,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MorningCheckData {
  id: string
  date: string
  sleepQuality: number
  sleepHours: number
  energyLevel: number
  stressLevel: number
  focus: number
  physicalHealth: number
  emotionalState: number
  exercised: boolean
  exerciseType: string
  exerciseDuration: number
  meditationTime: number
  morningRoutine: boolean
  score: number
  recommendation: string
}

const EXERCISE_TYPES = [
  { value: "gym", label: "💪 Gym" },
  { value: "cardio", label: "🏃 Cardio" },
  { value: "walk", label: "🚶 Walk" },
  { value: "sport", label: "⚽ Sport" },
  { value: "other", label: "🎯 Other" },
]

export function MorningAssessment({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const { completeStage } = useDailyStage()
  const { isLiveMode, addMorningCheck } = useData()
  const { addXP, incrementStreak, incrementStat } = useGamification()
  const { user } = useAuth()
  const [isLocked, setIsLocked] = useState(false)
  const [assessment, setAssessment] = useState<MorningCheckData>({
    id: "",
    date: new Date().toISOString().split("T")[0],
    sleepQuality: 7,
    sleepHours: 7.5,
    energyLevel: 7,
    stressLevel: 5,
    focus: 7,
    physicalHealth: 7,
    emotionalState: 7,
    exercised: false,
    exerciseType: "gym",
    exerciseDuration: 30,
    meditationTime: 0,
    morningRoutine: false,
    score: 0,
    recommendation: "",
  })

  useEffect(() => {
    const todayDate = new Date().toISOString().split("T")[0]
    const lockKey = `user-${user?.id}-morning-check-locked-${todayDate}`
    const locked = localStorage.getItem(lockKey) === "true"

    if (locked) {
      setIsLocked(true)
      const storageKey = `user-${user?.id}-mindtrader-morning-checks`
      const saved = localStorage.getItem(storageKey) || "[]"
      const checks = JSON.parse(saved)
      const todayCheck = checks.find((c: MorningCheckData) => c.date === todayDate)
      if (todayCheck) {
        setAssessment(todayCheck)
      }
    }
  }, [user?.id])

  const calculateScore = () => {
    const weights = {
      sleepQuality: 0.18,
      sleepHours: 0.12,
      energyLevel: 0.18,
      stressLevel: 0.15,
      focus: 0.2,
      emotionalState: 0.12,
      physicalHealth: 0.05,
    }

    const sleepScore = (assessment.sleepQuality / 10) * 100
    const sleepHoursScore =
      assessment.sleepHours >= 7 && assessment.sleepHours <= 9
        ? 100
        : assessment.sleepHours < 6
          ? Math.max(0, (assessment.sleepHours / 6) * 100)
          : Math.max(0, 100 - (assessment.sleepHours - 9) * 10)

    const energyScore = (assessment.energyLevel / 10) * 100
    const stressScore = ((10 - assessment.stressLevel) / 10) * 100
    const focusScore = (assessment.focus / 10) * 100
    const physicalScore = (assessment.physicalHealth / 10) * 100
    const emotionalScore = (assessment.emotionalState / 10) * 100

    const baseScore =
      sleepScore * weights.sleepQuality +
      sleepHoursScore * weights.sleepHours +
      energyScore * weights.energyLevel +
      stressScore * weights.stressLevel +
      focusScore * weights.focus +
      physicalScore * weights.physicalHealth +
      emotionalScore * weights.emotionalState

    let bonus = 0
    if (assessment.exercised) bonus += 5
    if (assessment.meditationTime >= 10) bonus += 5
    else if (assessment.meditationTime > 0) bonus += 2
    if (assessment.morningRoutine) bonus += 3

    return Math.min(100, Math.round(baseScore + bonus))
  }

  const getRecommendation = (score: number) => {
    if (score >= 75) {
      return {
        text: "✅ Dobré podmínky na obchodování",
        subtext: "Jsi v optimálním stavu. Obchoduj podle svého plánu!",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        icon: CheckCircle,
      }
    } else if (score >= 60) {
      return {
        text: "⚠️ Buď opatrný",
        subtext: "Redukuj position sizes o 50% a zvyš disciplínu.",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        icon: AlertTriangle,
      }
    } else {
      return {
        text: "🛑 Neobchoduj dnes",
        subtext: "Zaměř se na odpočinek a přípravu. Paper trading nebo studium.",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        icon: XCircle,
      }
    }
  }

  useEffect(() => {
    const score = calculateScore()
    const recommendation = getRecommendation(score)
    setAssessment((prev) => ({
      ...prev,
      score,
      recommendation: recommendation.text,
    }))
  }, [
    assessment.sleepQuality,
    assessment.sleepHours,
    assessment.energyLevel,
    assessment.stressLevel,
    assessment.focus,
    assessment.physicalHealth,
    assessment.emotionalState,
    assessment.exercised,
    assessment.meditationTime,
    assessment.morningRoutine,
  ])

  const saveAssessment = async () => {
    if (!isLiveMode) {
      toast({
        title: "Demo Mode",
        description: "This feature is only available in Live Mode",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const todayDate = new Date().toISOString().split("T")[0]
    const lockKey = `user-${user?.id}-morning-check-locked-${todayDate}`
    const xpKey = `user-${user?.id}-morning-check-xp-${todayDate}`

    const newCheck = {
      ...assessment,
      id: Date.now().toString(),
      date: todayDate,
    }

    const success = await addMorningCheck(newCheck)

    if (!success) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit ranní kontrolu do databáze",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem(lockKey, "true")
    setIsLocked(true)

    const storageKey = `user-${user?.id}-daily-tracker-entries-live`
    const entries = JSON.parse(localStorage.getItem(storageKey) || "[]")

    let todayEntry = entries.find((e: any) => e.date === todayDate)

    if (!todayEntry) {
      todayEntry = {
        id: Date.now().toString(),
        date: todayDate,
        weather: { condition: "sunny", mood_impact: 7 },
        sleep: {
          bedtime: "23:00",
          wake_time: "07:00",
          quality: assessment.sleepQuality,
        },
        exercise: {
          type: assessment.exercised ? assessment.exerciseType : "none",
          duration: assessment.exercised ? assessment.exerciseDuration : 0,
          intensity: 7,
        },
        nutrition: {
          quality: 7,
          water_intake: 0,
        },
        mental_state: {
          stress_level: assessment.stressLevel,
          focus_level: assessment.focus,
          confidence: 7,
          mood: assessment.emotionalState,
        },
        trading_psychology: {
          patience: 7,
          emotional_control: 7,
        },
        trading_session: {
          trades_taken: 0,
          profit_loss: 0,
          followed_plan: 7,
          journal_reviewed: false,
          meditation: assessment.meditationTime,
          screen_time: 6,
        },
        notes: "",
        wins: "",
        improvements: "",
        ai_score: assessment.score,
        sleep_hours: assessment.sleepHours,
        morningRoutine: assessment.morningRoutine,
        physicalHealth: assessment.physicalHealth,
        lockedFields: {
          sleep: true,
          exercise: true,
          hydration: true,
          mentalState: true,
          meditation: true,
        },
      }
      entries.push(todayEntry)
    } else {
      todayEntry.sleep = {
        ...todayEntry.sleep,
        quality: assessment.sleepQuality,
      }
      todayEntry.sleep_hours = assessment.sleepHours
      todayEntry.exercise = {
        ...todayEntry.exercise,
        type: assessment.exercised ? assessment.exerciseType : todayEntry.exercise.type,
        duration: assessment.exercised ? assessment.exerciseDuration : todayEntry.exercise.duration,
      }
      todayEntry.nutrition = {
        ...todayEntry.nutrition,
        water_intake: 0,
      }
      todayEntry.mental_state = {
        ...todayEntry.mental_state,
        stress_level: assessment.stressLevel,
        focus_level: assessment.focus,
        mood: assessment.emotionalState,
      }
      todayEntry.trading_session = {
        ...todayEntry.trading_session,
        meditation: assessment.meditationTime,
      }
      todayEntry.ai_score = assessment.score
      todayEntry.morningRoutine = assessment.morningRoutine
      todayEntry.physicalHealth = assessment.physicalHealth
      todayEntry.lockedFields = {
        ...todayEntry.lockedFields,
        sleep: true,
        exercise: true,
        hydration: true,
        mentalState: true,
        meditation: true,
      }
    }

    entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    localStorage.setItem(storageKey, JSON.stringify(entries))

    completeStage(1)

    const xpAlreadyAwarded = localStorage.getItem(xpKey) === "true"

    if (!xpAlreadyAwarded) {
      addXP(50, "Morning Check dokončen")

      if (assessment.score >= 80) {
        addXP(100, "Perfektní Morning Check!")
      }

      if (assessment.exercised) {
        addXP(15, "Cvičení dokončeno")
        incrementStat("totalExercises")
        incrementStreak("exercise")
      }

      if (assessment.meditationTime > 0) {
        addXP(15, "Meditace dokončena")
        incrementStat("totalMeditations")
        incrementStreak("meditation")
      }

      localStorage.setItem(xpKey, "true")

      incrementStat("totalMorningChecks")
      incrementStreak("morningCheck")
    }

    toast({
      title: "✅ Morning Check Complete & Locked!",
      description: `Data zamčena a přenesena do Daily Tracker. Score: ${assessment.score}%`,
      duration: 3000,
    })

    // Mark morning check as completed in daily tracker
    try {
      await fetch("/api/daily-tracker/mark-completed", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ type: "morning_check" }),
      })
    } catch (error) {
      console.error("[v0] Error marking morning check as completed:", error)
    }

    // Award XP for morning check
    try {
      const xpResponse = await fetch("/api/xp/award", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "morning_check" }),
      })
      const xpData = await xpResponse.json()
      if (xpData.success) {
        console.log("[v0] Morning check XP awarded:", xpData.xpAwarded)
      }
    } catch (error) {
      console.error("[v0] Error awarding morning check XP:", error)
    }

    // If component is in modal (analytics), just call onComplete
    // If standalone (morning-check page), redirect
    if (onComplete) {
      setTimeout(() => {
        onComplete()
      }, 1000)
    } else {
      setTimeout(() => {
        router.push("/daily-tracker")
      }, 1000)
    }
  }

  const currentScore = calculateScore()
  const recommendation = getRecommendation(currentScore)
  const RecommendationIcon = recommendation.icon

  if (isLocked) {
    return (
      <div className="space-y-8">
        <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-4">
              <div className="p-4 rounded-2xl bg-green-500/20 border-2 border-green-500/30">
                <Lock className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black text-green-400">Data Zamčena ✅</h3>
                <p className="text-lg text-muted-foreground mt-1">
                  Tvůj Morning Check je dokončen a zamčen. Data se resetují o půlnoci.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("border-2", recommendation.borderColor, recommendation.bgColor)}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div
                    className={cn("p-4 rounded-2xl", recommendation.bgColor, "border-2", recommendation.borderColor)}
                  >
                    <RecommendationIcon className={cn("h-8 w-8", recommendation.color)} />
                  </div>
                  <div>
                    <h3 className={cn("text-3xl font-black", recommendation.color)}>{recommendation.text}</h3>
                    <p className="text-lg text-muted-foreground mt-1">{recommendation.subtext}</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/5"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(currentScore / 100) * 352} 352`}
                      strokeLinecap="round"
                      className={cn("transition-all duration-1000", recommendation.color)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-black text-white">{currentScore}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-indigo-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-400" />
                Sleep Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quality</span>
                <span className="text-2xl font-bold text-indigo-400">{assessment.sleepQuality}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hours</span>
                <span className="text-2xl font-bold text-indigo-400">{assessment.sleepHours}h</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Energy & Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Energy Level</span>
                <span className="text-2xl font-bold text-yellow-400">{assessment.energyLevel}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Focus Level</span>
                <span className="text-2xl font-bold text-yellow-400">{assessment.focus}/10</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Mental State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stress Level</span>
                <span className="text-2xl font-bold text-purple-400">{assessment.stressLevel}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Emotional State</span>
                <span className="text-2xl font-bold text-purple-400">{assessment.emotionalState}/10</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-400" />
                Physical & Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Physical Health</span>
                <span className="text-2xl font-bold text-green-400">{assessment.physicalHealth}/10</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {assessment.exercised && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-blue-400" />
                Exercise Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{EXERCISE_TYPES.find((t) => t.value === assessment.exerciseType)?.label}</div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{assessment.exerciseDuration} min</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/record-trades")}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Zaznamenat Trade
          </Button>
          <Button
            onClick={() => onComplete?.()}
            variant="outline"
            className="flex-1 h-14 text-lg font-bold rounded-2xl"
          >
            Zavřít
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className={cn("border-2", recommendation.borderColor, recommendation.bgColor)}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className={cn("p-4 rounded-2xl", recommendation.bgColor, "border-2", recommendation.borderColor)}>
                  <RecommendationIcon className={cn("h-8 w-8", recommendation.color)} />
                </div>
                <div>
                  <h3 className={cn("text-3xl font-black", recommendation.color)}>{recommendation.text}</h3>
                  <p className="text-lg text-muted-foreground mt-1">{recommendation.subtext}</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(currentScore / 100) * 352} 352`}
                    strokeLinecap="round"
                    className={cn("transition-all duration-1000", recommendation.color)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black text-white">{currentScore}%</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-400" />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quality</span>
                <span className="text-lg font-bold text-indigo-400">{assessment.sleepQuality}/10</span>
              </div>
              <Slider
                value={[assessment.sleepQuality]}
                onValueChange={([val]) => setAssessment({ ...assessment, sleepQuality: val })}
                min={1}
                max={10}
                step={1}
                className="h-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hours</span>
                <span className="text-lg font-bold text-indigo-400">{assessment.sleepHours}h</span>
              </div>
              <Slider
                value={[assessment.sleepHours]}
                onValueChange={([val]) => setAssessment({ ...assessment, sleepHours: val })}
                min={3}
                max={12}
                step={0.5}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Energy & Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Energy Level</span>
                <span className="text-lg font-bold text-yellow-400">{assessment.energyLevel}/10</span>
              </div>
              <Slider
                value={[assessment.energyLevel]}
                onValueChange={([val]) => setAssessment({ ...assessment, energyLevel: val })}
                min={1}
                max={10}
                step={1}
                className="h-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Focus Level</span>
                <span className="text-lg font-bold text-yellow-400">{assessment.focus}/10</span>
              </div>
              <Slider
                value={[assessment.focus]}
                onValueChange={([val]) => setAssessment({ ...assessment, focus: val })}
                min={1}
                max={10}
                step={1}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Mental State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stress Level</span>
                <span className="text-lg font-bold text-purple-400">{assessment.stressLevel}/10</span>
              </div>
              <Slider
                value={[assessment.stressLevel]}
                onValueChange={([val]) => setAssessment({ ...assessment, stressLevel: val })}
                min={1}
                max={10}
                step={1}
                className="h-3"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Emotional State</span>
                <span className="text-lg font-bold text-purple-400">{assessment.emotionalState}/10</span>
              </div>
              <Slider
                value={[assessment.emotionalState]}
                onValueChange={([val]) => setAssessment({ ...assessment, emotionalState: val })}
                min={1}
                max={10}
                step={1}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-400" />
              Physical & Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Physical Health</span>
                <span className="text-lg font-bold text-green-400">{assessment.physicalHealth}/10</span>
              </div>
              <Slider
                value={[assessment.physicalHealth]}
                onValueChange={([val]) => setAssessment({ ...assessment, physicalHealth: val })}
                min={1}
                max={10}
                step={1}
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-400" />
            Exercise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <Checkbox
              checked={assessment.exercised}
              onCheckedChange={(checked) => setAssessment({ ...assessment, exercised: checked as boolean })}
            />
            <span className="font-medium">I exercised this morning</span>
          </label>

          {assessment.exercised && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {EXERCISE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setAssessment({ ...assessment, exerciseType: type.value })}
                      className={cn(
                        "p-2 rounded-lg border text-sm transition-all",
                        assessment.exerciseType === type.value
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-white/5 border-white/10 hover:border-blue-500/50",
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Duration (minutes)</label>
                <input
                  type="number"
                  value={assessment.exerciseDuration}
                  onChange={(e) =>
                    setAssessment({ ...assessment, exerciseDuration: Number.parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-12 px-4 rounded-lg bg-white/5 border border-white/10 text-center text-xl font-bold"
                  min="5"
                  max="180"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Morning Habits
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-all">
            <Checkbox
              checked={assessment.morningRoutine}
              onCheckedChange={(checked) => setAssessment({ ...assessment, morningRoutine: checked as boolean })}
            />
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-cyan-400" />
              <span className="font-medium">Completed Morning Routine</span>
            </div>
          </label>
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/10">
            <Target className="h-4 w-4 text-cyan-400" />
            <span className="font-medium flex-1">Meditation</span>
            <input
              type="number"
              value={assessment.meditationTime}
              onChange={(e) => setAssessment({ ...assessment, meditationTime: Number.parseInt(e.target.value) || 0 })}
              className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-center font-bold"
              min="0"
              max="60"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={saveAssessment}
        disabled={!isLiveMode}
        className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 shadow-2xl disabled:opacity-50"
      >
        <Lock className="w-6 h-6 mr-2" />
        {isLiveMode ? `Complete Morning Check & Lock Data (${currentScore}%)` : "Available in Live Mode Only"}
      </Button>
    </div>
  )
}
