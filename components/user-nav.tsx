"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Settings, User, LogOut, Crown } from "lucide-react"

export function UserNav() {
  const { user, logout } = useAuth()
  const { language, t } = useLanguage()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [displayEmail, setDisplayEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    const loadUserData = () => {
      if (user) {
        const userData = localStorage.getItem(`user_${user.id}`)
        if (userData) {
          const parsed = JSON.parse(userData)
          setDisplayName(parsed.displayName || user.name || "User")
          setDisplayEmail(parsed.displayEmail || user.email || "")
          setAvatarUrl(parsed.profile?.avatarUrl || "")
        } else {
          setDisplayName(user.name || "User")
          setDisplayEmail(user.email || "")
        }
      }
    }

    loadUserData()

    // Listen for profile updates
    const handleStorageChange = () => {
      loadUserData()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("settings-updated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("settings-updated", handleStorageChange)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || "/trader-avatar.png"} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3 p-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl || "/trader-avatar.png"} alt={displayName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{displayEmail}</p>
              </div>
            </div>
            {user.subscriptionTier === "premium" && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-md border border-yellow-500/20">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-600">
                  {language === "cs" ? "Premium člen" : "Premium Member"}
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/account")} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("settings")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
