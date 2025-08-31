"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface PerformanceChartProps {
  data: any[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort by date and calculate cumulative P&L
    const sortedData = [...data]
      .filter((entry) => entry.profitLoss !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let cumulativePnL = 0
    return sortedData.map((entry, index) => {
      cumulativePnL += entry.profitLoss || 0
      return {
        date: new Date(entry.date).toLocaleDateString("cs-CZ", {
          month: "short",
          day: "numeric",
        }),
        cumulativePnL: cumulativePnL,
        dailyPnL: entry.profitLoss || 0,
        trade: index + 1,
        pair: entry.pair,
        type: entry.tradeType,
      }
    })
  }, [data])

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Žádná data pro zobrazení</div>
  }

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} tick={{ fill: "#666" }} />
            <YAxis fontSize={12} tick={{ fill: "#666" }} tickFormatter={(value) => `${value} USD`} />
            <Tooltip
              formatter={(value: any, name: string) => [
                `${value} USD`,
                name === "cumulativePnL" ? "Kumulativní P&L" : "Denní P&L",
              ]}
              labelFormatter={(label) => `Datum: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="cumulativePnL"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} tick={{ fill: "#666" }} />
            <YAxis fontSize={12} tick={{ fill: "#666" }} tickFormatter={(value) => `${value} USD`} />
            <Tooltip
              formatter={(value: any) => [`${value} USD`, "Denní P&L"]}
              labelFormatter={(label) => `Datum: ${label}`}
            />
            <Bar dataKey="dailyPnL" fill={(entry: any) => (entry.dailyPnL >= 0 ? "#10b981" : "#ef4444")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
