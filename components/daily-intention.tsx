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
import { Target, Shield, Brain, TrendingUp, CheckCircle } from 'lucide-react'
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
  const [intention, setIntention] = useState<DailyIntentionData>({
    date: new Date().toISOString().split("T")[0],
    goals: "",
    maxRiskPercent: 2,
    emotionalGoal: "calm",
    strategy: "",
  })

  // Check if stage 2 is locked
  const stage2 = stages.find((s) => s.id === 2)
  const isStage2Locked = stage2?.locked || false

  const maxRiskDollars = (portfolioValue * intention.maxRiskPercent) / 100

  const saveIntention = () => {
    // Check if stage is locked
    if (isStage2Locked) {
      toast({
        title: "Fáze Uzamčena",
        description: "Fáze 2 (Denní záměr) již byla dnes dokončena a je uzamčena. Změny se nemohou provádět.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!isLiveMode) {
      toast({
        title: "Demo Mode",
        description: "Tato funkce je dostupná pouze v Live Mode. Tvoje data se v Demo Mode neuloží.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!intention.goals.trim() || !intention.strategy.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your goals and strategy",
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
      title: "✅ Daily Intention Set!",
      description: "Your daily goals and strategy have been saved",
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
              <h3 className="text-3xl font-black text-blue-400 mb-2">Nastavte si denní záměr</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Definujte jasné cíle a limity před zahájením dnešního obchodování
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Jasné obchodní cíle</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-orange-400" />
                  <span>Řízení rizik</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span>Mentální příprava</span>
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
            Dnešní obchodní cíle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={intention.goals}
            onChange={(e) => setIntention({ ...intention, goals: e.target.value })}
            placeholder="Čeho chcete dnes dosáhnout? (např. Brát pouze A+ setupy, držet se 2% risk pravidla, zaměřit se na trpělivost...)"
            className="min-h-[120px] bg-white/5 border-white/10 resize-none text-base"
          />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Buďte konkrétní a zaměřte se na procesní cíle, nejen na ziskové cíle
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Management */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Maximální riziko
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Riziko na obchod (%)</label>
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
                <span className="text-lg font-bold text-red-400">%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm text-muted-foreground mb-1">Maximální riziko v dolarech</div>
              <div className="text-3xl font-black text-red-400">${maxRiskDollars.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Na základě portfolia: ${portfolioValue.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emotional Goal */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Emoční cíl
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
                <div className="text-sm text-muted-foreground mb-1">Dnes budu</div>
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
            Dnešní obchodní strategie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={intention.strategy}
            onChange={(e) => setIntention({ ...intention, strategy: e.target.value })}
            placeholder="Jaká je vaše strategie na dnes? (např. Trend following na EUR/USD, čekání na breakout konfirmace, obchodování pouze Londýnské session...)"
            className="min-h-[120px] bg-white/5 border-white/10 resize-none text-base"
          />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Zahrňte konkrétní setupy, které hledáte, a tržní podmínky
          </p>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="p-6 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 flex items-start gap-4">
        <CheckCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-blue-400 mb-2">Váš denní obchodní kompas</h4>
          <p className="text-sm text-muted-foreground">
            Nastavení denního záměru vám pomůže zůstat soustředění a disciplinovaní po celý obchodní den. Své záměry můžete kdykoli zkontrolovat a zamyslet se nad nimi v Daily Trackeru.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={saveIntention}
        disabled={!isLiveMode || !intention.goals.trim() || !intention.strategy.trim()}
        className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 shadow-2xl disabled:opacity-50"
      >
        <CheckCircle className="w-6 h-6 mr-2" />
        {isLiveMode ? "Nastavit denní záměr" : "Dostupné pouze v Live Mode"}
      </Button>
    </div>
  )
}
