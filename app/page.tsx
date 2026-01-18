"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AdminPanel } from "@/components/admin-panel"
import { TradingStyleBadge } from "@/components/trading-style-badge"
import {
  Brain,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Crown,
  Shield,
  Sparkles,
  RefreshCw,
  TrendingDown,
  Users,
  ArrowRight,
  Rocket,
  PlayCircle,
  PlusCircle,
  AlertTriangle,
  Zap,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { getTimeOfDay } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useLossReset } from "@/contexts/loss-reset-context"
import { useTradingStyle } from "@/contexts/trading-style-context"
import { useGamification, LEVEL_XP_REQUIREMENTS } from "@/contexts/gamification-context"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const [timeOfDay, setTimeOfDay] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [cachedStats, setCachedStats] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [mentalReadiness, setMentalReadiness] = useState<number | null>(null)
  const [aiAnalysisData, setAiAnalysisData] = useState({
    readiness: { text: "Připravenost: Neznámá", description: "Dokončete Morning Check pro analýzu připravenosti" },
    trend: { description: "Zatím nemáme dostatek dat. Začni zapisovat obchody pro analýzu trendu." },
    action: { description: "Začni Morning Check a uzamkni svůj readiness před tradingem." },
  })

  const { getTradingStats, trades, morningChecks, journalEntries, isLiveMode, portfolioValue } = useData()
  const { plan, isActive, daysRemaining } = useSubscription()
  const { startReset } = useLossReset()
  const { tradingStyle, config } = useTradingStyle()
  const { data: gamificationData } = useGamification()
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!isMounted || !user?.id) {
      console.log("[v0] No authenticated user - showing empty state")
      return
    }

    try {
      const todayDate = new Date().toISOString().split("T")[0]
      const todayCheck = morningChecks.find((c: any) => c.date === todayDate)

      if (todayCheck && todayCheck.score !== undefined) {
        setMentalReadiness(todayCheck.score)
      } else {
        setMentalReadiness(null)
      }

      const last7Days = journalEntries.filter((e: any) => {
        const entryDate = new Date(e.date)
        const today = new Date()
        const diffTime = Math.abs(today.getTime() - entryDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 7
      })

      let readinessText = "Připravenost: Neznámá"
      let readinessDesc = "Dokončete Morning Check pro analýzu připravenosti"
      if (todayCheck) {
        const score = todayCheck.score
        if (score >= 75) readinessText = "Připravenost: Výborná ✅"
        else if (score >= 60) readinessText = "Připravenost: Buď opatrný ⚠️"
        else readinessText = "Připravenost: Neobchoduj 🛑"

        readinessDesc = `Spánek: ${todayCheck.sleepHours}h (${todayCheck.sleepQuality}/10), Stres: ${todayCheck.stressLevel}/10, Focus: ${todayCheck.focus}/10`
      }

      let trendDesc = "Zatím nemáme dostatek dat. Začni zapisovat obchody pro analýzu trendu."
      if (last7Days.length > 0) {
        const avgMood = (last7Days.reduce((sum: number, e: any) => sum + (e.mood || 5), 0) / last7Days.length).toFixed(
          1,
        )
        trendDesc = `${last7Days.length} záznamů za 7 dní. Průměrná nálada: ${avgMood}/10. Pokračuj v pravidelném journalingu!`
      }

      let actionDesc = "Začni Morning Check a uzamkni svůj readiness před tradingem."
      if (todayCheck) {
        if (todayCheck.score >= 75)
          actionDesc = "✅ Jsi připraven! Dnes jsou dobré podmínky na obchodování podle tvého plánu."
        else if (todayCheck.score >= 60)
          actionDesc = "⚠️ Buď opatrný. Redukuj position sizes o 50% a zvyš disciplínu. Zvaž meditation před tradingem."
        else actionDesc = "🛑 Dnes neobchoduj. Zaměř se na přípravu: paper trading, studium, nebo relaxaci."
      }

      setAiAnalysisData({
        readiness: { text: readinessText, description: readinessDesc },
        trend: { description: trendDesc },
        action: { description: actionDesc },
      })
    } catch (error) {
      console.error("[v0] Error loading mental readiness:", error)
    }
  }, [isMounted, user, morningChecks, journalEntries])

  useEffect(() => {
    setTimeOfDay(getTimeOfDay())
  }, [])

  useEffect(() => {
    if (!cachedStats && isMounted) {
      const tradingStats = getTradingStats()
      const currentPortfolio = portfolioValue + tradingStats.totalPnL
      const portfolioChange = ((tradingStats.totalPnL / portfolioValue) * 100).toFixed(1)

      const initialStats = [
        {
          title: "Portfolio Value",
          value: `$${currentPortfolio.toLocaleString()}`,
          change: `${tradingStats.totalPnL >= 0 ? "+" : ""}${portfolioChange}%`,
          trend: (tradingStats.totalPnL >= 0 ? "up" : "down") as const,
          icon: DollarSign,
          color: "from-emerald-500 to-teal-500",
          description: "Total account value",
          progress: Math.min((currentPortfolio / portfolioValue - 1) * 100 + 50, 100),
        },
        {
          title: "Total P&L",
          value: `${tradingStats.totalPnL >= 0 ? "+" : ""}$${tradingStats.totalPnL.toLocaleString()}`,
          change: tradingStats.totalPnL >= 0 ? "Profit" : "Loss",
          trend: (tradingStats.totalPnL >= 0 ? "up" : "down") as const,
          icon: TrendingUp,
          color: "from-blue-500 to-cyan-500",
          description: "All time performance",
          progress: Math.min(Math.abs(tradingStats.totalPnL / 100), 100),
        },
        {
          title: "Win Rate",
          value: `${tradingStats.winRate.toFixed(1)}%`,
          change: `${tradingStats.winningTrades}W / ${tradingStats.losingTrades}L`,
          trend: (tradingStats.winRate >= 50 ? "up" : "down") as const,
          icon: Target,
          color: "from-purple-500 to-pink-500",
          description: "Success rate",
          progress: tradingStats.winRate,
        },
        {
          title: "Active Days",
          value: `${Math.min(tradingStats.totalTrades, 30)}/30`,
          change: `${((Math.min(tradingStats.totalTrades, 30) / 30) * 100).toFixed(0)}%`,
          trend: "up" as const,
          icon: Calendar,
          color: "from-orange-500 to-red-500",
          description: "Consistency score",
          progress: (Math.min(tradingStats.totalTrades, 30) / 30) * 100,
        },
      ]
      setCachedStats(initialStats)
    }
  }, [portfolioValue, isMounted])

  const getStatsForStyle = () => {
    if (typeof window === "undefined") {
      return []
    }

    const tradingStats = getTradingStats()

    const allTrades = trades

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyTrades = allTrades.filter((trade: any) => {
      const tradeDate = new Date(trade.date)
      return tradeDate >= monthStart
    })
    const monthlyPnL = monthlyTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0)

    const last7Days = allTrades.filter((trade: any) => {
      const tradeDate = new Date(trade.date)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return tradeDate >= sevenDaysAgo
    })
    const disciplineScore =
      last7Days.length > 0
        ? (last7Days.filter((trade: any) => trade.followedPlan === true).length / last7Days.length) * 100
        : 0

    const currentLevel = gamificationData.level
    const currentXP = gamificationData.xp
    const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel - 1] || 0
    const nextLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel] || LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1]
    const xpToNextLevel = nextLevelXP - currentXP
    const xpProgress = currentLevel >= 10 ? 100 : ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

    const totalPnL = allTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0)

    const startingCapital =
      typeof window !== "undefined" ? Number.parseFloat(localStorage.getItem("starting-capital") || "10000") : 10000
    const totalCapital = startingCapital + totalPnL

    return [
      {
        title: "Celkový kapitál",
        value: `$${totalCapital.toLocaleString()}`,
        change: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`,
        trend: (totalPnL >= 0 ? "up" : "down") as const,
        icon: DollarSign,
        color: "from-emerald-500 to-teal-500",
        description: "Počáteční kapitál + P/L",
        progress: Math.min(((totalCapital - startingCapital) / startingCapital) * 100 + 50, 100),
      },
      {
        title: "Total P/L",
        value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toLocaleString()}`,
        change: `${allTrades.length} obchodů`,
        trend: (totalPnL >= 0 ? "up" : "down") as const,
        icon: TrendingUp,
        color: "from-blue-500 to-cyan-500",
        description: "Celkový zisk/ztráta",
        progress: Math.min(Math.abs((totalPnL / startingCapital) * 100 * 5), 100),
      },
      {
        title: "Mental Readiness",
        value: mentalReadiness !== null ? `${mentalReadiness}%` : "N/A",
        trend:
          mentalReadiness === null
            ? ("neutral" as const)
            : ((mentalReadiness >= 75 ? "up" : mentalReadiness >= 60 ? "neutral" : "down") as const),
        icon: Brain,
        color: "from-purple-500 to-pink-500",
        description: mentalReadiness !== null ? "Psychická připravenost" : "Vyplň Morning Check",
        progress: mentalReadiness !== null ? mentalReadiness : 0,
      },
      {
        title: "Level & XP",
        value: `Level ${currentLevel}`,
        change: currentLevel >= 10 ? "Max Level!" : `${xpToNextLevel} XP do upgradu`,
        trend: (xpProgress >= 75 ? "up" : xpProgress >= 50 ? "neutral" : "down") as const,
        icon: Shield,
        color: "from-orange-500 to-red-500",
        description: currentLevel >= 10 ? "Mind Master" : "Získávej XP",
        progress: xpProgress,
      },
    ]
  }

  const stats = getStatsForStyle()

  const isPremium = plan === "premium" && isActive

  const quickActions = [
    {
      title: "Začít Daily Flow",
      description: "Zahájit obchodní den",
      icon: PlayCircle,
      href: "/daily-tracker",
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "Zadat obchod",
      description: "Zaznamenat poslední obchod",
      icon: PlusCircle,
      href: "/record-trades",
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      title: "MindTrader AI",
      description: "Tvůj AI trading mentor",
      icon: Brain,
      href: "/mindtrader",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Loss Reset",
      description: "Reset po ztrátě",
      icon: AlertTriangle,
      href: "/loss-reset",
      color: "from-orange-500 to-red-500",
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ]

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950"></div>

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                         radial-gradient(2px 2px at 60% 70%, white, transparent),
                         radial-gradient(1px 1px at 50% 50%, white, transparent),
                         radial-gradient(1px 1px at 80% 10%, white, transparent),
                         radial-gradient(2px 2px at 90% 60%, white, transparent),
                         radial-gradient(1px 1px at 33% 80%, white, transparent),
                         radial-gradient(1px 1px at 15% 90%, white, transparent)`,
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 0%",
            opacity: 0.4,
          }}
        ></div>

        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `radial-gradient(3px 3px at 10% 20%, rgba(147, 51, 234, 0.8), transparent),
                         radial-gradient(2px 2px at 70% 40%, rgba(59, 130, 246, 0.8), transparent),
                         radial-gradient(3px 3px at 40% 60%, rgba(236, 72, 153, 0.8), transparent),
                         radial-gradient(2px 2px at 85% 80%, rgba(34, 211, 238, 0.8), transparent)`,
            backgroundSize: "300% 300%",
            backgroundPosition: "50% 50%",
            opacity: 0.6,
            animation: "twinkle 3s ease-in-out infinite",
          }}
        ></div>

        <div className="max-w-[1800px] mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pt-4 sm:pt-6 relative z-10">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <Badge
              variant="outline"
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-lg ${
                isLiveMode
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-red-500/50"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-blue-500/50"
              }`}
            >
              {isLiveMode ? "🔴 LIVE MODE" : "🔵 VIRTUAL MODE"}
            </Badge>
            <TradingStyleBadge />
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl border border-purple-500/30 backdrop-blur-sm shadow-lg shadow-purple-500/20">
                <Brain className="w-6 h-6 sm:w-10 sm:h-10 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {timeOfDay === "ráno" ? "Dobré" : timeOfDay === "odpoledne" ? "Dobré" : "Dobrý"} {timeOfDay}! 🚀
                </h1>
                <p className="text-sm sm:text-xl text-gray-300 mt-0.5 sm:mt-1">
                  {isLiveMode ? "Vítej zpět" : "Demo mode"}
                </p>
                <div className="flex items-center space-x-2 mt-1 sm:mt-2 flex-wrap gap-1">
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      isPremium
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg shadow-yellow-500/30"
                        : "bg-slate-600/20 text-slate-400 border-slate-500/30"
                    }`}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    {isPremium ? `Premium (${daysRemaining}d)` : "Free"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRefreshing(true)}
                disabled={isRefreshing}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdminPanel(true)}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2">Admin</span>
              </Button>
            </div>
          </div>

          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="psyche-card group hover:scale-105 transition-all duration-300 overflow-hidden border-2 border-purple-500/50 bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                ></div>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity`}
                ></div>
                <CardContent className="p-3 sm:p-6 relative">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={`p-2 sm:p-3 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl shadow-lg`}>
                      <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      ) : stat.trend === "down" ? (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                      ) : (
                        <span className="w-3 h-3 sm:w-4 sm:h-4"></span>
                      )}
                      <span
                        className={`text-xs sm:text-sm font-medium ${stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-gray-400"}`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">{stat.title}</p>
                      <p className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{stat.value}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{stat.description}</p>
                    </div>
                    <div className="space-y-1 sm:space-y-2 hidden sm:block">
                      <Progress value={stat.progress} className="h-1.5 sm:h-2" />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Pokrok</span>
                        <span>{Math.round(stat.progress)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              Rychlé akce
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                return (
                  <Link key={index} href={action.href}>
                    <Card className="psyche-card group hover:scale-105 transition-all duration-300 cursor-pointer border-slate-700/50 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden h-full rounded-xl sm:rounded-2xl hover:shadow-2xl hover:border-purple-500/50">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-50 group-hover:opacity-70 transition-opacity`}
                      ></div>
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity`}
                      ></div>
                      <CardContent className="p-3 sm:p-4 relative flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                        <div
                          className={`p-2 sm:p-3 bg-gradient-to-r ${action.color} rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm">{action.title}</h3>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
                            {action.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          <Card
            className="psyche-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm shadow-xl overflow-hidden animate-fade-in-up animate-glow"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5"></div>
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-2xl shadow-lg shadow-purple-500/50">
                    <Zap className="w-5 h-5 text-green-400 mt-1 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white">AI Analýza</h3>
                </div>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm hover:border-green-500/50 transition-colors group">
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-green-400 mt-1 group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-sm">{aiAnalysisData.readiness.text}</h4>
                      <p className="text-gray-300 text-xs">{aiAnalysisData.readiness.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-colors group">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-400 mt-1 group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-sm">Trend výkonu</h4>
                      <p className="text-gray-300 text-xs">{aiAnalysisData.trend.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-colors group">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-purple-400 mt-1 group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-sm">Doporučená akce</h4>
                      <p className="text-gray-300 text-xs">{aiAnalysisData.action.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isPremium && (
            <Card className="psyche-card border-yellow-500/50 bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-yellow-900/30 overflow-hidden relative backdrop-blur-sm shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 blur-xl"></div>
              <CardContent className="p-6 sm:p-8 relative">
                <div className="text-center">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
                      <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Join our community</h3>
                  <p className="text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-lg">
                    {isLiveMode ? "Sdílej zkušenosti s ostatními tradery" : "Vyzkoušej demo komunitu"}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-yellow-500/30 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Link href="/pricing">
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Upgrade
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showAdminPanel && <AdminPanel isVisible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />}
      </div>
    </>
  )
}
