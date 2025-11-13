"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Demo trades data for virtual mode
const DEMO_TRADES = [
  {
    id: "demo-1",
    date: "2024-01-15",
    pair: "EUR/USD",
    type: "Long",
    entry: 1.095,
    exit: 1.098,
    size: 1.0,
    pnl: 300,
    notes: "Strong bullish momentum after ECB announcement",
    mood: 8,
    confidence: 9,
    tags: ["breakout", "news"],
  },
  {
    id: "demo-2",
    date: "2024-01-16",
    pair: "GBP/JPY",
    type: "Short",
    entry: 185.5,
    exit: 184.8,
    size: 0.5,
    pnl: 350,
    notes: "Perfect rejection at resistance level",
    mood: 9,
    confidence: 8,
    tags: ["resistance", "technical"],
  },
  {
    id: "demo-3",
    date: "2024-01-17",
    pair: "USD/CAD",
    type: "Long",
    entry: 1.342,
    exit: 1.338,
    size: 0.8,
    pnl: -320,
    notes: "Stopped out by unexpected oil price surge",
    mood: 4,
    confidence: 6,
    tags: ["stop-loss", "commodities"],
  },
  {
    id: "demo-4",
    date: "2024-01-18",
    pair: "AUD/USD",
    type: "Long",
    entry: 0.665,
    exit: 0.672,
    size: 1.2,
    pnl: 840,
    notes: "Great follow-through after RBA hawkish stance",
    mood: 9,
    confidence: 9,
    tags: ["central-bank", "momentum"],
  },
  {
    id: "demo-5",
    date: "2024-01-19",
    pair: "EUR/GBP",
    type: "Short",
    entry: 0.858,
    exit: 0.862,
    size: 0.6,
    pnl: -240,
    notes: "Wrong direction, UK data stronger than expected",
    mood: 5,
    confidence: 7,
    tags: ["data-miss", "reversal"],
  },
  {
    id: "demo-6",
    date: "2024-01-20",
    pair: "USD/JPY",
    type: "Long",
    entry: 148.2,
    exit: 148.9,
    size: 1.0,
    pnl: 700,
    notes: "Clean break above key resistance",
    mood: 8,
    confidence: 8,
    tags: ["breakout", "yen-weakness"],
  },
  {
    id: "demo-7",
    date: "2024-01-21",
    pair: "GBP/USD",
    type: "Short",
    entry: 1.272,
    exit: 1.268,
    size: 0.7,
    pnl: 280,
    notes: "Nice scalp on London open volatility",
    mood: 7,
    confidence: 7,
    tags: ["scalp", "session-open"],
  },
]

// Demo journal entries for virtual mode
const DEMO_JOURNAL_ENTRIES = [
  {
    id: "demo-journal-1",
    date: "2024-01-15",
    mood: 8,
    confidence: 9,
    notes: "Great trading day! Stayed disciplined and followed my plan perfectly. The EUR/USD setup was textbook.",
    tags: ["discipline", "plan-execution"],
    type: "trade",
  },
  {
    id: "demo-journal-2",
    date: "2024-01-16",
    mood: 9,
    confidence: 8,
    notes: "Another solid day. The technical analysis is really paying off. GBP/JPY resistance held perfectly.",
    tags: ["technical-analysis", "consistency"],
    type: "trade",
  },
  {
    id: "demo-journal-3",
    date: "2024-01-17",
    mood: 6,
    confidence: 6,
    notes:
      "Tough day with the stop loss, but risk management saved me from bigger losses. Oil news caught me off guard.",
    tags: ["risk-management", "learning"],
    type: "reflection",
  },
  {
    id: "demo-journal-4",
    date: "2024-01-18",
    mood: 9,
    confidence: 9,
    notes: "Excellent read on the RBA decision. Fundamental analysis combined with technicals worked perfectly.",
    tags: ["fundamentals", "central-banks"],
    type: "trade",
  },
  {
    id: "demo-journal-5",
    date: "2024-01-19",
    mood: 7,
    confidence: 7,
    notes: "Mixed day. Need to be more careful with UK data releases. The market reaction was stronger than expected.",
    tags: ["data-releases", "improvement"],
    type: "reflection",
  },
  {
    id: "demo-journal-6",
    date: "2024-01-20",
    mood: 8,
    confidence: 8,
    notes: "USD/JPY breakout was textbook. Love when the setup works exactly as planned.",
    tags: ["breakouts", "plan-execution"],
    type: "trade",
  },
  {
    id: "demo-journal-7",
    date: "2024-01-21",
    mood: 7,
    confidence: 7,
    notes: "Quick scalp worked well. Need to be more selective with these setups to improve consistency.",
    tags: ["scalping", "selectivity"],
    type: "trade",
  },
]

