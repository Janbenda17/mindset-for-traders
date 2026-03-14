export interface AnalyticsData {
  trades: any[]
  morningChecks: any[]
  journalEntries: any[]
  dailyTrackerEntries?: any[]
  tradingPlans?: any[]
  dailyIntentions?: any[]
  tradingRoutines?: any[]
}

export interface ComputedAnalytics {
  summary: {
    totalTrades: number
    winRate: number
    totalPnL: number
    averageWin: number
    averageLoss: number
    avgReadiness: number
    avgMood: number
    bestDay: any
    worstDay: any
  }
  psychology: {
    readinessCorrelation: number
    moodCorrelation: number
    disciplineScore: number
    consistencyScore: number
    revengeIncidents: number
  }
  progression: {
    currentDay: number
    daysCompleted: number
    todayComplete: boolean
    morningCheckDone: boolean
    tradesRecorded: number
    canAdvance: boolean
    isUnlocked: boolean
    requirementsText: string[]
  }
  stages: {
    shouldUnlockStage2: boolean
    shouldUnlockStage3: boolean
    shouldUnlockStage4: boolean
    shouldUnlockStage5: boolean
  }
  weeklyInsights: {
    bestPerformingDay: string
    worstPerformingDay: string
    commonMistake: string
    readinessVsResults: string
    nextWeekFocus: string[]
  }
  psychologicalProfile: Array<{ subject: string; A: number }>
  psychInsights: Array<{
    type: "success" | "warning" | "critical"
    icon: string
    title: string
    description: string
    action: string
    impact: string
  }>
  emotionalPatterns: Array<{
    name: string
    emoji: string
    count: number
    impact: number
    color: string
    severity: "low" | "medium" | "high" | "critical"
    description: string
    recommendation: string
  }>
  actionPlan: Array<{
    priority: "low" | "medium" | "high" | "critical"
    emoji: string
    title: string
    description: string
    action: string
    impact: string
  }>
}

