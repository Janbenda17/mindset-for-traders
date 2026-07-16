'use client'

import { useEffect, useState } from 'react'

// Illustrative "live users" social-proof badge. This is deliberately NOT
// wired to a real presence/session table - the app has no real-time
// last-seen tracking yet - so the count is simulated: starts at BASE on
// every render (server and first client paint match, avoiding a hydration
// mismatch), then drifts by +/-1 within [MIN, MAX] every ~20-35s so it
// reads as "alive" rather than a static, obviously-fake number.
const BASE = 6
const MIN = 5
const MAX = 9

interface LiveUsersBadgeProps {
  isEn: boolean
}

export function LiveUsersBadge({ isEn }: LiveUsersBadgeProps) {
  const [count, setCount] = useState(BASE)

  useEffect(() => {
    let cancelled = false

    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 15000
      const id = setTimeout(() => {
        if (cancelled) return
        setCount((prev) => {
          const delta = Math.random() < 0.5 ? -1 : 1
          return Math.min(MAX, Math.max(MIN, prev + delta))
        })
        scheduleNext()
      }, delay)
      return id
    }

    const timeoutId = scheduleNext()
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <span className="text-sm text-slate-300 text-left">
        {isEn ? (
          <>
            <span className="font-semibold text-white">{count}</span> traders live right now
          </>
        ) : (
          <>
            <span className="font-semibold text-white">{count}</span> obchodníků právě live
          </>
        )}
      </span>
    </div>
  )
}
