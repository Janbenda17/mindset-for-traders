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

  // Translations
  const translations = {
    cs: {
      daily_tracker_title: 'Daily Tracker',
      daily_tracker_desc: 'Zaznamenáš své psychické stav každé ráno. AI vidí kdy máš edge, kdy ne. Výsledek: méně ztrátových dní.',
      daily_tracker_highlight: '5x lepší rozhodnutí',
      
      mindtrader_title: 'AI Coach',
      mindtrader_desc: 'Chceš FOMO? Revenge trade? Zeptej se. AI ti zabrání psychickým chybám v reálném čase.',
      mindtrader_highlight: 'Zastaň emoce',
      
      weekly_review_title: 'Weekly Review',
      weekly_review_desc: 'Každý pátek vidíš svá selhání. AI ti řekne je-li to strategie či psychika. Máš konkrétní plán na další týden.',
      weekly_review_highlight: 'Učení z chyb',
      
      fail_log_title: 'Fail Log',
      fail_log_desc: 'Všechny ztráty na jednom místě. AI analyzuje proč. Chybná strategie nebo psychika? Neopakuj stejné chyby.',
      fail_log_highlight: 'Neobraňuj ego',
      
      team_club_title: 'Team Club',
      team_club_desc: 'Komunita top traderů. Sdílení obchodů, diskuse, accountability. Nejsi sám.',
      team_club_highlight: 'Komunita > solo',
      
      cta_text: 'Zbývá jen psychika. Máš strategii. První 30 dní budou těžké. Pak to jede na autopilota.',
      cta_button: 'Začít zdarma - 14 dní',
    },
    en: {
      daily_tracker_title: 'Daily Tracker',
      daily_tracker_desc: 'Log your psychological state each morning. AI shows you when you have edge and when you don\'t. Result: fewer losing days.',
      daily_tracker_highlight: '5x better decisions',
      
      mindtrader_title: 'AI Coach',
      mindtrader_desc: 'Have FOMO? Tempted to revenge trade? Ask. AI stops you from making emotional mistakes in real-time.',
      mindtrader_highlight: 'Stop emotions',
      
      weekly_review_title: 'Weekly Review',
      weekly_review_desc: 'Every Friday see your failures. AI tells you if it\'s strategy or psychology. Get a concrete action plan.',
      weekly_review_highlight: 'Learn from losses',
      
      fail_log_title: 'Fail Log',
      fail_log_desc: 'All losses in one place. AI analyzes why. Bad strategy or bad psychology? Don\'t repeat mistakes.',
      fail_log_highlight: 'Don\'t protect ego',
      
      team_club_title: 'Team Club',
      team_club_desc: 'Community of top traders. Share trades, discuss, accountability. You\'re not trading alone.',
      team_club_highlight: 'Community > solo',
      
      cta_text: 'Only psychology is left. You have the strategy. First 30 days are tough. Then it runs on autopilot.',
      cta_button: 'Start Free - 14 Days',
    }
  }
  }

  const t = (key: string) => translations[language][key as keyof typeof translations['cs']] || key

  const features = [
    {
      id: 1,
      title: t('daily_tracker_title'),
      description: t('daily_tracker_desc'),
      preview: DailyTrackerPreview,
      icon: Calendar,
      href: '/daily-tracker',
      highlight: t('daily_tracker_highlight')
    },
    {
      id: 2,
      title: t('mindtrader_title'),
      description: t('mindtrader_desc'),
      preview: MindTraderAIPreview,
      icon: Brain,
      href: '/mindtrader',
      highlight: t('mindtrader_highlight')
    },
    {
      id: 3,
      title: t('weekly_review_title'),
      description: t('weekly_review_desc'),
      preview: WeeklyReviewPreview,
      icon: TrendingUp,
      href: '/weekly-review',
      highlight: t('weekly_review_highlight')
    },
    {
      id: 4,
      title: t('fail_log_title'),
      description: t('fail_log_desc'),
      preview: FailLogPreview,
      icon: AlertCircle,
      href: '/fail-log',
      highlight: t('fail_log_highlight')
    },
    {
      id: 5,
      title: t('team_club_title'),
      description: t('team_club_desc'),
      preview: TeamClubPreview,
      icon: Users,
      href: '/find-partner',
      highlight: t('team_club_highlight')
    }
  ]

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

      <TopNavigation />

      {/* Trial Banner */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-yellow-900/80 to-orange-900/80 backdrop-blur-sm border-b border-yellow-500/30 py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="text-yellow-100 text-xs md:text-sm font-medium">
            {language === 'en' ? '14 days free' : '14 days free'}
          </span>
          <Button 
            onClick={handlePricingClick}
            size="sm" 
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-7 px-2.5"
          >
            {language === 'en' ? 'Upgrade' : 'Upgrade'}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 pt-48 px-4 md:px-8 lg:px-12 pb-20 max-w-6xl mx-auto">
        {/* Hero Section - More Compelling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-block mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/50 backdrop-blur-sm"
          >
            <span className="text-purple-300 font-semibold text-sm">⭐ #1 Trading Psychology Platform</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
              {language === 'en' ? 'Your mind will become your greatest advantage' : 'Tvůj mozek se stane tvojí největší výhodou'}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 leading-relaxed max-w-3xl mx-auto font-semibold mb-6">
            <span className="text-red-400 font-black">{language === 'en' ? '93% of traders' : '93% obchodníků'}</span> {language === 'en' ? 'fail because of psychology, not strategy.' : 'padne kvůli psychice, ne kvůli strategii.'}
          </p>
          <p className="text-base sm:text-lg text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            {language === 'en' ? 'MindTrader analyzes your emotions in real-time, detects your weaknesses and stops you before you make a catastrophic mistake.' : 'MindTrader analyzuje tvoje emoce v reálném čase, detekuje tvá slabá místa a zastaví tě, než uděláš katastrofální chybu.'}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center items-center gap-4 mb-20 flex-wrap"
        >
          {[
            { number: '9/10', label: language === 'en' ? 'of traders have psychological issues' : 'Obchodníků má psychické problémy' },
            { number: '↓42%', label: language === 'en' ? 'Less revenge trading' : 'Méně revenge tradingu' },
            { number: '24/7', label: language === 'en' ? 'AI analysis of your mindset' : 'AI analýza tvého mindetu' }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 text-center w-full sm:w-auto sm:min-w-[200px]">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{stat.number}</p>
              <p className="text-xs sm:text-sm text-purple-200 mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Simple Features Grid - Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.id} href={feature.href}>
                <div className="group p-5 rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 hover:border-purple-400/60 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 h-full">
                  <div className="mb-3 p-2.5 bg-purple-500/20 rounded-lg w-fit group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{feature.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-6">
            {language === 'en' ? 'Explore MindTrader in Demo Mode' : 'Prozkoumat MindTrader v Demo režimu'}
          </h2>
          <p className="text-base text-purple-100/80 mb-8 max-w-lg mx-auto">
            {language === 'en' 
              ? 'Test-drive with 28 days of realistic data. See exactly how the software works before going live.' 
              : 'Vyzkoušej s 28 dny reálných dat. Vidíš jak software funguje před tím než půjdeš live.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/daily-tracker">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                <Zap className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Try Demo' : 'Vyzkoušej Demo'}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-purple-400/60 text-purple-300 hover:bg-purple-500/10">
                {language === 'en' ? 'Go Live' : 'Přejít na Live'}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* CTA Section - More Compelling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center py-16 mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            {language === 'en' ? 'Ready to become' : 'Připraven se stát'} <span className="text-gradient bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{language === 'en' ? 'top 7%?' : 'top 7%?'}</span>
          </h2>
          <p className="text-lg text-purple-200/80 max-w-2xl mx-auto mb-8">
            {t('cta_text')}
          </p>
          <Button
            size="lg"
            onClick={handlePricingClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-12 py-6 rounded-xl"
          >
            {t('cta_button')} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Premium Upgrade Banner - Only show for authenticated users */}
        {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-yellow-900/60 via-yellow-800/40 to-orange-900/60 border-2 border-yellow-400/60 p-8 md:p-12 shadow-2xl shadow-yellow-500/30 mt-16"
        >
          {/* Golden glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-400/5" />
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 text-center">
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              {language === 'en' ? 'Premium:' : 'Premium:'} <span className="text-yellow-300">{language === 'en' ? 'Ending soon' : 'Končí brzy'}</span>
            </h3>
            <p className="text-lg md:text-2xl text-yellow-50 mb-8 font-semibold">
              {language === 'en' ? 'Only' : 'Jen'} <span className="text-yellow-300 text-3xl">1499 Kč</span> ({language === 'en' ? 'instead of' : 'místo'} <span className="text-yellow-200 line-through">2499 Kč</span>)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-black text-lg px-10 py-7 rounded-xl shadow-lg shadow-yellow-500/50"
                onClick={handlePricingClick}
              >
                {language === 'en' ? 'Activate LIVE' : 'Aktivovat LIVE'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-900/40 font-bold text-lg px-10 py-7 rounded-xl"
                onClick={handlePricingClick}
              >
                {language === 'en' ? 'More info' : 'Více informací'}
              </Button>
            </div>
          </div>
        </motion.div>
        )}
      </div>
    </div>
  )
}
