"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sun,
  CheckCircle,
  BookOpen,
  Moon,
  Target,
  DollarSign,
  CalendarIcon,
  Lock,
  Unlock,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Activity,
  Brain,
  Heart,
  Zap,
  ArrowRight,
  Clock,
  Shield,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useTradingStyle } from "@/contexts/trading-style-context"
import { generateVirtualDailyTrackerData } from "@/data/demo-daily-tracker"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useData } from "@/contexts/data-context"
import { supabase } from "@/lib/supabase/browser"

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

// Define stageData here
const stageData = [
  {
    id: 1,
    name: "Morning Check",
    icon: Sun,
    href: "/morning-check",
    color: "from-orange-500 to-rose-500",
    bgColor: "bg-gradient-to-br from-orange-500/20 to-rose-500/20",
    borderColor: "border-orange-500/30",
  },
  {
    id: 2,
    name: "Daily Intention",
    icon: Target,
    href: "/daily-intention",
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/30",
  },
  {
    id: 3,
    name: "Trading Plan",
    icon: BookOpen,
    href: "/trading-plan",
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-gradient-to-br from-cyan-500/20 to-teal-500/20",
    borderColor: "border-cyan-500/30",
  },
  {
    id: 4,
    name: "Record Trades",
    icon: Clock,
    href: "/record-trades",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: 5,
    name: "Daily Summary",
    icon: Shield,
    href: "/daily-summary",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
  },
]

