"use client"

import { useMemo } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

interface EmotionalAnalysisProps {
  data?: any[]
}

export function EmotionalAnalysis({ data = [] }: EmotionalAnalysisProps) {
  const analysisData = useMemo(() => {
    // Always return safe default structure
    const safeData = Array.isArray(data) ? data : []

    if (safeData.length === 0) {
      return { correlationData: [], insights: [] }
    }

    // Correlation between emotions and performance
    const correlationData = safeData
      .filter((entry) => {
        return (
          entry &&
          typeof entry === "object" &&
          typeof entry.profitLoss === "number" &&
          typeof entry.confidenceLevel === "number" &&
          typeof entry.stressLevel === "number"
        )
      })
      .map((entry) => ({
        confidence: entry.confidenceLevel,
        stress: entry.stressLevel,
        profitLoss: entry.profitLoss,
        mood: typeof entry.mood === "number" ? entry.mood : 5,
        size: Math.abs(entry.profitLoss) / 10 + 5,
      }))

    // Generate insights
    const insights = []

    // High confidence vs performance
    const highConfidenceTrades = safeData.filter(
      (e) => e && typeof e.confidenceLevel === "number" && e.confidenceLevel >= 8,
    )
    const highConfidenceWinRate =
      highConfidenceTrades.length > 0
        ? (highConfidenceTrades.filter((e) => e && typeof e.profitLoss === "number" && e.profitLoss > 0).length /
            highConfidenceTrades.length) *
          100
        : 0

    if (highConfidenceWinRate > 70) {
      insights.push({
        type: "positive",
        title: "Vysoká sebedůvěra = Úspěch",
        description: `Při vysoké sebedůvěře (8+) máte ${highConfidenceWinRate.toFixed(0)}% úspěšnost`,
      })
    }

    // High stress vs performance
    const highStressTrades = safeData.filter((e) => e && typeof e.stressLevel === "number" && e.stressLevel >= 8)
    const highStressWinRate =
      highStressTrades.length > 0
        ? (highStressTrades.filter((e) => e && typeof e.profitLoss === "number" && e.profitLoss > 0).length /
            highStressTrades.length) *
          100
        : 0

    if (highStressWinRate < 40 && highStressTrades.length > 0) {
      insights.push({
        type: "warning",
        title: "Vysoký stres škodí",
        description: `Při vysokém stresu (8+) máte pouze ${highStressWinRate.toFixed(0)}% úspěšnost`,
      })
    }

    // Mood correlation
    const goodMoodTrades = safeData.filter((e) => e && typeof e.mood === "number" && e.mood >= 7)
    const goodMoodWinRate =
      goodMoodTrades.length > 0
        ? (goodMoodTrades.filter((e) => e && typeof e.profitLoss === "number" && e.profitLoss > 0).length /
            goodMoodTrades.length) *
          100
        : 0

    if (goodMoodWinRate > 60 && goodMoodTrades.length > 0) {
      insights.push({
        type: "positive",
        title: "Dobrá nálada pomáhá",
        description: `V dobré náladě (7+) máte ${goodMoodWinRate.toFixed(0)}% úspěšnost`,
      })
    }

    return { correlationData, insights }
  }, [data])

  // Always show the component, even with empty data
  return (
    <div className="space-y-4">
      {analysisData.correlationData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="confidence" name="Sebedůvěra" domain={[0, 10]} fontSize={12} />
              <YAxis type="number" dataKey="stress" name="Stres" domain={[0, 10]} fontSize={12} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `${value}/10`,
                  name === "confidence" ? "Sebedůvěra" : "Stres",
                ]}
                labelFormatter={() => ""}
              />
              <Scatter data={analysisData.correlationData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-sm text-gray-500">Žádná data pro analýzu</p>
            <p className="text-xs text-gray-400">Přidejte obchody s emocionálními daty</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h5 className="font-medium">Emocionální pozorování</h5>
        <div className="space-y-2">
          {analysisData.insights.length > 0 ? (
            analysisData.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant={insight.type === "positive" ? "default" : "destructive"} className="mt-0.5">
                  {insight.type === "positive" ? "✓" : "⚠"}
                </Badge>
                <div>
                  <div className="font-medium text-sm">{insight.title}</div>
                  <div className="text-sm text-muted-foreground">{insight.description}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
              Potřebujete více dat pro emocionální analýzu. Začněte přidávat obchody s informacemi o náladě, sebedůvěře
              a stresu.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
