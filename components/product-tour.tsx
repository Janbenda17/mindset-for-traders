"use client"

import { useState, useEffect, type ComponentType } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { supabase } from "@/lib/supabase/client"
import {
  Brain,
  Calendar,
  BarChart3,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  LayoutGrid,
  Receipt,
  Zap,
  Plug,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeatureItem {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

interface HeroPage {
  id: string
  kind: "hero"
  title: string
  subtitle: string
  problemTitle: string
  problem: string
  solutionTitle: string
  solution: string
  stepsLabel: string
  steps: { step: string; label: string }[]
}

interface FeaturesPage {
  id: string
  kind: "features"
  title: string
  subtitle: string
  features: FeatureItem[]
  cta?: { benefits: string[]; buttonLabel: string }
}

type TourPage = HeroPage | FeaturesPage

function getTourPages(language: "cs" | "en"): TourPage[] {
  if (language === "en") {
    return [
      {
        id: "why",
        kind: "hero",
        title: "Welcome to MindTrader",
        subtitle: "A quick tour of what matters before you dive in",
        problemTitle: "The problem",
        problem:
          "Most traders have a decent strategy and still lose - not because of bad entries, but because of what they do after: revenge trading, FOMO, oversized positions, skipped stop-losses.",
        solutionTitle: "The fix",
        solution:
          "MindTrader helps you catch and change that - through a daily routine, a journal that links trades to the emotions behind them, and an AI coach that reasons from your own data.",
        stepsLabel: "Three steps to get started",
        steps: [
          { step: "1", label: "Morning: set today's intentions in Daily Tracker" },
          { step: "2", label: "After a trade: log it with the emotion behind it" },
          { step: "3", label: "End of week: see what actually cost you money" },
        ],
      },
      {
        id: "daily",
        kind: "features",
        title: "Your daily routine",
        subtitle: "The tools you'll use every day",
        features: [
          {
            icon: Calendar,
            title: "Daily Tracker",
            description:
              "Morning check-in: set your max risk, trade count and emotional limits for the day. Tracks streaks and XP for sticking to the routine.",
            color: "from-cyan-500 to-blue-500",
          },
          {
            icon: BookOpen,
            title: "Journal",
            description:
              "Log trades along with the emotions around them. AI looks for patterns in your history - when and why your trading falls apart.",
            color: "from-green-500 to-emerald-500",
          },
          {
            icon: LayoutGrid,
            title: "Discipline Matrix",
            description:
              "A monthly calendar of when you traded your plan and when you didn't, with a day-by-day breakdown including a trade-by-trade \"autopsy\".",
            color: "from-fuchsia-500 to-purple-500",
          },
          {
            icon: ClipboardList,
            title: "Trading Plan",
            description:
              "Before you open a position, write the plan - why, where's the stop, where's the target. Impulsive entries with no plan become obvious immediately.",
            color: "from-blue-500 to-indigo-500",
          },
          {
            icon: AlertTriangle,
            title: "Fail Log",
            description:
              "When something goes wrong, log it with a real root cause (not just \"loss\") - so you recognize the trigger sooner next time.",
            color: "from-red-500 to-orange-500",
          },
        ],
      },
      {
        id: "psychology",
        kind: "features",
        title: "Psychology & growth",
        subtitle: "Why you're really losing money (and how that changes)",
        features: [
          {
            icon: Brain,
            title: "MindTrader AI",
            description:
              "A personal coach that answers based on your actual journal and tracker data - not generic advice.",
            color: "from-purple-500 to-pink-500",
          },
          {
            icon: BarChart3,
            title: "Weekly Review",
            description:
              "Once a week, AI summarizes what cost you the most money - and whether it was strategy or emotion.",
            color: "from-orange-500 to-red-500",
          },
          {
            icon: Receipt,
            title: "Emotional Tax Sheet",
            description:
              "Splits your P&L into clean, by-the-plan trades vs. ones flagged for FOMO, revenge trading, no stop-loss, or oversizing - the exact price of indiscipline, in numbers.",
            color: "from-amber-500 to-yellow-500",
          },
          {
            icon: Zap,
            title: "Gamification",
            description:
              "XP, levels and badges for sticking to the routine - not for how much you make. Motivation built around discipline, not risk.",
            color: "from-indigo-500 to-violet-500",
          },
        ],
      },
      {
        id: "connect",
        kind: "features",
        title: "Connect your account, find your people",
        subtitle: "Last step",
        features: [
          {
            icon: Plug,
            title: "MetaTrader (MT4/MT5)",
            description:
              "Connect your account via MetaApi and trades sync into your journal automatically - no manual logging.",
            color: "from-sky-500 to-cyan-500",
          },
          {
            icon: Users,
            title: "Team Club",
            description:
              "Groups of traders keeping each other accountable, plus challenges and a leaderboard.",
            color: "from-emerald-500 to-teal-500",
          },
        ],
        cta: {
          benefits: [
            "Demo data is already in the app - explore before you enter anything yourself",
            "Connecting a broker is optional - everything else works without it",
            "You can replay this tour anytime from Account settings",
          ],
          buttonLabel: "Continue to Daily Tracker",
        },
      },
    ]
  }

  return [
    {
      id: "why",
      kind: "hero",
      title: "Vítej v MindTrader",
      subtitle: "Rychlá prohlídka toho nejdůležitějšího, než začneš",
      problemTitle: "Problém",
      problem:
        "Většina traderů má solidní strategii, a přesto prodělává - ne kvůli špatným vstupům, ale kvůli tomu, co udělají po nich: revenge trading, FOMO, přehnaná velikost pozice, ignorovaný stop-loss.",
      solutionTitle: "Řešení",
      solution:
        "MindTrader ti pomáhá tohle sledovat a měnit - denní rutinou, deníkem obchodů propojeným s emocemi kolem nich, a AI koučem, který vychází z tvých vlastních dat, ne z obecných rad.",
      stepsLabel: "Tři kroky, jak začít",
      steps: [
        { step: "1", label: "Ráno: nastav si v Daily Trackeru záměr na dnešek" },
        { step: "2", label: "Po obchodu: zapiš ho i s emocí, která za ním stála" },
        { step: "3", label: "Na konci týdne: podívej se, co tě reálně stálo peníze" },
      ],
    },
    {
      id: "daily",
      kind: "features",
      title: "Tvoje denní rutina",
      subtitle: "Nástroje, které používáš každý den",
      features: [
        {
          icon: Calendar,
          title: "Daily Tracker",
          description:
            "Ranní check-in: nastav si max. riziko, počet obchodů a emoční limity na den. Sleduješ streaky a XP za to, že se rutiny držíš.",
          color: "from-cyan-500 to-blue-500",
        },
        {
          icon: BookOpen,
          title: "Deník (Journal)",
          description:
            "Zapisuješ obchody i s emocemi kolem nich. AI hledá v historii vzorce - kdy a proč se ti obchodování rozpadá.",
          color: "from-green-500 to-emerald-500",
        },
        {
          icon: LayoutGrid,
          title: "Kalendář disciplíny",
          description:
            "Měsíční přehled, kdy jsi obchodoval podle plánu a kdy ne, s detailem dne včetně 'pitevního protokolu' k jednotlivým obchodům.",
          color: "from-fuchsia-500 to-purple-500",
        },
        {
          icon: ClipboardList,
          title: "Trading Plan",
          description:
            "Než otevřeš pozici, sepíšeš plán - proč, kde je stop, kde je cíl. Impulzivní vstupy bez plánu jsou tak vidět hned.",
          color: "from-blue-500 to-indigo-500",
        },
        {
          icon: AlertTriangle,
          title: "Fail Log",
          description:
            "Když se něco pokazí, zapíšeš to sem se skutečnou příčinou (ne jen 'ztráta') - abys příště poznal spouštěč dřív.",
          color: "from-red-500 to-orange-500",
        },
      ],
    },
    {
      id: "psychology",
      kind: "features",
      title: "Psychologie a růst",
      subtitle: "Proč doopravdy prohráváš (a jak to jde změnit)",
      features: [
        {
          icon: Brain,
          title: "MindTrader AI",
          description:
            "Osobní kouč, který odpovídá na základě tvých reálných dat z deníku a trackeru - ne obecnými frázemi.",
          color: "from-purple-500 to-pink-500",
        },
        {
          icon: BarChart3,
          title: "Weekly Review",
          description:
            "Jednou týdně AI shrne, co tě stálo nejvíc peněz - a jestli to byla strategie, nebo emoce.",
          color: "from-orange-500 to-red-500",
        },
        {
          icon: Receipt,
          title: "Emotional Tax Sheet",
          description:
            "Rozpad P&L na čisté obchody podle plánu vs. ty poznamenané FOMO, revenge tradingem, chybějícím stop-lossem nebo přehnanou velikostí - přesná cena, kterou platíš za nedisciplínu, v číslech.",
          color: "from-amber-500 to-yellow-500",
        },
        {
          icon: Zap,
          title: "Gamifikace",
          description:
            "XP, levely a odznaky za to, že se držíš rutiny - ne za to, kolik vyděláš. Motivace k disciplíně, ne k riziku.",
          color: "from-indigo-500 to-violet-500",
        },
      ],
    },
    {
      id: "connect",
      kind: "features",
      title: "Propoj si účet a najdi partu",
      subtitle: "Poslední krok",
      features: [
        {
          icon: Plug,
          title: "MetaTrader (MT4/MT5)",
          description:
            "Propoj svůj účet přes MetaApi a obchody se ti budou synchronizovat do deníku automaticky, bez ručního zapisování.",
          color: "from-sky-500 to-cyan-500",
        },
        {
          icon: Users,
          title: "Team Club",
          description: "Skupiny traderů, kteří si hlídají disciplínu navzájem, plus výzvy a žebříček.",
          color: "from-emerald-500 to-teal-500",
        },
      ],
      cta: {
        benefits: [
          "Demo data jsou v aplikaci připravená rovnou - můžeš si vše prohlédnout, než cokoliv zadáš sám",
          "Napojení brokera je volitelné - všechno ostatní funguje i bez něj",
          "Prohlídku si kdykoliv pustíš znovu v nastavení účtu",
        ],
        buttonLabel: "Pokračovat do Daily Trackeru",
      },
    },
  ]
}

const HIDDEN_PATHS = new Set(["/login", "/signup", "/sign-up", "/auth/callback"])
const FORCE_SHOW_KEY = "mindtrader-show-tour"

export function ProductTour() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { language } = useLanguage()

  useEffect(() => {
    if (!user?.id || (pathname && HIDDEN_PATHS.has(pathname))) return

    const cacheKey = `mindtrader-tour-completed-${user.id}`
    const forceShow = localStorage.getItem(FORCE_SHOW_KEY) === "true"

    if (forceShow) {
      localStorage.removeItem(FORCE_SHOW_KEY)
      setCurrentPage(0)
      setIsVisible(true)
      return
    }

    if (localStorage.getItem(cacheKey) === "true") return

    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("product_tour_completed")
        .eq("user_id", user.id)
        .maybeSingle()

      if (cancelled) return

      if (data?.product_tour_completed) {
        localStorage.setItem(cacheKey, "true")
      } else {
        setCurrentPage(0)
        setIsVisible(true)
      }
    })()

    return () => {
      cancelled = true
    }
    // Only re-check when the signed-in user changes, not on every route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const tourPages = getTourPages(language === "en" ? "en" : "cs")

  const persistCompletion = async () => {
    if (!user?.id) return
    localStorage.setItem(`mindtrader-tour-completed-${user.id}`, "true")
    try {
      await fetch("/api/onboarding/tour-complete", { method: "POST" })
    } catch (err) {
      console.error("[v0] Failed to persist product tour completion:", err)
    }
  }

  const handleNext = () => {
    if (currentPage < tourPages.length - 1) {
      setCurrentPage(currentPage + 1)
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1)
  }

  const completeTour = () => {
    setIsVisible(false)
    persistCompletion()
    router.push("/daily-tracker")
  }

  const skipTour = () => {
    setIsVisible(false)
    persistCompletion()
  }

  if (!isVisible) return null

  const page = tourPages[currentPage]
  const isFirst = currentPage === 0
  const isLast = currentPage === tourPages.length - 1
  const progress = ((currentPage + 1) / tourPages.length) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 pointer-events-none hidden md:block">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative w-full max-w-5xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl my-auto">
        {/* Header with progress */}
        <div className="relative p-4 sm:p-6 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-400 mb-2">
                {language === "en" ? "Page" : "Stránka"} {currentPage + 1} {language === "en" ? "of" : "ze"}{" "}
                {tourPages.length}
              </p>
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
              aria-label={language === "en" ? "Skip tour" : "Přeskočit prohlídku"}
            >
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 md:p-10 min-h-[500px] flex flex-col">
          {page.kind === "hero" && (
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>{page.problemTitle} → {page.solutionTitle}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{page.title}</h2>
                <p className="text-lg sm:text-xl text-cyan-400 font-semibold">{page.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                    <X className="w-5 h-5" />
                    {page.problemTitle}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{page.problem}</p>
                </div>

                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {page.solutionTitle}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{page.solution}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-3 text-center">{page.stepsLabel}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {page.steps.map((s) => (
                    <div
                      key={s.step}
                      className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                        {s.step}
                      </div>
                      <span className="text-sm text-slate-300 leading-snug">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {page.kind === "features" && (
            <div className="space-y-6 flex-1 flex flex-col">
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
                      className="group p-5 bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10"
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

              {page.cta && (
                <div className="pt-4 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="max-w-md w-full space-y-3">
                    {page.cta.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-left p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg"
                      >
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={completeTour}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-lg px-10 py-6 h-auto rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {page.cta.buttonLabel}
                  </Button>
                </div>
              )}
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
              <span className="hidden sm:inline">{language === "en" ? "Back" : "Zpět"}</span>
            </Button>

            <div className="flex gap-2">
              {tourPages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentPage
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 w-8"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                  aria-label={`${language === "en" ? "Page" : "Stránka"} ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-4 sm:px-6"
            >
              <span className="hidden sm:inline">
                {isLast ? (language === "en" ? "Start" : "Začít") : language === "en" ? "Next" : "Další"}
              </span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
