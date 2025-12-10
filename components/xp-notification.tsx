"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp } from "lucide-react"

interface XPNotification {
  id: string
  amount: number
  reason: string
  leveledUp?: boolean
  newLevel?: number
  isVisible?: boolean
}

export function XPNotification() {
  const [notifications, setNotifications] = useState<XPNotification[]>([])

  useEffect(() => {
    const handleXPGained = (event: CustomEvent) => {
      const { amount, reason, leveledUp, newLevel } = event.detail
      const id = Math.random().toString(36).substr(2, 9)

      // Add notification with isVisible false initially
      setNotifications((prev) => [...prev, { id, amount, reason, leveledUp, newLevel, isVisible: false }])

      // Make it visible after a tick for animation
      setTimeout(() => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isVisible: true } : n)))
      }, 10)

      // Start hiding animation before removing
      setTimeout(() => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n)))
      }, 2700)

      // Remove notification after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 3000)
    }

    window.addEventListener("xp-gained", handleXPGained as EventListener)
    return () => window.removeEventListener("xp-gained", handleXPGained as EventListener)
  }, [])

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ${
            notification.isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-24 scale-80"
          } ${
            notification.leveledUp
              ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50"
              : "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.leveledUp ? (
              <TrendingUp className="h-6 w-6 text-yellow-400" />
            ) : (
              <Sparkles className="h-6 w-6 text-purple-400" />
            )}
            <div>
              {notification.leveledUp ? (
                <>
                  <div className="font-bold text-yellow-400">Level Up!</div>
                  <div className="text-sm">Level {notification.newLevel}</div>
                </>
              ) : (
                <>
                  <div className="font-bold text-purple-400">+{notification.amount} XP</div>
                  <div className="text-sm text-muted-foreground">{notification.reason}</div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
