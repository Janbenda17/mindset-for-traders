"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, TrendingUp, Clock, Heart, Zap, AlertCircle, CheckCircle, Lock } from "lucide-react"
import { useState, useEffect } from "react"

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
  user_name?: string
  user_email?: string
  today_stats?: any
}

export default function Mentoring() {
  const { user } = useAuth()
  const [myGroups, setMyGroups] = useState<MentoringGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<MentoringGroup | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isMentor, setIsMentor] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinMessage, setJoinMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [joiningGroup, setJoiningGroup] = useState(false)

  useEffect(() => {
    if (user) {
      loadGroups()
    }
  }, [user])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/mentoring/groups", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        const groups = data.groups || []
        setMyGroups(groups)

        if (groups.length > 0) {
          // Check if user is a mentor of the first group
          if (groups[0].mentor_id === user?.id) {
            setIsMentor(true)
          }
          setSelectedGroup(groups[0])
          await loadGroupMembers(groups[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading mentor groups:", error)
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
        setGroupMembers(data.members || [])
      }
    } catch (error) {
      console.error("Error loading group members:", error)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) {
      setJoinMessage({ type: "error", text: "Prosím zadejte kód skupiny" })
      return
    }

    setJoiningGroup(true)
    try {
      const res = await fetch("/api/mentoring/groups/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      })

      if (res.ok) {
        setJoinMessage({ type: "success", text: "Úspěšně jste se připojili do skupiny!" })
        setJoinCode("")
        // Reload groups
        setTimeout(() => loadGroups(), 1000)
      } else {
        const error = await res.json()
        setJoinMessage({ type: "error", text: error.error || "Chyba při připojování" })
      }
    } catch (error) {
      setJoinMessage({ type: "error", text: "Chyba při připojování do skupiny" })
    } finally {
      setJoiningGroup(false)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mentoring</h1>
          <p className="text-muted-foreground mt-2">Přihlaste se pro přístup k mentorským skupinám</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Načítám skupiny...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Mentoring</h1>
        <p className="text-muted-foreground mt-2">
          {isMentor ? "Sledujte výkony svých studentů" : "Připojte se k mentoring skupině"}
        </p>
      </div>

      {/* Join Group Section */}
      {!isMentor && myGroups.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <CardTitle>Připojit se do skupiny</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Zadejte kód skupiny (např. Filipfx)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  disabled={joiningGroup}
                />
                <Button type="submit" disabled={joiningGroup}>
                  {joiningGroup ? "Připojování..." : "Připojit se"}
                </Button>
              </div>

              {joinMessage && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    joinMessage.type === "success"
                      ? "bg-green-50 text-green-900 border border-green-200"
                      : "bg-red-50 text-red-900 border border-red-200"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{joinMessage.text}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Groups Tabs */}
      {myGroups.length > 0 && (
        <>
          <Tabs
            value={selectedGroup?.id || ""}
            onValueChange={(value) => {
              const group = myGroups.find((g) => g.id === value)
              if (group) {
                setSelectedGroup(group)
                loadGroupMembers(group.id)
                setIsMentor(group.mentor_id === user?.id)
              }
            }}
          >
            <TabsList className="w-full grid grid-cols-2 lg:grid-cols-4">
              {myGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {myGroups.map((group) => (
              <TabsContent key={group.id} value={group.id} className="space-y-6">
                {/* Group Header Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {group.name}
                          <Badge variant="outline">{group.code}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
                      </div>
                      {isMentor && <Badge>Mentor</Badge>}
                    </div>
                  </CardHeader>
                </Card>

                {/* Group Stats Overview */}
                {isMentor && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Členů</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-2xl font-bold">{groupMembers.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Průměrná Win Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-2xl font-bold">
                            {groupMembers.length > 0
                              ? (
                                  groupMembers.reduce(
                                    (acc, m) => acc + (m.today_stats?.win_rate || 0),
                                    0
                                  ) / groupMembers.length
                                ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Obchodů dnes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-2xl font-bold">
                            {groupMembers.reduce((acc, m) => acc + (m.today_stats?.trades_count || 0), 0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Průměrná nálada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-2xl font-bold">
                          {groupMembers.length > 0
                            ? (
                                groupMembers.reduce(
                                  (acc, m) => acc + (m.today_stats?.mood_score || 0),
                                  0
                                ) / groupMembers.length
                              ).toFixed(1)
                            : 0}
                          /10
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Members List / Leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isMentor ? "Členy skupiny - Detaily pro mentoring" : "Vaše postavení v skupině"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isMentor
                        ? "Sledujte pokrok každého člena a identifikujte oblasti pro zlepšení"
                        : "Porovnějte se s ostatními členy skupiny"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupMembers
                        .sort((a, b) => {
                          const scoreA =
                            (a.today_stats?.sleep_hours || 0) * 10 +
                            (a.today_stats?.trades_count || 0) * 5 +
                            (a.today_stats?.win_rate || 0)
                          const scoreB =
                            (b.today_stats?.sleep_hours || 0) * 10 +
                            (b.today_stats?.trades_count || 0) * 5 +
                            (b.today_stats?.win_rate || 0)
                          return scoreB - scoreA
                        })
                        .map((member, index) => {
                          const stats = member.today_stats || {}
                          const score =
                            (stats.sleep_hours || 0) * 10 +
                            (stats.trades_count || 0) * 5 +
                            (stats.win_rate || 0)

                          return (
                            <div
                              key={member.id}
                              className="border rounded-lg p-4 hover:bg-muted/50 transition"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">#{index + 1}</Badge>
                                  <div>
                                    <p className="font-medium">{member.user_name || "Uživatel"}</p>
                                    <p className="text-xs text-muted-foreground">{member.user_email}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Skóre</p>
                                  <p className="text-2xl font-bold text-blue-600">{score.toFixed(0)}</p>
                                </div>
                              </div>

                              {Object.keys(stats).length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                  <div className="bg-muted p-2 rounded">
                                    <p className="text-muted-foreground text-xs">Spánek</p>
                                    <p className="font-bold">{stats.sleep_hours || 0}h</p>
                                  </div>
                                  <div className="bg-muted p-2 rounded">
                                    <p className="text-muted-foreground text-xs">Obchody</p>
                                    <p className="font-bold">{stats.trades_count || 0}</p>
                                  </div>
                                  <div className="bg-muted p-2 rounded">
                                    <p className="text-muted-foreground text-xs">Win Rate</p>
                                    <p className="font-bold text-green-600">{stats.win_rate || 0}%</p>
                                  </div>
                                  <div className="bg-muted p-2 rounded">
                                    <p className="text-muted-foreground text-xs">P&L</p>
                                    <p
                                      className={`font-bold ${
                                        (stats.total_pnl || 0) >= 0 ? "text-green-600" : "text-red-600"
                                      }`}
                                    >
                                      ${(stats.total_pnl || 0).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="bg-muted p-2 rounded">
                                    <p className="text-muted-foreground text-xs">Nálada</p>
                                    <p className="font-bold">{stats.mood_score || 0}/10</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">Dnes zatím žádné údaje</p>
                              )}
                            </div>
                          )
                        })}

                      {groupMembers.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          V této skupině zatím nejsou žádní členové
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  )
}
