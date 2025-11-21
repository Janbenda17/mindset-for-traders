"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sun, CheckCircle, BookOpen, Moon, Target, DollarSign, CalendarIcon, Lock, Unlock, TrendingUp, AlertTriangle, Lightbulb, Activity, Brain, Heart, Zap, ArrowRight, Clock, Shield } from 'lucide-react'
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { useRouter } from 'next/navigation'
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useTradingStyle } from "@/contexts/trading-style-context"
import { generateDemoDailyTrackerData } from "@/data/demo-daily-tracker"

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
  hydration: number
  score: number
  recommendation: string
}

interface DailyIntentionData {
  date: string
  goals: string
  maxRiskPercent: number
  emotionalGoal: string
  strategy: string
}

interface TradingPlanData {
  date: string
  setups: string
  pairs: string
  timeframes: string
  entryRules: string
  exitRules: string
  stopLoss: string
  takeProfit: string
  marketAnalysis: string
  keyLevels: string
  notes: string
}

interface Trade {
  id: string
  pair: string
  direction: string
  entryPrice: number
  exitPrice: number
  pnl: number
  notes: string
  date: string
}

interface DailySummary {
  date: string
  morningCheck?: MorningCheckData
  intention?: DailyIntentionData
  plan?: TradingPlanData
  trades?: Trade[]
  overallScore: number
  stagesCompleted: number
}

