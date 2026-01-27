import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { journalEntries, dailyTrackerEntries, morningChecks, type = "weekly" } = body

    console.log("[v0] AI Insights - Analyzing data:", {
      journalCount: journalEntries?.length || 0,
      trackerCount: dailyTrackerEntries?.length || 0,
      morningCount: morningChecks?.length || 0,
      type,
    })

    // Prepare comprehensive data summary
    const dataSummary = prepareDataSummary(journalEntries, dailyTrackerEntries, morningChecks)
    
    // Detect psychological patterns
    const psychPatterns = detectPsychologicalPatterns(journalEntries, dailyTrackerEntries)
    
    // Calculate advanced metrics
    const advancedMetrics = calculateAdvancedMetrics(dataSummary, psychPatterns)

    const prompt = buildEnhancedAnalysisPrompt(dataSummary, psychPatterns, advancedMetrics, type)

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.8,
      maxTokens: 3000,
    })

    console.log("[v0] AI Insights - Raw response received, parsing...")

    // Parse AI response into structured insights
    const insights = parseInsights(text)

    console.log("[v0] AI Insights - Successfully generated:", Object.keys(insights))

    return NextResponse.json({ 
      insights, 
      rawAnalysis: text,
      metrics: advancedMetrics,
      psychPatterns 
    })
  } catch (error) {
    console.error("[v0] AI Insights error:", error)
    return NextResponse.json({ 
      error: "Failed to generate insights",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

function detectPsychologicalPatterns(journalEntries: any[], dailyTrackerEntries: any[]) {
  const patterns = {
    revengeTradingScore: 0,
    fomoScore: 0,
    fearScore: 0,
    overconfidenceScore: 0,
    emotionalControl: 0,
    consistencyScore: 0,
  }

  // Detect revenge trading: losses followed by increased position size
  const trades = journalEntries.filter((e) => e.type === "trade")
  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1]
    const currTrade = trades[i]
    if (prevTrade.profitLoss === "loss" && currTrade.riskAmount > prevTrade.riskAmount * 1.5) {
      patterns.revengeTradingScore += 1
    }
  }

  // Detect FOMO: entries with low confidence but high risk
  const fomoTrades = trades.filter((t) => (t.confidence || 0) < 5 && (t.riskAmount || 0) > 100)
  patterns.fomoScore = fomoTrades.length

  // Detect fear: missed opportunities with high confidence
  const fearEntries = journalEntries.filter(
    (e) => e.type === "missed" && (e.confidence || 0) > 7
  )
  patterns.fearScore = fearEntries.length

  // Overconfidence: High confidence followed by losses
  let overconfidentLosses = 0
  trades.forEach((t) => {
    if ((t.confidence || 0) > 8 && t.profitLoss === "loss") {
      overconfidentLosses++
    }
  })
  patterns.overconfidenceScore = overconfidentLosses

  // Emotional control from daily tracker
  const stressLevels = dailyTrackerEntries.map((e) => e.stress || 0)
  patterns.emotionalControl = stressLevels.length > 0 
    ? 10 - (stressLevels.reduce((sum, s) => sum + s, 0) / stressLevels.length)
    : 5

  // Consistency: variance in confidence levels
  const confidenceLevels = trades.map((t) => t.confidence || 5)
  const avgConfidence = confidenceLevels.reduce((sum, c) => sum + c, 0) / (confidenceLevels.length || 1)
  const variance = confidenceLevels.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / (confidenceLevels.length || 1)
  patterns.consistencyScore = Math.max(0, 10 - variance)

  return patterns
}

function calculateAdvancedMetrics(dataSummary: any, psychPatterns: any) {
  return {
    performanceScore: calculatePerformanceScore(dataSummary),
    psychologicalHealth: calculatePsychHealth(psychPatterns),
    riskManagementScore: calculateRiskScore(dataSummary),
    disciplineIndex: calculateDisciplineIndex(dataSummary),
    predictedNextWeekPerformance: predictPerformance(dataSummary, psychPatterns),
  }
}

function calculatePerformanceScore(dataSummary: any): number {
  const winRate = dataSummary.tradeStats.totalTrades > 0 
    ? (dataSummary.tradeStats.winningTrades / dataSummary.tradeStats.totalTrades) * 100
    : 0
  const avgConfidence = dataSummary.tradeStats.avgConfidence
  const avgDiscipline = dataSummary.tradeStats.avgDiscipline
  
  return ((winRate / 100) * 40 + (avgConfidence / 10) * 30 + (avgDiscipline / 10) * 30)
}

function calculatePsychHealth(psychPatterns: any): number {
  const negativeFactors = 
    psychPatterns.revengeTradingScore +
    psychPatterns.fomoScore +
    psychPatterns.fearScore +
    psychPatterns.overconfidenceScore
  
  const positiveFactors = psychPatterns.emotionalControl + psychPatterns.consistencyScore
  
  return Math.max(0, Math.min(100, (positiveFactors / 20) * 100 - (negativeFactors * 5)))
}

function calculateRiskScore(dataSummary: any): number {
  // Based on consistency of risk management
  return dataSummary.tradeStats.avgDiscipline * 10
}

function calculateDisciplineIndex(dataSummary: any): number {
  return dataSummary.tradeStats.avgDiscipline * 10
}

function predictPerformance(dataSummary: any, psychPatterns: any): string {
  const recentTrend = dataSummary.tradeStats.winningTrades / (dataSummary.tradeStats.totalTrades || 1)
  const psychHealth = calculatePsychHealth(psychPatterns)
  
  if (recentTrend > 0.6 && psychHealth > 70) {
    return "STRONG_POSITIVE"
  } else if (recentTrend > 0.5 && psychHealth > 60) {
    return "POSITIVE"
  } else if (recentTrend < 0.4 || psychHealth < 40) {
    return "NEEDS_ATTENTION"
  } else {
    return "NEUTRAL"
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

function buildEnhancedAnalysisPrompt(dataSummary: any, psychPatterns: any, advancedMetrics: any, type: string) {
  const winRate = dataSummary.tradeStats.totalTrades > 0 
    ? ((dataSummary.tradeStats.winningTrades / dataSummary.tradeStats.totalTrades) * 100).toFixed(1)
    : 0

  return `You are an elite trading psychology coach and performance analyst with expertise in behavioral finance and cognitive biases. Analyze this trader's comprehensive performance data.

📊 TRADING PERFORMANCE:
- Total Trades: ${dataSummary.tradeStats.totalTrades}
- Win Rate: ${winRate}%
- Average Confidence: ${dataSummary.tradeStats.avgConfidence.toFixed(1)}/10
- Average Discipline: ${dataSummary.tradeStats.avgDiscipline.toFixed(1)}/10
- Performance Score: ${advancedMetrics.performanceScore.toFixed(1)}/100

🧠 PSYCHOLOGICAL ANALYSIS:
- Revenge Trading Score: ${psychPatterns.revengeTradingScore} (lower is better)
- FOMO Score: ${psychPatterns.fomoScore} (lower is better)
- Fear Score: ${psychPatterns.fearScore} (lower is better)
- Overconfidence Score: ${psychPatterns.overconfidenceScore} (lower is better)
- Emotional Control: ${psychPatterns.emotionalControl.toFixed(1)}/10
- Consistency Score: ${psychPatterns.consistencyScore.toFixed(1)}/10
- Psychological Health: ${advancedMetrics.psychologicalHealth.toFixed(1)}/100

💪 WELL-BEING METRICS:
- Average Sleep: ${dataSummary.wellbeingStats.avgSleep.toFixed(1)} hours
- Average Stress: ${dataSummary.wellbeingStats.avgStress.toFixed(1)}/10
- Average Energy: ${dataSummary.wellbeingStats.avgEnergy.toFixed(1)}/10
- Average Mood: ${dataSummary.wellbeingStats.avgMood.toFixed(1)}/10
- Average Morning Readiness: ${dataSummary.readinessStats.avgReadiness.toFixed(1)}%
- Days Ready: ${dataSummary.readinessStats.daysReady}
- Days Not Ready: ${dataSummary.readinessStats.daysNotReady}

📈 RISK & DISCIPLINE:
- Risk Management Score: ${advancedMetrics.riskManagementScore.toFixed(1)}/100
- Discipline Index: ${advancedMetrics.disciplineIndex.toFixed(1)}/100

🔮 PERFORMANCE PREDICTION:
- Next Week Outlook: ${advancedMetrics.predictedNextWeekPerformance}

📝 RECENT ACTIVITY (Last 5 entries):
${JSON.stringify(dataSummary.recentJournal.slice(0, 5), null, 2)}

🎯 ANALYSIS TASK:
Provide a deep ${type} psychological and performance analysis. Be specific, actionable, and insightful.

Return ONLY a valid JSON object (no markdown, no code blocks) with these exact keys:

{
  "keyInsights": [
    "3-5 specific, data-driven insights about patterns, correlations between psychology and performance, hidden trends"
  ],
  "predictions": [
    "3-4 evidence-based predictions for the next period, including confidence level and reasoning"
  ],
  "recommendations": [
    "4-6 highly specific, actionable recommendations prioritized by impact. Include what, why, and how"
  ],
  "riskFactors": [
    "3-4 specific psychological or behavioral risks to monitor, with early warning signs"
  ],
  "strengths": [
    "3-4 specific strengths to leverage and build upon, with examples from data"
  ]
}

Focus on:
- Connecting psychological patterns to trading outcomes
- Identifying cognitive biases affecting decisions
- Correlations between well-being and performance
- Specific behavioral interventions
- Predictive insights based on historical patterns`
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
