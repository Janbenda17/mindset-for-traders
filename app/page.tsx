"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  BarChart3, 
  BookOpen, 
  TrendingDown,
  Check,
  Moon,
  Sun,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Sparkles,
      title: "Ráno – Daily Tracker",
      description: "Vyplníš emoce a plán dne – AI ti hned řekne tvůj stav.",
      link: "/daily-tracker"
    },
    {
      icon: Brain,
      title: "Během dne – MindTrader AI",
      description: "Sleduje tě v reálném čase a varuje před chybami.",
      link: "/mindtrader"
    },
    {
      icon: BarChart3,
      title: "Po tradech – Journal + Analytics",
      description: "Vidíš přesně, kde tě emoce stojí peníze.",
      link: "/analytics"
    },
    {
      icon: BookOpen,
      title: "Konec týdne – Weekly Review",
      description: "Shrnutí chyb + plán, co změnit příště.",
      link: "/weekly-review"
    },
    {
      icon: TrendingDown,
      title: "Po ztrátě – Loss Reset",
      description: "Rychlý reset emocí, abys nešel do revanše.",
      link: "/loss-reset"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MindTrader AI
            </span>
          </div>
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-purple-900/20 to-transparent"></div>
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: `radial-gradient(2px 2px at 20% 30%, rgba(59, 130, 246, 0.3), transparent),
                               radial-gradient(2px 2px at 60% 70%, rgba(139, 92, 246, 0.3), transparent),
                               radial-gradient(3px 3px at 50% 50%, rgba(59, 130, 246, 0.2), transparent),
                               radial-gradient(2px 2px at 80% 10%, rgba(139, 92, 246, 0.3), transparent)`,
              backgroundSize: "200% 200%",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent">
              AI, který tě uchrání
              <br />
              před tvou hlavou
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-slate-300 max-w-4xl mx-auto px-4"
          >
            Analyzuje tvé emoce v reálném čase a varuje tě před chybami – ještě předtím, než ztratíš peníze.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto px-4"
          >
            Žádné kurzy. Žádné signály. Jen tvá data + AI coach, který tě učí obchodovat podle plánu.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-4 sm:pt-8 space-y-4"
          >
            <Link href="/product-tour">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg sm:text-2xl py-6 sm:py-8 px-8 sm:px-12 rounded-xl shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300 group"
              >
                Spustit demo ZDARMA (45 sekund)
                <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500">
              Bez registrace • Bez karty • Vidíš všechno hned
            </p>
          </motion.div>

          {/* Mock Video/Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 sm:mt-16 relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400 mx-auto animate-pulse" />
                  <p className="text-lg sm:text-xl font-semibold text-slate-300">
                    Demo Video Loop
                  </p>
                  <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
                    Daily Tracker → AI insight "Riziko 68% – pauza doporučena" → Weekly Review graf
                  </p>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16 space-y-2 sm:space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Takhle to vypadá v praxi
            </h2>
            <p className="text-base sm:text-lg text-slate-400">
              Za 30 sekund – 5 klíčových momentů tvého dne
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 group">
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl w-fit group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all">
                      <feature.icon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <Link href={feature.link} className="block mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 justify-between group/btn"
                      >
                        Vyzkoušet teď
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade CTA Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500/40 p-8 sm:p-12 lg:p-16 backdrop-blur-sm">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
            
            <div className="relative z-10 text-center space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Připraven na svá reálná data?
              </h2>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-3xl mx-auto">
                Ve virtuálním modu vidíš ukázku. V LIVE režimu to běží na tvých obchodech – ukládání, denní tipy, personalizace.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/pricing">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-xl sm:text-2xl lg:text-3xl py-8 sm:py-10 px-10 sm:px-16 rounded-2xl shadow-2xl shadow-purple-500/40 hover:scale-105 transition-transform duration-300"
                  >
                    Přejít do LIVE – 1499 Kč/měsíc
                  </Button>
                </Link>
                
                <Link href="/product-tour">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-slate-500 text-slate-200 hover:bg-slate-800/50 text-base sm:text-lg py-6 sm:py-8 px-8 sm:px-12 rounded-xl"
                  >
                    Ještě zůstanu v demu
                  </Button>
                </Link>
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-sm sm:text-base text-slate-300 font-semibold">
                  Early Bird: prvních 50 lidí jen 1499 Kč (místo 2499 Kč)
                </p>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Zrušit kdykoliv</span>
                  <span className="mx-2">•</span>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Bez závazků</span>
                  <span className="mx-2">•</span>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>14 dní zdarma</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="relative py-8 px-4 sm:px-6 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Brain className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">MindTrader AI</span>
          </div>
          <p className="text-sm text-slate-500">
            První AI nástroj čistě na trading psychologii
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
