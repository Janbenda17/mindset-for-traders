"use client"

import { useState, useEffect } from "react"
import { Brain, Calendar, BarChart3, BookOpen, Sparkles, ArrowRight, Play, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStartDemo = () => {
    localStorage.removeItem("mindtrader-product-tour-completed")
    localStorage.setItem("mindtrader-show-tour", "true")
    router.push("/product-tour")
  }

  const features = [
    {
      icon: Calendar,
      title: "Daily Tracker",
      description: "Naplánuj si den – napiš si podmínky, za kterých budeš dnes obchodovat. Když to dodržíš, emoce tě nepřeválcují.",
      gradient: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-400",
    },
    {
      icon: Brain,
      title: "MindTrader AI",
      description: "Během dne ti AI sleduje tvůj stav v reálném čase. Upozorní tě, když se necháš unést emocemi nebo porušíš plán.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: BarChart3,
      title: "Weekly Review",
      description: "Na konci týdne dostaneš přehled: kde jsi chyboval, které emoce tě stály peníze a co změnit příště.",
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-400",
    },
    {
      icon: BookOpen,
      title: "Další funkce",
      description: "Trading journal, psych analytika, gamifikace – vše čeká v LIVE režimu.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MindTrader AI</span>
          </div>
          <Button onClick={handleStartDemo} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Začít
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left - Text Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300">
                <Sparkles className="w-4 h-4" />
                <span>Vyzkoušej celý software zdarma</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight">
                Vyzkoušej si celý software{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ZDARMA
                </span>{" "}
                <span className="block">ve virtuálním režimu</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed">
                Uvidíš, jak ti AI pomáhá s emocemi, denním plánem a týdenním review.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <Button
                  onClick={handleStartDemo}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Vyzkoušej si MindTrader
                </Button>

                <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center lg:justify-start gap-2 sm:gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    Bez registrace
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    Bez karty
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    Bezpečně
                  </span>
                </p>
              </div>
            </div>

            {/* Right - Animated Feature Showcase */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur-3xl" />
              <div className="relative space-y-4">
                {/* Animated cards */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-5 shadow-2xl hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white">Daily Tracker</span>
                  </div>
                  <p className="text-sm text-slate-400">Naplánuj si den podle podmínek</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-5 shadow-2xl hover:scale-105 transition-transform ml-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white">AI Asistent</span>
                  </div>
                  <p className="text-sm text-slate-400">Real-time sledování tvého stavu</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-orange-500/30 rounded-xl p-5 shadow-2xl hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white">Weekly Review</span>
                  </div>
                  <p className="text-sm text-slate-400">Shrnutí chyb a tipů na zlepšení</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
              Co tě čeká ve virtuálním módu
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-400">
              Vyzkoušej všechny klíčové funkce
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="group bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all hover:shadow-xl cursor-pointer active:scale-95 sm:hover:scale-105"
                onClick={handleStartDemo}
              >
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 group-hover:translate-x-1 transition-transform text-xs sm:text-sm"
                  >
                    Vyzkoušet teď
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl sm:rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs sm:text-sm text-blue-300">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Přejdi na LIVE</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Přepni do LIVE režimu
                </h2>

                <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto">
                  Registrace zdarma (30 sekund), bez karty. Všechny funkce čekají.
                </p>

                <div className="flex flex-col gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                  <Button
                    onClick={() => router.push("/auth/signup")}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto rounded-xl shadow-lg transition-all active:scale-95 sm:hover:scale-105"
                  >
                    Přejít do LIVE režimu
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={handleStartDemo}
                    variant="outline"
                    className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto rounded-xl"
                  >
                    Pokračovat v demu
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 pt-2 sm:pt-4">
                  Beta uživatelé: <span className="text-green-400 font-semibold">35–55 %</span> snížení chyb za měsíc
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2024 MindTrader AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
