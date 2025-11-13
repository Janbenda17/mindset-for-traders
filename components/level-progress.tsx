"use client"

import { useGamification, LEVEL_XP_REQUIREMENTS, LEVEL_INFO } from "@/contexts/gamification-context"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function LevelProgress() {
  const { data, getLevelInfo } = useGamification()

  const currentLevelXP = LEVEL_XP_REQUIREMENTS[data.level - 1] || 0
  const nextLevelXP = LEVEL_XP_REQUIREMENTS[data.level] || currentLevelXP + 1000
  const xpInCurrentLevel = data.xp - currentLevelXP
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100

  const levelInfo = getLevelInfo(data.level)
  const isMaxLevel = data.level >= 10

  const aiPacingMultiplier = data.aiPacingMultiplier ?? 1.0
  const psychMetrics = data.psychMetrics ?? {
    calmScore: 0,
    focusRating: 0,
    recoveryIndex: 0,
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Tvůj Level</div>
            <div className="text-3xl font-bold text-purple-400">{levelInfo.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{levelInfo.description}</div>
            <Badge variant="outline" className="mt-2">
              {levelInfo.phase}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">MindPoints</div>
            <div className="text-2xl font-bold">{data.xp.toLocaleString()}</div>
            {aiPacingMultiplier !== 1.0 && (
              <div className="text-xs text-muted-foreground mt-1">
                XP multiplikátor: {aiPacingMultiplier.toFixed(1)}x
              </div>
            )}
          </div>
        </div>

        {!isMaxLevel && (
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{xpInCurrentLevel} XP</span>
              <span>
                {xpNeededForNextLevel - xpInCurrentLevel} XP do{" "}
                {LEVEL_INFO[data.level]?.name || `Level ${data.level + 1}`}
              </span>
            </div>
          </div>
        )}

        {isMaxLevel && (
          <div className="text-center py-4">
            <div className="text-lg font-semibold text-purple-400">🎉 Mind Master Dosažen!</div>
            <div className="text-sm text-muted-foreground mt-1">Dosáhl jsi vrcholu mentálního mistrovství</div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{psychMetrics.calmScore}</div>
            <div className="text-xs text-muted-foreground">Calm Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{psychMetrics.focusRating}</div>
            <div className="text-xs text-muted-foreground">Focus Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{psychMetrics.recoveryIndex}</div>
            <div className="text-xs text-muted-foreground">Recovery Index</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
