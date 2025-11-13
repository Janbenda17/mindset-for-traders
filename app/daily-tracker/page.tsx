"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sun,
  CheckCircle,
  BookOpen,
  Moon,
  Target,
  DollarSign,
  CalendarIcon,
  Lock,
  Unlock,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Activity,
  Brain,
  Heart,
  Zap,
  ArrowRight,
  Clock,
  Shield,
} from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/data-context"
import { useRouter } from "next/navigation"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useTradingStyle } from "@/contexts/trading-style-context"
import { generateDemoDailyTrackerData } from "@/data/demo-daily-tracker"

interface MorningCheckData {
  id: string
  date: string
  sleepQuality: number
  sleepHours: number
  energyLevel: number
  stressLevel: number
  focus: number
  physicalHealth: number
  emotionalState: number
  exercised: boolean
  exerciseType: string
  exerciseDuration: number
  meditationTime: number
  morningRoutine: boolean
  hydration: number
  score: number
  recommendation: string
}

interface DailyIntentionData {
  date: string
  goals: string
  maxRiskPercent: number
  emotionalGoal: string
  strategy: string
}

interface TradingPlanData {
  date: string
  setups: string
  pairs: string
  timeframes: string
  entryRules: string
  exitRules: string
  stopLoss: string
  takeProfit: string
  marketAnalysis: string
  keyLevels: string
  notes: string
}

interface Trade {
  id: string
  pair: string
  direction: string
  entryPrice: number
  exitPrice: number
  pnl: number
  notes: string
  date: string
}

interface DailySummary {
  date: string
  morningCheck?: MorningCheckData
  intention?: DailyIntentionData
  plan?: TradingPlanData
  trades?: Trade[]
  overallScore: number
  stagesCompleted: number
}

