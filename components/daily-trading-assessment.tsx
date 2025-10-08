"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Coffee,
  Smile,
  Frown,
  Meh,
  Brain,
  Heart,
  Zap,
  Shield,
  Moon,
  Sun,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
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

export function DailyTradingAssessment() {
  const [todayAssessment, setTodayAssessment] = useState<DailyAssessment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
      setShowForm(false)

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
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-500/30"
      case "TRADE_CAREFUL":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-500/30"
      case "NO_TRADE":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/30"
      case "TAKE_BREAK":
        return "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-500/40"
      default:
        return "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-500/30"
    }
  }

  const getRecommendationTitle = (recommendation: DailyAssessment["recommendation"]) => {
    switch (recommendation) {
      case "TRADE_NORMAL":
        return "✅ Můžete obchodovat normálně"
      case "TRADE_CAREFUL":
        return "⚠️ Obchodujte opatrně"
      case "NO_TRADE":
        return "❌ Nedoporučuji obchodovat"
      case "TAKE_BREAK":
        return "☕ Vezměte si pauzu"
      default:
        return "❓ Nehodnoceno"
    }
  }

  const getMoodIcon = (moodValue: number) => {
    if (moodValue >= 8) return <Smile className="w-5 h-5 text-green-500" />
    if (moodValue >= 6) return <Meh className="w-5 h-5 text-yellow-500" />
    return <Frown className="w-5 h-5 text-red-500" />
  }

  const getTrendIcon = (current: number, threshold: number) => {
    if (current > threshold) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (current < threshold) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  if (!todayAssessment && !showForm) {
    return (
      <Card className="psyche-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 w-fit mx-auto">
              <Brain className="w-12 h-12 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Měl bych dnes obchodovat?</h3>
              <p className="text-gray-300 mb-6">
                Vyplňte rychlé denní hodnocení a získejte AI doporučení pro dnešní trading
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Brain className="w-4 h-4 mr-2" />
                Začít hodnocení
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (todayAssessment) {
    return (
      <Card className={`psyche-card ${getRecommendationColor(todayAssessment.recommendation)}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">{getRecommendationIcon(todayAssessment.recommendation)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">
                  {getRecommendationTitle(todayAssessment.recommendation)}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Skóre: {todayAssessment.overallScore}/10
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(true)}
                    className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-white"
                  >
                    Upravit
                  </Button>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{todayAssessment.recommendationReason}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    Spánek: {todayAssessment.sleepHours}h ({todayAssessment.sleepQuality}/10)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getMoodIcon(todayAssessment.mood)}
                  <span className="text-sm text-gray-300">Nálada: {todayAssessment.mood}/10</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Energie: {todayAssessment.energy}/10</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-300">Stres: {todayAssessment.stress}/10</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show form
  return (
    <Card className="psyche-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <span>Denní hodnocení pro trading</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sleep Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-blue-400" />
            <h4 className="text-white font-medium">Spánek</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Počet hodin spánku: {sleepHours[0]}h</Label>
              <Slider value={sleepHours} onValueChange={setSleepHours} max={12} min={3} step={0.5} className="mt-2" />
            </div>
            <div>
              <Label className="text-gray-300">Kvalita spánku: {sleepQuality[0]}/10</Label>
              <Slider value={sleepQuality} onValueChange={setSleepQuality} max={10} min={1} step={1} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Mood & Energy Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <h4 className="text-white font-medium">Nálada & Energie</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300">Nálada: {mood[0]}/10</Label>
              <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="text-gray-300">Energie: {energy[0]}/10</Label>
              <Slider value={energy} onValueChange={setEnergy} max={10} min={1} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="text-gray-300">Stres: {stress[0]}/10</Label>
              <Slider value={stress} onValueChange={setStress} max={10} min={1} step={1} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Exercise Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-400" />
            <h4 className="text-white font-medium">Cvičení</h4>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={exercised} onCheckedChange={setExercised} />
            <Label className="text-gray-300">Dnes jsem cvičil/a</Label>
          </div>
          {exercised && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Typ cvičení</Label>
                <Select value={exerciseType} onValueChange={setExerciseType}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Doba trvání: {exerciseDuration[0]} min</Label>
                <Slider
                  value={exerciseDuration}
                  onValueChange={setExerciseDuration}
                  max={180}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white font-medium">Životní styl</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Volný čas: {freeTimeHours[0]}h</Label>
              <Slider
                value={freeTimeHours}
                onValueChange={setFreeTimeHours}
                max={8}
                min={0}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Kvalita volného času: {freeTimeQuality[0]}/10</Label>
              <Slider
                value={freeTimeQuality}
                onValueChange={setFreeTimeQuality}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-300">Výživa: {nutrition[0]}/10</Label>
              <Slider value={nutrition} onValueChange={setNutrition} max={10} min={1} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="text-gray-300">Hydratace: {hydration[0]}/10</Label>
              <Slider value={hydration} onValueChange={setHydration} max={10} min={1} step={1} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-gray-300">Poznámky (volitelné)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jak se dnes cítíte? Něco specifického, co ovlivňuje vaši náladu?"
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
            className="bg-slate-800 border-slate-700 text-white"
          >
            Zrušit
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            {isSubmitting ? "Ukládám..." : "Uložit hodnocení"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
