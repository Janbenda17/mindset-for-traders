"use client"

import { useState } from "react"
import { Brain, ClipboardCheck, BarChart3, BookOpen, RefreshCw, Trophy, TrendingUp, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const features = [
  {
    icon: ClipboardCheck,
    title: "Daily Tracker",
    description: "Naplánuj si den – podmínky, emoce, max riziko. Když to dodržíš, emoce tě nepřeválcují.",
    benefit: "Disciplína před tradingem"
  },
  {
    icon: Brain,
    title: "MindTrader AI",
    description: "Reálný čas sleduje tvůj stav. Upozorní tě, když se necháš unést nebo porušíš vlastní pravidla.",
    benefit: "Real-time ochrana"
  },
  {
    icon: BookOpen,
    title: "Trading Journal",
    description: "Zapisuj obchody + emoce. AI propojí data a ukáže opakující se vzorce.",
    benefit: "Zjistit co sabotuje"
  },
  {
    icon: BarChart3,
    title: "Psychology Analytics",
    description: "Grafy a čísla – kde tě emoce stojí nejvíc peněz a jak se zlepšuješ.",
    benefit: "Data o tvé psychice"
  },
  {
    icon: BookOpen,
    title: "Weekly Review",
    description: "Automatické shrnutí týdne: co šlo špatně, co dobře a co změnit příště.",
    benefit: "Dlouhodobý progress"
  },
  {
    icon: RefreshCw,
    title: "Loss Reset Protocol",
    description: "Krok-za-krokem návod po ztrátě – reset emocí bez revenge.",
    benefit: "Zastavit spirálu"
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Body, úrovně a odměny za konzistentní chování – trading jako hra, kterou vyhraješ.",
    benefit: "Motivace dlouhodobě"
  }
]

export default function TourPage() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Galaxy background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-0">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white text-balance leading-tight">
                Trading bez emocí
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 text-balance">
                MindTrader AI ti dá systém, který funguje i když tebou cloumají nervy
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-8">
              <Link href="/">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 h-auto text-base sm:text-lg rounded-lg shadow-lg shadow-purple-500/30 active:scale-95 sm:hover:scale-105">
                  Začít demo <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 px-6 sm:px-8 py-5 sm:py-6 h-auto text-base sm:text-lg">
                Více informací
              </Button>
            </div>

            <div className="pt-8 sm:pt-12 text-slate-400 text-xs sm:text-sm">
              <p>🎯 Zdarma • Bez karty • Všechny funkce odemčené</p>
            </div>
          </div>
        </section>

        {/* Why MindTrader Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Proč to dělat?</h2>
              <p className="text-xs sm:text-sm text-slate-400">Tvůj problém není strategie, ale <span className="text-cyan-400 font-semibold">psychika</span></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-red-500/20 rounded flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">Revenge trading</h3>
                      <p className="text-slate-300 text-xs">Ztráta → hazardérství → 2x větší ztráta</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-orange-500/20 rounded flex-shrink-0">
                      <Zap className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">Porušování plánu</h3>
                      <p className="text-slate-300 text-xs">3 plánované → 7 emočních obchodů</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-yellow-500/20 rounded flex-shrink-0">
                      <Brain className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">FOMO a eufória</h3>
                      <p className="text-slate-300 text-xs">Vidíš všechno → riziko je moc vysoké</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-pink-500/20 rounded flex-shrink-0">
                      <Trophy className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">Bez analýzy</h3>
                      <p className="text-slate-300 text-xs">Neznáš proč prohrál → se to opakuje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/40 rounded-lg p-4 text-center mt-6">
              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-bold text-white"><span className="text-green-400 text-2xl">90%</span> traderů</p>
                <p className="text-xs sm:text-sm text-slate-200">ztrácí kvůli <span className="text-cyan-300 font-semibold">emocím</span>, ne strategii</p>
              </div>
            </div>

            <div className="text-center space-y-1 mt-6">
              <p className="text-slate-400 text-xs sm:text-sm">MindTrader = systém, který tě varuje před vlastní psychikou</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Co dostaneš v LIVE módu</h2>
              <p className="text-xs sm:text-sm text-slate-400">7 klíčových funkcí pro konzistentní trading</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={idx}
                    className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group active:scale-95 sm:hover:scale-105"
                  >
                    <CardContent className="p-2.5 space-y-1.5 h-full flex flex-col">
                      <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded w-fit group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <h3 className="text-xs font-semibold text-white leading-tight">{feature.title}</h3>
                        <p className="text-xs text-slate-400 leading-tight">{feature.description}</p>
                      </div>

                      <p className="text-xs text-cyan-300 font-semibold pt-1 border-t border-slate-700/50">{feature.benefit}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-t border-slate-700/50">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Přejdi do LIVE režimu</h2>
              <p className="text-xs sm:text-sm text-slate-300">Všechny funkce zdarma • Bez karty • Upgrade kdykoliv</p>
            </div>

            <Link href="/">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 h-auto text-sm sm:text-base rounded-lg shadow-lg shadow-purple-500/40 active:scale-95 sm:hover:scale-105">
                Začít teď <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
