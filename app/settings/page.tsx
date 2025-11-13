"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NotificationSettings } from "@/components/notification-settings"
import {
  User,
  SettingsIcon,
  Brain,
  Download,
  Heart,
  Bell,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  TrendingUp,
  Activity,
  Moon,
  Sun,
  Calendar,
  Smartphone,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  FileText,
  Zap,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useToast } from "@/hooks/use-toast"
import { getUserData, saveUserData, exportUserData } from "@/utils/storage-utils"

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  connected: boolean
  status?: "active" | "error" | "pending"
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("account")
  const [loading, setLoading] = useState(false)

  // Account Settings
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [role, setRole] = useState<"trader" | "mentor">("trader")
  const [timezone, setTimezone] = useState("Europe/Prague")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // App Preferences
  const [language, setLanguage] = useState("cs")
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("dark")
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Privacy
  const [profileVisibility, setProfileVisibility] = useState<"private" | "mentor" | "public">("private")
  const [aiDataAccess, setAiDataAccess] = useState(true)
  const [shareAggregateData, setShareAggregateData] = useState(false)

  // AI Settings
  const [aiCoachType, setAiCoachType] = useState<"analytical" | "motivational" | "psychological" | "minimal">(
    "psychological",
  )
  const [aiTone, setAiTone] = useState<"strict" | "neutral" | "empathetic">("empathetic")
  const [aiFrequency, setAiFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [aiDataScope, setAiDataScope] = useState("all")

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "metatrader",
      name: "MetaTrader 5",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Automatický import obchodů",
      connected: false,
    },
    {
      id: "tradingview",
      name: "TradingView",
      icon: <Activity className="w-5 h-5" />,
      description: "Sync trading zón a screenshotů",
      connected: false,
    },
    {
      id: "fitbit",
      name: "Fitbit / Oura",
      icon: <Heart className="w-5 h-5" />,
      description: "Sledování spánku a aktivity",
      connected: false,
    },
    {
      id: "google",
      name: "Google Calendar",
      icon: <Calendar className="w-5 h-5" />,
      description: "Sync s denní rutinou",
      connected: false,
    },
    {
      id: "discord",
      name: "Discord",
      icon: <Bell className="w-5 h-5" />,
      description: "Notifikace pro mentoring",
      connected: false,
    },
    {
      id: "ai-api",
      name: "MindTrader AI API",
      icon: <Brain className="w-5 h-5" />,
      description: "Povolení přístupu k datům",
      connected: true,
      status: "active",
    },
  ])

  // Wellbeing Sync
  const [autoSleepTracking, setAutoSleepTracking] = useState(false)
  const [weatherSync, setWeatherSync] = useState(true)
  const [meditationTracking, setMeditationTracking] = useState(false)
  const [sportTracking, setSportTracking] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }

    const userData = getUserData()
    if (userData.settings) {
      // Load saved settings
      const settings = userData.settings as any
      if (settings.nickname) setNickname(settings.nickname)
      if (settings.role) setRole(settings.role)
      if (settings.timezone) setTimezone(settings.timezone)
      if (settings.theme) setTheme(settings.theme)
      if (settings.language) setLanguage(settings.language)
      if (settings.aiCoachType) setAiCoachType(settings.aiCoachType)
      if (settings.aiTone) setAiTone(settings.aiTone)
      if (settings.aiFrequency) setAiFrequency(settings.aiFrequency)
    }
  }

  const saveSettings = () => {
    setLoading(true)
    try {
      const userData = getUserData()
      userData.settings = {
        ...userData.settings,
        nickname,
        role,
        timezone,
        theme,
        language,
        twoFactorEnabled,
        soundsEnabled,
        animationsEnabled,
        privacy: {
          profileVisibility,
          aiDataAccess,
          shareAggregateData,
        },
        ai: {
          coachType: aiCoachType,
          tone: aiTone,
          frequency: aiFrequency,
          dataScope: aiDataScope,
        },
        wellbeing: {
          autoSleepTracking,
          weatherSync,
          meditationTracking,
          sportTracking,
        },
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      toast({
        title: "✅ Nastavení uloženo",
        description: "Všechny změny byly úspěšně uloženy.",
      })
    } catch (error) {
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se uložit nastavení.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    try {
      const data = exportUserData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mindtrader-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "✅ Export úspěšný",
        description: "Data byla stažena.",
      })
    } catch (error) {
      toast({
        title: "❌ Chyba",
        description: "Nepodařilo se exportovat data.",
        variant: "destructive",
      })
    }
  }

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? {
              ...int,
              connected: !int.connected,
              status: !int.connected ? "active" : undefined,
            }
          : int,
      ),
    )

    toast({
      title: integrations.find((i) => i.id === id)?.connected ? "🔌 Odpojeno" : "✅ Připojeno",
      description: `Integrace ${integrations.find((i) => i.id === id)?.name} byla ${integrations.find((i) => i.id === id)?.connected ? "odpojena" : "připojena"}.`,
    })
  }

  const AIHintBox = ({ message }: { message: string }) => (
    <Alert className="border-purple-500/30 bg-purple-500/10 mt-4">
      <Sparkles className="h-4 w-4 text-purple-400" />
      <AlertDescription className="text-purple-200 text-sm ml-2">{message}</AlertDescription>
    </Alert>
  )

  return (
    <div className="min-h-screen bg-transparent pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">⚙️ Nastavení</h1>
            <p className="text-gray-400">Profesionální kontrolní centrum tvého účtu</p>
          </div>
          <Button onClick={saveSettings} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            {loading ? "Ukládám..." : "Uložit změny"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger value="account" className="data-[state=active]:bg-slate-700">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-700">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-700">
              <Brain className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* ACCOUNT TAB */}
          <TabsContent value="account" className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">👤 Profil</CardTitle>
                <CardDescription className="text-gray-400">Základní informace o účtu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/trader-avatar.png" />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">{name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="bg-transparent border-slate-600 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Změnit fotku
                    </Button>
                    <p className="text-sm text-gray-400">PNG, JPG až 5MB</p>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Jméno</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Přezdívka</Label>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Jak tě má volat AI?"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Role</Label>
                    <Select value={role} onValueChange={(value: any) => setRole(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="trader" className="text-white">
                          🎯 Trader
                        </SelectItem>
                        <SelectItem value="mentor" className="text-white">
                          👨‍🏫 Mentor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Časové pásmo</Label>
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <AIHintBox message="💡 Přezdívka pomáhá AI komunikovat osobněji – trader 'Honza' má lepší engagement než 'User#123'." />
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🔐 Zabezpečení</CardTitle>
                <CardDescription className="text-gray-400">Ochrana tvého účtu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-white">Dvoufaktorové ověření (2FA)</p>
                    <p className="text-sm text-gray-400">Zvýšená bezpečnost přihlášení</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Změnit heslo</Label>
                    <Button variant="outline" className="bg-transparent border-slate-600 text-white">
                      <Lock className="w-4 h-4 mr-2" />
                      Změnit
                    </Button>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div>
                    <Label className="text-gray-300 mb-2 block">Aktivní relace</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Aktuální zařízení</p>
                            <p className="text-xs text-gray-400">Praha, Česko • Právě teď</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Aktivní</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <AIHintBox message="⚠️ AI doporučuje zapnout 2FA – tvůj účet má aktivní mentoring data." />
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">💳 Předplatné</CardTitle>
                <CardDescription className="text-gray-400">Správa tvého tarifu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {subscription?.plan === "premium" ? "Premium" : "Free"} Plan
                    </h3>
                    <p className="text-gray-400 mt-1">
                      {subscription?.plan === "premium" ? "€59/měsíc" : "Základní funkce"}
                    </p>
                  </div>
                  <Badge
                    className={
                      subscription?.plan === "premium"
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                    }
                  >
                    {subscription?.plan === "premium" ? "✨ Aktivní" : "📦 Základní"}
                  </Badge>
                </div>

                {subscription?.plan === "free" && (
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgradovat na Premium
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES TAB */}
          <TabsContent value="preferences" className="space-y-6">
            {/* App Preferences */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🎨 Vzhled aplikace</CardTitle>
                <CardDescription className="text-gray-400">Personalizuj si prostředí</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Jazyk</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="cs" className="text-white">
                          🇨🇿 Čeština
                        </SelectItem>
                        <SelectItem value="en" className="text-white">
                          🇬🇧 English
                        </SelectItem>
                        <SelectItem value="de" className="text-white">
                          🇩🇪 Deutsch
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Téma</Label>
                    <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="light" className="text-white">
                          <div className="flex items-center">
                            <Sun className="w-4 h-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark" className="text-white">
                          <div className="flex items-center">
                            <Moon className="w-4 h-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="auto" className="text-white">
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Auto
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Zvuky</p>
                      <p className="text-sm text-gray-400">Zvukové efekty v aplikaci</p>
                    </div>
                    <Switch checked={soundsEnabled} onCheckedChange={setSoundsEnabled} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Animace</p>
                      <p className="text-sm text-gray-400">Plynulé přechody a efekty</p>
                    </div>
                    <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🔔 Notifikace</CardTitle>
                <CardDescription className="text-gray-400">Spravuj svá upozornění</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettings />
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🔐 Soukromí</CardTitle>
                <CardDescription className="text-gray-400">Kontrola tvých dat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Viditelnost profilu</Label>
                  <Select value={profileVisibility} onValueChange={(value: any) => setProfileVisibility(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="private" className="text-white">
                        <div className="flex items-center">
                          <EyeOff className="w-4 h-4 mr-2" />
                          Privátní
                        </div>
                      </SelectItem>
                      <SelectItem value="mentor" className="text-white">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Viditelný pro mentora
                        </div>
                      </SelectItem>
                      <SelectItem value="public" className="text-white">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Veřejný leaderboard
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Povolit AI přístup k datům</p>
                      <p className="text-sm text-gray-400">AI analyzuje journaling a trackery</p>
                    </div>
                    <Switch checked={aiDataAccess} onCheckedChange={setAiDataAccess} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Sdílet agregovaná data</p>
                      <p className="text-sm text-gray-400">Anonymní statistiky pro výzkum</p>
                    </div>
                    <Switch checked={shareAggregateData} onCheckedChange={setShareAggregateData} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full bg-transparent border-slate-600 text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Zobrazit všechny uložené údaje (GDPR)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-red-400 hover:text-red-300 border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Smazat účet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADVANCED TAB */}
          <TabsContent value="advanced" className="space-y-6">
            {/* AI Settings */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🧠 AI Kouč</CardTitle>
                <CardDescription className="text-gray-400">Personalizace tvého AI mentora</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Typ kouče</Label>
                    <Select value={aiCoachType} onValueChange={(value: any) => setAiCoachType(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="analytical" className="text-white">
                          🧩 Analytik
                        </SelectItem>
                        <SelectItem value="motivational" className="text-white">
                          💪 Motivátor
                        </SelectItem>
                        <SelectItem value="psychological" className="text-white">
                          🧠 Psycholog
                        </SelectItem>
                        <SelectItem value="minimal" className="text-white">
                          📝 Minimalista
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tón komunikace</Label>
                    <Select value={aiTone} onValueChange={(value: any) => setAiTone(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="strict" className="text-white">
                          ⚡ Přísný
                        </SelectItem>
                        <SelectItem value="neutral" className="text-white">
                          💬 Neutrální
                        </SelectItem>
                        <SelectItem value="empathetic" className="text-white">
                          🤝 Empatický
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Frekvence insightů</Label>
                    <Select value={aiFrequency} onValueChange={(value: any) => setAiFrequency(value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="daily" className="text-white">
                          📅 Denně
                        </SelectItem>
                        <SelectItem value="weekly" className="text-white">
                          📊 Týdně
                        </SelectItem>
                        <SelectItem value="monthly" className="text-white">
                          📈 Měsíčně
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Přístup k datům</Label>
                    <Select value={aiDataScope} onValueChange={setAiDataScope}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-white">
                          🌐 Všechna data
                        </SelectItem>
                        <SelectItem value="journaling" className="text-white">
                          📝 Pouze journaling
                        </SelectItem>
                        <SelectItem value="tracker" className="text-white">
                          📊 Pouze tracker
                        </SelectItem>
                        <SelectItem value="minimal" className="text-white">
                          🔒 Minimální
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <Button variant="outline" className="w-full bg-transparent border-slate-600 text-white">
                  <Brain className="w-4 h-4 mr-2" />
                  Reset AI modelu (nový začátek)
                </Button>

                <AIHintBox message="💡 Aktuálně používáš empatického psychologa s týdenními reporty. Většina traderů má nejlepší výsledky s tímto nastavením." />
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🔌 Integrace</CardTitle>
                <CardDescription className="text-gray-400">Propoj své trading platformy a nástroje</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {integrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-3 rounded-lg ${
                              integration.connected ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {integration.icon}
                          </div>
                          <div>
                            <p className="font-medium text-white">{integration.name}</p>
                            <p className="text-sm text-gray-400">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {integration.connected && integration.status && (
                            <Badge
                              className={
                                integration.status === "active"
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : integration.status === "error"
                                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                                    : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              }
                            >
                              {integration.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {integration.status === "error" && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {integration.status === "active" ? "Aktivní" : integration.status}
                            </Badge>
                          )}
                          <Switch
                            checked={integration.connected}
                            onCheckedChange={() => toggleIntegration(integration.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <AIHintBox message="🔌 MetaTrader integrace automaticky importuje tvé obchody – ušetří ti 80% času s manuálním zapisováním." />
              </CardContent>
            </Card>

            {/* Wellbeing Sync */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">🧘 Wellbeing Sync</CardTitle>
                <CardDescription className="text-gray-400">Automatické sledování zdraví a rutiny</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Automatické sledování spánku</p>
                    <p className="text-sm text-gray-400">Apple Health, Fitbit, Oura</p>
                  </div>
                  <Switch checked={autoSleepTracking} onCheckedChange={setAutoSleepTracking} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Sync počasí</p>
                    <p className="text-sm text-gray-400">Vliv na náladu a výkon</p>
                  </div>
                  <Switch checked={weatherSync} onCheckedChange={setWeatherSync} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Sledování meditace</p>
                    <p className="text-sm text-gray-400">Tracking meditačních session</p>
                  </div>
                  <Switch checked={meditationTracking} onCheckedChange={setMeditationTracking} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Sledování sportu</p>
                    <p className="text-sm text-gray-400">Import fyzické aktivity</p>
                  </div>
                  <Switch checked={sportTracking} onCheckedChange={setSportTracking} />
                </div>

                <AIHintBox message="💤 Korelace spánek-výkon: tradeři se 7+ h spánku mají o 23% lepší win rate." />
              </CardContent>
            </Card>

            {/* Data & Export */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">📦 Data & Export</CardTitle>
                <CardDescription className="text-gray-400">Správa a export tvých dat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="bg-transparent border-slate-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export do JSON
                  </Button>
                  <Button variant="outline" className="bg-transparent border-slate-600 text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    Export do PDF
                  </Button>
                  <Button variant="outline" className="bg-transparent border-slate-600 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV (obchody)
                  </Button>
                  <Button variant="outline" className="bg-transparent border-slate-600 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Import z Excelu
                  </Button>
                </div>

                <Separator className="bg-slate-700" />

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-300">Automatická záloha</p>
                      <p className="text-sm text-blue-200 mt-1">
                        Premium uživatelé mají automatickou zálohu každých 7 dní. Poslední záloha: před 2 dny
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
