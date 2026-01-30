"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Lock, Sparkles, Timer, Zap } from "lucide-react"
import { motion } from "framer-motion"


export default function LandingPage() {
  const router = useRouter()





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
            Ovládni psychiku, ovládneš trading. Začni dnes.
          </p>
        </motion.div>


      </div>
    </div>
  )
}
