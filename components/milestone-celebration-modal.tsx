"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, X, Sparkles } from "lucide-react"
import { useMilestoneCelebrations } from "@/contexts/milestone-celebrations-context"
import Confetti from "react-confetti"

export function MilestoneCelebrationModal() {
  const { currentCelebration, dismissCelebration } = useMilestoneCelebrations()
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!currentCelebration) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={dismissCelebration}
      >
        {currentCelebration.showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-2 border-yellow-400/50 shadow-2xl max-w-md w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={dismissCelebration}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="p-8 space-y-6 text-center">
              {/* Badge Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative text-8xl">{currentCelebration.milestone.badge}</div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">{currentCelebration.milestone.title}</h2>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-lg text-slate-300">{currentCelebration.message}</p>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <p className="text-slate-400">{currentCelebration.milestone.description}</p>

                <div className="flex items-center justify-center gap-4">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border px-4 py-2 text-base">
                    <Trophy className="w-4 h-4 mr-2" />+{currentCelebration.milestone.reward} XP
                  </Badge>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Button
                  onClick={dismissCelebration}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                >
                  Awesome!
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
