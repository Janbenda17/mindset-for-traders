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

  const { user } = useAuth()

  const isPremium = plan === "premium" && isActive

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus()
    }
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
    try {
      const storedCustomerId = localStorage.getItem("stripe-customer-id")

      const response = await fetch("/api/subscription/status", {
        headers: {
          "x-customer-id": storedCustomerId || "",
        },
      })

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
      }
    } catch (error) {
      console.error("Error checking subscription status:", error)
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
    window.location.href = STRIPE_PAYMENT_LINK
    return true
  }

  const cancelSubscription = async (): Promise<boolean> => {
    if (!subscriptionId) {
      await openBillingPortal()
      return true
    }

    setIsLoading(true)
    try {
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
