"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Calendar, Users, Award, TrendingUp, Clock, Star, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function Challenges() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h1>
          <Button asChild>
            <Link href="/login">Přihlásit se</Link>
          </Button>
        </div>
      </div>
    )
  }

  const activeChallenge = {
    id: 1,
    title: "30-denní konzistentnost",
    description: "Obchodujte každý den po dobu 30 dní s dodržením risk managementu",
    progress: 18,
    total: 30,
    reward: "Premium badge + $100 bonus",
    participants: 156,
    timeLeft: "12 dní",
  }

  const upcomingChallenges = [
    {
      id: 2,
      title: "Týdenní profit challenge",
      description: "Dosáhněte 5% zisku za týden s max. 2% rizikem na obchod",
      startDate: "Za 5 dní",
      duration: "7 dní",
      reward: "Gold badge + Mentoring session",
      difficulty: "Pokročilý",
      participants: 89,
    },
    {
      id: 3,
      title: "Risk Management Master",
      description: "Dokončete 50 obchodů bez překročení 1% rizika",
      startDate: "Za 12 dní",
      duration: "Flexibilní",
      reward: "Expert badge + Certifikát",
      difficulty: "Střední",
      participants: 234,
    },
    {
      id: 4,
      title: "Swing Trading Marathon",
      description: "Držte pozice minimálně 3 dny, dosáhněte 10% zisku",
      startDate: "Za 18 dní",
      duration: "30 dní",
      reward: "Master badge + Osobní konzultace",
      difficulty: "Expert",
      participants: 67,
    },
  ]

  const completedChallenges = [
    {
      id: 5,
      title: "První kroky",
      completedDate: "Před 2 týdny",
      reward: "Beginner badge",
      rank: 23,
    },
    {
      id: 6,
      title: "10 ziskových obchodů",
      completedDate: "Před měsícem",
      reward: "Trader badge",
      rank: 45,
    },
  ]

  const leaderboard = [
    {
      rank: 1,
      name: "Pavel N.",
      avatar: "/placeholder.svg?height=32&width=32",
      points: 2450,
      badges: 12,
    },
    {
      rank: 2,
      name: "Marie S.",
      avatar: "/placeholder.svg?height=32&width=32",
      points: 2280,
      badges: 10,
    },
    {
      rank: 3,
      name: "Jan P.",
      avatar: "/placeholder.svg?height=32&width=32",
      points: 2150,
      badges: 9,
    },
    {
      rank: 4,
      name: "Tomáš V.",
      avatar: "/placeholder.svg?height=32&width=32",
      points: 1980,
      badges: 8,
    },
    {
      rank: 5,
      name: "Vy",
      avatar: "/placeholder.svg?height=32&width=32",
      points: 1750,
      badges: 6,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-600" />
            Trading Výzvy
          </h1>
          <p className="text-gray-600 mt-1">Testujte své schopnosti • Soutěžte s ostatními • Získávejte odměny</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Challenge */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>Aktivní výzva</span>
                  </CardTitle>
                  <Badge className="bg-blue-600 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {activeChallenge.timeLeft}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">{activeChallenge.title}</h3>
                    <p className="text-blue-700">{activeChallenge.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pokrok</span>
                      <span>
                        {activeChallenge.progress}/{activeChallenge.total} dní
                      </span>
                    </div>
                    <Progress value={(activeChallenge.progress / activeChallenge.total) * 100} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600">Odměna</p>
                      <p className="font-medium">{activeChallenge.reward}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Účastníci</p>
                      <p className="font-medium">{activeChallenge.participants} traderů</p>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Pokračovat ve výzvě
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Nadcházející výzvy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingChallenges.map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            challenge.difficulty === "Expert"
                              ? "border-red-200 text-red-700"
                              : challenge.difficulty === "Pokročilý"
                                ? "border-orange-200 text-orange-700"
                                : "border-green-200 text-green-700"
                          }
                        >
                          {challenge.difficulty}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Start</p>
                          <p className="font-medium">{challenge.startDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Trvání</p>
                          <p className="font-medium">{challenge.duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Účastníci</p>
                          <p className="font-medium">{challenge.participants}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Odměna</p>
                        <p className="font-medium text-green-600">{challenge.reward}</p>
                      </div>

                      <Button variant="outline" className="w-full bg-transparent">
                        <Users className="w-4 h-4 mr-2" />
                        Přihlásit se
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Dokončené výzvy</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedChallenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                        <p className="text-sm text-gray-600">{challenge.completedDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-1">{challenge.reward}</Badge>
                        <p className="text-sm text-gray-500">#{challenge.rank} místo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Vaše statistiky</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,750</div>
                  <p className="text-sm text-gray-600">Celkové body</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">6</div>
                    <p className="text-xs text-gray-600">Badges</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">3</div>
                    <p className="text-xs text-gray-600">Dokončené</p>
                  </div>
                </div>

                <div className="text-center">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Award className="w-3 h-3 mr-1" />
                    #5 v žebříčku
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Žebříček</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        player.name === "Vy" ? "bg-blue-50 border border-blue-200" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          player.rank === 1
                            ? "bg-yellow-500 text-white"
                            : player.rank === 2
                              ? "bg-gray-400 text-white"
                              : player.rank === 3
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={player.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${player.name === "Vy" ? "text-blue-900" : ""}`}>
                          {player.name}
                        </p>
                        <p className="text-xs text-gray-500">{player.badges} badges</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{player.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Rychlé akce</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Target className="w-4 h-4 mr-2" />
                  Vytvořit výzvu
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Pozvat přátele
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Award className="w-4 h-4 mr-2" />
                  Moje badges
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
