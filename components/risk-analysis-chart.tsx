"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RiskAnalysisChartProps {
  data?: any[]
}

const RiskAnalysisChart = ({ data = [] }: RiskAnalysisChartProps) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Analýza rizika</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400">Žádná data k zobrazení</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart
  const chartData = data.map((item) => ({
    date: item.date,
    profitLoss: item.profitLoss,
  }))

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Analýza rizika</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
            <Area type="monotone" dataKey="profitLoss" stroke="#f472b6" fill="#f472b6" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default RiskAnalysisChart
