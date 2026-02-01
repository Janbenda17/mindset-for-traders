"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useData } from "@/contexts/data-context"
import {
  Brain,
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  RefreshCw,
  BarChart3,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react"

const tourSteps = [
  {
    id: "daily-tracker",
    icon: ClipboardCheck,
    title: "Daily Tracker – Tvůj plán na den",
    subtitle: "Začni den správně",
    description: "Tady si napíšeš, za jakých podmínek dnes budeš obchodovat (max riziko, max počet obchodů, emoční hranice). Když to dodržíš, zabráníš si tomu, aby tě emoce převálcovaly.",
    cta: "Vyplň stres + podmínku",
    route: "/daily-tracker",
  },
  {
    id: "ai-assistant",
    icon: Brain,
    title: "MindTrader AI – Tvůj asistent během obchodování",
    subtitle: "Real-time ochrana",
    description: "Během dne ti AI sleduje tvá data v reálném čase. Když začneš porušovat svůj plán nebo se necháš unést emocemi po ztrátě, upozorní tě: 'Počkej, tohle už není podle pravidel.' Pomůže ti zůstat klidný a vědomý.",
    cta: "Simulovat obchod",
    route: "/mindtrader?tab=ai",
  },
  {
    id: "weekly-review",
    icon: BarChart3,
    title: "Weekly Review – Co se stalo za týden",
    subtitle: "Tvoje dlouhodobá cesta",
    description: "Na konci týdne ti appka sama shrne: kolikrát jsi porušil svůj plán, které emoce tě stály nejvíc peněz, kde se opakují stejné chyby. A hlavně – dá ti konkrétní tipy, co příští týden změnit, abys ty chyby opakoval míň.",
    cta: "Zobrazit ukázku",
    route: "/analytics",
  },
  {
    id: "go-live",
    icon: Rocket,
    title: "Přejdi do LIVE režimu",
    subtitle: "Registrace zdarma, 30 sekund",
    description: "Tohle všechno teď běží na testovacích datech. Přepni do LIVE a appka začne pracovat s tvými skutečnými obchody, tvými emocemi a tvými výsledky. Registrace zdarma, bez karty, všechno se uloží.",
    cta: "Přejít do LIVE",
    route: "/auth/signup",
  },
]

export function ProductTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
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

  useEffect(() => {
    if (isVisible) {
      const step = tourSteps[currentStep]
      if (step.route && pathname !== step.route) {
        router.push(step.route)
      }
    }
  }, [currentStep, isVisible, router, pathname])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    localStorage.setItem("mindtrader-product-tour-completed", "true")
    setIsVisible(false)
    router.push("/")
  }

  if (!isVisible) return null

  const step = tourSteps[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const isFirst = currentStep === 0
  const isLast = currentStep === tourSteps.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Galaxy background for mobile */}
      <div className="fixed inset-0 pointer-events-none md:hidden">
        {/* Stars layer */}
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
            radial-gradient(1px 1px at 65% 85%, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1px 1px at 25% 60%, white, transparent),
            radial-gradient(2px 2px at 70% 25%, white, transparent)
          `,
          backgroundSize: '200% 200%',
          animation: 'twinkle 15s ease-in-out infinite'
        }} />
        {/* Nebula effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Desktop subtle orbs */}
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/40 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header s progress */}
        <div className="relative p-3 sm:p-4 md:p-5 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1.5">Krok {currentStep + 1} z {tourSteps.length}</p>
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={completeTour}
              className="ml-3 p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-xl" />
              <div className="relative p-3 sm:p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40">
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">{step.title}</h2>
            {step.subtitle && (
              <p className="text-sm sm:text-base text-cyan-400 font-semibold">{step.subtitle}</p>
            )}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          {/* Features (if available) */}
          {step.features && (
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {step.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-xs text-slate-300"
                >
                  {feature}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center justify-center gap-1 px-4 py-2.5 sm:py-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-lg transition-all text-sm font-medium flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Zpět</span>
            </button>

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all text-sm sm:text-base shadow-lg shadow-cyan-500/20"
            >
              <span>{isLast ? step.cta || "Hotovo" : "Další"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip link */}
          <button
            onClick={completeTour}
            className="w-full text-xs sm:text-sm text-slate-400 hover:text-slate-300 transition-colors py-2"
          >
            Přeskočit tour
          </button>
        </div>
      </div>
    </div>
  )
}
