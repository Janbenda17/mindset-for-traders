"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, TrendingUp } from "lucide-react"

interface XPNotification {
  id: string
  amount: number
  reason: string
  leveledUp?: boolean
  newLevel?: number
}

export function XPNotification() {
  const [notifications, setNotifications] = useState<XPNotification[]>([])

  useEffect(() => {
    const handleXPGained = (event: CustomEvent) => {
      const { amount, reason, leveledUp, newLevel } = event.detail
      const id = Math.random().toString(36).substr(2, 9)

      setNotifications((prev) => [...prev, { id, amount, reason, leveledUp, newLevel }])

      // Remove notification after 3 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 3000)
    }

    window.addEventListener("xp-gained", handleXPGained as EventListener)
    return () => window.removeEventListener("xp-gained", handleXPGained as EventListener)
  }, [])

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`p-4 rounded-lg shadow-lg backdrop-blur-sm ${
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
