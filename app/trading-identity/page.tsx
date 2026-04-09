"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  Brain,
  Target,
  Eye,
  Zap,
  Shield,
  BarChart3,
  Heart,
  Clock,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"
import { useLanguage } from "@/contexts/language-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  category: string
  question: string
  type: "single" | "scale" | "multiple"
  options?: { value: string; label: string; description?: string; traits: string[] }[]
  scaleLabels?: { min: string; max: string }
  scaleTraits?: { low: string[]; high: string[] }
}

interface TraderProfile {
  completed: boolean
  completedDate?: string
  answers: Record<string, string | number>
  traits: Record<string, number>
  persona: string
  description: string
  strengths: string[]
  risks: string[]
  recommendations: string[]
  idealTimeframe: string
  idealMarkets: string[]
  psychologicalProfile: {
    emotionalControl: number
    discipline: number
    patience: number
    riskTolerance: number
    analyticalThinking: number
    adaptability: number
  }
}

const questions: Question[] = [
  {
    id: "trading-experience",
    category: "Experience",
    question: "How long have you been actively trading?",
    type: "single",
    options: [
      {
        value: "beginner",
        label: "Less than 1 year",
        description: "Still learning the basics",
        traits: ["learning", "cautious"],
      },
      {
        value: "intermediate",
        label: "1-3 years",
        description: "I have basic experience",
        traits: ["developing", "growing"],
      },
      { value: "advanced", label: "3-5 years", description: "I understand markets well", traits: ["experienced", "confident"] },
      { value: "expert", label: "5+ years", description: "I'm an experienced trader", traits: ["expert", "seasoned"] },
    ],
  },
  {
    id: "learning-style",
    category: "Learning Style",
    question: "How do you learn best about trading?",
    type: "single",
    options: [
      {
        value: "visual",
        label: "Visually",
        description: "Charts, videos, diagrams",
        traits: ["visual", "pattern-recognition"],
      },
      {
        value: "reading",
        label: "Reading",
        description: "Books, articles, research",
        traits: ["theoretical", "analytical"],
      },
      {
        value: "practice",
        label: "Practice",
        description: "Learning by doing, backtesting",
        traits: ["practical", "hands-on"],
      },
      {
        value: "mentoring",
        label: "From a mentor",
        description: "Personal guidance and feedback",
        traits: ["social", "collaborative"],
      },
    ],
  },
  {
    id: "decision-speed",
    category: "Decision Making",
    question: "How quickly do you typically make trading decisions?",
    type: "single",
    options: [
      {
        value: "instant",
        label: "Instantly",
        description: "I trust intuition and experience",
        traits: ["intuitive", "quick-thinker", "impulsive"],
      },
      {
        value: "quick",
        label: "Fast (minutes)",
        description: "Quick analysis, then action",
        traits: ["decisive", "confident", "action-oriented"],
      },
      {
        value: "moderate",
        label: "Moderate (hours)",
        description: "I need time to think",
        traits: ["balanced", "thoughtful"],
      },
      {
        value: "slow",
        label: "Slow (days)",
        description: "I analyze all options thoroughly",
        traits: ["analytical", "cautious", "patient"],
      },
    ],
  },
  {
    id: "risk-tolerance",
    category: "Risk Management",
    question: "How do you feel about risking capital?",
    type: "single",
    options: [
      {
        value: "aggressive",
        label: "Aggressively",
        description: "Higher risk = higher reward, that motivates me",
        traits: ["risk-taker", "aggressive", "thrill-seeker"],
      },
      {
        value: "moderate",
        label: "Balanced",
        description: "Calculated risk with a clear plan",
        traits: ["balanced", "strategic", "calculated"],
      },
      {
        value: "conservative",
        label: "Conservatively",
        description: "Capital preservation is priority",
        traits: ["conservative", "protective", "patient"],
      },
      {
        value: "minimal",
        label: "Minimally",
        description: "I only trade with minimal risk",
        traits: ["risk-averse", "cautious", "anxious"],
      },
    ],
  },
  {
    id: "emotional-control",
    category: "Emotions",
    question: "How well do you control emotions when trading?",
    type: "scale",
    scaleLabels: { min: "Difficult to control", max: "Perfect control" },
    scaleTraits: { low: ["emotional", "reactive"], high: ["disciplined", "stoic"] },
  },
  {
    id: "loss-reaction",
    category: "Psychology",
    question: "How do you typically react after a losing trade?",
    type: "single",
    options: [
      {
        value: "revenge",
        label: "I want to even it immediately",
        description: "Hard to accept losses",
        traits: ["impulsive", "emotional", "revenge-trader"],
      },
      {
        value: "frustrated",
        label: "I'm frustrated",
        description: "But I stick to the plan",
        traits: ["emotional", "disciplined"],
      },
      {
        value: "analyze",
        label: "I analyze the cause",
        description: "I look for lessons",
        traits: ["analytical", "learning-oriented", "growth-mindset"],
      },
      {
        value: "accept",
        label: "I accept it as part of it",
        description: "Losses are normal",
        traits: ["detached", "experienced", "stoic"],
      },
    ],
  },
  {
    id: "patience-level",
    category: "Patience",
    question: "How patient are you waiting for the right setup?",
    type: "scale",
    scaleLabels: { min: "Impatient - I must be in the market", max: "Very patient - I wait even days" },
    scaleTraits: { low: ["impatient", "overtrading"], high: ["patient", "selective"] },
  },
  {
    id: "timeframe-preference",
    category: "Trading Style",
    question: "Which timeframe works best for you?",
    type: "single",
    options: [
      {
        value: "scalping",
        label: "Scalping (M1-M5)",
        description: "Fast trades, dozens daily",
        traits: ["action-oriented", "quick-thinker", "high-frequency"],
      },
      {
        value: "daytrading",
        label: "Daytrading (M15-H1)",
        description: "Trades within a day",
        traits: ["focused", "disciplined", "intraday"],
      },
      {
        value: "swing",
        label: "Swing (H4-D1)",
        description: "I hold positions for days to weeks",
        traits: ["patient", "analytical", "swing"],
      },
      {
        value: "position",
        label: "Position (W1-MN)",
        description: "Long-term positions",
        traits: ["patient", "strategic", "investor"],
      },
    ],
  },
  {
    id: "market-preference",
    category: "Markets",
    question: "Which markets do you prefer?",
    type: "single",
    options: [
      {
        value: "forex",
        label: "Forex",
        description: "Currency pairs, 24/5 market",
        traits: ["forex", "leverage", "technical"],
      },
      {
        value: "crypto",
        label: "Crypto",
        description: "Bitcoin, altcoins, 24/7",
        traits: ["crypto", "volatile", "risk-taker"],
      },
      { value: "stocks", label: "Stocks", description: "US/EU exchanges", traits: ["stocks", "fundamental", "news-driven"] },
      {
        value: "futures",
        label: "Futures/Indices",
        description: "S&P, Nasdaq, commodities",
        traits: ["futures", "leveraged", "professional"],
      },
    ],
  },
  {
    id: "motivation",
    category: "Motivation",
    question: "What motivates you most about trading?",
    type: "single",
    options: [
      {
        value: "money",
        label: "Financial Freedom",
        description: "I want to be financially independent",
        traits: ["goal-oriented", "ambitious", "money-motivated"],
      },
      {
        value: "freedom",
        label: "Time Freedom",
        description: "Work from anywhere, whenever I want",
        traits: ["independent", "flexible", "lifestyle"],
      },
      {
        value: "challenge",
        label: "Intellectual Challenge",
        description: "I enjoy beating the market",
        traits: ["competitive", "driven", "intellectual"],
      },
      {
        value: "passion",
        label: "Passion for Markets",
        description: "I'm fascinated by markets and analysis",
        traits: ["passionate", "curious", "dedicated"],
      },
    ],
  },
  {
    id: "discipline-level",
    category: "Discipline",
    question: "How well do you stick to your trading plan?",
    type: "scale",
    scaleLabels: { min: "Often break rules", max: "Always follow the plan" },
    scaleTraits: { low: ["undisciplined", "impulsive"], high: ["disciplined", "systematic"] },
  },
  {
    id: "analysis-style",
    category: "Analysis",
    question: "Which type of analysis do you prefer?",
    type: "single",
    options: [
      {
        value: "technical",
        label: "Technical Analysis",
        description: "Charts, indicators, price action",
        traits: ["technical", "visual", "pattern-based"],
      },
      {
        value: "fundamental",
        label: "Fundamental Analysis",
        description: "Economic data, news",
        traits: ["fundamental", "research", "macro"],
      },
      {
        value: "sentiment",
        label: "Sentiment Analysis",
        description: "Market sentiment, COT, social",
        traits: ["sentiment", "contrarian", "social"],
      },
      {
        value: "mixed",
        label: "Combination of all",
        description: "I use everything together",
        traits: ["versatile", "comprehensive", "adaptive"],
      },
    ],
  },
  {
    id: "stress-handling",
    category: "Stress",
    question: "How do you handle stress in volatile markets?",
    type: "single",
    options: [
      {
        value: "thrive",
        label: "I thrive in it",
        description: "Volatility is opportunity",
        traits: ["stress-resilient", "opportunistic", "calm"],
      },
      {
        value: "manage",
        label: "I manage it",
        description: "I have strategies for handling it",
        traits: ["adaptive", "prepared", "resilient"],
      },
      {
        value: "struggle",
        label: "It's challenging",
        description: "Sometimes it affects me",
        traits: ["stress-sensitive", "emotional"],
      },
      {
        value: "avoid",
        label: "I avoid it",
        description: "I don't trade in volatility",
        traits: ["cautious", "risk-averse", "conservative"],
      },
    ],
  },
  {
    id: "journaling",
    category: "Self-reflection",
    question: "How often do you keep a trading journal?",
    type: "single",
    options: [
      {
        value: "always",
        label: "Every trade",
        description: "Detailed records of everything",
        traits: ["disciplined", "analytical", "growth-oriented"],
      },
      {
        value: "often",
        label: "Most trades",
        description: "I write down important things",
        traits: ["organized", "learning"],
      },
      {
        value: "sometimes",
        label: "Sometimes",
        description: "When I have time or motivation",
        traits: ["inconsistent", "casual"],
      },
      { value: "never", label: "Never", description: "I haven't started yet", traits: ["unstructured", "beginner"] },
    ],
  },
  {
    id: "social-trading",
    category: "Community",
    question: "How do you prefer to trade?",
    type: "single",
    options: [
      {
        value: "alone",
        label: "Alone",
        description: "I need quiet and focus",
        traits: ["independent", "focused", "introverted"],
      },
      {
        value: "community",
        label: "In a community",
        description: "I share and learn from others",
        traits: ["social", "collaborative", "community"],
      },
      {
        value: "mentor",
        label: "With a mentor",
        description: "I value personal guidance",
        traits: ["learning-oriented", "humble", "coachable"],
      },
      {
        value: "flexible",
        label: "Flexibly",
        description: "It depends on the situation",
        traits: ["adaptable", "flexible", "versatile"],
      },
    ],
  },
  {
    id: "adaptability",
    category: "Adaptability",
    question: "How quickly do you adapt to market changes?",
    type: "scale",
    scaleLabels: { min: "Slowly - I stick to what works", max: "Quickly - I constantly adapt" },
    scaleTraits: { low: ["rigid", "consistent"], high: ["adaptive", "flexible"] },
  },
]

