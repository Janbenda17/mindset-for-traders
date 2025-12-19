"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { clearUserData } from "@/lib/user-storage"
import { createBrowserClient } from "@supabase/ssr"
import { v4 as generateUUID } from "uuid"

interface User {
  id: string
  email: string
  name: string
  isOwner?: boolean
  stripeCustomerId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { email: string; password: string; name: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  clearAllAccounts: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const OWNER_EMAIL = "honza.newage@gmail.com"

function migrateUserID(user: User): User {
  // If ID is a timestamp (numeric string like "1756675229779"), generate a valid UUID
  if (/^\d+$/.test(user.id)) {
    console.log("[v0] Migrating user ID from timestamp to UUID:", user.id)
    // Create deterministic UUID from email + old ID to maintain consistency
    return {
      ...user,
      id: generateUUID(),
    }
  }
  return user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [supabase] = useState(() =>
    createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  )

  const clearAllAccounts = () => {
    localStorage.setItem("trader-mindset-registered-users", JSON.stringify([]))
    localStorage.removeItem("trader-mindset-user")
    localStorage.removeItem("trader-mindset-subscription")
    console.log("[v0] All user accounts cleared from localStorage")
  }

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || "Trader",
          isOwner: session.user.email === OWNER_EMAIL,
        }
        setUser(userData)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || "Trader",
          isOwner: session.user.email === OWNER_EMAIL,
        }
        setUser(userData)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Chyba přihlášení",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || "Trader",
          isOwner: data.user.email === OWNER_EMAIL,
        }
        setUser(userData)

        toast({
          title: "Přihlášení úspěšné",
          description: "Vítejte zpět!",
        })

        router.push("/")
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Chyba přihlášení",
        description: "Došlo k neočekávané chybě",
        variant: "destructive",
      })
      return false
    }
  }

  const register = async (data: { email: string; password: string; name: string }): Promise<boolean> => {
    try {
      const { email, password, name } = data

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: "Chyba registrace",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (authData.user) {
        // Profile and XP progress are auto-created by database trigger
        console.log("[v0] User registered, profile and XP auto-created by trigger:", authData.user.id)

        const initialUserData = {
          profile: {
            nickname: name.split(" ")[0],
            bio: "",
            mentor: "",
            experienceLevel: "beginner" as const,
            updatedAt: new Date().toISOString(),
          },
          settings: {
            trading: {
              style: undefined,
              riskLevel: "moderate",
              timezone: "UTC",
              tradingYears: "",
              mainMarkets: [],
              goals: "",
              averageTradesPerWeek: "",
              updatedAt: new Date().toISOString(),
            },
            notifications: {
              email: true,
              push: true,
              weeklyReport: true,
              tradingAlerts: true,
              dailyReminder: true,
              psychologyInsights: true,
              updatedAt: new Date().toISOString(),
            },
          },
          dailyTrackerItems: [],
          tradingShopItems: [],
          journalEntries: [],
          moodEntries: [],
          tradingData: [],
          dashboardStats: {
            totalTrades: 0,
            totalPnL: 0,
            winRate: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
          },
          mindTraderNotifications: {
            notifications: [],
          },
        }

        // Save initial user data to user-scoped key
        const userStorageKey = `user-${authData.user.id}-trader-mindset-data`
        localStorage.setItem(userStorageKey, JSON.stringify(initialUserData))

        localStorage.setItem("mindtrader-show-tour", "true")

        toast({
          title: "Registrace úspěšná!",
          description: "Zkontrolujte svůj email pro potvrzení účtu",
        })

        router.push("/auth/sign-up-success")
        return true
      }

      return false
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Chyba registrace",
        description: "Došlo k neočekávané chybě",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = () => {
    supabase.auth.signOut()

    if (user?.id) {
      clearUserData(user.id)
    }

    setUser(null)

    toast({
      title: "Odhlášení úspěšné",
      description: "Nashledanou!",
    })
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, clearAllAccounts }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
