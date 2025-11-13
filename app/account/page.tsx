"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Calendar,
  Bell,
  Shield,
  Download,
  Trash2,
  X,
  Crown,
  Zap,
  Activity,
  TrendingUp,
  Target,
  Settings,
  Clock,
  Database,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Save,
  Flame,
  Plus,
  Edit,
  Building2,
  Sparkles,
  Globe,
  Upload,
  Smartphone,
  Monitor,
  MapPin,
  Key,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useLanguage } from "@/contexts/language-context"
import {
  getUserData,
  saveUserData,
  exportUserData,
  clearAllDemoData,
  getPropFirmChallenges,
  savePropFirmChallenge,
  deletePropFirmChallenge,
  type PropFirmChallenge,
} from "@/utils/storage-utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { subscription } = useSubscription()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage, t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)

  // Profile State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [nickname, setNickname] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("/trader-avatar.png")

  // Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Trading Settings
  const [tradingStyle, setTradingStyle] = useState<"scalper" | "day-trader" | "swing-trader">("day-trader")
  const [riskLevel, setRiskLevel] = useState<"conservative" | "moderate" | "aggressive">("moderate")
  const [timezone, setTimezone] = useState("Europe/Prague")
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [defaultCurrency, setDefaultCurrency] = useState("USD")

  // Preferences
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [tradingAlerts, setTradingAlerts] = useState(true)
  const [dailyReminder, setDailyReminder] = useState(false)
  const [psychologyInsights, setPsychologyInsights] = useState(true)

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [emailOnNewDevice, setEmailOnNewDevice] = useState(true)
  const [emailOnPasswordChange, setEmailOnPasswordChange] = useState(true)
  const [emailOnSecurityChange, setEmailOnSecurityChange] = useState(true)

  // Prop Firm Challenges
  const [propChallenges, setPropChallenges] = useState<PropFirmChallenge[]>([])
  const [isAddingChallenge, setIsAddingChallenge] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<PropFirmChallenge | null>(null)
  const [challengeForm, setChallengeForm] = useState({
    name: "",
    firm: "",
    initialBalance: "",
    currentBalance: "",
    status: "active" as PropFirmChallenge["status"],
    phase: "challenge" as PropFirmChallenge["phase"],
    startDate: new Date().toISOString().split("T")[0],
    profitTarget: "",
    maxDailyLoss: "",
    maxTotalLoss: "",
    notes: "",
  })

  // Stats
  const [stats, setStats] = useState({
    activeDays: 0,
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageMood: 0,
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    memberSince: "",
  })

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
    loadAllSettings()
    loadStats()
    loadPropChallenges()

    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [])

  const loadPropChallenges = () => {
    const challenges = getPropFirmChallenges()
    setPropChallenges(challenges)
  }

  const loadAllSettings = () => {
    const userData = getUserData()

    if (userData.profile) {
      setNickname(userData.profile.nickname || "")
      setBio(userData.profile.bio || "")
      setExperienceLevel(userData.profile.experienceLevel || "intermediate")
      if (userData.profile.avatarUrl) {
        setAvatarUrl(userData.profile.avatarUrl)
      }
    }

    if (userData.settings?.trading) {
      setTradingStyle(userData.settings.trading.style || "day-trader")
      setRiskLevel(userData.settings.trading.riskLevel || "moderate")
      setTimezone(userData.settings.trading.timezone || "Europe/Prague")
      setDefaultCurrency(userData.settings.trading.defaultCurrency || "USD")
    }

    if (userData.settings?.preferences) {
      setSoundsEnabled(userData.settings.preferences.soundsEnabled ?? true)
      setAnimationsEnabled(userData.settings.preferences.animationsEnabled ?? true)
    }

    if (userData.settings?.notifications) {
      const notif = userData.settings.notifications
      setEmailNotifications(notif.email ?? true)
      setPushNotifications(notif.push ?? true)
      setWeeklyReport(notif.weeklyReport ?? true)
      setTradingAlerts(notif.tradingAlerts ?? true)
      setDailyReminder(notif.dailyReminder ?? false)
      setPsychologyInsights(notif.psychologyInsights ?? true)
    }

    if (userData.settings?.security) {
      setTwoFactorEnabled(userData.settings.security.twoFactorEnabled ?? false)
      setSessionTimeout(userData.settings.security.sessionTimeout?.toString() || "30")
      setLoginAlerts(userData.settings.security.loginAlerts ?? true)
      setEmailOnNewDevice(userData.settings.security.emailOnNewDevice ?? true)
      setEmailOnPasswordChange(userData.settings.security.emailOnPasswordChange ?? true)
      setEmailOnSecurityChange(userData.settings.security.emailOnSecurityChange ?? true)
    }
  }

  const loadStats = () => {
    const userData = getUserData()
    const journalEntries = userData.journalEntries || []
    const moodEntries = userData.moodEntries || []
    const tradeEntries = journalEntries.filter((e) => e.type === "trade")

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

    const winningTrades = tradeEntries.filter((e) => (e.pnl || 0) > 0).length
    const winRate = tradeEntries.length > 0 ? (winningTrades / tradeEntries.length) * 100 : 0
    const totalPnL = tradeEntries.reduce((sum, e) => sum + (e.pnl || 0), 0)

    setStats({
      activeDays,
      totalEntries: journalEntries.length,
      currentStreak,
      longestStreak,
      averageMood: Math.round(avgMood * 10) / 10,
      totalTrades: tradeEntries.length,
      winRate: Math.round(winRate),
      totalPnL: Math.round(totalPnL),
      memberSince: new Date().toLocaleDateString(language === "cs" ? "cs-CZ" : "en-US"),
    })
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Soubor je příliš velký (max 5MB)" : "File is too large (max 5MB)",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Soubor musí být obrázek" : "File must be an image",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setAvatarUrl(result)

      const userData = getUserData()
      if (!userData.profile) {
        userData.profile = {}
      }
      userData.profile.avatarUrl = result
      saveUserData(userData)

      toast({
        title: "✅ " + t("toast.success"),
        description: t("toast.photoUploaded"),
      })
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setAvatarUrl("/trader-avatar.png")

    const userData = getUserData()
    if (userData.profile) {
      delete userData.profile.avatarUrl
      saveUserData(userData)
    }

    toast({
      title: "✅ " + t("toast.success"),
      description: t("toast.photoRemoved"),
    })
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const userData = getUserData()

      if (userData.user) {
        userData.user.name = name
        userData.user.email = email
      }

      userData.profile = {
        ...userData.profile,
        nickname,
        bio,
        experienceLevel,
        avatarUrl,
        updatedAt: new Date().toISOString(),
      }

      saveUserData(userData)

      toast({
        title: "✅ " + t("toast.success"),
        description: t("toast.profileSaved"),
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nepodařilo se uložit změny." : "Failed to save changes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
        experienceLevel,
        defaultCurrency,
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      toast({
        title: "✅ " + t("toast.success"),
        description: t("toast.settingsSaved"),
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving trading settings:", error)
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nepodařilo se uložit nastavení." : "Failed to save settings.",
        variant: "destructive",
      })
    }
  }

  const handleSavePreferences = () => {
    try {
      const userData = getUserData()
      if (!userData.settings) {
        userData.settings = {}
      }
      userData.settings.preferences = {
        soundsEnabled,
        animationsEnabled,
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      toast({
        title: "✅ " + t("toast.success"),
        description: t("toast.settingsSaved"),
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nepodařilo se uložit nastavení." : "Failed to save settings.",
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
        title: "✅ " + t("toast.success"),
        description: t("toast.settingsSaved"),
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving notifications:", error)
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nepodařilo se uložit nastavení." : "Failed to save settings.",
        variant: "destructive",
      })
    }
  }

  const handleSaveSecuritySettings = () => {
    try {
      const userData = getUserData()
      if (!userData.settings) {
        userData.settings = {}
      }
      userData.settings.security = {
        twoFactorEnabled,
        sessionTimeout: Number.parseInt(sessionTimeout),
        loginAlerts,
        emailOnNewDevice,
        emailOnPasswordChange,
        emailOnSecurityChange,
        updatedAt: new Date().toISOString(),
      }
      saveUserData(userData)

      toast({
        title: "✅ " + t("toast.success"),
        description: t("toast.settingsSaved"),
      })
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nepodařilo se uložit nastavení." : "Failed to save settings.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Vyplňte všechna pole." : "Fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nová hesla se neshodují." : "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Heslo musí mít alespoň 6 znaků." : "Password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "✅ " + t("toast.success"),
      description: t("toast.passwordChanged"),
    })

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleSaveChallenge = () => {
    if (!challengeForm.name || !challengeForm.firm || !challengeForm.initialBalance) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Vyplňte všechna povinná pole." : "Fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const challenge: PropFirmChallenge = {
      id: editingChallenge?.id || Date.now().toString(),
      name: challengeForm.name,
      firm: challengeForm.firm,
      initialBalance: Number.parseFloat(challengeForm.initialBalance),
      currentBalance: Number.parseFloat(challengeForm.currentBalance || challengeForm.initialBalance),
      status: challengeForm.status,
      phase: challengeForm.phase,
      startDate: challengeForm.startDate,
      profitTarget: challengeForm.profitTarget ? Number.parseFloat(challengeForm.profitTarget) : undefined,
      maxDailyLoss: challengeForm.maxDailyLoss ? Number.parseFloat(challengeForm.maxDailyLoss) : undefined,
      maxTotalLoss: challengeForm.maxTotalLoss ? Number.parseFloat(challengeForm.maxTotalLoss) : undefined,
      notes: challengeForm.notes,
      createdAt: editingChallenge?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    savePropFirmChallenge(challenge)
    loadPropChallenges()
    setIsAddingChallenge(false)
    setEditingChallenge(null)
    setChallengeForm({
      name: "",
      firm: "",
      initialBalance: "",
      currentBalance: "",
      status: "active",
      phase: "challenge",
      startDate: new Date().toISOString().split("T")[0],
      profitTarget: "",
      maxDailyLoss: "",
      maxTotalLoss: "",
      notes: "",
    })

    toast({
      title: "✅ " + t("toast.success"),
      description: editingChallenge
        ? language === "cs"
          ? "Challenge byl aktualizován."
          : "Challenge updated."
        : language === "cs"
          ? "Nový challenge byl přidán."
          : "New challenge added.",
    })
  }

  const handleEditChallenge = (challenge: PropFirmChallenge) => {
    setEditingChallenge(challenge)
    setChallengeForm({
      name: challenge.name,
      firm: challenge.firm,
      initialBalance: challenge.initialBalance.toString(),
      currentBalance: challenge.currentBalance.toString(),
      status: challenge.status,
      phase: challenge.phase,
      startDate: challenge.startDate,
      profitTarget: challenge.profitTarget?.toString() || "",
      maxDailyLoss: challenge.maxDailyLoss?.toString() || "",
      maxTotalLoss: challenge.maxTotalLoss?.toString() || "",
      notes: challenge.notes || "",
    })
    setIsAddingChallenge(true)
  }

  const handleDeleteChallenge = (id: string) => {
    if (window.confirm(language === "cs" ? "Opravdu chcete smazat tento challenge?" : "Delete this challenge?")) {
      deletePropFirmChallenge(id)
      loadPropChallenges()
      toast({
        title: "✅ " + t("toast.success"),
        description: language === "cs" ? "Challenge byl úspěšně smazán." : "Challenge deleted successfully.",
      })
    }
  }

  const handleExportData = () => {
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
        title: "✅ " + t("toast.success"),
        description: language === "cs" ? "Data byla stažena jako JSON soubor." : "Data exported as JSON file.",
      })
    } catch (error) {
      toast({
        title: "❌ " + t("toast.error"),
        description: language === "cs" ? "Nepodařilo se exportovat data." : "Failed to export data.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = () => {
    const warningMsg =
      language === "cs"
        ? "⚠️ VAROVÁNÍ: Opravdu chcete smazat účet?\n\nTato akce je NEVRATNÁ a všechna vaše data budou trvale odstraněna."
        : "⚠️ WARNING: Do you really want to delete your account?\n\nThis action is IRREVERSIBLE and all your data will be permanently deleted."

    if (window.confirm(warningMsg)) {
      const confirmation = prompt(language === "cs" ? 'Napište "SMAZAT" pro potvrzení:' : 'Type "DELETE" to confirm:')
      const confirmWord = language === "cs" ? "SMAZAT" : "DELETE"

      if (confirmation === confirmWord) {
        try {
          clearAllDemoData()

          toast({
            title: "✅ " + t("toast.success"),
            description:
              language === "cs"
                ? "Váš účet a všechna data byla trvale odstraněna."
                : "Your account and all data have been permanently deleted.",
          })

          setTimeout(() => {
            logout()
            router.push("/login")
          }, 2000)
        } catch (error) {
          console.error("Error deleting account:", error)
          toast({
            title: "❌ " + t("toast.error"),
            description: language === "cs" ? "Nepodařilo se smazat účet." : "Failed to delete account.",
            variant: "destructive",
          })
        }
      }
    }
  }

  const getTradingStyleInfo = () => {
    switch (tradingStyle) {
      case "scalper":
        return {
          icon: <Zap className="w-5 h-5 text-yellow-400" />,
          label: "Scalper",
          description: language === "cs" ? "Rychlé obchody, několik minut" : "Fast trades, few minutes",
          color: "text-yellow-400",
        }
      case "day-trader":
        return {
          icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
          label: "Day Trader",
          description: language === "cs" ? "Intradenní trading" : "Intraday trading",
          color: "text-blue-400",
        }
      case "swing-trader":
        return {
          icon: <Clock className="w-5 h-5 text-purple-400" />,
          label: "Swing Trader",
          description: language === "cs" ? "Držení několik dní" : "Hold for several days",
          color: "text-purple-400",
        }
    }
  }

  const getRiskLevelBadge = () => {
    switch (riskLevel) {
      case "conservative":
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
            <Shield className="w-3 h-3 mr-1" />
            {language === "cs" ? "Konzervativní" : "Conservative"}
          </Badge>
        )
      case "moderate":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
            <Activity className="w-3 h-3 mr-1" />
            {language === "cs" ? "Střední" : "Moderate"}
          </Badge>
        )
      case "aggressive":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {language === "cs" ? "Agresivní" : "Aggressive"}
          </Badge>
        )
    }
  }

  const getChallengeStatusBadge = (status: PropFirmChallenge["status"]) => {
    const labels = {
      active: language === "cs" ? "Aktivní" : "Active",
      failed: language === "cs" ? "Neúspěšný" : "Failed",
      passed: language === "cs" ? "Úspěšný" : "Passed",
      funded: "Funded",
      withdrawn: language === "cs" ? "Ukončen" : "Withdrawn",
    }

    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            {labels.active}
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/50">
            <X className="w-3 h-3 mr-1" />
            {labels.failed}
          </Badge>
        )
      case "passed":
        return (
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            {labels.passed}
          </Badge>
        )
      case "funded":
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
            <Crown className="w-3 h-3 mr-1" />
            {labels.funded}
          </Badge>
        )
      case "withdrawn":
        return (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50">
            <X className="w-3 h-3 mr-1" />
            {labels.withdrawn}
          </Badge>
        )
    }
  }

  const styleInfo = getTradingStyleInfo()

  return (
    <div className="min-h-screen bg-transparent pt-20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-400" />
              {t("account.title")}
            </h1>
            <p className="text-gray-400 mt-1">{t("account.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {styleInfo.icon}
            <span className={`text-sm font-medium ${styleInfo.color}`}>{styleInfo.label}</span>
            {getRiskLevelBadge()}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/80 border border-slate-700/50 p-1.5 backdrop-blur-xl">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
              <User className="w-4 h-4 mr-2" />
              {language === "cs" ? "Profil" : "Profile"}
            </TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              {language === "cs" ? "Preference" : "Preferences"}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
              <Bell className="w-4 h-4 mr-2" />
              {language === "cs" ? "Notifikace" : "Notifications"}
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-600">
              <Shield className="w-4 h-4 mr-2" />
              {language === "cs" ? "Zabezpečení" : "Security"}
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-purple-600">
              <Crown className="w-4 h-4 mr-2" />
              {language === "cs" ? "Předplatné" : "Subscription"}
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">{t("profile.title")}</CardTitle>
                    <CardDescription className="text-gray-400">{t("profile.subtitle")}</CardDescription>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? t("account.saving") : t("account.save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Avatar className="w-24 h-24 border-4 border-purple-500/30">
                    <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">{name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{name || "User"}</h3>
                    <p className="text-gray-400 text-sm">{email}</p>
                    <div className="flex gap-2 mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-transparent border-slate-600 text-white hover:bg-slate-800"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {t("profile.uploadPhoto")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="bg-transparent border-slate-600 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t("profile.removePhoto")}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 font-medium">
                      {t("profile.name")} *
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-slate-800/50 border-slate-700/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-gray-300 font-medium">
                      {t("profile.nickname")}
                    </Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="trader_pro"
                      className="bg-slate-800/50 border-slate-700/50 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email" className="text-gray-300 font-medium">
                      {t("profile.email")} *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john.doe@email.com"
                        className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-gray-300 font-medium">
                      {t("profile.experience")}
                    </Label>
                    <Select value={experienceLevel} onValueChange={(value: any) => setExperienceLevel(value)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="beginner" className="text-white">
                          🌱 {language === "cs" ? "Začátečník" : "Beginner"}
                        </SelectItem>
                        <SelectItem value="intermediate" className="text-white">
                          📈 {language === "cs" ? "Pokročilý" : "Intermediate"}
                        </SelectItem>
                        <SelectItem value="advanced" className="text-white">
                          🏆 {language === "cs" ? "Expert" : "Advanced"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">{t("profile.memberSince")}</Label>
                    <div className="flex items-center gap-2 p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{stats.memberSince}</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-gray-300 font-medium">
                      {t("profile.bio")}
                    </Label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={language === "cs" ? "Řekněte něco o sobě..." : "Tell us about yourself..."}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-white placeholder:text-gray-400 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/40 to-purple-700/20 border-purple-500/30">
                <CardContent className="pt-6">
                  <Activity className="h-8 w-8 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.activeDays}</p>
                  <p className="text-sm text-gray-300">{language === "cs" ? "Aktivních dní" : "Active Days"}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/40 to-green-700/20 border-green-500/30">
                <CardContent className="pt-6">
                  <Target className="h-8 w-8 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.totalEntries}</p>
                  <p className="text-sm text-gray-300">{language === "cs" ? "Záznamů" : "Entries"}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/40 to-orange-700/20 border-orange-500/30">
                <CardContent className="pt-6">
                  <Flame className="h-8 w-8 text-orange-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                  <p className="text-sm text-gray-300">{language === "cs" ? "Denní streak" : "Daily Streak"}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/40 to-blue-700/20 border-blue-500/30">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                  <p className="text-sm text-gray-300">{language === "cs" ? "Obchodů" : "Trades"}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TRADING TAB */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">{t("trading.title")}</CardTitle>
                    <CardDescription className="text-gray-400">{t("trading.subtitle")}</CardDescription>
                  </div>
                  <Button onClick={handleSaveTradingSettings} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {t("account.save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">{t("trading.style")}</Label>
                    <Select value={tradingStyle} onValueChange={(value: any) => setTradingStyle(value)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="scalper" className="text-white">
                          ⚡ Scalper
                        </SelectItem>
                        <SelectItem value="day-trader" className="text-white">
                          📊 Day Trader
                        </SelectItem>
                        <SelectItem value="swing-trader" className="text-white">
                          ⏰ Swing Trader
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">{t("trading.risk")}</Label>
                    <Select value={riskLevel} onValueChange={(value: any) => setRiskLevel(value)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="conservative" className="text-white">
                          🛡️ {language === "cs" ? "Konzervativní" : "Conservative"} (0.25-1%)
                        </SelectItem>
                        <SelectItem value="moderate" className="text-white">
                          ⚖️ {language === "cs" ? "Střední" : "Moderate"} (1-5%)
                        </SelectItem>
                        <SelectItem value="aggressive" className="text-white">
                          ⚠️ {language === "cs" ? "Agresivní" : "Aggressive"} (5-15%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">{t("trading.timezone")}</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Europe/Prague" className="text-white">
                          🇨🇿 Praha (CET)
                        </SelectItem>
                        <SelectItem value="Europe/London" className="text-white">
                          🇬🇧 London (GMT)
                        </SelectItem>
                        <SelectItem value="America/New_York" className="text-white">
                          🇺🇸 New York (EST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">{t("trading.currency")}</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="USD" className="text-white">
                          💵 USD
                        </SelectItem>
                        <SelectItem value="EUR" className="text-white">
                          💶 EUR
                        </SelectItem>
                        <SelectItem value="GBP" className="text-white">
                          💷 GBP
                        </SelectItem>
                        <SelectItem value="CZK" className="text-white">
                          🇨🇿 CZK
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert className="border-purple-500/30 bg-purple-500/10">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-purple-200 text-sm ml-2">
                    <strong>{language === "cs" ? "Tip" : "Tip"}:</strong> {styleInfo.description}.
                    {language === "cs"
                      ? " Zvol risk level podle své zkušenosti."
                      : " Choose risk level based on your experience."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Prop Firm Challenges */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Prop Firm Challenges
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {language === "cs" ? "Spravujte své prop firm účty" : "Manage your prop firm accounts"}
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingChallenge} onOpenChange={setIsAddingChallenge}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {language === "cs" ? "Přidat" : "Add"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingChallenge
                            ? language === "cs"
                              ? "Upravit Challenge"
                              : "Edit Challenge"
                            : language === "cs"
                              ? "Nový Challenge"
                              : "New Challenge"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>{language === "cs" ? "Název" : "Name"} *</Label>
                          <Input
                            value={challengeForm.name}
                            onChange={(e) => setChallengeForm({ ...challengeForm, name: e.target.value })}
                            placeholder="FTMO 100K"
                            className="bg-slate-800 border-slate-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === "cs" ? "Firma" : "Firm"} *</Label>
                          <Select
                            value={challengeForm.firm}
                            onValueChange={(value) => setChallengeForm({ ...challengeForm, firm: value })}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800">
                              <SelectItem value="FTMO">FTMO</SelectItem>
                              <SelectItem value="MyForexFunds">MyForexFunds</SelectItem>
                              <SelectItem value="The5ers">The5ers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{language === "cs" ? "Počáteční balance" : "Initial Balance"} *</Label>
                          <Input
                            type="number"
                            value={challengeForm.initialBalance}
                            onChange={(e) => setChallengeForm({ ...challengeForm, initialBalance: e.target.value })}
                            className="bg-slate-800 border-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={challengeForm.status}
                            onValueChange={(value: any) => setChallengeForm({ ...challengeForm, status: value })}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800">
                              <SelectItem value="active">{language === "cs" ? "Aktivní" : "Active"}</SelectItem>
                              <SelectItem value="passed">{language === "cs" ? "Úspěšný" : "Passed"}</SelectItem>
                              <SelectItem value="failed">{language === "cs" ? "Neúspěšný" : "Failed"}</SelectItem>
                              <SelectItem value="funded">Funded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingChallenge(false)}>
                          {language === "cs" ? "Zrušit" : "Cancel"}
                        </Button>
                        <Button onClick={handleSaveChallenge} className="bg-blue-600">
                          {language === "cs" ? "Uložit" : "Save"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {propChallenges.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {language === "cs" ? "Zatím žádné challenges" : "No challenges yet"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {propChallenges.map((challenge) => (
                      <div key={challenge.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white font-semibold">{challenge.name}</h4>
                              {getChallengeStatusBadge(challenge.status)}
                            </div>
                            <p className="text-gray-400 text-sm">{challenge.firm}</p>
                            <div className="mt-3 flex gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">{language === "cs" ? "Balance: " : "Balance: "}</span>
                                <span className="text-white font-medium">
                                  ${challenge.currentBalance.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">{language === "cs" ? "Start: " : "Start: "}</span>
                                <span className="text-white">
                                  {new Date(challenge.startDate).toLocaleDateString(
                                    language === "cs" ? "cs-CZ" : "en-US",
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditChallenge(challenge)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREFERENCES TAB */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">{t("preferences.title")}</CardTitle>
                    <CardDescription className="text-gray-400">{t("preferences.subtitle")}</CardDescription>
                  </div>
                  <Button onClick={handleSavePreferences} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {t("account.save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">{t("preferences.language")}</Label>
                  <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="cs" className="text-white">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          🇨🇿 Čeština
                        </div>
                      </SelectItem>
                      <SelectItem value="en" className="text-white">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          🇬🇧 English
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">{t("preferences.sounds")}</p>
                      <p className="text-gray-400 text-sm">{t("preferences.soundsDesc")}</p>
                    </div>
                    <Switch checked={soundsEnabled} onCheckedChange={setSoundsEnabled} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">{t("preferences.animations")}</p>
                      <p className="text-gray-400 text-sm">{t("preferences.animationsDesc")}</p>
                    </div>
                    <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">{t("notifications.title")}</CardTitle>
                    <CardDescription className="text-gray-400">{t("notifications.subtitle")}</CardDescription>
                  </div>
                  <Button onClick={handleSaveNotifications} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {t("account.save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">📧 {t("notifications.email")}</p>
                      <p className="text-gray-400 text-sm">{t("notifications.emailDesc")}</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">📱 {t("notifications.push")}</p>
                      <p className="text-gray-400 text-sm">{t("notifications.pushDesc")}</p>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">📊 {t("notifications.weekly")}</p>
                      <p className="text-gray-400 text-sm">{t("notifications.weeklyDesc")}</p>
                    </div>
                    <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">💹 {t("notifications.trading")}</p>
                      <p className="text-gray-400 text-sm">{t("notifications.tradingDesc")}</p>
                    </div>
                    <Switch checked={tradingAlerts} onCheckedChange={setTradingAlerts} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">📅 {t("notifications.daily")}</p>
                      <p className="text-gray-400 text-sm">{t("notifications.dailyDesc")}</p>
                    </div>
                    <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">🧠 {t("notifications.psychology")}</p>
                      <p className="text-gray-400 text-sm">{t("notifications.psychologyDesc")}</p>
                    </div>
                    <Switch checked={psychologyInsights} onCheckedChange={setPsychologyInsights} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">{t("security.password")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">{t("security.currentPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">{t("security.newPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">{t("security.confirmPassword")}</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
                  <Lock className="w-4 h-4 mr-2" />
                  {t("security.changePassword")}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl">{t("security.title")}</CardTitle>
                    <CardDescription className="text-gray-400">{t("security.subtitle")}</CardDescription>
                  </div>
                  <Button onClick={handleSaveSecuritySettings} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {t("account.save")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      {t("security.2fa")}
                    </p>
                    <p className="text-gray-400 text-sm">{t("security.2faDesc")}</p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    {language === "cs" ? "Bezpečnostní upozornění" : "Security Alerts"}
                  </h4>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium">{t("security.loginAlerts")}</p>
                      <p className="text-gray-400 text-sm">{t("security.loginAlertsDesc")}</p>
                    </div>
                    <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {language === "cs" ? "Email při novém zařízení" : "Email on New Device"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {language === "cs"
                          ? "Dostanete email při přihlášení z nového zařízení"
                          : "Get notified when logging in from a new device"}
                      </p>
                    </div>
                    <Switch checked={emailOnNewDevice} onCheckedChange={setEmailOnNewDevice} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        {language === "cs" ? "Email při změně hesla" : "Email on Password Change"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {language === "cs"
                          ? "Dostanete email při každé změně hesla"
                          : "Get notified when your password is changed"}
                      </p>
                    </div>
                    <Switch checked={emailOnPasswordChange} onCheckedChange={setEmailOnPasswordChange} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {language === "cs" ? "Email při změně zabezpečení" : "Email on Security Changes"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {language === "cs"
                          ? "Dostanete email při změně bezpečnostních nastavení"
                          : "Get notified when security settings are changed"}
                      </p>
                    </div>
                    <Switch checked={emailOnSecurityChange} onCheckedChange={setEmailOnSecurityChange} />
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">{t("security.sessionTimeout")}</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="15" className="text-white">
                        {language === "cs" ? "15 minut" : "15 minutes"}
                      </SelectItem>
                      <SelectItem value="30" className="text-white">
                        {language === "cs" ? "30 minut" : "30 minutes"}
                      </SelectItem>
                      <SelectItem value="60" className="text-white">
                        {language === "cs" ? "1 hodina" : "1 hour"}
                      </SelectItem>
                      <SelectItem value="never" className="text-white">
                        {language === "cs" ? "Nikdy" : "Never"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert className="border-yellow-500/30 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200 text-sm ml-2">
                    <strong>{language === "cs" ? "Důležité" : "Important"}:</strong>
                    {language === "cs"
                      ? " Doporučujeme zapnout všechna bezpečnostní upozornění pro maximální ochranu vašeho účtu."
                      : " We recommend enabling all security alerts for maximum account protection."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  {t("security.sessions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Monitor className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {language === "cs" ? "Aktuální zařízení" : "Current Device"}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {language === "cs" ? "Praha, Česko • Právě teď" : "Prague, Czech Republic • Now"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {language === "cs" ? "Aktivní" : "Active"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t("security.dataManagement")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full bg-transparent border-slate-600 text-white hover:bg-slate-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("security.export")}
                </Button>

                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <Database className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200 text-sm ml-2">
                    💾{" "}
                    {language === "cs"
                      ? "Pravidelně si zálohujte svá data. Export obsahuje všechny obchody a journaly."
                      : "Regularly backup your data. Export contains all trades and journals."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-slate-900/80 border-red-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t("security.dangerZone")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="w-full bg-transparent text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("security.deleteAccount")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBSCRIPTION TAB */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-purple-700/20 border-purple-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-400" />
                  {language === "cs" ? "Aktuální předplatné" : "Current Plan"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {subscription?.plan === "premium" ? "Premium" : "Free"}
                    </h3>
                    <p className="text-gray-300 mt-1">
                      {subscription?.plan === "premium"
                        ? language === "cs"
                          ? "Plný přístup ke všem funkcím"
                          : "Full access to all features"
                        : language === "cs"
                          ? "Základní funkce zdarma"
                          : "Basic features for free"}
                    </p>
                  </div>
                  {subscription?.plan === "premium" ? (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-lg px-4 py-2">
                      <Crown className="w-5 h-5 mr-2" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50 text-lg px-4 py-2">Free</Badge>
                  )}
                </div>

                {subscription?.plan === "premium" && (
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{language === "cs" ? "Další platba" : "Next payment"}</p>
                        <p className="text-white font-semibold text-lg">
                          {subscription?.nextBillingDate
                            ? new Date(subscription.nextBillingDate).toLocaleDateString(
                                language === "cs" ? "cs-CZ" : "en-US",
                              )
                            : "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">{language === "cs" ? "Cena" : "Price"}</p>
                        <p className="text-white font-semibold text-lg">$29/měsíc</p>
                      </div>
                    </div>
                  </div>
                )}

                {subscription?.plan !== "premium" && (
                  <Alert className="border-purple-500/30 bg-purple-500/10 mt-4">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <AlertDescription className="text-purple-200 text-sm ml-2">
                      <strong>{language === "cs" ? "Upgrade na Premium" : "Upgrade to Premium"}</strong>
                      {language === "cs"
                        ? " a získej přístup k pokročilým funkcím, AI analýzám a neomezeným obchodům."
                        : " and get access to advanced features, AI analysis, and unlimited trades."}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Features Comparison */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {language === "cs" ? "Porovnání plánů" : "Plan Comparison"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">{language === "cs" ? "Základní tracking" : "Basic tracking"}</span>
                    <div className="flex gap-8">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">{language === "cs" ? "AI analýzy" : "AI analysis"}</span>
                    <div className="flex gap-8">
                      <X className="w-5 h-5 text-red-400" />
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">
                      {language === "cs" ? "Neomezené obchody" : "Unlimited trades"}
                    </span>
                    <div className="flex gap-8">
                      <X className="w-5 h-5 text-red-400" />
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">
                      {language === "cs" ? "Pokročilé statistiky" : "Advanced stats"}
                    </span>
                    <div className="flex gap-8">
                      <X className="w-5 h-5 text-red-400" />
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">
                      {language === "cs" ? "Prioritní podpora" : "Priority support"}
                    </span>
                    <div className="flex gap-8">
                      <X className="w-5 h-5 text-red-400" />
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>

                {subscription?.plan !== "premium" && (
                  <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Crown className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Upgradovat na Premium" : "Upgrade to Premium"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            {subscription?.plan === "premium" && (
              <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {language === "cs" ? "Platební metody" : "Payment Methods"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">•••• •••• •••• 4242</p>
                          <p className="text-gray-400 text-sm">{language === "cs" ? "Vyprší" : "Expires"} 12/25</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        {language === "cs" ? "Výchozí" : "Default"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent border-slate-600 text-white hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Přidat platební metodu" : "Add Payment Method"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Billing History */}
            {subscription?.plan === "premium" && (
              <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">
                    {language === "cs" ? "Historie plateb" : "Billing History"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div>
                        <p className="text-white font-medium">
                          Premium - {language === "cs" ? "Leden" : "January"} 2025
                        </p>
                        <p className="text-gray-400 text-sm">1. 1. 2025</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">$29.00</span>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div>
                        <p className="text-white font-medium">
                          Premium - {language === "cs" ? "Prosinec" : "December"} 2024
                        </p>
                        <p className="text-gray-400 text-sm">1. 12. 2024</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold">$29.00</span>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancel Subscription */}
            {subscription?.plan === "premium" && (
              <Card className="bg-slate-900/80 border-red-500/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {language === "cs" ? "Zrušit předplatné" : "Cancel Subscription"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    {language === "cs"
                      ? "Zrušením předplatného ztratíte přístup k Premium funkcím na konci aktuálního období."
                      : "Canceling your subscription will remove access to Premium features at the end of the current period."}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Zrušit předplatné" : "Cancel Subscription"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
