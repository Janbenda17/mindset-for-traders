"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { useLanguage } from "@/contexts/language-context"

interface MoodTrendsChartProps {
  data: Array<{
    date: string
    mood: number
    confidence: number
    stress: number
  }>
}

export function MoodTrendsChart({ data }: MoodTrendsChartProps) {
  const { t } = useLanguage()

  const averageMood = data.length > 0 ? data.reduce((acc, d) => acc + d.mood, 0) / data.length : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("moodTrends")}</CardTitle>
        <CardDescription>
          {t("trackingMentalState")} • {t("averageMood")}: {averageMood.toFixed(1)}/10
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="mood"
              name={t("mood")}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))" }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              name={t("confidence")}
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))" }}
            />
            <Line
              type="monotone"
              dataKey="stress"
              name={t("stress")}
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-3))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
