'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Flame,
  Trophy,
  Activity,
  Brain,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Eye,
  MessageCircle,
  Leaf,
  Zap,
  RotateCcw,
  LogOut,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useData } from '@/contexts/data-context'
import { buildDailySummary } from '@/lib/daily-summary'
import { useGamification } from '@/contexts/gamification-context'

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function fmtMoney(n: number) {
  const sign = n > 0 ? '+' : ''
  return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`
}

export default function DailyTrackerPage() {
  const { getAllTrades, isLiveMode, getTradingStats, journalEntries, addJournalEntry, updateJournalEntry } = useData()
  const { data: gamification, getLevelInfo } = useGamification()
  const router = useRouter()
  const [tab, setTab] = useState('today')
  const [failLogRevealed, setFailLogRevealed] = useState(false)

  // Quick FOMO Tag check-in: 2-second self-report instead of free-text
  // journaling. dayTags feeds straight into the daily-summary engine, which
  // layers it on top of (never instead of) the automatic MT5-based detection.
  const [dayTags, setDayTags] = useState<string[]>([])
  const [fomoStep, setFomoStep] = useState(false)
  const tagsSeededRef = useRef(false)

  const toggleTag = (tag: string) => {
    setDayTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }
  const onFomoClick = () => {
    if (dayTags.includes('FOMO_overcome') || dayTags.includes('FOMO_chased')) {
      setDayTags((prev) => prev.filter((t) => t !== 'FOMO_overcome' && t !== 'FOMO_chased'))
      setFomoStep(false)
    } else {
      setFomoStep(true)
    }
  }
  const resolveFomo = (choice: 'FOMO_overcome' | 'FOMO_chased') => {
    setDayTags((prev) => [...prev.filter((t) => t !== 'FOMO_overcome' && t !== 'FOMO_chased'), choice])
    setFomoStep(false)
  }
  const tagPillClass = (tag: string, color: 'red' | 'orange' | 'emerald') => {
    const active = dayTags.includes(tag)
    const activeClasses: Record<string, string> = {
      red: 'border-red-500/40 bg-red-500/10 text-red-300',
      orange: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
      emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    }
    return `inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
      active ? activeClasses[color] : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
    }`
  }

  // Quick-action: hand a day-specific question off to MindTrader AI chat,
  // pre-filled, same mechanism already used elsewhere in the app (loss-reset).
  const askAi = (prompt: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindtrader-ai-prefill', prompt)
    }
    router.push('/mindtrader?tab=ai')
  }

  const allTrades = getAllTrades() || []
  const overallStats = getTradingStats()
  const today = new Date()

  // Today's trades
  const todaysTrades = useMemo(
    () => allTrades.filter((t: any) => t?.date && isSameDay(new Date(t.date), today)),
    [allTrades]
  )

  const todayStats = useMemo(() => {
    if (todaysTrades.length === 0) {
      return { totalPnL: 0, wins: 0, losses: 0, winRate: 0, count: 0 }
    }
    const wins = todaysTrades.filter((t: any) => t.pnl > 0).length
    const losses = todaysTrades.filter((t: any) => t.pnl < 0).length
    const totalPnL = todaysTrades.reduce((s: number, t: any) => s + (t.pnl || 0), 0)
    return {
      totalPnL,
      wins,
      losses,
      winRate: Math.round((wins / todaysTrades.length) * 100),
      count: todaysTrades.length,
    }
  }, [todaysTrades])

  // Current streak (consecutive wins or losses from most recent trade backwards)
  const currentStreak = useMemo(() => {
    if (allTrades.length === 0) return { count: 0, type: 'none' as const }
    const sorted = [...allTrades].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    let count = 0
    const isWin = sorted[0].pnl > 0
    for (const t of sorted) {
      if ((t.pnl > 0) === isWin) count++
      else break
    }
    return { count, type: isWin ? ('win' as const) : ('loss' as const) }
  }, [allTrades])

  // Proactive cooldown warning: fires as soon as 2 real losses in a row are
  // detected today, or the trader self-reported REVENGE_TRADING - shown
  // right here on the page instead of waiting for the trader to open the
  // /mindtrader chat on his own.
  const cooldownAlert = useMemo(() => {
    if (dayTags.includes('REVENGE_TRADING')) {
      return {
        reason: 'self-report' as const,
        text: 'Sám jsi dnes označil revenge trading. Než otevřeš další pozici, dej si pauzu — trh tu bude i za 15 minut.',
      }
    }
    if (todaysTrades.length >= 2) {
      const sortedToday = [...todaysTrades].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      const lastTwoLosses = sortedToday[0].pnl < 0 && sortedToday[1].pnl < 0
      if (lastTwoLosses) {
        return {
          reason: 'consecutive-losses' as const,
          text: 'Poslední 2 obchody dnes byly ztrátové. Riziko revenge tradingu roste — zvaž krátkou pauzu před dalším obchodem.',
        }
      }
    }
    return null
  }, [dayTags, todaysTrades])

  // Daily Summary — full narrative of the day (trade count, win rate, P&L,
  // best/worst trade) plus the emotional read, fully automatic from today's
  // MetaTrader trades. Also persisted into journal_entries below so it
  // shows up in the History tab for that day.
  const dateLabel = today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateStr = today.toISOString().split('T')[0]
  const dailySummary = useMemo(
    () => buildDailySummary(todaysTrades, dateLabel, dayTags),
    [todaysTrades, dateLabel, dayTags]
  )

  // Automatically derived market context for the day's self-report tags —
  // most-traded instrument + (if found) the same real time-gap window the
  // disciplinedDollars estimate is grounded in. Never typed in by the user.
  const marketContextLabel = useMemo(() => {
    if (todaysTrades.length === 0) return null
    const counts: Record<string, number> = {}
    todaysTrades.forEach((t: any) => {
      if (t.pair) counts[t.pair] = (counts[t.pair] || 0) + 1
    })
    const instrument = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const gapMatch = dailySummary.disciplinedDollars?.text.match(/Mezi (\d{1,2}:\d{2}) a (\d{1,2}:\d{2})/)
    if (instrument && gapMatch) return `${instrument}, ${gapMatch[1]}-${gapMatch[2]}`
    return instrument || null
  }, [todaysTrades, dailySummary.disciplinedDollars])

  const disciplineColor =
    dailySummary.discipline.score >= 80 ? '#34d399' : dailySummary.discipline.score >= 50 ? '#fbbf24' : '#f87171'
  const disciplineTextColor =
    dailySummary.discipline.score >= 80
      ? 'text-emerald-400'
      : dailySummary.discipline.score >= 50
        ? 'text-amber-400'
        : 'text-red-400'

  // Seed dayTags from the persisted journal entry once (e.g. after reload),
  // without ever overwriting the user's live in-session toggles.
  useEffect(() => {
    if (tagsSeededRef.current || todaysTrades.length === 0) return
    const id = `daily-summary-${dateStr}`
    const existing = (journalEntries || []).find((e: any) => e.id === id)
    if (existing) {
      tagsSeededRef.current = true
      const knownTags = ['FOMO_overcome', 'FOMO_chased', 'REVENGE_TRADING', 'EARLY_CLOSE', 'CLEAN_DAY']
      const seeded = (existing.tags || []).filter((t: string) => knownTags.includes(t))
      if (seeded.length > 0) setDayTags(seeded)
    }
  }, [journalEntries, todaysTrades.length, dateStr])

  // Persist today's Daily Summary + self-report tags + derived market
  // context into the journal so it shows up in History and so MindTrader AI
  // chat can reference the self-reported tags instead of guessing.
  useEffect(() => {
    if (todaysTrades.length === 0) return
    const id = `daily-summary-${dateStr}`
    const existing = (journalEntries || []).find((e: any) => e.id === id)
    const fullTags = ['auto-daily-summary', ...dayTags]
    const tagsChanged = JSON.stringify(existing?.tags || []) !== JSON.stringify(fullTags)
    const marketChanged = (existing?.market_conditions ?? null) !== (marketContextLabel ?? null)
    if (!existing) {
      addJournalEntry({
        id,
        date: dateStr,
        type: 'journal',
        title: 'Daily Summary',
        content: dailySummary.narrative,
        tags: fullTags,
        market_conditions: marketContextLabel,
      })
    } else if (existing.content !== dailySummary.narrative || tagsChanged || marketChanged) {
      updateJournalEntry({
        ...existing,
        content: dailySummary.narrative,
        tags: fullTags,
        market_conditions: marketContextLabel,
      })
    }
  }, [
    dailySummary.narrative,
    todaysTrades.length,
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    dayTags,
    marketContextLabel,
    dateStr,
  ])

  // Equity curve (last 30 trades, cumulative)
  const equityData = useMemo(() => {
    if (allTrades.length === 0) return []
    const sorted = [...allTrades]
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
    let cumulative = 0
    return sorted.map((t: any) => {
      cumulative += t.pnl || 0
      return {
        date: new Date(t.date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }),
        value: Math.round(cumulative * 100) / 100,
      }
    })
  }, [allTrades])

  // History grouped by day (last 30 days that have trades)
  const dailyHistory = useMemo(() => {
    const byDay = new Map<string, { date: Date; pnl: number; count: number; wins: number }>()
    for (const t of allTrades) {
      if (!t?.date) continue
      const d = new Date(t.date)
      const key = d.toDateString()
      const existing = byDay.get(key)
      if (existing) {
        existing.pnl += t.pnl || 0
        existing.count += 1
        if (t.pnl > 0) existing.wins += 1
      } else {
        byDay.set(key, { date: d, pnl: t.pnl || 0, count: 1, wins: t.pnl > 0 ? 1 : 0 })
      }
    }
    return Array.from(byDay.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 30)
  }, [allTrades])

  const levelInfo = getLevelInfo ? getLevelInfo(gamification?.level || 1) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Daily Tracker</h1>
            <p className="text-slate-400">
              {today.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {!isLiveMode && (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              Demo mode — connect MetaTrader for real data
            </div>
          )}
        </motion.div>

        {/* Proactive cooldown warning */}
        <AnimatePresence>
          {cooldownAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-500/15 to-orange-500/10 p-4 flex items-start gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-200">Cooldown doporučen</p>
                <p className="text-sm text-red-100/90 mt-1">{cooldownAlert.text}</p>
              </div>
              <Link href="/mindtrader">
                <Button size="sm" variant="outline" className="border-red-400/40 text-red-200 hover:bg-red-500/10 flex-shrink-0">
                  Probrat s MindTrader AI
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero stat row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden relative">
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Today's P&L</p>
              <p
                className={`text-3xl font-black mt-1 ${
                  todayStats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {fmtMoney(todayStats.totalPnL)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{todayStats.count} trades today</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Win Rate Today</p>
              <p className="text-3xl font-black text-white mt-1">
                {todayStats.count > 0 ? `${todayStats.winRate}%` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {todayStats.wins}W / {todayStats.losses}L
              </p>
            </CardContent>
          </Card>

          <Card className="border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-slate-950">
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-400" /> Streak
              </p>
              <p className="text-3xl font-black text-white mt-1">
                {currentStreak.count > 0 ? currentStreak.count : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {currentStreak.type === 'win'
                  ? 'consecutive wins'
                  : currentStreak.type === 'loss'
                    ? 'consecutive losses'
                    : 'no trades yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-slate-950">
            <CardContent className="p-5">
              <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Trophy className="h-3 w-3 text-purple-400" /> Level {gamification?.level || 1}
              </p>
              <p className="text-3xl font-black text-white mt-1">{gamification?.xp || 0} XP</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{levelInfo?.name || 'Trader'}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="today" className="text-sm">
              Today
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              History
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            {/* Emotional AI read — fully automatic from today's MetaTrader trades */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              <Card
                className={`border bg-gradient-to-br from-slate-900 to-slate-950 ${
                  dailySummary.tone === 'bad'
                    ? 'border-red-500/30'
                    : dailySummary.tone === 'warn'
                      ? 'border-amber-500/30'
                      : dailySummary.tone === 'good'
                        ? 'border-emerald-500/30'
                        : 'border-slate-800'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Brain
                        className={`h-5 w-5 ${
                          dailySummary.tone === 'bad'
                            ? 'text-red-400'
                            : dailySummary.tone === 'warn'
                              ? 'text-amber-400'
                              : dailySummary.tone === 'good'
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                        }`}
                      />
                      Daily Summary
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        dailySummary.tone === 'bad'
                          ? 'bg-red-500/10 text-red-300'
                          : dailySummary.tone === 'warn'
                            ? 'bg-amber-500/10 text-amber-300'
                            : dailySummary.tone === 'good'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-slate-500/10 text-slate-300'
                      }`}
                    >
                      {dailySummary.label}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* "Nálada trhu vs. tvoje emoce" — one-line mental-matrix read of the day */}
                  <p className="text-sm text-slate-200 italic border-l-2 border-slate-600 pl-3 leading-relaxed">
                    “{dailySummary.matrixLine}”
                  </p>

                  {todaysTrades.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                        Detekoval jsi dnes u sebe některý z těchto impulsů?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={onFomoClick}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                            dayTags.includes('FOMO_overcome')
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : dayTags.includes('FOMO_chased')
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <Zap className="h-3 w-3" />
                          FOMO
                          {dayTags.includes('FOMO_overcome')
                            ? ' — ovládl jsi ho'
                            : dayTags.includes('FOMO_chased')
                              ? ' — naskočil jsi'
                              : ' (Strach z uteklého zisku)'}
                        </button>
                        <button type="button" onClick={() => toggleTag('REVENGE_TRADING')} className={tagPillClass('REVENGE_TRADING', 'red')}>
                          <RotateCcw className="h-3 w-3" /> Revenge Trading
                        </button>
                        <button type="button" onClick={() => toggleTag('EARLY_CLOSE')} className={tagPillClass('EARLY_CLOSE', 'orange')}>
                          <LogOut className="h-3 w-3" /> Brzké uzavření
                        </button>
                        <button type="button" onClick={() => toggleTag('CLEAN_DAY')} className={tagPillClass('CLEAN_DAY', 'emerald')}>
                          <CheckCircle2 className="h-3 w-3" /> Bezchybný den
                        </button>
                      </div>
                      <AnimatePresence>
                        {fomoStep && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 flex items-center gap-2 text-xs text-slate-400 overflow-hidden"
                          >
                            <span>Naskočil jsi do něj, nebo jsi ho ovládl?</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-amber-500/40 text-amber-300 bg-transparent hover:bg-amber-500/10"
                              onClick={() => resolveFomo('FOMO_chased')}
                            >
                              Naskočil
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-emerald-500/40 text-emerald-300 bg-transparent hover:bg-emerald-500/10"
                              onClick={() => resolveFomo('FOMO_overcome')}
                            >
                              Ovládl
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {todaysTrades.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      {/* Left column: Fail Log dne (gamified reveal) + AI chat triggers */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Fail Log dne</p>
                          <AnimatePresence mode="wait" initial={false}>
                            {!failLogRevealed && dailySummary.leak ? (
                              <motion.div
                                key="locked"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <div className="rounded-xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-sm p-5 text-center">
                                  <Lock className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                                  <p className="text-sm text-slate-300 mb-3">
                                    AI detekoval {dailySummary.bullets.length}{' '}
                                    {dailySummary.bullets.length === 1
                                      ? 'kritický psychologický přešlap'
                                      : 'kritické psychologické přešlapy'}
                                    . Jsi připraven na pravdu?
                                  </p>
                                  <Button
                                    size="sm"
                                    onClick={() => setFailLogRevealed(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <Eye className="h-4 w-4 mr-1.5" /> Odhalit chyby
                                  </Button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="revealed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-2"
                              >
                                {dailySummary.leak && (
                                  <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                    <p className="text-xs font-semibold text-red-300 mb-1">
                                      {dailySummary.leak.title}
                                    </p>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                      {dailySummary.leak.text}
                                    </p>
                                  </div>
                                )}
                                <ul className="space-y-1.5">
                                  {dailySummary.bullets.map((b, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                      <span className="mt-1 h-1 w-1 rounded-full bg-slate-500 flex-shrink-0" />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {dailySummary.chatPrompts.length > 0 && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                              Zeptej se AI na dnešek
                            </p>
                            <div className="flex flex-col gap-2">
                              {dailySummary.chatPrompts.map((p, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => askAi(p.prompt)}
                                  className="justify-start text-left h-auto py-2 px-3 border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-xs whitespace-normal"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-cyan-400" />
                                  {p.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right column: Discipline Rating gauge + Anti-FOMO "Disciplined Dollars" */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col items-center">
                          <div className="relative w-36 h-36">
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `conic-gradient(${disciplineColor} ${
                                  dailySummary.discipline.score * 3.6
                                }deg, rgb(30 41 59) 0deg)`,
                              }}
                            />
                            <div className="absolute inset-[6px] rounded-full bg-slate-950 flex flex-col items-center justify-center">
                              <ShieldCheck className={`h-4 w-4 mb-1 ${disciplineTextColor}`} />
                              <span className="text-3xl font-black text-white">
                                {dailySummary.discipline.score}%
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                                Discipline
                              </span>
                            </div>
                          </div>
                          <p className={`text-xs font-semibold mt-3 ${disciplineTextColor}`}>
                            {dailySummary.discipline.label}
                          </p>
                          <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">
                            {dailySummary.discipline.text}
                          </p>
                        </div>

                        <AnimatePresence>
                          {dailySummary.disciplinedDollars && (
                            <motion.div
                              key="disciplined-dollars"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
                            >
                              <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                                <Leaf className="h-3.5 w-3.5" /> Ušetřeno disciplínou: $
                                {dailySummary.disciplinedDollars.amount.toLocaleString('en-US')}
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {dailySummary.disciplinedDollars.text}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {dailySummary.tip && (
                    <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                      <span>{dailySummary.tip}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Equity curve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-cyan-400" />
                      Equity Curve
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        overallStats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {fmtMoney(overallStats.totalPnL)} all-time
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {equityData.length > 0 ? (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityData}>
                          <defs>
                            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #1e293b',
                              borderRadius: '8px',
                              color: '#fff',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            fill="url(#equityFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
                      No trades yet — connect your MetaTrader account to see your equity curve
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400">Win Rate</p>
                      <p className="text-lg font-bold text-white">
                        {overallStats.totalTrades > 0 ? `${overallStats.winRate.toFixed(0)}%` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Profit Factor</p>
                      <p className="text-lg font-bold text-white">
                        {overallStats.profitFactor === Infinity
                          ? '∞'
                          : overallStats.profitFactor?.toFixed(2) || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total Trades</p>
                      <p className="text-lg font-bold text-white">{overallStats.totalTrades}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Today's trades */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-cyan-400" />
                      Today's Trades
                    </span>
                    <Link href="/record-trades">
                      <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300">
                        View all <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysTrades.length > 0 ? (
                    <div className="space-y-2">
                      {todaysTrades.map((trade: any, i: number) => (
                        <div
                          key={trade.id || i}
                          className="flex justify-between items-center p-3 rounded-lg bg-slate-800/40 border border-slate-700/40"
                        >
                          <div className="flex items-center gap-3">
                            {trade.pnl >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                {trade.pair} <span className="text-slate-500">· {trade.direction}</span>
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(trade.date).toLocaleTimeString('cs-CZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-bold ${
                              trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {fmtMoney(trade.pnl || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No trades recorded today yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3">
            {dailyHistory.length > 0 ? (
              dailyHistory.map((day, i) => (
                <motion.div
                  key={day.date.toDateString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.5) }}
                >
                  <Card className="border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-400">
                            {day.date.toLocaleDateString('cs-CZ', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {day.count} {day.count === 1 ? 'trade' : 'trades'} ·{' '}
                            {Math.round((day.wins / day.count) * 100)}% win rate
                          </p>
                        </div>
                        <p
                          className={`text-xl font-bold ${
                            day.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {fmtMoney(day.pnl)}
                        </p>
                      </div>
                      {(() => {
                        const dateStr = day.date.toISOString().split('T')[0]
                        const saved = (journalEntries || []).find(
                          (e: any) => e.id === `daily-summary-${dateStr}`
                        )
                        return saved?.content ? (
                          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/60">
                            {saved.content}
                          </p>
                        ) : null
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="border border-slate-800 bg-slate-900">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No history yet — your trading days will show up here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
