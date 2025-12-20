"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  RefreshCw,
  Star,
  BarChart3,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  Eye,
} from "lucide-react"

const tourSteps = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Vítej v MindTraderu",
    subtitle: "Tohle je tvoje mentální základna pro trading.",
    description: "Projdeme si společně klíčové funkce, které ti pomohou stát se disciplinovanějším traderem.",
    cta: "Začít tour",
    route: null,
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "Tvůj denní přehled",
    description:
      "Tady budeš sledovat svůj psychologický stav, XP a denní připravenost. Dashboard ti řekne, jak jsi dnes mentálně na trading.",
    highlight: "Readiness Score • XP Level • Denní statistiky",
    route: "/",
  },
  {
    id: "daily-tracker",
    icon: ClipboardCheck,
    title: "Daily Tracker",
    subtitle: "Ranní check-in",
    description:
      "Každý den vyplníš pár informací o spánku, stresu, energii a rutinách. AI ti vypočítá Readiness Score a doporučí, zda obchodovat.",
    highlight: "Spánek • Stres • Energie • Focus",
    route: "/daily-tracker",
  },
  {
    id: "ai-coach",
    icon: MessageSquare,
    title: "AI Coach (MindTrader AI)",
    subtitle: "Tvůj mentální navigátor",
    description:
      "Zde můžeš mluvit s AI koučem. Pomůže ti při frustraci, FOMO, euforii nebo pochybnostech. Je to tvůj mentální navigátor.",
    highlight: "24/7 podpora • Personalizované rady • Emoční analýza",
    route: "/mindtrader-ai",
  },
  {
    id: "trading-diary",
    icon: BookOpen,
    title: "Trading Deník",
    subtitle: "Více než jen čísla",
    description: "Sem si zapisuješ obchody a hlavně emoce. MindTrader sleduje tvé psychologické chyby, ne jen čísla.",
    highlight: "Emoce • Psychologické vzorce • Sebereflexe",
    route: "/journal",
  },
  {
    id: "loss-reset",
    icon: RefreshCw,
    title: "Loss Reset Protocol",
    subtitle: "Zastavení spirály",
    description:
      "Když přijde ztráta, aktivuje se Reset Mode: krátká rutina, která tě vrátí do klidu a zastaví revenge trading.",
    highlight: "Dýchání • Meditace • Reset myšlení",
    route: "/loss-reset",
  },
  {
    id: "xp-system",
    icon: Star,
    title: "XP & Level systém",
    subtitle: "Gamifikace disciplíny",
    description: "Za disciplínu získáváš XP. Levely odemykají nové funkce a posouvají tě k MindMaster úrovni.",
    highlight: "XP za akce • 10 levelů • Odměny",
    route: "/rewards",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics",
    subtitle: "Data-driven insights",
    description: "Zde uvidíš korelace mezi tvou psychikou a výsledky. Čím víc dat, tím chytřejší MindTrader bude.",
    highlight: "Psychika vs. P&L • Trendy • AI doporučení",
    route: "/analytics",
  },
  {
    id: "live-mode",
    icon: Rocket,
    title: "Připraven na Live?",
    subtitle: "Závazek k disciplíně",
    description: "Až budeš připraven, můžeš přejít do LIVE režimu. Ten už nelze vrátit – je to závazek k disciplíně.",
    highlight: "Reálná data • Plný tracking • Premium funkce",
    route: "/settings",
  },
  {
    id: "finish",
    icon: Brain,
    title: "Tohle je MindTrader",
    subtitle: "Teď si vše můžeš vyzkoušet",
    description: "Virtual Mode ti umožňuje prozkoumat všechny funkce bez rizika. Až budeš připraven, přejdi na Live.",
    cta: "Dokončit tour",
    route: null,
  },
]

