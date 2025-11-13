"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Plus,
  Sparkles,
  BarChart3,
  Brain,
  Target,
  Zap,
  Download,
  Eye,
  Flame,
  Award,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import JournalCalendar from "@/components/journal-calendar"
import JournalEntries from "@/components/journal-entries"
import { RecordTrades } from "@/components/record-trades"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getJournalEntries } from "@/utils/storage-utils"
import { cn } from "@/lib/utils"

export default function JournalPage() {
  const [selectedTab, setSelectedTab] = useState("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [entries, setEntries] = useState<any[]>([])
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    const journalEntries = getJournalEntries()
    setEntries(journalEntries)
  }

  const handleEntryAdded = () => {
    loadEntries()
    setShowQuickAdd(false)
  }

  // Calculate advanced stats
  const calculateAdvancedStats = () => {
    const trades = entries.filter((e) => e.type === "trade")
    const totalPnL = trades.reduce((sum, t) => sum + (t.profitLoss || t.pnl || 0), 0)
    const winningTrades = trades.filter((t) => (t.profitLoss || t.pnl || 0) > 0)
    const losingTrades = trades.filter((t) => (t.profitLoss || t.pnl || 0) < 0)

    const thisWeek = entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    const thisMonth = entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      return entryDate >= monthAgo
    })

    // Calculate streak
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === streak) {
        streak++
      } else if (diffDays > streak) {
        break
      }
    }

    // Best and worst days
    const tradeDays = new Map<string, number>()
    trades.forEach((trade) => {
      const current = tradeDays.get(trade.date) || 0
      tradeDays.set(trade.date, current + (trade.profitLoss || trade.pnl || 0))
    })

    const bestDay = Math.max(...Array.from(tradeDays.values()), 0)
    const worstDay = Math.min(...Array.from(tradeDays.values()), 0)

    // Average mood
    const moodEntries = entries.filter((e) => e.mood)
    const avgMood = moodEntries.length > 0 ? moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length : 0

    return {
      totalEntries: entries.length,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL: Math.round(totalPnL * 100) / 100,
      winRate: trades.length > 0 ? Math.round((winningTrades.length / trades.length) * 100) : 0,
      avgPerDay: entries.length > 0 ? (entries.length / 30).toFixed(1) : "0",
      streak,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      bestDay: Math.round(bestDay * 100) / 100,
      worstDay: Math.round(worstDay * 100) / 100,
      avgMood: Math.round(avgMood * 10) / 10,
      avgWin:
        winningTrades.length > 0
          ? Math.round(
              (winningTrades.reduce((s, t) => s + (t.profitLoss || t.pnl || 0), 0) / winningTrades.length) * 100,
            ) / 100
          : 0,
      avgLoss:
        losingTrades.length > 0
          ? Math.round(
              (losingTrades.reduce((s, t) => s + (t.profitLoss || t.pnl || 0), 0) / losingTrades.length) * 100,
            ) / 100
          : 0,
    }
  }

  const stats = calculateAdvancedStats()

  // AI Insights
  const generateInsights = () => {
    const insights = []

    if (stats.streak >= 7) {
      insights.push({
        type: "success",
        icon: "🔥",
        title: "Skvělá konzistence!",
        message: `${stats.streak} dní v řadě jsi zapisoval do deníku. Udržuj to!`,
      })
    } else if (stats.streak < 3) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: "Zlepši konzistenci",
        message: "Pravidelné journaling je klíč k úspěchu. Zkus psát každý den!",
      })
    }

    if (stats.winRate >= 60) {
      insights.push({
        type: "success",
        icon: "🎯",
        title: "Výborný Win Rate!",
        message: `${stats.winRate}% win rate je profesionální úroveň. Skvělá práce!`,
      })
    } else if (stats.winRate < 50) {
      insights.push({
        type: "critical",
        icon: "🚨",
        title: "Win Rate potřebuje zlepšení",
        message: `${stats.winRate}% win rate je pod break-even. Zkontroluj svou strategii!`,
      })
    }

    if (stats.totalPnL > 1000) {
      insights.push({
        type: "success",
        icon: "💰",
        title: "Skvělé P&L!",
        message: `+$${stats.totalPnL} je excellent performance. Pokračuj v tom!`,
      })
    } else if (stats.totalPnL < -500) {
      insights.push({
        type: "critical",
        icon: "📉",
        title: "Negativní P&L",
        message: `${stats.totalPnL} vyžaduje okamžitou akci. Zreviduj risk management!`,
      })
    }

    if (stats.avgMood > 7) {
      insights.push({
        type: "success",
        icon: "😊",
        title: "Skvělá nálada!",
        message: `Průměrná nálada ${stats.avgMood}/10 je výborná. Pozitivní mindset = lepší výsledky!`,
      })
    } else if (stats.avgMood < 5) {
      insights.push({
        type: "warning",
        icon: "😔",
        title: "Nízká nálada",
        message: `Průměrná nálada ${stats.avgMood}/10. Focus na mental health!`,
      })
    }

    const profitFactor = stats.avgLoss !== 0 ? Math.abs(stats.avgWin / stats.avgLoss) : 0
    if (profitFactor > 2) {
      insights.push({
        type: "success",
        icon: "⚡",
        title: "Výborný Profit Factor!",
        message: `Profit factor ${profitFactor.toFixed(2)} je skvělý. Tvoje výhry jsou větší než ztráty!`,
      })
    }

    return insights
  }

  const insights = generateInsights()

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `trading-journal-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-purple-400" />
              Trading Deník
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            </h1>
            <p className="text-gray-300 text-lg">Sleduj své obchody, analyzuj výkon a rozvíjej se jako trader 🚀</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowInsights(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
              {insights.length > 0 && <Badge className="ml-2 bg-white/20 text-white border-0">{insights.length}</Badge>}
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowQuickAdd(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Rychlý záznam
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Celkem</p>
                    <p className="text-3xl font-bold text-white mb-1">{stats.totalEntries}</p>
                    <p className="text-blue-400 text-xs font-semibold">Záznamů</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: "100%" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Tento týden</p>
                    <p className="text-3xl font-bold text-white mb-1">{stats.thisWeek}</p>
                    <p className="text-green-400 text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Nových
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Calendar className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${Math.min((stats.thisWeek / 10) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Průměr/den</p>
                    <p className="text-3xl font-bold text-white mb-1">{stats.avgPerDay}</p>
                    <p className="text-purple-400 text-xs font-semibold">Záznamů</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${Math.min(Number.parseFloat(stats.avgPerDay) * 20, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Série</p>
                    <p className="text-3xl font-bold text-white mb-1">{stats.streak}</p>
                    <p className="text-orange-400 text-xs font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Dní
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                    <Flame className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-orange-500 to-amber-500"
                  style={{ width: `${Math.min((stats.streak / 30) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all",
              stats.totalPnL >= 0 ? "ring-2 ring-emerald-500/50" : "ring-2 ring-rose-500/50",
            )}
          >
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Total P&L</p>
                    <p
                      className={cn(
                        "text-3xl font-bold mb-1",
                        stats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL}
                    </p>
                    <p className="text-gray-400 text-xs font-semibold">Celkem</p>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-full bg-gradient-to-br",
                      stats.totalPnL >= 0 ? "from-emerald-500/20 to-green-500/20" : "from-rose-500/20 to-red-500/20",
                    )}
                  >
                    <DollarSign className={cn("w-6 h-6", stats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")} />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    stats.totalPnL >= 0
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : "bg-gradient-to-r from-rose-500 to-red-500",
                  )}
                  style={{ width: "100%" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Win Rate</p>
                    <p className="text-3xl font-bold text-white mb-1">{stats.winRate}%</p>
                    <p
                      className={cn(
                        "text-xs font-semibold flex items-center gap-1",
                        stats.winRate >= 60
                          ? "text-emerald-400"
                          : stats.winRate >= 50
                            ? "text-yellow-400"
                            : "text-rose-400",
                      )}
                    >
                      {stats.winRate >= 60 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stats.winRate >= 60 ? "Výborný" : stats.winRate >= 50 ? "Dobrý" : "Slabý"}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${stats.winRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Nejlepší</p>
                    <p className="text-3xl font-bold text-emerald-400 mb-1">+${stats.bestDay}</p>
                    <p className="text-gray-400 text-xs font-semibold">Den</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-emerald-500 to-green-500"
                  style={{ width: "100%" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">Nálada</p>
                    <p className="text-3xl font-bold text-white mb-1">{stats.avgMood}</p>
                    <p className="text-pink-400 text-xs font-semibold">/10 avg</p>
                  </div>
                  <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                    <Brain className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
              </div>
              <div className="h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-pink-500 to-rose-500"
                  style={{ width: `${stats.avgMood * 10}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights Bar */}
        {insights.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AI Insights dostupné!</h3>
                    <p className="text-gray-300 text-sm">
                      {insights.length} personalizovaných doporučení pro zlepšení výkonu
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowInsights(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Zobrazit Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
          <CardContent className="p-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-1 grid grid-cols-4 mb-6">
                <TabsTrigger
                  value="new"
                  className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  <Plus className="w-4 h-4" />
                  Nový záznam
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  <Calendar className="w-4 h-4" />
                  Kalendář
                </TabsTrigger>
                <TabsTrigger
                  value="entries"
                  className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  <BookOpen className="w-4 h-4" />
                  Všechny záznamy
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  <BarChart3 className="w-4 h-4" />
                  Statistiky
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="mt-0">
                <RecordTrades onTradeAdded={handleEntryAdded} />
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <JournalCalendar onDateSelect={setSelectedDate} />
              </TabsContent>

              <TabsContent value="entries" className="mt-0">
                <JournalEntries selectedDate={selectedDate} />
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Ziskové obchody</p>
                            <p className="text-2xl font-bold text-white">{stats.winningTrades}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Průměrný zisk</span>
                            <span className="text-emerald-400 font-bold">+${stats.avgWin}</span>
                          </div>
                          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                              style={{ width: `${(stats.winningTrades / stats.totalTrades) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-rose-500/20 rounded-xl">
                            <TrendingDown className="w-6 h-6 text-rose-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Ztrátové obchody</p>
                            <p className="text-2xl font-bold text-white">{stats.losingTrades}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Průměrná ztráta</span>
                            <span className="text-rose-400 font-bold">${stats.avgLoss}</span>
                          </div>
                          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-red-500"
                              style={{ width: `${(stats.losingTrades / stats.totalTrades) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Zap className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Profit Factor</p>
                            <p className="text-2xl font-bold text-white">
                              {stats.avgLoss !== 0 ? Math.abs(stats.avgWin / stats.avgLoss).toFixed(2) : "0"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Hodnocení</span>
                            <span className="text-purple-400 font-bold">
                              {stats.avgLoss !== 0 && Math.abs(stats.avgWin / stats.avgLoss) > 2 ? "Výborný" : "Dobrý"}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{
                                width: `${Math.min((stats.avgLoss !== 0 ? Math.abs(stats.avgWin / stats.avgLoss) : 0) * 33, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                        Performance Overview
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-emerald-400" />
                              <span className="text-gray-300">Nejlepší den</span>
                            </div>
                            <span className="text-emerald-400 font-bold text-lg">+${stats.bestDay}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <TrendingDown className="w-5 h-5 text-rose-400" />
                              <span className="text-gray-300">Nejhorší den</span>
                            </div>
                            <span className="text-rose-400 font-bold text-lg">${stats.worstDay}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Target className="w-5 h-5 text-cyan-400" />
                              <span className="text-gray-300">Win Rate</span>
                            </div>
                            <span className="text-cyan-400 font-bold text-lg">{stats.winRate}%</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Flame className="w-5 h-5 text-orange-400" />
                              <span className="text-gray-300">Série dní</span>
                            </div>
                            <span className="text-orange-400 font-bold text-lg">{stats.streak} dní</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Brain className="w-5 h-5 text-pink-400" />
                              <span className="text-gray-300">Průměrná nálada</span>
                            </div>
                            <span className="text-pink-400 font-bold text-lg">{stats.avgMood}/10</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-blue-400" />
                              <span className="text-gray-300">Tento měsíc</span>
                            </div>
                            <span className="text-blue-400 font-bold text-lg">{stats.thisMonth} záznamů</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-400" />
              Rychlý záznam
            </DialogTitle>
          </DialogHeader>
          <RecordTrades onTradeAdded={handleEntryAdded} onClose={() => setShowQuickAdd(false)} />
        </DialogContent>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Insights & Doporučení
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {insights.length} insights
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {insights.map((insight, index) => (
              <Card
                key={index}
                className={cn(
                  "border-2",
                  insight.type === "success" && "bg-emerald-500/5 border-emerald-500/30",
                  insight.type === "warning" && "bg-yellow-500/5 border-yellow-500/30",
                  insight.type === "critical" && "bg-rose-500/5 border-rose-500/30",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{insight.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{insight.message}</p>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        insight.type === "success" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                        insight.type === "warning" && "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                        insight.type === "critical" && "bg-rose-500/20 text-rose-300 border-rose-500/30",
                      )}
                    >
                      {insight.type === "success" && "✅ Výborně"}
                      {insight.type === "warning" && "⚠️ Pozor"}
                      {insight.type === "critical" && "🚨 Kritické"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {insights.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border-2 border-purple-500/30">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-lg font-medium text-gray-400 mb-2">Skvělá práce!</p>
                <p className="text-sm text-gray-500">Tvůj trading je v perfektní kondici. Pokračuj! 🚀</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
