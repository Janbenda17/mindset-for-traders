"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { clearUserData } from "@/lib/user-storage"
import { createClient } from "@/lib/supabase/client"
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
  if (/^\d+$/.test(user.id)) {
    console.log("[v0] Migrating user ID from timestamp to UUID:", user.id)
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

  const supabase = useMemo(() => createClient(), [])

  const clearAllAccounts = () => {
    localStorage.setItem("trader-mindset-registered-users", JSON.stringify([]))
    localStorage.removeItem("trader-mindset-user")
    localStorage.removeItem("trader-mindset-subscription")
    console.log("[v0] All user accounts cleared from localStorage")
  }

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[v0] Checking authentication state...")

      await new Promise((resolve) => setTimeout(resolve, 50))

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("[v0] User authenticated:", session.user.email)
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || "Trader",
          isOwner: session.user.email === OWNER_EMAIL,
        }
        setUser(userData)
      } else {
        console.log("[v0] No authenticated user found")
      }
      setIsLoading(false)
    }

    checkAuth()

    let debounceTimer: NodeJS.Timeout | null = null

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && debounceTimer) {
        return // Skip redundant SIGNED_IN if already processing
      }

      console.log("[v0] Auth state changed:", event)

      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      debounceTimer = setTimeout(() => {
        if (session?.user) {
          console.log("[v0] Setting user from auth state change:", session.user.email)
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || "Trader",
            isOwner: session.user.email === OWNER_EMAIL,
          }
          setUser(userData)
        } else {
          console.log("[v0] Clearing user - no session")
          setUser(null)
        }
      }, 300)
    })

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      subscription.unsubscribe()
    }
  }, [supabase]) // Only supabase in dependency (memoized singleton)

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("[v0] Attempting login for:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Login error:", error.message)
        toast({
          title: "Chyba přihlášení",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (data.user) {
        console.log("[v0] Login successful, setting user state")
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

        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/")
        return true
      }

      return false
    } catch (error) {
      console.error("[v0] Login error:", error)
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

      console.log("[v0] Starting registration process for:", email)

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        console.error("[v0] Supabase registration error:", {
          code: error.code,
          message: error.message,
          status: error.status,
        })

        let errorMessage = error.message
        if (error.status === 504) {
          errorMessage = "Server timeout - zkuste to prosím znovu za chvíli"
        } else if (error.message.includes("already registered")) {
          errorMessage = "Tento email je již registrován. Zkuste se přihlásit."
        }

        toast({
          title: "Chyba registrace",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }

      if (!authData.user) {
        console.error("[v0] No user returned from signUp")
        toast({
          title: "Chyba registrace",
          description: "Nepodařilo se vytvořit uživatele",
          variant: "destructive",
        })
        return false
      }

      console.log("[v0] User created successfully:", authData.user.id)

      if (!authData.session) {
        console.log("[v0] No session - waiting for email confirmation or auth callback")
        toast({
          title: "Registrace úspěšná",
          description: "Účet byl vytvořen. Přihlašuji...",
        })

        await new Promise((resolve) => setTimeout(resolve, 2000))

        router.push("/onboarding")
        return true
      }

      console.log("[v0] Session active, waiting for profile creation...")
      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        attempts++
        const waitTime = Math.min(500 * attempts, 3000)

        await new Promise((resolve) => setTimeout(resolve, waitTime))

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, onboarding_completed")
          .eq("user_id", authData.user.id)
          .maybeSingle()

        if (profileError) {
          console.error(`[v0] Profile check error (attempt ${attempts}):`, profileError)
          continue
        }

        profile = profileData

        if (profile) {
          console.log("[v0] Profile found after", attempts, "attempts")
          break
        }

        console.log(`[v0] Waiting for profile (attempt ${attempts}/${maxAttempts})`)
      }

      if (!profile) {
        console.warn("[v0] Profile not created yet after", maxAttempts, "attempts - continuing anyway")
      }

      const userStorageKey = `user-${authData.user.id}-trader-mindset-data`
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
      localStorage.setItem(userStorageKey, JSON.stringify(initialUserData))
      localStorage.setItem("mindtrader-show-tour", "true")

      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
        isOwner: authData.user.email === OWNER_EMAIL,
      }
      setUser(userData)

      console.log("[v0] Registration complete - redirecting to onboarding")
      toast({
        title: "Registrace úspěšná!",
        description: "Vítejte v MindTrader!",
      })

      router.push("/onboarding")
      return true
    } catch (error: any) {
      console.error("[v0] Registration unexpected error:", {
        message: error?.message,
        name: error?.name,
      })

      toast({
        title: "Chyba registrace",
        description: "Došlo k neočekávané chybě. Zkuste to prosím znovu.",
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
    if (typeof window === "undefined") {
      return {
        user: null,
        login: async () => false,
        register: async () => false,
        logout: () => {},
        isLoading: true,
        clearAllAccounts: () => {},
      }
    }
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
