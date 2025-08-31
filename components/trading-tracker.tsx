"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { saveTradingData } from "@/utils/storage-utils"
import { useToast } from "@/components/ui/use-toast"
import { getTodayDateString } from "@/utils/date-utils"

export function TradingTracker() {
  const [tradeDate, setTradeDate] = useState(getTodayDateString())
  const [tradeSymbol, setTradeSymbol] = useState("")
  const [tradeType, setTradeType] = useState<"long" | "short">("long")
  const [entryPrice, setEntryPrice] = useState<number | string>("")
  const [exitPrice, setExitPrice] = useState<number | string>("")
  const [profitLoss, setProfitLoss] = useState<number | string>("")
  const [tradeOutcome, setTradeOutcome] = useState<"profit" | "loss" | "breakeven">("profit")
  const [tradeNotes, setTradeNotes] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newEntry = {
      date: tradeDate,
      symbol: tradeSymbol,
      type: tradeType,
      entryPrice: Number(entryPrice),
      exitPrice: Number(exitPrice),
      profitLoss: Number(profitLoss),
      outcome: tradeOutcome,
      notes: tradeNotes,
    }

    saveTradingData(newEntry)
    toast({
      title: "Obchod uložen",
      description: "Váš obchodní záznam byl úspěšně uložen.",
    })

    // Reset form
    setTradeDate(getTodayDateString())
    setTradeSymbol("")
    setTradeType("long")
    setEntryPrice("")
    setExitPrice("")
    setProfitLoss("")
    setTradeOutcome("profit")
    setTradeNotes("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sledování obchodů</CardTitle>
        <CardDescription>Zaznamenejte své obchody a sledujte svůj výkon.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tradeDate">Datum obchodu</Label>
              <Input
                id="tradeDate"
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeSymbol">Symbol</Label>
              <Input
                id="tradeSymbol"
                placeholder="Např. EUR/USD, BTC/USD"
                value={tradeSymbol}
                onChange={(e) => setTradeSymbol(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tradeType">Typ obchodu</Label>
              <Select value={tradeType} onValueChange={(value: "long" | "short") => setTradeType(value)} required>
                <SelectTrigger id="tradeType">
                  <SelectValue placeholder="Vyberte typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeOutcome">Výsledek</Label>
              <Select
                value={tradeOutcome}
                onValueChange={(value: "profit" | "loss" | "breakeven") => setTradeOutcome(value)}
                required
              >
                <SelectTrigger id="tradeOutcome">
                  <SelectValue placeholder="Vyberte výsledek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit">Zisk</SelectItem>
                  <SelectItem value="loss">Ztráta</SelectItem>
                  <SelectItem value="breakeven">Break-even</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Vstupní cena</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Výstupní cena</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profitLoss">Zisk/Ztráta ($)</Label>
              <Input
                id="profitLoss"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={profitLoss}
                onChange={(e) => setProfitLoss(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradeNotes">Poznámky k obchodu</Label>
            <Textarea
              id="tradeNotes"
              placeholder="Zaznamenejte důležité detaily, emoce nebo lekce z tohoto obchodu."
              value={tradeNotes}
              onChange={(e) => setTradeNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full">
            Uložit obchod
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
