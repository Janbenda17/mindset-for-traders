"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"

interface SubscriptionContextType {
  plan: "free" | "premium"
  daysRemaining: number
  isActive: boolean
  upgradeToPremium: () => void
  cancelSubscription: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<"free" | "premium">("free")
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Check subscription status on mount
    const subscription = localStorage.getItem("trader-mindset-subscription")
    if (subscription) {
      try {
        const parsed = JSON.parse(subscription)
        setPlan(parsed.plan)

        if (parsed.plan === "premium" && parsed.endDate) {
          const endDate = new Date(parsed.endDate)
          const now = new Date()
          const diffTime = endDate.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays > 0) {
            setDaysRemaining(diffDays)
            setIsActive(true)
          } else {
            // Subscription expired
            setPlan("free")
            setDaysRemaining(0)
            setIsActive(false)
            localStorage.removeItem("trader-mindset-subscription")
          }
        }
      } catch (error) {
        console.error("Error parsing subscription data:", error)
      }
    }
  }, [])

  const upgradeToPremium = () => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7) // 7 days free trial

    const subscription = {
      plan: "premium",
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
    }

    localStorage.setItem("trader-mindset-subscription", JSON.stringify(subscription))
    setPlan("premium")
    setDaysRemaining(7)
    setIsActive(true)

    toast({
      title: "Premium aktivován!",
      description: "Premium přístup na 7 dní zdarma!",
    })
  }

  const cancelSubscription = () => {
    localStorage.removeItem("trader-mindset-subscription")
    setPlan("free")
    setDaysRemaining(0)
    setIsActive(false)

    toast({
      title: "Předplatné zrušeno",
      description: "Vaše předplatné bylo úspěšně zrušeno.",
    })
  }

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        daysRemaining,
        isActive,
        upgradeToPremium,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
