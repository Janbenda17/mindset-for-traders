"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { getJournalEntries } from "@/utils/storage-utils"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  Zap,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalCalendarProps {
  onDateSelect: (date: Date | undefined) => void
}

interface DayStats {
  totalPnL: number
  trades: number
  wins: number
  losses: number
  breakeven: number
  mood: number
}

export function JournalCalendar({ onDateSelect }: JournalCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [monthStats, setMonthStats] = useState({
    totalPnL: 0,
    bestDay: { date: "", pnl: 0 },
    worstDay: { date: "", pnl: 0 },
    avgDailyPnL: 0,
    winRate: 0,
    tradingDays: 0,
  })
  const [heatmapData, setHeatmapData] = useState<Map<string, DayStats>>(new Map())
  const [selectedDayStats, setSelectedDayStats] = useState<DayStats | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    if (date) {
      calculateMonthStats(date)
      generateHeatmap(date)
    }
  }, [journalEntries, date])

  const loadEntries = () => {
    const entries = getJournalEntries()
    setJournalEntries(entries)
  }

  const calculateMonthStats = (currentDate: Date) => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)

    const monthEntries = journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= start && entryDate <= end
    })

    const dailyTotals = new Map<string, number>()
    monthEntries.forEach((entry) => {
      const pnl = entry.profitLoss || entry.pnl || 0
      const dateKey = entry.date
      dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + pnl)
    })

    const totals = Array.from(dailyTotals.values())
    const totalPnL = totals.reduce((sum, val) => sum + val, 0)
    const tradingDays = dailyTotals.size

    let bestDay = { date: "", pnl: Number.NEGATIVE_INFINITY }
    let worstDay = { date: "", pnl: Number.POSITIVE_INFINITY }

    dailyTotals.forEach((pnl, date) => {
      if (pnl > bestDay.pnl) {
        bestDay = { date, pnl }
      }
      if (pnl < worstDay.pnl) {
        worstDay = { date, pnl }
      }
    })

    const profitDays = totals.filter((pnl) => pnl > 0).length
    const winRate = tradingDays > 0 ? (profitDays / tradingDays) * 100 : 0

    setMonthStats({
      totalPnL: Math.round(totalPnL),
      bestDay: {
        date: bestDay.date ? new Date(bestDay.date).toLocaleDateString("cs-CZ") : "-",
        pnl: Math.round(bestDay.pnl === Number.NEGATIVE_INFINITY ? 0 : bestDay.pnl),
      },
      worstDay: {
        date: worstDay.date ? new Date(worstDay.date).toLocaleDateString("cs-CZ") : "-",
        pnl: Math.round(worstDay.pnl === Number.POSITIVE_INFINITY ? 0 : worstDay.pnl),
      },
      avgDailyPnL: tradingDays > 0 ? Math.round(totalPnL / tradingDays) : 0,
      winRate: Math.round(winRate),
      tradingDays,
    })
  }

  const generateHeatmap = (currentDate: Date) => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    const heatmap = new Map<string, DayStats>()

    days.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd")
      const dayEntries = journalEntries.filter((entry) => entry.date === dateKey)

      if (dayEntries.length > 0) {
        const totalPnL = dayEntries.reduce((sum, entry) => sum + (entry.profitLoss || entry.pnl || 0), 0)
        const wins = dayEntries.filter((e) => (e.profitLoss || e.pnl || 0) > 0).length
        const losses = dayEntries.filter((e) => (e.profitLoss || e.pnl || 0) < 0).length
        const breakeven = dayEntries.filter((e) => (e.profitLoss || e.pnl || 0) === 0).length
        const avgMood = dayEntries.reduce((sum, e) => sum + (e.mood || 5), 0) / dayEntries.length

        heatmap.set(dateKey, {
          totalPnL: Math.round(totalPnL),
          trades: dayEntries.length,
          wins,
          losses,
          breakeven,
          mood: Math.round(avgMood * 10) / 10,
        })
      }
    })

    setHeatmapData(heatmap)
  }

  const getDayIntensity = (pnl: number): string => {
    if (pnl === 0) return "bg-slate-700/50"
    if (pnl > 500) return "bg-green-500/80"
    if (pnl > 200) return "bg-green-500/60"
    if (pnl > 0) return "bg-green-500/40"
    if (pnl < -500) return "bg-red-500/80"
    if (pnl < -200) return "bg-red-500/60"
    return "bg-red-500/40"
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onDateSelect(selectedDate)

    if (selectedDate) {
      const dateKey = format(selectedDate, "yyyy-MM-dd")
      const stats = heatmapData.get(dateKey)
      setSelectedDayStats(stats || null)
    } else {
      setSelectedDayStats(null)
    }
  }

  const modifiers = {
    profitable: (day: Date) => {
      const dateKey = format(day, "yyyy-MM-dd")
      const stats = heatmapData.get(dateKey)
      return stats ? stats.totalPnL > 0 : false
    },
    loss: (day: Date) => {
      const dateKey = format(day, "yyyy-MM-dd")
      const stats = heatmapData.get(dateKey)
      return stats ? stats.totalPnL < 0 : false
    },
    hasData: (day: Date) => {
      const dateKey = format(day, "yyyy-MM-dd")
      return heatmapData.has(dateKey)
    },
  }

  const modifiersStyles = {
    profitable: {
      backgroundColor: "rgb(34 197 94 / 0.3)",
      color: "rgb(134 239 172)",
      fontWeight: 600,
    },
    loss: {
      backgroundColor: "rgb(239 68 68 / 0.3)",
      color: "rgb(252 165 165)",
      fontWeight: 600,
    },
  }

  return (
    <div className="space-y-6">
      {/* Month Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <Badge variant="outline" className="text-blue-300 border-blue-400/30">
                Měsíc
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{monthStats.tradingDays}</p>
              <p className="text-sm text-gray-400">Trading dní</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "bg-gradient-to-br border backdrop-blur-sm",
            monthStats.totalPnL >= 0
              ? "from-green-500/20 via-green-500/10 to-transparent border-green-500/30"
              : "from-red-500/20 via-red-500/10 to-transparent border-red-500/30",
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className={cn("w-5 h-5", monthStats.totalPnL >= 0 ? "text-green-400" : "text-red-400")} />
              <Badge
                variant="outline"
                className={cn(
                  monthStats.totalPnL >= 0 ? "text-green-300 border-green-400/30" : "text-red-300 border-red-400/30",
                )}
              >
                P&L
              </Badge>
            </div>
            <div className="space-y-1">
              <p className={cn("text-3xl font-bold", monthStats.totalPnL >= 0 ? "text-green-400" : "text-red-400")}>
                ${monthStats.totalPnL}
              </p>
              <p className="text-sm text-gray-400">Celkový zisk/ztráta</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <Badge variant="outline" className="text-purple-300 border-purple-400/30">
                Win Rate
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{monthStats.winRate}%</p>
              <p className="text-sm text-gray-400">Úspěšnost</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <Badge variant="outline" className="text-orange-300 border-orange-400/30">
                Avg
              </Badge>
            </div>
            <div className="space-y-1">
              <p className={cn("text-3xl font-bold", monthStats.avgDailyPnL >= 0 ? "text-green-400" : "text-red-400")}>
                ${monthStats.avgDailyPnL}
              </p>
              <p className="text-sm text-gray-400">Průměr/den</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-400" />
              Trading Heatmap
            </CardTitle>
            <CardDescription>Klikni na den pro detail</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-lg border-0"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-white font-semibold text-lg",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-8 w-8 bg-slate-700/50 p-0 opacity-50 hover:opacity-100 text-white rounded-md hover:bg-slate-600/50 transition-all",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-400 rounded-md w-12 font-medium text-[0.8rem] uppercase",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                day: cn(
                  "h-12 w-12 p-0 font-normal text-white hover:bg-slate-700/50 rounded-md transition-all",
                  "focus:bg-slate-600/50 focus:outline-none",
                ),
                day_selected: "bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600 font-bold",
                day_today: "bg-slate-700 text-white font-bold ring-2 ring-purple-500",
                day_outside: "text-gray-600 opacity-50",
                day_disabled: "text-gray-600 opacity-50",
                day_hidden: "invisible",
              }}
              components={{
                DayContent: ({ date: day }) => {
                  const dateKey = format(day, "yyyy-MM-dd")
                  const stats = heatmapData.get(dateKey)

                  if (!stats) {
                    return <span className="text-gray-500">{day.getDate()}</span>
                  }

                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-md opacity-80 transition-all",
                          getDayIntensity(stats.totalPnL),
                        )}
                      />
                      <span className="relative z-10 font-semibold text-white drop-shadow-lg">{day.getDate()}</span>
                      {stats.totalPnL !== 0 && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {stats.totalPnL > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-300 drop-shadow-md" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-300 drop-shadow-md" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                },
              }}
            />

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-gray-400 mb-3">Intenzita P&L</p>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-500/40" />
                  <span className="text-xs text-gray-300">{"> $0"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-500/60" />
                  <span className="text-xs text-gray-300">{"> $200"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-green-500/80" />
                  <span className="text-xs text-gray-300">{"> $500"}</span>
                </div>
                <div className="h-4 w-px bg-slate-600 mx-2" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-500/40" />
                  <span className="text-xs text-gray-300">{"< $0"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-500/60" />
                  <span className="text-xs text-gray-300">{"< -$200"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-500/80" />
                  <span className="text-xs text-gray-300">{"< -$500"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Day Detail */}
          {selectedDayStats ? (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Detail vybraného dne
                </CardTitle>
                <CardDescription className="text-xs">
                  {date ? format(date, "d. MMMM yyyy", { locale: require("date-fns/locale/cs") }) : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">P&L</span>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        selectedDayStats.totalPnL >= 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      ${selectedDayStats.totalPnL}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{selectedDayStats.trades}</p>
                    <p className="text-xs text-gray-400 mt-1">Obchodů</p>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-400">{selectedDayStats.mood}</p>
                    <p className="text-xs text-gray-400 mt-1">Nálada</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Výhry</span>
                    </div>
                    <span className="font-medium text-green-400">{selectedDayStats.wins}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">Prohry</span>
                    </div>
                    <span className="font-medium text-red-400">{selectedDayStats.losses}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">Break Even</span>
                    </div>
                    <span className="font-medium text-yellow-400">{selectedDayStats.breakeven}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-gray-400 mb-2">Win Rate</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${selectedDayStats.trades > 0 ? (selectedDayStats.wins / selectedDayStats.trades) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">
                      {selectedDayStats.trades > 0
                        ? Math.round((selectedDayStats.wins / selectedDayStats.trades) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm text-gray-400">Vyber den pro zobrazení detailů</p>
              </CardContent>
            </Card>
          )}

          {/* Best & Worst Day */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Extrémní dny
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-green-300">Nejlepší den</span>
                </div>
                <p className="text-xl font-bold text-green-400">${monthStats.bestDay.pnl}</p>
                <p className="text-xs text-gray-400 mt-1">{monthStats.bestDay.date}</p>
              </div>

              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-red-300">Nejhorší den</span>
                </div>
                <p className="text-xl font-bold text-red-400">${monthStats.worstDay.pnl}</p>
                <p className="text-xs text-gray-400 mt-1">{monthStats.worstDay.date}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
