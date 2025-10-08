"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyTradingAssessment } from "@/components/daily-trading-assessment"
import { AdminPanel } from "@/components/admin-panel"
import {
  Brain,
  TrendingUp,
  Target,
  BarChart3,
  Users,
  Star,
  ArrowRight,
  Activity,
  DollarSign,
  Calendar,
  BookOpen,
  Lightbulb,
  Crown,
  Shield,
  Eye,
  Clock,
  Flame,
  Trophy,
  Zap,
  Heart,
  Award,
  LineChart,
  PieChart,
  Sparkles,
  Bell,
  Settings,
  RefreshCw,
  MessageCircle,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { getTimeOfDay } from "@/lib/utils"
import { useData } from "@/contexts/data-context"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeOfDay, setTimeOfDay] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const { isLiveMode, getTradingStats } = useData()

  useEffect(() => {
    setTimeOfDay(getTimeOfDay())
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  // Get trading stats based on mode
  const tradingStats = getTradingStats()

  const stats = [
    {
      title: "Celkový P&L",
      value: `${tradingStats.totalPnL >= 0 ? "+" : ""}$${tradingStats.totalPnL.toLocaleString()}`,
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      description: "Za posledních 30 dní",
      progress: 85,
    },
    {
      title: "Win Rate",
      value: `${tradingStats.winRate.toFixed(1)}%`,
      change: "+2.1%",
      trend: "up",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      description: "Úspěšnost obchodů",
      progress: Math.round(tradingStats.winRate),
    },
    {
      title: "Aktivní dny",
      value: `${Math.min(tradingStats.totalTrades, 30)}/30`,
      change: "93.3%",
      trend: "up",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      description: "Konzistence",
      progress: Math.round((Math.min(tradingStats.totalTrades, 30) / 30) * 100),
    },
    {
      title: "Risk Score",
      value: `${(tradingStats.riskRewardRatio || 0).toFixed(1)}/10`,
      change: "+0.8",
      trend: "up",
      icon: Shield,
      color: "from-orange-500 to-red-500",
      description: "Risk management",
      progress: Math.round((tradingStats.riskRewardRatio || 0) * 10),
    },
  ]

  const recentActivities = [
    {
      type: "trade",
      title: isLiveMode ? "Nový obchod zaznamenán" : "EUR/USD Long pozice uzavřena (DEMO)",
      description: isLiveMode ? "Zkontrolujte výsledek" : "+$450 profit • 1:2.1 R:R",
      time: "před 2 hodinami",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      priority: "high",
    },
    {
      type: "journal",
      title: isLiveMode ? "Nový záznam v deníku" : "Nový záznam v deníku (DEMO)",
      description: isLiveMode ? "Analýza obchodů" : "Analýza dnešních obchodů",
      time: "před 4 hodinami",
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      priority: "medium",
    },
    {
      type: "ai",
      title: "MindTrader AI doporučení",
      description: isLiveMode ? "Nové personalizované doporučení" : "Snižte pozici na GBP/JPY (DEMO)",
      time: "před 6 hodin",
      icon: Brain,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      priority: "high",
    },
    {
      type: "achievement",
      title: isLiveMode ? "Nový úspěch odemčen" : "Nový úspěch odemčen (DEMO)",
      description: isLiveMode ? "Zkontrolujte své úspěchy" : "Konzistentní trader - 100 obchodů",
      time: "včera",
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      priority: "low",
    },
    {
      type: "alert",
      title: "Market Alert",
      description: isLiveMode ? "Vysoká volatilita detekována" : "Vysoká volatilita na EUR/USD (DEMO)",
      time: "před 1 hodinou",
      icon: Bell,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      priority: "high",
    },
  ]

  const quickActions = [
    {
      title: "Nový obchod",
      description: "Zaznamenat nový obchod",
      icon: TrendingUp,
      href: "/analytics",
      color: "from-green-500 to-emerald-500",
      category: "trading",
      popular: true,
    },
    {
      title: "Deník",
      description: "Přidat záznam do deníku",
      icon: BookOpen,
      href: "/journal",
      color: "from-blue-500 to-cyan-500",
      category: "journal",
      popular: true,
    },
    {
      title: "MindTrader AI",
      description: "Konzultace s AI",
      icon: Brain,
      href: "/mindtrader",
      color: "from-purple-500 to-pink-500",
      category: "ai",
      badge: "AI",
      popular: true,
    },
    {
      title: "Analytics",
      description: "Zobrazit analýzy",
      icon: BarChart3,
      href: "/analytics",
      color: "from-orange-500 to-red-500",
      category: "analytics",
    },
    {
      title: "Daily Tracker",
      description: "Denní sledování",
      icon: Calendar,
      href: "/daily-tracker",
      color: "from-indigo-500 to-purple-500",
      category: "tracking",
    },
    {
      title: "Team Club",
      description: "Komunita traderů",
      icon: Users,
      href: "/team-club",
      color: "from-pink-500 to-rose-500",
      category: "community",
      badge: "PRO",
    },
  ]

  const achievements = [
    {
      title: "První kroky",
      description: "Zaznamenal jsi svůj první obchod",
      icon: Star,
      unlocked: tradingStats.totalTrades > 0,
      progress: Math.min(tradingStats.totalTrades * 100, 100),
      color: "text-yellow-400",
      points: 100,
    },
    {
      title: "Konzistentní trader",
      description: "100+ obchodů zaznamenáno",
      icon: Trophy,
      unlocked: tradingStats.totalTrades >= 100,
      progress: Math.min((tradingStats.totalTrades / 100) * 100, 100),
      color: "text-blue-400",
      points: 500,
    },
    {
      title: "Profit master",
      description: "Dosáhl jsi $10k+ zisku",
      icon: DollarSign,
      unlocked: tradingStats.totalPnL >= 10000,
      progress: Math.min((tradingStats.totalPnL / 10000) * 100, 100),
      color: "text-green-400",
      points: 1000,
    },
    {
      title: "Disciplinovaný",
      description: "14 dní streak sledování",
      icon: Flame,
      unlocked: false,
      progress: 85,
      color: "text-red-400",
      points: 750,
    },
    {
      title: "AI Expert",
      description: "50+ konzultací s AI",
      icon: Brain,
      unlocked: false,
      progress: 60,
      color: "text-purple-400",
      points: 300,
    },
    {
      title: "Community Leader",
      description: "Pomohl 10+ traderům",
      icon: Users,
      unlocked: false,
      progress: 30,
      color: "text-pink-400",
      points: 2000,
    },
  ]

  const aiInsights = [
    {
      title: "Optimální trading čas",
      value: isLiveMode ? "Analyzuji vaše data..." : "9:30 - 11:00 EST",
      description: isLiveMode ? "Počkejte na analýzu" : "Vaše nejlepší výsledky",
      icon: Clock,
      color: "text-cyan-400",
      confidence: isLiveMode ? 0 : 92,
    },
    {
      title: "Doporučená pozice",
      value: isLiveMode ? "Kalkuluji..." : "2.5% účtu",
      description: isLiveMode ? "Analýza probíhá" : "Optimální risk management",
      icon: Shield,
      color: "text-green-400",
      confidence: isLiveMode ? 0 : 88,
    },
    {
      title: "Emocionální pattern",
      value: isLiveMode ? "Sleduji náladu..." : "Ranní optimismus",
      description: isLiveMode ? "Potřebuji více dat" : "Nejlepší nálada ráno",
      icon: Brain,
      color: "text-purple-400",
      confidence: isLiveMode ? 0 : 85,
    },
    {
      title: "Preferovaný pár",
      value: isLiveMode ? "Analyzuji..." : "EUR/USD",
      description: isLiveMode ? "Čekám na data" : "Nejvyšší úspěšnost",
      icon: TrendingUp,
      color: "text-blue-400",
      confidence: isLiveMode ? 0 : 90,
    },
  ]

  const marketAlerts = [
    {
      pair: "EUR/USD",
      type: "volatility",
      message: isLiveMode ? "Vysoká volatilita detekována" : "Vysoká volatilita očekávána (DEMO)",
      severity: "high",
      time: "15:30",
    },
    {
      pair: "GBP/JPY",
      type: "news",
      message: isLiveMode ? "Důležité ekonomické zprávy" : "BOJ rozhodnutí za 2 hodiny (DEMO)",
      severity: "medium",
      time: "16:00",
    },
    {
      pair: "USD/CAD",
      type: "technical",
      message: isLiveMode ? "Technický signál detekován" : "Breakout z consolidace (DEMO)",
      severity: "low",
      time: "14:45",
    },
  ]

  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto p-6 space-y-8 pt-20">
        {/* Mode Indicator */}
        <div className="flex items-center justify-center mb-4">
          <Badge
            variant="outline"
            className={`px-4 py-2 font-semibold ${
              isLiveMode
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
            }`}
          >
            {isLiveMode ? "🔴 LIVE MODE - Reálná data" : "🔵 VIRTUAL MODE - Demo data"}
          </Badge>
        </div>

        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Dobrý {timeOfDay}! 🚀
              </h1>
              <p className="text-xl text-gray-300 mt-1">
                {isLiveMode ? "Vítejte zpět v MindTrader AI" : "Vítejte v demo režimu MindTrader AI"}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Online
                </Badge>
                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro Member
                </Badge>
                <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  {totalPoints} bodů
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdminPanel(true)}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
            <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50">
              <Settings className="w-4 h-4 mr-2" />
              Nastavení
            </Button>
          </div>
        </div>

        {/* Daily Trading Assessment */}
        <DailyTradingAssessment />

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="psyche-card group hover:scale-105 transition-all duration-300 overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}
              ></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={stat.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{stat.progress}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MindTrader AI Quick Access */}
        <Card className="psyche-card border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">MindTrader AI je připraven pomoci</h3>
                  <p className="text-gray-300">
                    {isLiveMode
                      ? "Máte otázky o tradingu nebo potřebujete emocionální podporu?"
                      : "Vyzkoušejte AI podporu v demo režimu"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Ready
                </Badge>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/mindtrader">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Konzultovat s AI
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />📊 Přehled
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Zap className="w-4 h-4 mr-2" />⚡ Akce
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Brain className="w-4 h-4 mr-2" />🧠 AI Insights
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="w-4 h-4 mr-2" />🏆 Úspěchy
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-2" />🔔 Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Chart */}
              <div className="lg:col-span-2">
                <Card className="psyche-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <LineChart className="w-5 h-5 text-blue-500" />
                      <span>Výkonnost za posledních 30 dní</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {isLiveMode ? "Live Data" : "Demo Data"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg flex items-center justify-center border border-slate-600/30">
                      <div className="text-center space-y-4">
                        <LineChart className="w-12 h-12 text-gray-500 mx-auto" />
                        <div>
                          <p className="text-gray-400 mb-2">
                            {isLiveMode ? "Graf reálné výkonnosti se načítá..." : "Demo graf výkonnosti se načítá..."}
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="sm" className="neon-button bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              Zobrazit detaily
                            </Button>
                            <Button variant="outline" size="sm" className="neon-button bg-transparent">
                              <PieChart className="w-4 h-4 mr-2" />
                              Analytics
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card className="psyche-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        <span>Nedávná aktivita</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        {recentActivities.filter((a) => a.priority === "high").length} vysoká
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivities.slice(0, 4).map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors group"
                        >
                          <div
                            className={`p-2 ${activity.bgColor} rounded-lg group-hover:scale-110 transition-transform`}
                          >
                            <activity.icon className={`w-4 h-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                              {activity.priority === "high" && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Vysoká</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-1">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4 neon-button bg-transparent">
                      Zobrazit všechny aktivity
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="psyche-card group hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  ></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 bg-gradient-to-r ${action.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {action.badge && (
                          <Badge
                            className={`${action.badge === "AI" ? "bg-purple-500/20 text-purple-300" : "bg-orange-500/20 text-orange-300"} border-0`}
                          >
                            {action.badge}
                          </Badge>
                        )}
                        {action.popular && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Populární
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-white text-lg mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href={action.href}>
                        Spustit
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Insights */}
              <Card className="psyche-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span>AI Personalizované insights</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isLiveMode ? "LIVE" : "DEMO"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600/30 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-gray-300">{insight.title}</p>
                              {insight.confidence > 0 && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                  {insight.confidence}% confidence
                                </Badge>
                              )}
                            </div>
                            <p className="text-lg font-bold text-white mb-1">{insight.value}</p>
                            <p className="text-xs text-gray-400">{insight.description}</p>
                            {insight.confidence > 0 && <Progress value={insight.confidence} className="h-1 mt-2" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendation */}
              <Card className="psyche-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span>Doporučení pro dnes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/20">
                    <div className="flex items-start space-x-3 mb-4">
                      <Brain className="w-6 h-6 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-2">
                          {isLiveMode ? "Personalizovaná strategie" : "Demo trading strategie"}
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                          {isLiveMode
                            ? "Analyzuji vaše reálné obchody a náladu pro personalizované doporučení. Počkejte na kompletní analýzu."
                            : "Vaše emocionální stabilita je dnes na 85%. Doporučuji se zaměřit na swing trading strategie a vyhnout se scalping pozicím. Trh vykazuje vysokou volatilitu, což je ideální pro váš trading styl."}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            {isLiveMode ? "Analýza probíhá" : "Swing Trading"}
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {isLiveMode ? "Čekám na data" : "EUR/USD"}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {isLiveMode ? "Live režim" : "Vysoká volatilita"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href="/mindtrader">
                        Konzultovat s AI
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card
                  key={index}
                  className={`psyche-card ${achievement.unlocked ? "border-green-500/50" : "opacity-60"} group hover:scale-105 transition-all duration-300`}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div
                        className={`p-4 rounded-full mx-auto w-fit ${achievement.unlocked ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20" : "bg-gray-500/20"}`}
                      >
                        <achievement.icon
                          className={`w-8 h-8 ${achievement.unlocked ? achievement.color : "text-gray-500"} group-hover:scale-110 transition-transform`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <h3 className={`font-bold ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                            {achievement.title}
                          </h3>
                          {achievement.unlocked && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              <Award className="w-3 h-3 mr-1" />
                              {achievement.points}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-4">{achievement.description}</p>
                        <div className="space-y-2">
                          <Progress value={achievement.progress} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{achievement.progress}% dokončeno</span>
                            <span>{achievement.points} bodů</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="psyche-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-red-500" />
                    <span>Market Alerts</span>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      {marketAlerts.filter((a) => a.severity === "high").length} kritické
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          alert.severity === "high"
                            ? "bg-red-500/10 border-red-500/30"
                            : alert.severity === "medium"
                              ? "bg-yellow-500/10 border-yellow-500/30"
                              : "bg-blue-500/10 border-blue-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-slate-700/50 text-white border-slate-600">{alert.pair}</Badge>
                            <Badge
                              className={
                                alert.severity === "high"
                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                  : alert.severity === "medium"
                                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400">{alert.time}</span>
                        </div>
                        <p className="text-sm text-white">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="psyche-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    <span>Alert Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Price Alerts</p>
                        <p className="text-xs text-gray-400">Upozornění na cenové změny</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Zapnuto</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">News Alerts</p>
                        <p className="text-xs text-gray-400">Důležité ekonomické zprávy</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Zapnuto</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Technical Alerts</p>
                        <p className="text-xs text-gray-400">Technické signály</p>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Částečně</Badge>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Settings className="w-4 h-4 mr-2" />
                      Upravit nastavení
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Community CTA */}
        <div className="mt-12">
          <Card className="psyche-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
            <CardContent className="p-8 relative">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
                    <Users className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Připojte se k naší komunitě</h3>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
                  {isLiveMode
                    ? "Sdílejte zkušenosti s ostatními tradery, učte se od expertů a rozvíjejte své dovednosti v našem Team Clubu. Více než 10,000+ aktivních členů!"
                    : "Vyzkoušejte naši demo komunitu s falešnými tradery pro testování funkcí. V live režimu najdete skutečné tradery!"}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/team-club">
                      <Users className="w-5 h-5 mr-2" />
                      {isLiveMode ? "Vstoupit do komunity" : "Vyzkoušet demo komunitu"}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-white"
                  >
                    <Link href="/analytics">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                </div>
                <div className="flex justify-center items-center space-x-6 mt-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{isLiveMode ? "10,000+ členů" : "Demo komunita"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>4.9/5 hodnocení</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>24/7 podpora</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdminPanel && <AdminPanel isVisible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />}
    </div>
  )
}
