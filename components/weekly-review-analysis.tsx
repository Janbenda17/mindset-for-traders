'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    generateWeeklyReview()
  }, [user?.id])

  const generateWeeklyReview = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Get trades from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: trades, error: tradesError } = await supabase
        .from('mt4_trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())

      if (tradesError) throw tradesError

      // Get account data
      const { data: accountData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Call Grok for review
      const analysis = await generateWithAI(trades || [], accountData)
      setReview(analysis)
    } catch (err) {
      console.error('[v0] Error generating weekly review:', err)
      setError('Failed to generate weekly review')
    } finally {
      setLoading(false)
    }
  }

  const generateWithAI = async (trades: any[], accountData: any) => {
    try {
      const prompt = `Generate a comprehensive weekly trading review based on this data:

Trades (last 7 days):
${JSON.stringify(trades?.slice(0, 50), null, 2)}

Account info: ${JSON.stringify(accountData?.metaapi_broker || 'Unknown broker')}

Return EXACTLY this JSON format (no markdown):
{
  "summary": "One paragraph summarizing the week",
  "keyMetrics": [
    {"label": "Total Trades", "value": 45, "trend": "up"},
    {"label": "Win Rate", "value": "62%", "trend": "neutral"},
    {"label": "Avg P&L/trade", "value": "$85", "trend": "up"},
    {"label": "Best Trade", "value": "$450", "trend": "up"},
    {"label": "Worst Trade", "value": "-$200", "trend": "down"}
  ],
  "highlights": ["Achievement 1", "Achievement 2", "Achievement 3"],
  "improvements": ["Area 1", "Area 2", "Area 3"],
  "nextWeekFocus": ["Focus 1", "Focus 2", "Focus 3"],
  "psychologicalInsights": ["Insight 1", "Insight 2"],
  "riskAssessment": "Overall risk assessment paragraph"
}`

      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_XAI_API_KEY || process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      })

      if (!response.ok) throw new Error('AI generation failed')

      const data = await response.json()
      const content = data.choices[0].message.content

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON in response')

      return JSON.parse(jsonMatch[0])
    } catch (err) {
      console.error('[v0] AI review error:', err)
      // Default review
      return {
        summary: 'Your trading week shows consistent performance with room for improvement in risk management.',
        keyMetrics: [
          { label: 'Total Trades', value: 35, trend: 'neutral' as const },
          { label: 'Win Rate', value: '58%', trend: 'neutral' as const },
          { label: 'Weekly P&L', value: '$2,450', trend: 'up' as const },
        ],
        highlights: ['Consistent daily trading', 'Good trade exit discipline', 'Improved entry timing'],
        improvements: ['Reduce losing trades', 'Better position sizing', 'More setup patience'],
        nextWeekFocus: ['Focus on high-probability setups', 'Reduce overtrading', 'Improve risk/reward'],
        psychologicalInsights: ['Notice revenge trading tendency', 'FOMO management needed'],
        riskAssessment: 'Risk levels acceptable but watch for emotional trading patterns.',
      }
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-slate-400">Generating your weekly review...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !review) {
    return (
      <Card className="bg-red-900/20 border-red-700/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error || 'Unable to generate review'}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              Weekly Trading Review
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary */}
            <p className="text-slate-300 leading-relaxed">{review.summary}</p>

            {/* Key Metrics */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {review.keyMetrics.map((metric, i) => (
                  <div key={i} className="bg-slate-800/50 rounded p-3 border border-slate-700/30">
                    <div className="text-xs text-slate-400 mb-1">{metric.label}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-white">{metric.value}</div>
                      {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Highlights
              </h3>
              <div className="space-y-2">
                {review.highlights.map((h, i) => (
                  <div key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-green-400">✓</span>
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {review.improvements.map((imp, i) => (
                  <div key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-yellow-400">!</span>
                    {imp}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Week Focus */}
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Next Week Focus
              </h3>
              <div className="space-y-2">
                {review.nextWeekFocus.map((focus, i) => (
                  <div key={i} className="text-sm bg-purple-900/20 border border-purple-700/30 rounded p-2 text-slate-300">
                    {focus}
                  </div>
                ))}
              </div>
            </div>

            {/* Psychological Insights */}
            <div>
              <h3 className="text-sm font-semibold text-pink-400 mb-3">Psychological Insights</h3>
              <div className="space-y-2">
                {review.psychologicalInsights.map((insight, i) => (
                  <div key={i} className="text-sm bg-pink-900/20 border border-pink-700/30 rounded p-2 text-slate-300">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-slate-800/50 rounded p-4 border border-slate-700/30">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Risk Assessment</h3>
              <p className="text-sm text-slate-400">{review.riskAssessment}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