export default function DailyTrackerPage() {
  const { isLiveMode, isLoading: modeLoading } = useLiveMode()
  // FIX: Moved supabase initialization here to resolve "use before declaration" error.
  const localSupabase = supabase
  const router = useRouter()
  const { toast } = useToast() // Initialize useToast
  const { morningChecks, trades, dailyIntentions, tradingPlans } = useData() // Get from DataContext

  const { stages } = useDailyStage()

  const { tradingStyle, config } = useTradingStyle()
  const { user, authReady } = useAuth()

  const [entries, setEntries] = useState<DailySummary[]>([])
  const [activeTab, setActiveTab] = useState("today")
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [virtualData, setVirtualData] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // State for triggering refresh
  const [entriesLoading, setEntriesLoading] = useState(true)

  useEffect(() => {
    // Wait for auth and mode to be ready before deciding
    if (!authReady || modeLoading) {
      console.log("[v0] [DailyTracker] Waiting for auth/mode to stabilize before data decision...")
      return
    }

    // Now we can trust isLiveMode value
    if (isLiveMode) {
      console.log("[v0] [DailyTracker] LIVE MODE confirmed - NO virtual data will be generated")
      setVirtualData(null)
    } else {
      // Only generate virtual data in confirmed VIRTUAL mode
      const data = generateVirtualDailyTrackerData()
      console.log("[v0] [DailyTracker] VIRTUAL MODE confirmed - generating demo data")
      setVirtualData(data)
    }
  }, [isLiveMode, authReady, modeLoading])

  const loadEntries = useCallback(async () => {
    // Guard: wait for auth and mode to be ready
    if (!authReady || modeLoading) {
      console.log("[v0] [DailyTracker] loadEntries skipped - waiting for auth/mode")
      return
    }

    if (!isLiveMode) {
      console.log("[v0] [DailyTracker] VIRTUAL mode - using demo data instead of Supabase")
      setEntriesLoading(false)
      return
    }

    if (!user?.id) {
      console.log("[v0] [DailyTracker] LIVE mode but no user - skipping load")
      setEntriesLoading(false)
      return
    }

    console.log(`[v0] [DailyTracker] LIVE MODE: Loading entries from Supabase for user ${user.id}`)
    setEntriesLoading(true)

    try {
      // Construct daily summaries from DataContext data (already loaded from Supabase)
      const combinedData: DailySummary[] = []
      const allDates = new Set<string>()

      morningChecks.forEach((m: any) => allDates.add(m.date))
      trades.forEach((t: any) => allDates.add(t.date))
      dailyIntentions?.forEach((i: any) => allDates.add(i.date))
      tradingPlans?.forEach((p: any) => allDates.add(p.date))

      allDates.forEach((date) => {
        const morningCheck = morningChecks.find((m: any) => m.date === date)
        const dayTrades = trades.filter((t: any) => t.date === date)
        const intention = dailyIntentions?.find((i: any) => i.date === date)
        const plan = tradingPlans?.find((p: any) => p.date === date)

        // Only push if at least one stage is present for the date
        if (morningCheck || intention || plan || dayTrades.length > 0) {
          let stagesCompleted = 0
          if (morningCheck) stagesCompleted++
          if (intention) stagesCompleted++
          if (plan) stagesCompleted++
          if (dayTrades.length > 0) stagesCompleted++

          combinedData.push({
            date,
            morningCheck,
            intention,
            plan,
            trades: dayTrades,
            overallScore: morningCheck?.score || 0,
            stagesCompleted: stagesCompleted,
          })
        }
      })

      combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(combinedData)
      console.log(`[v0] [DailyTracker] LIVE: Loaded ${combinedData.length} daily entries from Supabase data`)
    } catch (error) {
      console.error("[v0] [DailyTracker] Error loading entries:", error)
    } finally {
      setEntriesLoading(false)
    }
  }, [isLiveMode, user?.id, authReady, modeLoading, morningChecks, trades, dailyIntentions, tradingPlans])

  useEffect(() => {
    loadEntries()
  }, [loadEntries, refreshTrigger])

  if (!authReady || modeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    )
  }

  if (isLiveMode && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <p className="text-muted-foreground">Pro LIVE mód se prosím přihlaste</p>
          <Button onClick={() => router.push("/auth/login")}>Přihlásit se</Button>
        </div>
      </div>
    )
  }

  const todayEntry = isLiveMode ? entries.find((e) => e.date === format(new Date(), "yyyy-MM-dd")) : virtualData?.[0] // First entry is today in demo data

  const readinessScore = isLiveMode
    ? (todayEntry?.morningCheck?.score ?? null)
    : (virtualData?.[0]?.morningCheck?.score ?? null)

  const getReadinessColor = (score: number | null) => {
    if (score === null) return "text-gray-400"
    if (score >= 75) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getReadinessStatus = (score: number | null) => {
    if (score === null) return { text: "Nevyplněno", color: "from-gray-500 to-slate-500" }
    if (score >= 75) return { text: "Dobré podmínky ✅", color: "from-green-500 to-emerald-500" }
    if (score >= 60) return { text: "Buď opatrný ⚠️", color: "from-yellow-500 to-orange-500" }
    return { text: "Neobchoduj 🛑", color: "from-red-500 to-rose-500" }
  }

  // Generate trading decision based on readiness score and morning check data
  const generateTradingDecision = (morningCheckData?: MorningCheckData, score?: number | null) => {
    const currentMorningCheck = morningCheckData || virtualData?.[0]?.morningCheck
    const currentReadinessScore = score ?? virtualData?.[0]?.score ?? null

    if (!currentMorningCheck || currentReadinessScore === undefined || currentReadinessScore === null) {
      return {
        message: "Vyplň Morning Check pro získání doporučení.",
        tips: ["Dokončete ranní vyhodnocení pro personalizované tipy"],
        details: ["Morning Check nevyplněn"],
      }
    }

    let message = ""
    const tips: string[] = []
    const details: string[] = []

    // Analyze metrics for potential issues
    const poorSleep = currentMorningCheck.sleepQuality < 6 || currentMorningCheck.sleepHours < 6
    const highStress = currentMorningCheck.stressLevel > 7
    const lowFocus = currentMorningCheck.focus < 6
    const lowEnergy = currentMorningCheck.energyLevel < 5
    const badMood = currentMorningCheck.emotionalState < 6
    const goodConditions = currentReadinessScore >= 70

    // Analyze positives for confidence boost
    const highFocus = currentMorningCheck.focus >= 8
    const lowStressMetric = currentMorningCheck.stressLevel <= 3
    const highEnergy = currentMorningCheck.energyLevel >= 8
    const goodMood = currentMorningCheck.emotionalState >= 8
    const goodSleep = currentMorningCheck.sleepQuality >= 8 && currentMorningCheck.sleepHours >= 7

    let positiveNote = ""
    if (highFocus) positiveNote = "Tvůj focus je dnes excelentní, to je tvá super-schopnost."
    else if (lowStressMetric) positiveNote = "Jsi velmi klidný, což je perfektní pro disciplínu."
    else if (highEnergy) positiveNote = "Máš skvělou energii, využij ji pro trpělivost."
    else if (goodMood) positiveNote = "Tvá pozitivní nálada ti pomůže zvládat emoce."
    else if (goodSleep) positiveNote = "Jsi kvalitně vyspaný, tvá mysl je ostrá."

    // Generate main message based on primary issue
    if (poorSleep) {
      message = `Naspal jsi jen ${currentMorningCheck.sleepHours}h (kvalita ${currentMorningCheck.sleepQuality}/10). Nedostatek spánku snižuje rozhodování o 30-40%.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Spánek: ${currentMorningCheck.sleepHours}h, kvalita ${currentMorningCheck.sleepQuality}/10`)
      tips.push("Dej si 10-15min meditaci před tradingem")
      tips.push("Zvaž vynechání tradingu nebo max 1-2 trades s polovičním riskem")
      tips.push("Dnes večer jdi spát o 1-2 hodiny dříve")
    } else if (highStress) {
      message = `Vysoká úroveň stresu (${currentMorningCheck.stressLevel}/10) zvyšuje riziko impulzivních vstupů.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Stres: ${currentMorningCheck.stressLevel}/10`)
      tips.push("Udělej 15-20min deep breathing před tradingem")
      tips.push("Zvaž redukci velikosti pozic na 30-50%")
      tips.push("Dělej častější pauzy - každých 30 minut")
    } else if (lowFocus) {
      message = `Nízký focus (${currentMorningCheck.focus}/10) zvyšuje riziko špatných vstupů o 40%.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Focus: ${currentMorningCheck.focus}/10`)
      tips.push("Běž se na 15-20min projít venku před tradingem")
      tips.push("Zavři všechny nepotřebné aplikace")
      tips.push("Dělej Pomodoro - 25min focus, 5min pauza")
    } else if (lowEnergy) {
      message = `Nízká energie (${currentMorningCheck.energyLevel}/10) může vést k únavě a horším rozhodnutím.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Energie: ${currentMorningCheck.energyLevel}/10`)
      tips.push("Dej si zdravou snídani s proteiny")
      tips.push("Tkus 10-15min lehkého cvičení")
      tips.push("Zvaž kratší trading session - max 2-3 hodiny")
    } else if (badMood) {
      message = `Emoční stav není ideální (${currentMorningCheck.emotionalState}/10). Riziko revenge tradingu.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Emoční stav: ${currentMorningCheck.emotionalState}/10`)
      tips.push("Vezmi si pauzu, udělej něco co tě uklidní")
      tips.push("Zvaž vynechání tradingu dnes")
      tips.push("Zapiš si své emoce do journalu")
    } else if (goodConditions) {
      message = `Výborné podmínky! Readiness ${currentReadinessScore}%! Jsi připravený na obchodování.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Všechny metriky v optimálním rozsahu`)
      tips.push("Drž se svého trading plánu")
      tips.push("Sleduj své emoce během tradingu")
      tips.push("Dělej pravidelné pauzy každou hodinu")
    } else {
      message = `Readiness ${currentReadinessScore}% je pod hranicí 70%. Zvaž snížení risku.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(`Readiness: ${currentReadinessScore}%`)
      tips.push("Prioritou je tvé zdraví a dlouhodobý úspěch")
      tips.push("Dnes je lepší den na odpočinek nebo vzdělávání")
    }

    // Add positive detail if available and not already the main focus
    if (highFocus && !lowFocus) details.push("Focus: Excelentní (Silná stránka)")
    else if (lowStressMetric && !highStress) details.push("Stres: Minimální (Výhoda)")
    else if (highEnergy && !lowEnergy) details.push("Energie: Vysoká (Palivo)")

    return { message, tips, details }
  }

  const tradingDecision = generateTradingDecision(
    isLiveMode ? todayEntry?.morningCheck : virtualData?.[0]?.morningCheck,
    readinessScore,
  )

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
        action: "Tkus lehké cvičení nebo zdravou snídani pro boost energie.",
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

  // Define todayStages here, based on the 'stages' from useDailyStage hook
  const todayStages = stages.map((stage) => ({
    ...stage,
    // In virtual mode, all stages are considered completed and unlocked for display purposes
    completed: !isLiveMode ? true : stage.completed,
    unlocked: !isLiveMode ? true : stage.unlocked,
  }))

  const isMorningCheckCompleted = todayStages.find((s) => s.id === 1)?.completed || false

  // Update handleStageComplete to save to Supabase in LIVE mode
  const handleStageComplete = async (stageNum: number, data: Record<string, unknown>) => {
    try {
      if (stageNum === 1) {
        // Stage 1 = Morning Check
        if (isLiveMode) {
          const { error } = await localSupabase.from("morning_checks").upsert(
            // FIX: Used localSupabase here
            {
              user_id: user?.id,
              date: new Date().toISOString().split("T")[0],
              sleep_hours: data.sleepHours || 0,
              sleep_quality: data.sleepQuality || 0,
              energy_level: data.energyLevel || 0,
              stress_level: data.stressLevel || 0,
              focus: data.focus || 0,
              physical_health: data.physicalHealth || 0,
              emotional_state: data.emotionalState || 0,
              exercised: data.exercised || false,
              meditation: data.meditationTime || 0,
              morning_routine: data.morningRoutine || false,
              // Removed hydration from upsert data to match updated schema
              score: data.score || 0,
            },
            { onConflict: "user_id,date" },
          )

          if (error) throw error
          console.log("[v0] Morning check saved to Supabase for LIVE mode")

          setRefreshTrigger((prev) => prev + 1)
        } else {
          // Keep existing localStorage logic for VIRTUAL mode
          // In virtual mode, we don't need to save to localStorage here as virtualData is static for the session
          // If you were to implement a virtual mode that persists, you would add localStorage logic here.
          console.log("[v0] Virtual mode: Morning check data not saved to localStorage.")
        }
      } else if (stageNum === 2) {
        // Stage 2 = Daily Intention
        if (isLiveMode) {
          const { error } = await localSupabase.from("daily_intentions").upsert(
            // FIX: Used localSupabase here
            {
              user_id: user?.id,
              date: new Date().toISOString().split("T")[0],
              goals: data.goals || "",
              max_risk_percent: data.maxRiskPercent || 0,
              emotional_goal: data.emotionalGoal || "",
              strategy: data.strategy || "",
            },
            { onConflict: "user_id,date" },
          )

          if (error) throw error
          console.log("[v0] Daily intention saved to Supabase for LIVE mode")
          setRefreshTrigger((prev) => prev + 1)
        } else {
          console.log("[v0] Virtual mode: Daily intention data not saved to localStorage.")
        }
      } else if (stageNum === 3) {
        // Stage 3 = Trading Plan
        if (isLiveMode) {
          const { error } = await localSupabase.from("trading_plans").upsert(
            // FIX: Used localSupabase here
            {
              user_id: user?.id,
              date: new Date().toISOString().split("T")[0],
              setups: data.setups || "",
              pairs: data.pairs || "",
              timeframes: data.timeframes || "",
              entry_rules: data.entryRules || "",
              exit_rules: data.exitRules || "",
              stop_loss: data.stopLoss || "",
              take_profit: data.takeProfit || "",
              market_analysis: data.marketAnalysis || "",
              key_levels: data.keyLevels || "",
              notes: data.notes || "",
            },
            { onConflict: "user_id,date" },
          )

          if (error) throw error
          console.log("[v0] Trading plan saved to Supabase for LIVE mode")
          setRefreshTrigger((prev) => prev + 1)
        } else {
          console.log("[v0] Virtual mode: Trading plan data not saved to localStorage.")
        }
      } else if (stageNum === 4) {
        // Stage 4 = Record Trades
        if (isLiveMode) {
          // This part is more complex as it involves an array of trades.
          // We might need to fetch existing trades for the day and then update/add.
          // For simplicity here, we'll assume 'data' contains an array of trades to be added.
          // A more robust solution would involve fetching, merging, and then upserting.
          const dailyTrades = (data.trades as Trade[]) || []
          const date = new Date().toISOString().split("T")[0]

          for (const trade of dailyTrades) {
            const { error } = await localSupabase.from("trade_records").upsert({
              // FIX: Used localSupabase here
              user_id: user?.id,
              date: date,
              pair: trade.pair,
              direction: trade.direction,
              entry_price: trade.entryPrice,
              exit_price: trade.exitPrice,
              pnl: trade.pnl,
              notes: trade.notes,
            })
            if (error) throw error
          }
          console.log("[v0] Trade records saved to Supabase for LIVE mode")
          setRefreshTrigger((prev) => prev + 1)
        } else {
          console.log("[v0] Virtual mode: Trade records data not saved to localStorage.")
        }
      }
    } catch (error) {
      console.error(`[v0] Error saving stage ${stageNum}:`, error)
      toast({ title: "Error", description: `Failed to save stage ${stageNum}` })
    }
  }

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
                  {tradingStyle === "scalper" && (isLiveMode ? "Track your sessions 🚀" : "Demo režim 🎮")}
                  {tradingStyle === "daytrader" && (isLiveMode ? "Tvé shrnutí 📊" : "Demo režim 🎮")}
                  {tradingStyle === "swingtrader" && (isLiveMode ? "Monitor positions 📈" : "Demo režim 🎮")}
                  {!tradingStyle && (isLiveMode ? "Tvé shrnutí 📊" : "Demo režim 🎮")}
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
          {(todayEntry?.morningCheck || virtualData?.[0]?.morningCheck) && (
            <>
              {isMorningCheckCompleted && readinessScore !== null && (
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
                            {readinessScore !== null ? `${readinessScore}%` : "Nevyplněno"}
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
                            {/* Display "Nevyplněno" instead of 0% in UI */}
                            <span className="text-white font-bold">
                              {readinessScore !== null ? `${readinessScore}/100` : "Nevyplněno"}
                            </span>
                          </div>
                          <Progress value={readinessScore ?? 0} className="h-3" />
                        </div>

                        <div className="grid md:grid-cols-5 gap-4">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Moon className="h-4 w-4 text-indigo-400" />
                              <span className="text-xs text-muted-foreground">Spánek</span>
                            </div>
                            <div className="text-xl font-black text-white">
                              {todayEntry.morningCheck?.sleepQuality}/10
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-4 w-4 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">Energie</span>
                            </div>
                            <div className="text-xl font-black text-white">
                              {todayEntry.morningCheck?.energyLevel}/10
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-purple-400" />
                              <span className="text-xs text-muted-foreground">Focus</span>
                            </div>
                            <div className="text-xl font-black text-white">{todayEntry.morningCheck?.focus}/10</div>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <span className="text-xs text-muted-foreground">Stres</span>
                            </div>
                            <div className="text-xl font-black text-white">
                              {todayEntry.morningCheck?.stressLevel}/10
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4 text-pink-400" />
                              <span className="text-xs text-muted-foreground">Nálada</span>
                            </div>
                            <div className="text-xl font-black text-white">
                              {todayEntry.morningCheck?.emotionalState}/10
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="mt-6 p-6 bg-slate-800/50 rounded-2xl border border-cyan-500/20">
                <div className="flex items-start gap-4">
                  <Lightbulb className="h-6 w-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Insight</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {!isLiveMode ? virtualData?.[0]?.insight : tradingDecision.message}
                    </p>
                  </div>
                </div>
              </div>

              {tradingDecision && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-2xl" />
                  <Card
                    className={cn(
                      "relative border-2 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl",
                      readinessScore !== null && readinessScore >= 75 ? "border-green-500/30" : "border-amber-500/30",
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

                        {tradingDecision.details.length > 0 &&
                          tradingDecision.details[0] !== "Morning Check nevyplněn" && (
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
              {isMorningCheckCompleted && insights.length > 0 && (
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

          {/* Render loading state or content */}
          {entriesLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Načítání historie...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stageData.map((stage, index) => {
                // Use virtualData for stage status in virtual mode
                const isCompleted = !isLiveMode ? true : todayEntry && stages.find((s) => s.id === stage.id)?.completed
                const isUnlocked = !isLiveMode ? true : todayEntry && stages.find((s) => s.id === stage.id)?.unlocked
                const isActive = !isCompleted && isUnlocked

                return (
                  <Card
                    key={stage.id}
                    className={cn(
                      "relative overflow-hidden border-2 transition-all duration-300",
                      isCompleted && `${stage.borderColor} ${stage.bgColor}`,
                      isActive && "border-yellow-500/50 bg-yellow-500/10 animate-pulse cursor-pointer",
                      !isUnlocked && "border-slate-700/50 bg-slate-800/30 opacity-40 cursor-not-allowed",
                      isUnlocked && !isCompleted && "hover:scale-105 cursor-pointer",
                    )}
                    onClick={() => {
                      if (isUnlocked && stage.href) {
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
                  </Card>
                )
              })}
            </div>
          )}

          {/* Continue Button */}
          {(!isLiveMode || (todayEntry && todayStages.filter((s) => s.completed).length < 5)) && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <h3 className="text-2xl font-black mb-2">Pokračuj v Daily Flow!</h3>
                <p className="text-muted-foreground mb-6">
                  Dokončil jsi{" "}
                  {!isLiveMode ? virtualData?.[0]?.stagesCompleted : todayStages.filter((s) => s.completed).length} z 5
                  stages. Pokračuj dál!
                </p>
                <Button
                  onClick={() => {
                    const nextStageId = !isLiveMode
                      ? virtualData?.[0]?.nextStageId
                      : todayStages.find((s) => !s.completed && s.unlocked)?.id
                    if (nextStageId) {
                      const nextStage = stageData.find((sd) => sd.id === nextStageId)
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

          {!todayEntry && !virtualData && (
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
                const entryReadiness = entry.morningCheck?.score ?? null
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
                                  {entryReadiness !== null ? `${entryReadiness}%` : "---"}
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
                                      <div
                                        className={cn(
                                          "text-2xl font-black",
                                          entry.trades.reduce((sum, t) => sum + t.pnl, 0) > 0
                                            ? "text-emerald-400"
                                            : "text-rose-400",
                                        )}
                                      >
                                        {entry.trades.reduce((sum, t) => sum + t.pnl, 0) > 0 ? "+" : ""}
                                        {entry.trades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)} $
                                      </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                                      <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                                      <div className="text-2xl font-black text-blue-400">
                                        {Math.round(
                                          (entry.trades.filter((t) => t.pnl > 0).length / entry.trades.length) * 100,
                                        )}
                                        %
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
                                          <div
                                            className={cn(
                                              "w-2 h-2 rounded-full",
                                              trade.pnl > 0 ? "bg-emerald-500" : "bg-rose-500",
                                            )}
                                          />
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-white text-sm">{trade.pair}</span>
                                              <Badge
                                                variant="outline"
                                                className={cn(
                                                  "text-[10px] px-1.5 py-0 h-4 border-0",
                                                  trade.direction === "Long"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-rose-500/10 text-rose-400",
                                                )}
                                              >
                                                {trade.direction}
                                              </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {trade.entryPrice} → {trade.exitPrice}
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          className={cn(
                                            "font-mono font-bold text-sm",
                                            trade.pnl > 0 ? "text-emerald-400" : "text-rose-400",
                                          )}
                                        >
                                          {trade.pnl > 0 ? "+" : ""}
                                          {trade.pnl.toFixed(2)} $
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
                                          <div className="text-sm text-white font-medium leading-relaxed">
                                            {dayDecision.message}
                                          </div>
                                        </div>
                                        {dayDecision.details.length > 0 &&
                                          dayDecision.details[0] !== "Morning Check nevyplněn" && (
                                            <div className="space-y-2">
                                              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                                                Detailní Analýza
                                              </div>
                                              {dayDecision.details.map((detail, i) => (
                                                <div
                                                  key={i}
                                                  className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
                                                >
                                                  <div className="text-xs text-white">{detail}</div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        {dayDecision.tips.length > 0 && (
                                          <div className="space-y-2">
                                            <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                                              Akční Kroky
                                            </div>
                                            {dayDecision.tips.map((tip, i) => (
                                              <div
                                                key={i}
                                                className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
                                              >
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
                                    <div className="text-lg font-black text-white">
                                      {entry.morningCheck.sleepHours}h
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      kvalita {entry.morningCheck.sleepQuality}/10
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Zap className="h-4 w-4 text-yellow-400" />
                                      <span className="text-xs text-muted-foreground">Energie</span>
                                    </div>
                                    <div className="text-lg font-black text-white">
                                      {entry.morningCheck.energyLevel}/10
                                    </div>
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
                                    <div className="text-lg font-black text-white">
                                      {entry.morningCheck.stressLevel}/10
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Heart className="h-4 w-4 text-pink-400" />
                                      <span className="text-xs text-muted-foreground">Nálada</span>
                                    </div>
                                    <div className="text-lg font-black text-white">
                                      {entry.morningCheck.emotionalState}/10
                                    </div>
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
            <Card className="border-2 border-slate-700/50 bg-slate-800/30">
              <CardContent className="p-16 text-center">
                <CalendarIcon className="h-24 w-24 mx-auto mb-6 text-slate-600" />
                <h3 className="text-3xl font-black mb-4 text-slate-400">Žádná Historie</h3>
                <p className="text-xl text-muted-foreground">
                  {isLiveMode
                    ? "Zatím nemáš žádné záznamy. Začni vyplněním Morning Check!"
                    : "V demo režimu se historie nezobrazuje."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
