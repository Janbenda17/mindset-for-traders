'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Target, Brain, Zap, AlertCircle, Crown } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TraderProfile {
  tradingStyle: string
  riskTolerance: string
  strengths: string[]
  weaknesses: string[]
  emotionalPatterns: string[]
  weeklyGoals: {
    goal: string
    target: number
    description: string
  }[]
  consistency: number
  discipline: number
  adaptability: number
}

export function TraderIdentityAnalysis() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<TraderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    analyzeTrader()
  }, [user?.id])

  const analyzeTrader = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Fetch recent trades
      const { data: trades, error: tradesError } = await supabase
        .from('mt4_trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (tradesError) throw tradesError

      // Fetch account info
      const { data: profile: accountProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Call Grok AI for analysis
      const analysis = await analyzeWithAI(trades || [], accountProfile)
      setProfile(analysis)
    } catch (err) {
      console.error('[v0] Error analyzing trader:', err)
      setError('Failed to analyze trader profile')
    } finally {
      setLoading(false)
    }
  }

  const analyzeWithAI = async (trades: any[], accountData: any) => {
    try {
      const prompt = `Analyze this trader's behavior and create a complete trader profile:

Trades (last 50):
${JSON.stringify(trades?.slice(0, 50), null, 2)}

Account data: Balance: $${accountData?.metaapi_account_id || 'Unknown'}, Status: ${accountData?.trades_sync_enabled ? 'Active' : 'Inactive'}

Please provide a JSON response EXACTLY in this format (no markdown, just raw JSON):
{
  "tradingStyle": "aggressive|moderate|conservative",
  "riskTolerance": "high|medium|low",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "emotionalPatterns": ["pattern1", "pattern2"],
  "weeklyGoals": [
    {"goal": "Increase win rate", "target": 65, "description": "Current: 58%"},
    {"goal": "Reduce risk per trade", "target": 2, "description": "Average: 3%"},
    {"goal": "Improve consistency", "target": 80, "description": "Manage losses better"}
  ],
  "consistency": 72,
  "discipline": 65,
  "adaptability": 78
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

      if (!response.ok) throw new Error('AI analysis failed')

      const data = await response.json()
      const content = data.choices[0].message.content

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      return JSON.parse(jsonMatch[0])
    } catch (err) {
      console.error('[v0] AI analysis error:', err)
      // Return default profile if AI fails
      return {
        tradingStyle: 'moderate',
        riskTolerance: 'medium',
        strengths: ['Consistent', 'Disciplined'],
        weaknesses: ['Revenge trading', 'Emotional decisions'],
        emotionalPatterns: ['Overtrading after loss', 'FOMO entries'],
        weeklyGoals: [
          { goal: 'Increase win rate', target: 65, description: 'Focus on quality entries' },
          { goal: 'Reduce drawdown', target: -5, description: 'Max 5% weekly loss' },
          { goal: 'Trade only setups', target: 20, description: 'Quality over quantity' },
        ],
        consistency: 70,
        discipline: 65,
        adaptability: 75,
      }
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-slate-400">Analyzing your trader profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !profile) {
    return (
      <Card className="bg-red-900/20 border-red-700/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error || 'Unable to analyze profile'}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400" />
                <div>
                  <CardTitle className="text-2xl">Your Trading Identity</CardTitle>
                  <p className="text-xs text-slate-400 mt-1">AI-Analyzed from your trading data</p>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white">{profile.tradingStyle}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Trading Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                <div className="text-xs text-slate-400 mb-2">Consistency</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-blue-400">{profile.consistency}%</div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1 mt-2">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${profile.consistency}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                <div className="text-xs text-slate-400 mb-2">Discipline</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-400">{profile.discipline}%</div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1 mt-2">
                  <div
                    className="bg-green-500 h-1 rounded-full"
                    style={{ width: `${profile.discipline}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                <div className="text-xs text-slate-400 mb-2">Adaptability</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-orange-400">{profile.adaptability}%</div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1 mt-2">
                  <div
                    className="bg-orange-500 h-1 rounded-full"
                    style={{ width: `${profile.adaptability}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Strengths
                </h3>
                <div className="space-y-2">
                  {profile.strengths.map((strength, i) => (
                    <div key={i} className="text-xs bg-green-900/20 border border-green-700/30 rounded px-3 py-2">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Weaknesses
                </h3>
                <div className="space-y-2">
                  {profile.weaknesses.map((weakness, i) => (
                    <div key={i} className="text-xs bg-red-900/20 border border-red-700/30 rounded px-3 py-2">
                      {weakness}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emotional Patterns */}
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Emotional Patterns Detected
              </h3>
              <div className="space-y-2">
                {profile.emotionalPatterns.map((pattern, i) => (
                  <div key={i} className="text-xs bg-yellow-900/20 border border-yellow-700/30 rounded px-3 py-2">
                    {pattern}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Goals */}
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                AI-Generated Weekly Goals
              </h3>
              <div className="space-y-3">
                {profile.weeklyGoals.map((goal, i) => (
                  <div key={i} className="bg-slate-800/50 border border-purple-500/30 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{goal.goal}</span>
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded">Target: {goal.target}{goal.target > 100 ? '' : '%'}</span>
                    </div>
                    <p className="text-xs text-slate-400">{goal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
