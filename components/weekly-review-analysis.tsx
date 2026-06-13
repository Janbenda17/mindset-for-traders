'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
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

export function WeeklyReviewAnalysis() {
  const { user } = useAuth()
  const [review, setReview] = useState<WeeklyReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    generateReview()
  }, [user?.id])

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
                onClick={generateReview}
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

  if (!review) return null

  return (
    <div className="space-y-6">
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