const personas: Record<
  string,
  {
    name: string
    icon: any
    color: string
    gradient: string
    description: string
    idealTimeframe: string
    idealMarkets: string[]
  }
> = {
  "aggressive-scalper": {
    name: "Aggressive Scalper",
    icon: Zap,
    color: "text-red-400",
    gradient: "from-red-500 to-orange-500",
    description:
      "You live for the adrenaline of fast trades. Your strength is in quick decision-making and reading short-term movements. But watch out for overtrading and emotional decisions.",
    idealTimeframe: "M1-M15",
    idealMarkets: ["Forex major pairs", "Indices (NQ, ES)", "Crypto (BTC, ETH)"],
  },
  "analytical-swing": {
    name: "Analytical Swing Trader",
    icon: BarChart3,
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    description:
      "You're a strategic thinker who prefers thorough analysis before entry. Your patience is your greatest weapon. Beware of paralysis by analysis.",
    idealTimeframe: "H4-D1",
    idealMarkets: ["Forex", "Stocks", "ETF"],
  },
  "balanced-daytrader": {
    name: "Balanced Daytrader",
    icon: Target,
    color: "text-green-400",
    gradient: "from-green-500 to-emerald-500",
    description:
      "You have a healthy balance between analysis and action. You trade with a clear plan and know when to hold back. Your consistency is key to long-term success.",
    idealTimeframe: "M15-H1",
    idealMarkets: ["Forex", "Indices", "Crypto"],
  },
  "cautious-investor": {
    name: "Conservative Positioner",
    icon: Shield,
    color: "text-purple-400",
    gradient: "from-purple-500 to-violet-500",
    description:
      "Capital preservation is your top priority. You prefer fewer trades with higher probability. Your conservative approach helps you survive tough times.",
    idealTimeframe: "D1-W1",
    idealMarkets: ["Stocks", "ETF", "Forex major pairs"],
  },
  "intuitive-trader": {
    name: "Intuitive Trader",
    icon: Eye,
    color: "text-pink-400",
    gradient: "from-pink-500 to-rose-500",
    description:
      "You rely on experience and instinct. You can 'feel' the market in a way others can't describe. But it's important to verify intuition with data and avoid hasty decisions.",
    idealTimeframe: "M5-H1",
    idealMarkets: ["Crypto", "Forex", "Indices"],
  },
  "systematic-quant": {
    name: "Systematic Quant",
    icon: Brain,
    color: "text-cyan-400",
    gradient: "from-cyan-500 to-teal-500",
    description:
      "Data and rules are your best friends. You trade according to a clearly defined system with minimal emotion. Your discipline is exemplary, but don't forget intuition.",
    idealTimeframe: "Varies - depends on system",
    idealMarkets: ["Algorithmic trading", "Futures", "Forex"],
  },
  "emotional-warrior": {
    name: "Emotional Warrior",
    icon: Heart,
    color: "text-amber-400",
    gradient: "from-amber-500 to-yellow-500",
    description:
      "Trading is an emotional ride for you. You have great potential but need to work on emotional control. The key is building discipline and following rules.",
    idealTimeframe: "H1-H4",
    idealMarkets: ["Swing trading", "Positions with clear SL"],
  },
}

