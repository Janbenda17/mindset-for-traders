"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useRouter } from "next/navigation" // Changed from useRouterNav to useRouter
import { useDailyStage } from "@/contexts/daily-stage-context" // Správný import pro completeStage
import { useData } from "@/contexts/data-context" // Import addTrade from data context
import { useAuth } from "@/contexts/auth-context" // Import useAuth hook
import { TrendingUp, DollarSign, BarChart3, Brain } from "lucide-react"
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

export function RecordTrades() {
  const { toast } = useToast()
  const router = useRouter() // Changed from useRouterNav to useRouter
  const { completeStage } = useDailyStage() // Použít hook pro získání completeStage funkce
  const { addTrade, deleteTrade } = useData() // Import addTrade from data context
  const { user } = useAuth() // Use the useAuth hook to get user information
  const [isLoading, setIsLoading] = useState(false)
  const [todayPlan, setTodayPlan] = useState<TradingPlanData | null>(null)
  const [morningCheck, setMorningCheck] = useState<MorningCheckData | null>(null)

  const [trades, setTrades] = useState<Trade[]>([])
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

    // Vytvoření Date objektů pro přesný výpočet
    const openDateTime = new Date(`${openDate}T${openTime}:00`)
    const closeDateTime = new Date(`${closeDate}T${closeTime}:00`)

    // Výpočet rozdílu v minutách
    const durationMinutes = Math.floor((closeDateTime.getTime() - openDateTime.getTime()) / (1000 * 60))

    // Scalp: 1-15 minut
    if (durationMinutes >= 1 && durationMinutes <= 15) return "Scalp"
    // Day Trade: 16 minut - 24 hodin (1440 minut)
    if (durationMinutes >= 16 && durationMinutes <= 1440) return "Day Trade"
    // Swing: 25+ hodin (1500+ minut)
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

  // useEffect pro P&L výpočet odstraněn

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
  }, [user?.id]) // Dependency array includes user?.id to re-run when user changes

  const handleAddTrade = () => {
    if (!currentTrade.pair || !currentTrade.pips || !currentTrade.openTime || !currentTrade.closeTime) {
      toast({
        title: "Chybí data",
        description: "Vyplň pair, pips, čas otevření a zavření",
        variant: "destructive",
      })
      return
    }

    const tagsArray =
      typeof currentTrade.tags === "string"
        ? (currentTrade.tags as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : currentTrade.tags || []

    const newTrade: Trade = {
      id: Date.now().toString(),
      date: currentTrade.date as string,
      title: currentTrade.pair as string,
      pair: currentTrade.pair as string,
      direction: currentTrade.direction as "LONG" | "SHORT",
      openTime: currentTrade.openTime as string,
      closeTime: currentTrade.closeTime as string,
      session: currentTrade.session as string,
      tradeType: currentTrade.tradeType as string,
      pips: currentTrade.pips as number,
      positionSize: currentTrade.positionSize as number,
      pnl: currentTrade.pnl as number,
      confidenceBefore: currentTrade.confidenceBefore as number,
      stressLevel: currentTrade.stressLevel as number,
      mood: currentTrade.mood as number,
      emotionBefore: currentTrade.emotionBefore as string,
      emotionDuring: currentTrade.emotionDuring as string,
      emotionAfter: currentTrade.emotionAfter as string,
      entryReason: currentTrade.entryReason as string,
      exitReason: currentTrade.exitReason as string,
      detailedAnalysis: currentTrade.detailedAnalysis as string,
      followedPlan: currentTrade.followedPlan as boolean,
      exitedEarly: currentTrade.exitedEarly as boolean,
      missedDueToHesitation: currentTrade.missedDueToHesitation as boolean,
      revengeTrade: currentTrade.revengeTrade as boolean,
      behaviorDescription: currentTrade.behaviorDescription as string,
      tags: tagsArray,
      notes: currentTrade.notes as string,
      // Resetování datumů otevření a zavření pro nový trade
      openDate: currentTrade.openDate as string,
      closeDate: currentTrade.closeDate as string,
    }

    setTrades([...trades, newTrade])

    addTrade(newTrade)

    setCurrentTrade({
      date: format(new Date(), "yyyy-MM-dd"),
      title: "", // Reset title field if it were to be added back
      pair: currentTrade.pair,
      direction: "LONG",
      openTime: "",
      closeTime: "",
      session: "",
      tradeType: "",
      pips: 0,
      positionSize: 0.01,
      pnl: 0,
      confidenceBefore: morningCheck?.focus || 7,
      stressLevel: morningCheck?.stressLevel || 5,
      mood: morningCheck?.emotionalState || 7,
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
      // Resetování datumů otevření a zavření pro nový trade
      openDate: format(new Date(), "yyyy-MM-dd"),
      closeDate: format(new Date(), "yyyy-MM-dd"),
    })

    toast({
      title: "✅ Trade Přidán!",
      description: `${newTrade.direction} ${newTrade.pair} - ${newTrade.pnl >= 0 ? "+" : ""}$${newTrade.pnl}`,
    })

    const tradeEntry = {
      ...newTrade,
      type: "trade",
      content: newTrade.detailedAnalysis || "",
      tags: newTrade.tags,
      mood: newTrade.mood,
      profitLoss: newTrade.pnl,
      confidenceLevel: newTrade.confidenceBefore,
    }
    completeStage("record-trades")
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleAddTrade()
  }

  const todayPnL = trades.reduce((sum, t) => sum + t.pnl, 0)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 p-6 border border-blue-500/30">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm">
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Zaznamenat obchod</h2>
            <p className="text-gray-300 text-sm">Zaznamenejte svůj trading a analyzujte svůj výkon</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-600 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Dnešní přehled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Celkem obchodů</p>
              <p className="text-2xl font-bold text-white">{trades.length}</p>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-white">
                {trades.length > 0 ? Math.round((trades.filter((t) => t.pnl > 0).length / trades.length) * 100) : 0}%
              </p>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">P&L</p>
              <p className={cn("text-2xl font-bold", todayPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Trade Info Section */}
        <Card className="bg-slate-800/90 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Základní informace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Performance */}
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

        {/* Psychology Section */}
        <Card className="bg-slate-800/90 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Psychologická analýza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Reasons */}
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

            {/* Behavior Checkboxes */}
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

            {/* Behavior Description */}
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

            {/* Tags & Notes */}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
        >
          {isLoading ? "Ukládám..." : "Uložit obchod"}
        </Button>
      </form>

      {/* Today's Trades List */}
      {trades.length > 0 && (
        <Card className="bg-slate-800/90 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Dnešní obchody ({trades.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.map((trade) => (
              <div key={trade.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-semibold">
                      {trade.direction} {trade.pair}
                    </p>
                    <p className="text-sm text-gray-400">
                      {trade.openTime} - {trade.closeTime} • {trade.session}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">{trade.pips} pips</p>
                  </div>
                </div>
                {trade.detailedAnalysis && <p className="text-sm text-gray-300 mt-2">{trade.detailedAnalysis}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
