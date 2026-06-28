"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTradeCheckin } from "@/contexts/trade-checkin-context"

const AUTO_DISMISS_SECONDS = 60
const FALLBACK_CONFIDENCE = 5

function confidenceColor(v: number) {
  if (v <= 3) return "bg-rose-500 text-white border-rose-400"
  if (v <= 6) return "bg-amber-500 text-white border-amber-400"
  return "bg-emerald-500 text-white border-emerald-400"
}

function confidenceHover(v: number) {
  if (v <= 3) return "hover:bg-rose-500/20 hover:border-rose-500 hover:text-rose-300"
  if (v <= 6) return "hover:bg-amber-500/20 hover:border-amber-500 hover:text-amber-300"
  return "hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-emerald-300"
}

export default function TradeCheckinOverlay() {
  const { pending, submitOpen, dismiss } = useTradeCheckin()
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset timer whenever a new pending check-in arrives
  useEffect(() => {
    if (!pending || pending.phase !== "open") {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    setSecondsLeft(AUTO_DISMISS_SECONDS)

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Auto-submit with fallback average confidence
          submitOpen(pending.tradeId, FALLBACK_CONFIDENCE, "unknown")
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pending?.tradeId, pending?.phase])

  const handleSelect = (v: number) => {
    if (!pending) return
    submitOpen(pending.tradeId, v, "unknown")
  }

  // Only show widget for "open" phase — close phase is analyzed automatically
  const show = pending?.phase === "open"

  return (
    <AnimatePresence>
      {show && pending && (
        <motion.div
          key={`checkin-${pending.tradeId}`}
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="fixed right-4 bottom-24 z-50 w-72 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-md"
        >
          {/* Timer bar */}
          <motion.div
            className="h-0.5 bg-blue-500 origin-left"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: AUTO_DISMISS_SECONDS, ease: "linear" }}
          />

          {/* Header */}
          <div className="px-4 pt-3 pb-1 flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold leading-none mb-1">
                Nový obchod · {pending.pair}
              </p>
              <p className="text-sm font-bold text-white leading-tight">Confidence Level?</p>
            </div>
            <button
              onClick={() => dismiss()}
              className="text-slate-600 hover:text-slate-400 transition-colors mt-0.5 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1–10 buttons */}
          <div className="px-4 pb-4 pt-2">
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                <button
                  key={v}
                  onClick={() => handleSelect(v)}
                  className={cn(
                    "h-10 rounded-lg border text-sm font-bold transition-all duration-150",
                    "border-slate-700 bg-slate-800/60 text-slate-400",
                    confidenceHover(v),
                    "active:scale-95",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-2 text-right">
              Auto-zavře za {secondsLeft}s
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
