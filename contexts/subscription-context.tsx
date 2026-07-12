"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface SubscriptionContextType {
  plan: "free" | "premium"
  isActive: boolean
  isPremium: boolean
  isLoading: boolean
  isTrialing: boolean
  trialDaysLeft: number
  // True only after a subscription status fetch has SUCCESSFULLY completed.
  // A failed/aborted fetch leaves isActive=false, which is indistinguishable
  // from a confirmed free user — consumers (e.g. live-mode auto-revert) must
  // wait for this before acting on a "not premium" state, otherwise a single
  // API hiccup would wrongly downgrade a paying user.
  statusConfirmed: boolean
  isCanceled: boolean
  subscriptionId: string | null
  customerId: string | null
  subscriptionStatus: string | null
  subscribe: (plan: "free" | "premium") => Promise<boolean>
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
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [statusConfirmed, setStatusConfirmed] = useState(false)
  const [isCanceled, setIsCanceled] = useState(false)
  const [isTrialing, setIsTrialing] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)

  const { user, authReady } = useAuth()

  // isPremium is true if isActive (which comes from API and checks is_premium flag in DB)
  const isPremium = isActive

  // Check subscription status only on initial mount and when user changes
  useEffect(() => {
    if (!authReady) return

    if (user) {
      console.log("[v0] [SUBSCRIPTION] Initial check for user:", user.id)
      checkSubscriptionStatus()
    } else {
      // No user (guest/demo) - confirmed free, nothing to check.
      setIsActive(false)
      setStatusConfirmed(true)
      setIsLoading(false)
    }
  }, [authReady, user])

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
        setIsTrialing(!!data.isTrialing)
        setTrialDaysLeft(data.trialDaysLeft || 0)
        setStatusConfirmed(true) // status is now confirmed from a real response
        setSubscriptionStatus(data.status)
        setSubscriptionId(data.subscriptionId)

        // Check if subscription was canceled
        setIsCanceled(data.status === "canceled")

        if (data.customerId) {
          setCustomerId(data.customerId)
          localStorage.setItem("stripe-customer-id", data.customerId)
        }

        console.log("[v0] Subscription status checked:", { plan: data.plan, isActive: data.isActive, status: data.status, isCanceled: data.status === "canceled" })
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
        // Redirect to Stripe checkout (use location.href for better compatibility)
        window.location.href = data.url
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
    if (!subscriptionId) {
      toast({
        title: "Žádné aktivní předplatné",
        description: "Nemáte žádné aktivní předplatné ke zrušení.",
        variant: "destructive",
      })
      return false
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
        isActive,
        isPremium,
        isLoading,
        isTrialing,
        trialDaysLeft,
        statusConfirmed,
        isCanceled,
        subscriptionId,
        customerId,
        subscriptionStatus,
        subscribe,
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
        isActive: false,
        isPremium: false,
        isLoading: true,
        isTrialing: false,
        trialDaysLeft: 0,
        statusConfirmed: false,
        isCanceled: false,
        subscriptionId: null,
        customerId: null,
        subscriptionStatus: null,
        subscribe: async () => false,
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
