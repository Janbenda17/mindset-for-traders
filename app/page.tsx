'use client'

import { useState, useEffect } from 'react'
import { TopNavigation } from '@/components/top-navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Zap, Target, Calendar, MessageSquare, AlertCircle, TrendingUp, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

      {/* Top LIVE Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-yellow-900/80 to-orange-900/80 backdrop-blur-sm border-b border-yellow-500/30 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <span className="text-yellow-100">
            <span className="font-bold">Demo mód</span> – data ukázková
          </span>
          <div className="flex items-center gap-4">
            <span className="text-yellow-100">
              <span className="font-bold text-white">Early Bird:</span> prvních 50 lidí jen <span className="font-bold text-white">1499 Kč</span> (místo 2499 Kč)
            </span>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold">
              Přejít do LIVE
            </Button>
          </div>
        </div>
      </div>

      <TopNavigation />
      
      {/* Main Content */}
      <div className="relative z-10 pt-32 px-4 md:px-8 lg:px-12 pb-20 max-w-6xl mx-auto">
        {/* Top Stats - 4 columns */}
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

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              AI, který tě zastaví dřív,<br />než si sám ublížíš na trhu
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 leading-relaxed max-w-4xl mx-auto">
            Během dne tě sleduje v reálném čase a varuje před impulsy, revanšem nebo tiltem – ještě předtím, než otevřeš špatný obchod. Začni teď a uvidíš, jak to funguje.
          </p>
        </motion.div>

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <a href="/daily-tracker">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-2xl shadow-blue-900/50 hover:shadow-blue-900/70 transition-all hover:scale-105"
            >
              Začít dnešek – vyplnit stav (30 sekund)
            </Button>
          </a>
        </motion.div>

        {/* Sample Insight Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-md border-red-500/30 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-300 mb-2">Příklad, co ti AI řekne po ztrátě:</p>
                  <p className="text-lg text-white leading-relaxed">
                    "Pozor – tohle je klasický revanšový impuls. Podle tvého plánu pauza 30 minut. Dej si kafe a vrať se s čistou hlavou."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <a href={feature.href}>
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
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Subscription CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/20 p-8 md:p-12"
        >
          <div className="absolute inset-0 opacity-5">
            <div style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} className="w-full h-full" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">PŘEJÍT DO LIVE MÓDU</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-4">
              Odemkni plnou sílu MindTraderu
            </h3>
            <p className="text-xl text-purple-100 mb-6 max-w-3xl">
              Tvá reálná data + ukládání + pokročilá AI analýza + komunita tradera. První měsíc jen <span className="font-bold text-white">1499 Kč</span> (místo 2499 Kč).
            </p>
            <div className="flex flex-wrap gap-4 mb-8 text-purple-100">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✓</span> Neomezené AI insights
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✓</span> Reálný tracking
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✓</span> Komunita
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✓</span> Weekly reviews
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg px-10 py-7 rounded-xl"
              >
                Aktivovat LIVE (1499 Kč/měsíc)
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-400 text-purple-200 hover:bg-purple-900/50 font-semibold text-lg px-10 py-7 rounded-xl"
              >
                Více informací
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
