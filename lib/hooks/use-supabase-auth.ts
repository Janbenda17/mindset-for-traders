"use client"

// Use useAuth() from @/contexts/auth-context instead
// Kept for backwards compatibility only

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export function useSupabaseAuth() {
  console.warn("[v0] DEPRECATED: useSupabaseAuth hook - Use useAuth() from @/contexts/auth-context instead")

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session without setting up duplicate listener
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // NO onAuthStateChange listener - that's handled by AuthProvider
  }, []) // Removed supabase.auth from deps since singleton never changes

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        data: metadata,
      },
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    userId: user?.id,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
