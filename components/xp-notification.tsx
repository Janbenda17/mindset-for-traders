"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, Zap, Award, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

      setNotifications((prev) => [...prev, { id, amount, reason, leveledUp, newLevel, isVisible: true }])

      // Remove notification after animation
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 3500)
    }

    window.addEventListener("xp-gained", handleXPGained as EventListener)
    return () => window.removeEventListener("xp-gained", handleXPGained as EventListener)
  }, [])

  const getIcon = (reason: string, leveledUp: boolean) => {
    if (leveledUp) return <TrendingUp className="w-6 h-6 text-yellow-400" />
    if (reason?.includes("success")) return <Award className="w-6 h-6 text-yellow-400" />
    if (reason?.includes("loss")) return <Star className="w-6 h-6 text-purple-400" />
    return <Zap className="w-6 h-6 text-yellow-400" />
  }

  return (
    <AnimatePresence>
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: -50, x: 100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, x: 100, scale: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.5,
          }}
          className="fixed z-50 pointer-events-none"
          style={{ top: `${80 + index * 120}px`, right: "20px" }}
        >
          <motion.div
            animate={notification.leveledUp ? { y: [0, -5, 0] } : { rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="relative"
          >
            {/* Glow background */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(250, 204, 21, 0.4)",
                  "0 0 40px rgba(250, 204, 21, 0.7)",
                  "0 0 20px rgba(250, 204, 21, 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-xl"
            />

            {/* Main card */}
            <div
              className={`relative p-4 rounded-xl shadow-2xl backdrop-blur-md border-2 ${
                notification.leveledUp
                  ? "bg-gradient-to-br from-yellow-900/40 via-yellow-800/30 to-orange-900/40 border-yellow-500/60"
                  : "bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 border-yellow-500/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-max">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                  className={notification.leveledUp ? "text-yellow-400" : "text-yellow-400"}
                >
                  {getIcon(notification.reason, notification.leveledUp)}
                </motion.div>

                <div className="flex flex-col gap-0.5">
                  {notification.leveledUp ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-black text-lg text-yellow-400"
                      >
                        LEVEL UP!
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm font-bold text-yellow-300"
                      >
                        Level {notification.newLevel}
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-black text-xl text-yellow-400 flex items-baseline gap-1"
                      >
                        <motion.span
                          animate={{ y: [-15, 0] }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          +{notification.amount}
                        </motion.span>
                        <span className="text-xs font-bold">XP</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs font-semibold text-gray-300"
                      >
                        {notification.reason}
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full blur-sm"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.cos((i / 6) * Math.PI * 2) * 70,
                    y: Math.sin((i / 6) * Math.PI * 2) * 70 - 30,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.4,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                  style={{
                    left: "50%",
                    top: "50%",
                    marginLeft: "-3px",
                    marginTop: "-3px",
                  }}
                />
              ))}

              {/* Success pulse ring */}
              {notification.leveledUp && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-yellow-400"
                  initial={{ opacity: 1, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.3 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
