"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Lock } from "lucide-react"
import { useGamification } from "@/contexts/gamification-context"

interface Badge {
  id: string
  title: string
  description: string
  icon: string
  target: number
  xpReward: number
  category: string
  progress: number
  completed: boolean
  completed_at?: string
}

export function AchievementsGrid() {
  const { user } = useAuth()
  const { data } = useGamification()
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadBadges()
  }, [user])

  const loadBadges = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/badges")
      const data = await res.json()
      if (data.badges) {
        setBadges(data.badges)
      }
    } catch (error) {
      console.error("[v0] Error loading badges:", error)
    } finally {
      setLoading(false)
    }
  }

  const unlockedCount = badges.filter((b) => b.completed).length
  const totalCount = badges.length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-700/30 rounded animate-pulse" />
      </div>
    )
  }

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
        {badges.map((badge) => (
          <Card
            key={badge.id}
            className={`transition-all ${
              badge.completed
                ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                : "bg-muted/30 border-muted opacity-70"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{badge.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{badge.title}</h3>
                    {badge.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-400 font-semibold">+{badge.xpReward} XP</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <Progress value={(badge.progress / badge.target) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {badge.progress}/{badge.target}
                    </p>
                  </div>

                  {/* Completion Date */}
                  {badge.completed && badge.completed_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Odemknuto: {new Date(badge.completed_at).toLocaleDateString("cs-CZ")}
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
