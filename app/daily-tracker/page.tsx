"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Cloud,
  Sun,
  CloudRain,
  SunSnow as Snow,
  Bed,
  Dumbbell,
  Apple,
  Brain,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  CalendarIcon,
  BarChart3,
  Activity,
  BookOpen,
  Target,
  Award,
  Flame,
  Eye,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Zap,
  Coffee,
  Heart,
  XCircle,
  MessageSquare,
  Sparkles,
  Clock,
  TrendingUpIcon,
} from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"

interface DailyEntry {
  date: string
  weather: {
    condition: string
    mood_impact: number
  }
  sleep: {
    bedtime: string
    wake_time: string
    quality: number
  }
  exercise: {
    type: string
    duration: number
    intensity: number
  }
  nutrition: {
    quality: number
    water_intake: number
  }
  mental_state: {
    stress_level: number
    focus_level: number
    confidence: number
    anxiety: number
  }
  trading_psychology: {
    discipline: number
    patience: number
    risk_management: number
    emotional_control: number
  }
  notes: string
  ai_score: number
  sleep_hours: number
}

const COLORS = {
  excellent: "#10b981",
  good: "#3b82f6",
  average: "#f59e0b",
  poor: "#ef4444",
}

// Generate sample data for demo
function generateSampleData(): DailyEntry[] {
  const entries: DailyEntry[] = []
  const today = new Date()

  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const baseSleepQuality = isWeekend ? 7 + Math.random() * 2 : 6 + Math.random() * 3
    const baseExerciseDuration = isWeekend ? 45 + Math.random() * 30 : 20 + Math.random() * 40
    const baseExerciseIntensity = isWeekend ? 6 + Math.random() * 3 : 5 + Math.random() * 4

    const sleepHours = isWeekend ? 7.5 + Math.random() * 1.5 : 6.5 + Math.random() * 2
    const bedtime = isWeekend ? "23:30" : ["22:00", "22:30", "23:00", "23:30", "00:00"][Math.floor(Math.random() * 5)]
    const wakeTime = isWeekend ? "08:00" : ["06:00", "06:30", "07:00", "07:30"][Math.floor(Math.random() * 4)]

    const stressLevel = Math.max(1, Math.min(10, 5 - baseSleepQuality * 0.3 + Math.random() * 3))
    const focusLevel = Math.max(1, Math.min(10, baseSleepQuality * 0.8 + Math.random() * 2))
    const confidence = Math.max(1, Math.min(10, 6 + Math.random() * 3))
    const anxiety = Math.max(1, Math.min(10, stressLevel * 0.8 + Math.random() * 2))

    const discipline = Math.max(1, Math.min(10, focusLevel * 0.9 + Math.random() * 2))
    const patience = Math.max(1, Math.min(10, 7 - stressLevel * 0.3 + Math.random() * 2))
    const riskManagement = Math.max(1, Math.min(10, discipline * 0.9 + Math.random() * 1))
    const emotionalControl = Math.max(1, Math.min(10, 8 - anxiety * 0.4 + Math.random() * 2))

    const nutritionQuality = Math.max(1, Math.min(10, 6 + Math.random() * 3))
    const waterIntake = Math.floor(Math.random() * 4) + 5

    const weatherConditions = ["sunny", "cloudy", "rainy", "snowy"]
    const weatherWeights = [0.5, 0.3, 0.15, 0.05]
    const randomWeather = Math.random()
    let weather = "sunny"
    let cumulative = 0
    for (let j = 0; j < weatherConditions.length; j++) {
      cumulative += weatherWeights[j]
      if (randomWeather < cumulative) {
        weather = weatherConditions[j]
        break
      }
    }
    const moodImpact =
      weather === "sunny" ? 7 + Math.random() * 2 : weather === "cloudy" ? 5 + Math.random() * 3 : 4 + Math.random() * 3

    const exerciseTypes = ["gym", "cardio", "sport", "walk", "none"]
    const exerciseType = baseExerciseDuration > 15 ? exerciseTypes[Math.floor(Math.random() * 4)] : "none"

    const weights = {
      sleep: 0.25,
      exercise: 0.15,
      nutrition: 0.15,
      mental_state: 0.25,
      trading_psychology: 0.2,
    }

    const sleepScore = Math.min(
      10,
      Math.max(
        0,
        sleepHours >= 7 && sleepHours <= 9
          ? (baseSleepQuality + 8) / 2
          : (baseSleepQuality + Math.max(0, 10 - Math.abs(sleepHours - 8) * 2)) / 2,
      ),
    )
    const exerciseScore = baseExerciseDuration > 0 ? (baseExerciseIntensity + 5) / 2 : 3
    const nutritionScore = (nutritionQuality + (waterIntake / 8) * 10) / 2
    const mentalScore = (10 - stressLevel + focusLevel + confidence + (10 - anxiety)) / 4
    const tradingScore = (discipline + patience + riskManagement + emotionalControl) / 4

    const aiScore =
      sleepScore * weights.sleep +
      exerciseScore * weights.exercise +
      nutritionScore * weights.nutrition +
      mentalScore * weights.mental_state +
      tradingScore * weights.trading_psychology

    const notes =
      Math.random() > 0.6
        ? [
            "Skvělý den! Cítím se připravený na trading.",
            "Trochu unavený, ale celkově v pohodě.",
            "Výborný spánek, vysoká energie celý den.",
            "Stresující den, potřebuji si odpočinout.",
            "Perfektní balance mezi prací a odpočinkem.",
            "Dobré cvičení pomohlo s koncentrací.",
            "Měl bych více spát, cítím se unavený.",
            "Skvělá nálada, všechno jde podle plánu.",
          ][Math.floor(Math.random() * 8)]
        : ""

    entries.push({
      date: dateStr,
      weather: {
        condition: weather,
        mood_impact: Math.round(moodImpact * 10) / 10,
      },
      sleep: {
        bedtime: bedtime,
        wake_time: wakeTime,
        quality: Math.round(baseSleepQuality * 10) / 10,
      },
      exercise: {
        type: exerciseType,
        duration: Math.round(baseExerciseDuration),
        intensity: Math.round(baseExerciseIntensity * 10) / 10,
      },
      nutrition: {
        quality: Math.round(nutritionQuality * 10) / 10,
        water_intake: waterIntake,
      },
      mental_state: {
        stress_level: Math.round(stressLevel * 10) / 10,
        focus_level: Math.round(focusLevel * 10) / 10,
        confidence: Math.round(confidence * 10) / 10,
        anxiety: Math.round(anxiety * 10) / 10,
      },
      trading_psychology: {
        discipline: Math.round(discipline * 10) / 10,
        patience: Math.round(patience * 10) / 10,
        risk_management: Math.round(riskManagement * 10) / 10,
        emotional_control: Math.round(emotionalControl * 10) / 10,
      },
      notes: notes,
      ai_score: Math.round(aiScore * 10) / 10,
      sleep_hours: Math.round(sleepHours * 10) / 10,
    })
  }

  return entries
}

