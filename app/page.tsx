'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { Calendar, Brain, TrendingUp, AlertCircle, Users, ArrowRight, Zap } from 'lucide-react'
import { DailyTrackerPreview } from '@/components/feature-previews/daily-tracker-preview'
import { MindTraderAIPreview } from '@/components/feature-previews/mindtrader-ai-preview'
import { WeeklyReviewPreview } from '@/components/feature-previews/weekly-review-preview'
import { FailLogPreview } from '@/components/feature-previews/fail-log-preview'
import { TeamClubPreview } from '@/components/feature-previews/team-club-preview'

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

  const features = [
    {
      id: 'daily-tracker',
      title: 'Daily Tracker',
      href: '/daily-tracker',
      icon: Calendar,
      preview: DailyTrackerPreview,
    },
    {
      id: 'mindtrader-ai',
      title: 'AI Coach',
      href: '/mindtrader-ai',
      icon: Brain,
      preview: MindTraderAIPreview,
    },
    {
      id: 'weekly-review',
      title: 'Weekly Review',
      href: '/weekly-review',
      icon: TrendingUp,
      preview: WeeklyReviewPreview,
    },
    {
      id: 'fail-log',
      title: 'Fail Log',
      href: '/fail-log',
      icon: AlertCircle,
      preview: FailLogPreview,
    },
    {
      id: 'team-club',
      title: 'Team Club',
      href: '/team-club',
      icon: Users,
      preview: TeamClubPreview,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <TopNavigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6">
              {language === 'en' 
                ? 'Trade your psychology, not just markets'
                : 'Obchoduj svou psychiku, ne jen trhy'}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              {language === 'en'
                ? 'Stop losing money to emotions. MindTrader analyzes your mindset in real-time and helps you make consistent, profitable decisions.'
                : 'Přestaň ztrácet peníze emocím. MindTrader analyzuje tvoji psychiku v reálném čase a pomáhá ti dělat konzistentní, ziskové rozhodnutí.'}
            </p>

            <Button
              size="lg"
              onClick={handlePricingClick}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-base px-8 py-6 rounded-lg"
            >
              {language === 'en' ? 'Start Free Trial' : 'Začít zdarma'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Trust Section */}
        <div className="text-center mb-20 py-12 border-y border-slate-800">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-6">
            {language === 'en' ? 'Why traders choose MindTrader' : 'Proč si obchodníci vybírají MindTrader'}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-300">
            <div>
              <p className="text-2xl font-bold text-white">14 days</p>
              <p className="text-sm text-slate-400">{language === 'en' ? 'Free trial' : 'Zdarma'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Full access</p>
              <p className="text-sm text-slate-400">{language === 'en' ? 'All features' : 'Všechny funkce'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Cancel anytime</p>
              <p className="text-sm text-slate-400">{language === 'en' ? 'No commitment' : 'Žádný závazek'}</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-white mb-4">
                {features[0].title}
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                {language === 'en'
                  ? 'Track your psychology each morning. Understand your patterns. Trade only when you have edge.'
                  : 'Sleduj svou psychiku každé ráno. Rozumí tvým vzorům. Obchoduj jen když máš výhodu.'}
              </p>
              <Link href={features[0].href}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  {language === 'en' ? 'Explore' : 'Prozkoumat'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden"
            >
              <DailyTrackerPreview />
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden order-2 md:order-1"
            >
              <MindTraderAIPreview />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl font-black text-white mb-4">
                {features[1].title}
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                {language === 'en'
                  ? 'Real-time AI coach stops you before making emotional mistakes. FOMO, revenge trading, panic—it catches them all.'
                  : 'AI kouč v reálném čase tě zastaví před emočními chybami. FOMO, revenge trading, paniku—chytá všechny.'}
              </p>
              <Link href={features[1].href}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  {language === 'en' ? 'Explore' : 'Prozkoumat'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-white mb-4">
                {features[2].title}
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                {language === 'en'
                  ? 'Every Friday: review your losses, get AI analysis, understand what went wrong, and plan for next week.'
                  : 'Každý pátek: přezkumi ztráty, získej AI analýzu, rozumí co se stalo, a plánuj příští týden.'}
              </p>
              <Link href={features[2].href}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  {language === 'en' ? 'Explore' : 'Prozkoumat'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden"
            >
              <WeeklyReviewPreview />
            </motion.div>
          </div>

          {/* Feature 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden order-2 md:order-1"
            >
              <FailLogPreview />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl font-black text-white mb-4">
                {features[3].title}
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                {language === 'en'
                  ? 'Log all your losses. Understand the root cause. Is it your strategy or your psychology? This distinction changes everything.'
                  : 'Loguj všechny ztráty. Rozumí příčině. Je to tvoje strategie nebo psychika? Tento rozdíl všechno mění.'}
              </p>
              <Link href={features[3].href}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  {language === 'en' ? 'Explore' : 'Prozkoumat'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Feature 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-white mb-4">
                {features[4].title}
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                {language === 'en'
                  ? 'Join a private community of serious traders. Share wins, ask questions, get mentorship, and stay accountable.'
                  : 'Připoj se do privátní komunity vážných traderů. Sdílej vítězství, ptej se, získej mentorství, zůstaň zodpovědný.'}
              </p>
              <Link href={features[4].href}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                  {language === 'en' ? 'Explore' : 'Prozkoumat'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden"
            >
              <TeamClubPreview />
            </motion.div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center py-20 border-t border-slate-800"
        >
          <h2 className="text-4xl font-black text-white mb-4">
            {language === 'en' ? 'Ready to trade better?' : 'Připraven obchodovat lépe?'}
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            {language === 'en'
              ? 'Start your 14-day free trial today. Full access to all features. No credit card required.'
              : 'Začni svůj 14 denní zdarma trial dnes. Plný přístup ke všem funkcím. Bez platební karty.'}
          </p>
          <Button
            size="lg"
            onClick={handlePricingClick}
            className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-base px-8 py-6 rounded-lg"
          >
            {language === 'en' ? 'Get Started Free' : 'Začít zdarma'} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
              
              return (
                <Link key={feature.id} href={feature.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={`group p-6 rounded-xl bg-gradient-to-br ${colors[idx]} transition-all hover:shadow-lg hover:shadow-${['blue', 'purple', 'pink', 'indigo', 'emerald'][idx]}-500/30 h-full cursor-pointer`}
                  >
                    <div className={`mb-4 p-3 ${bgColors[idx]} rounded-lg w-fit group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${iconColors[idx]}`} />
                    </div>
                    <h3 className="font-bold text-white text-base mb-3">{feature.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                      <span>{language === 'en' ? 'Explore' : 'Prozkoumat'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center py-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            {language === 'en' ? 'Ready to improve your trading?' : 'Připraven zlepšit svůj trading?'}
          </h2>
          <p className="text-base sm:text-lg text-purple-100/80 mb-8 max-w-xl mx-auto">
            {language === 'en'
              ? 'Test the full platform free for 14 days. No credit card needed. See exactly how it works.'
              : 'Otestuj platformu zdarma 14 dní. Bez platební karty. Vidíš přesně jak to funguje.'}
          </p>
          <Button
            size="lg"
            onClick={handlePricingClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-12 py-6 rounded-xl"
          >
            {language === 'en' ? 'Start Free Trial' : 'Začít zdarma'} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
