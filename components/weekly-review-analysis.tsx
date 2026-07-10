'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateWeeklyReview } from '@/app/actions/weekly-review'
import { buildWeeklyReview, type NormalizedTrade, type WeekSelfReportDay, type WeeklyReviewData } from '@/lib/weekly-review-insights'
import { generateDemoTradingHistory } from '@/lib/demo-data'

type WeeklyReview = WeeklyReviewData

const KNOWN_SELF_REPORT_TAGS = ['FOMO_overcome', 'FOMO_chased', 'REVENGE_TRADING', 'EARLY_CLOSE', 'CLEAN_DAY']

function normalizeTrade(t: any): NormalizedTrade {
  return {
    date: t.date || t.recordedDate || t.openDate || t.closeDate,
    pair: t.pair ?? null,
    direction: t.direction ?? null,
    pnl: (t.pnl ?? t.profitLoss ?? 0) as number,
    mood: t.mood ?? null,
    confidence: t.confidence ?? t.confidenceBefore ?? null,
    stress: t.stressLevel ?? t.stress ?? null,
    discipline: t.discipline ?? null,
    emotionBefore: t.emotionBefore ?? null,
    notes: t.notes ?? null,
    followedPlan: t.followedPlan ?? t.matchedPlan ?? null,
    id: t.id ?? null,
    positionSize: t.positionSize ?? null,
    revengeTrade: t.revengeTrade ?? null,
    fomo: t.fomo ?? null,
    hasStopLoss: t.hasStopLoss ?? null,
    openTime: t.openTime ?? null,
  }
}

// Build a demo Weekly Review from a freshly generated demo history so it shows
// exactly what the feature looks like with realistic data — including the
// Emotional Tax and self-report trend — instead of an empty placeholder.
function computeDemoWeeklyReview(history: any[]): WeeklyReview {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const inWindow = (d: string) => {
    const dt = new Date(d)
    return !isNaN(dt.getTime()) && dt >= sevenDaysAgo
  }

  const weekTrades = (history || []).filter((e) => e.type === 'trade' && inWindow(e.date))
  const normalized = weekTrades.map(normalizeTrade)

  const weekJournals: WeekSelfReportDay[] = (history || [])
    .filter(
      (j: any) =>
        j.type === 'journal' &&
        Array.isArray(j.tags) &&
        j.tags.some((t: string) => KNOWN_SELF_REPORT_TAGS.includes(t)) &&
        inWindow(j.date),
    )
    .map((j: any) => ({ date: j.date, tags: (j.tags || []) as string[] }))

  return buildWeeklyReview(normalized, weekJournals)
}

const GRADE_STYLES: Record<string, { text: string; ring: string; bar: string; glow: string }> = {
  A: { text: 'text-emerald-400', ring: 'border-emerald-500/40', bar: 'from-emerald-500 to-green-400', glow: 'from-emerald-900/40' },
  B: { text: 'text-emerald-300', ring: 'border-emerald-500/30', bar: 'from-emerald-500 to-teal-400', glow: 'from-emerald-900/30' },
  C: { text: 'text-amber-400', ring: 'border-amber-500/40', bar: 'from-amber-500 to-yellow-400', glow: 'from-amber-900/30' },
  D: { text: 'text-orange-400', ring: 'border-orange-500/40', bar: 'from-orange-500 to-amber-400', glow: 'from-orange-900/30' },
  F: { text: 'text-rose-400', ring: 'border-rose-500/40', bar: 'from-rose-500 to-red-400', glow: 'from-rose-900/30' },
  '—': { text: 'text-slate-400', ring: 'border-slate-600/40', bar: 'from-slate-500 to-slate-400', glow: 'from-slate-800/30' },
}

