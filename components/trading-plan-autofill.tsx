'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useBrokerAutoFill } from '@/hooks/use-broker-autofill'
import { Zap, RefreshCw, AlertCircle } from 'lucide-react'

interface TradingPlanAutoFillProps {
  onDataFill?: (data: any) => void
}

export function TradingPlanAutoFill({ onDataFill }: TradingPlanAutoFillProps) {
  const { brokerData, loading, error } = useBrokerAutoFill()
  const [dailyRisk, setDailyRisk] = useState(2)
  const [maxTrades, setMaxTrades] = useState(5)
  const [autoFilled, setAutoFilled] = useState(false)

  // Auto-fill when broker data arrives
  useEffect(() => {
    if (brokerData && !autoFilled) {
      const calculatedRiskAmount = (brokerData.accountBalance * dailyRisk) / 100
      
      const autofillData = {
        accountBalance: brokerData.accountBalance,
        equity: brokerData.equity,
        dailyRisk: dailyRisk,
        riskAmount: calculatedRiskAmount,
        maxTrades: maxTrades,
        availableMargin: brokerData.margin,
        marginLevel: brokerData.marginLevel,
        lastTradeSymbol: brokerData.lastTrade?.symbol || 'EUR/USD',
      }

      onDataFill?.(autofillData)
      setAutoFilled(true)
    }
  }, [brokerData, autoFilled, dailyRisk, maxTrades, onDataFill])

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold">Broker not connected</p>
              <p className="text-sm text-red-200">Connect your MT5 broker in Settings to enable auto-fill.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-fuchsia-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-fuchsia-400" />
            <CardTitle>Auto-Fill from Broker</CardTitle>
          </div>
          <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30">
            {loading ? 'Syncing...' : 'Connected'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Account Summary */}
        {brokerData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-lg font-bold text-green-400">
                ${brokerData.accountBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Equity</p>
              <p className="text-lg font-bold text-blue-400">
                ${brokerData.equity.toFixed(2)}
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Margin Level</p>
              <p className="text-lg font-bold text-yellow-400">
                {brokerData.marginLevel.toFixed(0)}%
              </p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Open Trades</p>
              <p className="text-lg font-bold text-purple-400">
                {brokerData.openTrades}
              </p>
            </div>
          </div>
        )}

        {/* Daily Risk Settings */}
        <div className="space-y-3 bg-black/20 rounded-lg p-4">
          <h3 className="font-semibold text-white">Today's Trading Plan</h3>
          
          <div>
            <label className="text-xs text-gray-400">Daily Risk %</label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={dailyRisk}
                onChange={(e) => setDailyRisk(parseFloat(e.target.value))}
                className="w-20 bg-black/50 border-fuchsia-500/30 text-white"
              />
              <span className="text-sm text-gray-400">
                = ${((brokerData?.accountBalance || 0) * dailyRisk / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Max Trades Today</label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min="1"
                max="20"
                value={maxTrades}
                onChange={(e) => setMaxTrades(parseInt(e.target.value))}
                className="w-20 bg-black/50 border-fuchsia-500/30 text-white"
              />
              <span className="text-sm text-gray-400">trades</span>
            </div>
          </div>

          {brokerData?.lastTrade && (
            <div className="bg-black/30 rounded p-2">
              <p className="text-xs text-gray-400">Last Trade</p>
              <p className="text-sm text-white font-mono">
                {brokerData.lastTrade.symbol} {brokerData.lastTrade.type} @ {brokerData.lastTrade.entryPrice}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 italic">
          All data is editable — change anything you want. Auto-updated every 30 seconds.
        </p>
      </CardContent>
    </Card>
  )
}

export default TradingPlanAutoFill