export default function DailyTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentEntry, setCurrentEntry] = useState<DailyEntry>({
    date: new Date().toISOString().split("T")[0],
    weather: { condition: "sunny", mood_impact: 7 },
    sleep: { bedtime: "23:00", wake_time: "07:00", quality: 7 },
    exercise: { type: "gym", duration: 30, intensity: 6 },
    nutrition: { quality: 7, water_intake: 8 },
    mental_state: { stress_level: 3, focus_level: 7, confidence: 7, anxiety: 3 },
    trading_psychology: { discipline: 8, patience: 7, risk_management: 8, emotional_control: 7 },
    notes: "",
    ai_score: 0,
    sleep_hours: 8,
  })
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [activeTab, setActiveTab] = useState("today")
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedDayDetail, setSelectedDayDetail] = useState<DailyEntry | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const calculateSleepHours = (bedtime: string, wakeTime: string): number => {
    if (!bedtime || !wakeTime) return 0
    const [bedHour, bedMin] = bedtime.split(":").map(Number)
    const [wakeHour, wakeMin] = wakeTime.split(":").map(Number)
    const bedTimeMinutes = bedHour * 60 + bedMin
    let wakeTimeMinutes = wakeHour * 60 + wakeMin
    if (bedHour >= 18 && wakeHour <= 12) {
      wakeTimeMinutes += 24 * 60
    } else if (bedTimeMinutes > wakeTimeMinutes) {
      wakeTimeMinutes += 24 * 60
    }
    const sleepMinutes = wakeTimeMinutes - bedTimeMinutes
    return Math.max(0, Math.round((sleepMinutes / 60) * 10) / 10)
  }

  useEffect(() => {
    const sleepHours = calculateSleepHours(currentEntry.sleep.bedtime, currentEntry.sleep.wake_time)
    const calculateAIScore = () => {
      const weights = {
        sleep: 0.25,
        exercise: 0.15,
        nutrition: 0.15,
        mental_state: 0.25,
        trading_psychology: 0.2,
      }
      const sleepScore = Math.min(
        10,
        Math.max(
          0,
          sleepHours >= 7 && sleepHours <= 9
            ? (currentEntry.sleep.quality + 8) / 2
            : (currentEntry.sleep.quality + Math.max(0, 10 - Math.abs(sleepHours - 8) * 2)) / 2,
        ),
      )
      const exerciseScore = currentEntry.exercise.duration > 0 ? (currentEntry.exercise.intensity + 5) / 2 : 3
      const nutritionScore = (currentEntry.nutrition.quality + (currentEntry.nutrition.water_intake / 8) * 10) / 2
      const mentalScore =
        (10 -
          currentEntry.mental_state.stress_level +
          currentEntry.mental_state.focus_level +
          currentEntry.mental_state.confidence +
          (10 - currentEntry.mental_state.anxiety)) /
        4
      const tradingScore =
        (currentEntry.trading_psychology.discipline +
          currentEntry.trading_psychology.patience +
          currentEntry.trading_psychology.risk_management +
          currentEntry.trading_psychology.emotional_control) /
        4
      const totalScore =
        sleepScore * weights.sleep +
        exerciseScore * weights.exercise +
        nutritionScore * weights.nutrition +
        mentalScore * weights.mental_state +
        tradingScore * weights.trading_psychology
      setCurrentEntry((prev) => ({
        ...prev,
        ai_score: Math.round(totalScore * 10) / 10,
        sleep_hours: sleepHours,
      }))
    }
    calculateAIScore()
  }, [
    currentEntry.sleep.bedtime,
    currentEntry.sleep.wake_time,
    currentEntry.sleep.quality,
    currentEntry.exercise,
    currentEntry.nutrition,
    currentEntry.mental_state,
    currentEntry.trading_psychology,
  ])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-yellow-400" />
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-400" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-400" />
      case "snowy":
        return <Snow className="h-5 w-5 text-blue-200" />
      default:
        return <Sun className="h-5 w-5 text-yellow-400" />
    }
  }

  const getScorePercentage = (score: number) => Math.round(score * 10)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return COLORS.excellent
    if (percentage >= 70) return COLORS.good
    if (percentage >= 50) return COLORS.average
    return COLORS.poor
  }

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 85) return "Excellent"
    if (percentage >= 70) return "Good"
    if (percentage >= 50) return "Average"
    return "Poor"
  }

  const getTradingRecommendation = (percentage: number) => {
    if (percentage >= 85) return "🎯 Perfektní den na trading! Všechny systémy optimální."
    if (percentage >= 75) return "✅ Dobrý den na trading. Můžeš obchodovat s důvěrou."
    if (percentage >= 65) return "⚠️ Střední připravenost. Obchoduj opatrně, menší pozice."
    if (percentage >= 50) return "🚨 Nízká připravenost. Raději dnes neobchoduj."
    return "❌ Kriticky nízká připravenost. Určitě dnes neobchoduj!"
  }

  const getRadarData = (entry: DailyEntry) => {
    return [
      { subject: "Spánek", A: getScorePercentage(entry.sleep.quality), fullMark: 100 },
      {
        subject: "Cvičení",
        A: entry.exercise.duration > 0 ? getScorePercentage(entry.exercise.intensity) : 0,
        fullMark: 100,
      },
      { subject: "Výživa", A: getScorePercentage(entry.nutrition.quality), fullMark: 100 },
      { subject: "Focus", A: getScorePercentage(entry.mental_state.focus_level), fullMark: 100 },
      { subject: "Disciplína", A: getScorePercentage(entry.trading_psychology.discipline), fullMark: 100 },
      { subject: "Confidence", A: getScorePercentage(entry.mental_state.confidence), fullMark: 100 },
    ]
  }

  const getStreakData = () => {
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (const entry of sortedEntries) {
      if (getScorePercentage(entry.ai_score) >= 70) {
        tempStreak++
        if (currentStreak === 0) currentStreak = tempStreak
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak
        tempStreak = 0
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak

    return { currentStreak, longestStreak }
  }

  const saveEntry = () => {
    const updatedEntries = entries.filter((e) => e.date !== currentEntry.date)
    const newEntries = [...updatedEntries, currentEntry]
    setEntries(newEntries)
    if (typeof window !== "undefined") {
      localStorage.setItem("daily-tracker-entries", JSON.stringify(newEntries))
    }
  }

  const loadEntry = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const existingEntry = entries.find((e) => e.date === dateStr)
    if (existingEntry) {
      setCurrentEntry(existingEntry)
    } else {
      setCurrentEntry({
        date: dateStr,
        weather: { condition: "sunny", mood_impact: 7 },
        sleep: { bedtime: "23:00", wake_time: "07:00", quality: 7 },
        exercise: { type: "gym", duration: 30, intensity: 6 },
        nutrition: { quality: 7, water_intake: 8 },
        mental_state: { stress_level: 3, focus_level: 7, confidence: 7, anxiety: 3 },
        trading_psychology: { discipline: 8, patience: 7, risk_management: 8, emotional_control: 7 },
        notes: "",
        ai_score: 0,
        sleep_hours: 8,
      })
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLiveMode = localStorage.getItem("trader-mindset-live-mode") === "true"
      const saved = localStorage.getItem("daily-tracker-entries")

      if (!isLiveMode && !saved) {
        const sampleData = generateSampleData()
        setEntries(sampleData)
        localStorage.setItem("daily-tracker-entries", JSON.stringify(sampleData))

        const todayStr = new Date().toISOString().split("T")[0]
        const todayEntry = sampleData.find((e) => e.date === todayStr)
        if (todayEntry) {
          setCurrentEntry(todayEntry)
        }
      } else if (saved) {
        try {
          const parsedEntries = JSON.parse(saved)
          setEntries(parsedEntries)
          const todayStr = new Date().toISOString().split("T")[0]
          const todayEntry = parsedEntries.find((e: DailyEntry) => e.date === todayStr)
          if (todayEntry) {
            setCurrentEntry(todayEntry)
          }
        } catch (error) {
          console.error("Error loading entries:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    loadEntry(selectedDate)
  }, [selectedDate, entries])

  const percentage = getScorePercentage(currentEntry.ai_score)
  const streakData = getStreakData()

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))
  }

  // AI Analysis functions
  const getWeaknessAreas = (entry: DailyEntry) => {
    const issues = []

    if (entry.sleep_hours < 7) {
      issues.push({
        area: "Spánek",
        icon: Bed,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        issue: `Nedostatek spánku (${entry.sleep_hours}h)`,
        impact: "Snížená koncentrace a zvýšené riziko chyb",
        severity: "high",
      })
    }

    if (entry.exercise.duration < 20) {
      issues.push({
        area: "Cvičení",
        icon: Dumbbell,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        issue: `Nedostatečná aktivita (${entry.exercise.duration}min)`,
        impact: "Nižší energie a horší nálada",
        severity: "medium",
      })
    }

    if (entry.nutrition.water_intake < 6) {
      issues.push({
        area: "Hydratace",
        icon: Coffee,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10",
        borderColor: "border-cyan-500/30",
        issue: `Nízký příjem vody (${entry.nutrition.water_intake}/8)`,
        impact: "Únava a snížený výkon",
        severity: "medium",
      })
    }

    if (getScorePercentage(entry.mental_state.stress_level) > 60) {
      issues.push({
        area: "Stres",
        icon: AlertTriangle,
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        issue: `Vysoká úroveň stresu (${getScorePercentage(entry.mental_state.stress_level)}%)`,
        impact: "Zvýšené riziko impulzivních rozhodnutí",
        severity: "high",
      })
    }

    if (getScorePercentage(entry.mental_state.focus_level) < 60) {
      issues.push({
        area: "Focus",
        icon: Brain,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        issue: `Nízká koncentrace (${getScorePercentage(entry.mental_state.focus_level)}%)`,
        impact: "Nedostatečná pozornost k detailům",
        severity: "high",
      })
    }

    if (getScorePercentage(entry.trading_psychology.discipline) < 70) {
      issues.push({
        area: "Disciplína",
        icon: Target,
        color: "text-pink-400",
        bgColor: "bg-pink-500/10",
        borderColor: "border-pink-500/30",
        issue: `Slabá disciplína (${getScorePercentage(entry.trading_psychology.discipline)}%)`,
        impact: "Riziko nedodržení trading plánu",
        severity: "high",
      })
    }

    return issues
  }

  const getImprovementSuggestions = (entry: DailyEntry) => {
    const suggestions = []

    if (entry.sleep_hours < 7) {
      suggestions.push({
        title: "Zlepši spánkový režim",
        icon: Bed,
        color: "text-blue-400",
        actions: [
          "Jdi spát před 23:00",
          "Vyhni se obrazovkám 1h před spaním",
          "Vytvoř si večerní rutinu",
          "Udržuj konstantní čas na spaní",
        ],
        priority: "high",
      })
    }

    if (entry.exercise.duration < 20) {
      suggestions.push({
        title: "Přidej pohyb",
        icon: Dumbbell,
        color: "text-green-400",
        actions: ["Minimálně 20-30min denně", "Ranní rozcvička (10min)", "Procházka po obědě", "Lehké strečink večer"],
        priority: "medium",
      })
    }

    if (getScorePercentage(entry.mental_state.stress_level) > 60) {
      suggestions.push({
        title: "Sniž stres",
        icon: Heart,
        color: "text-red-400",
        actions: ["Dechová cvičení (5-10min)", "Meditace ráno", "Přestávky během dne", "Omez caffein"],
        priority: "high",
      })
    }

    if (getScorePercentage(entry.mental_state.focus_level) < 60) {
      suggestions.push({
        title: "Zlepši koncentraci",
        icon: Brain,
        color: "text-purple-400",
        actions: [
          "Pomodoro technika (25/5min)",
          "Eliminuj rozptýlení",
          "Jedno úkol najednou",
          "Pravidelné mikro-pauzy",
        ],
        priority: "high",
      })
    }

    if (entry.nutrition.water_intake < 6) {
      suggestions.push({
        title: "Hydratace",
        icon: Coffee,
        color: "text-cyan-400",
        actions: [
          "Minimálně 8 sklenic denně",
          "Lahev vody na stole",
          "Pravidelné připomínky",
          "Vyhni se sladkým nápojům",
        ],
        priority: "medium",
      })
    }

    return suggestions
  }

  const getAIInsights = (entry: DailyEntry) => {
    const score = getScorePercentage(entry.ai_score)
    const insights = []

    // Overall assessment
    if (score >= 85) {
      insights.push({
        type: "success",
        icon: Sparkles,
        title: "Výborný den!",
        message:
          "Všechny tvoje metriky jsou na vysoké úrovni. Jsi v optimálním stavu pro trading. Využij tohoto dne a obchoduj s plnou důvěrou.",
      })
    } else if (score >= 70) {
      insights.push({
        type: "good",
        icon: CheckCircle,
        title: "Solidní výkon",
        message:
          "Máš dobrou základnu, ale je zde prostor pro zlepšení. Zaměř se na slabší oblasti a můžeš dosáhnout ještě lepších výsledků.",
      })
    } else if (score >= 50) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Střední připravenost",
        message:
          "Dnes nejsi v optimální formě. Doporučuji obchodovat s maximální opatrností a menšími pozicemi. Zaměř se na kvalitu, ne kvantitu.",
      })
    } else {
      insights.push({
        type: "danger",
        icon: XCircle,
        title: "Nedostatečná připravenost",
        message:
          "Tvůj dnešní stav není vhodný pro trading. Doporučuji si dnes odpočinout a zaměřit se na zlepšení svého wellbeingu. Trading může počkat.",
      })
    }

    // Pattern analysis
    if (entries.length >= 7) {
      const last7Days = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7)
      const avgScore = last7Days.reduce((sum, e) => sum + getScorePercentage(e.ai_score), 0) / 7

      if (score > avgScore + 10) {
        insights.push({
          type: "success",
          icon: TrendingUpIcon,
          title: "Pozitivní trend",
          message: `Tvůj dnešní výkon je o ${Math.round(score - avgScore)}% lepší než týdenní průměr. Skvělá práce!`,
        })
      } else if (score < avgScore - 10) {
        insights.push({
          type: "warning",
          icon: TrendingDown,
          title: "Pokles výkonu",
          message: `Dnes jsi o ${Math.round(avgScore - score)}% pod tvým týdenním průměrem. Možná potřebuješ odpočinek?`,
        })
      }
    }

    // Correlation insights
    if (entry.sleep_hours < 7 && getScorePercentage(entry.mental_state.focus_level) < 60) {
      insights.push({
        type: "info",
        icon: Lightbulb,
        title: "Souvislost spánku a focusu",
        message:
          "Vidím souvislost mezi tvým nedostatkem spánku a nízkou koncentrací. Kvalitní spánek je klíčový pro mentální výkon.",
      })
    }

    if (entry.exercise.duration === 0 && getScorePercentage(entry.mental_state.stress_level) > 60) {
      insights.push({
        type: "info",
        icon: Lightbulb,
        title: "Pohyb pomůže se stresem",
        message: "Nedostatek pohybu může přispívat k vysoké úrovni stresu. I krátká procházka může výrazně pomoci.",
      })
    }

    return insights
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl -z-10 animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
            Daily Performance Tracker
          </h1>
          <p className="text-gray-400 text-lg">Optimize your trading mindset through daily habits</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-purple-500/30 backdrop-blur-xl">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"
            >
              <Activity className="h-4 w-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              AI Analytics
            </TabsTrigger>
          </TabsList>

          {/* TODAY TAB - UNCHANGED */}
          <TabsContent value="today" className="space-y-6 mt-6">
            <Card className="relative overflow-hidden bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl">
              <CardContent className="pt-8 pb-8 relative z-10">
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="text-8xl md:text-9xl font-black" style={{ color: getScoreColor(percentage) }}>
                      {percentage}
                      <span className="text-5xl">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Badge
                      className="text-xl px-8 py-3 font-bold border-2"
                      style={{
                        backgroundColor: `${getScoreColor(percentage)}15`,
                        borderColor: `${getScoreColor(percentage)}60`,
                        color: getScoreColor(percentage),
                      }}
                    >
                      {getScoreLabel(percentage)} Performance
                    </Badge>

                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">{getTradingRecommendation(percentage)}</p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2 rounded-full border border-slate-600">
                      <Flame className="h-5 w-5 text-orange-400" />
                      <span className="text-white font-bold">{streakData.currentStreak}</span>
                      <span className="text-gray-400 text-sm">day streak</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2 rounded-full border border-slate-600">
                      <Award className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-bold">{streakData.longestStreak}</span>
                      <span className="text-gray-400 text-sm">best</span>
                    </div>
                  </div>

                  <Progress value={percentage} className="w-full h-3 bg-slate-700/50" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/70 border-slate-600/50 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <Bed className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">{currentEntry.sleep_hours}h</div>
                  <div className="text-xs text-gray-400">Sleep</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/70 border-slate-600/50 backdrop-blur-sm hover:border-green-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <Dumbbell className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">{currentEntry.exercise.duration}m</div>
                  <div className="text-xs text-gray-400">Exercise</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/70 border-slate-600/50 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">
                    {getScorePercentage(currentEntry.mental_state.focus_level)}%
                  </div>
                  <div className="text-xs text-gray-400">Focus</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/70 border-slate-600/50 backdrop-blur-sm hover:border-pink-500/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white">
                    {getScorePercentage(currentEntry.trading_psychology.discipline)}%
                  </div>
                  <div className="text-xs text-gray-400">Discipline</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getWeatherIcon(currentEntry.weather.condition)}
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Weather
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={currentEntry.weather.condition}
                    onValueChange={(value) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        weather: { ...prev.weather, condition: value },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="sunny">☀️ Sunny</SelectItem>
                      <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
                      <SelectItem value="rainy">🌧️ Rainy</SelectItem>
                      <SelectItem value="snowy">❄️ Snowy</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Mood Impact</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.weather.mood_impact)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.weather.mood_impact]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          weather: { ...prev.weather, mood_impact: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bed className="h-5 w-5 text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Sleep
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Bedtime</label>
                      <Input
                        type="time"
                        value={currentEntry.sleep.bedtime}
                        onChange={(e) =>
                          setCurrentEntry((prev) => ({
                            ...prev,
                            sleep: { ...prev.sleep, bedtime: e.target.value },
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Wake</label>
                      <Input
                        type="time"
                        value={currentEntry.sleep.wake_time}
                        onChange={(e) =>
                          setCurrentEntry((prev) => ({
                            ...prev,
                            sleep: { ...prev.sleep, wake_time: e.target.value },
                          }))
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-400">{currentEntry.sleep_hours}h</div>
                    <div className="text-xs text-gray-400">Total Sleep</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Quality</span>
                      <span className="text-white font-bold">{getScorePercentage(currentEntry.sleep.quality)}%</span>
                    </label>
                    <Slider
                      value={[currentEntry.sleep.quality]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          sleep: { ...prev.sleep, quality: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-green-400" />
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Exercise
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={currentEntry.exercise.type}
                    onValueChange={(value) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        exercise: { ...prev.exercise, type: value },
                      }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="gym">🏋️ Gym</SelectItem>
                      <SelectItem value="cardio">🏃 Cardio</SelectItem>
                      <SelectItem value="sport">⚽ Sport</SelectItem>
                      <SelectItem value="walk">🚶 Walk</SelectItem>
                      <SelectItem value="none">❌ None</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={currentEntry.exercise.duration}
                    onChange={(e) =>
                      setCurrentEntry((prev) => ({
                        ...prev,
                        exercise: { ...prev.exercise, duration: Number.parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Intensity</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.exercise.intensity)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.exercise.intensity]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          exercise: { ...prev.exercise, intensity: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Apple className="h-5 w-5 text-orange-400" />
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      Nutrition
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Food Quality</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.nutrition.quality)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.nutrition.quality]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, quality: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Water Intake (glasses)</label>
                    <Input
                      type="number"
                      placeholder="1-8 glasses"
                      value={currentEntry.nutrition.water_intake}
                      onChange={(e) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          nutrition: { ...prev.nutrition, water_intake: Number.parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 flex-1 rounded ${
                          i < currentEntry.nutrition.water_intake ? "bg-blue-500" : "bg-slate-700/50"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Mental State
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Stress Level</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.mental_state.stress_level)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.mental_state.stress_level]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          mental_state: { ...prev.mental_state, stress_level: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Focus Level</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.mental_state.focus_level)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.mental_state.focus_level]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          mental_state: { ...prev.mental_state, focus_level: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Confidence</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.mental_state.confidence)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.mental_state.confidence]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          mental_state: { ...prev.mental_state, confidence: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-pink-500/50 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-pink-400" />
                    <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      Trading Mind
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Discipline</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.trading_psychology.discipline)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.trading_psychology.discipline]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          trading_psychology: { ...prev.trading_psychology, discipline: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Patience</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.trading_psychology.patience)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.trading_psychology.patience]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          trading_psychology: { ...prev.trading_psychology, patience: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 flex justify-between mb-2">
                      <span>Risk Management</span>
                      <span className="text-white font-bold">
                        {getScorePercentage(currentEntry.trading_psychology.risk_management)}%
                      </span>
                    </label>
                    <Slider
                      value={[currentEntry.trading_psychology.risk_management]}
                      onValueChange={(value) =>
                        setCurrentEntry((prev) => ({
                          ...prev,
                          trading_psychology: { ...prev.trading_psychology, risk_management: value[0] },
                        }))
                      }
                      max={10}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Daily Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="How are you feeling today? Any insights or observations..."
                  value={currentEntry.notes}
                  onChange={(e) => setCurrentEntry((prev) => ({ ...prev, notes: e.target.value }))}
                  className="bg-slate-800/50 border-slate-700 text-white min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={saveEntry}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
              >
                <CheckCircle className="h-6 w-6 mr-3" />
                Save Today's Entry
              </Button>
            </div>
          </TabsContent>

          {/* CALENDAR TAB - COMPACT LIST VIEW */}
          <TabsContent value="calendar" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {calendarMonth.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {
                    entries.filter(
                      (e) =>
                        new Date(e.date).getMonth() === calendarMonth.getMonth() &&
                        new Date(e.date).getFullYear() === calendarMonth.getFullYear(),
                    ).length
                  }{" "}
                  tracked days
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevMonth}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCalendarMonth(new Date())}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Compact List View */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {(() => {
                    const monthEntries = entries
                      .filter(
                        (e) =>
                          new Date(e.date).getMonth() === calendarMonth.getMonth() &&
                          new Date(e.date).getFullYear() === calendarMonth.getFullYear(),
                      )
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    if (monthEntries.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <CalendarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <div className="text-gray-400">No entries for this month</div>
                        </div>
                      )
                    }

                    return monthEntries.map((entry) => {
                      const score = getScorePercentage(entry.ai_score)
                      const date = new Date(entry.date)
                      const isToday = new Date().toISOString().split("T")[0] === entry.date

                      return (
                        <button
                          key={entry.date}
                          onClick={() => {
                            setSelectedDayDetail(entry)
                            setIsDetailOpen(true)
                          }}
                          className="w-full"
                        >
                          <div
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-[1.02] cursor-pointer ${
                              isToday ? "ring-2 ring-purple-400" : ""
                            }`}
                            style={{
                              backgroundColor: `${getScoreColor(score)}10`,
                              borderColor: `${getScoreColor(score)}40`,
                            }}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="text-center min-w-[60px]">
                                <div className="text-3xl font-black" style={{ color: getScoreColor(score) }}>
                                  {date.getDate()}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {date.toLocaleDateString("cs-CZ", { weekday: "short" })}
                                </div>
                              </div>

                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge
                                    style={{
                                      backgroundColor: `${getScoreColor(score)}20`,
                                      borderColor: getScoreColor(score),
                                      color: getScoreColor(score),
                                    }}
                                    className="font-bold"
                                  >
                                    {score}%
                                  </Badge>
                                  <span className="text-white font-semibold">
                                    {date.toLocaleDateString("cs-CZ", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </span>
                                  {isToday && (
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                                      Today
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Bed className="h-4 w-4" />
                                    <span>{entry.sleep_hours}h</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Dumbbell className="h-4 w-4" />
                                    <span>{entry.exercise.duration}m</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Brain className="h-4 w-4" />
                                    <span>{getScorePercentage(entry.mental_state.focus_level)}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span>{getScorePercentage(entry.trading_psychology.discipline)}%</span>
                                  </div>
                                </div>
                              </div>

                              <Eye className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </button>
                      )
                    })
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB - AI POWERED INSIGHTS */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Hero Score */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 border border-purple-500/30">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-4">
                  <div className="text-7xl font-black" style={{ color: getScoreColor(percentage) }}>
                    {percentage}%
                  </div>
                  <Badge
                    className="text-lg px-6 py-2 font-bold"
                    style={{
                      backgroundColor: `${getScoreColor(percentage)}20`,
                      borderColor: getScoreColor(percentage),
                      color: getScoreColor(percentage),
                    }}
                  >
                    {getScoreLabel(percentage)} - Today's Performance
                  </Badge>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">{getTradingRecommendation(percentage)}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                AI Insights & Analysis
              </h3>

              {getAIInsights(currentEntry).map((insight, index) => {
                const Icon = insight.icon
                return (
                  <Card
                    key={index}
                    className={`border-2 ${
                      insight.type === "success"
                        ? "bg-green-500/10 border-green-500/30"
                        : insight.type === "good"
                          ? "bg-blue-500/10 border-blue-500/30"
                          : insight.type === "warning"
                            ? "bg-yellow-500/10 border-yellow-500/30"
                            : insight.type === "danger"
                              ? "bg-red-500/10 border-red-500/30"
                              : "bg-purple-500/10 border-purple-500/30"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            insight.type === "success"
                              ? "bg-green-500/20"
                              : insight.type === "good"
                                ? "bg-blue-500/20"
                                : insight.type === "warning"
                                  ? "bg-yellow-500/20"
                                  : insight.type === "danger"
                                    ? "bg-red-500/20"
                                    : "bg-purple-500/20"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              insight.type === "success"
                                ? "text-green-400"
                                : insight.type === "good"
                                  ? "text-blue-400"
                                  : insight.type === "warning"
                                    ? "text-yellow-400"
                                    : insight.type === "danger"
                                      ? "text-red-400"
                                      : "text-purple-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2">{insight.title}</h4>
                          <p className="text-gray-300">{insight.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Problem Areas */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
                Co je špatně dnes
              </h3>

              {getWeaknessAreas(currentEntry).length === 0 ? (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <div>
                        <h4 className="text-lg font-bold text-white">Vše vypadá skvěle!</h4>
                        <p className="text-gray-300">Všechny tvoje metriky jsou v dobrém stavu.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                getWeaknessAreas(currentEntry).map((issue, index) => {
                  const Icon = issue.icon
                  return (
                    <Card key={index} className={`${issue.bgColor} border-2 ${issue.borderColor}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${issue.bgColor}`}>
                            <Icon className={`h-6 w-6 ${issue.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`text-lg font-bold ${issue.color}`}>{issue.area}</h4>
                              {issue.severity === "high" && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-400/30">High Priority</Badge>
                              )}
                            </div>
                            <p className="text-white font-semibold mb-1">{issue.issue}</p>
                            <p className="text-gray-400 text-sm">💥 {issue.impact}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Action Plan */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-400" />
                Jak to vylepšit
              </h3>

              {getImprovementSuggestions(currentEntry).map((suggestion, index) => {
                const Icon = suggestion.icon
                return (
                  <Card key={index} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          <Icon className={`h-6 w-6 ${suggestion.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className={`text-lg font-bold ${suggestion.color}`}>{suggestion.title}</h4>
                            {suggestion.priority === "high" && (
                              <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">Priority</Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            {suggestion.actions.map((action, actionIndex) => (
                              <div
                                key={actionIndex}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white h-auto py-4"
                    onClick={() => {
                      // Set reminder for sleep
                      alert("Sleep reminder set for 22:30!")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-bold">Set Sleep Reminder</div>
                        <div className="text-xs opacity-80">Get notified at bedtime</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white h-auto py-4"
                    onClick={() => {
                      // Quick log exercise
                      alert("Exercise logged!")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Dumbbell className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-bold">Log Exercise</div>
                        <div className="text-xs opacity-80">Quick workout entry</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white h-auto py-4"
                    onClick={() => {
                      // Meditation timer
                      alert("Starting 5-minute meditation...")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-bold">Meditation Timer</div>
                        <div className="text-xs opacity-80">5-minute guided session</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white h-auto py-4"
                    onClick={() => {
                      // Export data
                      alert("Exporting your data...")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-bold">Export Data</div>
                        <div className="text-xs opacity-80">Download as CSV</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-pink-400" />
                  Weekly Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Sleep 7+ hours</span>
                    <span className="text-sm font-bold text-white">
                      {entries.filter((e) => e.sleep_hours >= 7).length}/7 days
                    </span>
                  </div>
                  <Progress value={(entries.filter((e) => e.sleep_hours >= 7).length / 7) * 100} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Exercise daily</span>
                    <span className="text-sm font-bold text-white">
                      {entries.filter((e) => e.exercise.duration > 0).length}/7 days
                    </span>
                  </div>
                  <Progress value={(entries.filter((e) => e.exercise.duration > 0).length / 7) * 100} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">70%+ daily score</span>
                    <span className="text-sm font-bold text-white">
                      {entries.filter((e) => getScorePercentage(e.ai_score) >= 70).length}/7 days
                    </span>
                  </div>
                  <Progress
                    value={(entries.filter((e) => getScorePercentage(e.ai_score) >= 70).length / 7) * 100}
                    className="h-3"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">8 glasses of water</span>
                    <span className="text-sm font-bold text-white">
                      {entries.filter((e) => e.nutrition.water_intake >= 8).length}/7 days
                    </span>
                  </div>
                  <Progress
                    value={(entries.filter((e) => e.nutrition.water_intake >= 8).length / 7) * 100}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Day Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          {selectedDayDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center justify-between">
                  <span>
                    {new Date(selectedDayDetail.date).toLocaleDateString("cs-CZ", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Badge
                    style={{
                      backgroundColor: `${getScoreColor(getScorePercentage(selectedDayDetail.ai_score))}20`,
                      borderColor: getScoreColor(getScorePercentage(selectedDayDetail.ai_score)),
                      color: getScoreColor(getScorePercentage(selectedDayDetail.ai_score)),
                    }}
                    className="text-lg px-4 py-1"
                  >
                    {getScorePercentage(selectedDayDetail.ai_score)}%
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Complete performance breakdown for this day
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Score Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="h-5 w-5 text-blue-400" />
                      <span className="text-xs text-gray-400">Sleep</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{selectedDayDetail.sleep_hours}h</div>
                    <Progress value={getScorePercentage(selectedDayDetail.sleep.quality)} className="mt-2 h-2" />
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="h-5 w-5 text-green-400" />
                      <span className="text-xs text-gray-400">Exercise</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{selectedDayDetail.exercise.duration}m</div>
                    <Progress value={getScorePercentage(selectedDayDetail.exercise.intensity)} className="mt-2 h-2" />
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <span className="text-xs text-gray-400">Focus</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {getScorePercentage(selectedDayDetail.mental_state.focus_level)}%
                    </div>
                    <Progress
                      value={getScorePercentage(selectedDayDetail.mental_state.focus_level)}
                      className="mt-2 h-2"
                    />
                  </div>

                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-pink-400" />
                      <span className="text-xs text-gray-400">Discipline</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {getScorePercentage(selectedDayDetail.trading_psychology.discipline)}%
                    </div>
                    <Progress
                      value={getScorePercentage(selectedDayDetail.trading_psychology.discipline)}
                      className="mt-2 h-2"
                    />
                  </div>
                </div>

                {/* Radar Chart */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData(selectedDayDetail)}>
                          <PolarGrid stroke="#475569" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} />
                          <Radar
                            dataKey="A"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.6}
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6", r: 3 }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        Mental State
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Stress</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.mental_state.stress_level)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.mental_state.stress_level)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Focus</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.mental_state.focus_level)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.mental_state.focus_level)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Confidence</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.mental_state.confidence)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.mental_state.confidence)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Anxiety</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.mental_state.anxiety)}%
                          </span>
                        </div>
                        <Progress value={getScorePercentage(selectedDayDetail.mental_state.anxiety)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4 text-pink-400" />
                        Trading Psychology
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Discipline</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.trading_psychology.discipline)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.trading_psychology.discipline)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Patience</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.trading_psychology.patience)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.trading_psychology.patience)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Risk Management</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.trading_psychology.risk_management)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.trading_psychology.risk_management)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Emotional Control</span>
                          <span className="text-white font-bold">
                            {getScorePercentage(selectedDayDetail.trading_psychology.emotional_control)}%
                          </span>
                        </div>
                        <Progress
                          value={getScorePercentage(selectedDayDetail.trading_psychology.emotional_control)}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                {selectedDayDetail.notes && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-400" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{selectedDayDetail.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
