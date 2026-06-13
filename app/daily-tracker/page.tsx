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
  CheckCircle2,
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
  Sparkles,
} from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useTradingStyle } from "@/contexts/trading-style-context"
import { generateVirtualDailyTrackerData } from "@/data/demo-daily-tracker"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useData } from "@/contexts/data-context"
import { supabase } from "@/lib/supabase/browser"
import { useLanguage } from "@/contexts/language-context"

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
  const { language } = useLanguage()
  const isEn = language === "en"

  // Define stageData here inside component so it has access to isEn
  const stageData = [
    {
      id: 1,
      name: isEn ? "Morning Routine" : "Ranní rutina",
      icon: Sun,
      href: "/morning-check",
      color: "from-orange-500 to-rose-500",
      bgColor: "bg-gradient-to-br from-orange-500/20 to-rose-500/20",
      borderColor: "border-orange-500/30",
    },
    {
      id: 2,
      name: isEn ? "Daily Intention" : "Denní záměr",
      icon: Target,
      href: "/daily-intention",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
      borderColor: "border-yellow-500/30",
    },
    {
      id: 3,
      name: isEn ? "Daily Summary" : "Denní shrnutí",
      icon: Shield,
      href: "/daily-summary",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
    },
  ]

  const [entries, setEntries] = useState<DailySummary[]>([])
  const [activeTab, setActiveTab] = useState("today")
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [expandedStage, setExpandedStage] = useState<number | null>(null)
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
    console.log("[v0] [DailyTracker] loadEntries called - isLiveMode:", isLiveMode, "authReady:", authReady, "modeLoading:", modeLoading)

    // VIRTUAL MODE: Generate demo data regardless of auth status
    if (!isLiveMode) {
      console.log("[v0] [DailyTracker] VIRTUAL mode - generating full month demo data")
      
      const demoEntries: DailySummary[] = []
      const currentYear = new Date().getFullYear()
      const februaryDays = new Date(currentYear, 2, 0).getDate()
      
      for (let day = februaryDays; day >= 1; day--) {
        const date = new Date(currentYear, 1, day)
        const dateStr = format(date, "yyyy-MM-dd")
        
        const randomScore = Math.floor(Math.random() * 40) + 60
        const randomTrades = Math.floor(Math.random() * 5) + 2
        
        const trades: Trade[] = Array.from({ length: randomTrades }, (_, idx) => ({
          id: `demo-${dateStr}-${idx}`,
          pair: ["BTC/USD", "ETH/USD", "SOL/USD", "AAPL", "TSLA"][Math.floor(Math.random() * 5)],
          direction: Math.random() > 0.5 ? "Long" : "Short",
          entryPrice: Math.random() * 1000 + 100,
          exitPrice: Math.random() * 1000 + 100,
          pnl: parseFloat(((Math.random() - 0.4) * 200).toFixed(2)),
          notes: "Demo trade",
          date: dateStr,
        }))
        
        demoEntries.push({
          date: dateStr,
          morningCheck: {
            id: `morning-${dateStr}`,
            date: dateStr,
            sleepQuality: Math.floor(Math.random() * 4) + 6,
            sleepHours: Math.floor(Math.random() * 3) + 6,
            energyLevel: Math.floor(Math.random() * 4) + 6,
            stressLevel: Math.floor(Math.random() * 5) + 2,
            focus: Math.floor(Math.random() * 4) + 6,
            physicalHealth: Math.floor(Math.random() * 4) + 6,
            emotionalState: Math.floor(Math.random() * 5) + 5,
            exercised: Math.random() > 0.5,
            exerciseType: ["Běh", "Cvičení", "Yoga"][Math.floor(Math.random() * 3)],
            exerciseDuration: Math.floor(Math.random() * 30) + 15,
            meditationTime: Math.floor(Math.random() * 20) + 5,
            morningRoutine: true,
            score: randomScore,
            recommendation: "Trading je možný",
          },
          intention: {
            date: dateStr,
            goals: "Držet se trading plánu, max 3 trades",
            maxRiskPercent: 2,
            emotionalGoal: "Zůstat klidný",
            strategy: "Trend following",
          },
          plan: {
            date: dateStr,
            setups: "Trend + pullback",
            pairs: "BTC, ETH",
            timeframes: "15min, 1h",
            entryRules: "Pullback do SMA",
            exitRules: "TP 2:1 RR",
            stopLoss: "Pod poslednímu low",
            takeProfit: "2x risk",
            marketAnalysis: "Bullish trend",
            keyLevels: "9000, 8500",
            notes: "Demo plan",
          },
          trades,
          overallScore: randomScore,
          stagesCompleted: 3,
        })
      }
      
      setEntries(demoEntries)
      setEntriesLoading(false)
      console.log(`[v0] [DailyTracker] VIRTUAL: Set ${demoEntries.length} demo entries`)
      return
    }

    // LIVE MODE: Wait for auth to be ready
    if (!authReady || modeLoading) {
      console.log("[v0] [DailyTracker] LIVE mode - waiting for auth/mode to be ready")
      return
    }

    if (!user?.id) {
      console.log("[v0] [DailyTracker] LIVE mode but no user")
      setEntriesLoading(false)
      return
    }

    console.log(`[v0] [DailyTracker] LIVE: Loading from Supabase for user ${user.id}`)
    setEntriesLoading(true)

    try {
      const combinedData: DailySummary[] = []
      const allDates = new Set<string>()

      console.log(`[v0] [DailyTracker] LIVE: morningChecks=${morningChecks.length}, trades=${trades.length}, intentions=${dailyIntentions?.length}, plans=${tradingPlans?.length}`)

      morningChecks.forEach((m: any) => allDates.add(m.date))
      trades.forEach((t: any) => {
        console.log("[v0] [DailyTracker] Adding trade to dates set:", t.date, t.pair)
        allDates.add(t.date)
      })
      dailyIntentions?.forEach((i: any) => allDates.add(i.date))
      tradingPlans?.forEach((p: any) => allDates.add(p.date))

      // In LIVE MODE, fetch daily_stages records to get accurate stage completion data
      let stagesRecords: any[] = []
      if (isLiveMode && user?.id) {
        try {
          const { data } = await supabase
            .from("daily_stages")
            .select("*")
            .eq("user_id", user.id)
          stagesRecords = data || []
          console.log("[v0] [DailyTracker] Loaded daily_stages records:", stagesRecords.length)
        } catch (err) {
          console.error("[v0] [DailyTracker] Error loading daily_stages:", err)
        }
      }

      allDates.forEach((date) => {
        const morningCheck = morningChecks.find((m: any) => m.date === date)
      const dayTrades = trades.filter((t: any) => t.date === date)
      const intention = dailyIntentions && dailyIntentions.length > 0 ? dailyIntentions.find((i: any) => i.date === date) : undefined
      const plan = tradingPlans && tradingPlans.length > 0 ? tradingPlans.find((p: any) => p.date === date) : undefined
        
        // Match stages by date - normalize date format to YYYY-MM-DD
        const stagesRecord = stagesRecords.find((sr: any) => {
          const stageDate = sr.date ? sr.date.split('T')[0] : sr.date
          return stageDate === date
        })
        
        if (stagesRecord) {
          console.log("[v0] [DailyTracker] Found stagesRecord for date:", date, "completed:", {
            morning: stagesRecord.morning_check_completed,
            intention: stagesRecord.daily_intention_completed,
            plan: stagesRecord.trading_plan_completed,
            trades: 0, // Auto from broker
            summary: stagesRecord.daily_summary_completed
          })
        }

        if (morningCheck || intention || plan || dayTrades.length > 0 || stagesRecord) {
          let stagesCompleted = 0
          
          // ALWAYS use stagesRecord if available - this is the source of truth from daily_stages table
          if (stagesRecord) {
            if (stagesRecord.morning_check_completed) stagesCompleted++
            if (stagesRecord.daily_intention_completed) stagesCompleted++
            if (stagesRecord.daily_summary_completed) stagesCompleted++
          } else {
            // Fallback: count based on available data (when stagesRecord doesn't exist)
            if (morningCheck) stagesCompleted++
            if (intention) stagesCompleted++
            if (dayTrades.length > 0) stagesCompleted++
          }

          combinedData.push({
            date,
            morningCheck,
            intention,
            plan,
            trades: dayTrades,
            overallScore: morningCheck?.score || 0,
            stagesCompleted,
          })
        }
      })

      // Sort entries by date descending
      combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      console.log(`[v0] [DailyTracker] Combined entries:`, combinedData.map(e => ({
        date: e.date,
        hasM: !!e.morningCheck,
        hasI: !!e.intention,
        hasP: !!e.plan,
        trades: e.trades.length,
        stagesCompleted: e.stagesCompleted
      })))
      
      setEntries(combinedData)
      console.log(`[v0] [DailyTracker] LIVE: Loaded ${combinedData.length} entries`)
    } catch (error) {
      console.error("[v0] [DailyTracker] Error:", error)
    } finally {
      setEntriesLoading(false)
    }
  }, [isLiveMode, user?.id, authReady, modeLoading, morningChecks, trades, dailyIntentions, tradingPlans])

  useEffect(() => {
    console.log("[v0] [DailyTracker] useEffect triggered for loadEntries")
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

  // Compute todayEntry dynamically from fresh data sources
  const today = format(new Date(), "yyyy-MM-dd")
  const todayMorningCheck = morningChecks.find((m: any) => m.date === today)
  const todayTrades = trades.filter((t: any) => t.date === today)
  const todayIntention = dailyIntentions?.find((i: any) => i.date === today)
  const todayPlan = tradingPlans?.find((p: any) => p.date === today)

  // Build todayEntry from fresh data (stagesCompleted will be set after todayStages is computed)
  let todayEntry: any = {
    date: today,
    morningCheck: todayMorningCheck,
    intention: todayIntention,
    plan: todayPlan,
    trades: todayTrades,
    overallScore: todayMorningCheck?.score || null,
    stagesCompleted: 0, // Will be updated below
  }

  // For history entries - include ALL dates including today, not just past days
  const historyEntries = entries

  const readinessScore = todayEntry?.overallScore ?? null

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

  // Generate AI Trading Insights with detailed analysis
  const generateAIInsights = (morningCheckData?: any, score?: number | null) => {
    const currentMorningCheck = morningCheckData || todayEntry?.morningCheck
    const currentReadinessScore = score ?? todayEntry?.overallScore ?? null

    if (!currentMorningCheck || currentReadinessScore === undefined || currentReadinessScore === null) {
      return isEn
        ? "Complete Morning Routine for detailed AI analysis of your psychological state and trading readiness."
        : "Dokončete Ranní rutinu pro detailní AI analýzu vašeho psychického stavu a připravenosti k obchodování."
    }

    let insight = ""
    
    const sleep = currentMorningCheck.sleepQuality
    const sleepHours = currentMorningCheck.sleepHours || 0
    const stress = currentMorningCheck.stressLevel
    const focus = currentMorningCheck.focus
    const energy = currentMorningCheck.energyLevel
    const mood = currentMorningCheck.emotionalState
    const physical = currentMorningCheck.physicalHealth || 5
    const readiness = currentReadinessScore
    
    const emotionalResilience = (mood + energy) / 2
    const cognitiveCapacity = (focus + sleep) / 2
    const stressBuffer = Math.max(0, 10 - stress)
    
    if (readiness >= 80) {
      insight = isEn
        ? `🟢 PEAK PERFORMANCE! Readiness ${readiness}%. `
        : `🟢 VRCHOLNÝ VÝKON! Připravenost ${readiness}%. `
      if (focus >= 8 && stress <= 3) {
        insight += isEn
          ? `Rare combination: high focus (${focus}/10) + low stress (${stress}/10) = IDEAL conditions for complex decision-making. `
          : `Vzácná kombinace: vysoké soustředění (${focus}/10) + nízký stres (${stress}/10) = IDEÁLNÍ podmínky pro složité rozhodování. `
      }
      if (emotionalResilience >= 8) {
        insight += isEn
          ? `Emotional resilience (${Math.round(emotionalResilience)}/10) means you won't act irrationally after a loss. `
          : `Emocionální odolnost (${Math.round(emotionalResilience)}/10) znamená, že nebudeš jednat iracionálně po ztrátě. `
      }
      insight += isEn
        ? `🎯 TRADING STRATEGY: Target A+ and B+ patterns. CAUTION: High confidence can lead to overconfidence.`
        : `🎯 STRATEGIE: Cíl na A+ a B+ vzory. POZOR: Vysoké sebevědomí může vést k přílišné sebedůvěře.`
    } else if (readiness >= 70) {
      insight = isEn
        ? `🟡 GOOD DAY, BUT NOT IDEAL. Readiness ${readiness}%. `
        : `🟡 DOBRÝ DEN, ALE NE IDEÁLNÍ. Připravenost ${readiness}%. `
      if (stress >= 6 && focus <= 6) {
        insight += isEn
          ? `Elevated stress (${stress}/10) and poor focus (${focus}/10) means error risk is ~30% higher. `
          : `Zvýšený stres (${stress}/10) a slabé soustředění (${focus}/10) zvyšuje riziko chyb o ~30%. `
      } else if (sleep < 6) {
        insight += isEn
          ? `Sleep was insufficient (${sleepHours}h, score ${sleep}/10) - your neurochemicals aren't fully prepared. `
          : `Spánek byl nedostatečný (${sleepHours}h, skóre ${sleep}/10) - neurochemikálie pro rozhodování nejsou plně připraveny. `
      }
      insight += isEn
        ? `💡 TACTIC: Trade only high-probability patterns. Consider 50-75% of normal position size.`
        : `💡 TAKTIKA: Obchoduj jen vzory s vysokou pravděpodobností. Zvažte 50-75% normální velikosti pozice.`
    } else if (readiness >= 60) {
      insight = isEn
        ? `🟠 SERIOUS WARNING. Readiness only ${readiness}%. `
        : `🟠 VÁŽNÉ VAROVÁNÍ. Připravenost pouze ${readiness}%. `
      if (stress >= 7) {
        insight += isEn
          ? `CRITICAL: Stress (${stress}/10) is high - leads to revenge trading risk. `
          : `KRITICKY: Stres (${stress}/10) je vysoký - hrozí revenge trading. `
      }
      insight += isEn
        ? `⚠️ RECOMMENDATION: Paper trading or demo. If you MUST trade: one-third position size.`
        : `⚠️ DOPORUČENÍ: Paper trading nebo demo. Pokud MUSÍŠ obchodovat: třetina normální pozice.`
    } else {
      insight = isEn
        ? `🛑 TRADING TODAY IS NOT SUITABLE. Readiness ${readiness}% is critically low. `
        : `🛑 DNES NENÍ VHODNÉ OBCHODOVAT. Připravenost ${readiness}% je kriticky nízká. `
      if (stress >= 8 && energy <= 3) {
        insight += isEn
          ? `Maximum stress (${stress}/10) and minimum energy (${energy}/10) = brain in survival mode. `
          : `Maximální stres (${stress}/10) a minimální energie (${energy}/10) = mozek v survival módu. `
      }
      insight += isEn
        ? `💚 ACTION: Self-care is more important than trading now. 30min walk, healthy meal, meditation.`
        : `💚 AKCE: Péče o sebe je teď důležitější než trading. 30min procházka, zdravé jídlo, meditace.`
    }
    
    return insight
  }

  // Generate trading decision with tips and details
  const generateTradingDecision = (morningCheckData?: any, score?: number | null) => {
    if (!morningCheckData || score === undefined || score === null) {
      return {
        message: isEn ? "Complete Morning Routine for AI analysis." : "Dokončete Ranní rutinu pro AI analýzu.",
        tips: [isEn ? "Start with Morning Routine" : "Začněte s Ranní rutinou"],
        details: [isEn ? "Morning Routine Not Completed" : "Ranní rutina nedokončena"],
      }
    }

    let message = ""
    const tips: string[] = []
    const details: string[] = []

    const poorSleep = morningCheckData.sleepQuality < 6 || morningCheckData.sleepHours < 6
    const highStress = morningCheckData.stressLevel > 7
    const lowFocus = morningCheckData.focus < 6
    const lowEnergy = morningCheckData.energyLevel < 5
    const badMood = morningCheckData.emotionalState < 6
    const goodConditions = score >= 75
    const highFocus = morningCheckData.focus >= 8
    const lowStressMetric = morningCheckData.stressLevel <= 3
    const highEnergy = morningCheckData.energyLevel >= 8
    
    const physicalHealth = morningCheckData.physicalHealth || 5
    const exercised = morningCheckData.exercised || false
    const meditatedToday = morningCheckData.meditationTime > 0 || false

    let positiveNote = ""
    if (highFocus) positiveNote = isEn ? "✓ Focus is excellent - that's your greatest strength!" : "✓ Soustředění je vynikající - to je tvá největší síla!"
    else if (lowStressMetric) positiveNote = isEn ? "✓ At least you have low stress - your mind is at peace." : "✓ Aspoň máš nízký stres - tvá mysl je v klidu."
    else if (highEnergy) positiveNote = isEn ? "✓ Energy at high levels - physically you're ready." : "✓ Energie na vysoké úrovni - fyzicky jsi připraven/a."
    else if (meditatedToday) positiveNote = isEn ? "✓ You meditated today - this will help with emotional control." : "✓ Dnes jsi meditoval/a - to pomůže s emoční kontrolou."
    else if (exercised) positiveNote = isEn ? "✓ Exercise today = better brain function and self-control." : "✓ Cvičení dnes = lepší funkce mozku a sebeovládání."

    if (poorSleep) {
      message = isEn
        ? `⚠️ CRITICAL: Only ${morningCheckData.sleepHours}h sleep (quality ${morningCheckData.sleepQuality}/10). Sleep deprivation = -30-40% in decision-making ability.`
        : `⚠️ KRITICKÝ: Pouze ${morningCheckData.sleepHours}h spánku (kvalita ${morningCheckData.sleepQuality}/10). Nedostatek spánku = -30-40% ve schopnosti rozhodování.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `Sleep: ${morningCheckData.sleepHours}h, quality ${morningCheckData.sleepQuality}/10 - INSUFFICIENT` : `Spánek: ${morningCheckData.sleepHours}h, kvalita ${morningCheckData.sleepQuality}/10 - NEDOSTATEČNÝ`)
      tips.push(isEn ? "🧘 Therapy: 15-20min meditation or relaxation" : "🧘 Terapie: 15-20min meditace nebo relaxace")
      tips.push(isEn ? "📊 Risk: Max 2 trades at 25% position or SKIP trading today" : "📊 Riziko: Max 2 obchody na 25% pozici nebo VYNECHEJ obchodování dnes")
      tips.push(isEn ? "⏰ Priority: Evening sleep = best investment for tomorrow" : "⏰ Priorita: Večerní spánek = nejlepší investice pro zítřek")
    } else if (highStress) {
      message = isEn
        ? `🔥 WARNING: Stress ${morningCheckData.stressLevel}/10 is high. Active amygdala = impulsive decisions, revenge trading risk.`
        : `🔥 VAROVÁNÍ: Stres ${morningCheckData.stressLevel}/10 je vysoký. Aktivní amygdala = impulzivní rozhodnutí, riziko revenge tradingu.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `Stress: ${morningCheckData.stressLevel}/10 - ELEVATED` : `Stres: ${morningCheckData.stressLevel}/10 - ZVÝŠENÝ`)
      tips.push(isEn ? "🧘‍♀️ Therapy: 20min progressive relaxation or cold shower" : "🧘‍♀️ Terapie: 20min progresivní relaxace nebo studená sprcha")
      tips.push(isEn ? "📉 Risk Management: -50% position size, double-check every entry" : "📉 Řízení rizik: -50% velikost pozice, dvojitá kontrola každého vstupu")
      tips.push(isEn ? "⏸️ Breaks: Every 30min take a 5-10min break" : "⏸️ Přestávky: Každých 30min si dej 5-10min pauzu")
    } else if (lowFocus) {
      message = isEn
        ? `😴 PROBLEM: Focus only ${morningCheckData.focus}/10 means high risk of missing signals and false entries (+40% errors).`
        : `😴 PROBLÉM: Soustředění pouze ${morningCheckData.focus}/10 znamená vysoké riziko přehlédnutí signálů a falešných vstupů (+40% chyb).`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `Focus: ${morningCheckData.focus}/10 - LOW` : `Soustředění: ${morningCheckData.focus}/10 - NÍZKÉ`)
      tips.push(isEn ? "🚀 Root solution: 15-20min outdoors in nature (sunlight resets attention)" : "🚀 Kořenové řešení: 15-20min venku v přírodě (sluneční světlo resetuje pozornost)")
      tips.push(isEn ? "🎯 Optimization: Simple setup - only 1-2 pairs, 1 timeframe, 1 strategy" : "🎯 Optimalizace: Jednoduchý setup - pouze 1-2 páry, 1 časový rámec, 1 strategie")
    } else if (lowEnergy) {
      message = isEn
        ? `🔋 LOW ENERGY: ${morningCheckData.energyLevel}/10 energy. Afternoon fatigue = worse decisions.`
        : `🔋 NÍZKÁ ENERGIE: ${morningCheckData.energyLevel}/10 energie. Odpolední únava = horší rozhodnutí.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `Energy: ${morningCheckData.energyLevel}/10 - LOW` : `Energie: ${morningCheckData.energyLevel}/10 - NÍZKÁ`)
      tips.push(isEn ? "🍗 Nutrition: Proteins + complex carbs = steady energy without crash" : "🍗 Výživa: Bílkoviny + komplexní sacharidy = stabilní energie bez propadu")
      tips.push(isEn ? "💪 Activity: 10-15min light exercise or yoga = serotonin boost" : "💪 Aktivita: 10-15min lehké cvičení nebo yoga = boost serotoninu")
      tips.push(isEn ? "⏱️ Timing: Trade only 9-12 (peak hours)" : "⏱️ Načasování: Obchoduj pouze 9-12 (špičkové hodiny)")
    } else if (badMood) {
      message = isEn
        ? `😔 EMOTION PROBLEM: Mood ${morningCheckData.emotionalState}/10. Risk: Loss aversion bias, holding losing positions, revenge trading.`
        : `😔 EMOČNÍ PROBLÉM: Nálada ${morningCheckData.emotionalState}/10. Riziko: Averze ke ztrátám, držení ztrátových pozic, revenge trading.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `Emotional state: ${morningCheckData.emotionalState}/10 - NEGATIVE` : `Emoční stav: ${morningCheckData.emotionalState}/10 - NEGATIVNÍ`)
      tips.push(isEn ? "🎭 Psychology: Write down WHY you're sad" : "🎭 Psychologie: Zapiš si PROČ jsi smutný/á")
      tips.push(isEn ? "🚫 Safety: SKIP trading today, or only demo/paper trading" : "🚫 Bezpečnost: VYNECHEJ obchodování dnes, nebo jen demo/paper trading")
      tips.push(isEn ? "💝 Self-care: 20min something you enjoy" : "💝 Péče o sebe: 20min něco co tě baví")
    } else if (goodConditions) {
      message = isEn
        ? `✅ IDEAL DAY! Score ${score}% = GREEN LIGHT. Psychologically and physically optimally prepared.`
        : `✅ IDEÁLNÍ DEN! Skóre ${score}% = ZELENÁ ZNAMENÍ. Psychologicky i fyzicky jsi optimálně připravený.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `All metrics in OPTIMAL range - rare window!` : `Všechny metriky v OPTIMÁLNÍM rozsahu - vzácné okno!`)
      tips.push(isEn ? "🎯 Strategy: Trade A+ and B+ patterns with FULL discipline" : "🎯 Strategie: Obchoduj A+ a B+ vzory s PLNOU disciplínou")
      tips.push(isEn ? "⚡ Mindset: Beware of overconfidence - wins can lead to recklessness" : "⚡ Mindset: Buď pozorný na přílišnou sebedůvěru - vítězství mohou vést k riskanci")
      tips.push(isEn ? "⏱️ Session: 3-4 hours trading, then break for refresh" : "⏱️ Sezení: 3-4 hodiny obchodování, pak přestávka pro osvěžení")
      tips.push(isEn ? "📊 Record: Detailed notes on each trade - learn in the heat of the moment!" : "📊 Záznam: Podrobné poznámky na každém obchodu - učit se v horku situace!")
    } else {
      message = isEn
        ? `⚠️ MIXED DAY: Score ${score}% is below normal. Consider risk management adjustments.`
        : `⚠️ SMÍŠENÝ DEN: Skóre ${score}% je pod normálem. Zvažte úpravy řízení rizika.`
      if (positiveNote) message += ` ${positiveNote}`
      details.push(isEn ? `Readiness: ${score}% - BORDERLINE` : `Připravenost: ${score}% - HRANIČÍ`)
      tips.push(isEn ? "🎚️ Settings: 50-75% normal position, tighter stop loss" : "🎚️ Nastavení: 50-75% normální pozice, těsnější zastavovací ztráta")
      tips.push(isEn ? "🧩 Strategy: Only highest probability patterns, skip marginal" : "🧩 Strategie: Jen nejvyšší pravděpodobnostní vzory, přeskočit marginální")
      tips.push(isEn ? "📚 Alternative: Education day - review backtests, trading plan" : "📚 Alternativa: Vzdělávací den - kontrola backtestů, obchodní plán")
    }

    if (highFocus && !lowFocus) details.push(isEn ? "✓ Focus: EXCELLENT (Strength)" : "✓ Soustředění: VYNIKAJÍCÍ (Silná stránka)")
    else if (lowStressMetric && !highStress) details.push(isEn ? "✓ Stress: MINIMAL (Psychological advantage)" : "✓ Stres: MINIMÁLNÍ (Psychická výhoda)")
    else if (highEnergy && !lowEnergy) details.push(isEn ? "✓ Energy: HIGH (Physical strength)" : "✓ Energie: VYSOKÁ (Fyzická síla)")
    if (exercised) details.push(isEn ? "✓ Exercise: You exercised today (+personal discipline)" : "✓ Cvičení: Dnes jsi cvičil/a (+ osobní disciplína)")

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

  // Update todayEntry with actual stagesCompleted count
  todayEntry.stagesCompleted = todayStages.filter((s) => s.completed).length

  // Check if morning check is actually completed - use REAL data, not UI state
  const isMorningCheckCompleted = (isLiveMode && todayMorningCheck) ? true : (todayStages.find((s) => s.id === 1)?.completed || false)

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
        // Stage 4 = Daily Summary (Trades auto from broker)
        // No manual data entry needed — trades sync from MetaApi
        console.log("[v0] Daily Summary stage completed")
        setRefreshTrigger((prev) => prev + 1)
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
                  Denní Sledování
                </h1>
                <p className="md:text-lg text-sm text-muted-foreground mt-1 md:block hidden">
                  {tradingStyle === "scalper" && (isLiveMode ? "Sledujte vaše relace 🚀" : "Demo režim 🎮")}
                  {tradingStyle === "daytrader" && (isLiveMode ? "Vaše shrnutí 📊" : "Demo režim 🎮")}
                  {tradingStyle === "swingtrader" && (isLiveMode ? "Sledujte pozice 📈" : "Demo režim 🎮")}
                  {!tradingStyle && (isLiveMode ? "Vaše shrnutí 📊" : "Demo režim 🎮")}
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

      {/* Virtual Mode Banner */}
      {!isLiveMode && (
        <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-3 px-4 flex items-center gap-3 mb-6">
          <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-amber-100">
                  <span className="font-bold text-white">Momentálně si prohlížíš data ve Virtual modu</span> – jak mohou vypadat během používání softwaru
          </span>
        </div>
      )}

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
            Historie          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 md:space-y-8">
          {(todayEntry?.morningCheck || virtualData?.[0]?.morningCheck) ? (
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
                                Your readiness for today
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={cn("md:text-8xl text-6xl font-black", getReadinessColor(readinessScore))}>
                            {readinessScore !== null ? `${readinessScore}%` : "Not Completed"}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
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
                              <span className="text-xs text-muted-foreground">Stress</span>
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
                    <h3 className="text-lg font-bold text-white mb-2">Tvůj Trading Status Dnes</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {generateAIInsights(todayEntry?.morningCheck, readinessScore)}
                    </p>
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                      Tvá příprava určuje kvalitu rozhodnutí. AI analyzuje tvůj psychologický stav a doporučuje optimální trading okna nebo kdy si odpočinout.
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
                          Detailní Trading Analýza
                        </span>
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">
                        Personalized recommendations based on your psychological state and trading history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Main Message */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
                          <div className="text-xl font-bold text-white leading-relaxed">{tradingDecision.message}</div>
                        </div>

                        {tradingDecision.details.length > 0 &&
                          tradingDecision.details[0] !== "Morning Routine Not Completed" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-5 w-5 text-cyan-400" />
                                <h3 className="text-lg font-bold text-white">Detailed Analysis:</h3>
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
                            <h3 className="text-lg font-bold text-white">Action Steps:</h3>
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
                          Insights & Recommendations
                        </span>
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Personalized tips to improve your trading performance
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
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {stageData.map((stage, index) => {
                const isCompleted = !isLiveMode ? true : todayEntry && stages.find((s) => s.id === stage.id)?.completed
                const isUnlocked = !isLiveMode ? true : todayEntry && stages.find((s) => s.id === stage.id)?.unlocked
                const isActive = !isCompleted && isUnlocked
                const isExpanded = expandedStage === stage.id

                return (
                  <div
                    key={stage.id}
                    className={cn(
                      "relative p-6 rounded-full cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center",
                      "border-2 backdrop-blur-sm min-w-[140px] h-[140px] group",
                      isCompleted && "bg-gradient-to-br from-orange-500/20 to-rose-500/20 border-orange-500/30",
                      isActive && "border-yellow-500 bg-yellow-500/20 animate-pulse shadow-lg shadow-yellow-500/50",
                      !isUnlocked && "border-slate-700/30 bg-slate-800/20 opacity-50 cursor-not-allowed",
                      isUnlocked && !isCompleted && "border-slate-600/50 hover:border-slate-400/80 hover:bg-slate-700/30 hover:shadow-md"
                    )}
                    onClick={() => {
                      if (isUnlocked && stage.href) {
                        setExpandedStage(stage.id)
                        setTimeout(() => router.push(stage.href), 200)
                      }
                    }}
                    onMouseEnter={() => isUnlocked && setExpandedStage(stage.id)}
                    onMouseLeave={() => setExpandedStage(null)}
                  >
                    {/* Bubble fill animation */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity from-white to-transparent" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={cn(
                          "mb-2 p-3 rounded-full transition-all duration-300",
                          isCompleted && `bg-gradient-to-br ${stage.color}`,
                          isActive && "bg-gradient-to-br from-yellow-500 to-orange-500 scale-110",
                          !isUnlocked && "bg-slate-700/50",
                        )}
                      >
                        <stage.icon
                          className={cn(
                            "h-6 w-6",
                            (isCompleted || isActive) && "text-white",
                            !isUnlocked && "text-slate-500",
                          )}
                        />
                      </div>

                      {/* Name */}
                      <div className={cn(
                        "text-xs font-bold transition-all duration-300",
                        isCompleted && "text-white",
                        isActive && "text-yellow-400",
                        !isUnlocked && "text-slate-500",
                      )}>
                        {stage.name.split(" ")[0]}
                      </div>

                      {/* Status badge - show on hover/expand */}
                      {isExpanded && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                          {isCompleted && (
                            <span className="text-green-400">✓ Done</span>
                          )}
                          {isActive && (
                            <span className="text-yellow-400">→ Active</span>
                          )}
                          {!isUnlocked && (
                            <span className="text-slate-500">🔒 Locked</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Continue Button */}
          {(!isLiveMode || (todayEntry && stageData.filter((s) => {
            const key = s.id === 1 ? 'morning_check_completed' : s.id === 2 ? 'daily_intention_completed' : 'daily_summary_completed'
            return todayEntry.stagesRecord?.[key]
          }).length < 3)) && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-orange-400" />
              <h3 className="text-2xl font-black mb-2">Continue with Daily Flow!</h3>
              <p className="text-gray-300">
                You completed{" "}
                  {!isLiveMode ? virtualData?.[0]?.stagesCompleted : stageData.filter((s) => {
                    const key = s.id === 1 ? 'morning_check_completed' : s.id === 2 ? 'daily_intention_completed' : 'daily_summary_completed'
                    return todayEntry.stagesRecord?.[key]
                  }).length} z 3
                  stages. Keep going!
                </p>
                <Button
                  onClick={() => {
                    const nextStageId = !isLiveMode
                      ? virtualData?.[0]?.nextStageId
                      : stageData.find((s) => {
                        const key = s.id === 1 ? 'morning_check_completed' : s.id === 2 ? 'daily_intention_completed' : 'daily_summary_completed'
                        return !todayEntry.stagesRecord?.[key]
                      })?.id
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
                  Continue
                </Button>
              </CardContent>
            </Card>
            </>
          ) : (
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                  <Sun className="w-16 h-16 text-orange-400/60" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Začni svůj den</h3>
                    <p className="text-slate-400">Vyplň Ranní Kontrolu pro dnesní sledování</p>
                  </div>
                  <Button
                    onClick={() => router.push('/morning-check')}
                    className="mt-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 gap-2"
                  >
                    <Sun className="w-5 h-5" />
                    Začít s Ranní Kontrolou
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-8">
          {historyEntries.length > 0 ? (
            <div className="space-y-4">
              {historyEntries.map((entry) => {
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
                                  Today
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
                              {isExpanded ? "Hide" : "Show"}
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
                                    Daily Summary
                                  </h3>
                                  <p className="text-sm text-muted-foreground">Stage 5 - Complete day overview</p>
                                </div>
                              </div>

                              {/* Trading Performance */}
                              {entry.trades && entry.trades.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-400" />
                                    Trading Results
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
                                      <div className="text-xs text-muted-foreground mb-1">Podíl výher</div>
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
                              {entry.morningCheck && (() => {
                                const dayDecision = generateTradingDecision(entry.morningCheck, entryReadiness)
                                return (
                                  dayDecision && (
                                    <div>
                                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Brain className="h-5 w-5 text-purple-400" />
                                        AI Postřehy & Doporučení
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                          <div className="text-sm text-white font-medium leading-relaxed">
                                            {dayDecision.message}
                                          </div>
                                        </div>
                                        {dayDecision.details.length > 0 &&
                                          dayDecision.details[0] !== "Ranní Kontrola nevyplněna" && (
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
                                              Action Steps
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
                              })()

                              {/* Morning Readiness Summary */}
                              <div>
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Sun className="h-5 w-5 text-orange-400" />
                                  Ranní Připravenost
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
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
                                      <span className="text-xs text-muted-foreground">Soustředění</span>
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
                                        <div className="text-xs text-blue-400 mb-1 font-semibold">Max Riziko:</div>
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

                          {/* Show stages progress - ALWAYS show this */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                              Fáze Dne - Postup ({entry.stagesCompleted}/3)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {[
                                { stage: 1, name: "Ranní Kontrola", key: "morning_check_completed" },
                                { stage: 2, name: "Záměr Dne", key: "daily_intention_completed" },
                                { stage: 3, name: "Shrnutí", key: "daily_summary_completed" },
                              ].map(({ stage, name, key }) => {
                                const isCompleted = entry.stagesCompleted >= stage
                                return (
                                  <div
                                    key={stage}
                                    className={`p-3 rounded-lg border transition-all ${
                                      isCompleted
                                        ? "bg-green-500/10 border-green-500/30"
                                        : "bg-slate-700/20 border-slate-600/30"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                        isCompleted ? "bg-green-500/20 border-green-500" : "border-slate-600"
                                      }`}>
                                        {isCompleted && <div className="h-2 w-2 bg-green-400 rounded-full" />}
                                      </div>
                                      <span className="text-xs text-white font-bold">Fáze {stage}</span>
                                    </div>
                                    <div className={`text-sm font-medium ${isCompleted ? "text-green-300" : "text-slate-400"}`}>
                                      {name}
                                    </div>
                                    {isCompleted && (
                                      <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Hotovo
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Show simplified view if Stage 3 not completed */}
                          {entry.stagesCompleted < 3 && (
                            <div className="text-center py-6 text-muted-foreground border-t border-white/10 mt-6 pt-6">
                              <Moon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Zbývající fáze k dokončení: {3 - entry.stagesCompleted}</p>
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
                    ? "Zatím nemáš žádné záznamy. Začni vyplněním Ranní Kontroly!"
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
// Cache bust - rebuild
