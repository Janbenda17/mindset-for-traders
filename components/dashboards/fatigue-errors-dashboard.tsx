'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { AlertCircle, TrendingDown, Clock, Zap } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface FatigueError {
  id: string
  date: string
  sleep_hours: number
  loss_amount: number
  fatigue_score: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export function FatigueErrorsDashboard() {
  const [fatigueErrors, setFatigueErrors] = useState<FatigueError[]>([])
  const [stats, setStats] = useState({
    totalLosses: 0,
    avgSleepWhenLost: 0,
    criticalCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all fatigue errors
      const { data: errors } = await supabase
        .from('fatigue_errors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (errors) {
        setFatigueErrors(errors)

        // Calculate stats
        const totalLosses = errors.reduce((sum, e) => sum + (e.loss_amount || 0), 0)
        const avgSleep =
          errors.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / errors.length
        const criticalCount = errors.filter((e) => e.severity === 'critical').length

        setStats({
          totalLosses,
          avgSleepWhenLost: avgSleep,
          criticalCount,
        })
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-900/30 border-blue-600/30 text-blue-300',
      medium: 'bg-yellow-900/30 border-yellow-600/30 text-yellow-300',
      high: 'bg-orange-900/30 border-orange-600/30 text-orange-300',
      critical: 'bg-red-900/30 border-red-600/30 text-red-300',
    }
    return colors[severity] || colors.low
  }

  if (loading) {
    return <div className="text-center text-slate-400">Loading fatigue data...</div>
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-red-900/20 border border-red-600/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-200">Total Losses (Fatigue)</p>
          </div>
          <p className="text-3xl font-bold text-red-300">
            ${Math.abs(stats.totalLosses).toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-lg bg-blue-900/20 border border-blue-600/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-200">Avg Sleep When Lost</p>
          </div>
          <p className="text-3xl font-bold text-blue-300">
            {stats.avgSleepWhenLost.toFixed(1)}h
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-lg bg-orange-900/20 border border-orange-600/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <p className="text-sm text-orange-200">Critical Errors</p>
          </div>
          <p className="text-3xl font-bold text-orange-300">{stats.criticalCount}</p>
        </motion.div>
      </div>

      {/* Fatigue Errors List */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Fatigue Errors Detected</h3>
        <div className="space-y-3">
          {fatigueErrors.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              No fatigue errors detected. Great sleep consistency!
            </p>
          ) : (
            fatigueErrors.map((error) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border ${getSeverityColor(error.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" />
                      <p className="font-semibold">
                        {error.date} - {error.severity.toUpperCase()}
                      </p>
                    </div>
                    <p className="text-sm opacity-90">
                      Loss: ${Math.abs(error.loss_amount || 0).toFixed(2)} | Sleep: {error.sleep_hours}h | Fatigue Score: {error.fatigue_score}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold opacity-80">
                      {error.fatigue_score}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Key Insight */}
      {stats.avgSleepWhenLost < 6 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-red-900/20 border border-red-600/30"
        >
          <h4 className="text-lg font-bold text-red-300 mb-2">Key Insight</h4>
          <p className="text-red-200 text-sm">
            Your average sleep when losing money is {stats.avgSleepWhenLost.toFixed(1)} hours.
            This is below the recommended 7-9 hours. Consider not trading on days when you sleep less than 6 hours.
          </p>
        </motion.div>
      )}
    </div>
  )
}
