"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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
import { useAuth } from "@/contexts/auth-context"
import { getScoped, setScoped } from "@/lib/storage"
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
  const { isLiveMode, trades, morningChecks } = useData()
  const { analytics } = useAnalytics()
  const { user } = useAuth()
  const [currentWeekData, setCurrentWeekData] = useState<any>(null)
  const [reviewVariant, setReviewVariant] = useState<"manual" | "ai">("manual")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
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
  const [savedReviews, setSavedReviews] = useState<any[]>([])
  const [actionPlan, setActionPlan] = useState<{ text: string; completed: boolean }[]>([
    { text: "", completed: false },
    { text: "", completed: false },
    { text: "", completed: false },
  ])
  const [activeTab, setActiveTab] = useState("current")
  const [viewingReview, setViewingReview] = useState<any | null>(null)

  useEffect(() => {
    if (isLiveMode) {
      // V LIVE MODE - načti data z analytics
      if (analytics?.summary) {
        console.log("[v0] Weekly Review - Inicijalizuji z analytics")
        const weekData = {
          weekStart: new Date().toLocaleDateString('cs-CZ'),
          weekEnd: new Date().toLocaleDateString('cs-CZ'),
          avgMood: 75,
          avgReadiness: analytics.summary.avgReadiness || 75,
          revengeIncidents: analytics.psychology?.revengeIncidents || 0,
          dailyData: [],
          totalTrades: analytics.summary.totalTrades,
          winRate: analytics.summary.winRate,
          totalPnL: analytics.summary.totalPnL,
          weekStartDate: new Date(), // Ulož kdy byl review inicijalizován
        }
        setCurrentWeekData(weekData)
      }
      return
    }
    
    // V VIRTUAL MODE - loaduj demo data
    if (!currentWeekData) {
      loadVirtualData()
    }
  }, [isLiveMode, analytics])

  // Kontroluj zda se začal nový týden a resetuj data
  useEffect(() => {
    if (!currentWeekData?.weekStartDate || !isLiveMode) return

    const checkWeekChange = () => {
      const now = new Date()
      const weekStart = currentWeekData.weekStartDate
      
      // Pokud je dnes pondělí (getDay() === 1) a data pocházejí z minulého týdne
      if (now.getDay() === 1) {
        const daysDiff = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff >= 7) {
          console.log("[v0] Weekly Review - Nový týden detekován, resetuji data")
          // Resetuj review data
          setCurrentWeekData(null)
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
          setReviewVariant("manual")
        }
      }
    }

    // Kontroluj při mount a pak každou hodinu
    checkWeekChange()
    const interval = setInterval(checkWeekChange, 60 * 60 * 1000) // Každou hodinu
    
    return () => clearInterval(interval)
  }, [currentWeekData?.weekStartDate, isLiveMode])


  useEffect(() => {
    if (user?.id) {
      loadSavedReviews()
    }
  }, [user?.id])

  // Auto-generate weekly review from computed analytics (ONLY in live mode when data is loaded)
  useEffect(() => {
    if (!analytics || !isLiveMode) return

    // Filtruj data POUZE z posledních 7 dní
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const tradesLast7Days = (trades || []).filter((t: any) => {
      const tradeDate = new Date(t.date || t.created_at)
      return tradeDate >= sevenDaysAgo
    })

    const { weeklyInsights } = analytics

    console.log("[v0] [WeeklyReview] Generating review from last 7 days data:", {
      totalTrades: tradesLast7Days.length,
      winRate: tradesLast7Days.length > 0 ? Math.round((tradesLast7Days.filter((t: any) => t.pnl > 0).length / tradesLast7Days.length) * 100) : 0,
      totalPnL: tradesLast7Days.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0),
    })

    setReview({
      whatWorked: `Nejlepší den: ${weeklyInsights.bestPerformingDay}`,
      whatDidntWork: `Nejhorší den: ${weeklyInsights.worstPerformingDay}`,
      biggestWin: `Nejlepší den: ${analytics.summary.bestDay.date} (+$${analytics.summary.bestDay.pnl.toFixed(2)})`,
      biggestLoss: `Nejhorší den: ${analytics.summary.worstDay.date} (-$${Math.abs(analytics.summary.worstDay.pnl).toFixed(2)})`,
      emotionalPatterns: weeklyInsights.readinessVsResults,
      mistakesMade: weeklyInsights.commonMistake,
      lessonsLearned: `${analytics.psychology.revengeIncidents === 0 ? "Dobrá emoční kontrola" : `${analytics.psychology.revengeIncidents} incidentů revenge tradingu - zaveď pauzu po ztrátách`}`,
      weeklyGoals: weeklyInsights.nextWeekFocus.slice(0, 3),
      focusAreas: ["Udržet vysokou připravenost", "Dodržovat obchodní plán", "Sledovat emoce"],
      tradingPlanAdjustments: `Aktuální disciplína: ${analytics.psychology.disciplineScore.toFixed(0)}%`,
      riskManagementNotes: `Podíl výher: ${analytics.summary.winRate.toFixed(1)}%`,
      mindsetPreparation: `Průměrná připravenost: ${analytics.summary.avgReadiness.toFixed(0)}%`,
    })

    setActionPlan(
      weeklyInsights.nextWeekFocus.map((focus) => ({
        text: focus,
        completed: false,
      })),
    )
  }, [analytics, isLiveMode, trades])

  useEffect(() => {
    // if (reviewVariant === "ai" && currentWeekData) {
    //   generateAIContent()
    // }
  }, [reviewVariant, currentWeekData])

  const generateReview = async () => {
    if (!currentWeekData || !analytics) {
      console.log("[v0] generateReview - Chybí data")
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + Math.random() * 30
        return next >= 95 ? 95 : next
      })
    }, 300)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("[v0] generateReview - Generuji insights z reálných dat")

      // Filtruj data POUZE z posledních 7 dní
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const tradesLast7Days = trades.filter((t: any) => {
        const tradeDate = new Date(t.date || t.created_at)
        return tradeDate >= sevenDaysAgo
      })
      
      const morningChecksLast7Days = morningChecks.filter((m: any) => {
        const checkDate = new Date(m.date || m.created_at)
        return checkDate >= sevenDaysAgo
      })

      // Extrahuj reálná data z analytics a trading historii - POUZE Z POSLEDNÍCH 7 DNÍ
      const totalTrades = Math.round(tradesLast7Days.length)
      
      // Vypočítej winRate z posledních 7 dní
      const winnersCount = tradesLast7Days.filter((t: any) => t.pnl > 0).length
      const winRate = totalTrades > 0 ? Math.round((winnersCount / totalTrades) * 100) : 0
      
      // Vypočítej totalPnL z posledních 7 dní
      const totalPnL = tradesLast7Days.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
      
      // Počítej revenge incidents z posledních 7 dní
      const revengeIncidents = Math.round(tradesLast7Days.filter((t: any) => t.revenge_trade).length)
      
      // Vypočítej průměrnou připravenost z morning_checks posledních 7 dní (score 0-100)
      const avgReadiness = morningChecksLast7Days.length > 0 
        ? Math.round(morningChecksLast7Days.reduce((sum: number, check: any) => sum + (check.score || 0), 0) / morningChecksLast7Days.length)
        : 75

      // Vypočítej průměrnou náladu z trades posledních 7 dní (mood 1-10)
      const avgMood = tradesLast7Days.length > 0
        ? Math.round((tradesLast7Days.reduce((sum: number, trade: any) => sum + (trade.mood || 5), 0) / tradesLast7Days.length) * 10)
        : 75

      // Zaokrouhluj všechny procenta
      const roundedWinRate = Math.round(winRate)
      const roundedReadiness = Math.round(avgReadiness)
      const roundedMood = Math.round(avgMood)

      // Generuj dailyData z reálných záznamů posledních 7 dní
      const daysOfWeek = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
      const dailyDataMap = new Map()

      // Přidej morning_checks data z posledních 7 dní
      morningChecksLast7Days.forEach((check: any) => {
        const date = new Date(check.date || check.created_at)
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
        if (dayIndex >= 0 && dayIndex < 7) {
          if (!dailyDataMap.has(dayIndex)) {
            dailyDataMap.set(dayIndex, { day: daysOfWeek[dayIndex], readiness: 0, mood: 0, trades: 0, pnl: 0 })
          }
          const dayData = dailyDataMap.get(dayIndex)
          dayData.readiness = check.score || 75
        }
      })

      // Přidej trades data z posledních 7 dní
      tradesLast7Days.forEach((trade: any) => {
        const date = new Date(trade.date || trade.created_at)
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
        if (dayIndex >= 0 && dayIndex < 7) {
          if (!dailyDataMap.has(dayIndex)) {
            dailyDataMap.set(dayIndex, { day: daysOfWeek[dayIndex], readiness: 75, mood: 0, trades: 0, pnl: 0 })
          }
          const dayData = dailyDataMap.get(dayIndex)
          dayData.trades += 1
          dayData.pnl += trade.pnl || 0
          dayData.mood = Math.max(dayData.mood, (trade.mood || 5) * 10)
        }
      })

      // Konvertuj na array a vyplň chybějící dny
      const dailyData = daysOfWeek.map((day, index) => {
        const existing = dailyDataMap.get(index)
        return existing || { 
          day, 
          readiness: Math.round(avgReadiness), 
          mood: Math.round(avgMood), 
          trades: 0, 
          pnl: 0 
        }
      })

      // Generuj kvalitní insights z reálných dat posledních 7 dní
      const bestDay = dailyData.reduce((best: any, d: any) => 
        d.pnl > (best?.pnl || Number.NEGATIVE_INFINITY) ? d : best
      , null)
      
      const worstDay = dailyData.reduce((worst: any, d: any) => 
        d.pnl < (worst?.pnl || Number.POSITIVE_INFINITY) ? d : worst
      , null)

      // Najdi best a worst trades z posledních 7 dní
      const winningTrades = tradesLast7Days.filter((t: any) => t.pnl > 0)
      const losingTrades = tradesLast7Days.filter((t: any) => t.pnl < 0)
      const bestTrade = tradesLast7Days.reduce((best: any, t: any) => 
        t.pnl > (best?.pnl || Number.NEGATIVE_INFINITY) ? t : best
      , tradesLast7Days[0])
      // Jen hledej worstTrade pokud existují ztrátové trades
      const worstTrade = losingTrades.length > 0 
        ? losingTrades.reduce((worst: any, t: any) => 
            t.pnl < (worst?.pnl || Number.POSITIVE_INFINITY) ? t : worst
          , losingTrades[0])
        : null

      // Analyzuj session výkonnost z posledních 7 dní
      const sessionStats: any = {}
      tradesLast7Days.forEach((t: any) => {
        const pair = t.pair || "Unknown"
        if (!sessionStats[pair]) {
          sessionStats[pair] = { count: 0, winCount: 0, totalPnL: 0, avgMood: 0 }
        }
        sessionStats[pair].count++
        if (t.pnl > 0) sessionStats[pair].winCount++
        sessionStats[pair].totalPnL += t.pnl
        sessionStats[pair].avgMood += (t.mood || 0)
      })

      Object.keys(sessionStats).forEach(key => {
        sessionStats[key].avgMood = sessionStats[key].avgMood / sessionStats[key].count
        sessionStats[key].winRate = (sessionStats[key].winCount / sessionStats[key].count) * 100
      })

      // Zjisti best pair z posledních 7 dní
      const bestPair = Object.entries(sessionStats).reduce((best: any, [pair, stats]: any) => 
        stats.totalPnL > (best?.totalPnL || 0) ? { pair, ...stats } : best
      , null)

      // Generuj detailní AI insights z dat posledních 7 dní
      const aiInsights = []

      // Insight 1: Best performing pattern
      if (bestPair) {
        aiInsights.push({
          type: "success",
          title: `${bestPair.pair} = Tvoje Profit Zóna`,
          description: `${bestPair.pair} měl ${Math.round(bestPair.winRate)}% win rate s celkovým ziskem +$${bestPair.totalPnL.toFixed(2)}. Toto jsou tvoje nejlepší trady.`,
          action: `ZAMĚŘENÍ: Prioritizuj ${bestPair.pair}. Tvoje strategie tam funguje perfektně.`,
        })
      }

      // Insight 2: Readiness correlation
      if (roundedReadiness > 75) {
        aiInsights.push({
          type: "success",
          title: "Vysoká readiness = Vysoký výkon",
          description: `Průměrná připravenost: ${roundedReadiness}%. Dny s vysokou připraveností měly lepší výsledky. Připravenost > 80% koreluje s zisky.`,
          action: `PATTERN POTVRZENÝ: Když readiness > 80%, tvůj win rate je vyšší. Čekej na tyto dny pro větší pozice.`,
        })
      } else if (roundedReadiness < 65) {
        aiInsights.push({
          type: "critical",
          title: "Nízká Připravenost = Nízký Výkon",
          description: `Průměrná připravenost pouze ${roundedReadiness}%. Dny s nízkou připraveností měly špatné výsledky.`,
          action: `PRAVIDLO: Neobchoduj pod 65% readiness. Nastav alarm pokud readiness < 65%.`,
        })
      }

      // Insight 3: Revenge trading pattern
      if (revengeIncidents > 0) {
        aiInsights.push({
          type: "critical",
          title: "Pomstový Trading Pattern",
          description: `${revengeIncidents} revenge trading incidentů detekováno. Revenge trady měly horší results než běžné trady.`,
          action: `STOP LOSS PRO PSYCHIKU: Po ztrátovém dni max 2 trady následující den. Dej si čas na reset.`,
        })
      }

      // Insight 4: Emotion analysis z posledních 7 dní
      if (tradesLast7Days.length > 0) {
        const avgMoodFromTrades = Math.round(tradesLast7Days.reduce((sum: number, t: any) => sum + (t.mood || 0), 0) / tradesLast7Days.length * 10)
        if (avgMoodFromTrades > 80) {
          aiInsights.push({
            type: "success",
            title: "Emoční Stabilita Podporuje Výkon",
            description: `Průměrná nálada: ${avgMoodFromTrades}%. Stabilní emoční stav podporuje disciplinované rozhodování.`,
            action: `POKRAČUJ: Tvůj emoční stav je optimální. Udržuj rutiny které tě udržují v tomto stavu.`,
          })
        }
      }

      // Insight 5: Win rate feedback
      if (roundedWinRate >= 50) {
        aiInsights.push({
          type: "success",
          title: `${roundedWinRate}% Win Rate = Profitabilní Strategie`,
          description: `Tvoje strategie je profitabilní s ${roundedWinRate}% win rate. Na ${totalTrades} tradů.`,
          action: `POKRAČUJ: Strategie funguje. Fokus na konzistenci a risk management.`,
        })
      } else if (roundedWinRate > 0) {
        aiInsights.push({
          type: "warning",
          title: `${roundedWinRate}% Win Rate = Zlepšení Potřeba`,
          description: `Win rate pouze ${roundedWinRate}%. Potřebuješ zvýšit selectivity tradů.`,
          action: `VYLEPŠENÍ: Soustředit se pouze na A+ setupy. Kvalita > Kvantita.`,
        })
      }

      // Definuj default texty
      const defaultBiggestWin = `Nejlepší trade: +$${(totalPnL * 0.4).toFixed(2)}`
      const defaultBiggestLoss = losingTrades.length > 0 
        ? `Největší ztráta: -$${(Math.abs(tradesLast7Days.reduce((min: any, t: any) => t.pnl < min.pnl ? t : min).pnl)).toFixed(2)}`
        : "Bez ztrát tento týden! 🎉 Všechny trades byly ziskové."

      const whatWorked = aiInsights
        .filter((i: any) => i.type === "success")
        .map((i: any) => i.description)
        .join("\n") || `Trading s win rate ${roundedWinRate}%.`

      const whatDidntWork = aiInsights
        .filter((i: any) => i.type === "critical" || i.type === "warning")
        .map((i: any) => i.description)
        .join("\n") || "Žádné specifické problémy."

      // Aktualizuj currentWeekData se REÁLNÝMI daty pro grafy
      setCurrentWeekData((prev: any) => ({
        ...prev,
        dailyData,
        avgReadiness: roundedReadiness,
        avgMood: roundedMood,
        totalTrades,
        winRate: roundedWinRate,
        totalPnL,
      }))

      // Vyplň insights
      setReview({
        whatWorked,
        whatDidntWork,
        biggestWin: bestTrade 
          ? `${bestTrade.pair || "Best"} ${bestTrade.direction?.toUpperCase() || "TRADE"}: +$${bestTrade.pnl.toFixed(2)}`
          : defaultBiggestWin,
        biggestLoss: worstTrade
          ? `${worstTrade.pair || "Worst"} ${worstTrade.direction?.toUpperCase() || "TRADE"}: -$${Math.abs(worstTrade.pnl).toFixed(2)}`
          : defaultBiggestLoss,
        emotionalPatterns: `Průměrná nálada: ${roundedMood}%. ${
          trades.length > 0 
            ? `Nálada během tradů: ${Math.round(trades.reduce((s: number, t: any) => s + (t.mood || 0), 0) / trades.length * 10)}%.`
            : ""
        }`,
        mistakesMade: `${
          revengeIncidents > 0 ? `1) ${revengeIncidents} revenge trading incidentů\n` : ""
        }${
          roundedReadiness < 65 ? `2) Obchodování s nízkou připraveností (<65%)\n` : ""
        }${
          roundedWinRate < 40 && totalTrades > 5 ? `3) Příliš mnoho ztrátových tradů - nižší selectivity\n` : ""
        }Pokračuj v analýze a journalingu.`,
        lessonsLearned: `Data jasně ukazují: ${
          bestPair ? `${bestPair.pair} je tvoje profit zóna.` : ""
        } ${
          roundedReadiness > 75 ? `Vysoká připravenost + spánek > 7h = lepší výsledky.` : ""
        } ${
          revengeIncidents === 0 ? `Emoční disciplína tvůj silný bod.` : `Po ztrátovém dni sniž aktivitu.`
        }`,
        weeklyGoals: [
          roundedReadiness < 70 ? "Obchodovat pouze s readiness 70%+" : "Udržet readiness 75%+",
          "Zaměřit se pouze na A+ setupy",
          revengeIncidents > 0 ? "Eliminovat revenge trading" : "Pokračovat v emoční disciplíně",
        ],
        focusAreas: [
          bestPair ? `${bestPair.pair} - tvoje profit zóna` : "Najít profit zónu",
          "Spánek 7+ hodin každou noc",
          "Stop loss pro psychiku: po ztrátě redukuj aktivitu",
        ],
        tradingPlanAdjustments: `Zaměřit se na ${bestPair?.pair || "A+ setupy"}. ${
          roundedReadiness < 65 ? "Automatický alarm pokud readiness < 65%." : ""
        } ${
          revengeIncidents > 0 ? "Po ztrátovém dni sniž aktivitu." : ""
        } Position size zvýšit pouze při readiness 80%+.`,
        riskManagementNotes: `${totalTrades} tradů, ${roundedWinRate}% win rate, +$${totalPnL.toFixed(2)} PnL. ${
          worstTrade ? `Největší ztráta: -$${Math.abs(worstTrade.pnl).toFixed(2)}.` : ""
        } Implementovat: Max 2% risk per trade, Max 6% daily loss limit.`,
        mindsetPreparation: `Připravenost: ${roundedReadiness}%, Nálada: ${roundedMood}%. ${
          roundedMood > 80 ? "Tvůj mindset je skvělý - pokračuj." : "Pracuj na zvýšení nálady - meditace a cvičení."
        } Každé ráno: Morning Check. Meditace 10min před tradingem.`,
      })

      console.log("[v0] generateReview - Insights vygenerovány z reálných dat")

      setLoadingProgress(100)
      clearInterval(progressInterval)

      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0)
        setReviewVariant("manual")
      }, 500)
    } catch (error) {
      console.error("[v0] generateReview error:", error)
      clearInterval(progressInterval)
      setIsLoading(false)
      setLoadingProgress(0)
    }
  }

  const generateAIContent = () => {
    if (!currentWeekData) return

    const data = currentWeekData
    const aiWhatWorked = "Nejlepší výkon při vysoké připravenosti (80%+). Trading během London session měl 100% win rate."
    const aiWhatDidntWork = "Overtrading po ztrátách. Slabá výsledky kdy připravenost klesla pod 65%."

    setReview({
      whatWorked: aiWhatWorked,
      whatDidntWork: aiWhatDidntWork,
      biggestWin: `Nejlepší den: +$${data.totalPnL?.toFixed(2) || "0"} při vysoké připravenosti`,
      biggestLoss: "Nejhorší den: Nízká připravenost vedla k ztrátě",
      emotionalPatterns: `Průměrná nálada: ${Math.round(data.avgMood || 75)}%`,
      mistakesMade: "Overtrading, revenge trading po ztrátách",
      lessonsLearned: "Čekej na high probability setupy, neobchoduj pod 65% readiness",
      weeklyGoals: ["Dosáhnout 80% readiness", "Čekání na A+ setupy", "Dodržovat risk management"],
      focusAreas: ["Spánek 7+ hodin", "Ranní kontrola", "Emoční disciplína"],
      tradingPlanAdjustments: `Disciplína: ${Math.round(75)}%`,
      riskManagementNotes: `Win rate: ${Math.round(data.winRate || 50)}%`,
      mindsetPreparation: `Průměrná připravenost: ${Math.round(data.avgReadiness || 75)}%`,
    })

    setActionPlan([
      { text: "Nastavit alarm na 65% readiness limit", completed: false },
      { text: "30min pauza po ztrátě", completed: false },
      { text: "Backtesting strategie - A+ setupy", completed: false },
    ])
  }

  const loadVirtualData = () => {
    // POUZE PRO VIRTUAL MODE - tato funkce se by se NEMĚLA volat v live modu
    if (isLiveMode) {
      console.log("[v0] Weekly Review - Ignoruji loadVirtualData v LIVE MODE")
      return
    }

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDay() === 0 ? today.getDate() - 6 : today.getDate() - today.getDay() + 1)
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
        title: "Londýnská Relace = Zisková Zóna",
        description:
          "Trady během London session měly 100% win rate s průměrným ziskem +140 pips. Pondělí a středa byly tvoje nejlepší dny.",
        action:
          "ZAMĚŘENÍ: Prioritizuj Londýnskou relaci (8:00-12:00). Tvoje strategie tam funguje perfektně. Vyhni se Asijské relaci.",
      },
      {
        type: "critical",
        title: "Nedostatek spánku = Pomstový Trading",
        description:
          "Ve čtvrtek jsi spal pouze 5.8h a následně udělal 5 tradů s -120 pips ztrátou. Připravenost byla 55% - pod kritickou hranicí.",
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
        title: "Asijská Relace není tvoje",
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
    if (!user?.id) return
    const saved = getScoped("live", user.id, "weekly-reviews", [])
    setSavedReviews(saved)
  }

  const saveReview = () => {
    if (!currentWeekData || !user?.id) return

    const newReview: WeeklyReview = {
      id: Date.now().toString(),
      weekStart: currentWeekData.weekStart,
      weekEnd: currentWeekData.weekEnd,
      createdAt: new Date().toISOString(),
      variant: reviewVariant,
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
      actionPlan: actionPlan,
      ...(review as any),
    }

    const updated = [newReview, ...savedReviews]
    setSavedReviews(updated)
    setScoped("live", user.id, "weekly-reviews", updated)

    alert("Týdenní přehled uložen!")
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
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `weekly-review-${reviewData.weekStart}-${reviewData.weekEnd}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url);
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
  };

  // Main component render
  return (
    <>
      {!currentWeekData || isLoading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-white">Načítání dat...</div>
          </div>
        </div>
      ) : isLoading ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Generuji tvůj týdenní přehled</h2>
              <p className="text-gray-400">Analyzuji tvoje data a vytvářím personalizované insights...</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Progres</span>
                <span className="font-bold">{Math.round(loadingProgress)}%</span>
              </div>
              <Progress value={loadingProgress} className="h-3" />
            </div>
          </div>
        </div>
      ) : (
        // Hlavní obsah weekly review
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-block p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <Calendar className="w-12 h-12 text-purple-400" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI Týdenní přehled
              </h1>
              <p className="text-gray-400 text-lg">
                {currentWeekData.weekStart} - {currentWeekData.weekEnd}
              </p>

              <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                <Button
                  onClick={generateReview}
                  disabled={isLoading || !analytics}
                  className="px-6 py-3 rounded-xl transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generuji...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generovat přehled
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setReviewVariant("ai")
                  }}
                  disabled={true}
                  className={cn(
                    "px-6 py-3 rounded-xl transition-all",
                    "bg-slate-700 text-gray-500 cursor-not-allowed opacity-50",
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

          {isLoading && (
            <div className="max-w-sm mx-auto space-y-2 mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Načítání dat...</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
              <Progress value={loadingProgress} className="h-2 bg-slate-700" />
            </div>
          )}

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="max-w-7xl space-y-8 px-6">
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
                Uložit týdenní přehled ({reviewVariant === "ai" ? "AI" : "Manuální"})
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Historie týdenních přehledů
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
                    Týdenní přehled: {viewingReview.weekStart} - {viewingReview.weekEnd}
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

        {/* Virtual Mode Banner */}
        {!isLiveMode && (
          <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-3 px-4 flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-xs md:text-sm text-amber-100">
              <span className="font-bold text-white">Momentálně si prohlížíš data ve Virtual modu</span> – jak mohou vypadat během používání softwaru
            </span>
          </div>
        )}

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
      </Tabs>
      )}
    </>
  )
}
