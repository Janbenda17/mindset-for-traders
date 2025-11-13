"use client"

import { useState } from "react"
import { useGamification, AVAILABLE_CHALLENGES } from "@/contexts/gamification-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Trophy, Target, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ChallengesSection() {
  const { data, startChallenge } = useGamification()
  const [selectedTab, setSelectedTab] = useState<"active" | "available" | "completed">("active")

  const activeChallenges = data.challenges.filter((c) => c.active && !c.completed)
  const completedChallenges = data.challenges.filter((c) => c.completed)
  const availableChallenges = AVAILABLE_CHALLENGES.filter(
    (template) => !data.challenges.some((c) => c.id === template.id),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Výzvy
          </h2>
          <p className="text-muted-foreground">Dokončeno: {completedChallenges.length} výzev</p>
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
          Aktivní ({activeChallenges.length})
        </button>
        <button
          onClick={() => setSelectedTab("available")}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === "available"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dostupné ({availableChallenges.length})
        </button>
        <button
          onClick={() => setSelectedTab("completed")}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === "completed"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dokončené ({completedChallenges.length})
        </button>
      </div>

      {/* Active Challenges */}
      {selectedTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeChallenges.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nemáš žádné aktivní výzvy. Začni novou výzvu z dostupných!</p>
              </CardContent>
            </Card>
          ) : (
            activeChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{challenge.title}</span>
                    <Badge variant="secondary">Aktivní</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {challenge.current}/{challenge.target}
                      </span>
                    </div>
                    <Progress value={(challenge.current / challenge.target) * 100} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Začato: {new Date(challenge.startDate).toLocaleDateString("cs-CZ")}</span>
                    </div>
                    <span className="text-purple-400 font-semibold">+{challenge.xpReward} XP</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Available Challenges */}
      {selectedTab === "available" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableChallenges.map((challenge) => (
            <Card key={challenge.id} className="hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle>{challenge.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{challenge.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Cíl: </span>
                    <span className="font-semibold">
                      {challenge.target} {challenge.type === "streak" ? "dní" : "krát"}
                    </span>
                  </div>
                  <span className="text-purple-400 font-semibold">+{challenge.xpReward} XP</span>
                </div>

                <Button onClick={() => startChallenge(challenge.id)} className="w-full" variant="default">
                  Začít výzvu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Challenges */}
      {selectedTab === "completed" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedChallenges.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Zatím jsi nedokončil žádnou výzvu. Začni svou první!</p>
              </CardContent>
            </Card>
          ) : (
            completedChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{challenge.title}</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      Dokončeno: {challenge.endDate && new Date(challenge.endDate).toLocaleDateString("cs-CZ")}
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
