"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Percent,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useAuth } from "@/contexts/auth-context"
import { getDemoTrades, calculateDemoStats, type DemoTrade } from "@/lib/demo/demo-trades"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export default function ObchodStatistikyPage() {
  const { isLiveMode } = useLiveMode()
  const { user } = useAuth()
  const [trades, setTrades] = useState<DemoTrade[]>([])

  useEffect(() => {
    if (!isLiveMode && user) {
      const demoTrades = getDemoTrades(user.id)
      setTrades(demoTrades)
    }
  }, [isLiveMode, user])

  const stats = useMemo(() => {
    return calculateDemoStats(trades)
  }, [trades])

  // Cumulative P&L data for equity curve
  const equityCurve = useMemo(() => {
    let cumulative = 0
    return trades
      .slice()
      .reverse()
      .map((trade, index) => {
        cumulative += trade.pnl
        return {
          index: index + 1,
          pnl: cumulative,
          date: new Date(trade.created_at).toLocaleDateString("cs-CZ", { month: "short", day: "numeric" }),
        }
      })
  }, [trades])

  // Breakdown by pair
  const pairData = useMemo(() => {
    return Object.entries(stats.tradesByPair)
      .map(([pair, count]) => ({
        pair,
        count,
        pnl: trades.filter((t) => t.pair === pair).reduce((sum, t) => sum + t.pnl, 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [stats.tradesByPair, trades])

  // Breakdown by setup
  const setupData = useMemo(() => {
    return Object.entries(stats.tradesBySetup)
      .map(([setup, count]) => ({
        setup,
        count,
        pnl: trades.filter((t) => t.setup === setup).reduce((sum, t) => sum + t.pnl, 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [stats.tradesBySetup, trades])

  // Win/Loss distribution
  const distributionData = [
    { name: "Výhry", value: stats.winningTrades, fill: "#10b981" },
    { name: "Ztráty", value: stats.losingTrades, fill: "#ef4444" },
    { name: "Breakeven", value: stats.breakevenTrades, fill: "#64748b" },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Statistiky</h1>
          <p className="text-slate-400 mt-1">Kompletní analýza vašich obchodů</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Celkem obchodů</div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalTrades}</div>
            <div className="text-xs text-slate-400 mt-1">
              {stats.winningTrades}W / {stats.losingTrades}L / {stats.breakevenTrades}BE
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Win Rate</div>
              <Percent className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{stats.winRate.toFixed(1)}%</div>
            <Progress value={stats.winRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card
          className={cn(
            "backdrop-blur border",
            stats.totalPnL > 0
              ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30"
              : "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/30",
          )}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Celkový P&L</div>
              <DollarSign className={cn("w-5 h-5", stats.totalPnL > 0 ? "text-emerald-400" : "text-red-400")} />
            </div>
            <div
              className={cn("text-3xl font-bold", stats.totalPnL > 0 ? "text-emerald-400" : "text-red-400")}
            >
              {stats.totalPnL > 0 ? "+" : ""}${stats.totalPnL}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Avg: ${((stats.totalPnL / stats.totalTrades) || 0).toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Profit Factor</div>
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.profitFactor.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">Avg RR: {stats.avgRR.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Průměrná výhra</div>
            <div className="text-2xl font-bold text-emerald-400">${stats.avgWin.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Průměrná ztráta</div>
            <div className="text-2xl font-bold text-red-400">${stats.avgLoss.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Nejlepší den</div>
            <div className="text-2xl font-bold text-emerald-400">+${stats.bestDay.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-1">Nejhorší den</div>
            <div className="text-2xl font-bold text-red-400">${stats.worstDay.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Aktuální série</div>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    stats.currentStreak > 0 ? "text-emerald-400" : stats.currentStreak < 0 ? "text-red-400" : "text-slate-400",
                  )}
                >
                  {stats.currentStreak > 0 ? "+" : ""}
                  {stats.currentStreak}
                </div>
              </div>
              <Zap className={cn("w-8 h-8", stats.currentStreak > 0 ? "text-emerald-400" : "text-red-400")} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Nejdelší výherní série</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.longestWinStreak}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Nejdelší prohrávající série</div>
                <div className="text-2xl font-bold text-red-400">{stats.longestLossStreak}</div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Equity křivka</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                  formatter={(value: any) => [`$${value}`, "P&L"]}
                />
                <Line type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Rozložení výsledků</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Pair and Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Výkon podle páru</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pairData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="pair" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                />
                <Bar dataKey="count" fill="#8b5cf6" name="Počet obchodů" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Výkon podle setupu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={setupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="setup" stroke="#64748b" fontSize={10} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                />
                <Bar dataKey="count" fill="#10b981" name="Počet obchodů" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
