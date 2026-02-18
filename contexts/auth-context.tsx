"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { clearUserScoped, migrateLegacyKeys } from "@/lib/storage"
import { getBrowserSupabase } from "@/lib/supabase/browser"

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
  resetPassword: (email: string) => Promise<boolean>
  isLoading: boolean
  authReady: boolean
  clearAllAccounts: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const IS_DEV = typeof window !== "undefined" && window.location.hostname === "localhost"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const router = useRouter()

  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const lastUserIdRef = useRef<string | null>(null)

  const supabase = getBrowserSupabase()

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
          if (IS_DEV) {
            console.log(
              `[v0] Auth sanity check: userId=${session.user.id}, email=${session.user.email}, token=${session.access_token?.slice(0, 10)}...`,
            )
          }
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Trader",
          }
          lastUserIdRef.current = session.user.id
          setUser(userData)
          migrateLegacyKeys(session.user.id)
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

      if (IS_DEV) {
        console.log(
          `[v0] Auth state change: event=${event}, userId=${session?.user?.id || "none"}, email=${session?.user?.email || "none"}, token=${session?.access_token?.slice(0, 10) || "none"}...`,
        )
      }

      if (event === "INITIAL_SESSION") {
        return
      }

      if (event === "SIGNED_IN" && session?.user?.id === lastUserIdRef.current) {
        return
      }

      if (event === "SIGNED_OUT") {
        if (lastUserIdRef.current) {
          console.log(`[v0] SIGNED_OUT: Clearing data for userId=${lastUserIdRef.current}`)
          clearUserScoped(lastUserIdRef.current)
        }
        lastUserIdRef.current = null
        setUser(null)
        return
      }

      console.log("[v0] Auth state changed:", event, session?.user?.email ? `(${session.user.email})` : "")

      if (event === "SIGNED_IN" && session?.user) {
        if (lastUserIdRef.current && lastUserIdRef.current !== session.user.id) {
          console.log(
            `[v0] User switch detected: ${lastUserIdRef.current} -> ${session.user.id}, clearing old user data`,
          )
          clearUserScoped(lastUserIdRef.current)
        }

        lastUserIdRef.current = session.user.id
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Trader",
        }
        setUser(userData)
        migrateLegacyKeys(session.user.id)
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
  }, [supabase])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("[v0] ===== PŘIHLÁŠENÍ START =====")

      // Call our server-side login endpoint instead of Supabase directly
      // This avoids Supabase rate limiting
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include", // IMPORTANT: Send and receive cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[v0] LOGIN ERROR:", result.error)
        throw new Error(result.error)
      }

      if (!result.user || !result.session) {
        console.error("[v0] Žádný user nebo session")
        throw new Error("NO_USER_OR_SESSION")
      }

      console.log("[v0] ✅ Přihlášení úspěšné - nastavuji session do Supabase client")
      
      // Set the session in Supabase client so subsequent calls work
      await supabase.auth.setSession(result.session)

      const userData = {
        id: result.user.id,
        email: result.user.email!,
        name: result.user.user_metadata?.name || result.user.email?.split("@")[0] || "Trader",
      }
      lastUserIdRef.current = result.user.id
      setUser(userData)

      await new Promise((resolve) => setTimeout(resolve, 300))
      router.push("/")

      return true
    } catch (error) {
      console.error("[v0] LOGIN ERROR:", error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  const register = async (data: { email: string; password: string; name: string }): Promise<boolean> => {
    try {
      const { email, password, name } = data

      console.log("[v0] ===== REGISTRACE START =====")
      console.log("[v0] Email:", email)
      console.log("[v0] Name:", name)
      console.log("[v0] Password length:", password.length)

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: undefined,
        },
      })

      console.log("[v0] Response od signUp:", { hasError: !!error, hasUser: !!authData.user, hasSession: !!authData.session })

      if (error) {
        console.error("[v0] ❌ SIGNUP ERROR:", {
          message: error.message,
          status: error.status,
        })

        let errorMessage = error.message
        if (error.message.includes("already registered")) {
          errorMessage = "Tento email je již registrován. Zkuste se přihlásit."
        } else if (error.message.includes("Password should contain")) {
          errorMessage = "Heslo musí obsahovat: malá písmena + velká písmena + čísla (min. 6 znaků)."
        }

        toast({
          title: "Chyba registrace",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }

      if (!authData.user) {
        console.error("[v0] ❌ Žádný user vrácen od signUp")
        toast({
          title: "Chyba registrace",
          description: "Nepodařilo se vytvořit uživatele",
          variant: "destructive",
        })
        return false
      }

      console.log("[v0] ✅ User vytvořen:", authData.user.id)
      console.log("[v0] Session status:", authData.session ? "✅ Session je" : "❌ Session chybí")

      // If we have a session, set it properly
      if (authData.session) {
        console.log("[v0] Nastavuji session...")
        await supabase.auth.setSession(authData.session)
      }

      // Set the user state immediately
      lastUserIdRef.current = authData.user.id
      setUser({
        id: authData.user.id,
        email: authData.user.email!,
        name: name || "Trader",
      })

      // Wait for profile to be created by trigger
      console.log("[v0] Čekám na profil v databázi...")
      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        attempts++
        const delay = Math.min(300 * attempts, 2000)
        await new Promise((resolve) => setTimeout(resolve, delay))

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, onboarding_completed")
          .eq("user_id", authData.user.id)
          .maybeSingle()

        if (!profileError) {
          profile = profileData
          if (profile) {
            console.log("[v0] ✅ Profil nalezen!")
            break
          }
        }
      }

      // Nový uživatel má pouze FREE verzi (bez trial)
      console.log("[v0] Nový uživatel - nastavuji FREE verzi bez trial...")

      toast({
        title: "Registrace úspěšná!",
        description: "Vítejte v MindTrader!",
      })

      console.log("[v0] ✅ Registrace HOTOVA - redirect na /onboarding")
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/onboarding")
      return true
    } catch (error: any) {
      console.error("[v0] ===== REGISTRACE ERROR =====")
      console.error("[v0] Error type:", error?.constructor?.name)
      console.error("[v0] Message:", error?.message)

      toast({
        title: "Chyba registrace",
        description: "Došlo k neočekávané chybě. Zkuste to prosím znovu.",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = () => {
    // Clear cookies and session
    supabase.auth.signOut().catch((err) => console.error("[v0] Logout error:", err))

    console.log("[v0] Logout - clearing user state")
    lastUserIdRef.current = null
    setUser(null)

    toast({
      title: "Odhlášení úspěšné",
      description: "Nashledanou!",
    })

    window.location.href = "/auth/login"
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      console.log("[v0] Resetting password for:", email)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("[v0] Password reset error:", error.message)
        toast({
          title: "Chyba",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      console.log("[v0] Password reset email sent successfully")
      toast({
        title: "Email poslán",
        description: "Podívejte se do své emailové schránky pro pokyny k obnovení hesla",
      })
      return true
    } catch (error) {
      console.error("[v0] Password reset error:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se poslat email pro obnovení hesla",
        variant: "destructive",
      })
      return false
    }
  }

    supabase.auth.signOut()

    console.log("[v0] Logout - clearing user state")
    lastUserIdRef.current = null
    setUser(null)

    toast({
      title: "Odhlášení úspěšné",
      description: "Nashledanou!",
    })

    window.location.href = "/auth/login"
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, isLoading, authReady, clearAllAccounts }}>
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
        resetPassword: async () => false,
        isLoading: true,
        authReady: false,
        clearAllAccounts: () => {},
      }
    }
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
