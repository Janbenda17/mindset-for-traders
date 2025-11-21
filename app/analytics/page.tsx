"use client"

// import { Label } from "@/components/ui/label" // Removed

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Target,
  CheckCircle2,
  Zap,
  Heart,
  Sparkles,
  Download,
  Clock,
  Smile,
  Frown,
  Meh,
  Activity,
  TrendingUpIcon,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Flame,
  Wind,
  Calendar,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  Award,
  XCircle,
  RefreshCw,
  Percent,
  TrendingDown as TrendingUpDown,
  Rocket,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  PieChart,
  Pie,
  Tooltip as ChartTooltip, // Renamed Tooltip to ChartTooltip to avoid conflict
} from "recharts"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { getUserData } from "@/utils/storage-utils"

// Custom Tooltip with better formatting
const CustomTooltip = ({ active, payload, label, type = "default" }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-purple-500/40 rounded-lg p-4 shadow-2xl">
      <p className="text-white font-bold mb-3 text-base">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300 text-sm font-medium">{entry.name}:</span>
          </div>
          <span className="text-white font-bold text-base">
            {type === "currency"
              ? `${entry.value >= 0 ? "+" : ""}$${entry.value.toFixed(0)}`
              : type === "percent"
                ? `${entry.value.toFixed(0)}%`
                : type === "mixed" // Handle mixed currency and percentage values
                  ? entry.name.toLowerCase().includes("p&l")
                    ? `${entry.value >= 0 ? "+" : ""}$${entry.value.toFixed(0)}`
                    : `${entry.value.toFixed(0)}%`
                  : entry.value.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Generate demo data with proper date formatting
function generateDemoData(tradingStyle: string) {
  const weeks = 12
  const weeklyPerformanceData = []
  const dailyMoodData = []
  let cumulativePnL = 10000

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (weeks - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weekLabel = `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString("cs-CZ", { month: "short" })}`

    const weekTrades = Math.floor(Math.random() * 7) + 2
    const avgMood = 60 + Math.sin(i / 3) * 15 + Math.random() * 10

    let weekPnL = 0
    let weekWins = 0

    for (let t = 0; t < weekTrades; t++) {
      const tradePnL = (Math.random() - 0.45) * 300 * (avgMood / 50)
      weekPnL += tradePnL
      if (tradePnL > 0) weekWins++
    }

    const weekWinRate = weekTrades > 0 ? (weekWins / weekTrades) * 100 : 0
    cumulativePnL += weekPnL

    weeklyPerformanceData.push({
      week: weekLabel,
      fullDate: weekStart.toLocaleDateString("cs-CZ", { day: "numeric", month: "long" }),
      pnl: Math.round(weekPnL),
      winRate: Math.round(weekWinRate),
      trades: weekTrades,
      avgMood: Math.round(avgMood),
      avgDiscipline: Math.round(Math.max(40, Math.min(95, avgMood + Math.random() * 20 - 10))),
      cumulativePnL: Math.round(cumulativePnL),
    })
  }

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (30 - i - 1))
    const dateStr = `${date.getDate()}. ${date.toLocaleDateString("cs-CZ", { month: "short" })}`

    const baseMood = 65 + Math.sin(i / 7) * 15 + Math.random() * 10
    const mood = Math.max(30, Math.min(95, baseMood))
    const discipline = Math.max(40, Math.min(95, mood + Math.random() * 20 - 10))
    const confidence = Math.max(35, Math.min(90, mood + Math.random() * 15 - 5))
    const stress = Math.max(15, Math.min(85, 100 - mood + Math.random() * 20))

    const dailyPnL = (Math.random() - 0.45) * 500 * (mood / 65)

    dailyMoodData.push({
      date: dateStr,
      mood: Math.round(mood),
      discipline: Math.round(discipline),
      confidence: Math.round(confidence),
      stress: Math.round(stress),
      energy: Math.round(Math.max(30, Math.min(95, mood + Math.random() * 20 - 10))),
      sleep: Math.round(Math.max(4, Math.min(9, 7 + Math.random() * 2 - 1))),
      pnl: Math.round(dailyPnL), // Added P&L
    })
  }

  const weekdays = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"]
  const weekdayChartData = weekdays.map((day, idx) => ({
    day,
    winRate: 45 + Math.random() * 30 + (idx === 2 ? 10 : 0),
    avgMood: 60 + Math.random() * 20 + (idx === 2 ? 5 : 0),
    avgDiscipline: 65 + Math.random() * 20,
    trades: Math.floor(Math.random() * 3) + 1,
  }))

  return {
    weeklyPerformanceData,
    dailyMoodData,
    weekdayChartData,
  }
}

