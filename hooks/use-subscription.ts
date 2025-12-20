"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useSubscription() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)
  const hasChecked = useRef(false)

  useEffect(() => {
    async function checkSubscription() {
      if (hasChecked.current) {
        return
      }

      if (!user) {
        setIsPremium(false)
        setSubscriptionTier("free")
        setIsLoading(false)
        hasChecked.current = true
        return
      }

      let retries = 3
      let success = false

      while (retries > 0 && !success) {
        try {
          const response = await fetch("/api/subscription/status", {
            credentials: "include",
          })

          if (response.ok) {
            const data = await response.json()
            setIsPremium(data.isPremium || false)
            setSubscriptionTier(data.tier || "free")
            success = true
          } else {
            if (response.status === 401 || response.status === 403) {
              setIsPremium(false)
              setSubscriptionTier("free")
              success = true
            } else {
              retries--
              if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)))
              }
            }
          }
        } catch (error) {
          console.error("[v0] Error checking subscription:", error)
          retries--
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)))
          }
        }
      }

      if (!success) {
        setIsPremium(false)
        setSubscriptionTier("free")
      }

      setIsLoading(false)
      hasChecked.current = true
    }

    checkSubscription()
  }, [user]) // Updated to only re-check if user object changes

  return {
    isPremium,
    isLoading,
    subscriptionTier,
    isFree: !isPremium,
  }
}
