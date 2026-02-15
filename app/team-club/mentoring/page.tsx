"use client"

import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, TrendingUp, Clock, Heart, Zap, AlertCircle, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

export default function Mentoring() {
  const { user } = useAuth()
  const { getAllTrades } = useData()
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [groupMembers, setGroupMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMentor, setIsMentor] = useState(false)

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  const loadGroups = async () => {
    try {
      setLoading(true)
      // Fetch mentor groups
      const response = await fetch("/api/mentoring/groups", {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
        
        // Check if user is a mentor
        if (data.mentorGroup) {
          setIsMentor(true)
          setSelectedGroup(data.mentorGroup)
          await loadGroupMembers(data.mentorGroup.id)
        } else if (data.groups.length > 0) {
          setSelectedGroup(data.groups[0])
          await loadGroupMembers(data.groups[0].id)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading mentor groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/mentoring/groups/${groupId}/members`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        // Fetch stats for each member
        const membersWithStats = await Promise.all(
          data.members.map(async (member: any) => {
            const statsResponse = await fetch(
              `/api/mentoring/groups/${groupId}/members/${member.id}/stats`,
              { credentials: "include" }
            )
            if (statsResponse.ok) {
              const stats = await statsResponse.json()
              return { ...member, stats: stats.stats }
            }
            return member
          })
        )
        setGroupMembers(membersWithStats)
      }
    } catch (error) {
      console.error("[v0] Error loading group members:", error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení vyžadováno</h1>
          <Button asChild>
            <a href="/login">Přihlásit se</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-600" />
            Mentoring skupiny
          </h1>
          <p className="text-gray-600 mt-1">
            {isMentor ? "Sledujte výkony svých studentů a poskytujte jim vedení" : "Připojte se k mentoring skupině a rozvíjejte se"}
          </p>
        </div>

        {/* Skupiny */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dostupné skupiny</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {groups.map((group) => (
              <Card
                key={group.id}
                className={`cursor-pointer transition-all ${
                  selectedGroup?.id === group.id
                    ? "ring-2 ring-blue-600 shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedGroup(group)
                  loadGroupMembers(group.id)
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">Kód: {group.access_code}</p>
                    </div>
                    <Badge variant="outline">{group.members_count} členů</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Mentor: {group.mentor_name}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {group.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Členové skupiny - jen pro mentora */}
        {isMentor && selectedGroup && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Členové skupiny "{selectedGroup.name}"</h2>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Přehled</TabsTrigger>
                <TabsTrigger value="detailed">Detaily</TabsTrigger>
                <TabsTrigger value="analytics">Analýza</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupMembers.map((member) => {
                    const stats = member.stats || {}
                    const totalScore = (stats.sleep_hours || 0) * 10 + (stats.trades_count || 0) * 5 + (stats.win_rate || 0)
                    
                    return (
                      <Card key={member.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Score */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Celkové skóre</p>
                              <p className="text-2xl font-bold text-blue-600">{totalScore.toFixed(0)}</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Spánek</p>
                                  <p className="font-semibold">{stats.sleep_hours || 0}h</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Obchody</p>
                                  <p className="font-semibold">{stats.trades_count || 0}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Win Rate</p>
                                  <p className="font-semibold">{(stats.win_rate || 0).toFixed(1)}%</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                                <Heart className="w-4 h-4 text-red-500" />
                                <div>
                                  <p className="text-xs text-gray-500">P&L</p>
                                  <p className={`font-semibold ${(stats.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    ${(stats.pnl || 0).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Button className="w-full mt-2">Poskytnutí vedení</Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {groupMembers.length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-gray-600">V této skupině zatím nejsou žádní členové</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Detailed Tab */}
              <TabsContent value="detailed">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailní statistiky členů</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Jméno</th>
                            <th className="text-right py-3 px-4">Spánek</th>
                            <th className="text-right py-3 px-4">Obchody</th>
                            <th className="text-right py-3 px-4">Win Rate</th>
                            <th className="text-right py-3 px-4">P&L</th>
                            <th className="text-right py-3 px-4">Skóre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupMembers
                            .sort((a, b) => {
                              const scoreA = (a.stats?.sleep_hours || 0) * 10 + (a.stats?.trades_count || 0) * 5 + (a.stats?.win_rate || 0)
                              const scoreB = (b.stats?.sleep_hours || 0) * 10 + (b.stats?.trades_count || 0) * 5 + (b.stats?.win_rate || 0)
                              return scoreB - scoreA
                            })
                            .map((member, index) => {
                              const stats = member.stats || {}
                              const totalScore = (stats.sleep_hours || 0) * 10 + (stats.trades_count || 0) * 5 + (stats.win_rate || 0)
                              
                              return (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline">#{index + 1}</Badge>
                                      <span className="font-medium">{member.name}</span>
                                    </div>
                                  </td>
                                  <td className="text-right py-3 px-4">{stats.sleep_hours || 0}h</td>
                                  <td className="text-right py-3 px-4">{stats.trades_count || 0}</td>
                                  <td className="text-right py-3 px-4">{(stats.win_rate || 0).toFixed(1)}%</td>
                                  <td className={`text-right py-3 px-4 font-medium ${(stats.pnl || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    ${(stats.pnl || 0).toFixed(2)}
                                  </td>
                                  <td className="text-right py-3 px-4 font-bold text-blue-600">{totalScore.toFixed(0)}</td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Group Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Statistiky skupiny</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Průměrný spánek</span>
                        <span className="font-bold">
                          {(groupMembers.reduce((acc, m) => acc + (m.stats?.sleep_hours || 0), 0) / Math.max(groupMembers.length, 1)).toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Průměrný Win Rate</span>
                        <span className="font-bold">
                          {(groupMembers.reduce((acc, m) => acc + (m.stats?.win_rate || 0), 0) / Math.max(groupMembers.length, 1)).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Celkem obchodů</span>
                        <span className="font-bold">
                          {groupMembers.reduce((acc, m) => acc + (m.stats?.trades_count || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Skupinový P&L</span>
                        <span className={`font-bold ${groupMembers.reduce((acc, m) => acc + (m.stats?.pnl || 0), 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${groupMembers.reduce((acc, m) => acc + (m.stats?.pnl || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Performers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Nejlepší výkony</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupMembers
                          .sort((a, b) => {
                            const scoreA = (a.stats?.sleep_hours || 0) * 10 + (a.stats?.trades_count || 0) * 5 + (a.stats?.win_rate || 0)
                            const scoreB = (b.stats?.sleep_hours || 0) * 10 + (b.stats?.trades_count || 0) * 5 + (b.stats?.win_rate || 0)
                            return scoreB - scoreA
                          })
                          .slice(0, 3)
                          .map((member, index) => {
                            const stats = member.stats || {}
                            return (
                              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                  {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                                  {index === 2 && <Trophy className="w-5 h-5 text-orange-600" />}
                                  <span className="font-medium">{member.name}</span>
                                </div>
                                <Zap className="w-4 h-4 text-blue-600" />
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Není mentor */}
        {!isMentor && selectedGroup && (
          <Card>
            <CardHeader>
              <CardTitle>Přidali jste se do skupiny "{selectedGroup.name}"</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Mentor {selectedGroup.mentor_name} bude sledovat vaše pokroky a poskytovat vám vedení. Pokračujte v trénování a zlepšování se!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
