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
        let userFriendlyMessage = error.message

        if (error.message.includes("Invalid login credentials")) {
          userFriendlyMessage = "Email nebo heslo je nesprávné. Ověřte prosím své údaje nebo se zaregistrujte."
        } else if (error.message.includes("Email not confirmed")) {
          userFriendlyMessage = "Prosím potvrďte svůj email před přihlášením."
        } else if (error.status === 429) {
          userFriendlyMessage = "Příliš mnoho pokusů o přihlášení. Zkuste to za chvíli znovu."
        }

        console.error("[v0] Login error:", error.message)
        toast({
          title: "Chyba přihlášení",
          description: userFriendlyMessage,
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
          emailRedirectTo: undefined, // Disable email confirmation
        },
      })

      if (error) {
        console.error("[v0] Supabase registration error:", {
          code: error.code,
          message: error.message,
          status: error.status,
          name: error.name,
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
      console.log("[v0] Session status:", authData.session ? "Active" : "No session (email confirmation required)")

      if (!authData.session) {
        console.log("[v0] No session - email confirmation required")
        toast({
          title: "Potvrďte email",
          description: "Na váš email byl odeslán odkaz k potvrzení účtu. Po kliknutí na odkaz budete moci pokračovat.",
        })
        router.push("/auth/sign-up-success")
        return true
      }

      console.log("[v0] Waiting for profile creation...")
      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        attempts++
        const waitTime = Math.min(300 * attempts, 2000)

        await new Promise((resolve) => setTimeout(resolve, waitTime))

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, onboarding_completed")
          .eq("user_id", authData.user.id)
          .maybeSingle()

        if (profileError) {
          console.error(`[v0] Profile check error (attempt ${attempts}):`, profileError)
        }

        profile = profileData

        if (profile) {
          console.log("[v0] Profile found after", attempts, "attempts:", profile)
          break
        }

        console.log(`[v0] Profile not found yet (attempt ${attempts}/${maxAttempts})`)
      }

      if (!profile) {
        console.error("[v0] Profile was not created by database trigger after", maxAttempts, "attempts")
        toast({
          title: "Chyba registrace",
          description: "Profil se nepodařilo vytvořit. Kontaktujte podporu.",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        return false
      }

      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
        isOwner: authData.user.email === OWNER_EMAIL,
      }
      setUser(userData)

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
        stack: error?.stack,
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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
