'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Flame,
  Trophy,
  Activity,
  Lock,
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
import { useDailyStage } from '@/contexts/daily-stage-context'
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
  const { stages, getProgress } = useDailyStage()
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

  const progress = getProgress ? getProgress() : 0
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

            {/* Daily flow / stages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-cyan-400" />
                      Today's Routine
                    </CardTitle>
                    <span className="text-sm text-slate-400">{Math.round(progress)}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {stages.map((stage) => (
                      <Link
                        key={stage.id}
                        href={stage.unlocked ? stage.href : '#'}
                        className={stage.unlocked ? '' : 'cursor-not-allowed'}
                        onClick={(e) => {
                          if (!stage.unlocked) e.preventDefault()
                        }}
                      >
                        <motion.div
                          whileHover={stage.unlocked ? { y: -4 } : {}}
                          className={`p-4 rounded-xl h-full transition-all border-2 ${
                            stage.completed
                              ? 'bg-emerald-500/10 border-emerald-500/50'
                              : stage.unlocked
                                ? 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 cursor-pointer'
                                : 'bg-slate-900/30 border-slate-800/50 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl">{stage.icon}</span>
                            {stage.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : stage.unlocked ? (
                              <Circle className="h-4 w-4 text-slate-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-slate-600" />
                            )}
                          </div>
                          <h3 className="font-semibold text-white text-sm leading-tight">
                            {stage.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {stage.completed ? 'Completed' : stage.unlocked ? 'Pending' : 'Locked'}
                          </p>
                        </motion.div>
                      </Link>
                    ))}
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