const calculatePersona = (
  traits: Record<string, number>,
  answers: Record<string, string | number>,
): { persona: string; score: number } => {
  const traitScores = Object.entries(traits).sort((a, b) => b[1] - a[1])
  const topTraits = traitScores.slice(0, 6).map(([trait]) => trait)

  let persona = "balanced-daytrader"
  let maxScore = 0

  // Score each persona based on trait matches
  const personaScores: Record<string, number> = {
    "aggressive-scalper": 0,
    "analytical-swing": 0,
    "balanced-daytrader": 0,
    "cautious-investor": 0,
    "intuitive-trader": 0,
    "systematic-quant": 0,
    "emotional-warrior": 0,
  }

  // Aggressive Scalper
  if (topTraits.includes("risk-taker")) personaScores["aggressive-scalper"] += 3
  if (topTraits.includes("action-oriented")) personaScores["aggressive-scalper"] += 3
  if (topTraits.includes("quick-thinker")) personaScores["aggressive-scalper"] += 2
  if (topTraits.includes("impulsive")) personaScores["aggressive-scalper"] += 1
  if (answers["timeframe-preference"] === "scalping") personaScores["aggressive-scalper"] += 4

  // Analytical Swing
  if (topTraits.includes("analytical")) personaScores["analytical-swing"] += 3
  if (topTraits.includes("patient")) personaScores["analytical-swing"] += 3
  if (topTraits.includes("theoretical")) personaScores["analytical-swing"] += 2
  if (answers["timeframe-preference"] === "swing") personaScores["analytical-swing"] += 4

  // Balanced Daytrader
  if (topTraits.includes("balanced")) personaScores["balanced-daytrader"] += 3
  if (topTraits.includes("disciplined")) personaScores["balanced-daytrader"] += 3
  if (topTraits.includes("focused")) personaScores["balanced-daytrader"] += 2
  if (answers["timeframe-preference"] === "daytrading") personaScores["balanced-daytrader"] += 4

  // Cautious Investor
  if (topTraits.includes("conservative")) personaScores["cautious-investor"] += 3
  if (topTraits.includes("cautious")) personaScores["cautious-investor"] += 3
  if (topTraits.includes("protective")) personaScores["cautious-investor"] += 2
  if (answers["timeframe-preference"] === "position") personaScores["cautious-investor"] += 4

  // Intuitive Trader
  if (topTraits.includes("intuitive")) personaScores["intuitive-trader"] += 3
  if (topTraits.includes("experienced")) personaScores["intuitive-trader"] += 2
  if (topTraits.includes("quick-thinker")) personaScores["intuitive-trader"] += 2

  // Systematic Quant
  if (topTraits.includes("systematic")) personaScores["systematic-quant"] += 3
  if (topTraits.includes("disciplined")) personaScores["systematic-quant"] += 2
  if (topTraits.includes("analytical")) personaScores["systematic-quant"] += 2
  if (answers["journaling"] === "always") personaScores["systematic-quant"] += 3

  // Emotional Warrior
  if (topTraits.includes("emotional")) personaScores["emotional-warrior"] += 3
  if (topTraits.includes("impulsive")) personaScores["emotional-warrior"] += 2
  if (topTraits.includes("revenge-trader")) personaScores["emotional-warrior"] += 3

  // Find highest scoring persona
  Object.entries(personaScores).forEach(([p, score]) => {
    if (score > maxScore) {
      maxScore = score
      persona = p
    }
  })

  return { persona, score: Math.min(100, (maxScore / 15) * 100) }
}

