"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import LiveModeToggle from "@/components/live-mode-toggle"
import { createBrowserClient } from "@supabase/ssr"

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Obchod", href: "/journal", icon: TrendingUp },
  { name: "MindTrader AI", href: "/mindtrader", icon: Brain, badge: "AI" },
  { name: "Daily Tracker", href: "/daily-tracker", icon: Calendar },
]

const moreNavigation = [
  { name: "Weekly Review", href: "/weekly-review", icon: Calendar },
  { name: "Risk Kalkulátor", href: "/risk-calculator", icon: Calculator, badge: "NEW" },
  { name: "Trading Rutiny", href: "/routines", icon: Sun, badge: "NEW" },
  { name: "Trading Cíle", href: "/trading-goals", icon: Target, badge: "NEW" },
  { name: "Fail Log", href: "/fail-log", icon: AlertTriangle, badge: "NEW" },
  { name: "Trading Identity", href: "/trading-identity", icon: User, badge: "NEW" },
  { name: "Odměny", href: "/rewards", icon: Trophy },
  { name: "Team Club", href: "/team-club", icon: Users, badge: "PRO" },
]

export function TopNavigation() {
  const pathname = usePathname()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const loadProfileData = async () => {
    if (typeof window === "undefined") return

    setIsLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

    setProfileData({
      name: profile?.nickname || user.email?.split("@")[0] || "User",
      email: user.email || "",
      nickname: profile?.nickname || "",
      avatarUrl: profile?.avatar_url || "",
      experienceLevel: profile?.experience_level || "beginner",
      isPremium: profile?.subscription_plan === "premium" || profile?.subscription_plan === "pro",
      level: profile?.level || 1,
    })

    setIsLoading(false)
  }

  useEffect(() => {
    loadProfileData()

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfileData()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
      case "beginner":
        return "Začátečník"
      case "intermediate":
        return "Pokročilý"
      case "advanced":
        return "Expert"
      case "expert":
        return "Expert Trader"
      default:
        return "Trader"
    }
  }

  const handleLogout = () => {
    console.log("Logging out...")
    window.location.href = "/login"
  }

  const isMoreActive = moreNavigation.some((item) => pathname === item.href)

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-14 md:h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-1.5 md:space-x-2">
              <div className="p-1.5 md:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="hidden md:block text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                MindTrader
              </span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-0.5 lg:space-x-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`relative px-2 lg:px-3 py-1 h-8 lg:h-9 ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                        : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-1 lg:mr-1.5" />
                    <span className="hidden lg:inline text-sm">{item.name}</span>
                    {item.badge && (
                      <Badge
                        className={`ml-1 lg:ml-1.5 text-[10px] lg:text-xs px-1 py-0 h-4 ${
                          item.badge === "AI"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : item.badge === "PRO"
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                              : ""
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isMoreActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`relative px-2 lg:px-3 py-1 h-8 lg:h-9 ${
                    isMoreActive
                      ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                      : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4 lg:mr-1.5" />
                  <span className="hidden lg:inline text-sm">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900/95 backdrop-blur-md border-slate-700" align="end">
                {moreNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        onClick={() => {}}
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
                              item.badge === "PRO"
                                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                : item.badge === "NEW"
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : ""
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <p className="text-xs text-gray-400 px-3 py-2 font-semibold">HLAVNÍ MENU</p>
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
                <DropdownMenuSeparator className="bg-slate-700" />
                <div className="p-2">
                  <p className="text-xs text-gray-400 px-3 py-2 font-semibold">NÁSTROJE & DALŠÍ</p>
                  {moreNavigation.map((item) => {
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
                                item.badge === "PRO"
                                  ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                                  : item.badge === "NEW"
                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                    : ""
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
          <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">
            <LiveModeToggle />

            {/* Profile Dropdown - only show if authenticated */}
            {profileData.email ? (
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
                            Online
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {profileData.email || "Nastavit email v profilu"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {profileData.isPremium ? (
                            <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-600/20 text-slate-400 border-slate-500/30 text-xs">Free</Badge>
                          )}
                          <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs">
                            Level {profileData.level}
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
                          <p className="text-white font-medium text-sm">Můj profil</p>
                          <p className="text-xs text-gray-400">Osobní údaje a statistiky</p>
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
                          <p className="text-white font-medium text-sm">Nastavení</p>
                          <p className="text-xs text-gray-400">Notifikace, zabezpečení</p>
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
                          <p className="text-white font-medium text-sm">Předplatné & Billing</p>
                          <p className="text-xs text-gray-400">Správa plateb a předplatného</p>
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
                      <span className="text-red-400 font-medium text-sm">Odhlásit se</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 h-8 md:h-10">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