function generatePsychologicalAnalysis(
  trades: any[],
  journals: any[],
  moodEntries: any[],
  isLiveMode: boolean,
  tradingStyle: string,
  timeframe: "week" | "month" | "all",
) {
  let weeklyPerformanceData = []
  let dailyMoodData = []
  let weekdayChartData: any[] = []

  if (!isLiveMode || (trades.length === 0 && moodEntries.length === 0)) {
    const demoData = generateDemoData(tradingStyle)
    weeklyPerformanceData = demoData.weeklyPerformanceData
    dailyMoodData = demoData.dailyMoodData
    weekdayChartData = demoData.weekdayChartData
  } else {
    let filteredTrades = trades
    if (timeframe === "week") {
      filteredTrades = trades.filter((trade) => {
        const day = new Date(trade.date).getDay()
        return day >= 1 && day <= 5 // Monday=1 to Friday=5
      })
    }

    let groupBy: "day" | "week" | "month" = "week"
    let periods = 12

    if (timeframe === "week") {
      groupBy = "day" // Show Mon-Fri for current week
      periods = 5
    } else if (timeframe === "month") {
      groupBy = "week" // Show 4 weeks
      periods = 4
    } else if (timeframe === "quarter") {
      // This is not used in UI, but for completeness
      groupBy = "month" // Show 3 months
      periods = 3
    } else if (timeframe === "all") {
      groupBy = "month" // Group all data by month for overview
      periods = 999 // Show all months
    }

    const groupedData: Record<string, any> = {}

    filteredTrades.forEach((trade) => {
      const tradeDate = new Date(trade.date)
      let groupKey = ""
      let displayLabel = ""

      if (groupBy === "day") {
        groupKey = trade.date
        const dayNames = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]
        displayLabel = dayNames[tradeDate.getDay()]
      } else if (groupBy === "week") {
        const weekStart = new Date(tradeDate)
        const dayOfWeek = tradeDate.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        weekStart.setDate(tradeDate.getDate() + diff)
        groupKey = weekStart.toISOString().split("T")[0]
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        displayLabel = `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString("cs", { month: "short" })}`
      } else if (groupBy === "month") {
        groupKey = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, "0")}`
        displayLabel = tradeDate.toLocaleDateString("cs", { month: "long", year: "numeric" })
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          trades: [],
          pnl: 0,
          wins: 0,
          moodSum: 0,
          moodCount: 0,
          readinessSum: 0,
          readinessCount: 0,
          displayLabel, // Store display label
        }
      }

      groupedData[groupKey].trades.push(trade)
      groupedData[groupKey].pnl += trade.pnl || 0
      if (trade.outcome === "win") groupedData[groupKey].wins++

      if (trade.mood) {
        groupedData[groupKey].moodSum += trade.mood
        groupedData[groupKey].moodCount++
      }

      const matchingMoodEntry = moodEntries.find((entry) => entry.date === trade.date)
      if (matchingMoodEntry?.readiness) {
        groupedData[groupKey].readinessSum += matchingMoodEntry.readiness
        groupedData[groupKey].readinessCount++
      }
    })

    weeklyPerformanceData = Object.entries(groupedData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-periods)
      .map(([key, data]: [string, any]) => ({
        week: data.displayLabel || key, // Use display label
        pnl: data.pnl,
        trades: data.trades.length,
        winRate: data.trades.length > 0 ? (data.wins / data.trades.length) * 100 : 0,
        avgMood: data.moodCount > 0 ? data.moodSum / data.moodCount : 50,
        avgReadiness: data.readinessCount > 0 ? data.readinessSum / data.readinessCount : 0, // Added readiness
      }))

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (30 - i - 1))
      return date.toISOString().split("T")[0]
    })

    dailyMoodData = last30Days.map((dateStr) => {
      const dayMood = moodEntries.find((m) => m.date === dateStr)
      const date = new Date(dateStr)

      const dayTrades = filteredTrades.filter((t) => t.date === dateStr)
      const dailyPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)

      return {
        date: `${date.getDate()}. ${date.toLocaleDateString("cs-CZ", { month: "short" })}`,
        mood: dayMood?.mood || 0,
        discipline: dayMood?.discipline || 0,
        confidence: dayMood?.confidence || 0,
        stress: dayMood?.stress || 0,
        energy: dayMood?.energy || 0,
        sleep: dayMood?.sleep || 0,
        pnl: dailyPnL, // CHANGE: Added P&L
      }
    })

    const weekdayData: Record<string, { trades: number; pnl: number; wins: number; mood: number; discipline: number }> =
      {}

    trades.forEach((trade) => {
      const day = new Date(trade.date).toLocaleDateString("cs-CZ", { weekday: "long" })
      const mood = moodEntries.find((m) => m.date === trade.date)

      if (!weekdayData[day]) weekdayData[day] = { trades: 0, pnl: 0, wins: 0, mood: 0, discipline: 0 }
      weekdayData[day].trades++
      weekdayData[day].pnl += trade.pnl || 0
      if ((trade.pnl || 0) > 0) weekdayData[day].wins++
      if (mood) {
        weekdayData[day].mood += mood.mood || 0
        weekdayData[day].discipline += mood.discipline || 0
      }
    })

    weekdayChartData = Object.entries(weekdayData).map(([day, data]) => ({
      day,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgMood: data.trades > 0 ? data.mood / data.trades : 0,
      avgDiscipline: data.trades > 0 ? data.discipline / data.trades : 0,
      trades: data.trades,
    }))
  }

  const emotionalPatterns = [
    {
      name: "FOMO Trading",
      emoji: "😰",
      count: Math.floor(Math.random() * 8) + 3,
      impact: -(Math.random() * 800 + 200),
      color: "#ef4444",
      severity: "high",
      description: "Impulzivní obchody z obavy, že promeškáš příležitost",
      recommendation: "Vyčkej 10 minut před vstupem. FOMO většinou znamená, že jsi pozdě.",
    },
    {
      name: "Revenge Trading",
      emoji: "😤",
      count: Math.floor(Math.random() * 5) + 2,
      impact: -(Math.random() * 1200 + 400),
      color: "#dc2626",
      severity: "critical",
      description: "Snaha rychle získat zpět ztráty - nejnebezpečnější pattern",
      recommendation: "STOP trading po 2 ztrátách za sebou. Udělej pauzu minimálně 30 minut.",
    },
    {
      name: "Overconfidence",
      emoji: "😎",
      count: Math.floor(Math.random() * 6) + 2,
      impact: -(Math.random() * 600 + 100),
      color: "#f59e0b",
      severity: "medium",
      description: "Přehnaná sebedůvěra vede k riskantním rozhodnutím",
      recommendation: "Po 3 winech za sebou zmenši position size o 30%. Stay humble.",
    },
    {
      name: "Fear & Hesitation",
      emoji: "😨",
      count: Math.floor(Math.random() * 7) + 3,
      impact: -(Math.random() * 500 + 150),
      color: "#eab308",
      severity: "medium",
      description: "Strach brání využití dobrých příležitostí",
      recommendation: "Používej mentální rehearsal. Vizualizuj perfektní trade 5 minut před session.",
    },
  ]

  const avgMoodCalc =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.mood || 0), 0) / dailyMoodData.length
      : 68
  const avgDisciplineCalc =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.discipline || 0), 0) / dailyMoodData.length
      : 72
  const avgConfidenceCalc =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / dailyMoodData.length
      : 65
  const avgStressCalc =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.stress || 0), 0) / dailyMoodData.length
      : 42

  const moodVariance =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + Math.pow((m.mood || 0) - avgMoodCalc, 2), 0) /
        dailyMoodData.length
      : 100
  const moodStability = Math.max(0, 100 - Math.sqrt(moodVariance))

  const psychInsights: any[] = []

  const avgSleep =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.sleep || 0), 0) / dailyMoodData.length
      : 7.2

  if (avgSleep >= 7) {
    psychInsights.push({
      type: "success",
      icon: "😴",
      title: "Spánek je tvůj superpower!",
      description: `Průměrně spíš ${avgSleep.toFixed(1)}h, což je SKVĚLÉ! Studie ukazují, že 7+ hodin spánku zlepšuje rozhodování o 40%.`,
      action: "Pokračuj v pravidelném spánkovém režimu - funguje to!",
      impact: "high",
    })
  } else if (avgSleep < 6.5) {
    psychInsights.push({
      type: "critical",
      icon: "😴",
      title: "KRITICKÝ nedostatek spánku!",
      description: `Spíš průměrně jen ${avgSleep.toFixed(1)}h denně. Tvoje rozhodovací schopnost je o 35% horší než po 7+ hodinách.`,
      action: "PRIORITA #1: Nastav alarm na 22:00 a jdi spát. Seriously.",
      impact: "critical",
    })
  }

  if (moodStability > 85) {
    psychInsights.push({
      type: "success",
      icon: "🧘",
      title: "Mentální pevnost úrovně monk",
      description: `Emoční stabilita ${moodStability.toFixed(0)}% je v top 10% traderů!`,
      action: "Co děláš pro mental health? Sdílej to s dalšími!",
      impact: "positive",
    })
  } else if (moodStability < 70) {
    psychInsights.push({
      type: "warning",
      icon: "🎢",
      title: "Emoční kolotoč",
      description: `Stabilita ${moodStability.toFixed(0)}% znamená vysokou emoční volatilitu.`,
      action: "Denní journaling + 10min meditation. Změň to během 2 týdnů!",
      impact: "high",
    })
  }

  if (avgDisciplineCalc > 80) {
    psychInsights.push({
      type: "success",
      icon: "🎯",
      title: "Disciplína level: Navy SEAL",
      description: `Disciplína ${avgDisciplineCalc.toFixed(0)}% je brutální!`,
      action: "Mentoruj ostatní - sdílej své techniky!",
      impact: "positive",
    })
  } else if (avgDisciplineCalc < 60) {
    psychInsights.push({
      type: "critical",
      icon: "📋",
      title: "Disciplína = největší problém",
      description: `Disciplína ${avgDisciplineCalc.toFixed(0)}% je nízká. Bez disciplíny = gambling!`,
      action: "Vytvoř pre-trade checklist. Non-negotiable.",
      impact: "critical",
    })
  }

  if (avgStressCalc > 65) {
    psychInsights.push({
      type: "critical",
      icon: "😰",
      title: "KRITICKY vysoký stress",
      description: `Stress ${avgStressCalc.toFixed(0)}% je nebezpečný!`,
      action: "Zmenši position sizes o 50%. Stress management je priorita.",
      impact: "critical",
    })
  } else if (avgStressCalc > 50) {
    psychInsights.push({
      type: "warning",
      icon: "😤",
      title: "Zvýšený stress level",
      description: `Stress ${avgStressCalc.toFixed(0)}% je nad optimální úrovní.`,
      action: "5min breathing exercises před každým session.",
      impact: "high",
    })
  } else {
    psychInsights.push({
      type: "success",
      icon: "😌",
      title: "Perfektní stress management",
      description: `Stress ${avgStressCalc.toFixed(0)}% je v optimálním rozmezí!`,
      action: "Pokračuj - tato rovnováha je klíčová.",
      impact: "positive",
    })
  }

  const actionPlan = []
  const totalTrades = trades.length
  const journalingRate =
    journals.length > 0 ? (journals.filter((j) => j.tradeId !== undefined).length / journals.length) * 100 : 0
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
  const winRate = totalTrades > 0 ? (trades.filter((trade) => trade.pnl > 0).length / totalTrades) * 100 : 0
  const avgEnergy =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.energy || 0), 0) / dailyMoodData.length
      : 68
  const consistencyScore =
    trades.length > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (1 - Math.abs(trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / Math.max(totalPnL, 1))) * 100,
          ),
        )
      : 0

  const uniqueDays = new Set(trades.map((t) => t.date)).size

  if (emotionalPatterns.some((p) => p.severity === "critical")) {
    const criticalPattern = emotionalPatterns.find((p) => p.severity === "critical")
    actionPlan.push({
      priority: "high" as const,
      emoji: criticalPattern?.emoji || "⚠️",
      title: `ELIMINUJ ${criticalPattern?.name}`,
      description: criticalPattern?.description || "",
      action: "30min pauza po KAŽDÉ ztrátě. No exceptions!",
      impact: `Stálo tě to $${Math.abs(Math.round(criticalPattern?.impact || 0))}`,
    })
  }

  if (avgStressCalc > 60) {
    actionPlan.push({
      priority: "high" as const,
      emoji: "🧘",
      title: "SNIŽ stress ASAP",
      description: "Chronický stress ničí kortizol balance",
      action: "1) Zmenši positions 50% 2) 10min meditation 3) Sport 3x týdně",
      impact: "Game changer pro mental health",
    })
  }

  if (avgDisciplineCalc < 65) {
    actionPlan.push({
      priority: "high" as const,
      emoji: "📋",
      title: "DISCIPLÍNA je #1 priorita",
      description: "Bez disciplíny = gambling",
      action: "5-point pre-trade checklist před každým trade.",
      impact: "Rozdíl mezi profitable/unprofitable",
    })
  }

  if (journalingRate < 70) {
    actionPlan.push({
      priority: "medium" as const,
      emoji: "✍️",
      title: "Více journalingu",
      description: `${journalingRate.toFixed(0)}% je málo`,
      action: "Cíl: 80%+ rate. Journal do 1h po trade.",
      impact: "Better self-awareness = better decisions",
    })
  }

  const bestWeek = weeklyPerformanceData.reduce((best, week) => (week.pnl > best.pnl ? week : best), {
    pnl: Number.NEGATIVE_INFINITY,
    avgReadiness: 0,
  })
  const worstWeek = weeklyPerformanceData.reduce((worst, week) => (week.pnl < worst.pnl ? worst : worst), {
    pnl: Number.POSITIVE_INFINITY,
    avgReadiness: 0,
  })

  const moodPerformanceData = weeklyPerformanceData.map((week) => ({
    mood: week.avgMood,
    pnl: week.pnl,
    week: week.week,
    size: Math.abs(week.pnl) / 10 + 5,
  }))

  // CHANGE: Added psychologicalProfile based on the RadarChart data structure
  const psychologicalProfile = [
    { subject: "Disciplína", A: Math.round(avgDisciplineCalc) },
    { subject: "Emoce", A: Math.round(moodStability) },
    { subject: "Sebevědomí", A: Math.round(avgConfidenceCalc) },
    { subject: "Stress", A: Math.round(Math.max(0, 100 - avgStressCalc)) },
    { subject: "Konzistence", A: Math.round(consistencyScore) },
    { subject: "Awareness", A: Math.round(journalingRate) },
    { subject: "Energie", A: Math.round(avgEnergy) },
    {
      subject: "Readiness",
      A: Math.round(
        weeklyPerformanceData.reduce((sum, w) => sum + w.avgReadiness, 0) / Math.max(weeklyPerformanceData.length, 1),
      ),
    }, // Added readiness to psychological profile
  ]

  return {
    summary: {
      totalPnL,
      winRate,
      trades: totalTrades,
      uniqueDays, // Added uniqueDays to summary
      emotionalScore: avgMoodCalc,
      disciplineScore: avgDisciplineCalc,
      confidenceScore: avgConfidenceCalc,
      stressScore: avgStressCalc,
      moodStability,
      journalingRate,
      energyScore: avgEnergy,
      consistencyScore,
      weeks: weeklyPerformanceData.length,
      bestWeek,
      worstWeek,
      avgWeeklyPnL:
        weeklyPerformanceData.length > 0
          ? weeklyPerformanceData.reduce((sum, w) => sum + w.pnl, 0) / weeklyPerformanceData.length
          : 0,
    },
    weeklyPerformanceData,
    dailyMoodData,
    emotionalPatterns,
    psychInsights,
    actionPlan,
    weekdayChartData,
    moodPerformanceData,
    psychologicalProfile, // Added for RadarChart
  }
}

export default function AnalyticsPage() {
  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month") // Added "all"
  const [activeTab, setActiveTab] = useState("overview") // Added activeTab state
  const [analysis, setAnalysis] = useState<any>(null)
  const [tradingStyle, setTradingStyle] = useState<string>("day-trader")

  useEffect(() => {
    const userData = getUserData()
    const style = userData.settings?.trading?.style || "day-trader"
    setTradingStyle(style)

    const trades = getAllTrades()
    const journals = getAllJournalEntries()
    const moodEntries = JSON.parse(localStorage.getItem("trader-mindset-mood-entries") || "[]")

    const realAnalysis = generatePsychologicalAnalysis(trades, journals, moodEntries, isLiveMode, style, timeframe)
    setAnalysis(realAnalysis)
  }, [isLiveMode, timeframe])

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400">Analyzujem tvůj mindset...</p>
        </div>
      </div>
    )
  }

  // **START: Update for Live Mode with no trades**
  const daysGoal = 10 // Goal is 10 trading days to get meaningful data

  if (isLiveMode && analysis.summary.uniqueDays < daysGoal) {
    const currentDays = analysis.summary.uniqueDays
    const daysRemaining = daysGoal - currentDays
    const progressPercent = (currentDays / daysGoal) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
          <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-4 animate-pulse">
                  <Rocket className="w-10 h-10 text-purple-400" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Začněte svou trading cestu!</h2>
                  <p className="text-lg text-slate-400">
                    Vaše analytika se zpřesňuje s každým obchodním dnem. Potřebujeme data z alespoň {daysGoal} dní pro
                    relevantní psychologický profil.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-8 space-y-4 border border-purple-500/20">
                  <div className="flex items-center justify-center gap-3">
                    <Calendar className="w-8 h-8 text-amber-500" />
                    <div className="text-left">
                      <p className="text-sm text-slate-400">Zbývá odobchodovat</p>
                      <p className="text-4xl font-black text-purple-400">{daysRemaining} dní</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Pokrok k plné analýze</span>
                      <span className="font-semibold text-purple-400">
                        {currentDays}/{daysGoal} dní
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 pt-2">
                    Po dosažení {daysGoal} obchodních dní se odemknou pokročilé psychologické vzorce a prediktivní
                    nástroje.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/10">
                    <BarChart3 className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                    <p className="text-sm font-semibold text-white">Risk/Reward analýza</p>
                    <p className="text-xs text-slate-500 mt-1">Objevte své nejlepší setupy</p>
                  </div>

                  <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/10">
                    <Target className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                    <p className="text-sm font-semibold text-white">Detekce vzorců</p>
                    <p className="text-xs text-slate-500 mt-1">AI identifikuje vaše chyby</p>
                  </div>

                  <div className="bg-slate-800/30 rounded-lg p-4 border border-purple-500/10">
                    <TrendingUp className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                    <p className="text-sm font-semibold text-white">Predikce výkonu</p>
                    <p className="text-xs text-slate-500 mt-1">Předpověď trading výsledků</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  // **END: Update for Live Mode with no trades**

  const priorityColors = {
    high: "bg-red-500/20 text-red-300 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  }

  const getWinRateLabel = () => {
    switch (tradingStyle) {
      case "scalper":
        return "Denní Win Rate"
      case "swing-trader":
        return "Týdenní Win Rate" // Changed from "Měsíční Win Rate"
      default:
        return "Týdenní Win Rate"
    }
  }

  const getWinRatePeriod = () => {
    switch (tradingStyle) {
      case "scalper":
        return "% ziskových dní"
      case "swing-trader":
        return "% ziskových týdnů" // Changed from "% ziskových měsíců"
      default:
        return "% ziskových týdnů"
    }
  }

  const getFilteredData = (data: any[], type: "daily" | "weekly") => {
    const now = new Date()
    let filteredData = [...data]

    if (timeframe === "week") {
      // Week = Monday to Friday only (last 5 trading days)
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 7) // Look back 7 days to ensure we get 5 weekdays

      filteredData = data
        .filter((item) => {
          // Ensure item.date or item.week exists and is a valid date
          if (!item.date && !item.week) return false
          const itemDate = new Date(item.date || item.week)
          if (isNaN(itemDate.getTime())) return false // Skip invalid dates

          const dayOfWeek = itemDate.getDay()
          // Only Monday (1) to Friday (5)
          return itemDate >= startDate && dayOfWeek >= 1 && dayOfWeek <= 5
        })
        .slice(-5) // Take last 5 weekdays
    } else if (timeframe === "month") {
      // Month = 4 weeks of data grouped by weeks
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 28) // 4 weeks

      filteredData = data.filter((item) => {
        if (!item.date && !item.week) return false
        const itemDate = new Date(item.date || item.week)
        return itemDate >= startDate
      })

      // Group by weeks
      if (type === "daily") {
        const weeklyGrouped: Record<string, any> = {}
        filteredData.forEach((item) => {
          const itemDate = new Date(item.date)
          if (isNaN(itemDate.getTime())) return // Skip invalid dates

          const weekStart = new Date(itemDate)
          const day = weekStart.getDay()
          const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1) // Fixed: use getDate() not getDay()
          weekStart.setDate(diff)

          const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}` // Use full date for unique key

          if (!weeklyGrouped[weekKey]) {
            weeklyGrouped[weekKey] = {
              week: `${weekStart.getDate()}. ${weekStart.toLocaleDateString("cs-CZ", { month: "short" })} - ${new Date(weekStart.setDate(weekStart.getDate() + 6)).getDate()}. ${new Date(weekStart.setDate(weekStart.getDate() - 6)).toLocaleDateString("cs-CZ", { month: "short" })}`, // Dynamic week label
              mood: 0,
              discipline: 0,
              confidence: 0,
              stress: 0,
              pnl: 0,
              count: 0,
            }
          }

          weeklyGrouped[weekKey].mood += item.mood || 0
          weeklyGrouped[weekKey].discipline += item.discipline || 0
          weeklyGrouped[weekKey].confidence += item.confidence || 0
          weeklyGrouped[weekKey].stress += item.stress || 0
          weeklyGrouped[weekKey].pnl += item.pnl || 0
          weeklyGrouped[weekKey].count++
        })

        filteredData = Object.values(weeklyGrouped).map((week: any) => ({
          date: week.week, // Use the formatted week label
          mood: Math.round(week.mood / week.count),
          discipline: Math.round(week.discipline / week.count),
          confidence: Math.round(week.confidence / week.count),
          stress: Math.round(week.stress / week.count),
          pnl: Math.round(week.pnl),
        }))
      }
    }
    // timeframe === "all" returns all data unfiltered

    return filteredData
  }

  const filteredDailyData = getFilteredData(analysis.dailyMoodData, "daily")
  const filteredWeeklyData = getFilteredData(analysis.weeklyPerformanceData, "weekly")

  const avgMood =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.mood || 0), 0) / filteredDailyData.length
      : 65

  const avgDiscipline =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.discipline || 0), 0) / filteredDailyData.length
      : 72

  const avgConfidence =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / filteredDailyData.length
      : 65

  const avgStress =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.stress || 0), 0) / filteredDailyData.length
      : 42

  const moodVariance =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + Math.pow((m.mood || 0) - avgMood, 2), 0) /
        filteredDailyData.length
      : 100
  const moodStability = Math.max(0, 100 - Math.sqrt(moodVariance))

  const avgWinRate =
    filteredWeeklyData.length > 0
      ? filteredWeeklyData.reduce((sum: number, w: any) => sum + w.winRate, 0) / filteredWeeklyData.length
      : 0

  const trades = getAllTrades() // Accessing trades for the overview tab

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              Psychologická Analytics
              <Badge
                className={
                  isLiveMode
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isLiveMode ? "Live Mode" : "Virtual Mode"}
              </Badge>
            </h1>
            <p className="text-gray-300 text-lg">
              {isLiveMode ? "Live Mode - Tvůj mentální profil" : "Virtual Mode - Demo data"}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-slate-600">
              {(["week", "month", "all"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    timeframe === period
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-slate-700",
                  )}
                >
                  {period === "week" ? "Týden" : period === "month" ? "Měsíc" : "Celkový"}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Banner with Stats */}
        <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-slate-600 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center justify-between mb-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">AI Mindset Analysis</h3>
                  <p className="text-gray-300 text-sm">
                    {analysis.summary.trades} obchodů • {analysis.summary.weeks}{" "}
                    {timeframe === "week" ? "dnů" : timeframe === "month" ? "týdnů" : "období"} •{" "}
                    {analysis.psychInsights.length} insights
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-300 text-xs mb-0.5">
                    Nejlepší {timeframe === "week" ? "den" : timeframe === "month" ? "týden" : "období"}
                  </p>
                  <p className="text-white font-bold text-lg">+${Math.abs(analysis.summary.bestWeek.pnl).toFixed(0)}</p>
                  <p className="text-gray-400 text-xs">{analysis.summary.bestWeek.week}</p>
                  {analysis.summary.bestWeek.avgReadiness > 0 && (
                    <p className="text-green-400 text-xs mt-1">
                      Readiness: {Math.round(analysis.summary.bestWeek.avgReadiness)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <TrendingDown className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-gray-300 text-xs mb-0.5">
                    Nejhorší {timeframe === "week" ? "den" : timeframe === "month" ? "týden" : "období"}
                  </p>
                  <p className="text-white font-bold text-lg">
                    -${Math.abs(analysis.summary.worstWeek.pnl).toFixed(0)}
                  </p>
                  <p className="text-gray-400 text-xs">{analysis.summary.worstWeek.week}</p>
                  {analysis.summary.worstWeek.avgReadiness > 0 && (
                    <p className="text-red-400 text-xs mt-1">
                      Readiness: {Math.round(analysis.summary.worstWeek.avgReadiness)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics - COMPLETELY REDESIGNED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Emoční Stabilita */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Emoční Stabilita</p>
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(moodStability)}%</p>
                    {moodStability > 85 ? (
                      <p className="text-green-400 text-sm font-semibold flex items-center gap-1">
                        <ArrowUp className="w-4 h-4" /> Výborná
                      </p>
                    ) : moodStability > 70 ? (
                      <p className="text-yellow-400 text-sm font-semibold">Dobrá</p>
                    ) : (
                      <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                        <ArrowDown className="w-4 h-4" /> Nestabilní
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      moodStability > 85
                        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                        : moodStability > 70
                          ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
                          : "bg-gradient-to-br from-red-500/20 to-rose-500/20",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-8 h-8",
                        moodStability > 85 ? "text-green-400" : moodStability > 70 ? "text-yellow-400" : "text-red-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    moodStability > 85
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : moodStability > 70
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500",
                  )}
                  style={{ width: `${moodStability}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Disciplína */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Disciplína</p>
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(avgDiscipline)}%</p>
                    {avgDiscipline > 80 ? (
                      <p className="text-cyan-400 text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Professional
                      </p>
                    ) : avgDiscipline > 60 ? (
                      <p className="text-blue-400 text-sm font-semibold">Slušná</p>
                    ) : (
                      <p className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Problém
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      avgDiscipline > 80
                        ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                        : avgDiscipline > 60
                          ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
                          : "bg-gradient-to-br from-orange-500/20 to-red-500/20",
                    )}
                  >
                    <Target
                      className={cn(
                        "w-8 h-8",
                        avgDiscipline > 80 ? "text-cyan-400" : avgDiscipline > 60 ? "text-blue-400" : "text-orange-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    avgDiscipline > 80
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                      : avgDiscipline > 60
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-gradient-to-r from-orange-500 to-red-500",
                  )}
                  style={{ width: `${avgDiscipline}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">{getWinRateLabel()}</p>
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(avgWinRate)}%</p>
                    {avgWinRate > 60 ? (
                      <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> Profitable
                      </p>
                    ) : avgWinRate > 50 ? (
                      <p className="text-amber-400 text-sm font-semibold">Break-even</p>
                    ) : (
                      <p className="text-rose-400 text-sm font-semibold flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" /> Unprofitable
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      avgWinRate > 60
                        ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
                        : avgWinRate > 50
                          ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20"
                          : "bg-gradient-to-br from-rose-500/20 to-red-500/20",
                    )}
                  >
                    <TrendingUpIcon
                      className={cn(
                        "w-8 h-8",
                        avgWinRate > 60 ? "text-emerald-400" : avgWinRate > 50 ? "text-amber-400" : "text-rose-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    avgWinRate > 60
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : avgWinRate > 50
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                        : "bg-gradient-to-r from-rose-500 to-red-500",
                  )}
                  style={{ width: `${avgWinRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stress Level */}
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Stress Level</p>
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(avgStress)}%</p>
                    {avgStress < 40 ? (
                      <p className="text-teal-400 text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Zdravý
                      </p>
                    ) : avgStress < 60 ? (
                      <p className="text-orange-400 text-sm font-semibold">Zvýšený</p>
                    ) : (
                      <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Kritický
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      avgStress < 40
                        ? "bg-gradient-to-br from-teal-500/20 to-cyan-500/20"
                        : avgStress < 60
                          ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20"
                          : "bg-gradient-to-br from-red-500/20 to-rose-500/20",
                    )}
                  >
                    <Activity
                      className={cn(
                        "w-8 h-8",
                        avgStress < 40 ? "text-teal-400" : avgStress < 60 ? "text-orange-400" : "text-red-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    avgStress < 40
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                      : avgStress < 60
                        ? "bg-gradient-to-r from-orange-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500",
                  )}
                  style={{ width: `${avgStress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-1 grid grid-cols-5">
            <TabsTrigger
              value="overview"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Sparkles className="w-4 h-4" />
              Přehled
            </TabsTrigger>
            <TabsTrigger
              value="mindset"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Brain className="w-4 h-4" />
              Mindset
            </TabsTrigger>
            <TabsTrigger
              value="emotions"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Heart className="w-4 h-4" />
              Emoce
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <TrendingUpDown className="w-4 h-4" />
              Patterny
            </TabsTrigger>
            <TabsTrigger
              value="action"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Target className="w-4 h-4" />
              Akční plán
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Hero Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border-emerald-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-300 mb-1">Total P&L</p>
                      <h3 className="text-3xl font-bold text-white">
                        ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)}
                      </h3>
                      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {trades.length > 0
                          ? ((trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length) * 100).toFixed(1)
                          : 0}
                        % ROI
                      </p>
                    </div>
                    <DollarSign className="w-12 h-12 text-emerald-400/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-300 mb-1">Win Rate</p>
                      <h3 className="text-3xl font-bold text-white">{Math.round(avgWinRate)}%</h3>
                      <p className="text-xs text-blue-400 mt-2">
                        {trades.filter((t) => (t.pnl || 0) > 0).length}W /{" "}
                        {trades.filter((t) => (t.pnl || 0) < 0).length}L
                      </p>
                    </div>
                    <Target className="w-12 h-12 text-blue-400/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/10 border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-300 mb-1">Avg Trade</p>
                      <h3 className="text-3xl font-bold text-white">
                        $
                        {(trades.length > 0
                          ? trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length
                          : 0
                        ).toFixed(2)}
                      </h3>
                      <p className="text-xs text-purple-400 mt-2">{trades.length} trades total</p>
                    </div>
                    <BarChart3 className="w-12 h-12 text-purple-400/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/10 border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-300 mb-1">Mental Score</p>
                      <h3 className="text-3xl font-bold text-white">
                        {Math.round((avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4)}
                      </h3>
                      <p className="text-xs text-orange-400 mt-2">Psychological readiness</p>
                    </div>
                    <Brain className="w-12 h-12 text-orange-400/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Heatmap */}
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Performance Heatmap
                  </CardTitle>
                  <CardDescription>Best & worst trading days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day, i) => (
                      <div key={day} className="text-center text-xs text-gray-400 font-medium mb-1">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 28 }).map((_, i) => {
                      const dayOfWeek = i % 7 // Day of week (0-6)
                      const dayTrades = trades.filter((t) => new Date(t.date).getDay() === dayOfWeek)
                      const dayPnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
                      const maxAbsPnl = Math.max(...trades.map((t) => Math.abs(t.pnl || 0)), 1) // Avoid division by zero
                      const intensity = Math.min(Math.abs(dayPnl) / maxAbsPnl, 1)

                      return (
                        <div
                          key={i}
                          className="aspect-square rounded transition-all hover:scale-110 cursor-pointer"
                          style={{
                            backgroundColor:
                              dayPnl > 0
                                ? `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`
                                : `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`,
                          }}
                          title={`$${dayPnl.toFixed(2)}`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500/40" /> Loss
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500/40" /> Profit
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Session Performance */}
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Session Analysis
                  </CardTitle>
                  <CardDescription>Performance by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["London (8-12)", "NY AM (12-16)", "NY PM (16-20)", "Asia (20-24)"].map((session, i) => {
                      const sessionTrades = trades.filter((t) => {
                        const hour = new Date(t.date).getHours()
                        // Adjusting range for Asia session to cover midnight
                        if (session === "Asia (20-24)") {
                          return (hour >= 20 && hour <= 23) || (hour >= 0 && hour < 0) // Covers 20-23, and wraps around to 00:00
                        }
                        return hour >= i * 4 + 8 && hour < i * 4 + 12
                      })
                      const sessionPnl = sessionTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
                      const sessionWin = sessionTrades.filter((t) => (t.pnl || 0) > 0).length
                      const sessionWinRate = sessionTrades.length > 0 ? (sessionWin / sessionTrades.length) * 100 : 0
                      return (
                        <div key={session} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{session}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">{sessionTrades.length} trades</span>
                              <span
                                className={cn("text-sm font-bold", sessionPnl > 0 ? "text-green-400" : "text-red-400")}
                              >
                                ${sessionPnl.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all",
                                  sessionPnl > 0 ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-red-500/70",
                                )}
                                style={{ width: `${sessionWinRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-12 text-right">{Math.round(sessionWinRate)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unified Performance Chart */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Performance Trend
                </CardTitle>
                <CardDescription>
                  {timeframe === "week" ? "Po-Pá tracking" : timeframe === "month" ? "4 týdny" : "Všechna data"} • P&L,
                  Win Rate, Mental Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={filteredWeeklyData}>
                    <defs>
                      <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="week" stroke="#94a3b8" style={{ fontSize: "12px", fontWeight: 500 }} />
                    <YAxis
                      yAxisId="left"
                      stroke="#94a3b8"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#f472b6"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip type="mixed" />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#pnlGradient)"
                      name="P&L ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="winRate"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Win Rate (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgMood"
                      stroke="#f472b6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Mental Score (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mindset" className="space-y-6">
            {/* Psychological Readiness Score */}
            <Card className="bg-gradient-to-br from-slate-800 via-purple-900/20 to-slate-800 border-purple-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Brain className="w-7 h-7 text-purple-400" />
                  Psychological Readiness
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Real-time mental performance metrics based on mood, discipline, confidence & stress management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Readiness Score */}
                  <div className="lg:col-span-1 flex flex-col items-center justify-center p-8 bg-slate-900/60 rounded-xl border border-purple-500/20">
                    <div className="relative w-48 h-48 mb-6">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="14"
                          fill="none"
                          className="text-slate-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="14"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - (avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4 / 100)}`}
                          className="text-purple-500 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-6xl font-bold text-white">
                          {Math.round((avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4)}
                        </span>
                        <span className="text-lg text-gray-400 mt-2">/100</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-purple-300 mb-2">
                        {(avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4 >= 80
                          ? "🔥 Peak Performance"
                          : (avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4 >= 65
                            ? "✅ Trading Ready"
                            : (avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4 >= 50
                              ? "⚠️ Proceed with Caution"
                              : "🛑 High Risk State"}
                      </h3>
                      <p className="text-sm text-gray-400">Current mental readiness level</p>
                    </div>
                  </div>

                  {/* Mental Metrics Grid */}
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-br from-pink-500/15 to-pink-600/5 rounded-xl border border-pink-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <Heart className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-300 block">Emotional State</span>
                          <span className="text-xs text-gray-500">Nálada & stabilita</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-white">{Math.round(avgMood)}</span>
                        <span className="text-lg text-gray-400">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 h-full transition-all duration-500"
                          style={{ width: `${avgMood}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {avgMood >= 75 ? "Excellent emotional balance" : avgMood >= 50 ? "Stable" : "Needs attention"}
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 rounded-xl border border-cyan-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Target className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-300 block">Mental Toughness</span>
                          <span className="text-xs text-gray-500">Disciplína & focus</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-white">{Math.round(avgDiscipline)}</span>
                        <span className="text-lg text-gray-400">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-400 h-full transition-all duration-500"
                          style={{ width: `${avgDiscipline}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {avgDiscipline >= 75
                          ? "Strong discipline"
                          : avgDiscipline >= 50
                            ? "Moderate"
                            : "Needs improvement"}
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-blue-500/15 to-blue-600/5 rounded-xl border border-blue-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Zap className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-300 block">Confidence Level</span>
                          <span className="text-xs text-gray-500">Sebevědomí</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-white">{Math.round(avgConfidence)}</span>
                        <span className="text-lg text-gray-400">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 h-full transition-all duration-500"
                          style={{ width: `${avgConfidence}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {avgConfidence >= 75
                          ? "High confidence"
                          : avgConfidence >= 50
                            ? "Moderate"
                            : "Building confidence"}
                      </p>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-red-500/15 to-red-600/5 rounded-xl border border-red-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-300 block">Stress Management</span>
                          <span className="text-xs text-gray-500">Úroveň stresu</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold text-white">{Math.round(avgStress)}</span>
                        <span className="text-lg text-gray-400">/100</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full transition-all duration-500"
                          style={{ width: `${avgStress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {avgStress >= 70
                          ? "🚨 Critical - Take break"
                          : avgStress >= 50
                            ? "⚠️ Elevated"
                            : "✅ Well managed"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Psychological Profile */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Psychologický Profil
                </CardTitle>
                <CardDescription>Multi-dimensional psychological assessment across key trading factors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={analysis.psychologicalProfile}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: "13px", fontWeight: 500 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar
                      name="Profil"
                      dataKey="A"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                    <ChartTooltip
                      content={({ payload }) => {
                        if (!payload || !payload[0]) return null
                        return (
                          <div className="bg-slate-800 border border-purple-500/30 px-4 py-3 rounded-lg shadow-2xl">
                            <p className="text-white font-semibold mb-1">{payload[0].payload.subject}</p>
                            <p className="text-2xl font-bold text-purple-400">{payload[0].value}%</p>
                          </div>
                        )
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Emotional Trends + P&L */}
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-400" />
                  {timeframe === "week" ? "Denní" : timeframe === "month" ? "Týdenní" : "Celkové"} Mental Performance &
                  P&L
                </CardTitle>
                <CardDescription>
                  {timeframe === "week" ? "Po-Pá" : timeframe === "month" ? "4 týdny" : "Všechna data"} tracking of
                  mental metrics correlated with trading performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={filteredDailyData}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <YAxis
                      yAxisId="left"
                      stroke="#94a3b8"
                      domain={[0, 100]}
                      style={{ fontSize: "12px" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload[0]) return null
                        return (
                          <div className="bg-slate-800 border border-slate-600 px-4 py-3 rounded-lg shadow-xl">
                            <p className="text-white font-semibold mb-2">{payload[0].payload.date}</p>
                            {payload.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-bold" style={{ color: entry.color }}>
                                  {entry.name === "P&L ($)" ? `$${entry.value}` : `${entry.value}%`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "24px" }} iconType="line" />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="mood"
                      stroke="#f472b6"
                      fill="url(#moodGradient)"
                      name="Nálada"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="discipline"
                      stroke="#8b5cf6"
                      name="Disciplína"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="confidence"
                      stroke="#3b82f6"
                      name="Sebevědomí"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="stress"
                      stroke="#ef4444"
                      name="Stres"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10b981"
                      name="P&L ($)"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMOTIONS TAB */}
          <TabsContent value="emotions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.emotionalPatterns.map((pattern: any, index: number) => (
                <Card
                  key={index}
                  className={cn(
                    "bg-slate-800/80 backdrop-blur-sm border-2",
                    pattern.severity === "critical" && "border-red-500/50 bg-red-500/5",
                    pattern.severity === "high" && "border-orange-500/50 bg-orange-500/5",
                    pattern.severity === "medium" && "border-yellow-500/50 bg-yellow-500/5",
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-5xl">{pattern.emoji}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{pattern.name}</h3>
                          <Badge
                            className={cn(
                              "text-xs font-semibold",
                              pattern.severity === "critical" && "bg-red-500/30 text-red-200 border-red-400",
                              pattern.severity === "high" && "bg-orange-500/30 text-orange-200 border-orange-400",
                              pattern.severity === "medium" && "bg-yellow-500/30 text-yellow-200 border-yellow-400",
                            )}
                          >
                            {pattern.severity === "critical" && "🚨 KRITICKÝ"}
                            {pattern.severity === "high" && "⚠️ VYSOKÁ ZÁVAŽNOST"}
                            {pattern.severity === "medium" && "⚡ STŘEDNÍ"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-200 mb-4 text-base leading-relaxed">{pattern.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        className={cn(
                          "p-4 rounded-lg border-2",
                          pattern.severity === "critical" && "bg-red-500/10 border-red-500/30",
                          pattern.severity === "high" && "bg-orange-500/10 border-orange-500/30",
                          pattern.severity === "medium" && "bg-yellow-500/10 border-yellow-500/30",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <p className="text-gray-400 text-xs font-medium">Výskyt</p>
                        </div>
                        <p className="text-white text-2xl font-bold">{pattern.count}x</p>
                        <p className="text-gray-500 text-xs mt-1">za období</p>
                      </div>

                      <div
                        className={cn(
                          "p-4 rounded-lg border-2",
                          pattern.severity === "critical" && "bg-red-500/10 border-red-500/30",
                          pattern.severity === "high" && "bg-orange-500/10 border-orange-500/30",
                          pattern.severity === "medium" && "bg-yellow-500/10 border-yellow-500/30",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <p className="text-gray-400 text-xs font-medium">Ztráta</p>
                        </div>
                        <p className="text-red-400 text-2xl font-bold">-${Math.abs(Math.round(pattern.impact))}</p>
                        <p className="text-gray-500 text-xs mt-1">celkem</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Průměrná ztráta/incident</span>
                        <span className="text-red-400 font-bold">
                          -${Math.abs(Math.round(pattern.impact / pattern.count))}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <div className="flex items-start gap-2">
                        <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-purple-300 font-semibold text-sm mb-1">🎯 Doporučení:</p>
                          <p className="text-gray-200 text-sm">{pattern.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  Distribuce Emočních Stavů
                </CardTitle>
                <CardDescription>
                  {timeframe === "week" ? "Tento týden" : timeframe === "month" ? "Tento měsíc" : "Celkově"} - jak často
                  jsi v jakém emočním stavu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Smile className="w-12 h-12 text-green-400" />
                      <div className="text-right">
                        <p className="text-4xl font-bold text-green-400">
                          {Math.round(
                            (filteredDailyData.filter((m: any) => m.mood >= 70).length / filteredDailyData.length) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-gray-400 text-sm">
                          {timeframe === "week" ? "dnů" : timeframe === "month" ? "týdnů" : "období"}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Dobrá nálada</h3>
                    <p className="text-gray-300 text-sm mb-3">Nálada 70+</p>
                    <div className="flex items-center gap-2 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <ThumbsUp className="w-5 h-5 text-green-300" />
                      <div>
                        <p className="text-green-200 text-xs font-semibold">Win Rate v tomto stavu</p>
                        <p className="text-white font-bold text-lg">
                          {Math.round(
                            (filteredWeeklyData.filter((d: any) => d.avgMood >= 70 && d.pnl > 0).length /
                              Math.max(filteredWeeklyData.filter((d: any) => d.avgMood >= 70).length, 1)) *
                              100,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Meh className="w-12 h-12 text-yellow-400" />
                      <div className="text-right">
                        <p className="text-4xl font-bold text-yellow-400">
                          {Math.round(
                            (filteredDailyData.filter((m: any) => m.mood >= 40 && m.mood < 70).length /
                              filteredDailyData.length) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-gray-400 text-sm">
                          {timeframe === "week" ? "dnů" : timeframe === "month" ? "týdnů" : "období"}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Neutrální</h3>
                    <p className="text-gray-300 text-sm mb-3">Nálada 40-70%</p>
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <Wind className="w-5 h-5 text-yellow-300" />
                      <div>
                        <p className="text-yellow-200 text-xs font-semibold">Win Rate v tomto stavu</p>
                        <p className="text-white font-bold text-lg">
                          {Math.round(
                            (filteredWeeklyData.filter((d: any) => d.avgMood >= 40 && d.avgMood < 70 && d.pnl > 0)
                              .length /
                              Math.max(
                                filteredWeeklyData.filter((d: any) => d.avgMood >= 40 && d.avgMood < 70).length,
                                1,
                              )) *
                              100,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Frown className="w-12 h-12 text-red-400" />
                      <div className="text-right">
                        <p className="text-4xl font-bold text-red-400">
                          {Math.round(
                            (filteredDailyData.filter((m: any) => m.mood > 0 && m.mood < 40).length /
                              filteredDailyData.length) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-gray-400 text-sm">
                          {timeframe === "week" ? "dnů" : timeframe === "month" ? "týdnů" : "období"}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Špatná nálada</h3>
                    <p className="text-gray-300 text-sm mb-3">Nálada &lt;40%</p>
                    <div className="flex items-center gap-2 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                      <ThumbsDown className="w-5 h-5 text-red-300" />
                      <div>
                        <p className="text-red-200 text-xs font-semibold">Win Rate v tomto stavu</p>
                        <p className="text-white font-bold text-lg">
                          {Math.round(
                            (filteredWeeklyData.filter((d: any) => d.avgMood > 0 && d.avgMood < 40 && d.pnl > 0)
                              .length /
                              Math.max(
                                filteredWeeklyData.filter((d: any) => d.avgMood > 0 && d.avgMood < 40).length,
                                1,
                              )) *
                              100,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NEW ADDITION - Donut Chart */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Emoční Dopad na Performance
                </CardTitle>
                <CardDescription>Vztah mezi náladou a trading výsledky</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Dobrá nálada + Profit",
                              value: filteredWeeklyData.filter((d: any) => d.avgMood >= 70 && d.pnl > 0).length,
                              fill: "#10b981",
                            },
                            {
                              name: "Dobrá nálada + Ztráta",
                              value: filteredWeeklyData.filter((d: any) => d.avgMood >= 70 && d.pnl < 0).length,
                              fill: "#eab308",
                            },
                            {
                              name: "Špatná nálada + Profit",
                              value: filteredWeeklyData.filter((d: any) => d.avgMood < 50 && d.pnl > 0).length,
                              fill: "#3b82f6",
                            },
                            {
                              name: "Špatná nálada + Ztráta",
                              value: filteredWeeklyData.filter((d: any) => d.avgMood < 50 && d.pnl < 0).length,
                              fill: "#ef4444",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Tooltip />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Dobrá nálada + Profit</p>
                        <p className="text-xs text-gray-400">Ideální kombinace pro success</p>
                      </div>
                      <span className="text-lg font-bold text-green-400">
                        {filteredWeeklyData.filter((d: any) => d.avgMood >= 70 && d.pnl > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <div className="w-4 h-4 rounded-full bg-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Dobrá nálada + Ztráta</p>
                        <p className="text-xs text-gray-400">Setup nebo timing problém</p>
                      </div>
                      <span className="text-lg font-bold text-yellow-400">
                        {filteredWeeklyData.filter((d: any) => d.avgMood >= 70 && d.pnl < 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Špatná nálada + Profit</p>
                        <p className="text-xs text-gray-400">Štěstí nebo skill?</p>
                      </div>
                      <span className="text-lg font-bold text-blue-400">
                        {filteredWeeklyData.filter((d: any) => d.avgMood < 50 && d.pnl > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Špatná nálada + Ztráta</p>
                        <p className="text-xs text-gray-400">Nebezpečná kombinace</p>
                      </div>
                      <span className="text-lg font-bold text-red-400">
                        {filteredWeeklyData.filter((d: any) => d.avgMood < 50 && d.pnl < 0).length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IMPROVED INSIGHT CARD */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/40 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-2xl border-2 border-pink-400/30">
                    <Heart className="w-10 h-10 text-pink-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-2xl font-black text-white mb-2">💡 Klíčový Insight</h3>
                      <Badge className="bg-pink-500/20 text-pink-200 border-pink-400/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Analysis
                      </Badge>
                    </div>
                    <p className="text-gray-100 text-lg leading-relaxed mb-4">
                      {avgMood > 70
                        ? `Tvoje průměrná nálada ${Math.round(avgMood)}% je skvělá! Když se cítíš dobře, tvoje performance je o ${Math.round((avgMood - 50) * 0.8)}% lepší. Udržuj pozitivní mindset! 🚀`
                        : avgMood > 50
                          ? `Tvoje průměrná nálada ${Math.round(avgMood)}% je OK, ale data ukazují, že když se dostaneš nad 70%, tvoje win rate roste o 15-25%. Focus na mental health! 🎯`
                          : `Tvoje průměrná nálada ${Math.round(avgMood)}% je pod optimální úrovní. Data jasně ukazují, že špatná nálada = horší rozhodování = ztráty. Priorita #1: mental health! ⚠️`}
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg border border-white/20">
                      <Target className="w-5 h-5 text-cyan-300" />
                      <p className="text-cyan-200 text-sm font-semibold">
                        Doporučení: Začni trackovat svou náladu před každým trading sessionem. Data jsou jasná!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PATTERNS TAB - COMPLETELY NEW */}
          <TabsContent value="patterns" className="space-y-6">
            {/* Time-Based Performance Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trading Sessions Performance */}
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Výkon podle Trading Session
                  </CardTitle>
                  <CardDescription className="text-gray-400">Kdy obchoduješ nejlépe během dne?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Asian Session",
                        icon: <Moon className="w-6 h-6 text-indigo-400" />,
                        time: "00:00 - 08:00",
                        winRate: 45 + Math.random() * 20,
                        trades: Math.floor(Math.random() * 15) + 5,
                        avgPnL: Math.floor((Math.random() - 0.3) * 200),
                        color: "indigo",
                      },
                      {
                        name: "London Open",
                        icon: <Sunrise className="w-6 h-6 text-amber-400" />,
                        time: "08:00 - 12:00",
                        winRate: 55 + Math.random() * 25,
                        trades: Math.floor(Math.random() * 25) + 10,
                        avgPnL: Math.floor((Math.random() - 0.2) * 300),
                        color: "amber",
                      },
                      {
                        name: "NY Session",
                        icon: <Sun className="w-6 h-6 text-orange-400" />,
                        time: "13:00 - 18:00",
                        winRate: 50 + Math.random() * 30,
                        trades: Math.floor(Math.random() * 30) + 15,
                        avgPnL: Math.floor((Math.random() - 0.25) * 350),
                        color: "orange",
                      },
                      {
                        name: "Evening",
                        icon: <Sunset className="w-6 h-6 text-rose-400" />,
                        time: "18:00 - 24:00",
                        winRate: 40 + Math.random() * 20,
                        trades: Math.floor(Math.random() * 10) + 3,
                        avgPnL: Math.floor((Math.random() - 0.4) * 200),
                        color: "rose",
                      },
                    ].map((session, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {session.icon}
                            <div>
                              <h4 className="text-white font-bold">{session.name}</h4>
                              <p className="text-gray-400 text-xs">{session.time}</p>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "text-sm font-bold",
                              session.winRate >= 60
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : session.winRate >= 50
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30",
                            )}
                          >
                            {Math.round(session.winRate)}% WR
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Trades</p>
                            <p className="text-white font-bold">{session.trades}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Avg P&L</p>
                            <p className={cn("font-bold", session.avgPnL >= 0 ? "text-green-400" : "text-red-400")}>
                              {session.avgPnL >= 0 ? "+" : ""}${session.avgPnL}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Rating</p>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    i < Math.floor(session.winRate / 20) ? `bg-${session.color}-400` : "bg-slate-600",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <div className="flex items-start gap-2">
                      <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-cyan-300 font-semibold text-sm mb-1">💡 Pattern Insight:</p>
                        <p className="text-white text-sm">
                          Tvůj best trading window je London Open (08:00-12:00). Soustřeď 70% tradů do tohoto času!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Win/Loss Streaks Analysis */}
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUpDown className="w-5 h-5 text-purple-400" />
                    Winning vs Losing Streaks
                  </CardTitle>
                  <CardDescription className="text-gray-400">Jak zvládáš série výher a proher?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-green-400" />
                        <p className="text-green-300 font-semibold text-sm">Winning Streaks</p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {Math.floor(Math.random() * 5) + 3} <span className="text-lg text-gray-400">tradů</span>
                      </p>
                      <p className="text-green-400 text-xs">Nejdelší série</p>
                    </div>

                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300 font-medium text-sm">Losing Streaks</p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {Math.floor(Math.random() * 3) + 2} <span className="text-lg text-gray-400">tradů</span>
                      </p>
                      <p className="text-red-400 text-xs">Nejdelší série</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-blue-400" />
                          <p className="text-white font-medium text-sm">Recovery Rate po ztrátě</p>
                        </div>
                        <span className="text-blue-400 font-bold">{Math.floor(Math.random() * 20) + 65}%</span>
                      </div>
                      <p className="text-gray-400 text-xs">Pravděpodobnost, že další trade po ztrátě bude ziskový</p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-purple-400" />
                          <p className="text-white font-medium text-sm">Streak Consistency</p>
                        </div>
                        <span className="text-purple-400 font-bold">{Math.floor(Math.random() * 15) + 70}%</span>
                      </div>
                      <p className="text-gray-400 text-xs">Jak dobře udržuješ momentum při winning streaku</p>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          <p className="text-white font-medium text-sm">Revenge Trading Risk</p>
                        </div>
                        <span className="text-orange-400 font-bold">{Math.floor(Math.random() * 15) + 15}%</span>
                      </div>
                      <p className="text-gray-400 text-xs">Tendence k impulzivním obchodům po ztrátě</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <p className="text-white font-medium text-sm">Revenge Trading Risk</p>
                      </div>
                      <span className="text-orange-400 font-bold">{Math.floor(Math.random() * 15) + 15}%</span>
                    </div>
                    <p className="text-gray-400 text-xs">Tendence k impulzivním obchodům po ztrátě</p>
                  </div>

                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <p className="text-white font-medium text-sm">Revenge Trading Risk</p>
                      </div>
                      <span className="text-orange-400 font-bold">{Math.floor(Math.random() * 15) + 15}%</span>
                    </div>
                    <p className="text-gray-400 text-xs">Tendence k impulzivním obchodům po ztrátě</p>
                  </div>

                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-300 font-semibold text-sm mb-1">⚠️ Kritické zjištění:</p>
                        <p className="text-white text-sm">
                          Po 2 ztrátách za sebou klesá tvoje win rate o 23%. STOP trading a uděl 30min break!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Conditions Performance */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-sky-400" />
                  Performance v různých Market Conditions
                </CardTitle>
                <CardDescription className="text-gray-400">Kdy tradingovat a kdy ne?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      condition: "Strong Trend",
                      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                      winRate: 65 + Math.random() * 20,
                      trades: Math.floor(Math.random() * 30) + 20,
                      avgPnL: Math.floor((Math.random() - 0.1) * 400),
                      color: "green",
                      recommendation: "BEST - Tvůj top market!",
                    },
                    {
                      condition: "Ranging",
                      icon: <TrendingUpDown className="w-6 h-6 text-yellow-400" />,
                      winRate: 45 + Math.random() * 15,
                      trades: Math.floor(Math.random() * 25) + 15,
                      avgPnL: Math.floor((Math.random() - 0.35) * 250),
                      color: "yellow",
                      recommendation: "Opatrně - nižší edge",
                    },
                    {
                      condition: "High Volatility",
                      icon: <Zap className="w-6 h-6 text-orange-400" />,
                      winRate: 50 + Math.random() * 20,
                      trades: Math.floor(Math.random() * 20) + 10,
                      avgPnL: Math.floor((Math.random() - 0.25) * 350),
                      color: "orange",
                      recommendation: "Mixed results",
                    },
                    {
                      condition: "Low Volume",
                      icon: <Wind className="w-6 h-6 text-slate-400" />,
                      winRate: 35 + Math.random() * 15,
                      trades: Math.floor(Math.random() * 15) + 5,
                      avgPnL: Math.floor((Math.random() - 0.45) * 200),
                      color: "slate",
                      recommendation: "AVOID - nejhorší edge",
                    },
                  ].map((market, idx) => (
                    <Card
                      key={idx}
                      className={cn(
                        "bg-slate-700/30 border-2",
                        market.color === "green" && "border-green-500/30",
                        market.color === "yellow" && "border-yellow-500/30",
                        market.color === "orange" && "border-orange-500/30",
                        market.color === "slate" && "border-red-500/30", // Changed to red for low volume warning
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {market.icon}
                          <div>
                            <h4 className="text-white font-bold text-sm">{market.condition}</h4>
                            <p className="text-gray-400 text-xs">{market.trades} trades</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Win Rate</span>
                            <Badge
                              className={cn(
                                "text-xs",
                                market.winRate >= 60
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : market.winRate >= 50
                                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    : "bg-red-500/20 text-red-300 border-red-500/30",
                              )}
                            >
                              {Math.round(market.winRate)}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Avg P&L</span>
                            <span
                              className={cn(
                                "font-bold text-sm",
                                market.avgPnL >= 0 ? "text-green-400" : "text-red-400",
                              )}
                            >
                              {market.avgPnL >= 0 ? "+" : ""}${market.avgPnL}
                            </span>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "p-2 rounded text-center text-xs font-semibold",
                            market.color === "green" && "bg-green-500/20 text-green-300",
                            market.color === "yellow" && "bg-yellow-500/20 text-yellow-300",
                            market.color === "orange" && "bg-orange-500/20 text-orange-300",
                            market.color === "slate" && "bg-red-500/20 text-red-300", // Changed to red for low volume warning
                          )}
                        >
                          {market.recommendation}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-bold text-base mb-2">🎯 Pattern Recommendation:</p>
                      <p className="text-white text-sm mb-2">
                        Tvoje performance je o 45% lepší v strong trending markets! Nauč se identifikovat trendy pomocí:
                      </p>
                      <ul className="text-gray-300 text-sm space-y-1 ml-4 list-disc">
                        <li>Moving averages alignment (20/50/200 EMA)</li>
                        <li>Higher highs & higher lows structure</li>
                        <li>Increased volume na směru trendu</li>
                        <li>Breakout z consolidation zones</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Recommendations */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl border-2 border-purple-400/30">
                    <TrendingUpDown className="w-10 h-10 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-white mb-3">🎯 Tvoje Trading Edge - Shrnutí</h3>

                    {/* CHANGE: Upravená Trading Edge Summary - vertikální layout pro lepší přehlednost */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                          <p className="text-sm text-gray-400 mb-2">Potenciální zlepšení</p>
                          <p className="text-4xl font-black text-cyan-300">+{15 + analysis.actionPlan.length * 5}%</p>
                        </div>

                        <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                          <p className="text-sm text-gray-400 mb-2">Časová investice</p>
                          <p className="text-4xl font-black text-purple-300">{analysis.actionPlan.length * 7} dní</p>
                        </div>

                        <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                          <p className="text-sm text-gray-400 mb-2">Priorita</p>
                          <p className="text-4xl font-black text-pink-300">VYSOKÁ</p>
                        </div>
                      </div>

                      <p className="text-center text-gray-200 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                        Implementací těchto psychologických změn můžeš výrazně zlepšit svou mentální kondici a trading
                        performance.
                        <span className="text-cyan-300 font-bold"> Focus on mindset = focus on results!</span> 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTION PLAN TAB */}
          <TabsContent value="action" className="space-y-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-400" />
                  Tvůj personalizovaný akční plán
                </CardTitle>
                <CardDescription className="text-gray-400">Konkrétní kroky pro zlepšení mindsetu</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.actionPlan.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.actionPlan.map((action: any, index: number) => (
                      <Card
                        key={index}
                        className={cn(
                          "bg-slate-700/50 border",
                          action.priority === "high" && "border-red-500/40",
                          action.priority === "medium" && "border-yellow-500/40",
                        )}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{action.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={priorityColors[action.priority]}>
                                  {action.priority === "high" && "⚠️ Vysoká priorita"}
                                  {action.priority === "medium" && "⚡ Střední priorita"}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                              <p className="text-gray-200 mb-3">{action.description}</p>
                              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 mb-3">
                                <div className="flex items-start gap-2">
                                  <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-purple-300 font-semibold text-sm mb-1">Konkrétní akce:</p>
                                    <p className="text-white">{action.action}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span className="text-cyan-300 font-medium text-sm">{action.impact}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Skvělá práce! 🎉</h3>
                    <p className="text-gray-400">Tvůj mindset je v perfektní kondici. Pokračuj!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Wins - Začni hned dnes
                </CardTitle>
                <CardDescription className="text-gray-400">Jednoduché kroky s okamžitým dopadem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { icon: "📊", text: "Trackuj mood PŘED každým trading session" },
                    { icon: "✍️", text: "Journal každý obchod do 1 hodiny po zavření" },
                    { icon: "😴", text: "Cíl: min. 7h spánku pro optimální performance" },
                    { icon: "🎯", text: "Po 2 ztrátách = 30min pauza (no exceptions!)" },
                    { icon: "🧘", text: "5min meditation před tradingem (game changer)" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500/30 transition-colors"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-white flex-1">{item.text}</p>
                      <CheckCircle2 className="w-5 h-5 text-green-400 opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* IMPROVED FINAL CARD - CLEANER DESIGN */}
            {analysis.actionPlan.length > 0 && (
              <Card className="relative overflow-hidden bg-slate-800/80 backdrop-blur-sm border-2 border-purple-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-cyan-600/10 to-purple-600/10" />
                <CardContent className="p-8 relative">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl border-2 border-purple-400/30">
                        <Brain className="w-10 h-10 text-purple-300" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-3xl font-black text-white mb-2">💪 Celkový Potenciál Zlepšení</h3>
                        <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 text-base px-4 py-1">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {analysis.actionPlan.length} konkrétních akcí
                        </Badge>
                      </div>
                    </div>

                    <p className="text-center text-gray-200 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                      Implementací těchto psychologických změn můžeš výrazně zlepšit svou mentální kondici a trading
                      performance.
                      <span className="text-cyan-300 font-bold"> Focus on mindset = focus on results!</span> 🚀
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                        <p className="text-sm text-gray-400 mb-2">Potenciální zlepšení</p>
                        <p className="text-4xl font-black text-cyan-300">+{15 + analysis.actionPlan.length * 5}%</p>
                      </div>
                      <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                        <p className="text-sm text-gray-400 mb-2">Časová investice</p>
                        <p className="text-4xl font-black text-purple-300">{analysis.actionPlan.length * 7} dní</p>
                      </div>
                      <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                        <p className="text-sm text-gray-400 mb-2">Priorita</p>
                        <p className="text-4xl font-black text-pink-300">VYSOKÁ</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
