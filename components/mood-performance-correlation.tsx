"use client"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

export function MoodPerformanceCorrelation() {
  // Sample data: [mood rating (1-5), performance percentage, trade count]
  const data = [
    { mood: 5, performance: 2.3, trades: 8, day: "Monday" },
    { mood: 4, performance: 1.7, trades: 6, day: "Tuesday" },
    { mood: 3, performance: 0.2, trades: 4, day: "Wednesday" },
    { mood: 2, performance: -1.1, trades: 7, day: "Thursday" },
    { mood: 1, performance: -2.4, trades: 10, day: "Friday" },
    { mood: 4, performance: 1.5, trades: 5, day: "Monday" },
    { mood: 5, performance: 2.1, trades: 4, day: "Tuesday" },
    { mood: 3, performance: 0.5, trades: 6, day: "Wednesday" },
    { mood: 2, performance: -0.8, trades: 9, day: "Thursday" },
    { mood: 4, performance: 1.2, trades: 7, day: "Friday" },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="mood"
          name="Mood Rating"
          domain={[0, 5]}
          label={{ value: "Mood Rating", position: "bottom" }}
        />
        <YAxis
          type="number"
          dataKey="performance"
          name="Performance %"
          label={{ value: "Performance %", angle: -90, position: "left" }}
        />
        <ZAxis type="number" dataKey="trades" range={[50, 400]} name="Trades" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value, name) => {
            if (name === "Performance %") return [`${value.toFixed(2)}%`, name]
            return [value, name]
          }}
        />
        <Scatter name="Mood vs Performance" data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
