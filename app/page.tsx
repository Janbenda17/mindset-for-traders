'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Brain, TrendingUp, Users } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()

  const handlePricingClick = () => {
    if (!user) {
      router.push('/signup')
    } else {
      router.push('/upgrade')
    }
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 w-full h-full">
        {/* Animated stars background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950">
          {/* Star field */}
          <div className="absolute inset-0 opacity-50">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: `0 0 ${Math.random() * 3}px rgba(255,255,255,${Math.random()})`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          {/* Nebula glow effects */}
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10"
            animate={{
              x: [0, -30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/3 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <TopNavigation />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="min-h-screen pt-20 pb-20 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-base leading-none">{'\u2B50'}</span>
                <span className="text-sm text-white/80">
                  {language === 'en' ? '#1 Trading Psychology Platform' : '#1 Trading Psychology Platform'}
                </span>
              </motion.div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 bg-gradient-to-b from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent text-balance">
                {language === 'en'
                  ? 'Your brain becomes your biggest advantage'
                  : 'Tvůj mozek se stane tvojí největší výhodou'}
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed text-pretty font-semibold">
                {language === 'en'
                  ? '93% of traders fail because of psychology, not strategy.'
                  : '93% obchodníků padne kvůli psychice, ne kvůli strategii.'}
              </p>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
              >
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-5 text-center">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-white to-cyan-300 bg-clip-text text-transparent mb-1">
                    9/10
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 leading-snug">
                    {language === 'en' ? 'Traders struggle with psychology' : 'Obchodníků má psychické problémy'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-5 text-center">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-white to-cyan-300 bg-clip-text text-transparent mb-1">
                    {'\u2193'}42%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 leading-snug">
                    {language === 'en' ? 'Less revenge trading' : 'Méně revenge tradingu'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-5 text-center">
                  <div className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-white to-cyan-300 bg-clip-text text-transparent mb-1">
                    24/7
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 leading-snug">
                    {language === 'en' ? 'AI analysis of your mindset' : 'AI analýza tvého mindsetu'}
                  </div>
                </div>
              </motion.div>


            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20 max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300">
                  {language === 'en' ? 'Built for traders' : 'Stvořené pro tradery'}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] text-balance">
                {language === 'en' ? (
                  <>
                    Everything you need to{' '}
                    <span className="italic font-serif text-emerald-300">trade better</span>
                  </>
                ) : (
                  <>
                    Vše co potřebuješ k{' '}
                    <span className="italic font-serif text-emerald-300">lepšímu obchodování</span>
                  </>
                )}
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed text-pretty">
                {language === 'en'
                  ? 'Four pillars working together to rewire your trading mindset and hold you accountable every single day.'
                  : 'Čtyři pilíře, které spolupracují na přenastavení tvého obchodního mindsetu a drží tě v disciplíně každý den.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
              {[
                {
                  icon: Brain,
                  number: '01',
                  title: language === 'en' ? 'Daily Tracker' : 'Denní Sledování',
                  description: language === 'en'
                    ? 'Track your psychology each morning and understand your trading patterns'
                    : 'Sleduj svou psychiku každé ráno a rozumí svým vzorům',
                },
                {
                  icon: Zap,
                  number: '02',
                  title: language === 'en' ? 'AI Coach' : 'AI Kouč',
                  description: language === 'en'
                    ? 'Real-time AI stops emotional mistakes before they happen'
                    : 'AI kouč v reálném čase zastaví emoční chyby',
                },
                {
                  icon: TrendingUp,
                  number: '03',
                  title: language === 'en' ? 'Weekly Review' : 'Týdenní Přezkum',
                  description: language === 'en'
                    ? 'Every Friday: analyze losses and plan for next week'
                    : 'Každý pátek: analyzuj ztráty a plánuj dál',
                },
                {
                  icon: Users,
                  number: '04',
                  title: language === 'en' ? 'Team Club' : 'Tým Klub',
                  description: language === 'en'
                    ? 'Join a community of serious traders and stay accountable'
                    : 'Připoj se do komunity vážných traderů',
                },
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="group relative p-10 bg-slate-950 hover:bg-slate-900 transition-colors duration-300"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-white/10 bg-white/5 text-emerald-300 group-hover:border-emerald-400/40 group-hover:text-emerald-400 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs tracking-widest text-slate-600 group-hover:text-emerald-400/60 transition-colors">
                        {feature.number}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-base text-slate-400 leading-relaxed max-w-sm">
                      {feature.description}
                    </p>
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-emerald-400 group-hover:w-full transition-all duration-500" />
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="py-24 text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              {language === 'en' ? 'Ready to Trade Better?' : 'Připraven obchodovat lépe?'}
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              {language === 'en'
                ? 'Start your free 14-day trial today. Full access to all features. No credit card required.'
                : 'Začni svůj 14denní zdarma trial dnes. Plný přístup ke všem funkcím. Bez platební karty.'}
            </p>
            <Button
              size="lg"
              onClick={handlePricingClick}
              className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-400/50 font-bold text-base px-10 py-6 rounded-lg border border-cyan-300/20"
            >
              {language === 'en' ? 'Get Started Free' : 'Začít zdarma'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
