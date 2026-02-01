"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useData } from "@/contexts/data-context"
import { Card } from "@/components/ui/card"
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
  TrendingUp,
  Zap,
  Trophy,
  Target,
  Flame,
  Heart,
  Shield,
  Clock,
  Users,
  Activity,
  Award,
} from "lucide-react"

const tourSteps = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Vítej v MindTraderu",
    subtitle: "Mentální hra. Obchody. Výsledky.",
    description: "Jako každý sport má trading svou mentální hru. MindTrader ti učí hrát ji lépe. Kontrola emocí, psychologické vzorce, strategie resilience.",
    cta: "Začít exploraci",
    route: null,
    features: ["AI Coaching 24/7", "Psychology Engine", "Gamified Growth"],
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "Tvůj daily readiness check",
    description: "Každé ráno vidíš jednu hodnotu: jsi ready? Readiness Score kombinuje spánek, stres a energii. Zelené = jeď do toho. Červené = zůstaň v bedně.",
    highlight: "Readiness • XP • Streaks",
    route: "/",
    preview: "dashboard",
  },
  {
    id: "ai-coach",
    icon: MessageSquare,
    title: "MindTrader AI",
    subtitle: "24/7 psycholog v kapse",
    description: "Máš FOMO? Frustaci? Eufórii? MindTrader AI chápe psychology tradingu. Poslej mu emoce, dostaneš konkrétní strategie jak se jich zbavit.",
    highlight: "Instant rady • Emoční analýza • Proven techniques",
    route: "/mindtrader?tab=ai",
    preview: "ai",
  },
  {
    id: "daily-tracker",
    icon: ClipboardCheck,
    title: "Daily Tracker",
    subtitle: "Rituál předtím, než obchoduješ",
    description: "3 otázky. 2 minuty. Spal jsi dost? Jak je tvůj stres? Máš energii? AI ti říká, zda máš hazardovat nebo zůstat klid.",
    highlight: "Pre-market ritual • Readiness • AI insight",
    route: "/daily-tracker",
    preview: "tracker",
  },
  {
    id: "trading-diary",
    icon: BookOpen,
    title: "Trading Journal",
    subtitle: "Psychologie vítězů vs. poražených",
    description: "Ne peníze. Emocesem při obchodě. Co si myslíš? Co cítíš? Co děláš špatně? MindTrader analyzuje tvoje emoční vzory a ukazuje co sabotuje výsledky.",
    highlight: "Emoční tracking • Patterns • Breakthroughs",
    route: "/journal",
    preview: "journal",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Psychology Analytics",
    subtitle: "Tvoji psychika = Tvůj P&L",
    description: "Data science pro mysl. Jaké emočnístavy vedou k ziskům? Které k ztrátám? Vidíš korelace mezi psychikou a výsledky. Teď víš, co měnit.",
    highlight: "Data-driven insights • Predictions • Optimization",
    route: "/analytics",
    preview: "analytics",
  },
  {
    id: "xp-system",
    icon: Trophy,
    title: "Gamification",
    subtitle: "Mentální trénink = hra",
    description: "Obchodování bez emocionálního vzdělávání je jako sport bez tréninku. MindTrader gamifikuje mental game. Gather XP, unlock achievements, level up.",
    highlight: "10 Levels • 50+ Achievements • Daily Streaks",
    route: "/rewards",
    preview: "gamification",
  },
  {
    id: "loss-reset",
    icon: RefreshCw,
    title: "Loss Reset Protocol",
    subtitle: "Zastavit revenge trading",
    description: "Ztrácíš v obchodě? Náhle chceš to vrátit revenge tradingem? STOP. Loss Reset ti pomůže resetovat se. 5-minute protocol s breathing & mindfulness.",
    highlight: "Emergency protocol • Breathing • Mental reset",
    route: "/loss-reset",
    preview: "reset",
  },
  {
    id: "finish",
    icon: Rocket,
    title: "Teď je na tobě.",
    subtitle: "Virtual Mode. Bez rizika. Začni teď.",
    description: "Vyzkoušej všechno. Všechny funkce jsou dostupné v Virtual Mode bez jakéhokoliv peněžního rizika. Když budeš ready, přepneš na Live.",
    cta: "Začít zkoušet",
    route: null,
    features: ["Všechny funkce", "Virtual Mode", "Live kdykoliv"],
  },
]

