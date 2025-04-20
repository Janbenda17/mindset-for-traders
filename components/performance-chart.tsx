"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function PerformanceChart() {
  const data = [
    { day: "Mon", performance: 2.1, mood: "Optimistic" },
    { day: "Tue", performance: 1.3, mood: "Neutral" },
    { day: "Wed", performance: -0.7, mood: "Anxious" },
    { day: "Thu", performance: -1.2, mood: "Anxious" },
    { day: "Fri", performance: 1.8, mood: "Optimistic" },
  ]

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}%`, "Performance"]} labelFormatter={(label) => `Day: ${label}`} />
          <Line type="monotone" dataKey="performance" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
