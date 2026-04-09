"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Target, Rocket, Trophy, BarChart3 } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

const generateTradingData = () => {
  let balance = 10000
  let streak = 0
  let lastWasWin = true

  return Array.from({ length: 4 }, (_, i) => {
    const change = (Math.random() - 0.45) * 500
    balance += change
    const isWin = change > 0

    if (isWin === lastWasWin) {
      streak++
    } else {
      streak = 1
      lastWasWin = isWin
    }

    return {
      date: format(subDays(new Date(), 3 - i), "d.M."),
      balance: Math.round(balance),
      dailyPnl: Math.round(change),
      isWin,
      streak: isWin ? streak : -streak,
    }
  })
}

const EmptyStateView = () => {
  const totalTradesNeeded = 100
  const currentTrades = 0 // This will be from real data later
  const tradesRemaining = totalTradesNeeded - currentTrades
  const progressPercent = (currentTrades / totalTradesNeeded) * 100

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
              <Rocket className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">Start your trading journey!</h2>
              <p className="text-lg text-muted-foreground">
                Your analytics are waiting for the first data. Every trade brings you closer to better understanding yourself.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-8 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-amber-500" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Remaining to enter</p>
                  <p className="text-4xl font-black text-emerald-600">{tradesRemaining} trades</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to full analytics</span>
                  <span className="font-semibold text-emerald-600">
                    {currentTrades}/{totalTradesNeeded}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Po dosažení 100 obchodů se odemknou pokročilé psychologické vzorce a prediktivní nástroje.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/40 dark:bg-black/10 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                <BarChart3 className="w-6 h-6 text-emerald-600 mb-2 mx-auto" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Risk/Reward analýza</p>
                <p className="text-xs text-muted-foreground mt-1">Objevte své nejlepší setupy</p>
              </div>

              <div className="bg-white/40 dark:bg-black/10 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                <Target className="w-6 h-6 text-emerald-600 mb-2 mx-auto" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Detekce vzorců</p>
                <p className="text-xs text-muted-foreground mt-1">AI identifikuje vaše chyby</p>
              </div>

              <div className="bg-white/40 dark:bg-black/10 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                <TrendingUp className="w-6 h-6 text-emerald-600 mb-2 mx-auto" />
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Predikce výkonu</p>
                <p className="text-xs text-muted-foreground mt-1">Předpověď trading výsledků</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader>
          <CardTitle className="text-center text-muted-foreground">Jak začít?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto text-xl font-bold text-blue-600">
                1
              </div>
              <p className="text-sm font-semibold">Vyplňte Daily Assessment</p>
              <p className="text-xs text-muted-foreground">Zaznamenejte mentální stav před tradingem</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto text-xl font-bold text-purple-600">
                2
              </div>
              <p className="text-sm font-semibold">Přidejte své obchody</p>
              <p className="text-xs text-muted-foreground">Zapište výsledky a emoce během tradingu</p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto text-xl font-bold text-emerald-600">
                3
              </div>
              <p className="text-sm font-semibold">Sledujte svůj pokrok</p>
              <p className="text-xs text-muted-foreground">AI analyzuje vaše data a poskytuje rady</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MindTraderHistory() {
  const [timeframe, setTimeframe] = useState("month")

  const hasData = false // This will be replaced with actual data check later

  if (!hasData) {
    return <EmptyStateView />
  }

  const tradingData = generateTradingData()

  const setupAnalysis = [
    { setup: "Breakout", risk: 80, reward: 240, count: 24, winRate: 68, rr: 3.0 },
    { setup: "Pullback", risk: 100, reward: 180, count: 18, winRate: 55, rr: 1.8 },
    { setup: "Reversal", risk: 120, reward: 360, count: 12, winRate: 45, rr: 3.0 },
    { setup: "Momentum", risk: 70, reward: 190, count: 31, winRate: 72, rr: 2.7 },
  ]

  const marketConditions = [
    { condition: "Trending Up", trades: 45, winRate: 78, avgProfit: 285 },
    { condition: "Ranging", trades: 32, winRate: 52, avgProfit: 85 },
    { condition: "Volatile", trades: 28, winRate: 43, avgProfit: -45 },
    { condition: "Trending Down", trades: 19, winRate: 61, avgProfit: 180 },
  ]

  const timePerformance = [
    { time: "8-10h", quality: 92, avgPnl: 320, trades: 42 },
    { time: "10-12h", quality: 78, avgPnl: 210, trades: 38 },
    { time: "12-14h", quality: 45, avgPnl: -50, trades: 25 },
    { time: "14-16h", quality: 65, avgPnl: 140, trades: 31 },
    { time: "16-18h", quality: 52, avgPnl: 80, trades: 18 },
  ]

  const totalPnl = tradingData[tradingData.length - 1].balance - 10000
  const winningDays = tradingData.filter((d) => d.dailyPnl > 0).length
  const bestTrade = Math.max(...tradingData.map((d) => d.dailyPnl))
  const worstTrade = Math.min(...tradingData.map((d) => d.dailyPnl))
  const maxDrawdown = Math.min(...tradingData.map((d) => d.dailyPnl))

  const longestWinStreak = Math.max(...tradingData.filter((d) => d.streak > 0).map((d) => d.streak), 0)
  const longestLossStreak = Math.abs(Math.min(...tradingData.filter((d) => d.streak < 0).map((d) => d.streak), 0))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            Trading Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground">Kompletní přehled vašeho trading výkonu a vzorců.</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Období" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Tento týden</SelectItem>
            <SelectItem value="month">Tento měsíc</SelectItem>
            <SelectItem value="quarter">Kvartál</SelectItem>
            <SelectItem value="year">Tento rok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnl > 0 ? "text-emerald-600" : "text-red-600"}`}>
              ${totalPnl > 0 ? "+" : ""}
              {totalPnl}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Za období</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Winning Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {winningDays}/{tradingData.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((winningDays / tradingData.length) * 100)}% win rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">+${bestTrade}</div>
            <p className="text-xs text-muted-foreground mt-1">Single day max</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{longestWinStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">Longest winning</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${maxDrawdown}</div>
            <p className="text-xs text-muted-foreground mt-1">Worst single day</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Balance Progression & Daily Performance</CardTitle>
          <CardDescription>Celková equity curve s denními P&L výsledky.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tradingData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(value: number, name: string) => {
                  if (name === "Balance") return [`$${value}`, "Celková Balance"]
                  if (name === "Daily P&L") return [`$${value > 0 ? "+" : ""}${value}`, "Denní P&L"]
                  return [value, name]
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#balanceGradient)"
              />
              <Bar yAxisId="right" dataKey="dailyPnl" name="Daily P&L" radius={[4, 4, 0, 0]}>
                {tradingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.dailyPnl > 0 ? "#10b981" : "#ef4444"} />
                ))}
              </Bar>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk/Reward Pattern Analysis</CardTitle>
            <CardDescription>Přehledná vizualizace efektivity vašich setupů.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  type="number"
                  dataKey="risk"
                  name="Risk"
                  unit="$"
                  label={{ value: "Avg Risk ($)", position: "bottom", offset: 0 }}
                />
                <YAxis
                  type="number"
                  dataKey="reward"
                  name="Reward"
                  unit="$"
                  label={{ value: "Avg Reward ($)", angle: -90, position: "left" }}
                />
                <ZAxis type="number" dataKey="winRate" range={[100, 500]} name="Win Rate" unit="%" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ borderRadius: "8px" }} />
                <Legend />
                <Scatter name="Setups (Size = Win Rate)" data={setupAnalysis} fill="#8884d8">
                  {setupAnalysis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rr > 2 ? "#10b981" : entry.rr > 1.5 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>R:R {">"} 2.0
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>R:R 1.5 - 2.0
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>R:R {"<"} 1.5
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance podle denní doby</CardTitle>
            <CardDescription>Kdy tradujete nejlépe? Data ukazují jasně.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timePerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: number, name: string) => {
                    if (name === "Quality Score") return [`${value}%`, "Kvalita"]
                    if (name === "Avg P&L") return [`$${value}`, "Průměr P&L"]
                    return [value, name]
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="quality" name="Quality Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgPnl" name="Avg P&L" radius={[4, 4, 0, 0]}>
                  {timePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgPnl > 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance v různých tržních podmínkách</CardTitle>
          <CardDescription>Zjistěte, v jakém marketu tradujete nejlépe a kde máte rezervy.</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={marketConditions}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="condition" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(value: number, name: string) => {
                  if (name === "Win Rate") return [`${value}%`, "Win Rate"]
                  if (name === "Avg Profit") return [`$${value}`, "Průměrný Profit"]
                  return [value, name]
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="winRate"
                name="Win Rate"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 6, fill: "#8b5cf6" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgProfit"
                name="Avg Profit"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 6, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
