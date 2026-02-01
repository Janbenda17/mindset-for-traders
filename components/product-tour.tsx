"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useData } from "@/contexts/data-context"
import {
  Brain,
  Calendar,
  BarChart3,
  MessageSquare,
  BookOpen,
  Target,
  Zap,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const tourPages = [
  {
    id: "why",
    title: "Proč MindTrader vznikl?",
    subtitle: "80% traderů selhává kvůli psychologii, ne strategii",
    content: {
      problem: "Většina traderů má solidní strategie, ale stejně ztrácí. Proč? Emoce sabotují každý plán.",
      solution: "MindTrader ti pomůže držet disciplínu, rozpoznat emoční triggery a obchodovat podle plánu, ne podle pocitů.",
      stats: [
        { label: "traderů ztrácí kvůli emocím", value: "80%" },
        { label: "zlepšení po 30 dnech", value: "40%" },
        { label: "snížení impulzivních tradů", value: "65%" },
      ]
    }
  },
  {
    id: "features",
    title: "Co MindTrader obsahuje",
    subtitle: "Nástroje na každý den tvé trading journey",
    features: [
      {
        icon: Calendar,
        title: "Daily Tracker",
        description: "Každé ráno nastavíš podmínky (max risk, počet tradů, emoční hranice). Když se jich držíš, emoce tě nepřeválcují.",
        color: "from-cyan-500 to-blue-500"
      },
      {
        icon: Brain,
        title: "MindTrader AI",
        description: "AI sleduje tvůj stav v real-time. Když začneš porušovat plán nebo se necháš unést, upozorní tě.",
        color: "from-purple-500 to-pink-500"
      },
      {
        icon: BarChart3,
        title: "Weekly Review",
        description: "Každý týden shrnutí: kde jsi chyboval, které emoce tě stály peníze, co změnit příště.",
        color: "from-orange-500 to-red-500"
      },
      {
        icon: BookOpen,
        title: "Trading Journal",
        description: "Zaznamenávej trades včetně emocí. AI ti pak ukáže vzorce a co sabotuje tvé výsledky.",
        color: "from-green-500 to-emerald-500"
      },
      {
        icon: Target,
        title: "Psychology Analytics",
        description: "Data o tiltu, FOMO, revenge tradingu. Vidíš korelaci mezi psychikou a výsledky.",
        color: "from-yellow-500 to-amber-500"
      },
      {
        icon: Zap,
        title: "Gamifikace",
        description: "XP body, level, achievementy. Mentální trénink jako hra – motivace držet disciplínu dlouhodobě.",
        color: "from-indigo-500 to-violet-500"
      }
    ]
  },
  {
    id: "cta",
    title: "Vyzkoušej si MindTrader teď",
    subtitle: "45 sekund, žádná registrace, žádné riziko",
    benefits: [
      "Bez registrace – rovnou do akce",
      "Bez kreditní karty",
      "Virtual Mode – testovací data, nic se neukládá",
      "Všechny funkce dostupné hned",
      "Když se ti to líbí, přepneš na LIVE za 30 sekund"
    ]
  }
]

export function ProductTour() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const router = useRouter()
  const pathname = usePathname()
  const { isLiveMode } = useData()

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
      return
    }

    const tourCompleted = localStorage.getItem("mindtrader-product-tour-completed")
    const showTour = localStorage.getItem("mindtrader-show-tour")

    if (!tourCompleted && showTour === "true" && !isVisible) {
      setIsVisible(true)
      localStorage.removeItem("mindtrader-show-tour")
    }
  }, [pathname, isVisible])

  const handleNext = () => {
    if (currentPage < tourPages.length - 1) {
      setDirection("forward")
      setCurrentPage(currentPage + 1)
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection("backward")
      setCurrentPage(currentPage - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem("mindtrader-product-tour-completed", "true")
    setIsVisible(false)
    router.push("/")
  }

  const skipTour = () => {
    localStorage.setItem("mindtrader-product-tour-completed", "true")
    setIsVisible(false)
  }

  if (!isVisible || isLiveMode) return null

  const page = tourPages[currentPage]
  const isFirst = currentPage === 0
  const isLast = currentPage === tourPages.length - 1
  const progress = ((currentPage + 1) / tourPages.length) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Galaxy background for mobile */}
      <div className="fixed inset-0 pointer-events-none md:hidden">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent),
            radial-gradient(2px 2px at 15% 90%, white, transparent),
            radial-gradient(1px 1px at 75% 40%, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 40% 20%, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1px 1px at 65% 85%, rgba(255, 255, 255, 0.7), transparent)
          `,
          backgroundSize: '200% 200%',
          animation: 'twinkle 15s ease-in-out infinite'
        }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Desktop subtle orbs */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-5xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl my-auto">
        {/* Header with progress */}
        <div className="relative p-4 sm:p-6 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-400 mb-2">Stránka {currentPage + 1} ze {tourPages.length}</p>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={skipTour}
              className="ml-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 md:p-10 min-h-[500px] flex flex-col">
          {/* Page 1: Why */}
          {page.id === "why" && (
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Problém → Řešení</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{page.title}</h2>
                <p className="text-lg sm:text-xl text-cyan-400 font-semibold">{page.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    Problém
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{page.content.problem}</p>
                </div>

                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Řešení
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{page.content.solution}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {page.content.stats.map((stat, idx) => (
                  <div key={idx} className="text-center p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page 2: Features */}
          {page.id === "features" && (
            <div className="space-y-6 flex-1">
              <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{page.title}</h2>
                <p className="text-lg sm:text-xl text-cyan-400">{page.subtitle}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {page.features.map((feature, idx) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={idx}
                      className="group p-5 bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10"
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-20 mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Page 3: CTA */}
          {page.id === "cta" && (
            <div className="space-y-8 flex-1 flex flex-col justify-center items-center text-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-300 mb-4">
                  <TrendingUp className="w-4 h-4" />
                  <span>Začni teď</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{page.title}</h2>
                <p className="text-lg sm:text-xl text-cyan-400">{page.subtitle}</p>
              </div>

              <div className="max-w-md space-y-3">
                {page.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-left p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={completeTour}
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-lg px-10 py-6 h-auto rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Začít v dashboardu
              </Button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePrev}
              disabled={isFirst}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 px-4 sm:px-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Zpět</span>
            </Button>

            <div className="flex gap-2">
              {tourPages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentPage ? "forward" : "backward")
                    setCurrentPage(idx)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentPage 
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 w-8" 
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-4 sm:px-6"
            >
              <span className="hidden sm:inline">{isLast ? "Začít" : "Další"}</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
