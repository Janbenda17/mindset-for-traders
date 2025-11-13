"use client"

import { useState } from "react"
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
import { AlertCircle, Zap, Shield, TrendingUp, Clock, ArrowRight, CheckCircle, Sparkles, Activity } from "lucide-react"
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

  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    tradingStyle: "",
    experience: "",
    tradingYears: "",
    mainMarkets: [],
    riskLevel: "",
    goals: "",
    averageTradesPerWeek: "",
  })

  const handleModeSwitch = () => {
    if (!isLiveMode) {
      // Switching to Live Mode - show onboarding
      setShowOnboarding(true)
      setOnboardingStep(1)
    } else {
      // Switching to Virtual Mode - show warning
      setShowWarningDialog(true)
    }
  }

  const confirmVirtualMode = () => {
    switchToVirtual()
    setShowWarningDialog(false)
  }

  const handleOnboardingNext = () => {
    if (onboardingStep < 4) {
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
    // Save onboarding data to localStorage
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

    // Switch to Live Mode
    switchToLive()
    setShowOnboarding(false)

    // Dispatch event for other components
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
        return true
      default:
        return false
    }
  }

  const getTradingStyleIcon = (style: string) => {
    switch (style) {
      case "scalper":
        return <Zap className="w-5 h-5" />
      case "day-trader":
        return <TrendingUp className="w-5 h-5" />
      case "swing-trader":
        return <Clock className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

  const getTradingStyleLabel = (style: string) => {
    switch (style) {
      case "scalper":
        return "Scalper"
      case "day-trader":
        return "Day Trader"
      case "swing-trader":
        return "Swing Trader"
      default:
        return "Trading"
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
      {/* Professional Mode Toggle Button */}
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
        {/* Glow effect */}
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

      {/* Warning Dialog for switching to Virtual */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <AlertCircle className="w-5 h-5" />
              Přepnout do Virtual Mode?
            </DialogTitle>
            <DialogDescription className="text-gray-300 space-y-3 pt-4">
              <div>Přepnutím do Virtual Mode přejdeš zpět na demo data pro trénink.</div>
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="text-sm text-orange-200">
                  ⚠️ Tvá reálná data zůstanou uložena a můžeš se kdykoliv vrátit.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={confirmVirtualMode} className="bg-red-600 hover:bg-red-700">
              Přepnout na Virtual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Aktivuj Live Mode
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  Krok {onboardingStep} ze 4 - Nastav svůj trading profil
                </DialogDescription>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Live Setup
              </Badge>
            </div>
            <Progress value={(onboardingStep / 4) * 100} className="h-2" />
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

            {/* Step 2: Markets & Experience Years */}
            {onboardingStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jak dlouho obchoduješ?</Label>
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
                        onClick={() => toggleMarket(market.id)}
                        variant="outline"
                        className={`h-auto p-4 justify-start ${
                          onboardingData.mainMarkets.includes(market.id)
                            ? "border-purple-500 bg-purple-500/10 text-white"
                            : "border-slate-700 text-gray-300 hover:border-slate-600"
                        }`}
                      >
                        <span className="text-2xl mr-3">{market.icon}</span>
                        <span className="font-medium">{market.label}</span>
                        {onboardingData.mainMarkets.includes(market.id) && (
                          <CheckCircle className="w-4 h-4 ml-auto text-purple-400" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Risk & Trading Frequency */}
            {onboardingStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jaká je tvá riziková tolerance?</Label>
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
                        <p className="text-sm text-gray-400">0.25-1% risk na obchod, ochrana kapitálu</p>
                      </div>
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
                        <Activity className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Střední</p>
                        <p className="text-sm text-gray-400">1-5% risk na obchod, vyvážený přístup</p>
                      </div>
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
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Agresivní</p>
                        <p className="text-sm text-gray-400">15% a více risk na obchod, vysoký potenciál</p>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Kolik obchodů průměrně děláš týdně?</Label>
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
                      <SelectItem value="5-10" className="text-white">
                        5-10 obchodů
                      </SelectItem>
                      <SelectItem value="10-20" className="text-white">
                        10-20 obchodů
                      </SelectItem>
                      <SelectItem value="20-50" className="text-white">
                        20-50 obchodů
                      </SelectItem>
                      <SelectItem value="50-plus" className="text-white">
                        50+ obchodů
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Goals */}
            {onboardingStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-white">Jaké jsou tvé trading cíle?</Label>
                  <p className="text-sm text-gray-400">Co chceš dosáhnout v následujících 6-12 měsících?</p>
                  <Textarea
                    value={onboardingData.goals}
                    onChange={(e) => setOnboardingData((prev) => ({ ...prev, goals: e.target.value }))}
                    placeholder="Např: Zlepšit disciplínu, zvýšit win rate na 60%, konzistentní zisky..."
                    className="bg-slate-800 border-slate-700 text-white min-h-32 resize-none"
                  />
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Tvůj profil je připravený!</h4>
                      <p className="text-sm text-gray-300">AI kouč ti připraví personalizovaná doporučení</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Trading styl:</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {getTradingStyleIcon(onboardingData.tradingStyle)}
                        <span className="ml-1">{getTradingStyleLabel(onboardingData.tradingStyle)}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Zkušenosti:</span>
                      <span className="text-white font-medium">
                        {onboardingData.experience === "beginner"
                          ? "🌱 Začátečník"
                          : onboardingData.experience === "intermediate"
                            ? "📈 Pokročilý"
                            : "🏆 Expert"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Trhy:</span>
                      <span className="text-white font-medium">{onboardingData.mainMarkets.length} vybrány</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {onboardingStep > 1 && (
              <Button variant="outline" onClick={handleOnboardingBack} className="bg-transparent border-slate-700">
                Zpět
              </Button>
            )}
            <Button onClick={() => setShowOnboarding(false)} variant="ghost" className="text-gray-400">
              Zrušit
            </Button>
            <Button
              onClick={handleOnboardingNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {onboardingStep === 4 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dokončit setup
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
    </>
  )
}

export default LiveModeToggle
