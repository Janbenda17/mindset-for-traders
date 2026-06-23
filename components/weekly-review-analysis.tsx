'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useData } from '@/contexts/data-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateWeeklyReview } from '@/app/actions/weekly-review'

interface WeeklyReview {
  summary: string
  keyMetrics: {
    label: string
    value: string | number
    trend: 'up' | 'down' | 'neutral'
  }[]
  highlights: string[]
  improvements: string[]
  nextWeekFocus: string[]
  psychologicalInsights: string[]
  riskAssessment: string
}

function computeDemoWeeklyReview(trades: any[]): WeeklyReview {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const weekTrades = (trades || []).filter((t) => {
    const d = new Date(t.date || t.recordedDate || t.openDate || t.closeDate)
    return !isNaN(d.getTime()) && d >= sevenDaysAgo
  })

  if (weekTrades.length === 0) {
    return {
      summary:
        'Tento týden nejsou v ukázkových datech žádné obchody. Takhle bude vypadat tvůj weekly review, jakmile budeš mít reálné obchody za posledních 7 dní.',
      keyMetrics: [
        { label: 'Celkem obchodů', value: 0, trend: 'neutral' },
        { label: 'Win Rate', value: '0%', trend: 'neutral' },
        { label: 'Týdenní P&L', value: '$0', trend: 'neutral' },
        { label: 'Nejlepší obchod', value: '$0', trend: 'neutral' },
        { label: 'Průměrný obchod', value: '$0', trend: 'neutral' },
      ],
      highlights: ['Zatím žádná data za tento týden'],
      improvements: ['Začni zaznamenávat obchody do deníku'],
      nextWeekFocus: ['Stanov si jasná pravidla vstupu', 'Definuj maximální riziko na obchod'],
      psychologicalInsights: ['Zatím nedostatek dat pro psychologickou analýzu'],
      riskAssessment: 'Bez obchodů tento týden nelze vyhodnotit riziko.',
    }
  }

  const winningTrades = weekTrades.filter((t) => (t.pnl || 0) > 0)
  const totalPnL = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winRate = (winningTrades.length / weekTrades.length) * 100
  const bestTrade = Math.max(...weekTrades.map((t) => t.pnl || 0))
  const worstTrade = Math.min(...weekTrades.map((t) => t.pnl || 0))
  const avgTrade = totalPnL / weekTrades.length

  const avg = (key: string) => {
    const vals = weekTrades.map((t: any) => t[key]).filter((v: any) => typeof v === 'number')
    return vals.length ? vals.reduce((s: number, v: number) => s + v, 0) / vals.length : null
  }
  const avgDiscipline = avg('discipline')
  const avgStress = avg('stressLevel') ?? avg('stress')
  const avgConfidence = avg('confidence')
  const avgMood = avg('mood')

  const followedPlanCount = weekTrades.filter((t) => t.followedPlan).length
  const followedPlanRate = (followedPlanCount / weekTrades.length) * 100

  const sortedByDate = weekTrades
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  let maxConsecutiveLosses = 0
  let current = 0
  sortedByDate.forEach((t) => {
    if ((t.pnl || 0) < 0) {
      current++
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, current)
    } else {
      current = 0
    }
  })

  const pairCounts: Record<string, number> = {}
  weekTrades.forEach((t) => {
    if (t.pair) pairCounts[t.pair] = (pairCounts[t.pair] || 0) + 1
  })
  const topPairEntry = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]
  const topPair = topPairEntry?.[0]

  const highlights: string[] = []
  const improvements: string[] = []
  const psychologicalInsights: string[] = []

  if (winRate >= 60) highlights.push(`Solidní úspěšnost ${winRate.toFixed(0)}% – tvoje vstupy fungují`)
  else improvements.push(`Win rate ${winRate.toFixed(0)}% je pod ideálem – rozeber neúspěšné setupy`)

  if (totalPnL > 0) highlights.push(`Ziskový týden: +$${totalPnL.toFixed(0)}`)
  else improvements.push(`Ztrátový týden: -$${Math.abs(totalPnL).toFixed(0)} – zmenši velikost pozic`)

  if (followedPlanRate >= 70) highlights.push(`Dodržel jsi svůj plán u ${followedPlanRate.toFixed(0)}% obchodů`)
  else improvements.push(`Plán jsi dodržel jen u ${followedPlanRate.toFixed(0)}% obchodů – disciplína je klíč`)

  if (topPair) highlights.push(`Nejvíc jsi obchodoval ${topPair} (${pairCounts[topPair]}× tento týden)`)

  if (maxConsecutiveLosses >= 3) {
    psychologicalInsights.push(`Zaznamenali jsme ${maxConsecutiveLosses} ztrát v řadě – po 2. ztrátě zařaď pauzu`)
  } else {
    highlights.push('Žádné dlouhé série ztrát – dobrá emoční kontrola')
  }

  if (avgStress !== null) {
    psychologicalInsights.push(
      avgStress >= 6
        ? `Průměrný stres během obchodování byl vysoký (${avgStress.toFixed(1)}/10) – zvaž kratší seance`
        : `Stres pod kontrolou (${avgStress.toFixed(1)}/10)`,
    )
  }

  if (avgDiscipline !== null) {
    psychologicalInsights.push(`Disciplína v průměru ${avgDiscipline.toFixed(1)}/10 napříč obchody tento týden`)
  }

  if (avgConfidence !== null && avgMood !== null) {
    psychologicalInsights.push(
      `Sebevědomí před obchody ${avgConfidence.toFixed(1)}/10, nálada po obchodech ${avgMood.toFixed(1)}/10`,
    )
  }

  const nextWeekFocus = [
    winRate < 50
      ? 'Zaměř se na revizi vstupních pravidel – win rate je pod 50 %'
      : 'Udržuj kvalitní setupy a nepřeobchoduj',
    followedPlanRate < 70
      ? 'Zaměř se na 100% dodržování plánu před vstupem do obchodu'
      : 'Pokračuj v disciplinovaném dodržování plánu',
    maxConsecutiveLosses >= 3
      ? 'Po dvou ztrátách za sebou si dej alespoň 15minutovou pauzu'
      : 'Udržuj maximální riziko 2 % kapitálu na jeden obchod',
  ]

  let peak = 0
  let maxDrawdown = 0
  let running = 0
  sortedByDate.forEach((t) => {
    running += t.pnl || 0
    peak = Math.max(peak, running)
    maxDrawdown = Math.max(maxDrawdown, peak - running)
  })

  const riskAssessment =
    maxDrawdown > 10
      ? 'Riziko je tento týden zvýšené – sniž velikost pozic a obchoduj menší lot.'
      : maxDrawdown > 5
        ? 'Riziko je mírné a v rámci akceptovatelných hranic, dál ho sleduj.'
        : 'Riziko bylo dobře pod kontrolou – pokračuj ve stejném nastavení risk managementu.'

  return {
    summary: `Tento týden jsi udělal ${weekTrades.length} obchodů s ${winRate.toFixed(0)}% úspěšností a ${
      totalPnL >= 0 ? '+' : ''
    }$${totalPnL.toFixed(0)} ${totalPnL >= 0 ? 'ziskem' : 'ztrátou'}. Nejlepší obchod přinesl $${bestTrade.toFixed(
      0,
    )}, nejhorší $${worstTrade.toFixed(0)}.`,
    keyMetrics: [
      { label: 'Celkem obchodů', value: weekTrades.length, trend: 'neutral' },
      { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, trend: winRate >= 55 ? 'up' : 'down' },
      { label: 'Týdenní P&L', value: `$${totalPnL.toFixed(0)}`, trend: totalPnL > 0 ? 'up' : 'down' },
      { label: 'Nejlepší obchod', value: `$${bestTrade.toFixed(0)}`, trend: 'up' },
      { label: 'Průměrný obchod', value: `$${avgTrade.toFixed(0)}`, trend: avgTrade >= 0 ? 'up' : 'down' },
    ],
    highlights: highlights.length ? highlights : ['Stabilní týden bez výrazných výkyvů'],
    improvements: improvements.length ? improvements : ['Pokračuj v zapisování obchodů pro hlubší analýzu'],
    nextWeekFocus,
    psychologicalInsights: psychologicalInsights.length
      ? psychologicalInsights
      : ['Nedostatek psychologických dat za tento týden'],
    riskAssessment,
  }
}

export function WeeklyReviewAnalysis() {
  const { user } = useAuth()
  const { isLiveMode, trades } = useData()
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
      setReview(computeDemoWeeklyReview(trades))
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
      setError('Failed to generate weekly review')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (!isLiveMode) {
      setReview(computeDemoWeeklyReview(trades))
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
            <span className="text-slate-300">Generating your weekly review...</span>
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
                Retry
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
              <p className="text-slate-400 text-sm">Not enough data yet. Keep trading to get AI insights!</p>
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
            <CardTitle className="text-indigo-300">Weekly Summary</CardTitle>
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
            <CardTitle className="text-white">Key Metrics</CardTitle>
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
                Highlights
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
                Areas to Improve
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
              Next Week Focus
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
              <CardTitle className="text-pink-300">Psychological Insights</CardTitle>
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
              <CardTitle className="text-cyan-300">Risk Assessment</CardTitle>
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
