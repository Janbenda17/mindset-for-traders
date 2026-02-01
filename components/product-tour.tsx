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
    id: "welcome",
    icon: Sparkles,
    title: "Vítej v MindTraderu",
    subtitle: "Mentální hra. Obchody. Výsledky.",
    description: "Jako každý sport má trading svou mentální hru. MindTrader ti učí hrát ji lépe.",
    cta: "Začít",
    route: null,
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Přehled tvého stavu, XP a streaks. Vše na jednom místě.",
    route: "/",
  },
  {
    id: "ai-coach",
    icon: MessageSquare,
    title: "MindTrader AI",
    description: "Tvůj AI coach. Zadej emoci, dostaneš radu. Snížíš ztráty o 30-50%.",
    route: "/mindtrader?tab=ai",
  },
  {
    id: "daily-tracker",
    icon: ClipboardCheck,
    title: "Daily Tracker",
    description: "Check-in stavu předtím než začneš tradovat. 30 sekund.",
    route: "/daily-tracker",
  },
  {
    id: "trading-diary",
    icon: BookOpen,
    title: "Trading Journal",
    description: "Zaznamenej emocesem. AI ti ukáže, co sabotuje výsledky.",
    route: "/journal",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Psychology Analytics",
    description: "Data o tvé psychice. Kde ztácíš, proč ztácíš.",
    route: "/analytics",
  },
  {
    id: "loss-reset",
    icon: RefreshCw,
    title: "Loss Reset",
    description: "Stopni se po ztrátě. Žádný revenge trading.",
    route: "/loss-reset",
  },
  {
    id: "finish",
    icon: Rocket,
    title: "Hotovo!",
    description: "Všechny funkce jsou tvoje. Virtual Mode bez rizika.",
    cta: "Začít",
    route: null,
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
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header s progress */}
        <div className="relative p-4 md:p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-slate-400">Krok {currentStep + 1}/{tourSteps.length}</p>
              <div className="h-1 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={completeTour}
              className="ml-4 p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-3 md:p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Icon className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">{step.title}</h2>
            {step.subtitle && (
              <p className="text-sm text-cyan-400 font-medium">{step.subtitle}</p>
            )}
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 md:pt-6">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg font-medium transition-all text-sm md:text-base"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Zpět</span>
            </button>

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-sm md:text-base"
            >
              <span>{isLast ? step.cta : "Dál"}</span>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Skip link */}
          <button
            onClick={completeTour}
            className="w-full text-xs md:text-sm text-slate-400 hover:text-slate-300 transition-colors py-2"
          >
            Přeskočit tour
          </button>
        </div>
      </div>
    </div>
  )
}
