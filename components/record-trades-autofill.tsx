'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBrokerAutoFill } from '@/hooks/use-broker-autofill'
import { Zap, Copy, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface RecordTradesAutoFillProps {
  onSelectTrade?: (tradeData: any) => void
}

export function RecordTradesAutoFill({ onSelectTrade }: RecordTradesAutoFillProps) {
  const { brokerData, loading, error } = useBrokerAutoFill()
  const [copied, setCopied] = useState<string | null>(null)

  if (error) {
    return null // Silently fail if broker not connected
  }

  if (!brokerData?.todayTrades || brokerData.todayTrades.length === 0) {
    return null
  }

  const handleSelectTrade = (trade: any) => {
    onSelectTrade?.({
      pair: trade.symbol,
      direction: trade.type,
      entryPrice: trade.entryPrice,
      volume: trade.volume,
      profit: trade.profit,
    })
  }

  const handleCopyTrade = (trade: any) => {
    const text = `${trade.symbol} ${trade.type} @ ${trade.entryPrice}`
    navigator.clipboard.writeText(text)
    setCopied(trade.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-base">Trades Today ({brokerData.todayTrades.length})</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {brokerData.todayTrades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{trade.symbol}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  trade.type === 'BUY'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {trade.type}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Entry: {trade.entryPrice} | Vol: {trade.volume} | P&L: {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyTrade(trade)}
                className="text-xs h-8 px-2"
              >
                <Copy className="w-3 h-3" />
                {copied === trade.id && 'Copied!'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleSelectTrade(trade)}
                className="text-xs h-8 px-2 bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200"
              >
                Use
              </Button>
            </div>
          </div>
        ))}

        <p className="text-xs text-gray-400 italic pt-2">
          Click "Use" to auto-fill this trade, or "Copy" to copy the details.
        </p>
      </CardContent>
    </Card>
  )
}

export default RecordTradesAutoFill