// Demo stats for virtual mode
const DEMO_STATS = {
  totalPnL: 1630,
  totalTrades: 7,
  winningTrades: 5,
  losingTrades: 2,
  winRate: 71.4,
  averageWin: 434,
  averageLoss: -280,
  profitFactor: 1.55,
  maxDrawdown: -320,
  averageMood: 7.4,
  bestDay: 840,
  worstDay: -320,
  consecutiveWins: 3,
  consecutiveLosses: 1,
  riskRewardRatio: 1.8,
  sharpeRatio: 1.2,
}

// Function to generate random trading stats for virtual mode
const generateRandomTradingStats = () => {
  return {
    totalPnL: Math.floor(Math.random() * 20000) - 5000,
    totalTrades: Math.floor(Math.random() * 200),
    winningTrades: Math.floor(Math.random() * 150),
    losingTrades: Math.floor(Math.random() * 50),
    winRate: Math.floor(Math.random() * 100),
    averageWin: Math.floor(Math.random() * 1000),
    averageLoss: -Math.floor(Math.random() * 500),
    profitFactor: Math.random() * 3,
    maxDrawdown: -Math.floor(Math.random() * 1000),
    averageMood: Math.floor(Math.random() * 10),
    bestDay: Math.floor(Math.random() * 2000),
    worstDay: -Math.floor(Math.random() * 1000),
    consecutiveWins: Math.floor(Math.random() * 10),
    consecutiveLosses: Math.floor(Math.random() * 5),
    riskRewardRatio: Math.random() * 5,
    sharpeRatio: Math.random() * 2,
  }
}

interface DataContextType {
  isLiveMode: boolean
  hasEverSwitchedToLive: boolean
  showLiveWarning: boolean
  setShowLiveWarning: (show: boolean) => void
  switchToLive: () => void
  switchToVirtual: () => void
  getAllTrades: () => any[]
  getAllJournalEntries: () => any[]
  getTradingStats: () => any
  clearAllData: () => void
  resetAllScores: () => void
  isOwner: boolean
  canSwitchModes: boolean
  portfolioValue: number
  setPortfolioValue: (value: number) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [hasEverSwitchedToLive, setHasEverSwitchedToLive] = useState(false)
  const [showLiveWarning, setShowLiveWarning] = useState(false)
  const [portfolioValue, setPortfolioValueState] = useState(10000)
  const { user } = useAuth()

  // Check if current user is owner or can switch modes
  const isOwner = user?.email === "owner@tradermindset.com"
  const canSwitchModes = user?.email === "honza.newage@gmail.com" || isOwner

  useEffect(() => {
    // Check if we're in live mode on mount
    const liveMode = localStorage.getItem("trader-mindset-live-mode") === "true"
    const everSwitched = localStorage.getItem("trader-mindset-ever-switched-live") === "true"

    setIsLiveMode(liveMode)
    setHasEverSwitchedToLive(everSwitched)

    // Load portfolio value
    const savedPortfolio = localStorage.getItem("trader-mindset-portfolio-value")
    if (savedPortfolio) {
      setPortfolioValueState(Number.parseFloat(savedPortfolio))
    }

    // If in virtual mode, ensure demo data is available
    if (!liveMode) {
      loadDemoDataIfNeeded()
    }
  }, [])

  const setPortfolioValue = (value: number) => {
    setPortfolioValueState(value)
    localStorage.setItem("trader-mindset-portfolio-value", value.toString())
  }

  const loadDemoDataIfNeeded = () => {
    // Check if user has any real data
    const userTrades = localStorage.getItem("user-trades")
    const userJournals = localStorage.getItem("user-journal-entries")

    // If no user data exists, we'll show demo data via getAllTrades/getAllJournalEntries
    // No need to store demo data in localStorage
  }

  const getAllTrades = () => {
    if (isLiveMode) {
      // Return only user's real trades in live mode
      const userTrades = localStorage.getItem("user-trades")
      return userTrades ? JSON.parse(userTrades) : []
    } else {
      // Return demo trades + user trades in virtual mode
      const userTrades = localStorage.getItem("user-trades")
      const parsedUserTrades = userTrades ? JSON.parse(userTrades) : []
      return [...DEMO_TRADES, ...parsedUserTrades]
    }
  }

  const getAllJournalEntries = () => {
    if (isLiveMode) {
      // Return only user's real journal entries in live mode
      const userEntries = localStorage.getItem("user-journal-entries")
      return userEntries ? JSON.parse(userEntries) : []
    } else {
      // Return demo entries + user entries in virtual mode
      const userEntries = localStorage.getItem("user-journal-entries")
      const parsedUserEntries = userEntries ? JSON.parse(userEntries) : []
      return [...DEMO_JOURNAL_ENTRIES, ...parsedUserEntries]
    }
  }