// Demo profile for virtual mode
const demoProfile: TraderProfile = {
  completed: true,
  completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  answers: {
    "trading-experience": "intermediate",
    "learning-style": "visual",
    "decision-speed": "moderate",
    "risk-tolerance": "moderate",
    "emotional-control": 65,
    "loss-reaction": "analyze",
    "patience-level": 70,
    "timeframe-preference": "swing",
    "market-preference": "forex",
    motivation: "freedom",
    "discipline-level": 75,
    "analysis-style": "technical",
    "stress-handling": "manage",
    journaling: "often",
    "social-trading": "community",
    adaptability: 60,
  },
  traits: {
    visual: 2,
    analytical: 4,
    patient: 3,
    balanced: 3,
    strategic: 2,
    disciplined: 3,
    collaborative: 1,
    "growth-mindset": 2,
    technical: 2,
  },
  persona: "analytical-swing",
  personaScore: 78,
  description:
    "You are an analytical swing trader with an emphasis on preparation and patience. You prefer visual analysis and enjoy sharing your insights with the community.",
  strengths: [
    "Thorough analysis",
    "Patience waiting for setups",
    "Risk management",
    "Learning from mistakes",
    "Technical analysis",
  ],
  risks: ["Overanalysis (paralysis)", "Slow reactions to changes", "Missing short-term opportunities"],
  recommendations: [
    "Focus on swing trading on H4-D1 timeframes",
    "Create a checklist for entering trades",
    "Set alerts instead of constantly watching charts",
    "Use community to validate your setups",
    "Work on faster decision-making for clear setups",
  ],
  idealTimeframe: "H4-D1",
  idealMarkets: ["Forex", "Stocks", "ETF"],
  psychologicalProfile: {
    emotionalControl: 65,
    discipline: 75,
    patience: 70,
    riskTolerance: 55,
    analyticalThinking: 80,
    adaptability: 60,
  },
}

