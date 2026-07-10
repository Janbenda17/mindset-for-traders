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
  pnl?: number
}

interface TradeCheckinContextType {
  pending: PendingCheckin | null
  submitOpen: (tradeId: string, confidence: number, emotion: string) => Promise<void>
  dismiss: () => void
  triggerOpen: (tradeId: string, pair: string) => void
  triggerClose: (tradeId: string, pair: string, pnl?: number) => void
}

const TradeCheckinContext = createContext<TradeCheckinContextType | undefined>(undefined)

/**
 * Determines if a trade was closed early (before SL/TP) based on MT5 data.
 * Returns "panic" | "tp_hit" | "sl_hit" | "manual" | null
 */
function analyzeExitType(row: any): string | null {
  if (!row.stop_loss && !row.take_profit) return null
  const pnl = row.pnl ?? row.profit_loss ?? 0
  const sl = row.stop_loss
  const tp = row.take_profit

  if (tp && pnl > 0) return "tp_hit"
  if (sl && pnl < 0) {
    // If close price is significantly better than SL, likely manual close before SL
    const closePrice = row.close_price
    const openPrice = row.open_price
    if (closePrice && openPrice && sl) {
      const expectedSlLoss = Math.abs(openPrice - sl)
      const actualLoss = Math.abs(openPrice - closePrice)
      if (actualLoss < expectedSlLoss * 0.85) return "panic"
    }
    return "sl_hit"
  }
  return "manual"
}

export function TradeCheckinProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const [pending, setPending] = useState<PendingCheckin | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

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
        async (payload) => {
          const row = payload.new as any
          const old = payload.old as any
          if (row.type !== "trade") return

          const justClosed =
            (!old.close_time && row.close_time) || (old.pnl == null && row.pnl != null)

          if (!justClosed) return

          // Auto-analyze exit — no UI prompt needed
          const exitType = analyzeExitType(row)
          const followedPlan =
            exitType === "tp_hit" || exitType === "sl_hit"
              ? "yes"
              : exitType === "panic"
                ? "no"
                : "partial"

          await supabase
            .from("journal_entries")
            .update({
              followed_plan: followedPlan === "yes",
              matched_plan: followedPlan,
              exit_type: exitType,
            })
            .eq("id", row.id)
            .eq("user_id", user.id)
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
    // Close is now silent — just log it (no UI widget)
    setPending(null)
    if (user && isLiveMode) {
      supabase
        .from("journal_entries")
        .update({ matched_plan: "partial" })
        .eq("id", tradeId)
        .eq("user_id", user.id)
    }
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

  const dismiss = () => setPending(null)

  return (
    <TradeCheckinContext.Provider value={{ pending, submitOpen, dismiss, triggerOpen, triggerClose }}>
      {children}
    </TradeCheckinContext.Provider>
  )
}

export function useTradeCheckin() {
  const ctx = useContext(TradeCheckinContext)
  if (!ctx) throw new Error("useTradeCheckin must be used within TradeCheckinProvider")
  return ctx
}
