import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { journalEntries, dailyTrackerEntries, morningChecks, type = "weekly" } = body

    // Prepare data summary for AI analysis
    const dataSummary = prepareDataSummary(journalEntries, dailyTrackerEntries, morningChecks)

    const prompt = buildAnalysisPrompt(dataSummary, type)

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse AI response into structured insights
    const insights = parseInsights(text)

    return NextResponse.json({ insights, rawAnalysis: text })
  } catch (error) {
    console.error("[v0] AI Insights error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

function prepareDataSummary(journalEntries: any[], dailyTrackerEntries: any[], morningChecks: any[]) {
  const recentJournal = journalEntries.slice(0, 20)
  const recentTracker = dailyTrackerEntries.slice(0, 14)
  const recentMorning = morningChecks.slice(0, 7)

  const tradeStats = {
    totalTrades: recentJournal.filter((e) => e.type === "trade").length,
    winningTrades: recentJournal.filter((e) => e.type === "trade" && e.profitLoss === "profit").length,
    losingTrades: recentJournal.filter((e) => e.type === "trade" && e.profitLoss === "loss").length,
    avgConfidence:
      recentJournal.filter((e) => e.confidence).reduce((sum, e) => sum + (e.confidence || 0), 0) /
        recentJournal.filter((e) => e.confidence).length || 0,
    avgDiscipline:
      recentJournal.filter((e) => e.discipline).reduce((sum, e) => sum + (e.discipline || 0), 0) /
        recentJournal.filter((e) => e.discipline).length || 0,
  }

  const wellbeingStats = {
    avgSleep: recentTracker.reduce((sum, e) => sum + (e.sleep || 0), 0) / recentTracker.length || 0,
    avgStress: recentTracker.reduce((sum, e) => sum + (e.stress || 0), 0) / recentTracker.length || 0,
    avgEnergy: recentTracker.reduce((sum, e) => sum + (e.energy || 0), 0) / recentTracker.length || 0,
    avgMood: recentTracker.reduce((sum, e) => sum + (e.mood || 0), 0) / recentTracker.length || 0,
  }

  const readinessStats = {
    avgReadiness: recentMorning.reduce((sum, e) => sum + (e.readinessScore || 0), 0) / recentMorning.length || 0,
    daysReady: recentMorning.filter((e) => (e.readinessScore || 0) >= 70).length,
    daysNotReady: recentMorning.filter((e) => (e.readinessScore || 0) < 70).length,
  }

  return {
    tradeStats,
    wellbeingStats,
    readinessStats,
    recentJournal: recentJournal.map((e) => ({
      date: e.date,
      type: e.type,
      profitLoss: e.profitLoss,
      confidence: e.confidence,
      discipline: e.discipline,
      mistakes: e.mistakes,
      lessons: e.lessons,
    })),
    recentTracker: recentTracker.map((e) => ({
      date: e.date,
      sleep: e.sleep,
      stress: e.stress,
      energy: e.energy,
      mood: e.mood,
    })),
  }
}

function buildAnalysisPrompt(dataSummary: any, type: string) {
  return `You are an expert trading psychology coach analyzing a trader's performance data.

DATA SUMMARY:
- Total Trades: ${dataSummary.tradeStats.totalTrades}
- Win Rate: ${dataSummary.tradeStats.totalTrades > 0 ? ((dataSummary.tradeStats.winningTrades / dataSummary.tradeStats.totalTrades) * 100).toFixed(1) : 0}%
- Average Confidence: ${dataSummary.tradeStats.avgConfidence.toFixed(1)}/10
- Average Discipline: ${dataSummary.tradeStats.avgDiscipline.toFixed(1)}/10
- Average Sleep: ${dataSummary.wellbeingStats.avgSleep.toFixed(1)} hours
- Average Stress: ${dataSummary.wellbeingStats.avgStress.toFixed(1)}/10
- Average Energy: ${dataSummary.wellbeingStats.avgEnergy.toFixed(1)}/10
- Average Readiness: ${dataSummary.readinessStats.avgReadiness.toFixed(1)}%

RECENT PATTERNS:
${JSON.stringify(dataSummary.recentJournal.slice(0, 5), null, 2)}

Provide a ${type} analysis with:
1. KEY INSIGHTS (3-5 bullet points about patterns you notice)
2. PREDICTIONS (what to expect in the next period based on current trends)
3. RECOMMENDATIONS (3-4 specific actionable steps to improve)
4. RISK FACTORS (potential issues to watch out for)
5. STRENGTHS (what the trader is doing well)

Format your response as JSON with these exact keys: keyInsights (array), predictions (array), recommendations (array), riskFactors (array), strengths (array).
Each array should contain strings.`
}

function parseInsights(text: string) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // Fallback: parse manually
    return {
      keyInsights: extractSection(text, "KEY INSIGHTS"),
      predictions: extractSection(text, "PREDICTIONS"),
      recommendations: extractSection(text, "RECOMMENDATIONS"),
      riskFactors: extractSection(text, "RISK FACTORS"),
      strengths: extractSection(text, "STRENGTHS"),
    }
  } catch (error) {
    console.error("[v0] Failed to parse insights:", error)
    return {
      keyInsights: ["Analysis completed successfully"],
      predictions: ["Continue monitoring your performance"],
      recommendations: ["Keep journaling consistently"],
      riskFactors: ["Watch for overtrading"],
      strengths: ["Consistent tracking"],
    }
  }
}

function extractSection(text: string, sectionName: string): string[] {
  const regex = new RegExp(`${sectionName}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, "i")
  const match = text.match(regex)
  if (!match) return []

  return match[1]
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter((line) => line.length > 0)
}
