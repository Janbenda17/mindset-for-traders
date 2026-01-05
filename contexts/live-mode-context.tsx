"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-context"

interface LiveModeContextType {
  isLiveMode: boolean
  isLoading: boolean
  switchToLive: () => Promise<void>
}

const LiveModeContext = createContext<LiveModeContextType | undefined>(undefined)

export function LiveModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const modeLoadedRef = useRef(false)
  const cachedModeRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (modeLoadedRef.current && cachedModeRef.current !== null) {
      console.log(`[v0] [LiveMode] Using cached mode: ${cachedModeRef.current ? "LIVE" : "VIRTUAL"} (auth refresh)`)
      setIsLiveMode(cachedModeRef.current)
      setIsLoading(false)
      return
    }

    if (!user) {
      console.log("[v0] [LiveMode] No user yet - waiting for authentication...")
      setIsLoading(true) // Keep loading state until user arrives
      return
    }

    if (!modeLoadedRef.current && user) {
      loadModeFromDatabase()
    }
  }, [user]) // Depend on user to avoid re-runs on user object changes

  const loadModeFromDatabase = async () => {
    if (!user) return

    console.log("[v0] [LiveMode] Loading mode from database for user:", user.id)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("trading_mode")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("[v0] [LiveMode] Error loading mode:", error)
        setIsLiveMode(false)
        cachedModeRef.current = false
        modeLoadedRef.current = true
      } else if (data) {
        const isLive = data.trading_mode === "live"
        setIsLiveMode(isLive)
        cachedModeRef.current = isLive
        modeLoadedRef.current = true
        console.log(`[v0] [LiveMode] ✓ Loaded from database: ${isLive ? "LIVE" : "VIRTUAL"}`)
      } else {
        setIsLiveMode(false)
        cachedModeRef.current = false
        modeLoadedRef.current = true
        console.log("[v0] [LiveMode] No profile found - defaulting to VIRTUAL (new user)")
      }
    } catch (err) {
      console.error("[v0] [LiveMode] Exception loading mode:", err)
      setIsLiveMode(false)
      cachedModeRef.current = false
      modeLoadedRef.current = true
    } finally {
      setIsLoading(false)
    }
  }

  const switchToLive = async () => {
    if (!user) {
      console.error("[v0] [LiveMode] Cannot switch to live mode - no user")
      return
    }

    console.log("[v0] [LiveMode] Switching to LIVE mode...")

    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").update({ trading_mode: "live" }).eq("user_id", user.id)

      if (error) {
        console.error("[v0] [LiveMode] Failed to update mode:", error)
        throw error
      }

      console.log("[v0] [LiveMode] ✓ Database updated to LIVE mode")

      cachedModeRef.current = true
      setIsLiveMode(true)
      modeLoadedRef.current = true

      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (err) {
      console.error("[v0] [LiveMode] Error switching to live:", err)
      throw err
    }
  }

  return <LiveModeContext.Provider value={{ isLiveMode, isLoading, switchToLive }}>{children}</LiveModeContext.Provider>
}

export function useLiveMode() {
  const context = useContext(LiveModeContext)
  if (context === undefined) {
    if (typeof window === "undefined") {
      return { isLiveMode: false, isLoading: true, switchToLive: async () => {} }
    }
    throw new Error("useLiveMode must be used within LiveModeProvider")
  }
  return context
}
