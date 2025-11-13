"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTradingStyle, type TradingStyle } from "@/contexts/trading-style-context"
import { Zap, Target, TrendingUp, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const TRADING_STYLES = [
  {
    id: "scalper" as TradingStyle,
    name: "Scalper",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    description: "Velmi krátké obchody (sekundy až minuty)",
    characteristics: [
      "Desítky až stovky obchodů denně",
      "Focus na rychlé rozhodování",
      "Session-based tracking",
      "Time-of-day analysis",
      "Energy & concentration management",
    ],
    bestFor: "Tradeři s vysokou koncentrací, rychlým rozhodováním a schopností zvládat intenzivní sessions",
  },
  {
    id: "day-trader" as TradingStyle,
    name: "Day Trader",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Obchody během dne (minuty až hodiny)",
    characteristics: [
      "5-20 obchodů denně",
      "Focus na disciplínu a plán",
      "Detailní journaling každého obchodu",
      "Emoční kontrola během dne",
      "Risk management",
    ],
    bestFor: "Tradeři s disciplínou, schopností držet se plánu a dobrou emoční kontrolou",
  },
  {
    id: "swing-trader" as TradingStyle,
    name: "Swing Trader",
    icon: TrendingUp,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Obchody přes několik dní (dny až týdny)",
    characteristics: [
      "1-5 obchodů týdně",
      "Focus na trpělivost a analýzu",
      "Velmi detailní journaling s fundamentální analýzou",
      "Long-term thinking",
      "Position management",
    ],
    bestFor: "Tradeři s trpělivostí, schopností long-term thinking a kvalitní analýzou",
  },
]

export function TradingStyleSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tradingStyle, setTradingStyle } = useTradingStyle()
  const [selectedStyle, setSelectedStyle] = useState<TradingStyle>(tradingStyle)

  const handleConfirm = () => {
    setTradingStyle(selectedStyle)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vyber svůj Trading Style
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-300">
            Aplikace se přizpůsobí tvému stylu obchodování pro maximální efektivitu
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {TRADING_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id
            const Icon = style.icon

            return (
              <Card
                key={style.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105",
                  isSelected
                    ? `border-2 ${style.borderColor} ${style.bgColor}`
                    : "border border-slate-700 bg-slate-800/50",
                )}
                onClick={() => setSelectedStyle(style.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl bg-gradient-to-br", style.color)}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    {isSelected && (
                      <div className={cn("p-2 rounded-full bg-gradient-to-br", style.color)}>
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl text-white">{style.name}</CardTitle>
                  <CardDescription className="text-base text-gray-300">{style.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Charakteristiky:</h4>
                    <ul className="space-y-1">
                      {style.characteristics.map((char, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={cn("p-3 rounded-lg", style.bgColor, style.borderColor, "border")}>
                    <p className="text-xs text-gray-300">
                      <span className="font-bold">Nejlepší pro:</span> {style.bestFor}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
          <p className="text-sm text-gray-400">Můžeš změnit kdykoliv v nastavení</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="bg-transparent border-slate-600 text-white">
              Zrušit
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedStyle}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Potvrdit výběr
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TradingStyleBadge() {
  const { tradingStyle, config } = useTradingStyle()

  if (!tradingStyle || !config) return null

  const style = TRADING_STYLES.find((s) => s.id === tradingStyle)
  if (!style) return null

  const Icon = style.icon

  return (
    <Badge className={cn("px-3 py-1", style.bgColor, style.borderColor, "border")}>
      <Icon className="h-3 w-3 mr-1" />
      {config.name}
    </Badge>
  )
}
