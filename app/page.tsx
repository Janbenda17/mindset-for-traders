"use client"

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
  Check,
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

export default function DashboardPage() {
  const [timeOfDay, setTimeOfDay] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [cachedStats, setCachedStats] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [aiAnalysisData, setAiAnalysisData] = useState({
    readiness: { text: "Připravenost: Neznámá", description: "Dokončete Morning Check pro analýzu připravenosti" },
    trend: { description: "Zatím nemáme dostatek dat. Začni zapisovat obchody pro analýzu trendu." },
    action: { description: "Začni Morning Check a uzamkni svůj readiness před tradingem." },
  })

  const { isLiveMode, getTradingStats, portfolioValue } = useData()
  const { plan, isActive, daysRemaining } = useSubscription()
  const { startReset } = useLossReset()
  const { tradingStyle, config } = useTradingStyle()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setTimeOfDay(getTimeOfDay())
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const todayDate = new Date().toISOString().split("T")[0]
    const checks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
    const todayCheck = checks.find((c: any) => c.date === todayDate)

    const entries = JSON.parse(localStorage.getItem("journal-entries") || "[]")
    const last7Days = entries.filter((e: any) => {
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
      if (score >= 85) readinessText = "Připravenost: Výborná ✨"
      else if (score >= 75) readinessText = "Připravenost: Dobrá ✅"
      else if (score >= 60) readinessText = "Připravenost: Střední ⚠️"
      else readinessText = "Připravenost: Nízká 🛑"

      readinessDesc = `Spánek: ${todayCheck.sleepHours}h (${todayCheck.sleepQuality}/10), Stres: ${todayCheck.stressLevel}/10, Focus: ${todayCheck.focus}/10`
    }

    let trendDesc = "Zatím nemáme dostatek dat. Začni zapisovat obchody pro analýzu trendu."
    if (last7Days.length > 0) {
      const avgMood = (last7Days.reduce((sum: number, e: any) => sum + (e.mood || 5), 0) / last7Days.length).toFixed(1)
      trendDesc = `${last7Days.length} záznamů za 7 dní. Průměrná nálada: ${avgMood}/10. Pokračuj v pravidelném journalingu!`
    }

    let actionDesc = "Začni Morning Check a uzamkni svůj readiness před tradingem."
    if (todayCheck) {
      if (todayCheck.score >= 85) actionDesc = "Jsi v top formě! Začni Daily Flow a obchoduj podle plánu."
      else if (todayCheck.score >= 75) actionDesc = "Dobrá připravenost. Zvaž 10min meditaci před prvním obchodem."
      else if (todayCheck.score >= 60) actionDesc = "Střední připravenost. Sniž position sizes a buď extra opatrný."
      else actionDesc = "Nízká připravenost. Dnes raději studuj nebo paper trade."
    }

    setAiAnalysisData({
      readiness: { text: readinessText, description: readinessDesc },
      trend: { description: trendDesc },
      action: { description: actionDesc },
    })
  }, [isMounted])

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
    if (!isMounted) {
      return [
        {
          title: "Celkový kapitál",
          value: "$0",
          change: "+0%",
          trend: "up" as const,
          icon: DollarSign,
          color: "from-emerald-500 to-teal-500",
          description: "Celková hodnota účtu",
          progress: 0,
        },
        {
          title: "Měsíční P/L",
          value: "$0",
          change: "0 obchodů",
          trend: "up" as const,
          icon: TrendingUp,
          color: "from-blue-500 to-cyan-500",
          description: "Zisk/ztráta tento měsíc",
          progress: 0,
        },
        {
          title: "Mental Readiness",
          value: "0%",
          change: "Bez check",
          trend: "neutral" as const,
          icon: Brain,
          color: "from-purple-500 to-pink-500",
          description: "Psychická připravenost",
          progress: 0,
        },
        {
          title: "Discipline Score",
          value: "0%",
          change: "0 dní",
          trend: "neutral" as const,
          icon: Shield,
          color: "from-orange-500 to-red-500",
          description: "Dodržování plánu (7 dní)",
          progress: 0,
        },
      ]
    }

    const tradingStats = getTradingStats()
    const currentPortfolio = portfolioValue + tradingStats.totalPnL

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const entries = JSON.parse(localStorage.getItem("journal-entries") || "[]")
    const monthlyTrades = entries.filter((e: any) => {
      const entryDate = new Date(e.date)
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })
    const monthlyPnL = monthlyTrades.reduce((sum: number, e: any) => sum + (e.profitLoss || 0), 0)

    const todayDate = new Date().toISOString().split("T")[0]
    const checks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
    const todayCheck = checks.find((c: any) => c.date === todayDate)
    const mentalReadiness = todayCheck ? todayCheck.score : 0

    const last7Days = entries.filter((e: any) => {
      const entryDate = new Date(e.date)
      const diffTime = Math.abs(now.getTime() - entryDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    })
    const disciplineScore =
      last7Days.length > 0 ? (last7Days.filter((e: any) => e.followedPlan).length / last7Days.length) * 100 : 0

    return [
      {
        title: "Celkový kapitál",
        value: `$${currentPortfolio.toLocaleString()}`,
        change: `${tradingStats.totalPnL >= 0 ? "+" : ""}${((tradingStats.totalPnL / portfolioValue) * 100).toFixed(1)}%`,
        trend: (tradingStats.totalPnL >= 0 ? "up" : "down") as const,
        icon: DollarSign,
        color: "from-emerald-500 to-teal-500",
        description: "Celková hodnota účtu",
        progress: Math.min((currentPortfolio / portfolioValue - 1) * 100 + 50, 100),
      },
      {
        title: "Měsíční P/L",
        value: `${monthlyPnL >= 0 ? "+" : ""}$${monthlyPnL.toLocaleString()}`,
        change: `${monthlyTrades.length} obchodů`,
        trend: (monthlyPnL >= 0 ? "up" : "down") as const,
        icon: TrendingUp,
        color: "from-blue-500 to-cyan-500",
        description: "Zisk/ztráta tento měsíc",
        progress: Math.min(Math.abs((monthlyPnL / portfolioValue) * 100 * 10), 100),
      },
      {
        title: "Mental Readiness",
        value: `${mentalReadiness}%`,
        change: todayCheck ? `${todayCheck.sleepHours}h spánek` : "Bez check",
        trend: (mentalReadiness >= 75 ? "up" : mentalReadiness >= 60 ? "neutral" : "down") as const,
        icon: Brain,
        color: "from-purple-500 to-pink-500",
        description: "Psychická připravenost",
        progress: mentalReadiness,
      },
      {
        title: "Discipline Score",
        value: `${disciplineScore.toFixed(0)}%`,
        change: `${last7Days.length} dní`,
        trend: (disciplineScore >= 75 ? "up" : disciplineScore >= 50 ? "neutral" : "down") as const,
        icon: Shield,
        color: "from-orange-500 to-red-500",
        description: "Dodržování plánu (7 dní)",
        progress: disciplineScore,
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
      description: "Získat AI analýzu",
      icon: Brain,
      href: isPremium ? "/mindtrader" : "/pricing",
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-500/20 to-pink-500/20",
      locked: !isPremium,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pt-4 sm:pt-6 relative z-10">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
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

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLS41IDM5LjVoNDEiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-20"></div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

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
                Good {timeOfDay}! 🚀
              </h1>
              <p className="text-sm sm:text-xl text-gray-300 mt-0.5 sm:mt-1">
                {isLiveMode ? "Welcome back" : "Demo mode"}
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
                        className={`p-2 sm:p-3 bg-gradient-to-br ${action.color} rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm">
                          {action.title}
                          {action.locked && <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 inline ml-1" />}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
                          {action.description}
                        </p>
                      </div>
                      {action.locked && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px] sm:text-xs">
                          Premium
                        </Badge>
                      )}
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
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl shadow-lg shadow-purple-500/50">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-xl"></div>
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex flex-col items-center gap-4 sm:gap-6 text-center sm:text-left sm:flex-row sm:justify-between">
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl shadow-2xl shadow-yellow-500/50 animate-pulse">
                    <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">Odemkni Premium</h3>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-bounce shadow-lg shadow-yellow-500/50 text-xs">
                        <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        50% OFF
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-lg">Přepni do Live režimu a odemkni všechny funkce</p>
                    <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 sm:mt-3">
                      <div className="flex items-center space-x-2">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="text-xs sm:text-sm text-gray-300">Zruš kdykoliv</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm line-through">2999 Kč/měsíc</p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">1499 Kč</p>
                    <p className="text-yellow-400 text-xs sm:text-sm font-semibold">Ušetři 50%!</p>
                  </div>
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
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="psyche-card overflow-hidden border-slate-700/50 bg-slate-900/50 backdrop-blur-sm shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl"></div>
          <CardContent className="p-6 sm:p-8 relative">
            <div className="text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl border border-blue-500/30 shadow-lg shadow-blue-500/20">
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
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/30 text-sm sm:text-base w-full sm:w-auto"
              >
                <Link href="/team-club">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isLiveMode ? "Join Community" : "Try Demo"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showAdminPanel && <AdminPanel isVisible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />}
    </div>
  )
}
