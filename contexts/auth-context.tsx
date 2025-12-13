"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { resetDemoAccount } from "@/utils/demo-reset"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const OWNER_EMAIL = "honza.newage@gmail.com"
const DEMO_EMAIL = "Demo"
const DEMO_PASSWORD = "Demo"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem("trader-mindset-user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Check if it's the owner
        if (parsedUser.email === OWNER_EMAIL) {
          parsedUser.isOwner = true
        }
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("trader-mindset-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        resetDemoAccount()

        const userData = {
          id: "demo",
          email: DEMO_EMAIL,
          name: "Demo User",
          isOwner: false,
        }

        setUser(userData)
        localStorage.setItem("trader-mindset-user", JSON.stringify(userData))

        // Set premium subscription for Demo account
        const subscriptionData = {
          plan: "premium",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }
        localStorage.setItem("trader-mindset-subscription", JSON.stringify(subscriptionData))

        localStorage.setItem("trading-mode", "live")

        // Mark onboarding as completed
        localStorage.setItem("trader-mindset-onboarding-completed", "true")

        // Set flag to show ProductTour
        localStorage.setItem("mindtrader-show-tour", "true")
        localStorage.removeItem("mindtrader-product-tour-completed")

        console.log("[v0] Demo login: Premium active, tour enabled, redirecting to dashboard")

        toast({
          title: "Demo režim aktivován",
          description: "Premium přístup odemčen. Spustí se produktová prohlídka.",
        })

        router.push("/")
        return true
      }

      // Special handling for owner account
      if (email === OWNER_EMAIL) {
        const userData = {
          id: "owner",
          email: OWNER_EMAIL,
          name: "Honza (Owner)",
          isOwner: true,
        }

        setUser(userData)
        localStorage.setItem("trader-mindset-user", JSON.stringify(userData))

        // Set premium subscription automatically for owner
        const subscriptionData = {
          plan: "premium",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        }
        localStorage.setItem("trader-mindset-subscription", JSON.stringify(subscriptionData))

        toast({
          title: "Vítejte zpět, Honza!",
          description: "Přihlášen jako Owner s plnými právy",
        })

        router.push("/")
        return true
      }

      // Regular user login
      const registeredUsers = JSON.parse(localStorage.getItem("trader-mindset-registered-users") || "[]")
      const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          isOwner: false,
          stripeCustomerId: foundUser.stripeCustomerId,
        }

        setUser(userData)
        localStorage.setItem("trader-mindset-user", JSON.stringify(userData))

        toast({
          title: "Přihlášení úspěšné",
          description: "Vítejte zpět!",
        })

        // Check if onboarding is completed
        const onboardingCompleted = localStorage.getItem("trader-mindset-onboarding-completed")
        if (onboardingCompleted === "true") {
          router.push("/")
        } else {
          router.push("/onboarding")
        }
        return true
      } else {
        toast({
          title: "Chyba přihlášení",
          description: "Nesprávný email nebo heslo",
          variant: "destructive",
        })
        return false
      }
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

      // Prevent registration with owner email
      if (email === OWNER_EMAIL) {
        toast({
          title: "Chyba registrace",
          description: "Tento email je rezervován",
          variant: "destructive",
        })
        return false
      }

      // Get existing users
      const registeredUsers = JSON.parse(localStorage.getItem("trader-mindset-registered-users") || "[]")

      // Check if user already exists
      if (registeredUsers.some((u: any) => u.email === email)) {
        toast({
          title: "Chyba registrace",
          description: "Uživatel s tímto emailem již existuje",
          variant: "destructive",
        })
        return false
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        stripeCustomerId: `cus_${Date.now()}`,
      }

      // Save to registered users
      registeredUsers.push(newUser)
      localStorage.setItem("trader-mindset-registered-users", JSON.stringify(registeredUsers))

      // Auto login
      const userData = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isOwner: false,
        stripeCustomerId: newUser.stripeCustomerId,
      }

      setUser(userData)
      localStorage.setItem("trader-mindset-user", JSON.stringify(userData))

      localStorage.setItem("mindtrader-show-tour", "true")

      toast({
        title: "Registrace úspěšná!",
        description: "Vítejte v MindTrader!",
      })

      // Redirect to onboarding
      router.push("/onboarding")
      return true
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
    setUser(null)
    localStorage.removeItem("trader-mindset-user")
    localStorage.removeItem("trader-mindset-subscription")
    localStorage.removeItem("stripe-customer-id")
    localStorage.removeItem("trader-mindset-onboarding-completed")
    toast({
      title: "Odhlášení úspěšné",
      description: "Nashledanou!",
    })
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
