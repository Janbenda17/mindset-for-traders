"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Trophy, Calendar, TrendingUp, Award, AlertTriangle, Target } from "lucide-react"
import { useStreak } from "@/contexts/streak-context"

export default function StreaksPage() {
  const { streaks, getTotalStreak, getStreakMultiplier } = useStreak()
  const totalStreak = getTotalStreak()
  const multiplier = getStreakMultiplier()

  const allStreaks = [
    { type: "journaling", label: "Journaling", icon: Calendar, data: streaks.journaling, color: "blue" },
    { type: "morningCheck", label: "Morning Check", icon: TrendingUp, data: streaks.morningCheck, color: "green" },
    { type: "dailyTracker", label: "Daily Tracker", icon: Award, data: streaks.dailyTracker, color: "purple" },
  ]

  const getStreakLevel = (current: number) => {
    if (current >= 100) return { level: "Legendary", color: "purple" }
    if (current >= 30) return { level: "Master", color: "orange" }
    if (current >= 7) return { level: "Committed", color: "yellow" }
    return { level: "Building", color: "slate" }
  }

  return (
    <div className="min-h-screen bg-transparent pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Flame className="h-10 w-10 text-orange-400" />
              Streak System
            </h1>
            <p className="text-gray-400">Build consistency and earn rewards</p>
          </div>
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-lg px-4 py-2">
            {multiplier}x XP Multiplier
          </Badge>
        </div>

        {/* Total Streak Overview */}
        <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Flame className="h-16 w-16 text-orange-400" />
                <span className="text-6xl font-bold text-white">{totalStreak}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Total Active Days</h2>
              <p className="text-slate-400">Keep all your streaks alive to maximize your XP multiplier</p>
            </div>
          </CardContent>
        </Card>

        {/* Individual Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allStreaks.map((streak) => {
            const Icon = streak.icon
            const level = getStreakLevel(streak.data.current)
            const nextMilestone = streak.data.current < 7 ? 7 : streak.data.current < 30 ? 30 : 100
            const progress = (streak.data.current / nextMilestone) * 100

            return (
              <Card key={streak.type} className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-6 w-6 text-${streak.color}-400`} />
                    <Badge className={`bg-${level.color}-500/20 text-${level.color}-300 border-${level.color}-500/30`}>
                      {level.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-white">{streak.label}</CardTitle>
                  <CardDescription className="text-slate-400">Current: {streak.data.current} days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-4xl font-bold text-white mb-1">{streak.data.current}</div>
                    <div className="text-sm text-slate-400">Current Streak</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress to {nextMilestone} days</span>
                      <span className="text-white font-semibold">{Math.min(progress, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-slate-300">Best Streak</span>
                    </div>
                    <span className="text-lg font-bold text-white">{streak.data.longest}</span>
                  </div>

                  {streak.data.lastEntry && (
                    <div className="text-xs text-slate-500 text-center">
                      Last entry: {new Date(streak.data.lastEntry).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Streak Rewards */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              <CardTitle className="text-white">Streak Milestones & Rewards</CardTitle>
            </div>
            <CardDescription className="text-slate-400">Reach these milestones to earn bonus XP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-yellow-400" />
                  <span className="font-bold text-white">7 Days</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">Committed Trader</p>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">+50 XP</Badge>
              </div>

              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <span className="font-bold text-white">30 Days</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">Master of Consistency</p>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">+200 XP</Badge>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-purple-400" />
                  <span className="font-bold text-white">100 Days</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">Legendary Discipline</p>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">+1000 XP</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card className="bg-red-900/20 border-red-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-white">Streak Consequences</CardTitle>
            </div>
            <CardDescription className="text-slate-400">Breaking a streak has consequences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">XP Loss</p>
                  <p className="text-sm text-slate-300">
                    Breaking a streak of 7+ days results in XP loss: 5 XP per day (max 500 XP)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Multiplier Reset</p>
                  <p className="text-sm text-slate-300">
                    Your XP multiplier is recalculated based on your active streaks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Progress Loss</p>
                  <p className="text-sm text-slate-300">You'll need to rebuild your streak from day 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
