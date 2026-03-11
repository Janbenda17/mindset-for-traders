"use client"

// import { Label } from "@/components/ui/label" // Removed

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { Brain, Target, CheckCircle2, Zap, Heart, Sparkles, Clock, Smile, Activity, TrendingUpIcon, TrendingUp, DollarSign, ThumbsUp, ThumbsDown, Flame, Wind, TrendingDown, ArrowUp, ArrowDown, BarChart3, Sun, Moon, Sunrise, Sunset, CloudRain, Award, XCircle, RefreshCw, Percent, TrendingDown as TrendingUpDown, Clipboard, CheckCircle } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Bar,
  Cell,
  AreaChart, // Imported for updates
  BarChart, // Imported for updates
} from "recharts"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context" // Added
import { useRouter } from "next/navigation" // Added for navigation
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useAnalytics } from "@/contexts/analytics-context" // Updated: useAnalytics hook
import { useLiveMode } from "@/contexts/live-mode-context" // CHANGE: get isLiveMode from useLiveMode hook instead
import { useData } from "@/contexts/data-context" // Added for accessing trades and morningChecks
import { MorningAssessment } from "@/components/morning-assessment"
import { RecordTrades } from "@/components/record-trades"

// Custom Tooltip with better formatting
const CustomTooltip = ({ active, payload, label, type = "default" }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-purple-500/40 rounded-lg p-4 shadow-2xl">
      <p className="text-white font-bold mb-3 text-base">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300 text-sm font-medium">{entry.name}:</span>
          </div>
          <span className="text-white font-bold text-base">
            {type === "currency"
              ? `${entry.value >= 0 ? "+" : ""}$${entry.value.toFixed(0)}`
              : type === "percent"
                ? `${entry.value.toFixed(0)}%`
                : type === "mixed" // Handle mixed currency and percentage values
                  ? entry.name.toLowerCase().includes("p&l")
                    ? `${entry.value >= 0 ? "+" : ""}$${entry.value.toFixed(0)}`
                    : `${entry.value.toFixed(0)}%`
                  : entry.value.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Generate demo data with proper date formatting
function generateDemoData(tradingStyle: string, isEn: boolean) {
  const weeks = 12
  const weeklyPerformanceData = []
  const dailyMoodData = []
  const cumulativePnL = 10000

  const demoData = {
    // Generate demo trades for analysis
    trades: Array.from({ length: 60 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (60 - i))
      const pnl = Math.floor(Math.random() * 2000) - 500
      return {
        id: `demo-trade-${i}`,
        date: date.toISOString(),
        symbol: ["EURUSD", "GBPUSD", "USDJPY"][Math.floor(Math.random() * 3)],
        type: Math.random() > 0.5 ? "long" : "short",
        pnl: pnl,
        followedPlan: pnl > 0,
        mood: Math.floor(Math.random() * 40) + 50,
        confidenceBefore: Math.floor(Math.random() * 35) + 50,
        stressLevel: Math.floor(Math.random() * 25) + 20,
      }
    }),
    moodData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (30 - i))
      return {
        date: date.toISOString().split('T')[0],
        mood: Math.floor(Math.random() * 40) + 50,
        confidence: Math.floor(Math.random() * 35) + 50,
        stress: Math.floor(Math.random() * 25) + 20,
        energy: Math.floor(Math.random() * 40) + 45,
        discipline: Math.floor(Math.random() * 40) + 50,
        sleep: Math.floor(Math.random() * 3) + 6,
      }
    }),
    weeklyPerformanceData: [
      { week: "1-7 Led", pnl: 2450, trades: 12, winRate: 58, avgMood: 68, avgReadiness: 72 },
      { week: "8-14 Led", pnl: -890, trades: 15, winRate: 40, avgMood: 52, avgReadiness: 58 },
      { week: "15-21 Led", pnl: 3780, trades: 18, winRate: 67, avgMood: 75, avgReadiness: 80 },
      { week: "22-28 Led", pnl: 1520, trades: 14, winRate: 57, avgMood: 65, avgReadiness: 68 },
    ],
    dailyMoodData: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (30 - i))
      return {
        date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        mood: Math.floor(Math.random() * 40) + 50, // 50-90
        discipline: Math.floor(Math.random() * 40) + 50, // 50-90
        confidence: Math.floor(Math.random() * 35) + 50, // 50-85
        stress: Math.floor(Math.random() * 25) + 20, // 20-45
        energy: Math.floor(Math.random() * 40) + 45, // 45-85
        sleep: Math.floor(Math.random() * 3) + 6, // 6-9 hours
        pnl: Math.floor(Math.random() * 2500) - 500, // -500 to +2000
      }
    }),
    weekdayChartData: [
      { day: "Monday", winRate: 65, avgMood: 72, avgDiscipline: 75, trades: 45 },
      { day: "Tuesday", winRate: 58, avgMood: 68, avgDiscipline: 70, trades: 42 },
      { day: "Wednesday", winRate: 72, avgMood: 78, avgDiscipline: 82, trades: 48 },
      { day: "Thursday", winRate: 55, avgMood: 65, avgDiscipline: 68, trades: 40 },
      { day: "Friday", winRate: 62, avgMood: 70, avgDiscipline: 72, trades: 38 },
    ],
    summary: {
      totalTrades: 150,
      winRate: 58,
      totalPnL: 25000,
      averageWin: 300,
      averageLoss: -150,
      avgReadiness: 75,
      avgMood: 68,
      bestDay: { date: "Jan 15", pnl: 2500, readiness: 85 },
      worstDay: { date: "Jan 10", pnl: -1200, readiness: 50 },
      bestWeek: { week: "Jan 15-21", pnl: 3780, avgReadiness: 80 },
      worstWeek: { week: "Jan 8-14", pnl: -890, avgReadiness: 58 },
    },
    psychology: {
      readinessCorrelation: 0.6,
      moodCorrelation: 0.7,
      disciplineScore: 78,
      consistencyScore: 70,
      revengeIncidents: 5,
    },
    stages: {
      shouldUnlockStage2: true,
      shouldUnlockStage3: true,
      shouldUnlockStage4: true,
      shouldUnlockStage5: true,
    },
    weeklyInsights: {
      bestPerformingDay: "Wednesday",
      worstPerformingDay: "Tuesday",
      commonMistake: "Revenge trading",
      readinessVsResults: "High readiness correlates with higher P&L",
      nextWeekFocus: ["Discipline", "Stress Management"],
    },
    psychologicalProfile: [
      { subject: "Discipline", A: 78 },
      { subject: "Emotions", A: 75 },
      { subject: "Confidence", A: 72 },
      { subject: "Stress", A: 35 },
      { subject: "Consistency", A: 70 },
      { subject: "Awareness", A: 80 },
      { subject: "Energy", A: 70 },
      { subject: "Readiness", A: 75 },
    ],
    psychInsights: [
      {
        type: "critical",
        icon: "🚨",
        title: "CRITICAL: High stress",
        description: `High stress (${35}%) destroys your decisions and long-term health.`,
        action: "URGENT: Take a day off or switch to demo mode for the rest of the week.",
        impact: "critical",
      },
      {
        type: "success",
        icon: "🎯",
        title: "Discipline level: Navy SEAL",
        description: `Discipline ${78}% is brutal!`,
        action: "Mentor others - share your techniques!",
        impact: "positive",
      },
      {
        type: "warning",
        icon: "😩",
        title: "Elevated stress level",
        description: `Your stress (${35}%) is slightly elevated. Error potential is growing.`,
        action: "Implement 5min meditation or short walk after each loss.",
        impact: "high",
      },
    ],
    emotionalPatterns: [
      {
        name: "FOMO Trading",
        emoji: "😰",
        count: 8,
        impact: -2100,
        color: "#ef4444",
        severity: "high",
        description: "Impulsive trades from fear of missing opportunity",
        recommendation: "Wait 10 minutes before entry. FOMO usually means you're late.",
      },
      {
        name: "Revenge Trading",
        emoji: "😤",
        count: 5,
        impact: -3200,
        color: "#dc2626",
        severity: "critical",
        description: "Attempt to quickly recover losses - most dangerous pattern",
        recommendation: "STOP trading after 2 losses in a row. Take break minimum 30 minutes.",
      },
      {
        name: "Fear of Losing",
        emoji: "😨",
        count: 12,
        impact: -1800,
        color: "#f59e0b",
        severity: "high",
        description: "Premature closing of profitable positions due to fear of loss",
        recommendation: "Stick to the plan - close positions on TP or trailing stop, not emotionally.",
      },
      {
        name: "Overconfidence",
        emoji: "🤑",
        count: 6,
        impact: -1500,
        color: "#f97316",
        severity: "medium",
        description: "Trading with too large risk after series of wins",
        recommendation: "Risk management is constant - always max 1-2% per trade, regardless of winning streak.",
      },
      {
        name: "Analysis Paralysis",
        emoji: "🤔",
        count: 4,
        impact: -900,
        color: "#06b6d4",
        severity: "medium",
        description: "Overthinking and hesitating until the opportunity is lost",
        recommendation: "Prepare your trading plan in advance. When the setup occurs, act immediately.",
      },
      {
        name: "Greed",
        emoji: "💰",
        count: 7,
        impact: -2600,
        color: "#eab308",
        severity: "high",
        description: "Holding positions too long hoping for bigger profit",
        recommendation: "Profit is profit. Take TP when it appears and don't be greedy.",
      },
      {
        name: "Hope Trading",
        emoji: "🙏",
        count: 9,
        impact: -2400,
        color: "#ef4444",
        severity: "critical",
        description: "Holding losing positions hoping for reversal",
        recommendation: "Stop loss is mandatory. Never wait in hope - cut losses quickly.",
      },
      {
        name: "Fatigue Trading",
        emoji: "😴",
        count: 3,
        impact: -700,
        color: "#64748b",
        severity: "medium",
        description: "Trading in a state of exhaustion and reduced concentration",
        recommendation: "Trading requires 100% focus. When you're tired, stop.",
      },
      {
        name: "Morning Rush",
        emoji: "⏰",
        count: 5,
        impact: -1200,
        color: "#f59e0b",
        severity: "medium",
        description: "Lack of preparation and rushing at the start of the trading day",
        recommendation: "Always start with morning check and a clear plan. Never rush into the market.",
      },
      {
        name: "Weekend Gap Anxiety",
        emoji: "😟",
        count: 2,
        impact: -500,
        color: "#8b5cf6",
        severity: "low",
        description: "Fear of holding positions over the weekend",
        recommendation: "Either close all positions before the weekend, or have a clear strategy for gap risk.",
      },
    ],
    streakStats: {
      currentWinStreak: 4,
      maxWinStreak: 6,
      currentLossStreak: 1,
      maxLossStreak: 3,
    },
    actionPlan: [
      {
        priority: "high" as const,
        emoji: "📋",
        title: "DISCIPLINE - Key to profitability!",
        description: `Low discipline (${78}%) equals gambling, not trading.`,
        action: "Create a checklist BEFORE every trading session: 1) Plan checked? 2) Emotional state OK? 3) Positions OK? No trade without completing the checklist!",
        impact: "The difference between a losing and a winning trader.",
      },
      {
        priority: "medium" as const,
        emoji: "😰",
        title: "REDUCE STRESS - Critical level!",
        description: `High stress (${35}%) destroys your decisions and long-term health.`,
        action: "Immediately start with 10min breathing exercises BEFORE each trade and after 2 consecutive losses. Consider reducing positions by 50%.",
        impact: "Your performance and health are at risk!",
      },
    ],
    weekdayChartData: [
      { day: "Monday", winRate: 65, avgMood: 72, avgDiscipline: 75, trades: 45 },
      { day: "Tuesday", winRate: 58, avgMood: 68, avgDiscipline: 70, trades: 42 },
      { day: "Wednesday", winRate: 72, avgMood: 78, avgDiscipline: 82, trades: 48 },
      { day: "Thursday", winRate: 55, avgMood: 65, avgDiscipline: 68, trades: 40 },
      { day: "Friday", winRate: 62, avgMood: 70, avgDiscipline: 72, trades: 38 },
    ],
    moodPerformanceData: Array.from({ length: 30 }, (_, i) => ({
      mood: Math.floor(Math.random() * 40) + 50,
      pnl: Math.floor(Math.random() * 2500) - 500,
      date: `${i + 1}. Led`,
      size: Math.abs(Math.floor(Math.random() * 2500) - 500) / 10 + 5,
    })),
  }

  return demoData
}

