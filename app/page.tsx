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
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/80">
                  {language === 'en' ? 'AI-Powered Trading Psychology' : 'AI-Powered Trading Psychology'}
                </span>
              </motion.div>

              {/* Main heading */}
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-tight mb-6 bg-gradient-to-b from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                {language === 'en'
                  ? 'Trade Your Psychology, Not Your Emotions'
                  : 'Obchoduj Svou Psychiku, Ne Své Emoce'}
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                {language === 'en'
                  ? 'MindTrader helps serious traders master their psychology and make consistent, profitable decisions. Stop losing money to emotions.'
                  : 'MindTrader pomáhá vážným traderům zvládnout jejich psychiku a dělat konzistentní, ziskové rozhodnutí. Přestaň ztrácet peníze emocím.'}
              </p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="lg"
                  onClick={handlePricingClick}
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-400/50 font-bold text-base px-8 py-6 rounded-lg border border-cyan-300/20"
                >
                  {language === 'en' ? 'Start Free Trial' : 'Začít zdarma'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-bold text-base px-8 py-6 rounded-lg"
                >
                  {language === 'en' ? 'Watch Demo' : 'Podívej se demo'} <Zap className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                className="flex flex-wrap justify-center gap-8 text-sm text-slate-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {language === 'en' ? '14 day free trial' : '14denní zdarma trial'}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {language === 'en' ? 'No credit card' : 'Bez platební karty'}
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {language === 'en' ? 'Cancel anytime' : 'Zrušit kdykoliv'}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="py-24">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                {language === 'en' ? 'Everything You Need to Trade Better' : 'Vše co potřebuješ k lepšímu obchodování'}
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Comprehensive tools to analyze your psychology and improve your trading performance'
                  : 'Komplexní nástroje pro analýzu tvé psychiky a zlepšení tvého obchodního výkonu'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: language === 'en' ? 'Daily Tracker' : 'Denní Sledování',
                  description: language === 'en'
                    ? 'Track your psychology each morning and understand your trading patterns'
                    : 'Sleduj svou psychiku každé ráno a rozumí svým vzorům',
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Zap,
                  title: language === 'en' ? 'AI Coach' : 'AI Kouč',
                  description: language === 'en'
                    ? 'Real-time AI stops emotional mistakes before they happen'
                    : 'AI kouč v reálném čase zastaví emoční chyby',
                  color: 'from-cyan-500 to-blue-500',
                },
                {
                  icon: TrendingUp,
                  title: language === 'en' ? 'Weekly Review' : 'Týdenní Přezkum',
                  description: language === 'en'
                    ? 'Every Friday: analyze losses and plan for next week'
                    : 'Každý pátek: analyzuj ztráty a plánuj dál',
                  color: 'from-amber-500 to-orange-500',
                },
                {
                  icon: Users,
                  title: language === 'en' ? 'Team Club' : 'Tým Klub',
                  description: language === 'en'
                    ? 'Join a community of serious traders and stay accountable'
                    : 'Připoj se do komunity vážných traderů',
                  color: 'from-green-500 to-emerald-500',
                },
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative p-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
                  >
                    <div className={`mb-4 inline-block p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-300">{feature.description}</p>
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
