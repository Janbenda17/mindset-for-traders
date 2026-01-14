"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { clearUserData } from "@/lib/user-storage"
import { supabase } from "@/lib/supabase/browser"

interface User {
  id: string
  email: string
  name: string
  stripeCustomerId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { email: string; password: string; name: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  authReady: boolean // New flag to indicate auth initialization is complete
  clearAllAccounts: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false) // Track auth initialization
  const router = useRouter()

  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const lastUserIdRef = useRef<string | null>(null)

  const clearAllAccounts = () => {
    localStorage.setItem("trader-mindset-registered-users", JSON.stringify([]))
    localStorage.removeItem("trader-mindset-user")
    localStorage.removeItem("trader-mindset-subscription")
    console.log("[v0] All user accounts cleared from localStorage")
  }

  useEffect(() => {
    if (subscriptionRef.current) {
      return
    }

    let isMounted = true

    const initAuth = async () => {
      console.log("[v0] Initializing auth...")

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("[v0] Error getting session:", error.message)
        }

        if (isMounted && session?.user) {
          console.log("[v0] Initial session found:", session.user.email)
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Trader",
          }
          lastUserIdRef.current = session.user.id
          setUser(userData)
        } else if (isMounted) {
          console.log("[v0] No authenticated user")
        }

        if (isMounted) {
          setIsLoading(false)
          setAuthReady(true)
        }
      } catch (err) {
        console.error("[v0] Auth init error:", err)
        if (isMounted) {
          setIsLoading(false)
          setAuthReady(true)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === "INITIAL_SESSION") {
        return
      }

      if (event === "SIGNED_IN" && session?.user?.id === lastUserIdRef.current) {
        return
      }

      console.log("[v0] Auth state changed:", event, session?.user?.email ? `(${session.user.email})` : "")

      if (event === "SIGNED_IN" && session?.user) {
        lastUserIdRef.current = session.user.id
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Trader",
        }
        setUser(userData)
      } else if (event === "SIGNED_OUT") {
        lastUserIdRef.current = null
        setUser(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        lastUserIdRef.current = session.user.id
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Trader",
        })
      }
    })

    subscriptionRef.current = subscription

    return () => {
      isMounted = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, []) // Empty deps - singleton subscription runs once only

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
        console.log("[v0] Login successful")
        const userData = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Trader",
        }
        lastUserIdRef.current = data.user.id
        setUser(userData)

        toast({
          title: "Přihlášení úspěšné",
          description: "Vítejte zpět!",
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
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
          data: { name },
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        console.error("[v0] Supabase registration error:", error.message)

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
        toast({
          title: "Chyba registrace",
          description: "Nepodařilo se vytvořit uživatele",
          variant: "destructive",
        })
        return false
      }

      console.log("[v0] User created successfully:", authData.user.id)

      if (!authData.session) {
        toast({
          title: "Registrace úspěšná",
          description: "Účet byl vytvořen. Přihlašuji...",
        })
        await supabase.auth.getSession()
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.push("/onboarding")
        return true
      }

      // Wait for profile creation
      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        attempts++
        await new Promise((resolve) => setTimeout(resolve, Math.min(500 * attempts, 3000)))

        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, onboarding_completed")
          .eq("user_id", authData.user.id)
          .maybeSingle()

        profile = profileData
        if (profile) break
      }

      lastUserIdRef.current = authData.user.id
      setUser({
        id: authData.user.id,
        email: authData.user.email!,
        name,
      })

      toast({
        title: "Registrace úspěšná!",
        description: "Vítejte v MindTrader!",
      })

      await supabase.auth.getSession()
      router.push("/onboarding")
      return true
    } catch (error: any) {
      console.error("[v0] Registration unexpected error:", error?.message)
      toast({
        title: "Chyba registrace",
        description: "Došlo k neočekávané chybě. Zkuste to prosím znovu.",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = () => {
    const userId = user?.id

    supabase.auth.signOut()

    console.log("[v0] Logout - clearing user state")
    lastUserIdRef.current = null
    setUser(null)

    if (userId) {
      clearUserData(userId)
      localStorage.removeItem("gamification-data")
      localStorage.removeItem(`mindtrader:${userId}:mode`)
    }

    toast({
      title: "Odhlášení úspěšné",
      description: "Nashledanou!",
    })
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, authReady, clearAllAccounts }}>
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
        authReady: false,
        clearAllAccounts: () => {},
      }
    }
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
