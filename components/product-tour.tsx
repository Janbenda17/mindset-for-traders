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
    description: "Tvůj AI coach. Emocí → rada. 30-50% méně ztrát.",
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
    description: "Zaznamenej emoce. AI ti ukáže, co sabotuje výsledky.",
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
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/30 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header s progress */}
        <div className="relative p-3 sm:p-4 md:p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1">
              <p className="text-xs text-slate-400">Krok {currentStep + 1}/{tourSteps.length}</p>
              <div className="h-1 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={completeTour}
              className="ml-3 p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-2.5 sm:p-3 md:p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-cyan-400" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-1.5 sm:space-y-2 text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">{step.title}</h2>
            {step.subtitle && (
              <p className="text-xs sm:text-sm text-cyan-400 font-medium">{step.subtitle}</p>
            )}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-3 sm:pt-4 md:pt-6">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded transition-all text-xs sm:text-sm flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded font-medium transition-all text-xs sm:text-sm md:text-base"
            >
              <span className="truncate">{isLast ? step.cta || "Hotovo" : "Dál"}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>

          {/* Skip link */}
          <button
            onClick={completeTour}
            className="w-full text-xs text-slate-400 hover:text-slate-300 transition-colors py-1.5 sm:py-2"
          >
            Přeskočit
          </button>
        </div>
      </div>
    </div>
  )
}