// Tiny inline SVG equity curve — cumulative P&L across the week's trades.
function EquityCurve({ points }: { points: number[] }) {
  if (!points || points.length < 2) return null
  const w = 240
  const h = 64
  const min = Math.min(0, ...points)
  const max = Math.max(0, ...points)
  const range = max - min || 1
  const stepX = w / (points.length - 1)
  const y = (v: number) => h - ((v - min) / range) * h
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * stepX).toFixed(1)} ${y(p).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const up = last >= 0
  const stroke = up ? '#34d399' : '#fb7185'
  const zeroY = y(0)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="overflow-visible">
      <line x1="0" y1={zeroY} x2={w} y2={zeroY} stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={up ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)'} />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function WeeklyReviewAnalysis() {
  const { user } = useAuth()
  const { isLiveMode, trades, getAllJournalEntries } = useData()
  const [review, setReview] = useState<WeeklyReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLiveMode === undefined) return

    if (!isLiveMode) {
      // Demo/virtual mode: build the review from a freshly generated demo
      // trading history (shared with the Journal demo) so it showcases the
      // full feature — grade, quant metrics, Emotional Tax and self-report
      // trend — instead of an empty/fake placeholder.
      setLoading(true)
      setError(null)
      setReview(computeDemoWeeklyReview(generateDemoTradingHistory(30)))
      setLoading(false)
      return
    }

    if (!user?.id) return
    generateReview()
  }, [user?.id, isLiveMode, trades])

  const generateReview = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      console.log('[v0] Starting weekly review generation for user:', user.id)

      const weeklyReview = await generateWeeklyReview(user.id)
      setReview(weeklyReview)
      console.log('[v0] Weekly review generated:', weeklyReview)
    } catch (err) {
      console.error('[v0] Error generating weekly review:', err)
      setError('Nepodařilo se vygenerovat weekly review')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (!isLiveMode) {
      setReview(computeDemoWeeklyReview(generateDemoTradingHistory(30)))
      return
    }
    generateReview()
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3 py-12">
            <Sparkles className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-slate-300">Generuji tvůj weekly review...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-slate-900/30 border-red-700/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-2">{error}</h3>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Zkusit znovu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!review) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Target className="w-12 h-12 text-indigo-400" />
            <div className="text-center space-y-2">
              <h3 className="text-slate-200 font-semibold text-lg">Weekly Review</h3>
              <p className="text-slate-400 text-sm">Zatím málo dat. Pokračuj v obchodování a získáš AI postřehy!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isLiveMode === false && (
        <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-2 px-3 text-xs md:text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <span className="text-amber-100">
            <span className="font-bold text-white">Ukázková data.</span> Takhle bude vypadat tvůj weekly review –
            jakmile připojíš MetaTrader, nahradí se reálnými obchody.
          </span>
        </div>
      )}

      {/* Weekly Grade hero + equity curve */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={`bg-gradient-to-br ${(GRADE_STYLES[review.grade.letter] || GRADE_STYLES['—']).glow} to-slate-900/40 border ${(GRADE_STYLES[review.grade.letter] || GRADE_STYLES['—']).ring}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Big grade */}
              <div className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 ${(GRADE_STYLES[review.grade.letter] || GRADE_STYLES['—']).ring} bg-slate-900/50 flex flex-col items-center justify-center`}>
                <span className={`text-5xl font-black leading-none ${(GRADE_STYLES[review.grade.letter] || GRADE_STYLES['—']).text}`}>
                  {review.grade.letter}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">{review.grade.score}/100</span>
              </div>
              {/* Headline + score bar */}
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Známka týdne</p>
                <p className="text-lg md:text-xl font-bold text-white mb-2">{review.grade.headline}</p>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${(GRADE_STYLES[review.grade.letter] || GRADE_STYLES['—']).bar} transition-all`}
                    style={{ width: `${review.grade.score}%` }}
                  />
                </div>
              </div>
              {/* Equity curve */}
              {review.equityCurve.length >= 2 && (
                <div className="flex-shrink-0 w-full md:w-64">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Equity křivka týdne</p>
                  <EquityCurve points={review.equityCurve} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-900/30 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-indigo-300">Týdenní shrnutí</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">{review.summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Klíčové metriky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {review.keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-slate-900/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    {metric.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
                    {metric.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                    {metric.trend === 'neutral' && <div className="w-5 h-5 text-slate-400">—</div>}
                  </div>
                  <p className="text-lg font-bold text-white">{metric.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{metric.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emotional Tax for the week */}
      {review.emotionalTax && review.emotionalTax.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="bg-gradient-to-br from-rose-900/20 to-slate-900/30 border-rose-700/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-rose-300 flex-wrap">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Účet za emoce tento týden
                </span>
                <span className="text-2xl font-black text-rose-400">
                  −${Math.abs(review.emotionalTax.total).toLocaleString('en-US')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Kolik tě tento týden stály emoční chyby{' '}
                {review.emotionalTax.topOffender && (
                  <>
                    — nejdražší vzorec byl <span className="text-rose-300 font-semibold">{review.emotionalTax.topOffender}</span>
                  </>
                )}
                .
              </p>
              <div className="space-y-2">
                {review.emotionalTax.rows.map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2">
                    <span className="text-slate-300 text-sm">{row.label}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{row.incidents}× incident</span>
                      <span className="text-rose-400 font-bold text-sm tabular-nums">
                        −${Math.abs(row.realLoss).toLocaleString('en-US')}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-3">
                Počet incidentů a ztráta jsou čtené z obchodů. Stejný engine pohání „Účet za emoce" v deníku.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/20 to-slate-900/30 border-green-700/30 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                Co se dařilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {review.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-400 font-bold mt-1">✓</span>
                    <span className="text-slate-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Areas to Improve */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-orange-900/20 to-slate-900/30 border-orange-700/30 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-300">
                <AlertCircle className="w-5 h-5" />
                Co zlepšit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {review.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-orange-400 font-bold mt-1">→</span>
                    <span className="text-slate-300">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Next Week Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900/30 border-purple-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <Target className="w-5 h-5" />
              Zaměření na další týden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {review.nextWeekFocus.map((focus, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-purple-400 font-bold">{idx + 1}.</span>
                  <span className="text-slate-300">{focus}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      {/* Psychological Insights & Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-pink-900/20 to-slate-900/30 border-pink-700/30 h-full">
            <CardHeader>
              <CardTitle className="text-pink-300">Psychologické postřehy</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {review.psychologicalInsights.map((insight, idx) => (
                  <li key={idx} className="text-slate-300">
                    <p className="text-sm">• {insight}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-cyan-900/20 to-slate-900/30 border-cyan-700/30 h-full">
            <CardHeader>
              <CardTitle className="text-cyan-300">Hodnocení rizika</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{review.riskAssessment}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
