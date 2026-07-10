'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const SESSION_KEY = 'mt_analytics_session_id'

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function sendPageview(sessionId: string, path: string, enteredAt: number, referrer?: string) {
  const durationSeconds = Math.max(0, Math.round((Date.now() - enteredAt) / 1000))
  const payload = JSON.stringify({ sessionId, path, durationSeconds, referrer })

  if (typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
  } else {
    fetch('/api/track', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  }
}

// Records how long a visitor spends on each page. Duration for a page is
// only known once they leave it (route change, tab hidden, or tab closed),
// so nothing is sent for the page currently being viewed - it flushes on
// the next navigation or when the tab is hidden/closed.
export function SiteAnalyticsTracker() {
  const pathname = usePathname()
  const currentRef = useRef<{ path: string; enteredAt: number; referrer?: string } | null>(null)

  useEffect(() => {
    const flush = () => {
      const current = currentRef.current
      if (!current) return
      sendPageview(getSessionId(), current.path, current.enteredAt, current.referrer)
      current.enteredAt = Date.now()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  useEffect(() => {
    if (!pathname || pathname.startsWith('/backstage')) return

    const sessionId = getSessionId()
    const previous = currentRef.current
    if (previous) {
      sendPageview(sessionId, previous.path, previous.enteredAt, previous.referrer)
    }

    currentRef.current = {
      path: pathname,
      enteredAt: Date.now(),
      referrer: previous ? undefined : document.referrer || undefined,
    }
  }, [pathname])

  return null
}
