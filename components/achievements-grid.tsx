"use client"

import { useGamification } from "@/contexts/gamification-context"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Lock } from "lucide-react"

export function AchievementsGrid() {
  const { data } = useGamification()

  const unlockedCount = data.achievements.filter((a) => a.unlocked).length
  const totalCount = data.achievements.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Odznaky</h2>
          <p className="text-muted-foreground">
            Odemknuté: {unlockedCount}/{totalCount}
          </p>
        </div>
        <div className="text-right">
          <Progress value={(unlockedCount / totalCount) * 100} className="w-32 h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`transition-all ${
              achievement.unlocked
                ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                : "bg-muted/30 border-muted opacity-60"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    {achievement.unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-400 font-semibold">+{achievement.xpReward} XP</span>
                  </div>
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.target && (
                    <div className="mt-3 space-y-1">
                      <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.target}
                      </p>
                    </div>
                  )}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Odemknuto: {new Date(achievement.unlockedAt).toLocaleDateString("cs-CZ")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
