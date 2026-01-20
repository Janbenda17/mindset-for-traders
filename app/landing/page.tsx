"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Lock, Sparkles, Timer, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Set launch date to 1.2 (February 1st) at 16:00
  const launchDate = new Date()
  launchDate.setMonth(1) // February (0-indexed)
  launchDate.setDate(1)
  launchDate.setHours(16, 0, 0, 0)

  const [isLaunched, setIsLaunched] = useState(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance > 0) {
        setTimeRemaining({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setIsLaunched(true)
      }
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleEarlyAccess = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate password
    if (!password) {
      setError("Prosím zadej heslo")
      return
    }

    // Check credentials
    if (password === "Mindpreview") {
      // Set cookie to mark landing as seen
      document.cookie = "mt_seen_landing=1; path=/; max-age=31536000"
      router.push("/auth/login")
    } else {
      setError("Špatné heslo. Prosím zkus znovu.")
      setPassword("")
    }
  }

  const handleResetPassword = () => {
    if (!email.trim()) {
      setError("Prosím zadej svůj email pro reset hesla")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Prosím zadej platný email")
      return
    }

    setError("")
    alert(`Email pro reset hesla byl poslán na: ${email}`)
    setShowResetForm(false)
    setEmail("")
  }

  const handleEnterApp = () => {
    // Set cookie to mark landing as seen
    document.cookie = "mt_seen_landing=1; path=/; max-age=31536000"
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950"></div>
      
      {/* Stars Background */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                       radial-gradient(2px 2px at 60% 70%, white, transparent),
                       radial-gradient(1px 1px at 50% 50%, white, transparent),
                       radial-gradient(1px 1px at 80% 10%, white, transparent),
                       radial-gradient(2px 2px at 90% 60%, white, transparent),
                       radial-gradient(1px 1px at 33% 80%, white, transparent)`,
          backgroundSize: "200% 200%",
          opacity: 0.5,
        }}
      ></div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut",
            delay: 0.2
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-xl opacity-50"
            ></motion.div>
            <div className="relative bg-gradient-to-br from-purple-600 to-cyan-600 p-8 rounded-3xl shadow-2xl">
              <Brain className="w-20 h-20 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            MindTrader
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            Trading Psychology Platform
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <p className="text-lg text-gray-400">
              Ovládni svou mysl. Ovládni trhy.
            </p>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Conditional rendering based on launch status */}
        {!isLaunched ? (
          <>
            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Timer className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">Launching Soon</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto">
                {[
                  { value: timeRemaining.days, label: "Dny" },
                  { value: timeRemaining.hours, label: "Hodiny" },
                  { value: timeRemaining.minutes, label: "Minuty" },
                  { value: timeRemaining.seconds, label: "Sekundy" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm shadow-xl">
                      <CardContent className="p-3 sm:p-6">
                        <motion.div
                          key={item.value}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1 sm:mb-2"
                        >
                          {String(item.value).padStart(2, "0")}
                        </motion.div>
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                          {item.label}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Early Access Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <Card className="max-w-md mx-auto bg-slate-900/70 border-2 border-purple-500/50 backdrop-blur-md shadow-2xl shadow-purple-500/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-semibold text-white">
                      Dřívější přístup
                    </h3>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  
                  <p className="text-gray-400 mb-6 text-sm">
                    Máš heslo pro early access? Vstup hned teď!
                  </p>

                  <form onSubmit={handleEarlyAccess} className="space-y-4">
                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Zadej heslo..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-900/30 border border-red-500/50 rounded-lg p-3"
                      >
                        <p className="text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-6 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Vstoupit do platformy
                    </Button>
                  </form>

                  <p className="text-xs text-gray-500 mt-4">
                    Heslo dostaneš emailem nebo od admina
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Launch mode - Simple Enter button */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mt-12"
          >
            <Button
              onClick={handleEnterApp}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold px-16 py-8 text-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all hover:scale-105 rounded-2xl"
            >
              <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
              Vstoupit
            </Button>
          </motion.div>
        )}


      </div>
    </div>
  )
}
