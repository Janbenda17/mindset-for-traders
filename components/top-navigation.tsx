"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LiveModeToggle } from "@/components/live-mode-toggle"
import {
  Brain,
  Home,
  BarChart3,
  BookOpen,
  Users,
  Calendar,
  User,
  Settings,
  CreditCard,
  LogOut,
  Activity,
  Bell,
  Shield,
  Crown,
  Zap,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "MindTrader AI", href: "/mindtrader", icon: Brain, badge: "AI" },
  { name: "Daily Tracker", href: "/daily-tracker", icon: Calendar },
  { name: "Team Club", href: "/team-club", icon: Users, badge: "PRO" },
]

export function TopNavigation() {
  const pathname = usePathname()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    console.log("Logging out...")
    window.location.href = "/login"
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MindTrader AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`relative ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                        : "text-gray-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {item.badge && (
                      <Badge
                        className={`ml-2 text-xs ${
                          item.badge === "AI"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <LiveModeToggle />

            {/* Profile Dropdown */}
            <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-800/50">
                  <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-slate-900/95 backdrop-blur-md border-slate-700" align="end">
                {/* Profile Header */}
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-semibold">John Doe</p>
                      <p className="text-sm text-gray-400">john.doe@example.com</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-green-600/20 text-green-400 border-green-500/30 text-xs">
                          <Activity className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                        <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30 text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wider px-2 py-1">
                    Účet
                  </DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Můj profil</p>
                        <p className="text-xs text-gray-400">Upravit osobní údaje</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=trading"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Settings className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Trading nastavení</p>
                        <p className="text-xs text-gray-400">Styl, risk level, timezone</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/analytics"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Activity className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Aktivita</p>
                        <p className="text-xs text-gray-400">Zobrazit historii</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-slate-700" />

                <div className="p-2">
                  <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wider px-2 py-1">
                    Předplatné
                  </DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=subscription"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <CreditCard className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Billing</p>
                        <p className="text-xs text-gray-400">Správa předplatného</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/pricing"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Upgrade na Pro</p>
                        <p className="text-xs text-gray-400">Odemknout všechny funkce</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-slate-700" />

                <div className="p-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=notifications"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm">Notifikace</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=security"
                      className="flex items-center space-x-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">Zabezpečení</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-2 hover:bg-red-800/20 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Odhlásit se</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
