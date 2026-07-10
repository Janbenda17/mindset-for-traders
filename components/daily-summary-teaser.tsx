'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, ShieldCheck, Leaf, MessageCircle } from 'lucide-react'
import { buildDailySummary } from '@/lib/daily-summary'

interface DailySummaryTeaserProps {
  trades: any[]
  dateLabel: string
}

// Presentational, homepage-facing version of the real Daily Tracker "Daily
// Summary" card - same buildDailySummary() engine, same gauge/verdict/AI
// prompt layout, just without the day's own interactive self-report toggles
// (those write to a specific logged-in user's day, which doesn't make sense
// for a static example).
export default function DailySummaryTeaser({ trades, dateLabel }: DailySummaryTeaserProps) {
  const router = useRouter()
  const summary = useMemo(() => buildDailySummary(trades, dateLabel, []), [trades, dateLabel])

  const disciplineColor =
    summary.discipline.score >= 80 ? '#34d399' : summary.discipline.score >= 50 ? '#fbbf24' : '#f87171'
  const disciplineTextColor =
    summary.discipline.score >= 80
      ? 'text-emerald-400'
      : summary.discipline.score >= 50
        ? 'text-amber-400'
        : 'text-rose-400'

  const askAi = (prompt: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindtrader-ai-prefill', prompt)
    }
    router.push('/mindtrader?tab=ai')
  }

  return (
    <Card
      className={`border bg-gradient-to-br from-slate-900 to-slate-950 ${
        summary.tone === 'bad'
          ? 'border-red-500/30'
          : summary.tone === 'warn'
            ? 'border-amber-500/30'
            : summary.tone === 'good'
              ? 'border-emerald-500/30'
              : 'border-slate-800'
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Brain
              className={`h-5 w-5 ${
                summary.tone === 'bad'
                  ? 'text-red-400'
                  : summary.tone === 'warn'
                    ? 'text-amber-400'
                    : summary.tone === 'good'
                      ? 'text-emerald-400'
                      : 'text-slate-400'
              }`}
            />
            Daily Summary
          </span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              summary.tone === 'bad'
                ? 'bg-red-500/10 text-red-300'
                : summary.tone === 'warn'
                  ? 'bg-amber-500/10 text-amber-300'
                  : summary.tone === 'good'
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-slate-500/10 text-slate-300'
            }`}
          >
            {summary.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-slate-200 italic border-l-2 border-slate-600 pl-3 leading-relaxed">
          "{summary.matrixLine}"
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {summary.chatPrompts.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Zeptej se AI na dnešek</p>
                <div className="flex flex-col gap-2">
                  {summary.chatPrompts.slice(0, 2).map((p, i) => (
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

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col items-center">
              <div className="relative w-36 h-36">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${disciplineColor} ${summary.discipline.score * 3.6}deg, rgb(30 41 59) 0deg)`,
                  }}
                />
                <div className="absolute inset-[6px] rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <ShieldCheck className={`h-4 w-4 mb-1 ${disciplineTextColor}`} />
                  <span className="text-3xl font-black text-white">{summary.discipline.score}%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Discipline</span>
                </div>
              </div>
              <p className={`text-xs font-semibold mt-3 ${disciplineTextColor}`}>{summary.discipline.label}</p>
              <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">{summary.discipline.text}</p>
            </div>

            {summary.disciplinedDollars && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                  <Leaf className="h-3.5 w-3.5" /> Ušetřeno disciplínou: ${summary.disciplinedDollars.amount.toLocaleString('en-US')}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{summary.disciplinedDollars.text}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
