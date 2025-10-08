"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { Badge } from "@/components/ui/badge"
import { User, Settings, CreditCard, LogOut, Crown, Zap, TrendingUp, Clock, Bell, Shield, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserData } from "@/utils/storage-utils"

export function UserNav() {
  const { user, logout } = useAuth()
  const { subscription, isTrialActive, daysLeftInTrial } = useSubscription()
  const [tradingStyle, setTradingStyle] = useState<string>("day-trader")
  const [riskLevel, setRiskLevel] = useState<string>("moderate")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    loadSettings()

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      loadSettings()
    }

    window.addEventListener("settings-updated", handleSettingsUpdate)
    return () => {
      window.removeEventListener("settings-updated", handleSettingsUpdate)
    }
  }, [])

  const loadSettings = () => {
    const userData = getUserData()
    if (userData.settings?.trading) {
      setTradingStyle(userData.settings.trading.style || "day-trader")
      setRiskLevel(userData.settings.trading.riskLevel || "moderate")
    }
    if (userData.settings?.notifications) {
      const hasAnyEnabled = Object.values(userData.settings.notifications).some((v) => v === true)
      setNotificationsEnabled(hasAnyEnabled)
    }
  }

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPlanBadge = () => {
    if (isTrialActive) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          Trial ({daysLeftInTrial}d)
        </Badge>
      )
    }
    if (subscription?.plan === "premium") {
      return (
        <Badge variant="default" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
          Premium
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-300 border-gray-500/30">
        Free
      </Badge>
    )
  }

  const getTradingStyleIcon = () => {
    switch (tradingStyle) {
      case "scalper":
        return <Zap className="h-4 w-4 text-yellow-400" />
      case "day-trader":
        return <TrendingUp className="h-4 w-4 text-blue-400" />
      case "swing-trader":
        return <Clock className="h-4 w-4 text-purple-400" />
      default:
        return <TrendingUp className="h-4 w-4 text-blue-400" />
    }
  }

  const getTradingStyleLabel = () => {
    switch (tradingStyle) {
      case "scalper":
        return "Scalper"
      case "day-trader":
        return "Day Trader"
      case "swing-trader":
        return "Swing Trader"
      default:
        return "Day Trader"
    }
  }

  const getRiskLevelBadge = () => {
    switch (riskLevel) {
      case "conservative":
        return <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">Konzervativní</Badge>
      case "moderate":
        return <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Střední</Badge>
      case "aggressive":
        return <Badge className="text-xs bg-red-500/20 text-red-300 border-red-500/30">Agresivní</Badge>
      default:
        return <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Střední</Badge>
    }
  }

  const getSubscriptionEndDate = () => {
    if (subscription?.endDate) {
      return new Date(subscription.endDate).toLocaleDateString("cs-CZ")
    }
    return "N/A"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600 text-white font-semibold">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-slate-900 border-slate-700" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3 p-2">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-600 text-white text-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                <p className="text-xs leading-none text-gray-400 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Plan Badge */}
            <div className="flex justify-start">{getPlanBadge()}</div>

            <DropdownMenuSeparator className="bg-slate-700" />

            {/* Premium Info */}
            {subscription?.plan === "premium" && (
              <div className="space-y-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs font-medium text-purple-300">Premium členství</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>Aktivní do: {getSubscriptionEndDate()}</span>
                </div>
              </div>
            )}

            {/* Trading Style Info */}
            <div className="space-y-2 p-2 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTradingStyleIcon()}
                  <span className="text-xs font-medium text-white">{getTradingStyleLabel()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Risk level:</span>
                {getRiskLevelBadge()}
              </div>
            </div>

            {/* Notifications Status */}
            <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-300">Notifikace</span>
              </div>
              <Badge
                className={
                  notificationsEnabled
                    ? "text-xs bg-green-500/20 text-green-300 border-green-500/30"
                    : "text-xs bg-gray-500/20 text-gray-300 border-gray-500/30"
                }
              >
                {notificationsEnabled ? "Zapnuto" : "Vypnuto"}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-700" />

        {/* Menu Items */}
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <User className="mr-2 h-4 w-4" />
            <span>Nastavení účtu</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/pricing" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Předplatné</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account?tab=trading" className="flex items-center cursor-pointer text-gray-300 hover:text-white">
            <Settings className="mr-2 h-4 w-4" />
            <span>Trading nastavení</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account?tab=notifications"
            className="flex items-center cursor-pointer text-gray-300 hover:text-white"
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifikace</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/account?tab=security"
            className="flex items-center cursor-pointer text-gray-300 hover:text-white"
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Zabezpečení</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={logout}
          className="flex items-center cursor-pointer text-red-400 hover:text-red-300 focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Odhlásit se</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