// Animated preview components
function DashboardPreview() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-cyan-500/20">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard icon={Activity} label="Readiness" value="87%" color="green" />
        <MetricCard icon={Zap} label="Level" value="7" color="yellow" />
        <MetricCard icon={Flame} label="Streak" value="12" color="orange" />
      </div>
      <div className="h-32 bg-slate-800/50 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around p-4">
          {[65, 78, 82, 90, 87].map((height, i) => (
            <div key={i} className="w-8 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg animate-pulse" style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AIPreview() {
  return (
    <div className="space-y-3 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-2 bg-purple-500/20 rounded-full w-full" />
          <div className="h-2 bg-purple-500/20 rounded-full w-3/4" />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-2 bg-cyan-500/20 rounded-full w-full animate-pulse" />
          <div className="h-2 bg-cyan-500/20 rounded-full w-4/5 animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  )
}

function TrackerPreview() {
  return (
    <div className="space-y-3 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-blue-500/20">
      {[
        { icon: Heart, label: "Spánek", value: 8 },
        { icon: Shield, label: "Stres", value: 3 },
        { icon: Zap, label: "Energie", value: 9 },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-4">
          <item.icon className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <div className="text-sm text-slate-400 mb-1">{item.label}</div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{ width: `${(item.value / 10) * 100}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-blue-400">{item.value}/10</span>
        </div>
      ))}
    </div>
  )
}

function JournalPreview() {
  return (
    <div className="space-y-3 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-green-500/20">
      {["FOMO", "Disciplína", "Overtrading"].map((emotion, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <span className="text-sm text-slate-300">{emotion}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-3 h-3 ${star <= 4 - i ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsPreview() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-pink-500/20">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Win Rate Trend</span>
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <div className="h-24 relative">
        <svg className="w-full h-full" viewBox="0 0 200 80">
          <path
            d="M 0 60 Q 50 50, 100 35 T 200 20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

function GamificationPreview() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-yellow-500/20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold">
            7
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-400 mb-1">Progress to Level 8</div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse" style={{ width: '65%' }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[Trophy, Star, Award].map((Icon, i) => (
          <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex flex-col items-center gap-2">
            <Icon className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-slate-400">+{(i + 1) * 50} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResetPreview() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-red-500/20">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full border-4 border-red-500/20 flex items-center justify-center mb-4 animate-pulse">
          <RefreshCw className="w-10 h-10 text-red-400" />
        </div>
        <div className="text-sm text-slate-400 mb-2">Protocol aktivován</div>
        <div className="text-2xl font-bold text-red-400">00:05:00</div>
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`w-8 h-1 rounded-full ${step === 1 ? 'bg-red-500' : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  const colorMap: any = {
    green: "from-green-500 to-emerald-500",
    yellow: "from-yellow-500 to-orange-500",
    orange: "from-orange-500 to-red-500",
  }

  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all group cursor-pointer">
      <Icon className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>{value}</div>
    </div>
  )
}

export function ProductTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isLiveMode } = useData()

  useEffect(() => {
    console.log("[v0] ProductTour: pathname =", pathname)

    if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") {
      console.log("[v0] ProductTour: Skipping tour on auth pages")
      return
    }

    const tourCompleted = localStorage.getItem("mindtrader-product-tour-completed")
    const showTour = localStorage.getItem("mindtrader-show-tour")

    console.log("[v0] ProductTour: tourCompleted =", tourCompleted)
    console.log("[v0] ProductTour: showTour =", showTour)

    if (!tourCompleted) {
      if (showTour === "true" && !isVisible) {
        console.log("[v0] ProductTour: Starting tour!")
        setIsVisible(true)
        localStorage.removeItem("mindtrader-show-tour")
      } else if (isVisible) {
        console.log("[v0] ProductTour: Tour already running, keeping visible")
      }
    }
  }, [pathname, isVisible, isLiveMode])

  useEffect(() => {
    if (isVisible && !isMinimized) {
      const step = tourSteps[currentStep]
      if (step.route && pathname !== step.route) {
        console.log("[v0] Tour: Navigating to", step.route)
        router.push(step.route)
      }
    }
  }, [currentStep, isVisible, isMinimized, router, pathname])

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
    console.log("[v0] Tour completed - redirecting to dashboard")
    setIsVisible(false)
    router.push("/")
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
        className="fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-4 rounded-full shadow-2xl shadow-cyan-500/40 flex items-center gap-3 transition-all hover:scale-105 group"
      >
        <Brain className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span>Pokračovat v tour ({currentStep + 1}/{tourSteps.length})</span>
      </button>
    )
  }

  // Welcome and Finish screens - fullscreen immersive
  if (isWelcomeOrFinish) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Animated particles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 1 + "px",
                height: Math.random() * 4 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                background: i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#8b5cf6" : "#ec4899",
                animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                animationDelay: Math.random() * 5 + "s",
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* Progress */}
          <div className="absolute top-8 left-8 right-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  Krok {currentStep + 1} / {tourSteps.length}
                </span>
                <button 
                  onClick={handleSkip} 
                  className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 group"
                >
                  Přeskočit
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Floating icons */}
          <div className="absolute inset-0 pointer-events-none">
            {[Brain, Zap, Trophy, Target, Star, Flame].map((FloatIcon, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${20 + i * 15}%`,
                  left: i % 2 === 0 ? "10%" : "85%",
                  animation: `floatSide ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                <FloatIcon className="w-8 h-8 text-cyan-400/20" />
              </div>
            ))}
          </div>

          {/* Main icon with glow */}
          <div className="relative mb-10 group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-3xl scale-150 opacity-50 group-hover:opacity-70 transition-opacity animate-pulse" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
              <Icon className="w-16 h-16 text-cyan-400 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>

          {/* Content */}
          <div className="max-w-3xl text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-tight animate-fadeIn">
              {step.title}
            </h1>
            <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-medium">
              {step.subtitle}
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {step.description}
            </p>

            {/* Feature pills */}
            {step.features && (
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {step.features.map((feature, i) => (
                  <div
                    key={i}
                    className="px-5 py-2 rounded-full bg-slate-800/50 border border-cyan-500/30 text-cyan-400 text-sm backdrop-blur-sm hover:border-cyan-500/60 hover:bg-slate-800/70 transition-all cursor-default"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 mt-12">
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-7 text-xl rounded-full shadow-2xl shadow-cyan-500/40 transition-all hover:scale-105 hover:shadow-cyan-500/60 group"
            >
              {step.cta}
              <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Zpět
              </button>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes floatSide {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-20px, -30px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // Page overlay with interactive preview
  const previewComponents: any = {
    dashboard: DashboardPreview,
    ai: AIPreview,
    tracker: TrackerPreview,
    journal: JournalPreview,
    analytics: AnalyticsPreview,
    gamification: GamificationPreview,
    reset: ResetPreview,
  }

  const PreviewComponent = step.preview ? previewComponents[step.preview] : null

  return (
    <>
      {/* Overlay with blur */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90]" onClick={() => setIsMinimized(true)} />

      {/* Center preview card */}
      {PreviewComponent && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] w-full max-w-md px-4">
          <Card className="bg-slate-900 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden animate-scaleIn">
            <div className="p-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-xs text-slate-500 ml-2">Live Preview</span>
              </div>
            </div>
            <PreviewComponent />
          </Card>
          <button
            onClick={() => setIsMinimized(true)}
            className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all backdrop-blur-sm"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Klikni pro přiblížení stránky</span>
          </button>
        </div>
      )}

      {/* Bottom control panel */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-t from-slate-900 via-slate-900/98 to-slate-900/95 border-t-2 border-cyan-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* Close button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-2 hover:bg-slate-800 rounded-lg group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                Krok {currentStep + 1} / {tourSteps.length}
              </span>
              <button onClick={handleSkip} className="text-slate-500 hover:text-slate-300 transition-colors">
                Přeskočit tour
              </button>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="hidden md:flex shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-transform" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-cyan-500/30 flex items-center justify-center backdrop-blur-sm group-hover:border-cyan-500/50 transition-all">
                  <Icon className="w-10 h-10 text-cyan-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                {step.title}
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </h2>
              <p className="text-cyan-400 text-base md:text-lg mb-3">{step.subtitle}</p>
              <p className="text-slate-400 leading-relaxed mb-4">{step.description}</p>

              {/* Highlight tags */}
              {step.highlight && (
                <div className="flex flex-wrap gap-2">
                  {step.highlight.split(" • ").map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400 text-sm backdrop-blur-sm hover:border-cyan-500/50 transition-all cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 shrink-0">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 bg-transparent hover:bg-slate-800 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105 group"
              >
                {currentStep === tourSteps.length - 1 ? "Dokončit" : "Další"}
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}
