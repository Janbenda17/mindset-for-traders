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
import { cn } from "@/lib/utils"
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
import { getUserStorageKey } from "@/utils/storage-namespace"

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
  const { completeStage, stages } = useDailyStage()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Check if stage 3 is locked
  const stage3 = stages.find((s) => s.id === 3)
  const isStage3Locked = stage3?.locked || false

  const [formData, setFormData] = useState<TradingPlanData>({
    date: format(new Date(), "yyyy-MM-dd"),
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
    const plansKey = getUserStorageKey("trading-plans")
    const plans = JSON.parse(localStorage.getItem(plansKey) || "[]")
    const todayPlan = plans.find((p: TradingPlanData) => p.date === formData.date)

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
        title: "Missing Setups",
        description: "Please describe what setups you're looking for today",
        variant: "destructive",
      })
      return false
    }

    if (!formData.pairs.trim()) {
      toast({
        title: "Missing Pairs",
        description: "Please specify which pairs you'll be monitoring",
        variant: "destructive",
      })
      return false
    }

    if (!formData.entryRules.trim()) {
      toast({
        title: "Missing Entry Rules",
        description: "Please define clear rules for entering a position",
        variant: "destructive",
      })
      return false
    }

    if (!formData.exitRules.trim()) {
      toast({
        title: "Missing Exit Rules",
        description: "Please define clear rules for exiting a position",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if stage is locked
    if (isStage3Locked) {
      toast({
        title: "Stage Locked",
        description: "Stage 3 (Trading Plan) has already been completed today and is locked. Changes cannot be made.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const plansKey = getUserStorageKey("trading-plans")
      const plans = JSON.parse(localStorage.getItem(plansKey) || "[]")
      const existingIndex = plans.findIndex((p: TradingPlanData) => p.date === formData.date)

      if (existingIndex >= 0) {
        plans[existingIndex] = formData
      } else {
        plans.push(formData)
      }

      localStorage.setItem(plansKey, JSON.stringify(plans))

      // Mark stage as completed
      completeStage(3)

      toast({
        title: isEditing ? "✅ Plan Updated!" : "✅ Plan Created!",
        description: "Your trading plan has been successfully saved. Continue to Stage 4!",
      })

      setTimeout(() => {
        router.push("/daily-tracker")
      }, 1500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
                  <p className="text-muted-foreground">Define your strategy for today's trading session 📋</p>
                </div>
              </div>
            </div>
            <Badge className="text-base px-6 py-2 rounded-full bg-blue-500/20 text-blue-400 border-blue-500/30">
              {isEditing ? "📝 Editing" : "✨ New Plan"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-blue-500/30 bg-blue-500/10">
        <Info className="h-5 w-5 text-blue-400" />
        <AlertTitle className="text-blue-400 font-bold">💡 Why Is a Trading Plan Important?</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Trading without a plan is gambling. A detailed plan will help you maintain discipline, avoid impulsive decisions and systematically improve your results. The more specific your plan, the better your results!
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Setup & Strategy */}
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Target className="h-6 w-6" />🎯 Setup & Strategy
            </CardTitle>
            <CardDescription>What will you look for today and where?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="setups" className="text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                What Setups Am I Looking For Today? *
              </Label>
              <Textarea
                id="setups"
                value={formData.setups}
                onChange={(e) => handleChange("setups", e.target.value)}
                placeholder="E.g: Range breakout, Pullback to trendline, Support/Resistance bounce..."
                className="min-h-24 bg-slate-900/50 border-green-500/30 text-white"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific! E.g. 'Only clean breakouts above 4H resistance with retest'
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pairs" className="text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  Which Pairs Am I Monitoring? *
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
                  Timeframes
                </Label>
                <Input
                  id="timeframes"
                  value={formData.timeframes}
                  onChange={(e) => handleChange("timeframes", e.target.value)}
                  placeholder="4H for bias, 15min for entry..."
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
                placeholder="What is my bias today? Bullish/Bearish? Why?"
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
                placeholder="Important price levels I'm monitoring today..."
                className="min-h-20 bg-slate-900/50 border-green-500/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Entry Rules */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <ArrowRight className="h-6 w-6" />✅ Entry Rules
            </CardTitle>
            <CardDescription>Under what conditions will I enter a position?</CardDescription>
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
                placeholder="1. Breakout confirmed on 15min&#10;2. Volume higher than average&#10;3. Retest successful&#10;4. No important news next 30min..."
                className="min-h-32 bg-slate-900/50 border-blue-500/30 font-mono text-sm text-white"
                required
              />
              <p className="text-xs text-muted-foreground">
                The more specific, the better! Each point = checkbox before entry.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Exit Rules */}
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <TrendingUp className="h-6 w-6" />🚪 Exit Rules
            </CardTitle>
            <CardDescription>When and how will I close the position?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exitRules" className="text-white">
                Exit Strategy *
              </Label>
              <Textarea
                id="exitRules"
                value={formData.exitRules}
                onChange={(e) => handleChange("exitRules", e.target.value)}
                placeholder="1. TP1 at 1:1.5 (close 50%)&#10;2. TP2 at 1:3 (close 50%)&#10;3. Move SL to BE after TP1&#10;4. Trailing stop after TP2..."
                className="min-h-32 bg-slate-900/50 border-amber-500/30 font-mono text-sm text-white"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stopLoss" className="text-white">
                  Stop Loss Strategy
                </Label>
                <Textarea
                  id="stopLoss"
                  value={formData.stopLoss}
                  onChange={(e) => handleChange("stopLoss", e.target.value)}
                  placeholder="Below last swing low, below support level..."
                  className="min-h-20 bg-slate-900/50 border-amber-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="takeProfit" className="text-white">
                  Take Profit Strategy
                </Label>
                <Textarea
                  id="takeProfit"
                  value={formData.takeProfit}
                  onChange={(e) => handleChange("takeProfit", e.target.value)}
                  placeholder="At resistance, 1:2 RR, fibonacci extension..."
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
              <BookOpen className="h-6 w-6" />📝 Additional Notes
            </CardTitle>
            <CardDescription>Anything else that is important today</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Special events (news, earnings), market sentiment, personal notes..."
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
            Back to Dashboard
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isStage3Locked}
            className={cn(
              "h-14 px-8 text-base",
              isStage3Locked
                ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            )}
          >
            {isStage3Locked ? (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Closed - Plan was completed today
              </>
            ) : isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                {isEditing ? "Update Plan" : "Save Plan & Continue"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
