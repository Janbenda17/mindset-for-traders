"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, TrendingUp, TrendingDown, Filter, ArrowUpDown } from "lucide-react"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useAuth } from "@/contexts/auth-context"
import { getDemoTrades, type DemoTrade } from "@/lib/demo/demo-trades"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"

export default function ObchodHistoriePage() {
  const searchParams = useSearchParams()
  const { isLiveMode } = useLiveMode()
  const { user } = useAuth()
  const router = useRouter()
  const [trades, setTrades] = useState<DemoTrade[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPair, setFilterPair] = useState("all")
  const [filterResult, setFilterResult] = useState("all")
  const [filterSetup, setFilterSetup] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "pnl">("date")

  useEffect(() => {
    if (!isLiveMode && user) {
      const demoTrades = getDemoTrades(user.id)
      setTrades(demoTrades)
    }
  }, [isLiveMode, user])

  const uniquePairs = useMemo(() => {
    const pairs = new Set(trades.map((t) => t.pair))
    return Array.from(pairs).sort()
  }, [trades])

  const uniqueSetups = useMemo(() => {
    const setups = new Set(trades.map((t) => t.setup))
    return Array.from(setups).sort()
  }, [trades])

  const filteredTrades = useMemo(() => {
    let filtered = trades

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.pair.toLowerCase().includes(query) ||
          t.setup.toLowerCase().includes(query) ||
          t.notes.toLowerCase().includes(query),
      )
    }

    if (filterPair !== "all") {
      filtered = filtered.filter((t) => t.pair === filterPair)
    }

    if (filterResult !== "all") {
      if (filterResult === "win") {
        filtered = filtered.filter((t) => t.pnl > 0)
      } else if (filterResult === "loss") {
        filtered = filtered.filter((t) => t.pnl < 0)
      } else if (filterResult === "breakeven") {
        filtered = filtered.filter((t) => t.pnl === 0)
      }
    }

    if (filterSetup !== "all") {
      filtered = filtered.filter((t) => t.setup === filterSetup)
    }

    // Sort
    if (sortBy === "pnl") {
      filtered = [...filtered].sort((a, b) => b.pnl - a.pnl)
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return filtered
  }, [trades, searchQuery, filterPair, filterResult, filterSetup, sortBy])

  const stats = useMemo(() => {
    const wins = filteredTrades.filter((t) => t.pnl > 0).length
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0)
    const winRate = filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0

    return { totalTrades: filteredTrades.length, wins, totalPnL, winRate }
  }, [filteredTrades])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Historie obchodů</h1>
          <p className="text-slate-400 mt-1">Kompletní přehled všech vašich obchodů</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400">Celkem obchodů</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalTrades}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400">Win Rate</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">{stats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400">Celkový P&L</div>
            <div
              className={cn(
                "text-2xl font-bold mt-1",
                stats.totalPnL > 0 ? "text-emerald-400" : stats.totalPnL < 0 ? "text-red-400" : "text-slate-400",
              )}
            >
              {stats.totalPnL > 0 ? "+" : ""}${stats.totalPnL}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400">Výhry</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.wins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Hledat obchody..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600"
              />
            </div>

            <Select value={filterPair} onValueChange={setFilterPair}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue placeholder="Všechny páry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny páry</SelectItem>
                {uniquePairs.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue placeholder="Výsledek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny</SelectItem>
                <SelectItem value="win">Výhry</SelectItem>
                <SelectItem value="loss">Ztráty</SelectItem>
                <SelectItem value="breakeven">Breakeven</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSetup} onValueChange={setFilterSetup}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue placeholder="Setup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny setupy</SelectItem>
                {uniqueSetups.map((setup) => (
                  <SelectItem key={setup} value={setup}>
                    {setup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "pnl")}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Seřadit podle data</SelectItem>
                <SelectItem value="pnl">Seřadit podle P&L</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trades List */}
      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Obchody ({filteredTrades.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTrades.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Žádné obchody nenalezeny</div>
            ) : (
              filteredTrades.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => router.push(`/obchod/detail/${trade.id}`)}
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-purple-500/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">{trade.pair}</span>
                      <Badge variant={trade.direction === "LONG" ? "default" : "destructive"}>
                        {trade.direction}
                      </Badge>
                      <span className="text-sm text-slate-400">
                        {new Date(trade.created_at).toLocaleDateString("cs-CZ")}
                      </span>
                      <span className="text-sm text-slate-400">{trade.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {trade.pnl > 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                      <span
                        className={cn(
                          "text-xl font-bold",
                          trade.pnl > 0 ? "text-emerald-400" : trade.pnl < 0 ? "text-red-400" : "text-slate-400",
                        )}
                      >
                        {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Setup</div>
                      <div className="text-white font-medium">{trade.setup}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Timeframe</div>
                      <div className="text-white font-medium">{trade.timeframe}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Pips</div>
                      <div className={cn("font-medium", trade.pips > 0 ? "text-emerald-400" : "text-red-400")}>
                        {trade.pips > 0 ? "+" : ""}
                        {trade.pips}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">RR</div>
                      <div className="text-white font-medium">{trade.rr}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Confidence</div>
                      <div className="flex items-center gap-1">
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${trade.confidence * 10}%` }}
                          />
                        </div>
                        <span className="text-white text-xs">{trade.confidence}</span>
                      </div>
                    </div>
                  </div>

                  {trade.notes && (
                    <div className="mt-3 text-sm text-slate-300 bg-slate-800/50 p-2 rounded">{trade.notes}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
