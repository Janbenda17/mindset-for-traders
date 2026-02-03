"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { TrendingUp, Clock, Zap, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"

const traderTypes = [
  { id: "scalper", label: "Scalper", icon: Zap },
  { id: "day-trader", label: "Day Trader", icon: Clock },
  { id: "swing-trader", label: "Swing Trader", icon: TrendingUp },
]

const experienceLevels = [
  { id: "less-6m", label: "Méně než 6 měsíců" },
  { id: "6-12m", label: "6–12 měsíců" },
  { id: "1-3y", label: "1–3 roky" },
  { id: "3plus", label: "3+ roky" },
]

const problems = [
  "Revenge trading",
  "FOMO",
  "Overtrading",
  "Nedostatek disciplíny",
  "Emoční výstupy",
  "Nekonzistentnost",
]

const goals = ["Disciplína", "Emoční kontrola", "Konzistentnost", "Funded account", "Dlouhodobá profitabilita"]

export function OnboardingComplete() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState("")
  const [traderType, setTraderType] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [selectedProblems, setSelectedProblems] = useState<string[]>([])
  const [selectedGoal, setSelectedGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalSteps = 7
  const progress = (step / totalSteps) * 100

  const handleComplete = async () => {
    setLoading(true)
    setError("")

    // Save onboarding data to localStorage for guest users
    localStorage.setItem("mindtrader-onboarding-guest", JSON.stringify({
      nickname,
      trader_type: traderType,
      experience_level: experienceLevel,
      main_problems: selectedProblems,
      main_goal: selectedGoal,
      completed: true,
    }))

    localStorage.removeItem("mindtrader-product-tour-completed")
    console.log("[v0] Onboarding complete - redirecting to pricing")

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8B5CF6", "#EC4899", "#10B981"],
    })

    // Go to pricing page after onboarding (authenticated user)
    router.push("/pricing")
    setLoading(false)
  }

  const toggleProblem = (problem: string) => {
    setSelectedProblems((prev) => (prev.includes(problem) ? prev.filter((p) => p !== problem) : [...prev, problem]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        {step === 1 ? (
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white">Welcome to MindTrader.</h1>
            <p className="text-xl text-gray-300">This software is not about indicators.</p>
            <p className="text-xl text-gray-300">It's about you.</p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Tvůj MindTrader systém</h1>
            <p className="text-gray-400">
              Krok {step} z {totalSteps}
            </p>
            <Progress value={progress} className="h-2 mt-4" />
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Button
            onClick={() => setStep(2)}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold"
          >
            Zahájit nastavení
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}

        {/* Step 2: Nickname */}
        {step === 2 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Jak bychom ti měli říkat?</h2>
              <div className="space-y-4">
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.toLowerCase())}
                  placeholder="např. trader_neo"
                  maxLength={20}
                  className="bg-slate-800/50 border-slate-700 text-white h-12"
                />
                <p className="text-sm text-gray-400">Max. 20 znaků. Viditelné pro ostatní v MindTraderu.</p>
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={nickname.length < 3 || nickname.length > 20}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Trader Type */}
        {step === 3 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Jaký typ tradera jsi?</h2>
              <p className="text-gray-400 mb-6">Pomáhá nám přizpůsobit analytics a rutiny tvému stylu.</p>

              <RadioGroup value={traderType} onValueChange={setTraderType} className="space-y-3">
                {traderTypes.map(({ id, label, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      traderType === id ? "border-purple-500 bg-purple-500/10" : "border-slate-700 bg-slate-800/50"
                    }`}
                  >
                    <RadioGroupItem value={id} id={id} className="hidden" />
                    <Icon className="w-6 h-6 text-purple-400" />
                    <span className="text-white font-medium">{label}</span>
                    {traderType === id && <CheckCircle className="w-5 h-5 text-purple-400 ml-auto" />}
                  </label>
                ))}
              </RadioGroup>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!traderType}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Jak dlouho tradíš?</h2>

              <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel} className="space-y-3">
                {experienceLevels.map(({ id, label }) => (
                  <label
                    key={id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      experienceLevel === id ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50"
                    }`}
                  >
                    <RadioGroupItem value={id} id={id} className="hidden" />
                    <span className="text-white font-medium">{label}</span>
                    {experienceLevel === id && <CheckCircle className="w-5 h-5 text-blue-400 ml-auto" />}
                  </label>
                ))}
              </RadioGroup>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1 h-12">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  disabled={!experienceLevel}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Problems */}
        {step === 5 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">S čím tě trápí trading?</h2>
              <p className="text-gray-400 mb-6">Vyber všechny, které se tě týkají</p>

              <div className="space-y-3">
                {problems.map((problem) => (
                  <label
                    key={problem}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedProblems.includes(problem)
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-slate-700 bg-slate-800/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedProblems.includes(problem)}
                      onCheckedChange={() => toggleProblem(problem)}
                      className="hidden"
                    />
                    <span className="text-white">{problem}</span>
                    {selectedProblems.includes(problem) && <CheckCircle className="w-5 h-5 text-orange-400 ml-auto" />}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(4)} variant="outline" className="flex-1 h-12">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(6)}
                  disabled={selectedProblems.length === 0}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Goal */}
        {step === 6 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Jaký je tvůj hlavní cíl s MindTraderem?</h2>

              <RadioGroup value={selectedGoal} onValueChange={setSelectedGoal} className="space-y-3">
                {goals.map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedGoal === goal ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800/50"
                    }`}
                  >
                    <RadioGroupItem value={goal} id={goal} className="hidden" />
                    <span className="text-white font-medium">{goal}</span>
                    {selectedGoal === goal && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                  </label>
                ))}
              </RadioGroup>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(5)} variant="outline" className="flex-1 h-12">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zpět
                </Button>
                <Button
                  onClick={() => setStep(7)}
                  disabled={!selectedGoal}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Pokračovat
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 7: Confirmation */}
        {step === 7 && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-8 space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-400" />
                <h2 className="text-2xl font-bold text-white">Tvůj MindTrader systém je připraven.</h2>
              </div>

              <Button
                onClick={handleComplete}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold"
              >
                {loading ? "Načítání..." : "Vstoupit do MindTraderu"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
