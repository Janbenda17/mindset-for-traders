"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Crown,
  Check,
  Smartphone,
  Mail,
  Copy,
  AlertTriangle,
  TrendingUp,
  Award,
  Star,
  Zap,
  Heart,
  Activity,
  Loader2,
  Save,
  BarChart3,
  Clock,
  Brain,
  Sparkles,
  Key,
  CheckCircle,
  Monitor,
  MapPin,
  Database,
  ExternalLink,
  ArrowRight,
  Target,
  Phone,
  Send,
} from "lucide-react"
import {
  getUserData,
  saveUserData,
  exportUserData,
  clearAllDemoData,
  getPropFirmChallenges,
  type PropFirmChallenge,
} from "@/utils/storage-utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useGamification } from "@/contexts/gamification-context"
import { useLanguage } from "@/contexts/language-context"
import { useLiveMode } from "@/contexts/live-mode-context"

export default function AccountPage() {
  console.log("[v0] Account page - rendering...")
  const { user, logout } = useAuth()
  const {
    subscription,
    upgradeToPremium,
    isLoading: subscriptionLoading,
    isPremium,
    cancelSubscription,
  } = useSubscription()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage, t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: gamificationData } = useGamification()
  const { isLiveMode, switchToLive } = useLiveMode()
  
  console.log("[v0] Account page - hooks initialized, user:", user?.email || "none")

  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Profile State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [nickname, setNickname] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("/trader-avatar.png")
  const [country, setCountry] = useState("cz")

  // Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

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
  const [twoFactorMethod, setTwoFactorMethod] = useState<"email" | "sms">("email")
  const [twoFactorContact, setTwoFactorContact] = useState("")
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [emailOnNewDevice, setEmailOnNewDevice] = useState(true)
  const [emailOnPasswordChange, setEmailOnPasswordChange] = useState(true)
  const [emailOnSecurityChange, setEmailOnSecurityChange] = useState(true)

  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFactorStep, setTwoFactorStep] = useState<"method" | "contact" | "verify">("method")
  const [verificationCode, setVerificationCode] = useState("")
  const [pendingCode, setPendingCode] = useState("")
  const [sendingCode, setSendingCode] = useState(false)
  const [showDemoCode, setShowDemoCode] = useState(false)

  // Readiness average
  const [averageReadiness, setAverageReadiness] = useState(0)

  // Prop Firm Challenges
  const [propChallenges, setPropChallenges] = useState<PropFirmChallenge[]>([])

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
    loadPropChallenges()
    calculateAverageReadiness()

    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [])

  // Automatically enable live mode for premium users
  useEffect(() => {
    if (isPremium && !isLiveMode) {
      switchToLive()
    }
  }, [isPremium, isLiveMode, switchToLive])

  useEffect(() => {
    const userData = getUserData()
    if (userData.settings?.twoFactor) {
      setTwoFactorEnabled(userData.settings.twoFactor.enabled || false)
      setTwoFactorMethod(userData.settings.twoFactor.method || "email")
      setTwoFactorContact(userData.settings.twoFactor.contact || "")
    }
  }, [])

  const calculateAverageReadiness = () => {
    const userData = getUserData()
    const moodEntries = userData.moodEntries || []
    if (moodEntries.length > 0) {
      const totalReadiness = moodEntries.reduce((sum, entry) => {
        const readiness = entry.readiness || entry.mood || 50
        return sum + readiness
      }, 0)
      setAverageReadiness(Math.round(totalReadiness / moodEntries.length))
    }
  }

  const loadPropChallenges = () => {
    const challenges = getPropFirmChallenges()
    setPropChallenges(challenges)
  }

  const loadAllSettings = () => {
    try {
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
        memberSince: new Date().toLocaleDateString("cs-CZ"),
    })
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Chyba",
        description: "Soubor je příliš velký (max 5MB)",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Chyba",
        description: "Soubor musí být obrázek",
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
        title: "Úspěch",
        description: "Fotka byla nahrána",
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
      title: "Úspěch",
        description: "Fotka byla odstraněna",
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
        country,
        experienceLevel,
        avatarUrl,
        updatedAt: new Date().toISOString(),
      }

      if (!userData.settings) {
        userData.settings = {}
      }
      userData.settings.trading = {
        ...userData.settings.trading,
        timezone,
      }

      saveUserData(userData)

      toast({
        title: "Úspěch",
        description: "Profil byl uložen",
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit změny.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
        title: "Úspěch",
        description: "Notifikace uloženy",
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving notifications:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit nastavení.",
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
        title: "Úspěch",
        description: "Zabezpečení uloženo",
      })
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit nastavení.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Chyba",
        description: "Hesla se neshodují",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Chyba",
        description: "Heslo musí mít alespoň 8 znaků",
        variant: "destructive",
      })
      return
    }

    setChangingPassword(true)
    try {
      // Use imported singleton
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Úspěch",
        description: language === "cs" ? "Heslo bylo úspěšně změněno" : "Password changed successfully",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Send notification email if enabled
      if (emailOnPasswordChange) {
        // In production, send email notification
        console.log("[v0] Password changed, notification would be sent")
      }
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast({
        title: "Chyba",
        description: error.message || (language === "cs" ? "Nepodařilo se změnit heslo" : "Failed to change password"),
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleExportData = () => {
    try {
      const data = exportUserData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `trader-mindset-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Úspěch",
        description: language === "cs" ? "Data byla exportována" : "Data exported",
      })
    } catch (error) {
      toast({
        title: "Chyba",
        description: language === "cs" ? "Export selhal" : "Export failed",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = () => {
    if (
      confirm(
        language === "cs"
          ? "Opravdu chcete smazat účet? Tato akce je nevratná."
          : "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      clearAllDemoData()
      logout()
      router.push("/")
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      await upgradeToPremium()
    } catch (error) {
      toast({
        title: "Chyba",
        description: language === "cs" ? "Nepodařilo se otevřít platební bránu" : "Failed to open payment gateway",
        variant: "destructive",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/billing-portal", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to open billing portal")
      }

      const data = await response.json()
      if (data.url) {
        window.open(data.url, "_blank")
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
      toast({
        title: "Chyba",
        description: language === "cs" ? "Nepodařilo se otevřít správu předplatného" : "Failed to open subscription management",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        language === "cs" ? "Opravdu chcete zrušit předplatné?" : "Are you sure you want to cancel your subscription?",
      )
    ) {
      return
    }
    setIsUpgrading(true)
    try {
      const success = await cancelSubscription()
      if (success) {
        toast({
          title: language === "cs" ? "Předplatné zrušeno" : "Subscription cancelled",
          description:
            language === "cs"
              ? "Vaše předplatné bude zrušeno na konci aktuálního období"
              : "Your subscription will be cancelled at the end of the current period",
        })
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: language === "cs" ? "Nepodařilo se zrušit předplatné" : "Failed to cancel subscription",
        variant: "destructive",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const premiumFeatures = [
    "Přepnutí do Live Režimu",
    "Reálné statistiky a trading",
    "Pokročilé analytics & grafy",
    "AI MindTrader kouč (Neomezeně)",
    "Detailní trading deník s fotkami",
    "Export dat (CSV, PDF)",
    "Hloubkové emocionální analýzy",
    "Risk management kalkulačka",
    "Prioritní podpora 24/7",
    "Team Club premium funkce",
  ]

  const freeFeatures = [
    "Pouze Virtuální Režim",
    "Průzkum rozhraní a funkcí",
    "Základní deník (Virtuální data)",
    "Základní mood tracking",
    "Komunitní přístup",
  ]

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: language === "cs" ? "Nepodporováno" : "Not Supported",
        description:
          language === "cs" ? "Váš prohlížeč nepodporuje notifikace" : "Your browser doesn't support notifications",
        variant: "destructive",
      })
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      toast({
        title: language === "cs" ? "Povoleno" : "Enabled",
        description: language === "cs" ? "Push notifikace byly povoleny" : "Push notifications enabled",
      })
      return true
    } else {
      toast({
        title: language === "cs" ? "Zamítnuto" : "Denied",
        description: language === "cs" ? "Push notifikace byly zamítnuty" : "Push notifications denied",
        variant: "destructive",
      })
      return false
    }
  }

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setPushNotifications(true)
        // Save immediately
        const userData = getUserData()
        if (!userData.settings) userData.settings = {}
        if (!userData.settings.notifications) userData.settings.notifications = {}
        userData.settings.notifications.push = true
        saveUserData(userData)
      }
    } else {
      setPushNotifications(false)
      const userData = getUserData()
      if (!userData.settings) userData.settings = {}
      if (!userData.settings.notifications) userData.settings.notifications = {}
      userData.settings.notifications.push = false
      saveUserData(userData)
    }
  }

  const sendTestNotification = async () => {
    if (!("Notification" in window)) {
      toast({
        title: language === "cs" ? "Nepodporováno" : "Not Supported",
        description:
          language === "cs" ? "Váš prohlížeč nepodporuje notifikace" : "Your browser doesn't support notifications",
        variant: "destructive",
      })
      return
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast({
          title: language === "cs" ? "Zamítnuto" : "Denied",
          description:
            language === "cs"
              ? "Povolte notifikace v nastavení prohlížeče"
              : "Enable notifications in browser settings",
          variant: "destructive",
        })
        return
      }
    }

    if (Notification.permission !== "granted") {
      toast({
        title: "Chyba",
        description:
          language === "cs"
            ? "Notifikace nejsou povoleny. Povolte je v nastavení prohlížeče."
            : "Notifications are not allowed. Enable them in browser settings.",
        variant: "destructive",
      })
      return
    }

    try {
      const notification = new Notification(language === "cs" ? "Trader Mindset" : "Trader Mindset", {
        body: language === "cs" ? "Push notifikace fungují správně!" : "Push notifications are working!",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "test-notification",
        requireInteraction: false,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      toast({
        title: language === "cs" ? "Odesláno" : "Sent",
        description: language === "cs" ? "Testovací notifikace byla odeslána" : "Test notification was sent",
      })
    } catch (error) {
      console.error("Notification error:", error)
      toast({
        title: "Chyba",
        description: language === "cs" ? "Nepodařilo se odeslat notifikaci" : "Failed to send notification",
        variant: "destructive",
      })
    }
  }

  const start2FASetup = () => {
    setTwoFactorStep("method")
    setTwoFactorContact("")
    setVerificationCode("")
    setPendingCode("")
    setShow2FADialog(false)
    setShow2FADialog(true)
  }

  const send2FACode = async () => {
    if (!twoFactorContact) {
      toast({
        title: "Chyba",
        description: language === "cs" ? "Zadejte kontakt" : "Enter contact",
        variant: "destructive",
      })
      return
    }

    if (twoFactorMethod === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(twoFactorContact)) {
        toast({
          title: "Chyba",
          description: language === "cs" ? "Zadejte platný email" : "Enter a valid email",
          variant: "destructive",
        })
        return
      }
    } else {
      const phoneRegex = /^[+]?[\d\s-]{9,}$/
      if (!phoneRegex.test(twoFactorContact)) {
        toast({
          title: "Chyba",
          description: language === "cs" ? "Zadejte platné telefonní číslo" : "Enter a valid phone number",
          variant: "destructive",
        })
        return
      }
    }

    setSendingCode(true)

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setPendingCode(code)
    setShowDemoCode(true)

    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: language === "cs" ? "Kód odeslán" : "Code Sent",
      description:
        language === "cs"
          ? `Ověřovací kód byl odeslán na ${twoFactorContact}`
          : `Verification code sent to ${twoFactorContact}`,
    })

    setSendingCode(false)
    setTwoFactorStep("verify")
  }

  const verify2FACode = () => {
    if (verificationCode !== pendingCode) {
      toast({
        title: "Chyba",
        description: language === "cs" ? "Nesprávný kód" : "Invalid code",
        variant: "destructive",
      })
      return
    }

    // Save 2FA settings
    const userData = getUserData()
    if (!userData.settings) userData.settings = {}
    userData.settings.twoFactor = {
      enabled: true,
      method: twoFactorMethod,
      contact: twoFactorContact,
      verifiedAt: new Date().toISOString(),
    }
    userData.settings.security = {
      ...userData.settings.security,
      twoFactorEnabled: true,
    }
    saveUserData(userData)

    setTwoFactorEnabled(true)
    setShow2FADialog(false)

    toast({
      title: language === "cs" ? "2FA aktivováno" : "2FA Enabled",
      description:
        language === "cs"
          ? "Dvoufaktorové ověření bylo úspěšně aktivováno"
          : "Two-factor authentication enabled successfully",
    })

    window.dispatchEvent(new Event("settings-updated"))
  }

  const disable2FA = () => {
    const userData = getUserData()
    if (userData.settings?.twoFactor) {
      userData.settings.twoFactor = {
        enabled: false,
        method: "email",
      }
    }
    if (userData.settings?.security) {
      userData.settings.security.twoFactorEnabled = false
    }
    saveUserData(userData)

    setTwoFactorEnabled(false)
    setTwoFactorContact("")

    toast({
      title: language === "cs" ? "2FA deaktivováno" : "2FA Disabled",
      description: language === "cs" ? "Dvoufaktorové ověření bylo vypnuto" : "Two-factor authentication disabled",
    })

    window.dispatchEvent(new Event("settings-updated"))
  }

  // Calculate XP progress
  const currentXP = gamificationData?.xp || 0
  const currentLevel = gamificationData?.level || 1
  const LEVEL_XP = [0, 400, 900, 1500, 2200, 3200, 4700, 6500, 9000, 12000]
  const xpForCurrentLevel = LEVEL_XP[currentLevel - 1] || 0
  const xpForNextLevel = LEVEL_XP[currentLevel] || LEVEL_XP[LEVEL_XP.length - 1]
  const xpProgress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
        {/* Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === "cs" ? "Nastavení účtu" : "Account Settings"}
          </h1>
          <p className="text-gray-400">
            {language === "cs" ? "Spravujte svůj profil a předvolby" : "Manage your profile and preferences"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-slate-700/50 p-1 backdrop-blur-xl">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-gray-400"
            >
              <User className="w-4 h-4 mr-2" />
  Profil
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-gray-400"
            >
              <Bell className="w-4 h-4 mr-2" />
  Notifikace
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-gray-400"
            >
              <Shield className="w-4 h-4 mr-2" />
  Zabezpečení
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-gray-400"
            >
              <Crown className="w-4 h-4 mr-2" />
  Předplatné
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-8">
            <Card className="bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar Section */}
                  <div className="relative group">
                    <Avatar className="h-28 w-28 ring-4 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all">
                      <AvatarImage src={avatarUrl || "/trader-avatar.png"} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-3xl font-bold">
                        {name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2.5 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      <Upload className="w-4 h-4 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{name || "Trader"}</h2>
                      <p className="text-gray-400">{email}</p>
                      {nickname && <p className="text-purple-300 text-sm">@{nickname}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isPremium ? (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          Free
                        </Badge>
                      )}
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        <Star className="w-3 h-3 mr-1 fill-purple-400" />
                        Level {currentLevel}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        <Zap className="w-3 h-3 mr-1" />
                        {currentXP} XP
                      </Badge>
                      {isLiveMode && (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                          <Award className="w-3 h-3 mr-1 fill-red-400" />
                          Live Mode
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center min-w-[100px]">
                      <div className="flex items-center justify-center mb-1">
                        <Heart className="w-4 h-4 text-green-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{averageReadiness}%</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {language === "cs" ? "Průměr Readiness" : "Avg Readiness"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center min-w-[100px]">
                      <div className="flex items-center justify-center mb-1">
                        <Activity className="w-4 h-4 text-orange-400 mr-1" />
                        <span className="text-2xl font-bold text-white">{stats.currentStreak}</span>
                      </div>
                      <p className="text-xs text-gray-400">Dní v řadě</p>
                    </div>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Level {currentLevel}</span>
                    <span className="text-purple-300">
                      {currentXP} / {xpForNextLevel} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-2 bg-slate-800" />
                </div>
              </CardContent>
            </Card>

            {/* Basic Info Card */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
      Základní informace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Jméno</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Přezdívka</Label>
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Vaše přezdívka"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Země</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="cz" className="text-white">
                          Česká republika
                        </SelectItem>
                        <SelectItem value="sk" className="text-white">
                          Slovensko
                        </SelectItem>
                        <SelectItem value="de" className="text-white">
                          Německo
                        </SelectItem>
                        <SelectItem value="us" className="text-white">
                          USA
                        </SelectItem>
                        <SelectItem value="uk" className="text-white">
                          UK
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Jazyk</Label>
                    <Select value={language} onValueChange={(val: "cs" | "en") => setLanguage(val)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="cs" className="text-white">
                          Čeština
                        </SelectItem>
                        <SelectItem value="en" className="text-white">
                          English
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Časové pásmo</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Europe/Prague" className="text-white">
                          Europe/Prague (CET)
                        </SelectItem>
                        <SelectItem value="Europe/London" className="text-white">
                          Europe/London (GMT)
                        </SelectItem>
                        <SelectItem value="America/New_York" className="text-white">
                          America/New York (EST)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo" className="text-white">
                          Asia/Tokyo (JST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={
                      language === "cs"
                        ? "Napište něco o sobě jako traderovi..."
                        : "Write something about yourself as a trader..."
                    }
                    className="bg-slate-800/50 border-slate-700 text-white min-h-[100px] resize-none"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 text-right">{bio.length}/300</p>
                </div>
              </CardContent>
            </Card>

            {/* Trading Profile */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  {language === "cs" ? "Trading Profil" : "Trading Profile"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Styl obchodování</Label>
                    <Select value={tradingStyle} onValueChange={(v: any) => setTradingStyle(v)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="scalper" className="text-white">
                          Scalper
                        </SelectItem>
                        <SelectItem value="day-trader" className="text-white">
                          Day Trader
                        </SelectItem>
                        <SelectItem value="swing-trader" className="text-white">
                          Swing Trader
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Úroveň rizika</Label>
                    <Select value={riskLevel} onValueChange={(v: any) => setRiskLevel(v)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="conservative" className="text-white">
                          {language === "cs" ? "Konzervativní (0.25-1%)" : "Conservative (0.25-1%)"}
                        </SelectItem>
                        <SelectItem value="moderate" className="text-white">
                          {language === "cs" ? "Střední (1-3%)" : "Moderate (1-3%)"}
                        </SelectItem>
                        <SelectItem value="aggressive" className="text-white">
                          {language === "cs" ? "Agresivní (3-5%)" : "Aggressive (3-5%)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">{language === "cs" ? "Zkušenosti" : "Experience"}</Label>
                    <Select value={experienceLevel} onValueChange={(v: any) => setExperienceLevel(v)}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="beginner" className="text-white">
                          {language === "cs" ? "Začátečník (< 1 rok)" : "Beginner (< 1 year)"}
                        </SelectItem>
                        <SelectItem value="intermediate" className="text-white">
                          {language === "cs" ? "Pokročilý (1-3 roky)" : "Intermediate (1-3 years)"}
                        </SelectItem>
                        <SelectItem value="advanced" className="text-white">
                          {language === "cs" ? "Expert (3+ let)" : "Expert (3+ years)"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">{language === "cs" ? "Měna" : "Currency"}</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="USD" className="text-white">
                          USD ($)
                        </SelectItem>
                        <SelectItem value="EUR" className="text-white">
                          EUR (€)
                        </SelectItem>
                        <SelectItem value="CZK" className="text-white">
                          CZK (Kč)
                        </SelectItem>
                        <SelectItem value="GBP" className="text-white">
                          GBP (£)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {language === "cs" ? "Uložit profil" : "Save Profile"}
            </Button>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-400" />
                  {language === "cs" ? "Komunikace" : "Communication"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">
                        {language === "cs" ? "Emailové notifikace" : "Email Notifications"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {language === "cs" ? "Důležité aktualizace na email" : "Important updates to email"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">
                        {language === "cs" ? "Push notifikace" : "Push Notifications"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {language === "cs" ? "Upozornění v prohlížeči" : "Browser notifications"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendTestNotification}
                      className="text-xs border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                    >
                      Test
                    </Button>
                    <Switch checked={pushNotifications} onCheckedChange={handlePushNotificationToggle} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-white font-medium">{language === "cs" ? "Týdenní report" : "Weekly Report"}</p>
                      <p className="text-gray-500 text-sm">
                        {language === "cs" ? "Souhrn týdne na email" : "Week summary to email"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  {language === "cs" ? "Trading upozornění" : "Trading Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">
                        {language === "cs" ? "Trading alerty" : "Trading Alerts"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {language === "cs" ? "Upozornění na obchody" : "Trade notifications"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={tradingAlerts} onCheckedChange={setTradingAlerts} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">
                        {language === "cs" ? "Denní připomínka" : "Daily Reminder"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {language === "cs" ? "Připomínka vyplnění deníku" : "Journal fill reminder"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  {language === "cs" ? "Psychologie & Insights" : "Psychology & Insights"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                    <div>
                      <p className="text-white font-medium">
                        {language === "cs" ? "Psychology Insights" : "Psychology Insights"}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {language === "cs" ? "AI tipy a doporučení" : "AI tips and recommendations"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={psychologyInsights} onCheckedChange={setPsychologyInsights} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {language === "cs" ? "Uložit notifikace" : "Save Notifications"}
            </Button>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Change */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  {language === "cs" ? "Změna hesla" : "Change Password"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">{language === "cs" ? "Nové heslo" : "New Password"}</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">{language === "cs" ? "Potvrdit heslo" : "Confirm Password"}</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {newPassword && (
                  <div className="text-xs space-y-1">
                    <p className={newPassword.length >= 8 ? "text-green-400" : "text-red-400"}>
                      {newPassword.length >= 8 ? "✓" : "✗"}{" "}
                      {language === "cs" ? "Alespoň 8 znaků" : "At least 8 characters"}
                    </p>
                    <p
                      className={newPassword === confirmPassword && confirmPassword ? "text-green-400" : "text-red-400"}
                    >
                      {newPassword === confirmPassword && confirmPassword ? "✓" : "✗"}{" "}
                      {language === "cs" ? "Hesla se shodují" : "Passwords match"}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    changingPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {changingPassword ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  {language === "cs" ? "Změnit heslo" : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            {/* 2FA */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  {language === "cs" ? "Dvoufaktorové ověření (2FA)" : "Two-Factor Authentication (2FA)"}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {language === "cs"
                    ? "Přidejte další vrstvu zabezpečení pomocí SMS nebo emailu"
                    : "Add an extra layer of security via SMS or email"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {twoFactorEnabled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-xl border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">
                            {language === "cs" ? "2FA je aktivní" : "2FA is Active"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {twoFactorMethod === "email" ? "Email: " : "SMS: "}
                            {twoFactorContact}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={disable2FA}
                        className="border-red-500/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                      >
                        {language === "cs" ? "Vypnout" : "Disable"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={start2FASetup} className="bg-green-600 hover:bg-green-700">
                    <Shield className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Aktivovat 2FA" : "Enable 2FA"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  {language === "cs" ? "Bezpečnostní upozornění" : "Security Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {language === "cs" ? "Přihlášení" : "Login Alerts"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {language === "cs" ? "Upozornění při přihlášení" : "Alert on login"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {language === "cs" ? "Nové zařízení" : "New Device"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {language === "cs" ? "Email při novém zařízení" : "Email on new device"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={emailOnNewDevice} onCheckedChange={setEmailOnNewDevice} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-orange-400" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {language === "cs" ? "Změna hesla" : "Password Change"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {language === "cs" ? "Email při změně" : "Email on change"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={emailOnPasswordChange} onCheckedChange={setEmailOnPasswordChange} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {language === "cs" ? "Změna nastavení" : "Settings Change"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {language === "cs" ? "Email při změně" : "Email on change"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={emailOnSecurityChange} onCheckedChange={setEmailOnSecurityChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  {language === "cs" ? "Aktivní sessions" : "Active Sessions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-500/20 rounded-lg">
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
              </CardContent>
            </Card>

            {/* Data & Danger Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    {language === "cs" ? "Export dat" : "Export Data"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleExportData} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Download className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Stáhnout zálohu" : "Download Backup"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-red-500/30 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500" />
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {language === "cs" ? "Nebezpečná zóna" : "Danger Zone"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="w-full bg-transparent text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {language === "cs" ? "Smazat účet" : "Delete Account"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Button onClick={handleSaveSecuritySettings} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {language === "cs" ? "Uložit zabezpečení" : "Save Security"}
            </Button>
          </TabsContent>

          {/* SUBSCRIPTION TAB */}
          <TabsContent value="subscription" className="space-y-8">
            {/* Live Mode Toggle - Skryto pro premium uživatele */}
            {!isPremium && (
            <div className="flex items-center justify-center space-x-4 p-6 border border-yellow-500/20 rounded-xl bg-yellow-900/10 backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg font-bold text-yellow-400">{language === "cs" ? "Režim Live" : "Live Mode"}</h3>
              </div>
              <Separator orientation="vertical" className="bg-yellow-500/30 h-8" />
              <div className="flex items-center gap-2">
                <p className={`font-medium transition-colors ${isLiveMode ? "text-white" : "text-gray-400"}`}>
                  {language === "cs" ? "Vypnuto" : "Off"}
                </p>
                <Switch checked={isLiveMode} onCheckedChange={toggleLiveMode} />
                <p className={`font-medium transition-colors ${isLiveMode ? "text-white" : "text-gray-400"}`}>
                  {language === "cs" ? "Zapnuto" : "On"}
                </p>
              </div>
              <p className="text-xs text-yellow-500/80 ml-4">
                {language === "cs"
                  ? "Přepněte do Live režimu pro reálné obchodování a statistiky."
                  : "Switch to Live mode for real trading and statistics."}
              </p>
            </div>
            )}

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span
                className={`text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-white" : "text-gray-500"}`}
              >
                {language === "cs" ? "Měsíčně" : "Monthly"}
              </span>
              <button
                onClick={() => setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span
                className={`text-sm font-medium transition-colors ${billingCycle === "yearly" ? "text-white" : "text-gray-500"}`}
              >
                {language === "cs" ? "Ročně" : "Yearly"}{" "}
                <span className="text-green-400 text-xs ml-1 font-bold">(-20%)</span>
              </span>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card
                className={`relative flex flex-col border-2 transition-all duration-300 hover:shadow-xl ${
                  subscription?.plan !== "premium"
                    ? "border-blue-500/50 bg-slate-900"
                    : "border-slate-700/50 bg-slate-900/60"
                } backdrop-blur-xl`}
              >
                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-bold text-white">Starter</CardTitle>
                    {subscription?.plan !== "premium" && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {language === "cs" ? "Aktuální plán" : "Current Plan"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    {language === "cs" ? "Virtuální režim pro seznámení" : "Virtual mode for getting started"}
                  </CardDescription>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">0 Kč</span>
                    <span className="text-gray-500 ml-2 text-lg">/{language === "cs" ? "měsíc" : "month"}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {freeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-8">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-lg font-medium border-2 border-slate-600 text-gray-300 hover:bg-slate-800 bg-transparent"
                    disabled={subscription?.plan !== "premium"}
                  >
                    {subscription?.plan !== "premium"
                      ? language === "cs"
                        ? "Váš aktuální plán"
                        : "Your Current Plan"
                      : language === "cs"
                        ? "Downgrade"
                        : "Downgrade"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card
                className={`relative flex flex-col border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                  subscription?.plan === "premium"
                    ? "border-yellow-500/50 shadow-yellow-500/10 bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-pink-900/60"
                    : "border-blue-600 shadow-blue-600/10 bg-slate-900"
                } backdrop-blur-xl`}
              >
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1.5 text-sm font-semibold shadow-lg uppercase tracking-wide">
                    <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    {language === "cs" ? "Doporučeno" : "Recommended"}
                  </Badge>
                </div>
                <CardHeader className="pb-8 pt-10">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-bold flex items-center text-white">
                      <Crown className="h-6 w-6 mr-2 text-yellow-500 fill-yellow-500" />
                      Pro Trader
                    </CardTitle>
                    {subscription?.plan === "premium" && (
                      <Badge className="bg-green-500 text-white">{language === "cs" ? "Aktivní" : "Active"}</Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-300">
                    {language === "cs" ? "Odemkněte Live Režim a všechny funkce" : "Unlock Live Mode and all features"}
                  </CardDescription>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">
                      {billingCycle === "monthly" ? "1499" : "1199"} Kč
                    </span>
                    <span className="text-gray-400 ml-2 text-lg">/{language === "cs" ? "měsíc" : "month"}</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-sm text-green-400 font-medium mt-2">
                      {language === "cs" ? "Ušetříte 3 600 Kč ročně" : "Save 3,600 CZK yearly"}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {premiumFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-white font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-8 pb-8 flex flex-col">
                  {isPremium ? (
                    <div className="w-full space-y-3">
                      <Button
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600"
                        disabled
                      >
                        <Check className="h-5 w-5 mr-2" />
                        {language === "cs" ? "Váš plán je aktivní" : "Your Plan is Active"}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800 bg-transparent"
                          onClick={handleManageSubscription}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {language === "cs" ? "Spravovat platby" : "Manage Billing"}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-600/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                          onClick={handleCancelSubscription}
                          disabled={isUpgrading || subscriptionLoading}
                        >
                          {language === "cs" ? "Zrušit" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                      onClick={handleUpgrade}
                      disabled={isUpgrading || subscriptionLoading}
                    >
                      {isUpgrading || subscriptionLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {language === "cs" ? "Zpracování..." : "Processing..."}
                        </>
                      ) : (
                        <>
                          {language === "cs" ? "Upgradovat na Premium" : "Upgrade to Premium"}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  )}
                  <p className="text-xs text-center text-gray-500 mt-4">
                    {language === "cs"
                      ? "Bezpečná platba přes Stripe. Zrušit můžete kdykoli."
                      : "Secure payment via Stripe. Cancel anytime."}
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* Why Upgrade */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white text-center mb-8">
                {language === "cs" ? "Proč upgradovat na Premium?" : "Why Upgrade to Premium?"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Psycholog</h3>
                  <p className="text-gray-400 text-sm">
                    {language === "cs"
                      ? "Váš osobní kouč dostupný 24/7. Analyzuje vaše emoce a dává okamžitou zpětnou vazbu."
                      : "Your personal coach available 24/7. Analyzes your emotions and gives instant feedback."}
                  </p>
                </Card>
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {language === "cs" ? "Hloubková Analytika" : "Deep Analytics"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {language === "cs"
                      ? "Odhalte skryté vzorce ve vašem chování. Zjistěte, kdy obchodujete nejlépe."
                      : "Discover hidden patterns in your behavior. Find when you trade best."}
                  </p>
                </Card>
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl p-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {language === "cs" ? "Rychlejší Progres" : "Faster Progress"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {language === "cs"
                      ? "Tradeři s deníkem dosahují ziskovosti o 40% rychleji."
                      : "Traders with journals reach profitability 40% faster."}
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 2FA Dialog */}
        <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                {language === "cs" ? "Nastavení 2FA" : "2FA Setup"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {twoFactorStep === "method" &&
                  (language === "cs" ? "Vyberte metodu ověření" : "Choose verification method")}
                {twoFactorStep === "contact" &&
                  (language === "cs" ? "Zadejte kontaktní údaje" : "Enter contact details")}
                {twoFactorStep === "verify" &&
                  (language === "cs" ? "Zadejte ověřovací kód" : "Enter verification code")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Step 1: Method Selection */}
              {twoFactorStep === "method" && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setTwoFactorMethod("email")
                      setTwoFactorStep("contact")
                    }}
                    className="w-full p-4 rounded-xl border-2 border-slate-700 hover:border-blue-500 transition-all flex items-center gap-4 bg-slate-800/50"
                  >
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Email</p>
                      <p className="text-gray-400 text-sm">{language === "cs" ? "Kód na email" : "Code via email"}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setTwoFactorMethod("sms")
                      setTwoFactorStep("contact")
                    }}
                    className="w-full p-4 rounded-xl border-2 border-slate-700 hover:border-green-500 transition-all flex items-center gap-4 bg-slate-800/50"
                  >
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Phone className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">SMS</p>
                      <p className="text-gray-400 text-sm">{language === "cs" ? "Kód přes SMS" : "Code via SMS"}</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 2: Contact Input */}
              {twoFactorStep === "contact" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      {twoFactorMethod === "email" ? "Email" : language === "cs" ? "Telefonní číslo" : "Phone Number"}
                    </Label>
                    <Input
                      type={twoFactorMethod === "email" ? "email" : "tel"}
                      value={twoFactorContact}
                      onChange={(e) => setTwoFactorContact(e.target.value)}
                      placeholder={twoFactorMethod === "email" ? "vas@email.cz" : "+420 xxx xxx xxx"}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setTwoFactorStep("method")}
                      className="flex-1 border-slate-600 text-gray-300"
                    >
                      {language === "cs" ? "Zpět" : "Back"}
                    </Button>
                    <Button
                      onClick={send2FACode}
                      disabled={sendingCode || !twoFactorContact}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {sendingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {language === "cs" ? "Odeslat kód" : "Send Code"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Verify Code */}
              {twoFactorStep === "verify" && (
                <div className="space-y-4">
                  {/* Demo code display */}
                  {showDemoCode && pendingCode && (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                      <p className="text-yellow-300 text-sm mb-2">
                        {language === "cs" ? "Demo kód (pro testování):" : "Demo code (for testing):"}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-mono font-bold text-white tracking-widest">{pendingCode}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(pendingCode)
                            toast({ title: language === "cs" ? "Zkopírováno" : "Copied" })
                          }}
                          className="text-yellow-300 hover:text-yellow-200"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-gray-300">{language === "cs" ? "Ověřovací kód" : "Verification Code"}</Label>
                    <Input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="bg-slate-800/50 border-slate-700 text-white text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setTwoFactorStep("contact")}
                      className="flex-1 border-slate-600 text-gray-300"
                    >
                      {language === "cs" ? "Zpět" : "Back"}
                    </Button>
                    <Button
                      onClick={verify2FACode}
                      disabled={verificationCode.length !== 6}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === "cs" ? "Ověřit" : "Verify"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
