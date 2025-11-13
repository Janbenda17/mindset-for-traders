"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/notifications-context"

export function NotificationPermissionBanner() {
  const { hasPermission, requestPermission, settings } = useNotifications()
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show banner if notifications are not enabled and not dismissed
    const isDismissed = localStorage.getItem("notification-banner-dismissed") === "true"
    setDismissed(isDismissed)
    setShow(!hasPermission && !isDismissed && !settings.enabled)
  }, [hasPermission, settings.enabled])

  const handleEnable = async () => {
    const granted = await requestPermission()
    if (granted) {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("notification-banner-dismissed", "true")
    setDismissed(true)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <div className="rounded-lg border border-blue-500/20 bg-slate-900/95 backdrop-blur p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <Bell className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Enable Notifications</h3>
            <p className="text-sm text-slate-400 mb-3">
              Get reminders for Morning Check, Daily Review, and Weekly Review to stay consistent with your trading
              routine.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleEnable} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Enable
              </Button>
              <Button onClick={handleDismiss} size="sm" variant="ghost" className="text-slate-400">
                Maybe Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
