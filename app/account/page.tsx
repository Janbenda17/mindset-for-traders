"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  Download,
  Trash2,
  Check,
  X,
  Crown,
  Zap,
  Activity,
  TrendingUp,
  Award,
  Target,
  Settings,
  Clock,
  BarChart3,
  Database,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { getUserData, saveUserData } from "@/utils/storage-utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { subscription, cancelSubscription } = useSubscription()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Trading Settings
  const [tradingStyle, setTradingStyle] = useState<"scalper" | "day-trader" | "swing-trader">("day-trader")
  const [riskLevel, setRiskLevel] = useState<"conservative" | "moderate" | "aggressive">("moderate")
  const [timezone, setTimezone] = useState("Europe/Prague")

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [tradingAlerts, setTradingAlerts] = useState(true)
  const [dailyReminder, setDailyReminder] = useState(false)
  const [psychologyInsights, setPsychologyInsights] = useState(true)

  // Stats
  const [stats, setStats] = useState({
    activeDays: 0,
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageMood: 0,
    totalTrades: 0,
  })

  // Load initial data once
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
    loadStats()
    loadSettings()
  }, []) // Empty dependency array - runs only once on mount

  // Handle tab from URL separately
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const loadSettings = () => {
    const userData = getUserData()

    // Load trading settings
    if (userData.settings?.trading) {
      setTradingStyle(userData.settings.trading.style || "day-trader")
      setRiskLevel(userData.settings.trading.riskLevel || "moderate")
      setTimezone(userData.settings.trading.timezone || "Europe/Prague")
    }

    // Load notification settings
    if (userData.settings?.notifications) {
      const notif = userData.settings.notifications
      setEmailNotifications(notif.email ?? true)
      setPushNotifications(notif.push ?? true)
      setWeeklyReport(notif.weeklyReport ?? true)
      setTradingAlerts(notif.tradingAlerts ?? true)
      setDailyReminder(notif.dailyReminder ?? false)
      setPsychologyInsights(notif.psychologyInsights ?? true)
    }
  }

  const loadStats = () => {
    const userData = getUserData()
    const journalEntries = userData.journalEntries || []
    const moodEntries = userData.moodEntries || []

    const uniqueDates = new Set([...journalEntries.map((e) => e.date), ...moodEntries.map((e) => e.date)])
    const activeDays = uniqueDates.size

    const sortedDates = Array.from(uniqueDates).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = new Date(sortedDates[i])
      date.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (i === sortedDates.length - 1 && daysDiff <= 1) {
        currentStreak = 1
        tempStreak = 1
      } else if (i < sortedDates.length - 1) {
        const prevDate = new Date(sortedDates[i + 1])
        prevDate.setHours(0, 0, 0, 0)
        const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diff === 1) {
          tempStreak++
          if (i === sortedDates.length - 1 || (i === sortedDates.length - 2 && daysDiff <= 1)) {
            currentStreak = tempStreak
          }
        } else {
          tempStreak = 1
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak)
    }

    const avgMood =
      moodEntries.length > 0 ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length : 0

    setStats({
      activeDays,
      totalEntries: journalEntries.length,
      currentStreak,
      longestStreak,
      averageMood: Math.round(avgMood * 10) / 10,
      totalTrades: journalEntries.filter((e) => e.type === "trade").length,
    })
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const userData = getUserData()
      userData.user = {
        ...userData.user,
        name,
        email,
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      if (user) {
        user.name = name
        user.email = email
      }

      toast({
        title: "✅ Profil uložen",
        description: "Vaše změny byly úspěšně uloženy.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se uložit změny.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTradingSettings = () => {
    try {
      const userData = getUserData()
      if (!userData.settings) {
        userData.settings = {}
      }
      userData.settings.trading = {
        style: tradingStyle,
        riskLevel,
        timezone,
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      toast({
        title: "✅ Nastavení uloženo",
        description: "Trading nastavení byla úspěšně uložena.",
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving trading settings:", error)
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se uložit nastavení.",
        variant: "destructive",
      })
    }
  }

  const handleSaveNotifications = () => {
    try {
      const userData = getUserData()
      if (!userData.settings) {
        userData.settings = {}
      }
      userData.settings.notifications = {
        email: emailNotifications,
        push: pushNotifications,
        weeklyReport,
        tradingAlerts,
        dailyReminder,
        psychologyInsights,
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      toast({
        title: "✅ Nastavení uloženo",
        description: "Notifikační preference byly úspěšně uloženy.",
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving notifications:", error)
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se uložit nastavení.",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (window.confirm("Opravdu chcete zrušit předplatné? Ztratíte přístup k Premium funkcím.")) {
      try {
        await cancelSubscription()
        toast({
          title: "✅ Předplatné zrušeno",
          description: "Vaše předplatné bylo úspěšně zrušeno.",
        })
        window.location.reload()
      } catch (error) {
        console.error("Error canceling subscription:", error)
        toast({
          title: "❌ Chyba",
          description: "Nepodařilo se zrušit předplatné.",
          variant: "destructive",
        })
      }
    }
  }

  const handleExportData = () => {
    try {
      const userData = getUserData()
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `trader-mindset-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "✅ Data exportována",
        description: "Vaše data byla úspěšně stažena.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se exportovat data.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "⚠️ VAROVÁNÍ: Opravdu chcete smazat účet?\n\nTato akce je NEVRATNÁ a všechna vaše data budou trvale odstraněna.",
      )
    ) {
      const confirmation = prompt('Napište "SMAZAT" pro potvrzení:')
      if (confirmation === "SMAZAT") {
        try {
          localStorage.clear()
          sessionStorage.clear()

          toast({
            title: "✅ Účet smazán",
            description: "Váš účet a všechna data byla trvale odstraněna.",
          })

          setTimeout(() => {
            logout()
            router.push("/login")
          }, 2000)
        } catch (error) {
          console.error("Error deleting account:", error)
          toast({
            title: "❌ Chyba",
            description: "Nepodařilo se smazat účet.",
            variant: "destructive",
          })
        }
      }
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/subscription/billing-portal", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create billing portal session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error opening billing portal:", error)
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se otevřít billing portál.",
        variant: "destructive",
      })
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const getTradingStyleIcon = (style: string) => {
    switch (style) {
      case "scalper":
        return <Zap className="w-4 h-4" />
      case "day-trader":
        return <TrendingUp className="w-4 h-4" />
      case "swing-trader":
        return <Clock className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getTradingStyleDescription = (style: string) => {
    switch (style) {
      case "scalper":
        return "Rychlé obchody, několik minut až hodin"
      case "day-trader":
        return "Intradenní obchodování, uzavření do konce dne"
      case "swing-trader":
        return "Držení pozic několik dní až týdnů"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto p-6 space-y-8 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Můj účet</h1>
            <p className="text-gray-400">Spravujte svůj profil a nastavení</p>
          </div>
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-purple-600 text-white text-2xl">{name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-900/40 to-purple-600/20 border-purple-500/30 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Aktivní dny</p>
                  <p className="text-3xl font-bold text-purple-300">{stats.activeDays}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/40 to-green-600/20 border-green-500/30 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Celkem záznamů</p>
                  <p className="text-3xl font-bold text-green-300">{stats.totalEntries}</p>
                </div>
                <Target className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/40 to-orange-600/20 border-orange-500/30 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Aktuální streak</p>
                  <p className="text-3xl font-bold text-orange-300">{stats.currentStreak}</p>
                </div>
                <Award className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-600/20 border-blue-500/30 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Průměrná nálada</p>
                  <p className="text-3xl font-bold text-blue-300">{stats.averageMood}/10</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="psyche-card hover:scale-105 transition-all cursor-pointer"
            onClick={() => setActiveTab("profile")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Můj profil</h3>
                  <p className="text-sm text-gray-400">Upravit osobní údaje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/analytics" className="psyche-card hover:scale-105 transition-all">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Aktivita</h3>
                    <p className="text-sm text-gray-400">Zobrazit statistiky</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card
            className="psyche-card hover:scale-105 transition-all cursor-pointer"
            onClick={() => setActiveTab("security")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Moje data</h3>
                  <p className="text-sm text-gray-400">Export a správa dat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="psyche-card hover:scale-105 transition-all cursor-pointer"
            onClick={() => setActiveTab("trading")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Settings className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Obecné</h3>
                  <p className="text-sm text-gray-400">Trading nastavení</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="psyche-card hover:scale-105 transition-all cursor-pointer"
            onClick={() => setActiveTab("notifications")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Bell className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Notifikace</h3>
                  <p className="text-sm text-gray-400">Spravovat upozornění</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="psyche-card hover:scale-105 transition-all cursor-pointer"
            onClick={() => setActiveTab("subscription")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Crown className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Předplatné</h3>
                  <p className="text-sm text-gray-400">Spravovat plán</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="trading">
              <Settings className="w-4 h-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Předplatné
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifikace
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Zabezpečení
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Informace o profilu</CardTitle>
                <CardDescription className="text-gray-400">Upravte své osobní údaje</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Jméno
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Členem od</Label>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString("cs-CZ")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                      Upravit profil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {isSaving ? "Ukládám..." : "Uložit změny"}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false)
                          setName(user?.name || "")
                          setEmail(user?.email || "")
                        }}
                        variant="outline"
                        className="bg-transparent border-slate-600 text-white hover:bg-slate-800"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Zrušit
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRADING SETTINGS TAB */}
          <TabsContent value="trading">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Trading nastavení</CardTitle>
                <CardDescription className="text-gray-400">
                  Přizpůsobte si platformu podle svého trading stylu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Trading styl</Label>
                    <Select value={tradingStyle} onValueChange={(value: any) => setTradingStyle(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="scalper" className="text-white">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Scalper</p>
                              <p className="text-xs text-gray-400">Rychlé obchody, minuty až hodiny</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="day-trader" className="text-white">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Day Trader</p>
                              <p className="text-xs text-gray-400">Intradenní trading</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="swing-trader" className="text-white">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <div>
                              <p className="font-medium">Swing Trader</p>
                              <p className="text-xs text-gray-400">Držení pozic dny až týdny</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-400">{getTradingStyleDescription(tradingStyle)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Úroveň rizika</Label>
                    <Select value={riskLevel} onValueChange={(value: any) => setRiskLevel(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="conservative" className="text-white">
                          Konzervativní (1-2% risk/obchod)
                        </SelectItem>
                        <SelectItem value="moderate" className="text-white">
                          Střední (2-3% risk/obchod)
                        </SelectItem>
                        <SelectItem value="aggressive" className="text-white">
                          Agresivní (3-5% risk/obchod)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Časová zóna</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Europe/Prague" className="text-white">
                          Praha (CET)
                        </SelectItem>
                        <SelectItem value="Europe/London" className="text-white">
                          Londýn (GMT)
                        </SelectItem>
                        <SelectItem value="America/New_York" className="text-white">
                          New York (EST)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo" className="text-white">
                          Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveTradingSettings} className="bg-purple-600 hover:bg-purple-700">
                  <Check className="h-4 w-4 mr-2" />
                  Uložit nastavení
                </Button>

                {/* Trading Style Info */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getTradingStyleIcon(tradingStyle)}
                    <div>
                      <p className="text-sm font-medium text-blue-300 mb-1">
                        💡 Tip pro{" "}
                        {tradingStyle === "scalper"
                          ? "Scalpery"
                          : tradingStyle === "day-trader"
                            ? "Day Tradery"
                            : "Swing Tradery"}
                      </p>
                      <p className="text-sm text-gray-300">
                        {tradingStyle === "scalper" &&
                          "Zaměř se na vysokou disciplínu a rychlé rozhodování. Sleduj tick charty a order flow."}
                        {tradingStyle === "day-trader" &&
                          "Důležitá je ranní příprava a analýza. Drž se denního plánu a respektuj trading sessions."}
                        {tradingStyle === "swing-trader" &&
                          "Soustřeď se na větší timeframes a fundamentální analýzu. Měj trpělivost s pozicemi."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBSCRIPTION TAB */}
          <TabsContent value="subscription">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Předplatné</CardTitle>
                <CardDescription className="text-gray-400">Spravujte své předplatné a platby</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      {subscription?.plan === "premium" ? (
                        <Crown className="h-8 w-8 text-yellow-400" />
                      ) : (
                        <Zap className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {subscription?.plan === "premium" ? "Premium" : "Free"} plán
                      </h3>
                      <p className="text-gray-400">
                        {subscription?.plan === "premium" ? "Máte přístup ke všem funkcím" : "Základní funkce zdarma"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      subscription?.plan === "premium"
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }
                  >
                    {subscription?.plan === "premium" ? "Aktivní" : "Základní"}
                  </Badge>
                </div>

                {subscription?.plan === "premium" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Další platba</p>
                        <p className="text-gray-400 text-sm">
                          {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString("cs-CZ") : "N/A"}
                        </p>
                      </div>
                      <Button
                        onClick={handleManageBilling}
                        variant="outline"
                        className="bg-transparent border-slate-600 text-white hover:bg-slate-800"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Spravovat platby
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleManageBilling}
                        variant="outline"
                        className="bg-transparent border-slate-600 text-white hover:bg-slate-800"
                      >
                        Zobrazit faktury
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-transparent text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                        onClick={handleCancelSubscription}
                      >
                        Zrušit předplatné
                      </Button>
                    </div>
                  </div>
                )}

                {subscription?.plan === "free" && (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-4">Upgradujte na Premium pro přístup ke všem funkcím</p>
                    <Button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgradovat na Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Notifikace</CardTitle>
                <CardDescription className="text-gray-400">Spravujte své notifikační preference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Emailové notifikace</p>
                      <p className="text-gray-400 text-sm">Dostávejte důležité aktualizace emailem</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Push notifikace</p>
                      <p className="text-gray-400 text-sm">Dostávejte notifikace v prohlížeči</p>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Týdenní report</p>
                      <p className="text-gray-400 text-sm">Dostávejte týdenní přehled vašeho pokroku</p>
                    </div>
                    <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Trading upozornění</p>
                      <p className="text-gray-400 text-sm">Dostávejte upozornění na důležité trading momenty</p>
                    </div>
                    <Switch checked={tradingAlerts} onCheckedChange={setTradingAlerts} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Denní připomínka</p>
                      <p className="text-gray-400 text-sm">Připomínka k vyplnění denního trackeru</p>
                    </div>
                    <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Psychologické insighty</p>
                      <p className="text-gray-400 text-sm">AI analýza a tipy pro zlepšení mindset</p>
                    </div>
                    <Switch checked={psychologyInsights} onCheckedChange={setPsychologyInsights} />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="bg-purple-600 hover:bg-purple-700">
                  <Check className="h-4 w-4 mr-2" />
                  Uložit nastavení
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Export dat</CardTitle>
                  <CardDescription className="text-gray-400">
                    Stáhněte si kopii všech vašich dat ve formátu JSON
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="bg-transparent border-slate-600 text-white hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportovat data
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    Stáhne všechny vaše záznamy, nastavení a data v JSON formátu
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-red-500/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-red-400">Nebezpečná zóna</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tyto akce jsou nevratné a trvale odstraní všechna vaše data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="bg-transparent text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Smazat účet
                  </Button>
                  <p className="text-sm text-red-400/70 mt-2">
                    ⚠️ Tato akce je nevratná! Všechna vaše data budou trvale smazána.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
