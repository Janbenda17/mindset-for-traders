"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, Trophy, Heart, Flame } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLiveMode } from "@/contexts/live-mode-context"

interface CommunityPost {
  id: string
  author: string
  content: string
  timestamp: string
  type: "win" | "loss" | "insight"
  likes: number
}

interface CommunityMember {
  id: string
  name: string
  xp: number
  winRate: number
  status: "online" | "offline"
}

export default function TeamClubPage() {
  const { user, isAuthenticated } = useAuth()
  const { isLiveMode } = useLiveMode()
  const [activeTab, setActiveTab] = useState("komunita")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [newPost, setNewPost] = useState("")

  useEffect(() => {
    // Load community data from localStorage (shared across all users)
    if (isLiveMode && isAuthenticated) {
      const savedPosts = localStorage.getItem("team-club-posts")
      const savedMembers = localStorage.getItem("team-club-members")
      
      if (savedPosts) {
        try {
          setPosts(JSON.parse(savedPosts))
        } catch (e) {
          setPosts([])
        }
      }
      
      if (savedMembers) {
        try {
          setMembers(JSON.parse(savedMembers))
        } catch (e) {
          setMembers([])
        }
      }
    }
  }, [isLiveMode, isAuthenticated])

  const handleAddPost = () => {
    if (!newPost.trim() || !user) return

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: user.email?.split("@")[0] || "Trader",
      content: newPost,
      timestamp: new Date().toLocaleString("cs-CZ"),
      type: "insight",
      likes: 0,
    }

    const updatedPosts = [post, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem("team-club-posts", JSON.stringify(updatedPosts))
    setNewPost("")
  }

  const toggleLike = (postId: string) => {
    const updatedPosts = posts.map((p) =>
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    )
    setPosts(updatedPosts)
    localStorage.setItem("team-club-posts", JSON.stringify(updatedPosts))
  }

  const demoMembers: CommunityMember[] = [
    { id: "1", name: "Jana Svobodová", xp: 12850, winRate: 65, status: "online" },
    { id: "2", name: "Martin Novák", xp: 11200, winRate: 62, status: "online" },
    { id: "3", name: "Petra Nová", xp: 9900, winRate: 58, status: "offline" },
    { id: "4", name: "Tomáš Dvořák", xp: 8650, winRate: 55, status: "online" },
    { id: "5", name: "Jan Novotný", xp: 7400, winRate: 52, status: "offline" },
  ]

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Přihlaste se pro přístup do Týmového Klubu</h1>
          <p className="text-slate-400">Komunita traderů čeká na vás</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-purple-400" />
            Týmový Klub
          </h1>
          <p className="text-slate-400">Spojujte se s ostatními tradery, sdílejte zkušenosti a rostěte společně</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="komunita">Komunita</TabsTrigger>
                <TabsTrigger value="diskuse">Diskuse</TabsTrigger>
                <TabsTrigger value="statistiky">Statistiky</TabsTrigger>
              </TabsList>

              {/* Komunita Tab */}
              <TabsContent value="komunita" className="space-y-6">
                {/* New Post Card */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Sdílej svou zkušenost</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Co se ti dnes povedlo? Jakou jsme se naučil/a?"
                      className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white placeholder-slate-500 resize-none"
                      rows={4}
                    />
                    <Button
                      onClick={handleAddPost}
                      disabled={!newPost.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Publikovat
                    </Button>
                  </CardContent>
                </Card>

                {/* Posts */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <Card className="bg-slate-900/50 border-slate-800">
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Zatím zde nejsou žádné příspěvky. Buď první!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-purple-600 text-white">
                                  {post.author[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-white">{post.author}</p>
                                <p className="text-xs text-slate-400">{post.timestamp}</p>
                              </div>
                            </div>
                            <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/30">
                              {post.type === "win" ? "Výhra" : post.type === "loss" ? "Ztráta" : "Insight"}
                            </Badge>
                          </div>
                          <p className="text-slate-200 mb-4">{post.content}</p>
                          <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                            <button
                              onClick={() => toggleLike(post.id)}
                              className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
                            >
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">0</span>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Diskuse Tab */}
              <TabsContent value="diskuse">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Diskusní místnost - brzy dostupná</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Statistiky Tab */}
              <TabsContent value="statistiky">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Komunita Statistiky</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded text-center">
                        <p className="text-2xl font-bold text-purple-400">{demoMembers.length}+</p>
                        <p className="text-xs text-slate-400">Aktivních traderů</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded text-center">
                        <p className="text-2xl font-bold text-green-400">62%</p>
                        <p className="text-xs text-slate-400">Průměrná výhernost</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded text-center">
                        <p className="text-2xl font-bold text-blue-400">{posts.length}</p>
                        <p className="text-xs text-slate-400">Příspěvků</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Žebřík
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded bg-slate-800/50 hover:bg-slate-800 transition">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-bold text-purple-400 w-6">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{member.name}</p>
                          <p className="text-xs text-slate-400">{member.xp} XP</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${member.status === "online" ? "bg-green-500/30 text-green-300" : "bg-slate-700 text-slate-300"}`}>
                        {member.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  Tvůj Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-400">12</p>
                  <p className="text-sm text-slate-400 mt-2">Dní s příspěvky</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
