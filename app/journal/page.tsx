"use client"

import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Plus,
  Sparkles,
  Brain,
  Download,
  Eye,
  Award,
  DollarSign,
  Shield,
  Flame,
  Smile,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
} from "lucide-react"
import DisciplineMatrix from "@/components/discipline-matrix"
import JournalAiSearch from "@/components/journal-ai-search"
import DayDetailPanel from "@/components/day-detail-panel"
import JournalRecentEntries from "@/components/journal-recent-entries"
import { buildDisciplineMatrix, type DisciplineDay } from "@/lib/discipline-matrix"
import { buildDailySummary } from "@/lib/daily-summary"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context" // Fixed import path from /context/ (singular) to /contexts/ (plural)
import { useAuth } from "@/contexts/auth-context" // Import useAuth hook
import { generateVirtualJournalStats } from "@/lib/virtual-data-generator" // Import for virtual stats

// Generates a realistic month of demo activity for Virtual mode. Unlike the
// old version, every demo trade now carries the same plan-adherence signals
// real trades do (followedPlan / matchedPlan / positionSize), and a handful of
// days get self-report tags (CLEAN_DAY / REVENGE_TRADING / EARLY_CLOSE) on a
// paired journal note. This is what lets the Discipline Matrix calendar AND
// the "Průměrná disciplína" cockpit actually score demo days instead of
// showing "—". Trades are grouped into 1-3 per active day with mixed
// plan-adherence so the calendar shows a believable emerald/orange/red mix.
const generateDemoEntries = () => {
  const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "BTC/USD", "EUR/JPY", "GBP/JPY", "AUD/USD"]
  const emotions = ["confident", "calm", "focused", "anxious", "excited", "nervous", "stressed", "disciplined"]
  const sessions = ["London", "New York", "Asian", "Overlap"]

  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  const demoEntries: any[] = []
  let tradeId = 1
  let journalId = 1
  const now = Date.now()

  const addTaggedJournal = (dateStr: string, tag: string, good: boolean) => {
    const titles: Record<string, string> = {
      CLEAN_DAY: "Bezchybný den – plně podle plánu",
      REVENGE_TRADING: "Revenge trading – ztratil jsem hlavu",
      EARLY_CLOSE: "Zavřel jsem moc brzo ze strachu",
      FOMO_overcome: "Ustál jsem FOMO – nenaskočil jsem",
    }
    demoEntries.push({
      id: `demo-journal-${journalId++}`,
      type: "journal",
      date: dateStr,
      title: titles[tag] || "Poznámka",
      content: titles[tag] || "",
      mood: good ? rnd(70, 92) : rnd(40, 60),
      notes: titles[tag] || "",
      emotion: good ? pick(["calm", "focused", "disciplined"]) : pick(["frustrated", "stressed", "nervous"]),
      tags: [tag],
    })
  }

  // Walk the last 30 days; trade on weekdays, skip ~25% of them for realism.
  for (let daysAgo = 1; daysAgo <= 30; daysAgo++) {
    const dayDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000)
    const dow = dayDate.getDay()
    if (dow === 0 || dow === 6) continue // no weekend trading
    if (Math.random() < 0.25) continue // some flat days
    const dateStr = dayDate.toISOString().split("T")[0]

    // Day character drives win-rate, plan-adherence and trade count.
    const roll = Math.random()
    const dayKind: "disciplined" | "mixed" | "revenge" =
      roll < 0.55 ? "disciplined" : roll < 0.85 ? "mixed" : "revenge"
    const tradesToday = dayKind === "revenge" ? rnd(2, 3) : rnd(1, 2)

    for (let k = 0; k < tradesToday; k++) {
      let isWin: boolean
      let followedPlan: boolean
      if (dayKind === "disciplined") {
        isWin = Math.random() > 0.3
        followedPlan = Math.random() > 0.12
      } else if (dayKind === "mixed") {
        isWin = Math.random() > 0.45
        followedPlan = Math.random() > 0.5
      } else {
        // revenge day: mostly losses, plan mostly broken
        isWin = Math.random() > 0.72
        followedPlan = Math.random() > 0.82
      }

      const pair = pick(pairs)
      const direction = Math.random() > 0.5 ? "long" : "short"
      const session = pick(sessions)
      const profitLoss = isWin ? rnd(500, 3500) : -rnd(200, 1700)
      const mood = isWin ? rnd(70, 95) : rnd(40, 70)
      const stressLevel = isWin ? rnd(2, 6) : rnd(6, 10)
      const confidenceBefore = isWin ? rnd(7, 10) : rnd(4, 8)
      const discipline = followedPlan ? rnd(7, 10) : rnd(3, 6)
      // Most days a normal size; revenge/plan-break sometimes oversized.
      const positionSize =
        !followedPlan && Math.random() > 0.5
          ? Number((Math.random() * 1.5 + 1.8).toFixed(2)) // 1.8-3.3 (oversized)
          : Number((Math.random() * 0.8 + 0.6).toFixed(2)) // 0.6-1.4 (normal)

      demoEntries.push({
        id: `demo-trade-${tradeId++}`,
        type: "trade",
        date: dateStr,
        title: `${direction.toUpperCase()} ${pair}`,
        content: isWin
          ? `Solid ${session} session setup, followed the plan`
          : Math.random() > 0.5
            ? "Should have waited for a cleaner setup"
            : "Entered too early, bad timing",
        pair,
        direction,
        entryPrice: Number((Math.random() * 100 + 1).toFixed(4)),
        exitPrice: Number((Math.random() * 100 + 1).toFixed(4)),
        positionSize,
        profitLoss,
        pnl: profitLoss,
        mood,
        notes: isWin
          ? `Solid ${session} session setup, followed the plan`
          : Math.random() > 0.5
            ? "Should have waited for a cleaner setup"
            : "Entered too early, bad timing",
        emotion: pick(emotions),
        tags: followedPlan ? ["A+ setup", "disciplined"] : ["learning", "improvement needed"],
        emotionBefore: pick(emotions),
        emotionDuring: pick(emotions),
        emotionAfter: isWin
          ? pick(["satisfied", "confident", "proud"])
          : pick(["frustrated", "disappointed", "learning"]),
        confidenceBefore,
        stressLevel,
        discipline,
        followedPlan,
        matchedPlan: followedPlan,
      })
    }

    // Layer a self-report tag on a few days so the calendar demonstrates the
    // green/red overrides and the AI search has something to find.
    if (dayKind === "revenge") {
      addTaggedJournal(dateStr, "REVENGE_TRADING", false)
    } else if (dayKind === "disciplined" && Math.random() < 0.3) {
      addTaggedJournal(dateStr, Math.random() < 0.5 ? "CLEAN_DAY" : "FOMO_overcome", true)
    } else if (dayKind === "mixed" && Math.random() < 0.3) {
      addTaggedJournal(dateStr, "EARLY_CLOSE", false)
    }
  }

  // A couple of plain reflection notes (no scoring tags) for the list view.
  const reflections = [
    "Dobrý týden, držel jsem se rizikového plánu a nehonil jsem ztráty.",
    "Náročný den, pracuji na trpělivosti při čekání na setup.",
    "Hodně jsem se naučil o své reakci po sérii ztrát.",
  ]
  reflections.forEach((content, i) => {
    const dayDate = new Date(now - rnd(1, 28) * 24 * 60 * 60 * 1000)
    demoEntries.push({
      id: `demo-reflection-${journalId++}`,
      type: "journal",
      date: dayDate.toISOString().split("T")[0],
      title: i % 2 === 0 ? "Reflexe – dobrý den" : "Reflexe – výzva",
      content,
      mood: rnd(50, 88),
      notes: content,
      emotion: pick(emotions),
    })
  })

  return demoEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function JournalPage() {
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
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "all">("month")
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
    aiInsightsAvailable: isEn ? "AI performance analysis" : "AI analýza výkonu",
    greatConsistency: isEn ? "Consistent journaling habit" : "Stabilní rutina zaznamenávání",
    consistencyMsg: (streak: number) => isEn ? `${streak} consecutive days of journaling. This consistency improves the reliability of every metric below.` : `${streak} dní zaznamenávání v řadě. Tato pravidelnost zvyšuje vypovídací hodnotu všech metrik níže.`,
    improveConsistency: isEn ? "Irregular journaling" : "Nepravidelné zaznamenávání",
    consistencyWarning: isEn ? "Journaling fewer than 3 days in a row limits how reliable your statistics are. Daily entries give a more accurate read on your patterns." : "Zaznamenávání méně než 3 dny v řadě omezuje vypovídací hodnotu statistik. Denní záznamy poskytují přesnější obraz tvých vzorců.",
    excellentWinRate: isEn ? "Win rate above professional benchmark" : "Win rate nad profesionální úrovní",
    winRateSuccess: (wr: number) => isEn ? `A ${wr}% win rate is in line with consistently profitable traders. Maintain the process that produced it.` : `Win rate ${wr}% odpovídá úrovni dlouhodobě ziskových obchodníků. Udržuj proces, který k tomu vedl.`,
    winRateNeeds: isEn ? "Win rate below break-even" : "Win rate pod hranicí rentability",
    winRateWarning: (wr: number) => isEn ? `A ${wr}% win rate is below break-even for most risk/reward setups. Review entry criteria before increasing position size.` : `Win rate ${wr}% je pod hranicí rentability pro většinu poměrů risk/reward. Před navýšením velikosti pozic prověř vstupní kritéria.`,
    greatPnL: isEn ? "Strong cumulative result" : "Silný kumulativní výsledek",
    pnLSuccess: (pnl: number) => isEn ? `+$${pnl} reflects a consistently profitable stretch. Document what's working so it can be repeated.` : `+$${pnl} odráží stabilně ziskové období. Zaznamenej si, co funguje, ať to lze opakovat.`,
    negativePnL: isEn ? "Negative cumulative result" : "Negativní kumulativní výsledek",
    pnLWarning: (pnl: number) => isEn ? `$${pnl} warrants a review of position sizing and risk management before the next session.` : `$${pnl} si vyžaduje revizi velikosti pozic a řízení rizik před další obchodní seancí.`,
    greatMood: isEn ? "Stable psychological state" : "Stabilní psychický stav",
    moodSuccess: (mood: number) => isEn ? `Average mood of ${mood}/10 correlates with more disciplined decision-making in your trade history.` : `Průměrná nálada ${mood}/10 koreluje s disciplinovanějším rozhodováním ve tvé historii obchodů.`,
    lowMood: isEn ? "Reduced psychological wellbeing" : "Snížená psychická pohoda",
    moodWarning: (mood: number) => isEn ? `Average mood of ${mood}/10. Consider a shorter session or a break before trading again — mood is a leading indicator of impulsive decisions.` : `Průměrná nálada ${mood}/10. Zvaž kratší seanci nebo pauzu před dalším obchodováním — nálada je předstihovým indikátorem impulzivních rozhodnutí.`,
    excellentProfitFactor: isEn ? "Healthy profit factor" : "Zdravý profit faktor",
    profitFactorMsg: (pf: number) => isEn ? `A profit factor of ${pf.toFixed(2)} means your average win meaningfully outweighs your average loss.` : `Profit faktor ${pf.toFixed(2)} znamená, že tvá průměrná výhra výrazně převažuje průměrnou ztrátu.`,
    highDiscipline: isEn ? "High plan adherence" : "Vysoká disciplína v dodržování plánu",
    highDisciplineMsg: (pct: number, saved: number) => isEn ? `${pct}% average discipline score. Estimated $${saved.toLocaleString("en-US")} preserved by not chasing impulsive entries — this is the strongest predictor of long-term results.` : `Průměrná disciplína ${pct}%. Odhadem $${saved.toLocaleString("en-US")} ušetřeno tím, že jsi nehonil impulzivní vstupy — to je nejsilnější predikátor dlouhodobého výsledku.`,
    lowDiscipline: isEn ? "Low plan adherence" : "Nízká disciplína v dodržování plánu",
    lowDisciplineMsg: (pct: number) => isEn ? `${pct}% average discipline score. Review the days marked red or orange in the calendar below to identify the specific rule being broken most often.` : `Průměrná disciplína ${pct}%. Projdi dny označené červeně nebo oranžově v kalendáři níže a urči, které pravidlo se porušuje nejčastěji.`,
    
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

    // Time filter
    filterWeek: isEn ? "Week" : "Týden",
    filterMonth: isEn ? "Month" : "Měsíc",
    filterAll: isEn ? "All time" : "Vše",
    periodLabel: isEn ? "Period" : "Období",

    // Extended stat cards
    statTrades: isEn ? "Trades" : "Obchodů",
    statWinRate: isEn ? "Win Rate" : "Win Rate",
    statNetPnL: isEn ? "Net P&L" : "Čistý P&L",
    statBestDay: isEn ? "Best Day" : "Nejlepší den",
    statStreak: isEn ? "Streak" : "Série",
    statMood: isEn ? "Avg Mood" : "Prům. nálada",
    daysUnit: isEn ? "days" : "dní",
    exportCsv: "CSV",
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

  // All entries for the active source (live context or demo), unfiltered.
  const allSourceEntries = useMemo(
    () => (isLiveMode ? getAllJournalEntries() || [] : entries),
    [isLiveMode, getAllJournalEntries, entries],
  )

  // Entries narrowed to the selected time window (week / month / all). Stats
  // and the recent-entries list both read from this so the period selector
  // controls everything consistently.
  const periodEntries = useMemo(() => {
    if (timeFilter === "all") return allSourceEntries
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() - (timeFilter === "week" ? 7 : 30))
    return allSourceEntries.filter((e: any) => new Date(e.date) >= cutoff)
  }, [allSourceEntries, timeFilter])

  const stats = useMemo(() => {
    const contextEntries = periodEntries
    const trades = contextEntries.filter((e: any) => e.type === "trade")

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
  }, [periodEntries]) // Recalculate when the active period's entries change

  // Behavioral Cockpit: the two dominant psychological metrics shown above
  // the fold. Both are derived from the exact same engines that drive the
  // Discipline Matrix heatmap and the Daily Tracker's "Ušetřeno disciplínou"
  // card (lib/discipline-matrix.ts + lib/daily-summary.ts) -- no separate
  // made-up numbers, so this can never disagree with the matrix below it.
  const cockpit = useMemo(() => {
    const cockpitTrades = isLiveMode ? getAllTrades() || [] : entries.filter((e: any) => e.type === "trade")
    const cockpitJournalEntries = isLiveMode
      ? getAllJournalEntries() || []
      : entries.filter((e: any) => e.type === "journal")

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

    if (cockpit.avgDiscipline !== null) {
      if (cockpit.avgDiscipline >= 80) {
        insights.push({
          type: "success",
          icon: "🛡️",
          title: txt.highDiscipline,
          message: txt.highDisciplineMsg(cockpit.avgDiscipline, cockpit.savedTotal),
        })
      } else if (cockpit.avgDiscipline < 50) {
        insights.push({
          type: "critical",
          icon: "🛡️",
          title: txt.lowDiscipline,
          message: txt.lowDisciplineMsg(cockpit.avgDiscipline),
        })
      }
    }

    return insights
  }

  const insights = generateInsights()

  const triggerDownload = (content: string, mime: string, ext: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `trading-journal-${new Date().toISOString().split("T")[0]}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportData = () => {
    const source = isLiveMode ? getAllJournalEntries() || [] : entries
    triggerDownload(JSON.stringify(source, null, 2), "application/json", "json")
  }

  const exportCsv = () => {
    const source = isLiveMode ? getAllJournalEntries() || [] : entries
    const cols = ["date", "type", "pair", "direction", "profitLoss", "mood", "emotion", "notes"]
    const escape = (v: any) => {
      const s = String(v ?? "")
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = [
      cols.join(","),
      ...source.map((e: any) =>
        cols.map((c) => escape(c === "profitLoss" ? e.profitLoss ?? e.pnl ?? "" : e[c])).join(","),
      ),
    ]
    triggerDownload(rows.join("\n"), "text/csv;charset=utf-8", "csv")
  }

  // const openEntryModal = (entry) => {
  //   // Implement modal opening logic here
  // }

  // Stats now always come from the period-filtered computation so the
  // Week / Month / All selector controls the numbers in both live and demo
  // mode. (virtualStats is kept available for any legacy callers but the
  // header cards read the live, filter-aware figures.)
  const displayStats = stats
  void virtualStats

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
              JSON
            </Button>
            <Button
              onClick={exportCsv}
              variant="outline"
              className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 text-xs md:text-sm px-3 md:px-4 hidden md:flex"
            >
              <FileSpreadsheet className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              {txt.exportCsv}
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

        {/* Time period selector — controls the stat cards below and the
            recent-entries list. */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{txt.periodLabel}:</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-xl p-1">
            {[
              { key: "week" as const, label: txt.filterWeek },
              { key: "month" as const, label: txt.filterMonth },
              { key: "all" as const, label: txt.filterAll },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTimeFilter(opt.key)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all",
                  timeFilter === opt.key
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                    : "text-gray-400 hover:text-white",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extended stat grid — 6 key figures, each period-aware. */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {txt.statTrades}
              </p>
              <p className="text-xl md:text-2xl font-bold text-white">{displayStats.totalTrades}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1">{txt.statWinRate}</p>
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
          <Card
            className={cn(
              "bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden",
              displayStats.totalPnL >= 0 ? "ring-1 ring-emerald-500/40" : "ring-1 ring-rose-500/40",
            )}
          >
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1">{txt.statNetPnL}</p>
              <p
                className={cn(
                  "text-xl md:text-2xl font-bold",
                  displayStats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {displayStats.totalPnL >= 0 ? "+" : ""}${displayStats.totalPnL.toLocaleString("en-US")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> {txt.statBestDay}
              </p>
              <p className="text-xl md:text-2xl font-bold text-emerald-400">
                +${displayStats.bestDay.toLocaleString("en-US")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> {txt.statStreak}
              </p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {displayStats.streak} <span className="text-xs font-normal text-gray-400">{txt.daysUnit}</span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <p className="text-gray-400 text-[10px] md:text-xs font-medium mb-1 flex items-center gap-1">
                <Smile className="w-3 h-3 text-blue-400" /> {txt.statMood}
              </p>
              <p
                className={cn(
                  "text-xl md:text-2xl font-bold",
                  displayStats.avgMood >= 70 ? "text-emerald-400" : displayStats.avgMood >= 50 ? "text-yellow-400" : "text-rose-400",
                )}
              >
                {displayStats.avgMood || "—"}
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
              trades={!isLiveMode ? entries.filter((e: any) => e.type === "trade") : undefined}
              journalEntries={!isLiveMode ? entries.filter((e: any) => e.type === "journal") : undefined}
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
            <DisciplineMatrix
              highlightedDates={highlightedDates}
              onDayClick={setSelectedDay}
              trades={!isLiveMode ? entries.filter((e: any) => e.type === "trade") : undefined}
              journalEntries={!isLiveMode ? entries.filter((e: any) => e.type === "journal") : undefined}
            />
          </CardContent>
        </Card>

        {/* Recent entries — searchable, filterable list of individual trades
            and notes for the selected period. */}
        <JournalRecentEntries entries={periodEntries} isEn={isEn} />

        {selectedDay && (
          <DayDetailPanel
            day={selectedDay}
            onClose={() => setSelectedDay(null)}
            demoTrades={!isLiveMode ? entries.filter((e: any) => e.type === "trade") : undefined}
          />
        )}

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
