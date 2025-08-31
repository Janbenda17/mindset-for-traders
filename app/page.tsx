"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  TrendingUp,
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  Zap,
  ArrowRight,
  Activity,
  DollarSign,
  Award,
  Play,
  Monitor,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { user } = useAuth()
  const { isPremium, daysLeft } = useSubscription()
  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Calculate stats from actual data
    const trades = getAllTrades()
    const journals = getAllJournalEntries()

    const totalTrades = trades.length
    const winningTrades = trades.filter((trade) => trade.pnl > 0).length
    const losingTrades = trades.filter((trade) => trade.pnl < 0).length
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const averageMood = journals.length > 0 ? journals.reduce((sum, entry) => sum + entry.mood, 0) / journals.length : 0

    setStats({
      totalTrades,
      winningTrades,
      losingTrades,
      totalPnL,
      winRate,
      averageMood,
      journalCount: journals.length,
    })
  }, [isLiveMode, getAllTrades, getAllJournalEntries])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h1>
          <p className="text-gray-600 mb-4">Pro přístup k dashboardu se prosím přihlaste</p>
          <Button asChild>
            <Link href="/login">Přihlásit se</Link>
          </Button>
        </div>
      </div>
    )
  }

  const displayStats = [
    {
      title: "Celkový P&L",
      value: stats ? `$${stats.totalPnL.toFixed(0)}` : "$0",
      change:
        stats && stats.totalTrades > 0 ? `${stats.totalTrades} obchodů` : isLiveMode ? "Začněte tradovat" : "Demo data",
      icon: DollarSign,
      color:
        stats && stats.totalPnL > 0 ? "text-green-600" : stats && stats.totalPnL < 0 ? "text-red-600" : "text-gray-600",
    },
    {
      title: "Úspěšnost",
      value: stats ? `${stats.winRate.toFixed(0)}%` : "0%",
      change:
        stats && stats.totalTrades > 0
          ? `${stats.winningTrades}W/${stats.losingTrades}L`
          : isLiveMode
            ? "Žádné obchody"
            : "Demo výsledky",
      icon: Target,
      color:
        stats && stats.winRate > 50
          ? "text-green-600"
          : stats && stats.winRate > 0
            ? "text-orange-600"
            : "text-gray-600",
    },
    {
      title: "Obchody",
      value: stats ? stats.totalTrades.toString() : "0",
      change:
        stats && stats.journalCount > 0
          ? `${stats.journalCount} záznamů`
          : isLiveMode
            ? "Přidejte první obchod"
            : "Včetně demo dat",
      icon: Activity,
      color: stats && stats.totalTrades > 0 ? "text-blue-600" : "text-gray-600",
    },
    {
      title: "Průměrná nálada",
      value: stats && stats.averageMood > 0 ? stats.averageMood.toFixed(1) : "0",
      change: stats && stats.averageMood > 0 ? "Z deníku" : isLiveMode ? "Začněte zapisovat!" : "Demo nálady",
      icon: Award,
      color:
        stats && stats.averageMood > 7
          ? "text-green-600"
          : stats && stats.averageMood > 5
            ? "text-orange-600"
            : "text-gray-600",
    },
  ]

  const quickActions = [
    {
      title: "Nový zápis do deníku",
      description: "Zaznamenejte svůj poslední obchod",
      icon: BookOpen,
      href: "/journal",
      color: "bg-blue-500",
    },
    {
      title: "Analýzy výkonnosti",
      description: "Prohlédněte si své statistiky",
      icon: BarChart3,
      href: "/analytics",
      color: "bg-green-500",
    },
    {
      title: "MindTrader AI",
      description: "Konzultujte s AI asistentem",
      icon: Brain,
      href: "/mindtrader",
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vítejte zpět, {user.name}! 👋</h1>
              <p className="text-gray-600 mt-1">
                {isLiveMode ? "Zobrazujete své skutečné trading data" : "Zobrazujete demo data - prohlédněte si funkce"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Premium: {daysLeft} dní
              </Badge>
              <Badge
                variant="outline"
                className={`px-4 py-2 ${
                  isLiveMode
                    ? "border-green-200 text-green-700 bg-green-50"
                    : "border-blue-200 text-blue-700 bg-blue-50"
                }`}
              >
                {isLiveMode ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Live Mode
                  </>
                ) : (
                  <>
                    <Monitor className="w-3 h-3 mr-1" />
                    Virtual Mode
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Live Mode Notice */}
        {isLiveMode && (
          <div className="mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Play className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Live Mode aktivní</p>
                    <p className="text-green-700 text-sm">
                      Zobrazujete své skutečné trading data. Začněte přidávat obchody do deníku pro zobrazení statistik.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Virtual Mode Notice */}
        {!isLiveMode && (
          <div className="mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">Virtual Mode - Demo data</p>
                    <p className="text-blue-700 text-sm">
                      Prohlédněte si všechny funkce s demo daty. Až budete připraveni, přepněte na Live režim.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color} font-medium`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Affirmation Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Denní afirmace</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Generate new affirmation
                    const affirmations = [
                      "Jsem disciplinovaný trader, který se řídí svým plánem.",
                      "Každá ztráta je příležitost k učení a růstu.",
                      "Moje emoce jsou pod kontrolou a neovlivňují mé rozhodování.",
                      "Jsem trpělivý a čekám na správné příležitosti.",
                      "Věřím ve své trading schopnosti a rozhodnutí.",
                      "Jsem konzistentní ve svém přístupu k tradingu.",
                      "Risk management je základ mého úspěchu.",
                      "Každý den se zlepšuji jako trader.",
                      "Jsem klidný a soustředěný ve všech situacích.",
                      "Mám jasnou vizi svých obchodních cílů.",
                    ]
                    const today = new Date().toDateString()
                    const savedAffirmation = localStorage.getItem(`daily-affirmation-${today}`)
                    if (!savedAffirmation) {
                      const randomIndex = Math.floor(Math.random() * affirmations.length)
                      const newAffirmation = affirmations[randomIndex]
                      localStorage.setItem(`daily-affirmation-${today}`, newAffirmation)
                      window.location.reload()
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-blue-900 italic text-lg font-medium">
                "{(() => {
                  const affirmations = [
                    "Jsem disciplinovaný trader, který se řídí svým plánem.",
                    "Každá ztráta je příležitost k učení a růstu.",
                    "Moje emoce jsou pod kontrolou a neovlivňují mé rozhodování.",
                    "Jsem trpělivý a čekám na správné příležitosti.",
                    "Věřím ve své trading schopnosti a rozhodnutí.",
                    "Jsem konzistentní ve svém přístupu k tradingu.",
                    "Risk management je základ mého úspěchu.",
                    "Každý den se zlepšuji jako trader.",
                    "Jsem klidný a soustředěný ve všech situacích.",
                    "Mám jasnou vizi svých obchodních cílů.",
                  ]
                  const today = new Date().toDateString()
                  const savedAffirmation = localStorage.getItem(`daily-affirmation-${today}`)
                  if (savedAffirmation) {
                    return savedAffirmation
                  }
                  // Generate based on day of year for consistency
                  const dayOfYear = Math.floor(
                    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
                  )
                  return affirmations[dayOfYear % affirmations.length]
                })()}"
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rychlé akce</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Poslední aktivity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLiveMode && (!stats || stats.totalTrades === 0) ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Zatím žádné aktivity</p>
                  <p className="text-sm text-gray-500">Začněte přidávat obchody do deníku</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {isLiveMode ? "Poslední ziskový obchod" : "Úspěšný obchod EUR/USD"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {isLiveMode ? "Přidejte obchod pro zobrazení" : "Před 2 hodinami"}
                      </p>
                    </div>
                    <span className="text-green-600 font-medium">
                      {isLiveMode
                        ? "+$0"
                        : stats && stats.totalPnL > 0
                          ? `+$${Math.max(...getAllTrades().map((t) => t.pnl))}`
                          : "+$840"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nový zápis do deníku</p>
                      <p className="text-xs text-gray-600">{isLiveMode ? "Přidejte první zápis" : "Včera"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Konzultace s MindTrader AI</p>
                      <p className="text-xs text-gray-600">{isLiveMode ? "Vyzkoušejte AI asistenta" : "Před 2 dny"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Týdenní přehled</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLiveMode && (!stats || stats.totalTrades === 0) ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Žádná data k zobrazení</p>
                  <p className="text-sm text-gray-500">Přidejte obchody pro generování statistik</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Obchody tento týden</span>
                    <span className="font-semibold">{stats ? stats.totalTrades : "7"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Úspěšnost</span>
                    <span
                      className={`font-semibold ${stats && stats.winRate > 50 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {stats ? `${stats.winRate.toFixed(0)}%` : "71%"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nejlepší obchod</span>
                    <span className="font-semibold">
                      {isLiveMode ? (stats && stats.totalPnL > 0 ? `+$${stats.totalPnL.toFixed(0)}` : "$0") : "+$840"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Zápisy v deníku</span>
                    <span className="font-semibold">{stats ? stats.journalCount : "7"}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/analytics">
                        Zobrazit detailní analýzy
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
