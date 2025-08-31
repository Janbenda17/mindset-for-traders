"use client"

import { useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface RiskAnalysisChartProps {
  data: any[]
}

export function RiskAnalysisChart({ data }: RiskAnalysisChartProps) {
  const { riskRewardData, drawdownData } = useMemo(() => {
    if (!data || data.length === 0) return { riskRewardData: [], drawdownData: [] }

    // Risk/Reward scatter plot data
    const riskRewardData = data
      .filter((entry) => entry.profitLoss !== undefined)
      .map((entry, index) => ({
        x: Math.abs(entry.profitLoss < 0 ? entry.profitLoss : 0), // Risk (loss)
        y: entry.profitLoss > 0 ? entry.profitLoss : 0, // Reward (profit)
        profitLoss: entry.profitLoss,
        pair: entry.pair,
        date: entry.date,
      }))

    // Drawdown analysis
    let peak = 0
    let cumulativePnL = 0
    const drawdownData = data
      .filter((entry) => entry.profitLoss !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry, index) => {
        cumulativePnL += entry.profitLoss || 0
        if (cumulativePnL > peak) peak = cumulativePnL
        const drawdown = peak - cumulativePnL

        return {
          trade: index + 1,
          drawdown: -drawdown,
          cumulativePnL,
          date: new Date(entry.date).toLocaleDateString("cs-CZ", {
            month: "short",
            day: "numeric",
          }),
        }
      })

    return { riskRewardData, drawdownData }
  }, [data])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Žádná data pro zobrazení</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-medium">Risk vs Reward</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Risk"
                  fontSize={12}
                  tickFormatter={(value) => `${Math.abs(value)} USD`}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Reward"
                  fontSize={12}
                  tickFormatter={(value) => `${value} USD`}
                />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${Math.abs(value)} USD`,
                    name === "x" ? "Riziko" : "Odměna",
                  ]}
                />
                <Scatter data={riskRewardData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Drawdown analýza</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drawdownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `${value} USD`} />
                <Tooltip formatter={(value: any) => [`${Math.abs(value)} USD`, "Drawdown"]} />
                <Bar dataKey="drawdown" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Maximální drawdown</div>
          <div className="text-2xl font-bold text-red-600">
            {drawdownData.length > 0 ? `${Math.min(...drawdownData.map((d) => d.drawdown)).toFixed(0)} USD` : "0 USD"}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Průměrné riziko</div>
          <div className="text-2xl font-bold text-orange-600">
            {riskRewardData.length > 0
              ? `${(riskRewardData.reduce((sum, d) => sum + d.x, 0) / riskRewardData.filter((d) => d.x > 0).length || 0).toFixed(0)} USD`
              : "0 USD"}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Průměrná odměna</div>
          <div className="text-2xl font-bold text-green-600">
            {riskRewardData.length > 0
              ? `${(riskRewardData.reduce((sum, d) => sum + d.y, 0) / riskRewardData.filter((d) => d.y > 0).length || 0).toFixed(0)} USD`
              : "0 USD"}
          </div>
        </div>
      </div>
    </div>
  )
}
