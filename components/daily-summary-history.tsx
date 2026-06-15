'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, TrendingDown, Calendar, BarChart3, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'

interface DailyHistoryEntry {
  id: string
  date: string
  total_pnl: number
  trades_count: number
  winning_trades: number
  losing_trades: number
  mood?: number
  notes?: string
  created_at: string
}

export function DailySummaryHistory() {
  const [history, setHistory] = useState<DailyHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<DailyHistoryEntry | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/daily-summary/history')
      
      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }

      const data = await response.json()
      setHistory(data.entries || [])
    } catch (error) {
      console.error('[v0] Error fetching history:', error)
      toast({
        title: "Error",
        description: "Failed to load trading history",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading history...</p>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Trading History</h1>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400 text-lg">No trading history yet</p>
              <p className="text-slate-500 text-sm mt-2">Your daily summaries will appear here after you archive them</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalDays = history.length
  const totalTrades = history.reduce((sum, e) => sum + (e.trades_count || 0), 0)
  const totalPnL = history.reduce((sum, e) => sum + (e.total_pnl || 0), 0)
  const totalWins = history.reduce((sum, e) => sum + (e.winning_trades || 0), 0)
  const overallWinRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0
  const avgPnLPerDay = totalDays > 0 ? (totalPnL / totalDays).toFixed(2) : '0.00'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-8 h-8 text-white" />
          <h1 className="text-4xl font-bold text-white">Trading History</h1>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-900/20 border-blue-600/30">
            <CardContent className="p-4">
              <p className="text-sm text-blue-300 mb-1">Total Days</p>
              <p className="text-3xl font-bold text-white">{totalDays}</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-600/30">
            <CardContent className="p-4">
              <p className="text-sm text-purple-300 mb-1">Total Trades</p>
              <p className="text-3xl font-bold text-white">{totalTrades}</p>
            </CardContent>
          </Card>

          <Card className={`${totalPnL >= 0 ? 'bg-green-900/20 border-green-600/30' : 'bg-red-900/20 border-red-600/30'}`}>
            <CardContent className="p-4">
              <p className={`text-sm mb-1 ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>Total P&L</p>
              <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cyan-900/20 border-cyan-600/30">
            <CardContent className="p-4">
              <p className="text-sm text-cyan-300 mb-1">Win Rate</p>
              <p className="text-3xl font-bold text-white">{overallWinRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {history.map((entry) => {
            const isProfit = entry.total_pnl >= 0
            const winRate = entry.trades_count > 0 ? Math.round((entry.winning_trades / entry.trades_count) * 100) : 0
            const isExpanded = selectedEntry?.id === entry.id

            return (
              <Card
                key={entry.id}
                className={`cursor-pointer transition-all ${isExpanded ? 'bg-slate-700/50 border-white/20' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'}`}
                onClick={() => setSelectedEntry(isExpanded ? null : entry)}
              >
                <CardContent className="p-6">
                  {/* Main Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="font-semibold text-white">
                          {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {entry.trades_count} trades • {winRate}% win rate
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mr-4">
                      <div className="text-right">
                        <div className={`flex items-center gap-1 font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                          {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {isProfit ? '+' : ''}{entry.total_pnl.toFixed(2)}
                        </div>
                        {entry.mood && (
                          <p className="text-xs text-slate-400 mt-1">Mood: {entry.mood}/10</p>
                        )}
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Winning Trades</p>
                          <p className="text-lg font-semibold text-green-400">{entry.winning_trades}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Losing Trades</p>
                          <p className="text-lg font-semibold text-red-400">{entry.losing_trades}</p>
                        </div>
                      </div>
                      
                      {entry.notes && (
                        <div className="mt-4">
                          <p className="text-xs text-slate-400 mb-2">Notes</p>
                          <p className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