export function computeAnalytics(data: AnalyticsData): ComputedAnalytics {
  const { 
    trades = [], 
    morningChecks = [], 
    journalEntries = [],
    dailyTrackerEntries = [],
    tradingPlans = [],
    dailyIntentions = [],
    tradingRoutines = []
  } = data

  console.log("[v0] [Analytics Engine] Computing analytics with:", {
    trades: trades.length,
    morningChecks: morningChecks.length,
    journalEntries: journalEntries.length,
    tradingPlans: tradingPlans.length,
    dailyIntentions: dailyIntentions.length,
  })

  // Summary calculations
  const wins = trades.filter((t) => (t.pnl || 0) > 0)
  const losses = trades.filter((t) => (t.pnl || 0) < 0)
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0

  const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length) : 0

  // Readiness & mood calculations
  // Readiness se počítá z morning checks (sleep, energy, focus, stress)
  const morningChecksWithReadiness = morningChecks.filter((mc) => mc.score !== undefined)
  const avgReadiness =
    morningChecksWithReadiness.length > 0
      ? morningChecksWithReadiness.reduce((sum, mc) => sum + (mc.score || 0), 0) / morningChecksWithReadiness.length
      : 0

  // Mood z morning checks
  const morningChecksWithMood = morningChecks.filter((mc) => mc.emotionalState !== undefined)
  const avgMood =
    morningChecksWithMood.length > 0
      ? morningChecksWithMood.reduce((sum, mc) => sum + (mc.emotionalState || 0), 0) / morningChecksWithMood.length
      : 0

  // Find best/worst days
  const tradesByDay: { [key: string]: any[] } = {}
  trades.forEach((trade) => {
    const date = trade.date || trade.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
    if (!tradesByDay[date]) tradesByDay[date] = []
    tradesByDay[date].push(trade)
  })

  // Psychology metrics - correlation of readiness with results
  // Map morning checks to trades by date to determine readiness on trading day
  const dailyReadiness: { [key: string]: number } = {}
  morningChecks.forEach((mc) => {
    const date = mc.date || new Date().toISOString().split("T")[0]
    dailyReadiness[date] = mc.score || 0
  })

  const dailyPnL = Object.entries(tradesByDay).map(([date, dayTrades]) => ({
    date,
    pnl: dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
    readiness: dailyReadiness[date] || 0, // Take readiness from morning check for that day
  }))

  const bestDay = dailyPnL.reduce((best, day) => (day.pnl > best.pnl ? day : best), { date: "", pnl: 0, readiness: 0 })
  const worstDay = dailyPnL.reduce((worst, day) => (day.pnl < worst.pnl ? day : worst), {
    date: "",
    pnl: 0,
    readiness: 0,
  })

  // Categorize trades by readiness on trading day
  const highReadinessTrades = trades.filter((t) => {
    const date = t.date || t.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
    return (dailyReadiness[date] || 0) >= 70
  })
  const lowReadinessTrades = trades.filter((t) => {
    const date = t.date || t.created_at?.split("T")[0] || new Date().toISOString().split("T")[0]
    return (dailyReadiness[date] || 0) < 70
  })

  const highReadinessPnL =
    highReadinessTrades.length > 0
      ? highReadinessTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / highReadinessTrades.length
      : 0
  const lowReadinessPnL =
    lowReadinessTrades.length > 0
      ? lowReadinessTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / lowReadinessTrades.length
      : 0

  const readinessCorrelation = highReadinessPnL - lowReadinessPnL

  const highMoodTrades = trades.filter((t) => (t.mood || 0) >= 70)
  const lowMoodTrades = trades.filter((t) => (t.mood || 0) < 70)
  const highMoodPnL =
    highMoodTrades.length > 0 ? highMoodTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / highMoodTrades.length : 0
  const lowMoodPnL =
    lowMoodTrades.length > 0 ? lowMoodTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / lowMoodTrades.length : 0
  const moodCorrelation = highMoodPnL - lowMoodPnL

  const disciplinedTrades = trades.filter((t) => t.followedPlan === true || t.followedPlan === "yes")
  const disciplineScore = trades.length > 0 ? (disciplinedTrades.length / trades.length) * 100 : 0

  // Detect revenge trading (3+ trades in short time after a loss)
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime(),
  )
  let revengeIncidents = 0
  for (let i = 0; i < sortedTrades.length - 2; i++) {
    if ((sortedTrades[i].pnl || 0) < 0) {
      const lossTime = new Date(sortedTrades[i].created_at || sortedTrades[i].date).getTime()
      const next2Hours = [sortedTrades[i + 1], sortedTrades[i + 2]]
      const quickTrades = next2Hours.filter((t) => {
        const tradeTime = new Date(t.created_at || t.date).getTime()
        return tradeTime - lossTime < 2 * 60 * 60 * 1000 // 2 hours
      })
      if (quickTrades.length >= 2) revengeIncidents++
    }
  }

  const consistencyScore = winRate > 45 && winRate < 65 ? 100 : Math.max(0, 100 - Math.abs(winRate - 55) * 2)

  // Stage progression conditions
  const shouldUnlockStage2 = morningChecks.length > 0
  const shouldUnlockStage3 = shouldUnlockStage2 && journalEntries.some((j) => j.type === "intention")
  const shouldUnlockStage4 = shouldUnlockStage3 && trades.length > 0
  const shouldUnlockStage5 = shouldUnlockStage4 && trades.length > 0

  // Weekly insights (last 7 days)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last7DaysTrades = trades.filter((t) => {
    const tradeDate = new Date(t.date || t.created_at)
    return tradeDate >= sevenDaysAgo && tradeDate <= now
  })

  const weekdayPnL: { [key: string]: number[] } = {}
  last7DaysTrades.forEach((trade) => {
    const day = new Date(trade.date || trade.created_at).toLocaleDateString("en-US", { weekday: "long" })
    if (!weekdayPnL[day]) weekdayPnL[day] = []
    weekdayPnL[day].push(trade.pnl || 0)
  })

  const weekdayAverages = Object.entries(weekdayPnL).map(([day, pnls]) => ({
    day,
    avgPnL: pnls.reduce((sum, p) => sum + p, 0) / pnls.length,
  }))

  const bestPerformingDay =
    weekdayAverages.length > 0
      ? weekdayAverages.reduce((best, curr) => (curr.avgPnL > best.avgPnL ? curr : best)).day
      : "N/A"
  const worstPerformingDay =
    weekdayAverages.length > 0
      ? weekdayAverages.reduce((worst, curr) => (curr.avgPnL < worst.avgPnL ? curr : worst)).day
      : "N/A"

  let commonMistake = "No data yet"
  if (revengeIncidents > 0) commonMistake = `Revenge trading (${revengeIncidents} incidents)`
  else if (avgReadiness < 65) commonMistake = "Trading with low readiness"
  else if (disciplineScore < 50) commonMistake = "Not following trading plan"

  const readinessVsResults =
    avgReadiness >= 70 && winRate >= 50
      ? "Strong correlation: High readiness = Better results"
      : avgReadiness < 65 && winRate < 50
        ? "Warning: Low readiness correlates with losses"
        : "Moderate correlation between readiness and performance"

  const nextWeekFocus = []
  if (avgReadiness < 75) nextWeekFocus.push("Increase average readiness to 75%+")
  if (winRate < 50) nextWeekFocus.push("Improve win rate - focus on A+ setups only")
  if (revengeIncidents > 0) nextWeekFocus.push("Eliminate revenge trading - implement 30min pause after losses")
  if (nextWeekFocus.length === 0) nextWeekFocus.push("Maintain current performance and consistency")

  // Progression tracking for 10-day system
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
  const last10DaysTrades = trades.filter((t) => {
    const tradeDate = new Date(t.date || t.created_at)
    return tradeDate >= tenDaysAgo && tradeDate <= now
  })

  const currentDay = new Date().getDate()
  const daysCompleted =
    last10DaysTrades.length > 0
      ? Math.max(...last10DaysTrades.map((t) => new Date(t.date || t.created_at).getDate()))
      : 0
  const todayComplete = last10DaysTrades.some((t) => new Date(t.date || t.created_at).getDate() === currentDay)
  const morningCheckDone = morningChecks.some((mc) => new Date(mc.date).getDate() === currentDay)
  const tradesRecorded = last10DaysTrades.filter(
    (t) => new Date(t.date || t.created_at).getDate() === currentDay,
  ).length
  const canAdvance = todayComplete
  const isUnlocked = daysCompleted >= 10
  const requirementsText = []

  if (!morningCheckDone) requirementsText.push("Complete morning check")
  if (tradesRecorded === 0) requirementsText.push("Record trades for today")

  return {
    summary: {
      totalTrades: trades.length,
      winRate,
      totalPnL,
      averageWin: avgWin,
      averageLoss: avgLoss,
      avgReadiness,
      avgMood,
      bestDay,
      worstDay,
    },
    psychology: {
      readinessCorrelation,
      moodCorrelation,
      disciplineScore,
      consistencyScore,
      revengeIncidents,
    },
    progression: {
      currentDay,
      daysCompleted,
      todayComplete,
      morningCheckDone,
      tradesRecorded,
      canAdvance,
      isUnlocked,
      requirementsText,
    },
    stages: {
      shouldUnlockStage2,
      shouldUnlockStage3,
      shouldUnlockStage4,
      shouldUnlockStage5,
    },
    weeklyInsights: {
      bestPerformingDay,
      worstPerformingDay,
      commonMistake,
      readinessVsResults,
      nextWeekFocus,
    },
    // Added psychological insights and patterns from real data
    psychologicalProfile: [
      { subject: "Discipline", A: Math.round(disciplineScore) },
      { subject: "Consistency", A: Math.round(consistencyScore) },
      { subject: "Stress", A: Math.max(0, 100 - (revengeIncidents * 10)) }, // Lower is better
      { subject: "Readiness", A: Math.round(avgReadiness) },
      { subject: "Mood", A: Math.round(avgMood) },
      { subject: "Concentration", A: Math.round(Math.max(0, 100 - (trades.length > 0 ? (revengeIncidents / trades.length * 100) : 0))) },
      { subject: "Risk Management", A: Math.round(100 - Math.abs(winRate - 55) * 0.5) },
      { subject: "Confidence", A: Math.round(Math.min(100, winRate)) },
    ],
    psychInsights: [
      // Generate insights based on real metrics
      ...(disciplineScore > 80
        ? [{
            type: "success" as const,
            icon: "🎯",
            title: "Discipline at High Level",
            description: `You follow the plan in ${Math.round(disciplineScore)}% of trades - that's excellent!`,
            action: "Keep up this pace!",
            impact: "positive" as const,
          }]
        : []),
      ...(revengeIncidents > 2
        ? [{
            type: "critical" as const,
            icon: "😤",
            title: "CRITICAL: Revenge trading pattern!",
            description: `We detected ${revengeIncidents} revenge trading incidents. This costs you money.`,
            action: "STOP: After 2 consecutive losses, take a 30 minute break!",
            impact: "critical" as const,
          }]
        : []),
      ...(avgReadiness < 60
        ? [{
            type: "warning" as const,
            icon: "😴",
            title: "Low readiness = worse results",
            description: `Your average readiness is ${Math.round(avgReadiness)}%. Should be 70%+`,
            action: "Improve sleep and morning routine - it's critical!",
            impact: "high" as const,
          }]
        : []),
    ],
    emotionalPatterns: [
      // Generate patterns based on analysis
      ...(revengeIncidents > 0
        ? [{
            name: "Revenge Trading",
            emoji: "😤",
            count: revengeIncidents,
            impact: -(revengeIncidents * 1000),
            color: "#dc2626",
            severity: revengeIncidents > 3 ? "critical" : "high",
            description: "Attempt to quickly recover losses - most dangerous pattern",
            recommendation: "STOP trading after 2 losses. Minimum 30min break.",
          }]
        : []),
      ...(disciplineScore < 50
        ? [{
            name: "Undisciplined Trading",
            emoji: "📉",
            count: Math.round((1 - disciplineScore / 100) * trades.length),
            impact: -(Math.round((1 - disciplineScore / 100) * trades.length * 500)),
            color: "#f97316",
            severity: "high",
            description: "Trading without following your plan",
            recommendation: "Create and stick to your trading plan!",
          }]
        : []),
    ],
    actionPlan: [
      ...(revengeIncidents > 0
        ? [{
            priority: "critical" as const,
            emoji: "⛔",
            title: "STOP REVENGE TRADING",
            description: `${revengeIncidents} incidents detected. System to stop:`,
            action: "After 2 losses: PAUSE 30min, take a walk, clear your head.",
            impact: `Potential savings: $${revengeIncidents * 2000}`,
          }]
        : []),
      ...(disciplineScore < 70
        ? [{
            priority: "high" as const,
            emoji: "🎯",
            title: "Improve Discipline",
            description: `You follow the plan in ${Math.round(disciplineScore)}% of trades. Target: 85%+`,
            action: "Every trade must meet 3 criteria of your plan.",
            impact: "Potential increase: +15% P&L",
          }]
        : []),
      ...(avgReadiness < 70
        ? [{
            priority: "high" as const,
            emoji: "😴",
            title: "Improve Morning Readiness",
            description: `Your readiness: ${Math.round(avgReadiness)}%. Should be 75%+`,
            action: "Sleep 7-8h, morning routine 20min (meditation/exercise)",
            impact: "Correlation: +readiness = +better decisions",
          }]
        : []),
    ],
  }
}
