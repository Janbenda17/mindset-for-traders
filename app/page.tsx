"use client"

import { Button } from "@/components/ui/button"
import { 
  Brain, 
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MindTrader AI
            </span>
          </div>
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-purple-900/20 to-transparent"></div>
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: `radial-gradient(2px 2px at 20% 30%, rgba(59, 130, 246, 0.3), transparent),
                               radial-gradient(2px 2px at 60% 70%, rgba(139, 92, 246, 0.3), transparent),
                               radial-gradient(3px 3px at 50% 50%, rgba(59, 130, 246, 0.2), transparent),
                               radial-gradient(2px 2px at 80% 10%, rgba(139, 92, 246, 0.3), transparent)`,
              backgroundSize: "200% 200%",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
              Software, který tě
              <br />
              ochrání
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-slate-300 max-w-4xl mx-auto px-4"
          >
            Mindtrader je nástroj pro každodenní řízení psychiky, disciplíny a rozhodování tradera.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 sm:pt-8"
          >
            <Link href="/product-tour">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg sm:text-2xl py-6 sm:py-8 px-8 sm:px-12 rounded-xl shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300 group"
              >
                Spustit demo ZDARMA (45 sekund)
                <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Mock Video/Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 sm:mt-16 relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400 mx-auto animate-pulse" />
                  <p className="text-lg sm:text-xl font-semibold text-slate-300">
                    Demo Video Loop
                  </p>
                  <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
                    Daily Tracker → AI insight "Riziko 68% – pauza doporučena" → Weekly Review graf
                  </p>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
