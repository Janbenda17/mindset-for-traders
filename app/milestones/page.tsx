"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Target, TrendingUp } from "lucide-react"
import { useMilestoneCelebrations } from "@/contexts/milestone-celebrations-context"
import { MilestonesDisplay } from "@/components/milestones-display"

export default function MilestonesPage() {
  const { milestones } = useMilestoneCelebrations()

  const unlockedCount = milestones.filter((m) => m.unlocked).length
  const totalRewards = milestones.filter((m) => m.unlocked).reduce((sum, m) => sum + m.reward, 0)
  const completionRate = ((unlockedCount / milestones.length) * 100).toFixed(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Milestones & Achievements</h1>
          <p className="text-slate-400">Track your progress and celebrate your achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Unlocked</p>
                <p className="text-2xl font-bold text-white">
                  {unlockedCount} / {milestones.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Rewards</p>
                <p className="text-2xl font-bold text-white">{totalRewards} XP</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Completion</p>
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Milestones Display */}
        <MilestonesDisplay />
      </div>
    </div>
  )
}
