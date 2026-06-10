'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Heart, Moon, Zap, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface HealthData {
  sleep_hours?: number
  heart_rate_avg?: number
  heart_rate_variability?: number
  stress_level?: number
  steps?: number
  updated_at?: string
}

export function HealthWidget() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealthData()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('health_sync_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'health_sync',
        },
        () => {
          fetchHealthData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('health_sync')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setHealthData(data)
        setError(null)
      } else {
        setError('No health data yet. Connect your Apple Health to see data.')
      }
    } catch (err) {
      console.error('[v0] Error fetching health data:', err)
      setError('Failed to load health data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="h-24 bg-slate-800/50 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-slate-900/50 border-yellow-600/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Apple Health Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sleep */}
          {healthData?.sleep_hours && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">Sleep</span>
              </div>
              <span className="font-semibold text-white">
                {healthData.sleep_hours.toFixed(1)}h
              </span>
            </div>
          )}

          {/* Heart Rate */}
          {healthData?.heart_rate_avg && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-sm text-slate-300">Avg Heart Rate</span>
              </div>
              <span className="font-semibold text-white">
                {Math.round(healthData.heart_rate_avg)} bpm
              </span>
            </div>
          )}

          {/* HRV */}
          {healthData?.heart_rate_variability && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-300">Heart Rate Variability</span>
              </div>
              <span className="font-semibold text-white">
                {Math.round(healthData.heart_rate_variability)} ms
              </span>
            </div>
          )}

          {/* Steps */}
          {healthData?.steps && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-300">Steps</span>
              </div>
              <span className="font-semibold text-white">
                {healthData.steps.toLocaleString()}
              </span>
            </div>
          )}

          {/* Stress */}
          {healthData?.stress_level && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-slate-300">Stress Level</span>
              </div>
              <span className="font-semibold text-white">
                {Math.round(healthData.stress_level)}/100
              </span>
            </div>
          )}

          {healthData && (
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
              Last updated: {new Date(healthData.updated_at || '').toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
