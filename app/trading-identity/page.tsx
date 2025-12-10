"use client"

import { useState, useEffect } from "react"
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
    category: "Zkušenosti",
    question: "Jak dlouho aktivně obchoduješ?",
    type: "single",
    options: [
      {
        value: "beginner",
        label: "Méně než 1 rok",
        description: "Stále se učím základy",
        traits: ["learning", "cautious"],
      },
      {
        value: "intermediate",
        label: "1-3 roky",
        description: "Mám základní zkušenosti",
        traits: ["developing", "growing"],
      },
      { value: "advanced", label: "3-5 let", description: "Rozumím trhům dobře", traits: ["experienced", "confident"] },
      { value: "expert", label: "5+ let", description: "Jsem zkušený trader", traits: ["expert", "seasoned"] },
    ],
  },
  {
    id: "learning-style",
    category: "Styl učení",
    question: "Jak se nejlépe učíš nové věci o tradingu?",
    type: "single",
    options: [
      {
        value: "visual",
        label: "Vizuálně",
        description: "Grafy, videa, diagramy",
        traits: ["visual", "pattern-recognition"],
      },
      {
        value: "reading",
        label: "Čtením",
        description: "Knihy, články, výzkum",
        traits: ["theoretical", "analytical"],
      },
      {
        value: "practice",
        label: "Praxí",
        description: "Learning by doing, backtesting",
        traits: ["practical", "hands-on"],
      },
      {
        value: "mentoring",
        label: "Od mentora",
        description: "Osobní vedení a feedback",
        traits: ["social", "collaborative"],
      },
    ],
  },
  {
    id: "decision-speed",
    category: "Rozhodování",
    question: "Jak rychle typicky děláš obchodní rozhodnutí?",
    type: "single",
    options: [
      {
        value: "instant",
        label: "Okamžitě",
        description: "Důvěřuji intuici a zkušenostem",
        traits: ["intuitive", "quick-thinker", "impulsive"],
      },
      {
        value: "quick",
        label: "Rychle (minuty)",
        description: "Rychlá analýza, pak akce",
        traits: ["decisive", "confident", "action-oriented"],
      },
      {
        value: "moderate",
        label: "Středně (hodiny)",
        description: "Potřebuji čas na rozmyšlenou",
        traits: ["balanced", "thoughtful"],
      },
      {
        value: "slow",
        label: "Pomalu (dny)",
        description: "Důkladně analyzuji všechny možnosti",
        traits: ["analytical", "cautious", "patient"],
      },
    ],
  },
  {
    id: "risk-tolerance",
    category: "Risk Management",
    question: "Jak se cítíš při riskování kapitálu?",
    type: "single",
    options: [
      {
        value: "aggressive",
        label: "Agresivně",
        description: "Vyšší risk = vyšší reward, to mě motivuje",
        traits: ["risk-taker", "aggressive", "thrill-seeker"],
      },
      {
        value: "moderate",
        label: "Vyváženě",
        description: "Kalkulovaný risk s jasným plánem",
        traits: ["balanced", "strategic", "calculated"],
      },
      {
        value: "conservative",
        label: "Konzervativně",
        description: "Ochrana kapitálu je priorita",
        traits: ["conservative", "protective", "patient"],
      },
      {
        value: "minimal",
        label: "Minimálně",
        description: "Obchoduji jen s minimálním riskem",
        traits: ["risk-averse", "cautious", "anxious"],
      },
    ],
  },
  {
    id: "emotional-control",
    category: "Emoce",
    question: "Jak dobře kontroluješ emoce při obchodování?",
    type: "scale",
    scaleLabels: { min: "Těžko ovládám", max: "Perfektní kontrola" },
    scaleTraits: { low: ["emotional", "reactive"], high: ["disciplined", "stoic"] },
  },
  {
    id: "loss-reaction",
    category: "Psychologie",
    question: "Jak typicky reaguješ po ztrátovém obchodu?",
    type: "single",
    options: [
      {
        value: "revenge",
        label: "Chci ji hned vyrovnat",
        description: "Těžko přijímám ztráty",
        traits: ["impulsive", "emotional", "revenge-trader"],
      },
      {
        value: "frustrated",
        label: "Jsem frustrovaný",
        description: "Ale držím se plánu",
        traits: ["emotional", "disciplined"],
      },
      {
        value: "analyze",
        label: "Analyzuji příčinu",
        description: "Hledám poučení",
        traits: ["analytical", "learning-oriented", "growth-mindset"],
      },
      {
        value: "accept",
        label: "Přijímám jako součást",
        description: "Ztráty jsou normální",
        traits: ["detached", "experienced", "stoic"],
      },
    ],
  },
  {
    id: "patience-level",
    category: "Trpělivost",
    question: "Jak trpělivý jsi při čekání na správný setup?",
    type: "scale",
    scaleLabels: { min: "Netrpělivý - musím být v trhu", max: "Velmi trpělivý - čekám i dny" },
    scaleTraits: { low: ["impatient", "overtrading"], high: ["patient", "selective"] },
  },
  {
    id: "timeframe-preference",
    category: "Styl obchodování",
    question: "Jaký timeframe ti nejvíc vyhovuje?",
    type: "single",
    options: [
      {
        value: "scalping",
        label: "Scalping (M1-M5)",
        description: "Rychlé obchody, desítky denně",
        traits: ["action-oriented", "quick-thinker", "high-frequency"],
      },
      {
        value: "daytrading",
        label: "Daytrading (M15-H1)",
        description: "Obchody v rámci dne",
        traits: ["focused", "disciplined", "intraday"],
      },
      {
        value: "swing",
        label: "Swing (H4-D1)",
        description: "Držím pozice dny až týdny",
        traits: ["patient", "analytical", "swing"],
      },
      {
        value: "position",
        label: "Position (W1-MN)",
        description: "Dlouhodobé pozice",
        traits: ["patient", "strategic", "investor"],
      },
    ],
  },
  {
    id: "market-preference",
    category: "Trhy",
    question: "Které trhy preferuješ?",
    type: "single",
    options: [
      {
        value: "forex",
        label: "Forex",
        description: "Měnové páry, 24/5 trh",
        traits: ["forex", "leverage", "technical"],
      },
      {
        value: "crypto",
        label: "Krypto",
        description: "Bitcoin, altcoiny, 24/7",
        traits: ["crypto", "volatile", "risk-taker"],
      },
      { value: "stocks", label: "Akcie", description: "US/EU burzy", traits: ["stocks", "fundamental", "news-driven"] },
      {
        value: "futures",
        label: "Futures/Indexy",
        description: "S&P, Nasdaq, komodity",
        traits: ["futures", "leveraged", "professional"],
      },
    ],
  },
  {
    id: "motivation",
    category: "Motivace",
    question: "Co tě nejvíc motivuje k tradingu?",
    type: "single",
    options: [
      {
        value: "money",
        label: "Finanční svoboda",
        description: "Chci být finančně nezávislý",
        traits: ["goal-oriented", "ambitious", "money-motivated"],
      },
      {
        value: "freedom",
        label: "Časová svoboda",
        description: "Pracovat odkudkoli, kdy chci",
        traits: ["independent", "flexible", "lifestyle"],
      },
      {
        value: "challenge",
        label: "Intelektuální výzva",
        description: "Baví mě porazit trh",
        traits: ["competitive", "driven", "intellectual"],
      },
      {
        value: "passion",
        label: "Vášeň pro trhy",
        description: "Fascinují mě trhy a analýza",
        traits: ["passionate", "curious", "dedicated"],
      },
    ],
  },
  {
    id: "discipline-level",
    category: "Disciplína",
    question: "Jak dobře dodržuješ svůj trading plán?",
    type: "scale",
    scaleLabels: { min: "Často porušuji pravidla", max: "Vždy se držím plánu" },
    scaleTraits: { low: ["undisciplined", "impulsive"], high: ["disciplined", "systematic"] },
  },
  {
    id: "analysis-style",
    category: "Analýza",
    question: "Jaký typ analýzy preferuješ?",
    type: "single",
    options: [
      {
        value: "technical",
        label: "Technická analýza",
        description: "Grafy, indikátory, price action",
        traits: ["technical", "visual", "pattern-based"],
      },
      {
        value: "fundamental",
        label: "Fundamentální analýza",
        description: "Ekonomická data, zprávy",
        traits: ["fundamental", "research", "macro"],
      },
      {
        value: "sentiment",
        label: "Sentiment analýza",
        description: "Nálada trhu, COT, social",
        traits: ["sentiment", "contrarian", "social"],
      },
      {
        value: "mixed",
        label: "Kombinace všech",
        description: "Využívám vše dohromady",
        traits: ["versatile", "comprehensive", "adaptive"],
      },
    ],
  },
  {
    id: "stress-handling",
    category: "Stres",
    question: "Jak zvládáš stres při volatilních trzích?",
    type: "single",
    options: [
      {
        value: "thrive",
        label: "Vynikám v něm",
        description: "Volatilita je příležitost",
        traits: ["stress-resilient", "opportunistic", "calm"],
      },
      {
        value: "manage",
        label: "Zvládám",
        description: "Mám strategie na zvládání",
        traits: ["adaptive", "prepared", "resilient"],
      },
      {
        value: "struggle",
        label: "Je to náročné",
        description: "Někdy mě to ovlivňuje",
        traits: ["stress-sensitive", "emotional"],
      },
      {
        value: "avoid",
        label: "Vyhýbám se mu",
        description: "Neobchoduji ve volatilitě",
        traits: ["cautious", "risk-averse", "conservative"],
      },
    ],
  },
  {
    id: "journaling",
    category: "Sebereflexe",
    question: "Jak často si vedeš trading deník?",
    type: "single",
    options: [
      {
        value: "always",
        label: "Každý obchod",
        description: "Detailní záznamy všeho",
        traits: ["disciplined", "analytical", "growth-oriented"],
      },
      {
        value: "often",
        label: "Většinu obchodů",
        description: "Zapisuji důležité věci",
        traits: ["organized", "learning"],
      },
      {
        value: "sometimes",
        label: "Občas",
        description: "Když mám čas nebo náladu",
        traits: ["inconsistent", "casual"],
      },
      { value: "never", label: "Neveden", description: "Zatím jsem nezačal", traits: ["unstructured", "beginner"] },
    ],
  },
  {
    id: "social-trading",
    category: "Komunita",
    question: "Jak preferuješ obchodovat?",
    type: "single",
    options: [
      {
        value: "alone",
        label: "Sám",
        description: "Potřebuji klid a soustředění",
        traits: ["independent", "focused", "introverted"],
      },
      {
        value: "community",
        label: "V komunitě",
        description: "Sdílím a učím se od ostatních",
        traits: ["social", "collaborative", "community"],
      },
      {
        value: "mentor",
        label: "S mentorem",
        description: "Oceňuji osobní vedení",
        traits: ["learning-oriented", "humble", "coachable"],
      },
      {
        value: "flexible",
        label: "Flexibilně",
        description: "Záleží na situaci",
        traits: ["adaptable", "flexible", "versatile"],
      },
    ],
  },
  {
    id: "adaptability",
    category: "Adaptabilita",
    question: "Jak rychle se přizpůsobuješ změnám na trhu?",
    type: "scale",
    scaleLabels: { min: "Pomalu - držím se osvědčeného", max: "Rychle - neustále se přizpůsobuji" },
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
    name: "Agresivní Scalper",
    icon: Zap,
    color: "text-red-400",
    gradient: "from-red-500 to-orange-500",
    description:
      "Žiješ pro adrenalin rychlých obchodů. Tvá síla je v rychlém rozhodování a schopnosti číst krátkodobé pohyby. Musíš si ale dávat pozor na overtrading a emocionální rozhodnutí.",
    idealTimeframe: "M1-M15",
    idealMarkets: ["Forex major páry", "Indexy (NQ, ES)", "Krypto (BTC, ETH)"],
  },
  "analytical-swing": {
    name: "Analytický Swing Trader",
    icon: BarChart3,
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    description:
      "Jsi strategický myslitel, který preferuje důkladnou analýzu před vstupem. Tvá trpělivost je tvá největší zbraň. Pozor na paralýzu z přílišné analýzy.",
    idealTimeframe: "H4-D1",
    idealMarkets: ["Forex", "Akcie", "ETF"],
  },
  "balanced-daytrader": {
    name: "Vyvážený Daytrader",
    icon: Target,
    color: "text-green-400",
    gradient: "from-green-500 to-emerald-500",
    description:
      "Máš zdravou rovnováhu mezi analýzou a akcí. Obchoduješ s jasným plánem a víš, kdy se držet zpátky. Tvá konzistence je klíčem k dlouhodobému úspěchu.",
    idealTimeframe: "M15-H1",
    idealMarkets: ["Forex", "Indexy", "Krypto"],
  },
  "cautious-investor": {
    name: "Konzervativní Pozicionér",
    icon: Shield,
    color: "text-purple-400",
    gradient: "from-purple-500 to-violet-500",
    description:
      "Ochrana kapitálu je pro tebe na prvním místě. Preferuješ méně obchodů s vyšší pravděpodobností. Tvůj konzervativní přístup ti pomáhá přežít i těžké časy.",
    idealTimeframe: "D1-W1",
    idealMarkets: ["Akcie", "ETF", "Forex major páry"],
  },
  "intuitive-trader": {
    name: "Intuitivní Trader",
    icon: Eye,
    color: "text-pink-400",
    gradient: "from-pink-500 to-rose-500",
    description:
      "Spoléháš na zkušenosti a instinkt. Dokážeš 'cítit' trh způsobem, který jiní neumí popsat. Důležité je ale ověřovat intuici daty a nedělat unáhlená rozhodnutí.",
    idealTimeframe: "M5-H1",
    idealMarkets: ["Krypto", "Forex", "Indexy"],
  },
  "systematic-quant": {
    name: "Systematický Quant",
    icon: Brain,
    color: "text-cyan-400",
    gradient: "from-cyan-500 to-teal-500",
    description:
      "Data a pravidla jsou tvoji nejlepší přátelé. Obchoduješ podle jasně definovaného systému s minimem emocí. Tvá disciplína je příkladná, ale nezapomínej na intuici.",
    idealTimeframe: "Různé - podle systému",
    idealMarkets: ["Algoritmický trading", "Futures", "Forex"],
  },
  "emotional-warrior": {
    name: "Emocionální Bojovník",
    icon: Heart,
    color: "text-amber-400",
    gradient: "from-amber-500 to-yellow-500",
    description:
      "Trading je pro tebe emocionální jízda. Máš velký potenciál, ale musíš pracovat na ovládání emocí. Klíč je v budování disciplíny a dodržování pravidel.",
    idealTimeframe: "H1-H4",
    idealMarkets: ["Swing trading", "Pozice s jasným SL"],
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
    "Jsi analytický swing trader s důrazem na přípravu a trpělivost. Preferuješ vizuální analýzu a rád sdílíš své poznatky s komunitou.",
  strengths: [
    "Důkladná analýza",
    "Trpělivost při čekání na setup",
    "Risk management",
    "Učení z chyb",
    "Technická analýza",
  ],
  risks: ["Přílišná analýza (paralýza)", "Pomalé reakce na změny", "Přehlížení krátkodobých příležitostí"],
  recommendations: [
    "Zaměř se na swing trading na H4-D1 timeframech",
    "Vytvoř si checklist pro vstup do obchodu",
    "Nastav si alerts místo neustálého sledování grafů",
    "Využij komunitu pro validaci svých setupů",
    "Pracuj na rychlejším rozhodování u jasných setupů",
  ],
  idealTimeframe: "H4-D1",
  idealMarkets: ["Forex", "Akcie", "ETF"],
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
  if (traits["analytical"] >= 2) strengths.push("Analytické myšlení")
  if (traits["patient"] >= 2) strengths.push("Trpělivost při čekání na setup")
  if (answers["motivation"] === "challenge") strengths.push("Intelektuální výzva")
  if (traits["disciplined"] >= 2) strengths.push("Disciplína")
  if (traits["social"] >= 2) strengths.push("Sociální schopnosti")
  if (traits["practical"] >= 2) strengths.push("Praktické zkušenosti")
  if (traits["technical"] >= 2) strengths.push("Technická analýza")
  if (traits["fundamental"] >= 2) strengths.push("Fundamentální analýza")
  if (traits["sentiment"] >= 2) strengths.push("Sentiment analýza")
  if (traits["versatile"] >= 2) strengths.push("Variance")
  if (traits["growth-mindset"] >= 2) strengths.push("Růstový myšlenkový přístup")
  return strengths
}

