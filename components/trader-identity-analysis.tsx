'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, Target, Brain, Zap, AlertCircle, Crown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analyzeTraderProfile } from '@/app/actions/ai-analysis'
import { cn } from '@/lib/utils'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!user?.id || !hasStarted) return
    analyzeTrader()
  }, [user?.id, hasStarted])

  const analyzeTrader = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const analysis = await analyzeTraderProfile(user.id)
      setProfile(analysis)
    } catch (err) {
      console.error('[v0] Error analyzing trader:', err)
      setError('Failed to analyze trader profile')
    } finally {
      setLoading(false)
    }
  }

  // Show empty state if not started
  if (!hasStarted) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-card/50 overflow-hidden">
        <CardContent className="pt-12 pb-12">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Crown className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="space-y-3 max-w-md">
              <h3 className="text-2xl font-bold text-white">Discover Your Trading Identity</h3>
              <p className="text-muted-foreground text-sm">AI-powered analysis reveals your unique trader profile based on your trading behavior, psychology, and performance patterns</p>
            </div>
            <Button
              onClick={() => setHasStarted(true)}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white gap-2 px-8 mt-2"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
              <p className="text-white font-semibold">Analyzing your profile...</p>
              <p className="text-muted-foreground text-sm mt-1">This may take a moment</p>
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
                onClick={() => {
                  setHasStarted(false)
                  setError(null)
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
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
      {/* Header Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-primary" />
                Your Trading Identity
              </CardTitle>
              <p className="text-muted-foreground text-sm">AI-generated profile from your trading behavior</p>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-base px-4 py-2 whitespace-nowrap">
              {profile.tradingStyle}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Trading Style", value: profile.tradingStyle },
              { label: "Risk Tolerance", value: profile.riskTolerance },
              { label: "Profile Type", value: "Professional" }
            ].map((item) => (
              <div key={item.label} className="space-y-2 p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-lg font-semibold text-white capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics */}
      <Card className="border-border/50">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Trading Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            {[
              { label: "Consistency", value: profile.consistency, color: "from-blue-500 to-cyan-500" },
              { label: "Discipline", value: profile.discipline, color: "from-green-500 to-emerald-500" },
              { label: "Adaptability", value: profile.adaptability, color: "from-purple-500 to-pink-500" }
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{metric.label}</span>
                  <span className="text-sm font-bold text-primary">{metric.value}%</span>
                </div>
                <div className="w-full h-2 bg-card/50 rounded-full overflow-hidden border border-border/50">
                  <div
                    className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-1000`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-card">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {profile.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-sm text-foreground">{strength}</span>
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
              {profile.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">⚡</span>
                  <span className="text-sm text-foreground">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Patterns */}
      <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-card">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Brain className="w-5 h-5" />
            Emotional Patterns Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.emotionalPatterns.map((pattern, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
                <p className="text-sm text-foreground">{pattern}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <Card className="border-border/50 bg-gradient-to-br from-cyan-500/5 to-card">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Target className="w-5 h-5" />
            This Week's Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {profile.weeklyGoals.map((goal, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{goal.goal}</h4>
                  </div>
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">Target: {goal.target}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{goal.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
