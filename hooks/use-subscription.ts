"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

export function useSubscription() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setIsPremium(false)
        setSubscriptionTier("free")
        setIsLoading(false)
        return
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      let retries = 3
      let success = false

      while (retries > 0 && !success) {
        try {
          const response = await fetch("/api/subscription/status", {
            credentials: "include",
            signal: abortControllerRef.current.signal,
          })

          if (response.ok) {
            const data = await response.json()
            setIsPremium(data.isPremium || false)
            setSubscriptionTier(data.tier || "free")
            console.log("[v0] Subscription loaded:", { isPremium: data.isPremium, tier: data.tier })
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
        } catch (error: any) {
          if (error.name === "AbortError") {
            console.log("[v0] Subscription check aborted")
            return
          }
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
    }

    checkSubscription()

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [user]) // Re-check if user object changes

  return {
    isPremium,
    isLoading,
    subscriptionTier,
    isFree: !isPremium,
  }
}
