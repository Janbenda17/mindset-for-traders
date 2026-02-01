'use client'

import { useState, useEffect } from 'react'
import { TopNavigation } from '@/components/top-navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Zap, Target, Users, ArrowRight, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data
  const stats = [
    {
      title: 'Měsíční Readiness',
      value: '78%',
      change: '+5%',
      icon: Zap,
      color: 'from-purple-500 to-indigo-600',
      desc: 'Psychologická připravenost'
    },
    {
      title: 'Konzistence',
      value: '85%',
      change: '+12%',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      desc: 'Dodržování plánu'
    },
    {
      title: 'Win Rate',
      value: '62%',
      change: '+3%',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-600',
      desc: 'Úspěšné obchody'
    },
    {
      title: 'Komunita',
      value: '1,234',
      change: '+89',
      icon: Users,
      color: 'from-orange-500 to-red-600',
      desc: 'Aktivní tradera'
    }
  ]

  const quickActions = [
    {
      title: 'Denní Tracking',
      desc: 'Zaznamenej si svůj mentální stav',
      icon: Zap,
      href: '/daily-tracker',
      color: 'purple'
    },
    {
      title: 'Analytics',
      desc: 'Podívej se na svůj pokrok',
      icon: BarChart3,
      href: '/analytics',
      color: 'blue'
    },
    {
      title: 'Journal',
      desc: 'Zaznamenej své obchody',
      icon: Target,
      href: '/journal',
      color: 'green'
    },
    {
      title: 'MindTrader AI',
      desc: 'Poraď se s umělou inteligencí',
      icon: Zap,
      href: '/mindtrader',
      color: 'indigo'
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <TopNavigation />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Tvůj Trading Dashboard
          </h1>
          <p className="text-lg text-slate-400">
            Sleduj svůj psychický vývoj a dosahuj lepších výsledků
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium text-slate-300">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500">{stat.desc}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Rychlé akce</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a href={action.href}>
                  <Card className="bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer h-full hover:bg-slate-800/50">
                    <CardContent className="p-6 flex flex-col items-start justify-start h-full">
                      <div className={`p-3 rounded-lg mb-4 bg-${action.color}-500/20`}>
                        <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        {action.desc}
                      </p>
                      <div className="mt-auto">
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
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
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/20 p-8 md:p-12"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">UPGRADE</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Odemkni full potenciál MindTraderu
              </h3>
              <p className="text-lg text-slate-300 mb-4">
                Získej přístup k pokročilé AI analýze, komunitu tradera a exkluzivní insights. Začni s 7 dny zdarma.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Neomezené analyzy
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> AI coaching
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Komunita
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold w-full md:w-auto whitespace-nowrap"
              >
                Začít premium <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800/50 w-full md:w-auto"
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
