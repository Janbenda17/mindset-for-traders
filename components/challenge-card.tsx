"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Trophy, Calendar, Target, Flame } from "lucide-react"
import { useChallenges } from "@/contexts/community-challenges-context"
import { useState } from "react"

interface ChallengeCardProps {
  challenge: {
    id: string
    title: string
    description: string
    type: string
    startDate: string
    endDate: string
    reward: number
    participants: number
    completed: number
    difficulty: string
    category: string
  }
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { userProgress } = useChallenges()
  const [isCompleting, setIsCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const userChallengeProgress = userProgress.find((p) => p.challengeId === challenge.id)
  const progress = userChallengeProgress?.progress || 0
  const isCompleted = userChallengeProgress?.completed || false

  const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const difficultyColor = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  }[challenge.difficulty]

  const handleCompleteDaily = async () => {
    setIsCompleting(true)
    try {
      const response = await fetch("/api/challenges/complete-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: (window as any).__user?.id,
          challengeId: challenge.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Daily challenge completed:", result)
        setJustCompleted(true)
        setTimeout(() => setJustCompleted(false), 3000)
        
        // Refresh page to show updated progress
        window.location.reload()
      }
    } catch (error) {
      console.error("[v0] Error completing daily challenge:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-blue-500/30 transition-all">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
              <Badge className={`${difficultyColor} border`}>{challenge.difficulty}</Badge>
              {isCompleted && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Splněno
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">{challenge.description}</p>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{challenge.reward} XP</span>
          </div>
        </div>

        {/* Progress bar - shows day streak */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Denní postupy</span>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="font-semibold">{progress}/12 dní</span>
              </div>
            </div>
            <span className="text-white font-medium">{Math.round((progress / 12) * 100)}%</span>
          </div>
          <Progress value={(progress / 12) * 100} className="h-2" />
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{challenge.participants} připojeno</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{challenge.completed} splněno</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{daysLeft} dní zbývá</span>
          </div>
        </div>

        {/* Complete Daily Button */}
        {!isCompleted ? (
          <Button
            onClick={handleCompleteDaily}
            disabled={isCompleting || justCompleted}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold"
          >
            {justCompleted ? (
              "✓ Splněno dnes!"
            ) : isCompleting ? (
              "Ukládání..."
            ) : (
              "Splnit dneška úkol"
            )}
          </Button>
        ) : (
          <div className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center text-green-400 font-semibold">
            Výzva splněna! +{challenge.reward} XP
          </div>
        )}
      </div>
    </Card>
  )
}
