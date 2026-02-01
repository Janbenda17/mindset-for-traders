"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Brain, 
  Shield, 
  X, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Crown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function ProductTourPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [stressLevel, setStressLevel] = useState([5])
  const [rules, setRules] = useState({
    maxTrades: false,
    noRevenge: false,
    stopLoss: false,
  })
  const [selectedSituation, setSelectedSituation] = useState<string>("")
  const [showAIResponse, setShowAIResponse] = useState(false)
  const router = useRouter()

  const situations = [
    { 
      value: "loss", 
      label: "Velká ztráta", 
      response: "Pozor – tohle je klasický revanšový impuls. Podle tvého plánu bys měl pauzu 30 minut. Dej si kafe a vrať se s čistou hlavou." 
    },
    { 
      value: "fomo", 
      label: "FOMO (Fear of Missing Out)", 
      response: "Riziko impulsivního vstupu je vysoké. Zkontroluj si plán – máš tuto příležitost v setupu? Pokud ne, počkej na další." 
    },
    { 
      value: "overrisk", 
      label: "Překročení rizika", 
      response: "Stop! Tvůj risk management říká max. 2% na trade. Tohle je 3.5%. Vrať se k plánu a uprav pozici." 
    },
  ]

  const handleNextStep = () => {
    if (currentStep === 1 && stressLevel[0] > 0) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedSituation) {
      setShowAIResponse(true)
    } else if (currentStep === 2 && showAIResponse) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      router.push("/intro")
    }
  }

  const handleSkip = () => {
    router.push("/intro")
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Začni den správně"
      case 2:
        return "AI tě hlídá v reálném čase"
      case 3:
        return "Podívej se, co bys zjistil za týden"
      default:
        return ""
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Nejdřív si naplánuješ den. Napiš si emoce, stres a pravidla, za kterých dnes budeš obchodovat. To ti pomůže držet hlavu na uzdě."
      case 2:
        return "Teď simulujme obchod. Vyber emoci nebo situaci a uvidíš, co by ti AI řekl."
      case 3:
        return "Na konci týdne ti AI shrne, kde jsi nejvíce chyboval a co změnit příště. Tady je ukázka."
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/70 border-b border-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MindTrader AI
            </span>
          </div>
          
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <span>Přeskočit</span>
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/30 h-2">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Step Title & Description */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <span>Krok {currentStep} z 3</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {getStepTitle()}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
                {getStepDescription()}
              </p>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Stress Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-white">
                        Jaký je tvůj stres dnes? (1-10)
                      </Label>
                      <span className="text-2xl font-bold text-blue-400">
                        {stressLevel[0]}
                      </span>
                    </div>
                    <Slider
                      value={stressLevel}
                      onValueChange={setStressLevel}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>V pohodě</span>
                      <span>Velmi vysoký</span>
                    </div>
                  </div>

                  {/* Trading Rules */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-white">
                      Vyber si pravidla pro dnešní obchodování:
                    </Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                        <Checkbox
                          id="maxTrades"
                          checked={rules.maxTrades}
                          onCheckedChange={(checked) =>
                            setRules({ ...rules, maxTrades: checked as boolean })
                          }
                        />
                        <Label
                          htmlFor="maxTrades"
                          className="text-base text-slate-200 cursor-pointer flex-1"
                        >
                          Max 3 obchody dnes
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                        <Checkbox
                          id="noRevenge"
                          checked={rules.noRevenge}
                          onCheckedChange={(checked) =>
                            setRules({ ...rules, noRevenge: checked as boolean })
                          }
                        />
                        <Label
                          htmlFor="noRevenge"
                          className="text-base text-slate-200 cursor-pointer flex-1"
                        >
                          Žádný revenge trading po ztrátě
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                        <Checkbox
                          id="stopLoss"
                          checked={rules.stopLoss}
                          onCheckedChange={(checked) =>
                            setRules({ ...rules, stopLoss: checked as boolean })
                          }
                        />
                        <Label
                          htmlFor="stopLoss"
                          className="text-base text-slate-200 cursor-pointer flex-1"
                        >
                          Držet se stop-loss plánu
                        </Label>
                      </div>
                    </div>
                  </div>

                  {stressLevel[0] > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-green-300 font-semibold">
                            Super! Tvůj denní stav je nastavený.
                          </p>
                          <p className="text-green-200/80 text-sm mt-1">
                            AI teď ví, co hlídat. Připraven na další krok?
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {!showAIResponse ? (
                    <>
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-white">
                          Vyber situaci a uvidíš AI reakci:
                        </Label>
                        
                        <Select value={selectedSituation} onValueChange={setSelectedSituation}>
                          <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white text-base py-6">
                            <SelectValue placeholder="Zvol situaci..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {situations.map((situation) => (
                              <SelectItem
                                key={situation.value}
                                value={situation.value}
                                className="text-white hover:bg-slate-700 focus:bg-slate-700 text-base py-3"
                              >
                                {situation.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSituation && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Button
                            onClick={() => setShowAIResponse(true)}
                            size="lg"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg py-6"
                          >
                            Zobrazit AI reakci
                            <Brain className="ml-2 w-5 h-5" />
                          </Button>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                          <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">AI Analýza</p>
                          <p className="text-lg font-semibold text-white">MindTrader Coach</p>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-orange-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-orange-300 font-semibold text-lg mb-2">
                              Varování před rizikem
                            </p>
                            <p className="text-white text-base leading-relaxed">
                              {situations.find(s => s.value === selectedSituation)?.response}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm text-slate-400 text-center">
                          Přesně takto by tě AI varoval v reálném čase
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6 sm:p-8 space-y-6">
                    {/* Mock Weekly Review */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
                          <BarChart3 className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Týdenní přehled</p>
                          <p className="text-lg font-semibold text-white">Nejčastější chyby</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
                          <div className="text-3xl font-bold text-red-400 mb-1">42%</div>
                          <div className="text-sm text-slate-300">Revenge trading po ztrátě</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="text-3xl font-bold text-yellow-400 mb-1">28%</div>
                          <div className="text-sm text-slate-300">FOMO vstupy</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                          <div className="text-3xl font-bold text-blue-400 mb-1">18%</div>
                          <div className="text-sm text-slate-300">Překročení risk managementu</div>
                        </div>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Shield className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-green-300 font-semibold text-base mb-2">
                              Doporučení na další týden:
                            </p>
                            <p className="text-white text-sm leading-relaxed">
                              Revenge po ztrátě = 42% tvých ztrát. Zkus zavést pravidlo 24hodinové pauzy po ztrátě větší než 2%. Tohle by ti ušetřilo přes 800 Kč tento týden.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade CTA */}
                <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-2 border-purple-500/50 backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
                  
                  <CardContent className="p-6 sm:p-8 relative z-10 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-2xl mb-2">
                        <Crown className="w-10 h-10 text-purple-300" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Tohle je jen demo na testovacích datech
                      </h2>
                      <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
                        V LIVE režimu to bude analyzovat tvé skutečné obchody, ukládat progress, posílat denní upozornění a dávat personalizovaný plán.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-4">
                      <div className="text-center">
                        <p className="text-sm text-slate-300 mb-1">Cena</p>
                        <p className="text-4xl font-bold text-white">1499 Kč<span className="text-lg text-slate-400">/měsíc</span></p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                        <span className="text-sm font-semibold text-yellow-300">
                          Early Bird: prvních 50 lidí jen 1499 Kč (místo 2499 Kč)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Link href="/auth/sign-up" className="flex-1">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg py-6"
                        >
                          Přejít do LIVE režimu teď (registrace 30 s)
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                      <Link href="/intro" className="flex-1">
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full border-2 border-slate-500 text-slate-200 hover:bg-slate-700/50 text-base py-6"
                        >
                          Zatím pokračovat v demu
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>Zrušit kdykoliv</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>14 dní zdarma</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && stressLevel[0] === 0) ||
                    (currentStep === 2 && !selectedSituation && !showAIResponse)
                  }
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg px-12 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 2 && showAIResponse ? "Pokračovat" : "Další krok"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
