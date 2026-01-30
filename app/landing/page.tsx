"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Lock, Sparkles, Timer, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { WaitlistSignup } from "@/components/waitlist-signup"

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)
  const [isLaunched, setIsLaunched] = useState(true)


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
      router.push("/about")
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
    router.push("/about")
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

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-16"
        >
          <button
            onClick={handleEnterApp}
            className="group relative px-16 py-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white text-3xl sm:text-4xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/50"
          >
            <span className="relative z-10 flex items-center gap-4">
              Vstoupit
              <Sparkles className="w-10 h-10 group-hover:rotate-180 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          </button>
          <p className="mt-6 text-gray-400 text-lg font-medium">
            Aplikace je nyní dostupná
          </p>
        </motion.div>

        {/* Early Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
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

        {/* Waitlist Signup Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="max-w-2xl mx-auto mt-8"
        >
          <div className="bg-slate-900/50 border border-cyan-500/30 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-cyan-500/10">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Chceš být mezi prvními?
              </h3>
              <p className="text-gray-300">
                Přidej se na waitlist a získej 5% slevu na launch
              </p>
            </div>
            <WaitlistSignup />
          </div>
        </motion.div>


      </div>
    </div>
  )
}
