"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface SubscriptionContextType {
  plan: "free" | "premium"
  daysRemaining: number
  isActive: boolean
  isPremium: boolean
  isLoading: boolean
  trialEndsAt: string | null
  subscriptionId: string | null
  customerId: string | null
  subscribe: (plan: "free" | "premium") => Promise<boolean>
  startTrial: () => Promise<boolean>
  upgradeToPremium: () => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
  openBillingPortal: () => Promise<void>
  checkSubscriptionStatus: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJe28sguAbri1noczO1B600"
const STRIPE_BILLING_PORTAL = "https://billing.stripe.com/p/login/test_00g5kFbKe1Oy8qk000"

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<"free" | "premium">("free")
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  const { user, authReady } = useAuth() // Get authReady flag

  const isPremium = plan === "premium" && isActive

  useEffect(() => {
    if (authReady && user) {
      checkSubscriptionStatus()
    }
  }, [authReady, user])

  // Also refresh subscription status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        checkSubscriptionStatus()
      }
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCustomerId = localStorage.getItem("stripe-customer-id")
      if (storedCustomerId) {
        setCustomerId(storedCustomerId)
      }
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscription/status", {
        credentials: "include", // Ensure cookies are sent
      })

      if (response.status === 401) {
        console.log("[v0] Subscription check: Not authenticated")
        setIsLoading(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setPlan(data.plan)
        setIsActive(data.isActive)
        setTrialEndsAt(data.trialEndsAt)
        setSubscriptionId(data.subscriptionId)

        if (data.customerId) {
          setCustomerId(data.customerId)
          localStorage.setItem("stripe-customer-id", data.customerId)
        }

        if (data.trialEndsAt) {
          const endDate = new Date(data.trialEndsAt)
          const now = new Date()
          const diffTime = endDate.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setDaysRemaining(Math.max(0, diffDays))
        }

        console.log("[v0] Subscription status checked:", data.plan, "isPremium:", data.isActive)
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("[v0] Error checking subscription status:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const subscribe = async (planType: "free" | "premium"): Promise<boolean> => {
    if (planType === "free") return true
    window.location.href = STRIPE_PAYMENT_LINK
    return true
  }

  const startTrial = async (): Promise<boolean> => {
    window.location.href = STRIPE_PAYMENT_LINK
    return true
  }

  const upgradeToPremium = async (): Promise<boolean> => {
    if (!user) {
      console.log("[v0] Upgrade: User not authenticated")
      return false
    }

    try {
      setIsLoading(true)
      console.log("[v0] Upgrade: Creating checkout session for", user.email)
      
      // Call the create-checkout endpoint to get redirect URL
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          plan: "premium"
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Upgrade: API error:", errorData.error)
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const data = await response.json()
      console.log("[v0] Upgrade: Got checkout URL:", data.url ? "✓" : "✗")

      if (data.url) {
        // Open checkout in new tab
        window.open(data.url, "_blank")
        return true
      }

      return false
    } catch (error) {
      console.error("[v0] Upgrade error:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se otevřít checkout. Zkuste to prosím později.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      // If user has a Stripe subscription, cancel via Stripe
      if (subscriptionId) {
        const response = await fetch("/api/subscription/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId }),
        })

        if (response.ok) {
          toast({
            title: "Předplatné zrušeno",
            description: "Vaše předplatné bude zrušeno na konci aktuálního období.",
          })
          await checkSubscriptionStatus()
          return true
        }
        return false
      }

      // If user is on trial (no Stripe subscription), cancel trial via API
      const response = await fetch("/api/subscription/cancel-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Trial zrušen",
          description: "Váš zkušební přístup byl zrušen.",
        })
        await checkSubscriptionStatus()
        return true
      }

      return false
    } catch (error) {
      console.error("Cancel subscription error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const openBillingPortal = async () => {
    setIsLoading(true)
    try {
      // If we have a customerId, try to create a portal session
      if (customerId) {
        const response = await fetch("/api/subscription/billing-portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        })

        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
      }

      toast({
        title: "Přesměrování",
        description: "Budete přesměrováni na Stripe pro správu předplatného.",
      })
      window.location.href = STRIPE_PAYMENT_LINK
    } catch (error) {
      console.error("Billing portal error:", error)
      window.location.href = STRIPE_PAYMENT_LINK
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        daysRemaining,
        isActive,
        isPremium,
        isLoading,
        trialEndsAt,
        subscriptionId,
        customerId,
        subscribe,
        startTrial,
        upgradeToPremium,
        cancelSubscription,
        openBillingPortal,
        checkSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        plan: "free" as const,
        daysRemaining: 0,
        isActive: false,
        isPremium: false,
        isLoading: true,
        trialEndsAt: null,
        subscriptionId: null,
        customerId: null,
        subscribe: async () => false,
        startTrial: async () => false,
        upgradeToPremium: async () => false,
        cancelSubscription: async () => false,
        openBillingPortal: async () => {},
        checkSubscriptionStatus: async () => {},
      }
    }
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
