"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Brain,
  TrendingUp,
  Target,
  AlertCircle,
  Clock,
  BarChart3,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"

const traderTypes = [
  {
    id: "scalper",
    label: "Scalper",
    icon: Zap,
    description: "Rychlé obchody, minuty až hodiny",
    color: "from-yellow-600 to-orange-600",
  },
  {
    id: "day-trader",
    label: "Day Trader",
    icon: Clock,
    description: "Intradenní trading, uzavírám pozice do konce dne",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "swing-trader",
    label: "Swing Trader",
    icon: TrendingUp,
    description: "Držím pozice několik dní až týdnů",
    color: "from-green-600 to-emerald-600",
  },
  {
    id: "mentor",
    label: "Mentor/Učitel",
    icon: Users,
    description: "Mentoruju ostatní tradery",
    color: "from-purple-600 to-pink-600",
  },
]

const commonGoals = [
  "Konzistentní profitabilita",
  "Lepší risk management",
  "Zvládnout emoce při tradingu",
  "Disciplína a trpělivost",
  "Větší sebevědomí",
  "Růst účtu o X%",
]

const commonProblems = [
  "FOMO a impulzivní vstupy",
  "Nedodržování trading plánu",
  "Revenge trading po ztrátách",
  "Přetrading",
  "Nedostatečná analýza",
  "Strach z uzavření pozic",
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [traderType, setTraderType] = useState("")
  const [goals, setGoals] = useState("")
  const [problems, setProblems] = useState("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedProblems, setSelectedProblems] = useState<string[]>([])
  const [enableAI, setEnableAI] = useState(true)
  const [enableDailyTracker, setEnableDailyTracker] = useState(true)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleComplete = () => {
    // Save onboarding data
    const onboardingData = {
      traderType,
      goals: [...selectedGoals, goals].filter(Boolean),
      problems: [...selectedProblems, problems].filter(Boolean),
      enableAI,
      enableDailyTracker,
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem("trader-mindset-onboarding", JSON.stringify(onboardingData))
    localStorage.setItem("trader-mindset-onboarding-completed", "true")

    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8B5CF6", "#EC4899", "#10B981"],
    })

    // Redirect after short delay
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  const toggleProblem = (problem: string) => {
    setSelectedProblems((prev) => (prev.includes(problem) ? prev.filter((p) => p !== problem) : [...prev, problem]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-lg opacity-50 animate-pulse" />
            <Brain className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Nastavení tvého profilu</h1>
          <p className="text-gray-400">Pomož nám personalizovat tvoji zkušenost</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              Krok {step} z {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Trader Type */}
        {step === 1 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h2 className="text-2xl font-bold text-white mb-2">Jaký typ tradera jsi?</h2>
                <p className="text-gray-400">Vyber styl, který tě nejlépe vystihuje</p>
              </div>

              <RadioGroup value={traderType} onValueChange={setTraderType} className="space-y-3">
                {traderTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <label
                      key={type.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        traderType === type.id
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value={type.id} id={type.id} className="hidden" />
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{type.label}</div>
                        <div className="text-sm text-gray-400">{type.description}</div>
                      </div>
                      {traderType === type.id && <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0" />}
                    </label>
                  )
                })}
              </RadioGroup>

              <Button
                onClick={() => setStep(2)}
                disabled={!traderType}
                className="w-full mt-6 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              >
                Pokračovat
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h2 className="text-2xl font-bold text-white mb-2">Jaké máš cíle?</h2>
                <p className="text-gray-400">Vyber všechny, které se tě týkají</p>
              </div>

              <div className="space-y-2 mb-4">
                {commonGoals.map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedGoals.includes(goal)
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <Checkbox
                      checked={selectedGoals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                      className="hidden"
                    />
                    <div className="flex-1 text-white">{goal}</div>
                    {selectedGoals.includes(goal) && <CheckCircle className="w-5 h-5 text-blue-400" />}
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-goals" className="text-gray-300">
                  Další cíle (volitelné)
                </Label>
                <Textarea
                  id="custom-goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Napiš své vlastní cíle..."
                  className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 border-slate-700 text-white hover:bg-slate-800"
                >
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedGoals.length === 0 && !goals}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Problems */}
        {step === 3 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <h2 className="text-2xl font-bold text-white mb-2">S čím bojuješ?</h2>
                <p className="text-gray-400">Sdílej své hlavní výzvy</p>
              </div>

              <div className="space-y-2 mb-4">
                {commonProblems.map((problem) => (
                  <label
                    key={problem}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedProblems.includes(problem)
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    }`}
                  >
                    <Checkbox
                      checked={selectedProblems.includes(problem)}
                      onCheckedChange={() => toggleProblem(problem)}
                      className="hidden"
                    />
                    <div className="flex-1 text-white">{problem}</div>
                    {selectedProblems.includes(problem) && <CheckCircle className="w-5 h-5 text-orange-400" />}
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-problems" className="text-gray-300">
                  Další výzvy (volitelné)
                </Label>
                <Textarea
                  id="custom-problems"
                  value={problems}
                  onChange={(e) => setProblems(e.target.value)}
                  placeholder="Napiš své vlastní výzvy..."
                  className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-12 border-slate-700 text-white hover:bg-slate-800"
                >
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Features */}
        {step === 4 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-2">Aktivuj chytré funkce</h2>
                <p className="text-gray-400">Doporučujeme aktivovat obě</p>
              </div>

              <div className="space-y-4">
                <label
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    enableAI ? "border-purple-500 bg-purple-500/10" : "border-slate-700 bg-slate-800/50"
                  }`}
                >
                  <Checkbox checked={enableAI} onCheckedChange={setEnableAI} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-white">MindTrader AI Kouč</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Osobní AI asistent, který analyzuje tvé trading chování a poskytuje personalizovaná doporučení
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    enableDailyTracker ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50"
                  }`}
                >
                  <Checkbox checked={enableDailyTracker} onCheckedChange={setEnableDailyTracker} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">Daily Tracker</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Sleduj své denní návyky (spánek, energie, stres) a jejich vliv na tvůj trading výkon
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1 h-12 border-slate-700 text-white hover:bg-slate-800"
                >
                  Zpět
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Dokončit nastavení
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
