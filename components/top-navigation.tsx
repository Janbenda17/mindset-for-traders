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
  Gift,
  Clock,
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

// Pages that render their own marketing-style header/hero (intro, resources)
// and manage their own top spacing independently of ClientLayout's pt-*
// wrapper. The trial strip is skipped there so we don't have to touch every
// marketing page's padding for a growth hook. The homepage ("/") is NOT in
// this set on purpose: it renders its own TopNavigation too, but it also
// wants the growth-hook strip (unlock-trial for logged-out visitors,
// lifecycle messaging for logged-in ones), and reserves the extra 32px of
// space for it directly in its own hero padding - see app/page.tsx.
const STRIP_EXCLUDED_PATHS = new Set(["/intro", "/resources"])

export const TopNavigation = ({ initialTheme = "dark" }: TopNavigationProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { isLiveMode, switchToLive } = useLiveMode()
  const { isPremium, isTrialing, trialDaysLeft, hasSubscribed } = useSubscription()
  const t = useT()
  const { language } = useLanguage()
  const isEn = language === "en"
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)

  // Products menu opens on hover and closes on leave. It is intentionally NOT
  // built with Radix's DropdownMenu/DropdownMenuContent here, because that
  // content renders through a React Portal (appended elsewhere in the DOM),
  // which kept causing the open state to flicker as the mouse crossed the
  // visual gap between the button and the portaled panel. Using a plain
  // absolutely-positioned panel as a direct sibling inside the same hover
  // container removes that gap entirely - one element, one set of handlers,
  // hovering anywhere over the button+panel area keeps it open, leaving it
  // closes it. No delay/timeout needed since there's no portal boundary to
  // cross.
  const openProductsMenu = () => setIsProductsOpen(true)
  const closeProductsMenu = () => setIsProductsOpen(false)
  const [isSwitchingToLive, setIsSwitchingToLive] = useState(false)

  const mainNavigation = [
    { name: t('nav_daily_tracker'), href: "/daily-tracker", icon: Calendar, shortName: t('nav_daily_tracker') },
    { name: t('nav_mindtrader'), href: "/mindtrader", icon: Brain, badge: "AI", shortName: "AI" },
    { name: t('nav_journal'), href: "/journal", icon: TrendingUp, shortName: t('nav_journal') },
    { name: t('nav_weekly_review'), href: "/weekly-review", icon: Calendar },
    { name: t('nav_team_club'), href: "/team-club", icon: Users },
    { name: t('nav_bonus'), href: "/bonus", icon: Trophy, badge: t('nav_new') },
  ]

  const { logout, user: authUser } = useAuth()
  const isAuthenticated = !!authUser

  // Populated straight from the already-resolved AuthProvider session (no
  // network round trip), so the nav can render real content immediately
  // instead of blanking out. The richer fields below (avatar, level,
  // subscription tier) fill in once the profiles-row fetch resolves.
  const [profileData, setProfileData] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    nickname: "",
    avatarUrl: "",
    experienceLevel: "beginner",
    isPremium: false,
    level: 1,
  })

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

  // Auth state (isAuthenticated) comes straight from AuthProvider - this
  // effect only fetches the extra profile-row fields (avatar, level,
  // subscription tier) that aren't already on the auth session, and never
  // blocks the nav itself from rendering.
  useEffect(() => {
    if (!authUser?.id) return

    let cancelled = false
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle()
      .then(({ data: profile, error }) => {
        if (cancelled) return
        if (error) {
          console.error("[v0] Profile load error:", error)
          return
        }
        if (!profile) return

        setProfileData({
          name: profile.display_name || profile.username || authUser.email?.split("@")[0] || "Trader",
          email: authUser.email || "",
          nickname: profile.username || "",
          avatarUrl: profile.avatar_url || "",
          experienceLevel: profile.experience_level || "beginner",
          isPremium: profile.subscription_tier === "premium" || profile.subscription_tier === "pro",
          level: 1,
        })
      })

    return () => {
      cancelled = true
    }
  }, [authUser?.id, authUser?.email])

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

  // Growth-hook strip shown above the main nav row. For logged-in users it
  // renders (constant height) on every app page except the marketing pages
  // in STRIP_EXCLUDED_PATHS, so ClientLayout's top padding never has to
  // guess whether it's visible - only the copy + CTA changes based on
  // subscription state. For logged-out visitors it additionally renders on
  // the homepage only, pointing them at registration instead.
  const showTrialStrip = isAuthenticated
    ? !STRIP_EXCLUDED_PATHS.has(pathname || "")
    : pathname === "/"
  const dayWord = (n: number) => {
    if (isEn) return n === 1 ? "day" : "days"
    if (n === 1) return "den"
    if (n >= 2 && n <= 4) return "dny"
    return "dní"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {showTrialStrip && (
        <div
          className={`h-8 flex items-center justify-center px-3 text-center ${
            !isAuthenticated
              ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90"
              : isTrialing
                ? "bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90"
                : isPremium
                  ? "bg-gradient-to-r from-emerald-700/70 to-emerald-800/70"
                  : "bg-gradient-to-r from-amber-600/90 to-orange-600/90"
          }`}
        >
          {!isAuthenticated ? (
            <Link href="/signup" className="flex items-center gap-1.5 text-xs font-medium text-white hover:underline truncate">
              <Gift className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {isEn
                  ? "Sign up, then activate a 14-day free Premium trial (card required)."
                  : "Zaregistruj se a aktivuj 14denní Premium trial (vyžaduje platební kartu)."}
              </span>
              <span className="hidden sm:inline underline decoration-white/50">
                {isEn ? "Get started" : "Začít zdarma"}
              </span>
            </Link>
          ) : isTrialing ? (
            <Link href="/upgrade" className="flex items-center gap-1.5 text-xs font-medium text-white hover:underline truncate">
              <Gift className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {isEn
                  ? `Your 14-day Premium trial is active — ${trialDaysLeft} ${dayWord(trialDaysLeft)} left.`
                  : `Aktivní 14denní Premium trial — zbývá ${trialDaysLeft} ${dayWord(trialDaysLeft)}.`}
              </span>
              <span className="hidden sm:inline underline decoration-white/50">
                {isEn ? "See what's unlocked" : "Zobrazit Premium"}
              </span>
            </Link>
          ) : isPremium ? (
            <Link href="/account?tab=subscription" className="flex items-center gap-1.5 text-xs font-medium text-white hover:underline truncate">
              <Crown className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {isEn ? "Premium active — thank you for your support!" : "Premium aktivní — děkujeme za podporu!"}
              </span>
            </Link>
          ) : hasSubscribed ? (
            <Link href="/upgrade" className="flex items-center gap-1.5 text-xs font-medium text-white hover:underline truncate">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {isEn
                  ? "Your Premium trial/subscription has ended. Continue for 749 Kč/month."
                  : "Tvůj Premium trial/předplatné skončilo. Pokračuj za 749 Kč/měsíc."}
              </span>
              <span className="hidden sm:inline underline decoration-white/50">
                {isEn ? "Renew Premium" : "Obnovit Premium"}
              </span>
            </Link>
          ) : (
            <Link href="/upgrade" className="flex items-center gap-1.5 text-xs font-medium text-white hover:underline truncate">
              <Gift className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {isEn
                  ? "Activate your 14-day Premium trial — card required, nothing charged for 14 days."
                  : "Aktivuj svůj 14denní Premium trial — vyžaduje kartu, prvních 14 dní nic neplatíš."}
              </span>
              <span className="hidden sm:inline underline decoration-white/50">
                {isEn ? "Activate trial" : "Aktivovat trial"}
              </span>
            </Link>
          )}
        </div>
      )}
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-6">
        <div className="relative flex items-center h-14 md:h-16">
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

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Products dropdown */}
            <div
              className="relative"
              onMouseEnter={openProductsMenu}
              onMouseLeave={closeProductsMenu}
            >
              <Button
                variant="ghost"
                size="sm"
                className="relative px-4 h-10 text-sm font-semibold text-white bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-500/90 hover:to-pink-500/90 transition-all duration-300 group flex items-center gap-2 rounded-lg shadow-lg shadow-purple-500/20"
                aria-expanded={isProductsOpen}
              >
                <span>{isEn ? 'Products' : 'Produkty'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </Button>
              {isProductsOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-full min-w-max z-50"
                >
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-6 shadow-xl">
                    {/* Hlavní produkty - 8 vedle sebe, vycentrovaný */}
                    <div className="flex justify-center w-full">
                      <div className="grid grid-cols-6 gap-3 w-fit">
                        {mainNavigation.map((item) => {
                          const isActive = pathname === item.href

                          return (
                            <Link key={item.name} href={item.href} onClick={() => setIsProductsOpen(false)}>
                              <div className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all w-24 h-28 ${
                                isActive
                                  ? "bg-purple-600/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                                  : "hover:bg-slate-800/50 border-2 border-slate-700/50 hover:border-slate-600/50"
                              }`}>
                                <item.icon className={`w-6 h-6 ${isActive ? "text-purple-400" : "text-gray-300"}`} />
                                <span className={`text-xs text-center font-medium line-clamp-2 ${isActive ? "text-purple-300" : "text-white"}`}>
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <Badge className="text-xs px-1.5 py-0.5 h-5 bg-green-500/30 text-green-300 border border-green-500/50">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing button */}
            <Link href="/upgrade">
              <Button
                size="sm"
                className={`relative px-4 h-10 text-sm font-semibold transition-all duration-300 rounded-lg ${
                  pathname === "/upgrade"
                    ? "text-white bg-gradient-to-r from-purple-500/70 to-pink-500/70 shadow-lg shadow-purple-500/20"
                    : "text-white bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-500/90 hover:to-pink-500/90 shadow-lg shadow-purple-500/20"
                }`}
              >
                {isEn ? 'Pricing' : 'Ceník'}
              </Button>
            </Link>

            {/* About button */}
            <Link href="/intro">
              <Button
                size="sm"
                className={`relative px-4 h-10 text-sm font-semibold transition-all duration-300 rounded-lg ${
                  pathname === "/intro"
                    ? "text-white bg-gradient-to-r from-purple-500/70 to-pink-500/70 shadow-lg shadow-purple-500/20"
                    : "text-white bg-gradient-to-r from-purple-500/70 to-pink-500/70 hover:from-purple-500/90 hover:to-pink-500/90 shadow-lg shadow-purple-500/20"
                }`}
              >
                {isEn ? 'About' : 'O nás'}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center">
            <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="w-5 h-5 text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-slate-900/95 backdrop-blur-md border-slate-700" align="end">
                <div className="p-2">
                  <p className="text-xs text-gray-400 px-3 py-2 font-semibold">{isEn ? 'MAIN MENU' : 'HLAVNÍ MENU'}</p>
                  {mainNavigation.map((item) => {
                    const isActive = pathname === item.href

                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-800/50 rounded-lg cursor-pointer ${
                            isActive ? "bg-purple-600/20" : ""
                          }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                          <span className={`flex-1 text-sm ${isActive ? "text-purple-300 font-medium" : "text-white"}`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <Badge
                              className={`text-xs px-1.5 py-0 h-5 ${
                                item.badge === "AI" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : ""
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0 ml-auto">
            {/* Login and Get Started - only show if not authenticated */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-1.5">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative px-4 h-10 text-sm font-semibold text-white hover:text-gray-200 transition-colors"
                  >
                  {isEn ? 'Profile' : 'Profil'}
                    <ChevronDown className="w-4 h-4 ml-2 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-8 px-3 text-sm font-semibold"
                  >
                    {t('free_trial')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Get Started Button - Mobile only */}
            <Link href="/signup" className="md:hidden">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              >
                {t('free_trial')}
              </Button>
            </Link>

            {/* Virtual/Live Mode Toggle Button - show if authenticated, premium, and not in live mode */}
            {isAuthenticated && isPremium && !isLiveMode && (
              <Button
                onClick={handleSwitchToLive}
                disabled={isSwitchingToLive}
                className="mr-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {isSwitchingToLive ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEn ? 'Switching...' : 'Přepínaní...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {isEn ? 'Switch to Live Mode' : 'Přepnout do Live Mode'}
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
