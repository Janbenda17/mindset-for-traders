"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useAuth } from "./auth-context"
import { useSubscription } from "./subscription-context"

interface LiveModeContextType {
  isLiveMode: boolean
  isLoading: boolean
  switchToLive: () => Promise<void>
  canSwitchMode: boolean
}

const LiveModeContext = createContext<LiveModeContextType | undefined>(undefined)

export function LiveModeProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth()
  const { isPremium, isLoading: isSubscriptionLoading } = useSubscription()
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [canSwitchMode, setCanSwitchMode] = useState(true)
  const modeLoadedRef = useRef(false)
  const cachedModeRef = useRef<boolean | null>(null)
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!authReady) {
      console.log("[v0] [LiveMode] Waiting for auth to be ready...")
      return
    }

    if (prevUserIdRef.current !== user?.id) {
      console.log("[v0] [LiveMode] User changed - resetting cache")
      modeLoadedRef.current = false
      cachedModeRef.current = null
    }
    prevUserIdRef.current = user?.id || null

    if (modeLoadedRef.current && cachedModeRef.current !== null && user) {
      console.log(`[v0] [LiveMode] Using cached mode: ${cachedModeRef.current ? "LIVE" : "VIRTUAL"}`)
      setIsLiveMode(cachedModeRef.current)
      setCanSwitchMode(!cachedModeRef.current)
      setIsLoading(false)
      return
    }

    if (!user) {
      // Demo mode - check localStorage for demo mode preference
      const demoMode = typeof window !== 'undefined' ? localStorage.getItem("trader-mindset-demo-mode") : null
      const isDemoLive = demoMode === "live"
      console.log(`[v0] [LiveMode] No user - loading demo mode: ${isDemoLive ? "LIVE" : "VIRTUAL"}`)
      setIsLiveMode(isDemoLive)
      setCanSwitchMode(true) // Can always switch in demo
      cachedModeRef.current = isDemoLive
      modeLoadedRef.current = true
      setIsLoading(false)
      return
    }

    loadModeFromDatabase()
  }, [user, authReady])

  // Auto-revert to virtual mode if premium expires
  useEffect(() => {
    if (!user || !isLiveMode) return

    // IMPORTANT: Don't revert during subscription loading - wait for subscription status to be confirmed
    if (isSubscriptionLoading) {
      console.log(`[v0] [LiveMode] Subscription status still loading - NOT reverting live mode yet`)
      return
    }

    // Only revert if subscription is definitely not active (not loading AND not premium)
    if (!isPremium && isLiveMode) {
      console.log(`[v0] [LiveMode] ⚠️ Premium expired for user ${user.id} - reverting to VIRTUAL mode`)
      switchToVirtualForExpiredPremium()
    }
  }, [isPremium, user?.id, isLiveMode, isSubscriptionLoading])

  const loadModeFromDatabase = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    console.log(`[v0] [LiveMode] Loading mode from database for user: ${user.id} (${user.email})`)
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("trading_mode")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("[v0] [LiveMode] Error loading mode:", error)
        setIsLiveMode(false)
        setCanSwitchMode(true)
        cachedModeRef.current = false
        modeLoadedRef.current = true
      } else if (data) {
        const isLive = data.trading_mode === "live"
        setIsLiveMode(isLive)
        setCanSwitchMode(!isLive)
        cachedModeRef.current = isLive
        modeLoadedRef.current = true
        console.log(
          `[v0] [LiveMode] ✓ Loaded from database: ${isLive ? "LIVE" : "VIRTUAL"} (userId: ${user.id}, canSwitch: ${!isLive})`,
        )
      } else {
        // New user - check if premium and auto-enable live mode if so
        console.log(`[v0] [LiveMode] No profile found for user ${user.id} - checking subscription status`)
        
        // Wait a bit for subscription to load
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (isPremium) {
          console.log(`[v0] [LiveMode] User ${user.id} is premium - auto-enabling LIVE mode`)
          setIsLiveMode(true)
          setCanSwitchMode(false)
          cachedModeRef.current = true
          
          // Also save it to database
          await supabase
            .from("profiles")
            .update({ trading_mode: "live" })
            .eq("user_id", user.id)
        } else {
          console.log(`[v0] [LiveMode] User ${user.id} is not premium - defaulting to VIRTUAL`)
          setIsLiveMode(false)
          setCanSwitchMode(true)
          cachedModeRef.current = false
        }
        
        modeLoadedRef.current = true
      }
    } catch (err) {
      console.error("[v0] [LiveMode] Exception loading mode:", err)
      setIsLiveMode(false)
      setCanSwitchMode(true)
      cachedModeRef.current = false
      modeLoadedRef.current = true
    } finally {
      setIsLoading(false)
    }
  }

  const switchToLive = async () => {
    try {
      console.log(`[v0] [LiveMode] 🔄 Starting switch to LIVE mode for user: ${user?.id}`)
      
      if (!user) {
        console.log("[v0] [LiveMode] Switching to LIVE mode (demo mode)")
        localStorage.setItem("trader-mindset-demo-mode", "live")
        cachedModeRef.current = true
        setIsLiveMode(true)
        setCanSwitchMode(true)
        modeLoadedRef.current = true
        console.log("[v0] [LiveMode] ✓ Demo mode switched to LIVE")
        return
      }

      // Update database to live mode
      console.log(`[v0] [LiveMode] Updating database to LIVE mode for user: ${user.id}`)
      const { error } = await supabase
        .from("profiles")
        .update({ trading_mode: "live" })
        .eq("user_id", user.id)

      if (error) {
        console.error("[v0] [LiveMode] Error updating database:", error)
        throw new Error(`Failed to update trading mode: ${error.message}`)
      }

      console.log(`[v0] [LiveMode] ✓ Database updated to LIVE mode (userId: ${user.id})`)
      console.log(`[v0] [LiveMode] Mode switched -> LIVE, userId: ${user.id}, virtual data preserved in localStorage`)

      cachedModeRef.current = true
      setIsLiveMode(true)
      setCanSwitchMode(false)
      modeLoadedRef.current = true

      console.log("[v0] [LiveMode] ✓ State updated, reloading...")
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      console.error("[v0] [LiveMode] Error switching to live:", err)
      throw err
    }
  }

  const switchToVirtual = async () => {
    if (!user) {
      // Demo mode - switch back to virtual
      console.log("[v0] [LiveMode] Switching to VIRTUAL mode (demo mode)")
      localStorage.setItem("trader-mindset-demo-mode", "virtual")
      cachedModeRef.current = false
      setIsLiveMode(false)
      setCanSwitchMode(true)
      modeLoadedRef.current = true
      console.log("[v0] [LiveMode] ✓ Demo mode switched to VIRTUAL")
    }
  }

  const switchToVirtualForExpiredPremium = async () => {
    if (!user) return

    try {
      // Update database back to virtual
      const { error } = await supabase
        .from("profiles")
        .update({ trading_mode: "virtual" })
        .eq("user_id", user.id)

      if (error) {
        console.error("[v0] [LiveMode] Error reverting to virtual:", error)
        return
      }

      console.log(`[v0] [LiveMode] ✓ Reverted to VIRTUAL mode (premium expired) for user: ${user.id}`)
      cachedModeRef.current = false
      setIsLiveMode(false)
      setCanSwitchMode(true)
      modeLoadedRef.current = true

      // Reload page to refresh data
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (err) {
      console.error("[v0] [LiveMode] Exception reverting to virtual:", err)
    }
  }

  return (
    <LiveModeContext.Provider value={{ isLiveMode, isLoading, switchToLive, canSwitchMode }}>
      {children}
    </LiveModeContext.Provider>
  )
}

export function useLiveMode() {
  const context = useContext(LiveModeContext)
  if (context === undefined) {
    // Return default values during SSR/build instead of throwing
    return { isLiveMode: false, isLoading: true, switchToLive: async () => {}, canSwitchMode: true }
  }
  return context
}