export default function DailyTrackerPage() {
  const router = useRouter()
  const { isLiveMode } = useData()
  const { stages } = useDailyStage()
  const { tradingStyle, config } = useTradingStyle()
  const [entries, setEntries] = useState<DailySummary[]>([])
  const [activeTab, setActiveTab] = useState("today")
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const loadEntries = () => {
    if (!isLiveMode) {
      const demoData = generateDemoDailyTrackerData()
      setEntries(demoData)
    } else {
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      const intentions = JSON.parse(localStorage.getItem("daily-intentions") || "[]")
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      const allTrades = JSON.parse(localStorage.getItem("trade-records") || "[]")

      const combinedData: DailySummary[] = []
      const dates = new Set([
        ...morningChecks.map((m: any) => m.date),
        ...intentions.map((i: any) => i.date),
        ...plans.map((p: any) => p.date),
      ])

      dates.forEach((date) => {
        const morningCheck = morningChecks.find((m: any) => m.date === date)
        const intention = intentions.find((i: any) => i.date === date)
        const plan = plans.find((p: any) => p.date === date)
        const trades = allTrades.filter((t: Trade) => t.date === date)

        let stagesCompleted = 0
        if (morningCheck) stagesCompleted++
        if (intention) stagesCompleted++
        if (plan) stagesCompleted++
        if (trades.length > 0) stagesCompleted++

        const overallScore = morningCheck?.score || 0

        combinedData.push({
          date: date as string,
          morningCheck,
          intention,
          plan,
          trades,
          overallScore,
          stagesCompleted,
        })
      })

      combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(combinedData)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [isLiveMode])

  const todayEntry = entries.find((e) => e.date === format(new Date(), "yyyy-MM-dd"))
  const todayStages = stages

  const getStageDataForStyle = () => {
    if (tradingStyle === "scalper") {
      return [
        {
          id: 1,
          name: "Energy Check",
          icon: Zap,
          color: "from-yellow-500 to-orange-500",
          borderColor: "border-yellow-500/30",
          bgColor: "bg-yellow-500/10",
          href: "/morning-check",
        },
        {
          id: 2,
          name: "Session Plan",
          icon: Target,
          color: "from-red-500 to-orange-500",
          borderColor: "border-red-500/30",
          bgColor: "bg-red-500/10",
          href: "/daily-intention",
        },
        {
          id: 3,
          name: "Session Track",
          icon: Activity,
          color: "from-orange-500 to-amber-500",
          borderColor: "border-orange-500/30",
          bgColor: "bg-orange-500/10",
          href: "/trading-plan",
        },
        {
          id: 4,
          name: "Quick Trades",
          icon: DollarSign,
          color: "from-emerald-500 to-green-500",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
          href: "/record-trades",
        },
        {
          id: 5,
          name: "Session Review",
          icon: Moon,
          color: "from-violet-500 to-purple-500",
          borderColor: "border-violet-500/30",
          bgColor: "bg-violet-500/10",
          href: "/daily-summary",
        },
      ]
    } else if (tradingStyle === "daytrader") {
      return [
        {
          id: 1,
          name: "Morning Check",
          icon: Sun,
          color: "from-indigo-500 to-purple-500",
          borderColor: "border-indigo-500/30",
          bgColor: "bg-indigo-500/10",
          href: "/morning-check",
        },
        {
          id: 2,
          name: "Daily Intention",
          icon: Target,
          color: "from-blue-500 to-cyan-500",
          borderColor: "border-blue-500/30",
          bgColor: "bg-blue-500/10",
          href: "/daily-intention",
        },
        {
          id: 3,
          name: "Trading Plan",
          icon: BookOpen,
          color: "from-cyan-500 to-teal-500",
          borderColor: "border-cyan-500/30",
          bgColor: "bg-cyan-500/10",
          href: "/trading-plan",
        },
        {
          id: 4,
          name: "Record Trades",
          icon: DollarSign,
          color: "from-emerald-500 to-green-500",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
          href: "/record-trades",
        },
        {
          id: 5,
          name: "Evening Review",
          icon: Moon,
          color: "from-violet-500 to-purple-500",
          borderColor: "border-violet-500/30",
          bgColor: "bg-violet-500/10",
          href: "/daily-summary",
        },
      ]
    } else if (tradingStyle === "swingtrader") {
      return [
        {
          id: 1,
          name: "Weekly Planning",
          icon: CalendarIcon,
          color: "from-purple-500 to-pink-500",
          borderColor: "border-purple-500/30",
          bgColor: "bg-purple-500/10",
          href: "/morning-check",
        },
        {
          id: 2,
          name: "Position Review",
          icon: Target,
          color: "from-blue-500 to-cyan-500",
          borderColor: "border-blue-500/30",
          bgColor: "bg-blue-500/10",
          href: "/daily-intention",
        },
        {
          id: 3,
          name: "Analysis Update",
          icon: Brain,
          color: "from-cyan-500 to-teal-500",
          borderColor: "border-cyan-500/30",
          bgColor: "bg-cyan-500/10",
          href: "/trading-plan",
        },
        {
          id: 4,
          name: "Position Mgmt",
          icon: Shield,
          color: "from-emerald-500 to-green-500",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
          href: "/record-trades",
        },
        {
          id: 5,
          name: "Weekly Summary",
          icon: Clock,
          color: "from-violet-500 to-purple-500",
          borderColor: "border-violet-500/30",
          bgColor: "bg-violet-500/10",
          href: "/daily-summary",
        },
      ]
    }

    // Default to day trader stages
    return [
      {
        id: 1,
        name: "Morning Check",
        icon: Sun,
        color: "from-indigo-500 to-purple-500",
        borderColor: "border-indigo-500/30",
        bgColor: "bg-indigo-500/10",
        href: "/morning-check",
      },
      {
        id: 2,
        name: "Daily Intention",
        icon: Target,
        color: "from-blue-500 to-cyan-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-500/10",
        href: "/daily-intention",
      },
      {
        id: 3,
        name: "Trading Plan",
        icon: BookOpen,
        color: "from-cyan-500 to-teal-500",
        borderColor: "border-cyan-500/30",
        bgColor: "bg-cyan-500/10",
        href: "/trading-plan",
      },
      {
        id: 4,
        name: "Record Trades",
        icon: DollarSign,
        color: "from-emerald-500 to-green-500",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-500/10",
        href: "/record-trades",
      },
      {
        id: 5,
        name: "Evening Review",
        icon: Moon,
        color: "from-violet-500 to-purple-500",
        borderColor: "border-violet-500/30",
        bgColor: "bg-violet-500/10",
        href: "/daily-summary",
      },
    ]
  }

  const stageData = getStageDataForStyle()

  const readinessScore = todayEntry?.morningCheck?.score || 0

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return { text: "Výborný stav", color: "from-green-500 to-emerald-500" }
    if (score >= 60) return { text: "Dobrý stav", color: "from-yellow-500 to-orange-500" }
    return { text: "Zvýšená opatrnost", color: "from-red-500 to-rose-500" }
  }

  // CHANGE: Simplified generateTradingDecision to avoid duplicate tips and added positive reinforcement
  const generateTradingDecision = (morningCheck?: MorningCheckData, readinessScore?: number) => {
    if (!morningCheck || readinessScore === undefined) return null

    let message = ""
    const tips: string[] = []
    const details: string[] = []

    // Analyze metrics
    const poorSleep = morningCheck.sleepQuality < 6 || morningCheck.sleepHours < 6
    const highStress = morningCheck.stressLevel > 7
    const lowFocus = morningCheck.focus < 6
    const lowEnergy = morningCheck.energyLevel < 5
    const badMood = morningCheck.emotionalState < 6
    const goodConditions = readinessScore >= 70

    // Analyze positives for confidence boost
    const highFocus = morningCheck.focus >= 8
    const lowStressMetric = morningCheck.stressLevel <= 3
    const highEnergy = morningCheck.energyLevel >= 8
    const goodMood = morningCheck.emotionalState >= 8
    const goodSleep = morningCheck.sleepQuality >= 8 && morningCheck.sleepHours >= 7

    let positiveNote = ""
    if (highFocus) positiveNote = "Tvůj focus je dnes excelentní, to je tvá super-schopnost."
    else if (lowStressMetric) positiveNote = "Jsi velmi klidný, což je perfektní pro disciplínu."
    else if (highEnergy) positiveNote = "Máš skvělou energii, využij ji pro trpělivost."
    else if (goodMood) positiveNote = "Tvá pozitivní nálada ti pomůže zvládat emoce."
    else if (goodSleep) positiveNote = "Jsi kvalitně vyspaný, tvá mysl je ostrá."

    // Generate main message based on primary issue
    if (poorSleep) {
      message = `Naspal jsi jen ${morningCheck.sleepHours}h (kvalita ${morningCheck.sleepQuality}/10). Nedostatek spánku snižuje rozhodování o 30-40%.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Spánek: ${morningCheck.sleepHours}h, kvalita ${morningCheck.sleepQuality}/10`)
      tips.push("Dej si 10-15min meditaci před tradingem")
      tips.push("Zvaž vynechání tradingu nebo max 1-2 trades s polovičním riskem")
      tips.push("Dnes večer jdi spát o 1-2 hodiny dříve")
    } else if (highStress) {
      message = `Vysoká úroveň stresu (${morningCheck.stressLevel}/10) zvyšuje riziko impulzivních vstupů.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Stres: ${morningCheck.stressLevel}/10`)
      tips.push("Udělej 15-20min deep breathing před tradingem")
      tips.push("Zvaž redukci velikosti pozic na 30-50%")
      tips.push("Dělej častější pauzy - každých 30 minut")
    } else if (lowFocus) {
      message = `Nízký focus (${morningCheck.focus}/10) zvyšuje riziko špatných vstupů o 40%.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Focus: ${morningCheck.focus}/10`)
      tips.push("Běž se na 15-20min projít venku před tradingem")
      tips.push("Zavři všechny nepotřebné aplikace")
      tips.push("Dělej Pomodoro - 25min focus, 5min pauza")
    } else if (lowEnergy) {
      message = `Nízká energie (${morningCheck.energyLevel}/10) může vést k únavě a horším rozhodnutím.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Energie: ${morningCheck.energyLevel}/10`)
      tips.push("Dej si zdravou snídani s proteiny")
      tips.push("Zkus 10-15min lehkého cvičení")
      tips.push("Zvaž kratší trading session - max 2-3 hodiny")
    } else if (badMood) {
      message = `Emoční stav není ideální (${morningCheck.emotionalState}/10). Riziko revenge tradingu.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Emoční stav: ${morningCheck.emotionalState}/10`)
      tips.push("Vezmi si pauzu, udělej něco co tě uklidní")
      tips.push("Zvaž vynechání tradingu dnes")
      tips.push("Zapiš si své emoce do journalu")
    } else if (goodConditions) {
      message = `Výborné podmínky! Readiness ${readinessScore}%, jsi připravený na obchodování.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Všechny metriky v optimálním rozsahu`)
      tips.push("Drž se svého trading plánu")
      tips.push("Sleduj své emoce během tradingu")
      tips.push("Dělej pravidelné pauzy každou hodinu")
    } else {
      message = `Readiness ${readinessScore}% je pod hranicí 70%. Zvaž snížení risku.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Readiness: ${readinessScore}%`)
      tips.push("Prioritou je tvé zdraví a dlouhodobý úspěch")
      tips.push("Dnes je lepší den na odpočinek nebo vzdělávání")
    }

    // Add positive detail if available and not already the main focus
    if (highFocus && !lowFocus) details.push("Focus: Excelentní (Silná stránka)")
    else if (lowStressMetric && !highStress) details.push("Stres: Minimální (Výhoda)")
    else if (highEnergy && !lowEnergy) details.push("Energie: Vysoká (Palivo)")

    return { message, tips, details }
  }


  const tradingDecision = generateTradingDecision(todayEntry?.morningCheck, readinessScore)

  // Generate insights
  const generateInsights = (morningCheck?: MorningCheckData) => {
    if (!morningCheck) return []

    const insights = []

    if (morningCheck.sleepQuality < 6 || morningCheck.sleepHours < 6) {
      insights.push({
        icon: Moon,
        category: "Spánek",
        severity: "high",
        message: "Nedostatečný spánek může negativně ovlivnit tvé rozhodování",
        action: "Zkus dnes dřív jít spát. Ideálně 7-9 hodin spánku.",
      })
    }

    if (morningCheck.stressLevel > 7) {
      insights.push({
        icon: AlertTriangle,
        category: "Stres",
        severity: "high",
        message: "Vysoká úroveň stresu zvyšuje riziko emočního tradingu",
        action: "Zvaž redukci pozice nebo vynechání obchodování dnes.",
      })
    }

    if (morningCheck.focus < 6) {
      insights.push({
        icon: Brain,
        category: "Focus",
        severity: "medium",
        message: "Nízký focus může vést k přehlédnutí důležitých signálů",
        action: "10 minut meditace nebo krátká procházka mohou pomoci.",
      })
    }

    if (morningCheck.energyLevel < 5) {
      insights.push({
        icon: Zap,
        category: "Energie",
        severity: "medium",
        message: "Nízká energie snižuje tvou schopnost držet se plánu",
        action: "Zkus lehké cvičení nebo zdravou snídani pro boost energie.",
      })
    }

    if (!morningCheck.exercised && morningCheck.energyLevel < 7) {
      insights.push({
        icon: Activity,
        category: "Aktivita",
        severity: "low",
        message: "Fyzická aktivita může zlepšit tvůj trading mindset",
        action: "I 15 minut pohybu může výrazně zvýšit focus a energii.",
      })
    }

    if (morningCheck.emotionalState < 6) {
      insights.push({
        icon: Heart,
        category: "Emoce",
        severity: "medium",
        message: "Negativní emoční stav může vést k impulzivním rozhodnutím",
        action: "Vezmi si pauzu před tradingem. Udělej něco, co tě uklidní.",
      })
    }

    return insights.slice(0, 3) // Max 3 insights
  }

  const insights = generateInsights(todayEntry?.morningCheck)

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-6 pt-4 sm:pt-6">
      <div className="md:mb-12 mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl md:p-8 p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="md:h-16 md:w-16 h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <Target className="md:h-9 md:w-9 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="md:text-7xl text-4xl font-black bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Daily Tracker
                </h1>
                <p className="md:text-lg text-sm text-muted-foreground mt-1 md:block hidden">
                  {tradingStyle === "scalper" &&
                    (isLiveMode ? "Track your sessions 🚀" : "Demo režim 🎮")}
                  {tradingStyle === "daytrader" &&
                    (isLiveMode ? "Tvé shrnutí 📊" : "Demo režim 🎮")}
                  {tradingStyle === "swingtrader" &&
                    (isLiveMode ? "Monitor positions 📈" : "Demo režim 🎮")}
                  {!tradingStyle &&
                    (isLiveMode ? "Tvé shrnutí 📊" : "Demo režim 🎮")}
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                "md:text-base text-sm md:px-6 px-4 md:py-2 py-1 rounded-full",
                isLiveMode
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/20 text-sky-400 border-sky-500/30",
              )}
            >
              {isLiveMode ? "🔴 Live" : "🎮 Virtual"}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:h-16 h-14 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 rounded-xl md:text-base text-sm font-bold"
          >
            <Target className="md:h-5 md:w-5 h-4 w-4 mr-2" />
            <span className="md:inline hidden">Dnešní Shrnutí</span>
            <span className="md:hidden inline">Dnes</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 rounded-xl md:text-base text-sm font-bold"
          >
            <CalendarIcon className="md:h-5 md:w-5 h-4 w-4 mr-2" />
            Historie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 md:space-y-8">
          {todayEntry?.morningCheck && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-3xl blur-2xl" />
                <Card className="relative border-2 border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl">
                  <CardHeader className="md:p-6 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className="md:h-20 md:w-20 h-14 w-14 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                            <TrendingUp className="md:h-12 md:w-12 h-8 w-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className="md:text-6xl text-3xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                              Readiness
                            </CardTitle>
                            <CardDescription className="md:text-xl text-sm mt-1 md:block hidden">
                              Tvá připravenost na dnešní den
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn("md:text-8xl text-6xl font-black", getReadinessColor(readinessScore))}>
                          {readinessScore}%
                        </div>
                        <Badge
                          className={cn(
                            "mt-3 md:text-base text-sm md:px-6 px-4 md:py-2 py-1",
                            `bg-gradient-to-r ${getReadinessStatus(readinessScore).color} text-white border-0`,
                          )}
                        >
                          {getReadinessStatus(readinessScore).text}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="md:p-6 p-4">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Celková připravenost</span>
                          <span className="text-white font-bold">{readinessScore}/100</span>
                        </div>
                        <Progress value={readinessScore} className="h-3" />
                      </div>

                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Moon className="h-4 w-4 text-indigo-400" />
                            <span className="text-xs text-muted-foreground">Spánek</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.sleepQuality}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">Energie</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.energyLevel}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-400" />
                            <span className="text-xs text-muted-foreground">Focus</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.focus}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-xs text-muted-foreground">Stres</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.stressLevel}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-pink-400" />
                            <span className="text-xs text-muted-foreground">Nálada</span>
                          </div>
                          <div className="text-xl font-black text-white">
                            {todayEntry.morningCheck.emotionalState}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {tradingDecision && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-2xl" />
                  <Card
                    className={cn(
                      "relative border-2 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl",
                      readinessScore >= 70 ? "border-green-500/30" : "border-amber-500/30",
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-3xl">
                        <Brain className="h-8 w-8 text-purple-400" />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          AI Trading Insights
                        </span>
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">
                        Detailní analýza a personalizovaný feedback
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Main Message */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
                          <div className="text-xl font-bold text-white leading-relaxed">{tradingDecision.message}</div>
                        </div>

                        {tradingDecision.details.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="h-5 w-5 text-cyan-400" />
                              <h3 className="text-lg font-bold text-white">Detailní Analýza:</h3>
                            </div>
                            <div className="space-y-2">
                              {tradingDecision.details.map((detail, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                                >
                                  <div className="text-sm text-white font-medium">{detail}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-bold text-white">Akční Kroky:</h3>
                          </div>
                          <div className="space-y-2">
                            {tradingDecision.tips.map((tip, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
                              >
                                <ArrowRight className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div className="text-base text-white font-medium">{tip}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Insights & Recommendations */}
              {insights.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-2xl" />
                  <Card className="relative border-2 border-amber-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-3xl">
                        <Lightbulb className="h-8 w-8 text-amber-400" />
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                          Insights & Doporučení
                        </span>
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Personalizované tipy pro zlepšení tvého trading výkonu
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insights.map((insight, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-5 rounded-2xl border-2 bg-gradient-to-br from-slate-900/50 to-slate-800/30",
                              insight.severity === "high" && "border-red-500/30",
                              insight.severity === "medium" && "border-yellow-500/30",
                              insight.severity === "low" && "border-blue-500/30",
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "p-3 rounded-xl",
                                  insight.severity === "high" && "bg-red-500/20",
                                  insight.severity === "medium" && "bg-yellow-500/20",
                                  insight.severity === "low" && "bg-blue-500/20",
                                )}
                              >
                                <insight.icon
                                  className={cn(
                                    "h-6 w-6",
                                    insight.severity === "high" && "text-red-400",
                                    insight.severity === "medium" && "text-yellow-400",
                                    insight.severity === "low" && "text-blue-400",
                                  )}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={cn(
                                      "text-xs",
                                      insight.severity === "high" && "bg-red-500/20 text-red-400 border-red-500/30",
                                      insight.severity === "medium" &&
                                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                      insight.severity === "low" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                    )}
                                  >
                                    {insight.category}
                                  </Badge>
                                  {insight.severity === "high" && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                      Vysoká priorita
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-white font-bold mb-2">{insight.message}</div>
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                                  <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-muted-foreground">{insight.action}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Stage Progress - Progressive Unlock */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />
            <Card className="relative border-2 border-violet-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-3xl">
                      <CheckCircle className="h-8 w-8 text-violet-400" />
                      <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        {tradingStyle === "scalper" && "Session Flow"}
                        {tradingStyle === "daytrader" && "Daily Trading Flow"}
                        {tradingStyle === "swingtrader" && "Position Management Flow"}
                        {!tradingStyle && "Daily Trading Flow"}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {tradingStyle === "scalper" && "Postupné odemykání session stages"}
                      {tradingStyle === "daytrader" && "Postupné odemykání stages během dne"}
                      {tradingStyle === "swingtrader" && "Postupné odemykání management stages"}
                      {!tradingStyle && "Postupné odemykání stages během dne"}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                      {todayStages.filter((s) => s.completed).length}/5
                    </div>
                    <div className="text-sm text-muted-foreground">dokončeno</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  {stageData.map((stage, index) => {
                    const stageStatus = todayStages.find((s) => s.id === stage.id)
                    const isCompleted = stageStatus?.completed || false
                    const isUnlocked = stageStatus?.unlocked || false
                    const isActive = !isCompleted && isUnlocked

                    return (
                      <div
                        key={stage.id}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                          isCompleted && `${stage.borderColor} ${stage.bgColor}`,
                          isActive && "border-yellow-500/50 bg-yellow-500/10 animate-pulse",
                          !isUnlocked && "border-slate-700/50 bg-slate-800/30 opacity-40 cursor-not-allowed",
                          isUnlocked && !isCompleted && "hover:scale-105 cursor-pointer",
                        )}
                        onClick={() => {
                          if (isUnlocked) {
                            router.push(stage.href)
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-white/5 to-transparent" />
                        <div className="relative p-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div
                              className={cn(
                                "relative p-4 rounded-2xl",
                                isCompleted && `bg-gradient-to-br ${stage.color}`,
                                isActive && "bg-gradient-to-br from-yellow-500 to-orange-500",
                                !isUnlocked && "bg-slate-700/50",
                              )}
                            >
                              <stage.icon
                                className={cn(
                                  "h-8 w-8",
                                  (isCompleted || isActive) && "text-white",
                                  !isUnlocked && "text-slate-500",
                                )}
                              />
                              {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl">
                                  <Lock className="h-6 w-6 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div
                                className={cn(
                                  "text-sm font-bold mb-1",
                                  isCompleted && "text-white",
                                  isActive && "text-yellow-400",
                                  !isUnlocked && "text-slate-500",
                                )}
                              >
                                Stage {stage.id}
                              </div>
                              <div
                                className={cn(
                                  "text-xs font-medium",
                                  (isCompleted || isActive) && "text-white",
                                  !isUnlocked && "text-slate-600",
                                )}
                              >
                                {stage.name}
                              </div>
                            </div>

                            <div>
                              {isCompleted && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Dokončeno
                                </Badge>
                              )}
                              {isActive && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  <Unlock className="h-3 w-3 mr-1" />
                                  Aktivní
                                </Badge>
                              )}
                              {!isUnlocked && (
                                <Badge className="bg-slate-700/20 text-slate-500 border-slate-700/30 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Zamčeno
                                </Badge>
                              )}
                            </div>
                          </div>

                          {index < 4 && (
                            <div
                              className={cn(
                                "absolute top-1/2 -right-2 w-4 h-0.5 transform -translate-y-1/2 z-10",
                                isCompleted ? "bg-gradient-to-r " + stage.color : "bg-slate-700/50",
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          {todayEntry && todayStages.filter((s) => s.completed).length < 5 && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <h3 className="text-2xl font-black mb-2">Pokračuj v Daily Flow!</h3>
                <p className="text-muted-foreground mb-6">
                  Dokončil jsi {todayStages.filter((s) => s.completed).length} z 5 stages. Pokračuj dál!
                </p>
                <Button
                  onClick={() => {
                    const nextIncomplete = todayStages.find((s) => !s.completed && s.unlocked)
                    if (nextIncomplete) {
                      const nextStage = stageData.find((sd) => sd.id === nextIncomplete.id)
                      if (nextStage) {
                        router.push(nextStage.href)
                      }
                    }
                  }}
                  size="lg"
                  className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <ArrowRight className="h-6 w-6 mr-2" />
                  Pokračovat
                </Button>
              </CardContent>
            </Card>
          )}

          {!todayEntry && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <CardContent className="p-16 text-center">
                <Sun className="h-24 w-24 mx-auto mb-6 text-orange-400" />
                <h3 className="text-3xl font-black mb-4">Začni Dnešní Den!</h3>
                <p className="text-xl text-muted-foreground mb-8">
                  Ještě jsi nezačal dnešní Daily Trading Flow. Začni Morning Assessment!
                </p>
                <Button
                  onClick={() => router.push("/morning-check")}
                  size="lg"
                  className="h-16 px-12 text-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                >
                  <Sun className="h-6 w-6 mr-2" />
                  Začít Morning Check
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-8">
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => {
                const entryReadiness = entry.morningCheck?.score || 0
                const isExpanded = expandedEntry === entry.date

                return (
                  <Card
                    key={entry.date}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-white/10 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div
                        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.date)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <CalendarIcon className="h-8 w-8 text-sky-400" />
                            </div>
                            <div>
                              <div className="text-xl font-black mb-1">
                                {format(new Date(entry.date), "EEEE, d. MMMM", { locale: cs })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(entry.date), "yyyy")}
                              </div>
                              {entry.date === format(new Date(), "yyyy-MM-dd") && (
                                <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                                  <Target className="h-3 w-3 mr-1" />
                                  Dnes
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {entry.morningCheck && (
                              <div className="text-center">
                                <div className={cn("text-4xl font-black", getReadinessColor(entryReadiness))}>
                                  {entryReadiness}%
                                </div>
                                <div className="text-xs text-muted-foreground">readiness</div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-2xl font-black mb-1">{entry.stagesCompleted}/5</div>
                              <div className="text-xs text-muted-foreground">stages</div>
                            </div>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? "Skrýt" : "Zobrazit"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && entry.morningCheck && (
                        <div className="border-t border-white/10 p-6 bg-white/5">
                          
                          {/* Stage 5 - Daily Summary (Highlighted) */}
                          {entry.stagesCompleted >= 5 && (
                            <div className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 border-2 border-purple-500/30 mb-8">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                  <Moon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Shrnutí Dne
                                  </h3>
                                  <p className="text-sm text-muted-foreground">Stage 5 - Kompletní přehled dne</p>
                                </div>
                              </div>

                              {/* Trading Performance */}
                              {entry.trades && entry.trades.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-400" />
                                    Obchodní Výsledky
                                  </h4>
                                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                                      <div className="text-xs text-muted-foreground mb-1">Celkové P&L</div>
                                      <div className={cn(
                                        "text-2xl font-black",
                                        entry.trades.reduce((sum, t) => sum + t.pnl, 0) > 0 ? "text-emerald-400" : "text-rose-400"
                                      )}>
                                        {entry.trades.reduce((sum, t) => sum + t.pnl, 0) > 0 ? "+" : ""}
                                        {entry.trades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)} $
                                      </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                                      <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                                      <div className="text-2xl font-black text-blue-400">
                                        {Math.round((entry.trades.filter(t => t.pnl > 0).length / entry.trades.length) * 100)}%
                                      </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                                      <div className="text-xs text-muted-foreground mb-1">Počet Obchodů</div>
                                      <div className="text-2xl font-black text-white">{entry.trades.length}</div>
                                    </div>
                                  </div>

                                  {/* Trade List */}
                                  <div className="space-y-2">
                                    {entry.trades.map((trade, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-white/5 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            trade.pnl > 0 ? "bg-emerald-500" : "bg-rose-500"
                                          )} />
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-white text-sm">{trade.pair}</span>
                                              <Badge variant="outline" className={cn(
                                                "text-[10px] px-1.5 py-0 h-4 border-0",
                                                trade.direction === "Long" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                              )}>
                                                {trade.direction}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {trade.entryPrice} → {trade.exitPrice}
                                            </div>
                                          </div>
                                        </div>
                                        <div className={cn(
                                          "font-mono font-bold text-sm",
                                          trade.pnl > 0 ? "text-emerald-400" : "text-rose-400"
                                        )}>
                                          {trade.pnl > 0 ? "+" : ""}{trade.pnl.toFixed(2)} $
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* AI Insights from that day */}
                              {(() => {
                                const dayDecision = generateTradingDecision(entry.morningCheck, entryReadiness)
                                return (
                                  dayDecision && (
                                    <div>
                                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-purple-400" />
                                        AI Insights & Doporučení
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                          <div className="text-sm text-white font-medium leading-relaxed">{dayDecision.message}</div>
                                        </div>
                                        {dayDecision.details.length > 0 && (
                                          <div className="space-y-2">
                                            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Detailní Analýza</div>
                                            {dayDecision.details.map((detail, i) => (
                                              <div key={i} className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                                                <div className="text-xs text-white">{detail}</div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        {dayDecision.tips.length > 0 && (
                                          <div className="space-y-2">
                                            <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Akční Kroky</div>
                                            {dayDecision.tips.map((tip, i) => (
                                              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                                                <ArrowRight className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-white">{tip}</div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )
                              })()}

                              {/* Morning Readiness Summary */}
                              <div>
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Sun className="h-5 w-5 text-orange-400" />
                                  Ranní Připravenost
                                </h4>
                                <div className="grid md:grid-cols-5 gap-3">
                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Moon className="h-4 w-4 text-indigo-400" />
                                      <span className="text-xs text-muted-foreground">Spánek</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{entry.morningCheck.sleepHours}h</div>
                                    <div className="text-xs text-muted-foreground">
                                      kvalita {entry.morningCheck.sleepQuality}/10
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Zap className="h-4 w-4 text-yellow-400" />
                                      <span className="text-xs text-muted-foreground">Energie</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{entry.morningCheck.energyLevel}/10</div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Brain className="h-4 w-4 text-purple-400" />
                                      <span className="text-xs text-muted-foreground">Focus</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{entry.morningCheck.focus}/10</div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertTriangle className="h-4 w-4 text-red-400" />
                                      <span className="text-xs text-muted-foreground">Stres</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{entry.morningCheck.stressLevel}/10</div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Heart className="h-4 w-4 text-pink-400" />
                                      <span className="text-xs text-muted-foreground">Nálada</span>
                                    </div>
                                    <div className="text-lg font-black text-white">{entry.morningCheck.emotionalState}/10</div>
                                  </div>
                                </div>
                              </div>

                              {/* Goals & Plan Summary */}
                              {entry.intention && (
                                <div>
                                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-400" />
                                    Cíle & Plán
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                      <div className="text-xs text-blue-400 mb-1 font-semibold">Cíle dne:</div>
                                      <div className="text-sm text-white">{entry.intention.goals}</div>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 flex-1">
                                        <div className="text-xs text-blue-400 mb-1 font-semibold">Max Risk:</div>
                                        <div className="text-sm text-white">{entry.intention.maxRiskPercent}%</div>
                                      </div>
                                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 flex-1">
                                        <div className="text-xs text-blue-400 mb-1 font-semibold">Emoční Cíl:</div>
                                        <div className="text-sm text-white">{entry.intention.emotionalGoal}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show simplified view if Stage 5 not completed */}
                          {entry.stagesCompleted < 5 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Moon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p className="text-lg font-medium">Stage 5 nebyla dokončena</p>
                              <p className="text-sm mt-1">Zobrazují se pouze základní metriky z Morning Check</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-white/10">
              <CardContent className="p-16 text-center">
                <CalendarIcon className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-3xl font-black mb-4">Zatím Žádné Záznamy</h3>
                <p className="text-xl text-muted-foreground mb-8">Začni sledovat svůj den!</p>
                <Button onClick={() => router.push("/morning-check")} size="lg" className="h-14 px-8 text-lg">
                  <Target className="h-6 w-6 mr-2" />
                  Začít Morning Check
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
