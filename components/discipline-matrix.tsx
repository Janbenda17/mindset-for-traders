"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { buildDisciplineMatrix, type DisciplineDay } from "@/lib/discipline-matrix"

const COLOR_CLASSES: Record<DisciplineDay["color"], string> = {
  emerald: "bg-emerald-500/90 hover:bg-emerald-400 border-emerald-400/40",
  orange: "bg-amber-500/90 hover:bg-amber-400 border-amber-400/40",
  red: "bg-red-500/90 hover:bg-red-400 border-red-400/40",
  gray: "bg-slate-800 hover:bg-slate-700 border-slate-700",
}

const TEXT_CLASSES: Record<DisciplineDay["color"], string> = {
  emerald: "text-white",
  orange: "text-white",
  red: "text-white",
  gray: "text-gray-500",
}

const WEEKDAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]

interface DisciplineMatrixProps {
  // Optional set of YYYY-MM-DD dates to highlight (e.g. from the AI search
  // bar). Highlighted cells get a glowing ring; everything else dims
  // slightly so the matched days stand out.
  highlightedDates?: Set<string> | null
  onDayClick?: (day: DisciplineDay) => void
}

function ymKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

export default function DisciplineMatrix({ highlightedDates, onDayClick }: DisciplineMatrixProps) {
  const { getAllTrades, getAllJournalEntries } = useData()
  const [monthOffset, setMonthOffset] = useState(0) // 0 = current month, positive = further back

  const days = useMemo(() => {
    const trades = getAllTrades?.() || []
    const journalEntries = getAllJournalEntries?.() || []
    return buildDisciplineMatrix(trades, journalEntries)
  }, [getAllTrades, getAllJournalEntries])

  const dayMap = useMemo(() => {
    const m = new Map<string, DisciplineDay>()
    days.forEach((d) => m.set(d.date, d))
    return m
  }, [days])

  const { grid, monthLabel, year, month, isCurrentMonth } = useMemo(() => {
    const today = new Date()
    const targetMonthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
    const y = targetMonthDate.getFullYear()
    const m = targetMonthDate.getMonth()

    const firstOfMonth = new Date(y, m, 1)
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    // Monday-first offset: getDay() 0=Sun..6=Sat -> convert so Monday=0
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7

    const cells: (DisciplineDay & { dayNum: number; inMonth: boolean })[] = []

    // Leading days from previous month (shown dimmed, not clickable)
    for (let i = leadingBlanks - 1; i >= 0; i--) {
      const d = new Date(y, m, -i)
      const key = d.toISOString().slice(0, 10)
      cells.push({
        ...(dayMap.get(key) || {
          date: key,
          color: "gray",
          score: null,
          tradeCount: 0,
          tags: [],
          reason: "",
        }),
        dayNum: d.getDate(),
        inMonth: false,
      })
    }

    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const d = new Date(y, m, dNum)
      const key = d.toISOString().slice(0, 10)
      cells.push({
        ...(dayMap.get(key) || {
          date: key,
          color: "gray",
          score: null,
          tradeCount: 0,
          tags: [],
          reason: "Žádné obchody tento den",
        }),
        dayNum: dNum,
        inMonth: true,
      })
    }

    // Trailing days from next month to complete the final week
    const trailing = (7 - (cells.length % 7)) % 7
    for (let i = 1; i <= trailing; i++) {
      const d = new Date(y, m + 1, i)
      const key = d.toISOString().slice(0, 10)
      cells.push({
        ...(dayMap.get(key) || {
          date: key,
          color: "gray",
          score: null,
          tradeCount: 0,
          tags: [],
          reason: "",
        }),
        dayNum: d.getDate(),
        inMonth: false,
      })
    }

    const weeks: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

    const label = firstOfMonth.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })

    return {
      grid: weeks,
      monthLabel: label.charAt(0).toUpperCase() + label.slice(1),
      year: y,
      month: m,
      isCurrentMonth: monthOffset === 0,
    }
  }, [dayMap, monthOffset])

  const monthKey = ymKey(year, month)
  const totalScored = days.filter((d) => d.date.startsWith(monthKey) && d.color !== "gray")
  const cleanDays = totalScored.filter((d) => d.color === "emerald").length
  const redDays = totalScored.filter((d) => d.color === "red").length

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-amber-500/20">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base md:text-lg">Kalendář</h3>
              <p className="text-gray-400 text-xs">
                {cleanDays} bezchybných dní · {redDays} dní s porušením pravidel · {totalScored.length} dní s daty
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthOffset((o) => o + 1)}
              className="p-1.5 rounded-md hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              aria-label="Předchozí měsíc"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs md:text-sm text-gray-300 font-medium min-w-[120px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-md hover:bg-slate-700 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Následující měsíc"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center text-[10px] md:text-xs text-gray-500 font-medium py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="space-y-1 md:space-y-1.5">
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1 md:gap-1.5">
              {week.map((day) => {
                const isHighlighted = highlightedDates ? highlightedDates.has(day.date) : true
                const dimmed = highlightedDates && highlightedDates.size > 0 && !isHighlighted

                return (
                  <button
                    key={day.date}
                    onClick={() => day.inMonth && onDayClick?.(day)}
                    disabled={!day.inMonth}
                    title={
                      day.inMonth
                        ? `${day.date} — ${day.reason}${day.tags.length ? ` [${day.tags.join(", ")}]` : ""}`
                        : undefined
                    }
                    className={cn(
                      "aspect-square w-full rounded-md border flex items-center justify-center text-[11px] md:text-sm font-semibold transition-all",
                      day.inMonth ? COLOR_CLASSES[day.color] : "bg-slate-900/40 border-slate-800 cursor-default",
                      day.inMonth ? TEXT_CLASSES[day.color] : "text-gray-600",
                      dimmed && day.inMonth ? "opacity-20" : "opacity-100",
                      highlightedDates && isHighlighted && highlightedDates.size > 0 && day.inMonth
                        ? "ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-800"
                        : "",
                    )}
                  >
                    {day.dayNum}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700 text-[10px] md:text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Disciplína dodržena</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>Mírné porušení / bez signálu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Revenge trading / porušen plán</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-800" />
            <span>Žádné obchody</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