const generateStrengths = (traits: Record<string, number>, answers: Record<string, string | number>): string[] => {
  const strengths: string[] = []
  if (traits["analytical"] >= 2) strengths.push("Analytical thinking")
  if (traits["patient"] >= 2) strengths.push("Patience waiting for setups")
  if (answers["motivation"] === "challenge") strengths.push("Intellectual challenge")
  if (traits["disciplined"] >= 2) strengths.push("Discipline")
  if (traits["social"] >= 2) strengths.push("Social skills")
  if (traits["practical"] >= 2) strengths.push("Practical experience")
  if (traits["technical"] >= 2) strengths.push("Technical analysis")
  if (traits["fundamental"] >= 2) strengths.push("Fundamental analysis")
  if (traits["sentiment"] >= 2) strengths.push("Sentiment analysis")
  if (traits["versatile"] >= 2) strengths.push("Versatility")
  if (traits["growth-mindset"] >= 2) strengths.push("Growth mindset")
  return strengths
}

const generateRisks = (traits: Record<string, number>, answers: Record<string, string | number>): string[] => {
  const risks: string[] = []
  if (traits["impulsive"] >= 2) risks.push("Emotional decision-making")
  if (traits["risk-taker"] >= 2) risks.push("High risk")
  if (traits["overtrading"] >= 2) risks.push("Overtrading")
  if (traits["unstructured"] >= 2) risks.push("Unstructured approach")
  if (traits["stress-sensitive"] >= 2) risks.push("Inflexibility under stress")
  if (traits["rigid"] >= 2) risks.push("Rigidity")
  return risks
}

