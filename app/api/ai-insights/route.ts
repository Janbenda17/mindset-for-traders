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
      temperature: 0.3,
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

  return `Jsi elitní trading psycholog a analytik. Analyzuješ REALNA data tradera. ODPOVIDEJ POUZE V CESTINE.

KRITICKA PRAVIDLA - NIKDY NEPORUSIT:
1. NIKDY si nevymyslej cisla, procenta ani fakta ktere NEJSOU v datech nize
2. Pokud nemas dostatek dat, rekni to primo ("Nemam dostatek dat pro tuto analyzu")
3. Kazdy insight MUSI odkazovat na konkretni cislo z dat nize
4. ZADNE vague/genericke fráze jako "zvaz zlepseni" nebo "pracuj na disciplíne"
5. Kazda doporuceni MUSI byt konkretni akce: CO presne udelat, KDY, JAK mereni uspech
6. Nepridavej cisla ktera nemas - pokud je win rate 0 protoze neni dost dat, rekni to

REALNA DATA TRADERA:
Celkem obchodu: ${dataSummary.tradeStats.totalTrades}
Vitezne: ${dataSummary.tradeStats.winningTrades} | Ztratove: ${dataSummary.tradeStats.losingTrades}
Win Rate: ${winRate}%
Prumerna sebeduvera: ${dataSummary.tradeStats.avgConfidence.toFixed(1)}/10
Prumerna disciplina: ${dataSummary.tradeStats.avgDiscipline.toFixed(1)}/10

PSYCHOLOGICKE VZORY (z reálních dat):
Revenge trading incidenty: ${psychPatterns.revengeTradingScore}
FOMO obchody: ${psychPatterns.fomoScore}
Strach (vynechane obchody s vysokou sebedůvěrou): ${psychPatterns.fearScore}
Nadmerna sebeduvera (vysoká jistota + ztrata): ${psychPatterns.overconfidenceScore}
Emocni kontrola: ${psychPatterns.emotionalControl.toFixed(1)}/10
Konzistence: ${psychPatterns.consistencyScore.toFixed(1)}/10

WELLBEING:
Prumerny spanek: ${dataSummary.wellbeingStats.avgSleep.toFixed(1)} hodin
Prumerny stres: ${dataSummary.wellbeingStats.avgStress.toFixed(1)}/10
Prumerna energie: ${dataSummary.wellbeingStats.avgEnergy.toFixed(1)}/10
Prumerna nalada: ${dataSummary.wellbeingStats.avgMood.toFixed(1)}/10
Prumerna pripravenost: ${dataSummary.readinessStats.avgReadiness.toFixed(1)}%
Dny pripraveny (70%+): ${dataSummary.readinessStats.daysReady}
Dny nepripraveny: ${dataSummary.readinessStats.daysNotReady}

METRIKY:
Risk Management: ${advancedMetrics.riskManagementScore.toFixed(1)}/100
Disciplina Index: ${advancedMetrics.disciplineIndex.toFixed(1)}/100
Predikcni outlook: ${advancedMetrics.predictedNextWeekPerformance}

POSLEDNI AKTIVITA:
${JSON.stringify(dataSummary.recentJournal.slice(0, 5), null, 2)}

UKOL: Vytvor ${type} analyzu. Kazdy bod musi odkazovat na konkretni cislo z dat vyse.

Vrat POUZE validni JSON objekt (zadny markdown, zadne code blocks):

{
  "keyInsights": [
    "3-5 postrehů. Kazdy MUSI obsahovat konkretni cislo z dat vyse. Priklad spravneho: 'Tvych ${psychPatterns.revengeTradingScore} revenge tradu naznacuje problem s emocni kontrolou po ztratach.' Priklad SPATNEHO: 'Tvuj trading se zlepsuje.' (= vague, zadne cislo)"
  ],
  "predictions": [
    "3-4 predikce. Kazda musi byt odvozena z konkretniho patternu v datech. Priklad: 'S prumernym stresem ${dataSummary.wellbeingStats.avgStress.toFixed(1)}/10 a ${psychPatterns.revengeTradingScore} revenge incidenty existuje riziko dalsich emocnich obchodu.' NIKDY nepredikuj konkretni $ castky nebo win rate ktere nemas v datech."
  ],
  "recommendations": [
    "4-6 konkretni akce. Kazda MUSI obsahovat: CO udelat + KDY + JAK merit uspech. Priklad: 'Po kazde ztrate zavedite povinnou 15min pauzu. Merit: Pocet revenge tradu by mel klesnout z ${psychPatterns.revengeTradingScore} na 0 behem 2 tydnu.' SPATNE: 'Zlepsete disciplinu.' (= nekonkretni)"
  ],
  "riskFactors": [
    "3-4 konkretni rizika s varovnymi signaly. Priklad: 'Revenge trading (aktualne ${psychPatterns.revengeTradingScore} incidentu) - varovny signal: Po ztrate citis nutkani okamzite vstoupit do dalsiho obchodu.' NIKDY nepridavej rizika ktera nejsou podlozena daty."
  ],
  "strengths": [
    "3-4 silne stranky z dat. Priklad: 'Disciplina ${dataSummary.tradeStats.avgDiscipline.toFixed(1)}/10 je nadprumerna.' Pokud trader nema dostatek dat, rekni: 'Nedostatek dat pro identifikaci silnych stranek - pokracuj v zaznamenavani.'"
  ]
}`
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
