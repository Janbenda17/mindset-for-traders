"use client"

import { Badge } from "@/components/ui/badge"
import { useTradingStyle } from "@/contexts/trading-style-context"
import { Zap, TrendingUp, Clock } from "lucide-react"

export function TradingStyleBadge() {
  const { tradingStyle, config } = useTradingStyle()

  if (!tradingStyle) return null

  const icons = {
    scalper: Zap,
    "day-trader": TrendingUp,
    "swing-trader": Clock,
  }

  const colors = {
    scalper: "from-red-500 to-orange-500",
    "day-trader": "from-blue-500 to-cyan-500",
    "swing-trader": "from-purple-500 to-pink-500",
  }

  const Icon = icons[tradingStyle]

  return (
    <Badge
      className={`bg-gradient-to-r ${colors[tradingStyle]} text-white border-0 shadow-lg px-3 py-1.5 text-sm font-semibold`}
    >
      <Icon className="w-4 h-4 mr-1.5" />
      {config.name}
    </Badge>
  )
}
