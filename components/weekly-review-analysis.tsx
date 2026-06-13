'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

      const weeklyReview = await generateWeeklyReview(user.id)
      setReview(weeklyReview)
    } catch (err) {
      console.error('[v0] Error generating weekly review:', err)
      setError('Failed to generate weekly review')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
              <div className="relative inset-0 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Generating your weekly review...</p>
              <p className="text-muted-foreground text-sm mt-1">Analyzing your trading data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-3">{error}</h3>
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

  if (!review) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-card/50 to-transparent">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Weekly Review</h3>
              <p className="text-muted-foreground">Not enough data yet. Keep trading to unlock AI insights!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-foreground leading-relaxed text-sm">{review.summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="border-border/50">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {review.keyMetrics.map((metric, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-card/50 border border-border/50 text-center hover:border-primary/30 transition-colors">
                <div className="flex justify-center mb-2">
                  {metric.trend === 'up' && <TrendingUp className="w-5 h-5 text-profit" />}
                  {metric.trend === 'down' && <TrendingDown className="w-5 h-5 text-loss" />}
                  {metric.trend === 'neutral' && <div className="w-5 h-5 text-muted-foreground text-xs flex items-center justify-center">—</div>}
                </div>
                <p className="text-lg font-bold text-white">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Highlights & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {review.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-sm text-foreground">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-orange-500/5 to-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <AlertCircle className="w-5 h-5" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {review.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">→</span>
                  <span className="text-sm text-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Next Week Focus */}
      <Card className="border-border/50 bg-gradient-to-br from-accent/10 to-card">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-accent">
            <Target className="w-5 h-5" />
            Next Week's Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ol className="space-y-3">
            {review.nextWeekFocus.map((focus, idx) => (
              <li key={idx} className="flex gap-4 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-accent/30 transition-colors">
                <span className="text-accent font-bold flex-shrink-0">{idx + 1}.</span>
                <span className="text-sm text-foreground">{focus}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Psychological Insights & Risk Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-accent/10 to-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-accent flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Psychological Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {review.psychologicalInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                  <span className="text-accent flex-shrink-0 mt-0.5">•</span>
                  <span className="text-sm text-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-cyan-500/5 to-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-cyan-400">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-foreground leading-relaxed">{review.riskAssessment}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
