"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  DollarSign,
  CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getJournalEntries } from "@/utils/storage-utils"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { useLiveMode } from "@/contexts/live-mode-context"
import { getScoped } from "@/lib/storage"
import { generateVirtualTrades, generateVirtualJournalEntries } from "@/lib/virtual-data-generator"

interface JournalCalendarProps {
  onDateSelect?: (date: Date) => void
  demoEntries?: any[]
}

export function JournalCalendar({ onDateSelect, demoEntries }: JournalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [entries, setEntries] = useState<any[]>([])
  const { getAllTrades } = useData()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()

  useEffect(() => {
    loadEntries()
  }, [isLiveMode, demoEntries, user?.id])

  const loadEntries = () => {
    if (!isLiveMode && demoEntries && demoEntries.length > 0) {
      // Use demo entries in virtual mode
      setEntries(demoEntries)
    } else if (!isLiveMode) {
      // Generate virtual entries if none provided
      const virtualTrades = generateVirtualTrades(25)
      const virtualJournals = generateVirtualJournalEntries(5)
      setEntries([...virtualTrades, ...virtualJournals])
    } else {
      // LIVE MODE: Load from data context (Supabase data, not localStorage)
      const allTrades = getAllTrades()
      console.log("[v0] JournalCalendar - Loading trades from Supabase via getAllTrades:", allTrades.length)
      setEntries(allTrades)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const getEntriesForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    // Filter by date field (which contains when the trade was recorded/created)
    return entries.filter((entry) => {
      // Use date field - it should be the primary date for filtering
      const entryDate = entry.date || entry.recordedDate
      // Debug log for trades missing on calendar
      if (entryDate === dateStr && entry.type === "trade") {
        console.log("[v0] Trade found for date:", dateStr, entry)
      }
      return entryDate === dateStr
    })
  }

  const getStatsForDate = (day: number) => {
    const dayEntries = getEntriesForDate(day)
    const trades = dayEntries.filter((e) => e.type === "trade")
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || trade.profitLoss || 0), 0)
    const winningTrades = trades.filter((t) => (t.pnl || t.profitLoss || 0) > 0).length

    return {
      totalEntries: dayEntries.length,
      trades: trades.length,
      pnl: totalPnL,
      winRate: trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0,
    }
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    setSelectedDate(clickedDate)
    if (onDateSelect) {
      onDateSelect(clickedDate)
    }
  }

  const monthNames = [
    "Leden",
    "Únor",
    "Březen",
    "Duben",
    "Květen",
    "Červen",
    "Červenec",
    "Srpen",
    "Září",
    "Říjen",
    "Listopad",
    "Prosinec",
  ]

  const dayNames = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"]

  const monthlyStats = () => {
    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === month && entryDate.getFullYear() === year
    })

    const trades = monthEntries.filter((e) => e.type === "trade")
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || trade.profitLoss || 0), 0)
    const winningTrades = trades.filter((t) => (t.pnl || t.profitLoss || 0) > 0).length
    const tradingDays = new Set(trades.map((t) => t.date)).size

    console.log("[v0] Calendar monthlyStats:", { tradesCount: trades.length, totalPnL, winningTrades, tradingDays })

    return {
      totalEntries: monthEntries.length,
      trades: trades.length,
      pnl: Math.round(totalPnL * 100) / 100,
      winRate: trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0,
      avgPerDay: tradingDays > 0 ? Math.round((totalPnL / tradingDays) * 100) / 100 : 0,
    }
  }

  const stats = monthlyStats()
  const selectedEntries = selectedDate ? getEntriesForDate(selectedDate.getDate()) : []

  return (
    <div className="space-y-6">
      {/* Monthly Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">P&L měsíce</p>
                  <p className={cn("text-3xl font-bold", stats.pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {stats.pnl >= 0 ? "+" : ""}${stats.pnl}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className={cn(
                  "h-full transition-all",
                  stats.pnl >= 0
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
                  <p className="text-gray-400 text-xs font-medium mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-white">{stats.winRate}%</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className="h-full transition-all bg-gradient-to-r from-blue-500 to-cyan-500"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-xs font-medium mb-1">Obchodů</p>
                  <p className="text-3xl font-bold text-white">{stats.trades}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className="h-full transition-all bg-gradient-to-r from-green-500 to-emerald-500"
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
                  <p className="text-gray-400 text-xs font-medium mb-1">Průměr/den</p>
                  <p className={cn("text-3xl font-bold", stats.avgPerDay >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {stats.avgPerDay >= 0 ? "+" : ""}${stats.avgPerDay}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700">
              <div
                className={cn(
                  "h-full transition-all",
                  stats.avgPerDay >= 0
                    ? "bg-gradient-to-r from-orange-500 to-amber-500"
                    : "bg-gradient-to-r from-rose-500 to-red-500",
                )}
                style={{ width: "100%" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-600 lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-purple-400" />
                  {monthNames[month]} {year}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{stats.trades} trades this month</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:border-purple-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:border-purple-500"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:border-purple-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-purple-400 py-3">
                  {day}
                </div>
              ))}

              {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const dayStats = getStatsForDate(day)
                const isToday =
                  day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                const isSelected =
                  selectedDate &&
                  day === selectedDate.getDate() &&
                  month === selectedDate.getMonth() &&
                  year === selectedDate.getFullYear()

                let bgClass = "bg-slate-700/40 hover:bg-slate-700/60"
                if (dayStats.pnl > 0) {
                  bgClass =
                    "bg-gradient-to-br from-emerald-500/30 to-green-500/20 hover:from-emerald-500/40 hover:to-green-500/30"
                } else if (dayStats.pnl < 0) {
                  bgClass =
                    "bg-gradient-to-br from-rose-500/30 to-red-500/20 hover:from-rose-500/40 hover:to-red-500/30"
                }

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "aspect-square rounded-xl border-2 transition-all duration-200 relative overflow-hidden group",
                      bgClass,
                      isToday && "ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-800",
                      isSelected && "ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-800 scale-105",
                      !isToday && !isSelected && "border-slate-600 hover:border-purple-500/50",
                      dayStats.totalEntries > 0 && "shadow-lg",
                    )}
                  >
                    <div className="absolute inset-0 p-2 flex flex-col items-center justify-center">
                      <span
                        className={cn(
                          "text-base font-bold mb-1",
                          dayStats.totalEntries > 0 ? "text-white" : "text-gray-400",
                        )}
                      >
                        {day}
                      </span>
                      {dayStats.totalEntries > 0 && (
                        <div className="flex flex-col items-center gap-1 w-full">
                          <div className="flex gap-1 justify-center">
                            {Array.from({ length: Math.min(dayStats.trades, 3) }).map((_, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-lg" />
                            ))}
                          </div>
                          {dayStats.pnl !== 0 && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] px-1.5 py-0 h-4 font-bold border",
                                dayStats.pnl >= 0
                                  ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/50"
                                  : "bg-rose-500/30 text-rose-300 border-rose-500/50",
                              )}
                            >
                              {dayStats.pnl >= 0 ? "+" : ""}${Math.abs(dayStats.pnl).toFixed(0)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500/30 to-green-500/20" />
                <span className="text-xs text-gray-300">Ziskový den</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-500/30 to-red-500/20" />
                <span className="text-xs text-gray-300">Ztrátový den</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="w-4 h-4 rounded bg-slate-700/40 border border-purple-500" />
                <span className="text-xs text-gray-300">Dnešní den</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-xs text-gray-300">Obchod</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-600">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              {selectedDate ? `${selectedDate.getDate()}. ${monthNames[selectedDate.getMonth()]}` : "Vyber den"}
            </h3>
            {selectedDate && selectedEntries.length > 0 ? (
              <div className="space-y-3">
                {selectedEntries.map((entry) => {
                  const pnl = entry.profitLoss || entry.pnl || 0
                  return (
                    <Card
                      key={entry.id}
                      className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              entry.type === "trade"
                                ? "border-purple-500 bg-purple-500/20 text-purple-300"
                                : entry.type === "behavior"
                                  ? "border-pink-500 bg-pink-500/20 text-pink-300"
                                  : "border-blue-500 bg-blue-500/20 text-blue-300",
                            )}
                          >
                            {entry.type === "trade"
                              ? "📊 Obchod"
                              : entry.type === "behavior"
                                ? "🧠 Chování"
                                : "📝 Deník"}
                          </Badge>
                          {pnl !== 0 && (
                            <div
                              className={cn(
                                "flex items-center gap-1 font-bold text-xs",
                                pnl >= 0 ? "text-emerald-400" : "text-rose-400",
                              )}
                            >
                              {pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1">{entry.title}</h4>
                        {entry.content && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{entry.content}</p>}
                        
                        {/* Psychology Data */}
                        {(entry.emotionBefore || entry.mood !== undefined || entry.confidenceBefore !== undefined || entry.stressLevel !== undefined) && (
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-600">
                            {entry.emotionBefore && (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Emoce</span>
                                <span className="text-xs font-medium text-blue-300">{entry.emotionBefore}</span>
                              </div>
                            )}
                            {entry.mood !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Nálada</span>
                                <span className="text-xs font-medium text-emerald-300">{Math.min(entry.mood, 10)}/10</span>
                              </div>
                            )}
                            {entry.confidenceBefore !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Důvěra</span>
                                <span className="text-xs font-medium text-cyan-300">{entry.confidenceBefore}/10</span>
                              </div>
                            )}
                            {entry.stressLevel !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Stres</span>
                                <span className="text-xs font-medium text-orange-300">{entry.stressLevel}/10</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center border-2 border-slate-600">
                  <CalendarIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">Žádné záznamy</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border-2 border-purple-500/30">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm text-gray-400">Vyber den v kalendáři</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default JournalCalendar
