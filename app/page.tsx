'use client'

import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Brain, TrendingUp, Users } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        {/* Base */}
        <div className="absolute inset-0 bg-slate-950" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(217, 70, 239, 0.1), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.08), transparent 50%)',
          }}
        />

        {/* Soft emerald glow top */}
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18), transparent 60%)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Sparse starfield */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
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
                className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-400">
                  {language === 'en' ? '#1 Trading Psychology Platform' : '#1 Trading Psychology Platform'}
                </span>
              </motion.div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 text-white text-balance">
                {language === 'en' ? (
                  <>
                    Your brain becomes your{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">biggest advantage</span>
                  </>
                ) : (
                  <>
                    Tvůj mozek se stane tvojí{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">největší výhodou</span>
                  </>
                )}
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed text-pretty font-medium">
                {language === 'en'
                  ? '93% of traders fail because of psychology, not strategy.'
                  : '93% obchodníků padne kvůli psychice, ne kvůli strategii.'}
              </p>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 max-w-3xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
              >
                <div className="bg-slate-950 px-6 py-8 text-center">
                  <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">
                    9<span className="text-fuchsia-500">/</span>10
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 leading-snug">
                    {language === 'en' ? 'Traders struggle with psychology' : 'Obchodníků má psychické problémy'}
                  </div>
                </div>
                <div className="bg-slate-950 px-6 py-8 text-center">
                  <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">
                    <span className="text-fuchsia-500">{'\u2193'}</span>42%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 leading-snug">
                    {language === 'en' ? 'Less revenge trading' : 'Méně revenge tradingu'}
                  </div>
                </div>
                <div className="bg-slate-950 px-6 py-8 text-center">
                  <div className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">
                    24<span className="text-fuchsia-500">/</span>7
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
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-400">
                  {language === 'en' ? 'Built for traders' : 'Stvořené pro tradery'}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] text-balance">
                {language === 'en' ? (
                  <>
                    Everything you need to{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">trade better</span>
                  </>
                ) : (
                  <>
                    Vše co potřebuješ k{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">lepšímu obchodování</span>
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
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-white/10 bg-white/5 text-fuchsia-400 group-hover:border-fuchsia-500/40 group-hover:text-fuchsia-500 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs tracking-widest text-slate-600 group-hover:text-fuchsia-500/60 transition-colors">
                        {feature.number}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-base text-slate-400 leading-relaxed max-w-sm">
                      {feature.description}
                    </p>
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-fuchsia-500 group-hover:w-full transition-all duration-500" />
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-24"
          >
            <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden p-12 sm:p-16 text-center">
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(217, 70, 239, 0.25), transparent 60%)',
                }}
              />
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] text-balance">
                  {language === 'en' ? (
                    <>
                      Ready to <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">trade better</span>?
                    </>
                  ) : (
                    <>
                      Připraven <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">obchodovat lépe</span>?
                    </>
                  )}
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  {language === 'en'
                    ? 'Start your free 14-day trial today. Full access to all features. No credit card required.'
                    : 'Začni svůj 14denní zdarma trial dnes. Plný přístup ke všem funkcím. Bez platební karty.'}
                </p>
                <Button
                  size="lg"
                  onClick={handlePricingClick}
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-400 hover:to-purple-500 font-bold text-base px-8 py-6 rounded-lg shadow-lg shadow-fuchsia-500/30 border border-white/10"
                >
                  {language === 'en' ? 'Get Started Free' : 'Začít zdarma'}{' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
