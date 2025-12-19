"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Brain, ChevronRight, Mail, Lock, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TeaserPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const EARLY_ACCESS_PASSWORD = "Mindpreview"

  const getLaunchDate = useCallback(() => {
    const stored = localStorage.getItem("teaser-launch-date")
    if (stored) {
      return new Date(stored)
    }
    const launchDate = new Date()
    launchDate.setDate(launchDate.getDate() + 7)
    localStorage.setItem("teaser-launch-date", launchDate.toISOString())
    return launchDate
  }, [])

  useEffect(() => {
    const introShown = localStorage.getItem("mindtrader-intro-shown")
    if (!introShown) {
      router.push("/intro")
      return
    }

    setIsLoaded(true)

    const launchDate = getLaunchDate()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [getLaunchDate, router])

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      const waitlist = JSON.parse(localStorage.getItem("teaser-waitlist") || "[]")
      waitlist.push({ email, date: new Date().toISOString() })
      localStorage.setItem("teaser-waitlist", JSON.stringify(waitlist))
      setEmailSubmitted(true)
    }
  }

  const handlePasswordSubmit = () => {
    if (password === EARLY_ACCESS_PASSWORD) {
      localStorage.setItem("teaser-early-access", "true")
      router.push("/login")
    } else {
      setPasswordError(true)
      setTimeout(() => setPasswordError(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[100]">
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400 animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.random() * 3 + 2 + "s",
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
      <div
        className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[150px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />

      <div
        className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
            MindTrader
          </span>
        </div>

        <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm mb-4 animate-pulse">Coming Soon</p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Master Your
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
            Trading Mind
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mb-12 leading-relaxed">
          Úspěch v tradingu začíná v hlavě.
          <br />
          MindTrader tě naučí řídit emoce i disciplínu.
        </p>

        <div className="mb-12">
          <p className="text-gray-500 text-center mb-4 uppercase tracking-widest text-xs">Spuštění za</p>
          <div className="flex gap-4 md:gap-6">
            {[
              { value: timeLeft.days, label: "Dní" },
              { value: timeLeft.hours, label: "Hodin" },
              { value: timeLeft.minutes, label: "Minut" },
              { value: timeLeft.seconds, label: "Sekund" },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[100px]">
                  <div className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-cyan-200 bg-clip-text text-transparent text-center">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="text-gray-500 text-xs md:text-sm text-center mt-2 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!emailSubmitted ? (
          <form onSubmit={handleWaitlistSubmit} className="w-full max-w-md mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Zadej svůj email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-cyan-500/20 text-white placeholder:text-gray-500 h-12"
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white h-12 px-6"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-gray-600 text-xs text-center mt-2">
              Přidej se na čekací listinu a dostaneš email při spuštění
            </p>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-cyan-400 mb-6 bg-cyan-500/10 px-6 py-3 rounded-full">
            <Check className="w-5 h-5" />
            <span>Díky! Dáme ti vědět při spuštění.</span>
          </div>
        )}

        <button
          onClick={() => setShowPasswordDialog(true)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm transition-colors mt-4"
        >
          <Lock className="w-4 h-4" />
          Mám přístupový kód
        </button>
      </div>

      {showPasswordDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button
              onClick={() => setShowPasswordDialog(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-white text-xl font-semibold mb-4">Předčasný přístup</h2>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Zadej heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-white/5 border-gray-700 text-white ${passwordError ? "border-red-500" : ""}`}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm">Nesprávné heslo</p>}
              <Button
                onClick={handlePasswordSubmit}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
              >
                Vstoupit
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
    </div>
  )
}
