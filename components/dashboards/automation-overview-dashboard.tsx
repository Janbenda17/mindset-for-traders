'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Moon, TrendingUp } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AutomationOverviewDashboard() {
  const [todayData, setTodayData] = useState({
    sleepHours: 0,
    sleepStatus: '',
    tradesCount: 0,
    totalPnL: 0,
    hasFatigueWarning: false,
    lastSyncHealth: null,
    lastSyncTrades: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTodayData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      // Get today's health data
      const { data: healthData } = await supabase
        .from('health_sync')
        .select('sleep_hours, synced_at')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('synced_at', { ascending: false })
        .limit(1)

      // Get today's trades
      const { data: trades } = await supabase
        .from('mt4_trades')
        .select('profit_loss')
        .eq('user_id', user.id)
        .eq('date', today)

      // Get fatigue warning
      const { data: fatigueErrors } = await supabase
        .from('fatigue_errors')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('severity', 'critical')

      const sleepHours = healthData?.[0]?.sleep_hours || 0
      let sleepStatus = 'Not synced'
      if (sleepHours === 0) sleepStatus = 'Waiting for data...'
      else if (sleepHours < 6) sleepStatus = 'Critical - Too Low'
      else if (sleepHours < 7) sleepStatus = 'Below Optimal'
      else if (sleepHours <= 9) sleepStatus = 'Optimal'
      else sleepStatus = 'Too Much'

      const totalPnL = trades?.reduce((sum, t) => sum + (t.profit_loss || 0), 0) || 0

      setTodayData({
        sleepHours,
        sleepStatus,
        tradesCount: trades?.length || 0,
        totalPnL,
        hasFatigueWarning: (fatigueErrors?.length || 0) > 0,
        lastSyncHealth: healthData?.[0]?.synced_at,
        lastSyncTrades: trades?.[0] ? new Date().toISOString() : null,
      })

      setLoading(false)
    }

    loadTodayData()
    const interval = setInterval(loadTodayData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const getSleepColor = (hours: number) => {
    if (hours < 6) return 'text-red-400 bg-red-900/30 border-red-600/30'
    if (hours < 7) return 'text-yellow-400 bg-yellow-900/30 border-yellow-600/30'
    return 'text-green-400 bg-green-900/30 border-green-600/30'
  }

  if (loading) {
    return <div className="text-center text-slate-400">Loading automation status...</div>
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg border ${getSleepColor(todayData.sleepHours)}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80 mb-2">Today's Sleep</p>
              <p className="text-3xl font-bold">{todayData.sleepHours}h</p>
              <p className="text-xs opacity-70 mt-1">{todayData.sleepStatus}</p>
            </div>
            <Moon className="w-8 h-8 opacity-60" />
          </div>
          {todayData.lastSyncHealth && (
            <p className="text-xs opacity-50 mt-3">
              Synced: {new Date(todayData.lastSyncHealth).toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {/* Trading Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-slate-800/50 border border-slate-700/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-2">Today's Trades</p>
              <p className="text-3xl font-bold text-white">{todayData.tradesCount}</p>
              <p className={`text-sm mt-1 font-semibold ${
                todayData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${todayData.totalPnL >= 0 ? '+' : ''}{todayData.totalPnL.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-60" />
          </div>
        </motion.div>
      </div>

      {/* Fatigue Warning */}
      {todayData.hasFatigueWarning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-900/30 border border-red-600/30 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300 text-sm">Fatigue Error Detected</p>
            <p className="text-xs text-red-200 mt-1">
              You had a critical loss with insufficient sleep today. This is likely due to impaired decision-making.
            </p>
          </div>
        </motion.div>
      )}

      {/* Sync Status */}
      <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
        <h4 className="text-sm font-semibold text-white mb-3">Automation Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Apple Health Sync</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">MetaTrader Webhook</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Correlation Engine</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {todayData.sleepHours > 0 && todayData.sleepHours < 6 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-600/30"
        >
          <p className="font-semibold text-yellow-300 text-sm mb-2">Recommendation</p>
          <p className="text-xs text-yellow-200">
            Your sleep is critically low ({todayData.sleepHours}h). Consider not trading today or reducing risk significantly. Your decision-making is likely impaired.
          </p>
        </motion.div>
      )}
    </div>
  )
}
