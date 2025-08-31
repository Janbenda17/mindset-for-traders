import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", mood: 4, performance: 1500 },
  { month: "Feb", mood: 3, performance: 800 },
  { month: "Mar", mood: 5, performance: 2200 },
  { month: "Apr", mood: 2, performance: -500 },
  { month: "May", mood: 4, performance: 1800 },
  { month: "Jun", mood: 3, performance: 1000 },
]

export function MoodPerformanceCorrelation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Korelace nálady a výkonu</CardTitle>
        <CardDescription>Vztah mezi vaší náladou a obchodními výsledky.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="mood" fill="#8884d8" name="Průměrná nálada (1-5)" />
            <Bar yAxisId="right" dataKey="performance" fill="#82ca9d" name="Zisk/Ztráta ($)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
