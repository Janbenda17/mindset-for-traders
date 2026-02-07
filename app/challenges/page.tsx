"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, TrendingUp, Medal, Crown } from "lucide-react"
import { useChallenges } from "@/contexts/community-challenges-context"
import { ChallengeCard } from "@/components/challenge-card"

export default function ChallengesPage() {
  const { challenges, leaderboard, userProgress, isLoading } = useChallenges()

  const activeChallenges = challenges.filter((c) => new Date(c.endDate) > new Date())
  const myChallenges = activeChallenges.filter((c) => userProgress.some((p) => p.challengeId === c.id))

  const myStats = {
    joined: myChallenges.length,
    completed: userProgress.filter((p) => p.completed).length,
    totalPoints: userProgress
      .filter((p) => p.completed)
      .reduce((sum, p) => {
        const challenge = challenges.find((c) => c.challengeId === p.challengeId)
        return sum + (challenge?.reward || 0)
      }, 0),
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">Loading challenges...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Komunitní výzvy</h1>
          <p className="text-slate-400">Připojte se k týdenním výzvám, soutěžte s dalšími tradera a získejte odměny</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Připojené výzvy</p>
                <p className="text-2xl font-bold text-white">{myStats.joined}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Dokončeno</p>
                <p className="text-2xl font-bold text-white">{myStats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Celkem získaných bodů</p>
                <p className="text-2xl font-bold text-white">{myStats.totalPoints} XP</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="all">Všechny výzvy</TabsTrigger>
            <TabsTrigger value="my">Moje výzvy</TabsTrigger>
            <TabsTrigger value="leaderboard">Žebříček</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my" className="space-y-4">
            {myChallenges.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <div className="p-12 text-center">
                  <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Žádné aktivní výzvy</h3>
                  <p className="text-slate-400">Připojte se k výzvě pro začátek!</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {myChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white">Top obchodníci</h2>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 text-white font-bold">
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          ) : entry.rank === 2 ? (
                            <Medal className="w-5 h-5 text-slate-300" />
                          ) : (
                            <Medal className="w-5 h-5 text-amber-600" />
                          )
                        ) : (
                          entry.rank
                        )}
                      </div>

                      <div className="text-2xl">{entry.avatar}</div>

                      <div className="flex-1">
                        <p className="font-semibold text-white">{entry.username}</p>
                        <p className="text-sm text-slate-400">{entry.challengesCompleted} dokončené výzvy</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-400">{entry.points}</p>
                        <p className="text-xs text-slate-400">bodů</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
