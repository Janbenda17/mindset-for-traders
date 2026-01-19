"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, History, BarChart3, Plus, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLiveMode } from "@/contexts/live-mode-context"
import { loadVirtualTrades, initVirtualTradingData } from "@/lib/demo/init-virtual-data"

export default function ObchodPage() {
  const router = useRouter()
  const { isLiveMode, userId } = useLiveMode()
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    bestDay: 0,
    worstDay: 0,
  })

  useEffect(() => {
    if (!isLiveMode && userId) {
      console.log("[v0] [Obchod] Loading VIRTUAL trades for userId:", userId)
      
      // VIRTUAL MODE - load demo trades
      let trades = loadVirtualTrades(userId)

      // If no trades found, initialize them now
      if (trades.length === 0) {
        console.log("[v0] [Obchod] No trades found - initializing now")
        const success = initVirtualTradingData(userId)
        if (success) {
          trades = loadVirtualTrades(userId)
          console.log(`[v0] [Obchod] ✓ Loaded ${trades.length} trades after initialization`)
        } else {
          console.error("[v0] [Obchod] FAILED to initialize trades")
        }
      }

      // Calculate stats
      const wins = trades.filter((t: any) => t.pnl > 0).length
      const totalPnL = trades.reduce((sum: number, t: any) => sum + t.pnl, 0)
      
      // Group by date to find best/worst days
      const dailyPnL: { [key: string]: number } = {}
      for (const trade of trades) {
        const date = trade.date
        dailyPnL[date] = (dailyPnL[date] || 0) + trade.pnl
      }
      
      const dailyValues = Object.values(dailyPnL)
      const bestDay = dailyValues.length > 0 ? Math.max(...dailyValues) : 0
      const worstDay = dailyValues.length > 0 ? Math.min(...dailyValues) : 0

      console.log(`[v0] [Obchod] Stats calculated: ${trades.length} trades, ${wins} wins, ${totalPnL.toFixed(2)} P&L`)

      setStats({
        totalTrades: trades.length,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
        totalPnL,
        bestDay,
        worstDay,
      })
    } else if (isLiveMode) {
      // LIVE MODE - load from Supabase
      setStats({
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        bestDay: 0,
        worstDay: 0,
      })
    }
  }, [isLiveMode, userId])

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Obchody</h1>
          <p className="text-muted-foreground">
            {isLiveMode ? "Tvoje živé obchody" : "Demo obchody - Virtual Mode"}
          </p>
        </div>
        <Button onClick={() => router.push("/record-trades")} className="gap-2">
          <Plus className="w-4 h-4" />
          Přidat Obchod
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Celkem Obchodů</CardDescription>
            <CardTitle className="text-2xl">{stats.totalTrades}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-2xl text-emerald-500">{stats.winRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Celkový P&L</CardDescription>
            <CardTitle className={`text-2xl ${stats.totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              ${stats.totalPnL >= 0 ? "+" : ""}
              {stats.totalPnL.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nejlepší Den</CardDescription>
            <CardTitle className="text-2xl text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-5 h-5" />
              ${stats.bestDay.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nejhorší Den</CardDescription>
            <CardTitle className="text-2xl text-red-500 flex items-center gap-1">
              <TrendingDown className="w-5 h-5" />
              ${stats.worstDay.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/obchod/kalendar">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <Calendar className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle>Kalendář</CardTitle>
              <CardDescription>Zobraz obchody v kalendáři s denním P&L</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/obchod/historie">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <History className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>Historie</CardTitle>
              <CardDescription>Procházej všechny obchody s filtry a vyhledáváním</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/obchod/statistiky">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-emerald-500 mb-2" />
              <CardTitle>Statistiky</CardTitle>
              <CardDescription>Detailní analýza výkonu, equity curve a breakdowny</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/record-trades">
          <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-2 border-primary">
            <CardHeader>
              <Plus className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Přidat Obchod</CardTitle>
              <CardDescription>Zaznamenej nový obchod s detaily a psychologií</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Trades Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Poslední Obchody</CardTitle>
          <CardDescription>Tvoje nejnovější obchody - zobraz více v historii</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {!isLiveMode && stats.totalTrades === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Zatím žádné obchody. Přidej první obchod nebo prozkoumej demo data!
              </p>
            )}
            {!isLiveMode && stats.totalTrades > 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                <p>Máš {stats.totalTrades} demo obchodů v tomto měsíci.</p>
                <Button variant="link" onClick={() => router.push("/obchod/historie")} className="mt-2">
                  Zobrazit všechny →
                </Button>
              </div>
            )}
            {isLiveMode && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Live Mode - připojování k databázi...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
