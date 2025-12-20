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
      console.log("[v0] Checking authentication state...")

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
        console.error("[v0] Registration error:", error)
        toast({
          title: "Chyba registrace",
          description: error.message,
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

      console.log("[v0] User created:", authData.user.id)
      console.log("[v0] Session:", authData.session ? "Active" : "Waiting for email confirmation")

      if (!authData.session) {
        console.warn("[v0] No session created - email confirmation may be required")
        toast({
          title: "Ověřte email",
          description: "Na váš email byl odeslán odkaz k potvrzení účtu",
        })
        router.push("/auth/sign-up-success")
        return true
      }

      // Wait for profile creation
      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        attempts++
        const waitTime = Math.min(500 * attempts, 3000)

        console.log(`[v0] Checking profile existence (attempt ${attempts}/${maxAttempts})...`)

        await new Promise((resolve) => setTimeout(resolve, waitTime))

        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", authData.user.id)
          .maybeSingle()

        profile = profileData

        if (profile) {
          console.log("[v0] Profile successfully created by trigger!")
          break
        }
      }

      if (!profile) {
        console.error("[v0] Profile creation failed - trigger did not execute after", maxAttempts, "attempts")
        toast({
          title: "Chyba registrace",
          description: "Nepodařilo se vytvořit profil. Zkuste to znovu.",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        return false
      }

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

      const userStorageKey = `user-${authData.user.id}-trader-mindset-data`
      localStorage.setItem(userStorageKey, JSON.stringify(initialUserData))

      localStorage.setItem("mindtrader-show-tour", "true")

      toast({
        title: "Registrace úspěšná!",
        description: "Tvůj účet byl vytvořen",
      })

      console.log("[v0] Registration complete, redirecting to onboarding")
      router.push("/onboarding")
      return true
    } catch (error) {
      console.error("[v0] Registration error:", error)
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
