"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Trophy, Calendar, Target } from "lucide-react"
import { useChallenges } from "@/contexts/community-challenges-context"

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
  const { userProgress, joinChallenge, leaveChallenge } = useChallenges()

  const userChallengeProgress = userProgress.find((p) => p.challengeId === challenge.id)
  const isJoined = !!userChallengeProgress
  const progress = userChallengeProgress?.progress || 0
  const isCompleted = userChallengeProgress?.completed || false

  const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const difficultyColor = {
    easy: "bg-green-500/20 text-green-400 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hard: "bg-red-500/20 text-red-400 border-red-500/30",
  }[challenge.difficulty]

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-blue-500/30 transition-all">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
              <Badge className={`${difficultyColor} border`}>{challenge.difficulty}</Badge>
              {isCompleted && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border">Completed</Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">{challenge.description}</p>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{challenge.reward} XP</span>
          </div>
        </div>

        {isJoined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{challenge.participants} joined</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>{challenge.completed} completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{daysLeft} days left</span>
          </div>
        </div>

        <div className="pt-2">
          {isJoined ? (
            <Button
              variant="outline"
              className="w-full border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 bg-transparent"
              onClick={() => leaveChallenge(challenge.id)}
              disabled={isCompleted}
            >
              {isCompleted ? "Completed" : "Leave Challenge"}
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => joinChallenge(challenge.id)}
            >
              Join Challenge
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
