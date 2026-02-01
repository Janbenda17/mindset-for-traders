'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Brain, ShieldAlert, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Grid background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(79, 70, 229, 0.05) 25%, rgba(79, 70, 229, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, 0.05) 75%, rgba(79, 70, 229, 0.05) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(79, 70, 229, 0.05) 25%, rgba(79, 70, 229, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, 0.05) 75%, rgba(79, 70, 229, 0.05) 76%, transparent 77%, transparent)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      </div>

      {/* Floating gradient orbs */}
      <motion.div
        className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-md bg-black/30 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Mindtrader
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/product-tour">
            <Button 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md"
              size="sm"
            >
              Zkusit
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto text-center space-y-8 md:space-y-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/50 rounded-full px-4 py-2 backdrop-blur-md">
              <Zap className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">45 sekund zdarma bez limitu</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight"
          >
            <span className="text-white">Software, </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              který tě ochrání
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Mindtrader je nástroj pro každodenní řízení psychiky, disciplíny a rozhodování tradera.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/product-tour">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg px-8 py-7 rounded-xl shadow-2xl shadow-purple-900/40 group"
              >
                Spustit demo ZDARMA
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Three Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mt-16 md:mt-24"
          >
            {[
              {
                icon: Brain,
                title: 'Čtení psychiky',
                desc: 'Analýza emocí v reálném čase během vašich trades'
              },
              {
                icon: ShieldAlert,
                title: 'Varování kód',
                desc: 'Okamžitá upozornění na nebezpečné psychické stavy'
              },
              {
                icon: TrendingUp,
                title: 'Dlouhodobý růst',
                desc: 'Statistiky a insights pro zlepšení výkonu'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                className="group bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom accent gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
    </div>
  )
}
