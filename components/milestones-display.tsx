"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock } from "lucide-react"
import { useMilestoneCelebrations } from "@/contexts/milestone-celebrations-context"
import { useGamification } from "@/contexts/gamification-context"

export function MilestonesDisplay() {
  const { milestones } = useMilestoneCelebrations()
  const { level, xp } = useGamification()

  const journalEntries =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("journal-entries") || "[]") : []
  const streakData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("streak-data") || "{}") : {}

  const stats = {
    level,
    xp,
    trades: journalEntries.length,
    streak: Math.max(
      streakData.journaling?.current || 0,
      streakData.morningCheck?.current || 0,
      streakData.dailyTracker?.current || 0,
    ),
  }

  const getProgress = (milestone: any) => {
    let current = 0
    switch (milestone.type) {
      case "level":
        current = stats.level
        break
      case "xp":
        current = stats.xp
        break
      case "trades":
        current = stats.trades
        break
      case "streak":
        current = stats.streak
        break
    }
    return Math.min((current / milestone.threshold) * 100, 100)
  }

  const unlockedMilestones = milestones.filter((m) => m.unlocked)
  const lockedMilestones = milestones.filter((m) => !m.unlocked)

  return (
    <div className="space-y-6">
      {/* Unlocked Milestones */}
      {unlockedMilestones.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Unlocked Milestones ({unlockedMilestones.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlockedMilestones.map((milestone) => (
              <Card
                key={milestone.id}
                className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="text-4xl">{milestone.badge}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{milestone.title}</h4>
                    <p className="text-sm text-slate-400">{milestone.description}</p>
                    <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border">
                      +{milestone.reward} XP
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Milestones */}
      {lockedMilestones.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-400" />
            Upcoming Milestones ({lockedMilestones.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lockedMilestones.map((milestone) => (
              <Card
                key={milestone.id}
                className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl opacity-50">{milestone.badge}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{milestone.title}</h4>
                      <p className="text-sm text-slate-400">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">{getProgress(milestone).toFixed(0)}%</span>
                    </div>
                    <Progress value={getProgress(milestone)} className="h-2" />
                  </div>
                  <Badge className="bg-slate-800 text-slate-400 border-slate-700 border">
                    Reward: +{milestone.reward} XP
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