export function ProductTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const showTour = localStorage.getItem("mindtrader-show-tour") // Declare showTour variable

  useEffect(() => {
    console.log("[v0] ProductTour: pathname =", pathname)

    // Don't show tour on teaser, login, signup pages
    if (pathname === "/teaser" || pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
      console.log("[v0] ProductTour: Skipping tour on auth pages")
      return
    }

    const tourCompleted = localStorage.getItem("mindtrader-product-tour-completed")
    const isVirtualMode = localStorage.getItem("trading-mode") === "virtual"

    console.log("[v0] ProductTour: tourCompleted =", tourCompleted)
    console.log("[v0] ProductTour: showTour =", showTour)
    console.log("[v0] ProductTour: isVirtualMode =", isVirtualMode)

    if (!tourCompleted) {
      if (showTour === "true" && !isVisible) {
        console.log("[v0] ProductTour: Starting tour!")
        setIsVisible(true)
        localStorage.removeItem("mindtrader-show-tour")
      } else if (isVisible) {
        console.log("[v0] ProductTour: Tour already running, keeping visible")
        // Tour is already running, don't hide it
      }
    }
  }, [showTour, localStorage.getItem("mindtrader-product-tour-completed")]) // Use showTour directly

  // Navigate to step route when step changes
  useEffect(() => {
    if (isVisible && !isMinimized && !isNavigating) {
      const step = tourSteps[currentStep]
      if (step.route && pathname !== step.route) {
        setIsNavigating(true)
        router.push(step.route)
        setTimeout(() => setIsNavigating(false), 500)
      }
    }
  }, [currentStep, isVisible, isMinimized, router, pathname, isNavigating])

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

  const handleSkip = () => {
    completeTour()
  }

  const completeTour = () => {
    localStorage.setItem("mindtrader-product-tour-completed", "true")
    if (!localStorage.getItem("trading-mode")) {
      localStorage.setItem("trading-mode", "virtual")
      console.log("[v0] Virtual mode ensured after tour completion")
    }
    setIsVisible(false)
    router.push("/")
  }

  // Start tour function that can be called externally
  const startTour = () => {
    setCurrentStep(0)
    setIsVisible(true)
    setIsMinimized(false)
  }

  if (!isVisible) return null

  const step = tourSteps[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const isWelcomeOrFinish = step.route === null

  // Minimized floating button
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[100] bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-4 py-3 rounded-full shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all hover:scale-105"
      >
        <Brain className="w-5 h-5" />
        Pokračovat v tour ({currentStep + 1}/{tourSteps.length})
      </button>
    )
  }

  // Welcome and Finish screens - fullscreen
  if (isWelcomeOrFinish) {
    return (
      <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-cyan-400 animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animationDelay: Math.random() * 3 + "s",
                animationDuration: Math.random() * 3 + 2 + "s",
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Nebula effects */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* Progress */}
          <div className="absolute top-6 left-6 right-6">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                <span>
                  {currentStep + 1} / {tourSteps.length}
                </span>
                <button onClick={handleSkip} className="text-gray-500 hover:text-gray-400 transition-colors">
                  Přeskočit tour
                </button>
              </div>
              <Progress value={progress} className="h-1 bg-gray-800" />
            </div>
          </div>

          {/* Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-2xl scale-150 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Icon className="w-12 h-12 text-cyan-400" />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            {step.title}
          </h1>
          <p className="text-cyan-400 text-lg mb-6">{step.subtitle}</p>
          <p className="text-gray-400 text-center max-w-lg mb-10 leading-relaxed">{step.description}</p>

          {/* CTA Button */}
          <Button
            onClick={handleNext}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-cyan-500/30"
          >
            {step.cta}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Back button on finish */}
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="mt-4 text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Zpět
            </button>
          )}
        </div>
      </div>
    )
  }

  // Page overlay with bottom panel
  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={() => setIsMinimized(true)} />

      <button
        onClick={() => setIsMinimized(true)}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-8 py-4 rounded-full shadow-2xl shadow-cyan-500/40 flex items-center gap-3 transition-all hover:scale-105 group"
      >
        <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <div className="text-left">
          <div className="text-sm font-bold">Náhled stránky</div>
          <div className="text-xs opacity-90">Klikni zde pro přiblížení</div>
        </div>
      </button>

      {/* Bottom panel */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-gray-900 via-gray-900 to-gray-900/95 border-t border-cyan-500/20 p-6 pb-8">
        {/* Close/Minimize button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress */}
        <div className="max-w-3xl mx-auto mb-4">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
            <span>
              {currentStep + 1} / {tourSteps.length}
            </span>
            <button onClick={handleSkip} className="text-gray-500 hover:text-gray-400 transition-colors">
              Přeskočit tour
            </button>
          </div>
          <Progress value={progress} className="h-1 bg-gray-800" />
        </div>

        <div className="max-w-3xl mx-auto flex items-center gap-6">
          {/* Icon */}
          <div className="hidden sm:flex shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-150" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                <Icon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-1">{step.title}</h2>
            <p className="text-cyan-400 text-sm mb-2">{step.subtitle}</p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{step.description}</p>

            {/* Highlight tags */}
            {step.highlight && (
              <div className="flex flex-wrap gap-2 mt-3">
                {step.highlight.split(" • ").map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {currentStep > 0 && (
              <Button
                onClick={handlePrev}
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold px-6"
            >
              Další
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
