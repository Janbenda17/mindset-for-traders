"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Shield, TrendingUp, Clock, ArrowRight, CheckCircle, Sparkles, Target, Brain, Heart } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useToast } from "@/hooks/use-toast"

interface OnboardingData {
  tradingStyle: "scalper" | "day-trader" | "swing-trader" | ""
  experience: "beginner" | "intermediate" | "advanced" | ""
  tradingYears: string
  mainMarkets: string[]
  riskLevel: "conservative" | "moderate" | "aggressive" | ""
  goals: string
  averageTradesPerWeek: string
}

const LiveModeToggle = () => {
  const { isLiveMode, switchToLive, switchToVirtual } = useData()
  const { toast } = useToast()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    tradingStyle: "",
    experience: "",
    tradingYears: "",
    mainMarkets: [],
    riskLevel: "",
    goals: "",
    averageTradesPerWeek: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("trader-mindset-profile")
      if (savedProfile) {
        setHasCompletedOnboarding(true)
      }
    }
  }, [])

  const resetProfile = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("trader-mindset-profile")
      setHasCompletedOnboarding(false)
      setOnboardingData({
        tradingStyle: "",
        experience: "",
        tradingYears: "",
        mainMarkets: [],
        riskLevel: "",
        goals: "",
        averageTradesPerWeek: "",
      })
      toast({
        title: "Profil resetován",
        description: "Můžeš znovu projít onboarding",
      })
    }
  }

  const handleModeSwitch = () => {
    if (!isLiveMode) {
      // Přepínáme z Virtual do Live mode
      if (hasCompletedOnboarding) {
        switchToLive()
        toast({
          title: "Live Mode aktivován",
          description: "Nyní pracuješ s reálnými daty",
        })
      } else {
        setShowOnboarding(true)
        setOnboardingStep(1)
      }
    } else {
      // Přepínáme z Live do Virtual - bez otázek
      switchToVirtual()
      toast({
        title: "Virtual Mode aktivován",
        description: "Nyní pracuješ s demo daty pro trénink",
      })
    }
  }

  const handleOnboardingNext = () => {
    if (onboardingStep < 5) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleOnboardingBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const completeOnboarding = () => {
    const profileData = {
      tradingStyle: onboardingData.tradingStyle,
      experience: onboardingData.experience,
      tradingYears: onboardingData.tradingYears,
      mainMarkets: onboardingData.mainMarkets,
      riskLevel: onboardingData.riskLevel,
      goals: onboardingData.goals,
      averageTradesPerWeek: onboardingData.averageTradesPerWeek,
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem("trader-mindset-profile", JSON.stringify(profileData))
    setHasCompletedOnboarding(true)

    switchToLive()
    setShowOnboarding(false)

    toast({
      title: "Profil uložen!",
      description: "Live Mode aktivován - začni obchodovat",
    })

    window.dispatchEvent(new Event("profile-updated"))
  }

  const canProceed = () => {
    switch (onboardingStep) {
      case 1:
        return onboardingData.tradingStyle !== "" && onboardingData.experience !== ""
      case 2:
        return onboardingData.tradingYears !== "" && onboardingData.mainMarkets.length > 0
      case 3:
        return onboardingData.riskLevel !== "" && onboardingData.averageTradesPerWeek !== ""
      case 4:
        return true // Trading cíle jsou dobrovolné
      case 5:
        return true // Motivační zpráva
      default:
        return false
    }
  }

  const toggleMarket = (market: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      mainMarkets: prev.mainMarkets.includes(market)
        ? prev.mainMarkets.filter((m) => m !== market)
        : [...prev.mainMarkets, market],
    }))
  }

  return (
    <>
      <Button
        onClick={handleModeSwitch}
        variant="ghost"
        className={`
          relative overflow-hidden group
          ${
            isLiveMode
              ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border-2 border-green-500/50"
              : "bg-gradient-to-r from-red-600/20 to-rose-600/20 hover:from-red-600/30 hover:to-rose-600/30 border-2 border-red-500/50"
          }
          transition-all duration-300 px-4 py-2 rounded-lg
        `}
      >
        <div
          className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isLiveMode ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10" : "bg-gradient-to-r from-red-500/10 to-rose-500/10"}
        `}
        />

        <div className="relative flex items-center gap-2">
          {isLiveMode ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Zap className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-green-300">Live Mode</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <Shield className="w-4 h-4 text-red-400" />
              <span className="font-semibold text-red-300">Virtual Mode</span>
            </>
          )}
        </div>
      </Button>

      <Dialog open={showOnboarding}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-green-400" />
                  Nastav svůj Trading Profil
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  Krok {onboardingStep} z 5 - Pomůže nám to personalizovat tvůj zážitek
                </DialogDescription>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Live Setup
              </Badge>
            </div>
            <Progress value={(onboardingStep / 5) * 100} className="h-2" />
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Trading Style & Experience */}
            {onboardingStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jaký je tvůj trading styl?</Label>
                  <RadioGroup
                    value={onboardingData.tradingStyle}
                    onValueChange={(value: any) => setOnboardingData((prev) => ({ ...prev, tradingStyle: value }))}
                    className="grid grid-cols-1 gap-3"
                  >
                    <Label
                      htmlFor="scalper"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.tradingStyle === "scalper"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="scalper" id="scalper" className="sr-only" />
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Scalper</p>
                        <p className="text-sm text-gray-400">Rychlé obchody, několik minut až hodin</p>
                      </div>
                      {onboardingData.tradingStyle === "scalper" && <CheckCircle className="w-5 h-5 text-yellow-400" />}
                    </Label>

                    <Label
                      htmlFor="day-trader"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.tradingStyle === "day-trader"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="day-trader" id="day-trader" className="sr-only" />
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Day Trader</p>
                        <p className="text-sm text-gray-400">Intradenní obchodování, uzavření do konce dne</p>
                      </div>
                      {onboardingData.tradingStyle === "day-trader" && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </Label>

                    <Label
                      htmlFor="swing-trader"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.tradingStyle === "swing-trader"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="swing-trader" id="swing-trader" className="sr-only" />
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Swing Trader</p>
                        <p className="text-sm text-gray-400">Držení pozic několik dní až týdnů</p>
                      </div>
                      {onboardingData.tradingStyle === "swing-trader" && (
                        <CheckCircle className="w-5 h-5 text-purple-400" />
                      )}
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jaká je tvá úroveň zkušeností?</Label>
                  <RadioGroup
                    value={onboardingData.experience}
                    onValueChange={(value: any) => setOnboardingData((prev) => ({ ...prev, experience: value }))}
                    className="grid grid-cols-3 gap-3"
                  >
                    <Label
                      htmlFor="beginner"
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.experience === "beginner"
                          ? "border-green-500 bg-green-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="beginner" id="beginner" className="sr-only" />
                      <span className="text-2xl">🌱</span>
                      <span className="font-semibold text-white text-sm">Začátečník</span>
                      <span className="text-xs text-gray-400 text-center">{"< 1 rok"}</span>
                    </Label>

                    <Label
                      htmlFor="intermediate"
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.experience === "intermediate"
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="intermediate" id="intermediate" className="sr-only" />
                      <span className="text-2xl">📈</span>
                      <span className="font-semibold text-white text-sm">Pokročilý</span>
                      <span className="text-xs text-gray-400 text-center">1-3 roky</span>
                    </Label>

                    <Label
                      htmlFor="advanced"
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.experience === "advanced"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="advanced" id="advanced" className="sr-only" />
                      <span className="text-2xl">🏆</span>
                      <span className="font-semibold text-white text-sm">Expert</span>
                      <span className="text-xs text-gray-400 text-center">3+ roky</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Trading Years & Markets */}
            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jak dlouho aktivně obchoduješ?</Label>
                  <Select
                    value={onboardingData.tradingYears}
                    onValueChange={(value) => setOnboardingData((prev) => ({ ...prev, tradingYears: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Vyber dobu..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="less-6-months" className="text-white">
                        Méně než 6 měsíců
                      </SelectItem>
                      <SelectItem value="6-12-months" className="text-white">
                        6-12 měsíců
                      </SelectItem>
                      <SelectItem value="1-2-years" className="text-white">
                        1-2 roky
                      </SelectItem>
                      <SelectItem value="2-3-years" className="text-white">
                        2-3 roky
                      </SelectItem>
                      <SelectItem value="3-5-years" className="text-white">
                        3-5 let
                      </SelectItem>
                      <SelectItem value="5-plus-years" className="text-white">
                        5+ let
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Které trhy obchoduješ?</Label>
                  <p className="text-sm text-gray-400">Vyber všechny, které se tě týkají</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "forex", label: "Forex", icon: "💱" },
                      { id: "stocks", label: "Akcie", icon: "📊" },
                      { id: "crypto", label: "Krypto", icon: "₿" },
                      { id: "commodities", label: "Komodity", icon: "🛢️" },
                      { id: "indices", label: "Indexy", icon: "📈" },
                      { id: "futures", label: "Futures", icon: "📉" },
                    ].map((market) => (
                      <Button
                        key={market.id}
                        type="button"
                        variant="outline"
                        onClick={() => toggleMarket(market.id)}
                        className={`h-auto py-3 justify-start gap-3 ${
                          onboardingData.mainMarkets.includes(market.id)
                            ? "border-green-500 bg-green-500/10 text-white"
                            : "border-slate-700 text-gray-300 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-xl">{market.icon}</span>
                        <span>{market.label}</span>
                        {onboardingData.mainMarkets.includes(market.id) && (
                          <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Risk Level & Trades per Week */}
            {onboardingStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jaký risk používáš na obchod?</Label>
                  <RadioGroup
                    value={onboardingData.riskLevel}
                    onValueChange={(value: any) => setOnboardingData((prev) => ({ ...prev, riskLevel: value }))}
                    className="grid grid-cols-1 gap-3"
                  >
                    <Label
                      htmlFor="conservative"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.riskLevel === "conservative"
                          ? "border-green-500 bg-green-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="conservative" id="conservative" className="sr-only" />
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Konzervativní</p>
                        <p className="text-sm text-gray-400">0.25% - 1% na obchod</p>
                      </div>
                      {onboardingData.riskLevel === "conservative" && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </Label>

                    <Label
                      htmlFor="moderate"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.riskLevel === "moderate"
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="moderate" id="moderate" className="sr-only" />
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Střední</p>
                        <p className="text-sm text-gray-400">1% - 3% na obchod</p>
                      </div>
                      {onboardingData.riskLevel === "moderate" && <CheckCircle className="w-5 h-5 text-yellow-400" />}
                    </Label>

                    <Label
                      htmlFor="aggressive"
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        onboardingData.riskLevel === "aggressive"
                          ? "border-red-500 bg-red-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <RadioGroupItem value="aggressive" id="aggressive" className="sr-only" />
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Agresivní</p>
                        <p className="text-sm text-gray-400">3% - 10% na obchod</p>
                      </div>
                      {onboardingData.riskLevel === "aggressive" && <CheckCircle className="w-5 h-5 text-red-400" />}
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Kolik obchodů průměrně uděláš týdně?</Label>
                  <Select
                    value={onboardingData.averageTradesPerWeek}
                    onValueChange={(value) => setOnboardingData((prev) => ({ ...prev, averageTradesPerWeek: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Vyber počet..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1-5" className="text-white">
                        1-5 obchodů
                      </SelectItem>
                      <SelectItem value="6-10" className="text-white">
                        6-10 obchodů
                      </SelectItem>
                      <SelectItem value="11-20" className="text-white">
                        11-20 obchodů
                      </SelectItem>
                      <SelectItem value="21-50" className="text-white">
                        21-50 obchodů
                      </SelectItem>
                      <SelectItem value="50+" className="text-white">
                        50+ obchodů
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Trading Goals (Optional) */}
            {onboardingStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jaké jsou tvé trading cíle na 6-12 měsíců?</Label>
                  <p className="text-sm text-gray-400">
                    Toto je nepovinné, ale pomůže nám lépe personalizovat tvůj zážitek
                  </p>
                  <Textarea
                    value={onboardingData.goals}
                    onChange={(e) => setOnboardingData((prev) => ({ ...prev, goals: e.target.value }))}
                    placeholder="Např: Chci dosáhnout konzistentní profitability, zlepšit risk management, naučit se lépe zvládat emoce při tradingu..."
                    className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                  />
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Proč je důležité mít cíle?</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Jasně definované cíle ti pomůžou zůstat na správné cestě a měřit tvůj pokrok. MindTrader AI může
                        tyto cíle využít k personalizovaným radám.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Motivational Message */}
            {onboardingStep === 5 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Trading je maraton, ne sprint</h3>
                      <p className="text-sm text-green-300">Důležitá zpráva před startem</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-gray-300">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong className="text-white">Vysoký Readiness ≠ Zisk ten den.</strong> Můžeš mít skvělý
                        mentální stav a přesto mít ztrátový den. A naopak - můžeš se cítit průměrně a přesto udělat
                        ziskový obchod. To je normální!
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong className="text-white">Dívej se na delší horizont.</strong> Statistiky a korelace mezi
                        tvým mentálním stavem a výsledky se ukážou až po týdnech a měsících konzistentního používání.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p>
                        <strong className="text-white">Analytics potřebují data.</strong> Potřebuješ minimálně 10 dní
                        aktivního používání, než ti analytics ukážou smysluplné vzorce. Buď trpělivý!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <p className="text-white font-medium">Jsi připraven začít svou cestu k lepšímu tradingu?</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between mt-4">
            {onboardingStep > 1 && (
              <Button
                variant="outline"
                onClick={handleOnboardingBack}
                className="border-slate-700 text-white hover:bg-slate-800 bg-transparent"
              >
                Zpět
              </Button>
            )}
            <Button
              onClick={handleOnboardingNext}
              disabled={!canProceed()}
              className={`ml-auto ${
                onboardingStep === 5
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {onboardingStep === 5 ? (
                <>
                  Aktivovat Live Mode
                  <Zap className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Pokračovat
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed Warning Dialog as it's no longer needed */}
    </>
  )
}

export default LiveModeToggle
