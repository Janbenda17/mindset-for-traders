"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Target, Brain, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { getJournalEntries } from "@/utils/storage-utils"
import { PerformanceChart } from "@/components/performance-chart"
import { MoodTrendsChart } from "@/components/mood-trends-chart"
import { TradingPatternsChart } from "@/components/trading-patterns-chart"
import { RiskAnalysisChart } from "@/components/risk-analysis-chart"
import { EmotionalAnalysis } from "@/components/emotional-analysis"

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState("all")
  const [selectedMetric, setSelectedMetric] = useState("performance")

  useEffect(() => {
    const journalEntries = getJournalEntries()
    setEntries(journalEntries)
  }, [])

  // Filter entries based on timeframe
  const filteredEntries = entries.filter((entry) => {
    if (timeframe === "all") return true

    const entryDate = new Date(entry.date)
    const now = new Date()

    switch (timeframe) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return entryDate >= weekAgo
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return entryDate >= monthAgo
      case "quarter":
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        return entryDate >= quarterAgo
      default:
        return true
    }
  })

  const tradeEntries = filteredEntries.filter((entry) => entry.type === "trade" && entry.profitLoss !== undefined)
  const behaviorEntries = filteredEntries.filter((entry) => entry.type === "behavior")
  const journalOnlyEntries = filteredEntries.filter((entry) => entry.type === "journal")

  // Calculate key metrics
  const totalTrades = tradeEntries.length
  const totalPnL = tradeEntries.reduce((sum, entry) => sum + (entry.profitLoss || 0), 0)
  const winningTrades = tradeEntries.filter((entry) => entry.profitLoss > 0).length
  const losingTrades = tradeEntries.filter((entry) => entry.profitLoss < 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  const averageWin =
    winningTrades > 0
      ? tradeEntries.filter((e) => e.profitLoss > 0).reduce((sum, e) => sum + e.profitLoss, 0) / winningTrades
      : 0
  const averageLoss =
    losingTrades > 0
      ? Math.abs(tradeEntries.filter((e) => e.profitLoss < 0).reduce((sum, e) => sum + e.profitLoss, 0) / losingTrades)
      : 0
  const profitFactor = averageLoss > 0 ? (averageWin * winningTrades) / (averageLoss * losingTrades) : 0
  const largestWin = tradeEntries.length > 0 ? Math.max(...tradeEntries.map((e) => e.profitLoss || 0)) : 0
  const largestLoss = tradeEntries.length > 0 ? Math.min(...tradeEntries.map((e) => e.profitLoss || 0)) : 0

  // Emotional metrics
  const averageMood =
    filteredEntries.length > 0
      ? filteredEntries.reduce((sum, entry) => sum + (entry.mood || 5), 0) / filteredEntries.length
      : 0
  const averageConfidence =
    tradeEntries.length > 0
      ? tradeEntries.reduce((sum, entry) => sum + (entry.confidenceLevel || 5), 0) / tradeEntries.length
      : 0
  const averageStress =
    tradeEntries.length > 0
      ? tradeEntries.reduce((sum, entry) => sum + (entry.stressLevel || 5), 0) / tradeEntries.length
      : 0

  // Trading pairs analysis
  const pairStats = tradeEntries.reduce(
    (acc, entry) => {
      const pair = entry.pair || "Unknown"
      if (!acc[pair]) {
        acc[pair] = { trades: 0, pnl: 0, wins: 0 }
      }
      acc[pair].trades++
      acc[pair].pnl += entry.profitLoss || 0
      if (entry.profitLoss > 0) acc[pair].wins++
      return acc
    },
    {} as Record<string, { trades: number; pnl: number; wins: number }>,
  )

  const topPairs = Object.entries(pairStats)
    .sort(([, a], [, b]) => b.pnl - a.pnl)
    .slice(0, 5)

  // Behavioral analysis
  const behaviorStats = {
    planFollowed: behaviorEntries.filter((e) => e.matchedPlan === true).length,
    exitedEarly: behaviorEntries.filter((e) => e.exitedEarly === true).length,
    missedOpportunities: behaviorEntries.filter((e) => e.missedDueToHesitation === true).length,
    revengeTrades: behaviorEntries.filter((e) => e.revengeTrade === true).length,
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Analytika</h1>
          <p className="text-gray-600 mt-2">Detailní analýza vašeho tradingu a pokroku</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vše</SelectItem>
              <SelectItem value="week">Tento týden</SelectItem>
              <SelectItem value="month">Tento měsíc</SelectItem>
              <SelectItem value="quarter">Čtvrtletí</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkový P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnL >= 0 ? "+" : ""}
              {totalPnL.toFixed(2)} USD
            </div>
            <p className="text-xs text-muted-foreground">{totalTrades} obchodů celkem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {winningTrades}W / {losingTrades}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitFactor >= 1 ? "text-green-600" : "text-red-600"}`}>
              {profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Win: {averageWin.toFixed(0)} USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná nálada</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{averageMood.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Sebedůvěra: {averageConfidence.toFixed(1)}/10</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Výkonnost</TabsTrigger>
          <TabsTrigger value="emotions">Emoce</TabsTrigger>
          <TabsTrigger value="patterns">Vzorce</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="behavior">Chování</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Výkonnost v čase</CardTitle>
                <CardDescription>Kumulativní P&L a počet obchodů</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={tradeEntries} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nejlepší měnové páry</CardTitle>
                <CardDescription>Podle celkového zisku</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPairs.map(([pair, stats]) => (
                    <div key={pair} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{pair}</Badge>
                        <span className="text-sm text-muted-foreground">{stats.trades} obchodů</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {((stats.wins / stats.trades) * 100).toFixed(0)}% WR
                        </span>
                        <span className={`font-bold ${stats.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {stats.pnl >= 0 ? "+" : ""}
                          {stats.pnl.toFixed(0)} USD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Rozložení zisků/ztrát</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Největší zisk</span>
                    <span className="font-bold text-green-600">+{largestWin.toFixed(0)} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Největší ztráta</span>
                    <span className="font-bold text-red-600">{largestLoss.toFixed(0)} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Průměrný zisk</span>
                    <span className="font-bold text-green-600">+{averageWin.toFixed(0)} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Průměrná ztráta</span>
                    <span className="font-bold text-red-600">-{averageLoss.toFixed(0)} USD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Úspěšnost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Vítězné obchody</span>
                      <span className="text-sm font-medium">
                        {winningTrades}/{totalTrades}
                      </span>
                    </div>
                    <Progress value={winRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{winningTrades}</div>
                      <div className="text-xs text-muted-foreground">Zisky</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{losingTrades}</div>
                      <div className="text-xs text-muted-foreground">Ztráty</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Klíčové metriky</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Profit Factor</span>
                    <Badge variant={profitFactor >= 1.5 ? "default" : profitFactor >= 1 ? "secondary" : "destructive"}>
                      {profitFactor.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Risk/Reward</span>
                    <Badge variant="outline">1:{averageLoss > 0 ? (averageWin / averageLoss).toFixed(1) : "0"}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Celkem obchodů</span>
                    <span className="font-medium">{totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Aktivních dnů</span>
                    <span className="font-medium">{new Set(tradeEntries.map((e) => e.date)).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trend nálady</CardTitle>
                <CardDescription>Vývoj nálady v čase</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodTrendsChart data={filteredEntries} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emocionální analýza</CardTitle>
                <CardDescription>Korelace emocí s výkonností</CardDescription>
              </CardHeader>
              <CardContent>
                <EmotionalAnalysis data={tradeEntries} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Průměrné hodnoty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Nálada</span>
                      <span className="font-medium">{averageMood.toFixed(1)}/10</span>
                    </div>
                    <Progress value={averageMood * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Sebedůvěra</span>
                      <span className="font-medium">{averageConfidence.toFixed(1)}/10</span>
                    </div>
                    <Progress value={averageConfidence * 10} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Stres</span>
                      <span className="font-medium">{averageStress.toFixed(1)}/10</span>
                    </div>
                    <Progress value={averageStress * 10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nejčastější emoce</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["emotionBefore", "emotionDuring", "emotionAfter"].map((field) => {
                    const emotions = tradeEntries
                      .map((e) => e[field])
                      .filter(Boolean)
                      .reduce(
                        (acc, emotion) => {
                          acc[emotion] = (acc[emotion] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      )

                    const topEmotion = Object.entries(emotions).sort(([, a], [, b]) => b - a)[0]

                    return topEmotion ? (
                      <div key={field} className="flex justify-between">
                        <span className="text-sm capitalize">
                          {field === "emotionBefore" ? "Před" : field === "emotionDuring" ? "Během" : "Po"}:
                        </span>
                        <Badge variant="outline">{topEmotion[0]}</Badge>
                      </div>
                    ) : null
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emocionální doporučení</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {averageStress > 7 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Vysoký stres</div>
                        <div className="text-muted-foreground">Zvažte relaxační techniky</div>
                      </div>
                    </div>
                  )}
                  {averageConfidence < 5 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Nízká sebedůvěra</div>
                        <div className="text-muted-foreground">Pracujte na strategii</div>
                      </div>
                    </div>
                  )}
                  {winRate > 60 && averageMood > 7 && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium">Výborná forma</div>
                        <div className="text-muted-foreground">Pokračujte v trendu</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Obchodní vzorce</CardTitle>
              <CardDescription>Analýza vašich obchodních návyků</CardDescription>
            </CardHeader>
            <CardContent>
              <TradingPatternsChart data={tradeEntries} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>Analýza řízení rizika</CardDescription>
            </CardHeader>
            <CardContent>
              <RiskAnalysisChart data={tradeEntries} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Obchodní disciplína</CardTitle>
                <CardDescription>Analýza dodržování plánu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dodržení plánu</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{behaviorStats.planFollowed}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Předčasné výstupy</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{behaviorStats.exitedEarly}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Zmeškaná váháním</span>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{behaviorStats.missedOpportunities}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenge trades</span>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{behaviorStats.revengeTrades}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doporučení pro zlepšení</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behaviorStats.revengeTrades > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-800">Revenge Trading</div>
                      <div className="text-sm text-red-600">
                        Zaznamenali jste {behaviorStats.revengeTrades} revenge trades. Pracujte na emocionální kontrole.
                      </div>
                    </div>
                  )}
                  {behaviorStats.exitedEarly > behaviorStats.planFollowed && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-medium text-orange-800">Předčasné výstupy</div>
                      <div className="text-sm text-orange-600">
                        Často vystupujete předčasně. Zvažte pevnější pravidla pro exit.
                      </div>
                    </div>
                  )}
                  {behaviorStats.planFollowed > behaviorStats.exitedEarly + behaviorStats.revengeTrades && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800">Výborná disciplína</div>
                      <div className="text-sm text-green-600">
                        Dobře dodržujete svůj plán. Pokračujte v tomto trendu!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
