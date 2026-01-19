"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Target } from "lucide-react"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useAuth } from "@/contexts/auth-context"
import { getDemoTrades, type DemoTrade } from "@/lib/demo/demo-trades"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ObchodKalendarPage() {
  const { isLiveMode } = useLiveMode()
  const { user } = useAuth()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [trades, setTrades] = useState<DemoTrade[]>([])

  useEffect(() => {
    if (!isLiveMode && user) {
      const demoTrades = getDemoTrades(user.id)
      setTrades(demoTrades)
    }
  }, [isLiveMode, user])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const previousMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))

  const getTradesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return trades.filter((t) => t.date === dateStr)
  }

  const getDayStats = (day: number) => {
    const dayTrades = getTradesForDay(day)
    const totalPnL = dayTrades.reduce((sum, t) => sum + t.pnl, 0)
    const wins = dayTrades.filter((t) => t.pnl > 0).length

    return {
      totalTrades: dayTrades.length,
      pnl: totalPnL,
      winRate: dayTrades.length > 0 ? Math.round((wins / dayTrades.length) * 100) : 0,
    }
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day)
    setSelectedDate(clickedDate)
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

  const selectedDayTrades = selectedDate ? getTradesForDay(selectedDate.getDate()) : []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Obchodní kalendář</h1>
          <p className="text-slate-400 mt-1">Přehled vašich obchodů podle dnů</p>
        </div>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const stats = getDayStats(day)
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === month &&
                selectedDate?.getFullYear() === year
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear()

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "min-h-[80px] p-2 rounded-lg border transition-all hover:border-purple-500/50",
                    isSelected ? "bg-purple-500/20 border-purple-500" : "bg-slate-700/30 border-slate-600",
                    stats.totalTrades === 0 && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-sm font-medium", isToday && "text-purple-400")}>{day}</span>
                    {stats.totalTrades > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {stats.totalTrades}
                      </Badge>
                    )}
                  </div>

                  {stats.totalTrades > 0 && (
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "text-xs font-semibold",
                          stats.pnl > 0 ? "text-emerald-400" : stats.pnl < 0 ? "text-red-400" : "text-slate-400",
                        )}
                      >
                        {stats.pnl > 0 ? "+" : ""}${stats.pnl}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Target className="w-3 h-3" />
                        {stats.winRate}%
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && selectedDayTrades.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Obchody - {selectedDate.getDate()}. {monthNames[selectedDate.getMonth()]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDayTrades.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => router.push(`/obchod/detail/${trade.id}`)}
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-purple-500/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{trade.pair}</span>
                      <Badge variant={trade.direction === "LONG" ? "default" : "destructive"} className="text-xs">
                        {trade.direction}
                      </Badge>
                      <span className="text-sm text-slate-400">{trade.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trade.pnl > 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={cn(
                          "text-lg font-bold",
                          trade.pnl > 0 ? "text-emerald-400" : trade.pnl < 0 ? "text-red-400" : "text-slate-400",
                        )}
                      >
                        {trade.pnl > 0 ? "+" : ""}${trade.pnl}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{trade.setup}</span>
                    <span>•</span>
                    <span>{trade.timeframe}</span>
                    <span>•</span>
                    <span>
                      {trade.pips > 0 ? "+" : ""}
                      {trade.pips} pips
                    </span>
                    <span>•</span>
                    <span>RR: {trade.rr}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
