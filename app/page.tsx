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

        {/* Trust & Credibility Section - Real proof */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h3 className="text-lg sm:text-xl font-bold text-purple-300 mb-6">
            {language === 'en' ? 'Why traders choose MindTrader' : 'Proč si obchodníci vybírají MindTrader'}
          </h3>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
            <div className="px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm flex items-center gap-2">
              <span className="text-green-400">✓</span> {language === 'en' ? 'Free 14-day trial' : 'Zdarma 14 dní'}
            </div>
            <div className="px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm flex items-center gap-2">
              <span className="text-blue-400">✓</span> {language === 'en' ? 'No credit card needed' : 'Bez platební karty'}
            </div>
            <div className="px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm flex items-center gap-2">
              <span className="text-purple-400">✓</span> {language === 'en' ? 'Cancel anytime' : 'Zrušit kdykoliv'}
            </div>
          </div>

          {/* Demo Mode Proof */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/30 max-w-xl mx-auto">
            <p className="text-sm text-purple-100 mb-3">
              {language === 'en' 
                ? 'Test the full platform free with 28 days of realistic trading data. See exactly how it works before you decide.'
                : 'Otestuj celou platformu zdarma s 28 dny reálných dat. Vidíš přesně jak to funguje.'}
            </p>
            <p className="text-xs text-purple-200 italic">
              {language === 'en'
                ? 'No risk. No promises. Just pure functionality.'
                : 'Žádné riziko. Žádné sliby. Jen čistá funkčnost.'}
            </p>
          </div>
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

        {/* Simple Features Grid - With SHORT descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon
            const descriptions: Record<string, Record<string, string>> = {
              'daily-tracker': {
                en: 'Track your morning psychology each day. See when you have edge.',
                cs: 'Sleduj psychiku každé ráno. Vidíš kdy máš edge.'
              },
              'mindtrader-ai': {
                en: 'AI coach in real-time. Stops FOMO, revenge trading, emotions.',
                cs: 'AI kouč v reálném čase. Zastaví FOMO, revenge, emoce.'
              },
              'weekly-review': {
                en: 'Every Friday: see losses, get AI analysis, plan next week.',
                cs: 'Každý pátek: vidíš chyby, AI analýza, plán na týden.'
              },
              'fail-log': {
                en: 'All losses in one place. Understand why. Don\'t repeat mistakes.',
                cs: 'Všechny ztráty na místě. Pochop proč. Neopakovaš chyby.'
              },
              'team-club': {
                en: 'Community of traders. Share, discuss, accountability. Not alone.',
                cs: 'Komunita traderů. Sdílení, diskuse, zodpovědnost.'
              }
            }
            
            const desc = descriptions[feature.id]?.[language] || feature.description
            
            return (
              <div key={feature.id} className="group p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 border border-purple-500/30 hover:border-purple-400/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                <div className="mb-4 p-3 bg-purple-500/20 rounded-lg w-fit group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-purple-100/80 leading-relaxed">{desc}</p>
              </div>
            )
          })}
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
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center py-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            {language === 'en' ? 'Ready to become top 7%?' : 'Připraven se stát top 7%?'}
          </h2>
          <p className="text-base sm:text-lg text-purple-100/80 mb-8 max-w-xl mx-auto">
            {language === 'en'
              ? 'Only psychology is left. You have the strategy. First 30 days are tough. Then it runs on autopilot.'
              : 'Zbývá jen psychika. Máš strategii. Prvních 30 dní bude těžko. Pak to jede na autopilota.'}
          </p>
          <Button
            size="lg"
            onClick={handlePricingClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-12 py-6 rounded-xl"
          >
            {language === 'en' ? 'Start Free - 14 Days' : 'Začít zdarma - 14 dní'} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
