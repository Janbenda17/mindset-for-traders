"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface TradingPatternsChartProps {
  data: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function TradingPatternsChart({ data }: TradingPatternsChartProps) {
  const { pairData, timeData, typeData } = useMemo(() => {
    if (!data || data.length === 0) return { pairData: [], timeData: [], typeData: [] }

    // Trading pairs distribution
    const pairStats = data.reduce(
      (acc, entry) => {
        const pair = entry.pair || entry.symbol || "Unknown"
        acc[pair] = (acc[pair] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const pairData = Object.entries(pairStats)
      .map(([pair, count]) => ({ name: pair, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Time distribution (hour of day)
    const timeStats = data.reduce(
      (acc, entry) => {
        // Try to get timestamp from various fields
        const timestamp = entry.timestamp || entry.date || Date.now()
        const hour = new Date(timestamp).getHours()
        const timeSlot =
          hour < 6 ? "Noc (0-6)" : hour < 12 ? "Ráno (6-12)" : hour < 18 ? "Odpoledne (12-18)" : "Večer (18-24)"
        acc[timeSlot] = (acc[timeSlot] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const timeData = Object.entries(timeStats).map(([time, count]) => ({ name: time, value: count }))

    // Trade type distribution
    const typeStats = data.reduce(
      (acc, entry) => {
        const type = entry.tradeType || entry.direction || entry.type || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const typeData = Object.entries(typeStats).map(([type, count]) => ({ name: type, value: count }))

    return { pairData, timeData, typeData }
  }, [data])

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="text-gray-400 mb-2">🔍</div>
          <p className="text-sm text-gray-500">Žádná data pro vzorce</p>
          <p className="text-xs text-gray-400">Přidejte obchodní záznamy pro analýzu vzorců</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <h4 className="font-medium text-center">Nejobchodovanější páry</h4>
        {pairData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pairData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pairData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">Žádné páry k zobrazení</div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-center">Časové rozložení</h4>
        {timeData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">Žádné časové data</div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-center">Typ obchodů</h4>
        {typeData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">Žádné typy obchodů</div>
        )}
      </div>
    </div>
  )
}
