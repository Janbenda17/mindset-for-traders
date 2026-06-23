"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { buildDisciplineMatrix, type DisciplineDay } from "@/lib/discipline-matrix"

const COLOR_CLASSES: Record<DisciplineDay["color"], string> = {
  emerald: "bg-emerald-500 hover:bg-emerald-400",
  orange: "bg-amber-500 hover:bg-amber-400",
  red: "bg-red-500 hover:bg-red-400",
  gray: "bg-slate-700 hover:bg-slate-600",
}

const WEEKDAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]

interface DisciplineMatrixProps {
  // Optional set of YYYY-MM-DD dates to highlight (e.g. from the AI search
  // bar). Highlighted cells get a glowing ring; everything else dims
  // slightly so the matched days stand out.
  highlightedDates?: Set<string> | null
  onDayClick?: (day: DisciplineDay) => void
}

function startOfWeekMonday(d: Date): Date {
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  const copy = new Date(d)
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export default function DisciplineMatrix({ highlightedDates, onDayClick }: DisciplineMatrixProps) {
  const { getAllTrades, getAllJournalEntries } = useData()
  const [weekOffset, setWeekOffset] = useState(0) // 0 = most recent 12 weeks

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

  const WEEKS_VISIBLE = 12
  const { weeks, rangeLabel } = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() - weekOffset * 7 * WEEKS_VISIBLE)
    const lastWeekStart = startOfWeekMonday(today)
    const firstWeekStart = new Date(lastWeekStart)
    firstWeekStart.setDate(firstWeekStart.getDate() - (WEEKS_VISIBLE - 1) * 7)

    const weeksArr: DisciplineDay[][] = []
    for (let w = 0; w < WEEKS_VISIBLE; w++) {
      const weekStart = new Date(firstWeekStart)
      weekStart.setDate(weekStart.getDate() + w * 7)
      const week: DisciplineDay[] = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)
        const key = day.toISOString().slice(0, 10)
        week.push(
          dayMap.get(key) || {
            date: key,
            color: "gray",
            score: null,
            tradeCount: 0,
            tags: [],
            reason: "Žádné obchody tento den",
          },
        )
      }
      weeksArr.push(week)
    }

    const fmt = (d: Date) => d.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" })
    return {
      weeks: weeksArr,
      rangeLabel: `${fmt(firstWeekStart)} – ${fmt(lastWeekStart)}`,
    }
  }, [dayMap, weekOffset])

  const totalScored = days.filter((d) => d.color !== "gray")
  const cleanDays = totalScored.filter((d) => d.color === "emerald").length
  const redDays = totalScored.filter((d) => d.color === "red").length

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-amber-500/20">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base md:text-lg">Disciplinová matice</h3>
              <p className="text-gray-400 text-xs">
                {cleanDays} bezchybných dní · {redDays} dní s porušením pravidel · {totalScored.length} dní s daty
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-1.5 rounded-md hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              aria-label="Starší týdny"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 min-w-[110px] text-center">{rangeLabel}</span>
            <button
              onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
              disabled={weekOffset === 0}
              className="p-1.5 rounded-md hover:bg-slate-700 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Novější týdny"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-fit">
            <div className="flex flex-col gap-1 pt-5 pr-1">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="h-4 md:h-5 flex items-center text-[9px] md:text-[10px] text-gray-500">
                  {label}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {wi === 0 || new Date(week[0].date).getDate() <= 7 ? (
                  <div className="h-4 text-[9px] text-gray-500 whitespace-nowrap">
                    {new Date(week[0].date).toLocaleDateString("cs-CZ", { month: "short" })}
                  </div>
                ) : (
                  <div className="h-4" />
                )}
                {week.map((day) => {
                  const isHighlighted = highlightedDates ? highlightedDates.has(day.date) : true
                  const dimmed = highlightedDates && highlightedDates.size > 0 && !isHighlighted
                  return (
                    <button
                      key={day.date}
                      onClick={() => onDayClick?.(day)}
                      title={`${day.date} — ${day.reason}${day.tags.length ? ` [${day.tags.join(", ")}]` : ""}`}
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5 rounded-sm transition-all",
                        COLOR_CLASSES[day.color],
                        dimmed ? "opacity-20" : "opacity-100",
                        highlightedDates && isHighlighted && highlightedDates.size > 0
                          ? "ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-800"
                          : "",
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
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
            <div className="w-3 h-3 rounded-sm bg-slate-700" />
            <span>Žádné obchody</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
