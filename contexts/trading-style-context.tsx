"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

export type TradingStyle = "scalper" | "day-trader" | "swing-trader" | null

interface TradingStyleConfig {
  name: string
  description: string
  characteristics: string[]
  metrics: {
    primary: string[]
    secondary: string[]
  }
  journalFields: {
    required: string[]
    optional: string[]
  }
  analyticsCharts: string[]
  morningCheckQuestions: string[]
  weeklyReviewFocus: string[]
  gamification: {
    achievements: string[]
    xpMultipliers: Record<string, number>
  }
}

const TRADING_STYLE_CONFIGS: Record<Exclude<TradingStyle, null>, TradingStyleConfig> = {
  scalper: {
    name: "Scalper",
    description: "Velmi krátké obchody (sekundy až minuty), vysoká frekvence",
    characteristics: [
      "Desítky až stovky obchodů denně",
      "Focus na rychlé rozhodování",
      "Session-based tracking",
      "Time-of-day analysis",
    ],
    metrics: {
      primary: ["session_pnl", "trades_per_session", "focus_score", "energy_level", "reaction_time"],
      secondary: ["time_of_day_performance", "concentration_duration", "break_frequency"],
    },
    journalFields: {
      required: ["session_start", "session_end", "total_trades", "session_pnl", "focus_level"],
      optional: ["best_time", "worst_time", "energy_drops", "break_times"],
    },
    analyticsCharts: [
      "session_performance",
      "time_of_day_heatmap",
      "focus_vs_pnl",
      "trades_per_hour",
      "energy_correlation",
    ],
    morningCheckQuestions: [
      "Jak rychle reaguješ dnes? (reaction time)",
      "Jaká je tvá schopnost koncentrace? (focus duration)",
      "Kolik energie máš na intenzivní session? (energy for intensity)",
    ],
    weeklyReviewFocus: [
      "Nejlepší trading sessions (čas, podmínky)",
      "Energy management během dne",
      "Focus patterns a koncentrace",
      "Rychlost rozhodování",
    ],
    gamification: {
      achievements: [
        "100 trades in one session",
        "Perfect focus session (no breaks)",
        "Morning session master",
        "Speed demon (fastest reaction time)",
      ],
      xpMultipliers: {
        session_completion: 1.5,
        high_focus: 2.0,
        morning_trading: 1.3,
      },
    },
  },
  "day-trader": {
    name: "Day Trader",
    description: "Obchody během dne (minuty až hodiny), střední frekvence",
    characteristics: [
      "5-20 obchodů denně",
      "Focus na disciplínu a plán",
      "Detailní journaling každého obchodu",
      "Emoční kontrola během dne",
    ],
    metrics: {
      primary: ["daily_pnl", "win_rate", "risk_reward", "plan_adherence", "emotional_control"],
      secondary: ["revenge_trading_score", "patience_score", "discipline_rating"],
    },
    journalFields: {
      required: ["pair", "entry", "exit", "pnl", "setup_type", "emotions", "plan_followed"],
      optional: ["market_conditions", "news_impact", "mistakes", "lessons_learned"],
    },
    analyticsCharts: [
      "daily_pnl_trend",
      "win_rate_by_setup",
      "emotional_state_vs_performance",
      "plan_adherence_correlation",
      "risk_management_score",
    ],
    morningCheckQuestions: [
      "Jak disciplinovaný se dnes cítíš? (discipline level)",
      "Jaká je tvá emoční stabilita? (emotional control)",
      "Jak dobře jsi připraven držet se plánu? (plan adherence)",
    ],
    weeklyReviewFocus: [
      "Dodržování trading plánu",
      "Emoční kontrola během tradingu",
      "Risk management kvalita",
      "Setup success rate",
    ],
    gamification: {
      achievements: [
        "Perfect plan execution (100% adherence)",
        "Emotional master (no revenge trades)",
        "Risk manager (perfect R:R)",
        "Discipline warrior (7-day streak)",
      ],
      xpMultipliers: {
        plan_adherence: 2.0,
        emotional_control: 1.8,
        risk_management: 1.5,
      },
    },
  },
  "swing-trader": {
    name: "Swing Trader",
    description: "Obchody přes několik dní (dny až týdny), nízká frekvence",
    characteristics: [
      "1-5 obchodů týdně",
      "Focus na trpělivost a analýzu",
      "Velmi detailní journaling s fundamentální analýzou",
      "Long-term thinking",
    ],
    metrics: {
      primary: ["weekly_pnl", "position_hold_time", "patience_score", "analysis_quality", "long_term_vision"],
      secondary: ["fundamental_analysis_depth", "technical_confluence", "position_sizing"],
    },
    journalFields: {
      required: [
        "pair",
        "entry",
        "target",
        "stop_loss",
        "fundamental_thesis",
        "technical_analysis",
        "position_size",
        "hold_duration",
      ],
      optional: ["macro_factors", "correlation_analysis", "risk_of_ruin", "portfolio_impact", "exit_strategy"],
    },
    analyticsCharts: [
      "weekly_pnl_trend",
      "hold_time_vs_profit",
      "patience_correlation",
      "analysis_quality_score",
      "fundamental_vs_technical",
    ],
    morningCheckQuestions: [
      "Jak trpělivý jsi dnes? (patience level)",
      "Jaká je tvá schopnost long-term thinking? (strategic thinking)",
      "Jak kvalitní je tvá analýza? (analysis depth)",
    ],
    weeklyReviewFocus: [
      "Kvalita fundamentální analýzy",
      "Trpělivost při čekání na setup",
      "Position management",
      "Long-term strategy adherence",
    ],
    gamification: {
      achievements: [
        "Patient trader (held position 7+ days)",
        "Analysis master (perfect thesis)",
        "Strategic thinker (long-term vision)",
        "Position manager (perfect sizing)",
      ],
      xpMultipliers: {
        patience: 2.5,
        analysis_quality: 2.0,
        long_term_thinking: 1.8,
      },
    },
  },
}

