"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Heart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Save,
  Activity,
  Zap,
  Award,
  BookOpen,
  Download,
  Flame,
  Shield,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Clock,
} from "lucide-react"
import { getJournalEntries, getMoodEntries, getUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ComposedChart,
  Line,
} from "recharts"
import { cn } from "@/lib/utils"

interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  createdAt: string

  // Performance Summary
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  bestTrade: number
  worstTrade: number
  avgMood: number
  avgReadiness: number

  // Reflections
  whatWorked: string
  whatDidntWork: string
  biggestWin: string
  biggestLoss: string
  emotionalPatterns: string
  mistakesMade: string
  lessonsLearned: string

  // Next Week Planning
  weeklyGoals: string[]
  focusAreas: string[]
  tradingPlanAdjustments: string
  riskManagementNotes: string
  mindsetPreparation: string

  // Hero KPIs
  mindPointsGained: number
  currentStreak: number
  lossResets: number
  revengeIncidents: number

  // Charts Data
  dailyData: any[]
  sleepData: any[]
  aiInsights: any[]
  avgSleep?: number // Added for virtual mode
}

export default function WeeklyReviewPage() {
  const { isLiveMode } = useData()
  const [currentWeekData, setCurrentWeekData] = useState<any>(null)
  const [review, setReview] = useState<Partial<WeeklyReview>>({
    whatWorked: "",
    whatDidntWork: "",
    biggestWin: "",
    biggestLoss: "",
    emotionalPatterns: "",
    mistakesMade: "",
    lessonsLearned: "",
    weeklyGoals: ["", "", ""],
    focusAreas: ["", "", ""],
    tradingPlanAdjustments: "",
    riskManagementNotes: "",
    mindsetPreparation: "",
  })
  const [savedReviews, setSavedReviews] = useState<WeeklyReview[]>([])
  const [actionPlan, setActionPlan] = useState<{ text: string; completed: boolean }[]>([
    { text: "", completed: false },
    { text: "", completed: false },
    { text: "", completed: false },
  ])

  useEffect(() => {
    if (!isLiveMode) {
      loadVirtualData()
    } else {
      loadWeekData()
    }
    loadSavedReviews()
  }, [isLiveMode])

  const loadVirtualData = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDay() === 0 ? today.getDate() - 6 : today.getDate() - today.getDay() + 1) // Adjust for Sunday start
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    // Generování náhodných realistických dat
    const dailyData = [
      {
        day: "Po",
        date: "2025-01-06",
        pnl: 125,
        trades: 3,
        mood: 75,
        readiness: 82,
        sleep: 7.5,
        session: "London",
      },
      {
        day: "Út",
        date: "2025-01-07",
        pnl: -45,
        trades: 2,
        mood: 60,
        readiness: 68,
        sleep: 6.2,
        session: "New York",
      },
      {
        day: "St",
        date: "2025-01-08",
        pnl: 210,
        trades: 4,
        mood: 85,
        readiness: 88,
        sleep: 8.0,
        session: "London",
      },
      {
        day: "Čt",
        date: "2025-01-09",
        pnl: -120,
        trades: 5,
        mood: 45,
        readiness: 55,
        sleep: 5.8,
        session: "Asian",
      },
      {
        day: "Pá",
        date: "2025-01-10",
        pnl: 85,
        trades: 2,
        mood: 70,
        readiness: 75,
        sleep: 7.2,
        session: "London",
      },
      { day: "So", date: "2025-01-11", pnl: 0, trades: 0, mood: 80, readiness: 0, sleep: 8.5, session: "-" },
      { day: "Ne", date: "2025-01-12", pnl: 0, trades: 0, mood: 85, readiness: 0, sleep: 8.0, session: "-" },
    ]

    const totalPnL = dailyData.reduce((sum, d) => sum + d.pnl, 0)
    const totalTrades = dailyData.reduce((sum, d) => sum + d.trades, 0)
    const winningTrades = dailyData.filter((d) => d.pnl > 0).length
    const losingTrades = dailyData.filter((d) => d.pnl < 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const bestTrade = Math.max(...dailyData.map((d) => d.pnl))
    const worstTrade = Math.min(...dailyData.map((d) => d.pnl))
    const avgMood = dailyData.reduce((sum, d) => sum + d.mood, 0) / dailyData.length
    const avgReadiness =
      dailyData.filter((d) => d.readiness > 0).reduce((sum, d) => sum + d.readiness, 0) /
      dailyData.filter((d) => d.readiness > 0).length
    const avgSleep = dailyData.reduce((sum, d) => sum + d.sleep, 0) / dailyData.length

    const mindPointsGained = 450
    const currentStreak = 12
    const lossResets = 2
    const revengeIncidents = 1

    // AI Insights založené na demo datech
    const aiInsights = [
      {
        type: "success",
        title: "London Session = Profit Zone",
        description:
          "Trady během London session měly 100% win rate s průměrným ziskem +140 pips. Pondělí a středa byly tvoje nejlepší dny.",
        action:
          "FOCUS: Prioritizuj London session (8:00-12:00). Tvoje strategie tam funguje perfektně. Vyhni se Asian session.",
      },
      {
        type: "critical",
        title: "Nedostatek spánku = Revenge Trading",
        description:
          "Ve čtvrtek jsi spal pouze 5.8h a následně udělal 5 tradů s -120 pips ztrátou. Readiness byla 55% - pod kritickou hranicí.",
        action:
          "PRAVIDLO: Neobchoduj pod 65% readiness. Čtvrtek byl jasný příklad proč. Nastav alarm pokud readiness < 65%.",
      },
      {
        type: "warning",
        title: "Overtrading po ztrátě",
        description:
          "Po úterní ztrátě -45 pips jsi ve čtvrtek udělal 5 tradů (nejvíc v týdnu) a ztratil dalších -120 pips. Klasický revenge pattern.",
        action: "STOP LOSS PRO PSYCHIKU: Po ztrátovém dni max 2 trady následující den. Dej si čas na reset.",
      },
      {
        type: "success",
        title: "Vysoká readiness = Vysoký výkon",
        description:
          "Středa: 88% readiness, 8h spánku → +210 pips (nejlepší den). Pondělí: 82% readiness, 7.5h spánku → +125 pips.",
        action:
          "PATTERN POTVRZENÝ: Když readiness > 80% a spánek > 7h, tvůj win rate je 100%. Čekej na tyto dny pro větší pozice.",
      },
      {
        type: "warning",
        title: "Asian Session není tvoje",
        description:
          "Jediný trade během Asian session (čtvrtek) skončil -120 pips ztrátou. Nízká volatilita + únava = špatná kombinace.",
        action: "BLACKLIST: Asian session (22:00-6:00) je pro tebe zakázaná. Drž se London a NY.",
      },
    ]

    // Demo trades pro detailní analýzu
    const demoTrades = [
      {
        pair: "EUR/USD",
        type: "Long",
        pips: 45,
        session: "London",
        emotion: "Klidný",
        readiness: 82,
        result: "win",
        notes: "Perfektní setup, čekal jsem na pullback",
      },
      {
        pair: "GBP/JPY",
        type: "Short",
        pips: -32,
        session: "Asian",
        emotion: "Stresovaný",
        readiness: 55,
        result: "loss",
        notes: "Revenge trade po předchozí ztrátě, porušil jsem risk management",
      },
      {
        pair: "USD/JPY",
        type: "Long",
        pips: 68,
        session: "London",
        emotion: "Sebevědomý",
        readiness: 88,
        result: "win",
        notes: "Skvělý entry, držel jsem podle plánu",
      },
    ]

    // Předvyplněné reflexe pro demo
    setReview({
      whatWorked:
        "London session byla moje profit zone - 100% win rate. Když jsem měl readiness nad 80% a spal 7+ hodin, trady fungovaly perfektně. Čekání na správný setup místo forcování tradů.",
      whatDidntWork:
        "Asian session byla katastrofa - nízká volatilita a únava vedly k -120 pips ztrátě. Revenge trading po úterní ztrátě - udělal jsem 5 tradů ve čtvrtek místo 2-3 kvalitních.",
      biggestWin:
        "Středa, EUR/USD long, +68 pips. Měl jsem 88% readiness, spal 8h, čekal jsem trpělivě na pullback a držel podle plánu. Perfektní exekuce.",
      biggestLoss:
        "Čtvrtek, GBP/JPY short, -32 pips. Revenge trade po předchozí ztrátě, readiness pouze 55%, spal jsem 5.8h. Porušil jsem risk management a vstoupil impulzivně.",
      emotionalPatterns:
        "Po ztrátách mám tendenci k revenge tradingu - viditelné ve čtvrtek. Když jsem klidný a vyspalý (pondělí, středa), rozhodování je racionální. Stres a únava = impulzivní rozhodnutí.",
      mistakesMade:
        "1) Obchodoval jsem s readiness pod 65% (čtvrtek)\n2) Revenge trading - 5 tradů po ztrátovém dni\n3) Asian session trade přes únavu\n4) Porušil jsem risk management na GBP/JPY",
      lessonsLearned:
        "Data jasně ukazují: readiness > 80% + spánek > 7h = profit. London session je moje zona, Asian ne. Po ztrátovém dni max 2 trady. Nikdy neobchodovat pod 65% readiness.",
      weeklyGoals: [
        "Obchodovat pouze s readiness 70%+",
        "Max 3 trady denně, kvalita > kvantita",
        "Žádné trady během Asian session",
      ],
      focusAreas: [
        "London session (8:00-12:00) - moje profit zone",
        "Spánek 7+ hodin každou noc",
        "Stop loss pro psychiku: po ztrátě max 2 trady další den",
      ],
      tradingPlanAdjustments:
        "Přidat pravidlo: Neobchodovat pod 65% readiness (automatický alarm). Blacklist Asian session. Po ztrátovém dni max 2 trady. Zvýšit position size pouze při readiness 85%+.",
      riskManagementNotes:
        "Čtvrtek ukázal důležitost stop loss pro psychiku. Implementovat: 1) Max 2% risk per trade, 2) Max 6% daily loss limit, 3) Po dosažení daily loss STOP - žádné další trady.",
      mindsetPreparation:
        "Každé ráno: Morning Check před 8:00. Pokud readiness < 70%, den bez tradingu. Meditace 10min před London session. Po každém tradu: 5min pauza + journaling.",
    })

    setActionPlan([
      { text: "Nastavit alarm pro readiness < 65% - automatický STOP trading", completed: false },
      { text: "Blacklist Asian session v trading platformě", completed: false },
      { text: "Implementovat 'Stop Loss pro Psychiku': po ztrátě max 2 trady další den", completed: false },
    ])

    setCurrentWeekData({
      weekStart: weekStart.toLocaleDateString("cs-CZ"),
      weekEnd: weekEnd.toLocaleDateString("cs-CZ"),
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnL,
      bestTrade,
      worstTrade,
      avgMood,
      avgReadiness,
      mindPointsGained,
      currentStreak,
      lossResets,
      revengeIncidents,
      dailyData,
      sleepData: dailyData.map((d) => ({ date: d.date, sleep: d.sleep, readiness: d.readiness })),
      trades: demoTrades,
      aiInsights,
      avgSleep,
    })
  }

  const loadWeekData = () => {
    const entries = getJournalEntries()
    const moodEntries = getMoodEntries()
    const userData = getUserData()

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDay() === 0 ? today.getDate() - 6 : today.getDay() - 1) // Adjust for Sunday start
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weekTrades = entries.filter((e) => {
      const tradeDate = new Date(e.date)
      return e.type === "trade" && tradeDate >= weekStart && tradeDate <= weekEnd
    })

    const weekMoods = moodEntries.filter((m) => {
      const moodDate = new Date(m.date)
      return moodDate >= weekStart && moodDate <= weekEnd
    })

    const morningChecks = entries.filter((e) => {
      const date = new Date(e.date)
      return e.readiness && date >= weekStart && date <= weekEnd
    })

    const avgReadiness =
      morningChecks.length > 0
        ? morningChecks.reduce((sum, e) => sum + (e.readiness || 0), 0) / morningChecks.length
        : 0

    const mindPointsGained = userData.xp || 0 // This week's XP
    const currentStreak = userData.streak || 0
    const lossResets = entries.filter((e) => e.type === "loss-reset" && new Date(e.date) >= weekStart).length
    const revengeIncidents = weekTrades.filter(
      (t) => t.tags?.includes("revenge") || t.emotionBefore === "Naštvaný",
    ).length

    const sleepData = morningChecks.map((e) => ({
      date: e.date,
      sleep: e.sleepHours || 0,
      readiness: e.readiness || 0,
    }))

    const revengeTradesWithSleep = weekTrades
      .filter((t) => t.tags?.includes("revenge") || t.emotionBefore === "Naštvaný")
      .map((t) => {
        const morning = morningChecks.find((m) => m.date === t.date)
        return {
          sleep: morning?.sleepHours || 0,
          isRevenge: true,
        }
      })

    const avgSleepOnRevengeDays =
      revengeTradesWithSleep.length > 0
        ? revengeTradesWithSleep.reduce((sum, t) => sum + t.sleep, 0) / revengeTradesWithSleep.length
        : 0

    const avgSleepOverall =
      morningChecks.length > 0
        ? morningChecks.reduce((sum, e) => sum + (e.sleepHours || 0), 0) / morningChecks.length
        : 0

    const revengeSleepDiff = avgSleepOverall - avgSleepOnRevengeDays

    const totalPnL = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winningTrades = weekTrades.filter((t) => (t.pnl || 0) > 0).length
    const losingTrades = weekTrades.filter((t) => (t.pnl || 0) < 0).length
    const winRate = weekTrades.length > 0 ? (winningTrades / weekTrades.length) * 100 : 0

    const bestTrade = weekTrades.length > 0 ? Math.max(...weekTrades.map((t) => t.pnl || 0)) : 0
    const worstTrade = weekTrades.length > 0 ? Math.min(...weekTrades.map((t) => t.pnl || 0)) : 0

    const avgMood = weekMoods.length > 0 ? weekMoods.reduce((sum, m) => sum + m.mood, 0) / weekMoods.length : 0

    const dailyData = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]

      const dayTrades = weekTrades.filter((t) => t.date === dateStr)
      const dayMood = weekMoods.find((m) => m.date === dateStr)
      const dayMorning = morningChecks.find((m) => m.date === dateStr)

      dailyData.push({
        day: ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"][i],
        date: dateStr,
        pnl: dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
        trades: dayTrades.length,
        mood: dayMood?.mood || 0,
        readiness: dayMorning?.readiness || 0,
        sleep: dayMorning?.sleepHours || 0,
      })
    }

    const aiInsights = []

    if (revengeIncidents > 0 && revengeSleepDiff > 0.5) {
      const revengeReduction = Math.round((revengeSleepDiff / avgSleepOverall) * 100)
      aiInsights.push({
        type: "critical",
        title: "Spánek vs Revenge Trading",
        description: `Když spíš méně než ${avgSleepOverall.toFixed(1)}h, revenge trading se zvyšuje o ${revengeReduction}%. Tento týden jsi měl ${revengeIncidents} revenge tradů.`,
        action:
          "Prioritizuj 7+ hodin spánku. Data jasně ukazují korelaci mezi nedostatkem spánku a impulzivními rozhodnutími.",
      })
    }

    const highReadinessDays = dailyData.filter((d) => d.readiness >= 70)
    const lowReadinessDays = dailyData.filter((d) => d.readiness < 70)
    const avgPnLHighReadiness =
      highReadinessDays.length > 0 ? highReadinessDays.reduce((sum, d) => sum + d.pnl, 0) / highReadinessDays.length : 0
    const avgPnLLowReadiness =
      lowReadinessDays.length > 0 ? lowReadinessDays.reduce((sum, d) => sum + d.pnl, 0) / lowReadinessDays.length : 0

    if (highReadinessDays.length > 0 && lowReadinessDays.length > 0 && avgPnLHighReadiness > avgPnLLowReadiness) {
      const performanceDiff = Math.round(
        ((avgPnLHighReadiness - avgPnLLowReadiness) / Math.abs(avgPnLLowReadiness)) * 100,
      )
      aiInsights.push({
        type: "success",
        title: "Readiness = Profit",
        description: `Dny s readiness 70%+ mají o ${performanceDiff}% lepší výkon než dny pod 70%. Tvoje průměrná readiness tento týden: ${Math.round(avgReadiness)}%.`,
        action: "Neobchoduj pod 65% readiness. Data to potvrzují - čekej na správný den.",
      })
    }

    if (winRate < 50 && weekTrades.length >= 5) {
      aiInsights.push({
        type: "warning",
        title: "Win Rate pod 50%",
        description: `Win rate ${Math.round(winRate)}% je pod break-even. ${losingTrades} ztrátových tradů vs ${winningTrades} výherních.`,
        action: "STOP. Zmenši position size o 50% a vrať se k backtestingu. Něco v setupu nefunguje.",
      })
    } else if (winRate >= 60) {
      aiInsights.push({
        type: "success",
        title: "Konzistentní Win Rate",
        description: `Win rate ${Math.round(winRate)}% je skvělý! ${winningTrades} výherních tradů tento týden.`,
        action: "Pokračuj v tomto setupu. Dokumentuj přesně co děláš - funguje to.",
      })
    }

    if (currentStreak >= 7) {
      aiInsights.push({
        type: "success",
        title: `${currentStreak} denní streak!`,
        description: `Konzistence je klíč k úspěchu. Udržuješ ${currentStreak} denní streak - to je v top 5% traderů.`,
        action: "Sdílej své techniky s komunitou. Tvoje disciplína je inspirativní.",
      })
    } else if (currentStreak < 3) {
      aiInsights.push({
        type: "warning",
        title: "Nízký streak",
        description: `Streak pouze ${currentStreak} dny. Konzistence je základ profesionálního tradingu.`,
        action: "Nastav denní reminder na 9:00 pro Morning Check. Udělej to non-negotiable.",
      })
    }

    if (lossResets > 2) {
      aiInsights.push({
        type: "warning",
        title: "Časté Loss Resety",
        description: `${lossResets} loss resetů tento týden naznačují emoční volatilitu po ztrátách.`,
        action: "Po každé ztrátě: 30min pauza + journaling. Automatizuj tento proces.",
      })
    }

    setCurrentWeekData({
      weekStart: weekStart.toLocaleDateString("cs-CZ"),
      weekEnd: weekEnd.toLocaleDateString("cs-CZ"),
      totalTrades: weekTrades.length,
      winningTrades,
      losingTrades,
      winRate,
      totalPnL,
      bestTrade,
      worstTrade,
      avgMood,
      avgReadiness,
      mindPointsGained,
      currentStreak,
      lossResets,
      revengeIncidents,
      dailyData,
      sleepData,
      trades: weekTrades,
      aiInsights,
      avgSleep: avgSleepOverall,
    })
  }

  const loadSavedReviews = () => {
    const saved = localStorage.getItem("weekly-reviews")
    if (saved) {
      setSavedReviews(JSON.parse(saved))
    }
  }

  const saveReview = () => {
    if (!currentWeekData) return

    const newReview: WeeklyReview = {
      id: Date.now().toString(),
      weekStart: currentWeekData.weekStart,
      weekEnd: currentWeekData.weekEnd,
      createdAt: new Date().toISOString(),
      totalTrades: currentWeekData.totalTrades,
      winningTrades: currentWeekData.winningTrades,
      losingTrades: currentWeekData.losingTrades,
      winRate: currentWeekData.winRate,
      totalPnL: currentWeekData.totalPnL,
      bestTrade: currentWeekData.bestTrade,
      worstTrade: currentWeekData.worstTrade,
      avgMood: currentWeekData.avgMood,
      avgReadiness: currentWeekData.avgReadiness,
      mindPointsGained: currentWeekData.mindPointsGained,
      currentStreak: currentWeekData.currentStreak,
      lossResets: currentWeekData.lossResets,
      revengeIncidents: currentWeekData.revengeIncidents,
      ...(review as any),
    }

    const updated = [newReview, ...savedReviews]
    setSavedReviews(updated)
    localStorage.setItem("weekly-reviews", JSON.stringify(updated))

    alert("Weekly Review uložen!")
  }

  const downloadPDF = () => {
    window.print()
  }

  if (!currentWeekData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Načítání dat...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <Calendar className="w-12 h-12 text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            AI Weekly Review
          </h1>
          <p className="text-gray-400 text-lg">
            {currentWeekData.weekStart} - {currentWeekData.weekEnd}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm">
              Nedělní Report
            </Badge>
            <Button
              onClick={downloadPDF}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
          {!isLiveMode && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Virtual Mode - Zobrazuji demo data s AI analýzou
            </Badge>
          )}
          {isLiveMode && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2 text-sm">
              Live Mode - Tvoje reálná data
            </Badge>
          )}
        </div>

        <Card className="bg-gradient-to-br from-slate-800/90 via-purple-900/20 to-slate-800/90 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Hero KPI - Týden v Číslech
            </CardTitle>
            <CardDescription className="text-gray-400">Klíčové metriky tvého výkonu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Avg Readiness */}
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <Brain className="w-8 h-8 text-blue-400" />
                  {currentWeekData.avgReadiness >= 70 ? (
                    <ArrowUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{Math.round(currentWeekData.avgReadiness)}%</p>
                <p className="text-gray-400 text-sm">Avg Readiness</p>
              </div>

              {/* MindPoints */}
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <Zap className="w-8 h-8 text-purple-400" />
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{currentWeekData.mindPointsGained}</p>
                <p className="text-gray-400 text-sm">MindPoints Gained</p>
              </div>

              {/* Streak */}
              <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30">
                <div className="flex items-center justify-between mb-3">
                  <Flame className="w-8 h-8 text-orange-400" />
                  {currentWeekData.currentStreak >= 7 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{currentWeekData.currentStreak}</p>
                <p className="text-gray-400 text-sm">Day Streak</p>
              </div>

              {/* Loss Resets */}
              <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/30">
                <div className="flex items-center justify-between mb-3">
                  <Shield className="w-8 h-8 text-yellow-400" />
                  {currentWeekData.lossResets <= 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{currentWeekData.lossResets}</p>
                <p className="text-gray-400 text-sm">Loss Resets</p>
              </div>

              {/* Revenge Incidents */}
              <div className="p-6 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl border border-red-500/30">
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  {currentWeekData.revengeIncidents === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{currentWeekData.revengeIncidents}</p>
                <p className="text-gray-400 text-sm">Revenge Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentWeekData.aiInsights && currentWeekData.aiInsights.length > 0 && (
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-2xl">
                <Brain className="w-6 h-6 text-purple-400" />
                AI Insights & Doporučení
              </CardTitle>
              <CardDescription className="text-gray-300">
                Personalizovaná analýza založená na tvých datech
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentWeekData.aiInsights.map((insight: any, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "p-5 rounded-xl border backdrop-blur-sm",
                    insight.type === "critical"
                      ? "bg-red-500/10 border-red-500/30"
                      : insight.type === "warning"
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-green-500/10 border-green-500/30",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-full",
                        insight.type === "critical"
                          ? "bg-red-500/20"
                          : insight.type === "warning"
                            ? "bg-yellow-500/20"
                            : "bg-green-500/20",
                      )}
                    >
                      {insight.type === "critical" ? (
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      ) : insight.type === "warning" ? (
                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-2">{insight.title}</h4>
                      <p className="text-gray-300 mb-3 leading-relaxed">{insight.description}</p>
                      <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                        <Target className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-purple-300 text-sm font-medium">{insight.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total P&L</p>
                  <p
                    className={`text-3xl font-bold ${currentWeekData.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {currentWeekData.totalPnL >= 0 ? "+" : ""}${Math.round(currentWeekData.totalPnL)}
                  </p>
                </div>
                {currentWeekData.totalPnL >= 0 ? (
                  <TrendingUp className="w-10 h-10 text-green-400" />
                ) : (
                  <TrendingDown className="w-10 h-10 text-red-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-white">{Math.round(currentWeekData.winRate)}%</p>
                </div>
                <Target className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Celkem Tradů</p>
                  <p className="text-3xl font-bold text-white">{currentWeekData.totalTrades}</p>
                </div>
                <Activity className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Průměrná Nálada</p>
                  <p className="text-3xl font-bold text-white">{Math.round(currentWeekData.avgMood)}%</p>
                </div>
                <Heart className="w-10 h-10 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readiness Trend */}
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Readiness Trend (Po-Pá)
              </CardTitle>
              <CardDescription className="text-gray-400">Denní připravenost během pracovních dnů</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={currentWeekData.dailyData.filter((d: any) => d.day !== "So" && d.day !== "Ne")}>
                  <defs>
                    <linearGradient id="readinessGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <ReferenceLine y={75} stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" strokeOpacity={0.3} />
                  <ReferenceLine y={60} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" strokeOpacity={0.3} />
                  <ReferenceLine y={50} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" strokeOpacity={0.3} />
                  <Area
                    type="monotone"
                    dataKey="readiness"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#readinessGradient)"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-400">Riziková (&lt;50%) - NEOBCHODUJ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">Hranice (50-60%) - Opatrně</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-400">Střední (60-75%) - Možné</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Dobrá (75%+) - Ideální pro trading</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Win Rate & Emotional Patterns
              </CardTitle>
              <CardDescription className="text-gray-400">Úspěšnost a emoční stav během týdne</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={currentWeekData.dailyData
                    .filter((d: any) => d.day !== "So" && d.day !== "Ne")
                    .map((d: any) => ({
                      ...d,
                      winRate: d.trades > 0 ? (d.pnl > 0 ? 100 : 0) : 0, // Simplified win rate calculation
                    }))}
                >
                  <defs>
                    <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="winRate"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#winRateGradient)"
                    name="Win Rate (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="url(#emotionGradient)"
                    name="Nálada (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Win Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span className="text-gray-400">Nálada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Nálada/P&L Korelace
            </CardTitle>
            <CardDescription className="text-gray-400">
              Jak nálada ovlivňuje trading výsledky (vyšší nálada = lepší výsledky?)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={currentWeekData.dailyData.filter((d: any) => d.day !== "So" && d.day !== "Ne")}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  label={{ value: "P&L ($)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#ec4899"
                  domain={[0, 100]}
                  label={{ value: "Nálada (%)", angle: 90, position: "insideRight", fill: "#ec4899" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar yAxisId="left" dataKey="pnl" fill="url(#pnlGradient)" radius={[8, 8, 0, 0]} name="P&L ($)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="mood"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: "#ec4899", r: 5 }}
                  name="Nálada (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <p className="text-gray-300 text-sm">
                <strong className="text-purple-400">Jak číst graf:</strong> Sloupcový graf (fialový) ukazuje P&L v
                dolarech, čárový graf (růžový) ukazuje náladu v %. Pokud jsou oba vysoké současně, nálada pozitivně
                koreluje s výkonem.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/90 to-green-900/20 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-2xl">
              <Target className="w-6 h-6 text-green-400" />
              Action Plan - Příští Týden
            </CardTitle>
            <CardDescription className="text-gray-400">3 konkrétní kroky k dosažení cílů</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionPlan.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600"
              >
                <Checkbox
                  checked={action.completed}
                  onCheckedChange={(checked) => {
                    const updated = [...actionPlan]
                    updated[index].completed = checked as boolean
                    setActionPlan(updated)
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label className="text-white text-sm mb-2 block">Krok {index + 1}</Label>
                  <Input
                    value={action.text}
                    onChange={(e) => {
                      const updated = [...actionPlan]
                      updated[index].text = e.target.value
                      setActionPlan(updated)
                    }}
                    placeholder={`Konkrétní akční krok ${index + 1}...`}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section 1: Týden v Přehledu */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/20 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6 text-purple-400" />
              Týden v Přehledu
            </CardTitle>
            <CardDescription className="text-gray-400">Reflexe uplynulého týdne</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What Worked */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Co fungovalo dobře?
              </Label>
              <Textarea
                value={review.whatWorked}
                onChange={(e) => setReview({ ...review, whatWorked: e.target.value })}
                placeholder="Popište strategie, setupy nebo přístupy které fungovaly..."
                className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            {/* What Didn't Work */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Co nefungovalo?
              </Label>
              <Textarea
                value={review.whatDidntWork}
                onChange={(e) => setReview({ ...review, whatDidntWork: e.target.value })}
                placeholder="Identifikujte problémy, chyby nebo oblasti ke zlepšení..."
                className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            {/* Biggest Win & Loss */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Největší výhra (${Math.round(currentWeekData.bestTrade)})
                </Label>
                <Textarea
                  value={review.biggestWin}
                  onChange={(e) => setReview({ ...review, biggestWin: e.target.value })}
                  placeholder="Co vedlo k tomuto úspěchu?"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Největší ztráta (${Math.round(currentWeekData.worstTrade)})
                </Label>
                <Textarea
                  value={review.biggestLoss}
                  onChange={(e) => setReview({ ...review, biggestLoss: e.target.value })}
                  placeholder="Co se pokazilo a jak se tomu vyhnout?"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Emotional Patterns */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Emoční vzorce
              </Label>
              <Textarea
                value={review.emotionalPatterns}
                onChange={(e) => setReview({ ...review, emotionalPatterns: e.target.value })}
                placeholder="Jaké emoce jste zažili? Jak ovlivnily vaše rozhodování?"
                className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            {/* Mistakes & Lessons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-400" />
                  Chyby které jsem udělal
                </Label>
                <Textarea
                  value={review.mistakesMade}
                  onChange={(e) => setReview({ ...review, mistakesMade: e.target.value })}
                  placeholder="Seznam konkrétních chyb..."
                  className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Poučení a insights
                </Label>
                <Textarea
                  value={review.lessonsLearned}
                  onChange={(e) => setReview({ ...review, lessonsLearned: e.target.value })}
                  placeholder="Co jsem se naučil tento týden?"
                  className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Plán na Příští Týden */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-blue-900/20 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-2xl">
              <Target className="w-6 h-6 text-blue-400" />
              Plán na Příští Týden
            </CardTitle>
            <CardDescription className="text-gray-400">Příprava a cíle pro nadcházející týden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly Goals */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Týdenní cíle (Top 3)
              </Label>
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={review.weeklyGoals?.[i] || ""}
                  onChange={(e) => {
                    const goals = [...(review.weeklyGoals || ["", "", ""])]
                    goals[i] = e.target.value
                    setReview({ ...review, weeklyGoals: goals })
                  }}
                  placeholder={`Cíl ${i + 1}...`}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              ))}
            </div>

            {/* Focus Areas */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Oblasti zaměření (Top 3)
              </Label>
              {[0, 1, 2].map((i) => (
                <Input
                  key={i}
                  value={review.focusAreas?.[i] || ""}
                  onChange={(e) => {
                    const areas = [...(review.focusAreas || ["", "", ""])]
                    areas[i] = e.target.value
                    setReview({ ...review, focusAreas: areas })
                  }}
                  placeholder={`Oblast ${i + 1}...`}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              ))}
            </div>

            {/* Trading Plan Adjustments */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Úpravy trading plánu
              </Label>
              <Textarea
                value={review.tradingPlanAdjustments}
                onChange={(e) => setReview({ ...review, tradingPlanAdjustments: e.target.value })}
                placeholder="Jaké změny v trading plánu chcete implementovat?"
                className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            {/* Risk Management */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Risk Management poznámky
              </Label>
              <Textarea
                value={review.riskManagementNotes}
                onChange={(e) => setReview({ ...review, riskManagementNotes: e.target.value })}
                placeholder="Jak zlepšit risk management příští týden?"
                className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            {/* Mindset Preparation */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-400" />
                Mentální příprava
              </Label>
              <Textarea
                value={review.mindsetPreparation}
                onChange={(e) => setReview({ ...review, mindsetPreparation: e.target.value })}
                placeholder="Jak se mentálně připravíte na příští týden?"
                className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={saveReview}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Uložit Weekly Review
          </Button>
        </div>

        {/* Previous Reviews */}
        {savedReviews.length > 0 && (
          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Předchozí Weekly Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedReviews.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold">
                        {r.weekStart} - {r.weekEnd}
                      </p>
                      <Badge
                        className={r.totalPnL >= 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}
                      >
                        {r.totalPnL >= 0 ? "+" : ""}${Math.round(r.totalPnL)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                      <div>Win Rate: {Math.round(r.winRate)}%</div>
                      <div>Trady: {r.totalTrades}</div>
                      <div>Nálada: {Math.round(r.avgMood)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
