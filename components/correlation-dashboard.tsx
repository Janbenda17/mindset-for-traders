import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Card } from '@/components/ui/card'
import { AlertCircle, TrendingDown, Moon, Zap } from 'lucide-react'
import useSWR from 'swr'

interface FatigueError {
  id: string
  trade_id: string
  error_type: string
  severity: number
  error_factors: string[]
  sleep_hours: number
  sleep_quality: number
  trade_details: {
    symbol: string
    profit_loss: number
    pnl_percent: number
    duration_minutes: number
  }
  date: string
}

interface HealthData {
  date: string
  sleep_hours: number
  sleep_quality: number
}

export function CorrelationDashboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Fetch health data
  const { data: healthData, error: healthError } = useSWR(
    user && selectedDate ? `/api/health/data?date=${selectedDate}` : null,
    (url) => fetch(url).then(r => r.json())
  )

  // Fetch trades for the day
  const { data: trades, error: tradesError } = useSWR(
    user && selectedDate ? `/api/trades/daily?date=${selectedDate}` : null,
    (url) => fetch(url).then(r => r.json())
  )

  // Fetch fatigue errors
  const { data: errors, error: errorsError } = useSWR(
    user && selectedDate ? `/api/fatigue-errors?date=${selectedDate}` : null,
    (url) => fetch(url).then(r => r.json())
  )

  if (!user) {
    return <div className="p-4 text-slate-400">{language === 'en' ? 'Loading...' : 'Načítání...'}</div>
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 75) return 'text-red-500'
    if (severity >= 50) return 'text-orange-500'
    if (severity >= 25) return 'text-yellow-500'
    return 'text-slate-400'
  }

  const getSeverityBg = (severity: number) => {
    if (severity >= 75) return 'bg-red-950/30'
    if (severity >= 50) return 'bg-orange-950/30'
    if (severity >= 25) return 'bg-yellow-950/30'
    return 'bg-slate-800/30'
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex gap-2 items-center">
        <label className="text-sm text-slate-400">{language === 'en' ? 'Date:' : 'Datum:'}</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white"
        />
      </div>

      {/* Health Stats */}
      {healthData && (
        <Card className="p-6 border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">{language === 'en' ? 'Sleep Data' : 'Data o spánku'}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">{language === 'en' ? 'Sleep Hours' : 'Hodiny spánku'}</p>
              <p className={`text-2xl font-bold ${healthData.sleep_hours < 7 ? 'text-orange-400' : 'text-green-400'}`}>
                {healthData.sleep_hours.toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{language === 'en' ? 'Sleep Quality' : 'Kvalita spánku'}</p>
              <p className={`text-2xl font-bold ${healthData.sleep_quality < 0.6 ? 'text-orange-400' : 'text-green-400'}`}>
                {(healthData.sleep_quality * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Trading Stats */}
      {trades && (
        <Card className="p-6 border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-white">{language === 'en' ? 'Trades Today' : 'Obchody dnes'}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">{language === 'en' ? 'Total' : 'Celkem'}</p>
              <p className="text-2xl font-bold text-white">{trades.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{language === 'en' ? 'P&L' : 'Zisk/Ztráta'}</p>
              <p className={`text-2xl font-bold ${trades.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trades.totalPnL >= 0 ? '+' : ''}{trades.totalPnL?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">{language === 'en' ? 'Win Rate' : 'Win Rate'}</p>
              <p className="text-2xl font-bold text-white">{trades.winRate?.toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Fatigue Errors - Main Alert */}
      {errors && errors.length > 0 && (
        <Card className={`p-6 border-2 ${errors.some((e: FatigueError) => e.severity >= 75) ? 'border-red-600 bg-red-950/20' : 'border-orange-600 bg-orange-950/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className={`w-6 h-6 ${errors.some((e: FatigueError) => e.severity >= 75) ? 'text-red-500' : 'text-orange-500'}`} />
            <h3 className={`text-lg font-black ${errors.some((e: FatigueError) => e.severity >= 75) ? 'text-red-400' : 'text-orange-400'}`}>
              {language === 'en' ? 'Fatigue Errors Detected' : 'Detekovány chyby z únavy'}
            </h3>
          </div>

          <div className="space-y-3">
            {errors.map((error: FatigueError) => (
              <div key={error.id} className={`p-4 rounded border border-slate-700 ${getSeverityBg(error.severity)}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-white">{error.trade_details.symbol}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${error.severity >= 75 ? 'bg-red-500' : error.severity >= 50 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                        style={{ width: `${error.severity}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${getSeverityColor(error.severity)}`}>{error.severity}%</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-2">
                  Loss: {error.trade_details.profit_loss.toFixed(2)} ({error.trade_details.pnl_percent?.toFixed(2)}%)
                </p>

                <div className="text-xs text-slate-400 space-y-1">
                  {error.error_factors.map((factor, i) => (
                    <p key={i}>• {factor}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Issues */}
      {errors && errors.length === 0 && healthData && (
        <Card className="p-6 border border-green-600/30 bg-green-950/10">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            <p className="text-green-300 font-semibold">
              {language === 'en' ? 'Great! No fatigue errors detected today.' : 'Super! Žádné chyby z únavy dnes.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
