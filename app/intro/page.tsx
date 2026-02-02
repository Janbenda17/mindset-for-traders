"use client"

import { motion } from "framer-motion"
import { TopNavigation } from "@/components/top-navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, Target, Zap, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function IntroPage() {
  const features = [
    {
      icon: Brain,
      title: "Psychologie tradingu",
      description: "90% ztráty na trzích není o znalosti techniky, ale o kontrole emocí a mindset. Tady to měníme."
    },
    {
      icon: Target,
      title: "Identifikuj své vzorce",
      description: "Pomocí AI odhalujeme tvoje opakující se chyby - FOMO, Revenge Trading, Greed a další psychologické pasti."
    },
    {
      icon: Zap,
      title: "Okamžitá zpětná vazba",
      description: "Real-time analýzy, která tě zastaví dříve, než bys udělal impulsivní rozhodnutí."
    },
    {
      icon: Award,
      title: "Strukturovaný progres",
      description: "Jede z chaotické strategie na disciplínovaný trading plán se měřitelnými výsledky."
    }
  ]

  const stats = [
    { value: "+600", label: "Traderů", highlight: "kteří zmapovali svůj mindset" },
    { value: "1900+", label: "Chyb zachráněno", highlight: "emočními rozhodnutími" },
    { value: "-42%", label: "Snížení chyb", highlight: "v průměru za 3 měsíce" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      
      {/* Animated background blobs */}
      <div className="fixed top-1/4 -left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/3 -right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <TopNavigation />

      {/* Main Content */}
      <div className="relative z-10 pt-40 px-4 md:px-8 lg:px-12 pb-20 max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
            <Brain className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-200 font-semibold">Psychologická revoluce v tradingu</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Proč MindTrader vznikl?
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-200/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            Ztratil jsi v tradingu peníze? Věděl jsi přesně co se stalo, ale stejně ses to zopakoval? 
            To není tvůj problém v technice - je to v psychologii.
          </p>

          <Link href="/pricing">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/50"
            >
              Zjistit více
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Problem & Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24"
        >
          {/* Problem */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 md:p-12">
            <div className="text-3xl font-black text-red-400 mb-4">❌ Problém</div>
            <ul className="space-y-4 text-red-100/80">
              <li className="flex gap-3">
                <span className="text-red-400">→</span>
                <span><strong>Emoční obchody:</strong> FOMO, strach, touha se pomstít</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400">→</span>
                <span><strong>Bez reflexe:</strong> Opakuješ stejné chyby bez analýzy</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400">→</span>
                <span><strong>Izolace:</strong> Máš pocit, že si tím projdeš sám</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400">→</span>
                <span><strong>Bez směru:</strong> Strategie bez psychologické přípravy</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-8 md:p-12">
            <div className="text-3xl font-black text-green-400 mb-4">✓ MindTrader Řešení</div>
            <ul className="space-y-4 text-green-100/80">
              <li className="flex gap-3">
                <span className="text-green-400">→</span>
                <span><strong>Monitoring:</strong> AI tě varuje, než vstoupíš do impulsivního obchodu</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400">→</span>
                <span><strong>Analýza vzorců:</strong> Vidíš jasně, kde se duplikuješ</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400">→</span>
                <span><strong>Komunita:</strong> 600+ traderů s stejným cílem</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400">→</span>
                <span><strong>Plán nápravy:</strong> Konkrétní kroky na cestu disciplíny</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-24"
        >
          <h2 className="text-4xl font-black text-center mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Jak to funguje
          </h2>
          <p className="text-center text-purple-200/60 mb-12 text-lg">
            Čtyři pilíře k ovládnutí tvého trading mindset
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/40 transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-purple-200/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-24"
        >
          <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Již se stalo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
              >
                <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  {stat.value}
                </div>
                <div className="text-lg font-bold text-white mb-2">{stat.label}</div>
                <div className="text-purple-200/60 text-sm">{stat.highlight}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Jsi připraven změnit svůj trading?
            </h2>
            <p className="text-xl text-purple-200/80 mb-8 max-w-2xl mx-auto">
              Začneme s mapováním tvého mindset, analýzou tvých chyb a vytvoříme plán na cestu k disciplínovanému, ziskovému tradingu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-10 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/50 w-full sm:w-auto"
                >
                  Aktivovat Premium
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-400 text-purple-300 hover:bg-purple-900/40 font-bold px-10 py-6 text-lg rounded-xl w-full sm:w-auto"
                >
                  Zpět domů
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
