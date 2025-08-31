"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LiveModeWarning } from "@/components/live-mode-warning"
import {
  Brain,
  BookOpen,
  BarChart3,
  Target,
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  Play,
  Crown,
  Users,
  Monitor,
} from "lucide-react"
import Link from "next/link"

export function TopNavigation() {
  const { user, logout } = useAuth()
  const { isPremium, daysLeft } = useSubscription()
  const { isLiveMode, hasEverSwitchedToLive, switchToLive, switchToVirtual, showLiveWarning, setShowLiveWarning } =
    useData()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Deník", href: "/journal", icon: BookOpen },
    { name: "Analýzy", href: "/analytics", icon: Target },
    { name: "MindTrader", href: "/mindtrader", icon: Brain },
    { name: "Team Club", href: "/team-club", icon: Users },
  ]

  const handleSwitchToLive = () => {
    setShowLiveWarning(true)
  }

  const confirmSwitchToLive = () => {
    switchToLive()
  }

  const handleToggleMode = () => {
    if (isLiveMode) {
      switchToVirtual()
    } else {
      handleSwitchToLive()
    }
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trader Mindset
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Days Left Badge */}
              {isPremium && (
                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                  <Calendar className="w-3 h-3 mr-1" />
                  {user?.isOwner ? "∞" : daysLeft} dní zbývá
                </Badge>
              )}

              {/* Live/Virtual Toggle - Available for all users */}
              <Button
                onClick={handleToggleMode}
                variant="outline"
                size="sm"
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  isLiveMode
                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {isLiveMode ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Virtual</span>
                  </>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={`text-white ${
                          user?.isOwner
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-blue-600 to-purple-600"
                        }`}
                      >
                        {user?.isOwner && <Crown className="w-4 h-4" />}
                        {!user?.isOwner && user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{user?.name}</p>
                        {user?.isOwner && <Crown className="w-4 h-4 text-amber-500" />}
                      </div>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                      {isPremium && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">
                            {user?.isOwner ? "Neomezeno" : `${daysLeft} dní Premium`}
                          </span>
                        </div>
                      )}
                      {user?.isOwner && (
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span className="text-xs text-amber-600 font-medium">Owner Account</span>
                        </div>
                      )}
                      {/* Mode indicator */}
                      <div className="flex items-center space-x-1">
                        {isLiveMode ? (
                          <>
                            <Play className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Live Mode</span>
                          </>
                        ) : (
                          <>
                            <Monitor className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">Virtual Mode</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Můj účet</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Odhlásit se</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button variant="ghost" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <div className="px-3 py-2">
                  <Button
                    onClick={handleToggleMode}
                    variant="outline"
                    size="sm"
                    className={`w-full flex items-center justify-center space-x-2 ${
                      isLiveMode
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}
                  >
                    {isLiveMode ? (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Switch to Virtual</span>
                      </>
                    ) : (
                      <>
                        <Monitor className="w-4 h-4" />
                        <span>Switch to Live</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Live Mode Warning Dialog */}
      <LiveModeWarning open={showLiveWarning} onOpenChange={setShowLiveWarning} onConfirm={confirmSwitchToLive} />
    </>
  )
}
