"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { getUserData, setUserData } from "@/utils/storage-utils"

interface CloudSyncContextType {
  user: User | null
  isLoading: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  syncNow: () => Promise<void>
  signOut: () => Promise<void>
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined)

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const supabase = createClient()

  // Sync localStorage data to Supabase
  const syncToCloud = useCallback(async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      const userData = getUserData()

      // Sync journal entries
      if (userData.journalEntries && userData.journalEntries.length > 0) {
        const realEntries = userData.journalEntries.filter((e) => !e.id.startsWith("sample-"))

        for (const entry of realEntries) {
          const { error } = await supabase.from("journal_entries").upsert({
            id: entry.id,
            user_id: user.id,
            date: entry.date,
            type: entry.type,
            title: entry.title,
            content: entry.content,
            pair: entry.pair,
            direction: entry.direction,
            entry_price: entry.entryPrice,
            exit_price: entry.exitPrice,
            quantity: entry.quantity,
            pnl: entry.pnl,
            pips: entry.pips,
            mood_before: entry.moodBefore,
            mood_during: entry.moodDuring,
            mood_after: entry.moodAfter,
            confidence: entry.confidence,
            stress: entry.stress,
            discipline: entry.discipline,
            tags: entry.tags,
            lessons: entry.lessons,
            mistakes: entry.mistakes,
            improvements: entry.improvements,
            profit_loss: entry.profitLoss,
            notes: entry.notes,
            updated_at: new Date().toISOString(),
          })

          if (error) console.error("Error syncing journal entry:", error)
        }
      }

      setLastSyncTime(new Date())
      console.log("[v0] Cloud sync completed successfully")
    } catch (error) {
      console.error("[v0] Cloud sync error:", error)
    } finally {
      setIsSyncing(false)
    }
  }, [user, supabase])

  // Sync from cloud to localStorage
  const syncFromCloud = useCallback(async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      // Fetch journal entries
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (journalError) throw journalError

      if (journalEntries && journalEntries.length > 0) {
        const userData = getUserData()

        // Convert Supabase format to localStorage format
        userData.journalEntries = journalEntries.map((entry: any) => ({
          id: entry.id,
          date: entry.date,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          pair: entry.pair,
          direction: entry.direction,
          entryPrice: entry.entry_price,
          exitPrice: entry.exit_price,
          quantity: entry.quantity,
          pnl: entry.pnl,
          pips: entry.pips,
          moodBefore: entry.mood_before,
          moodDuring: entry.mood_during,
          moodAfter: entry.mood_after,
          confidence: entry.confidence,
          stress: entry.stress,
          discipline: entry.discipline,
          tags: entry.tags,
          lessons: entry.lessons,
          mistakes: entry.mistakes,
          improvements: entry.improvements,
          profitLoss: entry.profit_loss,
          notes: entry.notes,
        }))

        setUserData(userData)
      }

      setLastSyncTime(new Date())
      console.log("[v0] Cloud sync from server completed")
    } catch (error) {
      console.error("[v0] Cloud sync from server error:", error)
    } finally {
      setIsSyncing(false)
    }
  }, [user, supabase])

  // Auto-sync every 5 minutes
  useEffect(() => {
    if (!user) return

    const interval = setInterval(
      () => {
        syncToCloud()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [user, syncToCloud])

  // Initial sync on mount
  useEffect(() => {
    if (user) {
      syncFromCloud()
    }
  }, [user, syncFromCloud])

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const syncNow = async () => {
    await syncToCloud()
  }

  return (
    <CloudSyncContext.Provider
      value={{
        user,
        isLoading,
        isSyncing,
        lastSyncTime,
        syncNow,
        signOut,
      }}
    >
      {children}
    </CloudSyncContext.Provider>
  )
}

export function useCloudSync() {
  const context = useContext(CloudSyncContext)
  if (context === undefined) {
    throw new Error("useCloudSync must be used within a CloudSyncProvider")
  }
  return context
}
