"use client"

import { useState, useEffect, useMemo } from "react"
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
  FileText,
} from "lucide-react"
import JournalCalendar from "@/components/journal-calendar"
import JournalEntries from "@/components/journal-entries"
import { RecordTrades } from "@/components/record-trades"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context" // Fixed import path from /context/ (singular) to /contexts/ (plural)
import { useAuth } from "@/contexts/auth-context" // Import useAuth hook
import { useLiveMode } from "@/contexts/live-mode-context"
import { generateVirtualJournalStats } from "@/lib/virtual-data-generator" // Import for virtual stats

const generateDemoEntries = () => {
  const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD", "EUR/JPY", "GBP/JPY", "AUD/USD"]
  const emotions = ["confident", "calm", "focused", "anxious", "excited", "nervous", "stressed", "disciplined"]
  const sessions = ["London", "New York", "Asian", "Overlap"]
  
  const demoEntries = []
  
  // Generate 25 random trades
  for (let i = 0; i < 25; i++) {
    const isWin = Math.random() > 0.35 // 65% win rate
    const pair = pairs[Math.floor(Math.random() * pairs.length)]
    const direction = Math.random() > 0.5 ? "long" : "short"
    const daysAgo = Math.floor(Math.random() * 30) + 1
    
    const profitLoss = isWin 
      ? Math.floor(Math.random() * 3000) + 500  // Win: 500-3500
      : -Math.floor(Math.random() * 1500) - 200 // Loss: -200 to -1700
    
    const mood = isWin 
      ? Math.floor(Math.random() * 25) + 70  // 70-95
      : Math.floor(Math.random() * 30) + 40 // 40-70
      
    const stressLevel = isWin
      ? Math.floor(Math.random() * 4) + 2  // 2-6
      : Math.floor(Math.random() * 4) + 6 // 6-10
      
    const confidenceBefore = isWin
      ? Math.floor(Math.random() * 3) + 7  // 7-10
      : Math.floor(Math.random() * 4) + 4 // 4-8
    
    const session = sessions[Math.floor(Math.random() * sessions.length)]
    
    demoEntries.push({
      id: `demo-trade-${i + 1}`,
      type: "trade",
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      title: `${direction.toUpperCase()} ${pair}`,
      content: isWin 
        ? `Perfektní setup, dodržel jsem plán na ${session} session`
        : `${Math.random() > 0.5 ? "Měl jsem počkat na lepší setup" : "Příliš brzy vstup, špatný timing"}`,
      pair,
      direction,
      entryPrice: Math.random() * 100 + 1,
      exitPrice: Math.random() * 100 + 1,
      profitLoss,
      pnl: profitLoss,
      mood,
      notes: isWin 
        ? `Perfektní setup, dodržel jsem plán na ${session} session`
        : `${Math.random() > 0.5 ? "Měl jsem počkat na lepší setup" : "Příliš brzy vstup, špatný timing"}`,
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      tags: isWin ? ["A+ setup", "disciplined"] : ["learning", "improvement needed"],
      emotionBefore: emotions[Math.floor(Math.random() * emotions.length)],
      emotionDuring: emotions[Math.floor(Math.random() * emotions.length)],
      emotionAfter: isWin ? emotions[Math.floor(Math.random() * 3)] : emotions[Math.floor(Math.random() * 3) + 5],
      confidenceBefore,
      stressLevel,
    })
  }
  
  // Add 5 journal entries
  for (let i = 0; i < 5; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 1
    demoEntries.push({
      id: `demo-journal-${i + 1}`,
      type: "journal",
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      title: `Deník - ${i % 2 === 0 ? "Dobrý" : "Náročný"} den`,
      content: `${i % 2 === 0 ? "Dobrý" : "Náročný"} den, ${i % 3 === 0 ? "hodně jsem se naučil" : "pracuji na disciplíně"}`,
      mood: Math.floor(Math.random() * 40) + 50,
      notes: `${i % 2 === 0 ? "Dobrý" : "Náročný"} den, ${i % 3 === 0 ? "hodně jsem se naučil" : "pracuji na disciplíně"}`,
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
    })
  }
  
  return demoEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function JournalPage() {
  const [selectedTab, setSelectedTab] = useState("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [entries, setEntries] = useState<any[]>([])
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [sortedJournalEntries, setSortedJournalEntries] = useState<any[]>([])
  const { getAllJournalEntries, isLiveMode } = useData()
  const { user } = useAuth()
  const [virtualStats, setVirtualStats] = useState<any>(null) // State for virtual stats

  useEffect(() => {
    loadEntries()
  }, [user, isLiveMode])

  useEffect(() => {
    if (!isLiveMode) {
      const stats = generateVirtualJournalStats()
      setVirtualStats(stats)
    }
  }, [isLiveMode]) // Recalculate when isLiveMode changes

  const loadEntries = () => {
    if (isLiveMode && user) {
      const journalEntries = getAllJournalEntries() || []
      const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(journalEntries)
      setSortedJournalEntries(sortedEntries)
    } else if (!isLiveMode) {
      const virtualEntries = generateDemoEntries()
      setEntries(virtualEntries)
      setSortedJournalEntries(virtualEntries)
    } else {
      setEntries([])
      setSortedJournalEntries([])
    }
  }

  // Function to handle new entries and refresh the list
  const handleEntryAdded = () => {
    loadEntries() // Reload entries to reflect the new one
  }

  const stats = useMemo(() => {
    const contextEntries = isLiveMode ? getAllJournalEntries() || [] : entries
    const trades = contextEntries.filter((e) => e.type === "trade")

    // Return zero stats if no entries from context
    if (contextEntries.length === 0) {
      return {
        totalEntries: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        winRate: 0,
        avgPerDay: "0",
        streak: 0,
        thisWeek: 0,
        thisMonth: 0,
        bestDay: 0,
        worstDay: 0,
        avgMood: 0,
        avgWin: 0,
        avgLoss: 0,
      }
    }

    const totalPnL = trades.reduce((sum, t) => sum + (t.profitLoss || t.pnl || 0), 0)
    const winningTrades = trades.filter((t) => (t.profitLoss || t.pnl || 0) > 0)
    const losingTrades = trades.filter((t) => (t.profitLoss || t.pnl || 0) < 0)

    const thisWeek = contextEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })

    const thisMonth = contextEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      return entryDate >= monthAgo
    })

    // Calculate streak
    const sortedEntriesForStreak = [...contextEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sortedEntriesForStreak) {
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
    const moodEntries = contextEntries.filter((e) => e.mood !== undefined && e.mood !== null)
    const avgMood = moodEntries.length > 0 ? moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length : 0

    return {
      totalEntries: contextEntries.length,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL: Math.round(totalPnL * 100) / 100,
      winRate: trades.length > 0 ? Math.round((winningTrades.length / trades.length) * 100) : 0,
      avgPerDay: (contextEntries.length / 30).toFixed(1),
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
  }, [getAllJournalEntries, entries, isLiveMode]) // Recalculate when entries from context change

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
    } else if (stats.streak < 3 && stats.totalEntries > 0) {
      // Only show if there are entries
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: "Zlepši konzistenci",
        message: "Pravidelné journaling je klíč k úspěchu. Zkus psát každý den!",
      })
    }

    if (stats.totalTrades > 0) {
      // Only show if there are trades
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
    } else if (stats.avgMood < 5 && stats.totalEntries > 0) {
      // Only show if there are entries
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
    const dataStr = JSON.stringify(getAllJournalEntries() || [], null, 2) // Use context for export
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

  // const openEntryModal = (entry) => {
  //   // Implement modal opening logic here
  // }

  // Determine which stats to display
  const displayStats = !isLiveMode && virtualStats ? virtualStats : stats

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-[1800px] mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 flex items-center gap-2 md:gap-3">
              <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-purple-400" />
              Trading Deník
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs md:text-sm">
                <Sparkles className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                PRO
              </Badge>
            </h1>
            <p className="text-gray-300 text-sm md:text-lg hidden md:block">
              Sleduj své obchody, analyzuj výkon a rozvíjej se jako trader 🚀
            </p>
          </div>

        {!isLiveMode && (
          <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-2 px-3 text-xs md:text-sm flex items-center gap-2 w-full">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-amber-100">
              <span className="font-bold text-white">Momentálně si prohlížíš data ve Virtual modu</span> – jak mohou vypadat během používání softwaru
            </span>
          </div>
        )}

          <div className="flex gap-2 md:gap-3 flex-wrap">
            <Button
              onClick={() => setShowInsights(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg text-xs md:text-sm px-3 md:px-4"
            >
              <Brain className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">AI Insights</span>
              <span className="md:hidden">AI</span>
              {insights.length > 0 && (
                <Badge className="ml-1 md:ml-2 bg-white/20 text-white border-0 text-xs">{insights.length}</Badge>
              )}
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 text-xs md:text-sm px-3 md:px-4 hidden md:flex"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setShowQuickAdd(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg text-xs md:text-sm px-3 md:px-4"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Rychlý záznam</span>
              <span className="md:hidden">+</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4">
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Celkem</p>
                    <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
                      {displayStats.totalEntries || displayStats.celkem}
                    </p>
                    <p className="text-blue-400 text-[10px] md:text-xs font-semibold">Záznamů</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: "100%" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Tento týden</p>
                    <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{displayStats.thisWeek}</p>
                    <p className="text-green-400 text-[10px] md:text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> Nových
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Calendar className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${Math.min((displayStats.thisWeek / 10) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Průměr/den</p>
                    <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">
                      {displayStats.avgPerDay || displayStats.avgPerTrade}
                    </p>
                    <p className="text-purple-400 text-[10px] md:text-xs font-semibold">Záznamů</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{
                    width: `${Math.min(Number.parseFloat(displayStats.avgPerDay || displayStats.avgPerTrade) * 20, 100)}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Série</p>
                    <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{displayStats.streak}</p>
                    <p className="text-orange-400 text-[10px] md:text-xs font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 md:w-4 md:h-4" /> Dní
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                    <Flame className="w-4 h-4 md:w-6 md:h-6 text-orange-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-orange-500 to-amber-500"
                  style={{ width: `${Math.min((displayStats.streak / 30) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all",
              displayStats.totalPnL >= 0 ? "ring-2 ring-emerald-500/50" : "ring-2 ring-rose-500/50",
            )}
          >
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Total P&L</p>
                    <p
                      className={cn(
                        "text-xl md:text-3xl font-bold mb-0.5 md:mb-1",
                        displayStats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400",
                      )}
                    >
                      {displayStats.totalPnL >= 0 ? "+" : ""}${displayStats.totalPnL}
                    </p>
                    <p className="text-gray-400 text-[10px] md:text-xs font-semibold">Celkem</p>
                  </div>
                  <div
                    className={cn(
                      "p-2 md:p-3 rounded-full bg-gradient-to-br",
                      displayStats.totalPnL >= 0
                        ? "from-emerald-500/20 to-green-500/20"
                        : "from-rose-500/20 to-red-500/20",
                    )}
                  >
                    <DollarSign
                      className={cn(
                        "w-4 h-4 md:w-6 md:h-6",
                        displayStats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    displayStats.totalPnL >= 0
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
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Win Rate</p>
                    <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{displayStats.winRate}%</p>
                    <p
                      className={cn(
                        "text-[10px] md:text-xs font-semibold flex items-center gap-1",
                        displayStats.winRate >= 60
                          ? "text-emerald-400"
                          : displayStats.winRate >= 50
                            ? "text-yellow-400"
                            : "text-rose-400",
                      )}
                    >
                      {displayStats.winRate >= 60 ? (
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      ) : (
                        <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                      {displayStats.winRate >= 60 ? "Výborný" : displayStats.winRate >= 50 ? "Dobrý" : "Slabý"}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <Target className="w-4 h-4 md:w-6 md:h-6 text-cyan-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${displayStats.winRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Nejlepší</p>
                    <p className="text-xl md:text-3xl font-bold text-emerald-400 mb-0.5 md:mb-1">
                      +${displayStats.bestDay}
                    </p>
                    <p className="text-gray-400 text-[10px] md:text-xs font-semibold">Den</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                    <Award className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-emerald-500 to-green-500"
                  style={{ width: "100%" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden hover:scale-105 transition-all">
            <CardContent className="p-0">
              <div className="p-2 md:p-4 pb-2 md:pb-3">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-0.5 md:mb-1">Nálada</p>
                    <p className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{displayStats.avgMood}</p>
                    <p className="text-pink-400 text-[10px] md:text-xs font-semibold">/10 avg</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                    <Brain className="w-4 h-4 md:w-6 md:h-6 text-pink-400" />
                  </div>
                </div>
              </div>
              <div className="h-1 md:h-1.5 bg-slate-700">
                <div
                  className="h-full transition-all bg-gradient-to-r from-pink-500 to-rose-500"
                  style={{ width: `${displayStats.avgMood * 10}%` }}
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
                    <Sparkles className="w-6 h-6 text-purple-400" />
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
          <CardContent className="p-3 md:p-6">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-4 gap-2 md:gap-4 bg-slate-800 border border-slate-600 p-1">
                <TabsTrigger
                  value="new"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Nový záznam</span>
                  <span className="md:hidden">+</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Kalendář</span>
                  <span className="md:hidden">Cal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="entries"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Všechny záznamy</span>
                  <span className="md:hidden">List</span>
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Statistiky</span>
                  <span className="md:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="mt-0">
                <RecordTrades onTradeAdded={handleEntryAdded} />
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <JournalCalendar onDateSelect={setSelectedDate} demoEntries={!isLiveMode ? entries : undefined} />
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
                            <p className="text-2xl font-bold text-white">{displayStats.winningTrades}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Průměrný zisk</span>
                            <span className="text-emerald-400 font-bold">+${displayStats.avgWin}</span>
                          </div>
                          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                              style={{
                                width: `${(displayStats.winningTrades / (displayStats.totalTrades || 1)) * 100}%`,
                              }}
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
                            <p className="text-2xl font-bold text-white">{displayStats.losingTrades}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Průměrná ztráta</span>
                            <span className="text-rose-400 font-bold">${displayStats.avgLoss}</span>
                          </div>
                          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 to-red-500"
                              style={{
                                width: `${(displayStats.losingTrades / (displayStats.totalTrades || 1)) * 100}%`,
                              }}
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
                              {displayStats.avgLoss !== 0
                                ? Math.abs(displayStats.avgWin / displayStats.avgLoss).toFixed(2)
                                : "0"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Hodnocení</span>
                            <span className="text-purple-400 font-bold">
                              {displayStats.avgLoss !== 0 && Math.abs(displayStats.avgWin / displayStats.avgLoss) > 2
                                ? "Výborný"
                                : "Dobrý"}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{
                                width: `${Math.min((displayStats.avgLoss !== 0 ? Math.abs(displayStats.avgWin / displayStats.avgLoss) : 0) * 33, 100)}%`,
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
                            <span className="text-emerald-400 font-bold text-lg">+${displayStats.bestDay}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <TrendingDown className="w-5 h-5 text-rose-400" />
                              <span className="text-gray-300">Nejhorší den</span>
                            </div>
                            <span className="text-rose-400 font-bold text-lg">${displayStats.worstDay}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Target className="w-5 h-5 text-cyan-400" />
                              <span className="text-gray-300">Win Rate</span>
                            </div>
                            <span className="text-cyan-400 font-bold text-lg">{displayStats.winRate}%</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Flame className="w-5 h-5 text-orange-400" />
                              <span className="text-gray-300">Série dní</span>
                            </div>
                            <span className="text-orange-400 font-bold text-lg">{displayStats.streak} dní</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Brain className="w-5 h-5 text-pink-400" />
                              <span className="text-gray-300">Průměrná nálada</span>
                            </div>
                            <span className="text-pink-400 font-bold text-lg">{displayStats.avgMood}/10</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-5 h-5 text-blue-400" />
                              <span className="text-gray-300">Tento měsíc</span>
                            </div>
                            <span className="text-blue-400 font-bold text-lg">{displayStats.thisMonth} záznamů</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <div className="space-y-4">
                  {sortedJournalEntries.length === 0 ? (
                    <Card className="p-8 text-center">
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Zatím žádné záznamy</h3>
                        <p className="text-sm text-muted-foreground">Začněte zaznamenávat své obchody a poznatky</p>
                      </div>
                    </Card>
                  ) : (
                    sortedJournalEntries.map((entry) => (
                      <Card key={entry.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {entry.type === "trade" ? (
                              <TrendingUp className="h-5 w-5 text-blue-500" />
                            ) : (
                              <FileText className="h-5 w-5 text-purple-500" />
                            )}
                            <div>
                              <h3 className="font-semibold">
                                {entry.type === "trade"
                                  ? `${entry.direction?.toUpperCase() || ""} ${entry.pair || ""}`
                                  : "Journal Entry"}
                              </h3>
                              <p className="text-sm text-muted-foreground">{entry.date}</p>
                            </div>
                          </div>
                          {entry.type === "trade" && (
                            <div
                              className={cn(
                                "text-lg font-bold",
                                (entry.profitLoss || entry.pnl || 0) >= 0 ? "text-green-500" : "text-red-500",
                              )}
                            >
                              {(entry.profitLoss || entry.pnl || 0) >= 0 ? "+" : ""}$
                              {entry.profitLoss || entry.pnl || 0}
                            </div>
                          )}
                        </div>

                        {entry.type === "trade" && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-4 bg-muted/50 rounded-lg">
                            {entry.emotionBefore && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Emoce před</p>
                                <Badge variant="outline" className="text-xs">
                                  {entry.emotionBefore}
                                </Badge>
                              </div>
                            )}
                            {entry.emotionDuring && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Emoce během</p>
                                <Badge variant="outline" className="text-xs">
                                  {entry.emotionDuring}
                                </Badge>
                              </div>
                            )}
                            {entry.emotionAfter && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Emoce po</p>
                                <Badge variant="outline" className="text-xs">
                                  {entry.emotionAfter}
                                </Badge>
                              </div>
                            )}
                            {entry.confidenceBefore !== undefined && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Důvěra v obchod</p>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold">{entry.confidenceBefore}/10</div>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 transition-all"
                                      style={{ width: `${(entry.confidenceBefore / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            {entry.stressLevel !== undefined && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Úroveň stresu</p>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold">{entry.stressLevel}/10</div>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full transition-all",
                                        entry.stressLevel > 7
                                          ? "bg-red-500"
                                          : entry.stressLevel > 4
                                            ? "bg-yellow-500"
                                            : "bg-green-500",
                                      )}
                                      style={{ width: `${(entry.stressLevel / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            {entry.mood !== undefined && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Nálada</p>
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-purple-500" />
                                  <div className="text-sm font-semibold">{entry.mood}/10</div>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-purple-500 transition-all"
                                      style={{ width: `${(entry.mood / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {entry.notes && <p className="text-sm text-muted-foreground mb-3">{entry.notes}</p>}

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))
                  )}
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
