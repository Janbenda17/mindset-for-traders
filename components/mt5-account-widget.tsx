'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

interface MT5AccountData {
  balance: number
  equity: number
  profit: number
  margin_level: number
  free_margin: number
  open_trades: number
}

export function MT5AccountWidget({ onData }: { onData?: (data: { balance: number; monthlyProfit: number } | null) => void } = {}) {
  const [data, setData] = useState<MT5AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchMT5Data = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Not authenticated')
          onData?.(null)
          return
        }

        // Get latest account data from mt4_trades table
        const { data: trades, error: tradesError } = await supabase
          .from('mt4_trades')
          .select('*')
          .eq('user_id', user.id)
          .eq('symbol', '_ACCOUNT_')
          .order('created_at', { ascending: false })
          .limit(1)

        if (tradesError) {
          throw tradesError
        }

        if (!trades || trades.length === 0) {
          setError('No MT5 account connected')
          setLoading(false)
          onData?.(null)
          return
        }

        const trade = trades[0]

        // Get open trades count
        const { count: openTradesCount, error: openError } = await supabase
          .from('mt4_trades')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('symbol', '_ACCOUNT_')
          .eq('status', 'OPEN')

        if (openError) {
          console.error('[v0] Error fetching open trades:', openError)
        }

        const nextData = {
          balance: trade.entry_price || 0,
          equity: trade.exit_price || 0,
          profit: trade.profit_loss || 0,
          margin_level: 0,
          free_margin: 0,
          open_trades: openTradesCount || 0,
        }

        setData(nextData)
        onData?.({ balance: nextData.balance, monthlyProfit: nextData.profit })

        setLastUpdated(new Date())
      } catch (err) {
        console.error('[v0] Error fetching MT5 data:', err)
        setError('Failed to load MT5 data')
      } finally {
        setLoading(false)
      }
    }

    fetchMT5Data()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('mt4_trades')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mt4_trades' },
        () => {
          console.log('[v0] MT5 data updated, refreshing...')
          fetchMT5Data()
        }
      )
      .subscribe()

    // Poll every 30 seconds for updates
    const interval = setInterval(() => {
      fetchMT5Data()
    }, 30000)

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const profit = data?.profit || 0
  const profitPercent =
    data && data.balance > 0
      ? ((data.equity - data.balance) / data.balance) * 100
      : 0
  const isProfitable = profit >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-900/50 border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              MetaTrader 5 Account
              {loading && <Loader className="w-4 h-4 animate-spin text-fuchsia-400" />}
            </CardTitle>
            <span className="text-xs text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-yellow-400 text-sm p-3 bg-yellow-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Main metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Balance */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Balance</p>
                  <p className="text-lg font-bold text-white">
                    ${data.balance.toFixed(2)}
                  </p>
                </div>

                {/* Equity */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Equity</p>
                  <p className="text-lg font-bold text-white">
                    ${data.equity.toFixed(2)}
                  </p>
                </div>

                {/* Profit/Loss */}
                <div
                  className={`rounded-lg p-3 border ${
                    isProfitable
                      ? 'bg-emerald-900/20 border-emerald-600/50'
                      : 'bg-red-900/20 border-red-600/50'
                  }`}
                >
                  <p className="text-xs text-slate-400 mb-1">P&L</p>
                  <div className="flex items-center gap-1">
                    {isProfitable ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <p
                      className={`text-lg font-bold ${
                        isProfitable ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isProfitable ? '+' : ''}${profit.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Profit % */}
                <div
                  className={`rounded-lg p-3 border ${
                    isProfitable
                      ? 'bg-emerald-900/20 border-emerald-600/50'
                      : 'bg-red-900/20 border-red-600/50'
                  }`}
                >
                  <p className="text-xs text-slate-400 mb-1">Return %</p>
                  <p
                    className={`text-lg font-bold ${
                      isProfitable ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {isProfitable ? '+' : ''}{profitPercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Open trades */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-300">Open Positions</span>
                <span className="text-xl font-bold text-fuchsia-400">
                  {data.open_trades}
                </span>
              </div>

              {/* Status bar */}
              <div className="text-xs text-slate-400 text-center py-2 border-t border-slate-700/50">
                Data syncs every 30 seconds
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-fuchsia-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Loading MT5 data...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
