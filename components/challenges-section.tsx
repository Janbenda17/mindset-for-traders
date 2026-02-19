"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Trophy, Target, Calendar, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Challenge {
  id: string
  title: string
  description: string
  type: string
  target: number
  difficulty: string
  xpReward: number
  category: string
  progress?: number
  completed?: boolean
  joined_at?: string
  completed_at?: string
}

export function ChallengesSection() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState<"active" | "available" | "completed">("active")
  const [active, setActive] = useState<Challenge[]>([])
  const [available, setAvailable] = useState<Challenge[]>([])
  const [completed, setCompleted] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadChallenges()
  }, [user])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/challenges")
      const data = await res.json()

      if (data.active) setActive(data.active)
      if (data.available) setAvailable(data.available)
      if (data.completed) setCompleted(data.completed)
    } catch (error) {
      console.error("[v0] Error loading challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  const startChallenge = async (challengeId: string) => {
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, action: "start" }),
      })

      if (res.ok) {
        console.log("[v0] Challenge started:", challengeId)
        await loadChallenges()
      } else {
        const error = await res.json()
        console.error("[v0] Error starting challenge:", error.error)
      }
    } catch (error) {
      console.error("[v0] Error starting challenge:", error)
    }
  }

  const updateProgress = async (challengeId: string, newProgress: number) => {
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, action: "update", progress: newProgress }),
      })

      if (res.ok) {
        const result = await res.json()
        console.log("[v0] Challenge progress updated:", challengeId, newProgress)
        if (result.completed) {
          console.log("[v0] Challenge completed! XP awarded:", result.xpAwarded)
        }
        await loadChallenges()
      }
    } catch (error) {
      console.error("[v0] Error updating challenge:", error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "hard":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "elite":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Výzvy
          </h2>
          <p className="text-muted-foreground">Dokončeno: {completed.length} výzev</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setSelectedTab("active")}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === "active"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Spuštěné ({active.length})
        </button>
        <button
          onClick={() => setSelectedTab("available")}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === "available"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dostupné ({available.length})
        </button>
        <button
          onClick={() => setSelectedTab("completed")}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === "completed"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dokončené ({completed.length})
        </button>
      </div>

      {/* Active Challenges - Spuštěné výzvy */}
      {selectedTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nemáš žádné spuštěné výzvy. Začni novou!</p>
              </CardContent>
            </Card>
          ) : (
            active.map((challenge) => (
              <Card
                key={challenge.id}
                className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex-1">{challenge.title}</span>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {challenge.progress || 0}/{challenge.target}</span>
                      <span className="font-semibold">{Math.round(((challenge.progress || 0) / challenge.target) * 100)}%</span>
                    </div>
                    <Progress value={((challenge.progress || 0) / challenge.target) * 100} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                    <span className="text-purple-400 font-semibold">+{challenge.xpReward} XP</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateProgress(challenge.id, (challenge.progress || 0) + 1)}
                    >
                      +1 Progres
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Available Challenges - Dostupné výzvy */}
      {selectedTab === "available" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {available.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Všechny dostupné výzvy jsi už začal!</p>
              </CardContent>
            </Card>
          ) : (
            available.map((challenge) => (
              <Card key={challenge.id} className="hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex-1">{challenge.title}</span>
                    <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Cíl: <span className="font-semibold text-foreground">{challenge.target}</span>
                    </span>
                    <span className="text-purple-400 font-semibold">+{challenge.xpReward} XP</span>
                  </div>

                  <Button onClick={() => startChallenge(challenge.id)} className="w-full">
                    Začít výzvu
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Challenges - Dokončené výzvy */}
      {selectedTab === "completed" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completed.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Zatím jsi nedokončil žádnou výzvu.</p>
              </CardContent>
            </Card>
          ) : (
            completed.map((challenge) => (
              <Card
                key={challenge.id}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex-1">{challenge.title}</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="flex items-center justify-between text-sm border-t border-slate-700/50 pt-3">
                    <div className="text-muted-foreground">
                      Dokončeno:{" "}
                      {challenge.completed_at &&
                        new Date(challenge.completed_at).toLocaleDateString("cs-CZ")}
                    </div>
                    <span className="text-green-400 font-semibold">+{challenge.xpReward} XP</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