  const getTradingStats = () => {
    if (isLiveMode) {
      // Calculate stats from user's real data only
      const userTrades = getAllTrades()
      if (userTrades.length === 0) {
        return {
          totalPnL: 0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          averageWin: 0,
          averageLoss: 0,
          profitFactor: 0,
          maxDrawdown: 0,
          averageMood: 0,
          bestDay: 0,
          worstDay: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
          riskRewardRatio: 0,
          sharpeRatio: 0,
        }
      }

      // Calculate real stats from user trades
      const totalPnL = userTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0)
      const totalTrades = userTrades.length
      const winningTrades = userTrades.filter((trade: any) => (trade.pnl || 0) > 0).length
      const losingTrades = userTrades.filter((trade: any) => (trade.pnl || 0) < 0).length
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

      const wins = userTrades.filter((trade: any) => (trade.pnl || 0) > 0).map((trade: any) => trade.pnl || 0)
      const losses = userTrades.filter((trade: any) => (trade.pnl || 0) < 0).map((trade: any) => trade.pnl || 0)

      const averageWin = wins.length > 0 ? wins.reduce((sum: number, win: number) => sum + win, 0) / wins.length : 0
      const averageLoss =
        losses.length > 0 ? losses.reduce((sum: number, loss: number) => sum + loss, 0) / losses.length : 0

      const profitFactor = averageLoss !== 0 ? Math.abs(averageWin / averageLoss) : 0
      const maxDrawdown = Math.min(...userTrades.map((trade: any) => trade.pnl || 0), 0)

      const averageMood =
        userTrades.length > 0
          ? userTrades.reduce((sum: number, trade: any) => sum + (trade.mood || 0), 0) / userTrades.length
          : 0

      const bestDay = Math.max(...userTrades.map((trade: any) => trade.pnl || 0), 0)
      const worstDay = Math.min(...userTrades.map((trade: any) => trade.pnl || 0), 0)

      return {
        totalPnL,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        averageWin,
        averageLoss,
        profitFactor,
        maxDrawdown,
        averageMood,
        bestDay,
        worstDay,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        riskRewardRatio: profitFactor,
        sharpeRatio: 0,
      }
    } else {
      // Return demo stats in virtual mode
      return generateRandomTradingStats()
    }
  }

  const clearAllData = () => {
    // Clear all user data (trades, journal, mood)
    localStorage.removeItem("user-trades")
    localStorage.removeItem("user-journal-entries")
    localStorage.removeItem("user-mood-entries")
    localStorage.removeItem("user-behavioral-analysis")
    localStorage.removeItem("user-trading-goals")
    localStorage.removeItem("user-risk-settings")

    // Clear MindTrader data
    localStorage.removeItem("trader-mindset-mindtrader-history")
    localStorage.removeItem("mindtrader-chat-history")
    localStorage.removeItem("mindtrader-sessions")

    // Clear Team Club data
    localStorage.removeItem("trader-mindset-team-club-data")
    localStorage.removeItem("team-club-mentoring")
    localStorage.removeItem("team-club-challenges")

    // Clear Daily Tracker data
    localStorage.removeItem("daily-tracker-entries")
    localStorage.removeItem("daily-assessments")

    // Clear Analytics data
    localStorage.removeItem("trader-mindset-analytics-data")
    localStorage.removeItem("trader-mindset-performance-data")
    localStorage.removeItem("trader-mindset-emotional-data")
    localStorage.removeItem("trader-mindset-trading-patterns")
    localStorage.removeItem("trader-mindset-risk-data")

    // Clear other related data
    localStorage.removeItem("trader-mindset-dashboard-stats")
    localStorage.removeItem("trader-mindset-custom-affirmations")
  }

  const resetAllScores = () => {
    clearAllData()
  }

  const switchToLive = () => {
    if (!canSwitchModes) {
      toast({
        title: "Přístup odepřen",
        description: "Nemáte oprávnění přepínat mezi režimy.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    localStorage.setItem("trader-mindset-live-mode", "true")
    localStorage.setItem("trader-mindset-ever-switched-live", "true")
    setIsLiveMode(true)
    setHasEverSwitchedToLive(true)
    setShowLiveWarning(false)

    // Clear all demo and user data when switching to live
    clearAllData()

    toast({
      title: "Přepnuto na Live režim",
      description: "Nyní pracujete s reálnými daty. Všechna demo data byla vymazána.",
      duration: 5000,
    })

    // Reload to ensure all components get fresh data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const switchToVirtual = () => {
    if (!canSwitchModes) {
      toast({
        title: "Přístup odepřen",
        description: "Nemáte oprávnění přepínat mezi režimy.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    localStorage.setItem("trader-mindset-live-mode", "false")
    setIsLiveMode(false)

    toast({
      title: "Přepnuto na Virtual režim",
      description: "Nyní pracujete s demo daty pro testování funkcí. Vaše reálná data zůstávají zachována.",
      duration: 5000,
    })

    // Reload to load demo data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <DataContext.Provider
      value={{
        isLiveMode,
        hasEverSwitchedToLive,
        showLiveWarning,
        setShowLiveWarning,
        switchToLive,
        switchToVirtual,
        getAllTrades,
        getAllJournalEntries,
        getTradingStats,
        clearAllData,
        resetAllScores,
        isOwner,
        canSwitchModes,
        portfolioValue,
        setPortfolioValue,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
