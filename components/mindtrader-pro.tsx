"use client"

import { useState, useEffect } from "react"
import { LockedFeature } from "@/components/locked-feature"
import { MindTraderHistory } from "@/components/mindtrader-history"
import { MindTraderHelpers } from "@/components/mindtrader-helpers"
import { MindTraderNotifications } from "@/components/mindtrader-notifications"
import { MindTraderReflection } from "@/components/mindtrader-reflection"
import { MindTraderExport } from "@/components/mindtrader-export"
import { MindTraderBehavior } from "@/components/mindtrader-behavior"
import { AlertTriangle, CheckCircle, XCircle, Coffee, Smile, Frown, Meh } from "lucide-react"
import { getUserData, saveUserData } from "@/utils/storage-utils"
import { format } from "date-fns"

interface DailyAssessment {
  id: string
  date: string
  sleepHours: number
  sleepQuality: number
  mood: number
  energy: number
  stress: number
  exercised: boolean
  exerciseType: string
  exerciseDuration: number
  freeTimeHours: number
  freeTimeQuality: number
  nutrition: number
  hydration: number
  notes: string
  overallScore: number
  recommendation: "TRADE_NORMAL" | "TRADE_CAREFUL" | "NO_TRADE" | "TAKE_BREAK"
  recommendationReason: string
}

const EXERCISE_TYPES = [
  "Žádné",
  "Lehká procházka",
  "Běh",
  "Posilovna",
  "Jóga",
  "Plavání",
  "Cyklistika",
  "Domácí cvičení",
  "Sport (fotbal, tenis, atd.)",
  "Jiné",
]

