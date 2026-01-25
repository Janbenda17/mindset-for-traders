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
      console.log("[v0] Email:", email)
      console.log("[v0] Password length:", password.length)
      console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "❌")
      console.log("[v0] Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "❌")

      console.log("[v0] Volání supabase.auth.signInWithPassword()...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Response od signIn:", { hasError: !!error, hasUser: !!data.user, hasSession: !!data.session })

      if (error) {
        console.error("[v0] ❌ LOGIN ERROR:", {
          message: error.message,
          status: error.status,
        })
        toast({
          title: "Chyba přihlášení",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (!data.user || !data.session) {
        console.error("[v0] ❌ Žádný user nebo session vrácen")
        console.error("[v0] User:", !!data.user, "Session:", !!data.session)
        toast({
          title: "Chyba přihlášení",
          description: "Selhalo vytvoření session",
          variant: "destructive",
        })
        return false
      }

      console.log("[v0] ✅ Login úspěšný - session vytvořena")
      console.log("[v0] User ID:", data.user.id)
      console.log("[v0] Token (first 10 chars):", data.session.access_token.slice(0, 10))

      const userData = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Trader",
      }
      lastUserIdRef.current = data.user.id
      setUser(userData)
      migrateLegacyKeys(data.user.id)

      toast({
        title: "Přihlášení úspěšné",
        description: "Vítejte zpět!",
      })

      console.log("[v0] Čekám 500ms na synchronizaci cookies...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log("[v0] Ověření session:", {
        hasSession: !!sessionData.session,
        sessionError: sessionError?.message,
      })

      if (sessionData.session) {
        console.log("[v0] ✅ Session ověřena - kontroluji onboarding status...")
        
        // Check if user needs to complete onboarding
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", data.user.id)
          .maybeSingle()

        const needsOnboarding = !profileData?.onboarding_completed

        // Wait a moment more for React state to update
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        if (needsOnboarding) {
          console.log("[v0] User potřebuje onboarding - redirect na /onboarding")
          router.push("/onboarding")
        } else {
          console.log("[v0] User má hotový onboarding - redirect na /")
          router.push("/")
        }
      } else {
        console.log("[v0] ⚠️ Session chybí - přesto redirect na /")
        await new Promise((resolve) => setTimeout(resolve, 300))
        router.push("/")
      }

      return true
    } catch (error) {
      console.error("[v0] ===== LOGIN ERROR =====")
      console.error("[v0] Error type:", error?.constructor?.name)
      console.error("[v0] Message:", error?.message)
      console.error("[v0] Stack:", error?.stack)
      
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

      console.log("[v0] ===== REGISTRACE START =====")
      console.log("[v0] Email:", email)
      console.log("[v0] Name:", name)
      console.log("[v0] Password length:", password.length)
      console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓" : "❌")
      console.log("[v0] Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓" : "❌")

      console.log("[v0] Volání supabase.auth.signUp()...")
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: undefined,
        },
      })

      console.log("[v0] Response od signUp:", { hasError: !!error, hasUser: !!authData.user })

      if (error) {
        console.error("[v0] ❌ SIGNUP ERROR:", {
          message: error.message,
          status: error.status,
          code: error.status,
        })

        let errorMessage = error.message
        
        // Specifické error messages
        if (error.status === 504) {
          errorMessage = "Server timeout - zkuste to prosím znovu za chvíli"
        } else if (error.message.includes("already registered")) {
          errorMessage = "Tento email je již registrován. Zkuste se přihlásit."
        } else if (error.message.includes("Password should contain")) {
          errorMessage = "Heslo musí obsahovat: malá písmena + velká písmena + čísla (min. 6 znaků). Např: Trader2024"
        } else if (error.message.includes("password")) {
          errorMessage = "Heslo nesplňuje požadavky. Zkontrolujte, zda obsahuje malá a velká písmena a čísla."
        } else if (error.message.includes("email")) {
          errorMessage = "Neplatný email nebo email již existuje."
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
      console.log("[v0] Čekám na profil v databázi...")

      let profile = null
      let attempts = 0
      const maxAttempts = 10

      while (!profile && attempts < maxAttempts) {
        attempts++
        const delay = Math.min(500 * attempts, 3000)
        console.log(`[v0] Pokus ${attempts}/${maxAttempts} - čekání ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, onboarding_completed")
          .eq("user_id", authData.user.id)
          .maybeSingle()

        if (profileError) {
          console.error(`[v0] Profil query error:`, profileError.message)
        }

        profile = profileData
        if (profile) {
          console.log("[v0] ✅ Profil nalezen!")
          break
        }
      }

      if (!profile) {
        console.warn("[v0] ⚠️ Profil se nenašel ani po 10 pokusech")
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

      console.log("[v0] Čekám na synchronizaci cookies...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("[v0] ✅ Registrace HOTOVA - redirect na /onboarding")
      window.location.href = "/onboarding"
      return true
    } catch (error: any) {
      console.error("[v0] ===== REGISTRACE ERROR =====")
      console.error("[v0] Error type:", error?.constructor?.name)
      console.error("[v0] Message:", error?.message)
      console.error("[v0] Stack:", error?.stack)
      
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
    const userEmail = user?.email

    if (userId) {
      console.log(`[v0] Logout: clearing data for userId=${userId}, email=${userEmail}`)
      clearUserScoped(userId)
      localStorage.removeItem("gamification-data")
      localStorage.removeItem(`mindtrader:${userId}:mode`)
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
