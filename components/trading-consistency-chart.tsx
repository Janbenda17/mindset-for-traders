"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function TradingConsistencyChart() {
  const data = [
    {
      name: "Week 1",
      planAdherence: 65,
      profitability: 40,
    },
    {
      name: "Week 2",
      planAdherence: 78,
      profitability: 55,
    },
    {
      name: "Week 3",
      planAdherence: 90,
      profitability: 75,
    },
    {
      name: "Week 4",
      planAdherence: 81,
      profitability: 60,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="planAdherence" name="Plan Adherence %" fill="#8884d8" />
        <Bar dataKey="profitability" name="Profitability %" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}
