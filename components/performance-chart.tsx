"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useData } from "@/contexts/data-context"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

export function PerformanceChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, change: 0, trend: "up" })
  const { isLiveMode, getAllTrades } = useData()

  useEffect(() => {
    const loadData = () => {
      if (isLiveMode) {
        // In live mode, show real data or empty state
        const trades = getAllTrades()

        if (trades.length === 0) {
          // Empty state for live mode
          setChartData([])
          setStats({ total: 0, change: 0, trend: "neutral" })
          return
        }

        // Calculate cumulative P&L from real trades
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        let cumulative = 0
        const data = sortedTrades.map((trade) => {
          cumulative += trade.pnl || 0
          return {
            date: new Date(trade.date).toLocaleDateString("cs-CZ", {
              day: "2-digit",
              month: "2-digit",
            }),
            value: cumulative,
          }
        })

        setChartData(data)

        const totalPnL = cumulative
        const firstValue = data[0]?.value || 0
        const lastValue = data[data.length - 1]?.value || 0
        const change = lastValue - firstValue

        setStats({
          total: totalPnL,
          change: change,
          trend: change >= 0 ? "up" : "down",
        })
      } else {
        // Virtual mode - show demo data
        const demoData = generateDemoChartData()
        setChartData(demoData)

        const totalPnL = demoData[demoData.length - 1]?.value || 0
        const firstValue = demoData[0]?.value || 0
        const lastValue = demoData[demoData.length - 1]?.value || 0
        const change = lastValue - firstValue

        setStats({
          total: totalPnL,
          change: change,
          trend: change >= 0 ? "up" : "down",
        })
      }
    }

    loadData()
  }, [isLiveMode, getAllTrades])

  const generateDemoChartData = () => {
    const data = []
    let cumulative = 0

    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const change = (Math.random() - 0.45) * 500 // Slight positive bias
      cumulative += change

      data.push({
        date: date.toLocaleDateString("cs-CZ", {
          day: "2-digit",
          month: "2-digit",
        }),
        value: Math.round(cumulative),
      })
    }

    return data
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLiveMode && chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vývoj výkonnosti</CardTitle>
          <CardDescription>Kumulativní P&L v čase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Zatím žádná data</p>
            <p className="text-sm text-center">Začněte zaznamenávat své obchody, aby se zde zobrazil graf výkonnosti</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vývoj výkonnosti</CardTitle>
        <CardDescription>Kumulativní P&L v čase</CardDescription>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            {stats.trend === "up" ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : stats.trend === "down" ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <Activity className="h-5 w-5 text-gray-500" />
            )}
            <span className="text-2xl font-bold">{formatCurrency(stats.total)}</span>
          </div>
          <div className={`text-sm ${stats.change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {stats.change >= 0 ? "+" : ""}
            {formatCurrency(stats.change)} za období
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("cs-CZ", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <Tooltip
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: "#000" }}
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              name="Kumulativní P&L"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
