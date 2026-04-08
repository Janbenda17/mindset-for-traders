"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, DollarSign, Target, BarChart3, Brain, Calendar, Clock } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from "recharts"
import { cn } from "@/lib/utils"

// Custom Tooltip with better formatting
const CustomTooltip = ({ active, payload, label, type = "default" }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-purple-500/40 rounded-lg p-4 shadow-2xl">
      <p className="text-white font-bold mb-3 text-base">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300 text-sm font-medium">{entry.name}:</span>
          </div>
          <span className="text-white font-bold text-base">
            {type === "currency"
              ? `${entry.value >= 0 ? "+" : ""}$${entry.value.toFixed(0)}`
              : type === "percent"
                ? `${entry.value.toFixed(0)}%`
                : type === "mixed" // Handle mixed currency and percentage values
                  ? entry.name.toLowerCase().includes("p&l")
                    ? `${entry.value >= 0 ? "+" : ""}$${entry.value.toFixed(0)}`
                    : `${entry.value.toFixed(0)}%`
                  : entry.value.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  )
}

interface AnalyticsOverviewProps {
  trades: any[]
  avgWinRate: number
  avgMood: number
  avgDiscipline: number
  avgConfidence: number
  avgStress: number
  filteredWeeklyData: any[]
  timeframe: "week" | "month" | "all"
}

export function AnalyticsOverview({
  trades,
  avgWinRate,
  avgMood,
  avgDiscipline,
  avgConfidence,
  avgStress,
  filteredWeeklyData,
  timeframe,
}: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-300 mb-1">Total P&L</p>
                <h3 className="text-3xl font-bold text-white">
                  ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)}
                </h3>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {trades.length > 0 ? ((trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length) * 100).toFixed(1) : 0}% ROI
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300 mb-1">Win Rate</p>
                <h3 className="text-3xl font-bold text-white">{Math.round(avgWinRate)}%</h3>
                <p className="text-xs text-blue-400 mt-2">
                  {trades.filter((t) => (t.pnl || 0) > 0).length}W / {trades.filter((t) => (t.pnl || 0) < 0).length}L
                </p>
              </div>
              <Target className="w-12 h-12 text-blue-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300 mb-1">Avg Trade</p>
                <h3 className="text-3xl font-bold text-white">
                  ${(trades.length > 0 ? trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length : 0).toFixed(2)}
                </h3>
                <p className="text-xs text-purple-400 mt-2">{trades.length} trades total</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/10 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300 mb-1">Mental Score</p>
                <h3 className="text-3xl font-bold text-white">
                  {Math.round((avgMood + avgDiscipline + avgConfidence + (100 - avgStress)) / 4)}
                </h3>
                <p className="text-xs text-orange-400 mt-2">Psychological readiness</p>
              </div>
              <Brain className="w-12 h-12 text-orange-400/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Heatmap */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Performance Heatmap
            </CardTitle>
            <CardDescription>Best & worst trading days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day, i) => (
                <div key={day} className="text-center text-xs text-gray-400 font-medium mb-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 28 }).map((_, i) => {
                const dayOfWeek = i % 7; // Day of week (0-6)
                const dayTrades = trades.filter((t) => new Date(t.date).getDay() === dayOfWeek);
                const dayPnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                const maxAbsPnl = Math.max(...trades.map(t => Math.abs(t.pnl || 0)), 1); // Avoid division by zero
                const intensity = Math.min(Math.abs(dayPnl) / maxAbsPnl, 1);

                return (
                  <div
                    key={i}
                    className="aspect-square rounded transition-all hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor:
                        dayPnl > 0
                          ? `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`
                          : `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`,
                    }}
                    title={`$${dayPnl.toFixed(2)}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500/40" /> Loss
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500/40" /> Profit
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Session Performance */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Session Analysis
            </CardTitle>
            <CardDescription>Performance by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["London (8-12)", "NY AM (12-16)", "NY PM (16-20)", "Asia (20-24)"].map((session, i) => {
                const sessionTrades = trades.filter((t) => {
                  const hour = new Date(t.date).getHours();
                  // Adjusting range for Asia session to cover midnight
                  if (session === "Asia (20-24)") {
                    return (hour >= 20 && hour <= 23) || (hour >= 0 && hour < 0); // Covers 20-23, and wraps around to 00:00
                  }
                  return hour >= i * 4 + 8 && hour < i * 4 + 12;
                });
                const sessionPnl = sessionTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                const sessionWin = sessionTrades.filter((t) => (t.pnl || 0) > 0).length;
                const sessionWinRate = sessionTrades.length > 0 ? (sessionWin / sessionTrades.length) * 100 : 0;
                return (
                  <div key={session} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{session}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{sessionTrades.length} trades</span>
                        <span className={cn("text-sm font-bold", sessionPnl > 0 ? "text-green-400" : "text-red-400")}>
                          ${sessionPnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            sessionPnl > 0 ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-red-500/70",
                          )}
                          style={{ width: `${Math.round(sessionWinRate)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">{Math.round(sessionWinRate)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Performance Chart */}
      <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Performance Trend
          </CardTitle>
          <CardDescription>
            {timeframe === "week" ? "Po-Pá tracking" : timeframe === "month" ? "4 týdny" : "Všechna data"} • P&L, Win
            Rate, Mental Score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={filteredWeeklyData}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="week" stroke="#94a3b8" style={{ fontSize: "12px", fontWeight: 500 }} />
              <YAxis yAxisId="left" stroke="#94a3b8" style={{ fontSize: "12px" }} tickFormatter={(value) => `$${value}`} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f472b6"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip type="mixed" />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="pnl"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#pnlGradient)"
                name="P&L ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="winRate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Win Rate (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgMood"
                stroke="#f472b6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Mental Score (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
