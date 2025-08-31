"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageCircle,
  Trophy,
  Calendar,
  Star,
  BookOpen,
  Target,
  Award,
  Clock,
  ThumbsUp,
  Eye,
  Send,
  Crown,
  Zap,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function TeamClub() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h1>
          <p className="text-gray-600 mb-4">Pro přístup k Team Club se prosím přihlaste</p>
          <Button asChild>
            <Link href="/login">Přihlásit se</Link>
          </Button>
        </div>
      </div>
    )
  }

  const communityStats = [
    {
      title: "Aktivní členové",
      value: "247",
      change: "+12 tento týden",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Diskuze",
      value: "1,834",
      change: "+45 nových",
      icon: MessageCircle,
      color: "text-green-600",
    },
    {
      title: "Úspěšné obchody",
      value: "89%",
      change: "Týmová úspěšnost",
      icon: Trophy,
      color: "text-yellow-600",
    },
    {
      title: "Mentoring hodin",
      value: "156",
      change: "Tento měsíc",
      icon: Clock,
      color: "text-purple-600",
    },
  ]

  const recentPosts = [
    {
      id: 1,
      author: "Martin K.",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Senior Trader",
      time: "před 2 hodinami",
      title: "Analýza EUR/USD - Týdenní outlook",
      content: "Vidím silný support na 1.0850. Co si myslíte o breakoutu směrem nahoru?",
      likes: 23,
      replies: 8,
      views: 156,
      tags: ["EURUSD", "Analýza", "Support"],
    },
    {
      id: 2,
      author: "Jana S.",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Mentor",
      time: "před 4 hodinami",
      title: "Risk Management - Týdenní tip",
      content: "Nezapomínejte na 2% pravidlo! Lepší menší zisk než velká ztráta.",
      likes: 45,
      replies: 12,
      views: 289,
      tags: ["RiskManagement", "Tip", "Psychologie"],
    },
    {
      id: 3,
      author: "Tomáš V.",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Advanced Trader",
      time: "včera",
      title: "Moje cesta k ziskovosti",
      content: "Po 2 letech konečně konzistentní zisky. Chtěl bych se podělit o své zkušenosti...",
      likes: 67,
      replies: 24,
      views: 445,
      tags: ["Zkušenosti", "Motivace", "Úspěch"],
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Týdenní analýza trhů",
      mentor: "Pavel Novák",
      date: "Pondělí 18:00",
      participants: 45,
      type: "Webinář",
    },
    {
      id: 2,
      title: "Q&A s mentorem",
      mentor: "Marie Svobodová",
      date: "Středa 19:30",
      participants: 28,
      type: "Live Session",
    },
    {
      id: 3,
      title: "Trading Psychology Workshop",
      mentor: "Jan Procházka",
      date: "Pátek 17:00",
      participants: 67,
      type: "Workshop",
    },
  ]

  const topTraders = [
    {
      name: "Pavel N.",
      avatar: "/placeholder.svg?height=32&width=32",
      profit: "+$4,250",
      winRate: "78%",
      rank: 1,
    },
    {
      name: "Marie S.",
      avatar: "/placeholder.svg?height=32&width=32",
      profit: "+$3,890",
      winRate: "74%",
      rank: 2,
    },
    {
      name: "Jan P.",
      avatar: "/placeholder.svg?height=32&width=32",
      profit: "+$3,456",
      winRate: "71%",
      rank: 3,
    },
    {
      name: "Tomáš V.",
      avatar: "/placeholder.svg?height=32&width=32",
      profit: "+$2,987",
      winRate: "69%",
      rank: 4,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Team Club
              </h1>
              <p className="text-gray-600 mt-1">Komunita úspěšných traderů • Mentoring • Sdílení zkušeností</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Premium Member
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {communityStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color} font-medium`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="community" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="community">Komunita</TabsTrigger>
            <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
            <TabsTrigger value="leaderboard">Žebříček</TabsTrigger>
            <TabsTrigger value="events">Události</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Nejnovější diskuze</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={post.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{post.author}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {post.role}
                              </Badge>
                              <span className="text-sm text-gray-500">{post.time}</span>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                            <p className="text-gray-600 mb-3">{post.content}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <button className="flex items-center space-x-1 hover:text-blue-600">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{post.likes}</span>
                              </button>
                              <button className="flex items-center space-x-1 hover:text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.replies}</span>
                              </button>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Rychlé akce</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Send className="w-4 h-4 mr-2" />
                      Nový příspěvek
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Sdílet analýzu
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Target className="w-4 h-4 mr-2" />
                      Požádat o radu
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5" />
                      <span>Top Traders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topTraders.slice(0, 3).map((trader) => (
                        <div key={trader.rank} className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold">
                            {trader.rank}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={trader.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{trader.name}</p>
                            <p className="text-xs text-gray-500">{trader.winRate} win rate</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">{trader.profit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mentoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Nadcházející události</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Mentor: {event.mentor}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{event.date}</span>
                        <span className="text-blue-600">{event.participants} účastníků</span>
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        Přihlásit se
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Naši mentoři</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>PN</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">Pavel Novák</h4>
                        <p className="text-sm text-gray-600">Senior Forex Mentor</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">15+ let zkušeností, specializace na EUR/USD a GBP/JPY</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">89% úspěšnost</span>
                      <span className="text-blue-600">247 studentů</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>MS</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">Marie Svobodová</h4>
                        <p className="text-sm text-gray-600">Psychology Coach</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Specialistka na trading psychologii a risk management</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">92% spokojenost</span>
                      <span className="text-blue-600">189 studentů</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Žebříček úspěšnosti - Tento měsíc</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTraders.map((trader) => (
                    <div
                      key={trader.rank}
                      className={`flex items-center space-x-4 p-4 rounded-lg ${
                        trader.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                          trader.rank === 1
                            ? "bg-yellow-500 text-white"
                            : trader.rank === 2
                              ? "bg-gray-400 text-white"
                              : trader.rank === 3
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {trader.rank}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={trader.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{trader.name}</h4>
                        <p className="text-sm text-gray-600">Win Rate: {trader.winRate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{trader.profit}</p>
                        <p className="text-sm text-gray-500">Měsíční zisk</p>
                      </div>
                      {trader.rank <= 3 && (
                        <Award
                          className={`w-6 h-6 ${
                            trader.rank === 1
                              ? "text-yellow-500"
                              : trader.rank === 2
                                ? "text-gray-400"
                                : "text-orange-500"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Tento týden</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">s {event.mentor}</p>
                      <p className="text-sm text-blue-600">{event.date}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Statistiky událostí</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Celkem událostí</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Účastníků celkem</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Průměrné hodnocení</span>
                    <span className="font-semibold text-yellow-600">4.8/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nejpopulárnější</span>
                    <span className="font-semibold">Q&A Sessions</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
