'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNavigation } from '@/components/top-navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Zap, Target, Calendar, MessageSquare, AlertCircle, TrendingUp, Crown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useLiveMode } from '@/contexts/live-mode-context'
import { useAnalytics } from '@/contexts/analytics-context'
import { useGamification } from '@/contexts/gamification-context'
import { CapitalSettingsDialog } from '@/components/capital-settings-dialog'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [userCapital, setUserCapital] = useState(50000)
  const router = useRouter()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const gamification = useGamification()
  const gamificationLoading = !gamification?.data

  // Calculate dynamic values from analytics
  const totalCapital = analytics?.summary.totalPnL ? Math.abs(analytics.summary.totalPnL) + userCapital : userCapital
  const monthlyPL = analytics?.summary.totalPnL ?? 3240
  const readiness = analytics?.summary.avgReadiness ?? 78
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

  const features = [
    {
      title: 'Daily Tracker',
      desc: 'Nastavíš si pravidla dne – AI tě hlídá, abys je dodržel',
      icon: Calendar,
      href: '/daily-tracker'
    },
    {
      title: 'MindTrader AI',
      desc: 'Varuje tě v reálném čase před emočními chybami',
      icon: Zap,
      href: '/mindtrader'
    },
    {
      title: 'Weekly Review',
      desc: 'Shrne týden a řekne, co změnit příště',
      icon: TrendingUp,
      href: '/weekly-review'
    },
    {
      title: 'Loss Reset',
      desc: 'Rychlý reset po ztrátě – zpět do hry bez revenge',
      icon: Target,
      href: '/loss-reset'
    }
  ]

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
      <div className="relative z-10 pt-32 px-2 sm:px-4 md:px-8 lg:px-12 pb-20 max-w-7xl mx-auto w-full">
        {/* Dashboard Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Nástěnka
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-purple-200">Sleduj svůj trading progres a optimalizuj svůj mindset</p>
          </div>
          <CapitalSettingsDialog 
            currentCapital={userCapital}
            onCapitalUpdated={setUserCapital}
          />
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
                <span className="font-bold text-white">Jsi v Live Mode!</span> – Tvoje reálná data jsou nyní aktivní
              </span>
            </div>
          </motion.div>
        )}

        {/* Adjust top padding when banner is visible */}
        <div className={isLiveMode ? "" : "pt-16"}>
          {/* Key Metrics Row - 4 columns */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { 
                label: 'Celkový kapitál', 
                value: `$${totalCapital.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}`, 
                icon: '💰', 
                gradient: 'from-green-600 to-emerald-500',
                change: '+2.4%'
              },
              { 
                label: 'Měsíční P/L', 
                value: `${monthlyPL >= 0 ? '+' : ''}$${monthlyPL.toLocaleString('cs-CZ', { maximumFractionDigits: 0 })}`, 
                icon: '📈', 
                gradient: 'from-blue-600 to-cyan-500',
                change: monthlyPL >= 0 ? '↑ Positivo' : '↓ Negativní'
              },
              { 
                label: 'Aktuální Readiness', 
                value: `${Math.round(readiness)}%`, 
                icon: '🧠', 
                gradient: 'from-purple-600 to-indigo-500',
                subtext: 'Trading Ready'
              },
              { 
                label: 'Tvůj XP Skóre', 
                value: xpValue.toLocaleString('cs-CZ'), 
                icon: '⭐', 
                gradient: 'from-yellow-600 to-orange-500',
                subtext: 'Level 2'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-5 hover:border-white/20 transition-all cursor-pointer"
              >
                {/* Background gradient */}
                <div className={`absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 pointer-events-none`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    {stat.change && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-black text-white mb-1">
                    {analyticsLoading || gamificationLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stat.value
                    )}
                  </p>
                  {stat.subtext && (
                    <p className="text-xs text-slate-400">{stat.subtext}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid - 2x2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-black text-white mb-6">Tvoje nástroje</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const colors = [
                  'from-purple-600 to-pink-600',
                  'from-blue-600 to-cyan-600',
                  'from-emerald-600 to-teal-600',
                  'from-orange-600 to-red-600'
                ]
                return (
                  <Link key={i} href={feature.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-8 hover:border-white/20 transition-all cursor-pointer h-full"
                    >
                      {/* Animated gradient background */}
                      <motion.div
                        className={`absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br ${colors[i]} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`}
                      />

                      <div className="relative z-10">
                        {/* Icon box */}
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[i]} flex items-center justify-center mb-6 shadow-lg`}
                        >
                          <feature.icon className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-2xl font-black text-white mb-3">{feature.title}</h3>
                        <p className="text-slate-300 leading-relaxed mb-6">{feature.desc}</p>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-purple-300 font-semibold group-hover:gap-3 transition-all">
                          <span>Vyzkoušet teď</span>
                          <span className="text-lg">→</span>
                        </div>
                      </div>

                      {/* Border glow on hover */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                        style={{
                          background: `linear-gradient(135deg, transparent, rgba(168, 85, 247, 0.1), transparent)`,
                          animation: 'shine 3s infinite'
                        }}
                      />
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Stats - Secondary Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            {[
              { label: 'Tvůj Level', value: '2', color: 'from-indigo-600 to-purple-600' },
              { label: 'Achievements', value: '3/12', color: 'from-emerald-600 to-teal-600' },
              { label: 'Streak', value: '7 dní', color: 'from-orange-600 to-red-600' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} p-6 backdrop-blur-sm`}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-white/70 mb-2">{stat.label}</p>
                  <p className="text-4xl font-black text-white">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
