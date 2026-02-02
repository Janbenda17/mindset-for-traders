"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  BarChart3,
  Wand2,
  PenLine,
  History,
  Loader2,
  Eye,
  X,
} from "lucide-react"
import { getJournalEntries, getMoodEntries, getUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useAnalytics } from "@/contexts/analytics-context"
import { useLiveMode } from "@/contexts/live-mode-context"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart,
  Bar,
  Legend,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"

interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  createdAt: string
  variant: "manual" | "ai" // Added variant type

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

  // Action Plan
  actionPlan: { text: string; completed: boolean }[]

  // Hero KPIs
  mindPointsGained: number
  currentStreak: number
  lossResets: number
  revengeIncidents: number

  // Charts Data
  dailyData: any[]
  sleepData: any[]
  aiInsights: any[]
  avgSleep?: number
}

export default function WeeklyReviewPage() {
  const { isLiveMode } = useData()
  const { analytics } = useAnalytics()
  const [currentWeekData, setCurrentWeekData] = useState<any>(null)
  const [reviewVariant, setReviewVariant] = useState<"manual" | "ai">("manual") // Changed default from "ai" to "manual"
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
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
  // Changed savedReviews type to any[] to match the update
  const [savedReviews, setSavedReviews] = useState<any[]>([])
  const [actionPlan, setActionPlan] = useState<{ text: string; completed: boolean }[]>([
    { text: "", completed: false },
    { text: "", completed: false },
    { text: "", completed: false },
  ])
  const [activeTab, setActiveTab] = useState("current") // Tab state for history
  const [viewingReview, setViewingReview] = useState<any | null>(null)

  useEffect(() => {
    if (isLiveMode) {
      loadWeekData()
    } else {
      loadVirtualData()
    }
    loadSavedReviews()
  }, [isLiveMode])

  // /** START: CHANGE */
  // // Auto-generate weekly review from computed analytics
  useEffect(() => {
    if (!analytics) return

    const { weeklyInsights } = analytics

    setReview({
      whatWorked: `Best performing day: ${weeklyInsights.bestPerformingDay}`,
      whatDidntWork: `Worst performing day: ${weeklyInsights.worstPerformingDay}`,
      biggestWin: `Best day: ${analytics.summary.bestDay.date} (+$${analytics.summary.bestDay.pnl.toFixed(2)})`,
      biggestLoss: `Worst day: ${analytics.summary.worstDay.date} (-$${Math.abs(analytics.summary.worstDay.pnl).toFixed(2)})`,
      emotionalPatterns: weeklyInsights.readinessVsResults,
      mistakesMade: weeklyInsights.commonMistake,
      lessonsLearned: `${analytics.psychology.revengeIncidents === 0 ? "Good emotional control" : `${analytics.psychology.revengeIncidents} revenge trading incidents - implement pause after losses`}`,
      weeklyGoals: weeklyInsights.nextWeekFocus.slice(0, 3),
      focusAreas: ["Maintain high readiness", "Follow trading plan", "Track emotions"],
      tradingPlanAdjustments: `Current discipline: ${analytics.psychology.disciplineScore.toFixed(0)}%`,
      riskManagementNotes: `Win rate: ${analytics.summary.winRate.toFixed(1)}%`,
      mindsetPreparation: `Average readiness: ${analytics.summary.avgReadiness.toFixed(0)}%`,
    })

    setActionPlan(
      weeklyInsights.nextWeekFocus.map((focus) => ({
        text: focus,
        completed: false,
      })),
    )
  }, [analytics])
  // /** END: CHANGE */

  useEffect(() => {
    // if (reviewVariant === "ai" && currentWeekData) {
    //   generateAIContent()
    // }
  }, [reviewVariant, currentWeekData])

  const generateAIContent = async () => {
    if (!currentWeekData) return
    setIsGeneratingAI(true)

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const data = currentWeekData

    // Generate AI-powered content based on data
    const aiWhatWorked =
      data.dailyData
        .filter((d: any) => d.pnl > 0)
        .map((d: any) => {
          if (d.readiness > 75) return `${d.day}: Vysoká readiness (${d.readiness}%) vedla k zisku +$${d.pnl}`
          if (d.mood > 70) return `${d.day}: Pozitivní nálada (${d.mood}%) = disciplinované rozhodování`
          return `${d.day}: Ziskový den +$${d.pnl}`
        })
        .join(". ") || "Tento týden nebyl výrazně ziskový - zaměř se na kvalitní setupy."

    const aiWhatDidntWork =
      data.dailyData
        .filter((d: any) => d.pnl < 0)
        .map((d: any) => {
          if (d.readiness < 60) return `${d.day}: Nízká readiness (${d.readiness}%) = ztráta $${Math.abs(d.pnl)}`
          if (d.sleep < 7) return `${d.day}: Nedostatek spánku (${d.sleep}h) ovlivnil rozhodování`
          return `${d.day}: Ztrátový den -$${Math.abs(d.pnl)}`
        })
        .join(". ") || "Žádné významné ztráty tento týden."

    const bestDay = data.dailyData.reduce(
      (best: any, d: any) => (d.pnl > (best?.pnl || Number.NEGATIVE_INFINITY) ? d : best),
      null,
    )
    const worstDay = data.dailyData.reduce(
      (worst: any, d: any) => (d.pnl < (worst?.pnl || Number.POSITIVE_INFINITY) ? d : worst),
      null,
    )

    const aiBiggestWin = bestDay
      ? `${bestDay.day}: +$${bestDay.pnl} při readiness ${bestDay.readiness}% a náladě ${bestDay.mood}%. ${bestDay.readiness > 75 ? "Vysoká připravenost byla klíčem k úspěchu." : "Zaměř se na zvýšení readiness pro konzistentní výsledky."}`
      : "Žádné výrazné zisky tento týden."

    const aiBiggestLoss =
      worstDay && worstDay.pnl < 0
        ? `${worstDay.day}: -$${Math.abs(worstDay.pnl)} při readiness ${worstDay.readiness}% a náladě ${worstDay.mood}%. ${worstDay.readiness < 60 ? "VAROVÁNÍ: Nízká readiness koreluje se ztrátami. Neobchoduj pod 65%." : "Analyzuj setup a hledej chyby v exekuci."}`
        : "Žádné významné ztráty tento týden."

    const aiEmotionalPatterns = `Průměrná nálada: ${Math.round(data.avgMood)}%. ${
      data.avgMood > 70
        ? "Pozitivní emoční stav podporoval disciplínu."
        : data.avgMood > 50
          ? "Neutrální emoční stav - prostor pro zlepšení."
          : "Nízká nálada mohla ovlivnit rozhodování negativně."
    } ${
      data.revengeIncidents > 0
        ? `POZOR: ${data.revengeIncidents} revenge trading incidentů tento týden.`
        : "Žádné revenge trading incidenty - skvělá disciplína!"
    }`

    const aiMistakes =
      [
        data.avgReadiness < 70 ? "Obchodování s nízkou readiness" : null,
        data.revengeIncidents > 0 ? `${data.revengeIncidents}x revenge trading` : null,
        data.avgSleep && data.avgSleep < 7 ? `Průměrný spánek pouze ${data.avgSleep?.toFixed(1)}h` : null,
        data.lossResets > 2 ? `${data.lossResets} loss resetů - emoční volatilita` : null,
      ]
        .filter(Boolean)
        .join("\n") || "Žádné významné chyby identifikovány."

    const aiLessons = [
      data.avgReadiness > 75 ? "Vysoká readiness = konzistentní výsledky" : "Prioritizuj readiness před obchodováním",
      data.winRate > 50 ? "Současná strategie funguje - pokračovat" : "Přehodnotit strategii a setupy",
      data.revengeIncidents === 0 ? "Emoční disciplína na dobré úrovni" : "Implementovat stop loss pro psychiku",
    ].join(". ")

    // AI-generated goals and focus areas
    const aiGoals = [
      data.avgReadiness < 75 ? "Dosáhnout průměrné readiness 75%+" : "Udržet vysokou readiness",
      data.winRate < 50 ? "Zlepšit win rate na 50%+" : "Zaměřit se pouze na A+ setupy",
      "Dodržovat trading plán bez výjimek",
    ]

    const aiFocusAreas = [
      data.avgSleep && data.avgSleep < 7 ? "Spánek 7+ hodin každou noc" : "Udržet kvalitní spánek",
      "Morning Check každý obchodní den",
      data.revengeIncidents > 0 ? "Eliminovat revenge trading" : "Pokračovat v emoční disciplíně",
    ]

    const aiActionPlan = [
      {
        text:
          data.avgReadiness < 70
            ? "Nastavit alarm pro readiness check - neobchodovat pod 65%"
            : "Pokračovat v ranní rutině pro udržení vysoké readiness",
        completed: false,
      },
      {
        text:
          data.revengeIncidents > 0
            ? "Implementovat 30min pauzu po každé ztrátě"
            : "Zdokumentovat co funguje pro budoucí referenci",
        completed: false,
      },
      {
        text:
          data.winRate < 50
            ? "Backtesting strategie - najít A+ setupy"
            : "Zvýšit position size pouze při readiness 80%+",
        completed: false,
      },
    ]

    const aiTradingPlan = `Na základě dat tohoto týdne: ${
      data.winRate > 50
        ? "Strategie funguje - neměnit základní pravidla."
        : "Přehodnotit entry kritéria a snížit frekvenci tradů."
    } ${data.avgReadiness < 70 ? "Přidat pravidlo: Žádný trading pod 65% readiness." : ""} ${
      data.revengeIncidents > 0 ? "Implementovat: Po ztrátě pauza a journaling před dalším tradem." : ""
    }`

    const aiRiskManagement = `Aktuální stav: ${data.totalPnL >= 0 ? "V zisku" : "Ve ztrátě"} tento týden. ${
      data.worstTrade < -100
        ? `Největší ztráta $${Math.abs(data.worstTrade)} - zvážit snížení position size.`
        : "Risk management v pořádku."
    } Doporučení: Max 2% risk per trade, max 6% daily loss limit.`

    const aiMindset = `${
      data.avgMood > 70
        ? "Emoční stav byl tento týden stabilní - pokračovat v současných rutinách."
        : "Zaměřit se na zlepšení nálady před tradingem - meditace, cvičení."
    } ${
      data.currentStreak > 7
        ? `Skvělý ${data.currentStreak}-denní streak! Udržet konzistenci.`
        : "Zaměřit se na budování streak - denní check-in je klíč."
    }`

    setReview({
      whatWorked: aiWhatWorked,
      whatDidntWork: aiWhatDidntWork,
      biggestWin: aiBiggestWin,
      biggestLoss: aiBiggestLoss,
      emotionalPatterns: aiEmotionalPatterns,
      mistakesMade: aiMistakes,
      lessonsLearned: aiLessons,
      weeklyGoals: aiGoals,
      focusAreas: aiFocusAreas,
      tradingPlanAdjustments: aiTradingPlan,
      riskManagementNotes: aiRiskManagement,
      mindsetPreparation: aiMindset,
    })

    setActionPlan(aiActionPlan)
    setIsGeneratingAI(false)
  }

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
      { day: "Pá", date: "2025-01-10", pnl: 85, trades: 2, mood: 70, readiness: 75, sleep: 7.2, session: "London" },
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
        "Data jasně ukazují: readiness > 80% + spánek > 7h = profit. London session je moje zona, Asian ne. Po ztrátovém dni sniž aktivitu. Nikdy neobchodovat pod 65% readiness.",
      weeklyGoals: [
        "Obchodovat pouze s readiness 70%+",
        "Zaměřit se pouze na A+ setupy, kvalita > kvantita",
        "Žádné trady během Asian session",
      ],
      focusAreas: [
        "London session (8:00-12:00) - moje profit zone",
        "Spánek 7+ hodin každou noc",
        "Stop loss pro psychiku: po ztrátě sniž aktivitu další den",
      ],
      tradingPlanAdjustments:
        "Přidat pravidlo: Neobchodovat pod 65% readiness (automatický alarm). Blacklist Asian session. Po ztrátovém dni sniž aktivitu. Zvýšit position size pouze při readiness 85%+.",
      riskManagementNotes:
        "Čtvrtek ukázal důležitost stop loss pro psychiku. Implementovat: 1) Max 2% risk per trade, 2) Max 6% daily loss limit, 3) Po dosažení daily loss STOP - žádné další trady.",
      mindsetPreparation:
        "Každé ráno: Morning Check před 8:00. Pokud readiness < 70%, den bez tradingu. Meditace 10min před London session. Po každém tradu: 5min pauza + journaling.",
    })

    setActionPlan([
      { text: "Nastavit alarm pro readiness < 65% - automatický STOP trading", completed: false },
      { text: "Blacklist Asian session v trading platformě", completed: false },
      { text: "Implementovat 'Stop Loss pro Psychiku': po ztrátě sniž aktivitu další den", completed: false },
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
      trades: demoTrades, // Note: 'trades' is not used elsewhere in the original code, can be removed if not needed.
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
      variant: reviewVariant, // Save variant
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
      dailyData: currentWeekData.dailyData,
      sleepData: currentWeekData.sleepData,
      aiInsights: currentWeekData.aiInsights,
      actionPlan: actionPlan, // Save action plan
      ...(review as any),
    }

    const updated = [newReview, ...savedReviews]
    setSavedReviews(updated)
    localStorage.setItem("weekly-reviews", JSON.stringify(updated))

    alert("Weekly Review uložen!")
  }

  const downloadPDF = async (reviewData: any) => {
    const content = `
WEEKLY REVIEW - ${reviewData.weekStart} až ${reviewData.weekEnd}
Varianta: ${reviewData.variant === "ai" ? "AI" : "Manual"}
Vytvořeno: ${new Date(reviewData.createdAt).toLocaleDateString("cs-CZ")}

═══════════════════════════════════════════════════════════════

STATISTIKY TÝDNE
────────────────────────────────────────────────────────────────
Win Rate: ${Math.round(reviewData.winRate)}%
Celkový P&L: ${reviewData.totalPnL >= 0 ? "+" : ""}$${Math.round(reviewData.totalPnL)}
Počet tradů: ${reviewData.totalTrades}
Průměrná Readiness: ${Math.round(reviewData.avgReadiness)}%
Průměrná Nálada: ${Math.round(reviewData.avgMood)}%

═══════════════════════════════════════════════════════════════

CO FUNGOVALO
────────────────────────────────────────────────────────────────
${reviewData.whatWorked || "Nevyplněno"}

CO NEFUNGOVALO
────────────────────────────────────────────────────────────────
${reviewData.whatDidntWork || "Nevyplněno"}

NEJVĚTŠÍ VÝHRA
────────────────────────────────────────────────────────────────
${reviewData.biggestWin || "Nevyplněno"}

NEJVĚTŠÍ ZTRÁTA
────────────────────────────────────────────────────────────────
${reviewData.biggestLoss || "Nevyplněno"}

EMOČNÍ VZORCE
────────────────────────────────────────────────────────────────
${reviewData.emotionalPatterns || "Nevyplněno"}

CHYBY
────────────────────────────────────────────────────────────────
${reviewData.mistakesMade || "Nevyplněno"}

NAUČENÉ LEKCE
────────────────────────────────────────────────────────────────
${reviewData.lessonsLearned || "Nevyplněno"}

CÍLE NA PŘÍŠTÍ TÝDEN
────────────────────────────────────────────────────────────────
${reviewData.weeklyGoals || "Nevyplněno"}

OBLASTI ZAMĚŘENÍ
────────────────────────────────────────────────────────────────
${reviewData.focusAreas || "Nevyplněno"}

ÚPRAVY TRADING PLÁNU
────────────────────────────────────────────────────────────────
${reviewData.tradingPlanAdjustments || "Nevyplněno"}

RISK MANAGEMENT
────────────────────────────────────────────────────────────────
${reviewData.riskManagementNotes || "Nevyplněno"}

MENTÁLNÍ PŘÍPRAVA
────────────────────────────────────────────────────────────────
${reviewData.mindsetPreparation || "Nevyplněno"}

ACTION PLAN
────────────────────────────────────────────────────────────────
${reviewData.actionPlan?.map((a: any, i: number) => `${i + 1}. [${a.completed ? "✓" : " "}] ${a.text}`).join("\n") || "Nevyplněno"}

═══════════════════════════════════════════════════════════════
Vygenerováno aplikací Trader Mindset
    `.trim()

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `weekly-review-${reviewData.weekStart}-${reviewData.weekEnd}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearForm = () => {
    setReview({
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
    setActionPlan([
      { text: "", completed: false },
      { text: "", completed: false },
      { text: "", completed: false },
    ])
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
    // Updated background gradient for better contrast
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
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

          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              onClick={() => {
                setReviewVariant("ai")
              }}
              disabled={true} // Disabled AI button
              className={cn(
                "px-6 py-3 rounded-xl transition-all",
                "bg-slate-700 text-gray-500 cursor-not-allowed opacity-50", // Grayed out styling for disabled state
              )}
              title="AI varianta je brzy dostupná"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              AI Varianta - Brzy
            </Button>
            <Button
              onClick={() => {
                setReviewVariant("manual")
                clearForm()
              }}
              className={cn(
                "px-6 py-3 rounded-xl transition-all",
                reviewVariant === "manual"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                  : "bg-slate-800 text-gray-400 hover:bg-slate-700",
              )}
            >
              <PenLine className="w-5 h-5 mr-2" />
              Manuální
            </Button>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm">
              {reviewVariant === "ai" ? "AI generovaný obsah" : "Ruční vyplnění"}
            </Badge>
            {/* Modified downloadPDF call */}
            <Button
              onClick={() => downloadPDF(review)} // Pass the current review object
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="current" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Aktuální Review
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Historie ({savedReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-8 mt-6">
            {/* Loading overlay for AI generation */}
            {isGeneratingAI && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <Card className="bg-slate-800 border-purple-500/50 p-8">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                    <p className="text-white text-lg">AI generuje obsah...</p>
                    <p className="text-gray-400 text-sm">Analyzuji tvoje data z tohoto týdne</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Hero KPI */}
            <Card className="bg-gradient-to-br from-slate-800/90 via-purple-900/20 to-slate-800/90 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Hero KPI - Týden v Číslech
                </CardTitle>
                <CardDescription className="text-gray-400">Klíčové metriky tvého výkonu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Win Rate & Emotional Patterns */}
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
                  <ComposedChart
                    data={currentWeekData.dailyData
                      .filter((d: any) => d.day !== "So" && d.day !== "Ne")
                      .map((d: any) => ({
                        ...d,
                        winRate: d.trades > 0 ? (d.pnl > 0 ? 100 : 0) : 0,
                      }))}
                  >
                    <defs>
                      <linearGradient id="winRateBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <ReferenceLine
                      y={50}
                      stroke="#86efac"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      label={{ value: "50%", position: "right", fill: "#86efac", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Legend />
                    <Bar dataKey="winRate" fill="url(#winRateBarGradient)" radius={[4, 4, 0, 0]} name="Win Rate (%)" />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ fill: "#ec4899", r: 5, strokeWidth: 2, stroke: "#1e293b" }}
                      name="Nálada (%)"
                    />
                  </ComposedChart>
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
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-green-300"></div>
                    <span className="text-gray-400">50% linie</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nálada/P&L Korelace */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
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
                      <linearGradient id="pnlGradientPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="pnlGradientNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9} />
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
                    <ReferenceLine
                      yAxisId="left"
                      y={0}
                      stroke="#86efac"
                      strokeWidth={2}
                      label={{ value: "Break-even", position: "left", fill: "#86efac", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="pnl" radius={[8, 8, 0, 0]} name="P&L ($)" fill="#8b5cf6">
                      {currentWeekData.dailyData
                        .filter((d: any) => d.day !== "So" && d.day !== "Ne")
                        .map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="mood"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ fill: "#ec4899", r: 5, strokeWidth: 2, stroke: "#1e293b" }}
                      name="Nálada (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-400">Zisk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">Ztráta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-gray-400">Nálada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-green-300"></div>
                    <span className="text-gray-400">Break-even</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-purple-400">Jak číst graf:</strong> Sloupcový graf (fialový) ukazuje P&L v
                    dolarech, čárový graf (růžový) ukazuje náladu v %. Pokud jsou oba vysoké současně, nálada pozitivně
                    koreluje s výkonem.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Plan */}
            <Card className="bg-gradient-to-br from-slate-800/90 to-green-900/20 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-green-400" />
                  Action Plan - Příští Týden
                  {reviewVariant === "ai" && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
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
                        disabled={reviewVariant === "ai"}
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
                  {reviewVariant === "ai" && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
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
                  {reviewVariant === "ai" ? (
                    <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[100px] text-white whitespace-pre-wrap">
                      {review.whatWorked || "AI generuje..."}
                    </div>
                  ) : (
                    <Textarea
                      value={review.whatWorked}
                      onChange={(e) => setReview({ ...review, whatWorked: e.target.value })}
                      placeholder="Popište strategie, setupy nebo přístupy které fungovaly..."
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    />
                  )}
                </div>

                {/* What Didn't Work */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    Co nefungovalo?
                  </Label>
                  {reviewVariant === "ai" ? (
                    <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[100px] text-white whitespace-pre-wrap">
                      {review.whatDidntWork || "AI generuje..."}
                    </div>
                  ) : (
                    <Textarea
                      value={review.whatDidntWork}
                      onChange={(e) => setReview({ ...review, whatDidntWork: e.target.value })}
                      placeholder="Identifikujte problémy, chyby nebo oblasti ke zlepšení..."
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    />
                  )}
                </div>

                {/* Biggest Win & Loss */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-400" />
                      Největší výhra (${Math.round(currentWeekData.bestTrade)})
                    </Label>
                    {reviewVariant === "ai" ? (
                      <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[80px] text-white whitespace-pre-wrap">
                        {review.biggestWin || "AI generuje..."}
                      </div>
                    ) : (
                      <Textarea
                        value={review.biggestWin}
                        onChange={(e) => setReview({ ...review, biggestWin: e.target.value })}
                        placeholder="Co vedlo k tomuto úspěchu?"
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Největší ztráta (${Math.round(currentWeekData.worstTrade)})
                    </Label>
                    {reviewVariant === "ai" ? (
                      <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[80px] text-white whitespace-pre-wrap">
                        {review.biggestLoss || "AI generuje..."}
                      </div>
                    ) : (
                      <Textarea
                        value={review.biggestLoss}
                        onChange={(e) => setReview({ ...review, biggestLoss: e.target.value })}
                        placeholder="Co se pokazilo a jak se tomu vyhnout?"
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                    )}
                  </div>
                </div>

                {/* Emotional Patterns */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Emoční vzorce
                  </Label>
                  {reviewVariant === "ai" ? (
                    <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[100px] text-white whitespace-pre-wrap">
                      {review.emotionalPatterns || "AI generuje..."}
                    </div>
                  ) : (
                    <Textarea
                      value={review.emotionalPatterns}
                      onChange={(e) => setReview({ ...review, emotionalPatterns: e.target.value })}
                      placeholder="Jaké emoce jste zažili? Jak ovlivnily vaše rozhodování?"
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    />
                  )}
                </div>

                {/* Mistakes & Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-orange-400" />
                      Chyby které jsem udělal
                    </Label>
                    {reviewVariant === "ai" ? (
                      <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[120px] text-white whitespace-pre-wrap">
                        {review.mistakesMade || "AI generuje..."}
                      </div>
                    ) : (
                      <Textarea
                        value={review.mistakesMade}
                        onChange={(e) => setReview({ ...review, mistakesMade: e.target.value })}
                        placeholder="Seznam konkrétních chyb..."
                        className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Poučení a insights
                    </Label>
                    {reviewVariant === "ai" ? (
                      <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[120px] text-white whitespace-pre-wrap">
                        {review.lessonsLearned || "AI generuje..."}
                      </div>
                    ) : (
                      <Textarea
                        value={review.lessonsLearned}
                        onChange={(e) => setReview({ ...review, lessonsLearned: e.target.value })}
                        placeholder="Co jsem se naučil tento týden?"
                        className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                      />
                    )}
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
                  {reviewVariant === "ai" && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
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
                      disabled={reviewVariant === "ai"}
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
                      disabled={reviewVariant === "ai"}
                    />
                  ))}
                </div>

                {/* Trading Plan Adjustments */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Úpravy trading plánu
                  </Label>
                  {reviewVariant === "ai" ? (
                    <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[100px] text-white">
                      {review.tradingPlanAdjustments || "AI generuje..."}
                    </div>
                  ) : (
                    <Textarea
                      value={review.tradingPlanAdjustments}
                      onChange={(e) => setReview({ ...review, tradingPlanAdjustments: e.target.value })}
                      placeholder="Jaké změny v trading plánu chcete implementovat?"
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    />
                  )}
                </div>

                {/* Risk Management */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Risk Management poznámky
                  </Label>
                  {reviewVariant === "ai" ? (
                    <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[100px] text-white">
                      {review.riskManagementNotes || "AI generuje..."}
                    </div>
                  ) : (
                    <Textarea
                      value={review.riskManagementNotes}
                      onChange={(e) => setReview({ ...review, riskManagementNotes: e.target.value })}
                      placeholder="Jak zlepšit risk management příští týden?"
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    />
                  )}
                </div>

                {/* Mindset Preparation */}
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-400" />
                    Mentální příprava
                  </Label>
                  {reviewVariant === "ai" ? (
                    <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3 min-h-[100px] text-white">
                      {review.mindsetPreparation || "AI generuje..."}
                    </div>
                  ) : (
                    <Textarea
                      value={review.mindsetPreparation}
                      onChange={(e) => setReview({ ...review, mindsetPreparation: e.target.value })}
                      placeholder="Jak se mentálně připravíte na příští týden?"
                      className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    />
                  )}
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
                Uložit Weekly Review ({reviewVariant === "ai" ? "AI" : "Manual"})
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Historie Weekly Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedReviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Zatím žádné uložené weekly reviews</p>
                    <p className="text-sm mt-2">Vyplň a ulož svůj první review</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedReviews.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-600 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-white font-semibold">{r.weekStart}</p>
                            <p className="text-gray-500 text-xs">až {r.weekEnd}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-700" />
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-gray-400 text-xs">Win Rate</p>
                              <p className="text-white font-medium">{Math.round(r.winRate)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400 text-xs">Trady</p>
                              <p className="text-white font-medium">{r.totalTrades}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400 text-xs">Readiness</p>
                              <p className="text-cyan-400 font-medium">{Math.round(r.avgReadiness)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400 text-xs">P&L</p>
                              <p className={cn("font-medium", r.totalPnL >= 0 ? "text-green-400" : "text-red-400")}>
                                {r.totalPnL >= 0 ? "+" : ""}${Math.round(r.totalPnL)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              r.variant === "ai" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"
                            }
                          >
                            {r.variant === "ai" ? "AI" : "Manual"}
                          </Badge>
                          <Button
                            onClick={() => setViewingReview(r)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Zobrazit
                          </Button>
                          <Button
                            onClick={() => downloadPDF(r)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {viewingReview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Weekly Review: {viewingReview.weekStart} - {viewingReview.weekEnd}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {new Date(viewingReview.createdAt).toLocaleDateString("cs-CZ")} •
                    {viewingReview.variant === "ai" ? " AI Varianta" : " Manual"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Modified downloadPDF call */}
                  <Button
                    onClick={() => downloadPDF(viewingReview)}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Stáhnout
                  </Button>
                  <Button
                    onClick={() => setViewingReview(null)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-white">{Math.round(viewingReview.winRate)}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">P&L</p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        viewingReview.totalPnL >= 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {viewingReview.totalPnL >= 0 ? "+" : ""}${Math.round(viewingReview.totalPnL)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Trady</p>
                    <p className="text-2xl font-bold text-white">{viewingReview.totalTrades}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Readiness</p>
                    <p className="text-2xl font-bold text-cyan-400">{Math.round(viewingReview.avgReadiness)}%</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm">Nálada</p>
                    <p className="text-2xl font-bold text-purple-400">{Math.round(viewingReview.avgMood)}%</p>
                  </div>
                </div>

                {/* Review Content */}
                <div className="grid md:grid-cols-2 gap-6">
                  {viewingReview.whatWorked && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Co fungovalo
                      </h3>
                      <p className="text-white">{viewingReview.whatWorked}</p>
                    </div>
                  )}
                  {viewingReview.whatDidntWork && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                      <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Co nefungovalo
                      </h3>
                      <p className="text-white">{viewingReview.whatDidntWork}</p>
                    </div>
                  )}
                  {viewingReview.biggestWin && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Největší výhra
                      </h3>
                      <p className="text-white">{viewingReview.biggestWin}</p>
                    </div>
                  )}
                  {viewingReview.biggestLoss && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                      <h3 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        Největší ztráta
                      </h3>
                      <p className="text-white">{viewingReview.biggestLoss}</p>
                    </div>
                  )}
                </div>

                {viewingReview.emotionalPatterns && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h3 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Emoční vzorce
                    </h3>
                    <p className="text-white">{viewingReview.emotionalPatterns}</p>
                  </div>
                )}

                {viewingReview.lessonsLearned && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <h3 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Naučené lekce
                    </h3>
                    <p className="text-white">{viewingReview.lessonsLearned}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {viewingReview.weeklyGoals && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Cíle na příští týden
                      </h3>
                      <p className="text-white">{viewingReview.weeklyGoals.join(", ")}</p>
                    </div>
                  )}
                  {viewingReview.focusAreas && (
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                      <h3 className="text-pink-400 font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Oblasti zaměření
                      </h3>
                      <p className="text-white">{viewingReview.focusAreas.join(", ")}</p>
                    </div>
                  )}
                </div>

                {viewingReview.tradingPlanAdjustments && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Úpravy trading plánu
                    </h3>
                    <p className="text-white">{viewingReview.tradingPlanAdjustments}</p>
                  </div>
                )}

                {viewingReview.riskManagementNotes && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h3 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Management
                    </h3>
                    <p className="text-white">{viewingReview.riskManagementNotes}</p>
                  </div>
                )}

                {viewingReview.mindsetPreparation && (
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                    <h3 className="text-pink-400 font-semibold mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Mentální příprava
                    </h3>
                    <p className="text-white">{viewingReview.mindsetPreparation}</p>
                  </div>
                )}

                {/* Action Plan */}
                {viewingReview.actionPlan &&
                  viewingReview.actionPlan.length > 0 &&
                  viewingReview.actionPlan[0].text && (
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Action Plan
                      </h3>
                      <div className="space-y-3">
                        {viewingReview.actionPlan.map((action: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            {action.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex-shrink-0" />
                            )}
                            <span className={cn("text-white", action.completed && "line-through opacity-50")}>
                              {action.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
