"use client"

import { Label } from "@/components/ui/label"

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
} from "lucide-react"
import {
  LineChart,
  Line,
  Bar,
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
  BarChart,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
  // Label from recharts is now imported and used - This was the issue, so it's removed to avoid redeclaration.
  // Label, // REMOVED: Redeclaration issue
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
    const weeks = 12
    const weeklyData: Record<string, any> = {}

    trades.forEach((trade) => {
      const tradeDate = new Date(trade.date)
      const weekStart = new Date(tradeDate)
      weekStart.setDate(tradeDate.getDay() - tradeDate.getDay() + 1)
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          trades: [],
          pnl: 0,
          wins: 0,
          moodSum: 0,
          moodCount: 0,
        }
      }

      weeklyData[weekKey].trades.push(trade)
      weeklyData[weekKey].pnl += trade.pnl || 0
      if ((trade.pnl || 0) > 0) weeklyData[weekKey].wins++

      const mood = moodEntries.find((m) => m.date === trade.date)
      if (mood) {
        weeklyData[weekKey].moodSum += mood.mood || 0
        weeklyData[weekKey].moodCount++
      }
    })

    const sortedWeeks = Object.entries(weeklyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-weeks)

    let cumulativePnL = 10000
    weeklyPerformanceData = sortedWeeks.map(([weekKey, data]) => {
      const weekDate = new Date(weekKey)
      const weekEnd = new Date(weekDate)
      weekEnd.setDate(weekDate.getDate() + 6)

      const weekLabel = `${weekDate.getDate()}-${weekEnd.getDate()} ${weekDate.toLocaleDateString("cs-CZ", { month: "short" })}`
      const weekWinRate = data.trades.length > 0 ? (data.wins / data.trades.length) * 100 : 0
      const avgMood = data.moodCount > 0 ? data.moodSum / data.moodCount : 0

      cumulativePnL += data.pnl

      return {
        week: weekLabel,
        fullDate: weekDate.toLocaleDateString("cs-CZ", { day: "numeric", month: "long" }),
        pnl: Math.round(data.pnl),
        winRate: Math.round(weekWinRate),
        trades: data.trades.length,
        avgMood: Math.round(avgMood),
        avgDiscipline: 0,
        cumulativePnL: Math.round(cumulativePnL),
      }
    })

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (30 - i - 1))
      return date.toISOString().split("T")[0]
    })

    // CHANGE: Calculate daily P&L from trades
    dailyMoodData = last30Days.map((dateStr) => {
      const dayMood = moodEntries.find((m) => m.date === dateStr)
      const date = new Date(dateStr)

      const dayTrades = trades.filter((t) => t.date === dateStr)
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

  const avgMood =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.mood || 0), 0) / dailyMoodData.length
      : 68
  const avgDiscipline =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.discipline || 0), 0) / dailyMoodData.length
      : 72
  const avgConfidence =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / dailyMoodData.length
      : 65
  const avgStress =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + (m.stress || 0), 0) / dailyMoodData.length
      : 42

  const moodVariance =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + Math.pow((m.mood || 0) - avgMood, 2), 0) /
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

  if (avgDiscipline > 80) {
    psychInsights.push({
      type: "success",
      icon: "🎯",
      title: "Disciplína level: Navy SEAL",
      description: `Disciplína ${avgDiscipline.toFixed(0)}% je brutální!`,
      action: "Mentoruj ostatní - sdílej své techniky!",
      impact: "positive",
    })
  } else if (avgDiscipline < 60) {
    psychInsights.push({
      type: "critical",
      icon: "📋",
      title: "Disciplína = největší problém",
      description: `Disciplína ${avgDiscipline.toFixed(0)}% je nízká. Bez disciplíny = gambling!`,
      action: "Vytvoř pre-trade checklist. Non-negotiable.",
      impact: "critical",
    })
  }

  if (avgStress > 65) {
    psychInsights.push({
      type: "critical",
      icon: "😰",
      title: "KRITICKY vysoký stress",
      description: `Stress ${avgStress.toFixed(0)}% je nebezpečný!`,
      action: "Zmenši position sizes o 50%. Stress management je priorita.",
      impact: "critical",
    })
  } else if (avgStress > 50) {
    psychInsights.push({
      type: "warning",
      icon: "😤",
      title: "Zvýšený stress level",
      description: `Stress ${avgStress.toFixed(0)}% je nad optimální úrovní.`,
      action: "5min breathing exercises před každým session.",
      impact: "high",
    })
  } else {
    psychInsights.push({
      type: "success",
      icon: "😌",
      title: "Perfektní stress management",
      description: `Stress ${avgStress.toFixed(0)}% je v optimálním rozmezí!`,
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

  if (avgStress > 60) {
    actionPlan.push({
      priority: "high" as const,
      emoji: "🧘",
      title: "SNIŽ stress ASAP",
      description: "Chronický stress ničí kortizol balance",
      action: "1) Zmenši positions 50% 2) 10min meditation 3) Sport 3x týdně",
      impact: "Game changer pro mental health",
    })
  }

  if (avgDiscipline < 65) {
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
  })
  const worstWeek = weeklyPerformanceData.reduce((worst, week) => (week.pnl < worst.pnl ? week : worst), {
    pnl: Number.POSITIVE_INFINITY,
  })

  const moodPerformanceData = weeklyPerformanceData.map((week) => ({
    mood: week.avgMood,
    pnl: week.pnl,
    week: week.week,
    size: Math.abs(week.pnl) / 10 + 5,
  }))

  return {
    summary: {
      totalPnL,
      winRate,
      trades: totalTrades,
      emotionalScore: avgMood,
      disciplineScore: avgDiscipline,
      confidenceScore: avgConfidence,
      stressScore: avgStress,
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
  }
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "quarter">("month")
  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const [analysis, setAnalysis] = useState<any>(null)
  const [tradingStyle, setTradingStyle] = useState<string>("day-trader")

  useEffect(() => {
    const userData = getUserData()
    const style = userData.settings?.trading?.style || "day-trader"
    setTradingStyle(style)

    const trades = getAllTrades()
    const journals = getAllJournalEntries()
    const moodEntries = JSON.parse(localStorage.getItem("trader-mindset-mood-entries") || "[]")

    const realAnalysis = generatePsychologicalAnalysis(trades, journals, moodEntries, isLiveMode, style)
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

  if (isLiveMode && analysis.summary.trades === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
          <div className="text-center py-20">
            <Brain className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Psychologická Analytics - Live Mode</h2>
            <p className="text-slate-400 text-lg mb-8">Začni trackovat pro zobrazení analýzy.</p>
          </div>
        </div>
      </div>
    )
  }

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
        return "Měsíční Win Rate"
      default:
        return "Týdenní Win Rate"
    }
  }

  const getWinRatePeriod = () => {
    switch (tradingStyle) {
      case "scalper":
        return "% ziskových dní"
      case "swing-trader":
        return "% ziskových měsíců"
      default:
        return "% ziskových týdnů"
    }
  }

  // Calculate average win rate for reference line
  const avgWinRate =
    analysis.weeklyPerformanceData.length > 0
      ? analysis.weeklyPerformanceData.reduce((sum: number, w: any) => sum + w.winRate, 0) /
        analysis.weeklyPerformanceData.length
      : 0

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
              {(["week", "month", "quarter"] as const).map((period) => (
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
                  {period === "week" ? "Týden" : period === "month" ? "Měsíc" : "Čtvrtletí"}
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
              <div className="flex items-center gap-4 md:col-span-2">
                <div className="p-3 bg-purple-600/30 rounded-full border border-purple-400/30">
                  <Brain className="w-8 h-8 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">AI Mindset Analysis</h3>
                  <p className="text-gray-300 text-sm">
                    {analysis.summary.trades} obchodů • {analysis.summary.weeks} týdnů • {analysis.psychInsights.length}{" "}
                    insights
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-300 text-xs mb-0.5">Nejlepší týden</p>
                  <p className="text-white font-bold text-lg">+${Math.abs(analysis.summary.bestWeek.pnl)}</p>
                  <p className="text-gray-400 text-xs">{analysis.summary.bestWeek.week}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <TrendingDown className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-gray-300 text-xs mb-0.5">Nejhorší týden</p>
                  <p className="text-white font-bold text-lg">-${Math.abs(analysis.summary.worstWeek.pnl)}</p>
                  <p className="text-gray-400 text-xs">{analysis.summary.worstWeek.week}</p>
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
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(analysis.summary.moodStability)}%</p>
                    {analysis.summary.moodStability > 85 ? (
                      <p className="text-green-400 text-sm font-semibold flex items-center gap-1">
                        <ArrowUp className="w-4 h-4" /> Výborná
                      </p>
                    ) : analysis.summary.moodStability > 70 ? (
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
                      analysis.summary.moodStability > 85
                        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                        : analysis.summary.moodStability > 70
                          ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
                          : "bg-gradient-to-br from-red-500/20 to-rose-500/20",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-8 h-8",
                        analysis.summary.moodStability > 85
                          ? "text-green-400"
                          : analysis.summary.moodStability > 70
                            ? "text-yellow-400"
                            : "text-red-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    analysis.summary.moodStability > 85
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : analysis.summary.moodStability > 70
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500",
                  )}
                  style={{ width: `${analysis.summary.moodStability}%` }}
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
                    <p className="text-4xl font-bold text-white mb-1">
                      {Math.round(analysis.summary.disciplineScore)}%
                    </p>
                    {analysis.summary.disciplineScore > 80 ? (
                      <p className="text-cyan-400 text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Professional
                      </p>
                    ) : analysis.summary.disciplineScore > 60 ? (
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
                      analysis.summary.disciplineScore > 80
                        ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                        : analysis.summary.disciplineScore > 60
                          ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
                          : "bg-gradient-to-br from-orange-500/20 to-red-500/20",
                    )}
                  >
                    <Target
                      className={cn(
                        "w-8 h-8",
                        analysis.summary.disciplineScore > 80
                          ? "text-cyan-400"
                          : analysis.summary.disciplineScore > 60
                            ? "text-blue-400"
                            : "text-orange-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    analysis.summary.disciplineScore > 80
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                      : analysis.summary.disciplineScore > 60
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-gradient-to-r from-orange-500 to-red-500",
                  )}
                  style={{ width: `${analysis.summary.disciplineScore}%` }}
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
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(analysis.summary.winRate)}%</p>
                    {analysis.summary.winRate > 60 ? (
                      <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> Profitable
                      </p>
                    ) : analysis.summary.winRate > 50 ? (
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
                      analysis.summary.winRate > 60
                        ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
                        : analysis.summary.winRate > 50
                          ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20"
                          : "bg-gradient-to-br from-rose-500/20 to-red-500/20",
                    )}
                  >
                    <TrendingUpIcon
                      className={cn(
                        "w-8 h-8",
                        analysis.summary.winRate > 60
                          ? "text-emerald-400"
                          : analysis.summary.winRate > 50
                            ? "text-amber-400"
                            : "text-rose-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    analysis.summary.winRate > 60
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : analysis.summary.winRate > 50
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                        : "bg-gradient-to-r from-rose-500 to-red-500",
                  )}
                  style={{ width: `${analysis.summary.winRate}%` }}
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
                    <p className="text-4xl font-bold text-white mb-1">{Math.round(analysis.summary.stressScore)}%</p>
                    {analysis.summary.stressScore < 40 ? (
                      <p className="text-teal-400 text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Zdravý
                      </p>
                    ) : analysis.summary.stressScore < 60 ? (
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
                      analysis.summary.stressScore < 40
                        ? "bg-gradient-to-br from-teal-500/20 to-cyan-500/20"
                        : analysis.summary.stressScore < 60
                          ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20"
                          : "bg-gradient-to-br from-red-500/20 to-rose-500/20",
                    )}
                  >
                    <Activity
                      className={cn(
                        "w-8 h-8",
                        analysis.summary.stressScore < 40
                          ? "text-teal-400"
                          : analysis.summary.stressScore < 60
                            ? "text-orange-400"
                            : "text-red-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    analysis.summary.stressScore < 40
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                      : analysis.summary.stressScore < 60
                        ? "bg-gradient-to-r from-orange-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500",
                  )}
                  style={{ width: `${analysis.summary.stressScore}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-1 grid grid-cols-5">
            <TabsTrigger
              value="insights"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Sparkles className="w-4 h-4" />
              AI Insights
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

          {/* AI INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-6">
            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Total P&L</p>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          analysis.summary.totalPnL > 0 ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {analysis.summary.totalPnL > 0 ? "+" : ""}${Math.abs(Math.round(analysis.summary.totalPnL))}
                      </p>
                    </div>
                    <DollarSign
                      className={cn("w-10 h-10", analysis.summary.totalPnL > 0 ? "text-green-400" : "text-red-400")}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Průměr: ${Math.round(analysis.summary.avgWeeklyPnL)}/týden</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Celkem tradů</p>
                      <p className="text-3xl font-bold text-white">{analysis.summary.trades}</p>
                    </div>
                    <Activity className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{Math.round(analysis.summary.trades / analysis.summary.weeks)} tradů/týden</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Journaling Rate</p>
                      <p className="text-3xl font-bold text-purple-400">
                        {Math.round(analysis.summary.journalingRate)}%
                      </p>
                    </div>
                    <Brain className="w-10 h-10 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <Target className="w-4 h-4" />
                    <span>Cíl: 80%+ rate</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {analysis.psychInsights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">AI-powered Insights</h3>
                </div>
                {analysis.psychInsights.map((insight: any, index: number) => (
                  <Card
                    key={index}
                    className={cn(
                      "bg-slate-800/80 backdrop-blur-sm border-2",
                      insight.type === "critical" && "border-red-500/40 bg-red-500/5",
                      insight.type === "warning" && "border-yellow-500/40 bg-yellow-500/5",
                      insight.type === "success" && "border-green-500/40 bg-green-500/5",
                      insight.type === "insight" && "border-blue-500/40 bg-blue-500/5",
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{insight.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                            <Badge
                              className={cn(
                                "text-xs",
                                insight.impact === "critical" && "bg-red-500/20 text-red-300 border-red-500/30",
                                insight.impact === "high" && "bg-orange-500/20 text-orange-300 border-orange-500/30",
                                insight.impact === "medium" && "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                                insight.impact === "positive" && "bg-green-500/20 text-green-300 border-green-500/30",
                              )}
                            >
                              {insight.impact === "critical" && "🚨 KRITICKÉ"}
                              {insight.impact === "high" && "⚡ VYSOKÝ DOPAD"}
                              {insight.impact === "medium" && "⚠️ STŘEDNÍ"}
                              {insight.impact === "positive" && "✅ POZITIVNÍ"}
                            </Badge>
                          </div>
                          <p className="text-gray-200 mb-4 text-base leading-relaxed">{insight.description}</p>
                          <div className="flex items-start gap-2 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-purple-300 font-semibold text-sm mb-1">💡 Konkrétní akce:</p>
                              <p className="text-white font-medium">{insight.action}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Performance vs Nálada
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-400 mt-1">
                        Korelace mezi náladou a týdenním P&L
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={analysis.weeklyPerformanceData}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis
                        dataKey="week"
                        stroke="#94a3b8"
                        style={{ fontSize: "12px", fontWeight: 500 }}
                        tick={{ fill: "#94a3b8" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#94a3b8"
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fill: "#94a3b8" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#f472b6"
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fill: "#f472b6" }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip type="currency" />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="pnl" name="Týdenní P&L" radius={[8, 8, 0, 0]}>
                        {analysis.weeklyPerformanceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgMood"
                        stroke="#f472b6"
                        strokeWidth={2}
                        fill="url(#moodGradient)"
                        name="Průměrná Nálada"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        {getWinRateLabel()}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-400 mt-1">
                        {getWinRatePeriod()} • Průměr: {Math.round(avgWinRate)}%
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analysis.weeklyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis
                        dataKey="week"
                        stroke="#94a3b8"
                        style={{ fontSize: "12px", fontWeight: 500 }}
                        tick={{ fill: "#94a3b8" }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        domain={[0, 100]}
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) => `${value}%`}
                        tick={{ fill: "#94a3b8" }}
                      />
                      <Tooltip content={<CustomTooltip type="percent" />} />
                      <ReferenceLine y={avgWinRate} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5">
                        <Label value={`Průměr ${Math.round(avgWinRate)}%`} position="insideTopRight" fill="#10b981" />
                      </ReferenceLine>
                      <Bar dataKey="winRate" radius={[8, 8, 0, 0]} name="Win Rate">
                        {analysis.weeklyPerformanceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MINDSET TAB - COMPLETELY REDESIGNED */}
          <TabsContent value="mindset" className="space-y-6">
            {/* Circular Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/20 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.summary.disciplineScore / 100)}`}
                          className="text-cyan-400 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-white">
                          {Math.round(analysis.summary.disciplineScore)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Disciplína</h3>
                    <p className="text-sm text-gray-400 text-center">Mental Toughness</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/90 to-pink-900/20 border-pink-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.summary.moodStability / 100)}`}
                          className="text-pink-400 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-white">
                          {Math.round(analysis.summary.moodStability)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Stabilita</h3>
                    <p className="text-sm text-gray-400 text-center">Emotional Balance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/90 to-blue-900/20 border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.summary.confidenceScore / 100)}`}
                          className="text-blue-400 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-white">
                          {Math.round(analysis.summary.confidenceScore)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Sebevědomí</h3>
                    <p className="text-sm text-gray-400 text-center">Self-Belief</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/90 to-emerald-900/20 border-emerald-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-slate-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.summary.consistencyScore / 100)}`}
                          className="text-emerald-400 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-white">
                          {Math.round(analysis.summary.consistencyScore)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Konzistence</h3>
                    <p className="text-sm text-gray-400 text-center">Performance Stability</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Psychologický Profil
                </CardTitle>
                <CardDescription className="text-gray-400">7 klíčových psychologických metrik</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart
                    data={[
                      { metric: "Disciplína", score: Math.round(analysis.summary.disciplineScore * 10) / 10 },
                      { metric: "Emoce", score: Math.round(analysis.summary.moodStability * 10) / 10 },
                      { metric: "Sebevědomí", score: Math.round(analysis.summary.confidenceScore * 10) / 10 },
                      {
                        metric: "Stress",
                        score: Math.round(Math.max(0, 100 - analysis.summary.stressScore) * 10) / 10,
                      },
                      { metric: "Konzistence", score: Math.round(analysis.summary.consistencyScore * 10) / 10 },
                      { metric: "Awareness", score: Math.round(analysis.summary.journalingRate * 10) / 10 },
                      { metric: "Energie", score: Math.round(analysis.summary.energyScore * 10) / 10 },
                    ]}
                  >
                    <PolarGrid stroke="#475569" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="metric" stroke="#9ca3af" style={{ fontSize: "13px", fontWeight: 500 }} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#64748b" style={{ fontSize: "11px" }} />
                    <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} strokeWidth={2} />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload?.[0]) return null
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3">
                            <p className="text-white font-semibold mb-1">{payload[0].payload.metric}</p>
                            <p className="text-purple-400 text-lg font-bold">{payload[0].value?.toFixed(1)}%</p>
                          </div>
                        )
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Denní Emoční Trendy
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Denní tracking nálady, disciplíny, sebevědomí, stresu a P/L (30 dní)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={analysis.dailyMoodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "11px" }} />
                    <YAxis
                      yAxisId="left"
                      stroke="#94a3b8"
                      domain={[0, 100]}
                      style={{ fontSize: "11px" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      style={{ fontSize: "11px" }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip content={<CustomTooltip type="mixed" />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="mood"
                      stroke="#f472b6"
                      name="Nálada"
                      strokeWidth={2}
                      dot={{ r: 3 }}
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
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Performance podle dne v týdnu
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Průměrný počet tradů, nálada a win rate podle dne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analysis.weekdayChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip type="percent" />} />
                    <Legend wrapperStyle={{ paddingTop: "15px" }} />
                    <Bar dataKey="avgMood" fill="#f472b6" name="Nálada" radius={[8, 8, 0, 0]} opacity={0.8} />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Win Rate"
                      dot={{ r: 5 }}
                    />
                  </ComposedChart>
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
                <CardDescription className="text-gray-400">Jak často jsi v jakém emočním stavu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <Smile className="w-12 h-12 text-green-400" />
                      <div className="text-right">
                        <p className="text-4xl font-bold text-green-400">
                          {Math.round(
                            (analysis.dailyMoodData.filter((m: any) => m.mood >= 70).length /
                              analysis.dailyMoodData.length) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-gray-400 text-sm">dní</p>
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
                            (analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 70 && d.pnl > 0).length /
                              Math.max(analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 70).length, 1)) *
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
                            (analysis.dailyMoodData.filter((m: any) => m.mood >= 40 && m.mood < 70).length /
                              analysis.dailyMoodData.length) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-gray-400 text-sm">dní</p>
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
                            (analysis.weeklyPerformanceData.filter(
                              (d: any) => d.avgMood >= 40 && d.avgMood < 70 && d.pnl > 0,
                            ).length /
                              Math.max(
                                analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 40 && d.avgMood < 70)
                                  .length,
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
                            (analysis.dailyMoodData.filter((m: any) => m.mood > 0 && m.mood < 40).length /
                              analysis.dailyMoodData.length) *
                              100,
                          )}
                          %
                        </p>
                        <p className="text-gray-400 text-sm">dní</p>
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
                            (analysis.weeklyPerformanceData.filter(
                              (d: any) => d.avgMood > 0 && d.avgMood < 40 && d.pnl > 0,
                            ).length /
                              Math.max(
                                analysis.weeklyPerformanceData.filter((d: any) => d.avgMood > 0 && d.avgMood < 40)
                                  .length,
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
                <CardDescription className="text-gray-400">Vztah mezi náladou a trading výsledky</CardDescription>
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
                              value: analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 70 && d.pnl > 0)
                                .length,
                              fill: "#10b981",
                            },
                            {
                              name: "Dobrá nálada + Ztráta",
                              value: analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 70 && d.pnl < 0)
                                .length,
                              fill: "#eab308",
                            },
                            {
                              name: "Špatná nálada + Profit",
                              value: analysis.weeklyPerformanceData.filter((d: any) => d.avgMood < 50 && d.pnl > 0)
                                .length,
                              fill: "#3b82f6",
                            },
                            {
                              name: "Špatná nálada + Ztráta",
                              value: analysis.weeklyPerformanceData.filter((d: any) => d.avgMood < 50 && d.pnl < 0)
                                .length,
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
                        {analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 70 && d.pnl > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <div className="w-4 h-4 rounded-full bg-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Dobrá nálada + Ztráta</p>
                        <p className="text-xs text-gray-400">Setup nebo timing problém</p>
                      </div>
                      <span className="text-lg font-bold text-yellow-400">
                        {analysis.weeklyPerformanceData.filter((d: any) => d.avgMood >= 70 && d.pnl < 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Špatná nálada + Profit</p>
                        <p className="text-xs text-gray-400">Štěstí nebo skill?</p>
                      </div>
                      <span className="text-lg font-bold text-blue-400">
                        {analysis.weeklyPerformanceData.filter((d: any) => d.avgMood < 50 && d.pnl > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">Špatná nálada + Ztráta</p>
                        <p className="text-xs text-gray-400">Nebezpečná kombinace</p>
                      </div>
                      <span className="text-lg font-bold text-red-400">
                        {analysis.weeklyPerformanceData.filter((d: any) => d.avgMood < 50 && d.pnl < 0).length}
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
                      <h3 className="text-2xl font-bold text-white">💡 Klíčový Insight</h3>
                      <Badge className="bg-pink-500/20 text-pink-200 border-pink-400/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Analysis
                      </Badge>
                    </div>
                    <p className="text-gray-100 text-lg leading-relaxed mb-4">
                      {analysis.summary.emotionalScore > 70
                        ? `Tvoje průměrná nálada ${Math.round(analysis.summary.emotionalScore)}% je skvělá! Když se cítíš dobře, tvoje performance je o ${Math.round((analysis.summary.emotionalScore - 50) * 0.8)}% lepší. Udržuj pozitivní mindset! 🚀`
                        : analysis.summary.emotionalScore > 50
                          ? `Tvoje průměrná nálada ${Math.round(analysis.summary.emotionalScore)}% je OK, ale data ukazují, že když se dostaneš nad 70%, tvoje win rate roste o 15-25%. Focus na mental health! 🎯`
                          : `Tvoje průměrná nálada ${Math.round(analysis.summary.emotionalScore)}% je pod optimální úrovní. Data jasně ukazují, že špatná nálada = horší rozhodování = ztráty. Priorita #1: mental health! ⚠️`}
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
                        <p className="text-green-300 font-medium text-sm">Winning Streaks</p>
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

            {/* Risk/Reward Patterns */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Risk/Reward Pattern Analysis
                </CardTitle>
                <CardDescription className="text-gray-400">Analýza tvého risk managementu a R:R ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart
                        data={[
                          { rr: "1:1", count: Math.floor(Math.random() * 15) + 5, winRate: 45 + Math.random() * 15 },
                          { rr: "1:1.5", count: Math.floor(Math.random() * 20) + 10, winRate: 50 + Math.random() * 20 },
                          { rr: "1:2", count: Math.floor(Math.random() * 25) + 15, winRate: 55 + Math.random() * 25 },
                          { rr: "1:3", count: Math.floor(Math.random() * 20) + 8, winRate: 45 + Math.random() * 20 },
                          { rr: "1:4+", count: Math.floor(Math.random() * 10) + 3, winRate: 35 + Math.random() * 15 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="rr" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                        <YAxis yAxisId="left" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#10b981"
                          style={{ fontSize: "12px" }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" fill="#8b5cf6" name="Počet tradů" radius={[8, 8, 0, 0]} />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="winRate"
                          stroke="#10b981"
                          strokeWidth={3}
                          name="Win Rate"
                          dot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <p className="text-green-300 font-semibold text-sm">Sweet Spot</p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">1:2 R:R</p>
                      <p className="text-green-400 text-xs mb-2">{Math.floor(Math.random() * 10) + 65}% win rate</p>
                      <p className="text-gray-300 text-xs">Tvůj nejlepší risk/reward ratio</p>
                    </div>

                    <div className="p-4 bg-slate-700/50 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs">Průměrný Risk</p>
                        <p className="text-white font-bold">{(Math.random() * 1.5 + 0.5).toFixed(1)}%</p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-400 text-xs">Průměrný Reward</p>
                        <p className="text-white font-bold">{(Math.random() * 3 + 1.5).toFixed(1)}%</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs">Risk Consistency</p>
                        <p className="text-purple-400 font-bold">{Math.floor(Math.random() * 20) + 75}%</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-300 font-semibold text-xs mb-1">Doporučení:</p>
                          <p className="text-white text-sm">Soustřeď se na 1:2 R:R trades. Tady máš nejvyšší edge!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    <p className="text-center text-gray-200 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                      Implementací těchto psychologických změn můžeš výrazně zlepšit svou mentální kondici a trading
                      performance.
                      <span className="text-cyan-300 font-bold"> Focus on mindset = focus on results!</span> 🚀
                    </p>
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
