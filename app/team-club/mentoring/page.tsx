"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Clock, Star, BookOpen, Video, MessageSquare, TrendingUp, Target } from "lucide-react"
import Link from "next/link"

export default function Mentoring() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h1>
          <Button asChild>
            <Link href="/login">Přihlásit se</Link>
          </Button>
        </div>
      </div>
    )
  }

  const mentors = [
    {
      id: 1,
      name: "Pavel Novák",
      avatar: "/placeholder.svg?height=80&width=80",
      title: "Senior Forex Mentor",
      experience: "15+ let",
      specialization: "EUR/USD, GBP/JPY, Scalping",
      students: 247,
      rating: 4.9,
      successRate: "89%",
      description: "Specializuji se na intradenní trading a scalping strategie. Pomáhám traderům najít svůj styl.",
      nextSession: "Pondělí 18:00",
      price: "Zdarma pro Premium",
    },
    {
      id: 2,
      name: "Marie Svobodová",
      avatar: "/placeholder.svg?height=80&width=80",
      title: "Trading Psychology Coach",
      experience: "12+ let",
      specialization: "Psychologie, Risk Management",
      students: 189,
      rating: 4.8,
      successRate: "92%",
      description: "Pomáhám traderům překonat psychologické bariéry a vybudovat správný mindset.",
      nextSession: "Středa 19:30",
      price: "Zdarma pro Premium",
    },
    {
      id: 3,
      name: "Jan Procházka",
      avatar: "/placeholder.svg?height=80&width=80",
      title: "Swing Trading Expert",
      experience: "10+ let",
      specialization: "Swing Trading, Technická analýza",
      students: 156,
      rating: 4.7,
      successRate: "85%",
      description: "Učím dlouhodobější strategie a fundamentální analýzu pro swing trading.",
      nextSession: "Pátek 17:00",
      price: "Zdarma pro Premium",
    },
  ]

  const upcomingSessions = [
    {
      id: 1,
      title: "Týdenní analýza trhů",
      mentor: "Pavel Novák",
      date: "Pondělí",
      time: "18:00",
      duration: "60 min",
      participants: 45,
      type: "Webinář",
      description: "Analýza hlavních měnových párů a trading příležitostí na nadcházející týden.",
    },
    {
      id: 2,
      title: "Q&A - Vaše otázky",
      mentor: "Marie Svobodová",
      date: "Středa",
      time: "19:30",
      duration: "90 min",
      participants: 28,
      type: "Live Session",
      description: "Otevřená diskuze o trading psychologii a řešení vašich problémů.",
    },
    {
      id: 3,
      title: "Swing Trading Workshop",
      mentor: "Jan Procházka",
      date: "Pátek",
      time: "17:00",
      duration: "120 min",
      participants: 67,
      type: "Workshop",
      description: "Praktický workshop zaměřený na swing trading strategie a setup identifikaci.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Star className="w-8 h-8 mr-3 text-yellow-600" />
            Program mentoringu
          </h1>
          <p className="text-gray-600 mt-1">Osobní vedení od zkušených traderů • Live sessions • 1:1 konzultace</p>
        </div>

        {/* Nadcházející sezení */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nadcházející sezení</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{session.type}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {session.participants}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      {session.mentor}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {session.date} {session.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {session.duration}
                    </div>
                    <p className="text-sm text-gray-600">{session.description}</p>
                    <Button className="w-full">
                      <Video className="w-4 h-4 mr-2" />
                      Přihlásit se
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mentoři */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Naši mentoři</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={mentor.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-gray-600">{mentor.title}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{mentor.rating}</span>
                        <span className="text-sm text-gray-500 ml-2">({mentor.students} studentů)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{mentor.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Zkušenosti</p>
                        <p className="font-medium">{mentor.experience}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Úspěšnost</p>
                        <p className="font-medium text-green-600">{mentor.successRate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">Specializace</p>
                      <p className="font-medium text-sm">{mentor.specialization}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-500">Další session</p>
                        <p className="font-medium">{mentor.nextSession}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{mentor.price}</Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Kontakt
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Profil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-blue-600" />
                <span>Live Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Pravidelné live sessions s možností pokládat otázky v reálném čase.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Personalizované vedení</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Individuální přístup podle vašeho stylu tradingu a zkušeností.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>Ověřené strategie</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Naučte se strategie, které skutečně fungují na reálných trzích.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
