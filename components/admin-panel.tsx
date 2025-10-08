"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, TrendingUp, Activity, Shield, BarChart3, UserCheck, CheckCircle, EyeOff, Lock } from "lucide-react"
import { useData } from "@/contexts/data-context"

interface AdminPanelProps {
  isVisible: boolean
  onClose: () => void
}

export function AdminPanel({ isVisible, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  if (!isVisible) return null

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "Master77") {
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError("Nesprávné heslo!")
      setPassword("")
    }
  }

  // Mock admin data - in real app this would come from backend
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalTrades: 15634,
    totalVolume: 2847392,
    avgWinRate: 64.2,
    topTraders: [
      { name: "Jan Novák", winRate: 78.5, trades: 234, profit: 15420 },
      { name: "Marie Svobodová", winRate: 72.1, trades: 189, profit: 12890 },
      { name: "Petr Dvořák", winRate: 69.8, trades: 156, profit: 9870 },
    ],
    recentActivity: [
      { user: "Jan N.", action: "Nový obchod", time: "2 min", profit: 450 },
      { user: "Marie S.", action: "Uzavřen obchod", time: "5 min", profit: -120 },
      { user: "Petr D.", action: "Nový journal", time: "8 min", profit: 0 },
    ],
  }

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Admin Panel</CardTitle>
                  <p className="text-sm text-gray-400">Zadejte administrátorské heslo</p>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                <EyeOff className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Zadejte heslo..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError("")
                    }}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    autoFocus
                  />
                </div>
                {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                <Shield className="w-4 h-4 mr-2" />
                Přihlásit se
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
              <p className="text-sm text-gray-400">Přístup pouze pro administrátory</p>
            </div>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
              {isLiveMode ? "LIVE DATA" : "DEMO DATA"}
            </Badge>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            <EyeOff className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="overview">📊 Přehled</TabsTrigger>
              <TabsTrigger value="users">👥 Uživatelé</TabsTrigger>
              <TabsTrigger value="trades">💹 Obchody</TabsTrigger>
              <TabsTrigger value="system">⚙️ Systém</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Celkem uživatelů</p>
                        <p className="text-2xl font-bold text-white">{adminStats.totalUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <UserCheck className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Aktivní uživatelé</p>
                        <p className="text-2xl font-bold text-white">{adminStats.activeUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Celkem obchodů</p>
                        <p className="text-2xl font-bold text-white">{adminStats.totalTrades.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Průměrná win rate</p>
                        <p className="text-2xl font-bold text-white">{adminStats.avgWinRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Traders & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">🏆 Top Tradeři</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {adminStats.topTraders.map((trader, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-white">{trader.name}</p>
                              <p className="text-sm text-gray-400">{trader.trades} obchodů</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-400">{trader.winRate}%</p>
                            <p className="text-sm text-gray-400">${trader.profit.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">⚡ Nedávná aktivita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {adminStats.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Activity className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{activity.user}</p>
                                <p className="text-sm text-gray-400">{activity.action}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">{activity.time}</p>
                              {activity.profit !== 0 && (
                                <p
                                  className={`text-sm font-medium ${activity.profit > 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                  {activity.profit > 0 ? "+" : ""}${activity.profit}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">👥 Správa uživatelů</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Funkce správy uživatelů bude implementována v plné verzi.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trades" className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">💹 Analýza obchodů</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Pokročilá analýza obchodů bude dostupná v plné verzi.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">⚙️ Systémové nastavení</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Režim aplikace</p>
                        <p className="text-sm text-gray-400">Aktuální provozní režim</p>
                      </div>
                      <Badge
                        className={
                          isLiveMode
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        }
                      >
                        {isLiveMode ? "LIVE" : "DEMO"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="font-medium text-white">Systémový status</p>
                        <p className="text-sm text-gray-400">Všechny služby běží normálně</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
