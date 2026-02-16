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
  Zap
} from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useDailyStage } from "@/contexts/daily-stage-context"
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
  const { getAllTrades, isLiveMode } = useData()

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
        goals: ["Najít A+ setup na EUR/USD", "Dodržet 2% risk per trade", "Bez revenge tradingu"][Math.floor(Math.random() * 3)],
        maxRiskPercent: 2,
        emotionalGoal: ["Zůstat klidný a disciplinovaný", "Převzít odpovědnost za chyby", "Cítit se sebevědomě"][Math.floor(Math.random() * 3)],
      }

      const demoPlan: TradingPlanData = {
        date: selectedDate,
        setups: "Breakout z resistance levelu + konfirmace z Fibs",
        pairs: "EUR/USD, GBP/USD, XAU/USD",
        strategy: "Trend following s 3:1 risk reward",
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
          notes: isWin ? "Dobré setup, dodržel jsem plán" : "Příliš brzy vstup, měl jsem čekat",
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

      // Load morning check
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      const todayMorningCheck = morningChecks.find((m: MorningCheckData) => m.date === today)
      setMorningCheck(todayMorningCheck || null)

      // Load intention
      const intentions = JSON.parse(localStorage.getItem("daily-intentions") || "[]")
      const todayIntention = intentions.find((i: DailyIntentionData) => i.date === today)
      setIntention(todayIntention || null)

      // Load trading plan
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      const todayPlan = plans.find((p: TradingPlanData) => p.date === today)
      setTradingPlan(todayPlan || null)

      generateAdvancedInsights(todayMorningCheck, trades, todayIntention)
    }
  }, [getAllTrades, isLiveMode])

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
      psychologicalAnalysis = `Tvůj psychologický profil dnes: Nálada ${check.emotionalState}/10, Stres ${check.stressLevel}/10, Focus ${check.focus}/10. `

      if (check.stressLevel >= 8) {
        psychologicalAnalysis += `Vysoký stres je tvou největší překážkou. Tvůj amygdala (emoční mozek) je nyní dominantní, což snižuje logické rozhodování. Doporučuji: Učiň pauzu, projdi 4-7-8 dechování 5x. Bez snížení stresu riskuješ revenge trading a horší exekuci.`
      } else if (check.stressLevel <= 3) {
        psychologicalAnalysis += `Nízký stres je tvou silnou stránkou. Tvůj prefrontální kůra (logika) dominuje, což vede k lepším rozhodnutím. Udržuj tenhle stav - to je ideální podmínka pro obchodování.`
      } else {
        psychologicalAnalysis += `Stres na normální úrovni. Dej si pozor na eskalaci - mnoho traderů neznamená kdy jejich stres překročil bezpečný práh, dokud není pozdě.`
      }

      if (check.focus < 5) {
        psychologicalAnalysis += ` Tvůj focus je slabý - to znamená vynechávání signálů a nízká kvalita exekuce. Zkus Pomodoro techniku: 25min intenzivního soustředění, pak 5min pauza.`
      } else if (check.focus >= 8) {
        psychologicalAnalysis += ` Tvůj focus je excelentní - to je super-schopnost pro trading. Využij tohoto okna zvaného "flow state" - je to měsíce, kdy nejlepší tradery tráví.`
      }

      if (check.emotionalState >= 8) {
        psychologicalAnalysis += ` Pozitivní emoční stav podporuje sebedůvěru, ale pozor na overconfidence. Právě teď je největší riziko brát větší pozice než je racionální.`
      } else if (check.emotionalState <= 4) {
        psychologicalAnalysis += ` Negativní emoce jsou signál k opatrnosti. Když je nálada nízká, zvyšuje se pravděpodobnost ztrát o 40%. Zvažte kratší session nebo menší pozice.`
      }
    } else {
      psychologicalAnalysis = "Chybí Morning Check data. Bez toho nemůžu posoudit tvůj psychologický stav. Vyplň Morning Check pro detailní analýzu."
    }

    // Specific metric analysis
    if (check && (check.sleepQuality < 6 || check.sleepHours < 6.5)) {
      weaknesses.push("😴 Nedostatečný spánek snížil kognitivní funkce o 30-40%")
      tomorrowPlan.push("Jít spát o 1-2 hodiny dříve, cíl: 7-8 hodin kvalitního spánku")
      patternRecognition.push("Pattern: Špatný spánek → Snížená trpělivost → Předčasné vstupy")
    } else if (check && check.sleepQuality >= 8) {
      strengths.push("💤 Výborný spánek poskytl mentální ostrost a jasnost")
    }

    if (check && check.stressLevel > 7) {
      weaknesses.push("😰 Vysoký stres zvýšil riziko emočního tradingu o 60%")
      tomorrowPlan.push("Zařadit 15-20min meditaci nebo dechová cvičení před tradingem")
      patternRecognition.push("Pattern: Vysoký stres → Revenge trading → Zvýšené ztráty")
    } else if (check && check.stressLevel <= 3) {
      strengths.push("😌 Nízký stres umožnil klidné a racionální rozhodování")
    }

    if (check && check.focus < 6) {
      weaknesses.push("🎯 Nízký focus vedl k přehlédnutí důležitých signálů")
      tomorrowPlan.push("Zkusit Pomodoro techniku: 25min focus + 5min pauza")
      patternRecognition.push("Pattern: Nízký focus → Missed opportunities → Frustrace")
    } else if (check && check.focus >= 8) {
      strengths.push("🔍 Vysoký focus umožnil zachytit všechny klíčové signály")
    }

    if (check && check.emotionalState < 6) {
      weaknesses.push("😔 Negativní emoční stav ovlivnil objektivitu")
      tomorrowPlan.push("Journaling: Zapsat emoce před tradingem pro lepší sebeuvědomění")
    } else if (check && check.emotionalState >= 8) {
      strengths.push("😊 Pozitivní nálada podpořila důvěru a disciplínu")
    }

    // Analyze Trading Performance
    const winRate = trades.length > 0 ? (trades.filter((t) => t.pnl > 0).length / trades.length) * 100 : 0
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgMood = trades.length > 0 ? trades.reduce((sum, t) => sum + (t.mood || 0), 0) / trades.length : 0

    if (totalPnL > 0) {
      strengths.push(`💰 Ziskový den: +${totalPnL.toFixed(2)}$ s Win Rate ${Math.round(winRate)}%`)
      performancePrediction = `Na základě dnešního výkonu (Win Rate ${Math.round(winRate)}%, P&L +${totalPnL.toFixed(2)}$) a mentálního stavu (${check?.score || 0}/100), predikuji 75% šanci na ziskový zítřek pokud dodržíš stejnou rutinu a disciplínu.`
    } else if (totalPnL < 0) {
      weaknesses.push(`📉 Ztrátový den: ${totalPnL.toFixed(2)}$ - analýza příčin nutná`)
      performancePrediction = `Dnešní ztráta (${totalPnL.toFixed(2)}$) vyžaduje reset. Doporučuji zítřek začít s polovičním rizikem a zaměřit se na kvalitu, ne kvantitu. Šance na recovery: 60% pokud dodržíš plán.`
      patternRecognition.push("Pattern: Ztráta → Frustrace → Revenge trading (POZOR!)")
    }

    if (trades.length > 0) {
      weaknesses.push("⚡ Overtrading: Příliš vysoká aktivita snižuje kvalitu rozhodování")
      tomorrowPlan.push("Limit: Zaměř se pouze na A+ setupy, kvalita > kvantita")
      patternRecognition.push("Pattern: Overtrading → Únava → Chyby v exekuci")
    } else if (trades.length === 0) {
      if (check && check.score < 70) {
        strengths.push("🛡️ Disciplína: Správně jsi se vyhnul tradingu při nízké připravenosti")
      } else {
        weaknesses.push("👀 Žádné trades: Možná jsi přehlédl příležitosti nebo byl příliš opatrný")
      }
    }

    // Risk Assessment
    if (trades.length > 0) {
      const maxLoss = Math.min(...trades.map((t) => t.pnl || 0))
      const maxWin = Math.max(...trades.map((t) => t.pnl || 0))
      const riskReward = maxLoss !== 0 ? Math.abs(maxWin / maxLoss) : 0

      if (riskReward >= 2) {
        riskAssessment = `✅ Výborný Risk/Reward ratio: ${riskReward.toFixed(2)}:1. Tvé risk management je na vysoké úrovni. Největší win: +${maxWin}$, největší loss: ${maxLoss}$.`
      } else if (riskReward >= 1) {
        riskAssessment = `⚠️ Průměrný Risk/Reward ratio: ${riskReward.toFixed(2)}:1. Můžeš zlepšit tím, že necháš winnery běžet déle. Největší win: +${maxWin}$, největší loss: ${maxLoss}$.`
      } else {
        riskAssessment = `🚨 Slabý Risk/Reward ratio: ${riskReward.toFixed(2)}:1. KRITICKÉ: Tvé ztráty jsou větší než zisky. Přehodnoť stop loss a take profit strategie. Největší win: +${maxWin}$, největší loss: ${maxLoss}$.`
        weaknesses.push("🚨 Nedostatečný risk management - ztráty převyšují zisky")
        tomorrowPlan.push("PRIORITA: Přehodnotit stop loss umístění a cílové zisky")
      }
    } else {
      riskAssessment = "Žádné trades dnes - risk management nelze vyhodnotit."
    }

    // Mood-Performance Correlation
    if (trades.length > 0 && avgMood < 6) {
      patternRecognition.push("Pattern: Nízká nálada během tradingu → Horší výsledky")
      tomorrowPlan.push("Před tradingem: 5min mindfulness pro zlepšení nálady")
    } else if (avgMood >= 8) {
      strengths.push("😊 Vysoká nálada během tradingu koreluje s lepšími výsledky")
    }

    // Generate Tomorrow Plan based on today
    if (totalPnL > 0 && check && check.score >= 75) {
      tomorrowPlan.push("✅ Pokračovat ve stejné rutině - funguje to!")
      tomorrowPlan.push("Udržet stejnou velikost pozic a risk management")
    } else if (totalPnL < 0) {
      tomorrowPlan.push("🔄 Reset: Začít s polovičním rizikem pro obnovení důvěry")
      tomorrowPlan.push("Zaměřit se na 1-2 kvalitní setupy místo kvantity")
    }

    if (!tomorrowPlan.length) {
      tomorrowPlan.push("Pokračovat v disciplinovaném přístupu")
      tomorrowPlan.push("Sledovat emoce a zapisovat do journalu")
    }

    // Default messages if no data
    if (!psychologicalAnalysis) {
      psychologicalAnalysis =
        "Nedostatek dat pro psychologickou analýzu. Dokončete Morning Check pro detailní insights."
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
          <h1 className="text-3xl font-bold tracking-tight">Shrnutí Obchodního Dne</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Activity className="w-4 h-4 mr-2" />
            Exportovat Report
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
                Uzavřeno - Den byl dnes uzavřen
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Uzavřít Den
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
                <p className="text-sm text-muted-foreground">Celkové P&L</p>
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
                <p className="text-sm text-muted-foreground">Počet Obchodů</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{todayTrades.length}</h3>
              </div>
              <div className="p-2 rounded-lg bg-white/10">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex gap-2 text-xs mt-2">
              <span className="text-emerald-400">{winningTrades} Ziskových</span>
              <span className="text-zinc-600">•</span>
              <span className="text-rose-400">{losingTrades} Ztrátových</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Skóre Připravenosti</p>
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
            <CardTitle className="text-lg font-medium">Historie Obchodů</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              Zobrazit vše <ChevronRight className="w-4 h-4 ml-1" />
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
                          <Eye className="w-3 h-3" /> Rozpoznané Psychologické Patterny
                        </h4>
                        <div className="space-y-2">
                          {aiInsights.patternRecognition.length > 0 ? (
                            aiInsights.patternRecognition.map((pattern, i) => (
                              <div key={i} className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                                <p className="text-sm text-zinc-300">{pattern}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Zatím žádné stabilní patterny detekovány</p>
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
                      <span className="text-xs text-muted-foreground">Mood: {trade.mood}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 opacity-50" />
                </div>
                <p>Dnes žádné obchody</p>
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
                AI Analýza Dne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" /> Co se povedlo
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
                  <AlertTriangle className="w-3 h-3" /> Kde se zlepšit
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
                Psychologická Analýza & Mentální Stav
              </CardTitle>
              <p className="text-xs text-gray-400 mt-2 font-normal">Hlubší pohled na tvůj mindset a psychologické vzorce</p>
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
                Risk Assessment & Správa Rizika
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
                Predikce Výkonu & Šance na Úspěch
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
                🎯 Akční Kroky na Zítřek
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
