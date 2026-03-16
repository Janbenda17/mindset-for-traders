"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  TrendingUp,
  Brain,
  Target,
  DollarSign,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  BarChart2,
  Activity,
  Shield,
  ChevronRight,
  Eye,
  Zap,
  Lock
} from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"

interface MorningCheckData {
  date: string
  sleepQuality: number
  sleepHours: number
  energyLevel: number
  stressLevel: number
  focus: number
  emotionalState: number
  score: number
}

interface DailyIntentionData {
  date: string
  goals: string
  maxRiskPercent: number
  emotionalGoal: string
}

interface TradingPlanData {
  date: string
  setups: string
  pairs: string
  strategy: string
}

interface Trade {
  id: string
  pair: string
  direction: string
  pnl: number
  mood: number
  entry: number
  exit: number
  size: number
  notes: string
  date?: string
}

export function DailySummary() {
  const { toast } = useToast()
  const router = useRouter()
  const { completeStage, stages } = useDailyStage()
  const { getAllTrades, isLiveMode, morningChecks, dailyIntentions, tradingPlans } = useData()
  const { language } = useLanguage()
  const isEn = language === "en"

  const txt = {
    tradeHistory: isEn ? "Trade History" : "Historie Obchodů",
    viewAll: isEn ? "View All" : "Zobrazit vše",
    noTrades: isEn ? "No trades today" : "Dnes žádné obchody",
    recognized: isEn ? "Recognized Psychological Patterns" : "Rozpoznané psychologické vzorce",
    noPatterns: isEn ? "No stable patterns detected yet" : "Zatím žádné stabilní patterny detekovány",
    mood: isEn ? "Mood" : "Nálada",
    aiAnalysis: isEn ? "AI Daily Analysis" : "AI denní analýza",
    whatWentWell: isEn ? "What Went Well" : "Co se povedlo",
    areasImprovement: isEn ? "Areas for Improvement" : "Oblasti pro zlepšení",
    psychAnalysis: isEn ? "Psychological Analysis & Mental State" : "Psychologická analýza a mentální stav",
    deeperLook: isEn ? "Deeper look at your mindset and psychological patterns" : "Hlubší pohled na tvůj mindset a psychologické vzorce",
    currentState: isEn ? "Your psychological profile today:" : "Tvůj psychologický profil dnes:",
    nalaida: isEn ? "Mood" : "Nálada",
    stres: isEn ? "Stress" : "Stres",
    focus: isEn ? "Focus" : "Soustředění",
    riskAssessment: isEn ? "Risk Assessment & Risk Management" : "Posouzení rizika a řízení rizik",
    performancePrediction: isEn ? "Performance Prediction & Success Rate" : "Předpověď výkonu a úspěšnost",
    actionItems: isEn ? "Action Items for Tomorrow" : "Akční položky na zítřek",
    journaling: isEn ? "Journaling: Write down emotions before trading for better self-awareness" : "Deníčko: Zapiš si emoce před obchodováním pro lepší sebepovědomí",
    limit: isEn ? "Limit: Focus only on A+ setups, quality > quantity" : "Limit: Soustředí se na A+ setupy, kvalita > kvantita",
    excellent: isEn ? "Excellent" : "Výborné",
    sleep: isEn ? "sleep provided mental sharpness and clarity" : "spánek poskytl duševní ostrost a jasnost",
    focus2: isEn ? "high focus enabled capturing all key signals" : "vysoké soustředění umožnilo zachytit všechny klíčové signály",
    profitable: isEn ? "Profitable day:" : "Zisková den:",
    negativeEmotional: isEn ? "Negative emotional state affected objectivity" : "Negativní emoční stav ovlivnil objektivitu",
    overtrading: isEn ? "Overtrading: Too much activity reduces decision quality" : "Overtrading: Příliš mnoho aktivit snižuje kvalitu rozhodování",
  }

  // Check if stage 5 is locked
  const stage5 = stages.find((s) => s.id === 5)
  const isStage5Locked = stage5?.locked || false

  const [morningCheck, setMorningCheck] = useState<MorningCheckData | null>(null)
  const [intention, setIntention] = useState<DailyIntentionData | null>(null)
  const [plan, setTradingPlan] = useState<TradingPlanData | null>(null)
  const [todayTrades, setTodayTrades] = useState<Trade[]>([])
  const [aiInsights, setAiInsights] = useState<{
    strengths: string[]
    weaknesses: string[]
    tomorrowPlan: string[]
    psychologicalAnalysis: string
    patternRecognition: string[]
    riskAssessment: string
    performancePrediction: string
  }>({
    strengths: [],
    weaknesses: [],
    tomorrowPlan: [],
    psychologicalAnalysis: "",
    patternRecognition: [],
    riskAssessment: "",
    performancePrediction: "",
  })

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd")

    if (!isLiveMode) {
      // VIRTUAL MODE - Generate demo data
      const demoDates = [today, format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")]
      const selectedDate = demoDates[Math.floor(Math.random() * demoDates.length)]
      
      const demoMorningCheck: MorningCheckData = {
        date: selectedDate,
        sleepQuality: Math.floor(Math.random() * 10) + 1,
        sleepHours: Math.floor(Math.random() * 3) + 5.5,
        energyLevel: Math.floor(Math.random() * 10) + 1,
        stressLevel: Math.floor(Math.random() * 10) + 1,
        focus: Math.floor(Math.random() * 10) + 1,
        emotionalState: Math.floor(Math.random() * 10) + 1,
        score: Math.floor(Math.random() * 30) + 60,
      }

      const demoIntention: DailyIntentionData = {
        date: selectedDate,
        goals: ["Find A+ setup on EUR/USD", "Stick to 2% risk per trade", "No revenge trading"][Math.floor(Math.random() * 3)],
        maxRiskPercent: 2,
        emotionalGoal: ["Stay calm and disciplined", "Take responsibility for mistakes", "Feel confident"][Math.floor(Math.random() * 3)],
      }

      const demoPlan: TradingPlanData = {
        date: selectedDate,
        setups: "Breakout from resistance level + confirmation from Fibs",
        pairs: "EUR/USD, GBP/USD, XAU/USD",
        strategy: "Trend following with 3:1 risk reward",
      }

      const demoDates2 = [selectedDate, format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")]
      const demoTrades: Trade[] = []
      
      for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
        const isWin = Math.random() > 0.35
        demoTrades.push({
          id: `demo-${i}`,
          pair: ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD"][Math.floor(Math.random() * 4)],
          direction: Math.random() > 0.5 ? "LONG" : "SHORT",
          pnl: isWin ? Math.floor(Math.random() * 3000) + 500 : -Math.floor(Math.random() * 1500) - 100,
          mood: Math.floor(Math.random() * 40) + (isWin ? 60 : 30),
          entry: Math.random() * 100,
          exit: Math.random() * 100,
          size: Math.floor(Math.random() * 2) + 0.5,
          notes: isWin ? "Good setup, I followed the plan" : "Too early entry, I should have waited",
          date: demoDates2[Math.floor(Math.random() * demoDates2.length)],
        })
      }

      setMorningCheck(demoMorningCheck)
      setIntention(demoIntention)
      setTradingPlan(demoPlan)
      setTodayTrades(demoTrades)
      generateAdvancedInsights(demoMorningCheck, demoTrades, demoIntention)
    } else {
      // LIVE MODE - Load fresh data from database
      const allTrades = getAllTrades()
      const trades = allTrades.filter((t: Trade) => (t.recordedDate || t.date) === today)
      
      console.log(`[v0] DailySummary - Loaded ${trades.length} trades for today (${today})`)
      setTodayTrades(trades)

      // Load morning check from data context
      const todayMorningCheck = morningChecks?.find((m: MorningCheckData) => m.date === today)
      setMorningCheck(todayMorningCheck || null)

      // Load intention from data context
      const todayIntention = dailyIntentions?.find((i: DailyIntentionData) => i.date === today)
      setIntention(todayIntention || null)

      // Load trading plan from data context
      const todayPlan = tradingPlans?.find((p: TradingPlanData) => p.date === today)
      setTradingPlan(todayPlan || null)

      generateAdvancedInsights(todayMorningCheck, trades, todayIntention)
    }
  }, [getAllTrades, isLiveMode, morningChecks, dailyIntentions, tradingPlans])

  const generateAdvancedInsights = (
    check: MorningCheckData | null,
    trades: Trade[],
    intention: DailyIntentionData | null,
  ) => {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const tomorrowPlan: string[] = []
    const patternRecognition: string[] = []
    let psychologicalAnalysis = ""
    let riskAssessment = ""
    let performancePrediction = ""

    // Analyze Morning Routine & Mental State
    if (check) {
      psychologicalAnalysis = `Your psychological profile today: Mood ${check.emotionalState}/10, Stress ${check.stressLevel}/10, Focus ${check.focus}/10. `

      if (check.stressLevel >= 8) {
        psychologicalAnalysis += `High stress is your biggest obstacle. Your amygdala (emotional brain) is now dominant, reducing logical decision-making. I recommend: Take a break, do 4-7-8 breathing 5 times. Without reducing stress, you risk revenge trading and poor execution.`
      } else if (check.stressLevel <= 3) {
        psychologicalAnalysis += `Low stress is your strong point. Your prefrontal cortex (logic) dominates, leading to better decisions. Keep this state - it's the ideal condition for trading.`
      } else {
        psychologicalAnalysis += `Stress at normal levels. Be careful about escalation - many traders don't realize their stress has crossed the safe threshold until it's too late.`
      }

      if (check.focus < 5) {
        psychologicalAnalysis += ` Your focus is weak - this means missing signals and low execution quality. Try the Pomodoro technique: 25 min intense focus, then 5 min break.`
      } else if (check.focus >= 8) {
        psychologicalAnalysis += ` Your focus is excellent - it's a super-power for trading. Use this "flow state" window - it's when the best traders spend their months.`
      }

      if (check.emotionalState >= 8) {
        psychologicalAnalysis += ` Positive emotional state supports confidence, but be careful of overconfidence. Right now the biggest risk is taking bigger positions than is rational.`
      } else if (check.emotionalState <= 4) {
        psychologicalAnalysis += ` Negative emotions are a signal to be cautious. When mood is low, the probability of losses increases by 40%. Consider a shorter session or smaller positions.`
      }
    } else {
      psychologicalAnalysis = "Missing Morning Check data. Without it, I can't assess your psychological state. Complete Morning Check for detailed analysis."
    }

    // Specific metric analysis
    if (check && (check.sleepQuality < 6 || check.sleepHours < 6.5)) {
      weaknesses.push("😴 Insufficient sleep reduced cognitive function by 30-40%")
      tomorrowPlan.push("Go to bed 1-2 hours earlier, target: 7-8 hours of quality sleep")
      patternRecognition.push("Pattern: Poor sleep → Reduced patience → Premature entries")
    } else if (check && check.sleepQuality >= 8) {
      strengths.push("💤 Excellent sleep provided mental sharpness and clarity")
    }

    if (check && check.stressLevel > 7) {
      weaknesses.push("😰 High stress increased risk of emotional trading by 60%")
      tomorrowPlan.push("Add 15-20 min meditation or breathing exercises before trading")
      patternRecognition.push("Pattern: High stress → Revenge trading → Increased losses")
    } else if (check && check.stressLevel <= 3) {
      strengths.push("😌 Low stress enabled calm and rational decision-making")
    }

    if (check && check.focus < 6) {
      weaknesses.push("🎯 Low focus led to missing important signals")
      tomorrowPlan.push("Try Pomodoro technique: 25 min focus + 5 min break")
      patternRecognition.push("Pattern: Low focus → Missed opportunities → Frustration")
    } else if (check && check.focus >= 8) {
      strengths.push("🔍 High focus enabled capturing all key signals")
    }

    if (check && check.emotionalState < 6) {
      weaknesses.push("😔 Negative emotional state affected objectivity")
      tomorrowPlan.push("Journaling: Write down emotions before trading for better self-awareness")
    } else if (check && check.emotionalState >= 8) {
      strengths.push("😊 Positive mood supported confidence and discipline")
    }

    // Analyze Trading Performance
    const winRate = trades.length > 0 ? (trades.filter((t) => t.pnl > 0).length / trades.length) * 100 : 0
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgMood = trades.length > 0 ? trades.reduce((sum, t) => sum + (t.mood || 0), 0) / trades.length : 0

    if (totalPnL > 0) {
      strengths.push(`💰 Profitable day: +${totalPnL.toFixed(2)}$ with Win Rate ${Math.round(winRate)}%`)
      performancePrediction = `Based on today's performance (Win Rate ${Math.round(winRate)}%, P&L +${totalPnL.toFixed(2)}$) and mental state (${check?.score || 0}/100), I predict a 75% chance of a profitable tomorrow if you maintain the same routine and discipline.`
    } else if (totalPnL < 0) {
      weaknesses.push(`📉 Loss day: ${totalPnL.toFixed(2)}$ - analysis of causes needed`)
      performancePrediction = `Today's loss (${totalPnL.toFixed(2)}$) requires a reset. I recommend starting tomorrow with half the risk and focus on quality, not quantity. Recovery chance: 60% if you stick to the plan.`
      patternRecognition.push("Pattern: Loss → Frustration → Revenge trading (CAUTION!)")
    }

    if (trades.length > 0) {
      weaknesses.push("⚡ Overtrading: Too much activity reduces decision quality")
      tomorrowPlan.push("Limit: Focus only on A+ setups, quality > quantity")
      patternRecognition.push("Pattern: Overtrading → Fatigue → Execution errors")
    } else if (trades.length === 0) {
      if (check && check.score < 70) {
        strengths.push("🛡️ Discipline: You correctly avoided trading with low readiness")
      } else {
        weaknesses.push("👀 No trades: Maybe you missed opportunities or were too cautious")
      }
    }

    // Risk Assessment
    if (trades.length > 0) {
      const maxLoss = Math.min(...trades.map((t) => t.pnl || 0))
      const maxWin = Math.max(...trades.map((t) => t.pnl || 0))
      const riskReward = maxLoss !== 0 ? Math.abs(maxWin / maxLoss) : 0

      if (riskReward >= 2) {
        riskAssessment = `✅ Excellent Risk/Reward ratio: ${riskReward.toFixed(2)}:1. Your risk management is on a high level. Biggest win: +${maxWin}$, biggest loss: ${maxLoss}$.`
      } else if (riskReward >= 1) {
        riskAssessment = `⚠️ Average Risk/Reward ratio: ${riskReward.toFixed(2)}:1. You can improve by letting winners run longer. Biggest win: +${maxWin}$, biggest loss: ${maxLoss}$.`
      } else {
        riskAssessment = `🚨 Weak Risk/Reward ratio: ${riskReward.toFixed(2)}:1. CRITICAL: Your losses are bigger than wins. Reconsider stop loss and take profit strategy. Biggest win: +${maxWin}$, biggest loss: ${maxLoss}$.`
        weaknesses.push("🚨 Insufficient risk management - losses exceed wins")
        tomorrowPlan.push("PRIORITY: Reconsider stop loss placement and profit targets")
      }
    } else {
      riskAssessment = "No trades today - risk management cannot be assessed."
    }

    // Mood-Performance Correlation
    if (trades.length > 0 && avgMood < 6) {
      patternRecognition.push("Pattern: Low mood during trading → Worse results")
      tomorrowPlan.push("Before trading: 5 min mindfulness to improve mood")
    } else if (avgMood >= 8) {
      strengths.push("😊 High mood during trading correlates with better results")
    }

    // Generate Tomorrow Plan based on today
    if (totalPnL > 0 && check && check.score >= 75) {
      tomorrowPlan.push("✅ Continue with the same routine - it's working!")
      tomorrowPlan.push("Maintain the same position size and risk management")
    } else if (totalPnL < 0) {
      tomorrowPlan.push("🔄 Reset: Start with half the risk to restore confidence")
      tomorrowPlan.push("Focus on 1-2 quality setups instead of quantity")
    }

    if (!tomorrowPlan.length) {
      tomorrowPlan.push("Continue with disciplined approach")
      tomorrowPlan.push("Monitor emotions and write in journal")
    }

    // Default messages if no data
    if (!psychologicalAnalysis) {
      psychologicalAnalysis =
        "Insufficient data for psychological analysis. Complete Morning Check for detailed insights."
    }
    if (!performancePrediction) {
      performancePrediction = "Nedostatek dat pro predikci. Zaznamenejte trades pro AI predikce budoucího výkonu."
    }
    if (!riskAssessment) {
      riskAssessment = "Nedostatek dat pro risk assessment. Zaznamenejte trades pro analýzu risk managementu."
    }

    setAiInsights({
      strengths,
      weaknesses,
      tomorrowPlan,
      psychologicalAnalysis,
      patternRecognition,
      riskAssessment,
      performancePrediction,
    })
  }

  const handleComplete = () => {
    // Check if stage is already locked
    if (isStage5Locked) {
      toast({
        title: "Fáze Uzamčena",
        description: "Fáze 5 (Denní shrnutí) již byla dnes dokončena a je uzamčena.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Complete stage 4 (Record Trades) if not already completed
    const stage4 = stages.find((s) => s.id === 4)
    if (stage4 && !stage4.completed) {
      completeStage(4)
    }

    // Complete stage 5 (Daily Summary)
    completeStage(5)
    toast({
      title: "Den úspěšně uzavřen",
      description: "Data byla uložena do historie. Dobrá práce!",
    })
    router.push("/daily-tracker")
  }

  // Calculate statistics
  const totalPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winningTrades = todayTrades.filter((t) => t.pnl > 0).length
  const losingTrades = todayTrades.filter((t) => t.pnl < 0).length
  const winRate = todayTrades.length > 0 ? Math.round((winningTrades / todayTrades.length) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {format(new Date(), "d. MMMM yyyy", { locale: cs })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {format(new Date(), "HH:mm")}
            </span>
            <span>•</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isLiveMode
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30",
              )}
            >
              {isLiveMode ? "🔴 Live" : "🎮 Virtual"}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Trading Summary</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Activity className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isStage5Locked}
            className={cn(
              "font-medium flex items-center gap-2",
              isStage5Locked
                ? "bg-gray-600 hover:bg-gray-600 text-white cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            )}
          >
            {isStage5Locked ? (
              <>
                <Lock className="w-4 h-4" />
                Closed - Day was completed today
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Close Day
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <h3 className={cn("text-2xl font-bold mt-1", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {totalPnL > 0 ? "+" : ""}
                  {totalPnL.toFixed(2)} $
                </h3>
              </div>
              <div className={cn("p-2 rounded-lg", totalPnL >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                <DollarSign className={cn("w-5 h-5", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")} />
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", totalPnL >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                style={{ width: "100%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-400">{winRate}%</h3>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${winRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Number of Trades</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{todayTrades.length}</h3>
              </div>
              <div className="p-2 rounded-lg bg-white/10">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex gap-2 text-xs mt-2">
              <span className="text-emerald-400">{winningTrades} Winning</span>
              <span className="text-zinc-600">•</span>
              <span className="text-rose-400">{losingTrades} Losing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Readiness Score</p>
                <h3 className="text-2xl font-bold mt-1 text-purple-400">{morningCheck?.score || 0}/100</h3>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${morningCheck?.score || 0}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade History Section */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">{txt.tradeHistory}</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              {txt.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {todayTrades.length > 0 ? (
              <div className="space-y-1">
                {todayTrades.map((trade, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full", trade.pnl > 0 ? "bg-emerald-500" : "bg-rose-500")} />
                      <div>
                        <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Eye className="w-3 h-3" /> {txt.recognized}
                        </h4>
                        <div className="space-y-2">
                          {aiInsights.patternRecognition.length > 0 ? (
                            aiInsights.patternRecognition.map((pattern, i) => (
                              <div key={i} className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                                <p className="text-sm text-zinc-300">{pattern}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">{txt.noPatterns}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{trade.pair}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-5 border-0",
                            trade.direction === "Long"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400",
                          )}
                        >
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {trade.size} lot • {trade.entry} → {trade.exit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          "font-mono font-medium block",
                          trade.pnl > 0 ? "text-emerald-400" : "text-rose-500",
                        )}
                      >
                        {trade.pnl > 0 ? "+" : ""}
                        {trade.pnl.toFixed(2)} $
                      </span>
                      <span className="text-xs text-muted-foreground">{txt.mood}: {trade.mood}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 opacity-50" />
                </div>
                <p>{txt.noTrades}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights & Plan */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/50 border-white/10 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {txt.aiAnalysis}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" /> {txt.whatWentWell}
                </h4>
                <ul className="space-y-2">
                  {aiInsights.strengths.length > 0 ? (
                    aiInsights.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2" />
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">Žádná data k analýze</li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" /> {txt.areasImprovement}
                </h4>
                <ul className="space-y-2">
                  {aiInsights.weaknesses.length > 0 ? (
                    aiInsights.weaknesses.map((item, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-rose-500 mt-2" />
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">Žádné kritické chyby nenalezeny</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5 text-indigo-400" />
                {txt.psychAnalysis}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-2 font-normal">{txt.deeperLook}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="font-semibold text-indigo-300">Aktuální stav: </span>
                  {aiInsights.psychologicalAnalysis}
                </p>
              </div>
              
              {/* Quick Mental Metrics */}
              <div className="grid grid-cols-3 gap-2">
                {morningCheck && (
                  <>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-gray-400 mb-1">Nálada</p>
                      <p className="text-lg font-bold text-yellow-400">{morningCheck.emotionalState}/10</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-gray-400 mb-1">Stres</p>
                      <p className="text-lg font-bold text-orange-400">{morningCheck.stressLevel}/10</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-gray-400 mb-1">Focus</p>
                      <p className="text-lg font-bold text-blue-400">{morningCheck.focus}/10</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-amber-400" />
                Risk Assessment & Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-zinc-300 leading-relaxed">{aiInsights.riskAssessment}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Performance Prediction & Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">{aiInsights.performancePrediction}</p>
              </div>
            </CardContent>
          </Card>

          {/* Plan for Tomorrow - Action Steps */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/30 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-blue-400" />
                Action Items for Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiInsights.tomorrowPlan.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border-l-4 border-blue-500/50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 font-bold text-xs text-white">
                      {i + 1}
                    </div>
                    <p className="text-sm text-zinc-200 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