const generateRecommendations = (
  persona: string,
  traits: Record<string, number>,
  answers: Record<string, string | number>,
): string[] => {
  const recommendations: string[] = []
  switch (persona) {
    case "aggressive-scalper":
      recommendations.push("Focus on scalping on M1-M15 timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    case "analytical-swing":
      recommendations.push("Focus on swing trading on H4-D1 timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    case "balanced-daytrader":
      recommendations.push("Focus on daytrading on M15-H1 timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    case "cautious-investor":
      recommendations.push("Focus on position trading on W1-MN timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    case "intuitive-trader":
      recommendations.push("Focus on intuitive trading on M5-H1 timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    case "systematic-quant":
      recommendations.push("Focus on systematic quant trading on various timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    case "emotional-warrior":
      recommendations.push("Focus on emotional trading on H1-H4 timeframes")
      recommendations.push("Create a checklist for entering trades")
      recommendations.push("Set alerts instead of constantly watching charts")
      recommendations.push("Use community to validate your setups")
      recommendations.push("Work on faster decision-making for clear setups")
      break
    default:
      recommendations.push("Focus on daytrading on M15-H1 timeframes")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
  }
  return recommendations
}

export default function TradingIdentityPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
  const { language } = useLanguage()
  const isEn = language === "en"

  const txt = {
    tradingIdentity: isEn ? "Trading Identity" : "Obchodní identita",
    yourPersonalityProfile: isEn ? "Your personality profile" : "Tvůj profil osobnosti",
    demo: isEn ? "Demo" : "Demo",
    retakeTest: isEn ? "Retake Test" : "Opakovat test",
    yourTradingPersona: isEn ? "Your Trading Persona" : "Tvoje obchodní persona",
    psychologicalProfile: isEn ? "Psychological Profile" : "Psychologický profil",
    emotionalControl: isEn ? "Emotional Control" : "Emoční kontrola",
    discipline: isEn ? "Discipline" : "Disciplína",
    patience: isEn ? "Patience" : "Trpělivost",
    riskTolerance: isEn ? "Risk Tolerance" : "Tolerance vůči riziku",
    analyticalThinking: isEn ? "Analytical Thinking" : "Analytické myšlení",
    adaptability: isEn ? "Adaptability" : "Adaptabilita",
    yourStrengths: isEn ? "Your Strengths" : "Tvoje silné stránky",
    whatToWatchFor: isEn ? "What to Watch For" : "Na co si dát pozor",
    personalizedRecommendations: isEn ? "Personalized Recommendations" : "Personalizovaná doporučení",
    tradingIdentityBuilder: isEn ? "Trading Identity Builder" : "Tvůrce obchodní identity",
    discoverTradingStyle: isEn ? "Discover your trading style, strengths, and areas for development. The test takes approximately 5 minutes." : "Objevi svůj obchodní styl, silné stránky a oblasti pro rozvoj. Test trvá přibližně 5 minut.",
    startTest: isEn ? "Start Test" : "Začít test",
    skipTest: isEn ? "Skip (Demo)" : "Přeskočit (Demo)",
  }

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [profile, setProfile] = useState<TraderProfile | null>(null)
  const [isQuizMode, setIsQuizMode] = useState(false)
  const [scaleValue, setScaleValue] = useState(50)

  useEffect(() => {
    if (!isLiveMode) {
      setProfile(demoProfile)
      return
    }

    const saved = localStorage.getItem("trading-identity-profile")
    if (saved) {
      try {
        setProfile(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading trading identity:", e)
      }
    }
  }, [isLiveMode])

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleScaleAnswer = (questionId: string, value: number[]) => {
    setScaleValue(value[0])
    setAnswers((prev) => ({ ...prev, [questionId]: value[0] }))
  }

  const nextStep = () => {
    const currentQuestion = questions[currentStep]
    if (!answers[currentQuestion.id] && answers[currentQuestion.id] !== 0) {
      toast({
        title: "Answer the question",
        description: "Please select an answer before continuing",
        variant: "destructive",
      })
      return
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1)
      const nextQuestion = questions[currentStep + 1]
      if (nextQuestion.type === "scale") {
        setScaleValue((answers[nextQuestion.id] as number) || 50)
      }
    } else {
      finishQuiz()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      const prevQuestion = questions[currentStep - 1]
      if (prevQuestion.type === "scale") {
        setScaleValue((answers[prevQuestion.id] as number) || 50)
      }
    }
  }

  const finishQuiz = () => {
    if (!isLiveMode) {
      toast({
        title: "Demo Mode",
        description: "In demo mode, the profile cannot be saved.",
        variant: "destructive",
      })
      return
    }

    // Calculate traits
    const traits: Record<string, number> = {}
    questions.forEach((question) => {
      const answerValue = answers[question.id]

      if (question.type === "single" && question.options) {
        const option = question.options.find((o) => o.value === answerValue)
        option?.traits.forEach((trait) => {
          traits[trait] = (traits[trait] || 0) + 1
        })
      } else if (question.type === "scale" && question.scaleTraits) {
        const value = answerValue as number
        if (value < 40) {
          question.scaleTraits.low.forEach((trait) => {
            traits[trait] = (traits[trait] || 0) + 1
          })
        } else if (value > 60) {
          question.scaleTraits.high.forEach((trait) => {
            traits[trait] = (traits[trait] || 0) + 1
          })
        }
      }
    })

    const { persona, score } = calculatePersona(traits, answers)
    const personaInfo = personas[persona]

    const psychProfile = {
      emotionalControl: (answers["emotional-control"] as number) || 50,
      discipline: (answers["discipline-level"] as number) || 50,
      patience: (answers["patience-level"] as number) || 50,
      riskTolerance:
        answers["risk-tolerance"] === "aggressive"
          ? 80
          : answers["risk-tolerance"] === "moderate"
            ? 60
            : answers["risk-tolerance"] === "conservative"
              ? 40
              : 20,
      analyticalThinking: traits["analytical"] ? Math.min(90, traits["analytical"] * 20 + 40) : 50,
      adaptability: (answers["adaptability"] as number) || 50,
    }

    const newProfile: TraderProfile = {
      completed: true,
      completedDate: new Date().toISOString(),
      answers,
      traits,
      persona,
      description: personaInfo.description,
      strengths: generateStrengths(traits, answers),
      risks: generateRisks(traits, answers),
      recommendations: generateRecommendations(persona, traits, answers),
      idealTimeframe: personaInfo.idealTimeframe,
      idealMarkets: personaInfo.idealMarkets,
      psychologicalProfile: psychProfile,
    }

    setProfile(newProfile)
    localStorage.setItem("trading-identity-profile", JSON.stringify(newProfile))
    setIsQuizMode(false)
    toast({ title: "Profile created!", description: "Your trading identity has been analyzed" })
  }

  const startQuiz = () => {
    if (!isLiveMode) {
      toast({
        title: "Demo Mode",
        description: "In demo mode, you cannot start the test. Check out the sample profile.",
        variant: "destructive",
      })
      return
    }
    setIsQuizMode(true)
    setCurrentStep(0)
    setAnswers({})
  }

  const resetProfile = () => {
    if (!isLiveMode) return
    localStorage.removeItem("trading-identity-profile")
    setProfile(null)
    toast({ title: "Profile reset" })
  }

  if (isQuizMode) {
    const question = questions[currentStep]
    const progress = ((currentStep + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-10">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link href="/bonus" className="inline-flex mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Back</span>
            </div>
          </Link>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Question {currentStep + 1} of {questions.length}
              </span>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{question.category}</Badge>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-md">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>

              {question.type === "single" && question.options && (
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        answers[question.id] === option.value
                          ? "bg-purple-500/20 border-purple-500 text-white"
                          : "bg-slate-800/50 border-slate-700 text-gray-300 hover:border-purple-500/50",
                      )}
                    >
                      <div className="font-medium">{option.label}</div>
                      {option.description && <div className="text-sm text-gray-400 mt-1">{option.description}</div>}
                    </button>
                  ))}
                </div>
              )}

              {question.type === "scale" && question.scaleLabels && (
                <div className="space-y-6">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{question.scaleLabels.min}</span>
                    <span>{question.scaleLabels.max}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scaleValue}
                    onChange={(e) => handleScaleAnswer(question.id, [Number.parseInt(e.target.value)])}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">{scaleValue}</span>
                    <span className="text-gray-400 ml-1">/ 100</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="border-slate-700 bg-transparent"
                >
                  Back
                </Button>
                <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                  {currentStep === questions.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (profile?.completed) {
    const personaInfo = personas[profile.persona]
    const PersonaIcon = personaInfo?.icon || Brain

    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-10 relative overflow-hidden">
        {/* Galaxy Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated stars */}
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animationDelay: Math.random() * 3 + "s",
                animationDuration: Math.random() * 2 + 2 + "s",
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
          {/* Nebula effects */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link href="/bonus" className="inline-flex mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Back</span>
            </div>
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{txt.tradingIdentity}</h1>
                <p className="text-sm text-gray-400">{txt.yourPersonalityProfile}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isLiveMode && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{txt.demo}</Badge>}
              <Button
                variant="outline"
                size="sm"
                onClick={resetProfile}
                className="border-slate-700 text-gray-300 bg-transparent"
              >
                {txt.retakeTest}
              </Button>
            </div>
          </div>

          {/* Main Persona Card */}
          <Card className="bg-slate-900/40 backdrop-blur-md border-slate-700/50 mb-6 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${personaInfo.gradient} opacity-5`} />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div
                  className={`p-6 rounded-2xl bg-gradient-to-br ${personaInfo.gradient} shadow-lg shadow-purple-500/20`}
                >
                  <PersonaIcon className="w-16 h-16 text-white" />
                </div>
                <div className="flex-1">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-3">
                    {txt.yourTradingPersona}
                  </Badge>
                  <h2 className="text-3xl font-bold text-white mb-3">{personaInfo?.name}</h2>
                  <p className="text-gray-300 text-lg leading-relaxed">{profile.description}</p>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">{profile.idealTimeframe}</span>
                    </div>
                    {profile.idealMarkets.slice(0, 2).map((market) => (
                      <div
                        key={market}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50"
                      >
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm">{market}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Psychological Profile */}
          <Card className="bg-slate-900/40 backdrop-blur-md border-slate-700/50 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                {txt.psychologicalProfile}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(profile.psychologicalProfile).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    emotionalControl: txt.emotionalControl,
                    discipline: txt.discipline,
                    patience: txt.patience,
                    riskTolerance: txt.riskTolerance,
                    analyticalThinking: txt.analyticalThinking,
                    adaptability: txt.adaptability,
                  }
                  return (
                    <div key={key} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{labels[key]}</span>
                        <span className="text-white font-medium">{value}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Risks */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-slate-900/40 backdrop-blur-md border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  {txt.yourStrengths}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.strengths.map((strength, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-md border-slate-700/50">
              <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                {txt.whatToWatchFor}
              </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20"
                    >
                      <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span className="text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-slate-900/40 backdrop-blur-md border-slate-700/50">
            <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              {txt.personalizedRecommendations}
            </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {profile.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50"
                  >
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                    <span className="text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // No profile - show start screen
  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-10 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 3 + "s",
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl w-fit mx-auto mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{txt.tradingIdentityBuilder}</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {txt.discoverTradingStyle}
            </p>
            <Button onClick={startQuiz} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Zap className="w-5 h-5 mr-2" />
              {txt.startTest}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
