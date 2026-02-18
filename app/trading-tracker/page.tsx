"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Filter, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface Trade {
  id: string
  date: string
  pair: string
  direction: "LONG" | "SHORT"
  openTime: string
  closeTime: string
  session: string
  tradeType: string
  pips: number
  positionSize: number
  pnl: number
  confidenceBefore: number
  stressLevel: number
  mood: number
  emotionBefore: string
  emotionDuring: string
  emotionAfter: string
  entryReason: string
  exitReason: string
  followedPlan: boolean
  tags: string[]
}

// Demo data - všechny obchody z posledních 30 dní + random obchody od 1.2 do 1.4
const generateDemoTrades = (): Trade[] => {
  const trades: Trade[] = []
  const pairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "NZDUSD", "USDCAD"]
  const sessions = ["Asian", "London", "New York", "Overlap"]
  const tradeTypes = ["Scalp", "Day Trade", "Swing"]
  const emotions = [
    ["Klidný", "Sebevědomý", "Nervózní", "Nejistý", "Nadšený", "Unavený"],
    ["Klidný", "Stresovaný", "Sebevědomý", "Panický", "Soustředěný"],
    ["Spokojený", "Frustrovaný", "Hrdý", "Zklamaný", "Poučený"],
  ]
  const reasons = [
    "Breakout ze support/resistance",
    "Moving average crossover",
    "Support/resistance bounce",
    "Trend continuation",
    "RSI divergence",
    "Supply/demand zone",
  ]

  const baseDate = new Date()
  let tradeCount = 0

  // Generuj obchody od 1.2 do 1.4 (virtual mode)
  const startDate = new Date(2026, 1, 1) // 1.2.2026
  const endDate = new Date(2026, 1, 13)  // 1.4.2026 (13. března - 1.4 znamená 13. den čtvrtého měsíce? nebo 1.-4. února?)
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split("T")[0]
    const dayOfWeek = date.getDay()

    // Přeskočit víkendy
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // 3-6 obchodů za den ve virtual modu
    const tradesPerDay = Math.floor(Math.random() * 4) + 3
    for (let i = 0; i < tradesPerDay; i++) {
      const isWinningTrade = Math.random() > 0.35
      const pips = isWinningTrade ? Math.floor(Math.random() * 80) + 20 : -Math.floor(Math.random() * 60) - 10
      const pnl = isWinningTrade ? Math.floor(Math.random() * 400) + 100 : -Math.floor(Math.random() * 300) - 50
      const pair = pairs[Math.floor(Math.random() * pairs.length)]
      const direction = Math.random() > 0.5 ? "LONG" : "SHORT"

      tradeCount++
      trades.push({
        id: `virtual-trade-${tradeCount}`,
        date: dateStr,
        pair,
        direction,
        openTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        closeTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        session: sessions[Math.floor(Math.random() * sessions.length)],
        tradeType: tradeTypes[Math.floor(Math.random() * tradeTypes.length)],
        pips,
        positionSize: Math.floor(Math.random() * 5) + 1,
        pnl,
        confidenceBefore: Math.floor(Math.random() * 50) + 50,
        stressLevel: Math.floor(Math.random() * 40) + 20,
        mood: Math.floor(Math.random() * 40) + 50,
        emotionBefore: emotions[0][Math.floor(Math.random() * emotions[0].length)],
        emotionDuring: emotions[1][Math.floor(Math.random() * emotions[1].length)],
        emotionAfter: emotions[2][Math.floor(Math.random() * emotions[2].length)],
        entryReason: reasons[Math.floor(Math.random() * reasons.length)],
        exitReason: isWinningTrade ? "Take Profit" : "Stop Loss",
        followedPlan: Math.random() > 0.2,
        tags: [...(Math.random() > 0.5 ? ["scalp", "quick"] : ["swing", "patient"]), "virtual"],
      })
    }
  }

  // Přidej multiple obchody do "všech záznamů" (virtual mode - poslední 15 dní)
  for (let day = 0; day < 15; day++) {
    const allRecordsDate = new Date(baseDate)
    allRecordsDate.setDate(baseDate.getDate() - day)
    const allRecordsDateStr = allRecordsDate.toISOString().split("T")[0]
    const dayOfWeek = allRecordsDate.getDay()

    // Přeskočit víkendy
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // 2-4 obchody za den ve virtual modu
    const tradesPerDay = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < tradesPerDay; i++) {
      const isWinningTrade = Math.random() > 0.35
      const pips = isWinningTrade ? Math.floor(Math.random() * 80) + 20 : -Math.floor(Math.random() * 60) - 10
      const pnl = isWinningTrade ? Math.floor(Math.random() * 400) + 100 : -Math.floor(Math.random() * 300) - 50
      const pair = pairs[Math.floor(Math.random() * pairs.length)]
      const direction = Math.random() > 0.5 ? "LONG" : "SHORT"

      tradeCount++
      trades.push({
        id: `all-records-trade-${tradeCount}`,
        date: allRecordsDateStr,
        pair,
        direction,
        openTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        closeTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        session: sessions[Math.floor(Math.random() * sessions.length)],
        tradeType: tradeTypes[Math.floor(Math.random() * tradeTypes.length)],
        pips,
        positionSize: Math.floor(Math.random() * 5) + 1,
        pnl,
        confidenceBefore: Math.floor(Math.random() * 50) + 50,
        stressLevel: Math.floor(Math.random() * 40) + 20,
        mood: Math.floor(Math.random() * 40) + 50,
        emotionBefore: emotions[0][Math.floor(Math.random() * emotions[0].length)],
        emotionDuring: emotions[1][Math.floor(Math.random() * emotions[1].length)],
        emotionAfter: emotions[2][Math.floor(Math.random() * emotions[2].length)],
        entryReason: reasons[Math.floor(Math.random() * reasons.length)],
        exitReason: isWinningTrade ? "Take Profit" : "Stop Loss",
        followedPlan: Math.random() > 0.2,
        tags: ["all-records", "virtual"],
      })
    }
  }

  // Generuj obchody z posledních 30 dní
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(baseDate)
    currentDate.setDate(baseDate.getDate() - day)
    const dateStr = currentDate.toISOString().split("T")[0]
    const dayOfWeek = currentDate.getDay()

    // Přeskočit víkendy
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // 2-5 obchodů za den
    const tradesPerDay = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < tradesPerDay; i++) {
      const isWinningTrade = Math.random() > 0.35
      const pips = isWinningTrade ? Math.floor(Math.random() * 80) + 20 : -Math.floor(Math.random() * 60) - 10
      const pnl = isWinningTrade ? Math.floor(Math.random() * 400) + 100 : -Math.floor(Math.random() * 300) - 50
      const pair = pairs[Math.floor(Math.random() * pairs.length)]
      const direction = Math.random() > 0.5 ? "LONG" : "SHORT"

      tradeCount++
      trades.push({
        id: `trade-${tradeCount}`,
        date: dateStr,
        pair,
        direction,
        openTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        closeTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        session: sessions[Math.floor(Math.random() * sessions.length)],
        tradeType: tradeTypes[Math.floor(Math.random() * tradeTypes.length)],
        pips,
        positionSize: Math.floor(Math.random() * 5) + 1,
        pnl,
        confidenceBefore: Math.floor(Math.random() * 50) + 50,
        stressLevel: Math.floor(Math.random() * 40) + 20,
        mood: Math.floor(Math.random() * 40) + 50,
        emotionBefore: emotions[0][Math.floor(Math.random() * emotions[0].length)],
        emotionDuring: emotions[1][Math.floor(Math.random() * emotions[1].length)],
        emotionAfter: emotions[2][Math.floor(Math.random() * emotions[2].length)],
        entryReason: reasons[Math.floor(Math.random() * reasons.length)],
        exitReason: isWinningTrade ? "Take Profit" : "Stop Loss",
        followedPlan: Math.random() > 0.2,
        tags: Math.random() > 0.5 ? ["scalp", "quick"] : ["swing", "patient"],
      })
    }
  }

  return trades
}

