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
  Database,
  ExternalLink,
  ArrowRight,
  Target,
  Plug,
  Compass,
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

function describeUserAgent(ua: string): string {
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown OS"

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown browser"

  return `${browser} on ${os}`
}

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
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Trading Settings
  const [timezone, setTimezone] = useState("Europe/Prague")

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

  // 2FA (TOTP via Supabase Auth MFA)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null)
  const [mfaSecret, setMfaSecret] = useState<string | null>(null)
  const [mfaEnrolling, setMfaEnrolling] = useState(false)
  const [mfaVerifying, setMfaVerifying] = useState(false)
  const [mfaDisabling, setMfaDisabling] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  // Current session (real device/browser + last sign-in, replaces the old hardcoded row)
  const [sessionDevice, setSessionDevice] = useState("")
  const [sessionLastSignIn, setSessionLastSignIn] = useState<string | null>(null)

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

  // Real 2FA status - is there a verified TOTP factor on this Supabase account?
  useEffect(() => {
    const loadMfaStatus = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) {
        console.error("[v0] Error loading MFA factors:", error)
        return
      }
      const verifiedTotp = data?.totp?.find((f) => f.status === "verified")
      setTwoFactorEnabled(!!verifiedTotp)
      setMfaFactorId(verifiedTotp?.id || null)
    }
    loadMfaStatus()
  }, [])

  // Real current-session info (device/browser + last sign-in), replacing the
  // previous hardcoded "Prague, Czech Republic - Now" row.
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setSessionDevice(describeUserAgent(navigator.userAgent))
    }

    const loadSession = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setSessionLastSignIn(authUser?.last_sign_in_at || null)
    }
    loadSession()
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
      memberSince: new Date().toLocaleDateString("en-US"),
    })
    } catch (error) {
      console.error("[v0] Error loading settings:", error)
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File is too large (max 5MB)",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "File must be an image",
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
        title: "Success",
        description: "Photo uploaded successfully",
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
      title: "Success",
        description: "Photo removed successfully",
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
        title: "Success",
        description: "Profile saved",
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save changes.",
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
        title: "Success",
        description: "Notifications saved",
      })

      window.dispatchEvent(new Event("settings-updated"))
    } catch (error) {
      console.error("Error saving notifications:", error)
      toast({
        title: "Error",
        description: "Failed to save settings.",
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
        title: "Success",
        description: "Security settings saved",
      })
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
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
        title: "Success",
        description: language === "cs" ? "Password changed successfully" : "Password changed successfully",
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
        title: "Error",
        description: error.message || "Failed to change password",
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
        title: "Success",
        description: "Data exported",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Export failed",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return
    }

    setDeletingAccount(true)
    try {
      const response = await fetch("/api/account/delete", { method: "POST" })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete account")
      }

      clearAllDemoData()
      logout()
      router.push("/")
    } catch (error: any) {
      console.error("[v0] Error deleting account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setDeletingAccount(false)
    }
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      await upgradeToPremium()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open payment gateway",
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
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm("Are you sure you want to cancel your subscription?")
    ) {
      return
    }
    setIsUpgrading(true)
    try {
      const success = await cancelSubscription()
      if (success) {
        toast({
          title: "Subscription cancelled",
          description:
            "Your subscription will be cancelled at the end of the current period",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  const premiumFeatures = [
    "Live Mode - reálné obchodování se skutečnými daty",
    "AI Report Builder - automatický AI report z tvého obchodování a psychologie",
    "Prioritní podpora",
  ]

  const freeFeatures = [
    "Virtual Mode - náhled na ukázkových datech",
  ]

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: language === "cs" ? "Not Supported" : "Not Supported",
        description:
          language === "cs" ? "Your browser doesn't support notifications" : "Your browser doesn't support notifications",
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
        title: language === "cs" ? "Enabled" : "Enabled",
        description: language === "cs" ? "Push notifications enabled" : "Push notifications enabled",
      })
      return true
    } else {
      toast({
        title: language === "cs" ? "Denied" : "Denied",
        description: language === "cs" ? "Push notifications denied" : "Push notifications denied",
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
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      })
      return
    }

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast({
          title: "Denied",
          description: "Enable notifications in browser settings",
          variant: "destructive",
        })
        return
      }
    }

    if (Notification.permission !== "granted") {
      toast({
        title: "Error",
        description: "Notifications are not allowed. Enable them in browser settings.",
        variant: "destructive",
      })
      return
    }

    try {
      const notification = new Notification("Trader Mindset", {
        body: "Push notifications are working!",
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
        title: "Sent",
        description: "Test notification was sent",
      })
    } catch (error) {
      console.error("Notification error:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    }
  }

  const start2FASetup = async () => {
    setVerificationCode("")
    setMfaQrCode(null)
    setMfaSecret(null)
    setMfaFactorId(null)
    setMfaEnrolling(true)
    setShow2FADialog(true)

    try {
      // Clean up any previously abandoned/unverified enrollment first - Supabase
      // only allows one unverified TOTP factor per user at a time.
      const { data: existing } = await supabase.auth.mfa.listFactors()
      const stale = existing?.all?.find((f) => f.factor_type === "totp" && f.status === "unverified")
      if (stale) {
        await supabase.auth.mfa.unenroll({ factorId: stale.id })
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" })
      if (error) throw error

      setMfaFactorId(data.id)
      setMfaQrCode(data.totp.qr_code)
      setMfaSecret(data.totp.secret)
    } catch (error: any) {
      console.error("[v0] Error starting 2FA setup:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to start 2FA setup",
        variant: "destructive",
      })
      setShow2FADialog(false)
    } finally {
      setMfaEnrolling(false)
    }
  }

  const verify2FACode = async () => {
    if (!mfaFactorId || verificationCode.length !== 6) return

    setMfaVerifying(true)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: verificationCode,
      })
      if (verifyError) throw verifyError

      setTwoFactorEnabled(true)
      setShow2FADialog(false)
      setVerificationCode("")

      toast({
        title: language === "cs" ? "2FA aktivováno" : "2FA Enabled",
        description:
          language === "cs"
            ? "Dvoufaktorové ověření bylo úspěšně aktivováno"
            : "Two-factor authentication enabled successfully",
      })
    } catch (error: any) {
      console.error("[v0] Error verifying 2FA code:", error)
      toast({
        title: "Error",
        description: error.message || "Invalid code",
        variant: "destructive",
      })
    } finally {
      setMfaVerifying(false)
    }
  }

  const disable2FA = async () => {
    if (!mfaFactorId) return

    setMfaDisabling(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId })
      if (error) throw error

      setTwoFactorEnabled(false)
      setMfaFactorId(null)

      toast({
        title: language === "cs" ? "2FA deaktivováno" : "2FA Disabled",
        description: language === "cs" ? "Dvoufaktorové ověření bylo vypnuto" : "Two-factor authentication disabled",
      })
    } catch (error: any) {
      console.error("[v0] Error disabling 2FA:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive",
      })
    } finally {
      setMfaDisabling(false)
    }
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

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
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
            <TabsTrigger
              value="integrations"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-gray-400"
            >
              <Plug className="w-4 h-4 mr-2" />
  Integrace
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
                    <Label className="text-gray-300">Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nickname</Label>
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

            <Button onClick={handleSaveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {language === "cs" ? "Uložit profil" : "Save Profile"}
            </Button>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  {language === "cs" ? "Úvodní prohlídka aplikace" : "App product tour"}
                </CardTitle>
                <CardDescription>
                  {language === "cs"
                    ? "Znovu si projdi rychlý přehled hlavních funkcí MindTrader."
                    : "Replay the quick walkthrough of MindTrader's main features."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    localStorage.setItem("mindtrader-show-tour", "true")
                    router.push("/daily-tracker")
                  }}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  {language === "cs" ? "Spustit prohlídku znovu" : "Replay tour"}
                </Button>
              </CardContent>
            </Card>
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
                    ? "Přidejte další vrstvu zabezpečení pomocí aplikace pro ověřování (Google Authenticator, Authy...)"
                    : "Add an extra layer of security using an authenticator app (Google Authenticator, Authy...)"}
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
                            {language === "cs" ? "Aplikace pro ověřování" : "Authenticator app"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={disable2FA}
                        disabled={mfaDisabling}
                        className="border-red-500/50 text-red-400 hover:bg-red-900/20 bg-transparent"
                      >
                        {mfaDisabling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : language === "cs" ? (
                          "Vypnout"
                        ) : (
                          "Disable"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={start2FASetup} disabled={mfaEnrolling} className="bg-green-600 hover:bg-green-700">
                    {mfaEnrolling ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
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
                        <Clock className="w-3 h-3" />
                        {sessionDevice || (language === "cs" ? "Neznámé zařízení" : "Unknown device")}
                        {sessionLastSignIn &&
                          ` • ${language === "cs" ? "Přihlášení" : "Signed in"} ${new Date(sessionLastSignIn).toLocaleString(
                            language === "cs" ? "cs-CZ" : "en-US",
                            { dateStyle: "medium", timeStyle: "short" },
                          )}`}
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
                    disabled={deletingAccount}
                    variant="outline"
                    className="w-full bg-transparent text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    {deletingAccount ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
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
            {/* Live Mode upsell - shown to non-premium users. Live Mode itself
                is gated behind isPremium (see contexts/live-mode-context.tsx),
                so free accounts get a prompt to upgrade here, not a toggle
                that would fail. */}
            {!isPremium && (
            <div className="flex items-center justify-center space-x-4 p-6 border border-yellow-500/20 rounded-xl bg-yellow-900/10 backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-400" />
                <h3 className="text-lg font-bold text-yellow-400">{language === "cs" ? "Režim Live" : "Live Mode"}</h3>
              </div>
              <Separator orientation="vertical" className="bg-yellow-500/30 h-8" />
              <p className="text-sm text-yellow-500/90">
                {language === "cs"
                  ? "Zatím pracuješ ve Virtual režimu (náhled na ukázkových datech)."
                  : "You're currently in Virtual mode (a preview on sample data)."}
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                onClick={handleUpgrade}
                disabled={isUpgrading || subscriptionLoading}
              >
                {language === "cs" ? "Odemknout Live Mode" : "Unlock Live Mode"}
              </Button>
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
                  !isPremium
                    ? "border-blue-500/50 bg-slate-900"
                    : "border-slate-700/50 bg-slate-900/60"
                } backdrop-blur-xl`}
              >
                <CardHeader className="pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-bold text-white">Starter</CardTitle>
                    {!isPremium && (
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
                    disabled={!isPremium}
                  >
                    {!isPremium
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
                  isPremium
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
                    {isPremium && (
                      <Badge className="bg-green-500 text-white">{language === "cs" ? "Aktivní" : "Active"}</Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-300">
                    {language === "cs" ? "Odemkněte Live Režim a všechny funkce" : "Unlock Live Mode and all features"}
                  </CardDescription>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">
                      1149 Kč
                    </span>
                    <span className="text-gray-400 ml-2 text-lg">/{language === "cs" ? "měsíc" : "month"}</span>
                  </div>
                  <p className="text-sm text-purple-300 font-medium mt-2">
                    {/* Was "14denní zkušební verze zdarma, bez karty" - stale
                        from the old Stripe-trial model. Checkout now charges
                        immediately with no Stripe trial (see /upgrade); the
                        only free trial is the separate 3-day no-card app
                        trial granted on broker connect. */}
                    {language === "cs" ? "Plný přístup ihned po zaplacení. Kdykoli zrušitelné." : "Full access starts immediately after payment. Cancel anytime."}
                  </p>
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

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Integrace</h2>
                <p className="text-gray-400 text-sm mt-1">Připojte své obchodní účty a zdravotní data</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* MetaTrader Integration Card */}
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border-slate-700/50 backdrop-blur-xl hover:border-slate-600/50 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-400" />
                      MetaTrader
                    </CardTitle>
                  </div>
                  <CardDescription>Automatické synchronizace obchodů</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    Připojte svůj MetaTrader účet a automaticky synchronizujte všechny své obchody.
                  </p>
                  <Button
                    onClick={() => router.push('/account/integrations')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plug className="w-4 h-4 mr-2" />
                    Spravovat
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-900/20 border-blue-600/30 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-300 mb-1">Bezpečné propojení</h3>
                    <p className="text-sm text-blue-200/80">
                      Všechna vaše data jsou šifrovaná a zabezpečená. Vaše hesla se nikdy neukládají v čitelné podobě.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                {language === "cs"
                  ? "Naskenujte QR kód v aplikaci pro ověřování a zadejte kód"
                  : "Scan the QR code with your authenticator app, then enter the code"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {mfaEnrolling ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                </div>
              ) : (
                <>
                  {mfaQrCode && (
                    <div className="flex justify-center p-4 bg-white rounded-xl">
                      <img src={mfaQrCode} alt="2FA QR code" className="w-48 h-48" />
                    </div>
                  )}

                  {mfaSecret && (
                    <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">
                        {language === "cs" ? "Nebo zadejte klíč ručně:" : "Or enter this key manually:"}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-white break-all">{mfaSecret}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(mfaSecret)
                            toast({ title: language === "cs" ? "Zkopírováno" : "Copied" })
                          }}
                          className="text-gray-300 hover:text-white flex-shrink-0"
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
                  <Button
                    onClick={verify2FACode}
                    disabled={verificationCode.length !== 6 || mfaVerifying}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {mfaVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {language === "cs" ? "Ověřit a aktivovat" : "Verify & Enable"}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
