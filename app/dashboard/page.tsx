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

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()

  useEffect(() => {
    setMounted(true)
  }, [])

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
      href: '/mindtrader-pro'
    },
    {
      title: 'Weekly Review',
      desc: 'Shrne týden a řekne, co změnit příště',
      icon: TrendingUp,
      href: '/weekly-review'
    },
    {
      title: 'Loss Reset',
      desc: 'Rychlý reset po ztrátě – zpět do hry bez revanše',
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
      <div className="relative z-10 pt-32 px-4 md:px-8 lg:px-12 pb-20 max-w-6xl mx-auto">
        {/* Dashboard Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-purple-200">Sleduj svůj trading progres a optimalizuj svůj mindset</p>
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {[
              { label: 'Celkový kapitál', value: '$50,000', icon: '💰', gradient: 'from-green-500 to-emerald-600' },
              { label: 'Měsíční P/L', value: '+$3,240', icon: '📈', gradient: 'from-blue-500 to-cyan-600' },
              { label: 'Aktuální Readiness', value: '78%', icon: '🧠', gradient: 'from-purple-500 to-indigo-600' },
              { label: 'Aktuální XP', value: '2,450', icon: '⭐', gradient: 'from-yellow-500 to-orange-600' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all"
              >
                <p className="text-xs md:text-sm font-semibold text-slate-400 mb-2">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <Link key={i} href={feature.href}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all h-full cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <feature.icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-purple-200 leading-relaxed">{feature.desc}</p>
                            <div className="mt-4">
                              <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white p-0 h-auto font-semibold">
                                Vyzkoušet teď →
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
