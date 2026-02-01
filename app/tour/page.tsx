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
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white text-balance leading-tight">
                Trading bez emocí
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300">
                MindTrader AI ti dá systém, který funguje i když tebou cloumají nervy
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-8 py-6 h-auto text-lg rounded-lg shadow-lg shadow-purple-500/30">
                  Začít demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 py-6 h-auto text-lg">
                Více informací
              </Button>
            </div>

            <div className="pt-12 text-slate-400 text-sm">
              <p>🎯 Zdarma • Bez karty • Všechny funkce odemčené</p>
            </div>
          </div>
        </section>

        {/* Why MindTrader Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Proč tohle vlastně existuje</h2>
              <p className="text-slate-400 text-lg">Protože <span className="text-cyan-400">tvůj problém není strategie</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Revenge trading</h3>
                      <p className="text-slate-300 text-sm">Ztratil jsi a chceš to vrátit. Tak obchoduješ hazardéřsky a prohrál jsi 2x víc.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Porušování plánu</h3>
                      <p className="text-slate-300 text-sm">Měl jsi maximálně 3 obchody. Máš 7. Náhle obchoduješ víc a bez logiky.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                      <Brain className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">FOMO a eufória</h3>
                      <p className="text-slate-300 text-sm">Vidíš trade, kterým se vyhneš. Nebo jsi ziskový a risk-on je příliš vysoký.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg flex-shrink-0">
                      <Trophy className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Neznáš příčinu poruch</h3>
                      <p className="text-slate-300 text-sm">Víš, že prohrál jsi, ale nevíš proč. Bez analýzy se to opakuje.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
              <p className="text-slate-200 text-lg">
                <span className="font-bold text-white">90% traderů</span> ztrácí peníze ne kvůli špatné strategii, ale kvůli <span className="text-cyan-400">psychice</span>
              </p>
            </div>

            <div className="text-center">
              <p className="text-slate-400 mb-4">MindTrader AI není další kurz nebo signály.</p>
              <p className="text-white text-xl font-semibold">Je to systém, který analyzuje tvá data a ukazuje ti přesně, kde tě tvoje hlava zabíjí.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Klíčové funkce, které tě posunou dál</h2>
              <p className="text-slate-400 text-lg">Všechno, co potřebuješ pro konzistentní trading</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={idx}
                    className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                    onMouseEnter={() => setHoveredFeature(feature.title)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <CardContent className="p-6 space-y-4 h-full flex flex-col">
                      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg w-fit group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{feature.description}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-cyan-400 font-semibold">{feature.benefit}</p>
                      </div>

                      <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 justify-start pl-0">
                        Vyzkoušet teď <ArrowRight className="ml-auto w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-t border-slate-700/50">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Přejdi do LIVE režimu</h2>
              <p className="text-xl text-slate-300">
                Všechny funkce. Žádné riziko. Registrace zdarma, bez karty.
              </p>
            </div>

            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold px-12 py-7 h-auto text-xl rounded-lg shadow-lg shadow-purple-500/40">
                Začít teď <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>

            <p className="text-slate-400 text-sm">
              Všechny funkce odemčené • Virtual Mode bez rizika • Live upgrade kdykoliv
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
