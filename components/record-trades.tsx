"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useData } from "@/contexts/data-context"
import { useAuth } from "@/contexts/auth-context"
import { useLiveMode } from "@/contexts/live-mode-context"
import { showXPNotification, showLevelUpNotification } from "@/lib/xp-notifications"
import { TrendingUp, DollarSign, BarChart3, Brain, Zap, ChevronDown, Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Trade {
  id: string
  date: string
  title: string
  pair: string
  direction: "LONG" | "SHORT"
  openTime: string
  closeTime: string
  session: string // Asian, London, New York, Overlap
  tradeType: string // Scalp, Day Trade, Swing
  pips: number
  positionSize: number
  pnl: number
  confidenceBefore: number
  stressLevel: number
  mood: number
  emotionBefore: string
  emotionDuring: string
  emotionAfter: string
  entryReason: string
  exitReason: string
  detailedAnalysis: string
  followedPlan: boolean
  exitedEarly: boolean
  missedDueToHesitation: boolean
  revengeTrade: boolean
  behaviorDescription: string
  tags: string[]
  notes: string
  openDate?: string // Added for date tracking
  closeDate?: string // Added for date tracking
}

interface TradingPlanData {
  date: string
  setups: string
  pairs: string
  entryRules: string
  exitRules: string
}

interface MorningCheckData {
  date: string
  stressLevel: number
  focus: number
  emotionalState: number
}

const EMOTIONS_BEFORE = [
  "Klidný",
  "Sebevědomý",
  "Nervózní",
  "Nejistý",
  "Nadšený",
  "Unavený",
  "Soustředěný",
  "Rozrušený",
]

const EMOTIONS_DURING = [
  "Klidný",
  "Stresovaný",
  "Sebevědomý",
  "Panický",
  "Soustředěný",
  "Rozptýlený",
  "Trpělivý",
  "Netrpělivý",
]

const EMOTIONS_AFTER = ["Spokojený", "Frustrovaný", "Hrdý", "Zklamaný", "Poučený", "Naštvaný", "Klidný", "Euforický"]

export function RecordTrades({ onComplete }: { onComplete?: () => void }) {
  const { toast } = useToast()
  const router = useRouter()
  const { completeStage, stages } = useDailyStage()
  const { addTrade, deleteTrade } = useData()
  const { user } = useAuth()
  const { isLiveMode } = useLiveMode()
  const [isLoading, setIsLoading] = useState(false)
  const [todayPlan, setTodayPlan] = useState<TradingPlanData | null>(null)
  const [morningCheck, setMorningCheck] = useState<MorningCheckData | null>(null)

  const [trades, setTrades] = useState<Trade[]>([])
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)
  const [currentTrade, setCurrentTrade] = useState<Partial<Trade>>({
    date: format(new Date(), "yyyy-MM-dd"),
    openDate: format(new Date(), "yyyy-MM-dd"),
    closeDate: format(new Date(), "yyyy-MM-dd"),
    pair: "",
    direction: "LONG",
    openTime: "",
    closeTime: "",
    session: "",
    tradeType: "",
    pips: 0,
    positionSize: 0.01,
    pnl: 0,
    confidenceBefore: 7,
    stressLevel: 5,
    mood: 7,
    emotionBefore: "",
    emotionDuring: "",
    emotionAfter: "",
    entryReason: "",
    exitReason: "",
    detailedAnalysis: "",
    followedPlan: true,
    exitedEarly: false,
    missedDueToHesitation: false,
    revengeTrade: false,
    behaviorDescription: "",
    tags: [],
    notes: "",
  })

  const determineSession = (time: string): string => {
    if (!time) return ""
    const hour = Number.parseInt(time.split(":")[0])

    // Asian session: 00:00 - 09:00
    if (hour >= 0 && hour < 9) return "Asian"
    // London session: 09:00 - 17:00
    if (hour >= 9 && hour < 17) return "London"
    // New York session: 14:00 - 23:00
    if (hour >= 14 && hour < 23) return "New York"
    // Overlap: 14:00 - 17:00
    if (hour >= 14 && hour < 17) return "London/NY Overlap"

    return "Asian"
  }

  const determineTradeType = (openDate: string, openTime: string, closeDate: string, closeTime: string): string => {
    if (!openDate || !openTime || !closeDate || !closeTime) return ""

    const [openHour, openMin] = openTime.split(":").map(Number)
    const [closeHour, closeMin] = closeTime.split(":").map(Number)

    const openDateTime = new Date(`${openDate}T${openTime}:00`)
    const closeDateTime = new Date(`${closeDate}T${closeTime}:00`)

    const durationMinutes = Math.floor((closeDateTime.getTime() - openDateTime.getTime()) / (1000 * 60))

    if (durationMinutes >= 1 && durationMinutes <= 15) return "Scalp"
    if (durationMinutes >= 16 && durationMinutes <= 1440) return "Day Trade"
    if (durationMinutes >= 1500) return "Swing"

    return ""
  }

  useEffect(() => {
    if (currentTrade.openTime) {
      const session = determineSession(currentTrade.openTime)
      setCurrentTrade((prev) => ({ ...prev, session }))
    }

    if (currentTrade.openDate && currentTrade.openTime && currentTrade.closeDate && currentTrade.closeTime) {
      const tradeType = determineTradeType(
        currentTrade.openDate,
        currentTrade.openTime,
        currentTrade.closeDate,
        currentTrade.closeTime,
      )
      setCurrentTrade((prev) => ({ ...prev, tradeType }))
    }
  }, [currentTrade.openDate, currentTrade.openTime, currentTrade.closeDate, currentTrade.closeTime])

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd")

    const plansKey = `user-${user?.id}-trading-plans`
    const plans = JSON.parse(localStorage.getItem(plansKey) || "[]")
    const plan = plans.find((p: TradingPlanData) => p.date === today)
    setTodayPlan(plan)

    const checksKey = `user-${user?.id}-mindtrader-morning-checks`
    const morningChecks = JSON.parse(localStorage.getItem(checksKey) || "[]")
    const todayMorningCheck = morningChecks.find((m: any) => m.date === today)

    if (todayMorningCheck) {
      setMorningCheck(todayMorningCheck)
      setCurrentTrade((prev) => ({
        ...prev,
        stressLevel: todayMorningCheck.stressLevel,
        confidenceBefore: todayMorningCheck.focus,
        mood: todayMorningCheck.emotionalState,
      }))
    }

    const tradesKey = `user-${user?.id}-mindtrader-trades`
    const allTrades = JSON.parse(localStorage.getItem(tradesKey) || "[]")
    const todayTrades = allTrades.filter((t: Trade) => t.date === today)
    setTrades(todayTrades)
  }, [user?.id])

  const handleAddTrade = async () => {
    console.log("[v0] handleAddTrade called", currentTrade)
    
    // Check if stage 4 is locked (already completed today)
    const stage4 = stages.find((s) => s.id === 4)
    if (stage4?.locked) {
      toast({
        title: "Stage Uzamčen",
        description: "Fáze 4 (Záznam obchodů) již byla dnes dokončena a je nyní uzamčena. Záznam obchodů lze provádět pouze během aktivní fáze.",
        variant: "destructive",
      })
      return
    }
    
    // Minimal validation - just require pair
    if (!currentTrade.pair) {
      toast({
        title: "Chyba",
        description: "Vyplňte prosím minimálně měnový pár",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const newTrade = {
      ...currentTrade,
      id: `trade-${Date.now()}`,
      entryPrice: parseFloat(String(currentTrade.entryPrice || 0)),
      exitPrice: parseFloat(String(currentTrade.exitPrice || 0)),
      quantity: parseFloat(String(currentTrade.quantity || 0)),
    } as Trade

    console.log("[v0] Calling addTrade with:", newTrade)
    const success = await addTrade(newTrade)
    console.log("[v0] addTrade result:", success)

    if (!success) {
      setIsLoading(false)
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit obchod.",
        variant: "destructive",
      })
      return
    }

    // Refresh trades
    const today = format(new Date(), "yyyy-MM-dd")
    if (isLiveMode) {
      // LIVE MODE: Get data from data context which loads from Supabase
      console.log("[v0] LIVE MODE: Loading trades from Supabase via refreshLiveData")
      // The data context will automatically refresh after addTrade, no need to manually refresh
    } else {
      // VIRTUAL MODE: Get from localStorage
      const tradesKey = `user-${user?.id}-mindtrader-trades`
      const allTrades = JSON.parse(localStorage.getItem(tradesKey) || "[]")
      const todayTrades = allTrades.filter((t: Trade) => t.date === today)
      setTrades(todayTrades)
    }

    // Mark record trade as completed in daily tracker
    try {
      await fetch("/api/daily-tracker/mark-completed", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ type: "record_trade" }),
      })
    } catch (error) {
      console.error("[v0] Error marking record trade as completed:", error)
    }

    // Award 10 XP for new trade
    try {
      const xpResponse = await fetch("/api/xp/award", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "new_trade", 
          metadata: { pair: newTrade.pair, pnl: newTrade.pnl } 
        }),
      })
      const xpData = await xpResponse.json()
      if (xpData.success) {
        console.log("[v0] New trade XP awarded:", xpData.xpAwarded)
        showXPNotification(xpData.xpAwarded, "Trade Recorded!")
        if (xpData.leveledUp) {
          showLevelUpNotification(xpData.level)
        }
      }
    } catch (error) {
      console.error("[v0] Error awarding trade XP:", error)
    }

    // Reset form and complete stage
    setCurrentTrade({
      date: format(new Date(), "yyyy-MM-dd"),
      openDate: format(new Date(), "yyyy-MM-dd"),
      closeDate: format(new Date(), "yyyy-MM-dd"),
      pair: "",
      direction: "LONG",
      openTime: "",
      closeTime: "",
      session: "",
      tradeType: "",
      pips: 0,
      positionSize: 0.01,
      pnl: 0,
      confidenceBefore: 7,
      stressLevel: 5,
      mood: 7,
      emotionBefore: "",
      emotionDuring: "",
      emotionAfter: "",
      entryReason: "",
      exitReason: "",
      detailedAnalysis: "",
      followedPlan: true,
      exitedEarly: false,
      missedDueToHesitation: false,
      revengeTrade: false,
      behaviorDescription: "",
      tags: [],
      notes: "",
    })
    
    setIsLoading(false)
    
    toast({
      title: "Úspěch!",
      description: "Obchod byl uložen a stage 4 je hotov!",
    })

    // Attempt to complete stage
    try {
      await completeStage()
    } catch (error) {
      console.error("[v0] Error completing stage:", error)
    }

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete()
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleAddTrade()
  }

  const todayPnL = trades.reduce((sum, t) => sum + t.pnl, 0)

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-pink-600/10 p-8 border border-blue-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl backdrop-blur-sm border border-blue-400/20 shadow-lg">
            <TrendingUp className="w-7 h-7 text-blue-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Zaznamenat obchod</h1>
            <p className="text-blue-200/80 text-sm">
              Zaznamenejte své obchody a získejte hlubší náhled na svůj trading
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-lg shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Dnešní přehled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Celkem obchodů</p>
              <p className="text-3xl font-bold text-white">{trades.length}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Win Rate</p>
              <p className="text-3xl font-bold text-white">
                {trades.length > 0 ? Math.round((trades.filter((t) => t.pnl > 0).length / trades.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">P&L</p>
              <p className={cn("text-3xl font-bold", todayPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4 border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Základní informace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Měnový pár *</label>
                <input
                  type="text"
                  placeholder="EUR/USD"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.pair}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, pair: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Směr *</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.direction}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, direction: e.target.value as "LONG" | "SHORT" })}
                >
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Datum otevření *</label>
                <input
                  type="date"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.openDate}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, openDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Čas otevření *</label>
                <input
                  type="time"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.openTime}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, openTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Datum zavření *</label>
                <input
                  type="date"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.closeDate}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, closeDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Čas zavření *</label>
                <input
                  type="time"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.closeTime}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, closeTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Session</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-gray-400"
                  value={currentTrade.session}
                  disabled
                  placeholder="Auto-detekce"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Typ tradu</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-gray-400"
                  value={currentTrade.tradeType}
                  disabled
                  placeholder="Auto-detekce"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Pips *</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.pips}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, pips: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Velikost pozice</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.positionSize}
                  onChange={(e) =>
                    setCurrentTrade({ ...currentTrade, positionSize: Number.parseFloat(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">P&L ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.pnl}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, pnl: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4 border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Psychologická analýza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  Důvěra před ({currentTrade.confidenceBefore})
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full"
                  value={currentTrade.confidenceBefore}
                  onChange={(e) =>
                    setCurrentTrade({ ...currentTrade, confidenceBefore: Number.parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Stres ({currentTrade.stressLevel})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full"
                  value={currentTrade.stressLevel}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, stressLevel: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Nálada ({currentTrade.mood})</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full"
                  value={currentTrade.mood}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, mood: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Emoce před</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.emotionBefore}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, emotionBefore: e.target.value })}
                >
                  <option value="">Vyber...</option>
                  {EMOTIONS_BEFORE.map((emotion) => (
                    <option key={emotion} value={emotion}>
                      {emotion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Emoce během</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.emotionDuring}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, emotionDuring: e.target.value })}
                >
                  <option value="">Vyber...</option>
                  {EMOTIONS_DURING.map((emotion) => (
                    <option key={emotion} value={emotion}>
                      {emotion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Emoce po</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.emotionAfter}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, emotionAfter: e.target.value })}
                >
                  <option value="">Vyber...</option>
                  {EMOTIONS_AFTER.map((emotion) => (
                    <option key={emotion} value={emotion}>
                      {emotion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Důvod vstupu</label>
                <textarea
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  rows={2}
                  value={currentTrade.entryReason}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, entryReason: e.target.value })}
                  placeholder="Proč jsi vstoupil do tohoto tradu?"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Důvod výstupu</label>
                <textarea
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  rows={2}
                  value={currentTrade.exitReason}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, exitReason: e.target.value })}
                  placeholder="Proč jsi z tradu vystoupil?"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Detailní analýza</label>
                <textarea
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  value={currentTrade.detailedAnalysis}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, detailedAnalysis: e.target.value })}
                  placeholder="Co se stalo? Co fungovalo? Co ne?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={currentTrade.followedPlan}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, followedPlan: e.target.checked })}
                  className="rounded"
                />
                Následoval jsem plán
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={currentTrade.exitedEarly}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, exitedEarly: e.target.checked })}
                  className="rounded"
                />
                Vystoupil jsem příliš brzy
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={currentTrade.missedDueToHesitation}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, missedDueToHesitation: e.target.checked })}
                  className="rounded"
                />
                Zmeškal jsem příležitost kvůli váhání
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={currentTrade.revengeTrade}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, revengeTrade: e.target.checked })}
                  className="rounded"
                />
                Revenge trade
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">Popis chování</label>
              <textarea
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                rows={2}
                value={currentTrade.behaviorDescription}
                onChange={(e) => setCurrentTrade({ ...currentTrade, behaviorDescription: e.target.value })}
                placeholder="Jak ses během tradu choval?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Tagy (oddělené čárkou)</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={Array.isArray(currentTrade.tags) ? currentTrade.tags.join(", ") : currentTrade.tags}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, tags: e.target.value })}
                  placeholder="breakout, trend, support"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Poznámky</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  value={currentTrade.notes}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, notes: e.target.value })}
                  placeholder="Další poznámky..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {isLoading ? "Ukládám..." : "Uložit obchod"}
        </Button>

        {/* No trades today button */}
        <Button
          type="button"
          onClick={async () => {
            setIsLoading(true)
            try {
              await completeStage("record-trades")
              toast({
                title: "✓ Stage 4 hotov",
                description: "Dnes bez obchodu - stage 4 uzavřena",
              })
            } catch (error) {
              toast({
                title: "Chyba",
                description: "Nepodařilo se uzavřít stage 4",
                variant: "destructive",
              })
            } finally {
              setIsLoading(false)
            }
          }}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-7 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dnes bez obchodu
        </Button>
      </form>

      {trades.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50 backdrop-blur-lg shadow-lg">
          <CardHeader className="pb-4 border-b border-slate-700/50">
            <CardTitle className="text-lg font-semibold text-white">Dnešní obchody ({trades.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {trades.map((trade) => (
              <div key={trade.id} className="space-y-2">
                <button
                  onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                  className="w-full bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/80 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-800/50 transition-all duration-300 hover:shadow-lg text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg">
                        {trade.direction === "LONG" ? "📈" : "📉"} {trade.direction} {trade.pair}
                      </p>
                      <p className="text-sm text-gray-400">
                        {trade.openTime} - {trade.closeTime} • {trade.session} • {trade.tradeType}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`text-xl font-bold ${trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">{trade.pips} pips</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedTradeId === trade.id ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                </button>

                {expandedTradeId === trade.id && (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-xl p-6 border border-slate-600/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Trade Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Měnový pár</p>
                        <p className="text-white font-bold">{trade.pair}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Velikost pozice</p>
                        <p className="text-white font-bold">{trade.positionSize} Lot</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Session</p>
                        <p className="text-white font-bold">{trade.session || "Není"}</p>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Typ tradu</p>
                        <p className="text-white font-bold">{trade.tradeType || "Není"}</p>
                      </div>
                    </div>

                    {/* Psychological Metrics */}
                    <div className="border-t border-slate-600/30 pt-4">
                      <p className="text-sm font-semibold text-purple-300 mb-3">Psychologické metriky</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                          <p className="text-xs text-gray-400 mb-1">Důvěra (před)</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-700/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                                style={{ width: `${(trade.confidenceBefore / 10) * 100}%` }}
                              />
                            </div>
                            <p className="text-white font-bold text-sm w-8">{trade.confidenceBefore}/10</p>
                          </div>
                        </div>
                        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                          <p className="text-xs text-gray-400 mb-1">Stres</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-700/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full"
                                style={{ width: `${(trade.stressLevel / 10) * 100}%` }}
                              />
                            </div>
                            <p className="text-white font-bold text-sm w-8">{trade.stressLevel}/10</p>
                          </div>
                        </div>
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-xs text-gray-400 mb-1">Nálada</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-700/50 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                                style={{ width: `${(trade.mood / 10) * 100}%` }}
                              />
                            </div>
                            <p className="text-white font-bold text-sm w-8">{trade.mood}/10</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emotions */}
                    <div className="border-t border-slate-600/30 pt-4">
                      <p className="text-sm font-semibold text-blue-300 mb-3">Emoční cyklus</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-xs text-gray-400 mb-1 font-semibold">Před</p>
                          <p className="text-white">{trade.emotionBefore || "Není"}</p>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                          <p className="text-xs text-gray-400 mb-1 font-semibold">Během</p>
                          <p className="text-white">{trade.emotionDuring || "Není"}</p>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                          <p className="text-xs text-gray-400 mb-1 font-semibold">Po</p>
                          <p className="text-white">{trade.emotionAfter || "Není"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Entry & Exit Reasons */}
                    <div className="border-t border-slate-600/30 pt-4 space-y-3">
                      {trade.entryReason && (
                        <div>
                          <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">Důvod vstupu</p>
                          <p className="text-sm text-gray-200">{trade.entryReason}</p>
                        </div>
                      )}
                      {trade.exitReason && (
                        <div>
                          <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">Důvod výstupu</p>
                          <p className="text-sm text-gray-200">{trade.exitReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Detailed Analysis */}
                    {trade.detailedAnalysis && (
                      <div className="border-t border-slate-600/30 pt-4">
                        <p className="text-xs font-semibold text-gray-300 mb-2 uppercase">Detailní analýza</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{trade.detailedAnalysis}</p>
                      </div>
                    )}

                    {/* Behavior Flags */}
                    <div className="border-t border-slate-600/30 pt-4">
                      <p className="text-sm font-semibold text-emerald-300 mb-3">Chování & Disciplína</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${trade.followedPlan ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                          <div className="w-3 h-3 rounded-full" style={{ background: trade.followedPlan ? "currentColor" : "currentColor" }} />
                          {trade.followedPlan ? "✓ Plán dodržen" : "✗ Porušen plán"}
                        </div>
                        <div className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${trade.exitedEarly ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                          <div className="w-3 h-3 rounded-full" style={{ background: trade.exitedEarly ? "currentColor" : "currentColor" }} />
                          {trade.exitedEarly ? "⚠ Časný exit" : "✓ Plánovaný exit"}
                        </div>
                        <div className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${trade.missedDueToHesitation ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                          <div className="w-3 h-3 rounded-full" style={{ background: trade.missedDueToHesitation ? "currentColor" : "currentColor" }} />
                          {trade.missedDueToHesitation ? "⚠ Váhání" : "✓ Bez váhání"}
                        </div>
                        <div className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${trade.revengeTrade ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                          <div className="w-3 h-3 rounded-full" style={{ background: trade.revengeTrade ? "currentColor" : "currentColor" }} />
                          {trade.revengeTrade ? "✗ Revenge trade" : "✓ Bez revenže"}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(trade.behaviorDescription || trade.tags.length > 0 || trade.notes) && (
                      <div className="border-t border-slate-600/30 pt-4 space-y-3">
                        {trade.behaviorDescription && (
                          <div>
                            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">Popis chování</p>
                            <p className="text-sm text-gray-200">{trade.behaviorDescription}</p>
                          </div>
                        )}
                        {Array.isArray(trade.tags) && trade.tags.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-300 mb-2 uppercase">Tagy</p>
                            <div className="flex flex-wrap gap-2">
                              {trade.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {trade.notes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">Poznámky</p>
                            <p className="text-sm text-gray-200">{trade.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="border-t border-slate-600/30 pt-4 flex gap-2">
                      <Button
                        onClick={() => {
                          const updatedTrades = trades.filter((t) => t.id !== trade.id)
                          setTrades(updatedTrades)
                          deleteTrade(trade.id)
                          toast({
                            title: "Obchod smazán",
                            description: `${trade.direction} ${trade.pair} byl odstraněn`,
                          })
                        }}
                        variant="destructive"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Smazat obchod
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
