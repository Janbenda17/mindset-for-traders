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
  const [archivedEntries, setArchivedEntries] = useState<any[]>([])
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
  const [isArchiving, setIsArchiving] = useState(false)

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

    // Data from MetaTrader only
    const tradeTotalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const tradeWinRate = trades.length > 0 ? (trades.filter((t) => t.pnl > 0).length / trades.length) * 100 : 0
    const maxLoss = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl || 0)) : 0
    const maxWin = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl || 0)) : 0
    const riskReward = maxLoss !== 0 ? Math.abs(maxWin / maxLoss) : 0

    // Detect revenge trades (consecutive losses or increasing loss size)
    const revengeTradePattern: string[] = []
    if (trades.length >= 2) {
      for (let i = 1; i < trades.length; i++) {
        const prevTrade = trades[i - 1]
        const currTrade = trades[i]
        
        // If previous was loss and current is larger loss
        if (prevTrade.pnl < 0 && currTrade.pnl < 0 && Math.abs(currTrade.pnl) > Math.abs(prevTrade.pnl)) {
          revengeTradePattern.push(`Trade ${i}: ${currTrade.pair} - Loss after loss with increased size (${prevTrade.pnl.toFixed(2)}$ → ${currTrade.pnl.toFixed(2)}$)`)
          weaknesses.push(`🚨 Revenge trade detected: ${currTrade.pair} (${currTrade.pnl.toFixed(2)}$) - Loss after previous loss`)
        }
      }
    }

    // Analyze individual trade quality
    let goodSetups = 0
    let badSetups = 0
    const tradeAnalysis: string[] = []

    trades.forEach((trade, idx) => {
      if (trade.pnl > 0) {
        goodSetups++
        if (trade.pnl > maxWin * 0.7) {
          tradeAnalysis.push(`✅ Trade ${idx + 1} (${trade.pair}): Excellent execution - +${trade.pnl.toFixed(2)}$`)
          strengths.push(`${trade.pair}: Strong setup execution`)
        }
      } else {
        badSetups++
        if (Math.abs(trade.pnl) > Math.abs(maxLoss) * 0.8) {
          tradeAnalysis.push(`⚠️ Trade ${idx + 1} (${trade.pair}): Poor execution or bad setup - ${trade.pnl.toFixed(2)}$`)
          weaknesses.push(`${trade.pair}: Bad setup or entry timing`)
        }
      }
    })

    // Trading Performance Summary
    if (tradeTotalPnL > 0) {
      psychologicalAnalysis = `Profitable day: +${tradeTotalPnL.toFixed(2)}$ with ${Math.round(tradeWinRate)}% win rate. You executed ${goodSetups} winning trades out of ${trades.length}. This shows discipline in following your trading plan.`
      performancePrediction = `Based on today's execution quality and win rate, there's a 70% probability of profitable trading tomorrow if you maintain the same setup criteria and stick to your plan.`
    } else if (tradeTotalPnL < 0) {
      psychologicalAnalysis = `Loss day: ${tradeTotalPnL.toFixed(2)}$ with ${Math.round(tradeWinRate)}% win rate. You had ${badSetups} losing trades. Analysis shows ${revengeTradePattern.length > 0 ? 'revenge trading and' : ''} possible setup or entry timing issues.`
      performancePrediction = `Recovery potential: 60%. Key: Tomorrow focus ONLY on A+ setups from your playbook. Avoid averaging down or increasing size after losses.`
    } else {
      psychologicalAnalysis = `Break-even day. You closed ${trades.length} trades with balanced results. Use this as opportunity to review your entry and exit criteria.`
    }

    // Risk/Reward Assessment
    if (trades.length > 0) {
      if (riskReward >= 2) {
        riskAssessment = `✅ Excellent Risk/Reward: ${riskReward.toFixed(2)}:1. Best trade: +${maxWin}$, worst: ${maxLoss}$. Your stop losses are properly placed.`
        strengths.push("✅ Strong risk management")
      } else if (riskReward >= 1) {
        riskAssessment = `⚠️ Average Risk/Reward: ${riskReward.toFixed(2)}:1. Best: +${maxWin}$, worst: ${maxLoss}$. Need tighter stop losses or better entry timing.`
        weaknesses.push("⚠️ Risk/Reward ratio could be improved")
        tomorrowPlan.push("Tighten stops or wait for higher probability setups")
      } else if (riskReward > 0) {
        riskAssessment = `🚨 Critical Risk/Reward: ${riskReward.toFixed(2)}:1. Your losses (${maxLoss}$) are much larger than wins (+${maxWin}$). IMMEDIATE FIX: Reduce position size or use tighter stops.`
        weaknesses.push("🚨 Losses exceed wins significantly")
        tomorrowPlan.push("PRIORITY: Cut position size in half OR place stops 20% tighter")
      }
    } else {
      riskAssessment = "No trades executed."
    }

    // Trade Frequency Analysis
    if (trades.length > 5) {
      weaknesses.push(`⚡ Overtrading: ${trades.length} trades - High frequency often leads to execution errors`)
      patternRecognition.push("Pattern: Overtrading → Fatigue → Worse setups → Losses")
      tomorrowPlan.push("Limit to maximum 3 trades tomorrow - quality over quantity")
    } else if (trades.length > 0 && trades.length <= 3) {
      strengths.push(`✅ Selective trading: ${trades.length} trades shows discipline`)
      tomorrowPlan.push("Maintain this selective approach")
    }

    // Revenge Trade Detection Summary
    if (revengeTradePattern.length > 0) {
      patternRecognition.push(`🚨 REVENGE TRADING DETECTED (${revengeTradePattern.length} instances): After each loss, you increased position size or took another trade immediately.`)
      weaknesses.push("🚨 Revenge trading pattern detected")
      tomorrowPlan.push("After ANY loss: Take 5-minute break before next trade")
      tomorrowPlan.push("If loss > 2% of account, stop trading for the day")
    }

    // Tomorrow Plan
    if (tradeTotalPnL > 0 && tradeWinRate >= 60) {
      tomorrowPlan.push("✅ Continue current strategy - it's working")
      tomorrowPlan.push("Use same position size and risk parameters")
    } else if (tradeTotalPnL < 0) {
      tomorrowPlan.push("🔄 Reset: Start with HALF your normal position size")
      tomorrowPlan.push("Take only A+ setups from your playbook")
      tomorrowPlan.push("Stop trading if you hit 3 consecutive losses")
    }

    if (!tomorrowPlan.length) {
      tomorrowPlan.push("Review your setup criteria before tomorrow's session")
      tomorrowPlan.push("Trade with intention, not emotion")
    }

    // Set insights
    if (!psychologicalAnalysis) {
      psychologicalAnalysis = "No trades today."
    }
    if (!performancePrediction) {
      performancePrediction = "Perform trades to get AI predictions."
    }
    if (!riskAssessment) {
      riskAssessment = "Trade data needed for risk assessment."
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

  // Calculate statistics at component level (for use in both render and functions)
  const totalPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winningTrades = todayTrades.filter((t) => t.pnl > 0).length
  const losingTrades = todayTrades.filter((t) => t.pnl < 0).length
  const winRate = todayTrades.length > 0 ? Math.round((winningTrades / todayTrades.length) * 100) : 0

  const handleArchiveToHistory = async () => {
    setIsArchiving(true)
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      
      // Calculate statistics locally
      const localTotalPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
      const winningTrades = todayTrades.filter((t) => t.pnl > 0).length
      const localWinRate = todayTrades.length > 0 ? Math.round((winningTrades / todayTrades.length) * 100) : 0
      
      // Save to local history state
      const newEntry = {
        id: `${today}-${Date.now()}`,
        date: today,
        totalPnl: localTotalPnL,
        winRate: localWinRate,
        tradesCount: todayTrades.length,
        trades: todayTrades,
        mood: todayTrades.length > 0 ? todayTrades.reduce((sum, t) => sum + (t.mood || 0), 0) / todayTrades.length : 0,
        aiInsights,
        morningCheck,
        tradingPlan: plan,
        dailyIntention: intention,
      }
      
      // Add to archived entries
      setArchivedEntries(prev => [newEntry, ...prev])

      toast({
        title: "Souhrn uložen",
        description: "Dnešní shrnutí bylo uloženo do historie.",
        variant: "default",
        duration: 3000,
      })

      // Reset trades and clear the summary
      setTodayTrades([])
      
      // Refresh to show cleared state
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Archive error:', error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit shrnutí do historie.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsArchiving(false)
    }
  }

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
          <Button
            onClick={handleArchiveToHistory}
            disabled={isArchiving || isStage5Locked}
            className={cn(
              "font-medium flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white",
              isArchiving && "opacity-75 cursor-wait"
            )}
          >
            {isArchiving ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Archive to History
              </>
            )}
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
      </div>

      {/* AI Insights Section */}
      {aiInsights.psychologicalAnalysis && (
        <div className="border-t border-white/10 pt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">AI Trading Analysis</h2>
            
            {/* Psychological Analysis */}
            <Card className="bg-zinc-900/50 border-white/10 mb-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Psychological Analysis
                </h3>
                <p className="text-white/80 leading-relaxed">{aiInsights.psychologicalAnalysis}</p>
              </CardContent>
            </Card>

            {/* Performance Prediction */}
            <Card className="bg-zinc-900/50 border-white/10 mb-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Performance Prediction
                </h3>
                <p className="text-white/80 leading-relaxed">{aiInsights.performancePrediction}</p>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            {aiInsights.riskAssessment && (
              <Card className="bg-zinc-900/50 border-white/10 mb-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    Risk Assessment
                  </h3>
                  <p className="text-white/80 leading-relaxed">{aiInsights.riskAssessment}</p>
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            {aiInsights.strengths.length > 0 && (
              <Card className="bg-zinc-900/50 border-white/10 mb-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.strengths.map((strength, i) => (
                      <li key={i} className="text-white/80 flex gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weaknesses */}
            {aiInsights.weaknesses.length > 0 && (
              <Card className="bg-zinc-900/50 border-white/10 mb-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-white/80 flex gap-2">
                        <span className="text-rose-400">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tomorrow Plan */}
            {aiInsights.tomorrowPlan.length > 0 && (
              <Card className="bg-zinc-900/50 border-white/10 mb-4">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Tomorrow's Plan
                  </h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {aiInsights.tomorrowPlan.map((plan, i) => (
                      <li key={i} className="text-white/80">{plan}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Pattern Recognition */}
            {aiInsights.patternRecognition.length > 0 && (
              <Card className="bg-zinc-900/50 border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Pattern Recognition
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.patternRecognition.map((pattern, i) => (
                      <li key={i} className="text-white/80 flex gap-2">
                        <span className="text-yellow-400">→</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* History Section */}
      {archivedEntries.length > 0 && (
        <div className="border-t border-white/10 pt-8">
          <h2 className="text-2xl font-bold mb-6">Daily Summary History</h2>
          <div className="grid gap-4">
            {archivedEntries.map((entry) => (
              <Card key={entry.id} className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Total P&L</p>
                          <p className={cn("text-lg font-bold", entry.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {entry.totalPnl > 0 ? "+" : ""}{entry.totalPnl.toFixed(2)}$
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="text-lg font-bold text-white">{entry.winRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Trades</p>
                          <p className="text-lg font-bold text-white">{entry.tradesCount}</p>
                        </div>
                        {entry.mood > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">Mood</p>
                            <p className="text-lg font-bold text-white">{entry.mood.toFixed(1)}/10</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-white/10 text-white">Archived</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
