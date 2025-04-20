"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, User, CheckCircle, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export function UserNav() {
  const { user, isLoading, logout } = useAuth()
  const [userData, setUserData] = useState({
    metrics: {
      totalProfit: 0,
      totalTrades: 0,
      winRate: 0,
    },
  })

  // Function to reset all user analytics directly from the nav
  const resetAnalytics = () => {
    try {
      // Create a fresh empty data structure
      const emptyUserData = {
        metrics: {
          totalProfit: 0,
          totalTrades: 0,
          winRate: 0,
          averageProfit: 0,
          averageLoss: 0,
          profitFactor: 0,
          mentalStability: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
        },
        mentalScores: [],
        journalEntries: [],
        affirmations: [],
        tradingHistory: [],
      }

      // Save the reset data
      localStorage.setItem("user-data", JSON.stringify(emptyUserData))

      // Also reset session data
      sessionStorage.removeItem("session-initialized")
      localStorage.removeItem("mindtrader-form-data")

      // Update the UI with the reset data
      setUserData({
        metrics: {
          totalProfit: 0,
          totalTrades: 0,
          winRate: 0,
        },
      })

      // Alert the user
      alert("Your data has been reset successfully. The page will now reload.")

      // Force reload the page to ensure all components update
      window.location.reload()
    } catch (error) {
      console.error("Error resetting analytics:", error)
      alert("There was an error resetting your data. Please try again.")
    }
  }

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const storedData = localStorage.getItem("user-data")
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setUserData({
            metrics: {
              totalProfit: parsedData.metrics?.totalProfit || 0,
              totalTrades: parsedData.metrics?.totalTrades || 0,
              winRate: parsedData.metrics?.winRate || 0,
            },
          })
        } catch (error) {
          console.error("Error parsing user data:", error)
          // If there's an error, reset to defaults
          setUserData({
            metrics: {
              totalProfit: 0,
              totalTrades: 0,
              winRate: 0,
            },
          })
        }
      }
    }

    loadUserData()

    // Add event listener for storage changes
    window.addEventListener("storage", loadUserData)

    return () => {
      window.removeEventListener("storage", loadUserData)
    }
  }, [])

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  // Get initials from user name
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/upgrade">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Upgrade Plan</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={resetAnalytics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Reset My Data</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Total Profit:</span>
          <span className="text-sm">${userData?.metrics?.totalProfit || 0}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Total Trades:</span>
          <span className="text-sm">{userData?.metrics?.totalTrades || 0}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium">Win Rate:</span>
          <span className="text-sm">{userData?.metrics?.winRate || 0}%</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
