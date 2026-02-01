"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, BarChart3, BookOpen, Target, RefreshCw, Play } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function LandingPage() {
  const router = useRouter()
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  const handleStartDemo = () => {
    router.push("/intro")
  }

  const features = [
    {
      icon: Target,
      title: "Ráno – Daily Tracker",
      description: "Vyplníš emoce a plán dne – AI ti hned řekne tvůj stav.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Během dne – MindTrader AI",
      description: "Sleduje tě v reálném čase a varuje před chybami.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Po tradech – Journal + Analytics",
      description: "Vidíš přesně, kde tě emoce stojí peníze.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: BarChart3,
      title: "Konec týdne – Weekly Review",
      description: "Shrnutí chyb + plán, co změnit příště.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: RefreshCw,
      title: "Po ztrátě – Loss Reset",
      description: "Rychlý reset emocí, abys nešel do revanše.",
      gradient: "from-red-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/50 border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MindTrader AI
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI, který ti zachrání účet
              </span>
              <br />
              <span className="text-white">před tvou hlavou</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-slate-300 leading-relaxed">
              Analyzuje tvé emoce v reálném čase a varuje tě před chybami – ještě předtím, než ztratíš peníze.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed">
              Žádné kurzy. Žádné signály. Jen tvá data + AI, který tě učí obchodovat podle plánu.
            </p>

            <div className="pt-4 sm:pt-6 space-y-4">
              <Button
                onClick={handleStartDemo}
                size="lg"
                className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl px-6 sm:px-8 md:px-10 lg:px-12 py-6 sm:py-7 md:py-8 h-auto rounded-xl shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Spustit demo ZDARMA (45 sekund)
              </Button>

              <p className="text-xs sm:text-sm text-slate-500 text-center lg:text-left">
                Bez registrace • Bez karty • Vidíš všechno hned
              </p>
            </div>
          </motion.div>

          {/* Right - Video/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-purple-500/20">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400 mx-auto animate-pulse" />
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base text-slate-400">Daily Tracker → AI Insight</p>
                    <p className="text-base sm:text-lg font-semibold text-white">&quot;Tvé riziko impulsivních rozhodnutí je 68%&quot;</p>
                    <p className="text-xs sm:text-sm text-cyan-400">→ Pauza doporučena</p>
                  </div>
                </div>
              </div>
              {/* Mockup frame */}
              <div className="absolute inset-0 border-8 border-slate-900 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={featuresRef} className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
              Takhle to vypadá v praxi
            </h2>
            <p className="text-sm sm:text-base text-slate-400">Za 30 sekund pochopíš celý systém</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer space-y-3 sm:space-y-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto`}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>

                    <div className="text-center space-y-2">
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>

                    <Button
                      onClick={handleStartDemo}
                      variant="ghost"
                      className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs sm:text-sm"
                    >
                      Vyzkoušet teď
                      <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section ref={ctaRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={ctaInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative">
            {/* Gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl" />
            
            {/* Main content */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16">
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Připraven na svá reálná data?
                </h2>

                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
                  Ve virtuálním módu vidíš ukázku. V LIVE režimu to běží na tvých obchodech – ukládání, denní tipy, personalizace.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
                  <Button
                    onClick={() => router.push("/auth/signup")}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl px-8 sm:px-12 md:px-14 lg:px-16 py-6 sm:py-8 md:py-9 lg:py-10 h-auto rounded-xl shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 active:scale-95"
                  >
                    Přejít do LIVE – 1499 Kč/měsíc
                  </Button>

                  <Button
                    onClick={handleStartDemo}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-10 py-5 sm:py-6 md:py-7 h-auto rounded-xl transition-all hover:scale-105 active:scale-95"
                  >
                    Ještě zůstanu v demu
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 pt-2 sm:pt-4">
                  Early Bird: prvních 50 lidí jen <span className="text-green-400 font-semibold">1499 Kč</span> (místo 2499 Kč) • Zrušit kdykoliv
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-slate-500">
          <p>&copy; 2024 MindTrader AI. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  )
}