export function MindTraderPro() {
  const [todayAssessment, setTodayAssessment] = useState<DailyAssessment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentAssessments, setRecentAssessments] = useState<DailyAssessment[]>([])

  // Form state
  const [sleepHours, setSleepHours] = useState([7])
  const [sleepQuality, setSleepQuality] = useState([7])
  const [mood, setMood] = useState([7])
  const [energy, setEnergy] = useState([7])
  const [stress, setStress] = useState([3])
  const [exercised, setExercised] = useState(false)
  const [exerciseType, setExerciseType] = useState("Žádné")
  const [exerciseDuration, setExerciseDuration] = useState([0])
  const [freeTimeHours, setFreeTimeHours] = useState([2])
  const [freeTimeQuality, setFreeTimeQuality] = useState([7])
  const [nutrition, setNutrition] = useState([7])
  const [hydration, setHydration] = useState([7])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadTodayAssessment()
    loadRecentAssessments()
  }, [])

  const loadTodayAssessment = () => {
    const userData = getUserData()
    const today = format(new Date(), "yyyy-MM-dd")
    const assessments = userData.mindTraderPro?.dailyAssessments || []
    const todayData = assessments.find((a: DailyAssessment) => a.date === today)

    if (todayData) {
      setTodayAssessment(todayData)
      // Load form data from today's assessment
      setSleepHours([todayData.sleepHours])
      setSleepQuality([todayData.sleepQuality])
      setMood([todayData.mood])
      setEnergy([todayData.energy])
      setStress([todayData.stress])
      setExercised(todayData.exercised)
      setExerciseType(todayData.exerciseType)
      setExerciseDuration([todayData.exerciseDuration])
      setFreeTimeHours([todayData.freeTimeHours])
      setFreeTimeQuality([todayData.freeTimeQuality])
      setNutrition([todayData.nutrition])
      setHydration([todayData.hydration])
      setNotes(todayData.notes)
    }
  }

  const loadRecentAssessments = () => {
    const userData = getUserData()
    const assessments = userData.mindTraderPro?.dailyAssessments || []
    const recent = assessments
      .sort((a: DailyAssessment, b: DailyAssessment) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
    setRecentAssessments(recent)
  }

  const calculateRecommendation = (assessment: Partial<DailyAssessment>) => {
    let score = 0
    const reasons = []

    // Sleep analysis (30% weight)
    const sleepScore = (assessment.sleepHours! >= 6 && assessment.sleepHours! <= 9 ? 10 : 5) + assessment.sleepQuality!
    score += sleepScore * 0.15

    if (assessment.sleepHours! < 6) reasons.push("Nedostatek spánku")
    if (assessment.sleepQuality! < 5) reasons.push("Špatná kvalita spánku")

    // Mood and energy (25% weight)
    const moodEnergyScore = (assessment.mood! + assessment.energy!) / 2
    score += moodEnergyScore * 0.25

    if (assessment.mood! < 5) reasons.push("Špatná nálada")
    if (assessment.energy! < 5) reasons.push("Nízká energie")

    // Stress (20% weight) - lower is better
    const stressScore = 10 - assessment.stress!
    score += stressScore * 0.2

    if (assessment.stress! > 7) reasons.push("Vysoký stres")

    // Exercise (15% weight)
    const exerciseScore = assessment.exercised ? 10 : 3
    score += exerciseScore * 0.15

    if (!assessment.exercised) reasons.push("Žádné cvičení")

    // Free time quality (10% weight)
    score += assessment.freeTimeQuality! * 0.1

    if (assessment.freeTimeQuality! < 5) reasons.push("Špatně využitý volný čas")

    // Nutrition and hydration (10% weight each)
    score += (assessment.nutrition! + assessment.hydration!) * 0.05

    if (assessment.nutrition! < 5) reasons.push("Špatná výživa")
    if (assessment.hydration! < 5) reasons.push("Nedostatečná hydratace")

    // Determine recommendation
    let recommendation: DailyAssessment["recommendation"]
    let recommendationReason: string

    if (score >= 8) {
      recommendation = "TRADE_NORMAL"
      recommendationReason =
        "Výborný den! Jste v optimálním stavu pro obchodování. Můžete obchodovat normálně podle své strategie."
    } else if (score >= 6.5) {
      recommendation = "TRADE_CAREFUL"
      recommendationReason = `Dobrý den s drobnými problémy: ${reasons.join(", ")}. Obchodujte opatrně, snižte velikost pozic o 25%.`
    } else if (score >= 4.5) {
      recommendation = "NO_TRADE"
      recommendationReason = `Problematický den: ${reasons.join(", ")}. Doporučuji neobchodovat a zaměřit se na analýzu a vzdělávání.`
    } else {
      recommendation = "TAKE_BREAK"
      recommendationReason = `Velmi špatný den: ${reasons.join(", ")}. Vezměte si úplnou pauzu od obchodování a zaměřte se na odpočinek.`
    }

    return {
      overallScore: Math.round(score * 10) / 10,
      recommendation,
      recommendationReason,
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const assessmentData = {
        sleepHours: sleepHours[0],
        sleepQuality: sleepQuality[0],
        mood: mood[0],
        energy: energy[0],
        stress: stress[0],
        exercised,
        exerciseType,
        exerciseDuration: exerciseDuration[0],
        freeTimeHours: freeTimeHours[0],
        freeTimeQuality: freeTimeQuality[0],
        nutrition: nutrition[0],
        hydration: hydration[0],
        notes,
      }

      const { overallScore, recommendation, recommendationReason } = calculateRecommendation(assessmentData)

      const newAssessment: DailyAssessment = {
        id: Date.now().toString(),
        date: format(new Date(), "yyyy-MM-dd"),
        ...assessmentData,
        overallScore,
        recommendation,
        recommendationReason,
      }

      const userData = getUserData()
      const existingAssessments = userData.mindTraderPro?.dailyAssessments || []
      const today = format(new Date(), "yyyy-MM-dd")

      // Remove today's assessment if it exists, then add the new one
      const filteredAssessments = existingAssessments.filter((a: DailyAssessment) => a.date !== today)
      const updatedAssessments = [...filteredAssessments, newAssessment]

      const updatedData = {
        ...userData,
        mindTraderPro: {
          ...userData.mindTraderPro,
          dailyAssessments: updatedAssessments,
        },
      }

      saveUserData(updatedData)
      setTodayAssessment(newAssessment)
      loadRecentAssessments()

      alert("Denní hodnocení bylo úspěšně uloženo!")
    } catch (error) {
      console.error("Error saving assessment:", error)
      alert("Chyba při ukládání hodnocení")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRecommendationIcon = (recommendation: DailyAssessment["recommendation"]) => {
    switch (recommendation) {
      case "TRADE_NORMAL":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "TRADE_CAREFUL":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case "NO_TRADE":
        return <XCircle className="w-6 h-6 text-red-500" />
      case "TAKE_BREAK":
        return <Coffee className="w-6 h-6 text-red-600" />
      default:
        return <Meh className="w-6 h-6 text-gray-500" />
    }
  }

  const getRecommendationColor = (recommendation: DailyAssessment["recommendation"]) => {
    switch (recommendation) {
      case "TRADE_NORMAL":
        return "bg-green-50 border-green-200"
      case "TRADE_CAREFUL":
        return "bg-yellow-50 border-yellow-200"
      case "NO_TRADE":
        return "bg-red-50 border-red-200"
      case "TAKE_BREAK":
        return "bg-red-100 border-red-300"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getMoodIcon = (moodValue: number) => {
    if (moodValue >= 8) return <Smile className="w-5 h-5 text-green-500" />
    if (moodValue >= 6) return <Meh className="w-5 h-5 text-yellow-500" />
    return <Frown className="w-5 h-5 text-red-500" />
  }

  const averageScore =
    recentAssessments.length > 0
      ? recentAssessments.reduce((sum, a) => sum + a.overallScore, 0) / recentAssessments.length
      : 0

  return (
    <LockedFeature
      feature="mindtrader-pro"
      title="MindTrader AI Pro"
      description="Odemkněte pokročilé funkce AI pro hlubší psychologickou analýzu a personalizované vedení."
    >
      <div className="grid gap-6">
        <MindTraderHelpers />
        <MindTraderReflection />
        <MindTraderHistory />
        <MindTraderBehavior />
        <MindTraderNotifications />
        <MindTraderExport />
      </div>
    </LockedFeature>
  )
}
