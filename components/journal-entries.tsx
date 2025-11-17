"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, TrendingUp, TrendingDown, Calendar, Tag, ArrowUpDown, Brain, BookOpen, Target, DollarSign, Zap, Activity, Eye } from 'lucide-react'
import { getJournalEntries } from "@/utils/storage-utils"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface JournalEntry {
  id: string
  date: string
  type: "trade" | "journal" | "behavior"
  title: string
  content: string
  mood?: number
  confidence?: number
  profitLoss?: number
  pnl?: number
  tags?: string[]
  pair?: string
  tradeType?: string
  entryPrice?: number
  exitPrice?: number
  positionSize?: number
  pips?: number
  entryReason?: string
  exitReason?: string
  whatWorked?: string
  whatDidntWork?: string
  lessonLearned?: string
  marketConditions?: string
  preTradeEmotion?: string
  duringTradeEmotion?: string
  postTradeEmotion?: string
  stressLevel?: number
}

interface JournalEntriesProps {
  selectedDate?: Date
}

export function JournalEntries({ selectedDate }: JournalEntriesProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterResult, setFilterResult] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    const journalEntries = getJournalEntries()
    setEntries(journalEntries)
  }

  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries]

    if (selectedDate) {
      const dateKey = format(selectedDate, "yyyy-MM-dd")
      result = result.filter((entry) => entry.date === dateKey)
    }

    if (searchQuery) {
      result = result.filter(
        (entry) =>
          entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (filterType !== "all") {
      result = result.filter((entry) => entry.type === filterType)
    }

    if (filterResult !== "all") {
      if (filterResult === "profit") {
        result = result.filter((entry) => (entry.profitLoss || entry.pnl || 0) > 0)
      } else if (filterResult === "loss") {
        result = result.filter((entry) => (entry.profitLoss || entry.pnl || 0) < 0)
      }
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "pnl-desc":
          return (b.profitLoss || b.pnl || 0) - (a.profitLoss || a.pnl || 0)
        case "pnl-asc":
          return (a.profitLoss || a.pnl || 0) - (b.profitLoss || b.pnl || 0)
        default:
          return 0
      }
    })

    return result
  }, [entries, searchQuery, filterType, filterResult, sortBy, selectedDate])

  const stats = useMemo(() => {
    const totalPnL = filteredAndSortedEntries.reduce((sum, entry) => sum + (entry.profitLoss || entry.pnl || 0), 0)
    const trades = filteredAndSortedEntries.filter((e) => e.type === "trade")
    const winningTrades = trades.filter((e) => (e.profitLoss || e.pnl || 0) > 0).length

    return {
      total: filteredAndSortedEntries.length,
      totalPnL: Math.round(totalPnL * 10) / 10,
      trades: trades.length,
      winRate: trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0,
    }
  }, [filteredAndSortedEntries])

  const getPnL = (entry: JournalEntry) => {
    return entry.profitLoss || entry.pnl || 0
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, d. MMMM yyyy", { locale: cs })
    } catch {
      return dateString
    }
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "trade":
        return {
          icon: <Activity className="w-4 h-4" />,
          label: "Obchod",
          bg: "bg-purple-900/40",
          border: "border-purple-400",
          iconBg: "bg-purple-500",
          badge: "bg-purple-500 text-white border-purple-400",
          hover: "hover:bg-purple-900/60 hover:border-purple-300",
        }
      case "behavior":
        return {
          icon: <Brain className="w-4 h-4" />,
          label: "Chování",
          bg: "bg-pink-900/40",
          border: "border-pink-400",
          iconBg: "bg-pink-500",
          badge: "bg-pink-500 text-white border-pink-400",
          hover: "hover:bg-pink-900/60 hover:border-pink-300",
        }
      default:
        return {
          icon: <BookOpen className="w-4 h-4" />,
          label: "Deník",
          bg: "bg-blue-900/40",
          border: "border-blue-400",
          iconBg: "bg-blue-500",
          badge: "bg-blue-500 text-white border-blue-400",
          hover: "hover:bg-blue-900/60 hover:border-blue-300",
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Hledat v záznamech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-700/50 border-slate-600 text-white hover:border-purple-500">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              Všechny typy
            </SelectItem>
            <SelectItem value="trade" className="text-white hover:bg-slate-700">
              📊 Obchody
            </SelectItem>
            <SelectItem value="journal" className="text-white hover:bg-slate-700">
              📝 Deník
            </SelectItem>
            <SelectItem value="behavior" className="text-white hover:bg-slate-700">
              🧠 Chování
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-700/50 border-slate-600 text-white hover:border-purple-500">
            <TrendingUp className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Výsledek" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              Všechny
            </SelectItem>
            <SelectItem value="profit" className="text-white hover:bg-slate-700">
              💚 Zisky
            </SelectItem>
            <SelectItem value="loss" className="text-white hover:bg-slate-700">
              💔 Ztráty
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-700/50 border-slate-600 text-white hover:border-purple-500">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Řadit" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="date-desc" className="text-white hover:bg-slate-700">
              Nejnovější
            </SelectItem>
            <SelectItem value="date-asc" className="text-white hover:bg-slate-700">
              Nejstarší
            </SelectItem>
            <SelectItem value="pnl-desc" className="text-white hover:bg-slate-700">
              Nejvyšší P&L
            </SelectItem>
            <SelectItem value="pnl-asc" className="text-white hover:bg-slate-700">
              Nejnižší P&L
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-300 text-xs font-medium mb-1">Záznamů</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <BookOpen className="w-6 h-6 text-purple-300" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className="h-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: "100%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-300 text-xs font-medium mb-1">Obchodů</p>
                  <p className="text-3xl font-bold text-white">{stats.trades}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Activity className="w-6 h-6 text-blue-300" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className="h-full transition-all bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${Math.min((stats.trades / 50) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-300 text-xs font-medium mb-1">Celkový P&L</p>
                  <p className={cn("text-3xl font-bold", stats.totalPnL >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-3 rounded-full bg-gradient-to-br",
                    stats.totalPnL >= 0 ? "from-emerald-500/20 to-green-500/20" : "from-rose-500/20 to-red-500/20",
                  )}
                >
                  <DollarSign className={cn("w-6 h-6", stats.totalPnL >= 0 ? "text-emerald-300" : "text-rose-300")} />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className={cn(
                  "h-full transition-all",
                  stats.totalPnL >= 0
                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                    : "bg-gradient-to-r from-rose-500 to-red-500",
                )}
                style={{ width: "100%" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-300 text-xs font-medium mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.winRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                  <Target className="w-6 h-6 text-orange-300" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className="h-full transition-all bg-gradient-to-r from-orange-500 to-amber-500"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        {filteredAndSortedEntries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center border-2 border-slate-600">
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-lg font-medium text-gray-400 mb-2">Žádné záznamy nenalezeny</p>
            <p className="text-sm text-gray-500">Zkus změnit filtry nebo přidat nové záznamy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedEntries.map((entry) => {
              const pnl = getPnL(entry)
              const typeConfig = getTypeConfig(entry.type)

              return (
                <Card
                  key={entry.id}
                  className={cn(
                    "backdrop-blur-sm border-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group",
                    typeConfig.bg,
                    typeConfig.border,
                    typeConfig.hover,
                  )}
                  onClick={() => setDetailEntry(entry)}
                >
                  <CardContent className="md:p-6 p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn("p-2.5 rounded-xl text-white", typeConfig.iconBg)}>{typeConfig.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-white md:text-lg text-base">{entry.title}</h3>
                              <Badge className={cn("text-xs font-semibold border", typeConfig.badge)}>
                                {typeConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-300" />
                              <p className="md:text-sm text-xs text-gray-200 font-medium">{formatDate(entry.date)}</p>
                            </div>
                          </div>
                        </div>

                        {entry.content && (
                          <p className="md:text-sm text-xs text-gray-100 leading-relaxed line-clamp-2 mb-4 bg-black/20 p-3 rounded-lg">
                            {entry.content}
                          </p>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-white/10 gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.pair && (
                              <Badge className="text-xs font-semibold bg-blue-500 text-white border-blue-400">
                                {entry.pair}
                              </Badge>
                            )}
                            {entry.tradeType && (
                              <Badge
                                className={cn(
                                  "text-xs font-semibold",
                                  entry.tradeType === "long"
                                    ? "bg-emerald-500 text-white border-emerald-400"
                                    : "bg-rose-500 text-white border-rose-400",
                                )}
                              >
                                {entry.tradeType === "long" ? "↗️ Long" : "↘️ Short"}
                              </Badge>
                            )}
                            {entry.mood && (
                              <Badge className="text-xs font-semibold bg-orange-500 text-white border-orange-400">
                                😊 {entry.mood}/10
                              </Badge>
                            )}
                            {entry.confidence && (
                              <Badge className="text-xs font-semibold bg-cyan-500 text-white border-cyan-400">
                                🎯 {entry.confidence}/10
                              </Badge>
                            )}
                            {entry.tags &&
                              entry.tags.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  className="text-xs font-semibold bg-slate-600 text-white border-slate-500"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-white hover:bg-white/20 font-semibold w-full md:w-auto"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </div>
                      </div>

                      {pnl !== 0 && (
                        <div
                          className={cn(
                            "md:ml-4 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold md:text-2xl text-xl border-2 shadow-lg self-start",
                            pnl >= 0
                              ? "bg-emerald-500 text-white border-emerald-400"
                              : "bg-rose-500 text-white border-rose-400",
                          )}
                        >
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog open={!!detailEntry} onOpenChange={() => setDetailEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
          {detailEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl text-white", getTypeConfig(detailEntry.type).iconBg)}>
                    {getTypeConfig(detailEntry.type).icon}
                  </div>
                  {detailEntry.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="flex items-center gap-2 text-gray-200">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">{formatDate(detailEntry.date)}</span>
                  </div>
                  {getPnL(detailEntry) !== 0 && (
                    <div
                      className={cn(
                        "px-6 py-3 rounded-xl font-bold text-2xl border-2",
                        getPnL(detailEntry) >= 0
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : "bg-rose-500 text-white border-rose-400",
                      )}
                    >
                      {getPnL(detailEntry) >= 0 ? "+" : ""}${getPnL(detailEntry).toFixed(1)}
                    </div>
                  )}
                </div>

                {detailEntry.type === "trade" && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {detailEntry.pair && (
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Měnový pár</p>
                            <p className="text-xl font-bold text-white">{detailEntry.pair}</p>
                          </CardContent>
                        </Card>
                      )}
                      {detailEntry.tradeType && (
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Směr</p>
                            <div className="flex items-center gap-2">
                              {detailEntry.tradeType === "long" ? (
                                <TrendingUp className="w-6 h-6 text-emerald-300" />
                              ) : (
                                <TrendingDown className="w-6 h-6 text-rose-300" />
                              )}
                              <p
                                className={cn(
                                  "text-xl font-bold",
                                  detailEntry.tradeType === "long" ? "text-emerald-300" : "text-rose-300",
                                )}
                              >
                                {detailEntry.tradeType === "long" ? "Long" : "Short"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {detailEntry.entryPrice && (
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Vstupní cena</p>
                            <p className="text-xl font-bold text-white">{detailEntry.entryPrice}</p>
                          </CardContent>
                        </Card>
                      )}
                      {detailEntry.exitPrice && (
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <p className="text-xs text-gray-300 mb-1">Výstupní cena</p>
                            <p className="text-xl font-bold text-white">{detailEntry.exitPrice}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {(detailEntry.positionSize || detailEntry.pips) && (
                      <div className="grid grid-cols-2 gap-4">
                        {detailEntry.positionSize && (
                          <Card className="bg-slate-700/50 border-slate-600">
                            <CardContent className="p-4">
                              <p className="text-xs text-gray-300 mb-1">Velikost pozice</p>
                              <p className="text-xl font-bold text-white">{detailEntry.positionSize}</p>
                            </CardContent>
                          </Card>
                        )}
                        {detailEntry.pips && (
                          <Card className="bg-slate-700/50 border-slate-600">
                            <CardContent className="p-4">
                              <p className="text-xs text-gray-300 mb-1">Pipy</p>
                              <p className="text-xl font-bold text-cyan-300">{detailEntry.pips}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </>
                )}

                {detailEntry.content && (
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        Poznámky
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{detailEntry.content}</p>
                    </CardContent>
                  </Card>
                )}

                {(detailEntry.entryReason || detailEntry.exitReason) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailEntry.entryReason && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-sm text-gray-300">Důvod vstupu</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-200">{detailEntry.entryReason}</p>
                        </CardContent>
                      </Card>
                    )}
                    {detailEntry.exitReason && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader>
                          <CardTitle className="text-sm text-gray-300">Důvod výstupu</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-200">{detailEntry.exitReason}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {(detailEntry.whatWorked || detailEntry.whatDidntWork) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailEntry.whatWorked && (
                      <Card className="bg-emerald-500/10 border-emerald-500/30">
                        <CardHeader>
                          <CardTitle className="text-sm text-emerald-300 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Poučení
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-200">{detailEntry.whatWorked}</p>
                        </CardContent>
                      </Card>
                    )}
                    {detailEntry.whatDidntWork && (
                      <Card className="bg-rose-500/10 border-rose-500/30">
                        <CardHeader>
                          <CardTitle className="text-sm text-rose-300 flex items-center gap-2">
                            ❌ Co nefungovalo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-200">{detailEntry.whatDidntWork}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {detailEntry.lessonLearned && (
                  <Card className="bg-purple-500/10 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Poučení
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-200">{detailEntry.lessonLearned}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailEntry.mood && (
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Brain className="w-5 h-5 text-orange-400" />
                            <span className="text-sm font-medium">Nálada</span>
                          </div>
                          <span className="text-3xl font-bold text-orange-300">{detailEntry.mood}/10</span>
                        </div>
                        <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                            style={{ width: `${detailEntry.mood * 10}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {detailEntry.confidence && (
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Target className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm font-medium">Důvěra</span>
                          </div>
                          <span className="text-3xl font-bold text-cyan-300">{detailEntry.confidence}/10</span>
                        </div>
                        <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                            style={{ width: `${detailEntry.confidence * 10}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {detailEntry.tags && detailEntry.tags.length > 0 && (
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tagy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {detailEntry.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="text-sm px-4 py-2 bg-purple-500 text-white border-purple-400 font-semibold"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default JournalEntries
