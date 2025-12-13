"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { getSimulatedDate } from "@/utils/random-data-generator"
import {
  Target,
  TrendingUp,
  ArrowRight,
  Check,
  Info,
  DollarSign,
  Clock,
  Activity,
  BookOpen,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TradingPlanData {
  date: string
  setups: string
  pairs: string
  timeframes: string
  entryRules: string
  exitRules: string
  stopLoss: string
  takeProfit: string
  marketAnalysis: string
  keyLevels: string
  notes: string
}

export function TradingPlan() {
  const router = useRouter()
  const { toast } = useToast()
  const { completeStage } = useDailyStage()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState<TradingPlanData>({
    date: format(getSimulatedDate(), "yyyy-MM-dd"),
    setups: "",
    pairs: "",
    timeframes: "",
    entryRules: "",
    exitRules: "",
    stopLoss: "",
    takeProfit: "",
    marketAnalysis: "",
    keyLevels: "",
    notes: "",
  })

  useEffect(() => {
    const simulatedDate = getSimulatedDate()
    const todayDate = format(simulatedDate, "yyyy-MM-dd")

    // Update formData date
    setFormData((prev) => ({ ...prev, date: todayDate }))

    // Load existing plan for today
    const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
    const todayPlan = plans.find((p: TradingPlanData) => p.date === todayDate)

    if (todayPlan) {
      setFormData(todayPlan)
      setIsEditing(true)
    }
  }, [])

  const handleChange = (field: keyof TradingPlanData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.setups.trim()) {
      toast({
        title: "Chybí setupy",
        description: "Prosím vyplň, jaké setupy budeš dnes hledat",
        variant: "destructive",
      })
      return false
    }

    if (!formData.pairs.trim()) {
      toast({
        title: "Chybí páry",
        description: "Prosím vyplň, které páry budeš sledovat",
        variant: "destructive",
      })
      return false
    }

    if (!formData.entryRules.trim()) {
      toast({
        title: "Chybí entry pravidla",
        description: "Prosím definuj jasná pravidla pro vstup do pozice",
        variant: "destructive",
      })
      return false
    }

    if (!formData.exitRules.trim()) {
      toast({
        title: "Chybí exit pravidla",
        description: "Prosím definuj jasná pravidla pro výstup z pozice",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Save to localStorage
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      const existingIndex = plans.findIndex((p: TradingPlanData) => p.date === formData.date)

      if (existingIndex >= 0) {
        plans[existingIndex] = formData
      } else {
        plans.push(formData)
      }

      localStorage.setItem("trading-plans", JSON.stringify(plans))

      // Mark stage as completed
      completeStage(3)

      toast({
        title: isEditing ? "✅ Plán Aktualizován!" : "✅ Plán Vytvořen!",
        description: "Tvůj trading plán byl úspěšně uložen. Pokračuj na Stage 4!",
      })

      setTimeout(() => {
        router.push("/daily-tracker")
      }, 1500)
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Něco se pokazilo. Zkus to prosím znovu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    Stage 3: Trading Plan
                  </h1>
                  <p className="text-muted-foreground">Definuj svou strategii na dnešní trading session 📋</p>
                </div>
              </div>
            </div>
            <Badge className="text-base px-6 py-2 rounded-full bg-blue-500/20 text-blue-400 border-blue-500/30">
              {isEditing ? "📝 Editace" : "✨ Nový Plán"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-blue-500/30 bg-blue-500/10">
        <Info className="h-5 w-5 text-blue-400" />
        <AlertTitle className="text-blue-400 font-bold">💡 Proč je Trading Plan důležitý?</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Trading bez plánu je gambling. Detailní plán ti pomůže dodržovat disciplínu, vyhnout se impulzivním
          rozhodnutím a systematicky zlepšovat své výsledky. Čím konkrétnější plán, tím lepší výsledky!
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Setup & Strategy */}
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Target className="h-6 w-6" />🎯 Setup & Strategie
            </CardTitle>
            <CardDescription>Co dnes budeš hledat a kde?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="setups" className="text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                Jaké Setupy Dnes Hledám? *
              </Label>
              <Textarea
                id="setups"
                value={formData.setups}
                onChange={(e) => handleChange("setups", e.target.value)}
                placeholder="Např: Breakout z range, Pullback na trendovou linii, Support/Resistance bounce..."
                className="min-h-24 bg-slate-900/50 border-green-500/30 text-white"
                required
              />
              <p className="text-xs text-muted-foreground">
                Buď konkrétní! Např. 'Pouze clean breakouty nad 4H resistance s retestem'
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pairs" className="text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Které Páry Sleduji? *
                </Label>
                <Input
                  id="pairs"
                  value={formData.pairs}
                  onChange={(e) => handleChange("pairs", e.target.value)}
                  placeholder="EUR/USD, GBP/USD, GOLD..."
                  className="bg-slate-900/50 border-green-500/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframes" className="text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-400" />
                  Timeframy
                </Label>
                <Input
                  id="timeframes"
                  value={formData.timeframes}
                  onChange={(e) => handleChange("timeframes", e.target.value)}
                  placeholder="4H pro bias, 15min pro entry..."
                  className="bg-slate-900/50 border-green-500/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketAnalysis" className="text-white">
                Market Analysis & Bias
              </Label>
              <Textarea
                id="marketAnalysis"
                value={formData.marketAnalysis}
                onChange={(e) => handleChange("marketAnalysis", e.target.value)}
                placeholder="Jaký je můj dnešní bias? Bullish/Bearish? Proč?"
                className="min-h-20 bg-slate-900/50 border-green-500/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyLevels" className="text-white">
                Key Levels (Support/Resistance)
              </Label>
              <Textarea
                id="keyLevels"
                value={formData.keyLevels}
                onChange={(e) => handleChange("keyLevels", e.target.value)}
                placeholder="Důležité cenové úrovně, které dnes sleduji..."
                className="min-h-20 bg-slate-900/50 border-green-500/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Entry Rules */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <ArrowRight className="h-6 w-6" />✅ Entry Pravidla
            </CardTitle>
            <CardDescription>Za jakých podmínek vstoupím do pozice?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="entryRules" className="text-white">
                Entry Checklist *
              </Label>
              <Textarea
                id="entryRules"
                value={formData.entryRules}
                onChange={(e) => handleChange("entryRules", e.target.value)}
                placeholder="1. Breakout potvrzený na 15min&#10;2. Volume vyšší než průměr&#10;3. Retest úspěšný&#10;4. Žádné důležité news další 30min..."
                className="min-h-32 bg-slate-900/50 border-blue-500/30 font-mono text-sm text-white"
                required
              />
              <p className="text-xs text-muted-foreground">
                Čím konkrétnější, tím lepší! Každý bod = checkbox před vstupem.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Exit Rules */}
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <TrendingUp className="h-6 w-6" />🚪 Exit Pravidla
            </CardTitle>
            <CardDescription>Kdy a jak uzavřu pozici?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exitRules" className="text-white">
                Exit Strategie *
              </Label>
              <Textarea
                id="exitRules"
                value={formData.exitRules}
                onChange={(e) => handleChange("exitRules", e.target.value)}
                placeholder="1. TP1 na 1:1.5 (uzavřu 50%)&#10;2. TP2 na 1:3 (uzavřu 50%)&#10;3. Posunu SL na BE po TP1&#10;4. Trailing stop po TP2..."
                className="min-h-32 bg-slate-900/50 border-amber-500/30 font-mono text-sm text-white"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-white">
                  Stop Loss Strategie
                </Label>
                <Textarea
                  id="stopLoss"
                  value={formData.stopLoss}
                  onChange={(e) => handleChange("stopLoss", e.target.value)}
                  placeholder="Pod poslední swing low, pod support level..."
                  className="min-h-20 bg-slate-900/50 border-amber-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="takeProfit" className="text-white">
                  Take Profit Strategie
                </Label>
                <Textarea
                  id="takeProfit"
                  value={formData.takeProfit}
                  onChange={(e) => handleChange("takeProfit", e.target.value)}
                  placeholder="Na resistance, 1:2 RR, fibonacci extension..."
                  className="min-h-20 bg-slate-900/50 border-amber-500/30 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Additional Notes */}
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <BookOpen className="h-6 w-6" />📝 Dodatečné Poznámky
            </CardTitle>
            <CardDescription>Cokoliv dalšího, co je dnes důležité</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Speciální události (news, earnings), market sentiment, osobní poznámky..."
              className="min-h-24 bg-slate-900/50 border-purple-500/30 text-white"
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="h-14 px-8 text-base bg-slate-800/50 hover:bg-slate-700/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Zpět na Dashboard
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                {isEditing ? "Aktualizovat Plán" : "Uložit Plán & Pokračovat"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
