"use client"

import { LevelProgress } from "@/components/level-progress"
import { AchievementsGrid } from "@/components/achievements-grid"
import { ChallengesSection } from "@/components/challenges-section"
import { useGamification } from "@/contexts/gamification-context"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Target, Flame, Star } from "lucide-react"

export default function RewardsPage() {
  const { data } = useGamification()

  const stats = [
    {
      label: "Celkové XP",
      value: data.xp.toLocaleString(),
      icon: Star,
      color: "text-purple-400",
    },
    {
      label: "Odemknuté odznaky",
      value: `${data.achievements.filter((a) => a.unlocked).length}/${data.achievements.length}`,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      label: "Dokončené výzvy",
      value: data.stats.challengesCompleted,
      icon: Target,
      color: "text-blue-400",
    },
    {
      label: "Nejdelší streak",
      value: Math.max(...Object.values(data.streaks)),
      icon: Flame,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Odměny & Achievementy</h1>
        <p className="text-muted-foreground">Sleduj svůj progress, odemykej odznaky a dokončuj výzvy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Progress */}
      <LevelProgress />

      {/* Challenges */}
      <ChallengesSection />

      {/* Achievements */}
      <AchievementsGrid />
    </div>
  )
}
