"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Calendar, TrendingUp, Award } from "lucide-react"
import { useStreak } from "@/contexts/streak-context"

export function StreakDisplay() {
  const { streaks, getTotalStreak, getStreakMultiplier } = useStreak()
  const totalStreak = getTotalStreak()
  const multiplier = getStreakMultiplier()

  const getStreakColor = (current: number) => {
    if (current >= 100) return "text-purple-400"
    if (current >= 30) return "text-orange-400"
    if (current >= 7) return "text-yellow-400"
    return "text-slate-400"
  }

  const getNextMilestone = (current: number) => {
    if (current < 7) return { target: 7, label: "7-day streak" }
    if (current < 30) return { target: 30, label: "30-day streak" }
    if (current < 100) return { target: 100, label: "100-day streak" }
    return { target: current + 100, label: "Next century" }
  }

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <CardTitle className="text-white">Streak System</CardTitle>
          </div>
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">{multiplier}x XP Multiplier</Badge>
        </div>
        <CardDescription className="text-slate-400">Maintain your streaks to earn bonus XP</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Streak */}
        <div className="text-center p-6 bg-slate-900/50 rounded-lg border border-orange-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className={`h-8 w-8 ${getStreakColor(totalStreak)}`} />
            <span className="text-4xl font-bold text-white">{totalStreak}</span>
          </div>
          <p className="text-slate-400 text-sm">Total Active Days</p>
        </div>

        {/* Individual Streaks */}
        <div className="space-y-4">
          {/* Journaling Streak */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Journaling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStreakColor(streaks.journaling.current)}`}>
                  {streaks.journaling.current}
                </span>
                <span className="text-xs text-slate-500">/ {streaks.journaling.longest} best</span>
              </div>
            </div>
            <Progress
              value={(streaks.journaling.current / getNextMilestone(streaks.journaling.current).target) * 100}
              className="h-2"
            />
            <p className="text-xs text-slate-500">
              {getNextMilestone(streaks.journaling.current).target - streaks.journaling.current} days to{" "}
              {getNextMilestone(streaks.journaling.current).label}
            </p>
          </div>

          {/* Morning Check Streak */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">Morning Check</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStreakColor(streaks.morningCheck.current)}`}>
                  {streaks.morningCheck.current}
                </span>
                <span className="text-xs text-slate-500">/ {streaks.morningCheck.longest} best</span>
              </div>
            </div>
            <Progress
              value={(streaks.morningCheck.current / getNextMilestone(streaks.morningCheck.current).target) * 100}
              className="h-2"
            />
            <p className="text-xs text-slate-500">
              {getNextMilestone(streaks.morningCheck.current).target - streaks.morningCheck.current} days to{" "}
              {getNextMilestone(streaks.morningCheck.current).label}
            </p>
          </div>

          {/* Daily Tracker Streak */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Daily Tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getStreakColor(streaks.dailyTracker.current)}`}>
                  {streaks.dailyTracker.current}
                </span>
                <span className="text-xs text-slate-500">/ {streaks.dailyTracker.longest} best</span>
              </div>
            </div>
            <Progress
              value={(streaks.dailyTracker.current / getNextMilestone(streaks.dailyTracker.current).target) * 100}
              className="h-2"
            />
            <p className="text-xs text-slate-500">
              {getNextMilestone(streaks.dailyTracker.current).target - streaks.dailyTracker.current} days to{" "}
              {getNextMilestone(streaks.dailyTracker.current).label}
            </p>
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Streak Rewards</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>7 days</span>
              <span className="text-yellow-400">+50 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>30 days</span>
              <span className="text-orange-400">+200 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>100 days</span>
              <span className="text-purple-400">+1000 XP</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-300">
            Warning: Breaking a streak of 7+ days will result in XP loss (5 XP per day, max 500 XP)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
