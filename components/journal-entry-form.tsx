"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { saveJournalEntry } from "@/utils/storage-utils"
import { toast } from "@/hooks/use-toast"

interface JournalEntryFormProps {
  onEntryAdded?: () => void
}

export function JournalEntryForm({ onEntryAdded }: JournalEntryFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState([7])
  const [entryType, setEntryType] = useState<"trade" | "journal" | "behavior">("journal")

  // Trade specific fields
  const [pair, setPair] = useState("")
  const [tradeType, setTradeType] = useState<"LONG" | "SHORT">("LONG")
  const [entryPrice, setEntryPrice] = useState("")
  const [exitPrice, setExitPrice] = useState("")
  const [positionSize, setPositionSize] = useState("")
  const [profitLoss, setProfitLoss] = useState("")
  const [pips, setPips] = useState("")
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

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTags("")
    setMood([7])
    setPair("")
    setTradeType("LONG")
    setEntryPrice("")
    setExitPrice("")
    setPositionSize("")
    setProfitLoss("")
    setPips("")
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
        entryPrice: entryPrice ? Number.parseFloat(entryPrice) : undefined,
        exitPrice: exitPrice ? Number.parseFloat(exitPrice) : undefined,
        positionSize: positionSize ? Number.parseFloat(positionSize) : undefined,
        profitLoss: profitLoss ? Number.parseFloat(profitLoss) : undefined,
        pips: pips ? Number.parseInt(pips) : undefined,
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nový záznam
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy") : <span>Vyberte datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Typ záznamu</Label>
              <Tabs value={entryType} onValueChange={(value) => setEntryType(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="journal">Deník</TabsTrigger>
                  <TabsTrigger value="trade">Obchod</TabsTrigger>
                  <TabsTrigger value="behavior">Chování</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Název</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Zadejte název záznamu..."
              required
            />
          </div>

          <Tabs value={entryType} className="w-full">
            <TabsContent value="journal" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Obsah</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Popište své myšlenky, pocity a pozorování..."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="trade" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pair">Měnový pár</Label>
                  <Input id="pair" value={pair} onChange={(e) => setPair(e.target.value)} placeholder="např. EUR/USD" />
                </div>
                <div className="space-y-2">
                  <Label>Typ obchodu</Label>
                  <RadioGroup value={tradeType} onValueChange={(value) => setTradeType(value as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LONG" id="long" />
                      <Label htmlFor="long">LONG</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SHORT" id="short" />
                      <Label htmlFor="short">SHORT</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryPrice">Vstupní cena</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.00001"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="1.0850"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitPrice">Výstupní cena</Label>
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.00001"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    placeholder="1.0890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positionSize">Velikost pozice</Label>
                  <Input
                    id="positionSize"
                    type="number"
                    step="0.01"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    placeholder="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profitLoss">P&L (USD)</Label>
                  <Input
                    id="profitLoss"
                    type="number"
                    step="0.01"
                    value={profitLoss}
                    onChange={(e) => setProfitLoss(e.target.value)}
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sebejistota před obchodem: {confidenceLevel[0]}/10</Label>
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
                  <Label>Úroveň stresu: {stressLevel[0]}/10</Label>
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
                  <Label htmlFor="emotionBefore">Emoce před</Label>
                  <Input
                    id="emotionBefore"
                    value={emotionBefore}
                    onChange={(e) => setEmotionBefore(e.target.value)}
                    placeholder="Klidný, sebejistý..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotionDuring">Emoce během</Label>
                  <Input
                    id="emotionDuring"
                    value={emotionDuring}
                    onChange={(e) => setEmotionDuring(e.target.value)}
                    placeholder="Kontrolovaný, nervózní..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emotionAfter">Emoce po</Label>
                  <Input
                    id="emotionAfter"
                    value={emotionAfter}
                    onChange={(e) => setEmotionAfter(e.target.value)}
                    placeholder="Spokojený, zklamaný..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryReason">Důvod vstupu</Label>
                  <Textarea
                    id="entryReason"
                    value={entryReason}
                    onChange={(e) => setEntryReason(e.target.value)}
                    placeholder="Breakout, support/resistance..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitReason">Důvod výstupu</Label>
                  <Textarea
                    id="exitReason"
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    placeholder="Target profit, stop loss..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Detailní analýza</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailní popis obchodu, analýza, pozorování..."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol/Pár</Label>
                <Input
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="EUR/USD, AAPL..."
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dodržel jsem plán?</Label>
                  <RadioGroup
                    value={matchedPlan === null ? "" : matchedPlan.toString()}
                    onValueChange={(value) => setMatchedPlan(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="plan-yes" />
                      <Label htmlFor="plan-yes">Ano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="plan-no" />
                      <Label htmlFor="plan-no">Ne</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Vystoupil jsem předčasně?</Label>
                  <RadioGroup
                    value={exitedEarly === null ? "" : exitedEarly.toString()}
                    onValueChange={(value) => setExitedEarly(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="exit-yes" />
                      <Label htmlFor="exit-yes">Ano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="exit-no" />
                      <Label htmlFor="exit-no">Ne</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Zmeškal jsem příležitost kvůli váhání?</Label>
                  <RadioGroup
                    value={missedDueToHesitation === null ? "" : missedDueToHesitation.toString()}
                    onValueChange={(value) => setMissedDueToHesitation(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="missed-yes" />
                      <Label htmlFor="missed-yes">Ano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="missed-no" />
                      <Label htmlFor="missed-no">Ne</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Byl to revenge trade?</Label>
                  <RadioGroup
                    value={revengeTrade === null ? "" : revengeTrade.toString()}
                    onValueChange={(value) => setRevengeTrade(value === "true")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="revenge-yes" />
                      <Label htmlFor="revenge-yes">Ano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="revenge-no" />
                      <Label htmlFor="revenge-no">Ne</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Popis chování</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Popište své chování, emoce a rozhodování..."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nálada: {mood[0]}/10</Label>
              <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tagy (oddělené čárkou)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="forex, strategie, emoce..."
              />
            </div>

            {entryType !== "journal" && (
              <div className="space-y-2">
                <Label htmlFor="notes">Dodatečné poznámky</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Další poznámky a pozorování..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Uložit záznam
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
