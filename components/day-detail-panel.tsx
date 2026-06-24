"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MessageCircle, TrendingUp, TrendingDown, Clock, Shield, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { buildDailySummary } from "@/lib/daily-summary"
import type { DisciplineDay } from "@/lib/discipline-matrix"

interface DayDetailPanelProps {
  day: DisciplineDay
  onClose: () => void
  demoTrades?: any[] // used in virtual/demo mode instead of real getAllTrades()
}

const COLOR_BADGE: Record<DisciplineDay["color"], string> = {
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  orange: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  red: "bg-red-500/20 text-red-300 border-red-500/30",
  gray: "bg-slate-600/30 text-gray-400 border-slate-600/40",
}

export default function DayDetailPanel({ day, onClose, demoTrades }: DayDetailPanelProps) {
  const router = useRouter()
  const { getAllTrades } = useData()

  const dayTrades = useMemo(() => {
    const source = demoTrades ?? (getAllTrades?.() || [])
    return source.filter((t: any) => String(t?.date || "").slice(0, 10) === day.date)
  }, [demoTrades, getAllTrades, day.date])

  const dateLabel = useMemo(
    () => new Date(day.date).toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" }),
    [day.date],
  )

  const summary = useMemo(() => buildDailySummary(dayTrades, dateLabel, day.tags || []), [dayTrades, dateLabel, day.tags])

  const askAi = (prompt: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mindtrader-ai-prefill", prompt)
    }
    router.push("/mindtrader?tab=ai")
  }

  const netPnl = dayTrades.reduce((s: number, t: any) => s + (t.pnl || t.profitLoss || 0), 0)

  return (
    <Card className="border-purple-500/30 bg-slate-900/80 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Detail dne</p>
            <h3 className="text-white font-bold text-lg capitalize">{dateLabel}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("border text-xs", COLOR_BADGE[day.color])}>
              {day.score !== null ? `${day.score}% disciplína` : "Žádná data"}
            </Badge>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {dayTrades.length === 0 ? (
          <p className="text-gray-400 text-sm">Pro tento den nemáme žádné zaznamenané obchody.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Left: hard trade data */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {dayTrades.length} obchodů
                </span>
                <span className={cn("font-bold", netPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {netPnl >= 0 ? "+" : ""}${Math.round(netPnl)}
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {dayTrades.map((t: any, i: number) => {
                  const pnl = t.pnl || t.profitLoss || 0
                  return (
                    <div
                      key={t.id || i}
                      className="flex items-center justify-between bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {pnl >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{t.pair || "Obchod"}</p>
                          <p className="text-gray-500 text-xs">{String(t.direction || "").toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={cn("text-sm font-bold", pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {pnl >= 0 ? "+" : ""}${Math.round(pnl)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: AI verdict for the day */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-white font-semibold">{summary.discipline.label}</span>
                <span className="text-gray-500">— {summary.discipline.score}%</span>
              </div>
              <p className="text-sm text-gray-300">{summary.narrative}</p>

              {summary.disciplinedDollars && (
                <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200">{summary.disciplinedDollars.text}</p>
                </div>
              )}

              {summary.bullets.length > 0 && (
                <ul className="space-y-1.5 text-xs text-gray-400 list-disc ml-4">
                  {summary.bullets.slice(0, 4).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}

              {summary.chatPrompts.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Probrat s Claude</p>
                  <div className="flex flex-col gap-2">
                    {summary.chatPrompts.slice(0, 3).map((p, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => askAi(p.prompt)}
                        className="justify-start text-left h-auto py-2 px-3 border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-xs whitespace-normal"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-cyan-400" />
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
