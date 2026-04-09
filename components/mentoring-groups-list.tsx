"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, Target, Lock } from "lucide-react"

interface MentoringGroup {
  id: string
  name: string
  description: string
  code: string
  mentor_id: string
  max_members: number
  created_at: string
}

interface GroupMember {
  id: string
  user_id: string
  group_id: string
  role: string
  joined_at: string
  user?: {
    name: string
    email: string
  }
}

interface MemberStats {
  date: string
  sleep_hours: number
  trades_count: number
  win_rate: number
  total_pnl: number
  xp_earned: number
  mood_score: number
}

export function MentoringGroupsList({ userRole }: { userRole?: string }) {
  const [groups, setGroups] = useState<MentoringGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<MentoringGroup | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [memberStats, setMemberStats] = useState<Record<string, MemberStats[]>>({})
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/mentoring/groups")
      const data = await res.json()
      setGroups(data)
      if (data.length > 0) {
        setSelectedGroup(data[0])
        fetchGroupMembers(data[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const res = await fetch(`/api/mentoring/groups/${groupId}/members`)
      const data = await res.json()
      setMembers(data)

      // Fetch stats for each member
      const statsMap: Record<string, MemberStats[]> = {}
      for (const member of data) {
        const statsRes = await fetch(
          `/api/mentoring/groups/${groupId}/members/${member.user_id}/stats`
        )
        statsMap[member.user_id] = await statsRes.json()
      }
      setMemberStats(statsMap)
    } catch (error) {
      console.error("Failed to fetch group members:", error)
    }
  }

  const handleSelectGroup = (group: MentoringGroup) => {
    setSelectedGroup(group)
    fetchGroupMembers(group.id)
  }

  const getMemberTodayStats = (userId: string) => {
    const stats = memberStats[userId]
    if (!stats || stats.length === 0) return null

    const today = new Date().toISOString().split("T")[0]
    return stats.find((s) => s.date === today)
  }

  const getGroupStats = (groupId: string) => {
    const groupMembers = members.filter((m) => m.group_id === groupId)
    if (groupMembers.length === 0) return { avgWinRate: 0, totalTrades: 0, avgMood: 0 }

    let totalWinRate = 0
    let totalTrades = 0
    let totalMood = 0
    let moodCount = 0

    groupMembers.forEach((member) => {
      const todayStats = getMemberTodayStats(member.user_id)
      if (todayStats) {
        totalWinRate += todayStats.win_rate || 0
        totalTrades += todayStats.trades_count || 0
        if (todayStats.mood_score) {
          totalMood += todayStats.mood_score
          moodCount++
        }
      }
    })

    return {
      avgWinRate: groupMembers.length > 0 ? (totalWinRate / groupMembers.length).toFixed(2) : 0,
      totalTrades,
      avgMood: moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 0,
      memberCount: groupMembers.length,
    }
  }

  if (loading) {
    return <div className="text-center py-8">Načítám skupiny...</div>
  }

  return (
    <div className="space-y-6">
      {/* Groups Tabs */}
      <Tabs defaultValue={selectedGroup?.id || ""} onValueChange={(value) => {
        const group = groups.find((g) => g.id === value)
        if (group) handleSelectGroup(group)
      }}>
        <TabsList className="w-full">
          {groups.map((group) => (
            <TabsTrigger key={group.id} value={group.id} className="flex-1">
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="space-y-6">
            {/* Group Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {group.name}
                      <Badge variant="outline">{group.code}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">{group.description}</CardDescription>
                  </div>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>

            {/* Group Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Členů</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-2xl font-bold">{getGroupStats(group.id).memberCount}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Průměrná Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-2xl font-bold">{getGroupStats(group.id).avgWinRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Obchodů dnes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-2xl font-bold">{getGroupStats(group.id).totalTrades}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Průměrná nálada</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">{getGroupStats(group.id).avgMood}/10</span>
                </CardContent>
              </Card>
            </div>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Členové skupiny</CardTitle>
                <CardDescription>Detail statistik každého člena</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {members
                  .filter((m) => m.group_id === group.id)
                  .map((member) => {
                    const todayStats = getMemberTodayStats(member.user_id)
                    return (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{member.user?.name || "Uživatel"}</p>
                            <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                          </div>
                          <Badge variant={member.role === "mentor" ? "default" : "secondary"}>
                            {member.role === "mentor" ? "Mentor" : "Člen"}
                          </Badge>
                        </div>

                        {todayStats ? (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Spánek</p>
                              <p className="font-medium">{todayStats.sleep_hours}h</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Obchody</p>
                              <p className="font-medium">{todayStats.trades_count}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Win Rate</p>
                              <p className="font-medium text-green-600">{todayStats.win_rate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">P&L</p>
                              <p
                                className={`font-medium ${
                                  (todayStats.total_pnl || 0) >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                ${(todayStats.total_pnl || 0).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Nálada</p>
                              <p className="font-medium">{todayStats.mood_score}/10</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Dnes zatím žádné údaje</p>
                        )}
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
