"use client"

import type React from "react"
import { useState } from "react"
import { useData } from "@/contexts/data-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  DollarSign,
  Eye,
  EyeOff,
  Crown,
  Shield,
  Activity,
  MapPin,
  Clock,
  Smartphone,
  Globe,
  Database,
  AlertTriangle,
  Info,
  Zap,
  Target,
  Brain,
  Star,
} from "lucide-react"

// Demo traders for virtual mode with detailed data
const DEMO_TRADERS = [
  {
    id: "demo-1",
    name: "Martin Novák",
    email: "martin.novak@email.cz",
    joinDate: "2024-01-15",
    plan: "premium",
    totalPnL: 2847,
    totalTrades: 142,
    winRate: 68,
    lastActive: "2024-01-22T14:30:00Z",
    status: "active",
    country: "CZ",
    city: "Praha",
    age: 34,
    tradingExperience: "3 roky",
    favoriteAssets: ["EUR/USD", "GBP/JPY", "Gold"],
    tradingStyle: "Swing Trading",
    riskLevel: "Střední",
    avgSessionTime: "2.5h",
    deviceType: "Desktop",
    browser: "Chrome",
    timezone: "CET",
    monthlyStats: {
      trades: 28,
      winRate: 71,
      pnl: 450,
      bestDay: 180,
      worstDay: -95,
    },
    psychologyData: {
      avgMood: 7.2,
      avgStress: 4.1,
      avgConfidence: 7.8,
      disciplineScore: 8.5,
    },
    goals: ["Dosáhnout 70% win rate", "Zvýšit měsíční zisk na $1000"],
    notes: "Velmi disciplinovaný trader, dodržuje risk management",
  },
  {
    id: "demo-2",
    name: "Anna Svobodová",
    email: "anna.svoboda@email.cz",
    joinDate: "2024-01-10",
    plan: "free",
    totalPnL: -450,
    totalTrades: 89,
    winRate: 42,
    lastActive: "2024-01-21T09:15:00Z",
    status: "active",
    country: "CZ",
    city: "Brno",
    age: 28,
    tradingExperience: "1 rok",
    favoriteAssets: ["BTC/USD", "ETH/USD", "ADA/USD"],
    tradingStyle: "Day Trading",
    riskLevel: "Vysoké",
    avgSessionTime: "4.2h",
    deviceType: "Mobile",
    browser: "Safari",
    timezone: "CET",
    monthlyStats: {
      trades: 45,
      winRate: 38,
      pnl: -180,
      bestDay: 95,
      worstDay: -220,
    },
    psychologyData: {
      avgMood: 5.8,
      avgStress: 7.2,
      avgConfidence: 5.1,
      disciplineScore: 4.2,
    },
    goals: ["Zlepšit risk management", "Snížit emocionální trading"],
    notes: "Potřebuje práci na psychologii, tendence k revenge tradingu",
  },
  {
    id: "demo-3",
    name: "Petr Dvořák",
    email: "petr.dvorak@email.cz",
    joinDate: "2024-01-08",
    plan: "premium",
    totalPnL: 5240,
    totalTrades: 203,
    winRate: 74,
    lastActive: "2024-01-22T16:45:00Z",
    status: "active",
    country: "CZ",
    city: "Ostrava",
    age: 41,
    tradingExperience: "7 let",
    favoriteAssets: ["SPY", "QQQ", "AAPL", "TSLA"],
    tradingStyle: "Position Trading",
    riskLevel: "Nízké",
    avgSessionTime: "1.8h",
    deviceType: "Desktop",
    browser: "Firefox",
    timezone: "CET",
    monthlyStats: {
      trades: 18,
      winRate: 78,
      pnl: 890,
      bestDay: 340,
      worstDay: -85,
    },
    psychologyData: {
      avgMood: 8.1,
      avgStress: 2.9,
      avgConfidence: 8.7,
      disciplineScore: 9.2,
    },
    goals: ["Udržet konzistentnost", "Diverzifikovat portfolio"],
    notes: "Velmi zkušený trader, mentor pro ostatní",
  },
  {
    id: "demo-4",
    name: "Jana Procházková",
    email: "jana.prochazky@email.cz",
    joinDate: "2024-01-12",
    plan: "trial",
    totalPnL: 1200,
    totalTrades: 67,
    winRate: 61,
    lastActive: "2024-01-20T11:20:00Z",
    status: "trial",
    country: "SK",
    city: "Bratislava",
    age: 31,
    tradingExperience: "2 roky",
    favoriteAssets: ["EUR/GBP", "USD/CHF", "Oil"],
    tradingStyle: "Scalping",
    riskLevel: "Střední",
    avgSessionTime: "3.1h",
    deviceType: "Tablet",
    browser: "Chrome",
    timezone: "CET",
    monthlyStats: {
      trades: 34,
      winRate: 65,
      pnl: 280,
      bestDay: 120,
      worstDay: -75,
    },
    psychologyData: {
      avgMood: 6.9,
      avgStress: 5.4,
      avgConfidence: 6.8,
      disciplineScore: 7.1,
    },
    goals: ["Přejít na premium plán", "Zlepšit timing vstupů"],
    notes: "Slibný trader, zvažuje upgrade na premium",
  },
  {
    id: "demo-5",
    name: "Tomáš Černý",
    email: "tomas.cerny@email.cz",
    joinDate: "2024-01-05",
    plan: "premium",
    totalPnL: -1200,
    totalTrades: 156,
    winRate: 38,
    lastActive: "2024-01-19T13:10:00Z",
    status: "active",
    country: "CZ",
    city: "Plzeň",
    age: 26,
    tradingExperience: "6 měsíců",
    favoriteAssets: ["DOGE/USD", "SHIB/USD", "MEME coins"],
    tradingStyle: "YOLO Trading",
    riskLevel: "Extrémní",
    avgSessionTime: "6.5h",
    deviceType: "Mobile",
    browser: "Chrome",
    timezone: "CET",
    monthlyStats: {
      trades: 78,
      winRate: 32,
      pnl: -580,
      bestDay: 450,
      worstDay: -890,
    },
    psychologyData: {
      avgMood: 4.2,
      avgStress: 8.9,
      avgConfidence: 3.1,
      disciplineScore: 2.8,
    },
    goals: ["Naučit se risk management", "Přestat s revenge tradingem"],
    notes: "VYSOKÉ RIZIKO - potřebuje okamžitou pomoc s psychologií",
  },
]