interface TradingStyleContextType {
  tradingStyle: TradingStyle
  setTradingStyle: (style: TradingStyle) => void
  config: TradingStyleConfig | null
  isConfigured: boolean
}

const TradingStyleContext = createContext<TradingStyleContextType | undefined>(undefined)

export function TradingStyleProvider({ children }: { children: React.ReactNode }) {
  const [tradingStyle, setTradingStyleState] = useState<TradingStyle>(null)

  useEffect(() => {
    const saved = localStorage.getItem("trader-mindset-trading-style")
    if (saved && (saved === "scalper" || saved === "day-trader" || saved === "swing-trader")) {
      setTradingStyleState(saved as TradingStyle)
    }
  }, [])

  const setTradingStyle = (style: TradingStyle) => {
    setTradingStyleState(style)
    if (style) {
      localStorage.setItem("trader-mindset-trading-style", style)
      toast({
        title: "Trading Style nastaven",
        description: `Aplikace je nyní přizpůsobena pro ${TRADING_STYLE_CONFIGS[style].name}`,
      })
    } else {
      localStorage.removeItem("trader-mindset-trading-style")
    }
  }

  const config = tradingStyle ? TRADING_STYLE_CONFIGS[tradingStyle] : null

  return (
    <TradingStyleContext.Provider
      value={{
        tradingStyle,
        setTradingStyle,
        config,
        isConfigured: tradingStyle !== null,
      }}
    >
      {children}
    </TradingStyleContext.Provider>
  )
}

export function useTradingStyle() {
  const context = useContext(TradingStyleContext)
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        tradingStyle: null,
        setTradingStyle: () => {},
        config: null,
        isConfigured: false,
      }
    }
    throw new Error("useTradingStyle must be used within a TradingStyleProvider")
  }
  return context
}
