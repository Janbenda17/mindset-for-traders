'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { motion } from 'framer-motion'
import { Calendar, Brain, TrendingUp, AlertCircle, Users, ArrowRight } from 'lucide-react'
import { DailyTrackerPreview } from '@/components/feature-previews/daily-tracker-preview'
import { MindTraderAIPreview } from '@/components/feature-previews/mindtrader-ai-preview'
import { WeeklyReviewPreview } from '@/components/feature-previews/weekly-review-preview'
import { FailLogPreview } from '@/components/feature-previews/fail-log-preview'
import { TeamClubPreview } from '@/components/feature-previews/team-club-preview'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  const handlePricingClick = () => {
    if (!user) {
      router.push('/signup')
    } else {
      router.push('/upgrade')
    }
  }

  const features = [
    {
      id: 1,
      title: 'Daily Tracker',
      description: 'Každé ráno zaznamenáš svůj psychologický stav v 30 sekund. AI detekuje tvoje optimální trading okna. Vidíš patterns kdy máš best edge a kdy bys měl sedět. Výsledek? Méně ztracených dní a 5x přesnější rozhodnutí. Jsme oba věděli že psychika rozhoduje. Teď ji máš pod kontrolou.',
      preview: DailyTrackerPreview,
      icon: Calendar,
      href: '/daily-tracker',
      highlight: '5x přesnější rozhodnutí'
    },
    {
      id: 2,
      title: 'MindTrader AI',
      description: 'Tvůj 24/7 personal trading coach. Máš FOMO po losu v profitu? Post to. Revenge trading tě taká? Ptej se. AI analyzuje tvůj psychologický stav v reálném čase a dáva ti konkrétní, science-based rady. Nejde o motivační hovnášky - jde o to zastavit tě než uděláš katastrofální chybu z emocí.',
      preview: MindTraderAIPreview,
      icon: Brain,
      href: '/mindtrader',
      highlight: 'Realtime psychologické rady'
    },
    {
      id: 3,
      title: 'Weekly Review',
      description: 'Každý pátek se podíváš zpět. AI ti ukáže tvá slabá místa, win rate, psychologické vzorce. Vidíš kde konkrétně padáš - zda je to strategické selhání, psychologické, nebo prostě pořádné kořalství. Pak dostaneš konkrétní, akční plán co měnit příští týden. Progress bez BS.',
      preview: WeeklyReviewPreview,
      icon: TrendingUp,
      href: '/weekly-review',
      highlight: 'AI poznatky + akční plán'
    },
    {
      id: 4,
      title: 'Fail Log',
      description: 'Zaznamenáš všechny své prohry s kontextem. AI analyzuje jestli to byla strategie, psychika, nebo hloupá chyba. Učíš se z každé ztráty. Fail Log tě učí být lepší trader - bez zástupy stejných chyb znovu. Sem patří všechny prohry. Nechraň si ego.',
      preview: FailLogPreview,
      icon: AlertCircle,
      href: '/fail-log',
      highlight: 'Nechraň si egem - nauč se!'
    },
    {
      id: 5,
      title: 'Team Club',
      description: 'Připoj se k elitní komunitě top 1% tradingů. Sdílej obchody, diskutuj strategie a learn z ostatních. Accountability + kolektivní moudrost = exponenciální růst. Solo trading je pro lenivce. V klubu se vyvíjíš a vyměňuješ si nápady s nejlepšími.',
      preview: TeamClubPreview,
      icon: Users,
      href: '/find-partner',
      highlight: 'Komunita > Solo trading'
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
            14 dní zdarma
          </span>
          <Button 
            onClick={handlePricingClick}
            size="sm" 
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-7 px-2.5"
          >
            Upgrade
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
              Tvůj mozek se stane<br />tvojí největší výhodou
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 leading-relaxed max-w-3xl mx-auto font-semibold mb-6">
            <span className="text-red-400 font-black">93% obchodníků</span> padne kvůli psychice, ne kvůli strategii.
          </p>
          <p className="text-base sm:text-lg text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            MindTrader analyzuje tvoje emoce v reálném čase, detekuje tvá slabá místa a zastaví tě, než uděláš katastrofální chybu.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        >
          {[
            { number: '9/10', label: 'Obchodníků má psychické problémy' },
            { number: '↓42%', label: 'Méně revenge tradingu' },
            { number: '24/7', label: 'AI analýza tvého mindetu' }
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 text-center">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{stat.number}</p>
              <p className="text-xs sm:text-sm text-purple-200 mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Stack - Text Left, Image Right */}
        <div className="space-y-12 md:space-y-16 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={feature.href}>
                  <div className="group grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
                    {/* Text Content - Left or Right based on index */}
                    <div className={isEven ? 'md:col-start-1' : 'md:col-start-2 md:order-2'}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg backdrop-blur-sm border border-purple-400/50 flex-shrink-0">
                          <Icon className="w-6 h-6 text-purple-300" />
                        </div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
                            {feature.title}
                          </h2>
                        </div>
                      </div>
                      
                      {/* Highlight Badge */}
                      {feature.highlight && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mb-4 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50"
                        >
                          <span className="text-sm font-bold text-yellow-300">✨ {feature.highlight}</span>
                        </motion.div>
                      )}
                      
                      <p className="text-base md:text-lg text-purple-100/90 leading-relaxed mb-6">
                        {feature.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-purple-300 font-semibold group-hover:gap-3 transition-all">
                        <span>Vyzkoušej</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Preview Container - Right or Left based on index */}
                    <div className={isEven ? 'md:col-start-2 md:order-2' : 'md:col-start-1 md:order-1'}>
                      <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/50 h-64 sm:h-80 md:h-96">
                        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-950">
                          {feature.preview && <feature.preview />}
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40" />
                        </div>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 group-hover:translate-x-full" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section - More Compelling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center py-16 mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            Připraven se stát <span className="text-gradient bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">top 7%?</span>
          </h2>
          <p className="text-lg text-purple-200/80 max-w-2xl mx-auto mb-8">
            Zbývá ti jen psychika. Strategie máš. Počítej s tím že prvních 30 dní bude tvrdé. Pak už to poplují na automatiku.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg px-12 py-7 rounded-xl shadow-lg shadow-purple-500/50"
              onClick={handlePricingClick}
            >
              Spustit Zdarma (14 dní) →
            </Button>
          </motion.div>
        </motion.div>

        {/* Premium Upgrade Banner */}
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
              Premium: <span className="text-yellow-300">Končí brzy</span>
            </h3>
            <p className="text-lg md:text-2xl text-yellow-50 mb-8 font-semibold">
              Jen <span className="text-yellow-300 text-3xl">1499 Kč</span> (místo <span className="text-yellow-200 line-through">2499 Kč</span>)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-black text-lg px-10 py-7 rounded-xl shadow-lg shadow-yellow-500/50"
                onClick={handlePricingClick}
              >
                Aktivovat LIVE
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-900/40 font-bold text-lg px-10 py-7 rounded-xl"
                onClick={handlePricingClick}
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
