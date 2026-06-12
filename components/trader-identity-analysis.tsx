'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Target, Brain, Zap, AlertCircle, Crown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analyzeTraderProfile } from '@/app/actions/ai-analysis'

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
      setError(null)
      console.log('[v0] Starting trader analysis for user:', user.id)

      const analysis = await analyzeTraderProfile(user.id)
      setProfile(analysis)
      console.log('[v0] Analysis complete:', analysis)
    } catch (err) {
      console.error('[v0] Error analyzing trader:', err)
      setError('Failed to analyze trader profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3 py-12">
            <Sparkles className="w-5 h-5 animate-spin text-purple-400" />
            <span className="text-slate-300">Analyzing your trading profile...</span>
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
                onClick={analyzeTrader}
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

  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 border-purple-500/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-white mb-2">Your Trading Profile</CardTitle>
                <p className="text-slate-400">AI-generated analysis of your trading behavior</p>
              </div>
              <Crown className="w-8 h-8 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/30 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Trading Style</p>
                <p className="text-xl font-bold text-white capitalize">{profile.tradingStyle}</p>
              </div>
              <div className="bg-slate-900/30 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Risk Tolerance</p>
                <p className="text-xl font-bold text-white capitalize">{profile.riskTolerance}</p>
              </div>
              <div className="bg-slate-900/30 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Overall Profile</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {profile.consistency}% Consistent
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-900/20 to-slate-900/30 border-green-700/30 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <TrendingUp className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-400 font-bold mt-1">✓</span>
                    <span className="text-slate-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-red-900/20 to-slate-900/30 border-red-700/30 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {profile.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-red-400 font-bold mt-1">⚠</span>
                    <span className="text-slate-300">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Emotional Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-orange-900/20 to-slate-900/30 border-orange-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-300">
              <Brain className="w-5 h-5" />
              Emotional Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.emotionalPatterns.map((pattern, idx) => (
                <div key={idx} className="bg-slate-900/30 rounded-lg p-3">
                  <p className="text-slate-300">{pattern}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900/30 border-indigo-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-300">
              <Target className="w-5 h-5" />
              AI-Generated Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.weeklyGoals.map((goal, idx) => (
                <div key={idx} className="bg-slate-900/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-indigo-300">{goal.goal}</h4>
                    <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      Target: {goal.target}%
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">{goal.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-cyan-900/20 to-slate-900/30 border-cyan-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Zap className="w-5 h-5" />
              Trading Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-300">{profile.consistency}%</p>
                <p className="text-xs text-slate-400 mt-1">Consistency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-300">{profile.discipline}%</p>
                <p className="text-xs text-slate-400 mt-1">Discipline</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-300">{profile.adaptability}%</p>
                <p className="text-xs text-slate-400 mt-1">Adaptability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
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
