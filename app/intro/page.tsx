"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Brain, ChevronRight } from "lucide-react"

export default function IntroPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [showSkip, setShowSkip] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          router.push("/auth/login")
          return 100
        }
        return prev + 2
      })
    }, 100)

    const skipTimer = setTimeout(() => {
      setShowSkip(true)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(skipTimer)
    }
  }, [router])

  const handleSkip = () => {
    router.push("/auth/login")
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-hidden">
      {/* Galaxy background with animated stars */}
      <div className="absolute inset-0">
        {/* Dark space base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950" />

        {/* Animated galaxy blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-500" />

        {/* Starfield effect */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                opacity: Math.random() * 0.7 + 0.3,
                animationDuration: Math.random() * 2 + 2 + "s",
              }}
            />
          ))}
        </div>

        {/* Animated gradient lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="url(#lineGradient)" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        {/* Logo with glow animation */}
        <div className="relative">
          <div
            className="absolute -inset-8 bg-gradient-to-r from-purple-600 via-amber-500 to-cyan-500 rounded-full blur-2xl opacity-0 animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse"
            style={{ animationDuration: "2s" }}
          />

          {/* Logo circle */}
          <div
            className="relative w-32 h-32 bg-gradient-to-br from-purple-600 via-amber-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-amber-500 to-cyan-500 rounded-full flex items-center justify-center p-1">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <Brain className="w-12 h-12 text-cyan-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-black">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">
              MindTrader
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide">
            Advanced Trading Psychology Platform
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-amber-500 to-cyan-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text and skip button */}
        <div className="flex items-center gap-4 mt-6">
          <p className="text-sm text-gray-400">Připravuji vaši cestu...</p>
          {showSkip && (
            <button
              onClick={handleSkip}
              className="group flex items-center gap-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2 rounded-lg transition-all duration-300 hover:border-white/60"
            >
              Přeskočit
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
    </div>
  )
}
