"use client"

import { useMemo } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

interface EmotionalAnalysisProps {
  data: any[]
}

export function EmotionalAnalysis({ data }: EmotionalAnalysisProps) {
  const analysisData = useMemo(() => {
    if (!data || data.length === 0) return { correlationData: [], insights: [] }

    // Correlation between emotions and performance
    const correlationData = data
      .filter((entry) => entry.profitLoss !== undefined && entry.confidenceLevel && entry.stressLevel)
      .map((entry) => ({
        confidence: entry.confidenceLevel,
        stress: entry.stressLevel,
        profitLoss: entry.profitLoss,
        mood: entry.mood || 5,
        size: Math.abs(entry.profitLoss) / 10 + 5, // Size based on trade size
      }))

    // Generate insights
    const insights = []

    // High confidence vs performance
    const highConfidenceTrades = data.filter((e) => e.confidenceLevel >= 8)
    const highConfidenceWinRate =
      highConfidenceTrades.length > 0
        ? (highConfidenceTrades.filter((e) => e.profitLoss > 0).length / highConfidenceTrades.length) * 100
        : 0

    if (highConfidenceWinRate > 70) {
      insights.push({
        type: "positive",
        title: "Vysoká sebedůvěra = Úspěch",
        description: `Při vysoké sebedůvěře (8+) máte ${highConfidenceWinRate.toFixed(0)}% úspěšnost`,
      })
    }

    // High stress vs performance
    const highStressTrades = data.filter((e) => e.stressLevel >= 8)
    const highStressWinRate =
      highStressTrades.length > 0
        ? (highStressTrades.filter((e) => e.profitLoss > 0).length / highStressTrades.length) * 100
        : 0

    if (highStressWinRate < 40) {
      insights.push({
        type: "warning",
        title: "Vysoký stres škodí",
        description: `Při vysokém stresu (8+) máte pouze ${highStressWinRate.toFixed(0)}% úspěšnost`,
      })
    }

    // Mood correlation
    const goodMoodTrades = data.filter((e) => e.mood >= 7)
    const goodMoodWinRate =
      goodMoodTrades.length > 0
        ? (goodMoodTrades.filter((e) => e.profitLoss > 0).length / goodMoodTrades.length) * 100
        : 0

    if (goodMoodWinRate > 60) {
      insights.push({
        type: "positive",
        title: "Dobrá nálada pomáhá",
        description: `V dobré náladě (7+) máte ${goodMoodWinRate.toFixed(0)}% úspěšnost`,
      })
    }

    return { correlationData, insights }
  }, [data])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Žádná data pro zobrazení</div>
  }

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="confidence" name="Sebedůvěra" domain={[0, 10]} fontSize={12} />
            <YAxis type="number" dataKey="stress" name="Stres" domain={[0, 10]} fontSize={12} />
            <Tooltip
              formatter={(value: any, name: string) => [`${value}/10`, name === "confidence" ? "Sebedůvěra" : "Stres"]}
              labelFormatter={() => ""}
            />
            <Scatter
              data={analysisData.correlationData}
              fill={(entry: any) => (entry.profitLoss >= 0 ? "#10b981" : "#ef4444")}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <h5 className="font-medium">Emocionální pozorování</h5>
        <div className="space-y-2">
          {analysisData.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              <Badge variant={insight.type === "positive" ? "default" : "destructive"} className="mt-0.5">
                {insight.type === "positive" ? "✓" : "⚠"}
              </Badge>
              <div>
                <div className="font-medium text-sm">{insight.title}</div>
                <div className="text-sm text-muted-foreground">{insight.description}</div>
              </div>
            </div>
          ))}
          {analysisData.insights.length === 0 && (
            <div className="text-sm text-muted-foreground">Potřebujete více dat pro emocionální analýzu</div>
          )}
        </div>
      </div>
    </div>
  )
}
