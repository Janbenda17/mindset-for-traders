"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, X, Sparkles } from "lucide-react"
import { useMilestoneCelebrations } from "@/contexts/milestone-celebrations-context"
import Confetti from "react-confetti"

export function MilestoneCelebrationModal() {
  const { currentCelebration, dismissCelebration } = useMilestoneCelebrations()
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, [])

  useEffect(() => {
    if (currentCelebration) {
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [currentCelebration])

  if (!currentCelebration) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
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

      <div
        className={`transform transition-all duration-500 ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-12"}`}
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
            <div
              className={`flex justify-center transition-transform duration-700 delay-200 ${isVisible ? "scale-100 rotate-0" : "scale-0 -rotate-180"}`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
                <div className="relative text-8xl">{currentCelebration.milestone.badge}</div>
              </div>
            </div>

            {/* Title */}
            <div
              className={`space-y-2 transition-all duration-500 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">{currentCelebration.milestone.title}</h2>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-lg text-slate-300">{currentCelebration.message}</p>
            </div>

            {/* Description */}
            <div
              className={`space-y-3 transition-all duration-500 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
            >
              <p className="text-slate-400">{currentCelebration.milestone.description}</p>

              <div className="flex items-center justify-center gap-4">
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border px-4 py-2 text-base">
                  <Trophy className="w-4 h-4 mr-2" />+{currentCelebration.milestone.reward} XP
                </Badge>
              </div>
            </div>

            {/* Action Button */}
            <div
              className={`transition-all duration-500 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            >
              <Button
                onClick={dismissCelebration}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                Awesome!
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
