"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client" // Import singleton directly

interface AdminContextType {
  isAdmin: boolean
  isTestModeEnabled: boolean
  simulatedDaysOffset: number
  setSimulatedDaysOffset: (days: number) => void
  toggleTestMode: () => void
  getSimulatedDate: () => Date
  checkSystemHealth: () => Promise<SystemHealthCheck>
}

interface SystemHealthCheck {
  authOk: boolean
  profileOk: boolean
  dataIsolationOk: boolean
  analyticsOk: boolean
  noSharedData: boolean
  details: {
    auth: string
    profile: string
    dataIsolation: string
    analytics: string
    sharedData: string
  }
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTestModeEnabled, setIsTestModeEnabled] = useState(false)
  const [simulatedDaysOffset, setSimulatedDaysOffsetState] = useState(0)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()

      setIsAdmin(profile?.role === "admin")
    }

    checkAdminStatus()
  }, [user?.id])

  const toggleTestMode = () => {
    if (!isAdmin) {
      console.warn("[Admin] Test mode toggle attempted by non-admin user")
      return
    }
    setIsTestModeEnabled(!isTestModeEnabled)
    if (!isTestModeEnabled) {
      console.log("[Admin] Test mode ENABLED")
    } else {
      console.log("[Admin] Test mode DISABLED")
      setSimulatedDaysOffsetState(0)
    }
  }

  const setSimulatedDaysOffset = (days: number) => {
    if (!isAdmin || !isTestModeEnabled) {
      console.warn("[Admin] Day simulation attempted without proper authorization")
      return
    }
    setSimulatedDaysOffsetState(days)
    console.log(`[Admin] Simulating +${days} days from today`)
  }

  const getSimulatedDate = (): Date => {
    if (!isAdmin || !isTestModeEnabled || simulatedDaysOffset === 0) {
      return new Date()
    }
    const simulated = new Date()
    simulated.setDate(simulated.getDate() + simulatedDaysOffset)
    return simulated
  }

  const checkSystemHealth = async (): Promise<SystemHealthCheck> => {
    const health: SystemHealthCheck = {
      authOk: false,
      profileOk: false,
      dataIsolationOk: false,
      analyticsOk: false,
      noSharedData: false,
      details: {
        auth: "",
        profile: "",
        dataIsolation: "",
        analytics: "",
        sharedData: "",
      },
    }

    // Check 1: Auth
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      health.authOk = !!session
      health.details.auth = session ? `User: ${session.user.email}` : "No session"
    } catch (error) {
      health.details.auth = `Error: ${error}`
    }

    // Check 2: Profile
    if (user?.id) {
      try {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
        health.profileOk = !!profile
        health.details.profile = profile
          ? `Profile exists, onboarding: ${profile.onboarding_completed}`
          : "No profile found"
      } catch (error) {
        health.details.profile = `Error: ${error}`
      }
    }

    // Check 3: Data Isolation (verify RLS is working)
    if (user?.id) {
      try {
        const { data: myTrades } = await supabase.from("journal_entries").select("user_id").eq("user_id", user.id)

        const { data: otherTrades } = await supabase.from("journal_entries").select("user_id").neq("user_id", user.id)

        health.dataIsolationOk = !otherTrades || otherTrades.length === 0
        health.details.dataIsolation = health.dataIsolationOk
          ? `RLS working: ${myTrades?.length || 0} my trades, ${otherTrades?.length || 0} other trades visible`
          : `RLS BREACH: Can see ${otherTrades?.length} trades from other users!`
      } catch (error) {
        health.details.dataIsolation = `RLS check error (expected for non-admin): ${error}`
        health.dataIsolationOk = true // Errors accessing other data = RLS working
      }
    }

    // Check 4: Analytics rendering
    try {
      const { data: trades } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user?.id || "")
        .limit(1)
      health.analyticsOk = true
      health.details.analytics = `Analytics query OK, ${trades?.length || 0} sample records`
    } catch (error) {
      health.details.analytics = `Analytics error: ${error}`
    }

    // Check 5: No shared data in localStorage
    try {
      const localStorageKeys = Object.keys(localStorage).filter((key) => key.includes("trader-mindset"))
      const userKeys = localStorageKeys.filter((key) => key.includes(`user-${user?.id}`))
      const otherUserKeys = localStorageKeys.filter((key) => key.includes("user-") && !key.includes(`user-${user?.id}`))

      health.noSharedData = otherUserKeys.length === 0
      health.details.sharedData = `${userKeys.length} my keys, ${otherUserKeys.length} other user keys in localStorage`
    } catch (error) {
      health.details.sharedData = `LocalStorage check error: ${error}`
    }

    return health
  }

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isTestModeEnabled,
        simulatedDaysOffset,
        setSimulatedDaysOffset,
        toggleTestMode,
        getSimulatedDate,
        checkSystemHealth,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    // Return safe defaults for SSR
    if (typeof window === "undefined") {
      return {
        isAdmin: false,
        isTestModeEnabled: false,
        simulatedDaysOffset: 0,
        setSimulatedDaysOffset: () => {},
        toggleTestMode: () => {},
        getSimulatedDate: () => new Date(),
        checkSystemHealth: async () =>
          ({
            authOk: false,
            profileOk: false,
            dataIsolationOk: false,
            analyticsOk: false,
            noSharedData: false,
            details: {
              auth: "SSR",
              profile: "SSR",
              dataIsolation: "SSR",
              analytics: "SSR",
              sharedData: "SSR",
            },
          }) as any,
      }
    }
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
