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
    const MAX_RETRIES = 6
    let attempt = 0

    const attemptLogin = async (): Promise<boolean> => {
      try {
        console.log(`[v0] ===== PŘIHLÁŠENÍ START (pokus ${attempt + 1}/${MAX_RETRIES}) =====`)
        console.log("[v0] Email:", email)

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("[v0] ❌ LOGIN ERROR:", error.message)
          
          // Check if rate limited - retry automatically with LONGER waits
          if (error.message.includes("rate limit") || error.message.includes("too many")) {
            attempt++
            if (attempt < MAX_RETRIES) {
              // Exponential backoff: 5s, 10s, 20s, 40s, 60s
              const waitTime = Math.pow(2, attempt - 1) * 5000
              console.log(`[v0] Rate limit - čekám ${Math.round(waitTime / 1000)}s před pokusem ${attempt + 1}/${MAX_RETRIES}...`)
              await new Promise((resolve) => setTimeout(resolve, waitTime))
              return attemptLogin()
            } else {
              console.error("[v0] ❌ Všechny pokusy o přihlášení selhaly kvůli rate limitu")
            }
          }
          
          throw error
        }

        if (!data.user || !data.session) {
          console.error("[v0] ❌ Žádný user nebo session vrácen")
          throw new Error("NO_USER_OR_SESSION")
        }

        console.log("[v0] ✅ Přihlášení úspěšné:", data.user.email)

        const userData = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "Trader",
        }
        lastUserIdRef.current = data.user.id
        setUser(userData)

        await new Promise((resolve) => setTimeout(resolve, 300))

        console.log("[v0] Redirect na domovskou stránku /")
        router.push("/")

        return true
      } catch (error) {
        console.error("[v0] LOGIN ERROR:", error instanceof Error ? error.message : String(error))
        throw error
      }
    }

    return attemptLogin()
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

      // Start 14-day free trial automatically
      console.log("[v0] Zahajuji 14denní free trial...")
      try {
        const trialResponse = await fetch("/api/subscription/start-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: authData.user.id }),
        })

        if (trialResponse.ok) {
          const trialData = await trialResponse.json()
          console.log("[v0] ✅ Trial zahájen:", trialData.trialEndsAt)
        } else {
          console.error("[v0] ❌ Chyba při zahájení trialu")
        }
      } catch (trialError) {
        console.error("[v0] ❌ Trial request error:", trialError)
      }

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