// Dummy functions for the sake of the example, replace with actual implementations
function calculateEmotionalPatternsFromTrades(trades: any[], isEn: boolean): any[] {
  // Placeholder: Replace with actual logic to analyze trades for emotional patterns
  const patterns = [
    {
      name: "FOMO Trading",
      emoji: "😰",
      count: Math.floor(Math.random() * 8) + 3,
      impact: -(Math.random() * 2500 + 800),
      color: "#ef4444",
      severity: Math.random() > 0.5 ? "high" : "medium",
      description: "Impulsive trades from fear of missing an opportunity",
      recommendation: "Wait 10 minutes before entry. FOMO usually means you're late.",
    },
    {
      name: "Revenge Trading",
      emoji: "😤",
      count: Math.floor(Math.random() * 5) + 2,
      impact: -(Math.random() * 4500 + 1500),
      color: "#dc2626",
      severity: "critical",
      description: "Attempt to quickly recover losses - most dangerous pattern",
      recommendation: "STOP trading after 2 losses in a row. Take a break of at least 30 minutes.",
    },
    {
      name: "Fear of Losing",
      emoji: "😨",
      count: Math.floor(Math.random() * 10) + 5,
      impact: -(Math.random() * 2000 + 1000),
      color: "#f59e0b",
      severity: "high",
      description: "Premature closing of profitable positions due to fear of loss",
      recommendation: "Stick to the plan - close positions on TP or trailing stop, not emotionally.",
    },
    {
      name: "Overconfidence",
      emoji: "🤑",
      count: Math.floor(Math.random() * 6) + 2,
      impact: -(Math.random() * 1800 + 800),
      color: "#f97316",
      severity: "medium",
      description: "Trading with too large risk after a series of wins",
      recommendation: "Risk management is constant - always max 1-2% per trade, regardless of winning streak.",
    },
    {
      name: "Greed",
      emoji: "💰",
      count: Math.floor(Math.random() * 7) + 3,
      impact: -(Math.random() * 3000 + 1500),
      color: "#eab308",
      severity: "high",
      description: "Holding positions too long hoping for bigger profit",
      recommendation: "Profit is profit. Take TP when it appears and don't be greedy.",
    },
    {
      name: "Hope Trading",
      emoji: "🙏",
      count: Math.floor(Math.random() * 8) + 4,
      impact: -(Math.random() * 3500 + 1500),
      color: "#ef4444",
      severity: "critical",
      description: "Holding losing positions hoping for reversal",
      recommendation: "Stop loss is mandatory. Never wait in hope - cut losses quickly.",
    },
    {
      name: "Analysis Paralysis",
      emoji: "🤔",
      count: Math.floor(Math.random() * 4) + 2,
      impact: -(Math.random() * 1000 + 500),
      color: "#06b6d4",
      severity: "medium",
      description: "Overthinking and hesitating until the opportunity is lost",
      recommendation: "Prepare your trading plan in advance. When the setup occurs, act immediately.",
    },
  ]
  
  // Return random 5-7 patterns
  const count = Math.floor(Math.random() * 3) + 5
  return patterns.sort(() => Math.random() - 0.5).slice(0, count)
}

function calculatePsychologicalMetrics(trades: any[], moodEntries: any[]) {
  // Placeholder: Replace with actual logic to calculate psychological metrics
  const avgMood =
    trades.length > 0 ? Math.round(trades.reduce((sum: number, t: any) => sum + (t.mood || 50), 0) / trades.length) : 0
  const avgDiscipline =
    trades.length > 0 ? Math.round((trades.filter((t: any) => t.followedPlan).length / trades.length) * 100) : 0
  const avgConfidence =
    trades.length > 0
      ? Math.round(trades.reduce((sum: number, t: any) => sum + (t.confidenceBefore || 50), 0) / trades.length)
      : 0
  const avgStress =
    trades.length > 0
      ? Math.round(trades.reduce((sum: number, t: any) => sum + (t.stressLevel || 30), 0) / trades.length)
      : 0

  const moodVariance =
    moodEntries.length > 0
      ? moodEntries.reduce((sum: number, m: any) => sum + Math.pow((m.mood || 0) - avgMood, 2), 0) / moodEntries.length
      : 100
  const moodStability = Math.max(0, 100 - Math.sqrt(moodVariance))

  const avgEnergy =
    moodEntries.length > 0
      ? Math.round(moodEntries.reduce((sum: number, m: any) => sum + (m.energy || 0), 0) / moodEntries.length)
      : 0

  const journalingRate =
    moodEntries.length > 0 ? (moodEntries.filter((j) => j.tradeId !== undefined).length / moodEntries.length) * 100 : 0

  const consistencyScore =
    trades.length > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (1 -
              Math.abs(
                trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) /
                  Math.max(
                    trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0),
                    1,
                  ),
              )) *
              100,
          ),
        )
      : 0

  return {
    avgMood,
    avgDiscipline,
    avgConfidence,
    avgStress,
    moodStability,
    avgEnergy,
    journalingRate,
    consistencyScore,
  }
}

