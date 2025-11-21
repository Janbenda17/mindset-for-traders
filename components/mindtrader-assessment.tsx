"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Coffee, Meh, Smile, Frown, Save, Activity, Moon, Sun, Battery, Brain, Utensils } from 'lucide-react'
import { getUserData, saveUserData } from "@/utils/storage-utils"

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

export function MindTraderAssessment() {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 border-blue-200 dark:border-blue-800">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Denní hodnocení</h2>
          <p className="text-blue-600 dark:text-blue-300">Zhodnoťte svou připravenost na obchodování</p>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <Activity className="w-6 h-6 text-blue-600 dark:text-blue-300" />
        </div>
      </div>

      {todayAssessment && (
        <Alert className={`${getRecommendationColor(todayAssessment.recommendation)} shadow-md`}>
          <div className="flex items-start gap-4">
            {getRecommendationIcon(todayAssessment.recommendation)}
            <div>
              <AlertTitle className="text-lg font-bold mb-1">
                Doporučení: {
                  todayAssessment.recommendation === "TRADE_NORMAL" ? "Obchodovat normálně" :
                  todayAssessment.recommendation === "TRADE_CAREFUL" ? "Obchodovat opatrně" :
                  todayAssessment.recommendation === "NO_TRADE" ? "Neobchodovat" : "Dát si pauzu"
                }
              </AlertTitle>
              <AlertDescription className="text-base">
                {todayAssessment.recommendationReason}
              </AlertDescription>
              <div className="mt-2 font-medium flex items-center gap-2">
                <span>Celkové skóre:</span>
                <span className={`text-lg font-bold ${todayAssessment.overallScore >= 8 ? 'text-green-600' : todayAssessment.overallScore >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {todayAssessment.overallScore}/10
                </span>
              </div>
            </div>
          </div>
        </Alert>
      )}

      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="space-y-8 p-0">
          {/* Sleep Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Spánek a Regenerace</h3>
                <p className="text-sm text-muted-foreground">Základ pro dobré rozhodování</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Délka spánku</Label>
                  <span className="text-lg font-bold text-indigo-600">{sleepHours[0]} h</span>
                </div>
                <Slider
                  value={sleepHours}
                  onValueChange={setSleepHours}
                  min={0}
                  max={12}
                  step={0.5}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Kvalita spánku</Label>
                  <span className="text-lg font-bold text-indigo-600">{sleepQuality[0]}/10</span>
                </div>
                <Slider
                  value={sleepQuality}
                  onValueChange={setSleepQuality}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Špatná</span>
                  <span>Průměr</span>
                  <span>Výborná</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mental State Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Mentální Kapacita</h3>
                <p className="text-sm text-muted-foreground">Připravenost mysli na trh</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Nálada</Label>
                  <span className="text-lg font-bold text-purple-600">{mood[0]}/10</span>
                </div>
                <Slider
                  value={mood}
                  onValueChange={setMood}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Energie</Label>
                  <span className="text-lg font-bold text-purple-600">{energy[0]}/10</span>
                </div>
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Stres</Label>
                  <span className={`text-lg font-bold ${stress[0] > 7 ? 'text-red-500' : 'text-green-500'}`}>{stress[0]}/10</span>
                </div>
                <Slider
                  value={stress}
                  onValueChange={setStress}
                  min={1}
                  max={10}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>
          </div>

          {/* Lifestyle Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Životní Styl</h3>
                <p className="text-sm text-muted-foreground">Fyzická podpora výkonu</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="exercised" className="text-base font-medium">Fyzická aktivita</Label>
                  <p className="text-xs text-muted-foreground">Cvičil(a) jste dnes?</p>
                </div>
                <Switch
                  id="exercised"
                  checked={exercised}
                  onCheckedChange={setExercised}
                />
              </div>

              {exercised && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                  <div className="space-y-2">
                    <Label>Typ cvičení</Label>
                    <Select value={exerciseType} onValueChange={setExerciseType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ cvičení" />
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
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Délka cvičení</Label>
                      <span className="text-sm font-medium">{exerciseDuration[0]} min</span>
                    </div>
                    <Slider
                      value={exerciseDuration}
                      onValueChange={setExerciseDuration}
                      min={0}
                      max={120}
                      step={5}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">Kvalita výživy</Label>
                    <span className="text-lg font-bold text-orange-600">{nutrition[0]}/10</span>
                  </div>
                  <Slider
                    value={nutrition}
                    onValueChange={setNutrition}
                    min={1}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">Hydratace</Label>
                    <span className="text-lg font-bold text-blue-500">{hydration[0]}/10</span>
                  </div>
                  <Slider
                    value={hydration}
                    onValueChange={setHydration}
                    min={1}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Label htmlFor="notes" className="text-base font-medium">Osobní poznámky</Label>
            <Textarea
              id="notes"
              placeholder="Jak se dnes cítíte? Nějaké specifické problémy nebo myšlenky?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" disabled={isSubmitting}>
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? "Ukládám..." : "Uložit denní hodnocení"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
