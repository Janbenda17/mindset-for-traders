"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/browser"
import { useAuth } from "./auth-context"
import { useLiveMode } from "./live-mode-context"

export type CheckinPhase = "open" | "close"

export interface PendingCheckin {
  phase: CheckinPhase
  tradeId: string
  pair: string
  pnl?: number // only when phase === "close"
}

interface TradeCheckinContextType {
  pending: PendingCheckin | null
  submitOpen: (tradeId: string, confidence: number, emotion: string) => Promise<void>
  submitClose: (tradeId: string, followedPlan: "yes" | "no" | "partial") => Promise<void>
  dismiss: () => void
  // Manual trigger for testing / pre-MT5 environments
  triggerOpen: (tradeId: string, pair: string) => void
  triggerClose: (tradeId: string, pair: string, pnl?: number) => void
}

const TradeCheckinContext = createContext<TradeCheckinContextType | undefined>(undefined)

export function TradeCheckinProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const [pending, setPending] = useState<PendingCheckin | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  // Real-time Supabase subscription: detects new trades from MT5 webhook
  useEffect(() => {
    if (!user || !isLiveMode) return

    const channel = supabase
      .channel(`trade-checkin-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "journal_entries",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any
          if (row.type !== "trade") return
          if (seenIds.current.has(row.id)) return
          seenIds.current.add(row.id)

          // Only trigger check-in if confidence_before not already filled
          if (row.confidence_before == null) {
            setPending({ phase: "open", tradeId: row.id, pair: row.pair || row.symbol || "Obchod" })
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "journal_entries",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as any
          const old = payload.old as any
          if (row.type !== "trade") return

          // Trade just got a close_time or pnl that wasn't there before
          const justClosed =
            (!old.close_time && row.close_time) || (old.pnl == null && row.pnl != null)

          if (justClosed && row.followed_plan == null) {
            setPending({
              phase: "close",
              tradeId: row.id,
              pair: row.pair || row.symbol || "Obchod",
              pnl: row.pnl ?? row.profit_loss,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isLiveMode])

  const triggerOpen = (tradeId: string, pair: string) => {
    setPending({ phase: "open", tradeId, pair })
  }

  const triggerClose = (tradeId: string, pair: string, pnl?: number) => {
    setPending({ phase: "close", tradeId, pair, pnl })
  }

  const submitOpen = async (tradeId: string, confidence: number, emotion: string) => {
    if (user && isLiveMode) {
      await supabase
        .from("journal_entries")
        .update({ confidence_before: confidence, emotion_before: emotion })
        .eq("id", tradeId)
        .eq("user_id", user.id)
    }
    setPending(null)
  }

  const submitClose = async (tradeId: string, followedPlan: "yes" | "no" | "partial") => {
    if (user && isLiveMode) {
      await supabase
        .from("journal_entries")
        .update({ followed_plan: followedPlan === "yes", matched_plan: followedPlan })
        .eq("id", tradeId)
        .eq("user_id", user.id)
    }
    setPending(null)
  }

  const dismiss = () => setPending(null)

  return (
    <TradeCheckinContext.Provider value={{ pending, submitOpen, submitClose, dismiss, triggerOpen, triggerClose }}>
      {children}
    </TradeCheckinContext.Provider>
  )
}

export function useTradeCheckin() {
  const ctx = useContext(TradeCheckinContext)
  if (!ctx) throw new Error("useTradeCheckin must be used within TradeCheckinProvider")
  return ctx
}
