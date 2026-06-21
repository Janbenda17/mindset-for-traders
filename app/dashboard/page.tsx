'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNavigation } from '@/components/top-navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Zap, Target, Calendar, MessageSquare, AlertCircle, TrendingUp, Crown, Sparkles, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useLiveMode } from '@/contexts/live-mode-context'
import { useAnalytics } from '@/contexts/analytics-context'
import { useGamification } from '@/contexts/gamification-context'
import { useT } from '@/contexts/language-context'
import { MT5AccountWidget } from '@/components/mt5-account-widget'
import { TraderIdentityAnalysis } from '@/components/trader-identity-analysis'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [mt5Data, setMt5Data] = useState<any>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const gamification = useGamification()
  const gamificationLoading = !gamification?.data
  const t = useT()

  // Total Capital and Monthly P/L come exclusively from a connected MetaTrader
  // account. No MetaTrader account linked (mt5Data === null) -> show 0 instead
  // of a hardcoded/demo fallback value.
  const totalCapital = mt5Data?.balance ?? 0
  const monthlyPL = mt5Data?.monthlyProfit ?? 0
  const xpValue = Math.max(0, gamification?.data?.xp ?? 0)

  useEffect(() => {
    setMounted(true)
    console.log("[v0] Dashboard - gamification:", gamification)
    console.log("[v0] Dashboard - xpValue:", xpValue)
    console.log("[v0] Dashboard - isLiveMode:", isLiveMode)
    console.log("[v0] Dashboard - gamificationLoading:", gamificationLoading)
  }, [gamification?.data?.xp, xpValue, isLiveMode, gamificationLoading])

  const handlePricingClick = () => {
    if (!user) {
      router.push('/signup')
    } else {
      router.push('/pricing')
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Galaxy background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      
      {/* Stars */}
      <div className="fixed inset-0 opacity-60">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Animated nebula clouds */}
      <motion.div
        className="fixed top-1/4 -left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="fixed bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
      />

      <TopNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 pt-32 px-4 sm:px-6 md:px-8 lg:px-12 pb-20 max-w-5xl mx-auto">
        {/* Dashboard Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {t('dashboard_title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-purple-200">{t('nav_home') === 'Dashboard' ? 'Track your trading progress and optimize your mindset' : 'Sleduj svůj trading progres a optimalizuj svůj mindset'}</p>
          </div>
        </motion.div>

        {/* Live Mode Banner */}
        {isLiveMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="fixed top-24 left-0 right-0 z-40 px-4 md:px-8 lg:px-12"
          >
            <div className="max-w-6xl mx-auto bg-gradient-to-r from-green-900/80 to-emerald-900/80 backdrop-blur-sm border-b border-green-500/30 rounded-lg py-2 px-4 flex items-center justify-center gap-3 text-xs md:text-sm">
              <Crown className="w-4 h-4 text-green-300 flex-shrink-0" />
              <span className="text-green-100">
              <span className="font-bold text-white">{t('nav_home') === 'Dashboard' ? 'You are in Live Mode!' : 'Jsi v Live Mode!'}</span> – {t('nav_home') === 'Dashboard' ? 'Your real data is now active' : 'Tvoje reálná data jsou nyní aktivní'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Adjust top padding when banner is visible */}
        <div className={isLiveMode ? "" : "pt-16"}>
          {/* Key Metrics Row - 3 columns */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10"
          >
            {[
              { 
                label: t('dashboard_total_capital'), 
                value: `$${totalCapital.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}`, 
                color: 'text-green-400',
                borderColor: 'border-green-500/20',
                bgColor: 'bg-green-500/5'
              },
              { 
                label: t('dashboard_monthly_pl'), 
                value: `${monthlyPL >= 0 ? '+' : ''}$${monthlyPL.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}`, 
                color: 'text-blue-400',
                borderColor: 'border-blue-500/20',
                bgColor: 'bg-blue-500/5'
              },
              { 
                label: t('dashboard_xp'), 
                value: xpValue.toLocaleString('cs-CZ'), 
                color: 'text-yellow-400',
                borderColor: 'border-yellow-500/20',
                bgColor: 'bg-yellow-500/5'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-5 transition-all hover:border-opacity-40`}
              >
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color} mb-1`}>
                  {analyticsLoading || gamificationLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stat.value
                  )}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* MT5 Account Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">MetaTrader 5 Live Account</h2>
            <div className="max-w-2xl">
              <MT5AccountWidget onData={setMt5Data} />
            </div>
          </motion.div>

          {/* Daily Tracker, MindTrader AI & Loss Reset Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Essential Tools</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Tracker Link */}
              <Link href="/daily-tracker">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-cyan-900/40 to-slate-900/40 border border-cyan-500/30 rounded-2xl p-8 cursor-pointer hover:border-cyan-500/50 transition-all h-full flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Calendar className="w-10 h-10 text-cyan-400" />
                    <span className="text-xs bg-cyan-600/20 px-3 py-1 rounded-full text-cyan-300">Daily</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Daily Tracker</h3>
                  <p className="text-slate-300 text-sm mb-6 flex-grow">
                    Every morning record your psychological state in 30 seconds. AI detects your trading conditions. See patterns when you have edge and when you should sit out.
                  </p>
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <span>Open</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </Link>

              {/* MindTrader AI Link */}
              <Link href="/mindtrader">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-pink-900/40 to-slate-900/40 border border-pink-500/30 rounded-2xl p-8 cursor-pointer hover:border-pink-500/50 transition-all h-full flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Zap className="w-10 h-10 text-pink-400" />
                    <span className="text-xs bg-pink-600/20 px-3 py-1 rounded-full text-pink-300">24/7 Coach</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">MindTrader AI</h3>
                  <p className="text-slate-300 text-sm mb-6 flex-grow">
                    Your 24/7 personal trading coach. Got FOMO? Tempted by revenge trading? AI analyzes your state in real-time and gives you concrete advice.
                  </p>
                  <div className="flex items-center gap-2 text-pink-400 font-semibold">
                    <span>Open</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </Link>

              {/* Loss Reset Link */}
              <Link href="/loss-reset">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-900/40 to-slate-900/40 border border-orange-500/30 rounded-2xl p-8 cursor-pointer hover:border-orange-500/50 transition-all h-full flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Shield className="w-10 h-10 text-orange-400" />
                    <span className="text-xs bg-orange-600/20 px-3 py-1 rounded-full text-orange-300">Quick Reset</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Loss Reset</h3>
                  <p className="text-slate-300 text-sm mb-6 flex-grow">
                    Quick reset after loss – back in the game without revenge trading or emotional decisions. Regain your focus instantly.
                  </p>
                  <div className="flex items-center gap-2 text-orange-400 font-semibold">
                    <span>Start</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>


        </div>
      </div>
    </div>
  )
}