interface AdminTradersOverviewProps {
  children: React.ReactNode
}

export function AdminTradersOverview({ children }: AdminTradersOverviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const { isLiveMode } = useData()

  const handleCodeSubmit = () => {
    if (accessCode === "Master77") {
      setIsAuthenticated(true)
      setAccessCode("")
    } else {
      alert("Nesprávný kód!")
      setAccessCode("")
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsAuthenticated(false)
    setAccessCode("")
    setSelectedTrader(null)
  }

  // Get traders based on mode
  const getTraders = () => {
    if (isLiveMode) {
      // In live mode, return real users (for now just empty array)
      // In real app, this would fetch from database
      return []
    } else {
      // In virtual mode, return demo traders
      return DEMO_TRADERS
    }
  }

  const traders = getTraders()

  // Calculate overview stats
  const totalTraders = traders.length
  const activeTraders = traders.filter((t) => t.status === "active").length
  const premiumTraders = traders.filter((t) => t.plan === "premium").length
  const totalPnL = traders.reduce((sum, t) => sum + t.totalPnL, 0)
  const avgWinRate = traders.length > 0 ? traders.reduce((sum, t) => sum + t.winRate, 0) / traders.length : 0
  const riskTraders = traders.filter((t) => t.riskLevel === "Extrémní" || t.psychologyData.disciplineScore < 4).length

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Právě teď"
    if (diffHours < 24) return `Před ${diffHours}h`
    if (diffDays < 7) return `Před ${diffDays} dny`
    return date.toLocaleDateString("cs-CZ")
  }

  const getRiskColor = (trader: any) => {
    if (trader.riskLevel === "Extrémní" || trader.psychologyData.disciplineScore < 4) {
      return "text-red-600 bg-red-100"
    }
    if (trader.psychologyData.disciplineScore < 6 || trader.winRate < 45) {
      return "text-orange-600 bg-orange-100"
    }
    return "text-green-600 bg-green-100"
  }

  const selectedTraderData = traders.find((t) => t.id === selectedTrader)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span>🛡️ Admin Control Panel</span>
            <Badge
              variant="outline"
              className={`ml-3 px-3 py-1 font-semibold ${
                isLiveMode
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
              }`}
            >
              {isLiveMode ? "🔴 LIVE MODE" : "🔵 VIRTUAL MODE"}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-lg">
            {isLiveMode
              ? "🚨 Přístup k reálným uživatelským datům - Veškeré informace jsou skutečné a citlivé"
              : "🎭 Demo prostředí s falešnými uživateli pro testování funkcionalit"}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">🔐 Zabezpečený přístup</h3>
              <p className="text-gray-600 max-w-md">
                Zadejte master kód pro přístup k admin panelu. Tento panel obsahuje citlivé uživatelské informace.
              </p>
            </div>
            <div className="flex space-x-3">
              <Input
                type="password"
                placeholder="Master přístupový kód"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCodeSubmit()}
                className="w-64 text-center font-mono text-lg bg-white/80 backdrop-blur-sm"
              />
              <Button
                onClick={handleCodeSubmit}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
              >
                🚀 Vstoupit
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-6">
              {/* Mode Info Alert */}
              <Alert className={`border-2 ${isLiveMode ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
                <Info className={`h-5 w-5 ${isLiveMode ? "text-red-600" : "text-blue-600"}`} />
                <div className="ml-3">
                  <h4 className={`font-bold text-lg ${isLiveMode ? "text-red-800" : "text-blue-800"}`}>
                    {isLiveMode ? "⚠️ LIVE MODE - Reálná data" : "🎭 VIRTUAL MODE - Demo data"}
                  </h4>
                  <AlertDescription className={`text-base ${isLiveMode ? "text-red-700" : "text-blue-700"}`}>
                    {isLiveMode
                      ? "Zobrazujete skutečné uživatele a jejich citlivé osobní informace. Zacházejte s těmito daty odpovědně."
                      : "Zobrazujete demo uživatele s falešnými daty pro testování. Tito uživatelé neexistují ve skutečnosti."}
                  </AlertDescription>
                </div>
              </Alert>

              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">👥 Celkem</p>
                        <p className="text-2xl font-bold text-gray-900">{totalTraders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">✅ Aktivní</p>
                        <p className="text-2xl font-bold text-green-600">{activeTraders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">👑 Premium</p>
                        <p className="text-2xl font-bold text-yellow-600">{premiumTraders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">💰 P&L</p>
                        <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${totalPnL.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">🎯 Avg WR</p>
                        <p className="text-2xl font-bold text-blue-600">{avgWinRate.toFixed(0)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">⚠️ Riziko</p>
                        <p className="text-2xl font-bold text-red-600">{riskTraders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Traders List */}
              {traders.length === 0 ? (
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardContent className="text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {isLiveMode ? "🔴 Žádní live uživatelé" : "🎭 Žádní demo uživatelé"}
                    </h3>
                    <p className="text-gray-600">
                      {isLiveMode
                        ? "V live režimu zatím nejsou žádní registrovaní uživatelé."
                        : "V demo režimu nejsou načteni žádní testovací uživatelé."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <Database className="w-6 h-6 text-blue-600" />
                      <span>📊 Seznam uživatelů ({traders.length})</span>
                    </h3>
                    <Badge variant="outline" className="bg-white/80 px-3 py-1">
                      {isLiveMode ? "🔴 Skuteční uživatelé" : "🎭 Demo uživatelé"}
                    </Badge>
                  </div>

                  <div className="grid gap-4">
                    {traders.map((trader) => (
                      <Card
                        key={trader.id}
                        className="border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                  {trader.name.charAt(0)}
                                </div>
                                <div
                                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                                    formatTime(trader.lastActive).includes("Právě")
                                      ? "bg-green-500"
                                      : formatTime(trader.lastActive).includes("Před") &&
                                          !formatTime(trader.lastActive).includes("dny")
                                        ? "bg-yellow-500"
                                        : "bg-gray-400"
                                  }`}
                                ></div>
                              </div>
                              <div>
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-bold text-xl text-gray-900">{trader.name}</h4>
                                  {trader.plan === "premium" && (
                                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                      <Crown className="w-3 h-3 mr-1" />
                                      PREMIUM
                                    </Badge>
                                  )}
                                  <Badge className={`px-2 py-1 text-xs font-medium ${getRiskColor(trader)}`}>
                                    {trader.riskLevel === "Extrémní"
                                      ? "🚨 VYSOKÉ RIZIKO"
                                      : trader.psychologyData.disciplineScore < 6
                                        ? "⚠️ STŘEDNÍ RIZIKO"
                                        : "✅ NÍZKÉ RIZIKO"}
                                  </Badge>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                      {trader.city}, {trader.country} • {trader.age} let • {trader.tradingExperience}
                                    </span>
                                  </p>
                                  <p className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Poslední aktivita: {formatTime(trader.lastActive)}</span>
                                  </p>
                                  <p className="flex items-center space-x-2">
                                    <Zap className="w-4 h-4" />
                                    <span>
                                      {trader.tradingStyle} • {trader.avgSessionTime} průměrně
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right space-y-2">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-600 font-medium">💰 P&L</p>
                                  <p
                                    className={`font-bold text-lg ${trader.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {trader.totalPnL >= 0 ? "+" : ""}${trader.totalPnL.toLocaleString()}
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-600 font-medium">🎯 Win Rate</p>
                                  <p
                                    className={`font-bold text-lg ${
                                      trader.winRate >= 60
                                        ? "text-green-600"
                                        : trader.winRate >= 45
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {trader.winRate}%
                                  </p>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-600 font-medium">📊 Obchody</p>
                                  <p className="font-bold text-lg text-purple-600">{trader.totalTrades}</p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTrader(selectedTrader === trader.id ? null : trader.id)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 hover:from-blue-600 hover:to-indigo-600"
                              >
                                {selectedTrader === trader.id ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Skrýt detaily
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Zobrazit detaily
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Detailed View */}
                          {selectedTrader === trader.id && selectedTraderData && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                                  <TabsTrigger value="overview">📊 Přehled</TabsTrigger>
                                  <TabsTrigger value="psychology">🧠 Psychologie</TabsTrigger>
                                  <TabsTrigger value="technical">⚙️ Technické</TabsTrigger>
                                  <TabsTrigger value="goals">🎯 Cíle</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">📈 Měsíční obchody</p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {selectedTraderData.monthlyStats.trades}
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">💰 Měsíční P&L</p>
                                      <p
                                        className={`text-2xl font-bold ${selectedTraderData.monthlyStats.pnl >= 0 ? "text-green-600" : "text-red-600"}`}
                                      >
                                        {selectedTraderData.monthlyStats.pnl >= 0 ? "+" : ""}$
                                        {selectedTraderData.monthlyStats.pnl}
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">🏆 Nejlepší den</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        +${selectedTraderData.monthlyStats.bestDay}
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">📉 Nejhorší den</p>
                                      <p className="text-2xl font-bold text-red-600">
                                        ${selectedTraderData.monthlyStats.worstDay}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2">💎 Oblíbené assety</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedTraderData.favoriteAssets.map((asset, index) => (
                                        <Badge key={index} variant="outline" className="bg-white">
                                          {asset}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="psychology" className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">😊 Průměrná nálada</p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {selectedTraderData.psychologyData.avgMood}/10
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">😰 Průměrný stres</p>
                                      <p className="text-2xl font-bold text-red-600">
                                        {selectedTraderData.psychologyData.avgStress}/10
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">💪 Sebedůvěra</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        {selectedTraderData.psychologyData.avgConfidence}/10
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">🎯 Disciplína</p>
                                      <p className="text-2xl font-bold text-purple-600">
                                        {selectedTraderData.psychologyData.disciplineScore}/10
                                      </p>
                                    </div>
                                  </div>

                                  {selectedTraderData.psychologyData.disciplineScore < 5 && (
                                    <Alert className="bg-red-50 border-red-200">
                                      <AlertTriangle className="h-4 w-4 text-red-600" />
                                      <AlertDescription className="text-red-700">
                                        <strong>⚠️ VAROVÁNÍ:</strong> Nízké skóre disciplíny! Tento trader potřebuje
                                        psychologickou podporu.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </TabsContent>

                                <TabsContent value="technical" className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">📱 Zařízení</p>
                                      <div className="flex items-center space-x-2">
                                        <Smartphone className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold">{selectedTraderData.deviceType}</span>
                                      </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">🌐 Prohlížeč</p>
                                      <div className="flex items-center space-x-2">
                                        <Globe className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold">{selectedTraderData.browser}</span>
                                      </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600 font-medium mb-1">🕐 Časové pásmo</p>
                                      <span className="font-semibold">{selectedTraderData.timezone}</span>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="goals" className="space-y-4 mt-4">
                                  <div className="space-y-3">
                                    <h5 className="font-semibold text-gray-900 flex items-center space-x-2">
                                      <Target className="w-5 h-5 text-blue-600" />
                                      <span>🎯 Aktuální cíle</span>
                                    </h5>
                                    {selectedTraderData.goals.map((goal, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                                      >
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        <span className="font-medium text-gray-800">{goal}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                                      <Brain className="w-5 h-5 text-orange-600" />
                                      <span>📝 Admin poznámky</span>
                                    </h5>
                                    <p className="text-gray-700 italic">{selectedTraderData.notes}</p>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 hover:from-gray-600 hover:to-gray-700"
          >
            🚪 Zavřít panel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
