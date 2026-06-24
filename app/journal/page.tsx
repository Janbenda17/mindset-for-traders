"use client"

import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
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
import DisciplineMatrix from "@/components/discipline-matrix"
import JournalAiSearch from "@/components/journal-ai-search"
import DayDetailPanel from "@/components/day-detail-panel"
import AnalyticsSuite from "@/components/analytics-suite"
import { buildDisciplineMatrix, type DisciplineDay } from "@/lib/discipline-matrix"
import { buildDailySummary } from "@/lib/daily-summary"
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
        ? `Perfect setup, I followed my plan on ${session} session`
        : `${Math.random() > 0.5 ? "I should have waited for a better setup" : "Too early entry, bad timing"}`,
      pair,
      direction,
      entryPrice: Math.random() * 100 + 1,
      exitPrice: Math.random() * 100 + 1,
      profitLoss,
      pnl: profitLoss,
      mood,
      notes: isWin 
        ? `Perfect setup, I followed my plan on ${session} session`
        : `${Math.random() > 0.5 ? "I should have waited for a better setup" : "Too early entry, bad timing"}`,
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
      title: `Journal - ${i % 2 === 0 ? "Good" : "Challenging"} day`,
      content: `${i % 2 === 0 ? "Good" : "Challenging"} day, ${i % 3 === 0 ? "I learned a lot" : "working on discipline"}`,
      mood: Math.floor(Math.random() * 40) + 50,
      notes: `${i % 2 === 0 ? "Good" : "Challenging"} day, ${i % 3 === 0 ? "I learned a lot" : "working on discipline"}`,
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
  const { getAllJournalEntries, getAllTrades, isLiveMode } = useData()
  const { user } = useAuth()
  const { language } = useLanguage()
  const [virtualStats, setVirtualStats] = useState<any>(null) // State for virtual stats
  const [highlightedDates, setHighlightedDates] = useState<Set<string> | null>(null)
  const [matchedDays, setMatchedDays] = useState<DisciplineDay[]>([])
  const [searchSummary, setSearchSummary] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<DisciplineDay | null>(null)
  const isEn = language === "en"

  const txt = {
    // Page title and subtitle
    journalTitle: isEn ? "Trading Journal" : "Obchodní deník",
    journalSubtitle: isEn ? "Record your thoughts, emotions, and lessons from trading." : "Zaznamenávej své myšlenky, emoce a lekce z obchodování.",
    
    // Virtual mode notice
    virtualNotice: isEn ? "You are currently viewing data in Virtual mode" : "Právě prohlížíš data ve Virtual režimu",
    virtualNotice2: isEn ? " – how it may look during software use" : " – jak by to vypadalo během používání software",
    
    // Tab labels
    aiInsights: isEn ? "AI Insights" : "AI Analýza",
    aiShort: isEn ? "AI" : "AI",
    quickEntry: isEn ? "Quick Entry" : "Rychlý záznam",
    newEntry: isEn ? "New Entry" : "Nový záznam",
    cal: isEn ? "Cal" : "Kal",
    calendar: isEn ? "Calendar" : "Kalendář",
    allRecords: isEn ? "All Records" : "Všechny záznamy",
    list: isEn ? "List" : "Seznam",
    stats: isEn ? "Stats" : "Statistika",
    
    // Stats labels
    total: isEn ? "Total" : "Celkem",
    records: isEn ? "Records" : "Záznamů",
    thisWeek: isEn ? "This Week" : "Tento týden",
    avgPerDay: isEn ? "Avg/Day" : "Průměr/Den",
    streak: isEn ? "Streak" : "Série",
    totalPnL: isEn ? "Total P&L" : "Celkový P&L",
    winRate: isEn ? "Win Rate" : "Míra výher",
    bestDay: isEn ? "Best Day" : "Nejlepší den",
    mood: isEn ? "Mood" : "Nálada",
    
    // Insights
    aiInsightsAvailable: isEn ? "AI Insights available!" : "AI Analýza dostupná!",
    greatConsistency: isEn ? "Great Consistency!" : "Skvělá konzistence!",
    consistencyMsg: (streak: number) => isEn ? `You've journaled for ${streak} days in a row. Keep it up!` : `Zaznamenáváš si ${streak} dní v kuse. Pokračuj!`,
    improveConsistency: isEn ? "Improve Consistency" : "Vylepši konzistenci",
    consistencyWarning: isEn ? "Regular journaling is key to success. Try writing every day!" : "Pravidelné zaznamenávání je klíčem k úspěchu. Zkus psát každý den!",
    excellentWinRate: isEn ? "Excellent Win Rate!" : "Vynikající míra výher!",
    winRateSuccess: (wr: number) => isEn ? `${wr}% win rate is professional level. Great work!` : `${wr}% míra výher je profesionální úroveň. Skvělá práce!`,
    winRateNeeds: isEn ? "Win Rate Needs Improvement" : "Míra výher potřebuje vylepšení",
    winRateWarning: (wr: number) => isEn ? `${wr}% win rate is below break-even. Check your strategy!` : `${wr}% míra výher je pod rentabilností. Zkontroluj svou strategii!`,
    greatPnL: isEn ? "Great P&L!" : "Skvělý P&L!",
    pnLSuccess: (pnl: number) => isEn ? `+$${pnl} is excellent performance. Keep it up!` : `+$${pnl} je vynikající výkon. Pokračuj!`,
    negativePnL: isEn ? "Negative P&L" : "Negativní P&L",
    pnLWarning: (pnl: number) => isEn ? `${pnl} requires immediate action. Review your risk management!` : `${pnl} vyžaduje okamžité jednání. Zkontroluj řízení rizik!`,
    greatMood: isEn ? "Great Mood!" : "Skvělá nálada!",
    moodSuccess: (mood: number) => isEn ? `Average mood ${mood}/10 is excellent. Positive mindset = better results!` : `Průměrná nálada ${mood}/10 je vynikající. Pozitivní myšlení = lepší výsledky!`,
    lowMood: isEn ? "Low Mood" : "Nízká nálada",
    moodWarning: (mood: number) => isEn ? `Average mood ${mood}/10. Focus on mental health!` : `Průměrná nálada ${mood}/10. Soustřeď se na duševní zdraví!`,
    excellentProfitFactor: isEn ? "Excellent Profit Factor!" : "Vynikající profit faktor!",
    profitFactorMsg: (pf: number) => isEn ? `Profit factor ${pf.toFixed(2)} is excellent. Your wins are bigger than losses!` : `Profit faktor ${pf.toFixed(2)} je vynikající. Tvoje výhry jsou větší než ztráty!`,
    
    // Trade stats
    profitingTrades: isEn ? "Profitable Trades" : "Ziskové obchody",
    avgProfit: isEn ? "Average Profit" : "Průměrný zisk",
    losingTrades: isEn ? "Losing Trades" : "Ztrátové obchody",
    avgLoss: isEn ? "Average Loss" : "Průměrná ztráta",
    profitFactor: isEn ? "Profit Factor" : "Profit faktor",
    rating: isEn ? "Rating" : "Hodnocení",
    bestDayVal: isEn ? "Best Day" : "Nejlepší den",
    worstDay: isEn ? "Worst Day" : "Nejhorší den",
    thisMonth: isEn ? "This Month" : "Tento měsíc",
    
    // Empty state
    noRecords: isEn ? "No records yet" : "Zatím žádné záznamy",
    startRecording: isEn ? "Start recording your trades and insights" : "Začni zaznamenávat své obchody a poznatky",
    
    // Entry details
    emotionBefore: isEn ? "Emotion Before" : "Emoce před",
    emotionDuring: isEn ? "Emotion During" : "Emoce během",
    emotionAfter: isEn ? "Emotion After" : "Emoce po",
    confidence: isEn ? "Confidence" : "Sebejistota",
    stressLevel: isEn ? "Stress Level" : "Úroveň stresu",
    
    // Final message
    excellentJob: isEn ? "Excellent Job!" : "Výborně!",
    tradingGreat: isEn ? "Your trading is in great shape. Keep going! 🚀" : "Tvé obchodování je ve skvělé formě. Pokračuj! 🚀",
    personalizedRecommendations: isEn ? "personalized recommendations for improving performance" : "personalizovaných doporučení pro zlepšení výkonu",
    viewInsights: isEn ? "View Insights" : "Zobrazit Insights",
  }

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

  // Behavioral Cockpit: the two dominant psychological metrics shown above
  // the fold. Both are derived from the exact same engines that drive the
  // Discipline Matrix heatmap and the Daily Tracker's "Ušetřeno disciplínou"
  // card (lib/discipline-matrix.ts + lib/daily-summary.ts) -- no separate
  // made-up numbers, so this can never disagree with the matrix below it.
  const cockpit = useMemo(() => {
    const cockpitTrades = isLiveMode ? getAllTrades() || [] : entries.filter((e: any) => e.type === "trade")
    const cockpitJournalEntries = isLiveMode ? getAllJournalEntries() || [] : []

    if (cockpitTrades.length === 0) {
      return { avgDiscipline: null as number | null, savedTotal: 0 }
    }

    const days = buildDisciplineMatrix(cockpitTrades, cockpitJournalEntries)
    const scored = days.filter((d) => d.score !== null)
    const avgDiscipline =
      scored.length > 0 ? Math.round(scored.reduce((s, d) => s + (d.score || 0), 0) / scored.length) : null

    const byDate = new Map<string, any[]>()
    cockpitTrades.forEach((t: any) => {
      const d = String(t?.date || "").slice(0, 10)
      if (!d) return
      if (!byDate.has(d)) byDate.set(d, [])
      byDate.get(d)!.push(t)
    })

    let savedTotal = 0
    byDate.forEach((dayTrades, date) => {
      const dayInfo = days.find((d) => d.date === date)
      const daySummary = buildDailySummary(dayTrades, date, dayInfo?.tags || [])
      if (daySummary.disciplinedDollars) savedTotal += daySummary.disciplinedDollars.amount
    })

    return { avgDiscipline, savedTotal: Math.round(savedTotal) }
  }, [isLiveMode, getAllTrades, getAllJournalEntries, entries])

  // AI Insights
  const generateInsights = () => {
    const insights = []

    if (stats.streak >= 7) {
      insights.push({
        type: "success",
        icon: "🔥",
        title: txt.greatConsistency,
        message: txt.consistencyMsg(stats.streak),
      })
    } else if (stats.streak < 3 && stats.totalEntries > 0) {
      insights.push({
        type: "warning",
        icon: "⚠️",
        title: txt.improveConsistency,
        message: txt.consistencyWarning,
      })
    }

    if (stats.totalTrades > 0) {
      if (stats.winRate >= 60) {
        insights.push({
          type: "success",
          icon: "🎯",
          title: txt.excellentWinRate,
          message: txt.winRateSuccess(stats.winRate),
        })
      } else if (stats.winRate < 50) {
        insights.push({
          type: "critical",
          icon: "🚨",
          title: txt.winRateNeeds,
          message: txt.winRateWarning(stats.winRate),
        })
      }
    }

    if (stats.totalPnL > 1000) {
      insights.push({
        type: "success",
        icon: "💰",
        title: txt.greatPnL,
        message: txt.pnLSuccess(stats.totalPnL),
      })
    } else if (stats.totalPnL < -500) {
      insights.push({
        type: "critical",
        icon: "📉",
        title: txt.negativePnL,
        message: txt.pnLWarning(stats.totalPnL),
      })
    }

    if (stats.avgMood > 7) {
      insights.push({
        type: "success",
        icon: "😊",
        title: txt.greatMood,
        message: txt.moodSuccess(stats.avgMood),
      })
    } else if (stats.avgMood < 5 && stats.totalEntries > 0) {
      insights.push({
        type: "warning",
        icon: "😔",
        title: txt.lowMood,
        message: txt.moodWarning(stats.avgMood),
      })
    }

    const profitFactor = stats.avgLoss !== 0 ? Math.abs(stats.avgWin / stats.avgLoss) : 0
    if (profitFactor > 2) {
      insights.push({
        type: "success",
        icon: "⚡",
        title: txt.excellentProfitFactor,
        message: txt.profitFactorMsg(profitFactor),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 flex items-center gap-2 md:gap-3">
              <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-purple-400" />
              {txt.journalTitle}
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs md:text-sm">
                <Sparkles className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                PRO
              </Badge>
            </h1>
            <p className="text-gray-300 text-sm md:text-lg hidden md:block">
              {txt.journalSubtitle}
            </p>
          </div>

        {!isLiveMode && (
          <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-2 px-3 text-xs md:text-sm flex items-center gap-2 w-full mb-4">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-amber-100">
              <span className="font-bold text-white">{txt.virtualNotice}</span>{txt.virtualNotice2}
            </span>
          </div>
        )}

          <div className="flex gap-2 md:gap-3 flex-wrap">
            <Button
              onClick={() => setShowInsights(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg text-xs md:text-sm px-3 md:px-4"
            >
              <Brain className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">{txt.aiInsights}</span>
              <span className="md:hidden">{txt.aiShort}</span>
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
              <span className="hidden md:inline">{txt.quickEntry}</span>
              <span className="md:hidden">+</span>
            </Button>
          </div>
        </div>

        {/* Behavioral Cockpit -- two dominant psychological metrics first,
            the classic trade stats demoted to a smaller secondary row. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-purple-900/60 to-slate-900/60 border-purple-500/30 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm font-medium mb-1 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" /> Průměrná disciplína
                  </p>
                  <p className="text-3xl md:text-5xl font-black text-white mb-1">
                    {cockpit.avgDiscipline !== null ? `${cockpit.avgDiscipline}%` : "—"}
                  </p>
                  <p className="text-purple-300 text-xs md:text-sm">
                    {cockpit.avgDiscipline === null
                      ? "Zatím bez dat"
                      : cockpit.avgDiscipline >= 80
                        ? "Excelentní dodržování plánu"
                        : cockpit.avgDiscipline >= 50
                          ? "Solidní, prostor pro zlepšení"
                          : "Pravidla se často porušují"}
                  </p>
                </div>
                <div className="p-3 md:p-4 rounded-full bg-purple-500/20">
                  <Award className="w-7 h-7 md:w-9 md:h-9 text-purple-300" />
                </div>
              </div>
              <div className="h-1.5 mt-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${cockpit.avgDiscipline ?? 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/60 to-slate-900/60 border-emerald-500/30 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm font-medium mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Ušetřeno sebekontrolou
                  </p>
                  <p className="text-3xl md:text-5xl font-black text-white mb-1">
                    ${cockpit.savedTotal.toLocaleString("en-US")}
                  </p>
                  <p className="text-emerald-300 text-xs md:text-sm">
                    Odhad, kolik jsi nepřišel díky tomu, že jsi nehonil impulzivní vstupy
                  </p>
                </div>
                <div className="p-3 md:p-4 rounded-full bg-emerald-500/20">
                  <Shield className="w-7 h-7 md:w-9 md:h-9 text-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1">Obchodů</p>
              <p className="text-xl md:text-2xl font-bold text-white">{displayStats.totalTrades}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1">Win Rate</p>
              <p
                className={cn(
                  "text-xl md:text-2xl font-bold",
                  displayStats.winRate >= 60
                    ? "text-emerald-400"
                    : displayStats.winRate >= 50
                      ? "text-yellow-400"
                      : "text-rose-400",
                )}
              >
                {displayStats.winRate}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1">Profit Factor</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {displayStats.avgLoss !== 0 ? Math.abs(displayStats.avgWin / displayStats.avgLoss).toFixed(2) : "0"}
              </p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden",
              displayStats.totalPnL >= 0 ? "ring-1 ring-emerald-500/40" : "ring-1 ring-rose-500/40",
            )}
          >
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1">Net P&L</p>
              <p
                className={cn(
                  "text-xl md:text-2xl font-bold",
                  displayStats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {displayStats.totalPnL >= 0 ? "+" : ""}${displayStats.totalPnL}
              </p>
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
                    <h3 className="text-white font-bold text-lg">{txt.aiInsightsAvailable}</h3>
                    <p className="text-gray-300 text-sm">
                      {insights.length} {txt.personalizedRecommendations}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowInsights(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {txt.viewInsights}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discipline Matrix — disciplína per day, grounded in real
            followedPlan/matchedPlan booleans + objective revenge detection
            + self-report tags (see lib/discipline-matrix.ts). AI search bar
            lets the trader query their own history in plain language;
            Claude only narrows a fixed-vocabulary filter, every date shown
            is computed from real trade/journal data, never invented. */}
        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
          <CardContent className="p-3 md:p-6 space-y-4">
            <JournalAiSearch
              onResults={(dates, days, summary) => {
                setHighlightedDates(dates)
                setMatchedDays(days)
                setSearchSummary(summary)
              }}
            />
            {searchSummary && (
              <div className="text-sm text-gray-300 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p>{searchSummary}</p>
                {matchedDays.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-gray-400">
                    {matchedDays.slice(0, 8).map((d) => (
                      <li key={d.date}>
                        <span className="text-gray-300 font-medium">{d.date}</span> — {d.reason}
                      </li>
                    ))}
                    {matchedDays.length > 8 && <li>… a {matchedDays.length - 8} dalších dní</li>}
                  </ul>
                )}
              </div>
            )}
            <DisciplineMatrix highlightedDates={highlightedDates} onDayClick={setSelectedDay} />
          </CardContent>
        </Card>

        {selectedDay && (
          <DayDetailPanel
            day={selectedDay}
            onClose={() => setSelectedDay(null)}
            demoTrades={!isLiveMode ? entries.filter((e: any) => e.type === "trade") : undefined}
          />
        )}

        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
          <CardContent className="p-3 md:p-6">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 bg-slate-800 border border-slate-600 p-1">
                <TabsTrigger
                  value="calendar"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Kalendář</span>
                  <span className="md:hidden">Cal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="mindset"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Brain className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Mindset</span>
                  <span className="md:hidden">Mind</span>
                </TabsTrigger>
                <TabsTrigger
                  value="patterns"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Vzorce</span>
                  <span className="md:hidden">Vzor</span>
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Statistiky</span>
                  <span className="md:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="action"
                  className="gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 text-xs md:text-sm px-2 md:px-4"
                >
                  <Target className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Akční plán</span>
                  <span className="md:hidden">Plán</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="mt-0">
                <JournalCalendar onDateSelect={setSelectedDate} demoEntries={!isLiveMode ? entries : undefined} />
              </TabsContent>

              <TabsContent value="mindset" className="mt-0">
                <AnalyticsSuite tab="mindset" />
              </TabsContent>

              <TabsContent value="patterns" className="mt-0">
                <AnalyticsSuite tab="patterns" />
              </TabsContent>

              <TabsContent value="action" className="mt-0">
                <AnalyticsSuite tab="action" />
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

            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Plus className="w-6 h-6 text-purple-400" />
              {isEn ? "Quick Entry" : "Rychlý záznam"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-12">
            <p className="text-slate-400 text-center">
              {isEn ? "Trades sync automatically from your MetaTrader connection" : "Obchody se synchronizují automaticky z vašeho MetaTrader připojení"}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              {txt.aiInsights} & {isEn ? "Recommendations" : "Doporučení"}
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {insights.length} {isEn ? "insights" : "poznatků"}
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
                <p className="text-lg font-medium text-gray-400 mb-2">{txt.excellentJob}</p>
                <p className="text-sm text-gray-500">{txt.tradingGreat}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