export default function TradingTrackerPage() {
  const [trades] = useState<Trade[]>(generateDemoTrades())
  const [filterPair, setFilterPair] = useState<string>("all")
  const [filterDirection, setFilterDirection] = useState<string>("all")
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (filterPair !== "all" && trade.pair !== filterPair) return false
      if (filterDirection !== "all" && trade.direction !== filterDirection) return false
      return true
    })
  }, [trades, filterPair, filterDirection])

  const stats = useMemo(() => {
    const winningTrades = filteredTrades.filter((t) => t.pnl > 0)
    const losingTrades = filteredTrades.filter((t) => t.pnl < 0)
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0)
    const avgPnL = filteredTrades.length > 0 ? totalPnL / filteredTrades.length : 0
    const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0
    const averageConfidence =
      filteredTrades.length > 0 ? filteredTrades.reduce((sum, t) => sum + t.confidenceBefore, 0) / filteredTrades.length : 0

    return {
      totalTrades: filteredTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL,
      avgPnL,
      winRate,
      averageConfidence,
    }
  }, [filteredTrades])

  const uniquePairs = ["all", ...new Set(trades.map((t) => t.pair))]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Všechny obchody</h1>
        <p className="text-gray-400 mt-2">Kompletní přehled všech vašich obchodů</p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Celkem obchodů</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalTrades}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{stats.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Celkový P&L</p>
                <p className={`text-3xl font-bold mt-1 ${stats.totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  ${stats.totalPnL.toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Průměrná konfidence</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{stats.averageConfidence.toFixed(0)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtry */}
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Pár:</span>
            <div className="flex gap-2">
              {uniquePairs.map((pair) => (
                <Button
                  key={pair}
                  variant={filterPair === pair ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPair(pair)}
                  className={
                    filterPair === pair
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }
                >
                  {pair === "all" ? "Všechny" : pair}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Směr:</span>
            <div className="flex gap-2">
              {["all", "LONG", "SHORT"].map((dir) => (
                <Button
                  key={dir}
                  variant={filterDirection === dir ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterDirection(dir)}
                  className={
                    filterDirection === dir
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }
                >
                  {dir === "all" ? "Všechny" : dir}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seznam obchodů */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="bg-slate-800/50 border-purple-500/30">
          <TabsTrigger value="list">Seznam</TabsTrigger>
          <TabsTrigger value="statistics">Statistika</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3">
          {filteredTrades.length === 0 ? (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">Žádné obchody se nepohodují vašim filtrům</p>
              </CardContent>
            </Card>
          ) : (
            filteredTrades
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((trade) => (
                <Card
                  key={trade.id}
                  className="bg-slate-800/50 border-purple-500/20 cursor-pointer hover:border-purple-500/50 transition-all"
                  onClick={() =>
                    setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-white">
                            {trade.pair} <Badge className={trade.direction === "LONG" ? "bg-green-600/80" : "bg-red-600/80"}>{trade.direction}</Badge>
                          </p>
                          <p className="text-gray-400 text-sm">{trade.date} • {trade.tradeType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(0)} $
                        </p>
                        <p className="text-gray-400 text-sm">{trade.pips > 0 ? "+" : ""}{trade.pips} pips</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-slate-700 text-gray-200">
                        {trade.session}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-gray-200">
                        Konfidence: {trade.confidenceBefore}%
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-700 text-gray-200">
                        Mood: {trade.mood}
                      </Badge>
                      {!trade.followedPlan && (
                        <Badge variant="secondary" className="bg-orange-600/30 text-orange-300">
                          Nesledoval plán
                        </Badge>
                      )}
                    </div>

                    {expandedTradeId === trade.id && (
                      <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Čas otevření</p>
                            <p className="text-white font-medium">{trade.openTime}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Čas zavření</p>
                            <p className="text-white font-medium">{trade.closeTime}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Emoce - Před</p>
                            <p className="text-white font-medium">{trade.emotionBefore}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Emoce - Během</p>
                            <p className="text-white font-medium">{trade.emotionDuring}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Emoce - Po</p>
                            <p className="text-white font-medium">{trade.emotionAfter}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Důvod vstupu</p>
                            <p className="text-white">{trade.entryReason}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase">Důvod výstupu</p>
                            <p className="text-white">{trade.exitReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle>Statistika obchodů</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vítězné obchody:</span>
                  <span className="text-green-400 font-bold">{stats.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prohrané obchody:</span>
                  <span className="text-red-400 font-bold">{stats.losingTrades}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3 flex justify-between">
                  <span className="text-gray-400">Průměrný P&L:</span>
                  <span className={`font-bold ${stats.avgPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stats.avgPnL >= 0 ? "+" : ""}{stats.avgPnL.toFixed(0)} $
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle>Psychologické metriky</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Průměrná konfidence:</span>
                  <span className="text-blue-400 font-bold">{stats.averageConfidence.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plánované obchody:</span>
                  <span className="text-purple-400 font-bold">
                    {filteredTrades.filter((t) => t.followedPlan).length}/{filteredTrades.length}
                  </span>
                </div>
                <div className="border-t border-slate-700/50 pt-3 flex justify-between">
                  <span className="text-gray-400">% dodržení plánu:</span>
                  <span className="text-purple-400 font-bold">
                    {filteredTrades.length > 0 ? ((filteredTrades.filter((t) => t.followedPlan).length / filteredTrades.length) * 100).toFixed(1) : 0}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