export default function DailyTrackerPage() {
  const router = useRouter()
  const { isLiveMode } = useData()
  const { stages } = useDailyStage()
  const { tradingStyle, config } = useTradingStyle()
  const [entries, setEntries] = useState<DailySummary[]>([])
  const [activeTab, setActiveTab] = useState("today")
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const loadEntries = () => {
    if (!isLiveMode) {
      const demoData = generateDemoDailyTrackerData()
      setEntries(demoData)
    } else {
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      const intentions = JSON.parse(localStorage.getItem("daily-intentions") || "[]")
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      const allTrades = JSON.parse(localStorage.getItem("trade-records") || "[]")

      const combinedData: DailySummary[] = []
      const dates = new Set([
        ...morningChecks.map((m: any) => m.date),
        ...intentions.map((i: any) => i.date),
        ...plans.map((p: any) => p.date),
      ])

      dates.forEach((date) => {
        const morningCheck = morningChecks.find((m: any) => m.date === date)
        const intention = intentions.find((i: any) => i.date === date)
        const plan = plans.find((p: any) => p.date === date)
        const trades = allTrades.filter((t: Trade) => t.date === date)

        let stagesCompleted = 0
        if (morningCheck) stagesCompleted++
        if (intention) stagesCompleted++
        if (plan) stagesCompleted++
        if (trades.length > 0) stagesCompleted++

        const overallScore = morningCheck?.score || 0

        combinedData.push({
          date: date as string,
          morningCheck,
          intention,
          plan,
          trades,
          overallScore,
          stagesCompleted,
        })
      })

      combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setEntries(combinedData)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [isLiveMode])

  const todayEntry = entries.find((e) => e.date === format(new Date(), "yyyy-MM-dd"))
  const todayStages = stages

  const getStageDataForStyle = () => {
    if (tradingStyle === "scalper") {
      return [
        {
          id: 1,
          name: "Energy Check",
          icon: Zap,
          color: "from-yellow-500 to-orange-500",
          borderColor: "border-yellow-500/30",
          bgColor: "bg-yellow-500/10",
          href: "/morning-check",
        },
        {
          id: 2,
          name: "Session Plan",
          icon: Target,
          color: "from-red-500 to-orange-500",
          borderColor: "border-red-500/30",
          bgColor: "bg-red-500/10",
          href: "/daily-intention",
        },
        {
          id: 3,
          name: "Session Track",
          icon: Activity,
          color: "from-orange-500 to-amber-500",
          borderColor: "border-orange-500/30",
          bgColor: "bg-orange-500/10",
          href: "/trading-plan",
        },
        {
          id: 4,
          name: "Quick Trades",
          icon: DollarSign,
          color: "from-emerald-500 to-green-500",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
          href: "/record-trades",
        },
        {
          id: 5,
          name: "Session Review",
          icon: Moon,
          color: "from-violet-500 to-purple-500",
          borderColor: "border-violet-500/30",
          bgColor: "bg-violet-500/10",
          href: "/journal?mode=review",
        },
      ]
    } else if (tradingStyle === "daytrader") {
      return [
        {
          id: 1,
          name: "Morning Check",
          icon: Sun,
          color: "from-indigo-500 to-purple-500",
          borderColor: "border-indigo-500/30",
          bgColor: "bg-indigo-500/10",
          href: "/morning-check",
        },
        {
          id: 2,
          name: "Daily Intention",
          icon: Target,
          color: "from-blue-500 to-cyan-500",
          borderColor: "border-blue-500/30",
          bgColor: "bg-blue-500/10",
          href: "/daily-intention",
        },
        {
          id: 3,
          name: "Trading Plan",
          icon: BookOpen,
          color: "from-cyan-500 to-teal-500",
          borderColor: "border-cyan-500/30",
          bgColor: "bg-cyan-500/10",
          href: "/trading-plan",
        },
        {
          id: 4,
          name: "Record Trades",
          icon: DollarSign,
          color: "from-emerald-500 to-green-500",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
          href: "/record-trades",
        },
        {
          id: 5,
          name: "Evening Review",
          icon: Moon,
          color: "from-violet-500 to-purple-500",
          borderColor: "border-violet-500/30",
          bgColor: "bg-violet-500/10",
          href: "/journal?mode=review",
        },
      ]
    } else if (tradingStyle === "swingtrader") {
      return [
        {
          id: 1,
          name: "Weekly Planning",
          icon: CalendarIcon,
          color: "from-purple-500 to-pink-500",
          borderColor: "border-purple-500/30",
          bgColor: "bg-purple-500/10",
          href: "/morning-check",
        },
        {
          id: 2,
          name: "Position Review",
          icon: Target,
          color: "from-blue-500 to-cyan-500",
          borderColor: "border-blue-500/30",
          bgColor: "bg-blue-500/10",
          href: "/daily-intention",
        },
        {
          id: 3,
          name: "Analysis Update",
          icon: Brain,
          color: "from-cyan-500 to-teal-500",
          borderColor: "border-cyan-500/30",
          bgColor: "bg-cyan-500/10",
          href: "/trading-plan",
        },
        {
          id: 4,
          name: "Position Mgmt",
          icon: Shield,
          color: "from-emerald-500 to-green-500",
          borderColor: "border-emerald-500/30",
          bgColor: "bg-emerald-500/10",
          href: "/record-trades",
        },
        {
          id: 5,
          name: "Weekly Summary",
          icon: Clock,
          color: "from-violet-500 to-purple-500",
          borderColor: "border-violet-500/30",
          bgColor: "bg-violet-500/10",
          href: "/journal?mode=review",
        },
      ]
    }

    // Default to day trader stages
    return [
      {
        id: 1,
        name: "Morning Check",
        icon: Sun,
        color: "from-indigo-500 to-purple-500",
        borderColor: "border-indigo-500/30",
        bgColor: "bg-indigo-500/10",
        href: "/morning-check",
      },
      {
        id: 2,
        name: "Daily Intention",
        icon: Target,
        color: "from-blue-500 to-cyan-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-500/10",
        href: "/daily-intention",
      },
      {
        id: 3,
        name: "Trading Plan",
        icon: BookOpen,
        color: "from-cyan-500 to-teal-500",
        borderColor: "border-cyan-500/30",
        bgColor: "bg-cyan-500/10",
        href: "/trading-plan",
      },
      {
        id: 4,
        name: "Record Trades",
        icon: DollarSign,
        color: "from-emerald-500 to-green-500",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-500/10",
        href: "/record-trades",
      },
      {
        id: 5,
        name: "Evening Review",
        icon: Moon,
        color: "from-violet-500 to-purple-500",
        borderColor: "border-violet-500/30",
        bgColor: "bg-violet-500/10",
        href: "/journal?mode=review",
      },
    ]
  }

  const stageData = getStageDataForStyle()

  const readinessScore = todayEntry?.morningCheck?.score || 0

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return { text: "Výborný stav", color: "from-green-500 to-emerald-500" }
    if (score >= 60) return { text: "Dobrý stav", color: "from-yellow-500 to-orange-500" }
    return { text: "Zvýšená opatrnost", color: "from-red-500 to-rose-500" }
  }

  const generateTradingDecision = (morningCheck?: MorningCheckData, readinessScore?: number) => {
    if (!morningCheck || readinessScore === undefined) return null

    let message = ""
    const tips = []
    const details = []

    // Analyze sleep with specific details
    const poorSleep = morningCheck.sleepQuality < 6 || morningCheck.sleepHours < 6
    const goodSleep = morningCheck.sleepQuality >= 8 && morningCheck.sleepHours >= 7

    // Analyze activity
    const noActivity = !morningCheck.exercised
    const hasActivity = morningCheck.exercised

    // Analyze stress
    const highStress = morningCheck.stressLevel > 7
    const lowStress = morningCheck.stressLevel < 4

    // Analyze focus
    const lowFocus = morningCheck.focus < 6
    const goodFocus = morningCheck.focus >= 8

    // Analyze energy
    const lowEnergy = morningCheck.energyLevel < 5
    const goodEnergy = morningCheck.energyLevel >= 8

    // Analyze emotional state
    const badMood = morningCheck.emotionalState < 6
    const goodMood = morningCheck.emotionalState >= 8

    // Generate detailed personalized message
    if (poorSleep) {
      message = `Naspal jsi jen ${morningCheck.sleepHours}h (kvalita ${morningCheck.sleepQuality}/10), což je výrazně pod doporučenými 7-9 hodinami. Nedostatek spánku snižuje tvou schopnost rozhodování o 30-40% a zvyšuje riziko emočního tradingu. `
      details.push(`Spánek: ${morningCheck.sleepHours}h, kvalita ${morningCheck.sleepQuality}/10 - Kriticky nízká`)
      tips.push("Dej si 10-15min meditaci před tradingem pro zklidnění mysli")
      tips.push("Zkus cold shower (2-3 minuty) pro boost energie a koncentrace")
      tips.push("Dnes večer jdi spát o 1-2 hodiny dříve, ideálně před 22:00")
      tips.push("Zvaž vynechání tradingu nebo max 1-2 trades s polovičním riskem")
    } else if (highStress) {
      message = `Máš vysokou úroveň stresu (${morningCheck.stressLevel}/10), což je nad bezpečnou hranicí pro trading. Stres zvyšuje kortizol, který negativně ovlivňuje rozhodování a může vést k impulzivním vstupům. `
      details.push(`Stres: ${morningCheck.stressLevel}/10 - Vysoké riziko`)
      tips.push("Udělej 15-20min deep breathing (4-7-8 technika) před tradingem")
      tips.push("Zvaž redukci velikosti pozic na 30-50% normálu")
      tips.push("Dělej častější pauzy - každých 30 minut 5min break")
      tips.push("Zapiš si co tě stresuje a udělej akční plán jak to řešit")
    } else if (lowFocus) {
      message = `Tvůj focus je dnes nízký (${morningCheck.focus}/10), což znamená že můžeš přehlédnout důležité signály nebo udělat chyby v analýze. Nízký focus zvyšuje riziko špatných vstupů o 40%. `
      details.push(`Focus: ${morningCheck.focus}/10 - Pod průměrem`)
      tips.push("Běž se na 15-20min projít venku před tradingem (zvýší focus o 25%)")
      tips.push("Zkus cold shower (2-3 minuty) pro zvýšení koncentrace")
      tips.push("Omezte multitasking - zavři všechny nepotřebné aplikace")
      tips.push("Dělej Pomodoro techniku - 25min focus, 5min pauza")
    } else if (lowEnergy) {
      message = `Máš nízkou energii (${morningCheck.energyLevel}/10), což může vést k únavě během tradingu a horším rozhodnutím. Nízká energie snižuje tvou schopnost držet se plánu. `
      details.push(`Energie: ${morningCheck.energyLevel}/10 - Nízká`)
      tips.push("Dej si zdravou snídani s proteiny (vejce, jogurt, ořechy)")
      tips.push("Zkus 10-15min lehkého cvičení nebo jumping jacks")
      tips.push("Pij dostatek vody - minimálně 2L během dne")
      tips.push("Zvaž kratší trading session - max 2-3 hodiny")
    } else if (badMood) {
      message = `Tvůj emoční stav není ideální (${morningCheck.emotionalState}/10). Negativní emoce jako frustrace nebo smutek mohou vést k revenge tradingu a impulzivním rozhodnutím. `
      details.push(`Emoční stav: ${morningCheck.emotionalState}/10 - Pod průměrem`)
      tips.push("Vezmi si pauzu, udělej něco co tě uklidní (hudba, procházka)")
      tips.push("Zvaž vynechání tradingu dnes - tvé zdraví je priorita")
      tips.push("Zapiš si své emoce do journalu - pomůže ti to zpracovat je")
      tips.push("Pokud budeš tradovat, max 1 trade s minimálním riskem")
    } else if (noActivity && readinessScore >= 70) {
      message = `Dneska máš dobré podmínky na obchodování (readiness ${readinessScore}%), ale nemáš žádnou fyzickou aktivitu. Cvičení zvyšuje focus o 25% a energii o 30%. `
      details.push(`Aktivita: Žádná - Doporučeno přidat`)
      tips.push("Běž se na 10-15min projít před obchodováním")
      tips.push("Lehké cvičení (jumping jacks, dřepy) zvýší tvůj focus a energii")
      tips.push("I krátká procházka může výrazně zlepšit tvůj trading mindset")
    } else if (goodSleep && goodEnergy && goodFocus && lowStress && goodMood) {
      message = `Perfektní! Máš výborný spánek (${morningCheck.sleepHours}h, kvalita ${morningCheck.sleepQuality}/10), vysokou energii (${morningCheck.energyLevel}/10), skvělý focus (${morningCheck.focus}/10) a nízký stres (${morningCheck.stressLevel}/10). Jsi v optimálním stavu pro obchodování! `
      details.push(`Všechny metriky v optimálním rozsahu`)
      tips.push("Drž se svého trading plánu - máš ideální podmínky")
      tips.push("Sleduj své emoce během tradingu - i v dobrém stavu můžeš udělat chyby")
      tips.push("Dělaj pravidelné pauzy každou hodinu pro udržení koncentrace")
    } else if (readinessScore >= 70) {
      message = `Máš dobré podmínky na obchodování. Tvůj readiness score je ${readinessScore}%, což je nad průměrem. Většina metrik je v dobrém rozsahu. `
      details.push(`Readiness: ${readinessScore}% - Dobré podmínky`)
      tips.push("Drž se svého trading plánu a risk managementu")
      tips.push("Buď opatrný a sleduj své emoce během tradingu")
      tips.push("Dělej pauzy každou hodinu pro udržení koncentrace")
    } else {
      message = `Tvůj readiness score je ${readinessScore}%, což je pod doporučenou hranicí 70%. Několik metrik je mimo optimální rozsah. Zvaž vynechání tradingu nebo výrazné snížení risku na 30-50% normálu. `
      details.push(`Readiness: ${readinessScore}% - Pod doporučenou hranicí`)
      tips.push("Prioritou je tvé zdraví a dlouhodobý úspěch, ne dnešní profit")
      tips.push("Zkus zlepšit své podmínky před tradingem (spánek, aktivita, stres)")
      tips.push("Dnes je lepší den na odpočinek, analýzu nebo vzdělávání")
    }

    if (tradingStyle === "scalper") {
      if (morningCheck.focus < 8) {
        message = `Jako scalper potřebuješ extrémně vysoký focus (${morningCheck.focus}/10 je pod ideálem 8+). Nízký focus znamená zmeškané entry/exit signály a ztráty. `
        tips.push("Zkus 5-10min Wim Hof breathing pro instant focus boost")
        tips.push("Cold shower (2-3 min) zvýší koncentraci o 40%")
        tips.push("Dnes raději max 2-3 sessions místo 5+")
        tips.push("Zkrať session length na 30-45min místo 60min+")
      } else if (morningCheck.energyLevel < 7) {
        message = `Scalping vyžaduje vysokou energii po celý den (${morningCheck.energyLevel}/10 je pod ideálem 7+). Nízká energie = pomalé reakce = ztráty. `
        tips.push("Dej si zdravou snídani s proteiny a komplexními sacharidy")
        tips.push("Zkus 10-15min HIIT workout pro energy boost")
        tips.push("Pij vodu každých 30min - dehydratace snižuje energii o 20%")
        tips.push("Zvaž kratší sessions s častějšími pauzami")
      } else {
        message = `Perfektní podmínky pro scalping! Focus ${morningCheck.focus}/10 a energie ${morningCheck.energyLevel}/10 jsou v optimálním rozsahu. Jsi připravený na rychlé rozhodování. `
        tips.push("Drž se svého session plánu - max 5 sessions dnes")
        tips.push("Dělej 10min pauzy mezi sessions pro reset")
        tips.push("Sleduj svou energii - když klesne pod 7, ukonči session")
        tips.push("Quick journaling po každé session (2-3 minuty)")
      }
    } else if (tradingStyle === "daytrader") {
      if (morningCheck.emotionalState < 7 || morningCheck.stressLevel > 6) {
        message = `Jako day trader je emoční kontrola klíčová. Tvůj emoční stav (${morningCheck.emotionalState}/10) a stres (${morningCheck.stressLevel}/10) nejsou ideální. Riziko revenge tradingu je vysoké. `
        tips.push("Udělej 15-20min meditaci před tradingem")
        tips.push("Sniž position sizes na 50% normálu dnes")
        tips.push("Nastav si max 3 trades dnes místo 5-10")
        tips.push("Po každém tradu 5min pauza pro emoční reset")
      } else if (morningCheck.sleepQuality < 7) {
        message = `Day trading vyžaduje jasnou mysl. Tvůj spánek (${morningCheck.sleepHours}h, kvalita ${morningCheck.sleepQuality}/10) není optimální. Disciplína může být oslabená. `
        tips.push("Drž se přísně svého trading plánu - žádné impulzivní vstupy")
        tips.push("Nastav si max loss limit na 1% místo 2%")
        tips.push("Dělej častější pauzy - každých 45min 10min break")
        tips.push("Dnes večer jdi spát o 1-2 hodiny dříve")
      } else {
        message = `Výborné podmínky pro day trading! Emoční stav ${morningCheck.emotionalState}/10, disciplína připravená. Jsi v optimálním stavu pro dodržování plánu. `
        tips.push("Drž se svého trading plánu a risk managementu")
        tips.push("Sleduj své emoce po každém tradu - journaling je klíč")
        tips.push("Max 5-10 trades dnes podle plánu")
        tips.push("Dělej pauzy každou hodinu pro udržení disciplíny")
      }
    } else if (tradingStyle === "swingtrader") {
      if (morningCheck.focus < 7 || morningCheck.emotionalState < 7) {
        message = `Swing trading vyžaduje trpělivost a kvalitní analýzu. Tvůj focus (${morningCheck.focus}/10) a emoční stav (${morningCheck.emotionalState}/10) nejsou ideální pro důkladnou analýzu. `
        tips.push("Dnes raději jen monitoring pozic, žádné nové vstupy")
        tips.push("Zkus 20-30min meditaci pro zklidnění mysli")
        tips.push("Zaměř se na long-term perspektivu, ne short-term noise")
        tips.push("Přečti si své trading notes z minulého týdne")
      } else if (!morningCheck.exercised) {
        message = `Máš dobré podmínky (readiness ${readinessScore}%), ale chybí ti fyzická aktivita. Pro swing tradera je důležitý long-term mindset a zdraví. `
        tips.push("Běž se na 30min projít - pomůže ti to s perspektivou")
        tips.push("Fyzická aktivita zlepšuje long-term thinking o 30%")
        tips.push("Dnes je dobrý den na detailní analýzu pozic")
        tips.push("Zvaž přidání pravidelného cvičení do rutiny")
      } else {
        message = `Perfektní podmínky pro swing trading! Focus ${morningCheck.focus}/10, trpělivost připravená. Jsi v optimálním stavu pro kvalitní analýzu a long-term rozhodování. `
        tips.push("Udělej důkladnou analýzu všech pozic - máš na to čas")
        tips.push("Zaměř se na fundamentální faktory, ne jen techniku")
        tips.push("Sleduj své emoce - i swing trader může být impulzivní")
        tips.push("Journaling je klíč - zapiš si detailní analýzu každé pozice")
      }
    } else {
      // Default day trader logic
      if (poorSleep) {
        message = `Naspal jsi jen ${morningCheck.sleepHours}h (kvalita ${morningCheck.sleepQuality}/10), což je výrazně pod doporučenými 7-9 hodinami. Nedostatek spánku snižuje tvou schopnost rozhodování o 30-40% a zvyšuje riziko emočního tradingu. `
        details.push(`Spánek: ${morningCheck.sleepHours}h, kvalita ${morningCheck.sleepQuality}/10 - Kriticky nízká`)
        tips.push("Dej si 10-15min meditaci před tradingem pro zklidnění mysli")
        tips.push("Zkus cold shower (2-3 minuty) pro boost energie a koncentrace")
        tips.push("Dnes večer jdi spát o 1-2 hodiny dříve, ideálně před 22:00")
        tips.push("Zvaž vynechání tradingu nebo max 1-2 trades s polovičním riskem")
      } else if (highStress) {
        message = `Máš vysokou úroveň stresu (${morningCheck.stressLevel}/10), což je nad bezpečnou hranicí pro trading. Stres zvyšuje kortizol, který negativně ovlivňuje rozhodování a může vést k impulzivním vstupům. `
        details.push(`Stres: ${morningCheck.stressLevel}/10 - Vysoké riziko`)
        tips.push("Udělej 15-20min deep breathing (4-7-8 technika) před tradingem")
        tips.push("Zvaž redukci velikosti pozic na 30-50% normálu")
        tips.push("Dělej častější pauzy - každých 30 minut 5min break")
        tips.push("Zapiš si co tě stresuje a udělej akční plán jak to řešit")
      } else if (lowFocus) {
        message = `Tvůj focus je dnes nízký (${morningCheck.focus}/10), což znamená že můžeš přehlédnout důležité signály nebo udělat chyby v analýze. Nízký focus zvyšuje riziko špatných vstupů o 40%. `
        details.push(`Focus: ${morningCheck.focus}/10 - Pod průměrem`)
        tips.push("Běž se na 15-20min projít venku před tradingem (zvýší focus o 25%)")
        tips.push("Zkus cold shower (2-3 minuty) pro zvýšení koncentrace")
        tips.push("Omezte multitasking - zavři všechny nepotřebné aplikace")
        tips.push("Dělej Pomodoro techniku - 25min focus, 5min pauza")
      } else if (lowEnergy) {
        message = `Máš nízkou energii (${morningCheck.energyLevel}/10), což může vést k únavě během tradingu a horším rozhodnutím. Nízká energie snižuje tvou schopnost držet se plánu. `
        details.push(`Energie: ${morningCheck.energyLevel}/10 - Nízká`)
        tips.push("Dej si zdravou snídani s proteiny (vejce, jogurt, ořechy)")
        tips.push("Zkus 10-15min lehkého cvičení nebo jumping jacks")
        tips.push("Pij dostatek vody - minimálně 2L během dne")
        tips.push("Zvaž kratší trading session - max 2-3 hodiny")
      } else if (badMood) {
        message = `Tvůj emoční stav není ideální (${morningCheck.emotionalState}/10). Negativní emoce jako frustrace nebo smutek mohou vést k revenge tradingu a impulzivním rozhodnutím. `
        details.push(`Emoční stav: ${morningCheck.emotionalState}/10 - Pod průměrem`)
        tips.push("Vezmi si pauzu, udělej něco co tě uklidní (hudba, procházka)")
        tips.push("Zvaž vynechání tradingu dnes - tvé zdraví je priorita")
        tips.push("Zapiš si své emoce do journalu - pomůže ti to zpracovat je")
        tips.push("Pokud budeš tradovat, max 1 trade s minimálním riskem")
      } else if (noActivity && readinessScore >= 70) {
        message = `Dneska máš dobré podmínky na obchodování (readiness ${readinessScore}%), ale nemáš žádnou fyzickou aktivitu. Cvičení zvyšuje focus o 25% a energii o 30%. `
        details.push(`Aktivita: Žádná - Doporučeno přidat`)
        tips.push("Běž se na 10-15min projít před obchodováním")
        tips.push("Lehké cvičení (jumping jacks, dřepy) zvýší tvůj focus a energii")
        tips.push("I krátká procházka může výrazně zlepšit tvůj trading mindset")
      } else if (goodSleep && goodEnergy && goodFocus && lowStress && goodMood) {
        message = `Perfektní! Máš výborný spánek (${morningCheck.sleepHours}h, kvalita ${morningCheck.sleepQuality}/10), vysokou energii (${morningCheck.energyLevel}/10), skvělý focus (${morningCheck.focus}/10) a nízký stres (${morningCheck.stressLevel}/10). Jsi v optimálním stavu pro obchodování! `
        details.push(`Všechny metriky v optimálním rozsahu`)
        tips.push("Drž se svého trading plánu - máš ideální podmínky")
        tips.push("Sleduj své emoce během tradingu - i v dobrém stavu můžeš udělat chyby")
        tips.push("Dělaj pravidelné pauzy každou hodinu pro udržení koncentrace")
      } else if (readinessScore >= 70) {
        message = `Máš dobré podmínky na obchodování. Tvůj readiness score je ${readinessScore}%, což je nad průměrem. Většina metrik je v dobrém rozsahu. `
        details.push(`Readiness: ${readinessScore}% - Dobré podmínky`)
        tips.push("Drž se svého trading plánu a risk managementu")
        tips.push("Buď opatrný a sleduj své emoce během tradingu")
        tips.push("Dělej pauzy každou hodinu pro udržení koncentrace")
      } else {
        message = `Tvůj readiness score je ${readinessScore}%, což je pod doporučenou hranicí 70%. Několik metrik je mimo optimální rozsah. Zvaž vynechání tradingu nebo výrazné snížení risku na 30-50% normálu. `
        details.push(`Readiness: ${readinessScore}% - Pod doporučenou hranicí`)
        tips.push("Prioritou je tvé zdraví a dlouhodobý úspěch, ne dnešní profit")
        tips.push("Zkus zlepšit své podmínky před tradingem (spánek, aktivita, stres)")
        tips.push("Dnes je lepší den na odpočinek, analýzu nebo vzdělávání")
      }
    }

    return {
      message,
      tips,
      details,
      readinessScore,
    }
  }

  const tradingDecision = generateTradingDecision(todayEntry?.morningCheck, readinessScore)

  // Generate insights
  const generateInsights = (morningCheck?: MorningCheckData) => {
    if (!morningCheck) return []

    const insights = []

    if (morningCheck.sleepQuality < 6 || morningCheck.sleepHours < 6) {
      insights.push({
        icon: Moon,
        category: "Spánek",
        severity: "high",
        message: "Nedostatečný spánek může negativně ovlivnit tvé rozhodování",
        action: "Zkus dnes dřív jít spát. Ideálně 7-9 hodin spánku.",
      })
    }

    if (morningCheck.stressLevel > 7) {
      insights.push({
        icon: AlertTriangle,
        category: "Stres",
        severity: "high",
        message: "Vysoká úroveň stresu zvyšuje riziko emočního tradingu",
        action: "Zvaž redukci pozice nebo vynechání obchodování dnes.",
      })
    }

    if (morningCheck.focus < 6) {
      insights.push({
        icon: Brain,
        category: "Focus",
        severity: "medium",
        message: "Nízký focus může vést k přehlédnutí důležitých signálů",
        action: "10 minut meditace nebo krátká procházka mohou pomoci.",
      })
    }

    if (morningCheck.energyLevel < 5) {
      insights.push({
        icon: Zap,
        category: "Energie",
        severity: "medium",
        message: "Nízká energie snižuje tvou schopnost držet se plánu",
        action: "Zkus lehké cvičení nebo zdravou snídani pro boost energie.",
      })
    }

    if (!morningCheck.exercised && morningCheck.energyLevel < 7) {
      insights.push({
        icon: Activity,
        category: "Aktivita",
        severity: "low",
        message: "Fyzická aktivita může zlepšit tvůj trading mindset",
        action: "I 15 minut pohybu může výrazně zvýšit focus a energii.",
      })
    }

    if (morningCheck.emotionalState < 6) {
      insights.push({
        icon: Heart,
        category: "Emoce",
        severity: "medium",
        message: "Negativní emoční stav může vést k impulzivním rozhodnutím",
        action: "Vezmi si pauzu před tradingem. Udělej něco, co tě uklidní.",
      })
    }

    return insights.slice(0, 3) // Max 3 insights
  }

  const insights = generateInsights(todayEntry?.morningCheck)

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <Target className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-7xl font-black bg-gradient-to-r from-orange-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Daily Tracker
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  {tradingStyle === "scalper" &&
                    (isLiveMode ? "Track your scalping sessions 🚀" : "Demo režim - Prozkoumej funkce! 🎮")}
                  {tradingStyle === "daytrader" &&
                    (isLiveMode ? "Tvé kompletní shrnutí všech 5 stages 📊" : "Demo režim - Prozkoumej funkce! 🎮")}
                  {tradingStyle === "swingtrader" &&
                    (isLiveMode ? "Monitor your swing positions 📈" : "Demo režim - Prozkoumej funkce! 🎮")}
                  {!tradingStyle &&
                    (isLiveMode ? "Tvé kompletní shrnutí všech 5 stages 📊" : "Demo režim - Prozkoumej funkce! 🎮")}
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                "text-base px-6 py-2 rounded-full",
                isLiveMode
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/20 text-sky-400 border-sky-500/30",
              )}
            >
              {isLiveMode ? "🔴 Live" : "🎮 Virtual"}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 h-16 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 rounded-xl text-base font-bold"
          >
            <Target className="h-5 w-5 mr-2" />
            Dnešní Shrnutí
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 rounded-xl text-base font-bold"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Historie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-8">
          {todayEntry?.morningCheck && (
            <>
              {/* Readiness Meter */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 rounded-3xl blur-2xl" />
                <Card className="relative border-2 border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                            <TrendingUp className="h-12 w-12 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                              Readiness Score
                            </CardTitle>
                            <CardDescription className="text-xl mt-2">
                              {tradingStyle === "scalper" && "Tvá připravenost na dnešní scalping sessions"}
                              {tradingStyle === "daytrader" && "Tvá připravenost na dnešní obchodování"}
                              {tradingStyle === "swingtrader" && "Tvá připravenost na analýzu a management pozic"}
                              {!tradingStyle && "Tvá připravenost na dnešní obchodování"}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn("text-8xl font-black", getReadinessColor(readinessScore))}>
                          {readinessScore}%
                        </div>
                        <Badge
                          className={cn(
                            "mt-3 text-base px-6 py-2",
                            `bg-gradient-to-r ${getReadinessStatus(readinessScore).color} text-white border-0`,
                          )}
                        >
                          {getReadinessStatus(readinessScore).text}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Celková připravenost</span>
                          <span className="text-white font-bold">{readinessScore}/100</span>
                        </div>
                        <Progress value={readinessScore} className="h-3" />
                      </div>

                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Moon className="h-4 w-4 text-indigo-400" />
                            <span className="text-xs text-muted-foreground">Spánek</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.sleepQuality}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">Energie</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.energyLevel}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-400" />
                            <span className="text-xs text-muted-foreground">Focus</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.focus}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-xs text-muted-foreground">Stres</span>
                          </div>
                          <div className="text-xl font-black text-white">{todayEntry.morningCheck.stressLevel}/10</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-pink-400" />
                            <span className="text-xs text-muted-foreground">Nálada</span>
                          </div>
                          <div className="text-xl font-black text-white">
                            {todayEntry.morningCheck.emotionalState}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {tradingDecision && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl blur-2xl" />
                  <Card
                    className={cn(
                      "relative border-2 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl",
                      readinessScore >= 70 ? "border-green-500/30" : "border-amber-500/30",
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-3xl">
                        <Brain className="h-8 w-8 text-purple-400" />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          AI Trading Insights
                        </span>
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">
                        Detailní analýza a personalizovaný feedback
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Main Message */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30">
                          <div className="text-xl font-bold text-white leading-relaxed">{tradingDecision.message}</div>
                        </div>

                        {tradingDecision.details.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="h-5 w-5 text-cyan-400" />
                              <h3 className="text-lg font-bold text-white">Detailní Analýza:</h3>
                            </div>
                            <div className="space-y-2">
                              {tradingDecision.details.map((detail, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                                >
                                  <div className="text-sm text-white font-medium">{detail}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                            <h3 className="text-lg font-bold text-white">Akční Kroky:</h3>
                          </div>
                          <div className="space-y-2">
                            {tradingDecision.tips.map((tip, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
                              >
                                <ArrowRight className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div className="text-base text-white font-medium">{tip}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Insights & Recommendations */}
              {insights.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 rounded-3xl blur-2xl" />
                  <Card className="relative border-2 border-amber-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-3xl">
                        <Lightbulb className="h-8 w-8 text-amber-400" />
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                          Insights & Doporučení
                        </span>
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Personalizované tipy pro zlepšení tvého trading výkonu
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insights.map((insight, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-5 rounded-2xl border-2 bg-gradient-to-br from-slate-900/50 to-slate-800/30",
                              insight.severity === "high" && "border-red-500/30",
                              insight.severity === "medium" && "border-yellow-500/30",
                              insight.severity === "low" && "border-blue-500/30",
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "p-3 rounded-xl",
                                  insight.severity === "high" && "bg-red-500/20",
                                  insight.severity === "medium" && "bg-yellow-500/20",
                                  insight.severity === "low" && "bg-blue-500/20",
                                )}
                              >
                                <insight.icon
                                  className={cn(
                                    "h-6 w-6",
                                    insight.severity === "high" && "text-red-400",
                                    insight.severity === "medium" && "text-yellow-400",
                                    insight.severity === "low" && "text-blue-400",
                                  )}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={cn(
                                      "text-xs",
                                      insight.severity === "high" && "bg-red-500/20 text-red-400 border-red-500/30",
                                      insight.severity === "medium" &&
                                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                      insight.severity === "low" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                                    )}
                                  >
                                    {insight.category}
                                  </Badge>
                                  {insight.severity === "high" && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                      Vysoká priorita
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-white font-bold mb-2">{insight.message}</div>
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                                  <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-muted-foreground">{insight.action}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Stage Progress - Progressive Unlock */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />
            <Card className="relative border-2 border-violet-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-3xl">
                      <CheckCircle className="h-8 w-8 text-violet-400" />
                      <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        {tradingStyle === "scalper" && "Session Flow"}
                        {tradingStyle === "daytrader" && "Daily Trading Flow"}
                        {tradingStyle === "swingtrader" && "Position Management Flow"}
                        {!tradingStyle && "Daily Trading Flow"}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {tradingStyle === "scalper" && "Postupné odemykání session stages"}
                      {tradingStyle === "daytrader" && "Postupné odemykání stages během dne"}
                      {tradingStyle === "swingtrader" && "Postupné odemykání management stages"}
                      {!tradingStyle && "Postupné odemykání stages během dne"}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                      {todayStages.filter((s) => s.completed).length}/5
                    </div>
                    <div className="text-sm text-muted-foreground">dokončeno</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  {stageData.map((stage, index) => {
                    const stageStatus = todayStages.find((s) => s.id === stage.id)
                    const isCompleted = stageStatus?.completed || false
                    const isUnlocked = stageStatus?.unlocked || false
                    const isActive = !isCompleted && isUnlocked

                    return (
                      <div
                        key={stage.id}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                          isCompleted && `${stage.borderColor} ${stage.bgColor}`,
                          isActive && "border-yellow-500/50 bg-yellow-500/10 animate-pulse",
                          !isUnlocked && "border-slate-700/50 bg-slate-800/30 opacity-40 cursor-not-allowed",
                          isUnlocked && !isCompleted && "hover:scale-105 cursor-pointer",
                        )}
                        onClick={() => {
                          if (isUnlocked) {
                            router.push(stage.href)
                          }
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-white/5 to-transparent" />
                        <div className="relative p-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div
                              className={cn(
                                "relative p-4 rounded-2xl",
                                isCompleted && `bg-gradient-to-br ${stage.color}`,
                                isActive && "bg-gradient-to-br from-yellow-500 to-orange-500",
                                !isUnlocked && "bg-slate-700/50",
                              )}
                            >
                              <stage.icon
                                className={cn(
                                  "h-8 w-8",
                                  (isCompleted || isActive) && "text-white",
                                  !isUnlocked && "text-slate-500",
                                )}
                              />
                              {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl">
                                  <Lock className="h-6 w-6 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div
                                className={cn(
                                  "text-sm font-bold mb-1",
                                  isCompleted && "text-white",
                                  isActive && "text-yellow-400",
                                  !isUnlocked && "text-slate-500",
                                )}
                              >
                                Stage {stage.id}
                              </div>
                              <div
                                className={cn(
                                  "text-xs font-medium",
                                  (isCompleted || isActive) && "text-white",
                                  !isUnlocked && "text-slate-600",
                                )}
                              >
                                {stage.name}
                              </div>
                            </div>

                            <div>
                              {isCompleted && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Dokončeno
                                </Badge>
                              )}
                              {isActive && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  <Unlock className="h-3 w-3 mr-1" />
                                  Aktivní
                                </Badge>
                              )}
                              {!isUnlocked && (
                                <Badge className="bg-slate-700/20 text-slate-500 border-slate-700/30 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Zamčeno
                                </Badge>
                              )}
                            </div>
                          </div>

                          {index < 4 && (
                            <div
                              className={cn(
                                "absolute top-1/2 -right-2 w-4 h-0.5 transform -translate-y-1/2 z-10",
                                isCompleted ? "bg-gradient-to-r " + stage.color : "bg-slate-700/50",
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Button */}
          {todayEntry && todayStages.filter((s) => s.completed).length < 5 && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                <h3 className="text-2xl font-black mb-2">Pokračuj v Daily Flow!</h3>
                <p className="text-muted-foreground mb-6">
                  Dokončil jsi {todayStages.filter((s) => s.completed).length} z 5 stages. Pokračuj dál!
                </p>
                <Button
                  onClick={() => {
                    const nextIncomplete = todayStages.find((s) => !s.completed && s.unlocked)
                    if (nextIncomplete) {
                      const nextStage = stageData.find((sd) => sd.id === nextIncomplete.id)
                      if (nextStage) {
                        router.push(nextStage.href)
                      }
                    }
                  }}
                  size="lg"
                  className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <ArrowRight className="h-6 w-6 mr-2" />
                  Pokračovat
                </Button>
              </CardContent>
            </Card>
          )}

          {!todayEntry && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <CardContent className="p-16 text-center">
                <Sun className="h-24 w-24 mx-auto mb-6 text-orange-400" />
                <h3 className="text-3xl font-black mb-4">Začni Dnešní Den!</h3>
                <p className="text-xl text-muted-foreground mb-8">
                  Ještě jsi nezačal dnešní Daily Trading Flow. Začni Morning Assessment!
                </p>
                <Button
                  onClick={() => router.push("/morning-check")}
                  size="lg"
                  className="h-16 px-12 text-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                >
                  <Sun className="h-6 w-6 mr-2" />
                  Začít Morning Check
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-8">
          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => {
                const entryReadiness = entry.morningCheck?.score || 0
                const isExpanded = expandedEntry === entry.date

                return (
                  <Card
                    key={entry.date}
                    className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-white/10 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div
                        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.date)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                              <CalendarIcon className="h-8 w-8 text-sky-400" />
                            </div>
                            <div>
                              <div className="text-xl font-black mb-1">
                                {format(new Date(entry.date), "EEEE, d. MMMM", { locale: cs })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(entry.date), "yyyy")}
                              </div>
                              {entry.date === format(new Date(), "yyyy-MM-dd") && (
                                <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
                                  <Target className="h-3 w-3 mr-1" />
                                  Dnes
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {entry.morningCheck && (
                              <div className="text-center">
                                <div className={cn("text-4xl font-black", getReadinessColor(entryReadiness))}>
                                  {entryReadiness}%
                                </div>
                                <div className="text-xs text-muted-foreground">readiness</div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-2xl font-black mb-1">{entry.stagesCompleted}/5</div>
                              <div className="text-xs text-muted-foreground">stages</div>
                            </div>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? "Skrýt" : "Zobrazit"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && entry.morningCheck && (
                        <div className="border-t border-white/10 p-6 bg-white/5">
                          <div className="space-y-6">
                            {/* Morning Check Details */}
                            <div>
                              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sun className="h-5 w-5 text-orange-400" />
                                Morning Check Data
                              </h4>
                              <div className="grid md:grid-cols-5 gap-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Moon className="h-4 w-4 text-indigo-400" />
                                    <span className="text-xs text-muted-foreground">Spánek</span>
                                  </div>
                                  <div className="text-lg font-black text-white">{entry.morningCheck.sleepHours}h</div>
                                  <div className="text-xs text-muted-foreground">
                                    kvalita {entry.morningCheck.sleepQuality}/10
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-yellow-400" />
                                    <span className="text-xs text-muted-foreground">Energie</span>
                                  </div>
                                  <div className="text-lg font-black text-white">
                                    {entry.morningCheck.energyLevel}/10
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Brain className="h-4 w-4 text-purple-400" />
                                    <span className="text-xs text-muted-foreground">Focus</span>
                                  </div>
                                  <div className="text-lg font-black text-white">{entry.morningCheck.focus}/10</div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="text-xs text-muted-foreground">Stres</span>
                                  </div>
                                  <div className="text-lg font-black text-white">
                                    {entry.morningCheck.stressLevel}/10
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Heart className="h-4 w-4 text-pink-400" />
                                    <span className="text-xs text-muted-foreground">Nálada</span>
                                  </div>
                                  <div className="text-lg font-black text-white">
                                    {entry.morningCheck.emotionalState}/10
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* AI Insights for this day */}
                            {(() => {
                              const dayDecision = generateTradingDecision(entry.morningCheck, entryReadiness)
                              return (
                                dayDecision && (
                                  <div>
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                      <Brain className="h-5 w-5 text-purple-400" />
                                      AI Insights z tohoto dne
                                    </h4>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                      <div className="text-sm text-white leading-relaxed">{dayDecision.message}</div>
                                    </div>
                                  </div>
                                )
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-white/10">
              <CardContent className="p-16 text-center">
                <CalendarIcon className="h-24 w-24 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h3 className="text-3xl font-black mb-4">Zatím Žádné Záznamy</h3>
                <p className="text-xl text-muted-foreground mb-8">Začni sledovat svůj den!</p>
                <Button onClick={() => router.push("/morning-check")} size="lg" className="h-14 px-8 text-lg">
                  <Target className="h-6 w-6 mr-2" />
                  Začít Morning Check
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
