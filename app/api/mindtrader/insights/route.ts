import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { trades, journals, moodHistory, readinessFactors } = await request.json()

    // Calculate insights based on data
    const insights = generateInsights(trades, journals, moodHistory, readinessFactors)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

function generateInsights(trades: any[], journals: any[], moodHistory: any[], readinessFactors: any) {
  const insights = []

  // Analyze win rate
  const totalTrades = trades.length
  const winningTrades = trades.filter((t) => (t.pnl || 0) > 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  insights.push(`📊 **What's Happening:**`)
  insights.push(`Your win rate over the last 30 trades is ${winRate.toFixed(1)}%.`)

  // Analyze mood correlation
  const avgMood = moodHistory.reduce((sum, m) => sum + m.mood, 0) / (moodHistory.length || 1)
  if (avgMood < 6) {
    insights.push(`\n🧠 **Why It's Happening:**`)
    insights.push(`Your average mood is ${avgMood.toFixed(1)}/10, which may be affecting decision-making.`)
  }

  // Analyze readiness factors
  if (readinessFactors.sleep < 6) {
    insights.push(`\n⚠️ **Sleep Impact:**`)
    insights.push(
      `Your sleep score is ${readinessFactors.sleep}/10. Consider prioritizing rest - it significantly impacts trading performance.`,
    )
  }

  if (readinessFactors.stress > 7) {
    insights.push(`\n😰 **Stress Alert:**`)
    insights.push(
      `Your stress level is ${readinessFactors.stress}/10. High stress correlates with impulsive decisions. Try stress management techniques.`,
    )
  }

  // Recommendations
  insights.push(`\n🎯 **What To Do Next:**`)
  if (winRate < 50) {
    insights.push(`- Focus on quality over quantity - reduce the number of trades`)
    insights.push(`- Review your trading plan and ensure you're following it`)
    insights.push(`- Consider taking a break if you've had 3+ consecutive losses`)
  } else {
    insights.push(`- Continue your current approach - it's working well`)
    insights.push(`- Document what's working in your journal`)
    insights.push(`- Stay disciplined and don't increase risk`)
  }

  if (avgMood < 6) {
    insights.push(`- Practice daily mood journaling to identify patterns`)
    insights.push(`- Consider mindfulness or meditation before trading sessions`)
  }

  return insights.join("\n")
}
