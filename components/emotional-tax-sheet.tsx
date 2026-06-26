"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Receipt, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildEmotionalTaxSheet, type TaxKey } from "@/lib/emotional-tax"

interface EmotionalTaxSheetProps {
  trades: any[]
  journalEntries?: any[]
  isEn?: boolean
}

const ROW_EMOJI: Record<TaxKey, string> = {
  fomo: "🏃",
  revenge: "🔁",
  noStop: "🛑",
  oversizing: "📈",
}

function money(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "-" : ""
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`
}

export default function EmotionalTaxSheet({ trades, journalEntries = [], isEn = false }: EmotionalTaxSheetProps) {
  const sheet = useMemo(
    () => buildEmotionalTaxSheet(trades, journalEntries, isEn),
    [trades, journalEntries, isEn],
  )

  const txt = {
    title: isEn ? "The Emotional Tax Sheet" : "Účet za emoce",
    subtitle: isEn
      ? "A financial statement of your psychology — what each mistake actually cost"
      : "Finanční vyúčtování tvé psychiky — kolik tě každá chyba reálně stála",
    error: isEn ? "Emotional failure" : "Emoční selhání",
    incidents: isEn ? "Incidents" : "Počet",
    realLoss: isEn ? "Real loss" : "Reálná ztráta",
    saved: isEn ? "Saved by self-control" : "Ušetřeno sebekontrolou",
    potential: isEn ? "Potential saving" : "Potenciální úspora",
    potentialHint: isEn ? "if the amok hadn't happened" : "kdyby nebyl amok",
    total: isEn ? "Total" : "Celkem",
    empty: isEn
      ? "No emotional leaks detected in this period — clean trading. 🎯"
      : "V tomto období žádné emoční úlety — čistý trading. 🎯",
    estimateNote: isEn
      ? "Incident count and real loss are read straight from your trades. Saved & potential are estimates grounded in your own average loss size."
      : "Počet incidentů a reálná ztráta jsou čtené přímo z tvých obchodů. Ušetřeno a potenciál jsou odhady opřené o tvou vlastní průměrnou ztrátu.",
    edge: isEn ? "Strategy P&L (clean trades)" : "P&L strategie (čisté obchody)",
    emotional: isEn ? "Emotional P&L (flagged trades)" : "P&L emocí (problémové obchody)",
    verdictWin: isEn ? "Your edge works — protect it from your emotions." : "Tvůj edge funguje — ochraň ho před svými emocemi.",
    verdictTax: isEn
      ? "Your emotions are eating into a profitable strategy."
      : "Tvé emoce ukrajují ze ziskové strategie.",
  }

  if (!sheet.hasData) {
    return (
      <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
        <CardContent className="p-3 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-amber-500/20">
              <Receipt className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base md:text-lg">{txt.title}</h3>
              <p className="text-gray-400 text-xs">{txt.subtitle}</p>
            </div>
          </div>
          <div className="text-center py-8 text-gray-400 text-sm">{txt.empty}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600 overflow-hidden">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-amber-500/20">
              <Receipt className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base md:text-lg">{txt.title}</h3>
              <p className="text-gray-400 text-xs">{txt.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Strategy vs Emotional P&L split — the "fackující" headline. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="text-emerald-300/80 text-[11px] md:text-xs font-medium mb-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> {txt.edge}
            </p>
            <p className={cn("text-xl md:text-2xl font-black", sheet.strategyPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {money(sheet.strategyPnL)}
            </p>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
            <p className="text-rose-300/80 text-[11px] md:text-xs font-medium mb-0.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> {txt.emotional}
            </p>
            <p className={cn("text-xl md:text-2xl font-black", sheet.emotionalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {money(sheet.emotionalPnL)}
            </p>
          </div>
        </div>

        {/* The ledger table */}
        <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
          <table className="w-full text-sm border-collapse min-w-[560px]">
            <thead>
              <tr className="text-gray-400 text-[11px] md:text-xs uppercase tracking-wide">
                <th className="text-left font-medium py-2 pr-2">{txt.error}</th>
                <th className="text-center font-medium py-2 px-2">{txt.incidents}</th>
                <th className="text-right font-medium py-2 px-2">{txt.realLoss}</th>
                <th className="text-right font-medium py-2 px-2">{txt.saved}</th>
                <th className="text-right font-medium py-2 pl-2">
                  {txt.potential}
                  <span className="block text-[9px] normal-case text-gray-500">{txt.potentialHint}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sheet.rows.map((row) => {
                const muted = row.incidents === 0
                return (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-t border-slate-700/70 transition-colors",
                      muted ? "opacity-40" : "hover:bg-slate-900/40",
                    )}
                  >
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{ROW_EMOJI[row.key]}</span>
                        <div className="min-w-0">
                          <p className="text-white font-semibold leading-tight">{row.label}</p>
                          <p className="text-gray-500 text-[10px] md:text-xs leading-tight truncate max-w-[220px]">
                            {row.sublabel}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span
                        className={cn(
                          "inline-block min-w-[28px] rounded-md px-2 py-0.5 font-bold",
                          row.incidents > 0 ? "bg-slate-700/70 text-white" : "text-gray-500",
                        )}
                      >
                        {row.incidents}×
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-2 font-bold text-rose-400 tabular-nums">
                      {row.realLoss === 0 ? "$0" : money(row.realLoss)}
                    </td>
                    <td className="text-right py-2.5 px-2 font-bold text-emerald-400 tabular-nums">
                      {row.savedBySelfControl === 0 ? "$0" : money(row.savedBySelfControl)}
                    </td>
                    <td className="text-right py-2.5 pl-2 font-black text-amber-400 tabular-nums">
                      {row.potentialSaving === 0 ? "$0" : money(row.potentialSaving)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-600 text-sm">
                <td className="py-2.5 pr-2 font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" /> {txt.total}
                </td>
                <td className="text-center py-2.5 px-2 font-bold text-white">{sheet.totals.incidents}×</td>
                <td className="text-right py-2.5 px-2 font-black text-rose-400 tabular-nums">
                  {money(sheet.totals.realLoss)}
                </td>
                <td className="text-right py-2.5 px-2 font-black text-emerald-400 tabular-nums">
                  {money(sheet.totals.saved)}
                </td>
                <td className="text-right py-2.5 pl-2 font-black text-amber-400 tabular-nums">
                  {money(sheet.totals.potential)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verdict line + estimate disclaimer */}
        <div className="mt-4 rounded-lg bg-slate-900/50 border border-slate-700 p-3">
          <p className="text-sm text-gray-200 font-medium">
            {sheet.strategyPnL > 0 ? txt.verdictWin : txt.verdictTax}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-1">{txt.estimateNote}</p>
        </div>
      </CardContent>
    </Card>
  )
}
