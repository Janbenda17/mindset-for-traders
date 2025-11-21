"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { saveJournalEntry } from "@/utils/storage-utils"
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Target, BookOpen, XCircle, Brain, Heart, Lock, AlertCircle, Clock, Zap, TrendingUpIcon, Check } from 'lucide-react'
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import { useDailyStage } from "@/contexts/daily-stage-context" // Správný import pro completeStage

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
  const router = useRouter()
  const { completeStage } = useDailyStage() // Použít hook pro získání completeStage funkce
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

    const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
    const plan = plans.find((p: TradingPlanData) => p.date === today)
    setTodayPlan(plan)

    const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
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

    const allTrades = JSON.parse(localStorage.getItem("trade-records") || "[]")
    const todayTrades = allTrades.filter((t: Trade) => t.date === today)
    setTrades(todayTrades)
  }, [])

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
      // Přidání datumů otevření a zavření
      openDate: currentTrade.openDate as string,
      closeDate: currentTrade.closeDate as string,
    }

    setTrades([...trades, newTrade])

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
      description: `${newTrade.direction} ${newTrade.pair} - ${newTrade.pnl >= 0 ? "+" : ""}$${newTrade.pnl} (${newTrade.pips >= 0 ? "+" : ""}${newTrade.pips} pips)`,
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
    saveJournalEntry(tradeEntry)

    const allTrades = JSON.parse(localStorage.getItem("trade-records") || "[]")
    localStorage.setItem("trade-records", JSON.stringify([...allTrades, newTrade]))
  }

  const handleRemoveTrade = (id: string) => {
    setTrades(trades.filter((t) => t.id !== id))
    toast({
      title: "🗑️ Trade Odstraněn",
      description: "Trade byl úspěšně smazán",
    })

    const { deleteJournalEntry } = require("@/utils/storage-utils")
    deleteJournalEntry(id)

    const allTrades = JSON.parse(localStorage.getItem("trade-records") || "[]")
    const filteredTrades = allTrades.filter((t: Trade) => t.id !== id)
    localStorage.setItem("trade-records", JSON.stringify(filteredTrades))
  }

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  const winningTrades = trades.filter((t) => t.pnl > 0).length
  const losingTrades = trades.filter((t) => t.pnl < 0).length
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0

  return (
    <div className="min-h-screen pb-12 md:px-8 px-3 md:pt-0 pt-3">
      <div className="mb-6 md:mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl md:p-8 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="md:h-12 md:w-12 h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <DollarSign className="md:h-6 md:w-6 h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="md:text-5xl text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Přidat Trade
                </h1>
                <p className="text-muted-foreground md:block hidden">Zaznamenej své obchody 💼</p>
              </div>
            </div>
            <Badge className="text-sm md:text-base px-4 md:px-6 py-1 md:py-2 rounded-full bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {trades.length} trades
            </Badge>
          </div>
        </div>
      </div>

      {!morningCheck && (
        <Alert className="mb-4 md:mb-8 border-orange-500/30 bg-orange-500/10 hidden md:block">
          <AlertCircle className="h-5 w-5 text-orange-400" />
          <AlertTitle className="text-orange-400 font-bold">⚠️ Morning Check Není Dokončen</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Některé emoční metriky nebudou automaticky vyplněny. Doporučujeme nejdřív dokončit Morning Check.
          </AlertDescription>
        </Alert>
      )}

      {todayPlan && (
        <Alert className="mb-4 md:mb-8 border-blue-500/30 bg-blue-500/10 hidden md:block">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <AlertTitle className="text-blue-400 font-bold">📋 Tvůj Dnešní Plán</AlertTitle>
          <AlertDescription className="text-muted-foreground space-y-2 mt-2">
            <div>
              <strong>Setupy:</strong> {todayPlan.setups}
            </div>
            <div>
              <strong>Páry:</strong> {todayPlan.pairs}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {trades.length > 0 && (
        <div className="grid md:grid-cols-4 grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className={`border-2 ${totalPnL >= 0 ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
            <CardContent className="md:pt-6 pt-4 md:p-6 p-3">
              <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">P&L</div>
              <div className={`md:text-3xl text-xl font-black ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="md:pt-6 pt-4 md:p-6 p-3">
              <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Win Rate</div>
              <div className="md:text-3xl text-xl font-black text-blue-400">{winRate.toFixed(0)}%</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/30 bg-emerald-500/10">
            <CardContent className="md:pt-6 pt-4 md:p-6 p-3">
              <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Wins</div>
              <div className="md:text-3xl text-xl font-black text-emerald-400">{winningTrades}</div>
            </CardContent>
          </Card>

          <Card className="border-rose-500/30 bg-rose-500/10">
            <CardContent className="md:pt-6 pt-4 md:p-6 p-3">
              <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Losses</div>
              <div className="md:text-3xl text-xl font-black text-rose-400">{losingTrades}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 md:mb-8 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        <CardHeader className="relative md:p-6 p-4">
          <CardTitle className="flex items-center gap-3 text-emerald-400 md:text-2xl text-xl">
            <div className="md:h-10 md:w-10 h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Plus className="md:h-6 md:w-6 h-5 w-5 text-white" />
            </div>
            Nový Trade
          </CardTitle>
          <CardDescription className="md:text-base text-sm md:block hidden">
            Detailní záznam obchodu včetně časování, emocí a chování
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 md:space-y-8 relative md:p-6 p-4">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-emerald-500/20">
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Target className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">Základní Info</h3>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="pair" className="text-white text-sm font-medium">
                  Měnový pár *
                </Label>
                <Input
                  id="pair"
                  value={currentTrade.pair}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, pair: e.target.value.toUpperCase() })}
                  placeholder="EUR/USD"
                  className="bg-slate-900/50 border-emerald-500/30 text-white md:h-12 h-14 text-base font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction" className="text-white text-sm font-medium">
                  Směr *
                </Label>
                <Select
                  value={currentTrade.direction}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, direction: v as "LONG" | "SHORT" })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-emerald-500/30 text-white md:h-12 h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LONG">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="font-bold">LONG</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SHORT">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <span className="font-bold">SHORT</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:block hidden">
                <Label htmlFor="openDate" className="text-white text-sm font-medium">
                  Datum otevření
                </Label>
                <Input
                  id="openDate"
                  type="date"
                  value={currentTrade.openDate}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, openDate: e.target.value })}
                  className="bg-slate-900/50 border-emerald-500/30 text-white h-12"
                />
              </div>

              <div className="space-y-2 md:block hidden">
                <Label htmlFor="closeDate" className="text-white text-sm font-medium">
                  Datum uzavření
                </Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={currentTrade.closeDate}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, closeDate: e.target.value })}
                  className="bg-slate-900/50 border-emerald-500/30 text-white h-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">Čas</h3>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="openTime" className="text-white text-sm font-medium">
                  Čas otevření *
                </Label>
                <Input
                  id="openTime"
                  type="time"
                  value={currentTrade.openTime}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, openTime: e.target.value })}
                  className="bg-slate-900/50 border-cyan-500/30 text-white md:h-12 h-14 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeTime" className="text-white text-sm font-medium">
                  Čas zavření *
                </Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={currentTrade.closeTime}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, closeTime: e.target.value })}
                  className="bg-slate-900/50 border-cyan-500/30 text-white md:h-12 h-14 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-yellow-500/20">
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <TrendingUpIcon className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">Výsledek</h3>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="pips" className="text-white text-sm font-medium">
                  Pips *
                </Label>
                <Input
                  id="pips"
                  type="number"
                  step="0.1"
                  value={currentTrade.pips}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, pips: Number.parseFloat(e.target.value) })}
                  placeholder="+25.5"
                  className="bg-slate-900/50 border-yellow-500/30 text-white md:h-14 h-16 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pnl" className="text-white text-sm font-medium">
                  P&L (USD) *
                </Label>
                <Input
                  id="pnl"
                  type="number"
                  step="0.01"
                  value={currentTrade.pnl}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, pnl: Number.parseFloat(e.target.value) })}
                  placeholder="+250.00"
                  className={`md:h-14 h-16 text-lg font-bold ${
                    (currentTrade.pnl || 0) >= 0
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/20">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Časování Obchodu</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="openDate" className="text-white text-sm font-medium">
                    Datum otevření
                  </Label>
                  <Input
                    id="openDate"
                    type="date"
                    value={currentTrade.openDate}
                    onChange={(e) => setCurrentTrade({ ...currentTrade, openDate: e.target.value })}
                    className="bg-slate-900/50 border-emerald-500/30 text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closeDate" className="text-white text-sm font-medium">
                    Datum uzavření
                  </Label>
                  <Input
                    id="closeDate"
                    type="date"
                    value={currentTrade.closeDate}
                    onChange={(e) => setCurrentTrade({ ...currentTrade, closeDate: e.target.value })}
                    className="bg-slate-900/50 border-emerald-500/30 text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openTime" className="text-white text-sm font-medium">
                    Čas otevření * (24H formát)
                  </Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={currentTrade.openTime}
                    onChange={(e) => setCurrentTrade({ ...currentTrade, openTime: e.target.value })}
                    className="bg-slate-900/50 border-cyan-500/30 text-white h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closeTime" className="text-white text-sm font-medium">
                    Čas zavření * (24H formát)
                  </Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={currentTrade.closeTime}
                    onChange={(e) => setCurrentTrade({ ...currentTrade, closeTime: e.target.value })}
                    className="bg-slate-900/50 border-cyan-500/30 text-white h-12 text-base"
                  />
                </div>
              </div>

              {currentTrade.session && currentTrade.tradeType && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Session</div>
                      <Badge className="mt-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-sm">
                        {currentTrade.session}
                      </Badge>
                    </div>
                    <div className="h-8 w-px bg-cyan-500/30" />
                    <div>
                      <div className="text-xs text-muted-foreground">Typ obchodu</div>
                      <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm">
                        {currentTrade.tradeType}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-yellow-500/20">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <TrendingUpIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Výsledek Obchodu</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="positionSize" className="text-white text-sm font-medium">
                    Velikost pozice (loty)
                  </Label>
                  <Input
                    id="positionSize"
                    type="number"
                    step="0.01"
                    value={currentTrade.positionSize}
                    onChange={(e) =>
                      setCurrentTrade({ ...currentTrade, positionSize: Number.parseFloat(e.target.value) })
                    }
                    className="bg-slate-900/50 border-emerald-500/30 text-white h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              Emoční Metriky
            </h3>

            <TooltipProvider>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-white text-sm">Sebejistota před obchodem</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-24 rounded-xl flex items-center justify-center border-2 transition-all ${
                          morningCheck
                            ? "bg-blue-500/10 border-blue-500/30 cursor-help"
                            : "bg-slate-900/50 border-pink-500/30"
                        }`}
                      >
                        {morningCheck && <Lock className="h-4 w-4 text-blue-400 mr-2" />}
                        <div className="text-4xl font-black text-white">{currentTrade.confidenceBefore}</div>
                        <div className="text-xl text-muted-foreground ml-1">/10</div>
                      </div>
                    </TooltipTrigger>
                    {morningCheck && (
                      <TooltipContent side="top" className="bg-blue-500 text-white border-blue-600">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Automaticky z Morning Check</span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Úroveň stresu</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-24 rounded-xl flex items-center justify-center border-2 transition-all ${
                          morningCheck
                            ? "bg-blue-500/10 border-blue-500/30 cursor-help"
                            : "bg-slate-900/50 border-pink-500/30"
                        }`}
                      >
                        {morningCheck && <Lock className="h-4 w-4 text-blue-400 mr-2" />}
                        <div className="text-4xl font-black text-white">{currentTrade.stressLevel}</div>
                        <div className="text-xl text-muted-foreground ml-1">/10</div>
                      </div>
                    </TooltipTrigger>
                    {morningCheck && (
                      <TooltipContent side="top" className="bg-blue-500 text-white border-blue-600">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Automaticky z Morning Check</span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm">Nálada</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-24 rounded-xl flex items-center justify-center border-2 transition-all ${
                          morningCheck
                            ? "bg-blue-500/10 border-blue-500/30 cursor-help"
                            : "bg-slate-900/50 border-pink-500/30"
                        }`}
                      >
                        {morningCheck && <Lock className="h-4 w-4 text-blue-400 mr-2" />}
                        <div className="text-4xl font-black text-white">{currentTrade.mood}</div>
                        <div className="text-xl text-muted-foreground ml-1">/10</div>
                      </div>
                    </TooltipTrigger>
                    {morningCheck && (
                      <TooltipContent side="top" className="bg-blue-500 text-white border-blue-600">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Automaticky z Morning Check</span>
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emotionBefore" className="text-white">
                  Emoce před obchodem
                </Label>
                <Select
                  value={currentTrade.emotionBefore}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, emotionBefore: v })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-pink-500/30 text-white h-12">
                    <SelectValue placeholder="Vyber emoce..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS_BEFORE.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emotionDuring" className="text-white">
                  Emoce během obchodu
                </Label>
                <Select
                  value={currentTrade.emotionDuring}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, emotionDuring: v })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-pink-500/30 text-white h-12">
                    <SelectValue placeholder="Vyber emoce..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS_DURING.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emotionAfter" className="text-white">
                  Emoce po obchodu
                </Label>
                <Select
                  value={currentTrade.emotionAfter}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, emotionAfter: v })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-pink-500/30 text-white h-12">
                    <SelectValue placeholder="Vyber emoce..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONS_AFTER.map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Analýza Obchodu
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="entryReason" className="text-white">
                  Důvod vstupu
                </Label>
                <Textarea
                  id="entryReason"
                  value={currentTrade.entryReason}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, entryReason: e.target.value })}
                  placeholder="Breakout, support/resistance..."
                  className="min-h-24 bg-slate-900/50 border-blue-500/30 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitReason" className="text-white">
                  Důvod výstupu
                </Label>
                <Textarea
                  id="exitReason"
                  value={currentTrade.exitReason}
                  onChange={(e) => setCurrentTrade({ ...currentTrade, exitReason: e.target.value })}
                  placeholder="Target profit, stop loss..."
                  className="min-h-24 bg-slate-900/50 border-blue-500/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailedAnalysis" className="text-white">
                Detailní analýza
              </Label>
              <Textarea
                id="detailedAnalysis"
                value={currentTrade.detailedAnalysis}
                onChange={(e) => setCurrentTrade({ ...currentTrade, detailedAnalysis: e.target.value })}
                placeholder="Detailní popis obchodu, analýza, pozorování..."
                className="min-h-32 bg-slate-900/50 border-blue-500/30 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Behaviorální Analýza
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                <Label htmlFor="followedPlan" className="text-white cursor-pointer">
                  Dodržel jsem plán?
                </Label>
                <Select
                  value={currentTrade.followedPlan ? "yes" : "no"}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, followedPlan: v === "yes" })}
                >
                  <SelectTrigger className="w-32 bg-slate-800/50 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ano</SelectItem>
                    <SelectItem value="no">Ne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                <Label htmlFor="exitedEarly" className="text-white cursor-pointer">
                  Vystoupil jsem předčasně?
                </Label>
                <Select
                  value={currentTrade.exitedEarly ? "yes" : "no"}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, exitedEarly: v === "yes" })}
                >
                  <SelectTrigger className="w-32 bg-slate-800/50 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ano</SelectItem>
                    <SelectItem value="no">Ne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                <Label htmlFor="missedDueToHesitation" className="text-white cursor-pointer">
                  Zmeškal jsem příležitost kvůli váhání?
                </Label>
                <Select
                  value={currentTrade.missedDueToHesitation ? "yes" : "no"}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, missedDueToHesitation: v === "yes" })}
                >
                  <SelectTrigger className="w-32 bg-slate-800/50 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ano</SelectItem>
                    <SelectItem value="no">Ne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-purple-500/30">
                <Label htmlFor="revengeTrade" className="text-white cursor-pointer">
                  Byl to revenge trade?
                </Label>
                <Select
                  value={currentTrade.revengeTrade ? "yes" : "no"}
                  onValueChange={(v) => setCurrentTrade({ ...currentTrade, revengeTrade: v === "yes" })}
                >
                  <SelectTrigger className="w-32 bg-slate-800/50 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ano</SelectItem>
                    <SelectItem value="no">Ne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="behaviorDescription" className="text-white">
                Popis chování
              </Label>
              <Textarea
                id="behaviorDescription"
                value={currentTrade.behaviorDescription}
                onChange={(e) => setCurrentTrade({ ...currentTrade, behaviorDescription: e.target.value })}
                placeholder="Popište své chování, emoce a rozhodování..."
                className="min-h-32 bg-slate-900/50 border-purple-500/30 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {trades.length > 0 && (
        <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Target className="h-6 w-6" />
              Dnešní Trady ({trades.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className={`p-4 rounded-xl border-2 ${
                    trade.pnl >= 0 ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          className={`${trade.direction === "LONG" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                        >
                          {trade.direction === "LONG" ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {trade.direction}
                        </Badge>
                        <span className="text-lg font-bold text-white">{trade.title || trade.pair}</span>
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">{trade.session}</Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">{trade.tradeType}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-muted-foreground">Pair</div>
                          <div className="text-white font-bold">{trade.pair}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Čas</div>
                          <div className="text-white font-bold">
                            {trade.openTime} → {trade.closeTime}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Pips</div>
                          <div className={`font-black ${trade.pips >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {trade.pips >= 0 ? "+" : ""}
                            {trade.pips.toFixed(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">P&L</div>
                          <div className={`font-black text-lg ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Mood</div>
                          <div className="text-white font-bold">{trade.mood}/10</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {trade.followedPlan ? (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Check className="h-3 w-3 mr-1" />
                            Plán
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            Mimo plán
                          </Badge>
                        )}
                        {trade.exitedEarly && (
                          <Badge className="bg-yellow-500/20 text-yellow-400">Předčasný exit</Badge>
                        )}
                        {trade.revengeTrade && <Badge className="bg-red-500/20 text-red-400">Revenge</Badge>}
                        {trade.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTrade(trade.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* // Přidat tlačítka "Uložit obchod" a "Dnes bez obchodu" na konec komponenty */}
      <div className="flex flex-col gap-4">
        <Button
          onClick={handleAddTrade}
          className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-2xl"
        >
          <Plus className="w-6 h-6 mr-2" />
          Uložit obchod
        </Button>
        
        <Button
          onClick={() => {
            completeStage(4)
            toast({
              title: "✅ Stage Complete!",
              description: "Dnes bez obchodu. Můžeš pokračovat na další stage.",
            })
            setTimeout(() => {
              router.push("/daily-tracker")
            }, 1000)
          }}
          variant="outline"
          className="w-full h-16 text-xl font-black rounded-2xl border-2 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          <XCircle className="w-6 h-6 mr-2" />
          Dnes bez obchodu
        </Button>
      </div>
    </div>
  )
}
