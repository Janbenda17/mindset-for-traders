"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Lightbulb,
  Save,
  Zap,
  Award,
  BookOpen,
  Sparkles,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PenLine,
  History,
  Trophy,
  Flame,
  Shield,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getScoped, setScoped } from "@/lib/storage"
import { useData } from "@/contexts/data-context"
import { useAnalytics } from "@/contexts/analytics-context"

interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  createdAt: string
  variant: "manual" | "ai"
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  bestTrade: number
  worstTrade: number
  avgMood: number
  avgReadiness: number
  whatWorked: string
  whatDidntWork: string
  biggestWin: string
  biggestLoss: string
  emotionalPatterns: string
  mistakesMade: string
  lessonsLearned: string
  weeklyGoals: string[]
  focusAreas: string[]
  tradingPlanAdjustments: string
  riskManagementNotes: string
  mindsetPreparation: string
  actionPlan: { text: string; completed: boolean }[]
  mindPointsGained: number
  currentStreak: number
  lossResets: number
  revengeIncidents: number
  dailyData: any[]
  sleepData: any[]
  aiInsights: any[]
}

export default function WeeklyReviewPage() {
  const { isLiveMode, trades, morningChecks } = useData()
  const { analytics } = useAnalytics()
  const { user } = useAuth()
  
  const [currentWeekData, setCurrentWeekData] = useState<any>(null)
  const [reviewVariant, setReviewVariant] = useState<"manual" | "ai">("manual")
  const [review, setReview] = useState<Partial<WeeklyReview>>({
    whatWorked: "",
    whatDidntWork: "",
    emotionalPatterns: "",
    mistakesMade: "",
    lessonsLearned: "",
  })
  const [savedReviews, setSavedReviews] = useState<any[]>([])
  const [actionPlan, setActionPlan] = useState<{ text: string; completed: boolean }[]>([
    { text: "", completed: false },
    { text: "", completed: false },
    { text: "", completed: false },
  ])
  const [activeTab, setActiveTab] = useState("current")

  // Helper function to round percentages
  const roundPercent = (value: number) => Math.round(value)

  // Generate AI insights based on trading data
  const generateAIInsights = (data: any) => {
    const insights: any[] = []
    const winRate = roundPercent(data.winRate)
    const totalTrades = data.totalTrades || 0
    const pnl = data.totalPnL || 0
    const avgReadiness = roundPercent(data.avgReadiness || 0)
    const avgSleep = data.avgSleep || 7
    const avgStress = data.avgStress || 50
    
    // Performance Analysis - Win Rate
    if (winRate >= 70) {
      insights.push({
        type: "success",
        title: "Výborná Výkonnost",
        description: `S úspěšností ${winRate}% (${data.winningTrades}W/${data.losingTrades}L) patříš mezi top obchodníky. Z ${totalTrades} tradů jsi byl konzistentní.`,
        action: "Udržuj disciplínu. Nesnižuj risk management kvůli sebevědomí.",
      })
    } else if (winRate >= 50 && winRate < 70) {
      insights.push({
        type: "tip",
        title: "Solidní Základ",
        description: `Tvá úspěšnost ${winRate}% je dobrá, ale můžeš lépe. ${data.losingTrades} proher z ${totalTrades} tradů ukazuje prostor pro zlepšení.`,
        action: "Analyzuj své prohrané trady - kde děláš chyby ve vstupech?",
      })
    } else if (winRate < 50 && totalTrades >= 3) {
      insights.push({
        type: "warning",
        title: "Potřeba Zlepšení",
        description: `Úspěšnost ${winRate}% je pod 50%. ${data.losingTrades} proher z ${totalTrades} znamená, že tvoje strategie nefunguje.`,
        action: "STOP trading. Vrať se k backtesting a najdi co děláš špatně.",
      })
    }
    
    // PnL Analysis
    if (pnl > 0 && totalTrades >= 3) {
      const avgPerTrade = (pnl / totalTrades).toFixed(0)
      insights.push({
        type: "success",
        title: "Pozitivní Profit",
        description: `Celkový zisk $${pnl} z ${totalTrades} tradů je skvělý! Průměr $${avgPerTrade} na trade.`,
        action: "Skaluješ dobře. Teď zvyš pozice postupně s rostoucí konzistencí.",
      })
    } else if (pnl < 0 && totalTrades >= 3) {
      insights.push({
        type: "warning",
        title: "Ztráta Kapitálu",
        description: `Ztratil jsi $${Math.abs(pnl)} tento týden. To není udržitelné dlouhodobě.`,
        action: "Sniž risk na polovinu. Zaměř se na 1-2 high probability setups.",
      })
    }
    
    // Psychology - Revenge Trading
    if (data.revengeIncidents > 0) {
      insights.push({
        type: "warning",
        title: "Revenge Trading - Červený Poplach",
        description: `Detekovali jsme ${data.revengeIncidents} případ(ů) revenge tradingu. Toto je smrtící návyk.`,
        action: "Pravidlo: Po větší ztrátě VŽDY pauza 15 min. Žádné výjimky.",
      })
    } else if (totalTrades >= 5) {
      insights.push({
        type: "success",
        title: "Disciplinované Obchodování",
        description: `Žádný revenge trading z ${totalTrades} tradů! Udržuješ chladnou hlavu i po ztrátách.`,
        action: "Tato disciplína je tvoje superschopnost. Chraň ji.",
      })
    }
    
    // Mental State - Readiness
    if (avgReadiness >= 80) {
      insights.push({
        type: "success",
        title: "Peak Mental State",
        description: `Tvá připravenost ${avgReadiness}% je vrcholná. Mozek je v nejvyšší formě.`,
        action: "Využij tuto energii - obchoduj své A+ setups s plnou koncentrací.",
      })
    } else if (avgReadiness < 60 && avgReadiness > 0) {
      insights.push({
        type: "warning",
        title: "Nízká Energie",
        description: `Připravenost ${avgReadiness}% je pod ideálem. Trpí tím tvé rozhodování.`,
        action: "Spi více, medituj ráno, zkontroluj výživu. Trading vyžaduje peak state.",
      })
    }
    
    // Risk Management - Best vs Worst
    if (data.bestTrade && data.worstTrade && data.bestTrade > 0 && data.worstTrade < 0) {
      const ratio = Math.abs(data.bestTrade / data.worstTrade)
      if (ratio >= 2) {
        insights.push({
          type: "success",
          title: "Vynikající Risk/Reward",
          description: `Nejvyšší výhra $${data.bestTrade} vs nejhorší ztráta $${Math.abs(data.worstTrade)} = ratio ${ratio.toFixed(1)}:1.`,
          action: "Udržuj tento vysoký R:R. Nejlepší obchodníci mají 2:1+.",
        })
      } else if (ratio < 1.5) {
        insights.push({
          type: "tip",
          title: "Zlepši Risk/Reward",
          description: `Ratio ${ratio.toFixed(1)}:1 je nízké. Výhry by měly být větší než ztráty.`,
          action: "Drž výhry déle, řež ztráty rychleji. Cíluj na min 2:1 ratio.",
        })
      }
    }
    
    // Activity Level
    if (totalTrades < 3) {
      insights.push({
        type: "tip",
        title: "Málo Dat",
        description: `Jen ${totalTrades} trade(ů) tento týden. Data jsou nedostatečná pro analýzu.`,
        action: "Hledej více quality setups nebo prodluž timeframe na měsíční review.",
      })
    } else if (totalTrades > 20) {
      insights.push({
        type: "warning",
        title: "Overtrading",
        description: `${totalTrades} tradů je moc! Kvalita > kvantita. Ředíš svou edge.`,
        action: "Buď selektivnější. Obchoduj jen A+ setups s vysokou pravděpodobností.",
      })
    }

    // Sleep Analysis - CRITICAL for trading performance
    if (avgSleep < 6.5) {
      insights.push({
        type: "warning",
        title: "Kritický Nedostatek Spánku",
        description: `Spíš v průměru ${avgSleep.toFixed(1)} hodin. Méně než 6,5h drasticky zhoršuje tvou soustředění, impulse control a rozhodování.`,
        action: "PRIORITA: Spí alespoň 7-8 hodin. Bez spánku žádné trading. Dej si pravidlo - before 7am nic.",
      })
    } else if (avgSleep >= 7 && avgSleep <= 8.5) {
      insights.push({
        type: "success",
        title: "Optimální Spánek",
        description: `Průměr ${avgSleep.toFixed(1)} hodin je ideální. Tvůj mozek je v peak condition.`,
        action: "Udržuj tento rytmus. To je základ všeho - bez spánku jsi handicapped trader.",
      })
    } else if (avgSleep > 8.5) {
      insights.push({
        type: "tip",
        title: "Příliš Mnoho Spánku",
        description: `${avgSleep.toFixed(1)} hodin může znamenat únavu nebo depresivní náladu. Zkontroluj stres.`,
        action: "Ideál je 7-8 hodin. Více spánku nezvyšuje výkon - zjisti proč spíš tolik.",
      })
    }

    // Stress Management - CRITICAL for psychology
    if (avgStress > 75) {
      insights.push({
        type: "critical",
        title: "KRITICKY VYSOKÝ STRES",
        description: `Průměrný stres ${roundPercent(avgStress)}%. To je deštruktivní pro tvoje trading psychiku.`,
        action: "IHNED: Před KAŽDÝM obchodem si dej 5min meditaci. Po každé ztrátě 15min pauza. Cvič dechování.",
      })
    } else if (avgStress > 60) {
      insights.push({
        type: "warning",
        title: "Vysoký Stres",
        description: `Stres na ${roundPercent(avgStress)}%. To ovlivňuje tvoje rozhodování a impulse control.`,
        action: "Začni meditaci/yoga. Po ztrátě si dej aspoň 10min pauzu. Neobchoduj pod stresem.",
      })
    } else if (avgStress <= 50) {
      insights.push({
        type: "success",
        title: "Kontrolovaný Stres",
        description: `Stres ${roundPercent(avgStress)}% je v normě. Udržuješ si klid.`,
        action: "Pokračuj v tom. Stress management je tvoje superschopnost.",
      })
    }

    // Sleep + Stress + Performance Correlation
    if (avgSleep < 6.5 && avgStress > 70 && winRate < 55) {
      insights.push({
        type: "critical",
        title: "PERFEKTNÍ BOUŘE: Spánek + Stres + Výkon Padá",
        description: `Máš zároveň malý spánek (${avgSleep.toFixed(1)}h), vysoký stres (${roundPercent(avgStress)}%) a nízkou úspěšnost (${winRate}%).`,
        action: "STOP TRADING. Vrať se k basics: Spí 8h, medituješ ráno 10min, obchoduješ jen morning setups.",
      })
    }
    
    return insights.slice(0, 4) // Return top 4 most relevant insights
  }

  const loadVirtualData = () => {
    if (currentWeekData) return;
    
    const demoWeekData = {
      weekStart: new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('cs-CZ'),
      weekEnd: new Date().toLocaleDateString('cs-CZ'),
      totalTrades: 15,
      winningTrades: 12,
      losingTrades: 3,
      winRate: 80,
      totalPnL: 2500,
      bestTrade: 450,
      worstTrade: -250,
      avgMood: 75,
      avgReadiness: 82,
      mindPointsGained: 150,
      currentStreak: 5,
      lossResets: 1,
      revengeIncidents: 0,
      dailyData: [],
      sleepData: [],
      aiInsights: [
        {
          type: "success",
          title: "Vysoká Disciplína",
          description: "Tvoje disciplína je na úrovni 82%. Dodržuješ obchodní plán a kontroluješ riziko.",
          action: "Pokračuj v tomto tempu. Dělej každý den ranní check.",
        },
        {
          type: "warning",
          title: "Pozor na Revenge Trading",
          description: "Po ztrátě -$250 jsi měl tendenci rychle otevřít další pozici.",
          action: "Po velké ztrátě si udělej pauzu 30 minut. Zhluboka dýchej.",
        },
        {
          type: "tip",
          title: "Optimalizuj Čas Obchodování",
          description: "Tvoje nejlepší výsledky jsou mezi 10:00-14:00. Venku z té doby máš nižší win rate.",
          action: "Zkus se zaměřit na obchodování v tomto časovém okně.",
        },
      ],
    };
    
    setCurrentWeekData(demoWeekData);
  }

  const saveReview = () => {
    if (!currentWeekData || !user?.id) return;

    const newReview = {
      id: Date.now().toString(),
      weekStart: currentWeekData.weekStart,
      weekEnd: currentWeekData.weekEnd,
      createdAt: new Date().toISOString(),
      variant: reviewVariant,
      // Trading Performance
      totalTrades: currentWeekData.totalTrades,
      winningTrades: currentWeekData.winningTrades,
      losingTrades: currentWeekData.losingTrades,
      winRate: currentWeekData.winRate,
      totalPnL: currentWeekData.totalPnL,
      bestTrade: currentWeekData.bestTrade,
      worstTrade: currentWeekData.worstTrade,
      // Psychology & Readiness
      avgReadiness: currentWeekData.avgReadiness,
      avgMood: currentWeekData.avgMood,
      avgSleep: currentWeekData.avgSleep,
      avgStress: currentWeekData.avgStress,
      currentStreak: currentWeekData.currentStreak,
      lossResets: currentWeekData.lossResets,
      revengeIncidents: currentWeekData.revengeIncidents,
      mindPointsGained: currentWeekData.mindPointsGained,
      // AI Insights & Recommendations
      aiInsights: currentWeekData.aiInsights || [],
      // User Input
      actionPlan: actionPlan,
      ...review,
    };

    const updated = [newReview, ...savedReviews];
    setSavedReviews(updated);
    setScoped("live", user.id, "weekly-reviews", updated);
    alert("Týdenní přehled s veškerými daty uložen! ✓");
  }

  useEffect(() => {
    if (isLiveMode) {
      if (analytics?.summary) {
        // Počítej sleep a stress z morning checks
        const morningChecks = analytics.data?.morningChecks || [];
        let totalSleep = 0;
        let totalStress = 0;
        let sleepCount = 0;
        let stressCount = 0;

        morningChecks.forEach((mc: any) => {
          if (mc.sleep !== undefined && mc.sleep !== null) {
            totalSleep += mc.sleep;
            sleepCount++;
          }
          if (mc.stress !== undefined && mc.stress !== null) {
            totalStress += mc.stress;
            stressCount++;
          }
        });

        const avgSleep = sleepCount > 0 ? totalSleep / sleepCount : 7;
        const avgStress = stressCount > 0 ? totalStress / stressCount : 50;

        const weekData = {
          weekStart: new Date().toLocaleDateString('cs-CZ'),
          weekEnd: new Date().toLocaleDateString('cs-CZ'),
          avgMood: analytics.summary.avgMood || 75,
          avgReadiness: analytics.summary.avgReadiness || 75,
          avgSleep: avgSleep,
          avgStress: avgStress,
          revengeIncidents: analytics.psychology?.revengeIncidents || 0,
          totalTrades: analytics.summary.totalTrades,
          winRate: analytics.summary.winRate,
          totalPnL: analytics.summary.totalPnL,
          bestTrade: analytics.summary.bestDay?.pnl || 0,
          worstTrade: analytics.summary.worstDay?.pnl || 0,
          winningTrades: 0,
          losingTrades: 0,
          currentStreak: 0,
          lossResets: 0,
          mindPointsGained: 0,
          aiInsights: [],
        };
        
        // Calculate winning/losing trades
        if (analytics.data?.trades) {
          weekData.winningTrades = analytics.data.trades.filter((t: any) => (t.pnl || 0) > 0).length;
          weekData.losingTrades = analytics.data.trades.filter((t: any) => (t.pnl || 0) < 0).length;
        }

        // Generate AI insights for live mode data
        weekData.aiInsights = generateAIInsights(weekData);
        setCurrentWeekData(weekData);
      }
      return;
    }
    
    if (!currentWeekData) {
      loadVirtualData();
    }
  }, [isLiveMode, analytics]);

  useEffect(() => {
    if (user?.id) {
      const saved = getScoped("live", user.id, "weekly-reviews", []);
      setSavedReviews(saved);
    }
  }, [user?.id]);

  if (!currentWeekData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Načítání dat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <Calendar className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Týdenní Přehled
          </h1>
          <p className="text-gray-400">
            {currentWeekData.weekStart} - {currentWeekData.weekEnd}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-slate-800/50 border border-slate-700 p-1 mb-6">
            <TabsTrigger value="current" className="data-[state=active]:bg-purple-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Aktuální
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <History className="w-4 h-4 mr-2" />
              Historie ({savedReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Performance Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-8 h-8 text-green-400" />
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">+{roundPercent(currentWeekData.winRate)}%</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{currentWeekData.totalTrades}</p>
                  <p className="text-sm text-gray-400">Celkem Tradů</p>
                  <div className="mt-3 flex gap-2 text-xs">
                    <span className="text-green-400">{currentWeekData.winningTrades} W</span>
                    <span className="text-red-400">{currentWeekData.losingTrades} L</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-8 h-8 text-blue-400" />
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Win Rate</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{roundPercent(currentWeekData.winRate)}%</p>
                  <p className="text-sm text-gray-400">Úspěšnost</p>
                  <Progress value={currentWeekData.winRate} className="mt-3 h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-700/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-8 h-8 text-purple-400" />
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Mental</Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{roundPercent(currentWeekData.avgReadiness)}%</p>
                  <p className="text-sm text-gray-400">Avg Readiness</p>
                  <Progress value={currentWeekData.avgReadiness} className="mt-3 h-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-700/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-yellow-400" />
                    <Badge className={`${currentWeekData.totalPnL >= 0 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                      {currentWeekData.totalPnL >= 0 ? 'Profit' : 'Loss'}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">${currentWeekData.totalPnL}</p>
                  <p className="text-sm text-gray-400">Total PnL</p>
                  <div className="mt-3 flex justify-between text-xs">
                    <span className="text-green-400">Best: ${currentWeekData.bestTrade}</span>
                    <span className="text-red-400">Worst: ${currentWeekData.worstTrade}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights - Always Visible */}
            {currentWeekData.aiInsights && currentWeekData.aiInsights.length > 0 && (
              <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    AI Poznatky
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedReviews.map((review: any) => (
                  <Card
                    key={review.id}
                    className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-blue-500/50 hover:bg-slate-800/70 transition"
                    onClick={() => {
                      // Načti všechna data ze starého review
                      setReview({
                        whatWorked: review.whatWorked || "",
                        whatDidntWork: review.whatDidntWork || "",
                        biggestWin: review.biggestWin || "",
                        biggestLoss: review.biggestLoss || "",
                        emotionalPatterns: review.emotionalPatterns || "",
                        mistakesMade: review.mistakesMade || "",
                        lessonsLearned: review.lessonsLearned || "",
                        weeklyGoals: review.weeklyGoals || ["", "", ""],
                        focusAreas: review.focusAreas || ["", "", ""],
                        tradingPlanAdjustments: review.tradingPlanAdjustments || "",
                        riskManagementNotes: review.riskManagementNotes || "",
                        mindsetPreparation: review.mindsetPreparation || "",
                      });
                      setActionPlan(review.actionPlan || []);
                      alert("Review načten! Všechna data jsou obnovena.");
                      setActiveTab("current");
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white">{review.weekStart}</CardTitle>
                        <Badge variant={review.variant === "ai" ? "default" : "outline"} className="text-xs">
                          {review.variant === "ai" ? "AI" : "Manuální"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Trades</p>
                          <p className="text-lg font-bold text-white">{review.totalTrades}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Win%</p>
                          <p className="text-lg font-bold text-green-400">{roundPercent(review.winRate)}%</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">PnL</p>
                          <p className="text-lg font-bold text-white">${review.totalPnL}</p>
                        </div>
                      </div>
                      <div className="mb-3 space-y-1 text-xs">
                        <p className="text-gray-400">
                          Readiness: <span className="text-blue-400 font-semibold">{roundPercent(review.avgReadiness)}%</span>
                        </p>
                        <p className="text-gray-400">
                          Sleep: <span className={review.avgSleep >= 7 ? "text-green-400 font-semibold" : "text-orange-400 font-semibold"}>{review.avgSleep?.toFixed(1)}h</span>
                        </p>
                        <p className="text-gray-400">
                          Stress: <span className={review.avgStress <= 50 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>{roundPercent(review.avgStress)}%</span>
                        </p>
                        <p className="text-gray-400">
                          Revenge Trades: <span className={review.revengeIncidents > 0 ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>{review.revengeIncidents}</span>
                        </p>
                      </div>
                      <div className="mb-2 space-y-2">
                        <p className="text-xs text-gray-300 font-semibold">Poznámka:</p>
                        <p className="text-gray-300 text-xs line-clamp-2">{review.whatWorked || "Bez poznámek"}</p>
                      </div>
                      {review.aiInsights && review.aiInsights.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                          <p className="text-xs text-purple-400 font-semibold">AI Insights:</p>
                          {review.aiInsights.slice(0, 2).map((insight: any, idx: number) => (
                            <div key={idx} className="text-xs text-gray-300 bg-slate-700/30 p-2 rounded">
                              <p className="font-semibold text-purple-300">{insight.title}</p>
                              <p className="text-gray-400 text-xs">{insight.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Form - Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Analýza Výkonu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 text-sm">Co se povedlo?</Label>
                    <Textarea
                      value={review.whatWorked || ""}
                      onChange={(e) => setReview({ ...review, whatWorked: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[100px]"
                      placeholder="Popište úspěšné strategie a chování..."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Co se nepovedlo?</Label>
                    <Textarea
                      value={review.whatDidntWork || ""}
                      onChange={(e) => setReview({ ...review, whatDidntWork: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[100px]"
                      placeholder="Identifikujte chyby a slabá místa..."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Chyby a Poučení</Label>
                    <Textarea
                      value={review.mistakesMade || ""}
                      onChange={(e) => setReview({ ...review, mistakesMade: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[100px]"
                      placeholder="Co jsi se naučil z chyb..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right Column */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-400" />
                      Psychologické Vzory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-gray-300 text-sm">Emoční Vzory</Label>
                      <Textarea
                        value={review.emotionalPatterns || ""}
                        onChange={(e) => setReview({ ...review, emotionalPatterns: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white mt-2 min-h-[120px]"
                        placeholder="Jak ses cítil během obchodování..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-400" />
                      Akční Plán na Příští Týden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {actionPlan.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...actionPlan];
                            updated[index].text = e.target.value;
                            setActionPlan(updated);
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          placeholder={`Cíl ${index + 1}`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={saveReview} 
              className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Uložit Týdenní Přehled
            </Button>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {savedReviews.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Zatím žádné uložené přehledy</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedReviews.map((review) => (
                  <Card key={review.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">{review.weekStart} - {review.weekEnd}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString('cs-CZ')}</p>
                        </div>
                        <Badge variant={review.variant === "ai" ? "default" : "outline"} className="text-xs">
                          {review.variant === "ai" ? "AI" : "Manuální"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Trades</p>
                          <p className="text-lg font-bold text-white">{review.totalTrades}</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">Win%</p>
                          <p className="text-lg font-bold text-green-400">{review.winRate}%</p>
                        </div>
                        <div className="text-center p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-gray-400">PnL</p>
                          <p className="text-lg font-bold text-white">${review.totalPnL}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{review.whatWorked || "Bez poznámek"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
