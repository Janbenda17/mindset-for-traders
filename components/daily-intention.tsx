"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useData } from "@/contexts/data-context"
import { useLanguage } from "@/contexts/language-context"
import { Target, Shield, Brain, TrendingUp, CheckCircle, Sparkles, Loader } from 'lucide-react'
import { cn } from "@/lib/utils"

interface DailyIntentionData {
  date: string
  goals: string
  maxRiskPercent: number
  emotionalGoal: string
  strategy: string
}

const EMOTIONAL_GOALS = [
  { value: "calm", label: "😌 Calm & Collected", color: "text-blue-400" },
  { value: "confident", label: "💪 Confident & Decisive", color: "text-green-400" },
  { value: "patient", label: "⏰ Patient & Disciplined", color: "text-purple-400" },
  { value: "focused", label: "🎯 Focused & Alert", color: "text-orange-400" },
  { value: "analytical", label: "🧠 Analytical & Logical", color: "text-cyan-400" },
]

export function DailyIntention() {
  const router = useRouter()
  const { toast } = useToast()
  const { completeStage, stages } = useDailyStage()
  const { isLiveMode, portfolioValue } = useData()
  const { language } = useLanguage()
  const isEn = language === "en"

  const txt = {
    setIntention: isEn ? "Set Your Daily Intention" : "Nastav si denní záměr",
    defineGoals: isEn ? "Define clear goals and limits before starting today's trading" : "Definuj si jasné cíle a limity před začátkem dnešního obchodování",
    clearGoals: isEn ? "Clear Trading Goals" : "Jasné obchodní cíle",
    riskManagement: isEn ? "Risk Management" : "Řízení rizik",
    mentalPrep: isEn ? "Mental Preparation" : "Duševní příprava",
    todayGoals: isEn ? "Today's Trading Goals" : "Dnešní obchodní cíle",
    goalQuestion: isEn ? "What do you want to achieve today? (e.g. Take only A+ setups, stick to 2% risk rule, focus on patience...)" : "Co chceš dnes dosáhnout? (např. Brát pouze A+ setupy, držet se pravidla 2% rizika, soustředit se na trpělivost...)",
    tipBeSpecific: isEn ? "💡 Tip: Be specific and focus on process goals, not just profit goals" : "💡 Tip: Buď konkrétní a soustředí se na procesní cíle, ne jen na ziskovost",
    maxRisk: isEn ? "Maximum Risk" : "Maximální riziko",
    riskPerTrade: isEn ? "Risk Per Trade (%)" : "Riziko na obchod (%)",
    percent: "%",
    maxRiskDollars: isEn ? "Maximum Risk in Dollars" : "Maximální riziko v dolarech",
    basedOn: isEn ? "Based on portfolio:" : "Na základě portfolia:",
    emotionalGoal: isEn ? "Emotional Goal" : "Emoční cíl",
    todayI: isEn ? "Today I will be" : "Dnes budu",
    strategy: isEn ? "Today's Trading Strategy" : "Dnešní obchodní strategie",
    strategyQuestion: isEn ? "What is your strategy for today? (e.g. Trend following on EUR/USD, waiting for breakout confirmation, trading only London session...)" : "Jaká je tvá strategie pro dnes? (např. Sledování trendu na EUR/USD, čekání na potvrzení průrazu, obchodování pouze během londýnské session...)",
    tipStrategy: isEn ? "💡 Tip: Include specific setups you're looking for and market conditions" : "💡 Tip: Zahrnuj specifické setupy, které hledáš, a tržní podmínky",
    compass: isEn ? "Your Daily Trading Compass" : "Tvůj denní obchodní kompas",
    compassDesc: isEn ? "Setting your daily intention will help you stay focused and disciplined throughout the trading day. You can review and reflect on your intentions anytime in the Daily Tracker." : "Nastavení svého denního záměru ti pomůže zůstat soustředěný a disciplinovaný po celý obchodní den. Svůj záměr můžeš zkontrolovat a reflektovat kdykoliv v Daily Tracker.",
    liveOnly: isEn ? "Available only in Live Mode" : "Dostupné pouze v Live režimu",
    saveBtn: isEn ? "💾 Save Intention" : "💾 Uložit záměr",
    stageLocked: isEn ? "Stage Locked" : "Etapa uzamčena",
    stageLockedDesc: isEn ? "Stage 2 (Daily Intention) has already been completed today and is locked. Changes cannot be made." : "Etapa 2 (Denní záměr) již byla dnes dokončena a je uzamčena. Změny nelze provést.",
    demoMode: isEn ? "Demo Mode" : "Demo režim",
    demoModeDesc: isEn ? "This feature is only available in Live Mode. Your data will not be saved in Demo Mode." : "Tato funkce je dostupná pouze v Live Mode. Tvá data se v Demo Mode nebudou ukládat.",
    missingInfo: isEn ? "Missing Information" : "Chybějící informace",
    missingInfoDesc: isEn ? "Please fill in your goals and strategy" : "Vyplň prosím své cíle a strategii",
    saved: isEn ? "✅ Daily Intention Set!" : "✅ Denní záměr nastaven!",
    savedDesc: isEn ? "Your daily goals and strategy have been saved" : "Tvé denní cíle a strategie byly uloženy",
  }
  const [intention, setIntention] = useState<DailyIntentionData>({
    date: new Date().toISOString().split("T")[0],
    goals: "",
    maxRiskPercent: 2,
    emotionalGoal: "calm",
    strategy: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)

  // Check if stage 2 is locked
  const stage2 = stages.find((s) => s.id === 2)
  const isStage2Locked = stage2?.locked || false

  const maxRiskDollars = (portfolioValue * intention.maxRiskPercent) / 100

  const generateWithAI = async () => {
    try {
      setIsGenerating(true)
      
      const todayDate = new Date().toISOString().split("T")[0]
      
      const response = await fetch('/api/autofill/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current_user', // Will be set from auth context
          date: todayDate,
          types: ['daily_intentions']
        })
      })

      const data = await response.json()

      if (data.success && data.results.daily_intentions) {
        const ai = data.results.daily_intentions
        
        setAiSuggestion(ai)
        setIntention({
          ...intention,
          goals: ai.mainGoal,
          maxRiskPercent: ai.maxRiskPercent,
          emotionalGoal: ai.emotionalFocus,
          strategy: ai.strategyNote,
        })

        toast({
          title: isEn ? "✨ AI Analysis Complete" : "✨ Analýza AI hotova",
          description: isEn ? "Your daily intentions have been generated" : "Tvé denní záměry byly vytvořeny",
          duration: 3000,
        })
      } else {
        throw new Error('Failed to generate')
      }
    } catch (error) {
      console.error('[v0] AI generation error:', error)
      toast({
        title: isEn ? "AI Generation Failed" : "Chyba generování AI",
        description: isEn ? "Please fill in your intentions manually" : "Vyplň si prosím své záměry ručně",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsGenerating(false)
    }
  }
    // Check if stage is locked
    if (isStage2Locked) {
      toast({
        title: txt.stageLocked,
        description: txt.stageLockedDesc,
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!isLiveMode) {
      toast({
        title: txt.demoMode,
        description: txt.demoModeDesc,
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!intention.goals.trim() || !intention.strategy.trim()) {
      toast({
        title: txt.missingInfo,
        description: txt.missingInfoDesc,
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const todayDate = new Date().toISOString().split("T")[0]

    // Save intention history - POUZE DO SAMOSTATNÉHO STORAGE
    const saved = localStorage.getItem("daily-intentions") || "[]"
    const intentions = JSON.parse(saved)
    const filtered = intentions.filter((i: DailyIntentionData) => i.date !== todayDate)
    filtered.push({ ...intention, date: todayDate })
    localStorage.setItem("daily-intentions", JSON.stringify(filtered))

    // Complete stage 2
    completeStage(2)

    toast({
      title: txt.saved,
      description: txt.savedDesc,
      duration: 3000,
    })

    setTimeout(() => {
      router.push("/daily-tracker")
    }, 1000)
  }

  const selectedEmotion = EMOTIONAL_GOALS.find((e) => e.value === intention.emotionalGoal)

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-blue-500/20 border-2 border-blue-500/30">
              <Target className="h-10 w-10 text-blue-400" />
            </div>
            <div className="flex-1">
      <h3 className="text-3xl font-black text-blue-400 mb-2">{txt.setIntention}</h3>
      <p className="text-gray-400 mb-6">
        {txt.defineGoals}
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>{txt.clearGoals}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-orange-400" />
                  <span>{txt.riskManagement}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span>{txt.mentalPrep}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            {txt.todayGoals}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={intention.goals}
            onChange={(e) => setIntention({ ...intention, goals: e.target.value })}
            placeholder={txt.goalQuestion}
            className="min-h-[120px] bg-white/5 border-white/10 resize-none text-base"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {txt.tipBeSpecific}
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Management */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              {txt.maxRisk}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{txt.riskPerTrade}</label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={intention.maxRiskPercent}
                  onChange={(e) =>
                    setIntention({ ...intention, maxRiskPercent: Number.parseFloat(e.target.value) || 0 })
                  }
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="h-12 text-lg font-bold bg-white/5 border-white/10 text-center"
                />
                <span className="text-lg font-bold text-red-400">{txt.percent}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm text-muted-foreground mb-1">{txt.maxRiskDollars}</div>
              <div className="text-3xl font-black text-red-400">${maxRiskDollars.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {txt.basedOn} ${portfolioValue.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emotional Goal */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              {txt.emotionalGoal}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={intention.emotionalGoal}
              onValueChange={(val) => setIntention({ ...intention, emotionalGoal: val })}
            >
              <SelectTrigger className="h-12 bg-white/5 border-white/10 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMOTIONAL_GOALS.map((emotion) => (
                  <SelectItem key={emotion.value} value={emotion.value}>
                    {emotion.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmotion && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-sm text-muted-foreground mb-1">{txt.todayI}</div>
                <div className={cn("text-2xl font-black", selectedEmotion.color)}>{selectedEmotion.label}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            {txt.strategy}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={intention.strategy}
            onChange={(e) => setIntention({ ...intention, strategy: e.target.value })}
            placeholder={txt.strategyQuestion}
            className="min-h-[120px] bg-white/5 border-white/10 resize-none text-base"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {txt.tipStrategy}
          </p>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="p-6 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 flex items-start gap-4">
        <CheckCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-blue-400 mb-2">{txt.compass}</h4>
          <p className="text-sm text-muted-foreground">
            {txt.compassDesc}
          </p>
        </div>
      </div>

      {/* AI Generation Button */}
      <Button
        onClick={generateWithAI}
        disabled={isGenerating || isStage2Locked || !isLiveMode}
        className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            {isEn ? "Generating with AI..." : "Generuji AI..."}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {isEn ? "✨ Generate with AI" : "✨ Vygenerovat AI"}
          </>
        )}
      </Button>

      {/* AI Suggestion Display */}
      {aiSuggestion && (
        <Card className="bg-purple-900/20 border-purple-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-5 h-5" />
              {isEn ? "AI Suggestions" : "Návrhy AI"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isEn ? "Focus Areas" : "Oblasti zaměření"}:</p>
              <p className="text-sm text-purple-300">{aiSuggestion.focusAreas?.join(", ") || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={saveIntention}
        disabled={!isLiveMode || !intention.goals.trim() || !intention.strategy.trim() || isStage2Locked}
        className={cn(
          "w-full h-16 text-xl font-black rounded-2xl shadow-2xl",
          isStage2Locked
            ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600",
          "disabled:opacity-50"
        )}
      >
        <CheckCircle className="w-6 h-6 mr-2" />
        {isStage2Locked
          ? isEn ? "Closed - Daily Intention was completed today" : "Uzavřeno - Denní záměr byl dnes dokončen"
          : isLiveMode
            ? txt.saveBtn
            : txt.liveOnly}
      </Button>
    </div>
  )
}
