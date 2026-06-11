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
import { useT } from '@/contexts/language-context'
import { MT5AccountWidget } from '@/components/mt5-account-widget'
import { TraderIdentityAnalysis } from '@/components/trader-identity-analysis'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [userCapital, setUserCapital] = useState(50000)
  const router = useRouter()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const gamification = useGamification()
  const gamificationLoading = !gamification?.data
  const t = useT()

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
      title: t('daily_tracker_title'),
      desc: t('feat_daily_desc'),
      icon: Calendar,
      href: '/daily-tracker'
    },
    {
      title: t('mindtrader_title'),
      desc: t('feat_mindtrader_desc'),
      icon: Zap,
      href: '/mindtrader'
    },
    {
      title: t('weekly_review_title'),
      desc: t('feat_weekly_desc'),
      icon: TrendingUp,
      href: '/weekly-review'
    },
    {
      title: 'Loss Reset',
      desc: t('nav_home') === 'Dashboard' ? 'Quick reset after loss – back in the game without revenge' : 'Rychlý reset po ztrátě – zpět do hry bez revenge',
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
              {t('dashboard_title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-purple-200">{t('nav_home') === 'Dashboard' ? 'Track your trading progress and optimize your mindset' : 'Sleduj svůj trading progres a optimalizuj svůj mindset'}</p>
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
              <span className="font-bold text-white">{t('nav_home') === 'Dashboard' ? 'You are in Live Mode!' : 'Jsi v Live Mode!'}</span> – {t('nav_home') === 'Dashboard' ? 'Your real data is now active' : 'Tvoje reálná data jsou nyní aktivní'}
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10"
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
                label: t('dashboard_readiness'), 
                value: `${Math.round(readiness)}%`, 
                color: 'text-purple-400',
                borderColor: 'border-purple-500/20',
                bgColor: 'bg-purple-500/5'
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
              <MT5AccountWidget />
            </div>
          </motion.div>

          {/* Trader Identity & Weekly Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">AI-Powered Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trader Identity Link */}
              <Link href="/trader-identity">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 transition-all h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Crown className="w-8 h-8 text-purple-400" />
                    <span className="text-xs bg-purple-600/20 px-3 py-1 rounded-full text-purple-300">AI Analyzed</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Your Trading Identity</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    AI-powered analysis of your trading style, emotional patterns, strengths, and personalized goals
                  </p>
                  <div className="flex items-center gap-2 text-purple-400 font-semibold">
                    <span>View Profile</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </Link>

              {/* Weekly Review Link */}
              <Link href="/weekly-review">
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/30 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 transition-all h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs bg-indigo-600/20 px-3 py-1 rounded-full text-indigo-300">7-Day Review</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Weekly Review</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Comprehensive AI-generated insights from your trading performance, patterns, and next week focus areas
                  </p>
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <span>View Review</span>
                    <span>→</span>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Features Grid - 2x2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t('dashboard_tools')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, i) => {
                const colorScheme = [
                  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'bg-purple-600 text-purple-100' },
                  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'bg-blue-600 text-blue-100' },
                  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'bg-emerald-600 text-emerald-100' },
                  { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'bg-orange-600 text-orange-100' }
                ]
                const scheme = colorScheme[i]
                return (
                  <Link key={i} href={feature.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${scheme.bg} ${scheme.border} border rounded-2xl p-6 transition-all cursor-pointer hover:border-opacity-40 h-full flex flex-col`}
                    >
                      <div className={`w-12 h-12 rounded-lg ${scheme.icon} flex items-center justify-center mb-4`}>
                        <feature.icon className="w-6 h-6" />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-300 text-sm mb-6 flex-grow leading-relaxed">{feature.desc}</p>

                      <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold hover:text-white transition-colors">
                        <span>{t('open')}</span>
                        <span className="text-lg">→</span>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
