"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

// Define subscription plans
export type SubscriptionPlan = "FREE" | "BASIC" | "PRO" | "PRO_PLUS"

// Define features available for each plan
export const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  FREE: ["basic-diary", "mental-score", "daily-records"],
  BASIC: ["basic-diary", "mental-score", "daily-records", "history", "weekly-overview", "pdf-export", "motivation"],
  PRO: [
    "basic-diary",
    "mental-score",
    "daily-records",
    "history",
    "weekly-overview",
    "pdf-export",
    "motivation",
    "behavior-analysis",
    "notifications",
    "trading-behavior",
    "custom-weights",
  ],
  PRO_PLUS: [
    "basic-diary",
    "mental-score",
    "daily-records",
    "history",
    "weekly-overview",
    "pdf-export",
    "motivation",
    "behavior-analysis",
    "notifications",
    "trading-behavior",
    "custom-weights",
    "metatrader-integration",
    "ai-coach",
    "mentor-sharing",
    "stress-strategies",
  ],
}

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan
  setPlan: (plan: SubscriptionPlan) => void
  hasAccess: (feature: string) => boolean
  isFeatureLocked: (feature: string) => boolean
  getRequiredPlan: (feature: string) => SubscriptionPlan | null
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("FREE")
  const { user } = useAuth()

  // Load subscription from user data or localStorage
  useEffect(() => {
    if (user && user.plan) {
      // If user is logged in and has a plan, use that
      setCurrentPlan(user.plan as SubscriptionPlan)
    } else {
      // Otherwise, try to load from localStorage as fallback
      const savedPlan = localStorage.getItem("subscription-plan") as SubscriptionPlan
      if (savedPlan && Object.keys(PLAN_FEATURES).includes(savedPlan)) {
        setCurrentPlan(savedPlan)
      }
    }
  }, [user])

  // Save subscription to localStorage and update user data when it changes
  useEffect(() => {
    localStorage.setItem("subscription-plan", currentPlan)

    // If user is logged in, update their plan in localStorage
    if (user) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      userData.plan = currentPlan
      localStorage.setItem("user", JSON.stringify(userData))
    }
  }, [currentPlan, user])

  // Check if user has access to a specific feature
  const hasAccess = (feature: string) => {
    return PLAN_FEATURES[currentPlan].includes(feature)
  }

  // Check if a feature is locked (requires upgrade)
  const isFeatureLocked = (feature: string) => {
    return !hasAccess(feature)
  }

  // Get the required plan for a specific feature
  const getRequiredPlan = (feature: string): SubscriptionPlan | null => {
    for (const [plan, features] of Object.entries(PLAN_FEATURES)) {
      if (features.includes(feature)) {
        return plan as SubscriptionPlan
      }
    }
    return null
  }

  // Set the current plan
  const setPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan)
  }

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        setPlan,
        hasAccess,
        isFeatureLocked,
        getRequiredPlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

// Hook to use the subscription context
export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
