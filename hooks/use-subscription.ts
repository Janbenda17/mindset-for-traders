"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useSubscription() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setIsPremium(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/subscription/status")
        if (response.ok) {
          const data = await response.json()
          setIsPremium(data.isPremium || false)
          setSubscriptionTier(data.tier || null)
        } else {
          setIsPremium(false)
          setSubscriptionTier(null)
        }
      } catch (error) {
        console.error("[v0] Error checking subscription:", error)
        setIsPremium(false)
        setSubscriptionTier(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [user])

  return {
    isPremium,
    isLoading,
    subscriptionTier,
    isFree: !isPremium,
  }
}
