'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopNavigation } from '@/components/top-navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3, Zap, Target, Calendar, TrendingUp, Crown, Sparkles,
  ArrowUpRight, ArrowDownRight, Activity, Brain, RefreshCw,
  ChevronRight, Circle, CheckCircle2, Clock, Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useLiveMode } from '@/contexts/live-mode-context'
import { useAnalytics } from '@/contexts/analytics-context'
import { useGamification } from '@/contexts/gamification-context'
import { CapitalSettingsDialog } from '@/components/capital-settings-dialog'
import { useT } from '@/contexts/language-context'
import { MT5AccountWidget } from '@/components/mt5-account-widget'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' }
  })
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [userCapital, setUserCapital] = useState(50000)
  const router = useRouter()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const { analytics, isLoading: analyticsLoading } = useAnalytics()
  const gamification = useGamification()
  const t = useT()

  const totalPnL = analytics?.summary?.totalPnL ?? 0
  const winRate = analytics?.summary?.winRate ?? 0
  const totalTrades = analytics?.summary?.totalTrades ?? 0
  const readiness = analytics?.summary?.avgReadiness ?? 0
  const xpValue = Math.max(0, gamification?.data?.xp ?? 0)
  const isLoading = analyticsLoading

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const stats = [
    {
      label: 'Total P&L',
      value: `${totalPnL >= 0 ? '+' : ''}$${Math.abs(totalPnL).toLocaleString('en', { maximumFractionDigits: 0 })}`,
      sub: isLiveMode ? 'Live account' : 'Demo mode',
      positive: totalPnL >= 0,
      icon: TrendingUp,
      color: 'cyan',
    },
    {
      label: 'Win Rate',
      value: `${Math.round(winRate)}%`,
      sub: `${totalTrades} trades total`,
      positive: winRate >= 50,
      icon: Target,
      color: winRate >= 50 ? 'green' : 'red',
    },
    {
      label: 'Readiness',
      value: `${Math.round(readiness)}%`,
      sub: 'Mental score',
      positive: readiness >= 60,
      icon: Brain,
      color: 'cyan',
    },
    {
      label: 'XP Points',
      value: xpValue.toLocaleString('en'),
      sub: 'Gamification',
      positive: true,
      icon: Zap,
      color: 'amber',
    },
  ]

  const quickLinks = [
    {
      title: t('daily_tracker_title'),
      description: 'Morning check, trading plan, daily summary',
      icon: Calendar,
      href: '/daily-tracker',
      badge: 'Daily',
      color: 'cyan',
    },
    {
      title: 'MindTrader AI',
      description: 'AI coaching, insights and psychological support',
      icon: Brain,
      href: '/mindtrader',
      badge: 'AI',
      color: 'purple',
    },
    {
      title: t('weekly_review_title'),
      description: 'AI-generated weekly performance review',
      icon: TrendingUp,
      href: '/weekly-review',
      badge: '7-day',
      color: 'green',
    },
    {
      title: 'Loss Reset',
      description: 'Structured reset protocol after a losing streak',
      icon: Shield,
      href: '/loss-reset',
      badge: 'Recovery',
      color: 'amber',
    },
  ]

  const colorMap: Record<string, { text: string; bg: string; border: string; badge: string }> = {
    cyan:   { text: 'text-cyan-400',   bg: 'bg-cyan-500/8',   border: 'border-cyan-500/15',   badge: 'bg-cyan-500/15 text-cyan-300' },
    green:  { text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', badge: 'bg-emerald-500/15 text-emerald-300' },
    red:    { text: 'text-red-400',    bg: 'bg-red-500/8',    border: 'border-red-500/15',    badge: 'bg-red-500/15 text-red-300' },
    amber:  { text: 'text-amber-400',  bg: 'bg-amber-500/8',  border: 'border-amber-500/15',  badge: 'bg-amber-500/15 text-amber-300' },
    purple: { text: 'text-violet-400', bg: 'bg-violet-500/8', border: 'border-violet-500/15', badge: 'bg-violet-500/15 text-violet-300' },
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Live mode indicator */}
        {isLiveMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-sm font-medium text-emerald-300">Live Mode Active — Real account data</span>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between mb-10"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-1">
              {user?.email ? `Good day` : t('dashboard_title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLiveMode ? 'Connected to MetaTrader 5' : 'Demo mode — connect MT5 to go live'}
            </p>
          </div>
          <CapitalSettingsDialog
            currentCapital={userCapital}
            onCapitalUpdated={setUserCapital}
          />
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((s, i) => {
            const c = colorMap[s.color]
            return (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className={cn(
                  'rounded-xl border p-4 sm:p-5 transition-colors',
                  c.bg, c.border
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <s.icon className={cn('w-4 h-4', c.text)} />
                </div>
                <div className={cn('text-2xl sm:text-3xl font-bold tracking-tight stat-number mb-1', c.text)}>
                  {isLoading ? (
                    <span className="block h-8 w-20 rounded animate-shimmer" />
                  ) : s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* MT5 Account — spans 2 cols */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">MetaTrader 5</h2>
              {isLiveMode && (
                <Badge className="bg-emerald-500/15 text-emerald-300 border-0 text-xs">Live</Badge>
              )}
            </div>
            <MT5AccountWidget />
          </motion.div>

          {/* AI Sections quick links */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <h2 className="text-base font-semibold text-foreground mb-4">AI Analysis</h2>
            <div className="flex flex-col gap-3">
              <Link href="/trader-identity">
                <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">Trader Identity</div>
                    <div className="text-xs text-muted-foreground truncate">AI-analyzed trading profile</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </div>
              </Link>

              <Link href="/weekly-review">
                <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">Weekly Review</div>
                    <div className="text-xs text-muted-foreground truncate">7-day AI performance review</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </div>
              </Link>

              <Link href="/analytics">
                <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">Analytics</div>
                    <div className="text-xs text-muted-foreground truncate">Deep dive into your trades</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quick access tools */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <h2 className="text-base font-semibold text-foreground mb-4">{t('dashboard_tools')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map((item, i) => {
              const c = colorMap[item.color]
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    custom={7 + i}
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    className={cn(
                      'group flex flex-col p-5 rounded-xl border transition-all cursor-pointer h-full',
                      'bg-card border-border',
                      'hover:border-opacity-40',
                      `hover:${c.border}`
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', c.bg)}>
                        <item.icon className={cn('w-5 h-5', c.text)} />
                      </div>
                      <span className={cn('text-xs px-2 py-1 rounded-md font-medium', c.badge)}>
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed flex-1">{item.description}</div>
                    <div className={cn('flex items-center gap-1 text-xs font-medium mt-4 transition-colors text-muted-foreground group-hover:text-foreground', )}>
                      Open
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </motion.div>

      </main>
    </div>
  )
}