function generatePsychologicalAnalysis(
  trades: any[],
  journals: any[],
  moodEntries: any[],
  isLiveMode: boolean,
  tradingStyle: string,
  timeframe: "week" | "month" | "all",
  isEn: boolean,
) {
  let weeklyPerformanceData = []
  let dailyMoodData = []
  let weekdayChartData: any[] = []

  if (trades.length === 0) {
    return null // Return null when no data instead of generating demo data
  }

  // Group trades by week
  const tradesByWeek: { [key: string]: any[] } = {}
  trades.forEach((trade) => {
    const date = new Date(trade.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDay() - 1) // Monday of the week
    const weekKey = weekStart.toISOString().split("T")[0]
    if (!tradesByWeek[weekKey]) tradesByWeek[weekKey] = []
    tradesByWeek[weekKey].push(trade)
  })

  // Generate weekly performance from real trades
  weeklyPerformanceData = Object.entries(tradesByWeek)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-4) // Take the last 4 weeks for "month" view, or more if "all"
    .map(([weekKey, weekTrades]) => {
      const startDate = new Date(weekKey)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // End of the week
      const weekLabel = `${startDate.getDate()}. ${startDate.toLocaleDateString("cs-CZ", { month: "short" })} - ${endDate.getDate()}. ${endDate.toLocaleDateString("cs-CZ", { month: "short" })}`

      const pnl = weekTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
      const wins = weekTrades.filter((t: any) => (t.pnl || 0) > 0).length
      const winRate = weekTrades.length > 0 ? Math.round((wins / weekTrades.length) * 100) : 0

      // Calculate average mood, confidence, stress, energy from moodEntries for this week
      const weekMoodEntries = moodEntries.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate >= startDate && entryDate <= endDate
      })

      const avgMood =
        weekMoodEntries.length > 0
          ? Math.round(
              weekMoodEntries.reduce((sum: number, m: any) => sum + (m.mood || 50), 0) / weekMoodEntries.length,
            )
          : 0
      const avgConfidence =
        weekMoodEntries.length > 0
          ? Math.round(
              weekMoodEntries.reduce((sum: number, m: any) => sum + (m.confidence || 50), 0) / weekMoodEntries.length,
            )
          : 0
      const avgStress =
        weekMoodEntries.length > 0
          ? Math.round(
              weekMoodEntries.reduce((sum: number, m: any) => sum + (m.stress || 30), 0) / weekMoodEntries.length,
            )
          : 0
      const avgEnergy =
        weekMoodEntries.length > 0
          ? Math.round(
              weekMoodEntries.reduce((sum: number, m: any) => sum + (m.energy || 50), 0) / weekMoodEntries.length,
            )
          : 0

      // Calculate average readiness from trades (if available in trade data)
      const avgReadiness =
        weekTrades.length > 0 && weekTrades.some((t: any) => t.readiness !== undefined)
          ? Math.round(weekTrades.reduce((sum: number, t: any) => sum + (t.readiness || 0), 0) / weekTrades.length)
          : avgConfidence // Fallback to confidence if readiness is not in trade data

      return {
        week: weekLabel,
        pnl,
        trades: weekTrades.length,
        winRate,
        avgMood,
        avgReadiness,
        avgConfidence, // Added for potential use
        avgStress, // Added for potential use
        avgEnergy, // Added for potential use
      }
    })

  // Generate daily mood data from real trades
  const tradesByDay: { [key: string]: any[] } = {}
  trades.forEach((trade) => {
    const dateKey = trade.date?.split("T")[0] || trade.date
    if (!tradesByDay[dateKey]) tradesByDay[dateKey] = []
    tradesByDay[dateKey].push(trade)
  })

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (30 - i - 1))
    return date.toISOString().split("T")[0]
  })

  dailyMoodData = last30Days.map((dateStr) => {
    const date = new Date(dateStr)
    const dayTrades = tradesByDay[dateStr] || []
    const dayMoodEntry = moodEntries.find((m) => m.date === dateStr)

    const avgMood =
      dayTrades.length > 0
        ? Math.round(
            dayTrades.reduce((sum: number, t: any) => sum + (t.mood || dayMoodEntry?.mood || 50), 0) / dayTrades.length,
          )
        : dayMoodEntry?.mood || 50
    const avgConfidence =
      dayTrades.length > 0
        ? Math.round(
            dayTrades.reduce((sum: number, t: any) => sum + (t.confidenceBefore || dayMoodEntry?.confidence || 50), 0) /
              dayTrades.length,
          )
        : dayMoodEntry?.confidence || 50
    const avgStress =
      dayTrades.length > 0
        ? Math.round(
            dayTrades.reduce((sum: number, t: any) => sum + (t.stressLevel || dayMoodEntry?.stress || 30), 0) /
              dayTrades.length,
          )
        : dayMoodEntry?.stress || 30
    const pnl = dayTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
    const discipline =
      dayTrades.length > 0
        ? Math.round((dayTrades.filter((t: any) => t.followedPlan).length / dayTrades.length) * 100)
        : dayMoodEntry?.discipline || 0
    const energy = dayMoodEntry?.energy || 50 // Use mood entry if available
    const sleep = dayMoodEntry?.sleep || 7 // Use mood entry if available

    return {
      date: `${date.getDate()}. ${date.toLocaleDateString("cs-CZ", { month: "short" })}`,
      mood: Math.round(avgMood),
      discipline: Math.round(discipline),
      confidence: Math.round(avgConfidence),
      stress: Math.round(avgStress),
      energy: Math.round(energy),
      sleep: Math.round(sleep),
      pnl,
    }
  })

  // Generate weekday chart data from real trades
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const tradesByWeekday: { [key: number]: any[] } = {}
  trades.forEach((trade) => {
    const day = new Date(trade.date).getDay()
    if (!tradesByWeekday[day]) tradesByWeekday[day] = []
    tradesByWeekday[day].push(trade)
  })

  weekdayChartData = [1, 2, 3, 4, 5].map((dayNum) => {
    // Monday to Friday
    const dayTrades = tradesByWeekday[dayNum] || []
    const wins = dayTrades.filter((t: any) => (t.pnl || 0) > 0).length
    const winRate = dayTrades.length > 0 ? Math.round((wins / dayTrades.length) * 100) : 0

    // Calculate average mood and discipline from associated mood entries for that weekday
    const relevantMoodEntries = moodEntries.filter((entry: any) => new Date(entry.date).getDay() === dayNum)
    const avgMood =
      relevantMoodEntries.length > 0
        ? Math.round(
            relevantMoodEntries.reduce((sum: number, m: any) => sum + (m.mood || 50), 0) / relevantMoodEntries.length,
          )
        : 0
    const avgDiscipline =
      relevantMoodEntries.length > 0
        ? Math.round(
            relevantMoodEntries.reduce((sum: number, m: any) => sum + (m.discipline || 0), 0) /
              relevantMoodEntries.length,
          )
        : 0

    return {
      day: weekdays[dayNum],
      winRate,
      avgMood,
      avgDiscipline,
      trades: dayTrades.length,
    }
  })

  const uniqueDays = new Set((trades || []).map((t: any) => t.date?.split("T")[0] || t.date)).size
  const totalPnL = (trades || []).reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
  const wins = (trades || []).filter((t: any) => (t.pnl || 0) > 0).length
  const winRate = (trades || []).length > 0 ? Math.round((wins / (trades || []).length) * 100) : 0

  // Calculate overall averages from trades AND moodEntries for a more complete picture
  const combinedMoodEntries = (trades || []).map((trade) => {
    const tradeDate = trade.date?.split("T")[0] || trade.date
    const moodEntry = (moodEntries || []).find((m: any) => m.date === tradeDate)
    return {
      ...trade, // Keep trade data
      mood: trade.mood !== undefined ? trade.mood : moodEntry?.mood || 50,
      confidenceBefore: trade.confidenceBefore !== undefined ? trade.confidenceBefore : moodEntry?.confidence || 50,
      stressLevel: trade.stressLevel !== undefined ? trade.stressLevel : moodEntry?.stress || 30,
      discipline: trade.followedPlan !== undefined ? (trade.followedPlan ? 100 : 0) : moodEntry?.discipline || 0,
      energy: moodEntry?.energy || 50,
      sleep: moodEntry?.sleep || 7,
    }
  })

  const avgMood =
    combinedMoodEntries.length > 0
      ? Math.round(
          combinedMoodEntries.reduce((sum: number, t: any) => sum + (t.mood || 50), 0) / combinedMoodEntries.length,
        )
      : 0
  const avgDiscipline =
    combinedMoodEntries.length > 0
      ? Math.round(
          combinedMoodEntries.reduce((sum: number, t: any) => sum + (t.discipline || 0), 0) /
            combinedMoodEntries.length,
        )
      : 0
  const avgConfidence =
    combinedMoodEntries.length > 0
      ? Math.round(
          combinedMoodEntries.reduce((sum: number, t: any) => sum + (t.confidenceBefore || 50), 0) /
            combinedMoodEntries.length,
        )
      : 0
  const avgStress =
    combinedMoodEntries.length > 0
      ? Math.round(
          combinedMoodEntries.reduce((sum: number, t: any) => sum + (t.stressLevel || 30), 0) /
            combinedMoodEntries.length,
        )
      : 0

  const avgEnergy =
    combinedMoodEntries.length > 0
      ? Math.round(
          combinedMoodEntries.reduce((sum: number, t: any) => sum + (t.energy || 50), 0) / combinedMoodEntries.length,
        )
      : 0

  const avgSleep =
    combinedMoodEntries.length > 0
      ? Math.round(
          combinedMoodEntries.reduce((sum: number, t: any) => sum + (t.sleep || 7), 0) / combinedMoodEntries.length,
        )
      : 7

  const journalingRate =
    moodEntries.length > 0 ? (moodEntries.filter((j) => j.tradeId !== undefined).length / moodEntries.length) * 100 : 0

  const consistencyScore =
    trades.length > 0
      ? Math.max(
          0,
          Math.min(
            100,
            (1 - Math.abs(trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / Math.max(totalPnL, 1))) * 100,
          ),
        )
      : 0

  const moodVariance =
    dailyMoodData.length > 0
      ? dailyMoodData.reduce((sum: number, m: any) => sum + Math.pow((m.mood || 0) - avgMood, 2), 0) /
        dailyMoodData.length
      : 100
  const moodStability = Math.max(0, 100 - Math.sqrt(moodVariance))

  const bestDayPnL = (trades || []).length > 0 ? Math.max(...(trades || []).map((t: any) => t.pnl || 0)) : 0
  const worstDayPnL = (trades || []).length > 0 ? Math.min(...(trades || []).map((t: any) => t.pnl || 0)) : 0

  const bestWeek = weeklyPerformanceData.reduce((best, week) => (week.pnl > best.pnl ? week : best), {
    pnl: Number.NEGATIVE_INFINITY,
    avgReadiness: 0,
    week: "",
  })
  const worstWeek = weeklyPerformanceData.reduce((worst, week) => (week.pnl < worst.pnl ? worst : worst), {
    pnl: Number.POSITIVE_INFINITY,
    avgReadiness: 0,
    week: "",
  })

  const totalTrades = trades.length
  const weeksCount = weeklyPerformanceData.length // Use the actual number of weeks calculated
  const avgWeeklyPnL = weeksCount > 0 ? weeklyPerformanceData.reduce((sum, w) => sum + w.pnl, 0) / weeksCount : 0

  const calculateStreakStats = () => {
    let currentWinStreak = 0
    let maxWinStreak = 0
    let currentLossStreak = 0
    let maxLossStreak = 0

    trades.forEach((trade) => {
      if (trade.pnl > 0) {
        currentWinStreak++
        currentLossStreak = 0
      } else {
        currentLossStreak++
        currentWinStreak = 0
      }
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
    })
    return { currentWinStreak: maxWinStreak, maxWinStreak, currentLossStreak: maxLossStreak, maxLossStreak } // Corrected keys for consistency
  }

  const streakStats = calculateStreakStats()

  const actionPlan = []
  const totalPnLFromTrades = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) // Recalculate to be safe

  // Simplified action plan logic based on calculated metrics
  if (avgStress > 65) {
    actionPlan.push({
      priority: "high" as const,
      emoji: "😰",
        title: "REDUCE STRESS - Critical level!",
        description: `High stress (${avgStress}%) destroys your decisions and long-term health.`,
        action: "Immediately start with 10min breathing exercises BEFORE each trade and after 2 consecutive losses. Consider reducing positions by 50%.",
        impact: "Your performance and health are at risk!",
    })
  } else if (avgStress > 50) {
    actionPlan.push({
      priority: "medium" as const,
      emoji: "😩",
        title: "Elevated stress level",
        description: `Your stress (${avgStress}%) is slightly elevated. Error potential is growing.`,
        action: "Implement 5min meditation or short walk after each loss.",
        impact: "Reduce error risk and improve concentration.",
    })
  }

  if (avgDiscipline < 60) {
    actionPlan.push({
      priority: "high" as const,
      emoji: "📋",
        title: "DISCIPLINE - Key to profitability!",
        description: `Low discipline (${avgDiscipline}%) equals gambling, not trading.`,
        action: "Create a checklist BEFORE every trading session: 1) Plan checked? 2) Emotional state OK? 3) Positions OK? No trade without completing the checklist!",
        impact: "The difference between a losing and a winning trader.",
    })
  } else if (avgDiscipline < 75) {
    actionPlan.push({
      priority: "medium" as const,
      emoji: "✅",
        title: "Improve plan adherence",
        description: `Discipline (${avgDiscipline}%) is decent, but there's room for improvement.`,
        action: "After each trade, evaluate whether you followed the plan. Mark it in your journal.",
        impact: "Better plan adherence = more consistent results.",
    })
  }

  if (moodStability < 70) {
    actionPlan.push({
      priority: "high" as const,
      emoji: "🎢",
        title: "Emotional rollercoaster!",
        description: `Low stability (${moodStability}%) means your emotions are driving your trades.`,
        action: "Daily journaling (min 10min) focused on emotional state BEFORE and AFTER trades. Avoid trading when in extreme emotions.",
        impact: "More stable emotions = better decision-making.",
    })
  }

  if (journalingRate < 70) {
    actionPlan.push({
      priority: "medium" as const,
      emoji: "✍️",
        title: "Increase journaling rate",
        description: `Only ${journalingRate.toFixed(0)}% of your trades have a journal entry.`,
        action: "Goal: 80%+ journaling rate. Every trade must be recorded within 1h of closing.",
        impact: "Better self-reflection = faster learning.",
    })
  }

  // Add other action items based on your analysis logic
  // Example: If revenge trading is detected as high severity, add specific action
  const emotionalPatterns = calculateEmotionalPatternsFromTrades(trades, isEn)
  if (emotionalPatterns.some((p) => p.severity === "high" || p.severity === "critical")) {
    const criticalPattern = emotionalPatterns.find((p) => p.severity === "high" || p.severity === "critical")
    if (!actionPlan.some((a) => a.title.includes(criticalPattern?.name || ""))) {
      actionPlan.push({
        priority: "high" as const,
        emoji: criticalPattern?.emoji || "⚠️",
        title: `ELIMINUJ ${criticalPattern?.name}`,
        description: criticalPattern?.description || "This emotional pattern is costing you money.",
        action: "STOP trading after 2 losses in a row. Take a break of at least 30 minutes.",
        impact: `Your wallet will feel it! ($${Math.abs(Math.round(criticalPattern?.impact || 0))})`,
      })
    }
  }

  return {
    weeklyPerformanceData,
    dailyMoodData,
    weekdayChartData,
    summary: {
      uniqueDays,
      totalTrades,
      totalPnL,
      winRate,
      avgMood,
      avgDiscipline,
      avgConfidence,
      avgStress,
      avgEnergy, // Added
      avgSleep, // Added
      moodStability, // Added
      journalingRate, // Added
      consistencyScore, // Added
      weeks: weeksCount, // Renamed from weeks for clarity
      bestWeek,
      worstWeek,
      avgWeeklyPnL,
      currentStreak: streakStats.currentWinStreak, // Renamed for clarity
      longestWinStreak: streakStats.maxWinStreak, // Renamed for clarity
      tradingDays: uniqueDays, // Renamed for clarity
      bestDay: bestDayPnL,
      worstDay: worstDayPnL,
      averageWin:
        trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) /
        Math.max(trades.filter((t) => t.pnl > 0).length, 1),
      averageLoss:
        trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) /
        Math.max(trades.filter((t) => t.pnl < 0).length, 1),
    },
    
    // NEW METRICS FOR PSYCHOLOGY INSIGHTS
    recoveryRate: (() => {
      let recoveryCount = 0
      let lossCount = 0
      for (let i = 0; i < trades.length - 1; i++) {
        if ((trades[i].pnl || 0) < 0) {
          lossCount++
          if ((trades[i + 1]?.pnl || 0) > 0) recoveryCount++
        }
      }
      return lossCount > 0 ? Math.round((recoveryCount / lossCount) * 100) : 0
    })(),
    
    streakConsistency: (() => {
      let totalStreakLength = 0
      let streakCount = 0
      let currentStreak = 0
      let previousWin = false
      trades.forEach((trade: any) => {
        const isWin = (trade.pnl || 0) > 0
        if (isWin && previousWin) {
          currentStreak++
        } else if (isWin && !previousWin) {
          if (currentStreak > 0) { totalStreakLength += currentStreak; streakCount++ }
          currentStreak = 1
        } else if (!isWin && previousWin) {
          totalStreakLength += currentStreak
          streakCount++
          currentStreak = 0
        }
        previousWin = isWin
      })
      if (currentStreak > 0) { totalStreakLength += currentStreak; streakCount++ }
      const avgStreakLength = streakCount > 0 ? totalStreakLength / streakCount : 0
      const maxStreak = streakStats.maxWinStreak || 1
      return Math.round((avgStreakLength / Math.max(maxStreak, 3)) * 100)
    })(),
    
    revengeTradeRisk: (() => {
      let revengeTrades = 0
      let totalTradesAfterLoss = 0
      for (let i = 0; i < trades.length - 1; i++) {
        if ((trades[i].pnl || 0) < 0) {
          totalTradesAfterLoss++
          const nextTrade = trades[i + 1]
          if (nextTrade?.revengeTrade || (nextTrade && (nextTrade.pnl || 0) > 0 && nextTrade.duration && nextTrade.duration < 300)) {
            revengeTrades++
          }
        }
      }
      return totalTradesAfterLoss > 0 ? Math.round((revengeTrades / totalTradesAfterLoss) * 100) : 0
    })(),
    
    criticalFindings: (() => {
      const findings: any[] = []
      let consecutiveLosses = 0
      let maxConsecutiveLosses = 0
      trades.forEach((trade: any) => {
        if ((trade.pnl || 0) < 0) {
          consecutiveLosses++
          maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses)
        } else {
          consecutiveLosses = 0
        }
      })
      if (maxConsecutiveLosses >= 2) {
        let foundDoubleLosse = -1
        for (let i = 0; i < trades.length - 2; i++) {
          if ((trades[i].pnl || 0) < 0 && (trades[i + 1].pnl || 0) < 0) {
            foundDoubleLosse = i
            break
          }
        }
        if (foundDoubleLosse > 0) {
          const beforeTrades = trades.slice(0, foundDoubleLosse)
          const afterTrades = trades.slice(foundDoubleLosse + 2)
          const beforeLossWinRate = beforeTrades.filter((t: any) => (t.pnl || 0) > 0).length / Math.max(beforeTrades.length, 1)
          const afterLossWinRate = afterTrades.filter((t: any) => (t.pnl || 0) > 0).length / Math.max(afterTrades.length, 1)
          const dropPercentage = Math.round((beforeLossWinRate - afterLossWinRate) * 100)
          if (dropPercentage > 10) {
            findings.push({
              severity: "critical",
              title: "⚠️ Critical finding",
              message: `After 2 losses in a row, your win rate drops by ${dropPercentage}%. STOP trading and take a 30min break!`,
              action: "After 2 consecutive losses = STOP for 30 minutes"
            })
          }
        }
      }
      return findings
    })(),
    
    emotionalPatterns: emotionalPatterns,
    psychInsights: [
      // Reusing some logic from original code for insights
      avgSleep >= 7
        ? {
            type: "success",
            icon: "😴",
            title: "Sleep is your superpower!",
            description: `You average ${avgSleep.toFixed(1)}h of sleep, which is EXCELLENT! Studies show 7+ hours improves decision-making by 40%.`,
            action: "Keep up the regular sleep schedule - it's working!",
            impact: "high",
          }
        : avgSleep < 6.5
          ? {
              type: "critical",
              icon: "😴",
              title: "CRITICAL sleep deprivation!",
              description: `You average only ${avgSleep.toFixed(1)}h daily. Your decision-making is 35% worse than with 7+ hours.`,
              action: "PRIORITY #1: Set alarm for 22:00 and go to bed. Seriously.",
              impact: "critical",
            }
          : null,

      moodStability > 85
        ? {
            type: "success",
            icon: "🧘",
            title: "Mental resilience of a monk",
            description: `Emotional stability ${moodStability.toFixed(0)}% is in top 10% of traders!`,
            action: "What do you do for mental health? Share it with others!",
            impact: "positive",
          }
        : moodStability < 70
          ? {
              type: "warning",
              icon: "🎢",
              title: "Emotional rollercoaster",
              description: `Stability ${moodStability.toFixed(0)}% means high emotional volatility.`,
              action: "Daily journaling + 10min meditation. Change it in 2 weeks!",
              impact: "high",
            }
          : null,

      avgDiscipline > 80
        ? {
            type: "success",
            icon: "🎯",
            title: "Discipline level: Navy SEAL",
            description: `Discipline ${avgDiscipline.toFixed(0)}% is brutal!`,
            action: "Mentor others - share your techniques!",
            impact: "positive",
          }
        : avgDiscipline < 60
          ? {
              type: "critical",
              icon: "📋",
              title: "Discipline = biggest problem",
              description: `Discipline ${avgDiscipline.toFixed(0)}% is low. No discipline = gambling!`,
              action: "Create pre-trade checklist. Non-negotiable.",
              impact: "critical",
            }
          : null,

      avgStress > 65
        ? {
            type: "critical",
            icon: "😰",
            title: "CRITICALLY high stress",
            description: `Stress ${avgStress.toFixed(0)}% is dangerous!`,
            action: "Reduce position sizes by 50%. Stress management is priority.",
            impact: "critical",
          }
        : avgStress > 50
          ? {
              type: "warning",
              icon: "😤",
              title: "Elevated stress level",
              description: `Stress ${avgStress.toFixed(0)}% is above optimal level.`,
              action: "5min breathing exercises before every session.",
              impact: "high",
            }
          : {
              type: "success",
              icon: "😌",
              title: "Perfect stress management",
              description: `Stress ${avgStress.toFixed(0)}% is in optimal range!`,
              action: "Keep it up - this balance is key.",
              impact: "positive",
            },
    ].filter((insight) => insight !== null) as any[], // Filter out null values

    actionPlan, // Use the calculated actionPlan
    weekdayChartData,
    moodPerformanceData: dailyMoodData.map((data) => ({
      // Assuming moodPerformanceData is derived from dailyMoodData
      mood: data.mood,
      pnl: data.pnl,
      date: data.date, // Use date for daily data
      size: Math.abs(data.pnl) / 10 + 5,
    })),
    psychologicalProfile: [
      // Recreating psychologicalProfile based on recalculated metrics
      { subject: "Discipline", A: Math.round(avgDiscipline) },
      { subject: "Emoce", A: Math.round(moodStability) },
      { subject: "Confidence", A: Math.round(avgConfidence) },
      { subject: "Consistency", A: Math.round(consistencyScore) },
    ],
    sessionTimeData: [
      {
        name: "Morning (6-12)",
          trades: sessionData.morning.trades,
          winRate: sessionData.morning.trades > 0 ? Math.round((sessionData.morning.wins / sessionData.morning.trades) * 100) : 0,
          pnl: Math.round(sessionData.morning.pnl),
          avgPnlPerTrade: sessionData.morning.trades > 0 ? Math.round(sessionData.morning.pnl / sessionData.morning.trades) : 0,
        },
        {
          name: "Odpoledne (12-18)",
          trades: sessionData.afternoon.trades,
          winRate: sessionData.afternoon.trades > 0 ? Math.round((sessionData.afternoon.wins / sessionData.afternoon.trades) * 100) : 0,
          pnl: Math.round(sessionData.afternoon.pnl),
          avgPnlPerTrade: sessionData.afternoon.trades > 0 ? Math.round(sessionData.afternoon.pnl / sessionData.afternoon.trades) : 0,
        },
        {
          name: "Evening (18-23)",
          trades: sessionData.evening.trades,
          winRate: sessionData.evening.trades > 0 ? Math.round((sessionData.evening.wins / sessionData.evening.trades) * 100) : 0,
          pnl: Math.round(sessionData.evening.pnl),
          avgPnlPerTrade: sessionData.evening.trades > 0 ? Math.round(sessionData.evening.pnl / sessionData.evening.trades) : 0,
        },
      ]
    })(),
    marketConditionsPerformance: (() => {
      const conditionMap: { [key: string]: { trades: number; wins: number; pnl: number } } = {}

      trades.forEach((trade: any) => {
        const condition = trade.marketConditions || "Unknown"
        if (!conditionMap[condition]) {
          conditionMap[condition] = { trades: 0, wins: 0, pnl: 0 }
        }
        conditionMap[condition].trades++
        if ((trade.pnl || 0) > 0) conditionMap[condition].wins++
        conditionMap[condition].pnl += trade.pnl || 0
      })

      return Object.entries(conditionMap).map(([condition, data]) => ({
        name: condition,
        trades: data.trades,
        winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
        pnl: Math.round(data.pnl),
        avgPnlPerTrade: data.trades > 0 ? Math.round(data.pnl / data.trades) : 0,
      }))
    })(),
    
    // Individual Psychology Metrics for direct rendering in live mode
    moodStability: Math.round(moodStability),
    avgDiscipline: Math.round(avgDiscipline),
    avgConfidence: Math.round(avgConfidence),
    avgStress: Math.round(avgStress),
    avgEnergy: Math.round(avgEnergy),
    avgMood: Math.round(avgMood),
    winRate: trades.length > 0 ? Math.round((trades.filter((t: any) => (t.pnl || 0) > 0).length / trades.length) * 100) : 0,
  }
}

