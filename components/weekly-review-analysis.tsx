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

type WeeklyReview = WeeklyReviewData

function computeDemoWeeklyReview(trades: any[], journalEntries: any[] = []): WeeklyReview {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const weekTrades = (trades || []).filter((t) => {
    const d = new Date(t.date || t.recordedDate || t.openDate || t.closeDate)
    return !isNaN(d.getTime()) && d >= sevenDaysAgo
  })

  const normalized: NormalizedTrade[] = weekTrades.map((t: any) => ({
    date: t.date || t.recordedDate || t.openDate || t.closeDate,
    pair: t.pair ?? null,
    direction: t.direction ?? null,
    pnl: t.pnl || 0,
    mood: t.mood ?? null,
    confidence: t.confidence ?? null,
    stress: t.stressLevel ?? t.stress ?? null,
    discipline: t.discipline ?? null,
    emotionBefore: t.emotionBefore ?? null,
    notes: t.notes ?? null,
    followedPlan: t.followedPlan ?? null,
  }))

  const weekJournals: WeekSelfReportDay[] = (journalEntries || [])
    .filter((j: any) => typeof j.id === 'string' && j.id.startsWith('daily-summary-') && Array.isArray(j.tags))
    .filter((j: any) => {
      const d = new Date(j.date)
      return !isNaN(d.getTime()) && d >= sevenDaysAgo
    })
    .map((j: any) => ({
      date: j.date,
      tags: (j.tags || []) as string[],
    }))

  return buildWeeklyReview(normalized, weekJournals)
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
      // Demo/virtual mode: build the review straight from the virtual trade
      // history so it shows exactly what this feature looks like with
      // realistic-looking data, instead of an empty/fake placeholder.
      setLoading(true)
      setError(null)
      setReview(computeDemoWeeklyReview(trades, getAllJournalEntries ? getAllJournalEntries() : []))
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
      setReview(computeDemoWeeklyReview(trades, getAllJournalEntries ? getAllJournalEntries() : []))
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
