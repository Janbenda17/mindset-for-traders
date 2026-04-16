"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Brain,
  Home,
  BarChart3,
  Users,
  Calendar,
  User,
  Settings,
  CreditCard,
  LogOut,
  Crown,
  TrendingUp,
  Trophy,
  MoreHorizontal,
  Menu,
  Calculator,
  Sun,
  Target,
  AlertTriangle,
  ChevronDown,
  Lock,
  Zap,
} from "lucide-react"
import LiveModeToggle from "@/components/live-mode-toggle"
import { supabase } from "@/lib/supabase/client"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useT, useLanguage } from "@/contexts/language-context"

interface TopNavigationProps {
  initialTheme?: string
}

export const TopNavigation = ({ initialTheme = "dark" }: TopNavigationProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { isLiveMode, switchToLive } = useLiveMode()
  const { isPremium } = useSubscription()
  const t = useT()
  const { language } = useLanguage()
  const isEn = language === "en"
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSwitchingToLive, setIsSwitchingToLive] = useState(false)

  // Primary nav - always visible on desktop
  const primaryNavigation = [
    { name: t('nav_home'), href: "/dashboard", icon: Home },
    { name: t('nav_daily_tracker'), href: "/daily-tracker", icon: Calendar },
    { name: t('nav_mindtrader'), href: "/mindtrader", icon: Brain, badge: "AI" },
    { name: t('nav_journal'), href: "/journal", icon: TrendingUp },
    { name: t('nav_analytics'), href: "/analytics", icon: BarChart3 },
  ]

  // Secondary nav - in "More" dropdown on desktop, full list on mobile
  const secondaryNavigation = [
    { name: t('nav_weekly_review'), href: "/weekly-review", icon: Calendar },
    { name: t('nav_team_club'), href: "/team-club", icon: Users },
    { name: t('nav_bonus'), href: "/bonus", icon: Trophy, badge: t('nav_new') },
  ]

  // Combined for mobile menu
  const mainNavigation = [...primaryNavigation, ...secondaryNavigation]

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    nickname: "",
    avatarUrl: "",
    experienceLevel: "beginner",
    isPremium: false,
    level: 1,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false) // Track if we loaded profile once

  const { logout } = useAuth()

  const handlePricingClick = () => {
    if (!isAuthenticated) {
      router.push('/signup')
    } else {
      router.push('/account')
    }
  }

  const handleSwitchToLive = async () => {
    try {
      console.log("[v0] [TopNav] Clicking Switch to Live Mode...")
      setIsSwitchingToLive(true)
      await switchToLive()
      // Note: page will reload after switchToLive, so this won't execute
    } catch (error) {
      console.error("[v0] [TopNav] Error switching to live:", error)
      setIsSwitchingToLive(false)
    }
  }

  const loadProfileData = async () => {
    if (typeof window === "undefined") return

    if (hasLoadedOnce) return

    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user")
      setIsLoading(false)
      setIsAuthenticated(false)
      setHasLoadedOnce(true)
      return
    }

    console.log("[v0] User authenticated:", user.email)
    setIsAuthenticated(true)

    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

    if (error) {
      console.error("[v0] Profile load error:", error)
    }

    const profile = data

    if (!profile) {
      console.log("[v0] No profile found - user needs onboarding")
      setProfileData({
        name: "Loading...",
        email: user.email || "",
        nickname: "",
        avatarUrl: "",
        experienceLevel: "beginner",
        isPremium: false,
        level: 1,
      })
      setIsLoading(false)
      setHasLoadedOnce(true)
      return
    }

    setProfileData({
      name: profile.display_name || profile.username || user.email?.split("@")[0] || "Trader",
      email: user.email || "",
      nickname: profile.username || "",
      avatarUrl: profile.avatar_url || "",
      experienceLevel: profile.experience_level || "beginner",
      isPremium: profile.subscription_tier === "premium" || profile.subscription_tier === "pro",
      level: 1,
    })

    setIsLoading(false)
    setHasLoadedOnce(true)
  }

  useEffect(() => {
    loadProfileData()

    // Auth state is already managed by AuthProvider
  }, []) // Only load once on mount

  const getInitials = (name: string) => {
    if (!name) return "T"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getExperienceLabel = (level: string) => {
    switch (level) {
      case "beginner": return isEn ? "Beginner" : "Začátečník"
      case "intermediate": return isEn ? "Intermediate" : "Pokročilý"
      case "advanced": return isEn ? "Advanced" : "Pokročilý"
      case "expert": return isEn ? "Expert Trader" : "Expert Trader"
      default: return "Trader"
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="text-gray-400 text-sm">{t('loading')}</div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo and Auth Buttons Left Side */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="block text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MindTrader
              </span>
            </Link>
          </div>

          {/* Main Navigation - Direct links (clean, flat hierarchy) */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {primaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative px-3 h-10 text-sm font-medium transition-all rounded-lg flex items-center gap-2 ${
                      isActive
                        ? "text-white bg-purple-500/20 border border-purple-500/40"
                        : "text-gray-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-purple-500/30 text-purple-200 border border-purple-500/40">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}

            {/* More dropdown for secondary navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-3 h-10 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/60 rounded-lg flex items-center gap-2 border border-transparent"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span>{isEn ? 'More' : 'Více'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900/95 backdrop-blur-md border-slate-700 p-1" align="end">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${
                          isActive ? "bg-purple-600/20 text-purple-300" : "text-gray-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500/20 text-green-300 border-green-500/30">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-slate-700 my-1" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/intro"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-gray-200 hover:bg-slate-800/50"
                  >
                    <Sun className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm font-medium">{isEn ? 'About' : 'O nás'}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Pricing button - subtle, right-aligned accent */}
          <div className="hidden lg:flex items-center">
            <Link href="/upgrade">
              <Button
                size="sm"
                className={`relative px-4 h-9 text-sm font-semibold transition-all rounded-lg ${
                  pathname === "/upgrade"
                    ? "text-white bg-gradient-to-r from-purple-600 to-pink-600"
                    : "text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md shadow-purple-500/20"
                }`}
              >
                <Crown className="w-4 h-4 mr-1.5" />
                {isEn ? 'Upgrade' : 'Upgrade'}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center">
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-300 hover:text-white hover:bg-slate-800/60">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-slate-900/95 backdrop-blur-md border-slate-700 p-2" align="end">
                <p className="text-xs text-gray-500 px-3 py-2 font-semibold uppercase tracking-wider">{isEn ? 'Main' : 'Hlavní'}</p>
                {primaryNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${
                          isActive ? "bg-purple-600/20 text-purple-300" : "text-gray-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-slate-700 my-2" />
                <p className="text-xs text-gray-500 px-3 py-2 font-semibold uppercase tracking-wider">{isEn ? 'More' : 'Více'}</p>
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer ${
                          isActive ? "bg-purple-600/20 text-purple-300" : "text-gray-200 hover:bg-slate-800/50"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500/20 text-green-300 border-green-500/30">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-slate-700 my-2" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/upgrade"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white hover:from-purple-600/30 hover:to-pink-600/30"
                  >
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="flex-1 text-sm font-semibold">{isEn ? 'Upgrade to Premium' : 'Upgradovat na Premium'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/intro"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-gray-200 hover:bg-slate-800/50"
                  >
                    <Sun className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm font-medium">{isEn ? 'About' : 'O nás'}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">
            {/* Login and Get Started - only show if not authenticated */}
            {!isAuthenticated && (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 h-9 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                  >
                    {isEn ? 'Log in' : 'Přihlásit'}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-9 px-4 text-sm font-semibold rounded-lg shadow-md shadow-purple-500/20"
                  >
                    {t('free_trial')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Get Started Button - Mobile only, show only if not authenticated */}
            {!isAuthenticated && (
              <Link href="/signup" className="lg:hidden">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-9 px-3 text-xs"
                >
                  {t('free_trial')}
                </Button>
              </Link>
            )}

            {/* Virtual/Live Mode Toggle Button - show if authenticated, premium, and not in live mode */}
            {isAuthenticated && isPremium && !isLiveMode && (
              <Button
                onClick={handleSwitchToLive}
                disabled={isSwitchingToLive}
                size="sm"
                className="hidden md:flex bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white items-center gap-2 h-9 px-3 rounded-lg shadow-md shadow-blue-500/20"
              >
                {isSwitchingToLive ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold">{isEn ? 'Switching...' : 'Přepínaní...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-semibold">{isEn ? 'Go Live' : 'Jít Live'}</span>
                  </>
                )}
              </Button>
            )}

            {/* Profile Dropdown - only show if authenticated */}
            {isAuthenticated ? (
              <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-slate-800/50 flex-shrink-0 p-0"
                  >
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-purple-500/30">
                      <AvatarImage src={profileData.avatarUrl || ""} alt={profileData.name} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xs md:text-sm">
                        {getInitials(profileData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-slate-900/95 backdrop-blur-md border-slate-700" align="end">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-14 w-14 border-2 border-purple-500/30">
                        <AvatarImage src={profileData.avatarUrl || ""} alt={profileData.name} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-semibold">
                          {getInitials(profileData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-bold text-lg">{profileData.name}</h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-0.5">
                            {isEn ? 'Online' : 'Online'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {profileData.email || (isEn ? "Set email in profile" : "Nastav email v profilu")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {profileData.isPremium ? (
                            <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-600/20 text-slate-400 border-slate-500/30 text-xs">
                              {isEn ? 'Free' : 'Zdarma'}
                            </Badge>
                          )}
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs">
                            {isEn ? 'Level' : 'Úroveň'} {profileData.level}
                          </Badge>
                          <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/30 text-xs">
                            {getExperienceLabel(profileData.experienceLevel)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account"
                        className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                      >
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{isEn ? 'My Profile' : 'Můj profil'}</p>
                          <p className="text-xs text-gray-400">{isEn ? 'Personal info and statistics' : 'Osobní údaje a statistiky'}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account?tab=notifications"
                        className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                      >
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Settings className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{isEn ? 'Settings' : 'Nastavení'}</p>
                          <p className="text-xs text-gray-400">{isEn ? 'Notifications, security' : 'Notifikace, zabezpečení'}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/account?tab=subscription"
                        className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                      >
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <CreditCard className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{isEn ? 'Subscription & Billing' : 'Předplatné & Billing'}</p>
                          <p className="text-xs text-gray-400">{isEn ? 'Manage payments and subscription' : 'Správa plateb a předplatného'}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-slate-700" />

                  <div className="p-2">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2.5 hover:bg-red-800/20 rounded-lg cursor-pointer"
                    >
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <LogOut className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="text-red-400 font-medium text-sm">{isEn ? 'Log out' : 'Odhlásit se'}</span>
                    </DropdownMenuItem>
                  </div>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}
