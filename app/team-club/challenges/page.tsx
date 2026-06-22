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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const activeChallenge = {
    id: 1,
    title: "30-Day Consistency",
    description: "Trade every day for 30 days while maintaining proper risk management",
    progress: 18,
    total: 30,
    reward: "Premium badge + $100 bonus",
    participants: 156,
    timeLeft: "12 days",
  }

  const upcomingChallenges = [
    {
      id: 2,
      title: "Weekly Profit Challenge",
      description: "Achieve 5% profit for the week with max 2% risk per trade",
      startDate: "In 5 days",
      duration: "7 days",
      reward: "Gold badge + Mentoring session",
      difficulty: "Advanced",
      participants: 89,
    },
    {
      id: 3,
      title: "Risk Management Master",
      description: "Complete 50 trades without exceeding 1% risk per trade",
      startDate: "In 12 days",
      duration: "Flexible",
      reward: "Expert badge + Certificate",
      difficulty: "Intermediate",
      participants: 234,
    },
    {
      id: 4,
      title: "Swing Trading Marathon",
      description: "Hold positions for at least 3 days, achieve 10% profit",
      startDate: "In 18 days",
      duration: "30 days",
      reward: "Master badge + Personal consultation",
      difficulty: "Expert",
      participants: 67,
    },
  ]

  const completedChallenges = [
    {
      id: 5,
      title: "First Steps",
      completedDate: "2 weeks ago",
      reward: "Beginner badge",
      rank: 23,
    },
    {
      id: 6,
      title: "10 Winning Trades",
      completedDate: "1 month ago",
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
      name: "You",
      avatar: "/placeholder.svg?height=32&width=32",
      points: 1750,
      badges: 6,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
            Trading Challenges
          </h1>
          <p className="text-slate-400 mt-1">Test your skills • Compete with others • Earn rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Challenge */}
            <Card className="border border-purple-800/40 bg-gradient-to-br from-purple-950/40 to-slate-950">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span>Active Challenge</span>
                  </CardTitle>
                  <Badge className="bg-purple-600 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {activeChallenge.timeLeft}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{activeChallenge.title}</h3>
                    <p className="text-slate-300">{activeChallenge.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Progress</span>
                      <span>
                        {activeChallenge.progress}/{activeChallenge.total} days
                      </span>
                    </div>
                    <Progress value={(activeChallenge.progress / activeChallenge.total) * 100} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-purple-300">Reward</p>
                      <p className="font-medium text-white">{activeChallenge.reward}</p>
                    </div>
                    <div>
                      <p className="text-purple-300">Participants</p>
                      <p className="font-medium text-white">{activeChallenge.participants} traders</p>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Continue Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Challenges */}
            <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingChallenges.map((challenge) => (
                    <div key={challenge.id} className="border border-slate-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{challenge.title}</h4>
                          <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            challenge.difficulty === "Expert"
                              ? "border-red-500/30 text-red-400"
                              : challenge.difficulty === "Advanced"
                                ? "border-orange-500/30 text-orange-400"
                                : "border-green-500/30 text-green-400"
                          }
                        >
                          {challenge.difficulty}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-slate-500">Start</p>
                          <p className="font-medium text-white">{challenge.startDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Duration</p>
                          <p className="font-medium text-white">{challenge.duration}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Participants</p>
                          <p className="font-medium text-white">{challenge.participants}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-slate-500">Reward</p>
                        <p className="font-medium text-green-400">{challenge.reward}</p>
                      </div>

                      <Button variant="outline" className="w-full bg-transparent">
                        <Users className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Challenges */}
            <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Completed Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-white">{challenge.title}</h4>
                        <p className="text-sm text-slate-400">{challenge.completedDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-300 mb-1">{challenge.reward}</Badge>
                        <p className="text-sm text-slate-500">#{challenge.rank} place</p>
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
            <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Star className="w-5 h-5" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">1,750</div>
                  <p className="text-sm text-slate-400">Total Points</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-white">6</div>
                    <p className="text-xs text-slate-400">Badges</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">3</div>
                    <p className="text-xs text-slate-400">Completed</p>
                  </div>
                </div>

                <div className="text-center">
                  <Badge className="bg-yellow-500/20 text-yellow-300">
                    <Award className="w-3 h-3 mr-1" />
                    #5 in Leaderboard
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Trophy className="w-5 h-5" />
                  <span>Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank}
                      className={`flex items-center space-x-3 p-2 rounded-lg ${
                        player.name === "You" ? "bg-purple-500/10 border border-purple-500/30" : ""
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          player.rank === 1
                            ? "bg-yellow-500 text-white"
                            : player.rank === 2
                              ? "bg-slate-400 text-white"
                              : player.rank === 3
                                ? "bg-orange-500 text-white"
                                : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={player.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${player.name === "You" ? "text-purple-300" : "text-white"}`}>
                          {player.name}
                        </p>
                        <p className="text-xs text-slate-500">{player.badges} badges</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{player.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TrendingUp className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Target className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Award className="w-4 h-4 mr-2" />
                  My Badges
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