const generateRisks = (traits: Record<string, number>, answers: Record<string, string | number>): string[] => {
  const risks: string[] = []
  if (traits["impulsive"] >= 2) risks.push("Emocionální rozhodnutí")
  if (traits["risk-taker"] >= 2) risks.push("Vysoké risk")
  if (traits["overtrading"] >= 2) risks.push("Overtrading")
  if (traits["unstructured"] >= 2) risks.push("Nestrukturovaný přístup")
  if (traits["stress-sensitive"] >= 2) risks.push("Neflexibilita při stresu")
  if (traits["rigid"] >= 2) risks.push("Rigidita")
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
      recommendations.push("Zaměř se na scalping na M1-M15 timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    case "analytical-swing":
      recommendations.push("Zaměř se na swing trading na H4-D1 timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    case "balanced-daytrader":
      recommendations.push("Zaměř se na daytrading na M15-H1 timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    case "cautious-investor":
      recommendations.push("Zaměř se na pozicionér na W1-MN timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    case "intuitive-trader":
      recommendations.push("Zaměř se na intuitivní trading na M5-H1 timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    case "systematic-quant":
      recommendations.push("Zaměř se na systematický quant na různých timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    case "emotional-warrior":
      recommendations.push("Zaměř se na emocionální trading na H1-H4 timeframech")
      recommendations.push("Vytvoř si checklist pro vstup do obchodu")
      recommendations.push("Nastav si alerts místo neustálého sledování grafů")
      recommendations.push("Využij komunitu pro validaci svých setupů")
      recommendations.push("Pracuj na rychlejším rozhodování u jasných setupů")
      break
    default:
      recommendations.push("Zaměř se na daytrading na M15-H1 timeframech")
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
        title: "Odpověz na otázku",
        description: "Prosím vyber odpověď před pokračováním",
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
        title: "Demo režim",
        description: "V demo režimu nelze ukládat profil.",
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
    toast({ title: "Profil vytvořen!", description: "Tvá trading identita byla analyzována" })
  }

  const startQuiz = () => {
    if (!isLiveMode) {
      toast({
        title: "Demo režim",
        description: "V demo režimu nelze spustit test. Prohlédni si ukázkový profil.",
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
    toast({ title: "Profil resetován" })
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Otázka {currentStep + 1} z {questions.length}
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
                  Zpět
                </Button>
                <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                  {currentStep === questions.length - 1 ? "Dokončit" : "Další"}
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Trading Identity</h1>
                <p className="text-sm text-gray-400">Tvůj osobnostní profil</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isLiveMode && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Demo</Badge>}
              <Button
                variant="outline"
                size="sm"
                onClick={resetProfile}
                className="border-slate-700 text-gray-300 bg-transparent"
              >
                Opakovat test
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
                    Tvá Trading Persona
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
                Psychologický profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(profile.psychologicalProfile).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    emotionalControl: "Emoční kontrola",
                    discipline: "Disciplína",
                    patience: "Trpělivost",
                    riskTolerance: "Tolerance rizika",
                    analyticalThinking: "Analytické myšlení",
                    adaptability: "Adaptabilita",
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
                  Tvé silné stránky
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
                  Na co si dát pozor
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
                Personalizovaná doporučení
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
            <h1 className="text-3xl font-bold text-white mb-4">Trading Identity Builder</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Zjisti svůj trading styl, silné stránky a oblasti k rozvoji. Test trvá přibližně 5 minut.
            </p>
            <Button onClick={startQuiz} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Zap className="w-5 h-5 mr-2" />
              Spustit test
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
