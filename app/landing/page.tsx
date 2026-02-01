'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Target, TrendingUp, Users, Zap, AlertTriangle, BarChart3, ChevronRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
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

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-4xl text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 bg-gradient-to-r from-purple-200 via-white to-indigo-200 bg-clip-text text-transparent">
              Proč MindTrader AI vznikl
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 leading-relaxed">
              Většina toolů se zaměřuje na <span className="text-white font-bold">"co obchodovat"</span>
            </p>
            <p className="text-2xl md:text-3xl text-purple-100 leading-relaxed mt-4">
              Ale problém je v <span className="text-red-400 font-bold">psychice</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-16"
          >
            {[
              { icon: AlertTriangle, text: 'Impulsivní rozhodnutí', color: 'from-red-500 to-orange-500' },
              { icon: Target, text: 'Porušování plánu', color: 'from-orange-500 to-yellow-500' },
              { icon: Brain, text: 'Špatný mentální stav', color: 'from-purple-500 to-pink-500' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mx-auto`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-semibold text-lg">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-8"
          >
            <ChevronRight className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
          </motion.div>
        </div>
      </motion.section>

      {/* Section 2: Co MindTrader dělá jinak */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              Co MindTrader AI dělá <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">jinak</span>
            </h2>
            <p className="text-xl text-purple-200">
              Fokus na pochopení chyb, vzorců a mentálních patternů
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Pochopení chyb',
                desc: 'Nejen sledujeme chyby, ale analyzujeme proč se staly a jak jim předejít',
                icon: Brain,
                gradient: 'from-purple-500 to-indigo-600'
              },
              {
                title: 'Identifikace vzorců',
                desc: 'AI rozpoznává opakující se mentální patterny a varuje před rizikovými situacemi',
                icon: TrendingUp,
                gradient: 'from-indigo-500 to-blue-600'
              },
              {
                title: 'Konkrétní plán',
                desc: 'Poskytujeme konkrétní kroky pro zlepšení, ne jen obecné rady',
                icon: Target,
                gradient: 'from-blue-500 to-cyan-600'
              },
              {
                title: 'Konzistence',
                desc: 'Systematický přístup k budování disciplíny a dlouhodobých návyků',
                icon: Zap,
                gradient: 'from-cyan-500 to-teal-600'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-purple-200 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Jak to funguje v praxi */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-6xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              Jak to funguje <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">v praxi</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                title: 'Daily Tracker',
                desc: 'Trackuje tvůj mentální stav před, během a po tradingu',
                detail: 'Denní check-in ti pomáhá rozpoznat, kdy jsi v nejlepším stavu pro trading',
                icon: BarChart3,
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Práce s chybami',
                desc: 'Identifikuje vzorce v tvých chybách a poskytuje feedback',
                detail: 'AI analyzuje tvé obchody a rozpozná opakující se mentální patterny',
                icon: AlertTriangle,
                gradient: 'from-pink-500 to-red-500'
              },
              {
                title: 'AI Insight',
                desc: 'Poskytuje konkrétní doporučení na základě tvých dat',
                detail: 'Personalizovaný feedback na míru tvým potřebám a vzorcům chování',
                icon: Brain,
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                title: 'Community Support',
                desc: 'Spojuje tradery s podobnými výzvami',
                detail: 'Sdílej zkušenosti a uč se od ostatních, kteří řeší stejné problémy',
                icon: Users,
                gradient: 'from-blue-500 to-indigo-500'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all group">
                  <div className="flex items-start gap-8">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-xl text-purple-200 mb-2">{item.desc}</p>
                      <p className="text-lg text-purple-300/70 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </div>
                {i < 3 && (
                  <div className="flex justify-center my-6">
                    <ChevronRight className="w-8 h-8 text-purple-400 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Pro koho MindTrader AI je */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-12">
              Pro koho je <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">MindTrader AI</span>
            </h2>

            <div className="space-y-6">
              {[
                'Víš, že problém není ve strategii, ale v psychice',
                'Chceš systematický přístup k mentální disciplíně',
                'Opakuješ stejné chyby a nevíš proč',
                'Potřebuješ nástroj, který tě udrží na správné cestě'
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-left group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0" />
                    <p className="text-xl text-white font-medium">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Jak můžeš začít */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-12">
              Jak můžeš <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">začít</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { step: '01', title: 'Virtuální mód', desc: 'Vyzkoušej bez rizika, naučíš se nástroj používat', icon: Zap },
              { step: '02', title: 'LIVE mód', desc: 'Aplikuj na reálné obchody a sleduj výsledky', icon: TrendingUp },
              { step: '03', title: 'Dlouhodobě', desc: 'Buduj disciplínu a konzistenci v dlouhodobém horizontu', icon: Target }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 text-8xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-purple-200 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <Link href="/mindtrader">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl px-16 py-8 rounded-full shadow-2xl shadow-blue-900/50 hover:shadow-blue-900/70 transition-all"
                >
                  Začít s MindTrader AI
                </Button>
              </motion.div>
            </Link>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-2xl text-purple-200 italic max-w-2xl mx-auto leading-relaxed"
            >
              "Trading je cesta, kterou musíš projít sám.<br />
              Ale nemusíš být na to sám."
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
