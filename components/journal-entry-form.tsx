"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus, Clock, TrendingUp, DollarSign, Brain, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { saveJournalEntry } from "@/utils/storage-utils"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JournalEntryFormProps {
  selectedDate?: Date
  onEntryAdded?: () => void
  onClose?: () => void
  compact?: boolean
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

export function JournalEntryForm({ selectedDate, onEntryAdded, onClose, compact = false }: JournalEntryFormProps) {
  const [date, setDate] = useState<Date>(selectedDate || new Date())
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState([7])
  const [entryType, setEntryType] = useState<"trade" | "behavior">("trade")

  // Trade specific fields
  const [pair, setPair] = useState("")
  const [tradeType, setTradeType] = useState<"LONG" | "SHORT">("LONG")
  const [openDate, setOpenDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [closeDate, setCloseDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [pips, setPips] = useState("")
  const [positionSize, setPositionSize] = useState("")
  const [profitLoss, setProfitLoss] = useState("")
  const [emotionBefore, setEmotionBefore] = useState("")
  const [emotionDuring, setEmotionDuring] = useState("")
  const [emotionAfter, setEmotionAfter] = useState("")
  const [confidenceLevel, setConfidenceLevel] = useState([7])
  const [stressLevel, setStressLevel] = useState([5])
  const [entryReason, setEntryReason] = useState("")
  const [exitReason, setExitReason] = useState("")
  const [whatWorked, setWhatWorked] = useState("")
  const [whatDidntWork, setWhatDidntWork] = useState("")
  const [lessons, setLessons] = useState("")
  const [marketConditions, setMarketConditions] = useState("")
  const [notes, setNotes] = useState("")

  // Behavior specific fields
  const [symbol, setSymbol] = useState("")
  const [matchedPlan, setMatchedPlan] = useState<boolean | null>(null)
  const [exitedEarly, setExitedEarly] = useState<boolean | null>(null)
  const [missedDueToHesitation, setMissedDueToHesitation] = useState<boolean | null>(null)
  const [revengeTrade, setRevengeTrade] = useState<boolean | null>(null)

  const [tradingSession, setTradingSession] = useState("")
  const [tradeTypeAuto, setTradeTypeAuto] = useState("")

  // Calculate trading session based on time
  useEffect(() => {
    if (openTime) {
      const hour = Number.parseInt(openTime.split(":")[0])
      if (hour >= 0 && hour < 8) {
        setTradingSession("Asian")
      } else if (hour >= 8 && hour < 13) {
        setTradingSession("London")
      } else if (hour >= 13 && hour < 17) {
        setTradingSession("Overlap")
      } else {
        setTradingSession("New York")
      }
    }
  }, [openTime])

  // Calculate trade type based on duration
  useEffect(() => {
    if (openDate && openTime && closeDate && closeTime) {
      const openDateTime = new Date(`${openDate}T${openTime}:00`)
      const closeDateTime = new Date(`${closeDate}T${closeTime}:00`)
      const durationMinutes = Math.floor((closeDateTime.getTime() - openDateTime.getTime()) / (1000 * 60))

      // Scalp: 1-15 minut
      if (durationMinutes >= 1 && durationMinutes <= 15) {
        setTradeTypeAuto("Scalp")
      }
      // Day Trade: 16 minut - 24 hodin (1440 minut)
      else if (durationMinutes >= 16 && durationMinutes <= 1440) {
        setTradeTypeAuto("Day Trade")
      }
      // Swing: 25+ hodin (1500+ minut)
      else if (durationMinutes >= 1500) {
        setTradeTypeAuto("Swing")
      } else {
        setTradeTypeAuto("")
      }
    }
  }, [openDate, openTime, closeDate, closeTime])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTags("")
    setMood([7])
    setPair("")
    setTradeType("LONG")
    setOpenDate(format(new Date(), "yyyy-MM-dd"))
    setCloseDate(format(new Date(), "yyyy-MM-dd"))
    setOpenTime("")
    setCloseTime("")
    setPips("")
    setPositionSize("")
    setProfitLoss("")
    setEmotionBefore("")
    setEmotionDuring("")
    setEmotionAfter("")
    setConfidenceLevel([7])
    setStressLevel([5])
    setEntryReason("")
    setExitReason("")
    setWhatWorked("")
    setWhatDidntWork("")
    setLessons("")
    setMarketConditions("")
    setNotes("")
    setSymbol("")
    setMatchedPlan(null)
    setExitedEarly(null)
    setMissedDueToHesitation(null)
    setRevengeTrade(null)
    setTradingSession("")
    setTradeTypeAuto("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Chyba",
        description: "Název a obsah jsou povinné.",
        variant: "destructive",
      })
      return
    }

    const baseEntry = {
      date: date.toISOString().split("T")[0],
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      mood: mood[0],
      type: entryType,
    }

    let entry: any = { ...baseEntry }

    if (entryType === "trade") {
      entry = {
        ...entry,
        pair,
        tradeType,
        openDate,
        closeDate,
        openTime,
        closeTime,
        tradingSession,
        tradeTypeAuto,
        pips: pips ? Number.parseInt(pips) : undefined,
        positionSize: positionSize ? Number.parseFloat(positionSize) : undefined,
        profitLoss: profitLoss ? Number.parseFloat(profitLoss) : undefined,
        emotionBefore,
        emotionDuring,
        emotionAfter,
        confidenceLevel: confidenceLevel[0],
        stressLevel: stressLevel[0],
        entryReason,
        exitReason,
        whatWorked,
        whatDidntWork,
        lessons,
        marketConditions,
        notes,
      }
    } else if (entryType === "behavior") {
      entry = {
        ...entry,
        symbol,
        matchedPlan,
        exitedEarly,
        missedDueToHesitation,
        revengeTrade,
        notes,
      }
    }

    saveJournalEntry(entry)
    resetForm()
    onEntryAdded?.()

    toast({
      title: "Záznam uložen",
      description: "Váš záznam byl úspěšně přidán do deníku.",
    })

    if (onClose) {
      onClose()
    }
  }

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Plus className="h-5 w-5 text-purple-400" />
          Nový záznam
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                Datum
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy") : <span>Vyberte datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Typ záznamu</Label>
              <Tabs value={entryType} onValueChange={(value) => setEntryType(value as any)}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                  <TabsTrigger value="trade" className="data-[state=active]:bg-purple-600">
                    Obchod
                  </TabsTrigger>
                  <TabsTrigger value="behavior" className="data-[state=active]:bg-purple-600">
                    Chování
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Název
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Zadejte název záznamu..."
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
            />
          </div>

          <Tabs value={entryType} className="w-full">
            <TabsContent value="trade" className="space-y-6">
              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Základní Info</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pair" className="text-white">
                      Měnový pár *
                    </Label>
                    <Input
                      id="pair"
                      value={pair}
                      onChange={(e) => setPair(e.target.value.toUpperCase())}
                      placeholder="např. EUR/USD"
                      className="bg-slate-700/50 border-slate-600 text-white h-12 font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Směr obchodu *</Label>
                    <RadioGroup
                      value={tradeType}
                      onValueChange={(value) => setTradeType(value as any)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="LONG" id="long" />
                        <Label htmlFor="long" className="text-white cursor-pointer">
                          🟢 LONG
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SHORT" id="short" />
                        <Label htmlFor="short" className="text-white cursor-pointer">
                          🔴 SHORT
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Časování</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openDate" className="text-white">
                      Datum otevření
                    </Label>
                    <Input
                      id="openDate"
                      type="date"
                      value={openDate}
                      onChange={(e) => setOpenDate(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeDate" className="text-white">
                      Datum uzavření
                    </Label>
                    <Input
                      id="closeDate"
                      type="date"
                      value={closeDate}
                      onChange={(e) => setCloseDate(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime" className="text-white">
                      Čas otevření * (24H formát)
                    </Label>
                    <Input
                      id="openTime"
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white h-12"
                      required
                    />
                    {tradingSession && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        Session: {tradingSession}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime" className="text-white">
                      Čas zavření * (24H formát)
                    </Label>
                    <Input
                      id="closeTime"
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white h-12"
                      required
                    />
                    {tradeTypeAuto && (
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">Typ: {tradeTypeAuto}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Výsledek</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pips" className="text-white">
                      Pips *
                    </Label>
                    <Input
                      id="pips"
                      type="number"
                      step="0.1"
                      value={pips}
                      onChange={(e) => setPips(e.target.value)}
                      placeholder="+40 nebo -20"
                      className="bg-slate-700/50 border-slate-600 text-white h-12 font-bold"
                      required
                    />
                    <p className="text-xs text-gray-400">Kladné = zisk, záporné = ztráta</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="positionSize" className="text-white">
                      Velikost pozice (loty)
                    </Label>
                    <Input
                      id="positionSize"
                      type="number"
                      step="0.01"
                      value={positionSize}
                      onChange={(e) => setPositionSize(e.target.value)}
                      placeholder="0.1"
                      className="bg-slate-700/50 border-slate-600 text-white h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profitLoss" className="text-white">
                      P&L (USD) *
                    </Label>
                    <Input
                      id="profitLoss"
                      type="number"
                      step="0.01"
                      value={profitLoss}
                      onChange={(e) => setProfitLoss(e.target.value)}
                      placeholder="např. +250.00"
                      className={cn(
                        "h-12 font-bold",
                        profitLoss && Number.parseFloat(profitLoss) >= 0
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400",
                      )}
                      required
                    />
                    {profitLoss && (
                      <Badge
                        className={cn(
                          "text-xs",
                          Number.parseFloat(profitLoss) >= 0
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30",
                        )}
                      >
                        {Number.parseFloat(profitLoss) >= 0 ? "✅ Zisk" : "❌ Ztráta"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-2 border-orange-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Psychologie & Emoce</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Sebejistota před obchodem: {confidenceLevel[0]}/10</Label>
                    <Slider
                      value={confidenceLevel}
                      onValueChange={setConfidenceLevel}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Úroveň stresu: {stressLevel[0]}/10</Label>
                    <Slider
                      value={stressLevel}
                      onValueChange={setStressLevel}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emotionBefore" className="text-white">
                      Emoce před
                    </Label>
                    <Select value={emotionBefore} onValueChange={setEmotionBefore}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                        <SelectValue placeholder="Vyber..." />
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
                      Emoce během
                    </Label>
                    <Select value={emotionDuring} onValueChange={setEmotionDuring}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                        <SelectValue placeholder="Vyber..." />
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
                      Emoce po
                    </Label>
                    <Select value={emotionAfter} onValueChange={setEmotionAfter}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white h-12">
                        <SelectValue placeholder="Vyber..." />
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

              <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Analýza & Důvody</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryReason" className="text-white">
                      Důvod vstupu
                    </Label>
                    <Textarea
                      id="entryReason"
                      value={entryReason}
                      onChange={(e) => setEntryReason(e.target.value)}
                      placeholder="Breakout, support/resistance..."
                      className="min-h-[80px] bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exitReason" className="text-white">
                      Důvod výstupu
                    </Label>
                    <Textarea
                      id="exitReason"
                      value={exitReason}
                      onChange={(e) => setExitReason(e.target.value)}
                      placeholder="Target profit, stop loss..."
                      className="min-h-[80px] bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-white">
                    Detailní analýza
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Detailní popis obchodu, analýza, pozorování..."
                    className="min-h-[120px] bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol" className="text-white">
                  Symbol/Pár
                </Label>
                <Input
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="EUR/USD, AAPL..."
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Dodržel jsem plán?</Label>
                  <RadioGroup
                    value={matchedPlan === null ? "" : matchedPlan.toString()}
                    onValueChange={(value) => setMatchedPlan(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="plan-yes" />
                      <Label htmlFor="plan-yes" className="text-white">
                        Ano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="plan-no" />
                      <Label htmlFor="plan-no" className="text-white">
                        Ne
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Vystoupil jsem předčasně?</Label>
                  <RadioGroup
                    value={exitedEarly === null ? "" : exitedEarly.toString()}
                    onValueChange={(value) => setExitedEarly(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="exit-yes" />
                      <Label htmlFor="exit-yes" className="text-white">
                        Ano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="exit-no" />
                      <Label htmlFor="exit-no" className="text-white">
                        Ne
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Zmeškal jsem příležitost kvůli váhání?</Label>
                  <RadioGroup
                    value={missedDueToHesitation === null ? "" : missedDueToHesitation.toString()}
                    onValueChange={(value) => setMissedDueToHesitation(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="missed-yes" />
                      <Label htmlFor="missed-yes" className="text-white">
                        Ano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="missed-no" />
                      <Label htmlFor="missed-no" className="text-white">
                        Ne
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Byl to revenge trade?</Label>
                  <RadioGroup
                    value={revengeTrade === null ? "" : revengeTrade.toString()}
                    onValueChange={(value) => setRevengeTrade(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="revenge-yes" />
                      <Label htmlFor="revenge-yes" className="text-white">
                        Ano
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="revenge-no" />
                      <Label htmlFor="revenge-no" className="text-white">
                        Ne
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">
                  Popis chování
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Popište své chování, emoce a rozhodování..."
                  className="min-h-[120px] bg-slate-700/50 border-slate-600 text-white"
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Nálada: {mood[0]}/10</Label>
              <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-white">
                Tagy (oddělené čárkou)
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="forex, strategie, emoce..."
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">
                Dodatečné poznámky
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Další poznámky a pozorování..."
                className="min-h-[80px] bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Uložit záznam
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
