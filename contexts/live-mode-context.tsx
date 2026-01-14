"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useAuth } from "./auth-context"

interface LiveModeContextType {
  isLiveMode: boolean
  isLoading: boolean
  switchToLive: () => Promise<void>
  canSwitchMode: boolean // Add flag to indicate if user has already switched to LIVE (one-way)
}

const LiveModeContext = createContext<LiveModeContextType | undefined>(undefined)

export function LiveModeProvider({ children }: { children: ReactNode }) {
  const { user, authReady } = useAuth()
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [canSwitchMode, setCanSwitchMode] = useState(true) // Track if user can still switch
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
      console.log("[v0] [LiveMode] No user - setting to VIRTUAL")
      setIsLiveMode(false)
      setCanSwitchMode(true) // New users can always switch
      setIsLoading(false)
      return
    }

    loadModeFromDatabase()
  }, [user, authReady])

  const loadModeFromDatabase = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    console.log("[v0] [LiveMode] Loading mode from database for user:", user.id)
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
        setCanSwitchMode(true) // On error, default to VIRTUAL and allow switching
        cachedModeRef.current = false
        modeLoadedRef.current = true
      } else if (data) {
        const isLive = data.trading_mode === "live"
        setIsLiveMode(isLive)
        setCanSwitchMode(!isLive)
        cachedModeRef.current = isLive
        modeLoadedRef.current = true
        console.log(`[v0] [LiveMode] ✓ Loaded from database: ${isLive ? "LIVE" : "VIRTUAL"} (can switch: ${!isLive})`)
      } else {
        setIsLiveMode(false)
        setCanSwitchMode(true) // New users start in VIRTUAL and can switch
        cachedModeRef.current = false
        modeLoadedRef.current = true
        console.log("[v0] [LiveMode] No profile found - defaulting to VIRTUAL (new user)")
      }
    } catch (err) {
      console.error("[v0] [LiveMode] Exception loading mode:", err)
      setIsLiveMode(false)
      setCanSwitchMode(true) // On exception, stay VIRTUAL and allow switching
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

    if (!canSwitchMode) {
      console.error("[v0] [LiveMode] Cannot switch mode - already in LIVE mode (permanent)")
      return
    }

    console.log("[v0] [LiveMode] Switching to LIVE mode... (permanent change)")

    try {
      const { error } = await supabase.from("profiles").update({ trading_mode: "live" }).eq("user_id", user.id)

      if (error) {
        console.error("[v0] [LiveMode] Failed to update mode:", error)
        throw error
      }

      console.log("[v0] [LiveMode] ✓ Database updated to LIVE mode (permanent)")

      cachedModeRef.current = true
      setIsLiveMode(true)
      setCanSwitchMode(false)
      modeLoadedRef.current = true

      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (err) {
      console.error("[v0] [LiveMode] Error switching to live:", err)
      throw err
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
    if (typeof window === "undefined") {
      return { isLiveMode: false, isLoading: true, switchToLive: async () => {}, canSwitchMode: true }
    }
    throw new Error("useLiveMode must be used within LiveModeProvider")
  }
  return context
}