// Renamed function to PsychologyAnalyticsPage as per update
export default function PsychologyAnalyticsPage() {
  const router = useRouter()
  const { user, authReady } = useAuth()
  const { isLiveMode, isLoading: modeLoading } = useLiveMode()
  const { getAllTrades, getAllMorningChecks } = useData()
  const {
    analytics,
    isLoading: analyticsLoading,
    // Use refresh function from context instead of direct call
    refresh,
  } = useAnalytics()
  
    // Get real data from useData
  const trades = getAllTrades() || []
  const morningChecks = getAllMorningChecks() || []
  const [selectedMetric, setSelectedMetric] = useState("pnl")
  const [activeTab, setActiveTab] = useState("overview")
  const [showMorningCheck, setShowMorningCheck] = useState(false)
  const [showRecordTrades, setShowRecordTrades] = useState(false)
  const [dailyStages, setDailyStages] = useState<any>(null)

  // Load daily stages once on mount - removed polling to prevent performance issues
  useEffect(() => {
    if (!user) return

    const loadDailyStages = async () => {
      try {
        const response = await fetch("/api/daily-stages/get", {
          credentials: "include",
        })
        const data = await response.json()
        setDailyStages(data)
      } catch (error) {
        console.error("[v0] Error loading daily stages:", error)
      }
    }

    loadDailyStages()
    // Only load once on mount, removed polling that caused performance issues
  }, [user])

    // Calculate daysWithData from real trades and morningChecks
  const daysWithData = useMemo(() => {
    const tradeDates = new Set(
      (trades || []).map((t: any) => {
        const date = t.date || t.created_at
        return date ? new Date(date).toISOString().split("T")[0] : null
      }).filter(Boolean)
    )
    
    const morningCheckDates = new Set(
      (morningChecks || []).map((m: any) => {
        const date = m.date || m.created_at
        return date ? new Date(date).toISOString().split("T")[0] : null
      }).filter(Boolean)
    )
    
    const allDates = new Set([...tradeDates, ...morningCheckDates])
    return allDates.size
  }, [trades, morningChecks])

    // Real data only - no demo data in LIVE MODE!
    // In VIRTUAL MODE always show demo data
  const analyticsData = useMemo(() => {
    if (!isLiveMode) {
      // Virtual mode - always return demo data
      const demoAnalytics = generateDemoData("balanced")
      const analysis = generatePsychologicalAnalysis(
        demoAnalytics.trades || [],
        [], // journals
        demoAnalytics.moodData || [],
        false, // isLiveMode
        "balanced",
        "month",
        true // isEn - always English for demo
      )
      return {
        ...demoAnalytics,
        analysis,
        summary: calculatePsychologicalMetrics(demoAnalytics.trades || [], demoAnalytics.moodData || []),
      }
    }
    // Live mode - generate analytics from REAL TRADES  
    const allTrades = trades && Array.isArray(trades) ? trades : []
    const allMorningChecks = morningChecks && Array.isArray(morningChecks) ? morningChecks : []
    
    // Build mock mood data from morning checks + default mood from trades
    const moodDataFromTrades = allTrades.map((t: any) => ({
      date: t.date || t.created_at || new Date().toISOString(),
      mood: t.mood || 65,
      confidence: t.confidence || 60,
      stress: t.stress || 35,
      energy: 65,
      discipline: t.followedPlan ? 80 : 40,
      sleep: 7,
      pnl: t.pnl || 0
    }))
    
    // Generate analysis from real data
    const analysis = generatePsychologicalAnalysis(
      allTrades,
      [],
      moodDataFromTrades,
      true, // isLiveMode
      "balanced",
      "month",
      true // isEn - always English
    )
    
    const psychMetrics = calculatePsychologicalMetrics(allTrades, moodDataFromTrades)
    
    // Build complete analytics response
    return {
      trades: allTrades,
      moodData: moodDataFromTrades,
      dailyMoodData: moodDataFromTrades,
      weeklyPerformanceData: analysis?.weeklyPerformanceData || [],
      streakStats: analysis?.streakStats || { maxWinStreak: 0, maxLossStreak: 0, currentWinStreak: 0, currentLossStreak: 0 },
      emotionalPatterns: analysis?.emotionalPatterns || [],
      psychInsights: analysis?.psychInsights || [],
      actionPlan: analysis?.actionPlan || [],
      psychologicalProfile: analysis?.psychologicalProfile || [],
      tradingSessionPerformance: analysis?.tradingSessionPerformance || [], // NEW: session performance
      marketConditionsPerformance: analysis?.marketConditionsPerformance || [], // NEW: market conditions
      recoveryRate: analysis?.recoveryRate || 0, // NEW: Recovery Rate po ztrátě
      streakConsistency: analysis?.streakConsistency || 0, // NEW: Streak Consistency
      revengeTradeRisk: analysis?.revengeTradeRisk || 0, // NEW: Revenge Trading Risk
      criticalFindings: analysis?.criticalFindings || [], // NEW: Kritická zjištění
      moodStability: analysis?.moodStability || 0, // NEW: Mood Stability score
      avgDiscipline: analysis?.avgDiscipline || 0, // NEW: Average Discipline
      avgConfidence: analysis?.avgConfidence || 0, // NEW: Average Confidence
      avgStress: analysis?.avgStress || 0, // NEW: Average Stress
      avgEnergy: analysis?.avgEnergy || 0, // NEW: Average Energy
      avgMood: analysis?.avgMood || 0, // NEW: Average Mood
      winRateMetric: analysis?.winRate || 0, // NEW: Win Rate Metric
      summary: {
        totalTrades: allTrades.length,
        winRate: allTrades.length > 0 ? Math.round((allTrades.filter((t: any) => (t.pnl || 0) > 0).length / allTrades.length) * 100) : 0,
        totalPnL: allTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0),
        averageWin: allTrades.filter((t: any) => (t.pnl || 0) > 0).length > 0 
          ? Math.round(allTrades.filter((t: any) => (t.pnl || 0) > 0).reduce((sum: number, t: any) => sum + t.pnl, 0) / allTrades.filter((t: any) => (t.pnl || 0) > 0).length)
          : 0,
        averageLoss: allTrades.filter((t: any) => (t.pnl || 0) <= 0).length > 0
          ? Math.round(allTrades.filter((t: any) => (t.pnl || 0) <= 0).reduce((sum: number, t: any) => sum + t.pnl, 0) / allTrades.filter((t: any) => (t.pnl || 0) <= 0).length)
          : 0,
        avgReadiness: psychMetrics?.avgMood || 65,
        avgMood: psychMetrics?.avgMood || 65,
      }
    }
  }, [isLiveMode, trades, morningChecks])

    // Analytics shown ONLY when real data is available in LIVE MODE
    // In VIRTUAL MODE always show demo data
  const isAnalyticsLocked = isLiveMode && daysWithData < 10
  const daysRemaining = Math.max(0, 10 - daysWithData)

  if (!authReady || modeLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500" />
      </div>
    )
  }

      // In Virtual Mode show demo data even if less than 10 days
  if (isAnalyticsLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-500/10">
                <Brain className="h-12 w-12 text-purple-400" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">Analytics Locked 🔒</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Collect data from your first 10 days for meaningful analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-bold text-white">{daysWithData} / 10 days</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${(daysWithData / 10) * 100}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-400">
                  {daysRemaining} {daysRemaining === 1 ? "day" : "days"} until unlock!
                </p>
              </div>

              {/* Why 10 days? */}
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                <h3 className="mb-2 font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Why 10 days?
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  For meaningful analysis, we need a minimum amount of data. 10 days will allow you to see:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>Patterns in your trading (winning/losing days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>Correlation between mood, readiness and results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>Emotional triggers and mistakes</span>
                  </li>
                </ul>
              </div>

              {/* What to do now */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  What to do now?
                </h3>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push("/morning-check")}
                    disabled={(dailyStages?.completedToday?.length ?? 0) > 0 && dailyStages?.completedToday?.includes("morning_check")}
                    className={`w-full ${
                      (dailyStages?.completedToday?.length ?? 0) > 0 && dailyStages?.completedToday?.includes("morning_check")
                        ? "bg-green-600 hover:bg-green-600 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {(dailyStages?.completedToday?.length ?? 0) > 0 && dailyStages?.completedToday?.includes("morning_check") ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Splneno
                      </>
                    ) : (
                      "Vyplnit Morning Check"
                    )}
                  </Button>
                  <Button
                    onClick={() => router.push("/record-trades")}
                    disabled={(dailyStages?.completedToday?.length ?? 0) > 0 && dailyStages?.completedToday?.includes("record_trade")}
                    variant="outline"
                    className={`w-full ${
                      (dailyStages?.completedToday?.length ?? 0) > 0 && dailyStages?.completedToday?.includes("record_trade")
                        ? "border-green-500/50 text-green-400 hover:bg-green-500/10 cursor-not-allowed"
                        : "border-purple-500/30 text-white hover:bg-purple-500/10"
                    }`}
                  >
                    {(dailyStages?.completedToday?.length ?? 0) > 0 && dailyStages?.completedToday?.includes("record_trade") ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Splneno
                      </>
                    ) : (
                      "Zaznamenat Trade"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Analytics content - display real data or demo data
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Error Loading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Unable to load your analytics. Please try again later.</p>
            <Button onClick={() => router.push("/analytics")} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timeframe = "month" // FIX: undeclared variable timeframe

  const getFilteredData = (data: any[], type: "daily" | "weekly") => {
    if (!Array.isArray(data) || !data) {
      return []
    }

    const now = new Date()

    let filteredData = [...data]

    if (timeframe === "week") {
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)

      filteredData = data
        .filter((item) => {
          if (!item.date && !item.week) return false
          const itemDate = new Date(item.date || item.week)
          if (isNaN(itemDate.getTime())) return false

          const dayOfWeek = itemDate.getDay()
          return itemDate >= startDate && dayOfWeek >= 1 && dayOfWeek <= 5
        })
        .slice(-5)
    } else if (timeframe === "month") {
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 28)

      filteredData = data.filter((item) => {
        if (!item.date && !item.week) return false
        const itemDate = new Date(item.date || item.week)
        return itemDate >= startDate
      })

      // Only aggregate data if type is 'weekly' - for 'daily' return raw data
      if (type === "weekly") {
        const weeklyGrouped: Record<string, any> = {}
        filteredData.forEach((item) => {
          const itemDate = new Date(item.date)
          if (isNaN(itemDate.getTime())) return

          const weekStart = new Date(itemDate)
          const day = weekStart.getDay()
          const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
          weekStart.setDate(diff)

          const weekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`

          if (!weeklyGrouped[weekKey]) {
            weeklyGrouped[weekKey] = {
              week: `${weekStart.getDate()}. ${weekStart.toLocaleDateString("cs-CZ", { month: "short" })} - ${new Date(weekStart.setDate(weekStart.getDate() + 6)).getDate()}. ${new Date(weekStart.setDate(weekStart.getDate() - 6)).toLocaleDateString("cs-CZ", { month: "short" })}`,
              mood: 0,
              discipline: 0,
              confidence: 0,
              stress: 0,
              pnl: 0,
              count: 0,
            }
          }

          weeklyGrouped[weekKey].mood += item.mood || 0
          weeklyGrouped[weekKey].discipline += item.discipline || 0
          weeklyGrouped[weekKey].confidence += item.confidence || 0
          weeklyGrouped[weekKey].stress += item.stress || 0
          weeklyGrouped[weekKey].pnl += item.pnl || 0
          weeklyGrouped[weekKey].count++
        })

        filteredData = Object.values(weeklyGrouped).map((week: any) => ({
          date: week.week,
          mood: Math.round(week.mood / week.count),
          discipline: Math.round(week.discipline / week.count),
          confidence: Math.round(week.confidence / week.count),
          stress: Math.round(week.stress / week.count),
          pnl: Math.round(week.pnl),
        }))
      }
    }

    return Array.isArray(filteredData) ? filteredData : []
  }

  const filteredDailyData = getFilteredData(analyticsData.dailyMoodData, "daily")
  const filteredWeeklyData = getFilteredData(analyticsData.weeklyPerformanceData, "weekly")

  const avgMood =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.mood || 0), 0) / filteredDailyData.length
      : 65

  const avgDiscipline =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.discipline || 0), 0) / filteredDailyData.length
      : 72

  const avgConfidence =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / filteredDailyData.length
      : 65

  const avgStress =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + (m.stress || 0), 0) / filteredDailyData.length
      : 42

  const moodVariance =
    filteredDailyData.length > 0
      ? filteredDailyData.reduce((sum: number, m: any) => sum + Math.pow((m.mood || 0) - avgMood, 2), 0) /
        filteredDailyData.length
      : 100
  const moodStability = Math.max(0, 100 - Math.sqrt(moodVariance))

  const avgWinRate =
    filteredWeeklyData.length > 0
      ? filteredWeeklyData.reduce((sum: number, w: any) => sum + w.winRate, 0) / filteredWeeklyData.length
      : 0

  const winRate = analyticsData?.summary?.winRate || avgWinRate || 0

  const getWinRateLabel = () => {
    if (winRate > 60) return "Win Rate (Profitable)"
    if (winRate > 50) return "Win Rate (Break-even)"
    return "Win Rate (Unprofitable)"
  }

  const moodDistribution =
    filteredDailyData && filteredDailyData.length > 0
      ? {
          good: Math.round(
            (filteredDailyData.filter((m: any) => m.mood >= 70).length / filteredDailyData.length) * 100,
          ),
          neutral: Math.round(
            (filteredDailyData.filter((m: any) => m.mood >= 40 && m.mood < 70).length / filteredDailyData.length) * 100,
          ),
          poor: Math.round((filteredDailyData.filter((m: any) => m.mood < 40).length / filteredDailyData.length) * 100),
        }
      : { good: 0, neutral: 0, poor: 0 }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              Psychological Analytics
              <Badge
                className={
                  isLiveMode // Changed from isDataContextLiveMode to isLiveMode
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isLiveMode ? "Live Mode" : "Virtual Mode"}
              </Badge>
            </h1>
            <p className="text-gray-300 text-lg">
              {isLiveMode ? "Live Mode - Your mental profile" : "Virtual Mode - Demo data"}
            </p>
          </div>
          {/* CHANGE: Use refresh function from context */}
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            className="gap-2 bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        
        {/* Virtual Mode Banner */}
        {!isLiveMode && (
          <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-3 px-4 flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-amber-100 text-xs md:text-sm">
                <span className="font-bold text-white">You are currently viewing data in Virtual mode</span> – how it may look during software use
            </span>
          </div>
        )}
        
        {/* Key Metrics - COMPLETELY REDESIGNED */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Emotional Stability */}
                {/* ... */}
                <p className="text-gray-400 text-xs font-medium mb-2">Emotional Stability</p>
                    <p className="text-4xl font-bold text-white mb-1">{analyticsData?.moodStability || 0}%</p>
                    {(analyticsData?.moodStability || 0) > 85 ? (
                      <p className="text-green-400 text-sm font-semibold flex items-center gap-1">
                        <ArrowUp className="w-4 h-4" /> Excellent
                      </p>
                    ) : (analyticsData?.moodStability || 0) > 70 ? (
                      <p className="text-yellow-400 text-sm font-semibold">Good</p>
                    ) : (
                      <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                        <ArrowDown className="w-4 h-4" /> Unstable
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      moodStability > 85
                        ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                        : moodStability > 70
                          ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20"
                          : "bg-gradient-to-br from-red-500/20 to-rose-500/20",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-8 h-8",
                        moodStability > 85 ? "text-green-400" : moodStability > 70 ? "text-yellow-400" : "text-red-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    moodStability > 85
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : moodStability > 70
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500",
                  )}
                  style={{ width: `${moodStability}%` }}
                />
              </div>
            </CardContent>
          </Card>

                {/* Discipline */}
          <Card className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Discipline</p>
                    <p className="text-4xl font-bold text-white mb-1">{analyticsData?.avgDiscipline || 0}%</p>
                    {(analyticsData?.avgDiscipline || 0) > 80 ? (
                      <p className="text-cyan-400 text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Professional
                      </p>
                    ) : (analyticsData?.avgDiscipline || 0) > 60 ? (
                      <p className="text-blue-400 text-sm font-semibold">Good</p>
                    ) : (
                      <p className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Problem
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      (analyticsData?.avgDiscipline || 0) > 80
                        ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                        : (analyticsData?.avgDiscipline || 0) > 60
                          ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
                          : "bg-gradient-to-br from-orange-500/20 to-red-500/20",
                    )}
                  >
                    <Target
                      className={cn(
                        "w-8 h-8",
                        avgDiscipline > 80 ? "text-cyan-400" : avgDiscipline > 60 ? "text-blue-400" : "text-orange-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    avgDiscipline > 80
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                      : avgDiscipline > 60
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-gradient-to-r from-orange-500 to-red-500",
                  )}
                  style={{ width: `${avgDiscipline}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">{getWinRateLabel()}</p>
                    <p className="text-4xl font-bold text-white mb-1">{analyticsData?.winRateMetric || 0}%</p>
                    {(analyticsData?.winRateMetric || 0) > 60 ? (
                      <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> Profitable
                      </p>
                    ) : (analyticsData?.winRateMetric || 0) > 50 ? (
                      <p className="text-amber-400 text-sm font-semibold">Break-even</p>
                    ) : (
                      <p className="text-rose-400 text-sm font-semibold flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" /> Unprofitable
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      (analyticsData?.winRateMetric || 0) > 60
                        ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
                        : (analyticsData?.winRateMetric || 0) > 50
                          ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20"
                          : "bg-gradient-to-br from-rose-500/20 to-red-500/20",
                    )}
                  >
                    <TrendingUpIcon
                      className={cn(
                        "w-8 h-8",
                        winRate > 60 ? "text-emerald-400" : winRate > 50 ? "text-amber-400" : "text-rose-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    winRate > 60
                      ? "bg-gradient-to-r from-emerald-500 to-green-500"
                      : winRate > 50
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                        : "bg-gradient-to-r from-rose-500 to-red-500",
                  )}
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stress Level */}
          <Card className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Stress Level</p>
                    <p className="text-4xl font-bold text-white mb-1">{analyticsData?.avgStress || 0}%</p>
                    {(analyticsData?.avgStress || 0) < 40 ? (
                      <p className="text-teal-400 text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Healthy
                      </p>
                    ) : (analyticsData?.avgStress || 0) < 60 ? (
                      <p className="text-orange-400 text-sm font-semibold">Elevated</p>
                    ) : (
                      <p className="text-red-400 text-sm font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Critical
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-full",
                      (analyticsData?.avgStress || 0) < 40
                        ? "bg-gradient-to-br from-teal-500/20 to-cyan-500/20"
                        : (analyticsData?.avgStress || 0) < 60
                          ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20"
                          : "bg-gradient-to-br from-red-500/20 to-rose-500/20",
                    )}
                  >
                    <Activity
                      className={cn(
                        "w-8 h-8",
                        avgStress < 40 ? "text-teal-400" : avgStress < 60 ? "text-orange-400" : "text-red-400",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className={cn(
                    "h-full transition-all",
                    avgStress < 40
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500"
                      : avgStress < 60
                        ? "bg-gradient-to-r from-orange-500 to-amber-500"
                        : "bg-gradient-to-r from-red-500 to-rose-500",
                  )}
                  style={{ width: `${avgStress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tabs for navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="w-full bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-2 grid grid-cols-2 md:grid-cols-4 gap-2 h-auto rounded-lg">
            <TabsTrigger
              value="overview"
              className={cn(
                "gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300 py-3 px-4 rounded-md text-sm md:text-base",
                activeTab === "overview" && "shadow-lg",
              )}
            >
              <Brain className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="mindset"
              className={cn(
                "gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300 py-3 px-4 rounded-md text-sm md:text-base",
                activeTab === "mindset" && "shadow-lg",
              )}
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-semibold hidden sm:inline">Mindset</span>
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className={cn(
                "gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300 py-3 px-4 rounded-md text-sm md:text-base",
                activeTab === "patterns" && "shadow-lg",
              )}
            >
              <TrendingUpDown className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-semibold hidden md:inline">Vzorce</span>
            </TabsTrigger>
            <TabsTrigger
              value="action"
              className={cn(
                "gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300 py-3 px-4 rounded-md text-sm md:text-base",
                activeTab === "action" && "shadow-lg",
              )}
            >
              <Target className="w-5 h-5" />
                <span className="font-semibold">Action Plan</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="space-y-6">
              <Accordion type="multiple" defaultValue={["radar", "insights"]} className="space-y-4">
                {/* Mental Profile Radar Section */}
                <AccordionItem
                  value="radar"
                  className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl overflow-hidden rounded-lg border"
                >
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Psychologický Profil
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 space-y-4">
                    {/* Radar chart and graphs - existing code */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/10 backdrop-blur border-purple-500/30 flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
          Psychological Profile
                          </CardTitle>
                          <CardDescription>Vizualizace vašich silných a slabých stránek</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              cx="50%"
                              cy="50%"
                              outerRadius="80%"
                              data={analyticsData.psychologicalProfile.map((item) => ({
                                ...item,
                                A: Number.isNaN(item.A) ? 0 : item.A || 0,
                              }))}
                            >
                              <defs>
                                <linearGradient id="radarPurpleGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#e9d5ff" stopOpacity={1} />
                                  <stop offset="95%" stopColor="#e9d5ff" stopOpacity={1} />
                                </linearGradient>
                              </defs>
                              <PolarGrid stroke="#334155" />
                              <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                name="My Profile"
                                dataKey="A"
                                stroke="#a78bfa"
                                strokeWidth={3}
                                fill="url(#radarPurpleGradient)"
                                fillOpacity={1}
                              />
                              <Tooltip
                                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                                itemStyle={{ color: "#8b5cf6" }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <div className="flex flex-col gap-4">
                        {/* Mental Score Graph */}
                        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 flex-1">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                              <Brain className="w-4 h-4 text-purple-400" />
                              Mental Readiness Score
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={filteredDailyData}>
                                <defs>
                                  <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                <XAxis
                                  dataKey="date"
                                  stroke="#64748b"
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  stroke="#64748b"
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
                                  formatter={(value: any) => `${Math.round(value)}%`}
                                  labelFormatter={() => ""}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="mood"
                                  stroke="#8b5cf6"
                                  strokeWidth={2}
                                  fill="url(#mentalGradient)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* P&L Graph */}
                        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 flex-1">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                              <DollarSign className="w-4 h-4 text-emerald-400" />
                              Financial Performance (P&L)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={filteredDailyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                <XAxis
                                  dataKey="date"
                                  stroke="#64748b"
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  stroke="#64748b"
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(v) => `$${v}`}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }}
                                  formatter={(value: any) => `$${value}`}
                                  labelFormatter={() => ""}
                                />
                                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={16}>
                                  {filteredDailyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Insights Section */}
                <AccordionItem
                  value="insights"
                  className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl overflow-hidden rounded-lg border"
                >
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Akční poznatky ({analyticsData.psychInsights.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Action Insights - existing code */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      {analyticsData.psychInsights.map((insight: any, index: number) => (
                        <Card
                          key={index}
                          className={cn(
                            "border-2 backdrop-blur-sm relative overflow-hidden p-5",
                            insight.type === "success" && "border-green-500/40 bg-green-500/5",
                            insight.type === "warning" && "border-yellow-500/40 bg-yellow-500/5",
                            insight.type === "critical" && "border-red-500/40 bg-red-500/5",
                          )}
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-20">
                            {insight.icon === "😴" && <Moon className="w-20 h-20 text-blue-500" />}
                            {insight.icon === "🧘" && <Activity className="w-20 h-20 text-purple-500" />}
                            {insight.icon === "🎯" && <Target className="w-20 h-20 text-cyan-500" />}
                            {insight.icon === "📋" && <Clipboard className="w-20 h-20 text-orange-500" />}
                            {insight.icon === "😰" && <Flame className="w-20 h-20 text-red-500" />}
                            {insight.icon === "😌" && <Smile className="w-20 h-20 text-green-500" />}
                            {insight.icon === "🎢" && <Activity className="w-20 h-20 text-yellow-500" />}
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-3xl">{insight.icon}</div>
                              <div>
                                <h4 className="text-white font-bold text-lg">{insight.title}</h4>
                                <Badge
                                  className={cn(
                                    "text-xs font-semibold",
                                    insight.type === "success" && "bg-green-500/30 text-green-200 border-green-400",
                                    insight.type === "warning" && "bg-yellow-500/30 text-yellow-200 border-yellow-400",
                                    insight.type === "critical" && "bg-red-500/30 text-red-200 border-red-400",
                                  )}
                                >
                {insight.type === "success" && "POSITIVE"}
                {insight.type === "warning" && "WARNING"}
                {insight.type === "critical" && "CRITICAL"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-200 text-sm mb-4">{insight.description}</p>
                            <div
                              className={cn(
                                "p-3 rounded-lg border text-sm flex items-center gap-2",
                                insight.type === "success" && "bg-green-500/10 border-green-500/30",
                                insight.type === "warning" && "bg-yellow-500/10 border-yellow-500/30",
                                insight.type === "critical" && "bg-red-500/10 border-red-500/30",
                              )}
                            >
                              <Sparkles className="w-4 h-4 flex-shrink-0" />
                              <p className="text-white font-medium">{insight.action}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-right">{insight.impact}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          <TabsContent value="mindset">
            <div className="space-y-6">
              <Accordion type="multiple" defaultValue={["emotions"]} className="space-y-4">
                {/* Emotional Patterns Section */}
                <AccordionItem value="emotions" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-400" />
                      Emoční Vzorce a Jejich Dopad
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-6 bg-slate-900/50">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {analyticsData.emotionalPatterns.map((pattern: any, idx: number) => (
                        <Card
                          key={idx}
                          className={cn(
                            "border-2 transition-all hover:scale-105",
                            pattern.severity === "critical" && "border-red-500/50 bg-red-500/5",
                            pattern.severity === "high" && "border-orange-500/50 bg-orange-500/5",
                            pattern.severity === "medium" && "border-yellow-500/50 bg-yellow-500/5",
                            pattern.severity === "low" && "border-green-500/50 bg-green-500/5",
                          )}
                        >
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <span className="text-2xl">{pattern.emoji}</span>
                              {pattern.name}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "ml-auto",
                                  pattern.severity === "critical" && "border-red-500/50 text-red-400",
                                  pattern.severity === "high" && "border-orange-500/50 text-orange-400",
                                  pattern.severity === "medium" && "border-yellow-500/50 text-yellow-400",
                                  pattern.severity === "low" && "border-green-500/50 text-green-400",
                                )}
                              >
              {pattern.severity === "critical" ? "CRITICAL" :
              pattern.severity === "high" ? "HIGH" :
              pattern.severity === "medium" ? "MEDIUM" : "LOW"}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-gray-300 text-sm">{pattern.description}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                              <div>
                                <p className="text-xs text-gray-500">Number of incidents</p>
                                <p className="text-lg font-bold text-white">{pattern.count}x</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Financial impact</p>
                                <p className={cn(
                                  "text-lg font-bold",
                                  pattern.impact < 0 ? "text-red-400" : "text-green-400"
                                )}>
                                  {pattern.impact >= 0 ? "+" : ""}${pattern.impact.toFixed(0)}
                                </p>
                              </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 mt-3">
                              <p className="text-xs text-gray-400 mb-1">Doporučení:</p>
                              <p className="text-sm text-purple-300">{pattern.recommendation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          <TabsContent value="patterns">
            <div className="space-y-6">
              <Accordion
                type="multiple"
                defaultValue={["sessions", "streaks", "conditions", "summary"]}
                className="space-y-4"
              >
                {/* Trading Sessions Section */}
                <AccordionItem value="sessions" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      Výkon podle Trading Session
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Trading sessions content - existing code */}
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          Výkon podle Trading Session
                        </CardTitle>
                        <CardDescription className="text-gray-400">Kdy obchoduješ nejlépe během dne?</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              name: "Asian Session",
                              icon: <Moon className="w-6 h-6 text-indigo-400" />,
                              time: "00:00 - 08:00",
                              winRate: 45 + Math.random() * 20,
                              trades: Math.floor(Math.random() * 15) + 5,
                              avgPnL: Math.floor((Math.random() - 0.3) * 1500), // CHANGE: Increased avgPnL to thousands
                              color: "indigo",
                            },
                            {
                              name: "London Open",
                              icon: <Sunrise className="w-6 h-6 text-amber-400" />,
                              time: "08:00 - 12:00",
                              winRate: 55 + Math.random() * 25,
                              trades: Math.floor(Math.random() * 25) + 10,
                              avgPnL: Math.floor((Math.random() - 0.2) * 2200), // CHANGE: Increased avgPnL to thousands
                              color: "amber",
                            },
                            {
                              name: "NY Session",
                              icon: <Sun className="w-6 h-6 text-orange-400" />,
                              time: "13:00 - 18:00",
                              winRate: 50 + Math.random() * 30,
                              trades: Math.floor(Math.random() * 30) + 15,
                              avgPnL: Math.floor((Math.random() - 0.25) * 2800), // CHANGE: Increased avgPnL to thousands
                              color: "orange",
                            },
                            {
                              name: "Evening",
                              icon: <Sunset className="w-6 h-6 text-rose-400" />,
                              time: "18:00 - 24:00",
                              winRate: 40 + Math.random() * 20,
                              trades: Math.floor(Math.random() * 10) + 3,
                              avgPnL: Math.floor((Math.random() - 0.4) * 1200), // CHANGE: Increased avgPnL to thousands
                              color: "rose",
                            },
                          ].map((session, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {session.icon}
                                  <div>
                                    <h4 className="text-white font-bold">{session.name}</h4>
                                    <p className="text-gray-400 text-xs">{session.time}</p>
                                  </div>
                                </div>
                                <Badge
                                  className={cn(
                                    "text-sm font-bold",
                                    session.winRate >= 60
                                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                                      : session.winRate >= 50
                                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                        : "bg-red-500/20 text-red-300 border-red-500/30",
                                  )}
                                >
                                  {Math.round(session.winRate)}% WR
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-400 text-xs">Trades</p>
                                  <p className="text-white font-bold">{session.trades}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Avg P&L</p>
                                  <p
                                    className={cn("font-bold", session.avgPnL >= 0 ? "text-green-400" : "text-red-400")}
                                  >
                                    {session.avgPnL >= 0 ? "+" : ""}${session.avgPnL}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs">Rating</p>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          i < Math.floor(session.winRate / 20)
                                            ? `bg-${session.color}-400`
                                            : "bg-slate-600",
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                          <div className="flex items-start gap-2">
                            <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-cyan-300 font-semibold text-sm mb-1">💡 Pattern Insight:</p>
                              <p className="text-white text-sm">
                                Tvůj best trading window je London Open (08:00-12:00). Soustřeď 70% tradů do tohoto
                                času!
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Win/Loss Streaks Section */}
                <AccordionItem value="streaks" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <TrendingUpDown className="w-5 h-5 text-purple-400" />
                      Winning vs Losing Streaks
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Streaks content - existing code */}
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUpDown className="w-5 h-5 text-purple-400" />
                          Winning vs Losing Streaks
                        </CardTitle>
                        <CardDescription className="text-gray-400">Kdy zvládáš série výher a proher?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-green-400" />
                              <p className="text-green-300 font-semibold text-sm">Winning Streaks</p>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">
                              {analyticsData.streakStats.maxWinStreak} <span className="text-lg text-gray-400">tradů</span>
                            </p>
                            <p className="text-green-400 text-xs">Nejdelší série</p>
                          </div>

                          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-5 h-5 text-red-400" />
                              <p className="text-red-300 font-medium text-sm">Losing Streaks</p>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">
                              {analyticsData.streakStats.maxLossStreak} <span className="text-lg text-gray-400">tradů</span>
                            </p>
                            <p className="text-red-400 text-xs">Nejdelší série</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-blue-400" />
                                <p className="text-white font-medium text-sm">Recovery Rate po ztrátě</p>
                              </div>
                              <span className="text-blue-400 font-bold">{analyticsData?.recoveryRate || 0}%</span>
                            </div>
                            <p className="text-gray-400 text-xs">
                              Pravděpodobnost, že další trade po ztrátě bude ziskový
                            </p>
                          </div>

                          <div className="p-4 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-purple-400" />
                                <p className="text-white font-medium text-sm">Streak Consistency</p>
                              </div>
                              <span className="text-purple-400 font-bold">{analyticsData?.streakConsistency || 0}%</span>
                            </div>
                            <p className="text-gray-400 text-xs">Jak dobře udržuješ momentum při winning streaku</p>
                          </div>

                          <div className="p-4 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                <p className="text-white font-medium text-sm">Revenge Trading Risk</p>
                              </div>
                              <span className="text-orange-400 font-bold">{analyticsData?.revengeTradeRisk || 0}%</span>
                            </div>
                            <p className="text-gray-400 text-xs">Tendence k impulzivním obchodům po ztrátě</p>
                          </div>
                        </div>

                        {analyticsData?.criticalFindings && analyticsData.criticalFindings.length > 0 && (
                          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                              <div className="space-y-2">
                                {analyticsData.criticalFindings.map((finding: any, idx: number) => (
                                  <div key={idx}>
                                    <p className="text-orange-300 font-semibold text-sm mb-1">{finding.title}</p>
                                    <p className="text-white text-sm">{finding.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Market Conditions Performance */}
                <AccordionItem value="conditions" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <CloudRain className="w-5 h-5 text-sky-400" />
                      Výkon v různých trzích
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Market conditions content - existing code */}
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CloudRain className="w-5 h-5 text-sky-400" />
                          Performance v různých Market Conditions
                        </CardTitle>
                        <CardDescription className="text-gray-400">Kdy obchoduješ a kdy ne?</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            {
                              condition: "Strong Trend",
                              icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                              winRate: 65 + Math.random() * 20,
                              trades: Math.floor(Math.random() * 30) + 20,
                              avgPnL: Math.floor((Math.random() - 0.1) * 400),
                              color: "green",
                              recommendation: "BEST - Tvůj top market!",
                            },
                            {
                              condition: "Ranging",
                              icon: <TrendingUpDown className="w-6 h-6 text-yellow-400" />,
                              winRate: 45 + Math.random() * 15,
                              trades: Math.floor(Math.random() * 25) + 15,
                              avgPnL: Math.floor((Math.random() - 0.35) * 250),
                              color: "yellow",
                              recommendation: "Opatrně - nižší edge",
                            },
                            {
                              condition: "High Volatility",
                              icon: <Zap className="w-6 h-6 text-orange-400" />,
                              winRate: 50 + Math.random() * 20,
                              trades: Math.floor(Math.random() * 20) + 10,
                              avgPnL: Math.floor((Math.random() - 0.25) * 350),
                              color: "orange",
                              recommendation: "Mixed results",
                            },
                            {
                              condition: "Low Volume",
                              icon: <Wind className="w-6 h-6 text-slate-400" />,
                              winRate: 35 + Math.random() * 15,
                              trades: Math.floor(Math.random() * 15) + 5,
                              avgPnL: Math.floor((Math.random() - 0.45) * 200),
                              color: "slate",
                              recommendation: "AVOID - nejhorší edge",
                            },
                          ].map((market, idx) => (
                            <Card
                              key={idx}
                              className={cn(
                                "bg-slate-700/30 border-2",
                                market.color === "green" && "border-green-500/30",
                                market.color === "yellow" && "border-yellow-500/30",
                                market.color === "orange" && "border-orange-500/30",
                                market.color === "slate" && "border-red-500/30", // Changed to red for low volume warning
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  {market.icon}
                                  <div>
                                    <h4 className="text-white font-bold text-sm">{market.condition}</h4>
                                    <p className="text-gray-400 text-xs">{market.trades} trades</p>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Úspěšnost</span>
                                    <Badge
                                      className={cn(
                                        "text-xs",
                                        market.winRate >= 60
                                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                                          : market.winRate >= 50
                                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                            : "bg-red-500/20 text-red-300 border-red-500/30",
                                      )}
                                    >
                                      {Math.round(market.winRate)}%
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">Průměr P&L</span>
                                    <span
                                      className={cn(
                                        "font-bold text-sm",
                                        market.avgPnL >= 0 ? "text-green-400" : "text-red-400",
                                      )}
                                    >
                                      {market.avgPnL >= 0 ? "+" : ""}${market.avgPnL}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={cn(
                                    "p-2 rounded text-center text-xs font-semibold",
                                    market.color === "green" && "bg-green-500/20 text-green-300",
                                    market.color === "yellow" && "bg-yellow-500/20 text-yellow-300",
                                    market.color === "orange" && "bg-orange-500/20 text-orange-300",
                                    market.color === "slate" && "bg-red-500/20 text-red-300", // Changed to red for low volume warning
                                  )}
                                >
                                  {market.recommendation}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                          <div className="flex items-start gap-3">
                            <Award className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-green-300 font-bold text-base mb-2">🎯 Pattern Recommendation:</p>
                              <p className="text-white text-sm mb-2">
                                Tuje performance je o 45% lepší v strong trending markets! Nauč se identifikovat trendy
                                pomocí:
                              </p>
                              <ul className="text-gray-300 text-sm space-y-1 ml-4 list-disc">
                                <li>Moving averages alignment (20/50/200 EMA)</li>
                                <li>Higher highs & higher lows structure</li>
                                <li>Increased volume na směru trendu</li>
                                <li>Breakout z consolidation zones</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Summary Recommendations Section */}
                <AccordionItem value="summary" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <TrendingUpDown className="w-5 h-5 text-purple-400" />
                      Trading Edge Summary
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Summary content - existing code */}
                    <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/40 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl border-2 border-purple-400/30">
                            <TrendingUpDown className="w-10 h-10 text-purple-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-black text-white mb-3">🎯 Tvoje Trading Edge - Shrnutí</h3>

                            {/* CHANGE: Upravená Trading Edge Summary - vertikální layout pro lepší přehlednost */}
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                                  <p className="text-sm text-gray-400 mb-2">Potenciální zlepšení</p>
                                  <p className="text-4xl font-black text-cyan-300">
                                    +{15 + analyticsData.actionPlan.length * 5}%
                                  </p>
                                </div>

                                <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                                  <p className="text-sm text-gray-400 mb-2">Časová investice</p>
                                  <p className="text-4xl font-black text-purple-300">
                                    {analyticsData.actionPlan.length * 7} dní
                                  </p>
                                </div>

                                <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                                  <p className="text-sm text-gray-400 mb-2">Priorita</p>
                                  <p className="text-4xl font-black text-pink-300">VYSOKÁ</p>
                                </div>
                              </div>

                              <p className="text-center text-gray-200 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                                Implementací těchto psychologických změn můžeš výrazně zlepšit svou mentální kondici a
                                trading performance.
                                <span className="text-cyan-300 font-bold"> Zaměř se na mindset = zaměř se na výsledky!</span>{" "}
                                🚀
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          <TabsContent value="action">
            <div className="space-y-6">
              <Accordion type="multiple" defaultValue={["plan", "quick-wins"]} className="space-y-4">
                {/* Action Plan Section */}
                <AccordionItem value="plan" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-400" />
                      Personalizovaný Akční Plán ({analyticsData.actionPlan.length} akcí)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Action plan content - existing code */}
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="w-6 h-6 text-purple-400" />
                          Tvůj personalizovaný akční plán
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Konkrétní kroky pro zlepšení mindsetu
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analyticsData.actionPlan.length > 0 ? (
                          <div className="space-y-4">
                            {analyticsData.actionPlan.map((action: any, index: number) => {
                              const priorityColors: { [key: string]: string } = {
                                high: "bg-red-500/20 text-red-300 border-red-500/30",
                                medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                              }
                              return (
                                <Card
                                  key={index}
                                  className={cn(
                                    "bg-slate-700/50 border",
                                    action.priority === "high" && "border-red-500/40",
                                    action.priority === "medium" && "border-yellow-500/40",
                                  )}
                                >
                                  <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                      <div className="text-4xl">{action.emoji}</div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Badge className={priorityColors[action.priority]}>
                                            {action.priority === "high" && "⚠️ Vysoká priorita"}
                                            {action.priority === "medium" && "⚡ Střední priorita"}
                                          </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                                        <p className="text-gray-200 mb-3">{action.description}</p>
                                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 mb-3">
                                          <div className="flex items-start gap-2">
                                            <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-purple-300 font-semibold text-sm mb-1">
                                                Konkrétní akce:
                                              </p>
                                              <p className="text-white">{action.action}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-4 h-4 text-cyan-400" />
                                          <span className="text-cyan-300 font-medium text-sm">{action.impact}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Skvělá práce! 🎉</h3>
                            <p className="text-gray-400">Tvůj mindset je v perfektní kondici. Pokračuj!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                {/* Sekce Rychlých výher */}
                <AccordionItem value="quick-wins" className="border-slate-600 rounded-lg border overflow-hidden">
                  <AccordionTrigger className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-6 py-4 text-white font-semibold">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Rychlé výhry - Začni hned dnes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    {/* Quick wins content - existing code */}
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          Rychlé výhry - Začni hned dnes
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Jednoduché kroky s okamžitým dopadem
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { icon: "📊", text: "Trackuj mood PRED každým trading session" },
                            { icon: "✍️", text: "Journal každý obchod do 1 hodiny po zavření" },
                            { icon: "😴", text: "Cíl: min. 7h spánku pro optimální performance" },
                            { icon: "🎯", text: "Po 2 ztrátách = 30min pauza (no exceptions!)" },
                            { icon: "🧘", text: "5min meditation před tradingem (game changer)" },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500/30 transition-colors"
                            >
                              <span className="text-2xl">{item.icon}</span>
                              <p className="text-white flex-1">{item.text}</p>
                              <CheckCircle2 className="w-5 h-5 text-green-400 opacity-0 hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* IMPROVED FINAL CARD - CLEANER DESIGN */}
              {analyticsData.actionPlan.length > 0 && (
                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/40 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-cyan-600/10 to-purple-600/10" />
                  <CardContent className="p-8 relative">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-2xl border-2 border-purple-400/30">
                          <Brain className="w-10 h-10 text-purple-300" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-3xl font-black text-white mb-2">💪 Celkový Potenciál Zlepšení</h3>
                          <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 text-base px-4 py-1">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {analyticsData.actionPlan.length} konkrétních akcí
                          </Badge>
                        </div>
                      </div>

                      <p className="text-center text-gray-200 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                        Implementací těchto psychologických změn můžeš výrazně zlepšit svou mentální kondici a trading
                        performance.
                        <span className="text-cyan-300 font-bold">Zaměř se na mindset = zaměř se na výsledky!</span> 🚀
                      </p>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                          <p className="text-sm text-gray-400 mb-2">Potenciální zlepšení</p>
                          <p className="text-4xl font-black text-cyan-300">+{15 + analyticsData.actionPlan.length * 5}%</p>
                        </div>
                        <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                          <p className="text-sm text-gray-400 mb-2">Časová investice</p>
                          <p className="text-4xl font-black text-purple-300">{analyticsData.actionPlan.length * 7} dní</p>
                        </div>
                        <div className="p-6 bg-slate-700/50 rounded-xl border border-white/10 text-center">
                          <p className="text-sm text-gray-400 mb-2">Priorita</p>
                          <p className="text-4xl font-black text-pink-300">VYSOKÁ</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Morning Check Modal */}
      {showMorningCheck && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl">
            <MorningAssessment onComplete={() => setShowMorningCheck(false)} />
          </div>
        </div>
      )}

      {/* Record Trades Modal */}
      {showRecordTrades && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl">
            <RecordTrades onComplete={() => setShowRecordTrades(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
