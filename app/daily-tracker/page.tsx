'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
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
import { useGamification } from '@/contexts/gamification-context'

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function fmtMoney(n: number) {
  const sign = n > 0 ? '+' : ''
  return `${sign}$${n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`
}

export default function DailyTrackerPage() {
  const { getAllTrades, isLiveMode, getTradingStats } = useData()
  const { data: gamification, getLevelInfo } = useGamification()
  const [tab, setTab] = useState('today')

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

  // Emotional AI read — auto-derived from today's MetaTrader trades, no manual input
  const emotionalRead = useMemo(() => {
    if (todaysTrades.length === 0) {
      return {
        tilt: 0,
        label: 'Čekání na data',
        message:
          'Dnes ještě nemáš žádné obchody — jakmile MetaTrader zaznamená první obchod, AI automaticky vyhodnotí tvůj emoční stav.',
        tip: null as string | null,
        tone: 'neutral' as const,
      }
    }

    const sorted = [...todaysTrades].sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    let revengeCount = 0
    let maxLossStreak = 0
    let lossStreak = 0
    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i]
      if (t.pnl < 0) {
        lossStreak++
        maxLossStreak = Math.max(maxLossStreak, lossStreak)
        const prev = sorted[i - 1]
        if (prev && prev.pnl < 0) {
          const gapMin = (new Date(t.date).getTime() - new Date(prev.date).getTime()) / 60000
          if (gapMin >= 0 && gapMin < 20 && Math.abs(t.pnl) >= Math.abs(prev.pnl)) {
            revengeCount++
          }
        }
      } else {
        lossStreak = 0
      }
    }

    const count = sorted.length
    const wins = sorted.filter((t: any) => t.pnl > 0).length
    const winRate = count > 0 ? wins / count : 0

    let tilt = 0
    tilt += revengeCount * 30
    tilt += maxLossStreak >= 3 ? 25 : maxLossStreak === 2 ? 10 : 0
    tilt += count > 6 ? 20 : count > 4 ? 10 : 0
    tilt -= count > 0 && count <= 3 && winRate >= 0.5 ? 10 : 0
    tilt = Math.max(0, Math.min(100, tilt))

    let label: string
    let message: string
    let tip: string
    let tone: 'good' | 'warn' | 'bad' | 'neutral'

    if (tilt >= 50) {
      label = 'Emoční riziko'
      tone = 'bad'
      message = `Vzorec dnešních obchodů (${revengeCount > 0 ? `${revengeCount}× rychlý re-entry po ztrátě, ` : ''}${
        maxLossStreak >= 2 ? `série ${maxLossStreak} ztrát po sobě, ` : ''
      }${count} obchodů celkem) odpovídá emočnímu přetížení, ne plánu.`
      tip = 'Zastav obchodování na zbytek dne. Zítra začni s poloviční velikostí pozice.'
    } else if (revengeCount > 0 || maxLossStreak >= 2) {
      label = 'Lehké napětí'
      tone = 'warn'
      message =
        'Po ztrátě následoval rychlý další vstup — typický raný signál frustrace, i když to dnes nepřerostlo do plného emočního výkyvu.'
      tip = 'Po každé ztrátě si dej alespoň 5 minut pauzu před dalším obchodem.'
    } else if (count > 0 && count <= 3 && winRate >= 0.5) {
      label = 'Klid a disciplína'
      tone = 'good'
      message = `${count} dobře vybraných obchodů bez známek emočního přetížení — tohle je vzorec, který chceš opakovat.`
      tip = 'Udrž stejnou selektivitu i zítra.'
    } else {
      label = 'Neutrální'
      tone = 'neutral'
      message = 'Dnešní obchody nevykazují výrazné emoční vzorce — žádný emoční výkyv, ale ani jasná disciplína navíc.'
      tip = 'Zapiš si krátkou poznámku, jak ses během obchodování cítil — pomůže to budoucí AI analýze.'
    }

    return { tilt, label, message, tip, tone }
  }, [todaysTrades])

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
                  emotionalRead.tone === 'bad'
                    ? 'border-red-500/30'
                    : emotionalRead.tone === 'warn'
                      ? 'border-amber-500/30'
                      : emotionalRead.tone === 'good'
                        ? 'border-emerald-500/30'
                        : 'border-slate-800'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-2">
                      <Brain
                        className={`h-5 w-5 ${
                          emotionalRead.tone === 'bad'
                            ? 'text-red-400'
                            : emotionalRead.tone === 'warn'
                              ? 'text-amber-400'
                              : emotionalRead.tone === 'good'
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                        }`}
                      />
                      AI Emoční stav dne
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        emotionalRead.tone === 'bad'
                          ? 'bg-red-500/10 text-red-300'
                          : emotionalRead.tone === 'warn'
                            ? 'bg-amber-500/10 text-amber-300'
                            : emotionalRead.tone === 'good'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-slate-500/10 text-slate-300'
                      }`}
                    >
                      {emotionalRead.label}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">{emotionalRead.message}</p>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Emoční skóre</span>
                      <span>{emotionalRead.tilt}/100</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          emotionalRead.tilt >= 50
                            ? 'bg-red-500'
                            : emotionalRead.tilt >= 20
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${emotionalRead.tilt}%` }}
                      />
                    </div>
                  </div>

                  {emotionalRead.tip && (
                    <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                      <span>{emotionalRead.tip}</span>
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
