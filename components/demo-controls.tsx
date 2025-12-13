"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Dices, TrendingUp, Clock, RotateCcw, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  generateRandomTrade,
  generateRandomReadinessData,
  getSimulatedDate,
  setSimulatedDate as saveSimulatedDate,
} from "@/utils/random-data-generator"
import { useAuth } from "@/contexts/auth-context"
import { saveJournalEntry, getUserData, setUserData } from "@/utils/storage-utils"

interface DemoControlsProps {
  onDataGenerated?: () => void
}

export function DemoControls({ onDataGenerated }: DemoControlsProps) {
  const { user } = useAuth()
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const mode = localStorage.getItem("trading-mode")
    setIsLiveMode(mode === "live")

    // Load simulated date
    const storedDate = getSimulatedDate()
    setSimulatedDate(storedDate)
  }, [])

  // Only show for Demo account
  if (user?.email !== "Demo") return null

  const handleGenerateRandomTrade = () => {
    setIsGenerating(true)
    try {
      console.log("[v0] DemoControls: Generating random trade...")
      const trade = generateRandomTrade(simulatedDate)
      console.log("[v0] DemoControls: Trade generated:", trade)

      // Save using storage-utils which handles live mode correctly
      saveJournalEntry(trade)
      console.log("[v0] DemoControls: Trade saved via saveJournalEntry")

      // Also save to trade-records for Daily Tracker
      const existingTrades = JSON.parse(localStorage.getItem("trade-records") || "[]")
      existingTrades.push(trade)
      localStorage.setItem("trade-records", JSON.stringify(existingTrades))
      console.log("[v0] DemoControls: Trade saved to trade-records")

      toast({
        title: "Obchod vytvořen",
        description: `${trade.pair} ${trade.tradeType} | P/L: $${trade.profitLoss.toFixed(2)} | ${trade.pips} pips`,
      })

      setTimeout(() => window.location.reload(), 500)
      onDataGenerated?.()
    } catch (error) {
      console.error("[v0] DemoControls: Error generating trade:", error)
      toast({ title: "Chyba", description: "Nepodařilo se vytvořit obchod", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateReadiness = () => {
    setIsGenerating(true)
    try {
      console.log("[v0] DemoControls: Generating readiness...")
      const readiness = generateRandomReadinessData(simulatedDate)
      console.log("[v0] DemoControls: Readiness generated:", readiness)

      // Save to userData
      const userData = getUserData()
      if (!userData.readinessEntries) userData.readinessEntries = []
      userData.readinessEntries.push(readiness)
      setUserData(userData)

      // Also save to daily-tracker-entries and mindtrader-morning-checks
      const existingEntries = JSON.parse(localStorage.getItem("daily-tracker-entries") || "[]")
      existingEntries.push(readiness)
      localStorage.setItem("daily-tracker-entries", JSON.stringify(existingEntries))

      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      morningChecks.push({
        ...readiness,
        score: readiness.readinessScore,
      })
      localStorage.setItem("mindtrader-morning-checks", JSON.stringify(morningChecks))

      console.log("[v0] DemoControls: Readiness saved")

      toast({
        title: "Readiness vytvořen",
        description: `Skóre: ${readiness.readinessScore}/100 pro ${readiness.date}`,
      })

      setTimeout(() => window.location.reload(), 500)
      onDataGenerated?.()
    } catch (error) {
      console.error("[v0] DemoControls: Error generating readiness:", error)
      toast({ title: "Chyba", description: "Nepodařilo se vytvořit readiness", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate5Stages = () => {
    setIsGenerating(true)
    try {
      console.log("[v0] DemoControls: Generating 5 stages...")
      const dateStr = simulatedDate.toISOString().split("T")[0]
      const today = simulatedDate.toDateString()

      // Generate random thoughts for each stage
      const stageThoughts = [
        [
          "Cítím se připravený, mám jasný plán na dnešní session.",
          "Prošel jsem si svůj trading plán a vím co hledám.",
          "Market vypadá zajímavě, ale počkám na správný setup.",
        ],
        [
          "Nastavil jsem si jasné cíle a emoční target.",
          "Dnes se zaměřím na disciplínu a trpělivost.",
          "Mám jasnou intenci - kvalita nad kvantitu.",
        ],
        [
          "Trading plán je hotový, vím kde jsou moje levely.",
          "Mám identifikované setup a risk management.",
          "Připravený na execution podle plánu.",
        ],
        [
          "Zaznamenal jsem své trades a emoce.",
          "Trade šel podle plánu, držel jsem risk.",
          "I přes ztrátu jsem se držel strategie.",
        ],
        [
          "Dobrá session, dodržel jsem risk management.",
          "Dnes jsem spokojený s mým tradingem.",
          "Naučil jsem se něco nového, zítra budu lepší.",
        ],
      ]

      // Create stages in format expected by daily-stage-context
      const completedStages = [
        {
          id: 1,
          name: "morning-assessment",
          title: "Morning Assessment",
          description: "Check your physical and mental state",
          icon: "🌅",
          href: "/morning-check",
          completed: true,
          unlocked: true,
          completedAt: new Date(simulatedDate.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          thoughts: stageThoughts[0][Math.floor(Math.random() * stageThoughts[0].length)],
        },
        {
          id: 2,
          name: "daily-intention",
          title: "Daily Intention",
          description: "Set your goals and emotional targets",
          icon: "🎯",
          href: "/daily-intention",
          completed: true,
          unlocked: true,
          completedAt: new Date(simulatedDate.getTime() - 3 * 60 * 60 * 1000).toISOString(),
          thoughts: stageThoughts[1][Math.floor(Math.random() * stageThoughts[1].length)],
        },
        {
          id: 3,
          name: "trading-plan",
          title: "Trading Plan",
          description: "Define your strategy for today",
          icon: "📋",
          href: "/trading-plan",
          completed: true,
          unlocked: true,
          completedAt: new Date(simulatedDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          thoughts: stageThoughts[2][Math.floor(Math.random() * stageThoughts[2].length)],
        },
        {
          id: 4,
          name: "record-trades",
          title: "Record Trades",
          description: "Log your trades and emotions",
          icon: "💼",
          href: "/record-trades",
          completed: true,
          unlocked: true,
          completedAt: new Date(simulatedDate.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          thoughts: stageThoughts[3][Math.floor(Math.random() * stageThoughts[3].length)],
        },
        {
          id: 5,
          name: "daily-summary",
          title: "Daily Summary",
          description: "Review your day and key learnings",
          icon: "🌙",
          href: "/daily-summary",
          completed: true,
          unlocked: true,
          completedAt: simulatedDate.toISOString(),
          thoughts: stageThoughts[4][Math.floor(Math.random() * stageThoughts[4].length)],
        },
      ]

      // Save to daily-stages (format used by daily-stage-context)
      localStorage.setItem("daily-stages", JSON.stringify(completedStages))
      localStorage.setItem("daily-stages-date", today)

      // Also save individual stage data
      const morningData = {
        date: dateStr,
        id: Date.now().toString(),
        timestamp: simulatedDate.getTime() - 4 * 60 * 60 * 1000,
        score: Math.floor(Math.random() * 20) + 75,
        sleep: Math.floor(Math.random() * 3) + 6,
        mood: Math.floor(Math.random() * 3) + 7,
        focus: Math.floor(Math.random() * 3) + 7,
        energy: Math.floor(Math.random() * 3) + 7,
        stress: Math.floor(Math.random() * 3) + 2,
        notes: completedStages[0].thoughts,
      }
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      morningChecks.push(morningData)
      localStorage.setItem("mindtrader-morning-checks", JSON.stringify(morningChecks))

      const intentionData = {
        date: dateStr,
        id: Date.now().toString() + "1",
        timestamp: simulatedDate.getTime() - 3 * 60 * 60 * 1000,
        goals: ["Dodržet risk management", "Max 3 trades", "Kvalita nad kvantitu"],
        emotionalTarget: "Klidný a disciplinovaný",
        notes: completedStages[1].thoughts,
      }
      const intentions = JSON.parse(localStorage.getItem("daily-intentions") || "[]")
      intentions.push(intentionData)
      localStorage.setItem("daily-intentions", JSON.stringify(intentions))

      const planData = {
        date: dateStr,
        id: Date.now().toString() + "2",
        timestamp: simulatedDate.getTime() - 2 * 60 * 60 * 1000,
        pairs: ["EUR/USD", "GBP/USD"],
        setups: ["Breakout", "Pullback"],
        riskPerTrade: 1,
        maxTrades: 3,
        notes: completedStages[2].thoughts,
      }
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      plans.push(planData)
      localStorage.setItem("trading-plans", JSON.stringify(plans))

      console.log("[v0] DemoControls: 5 stages saved to daily-stages")

      toast({
        title: "5 Stages vyplněny",
        description: `Všech 5 fází bylo vygenerováno pro ${dateStr}`,
      })

      setTimeout(() => window.location.reload(), 500)
      onDataGenerated?.()
    } catch (error) {
      console.error("[v0] DemoControls: Error generating 5 stages:", error)
      toast({ title: "Chyba", description: "Nepodařilo se vytvořit 5 stages", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAdvanceDay = () => {
    console.log("[v0] DemoControls: Advancing day...")
    const newDate = new Date(simulatedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSimulatedDate(newDate)
    saveSimulatedDate(newDate)

    localStorage.removeItem("daily-stages")
    localStorage.removeItem("mindtrader-morning-checks")
    localStorage.removeItem("daily-intentions")
    localStorage.removeItem("trading-plans")
    localStorage.removeItem("trade-records")

    // Update daily-stages-date so stages reset for new day
    localStorage.setItem("daily-stages-date", newDate.toDateString())

    console.log("[v0] DemoControls: Date advanced to", newDate.toLocaleDateString("cs-CZ"))

    toast({
      title: "Den posunut",
      description: `Nové datum: ${newDate.toLocaleDateString("cs-CZ")} - Stages vyprázdněny`,
    })

    setTimeout(() => window.location.reload(), 500)
  }

  const handleAdvanceWeek = () => {
    console.log("[v0] DemoControls: Advancing week...")
    const newDate = new Date(simulatedDate)
    newDate.setDate(newDate.getDate() + 7)
    setSimulatedDate(newDate)
    saveSimulatedDate(newDate)

    localStorage.removeItem("daily-stages")
    localStorage.removeItem("mindtrader-morning-checks")
    localStorage.removeItem("daily-intentions")
    localStorage.removeItem("trading-plans")
    localStorage.removeItem("trade-records")

    // Update daily-stages-date
    localStorage.setItem("daily-stages-date", newDate.toDateString())

    console.log("[v0] DemoControls: Date advanced to", newDate.toLocaleDateString("cs-CZ"))

    toast({
      title: "Týden posunut",
      description: `Nové datum: ${newDate.toLocaleDateString("cs-CZ")} - Stages vyprázdněny`,
    })

    setTimeout(() => window.location.reload(), 500)
  }

  const handleResetDate = () => {
    const today = new Date()
    setSimulatedDate(today)
    saveSimulatedDate(today)
    localStorage.setItem("daily-stages-date", today.toDateString())
    toast({ title: "Datum resetováno", description: "Nastaveno na dnešek" })
    setTimeout(() => window.location.reload(), 500)
  }

  const handleResetStatistics = () => {
    if (!confirm("Opravdu chcete resetovat VŠECHNY statistiky? Tato akce je nevratná!")) return

    try {
      console.log("[v0] DemoControls: Resetting all statistics...")

      // Clear ALL localStorage keys except auth
      const keysToKeep = ["mindtrader-auth-token", "supabase.auth.token"]
      const allKeys = Object.keys(localStorage)

      allKeys.forEach((key) => {
        if (!keysToKeep.some((k) => key.includes(k))) {
          localStorage.removeItem(key)
        }
      })

      // Set up fresh Demo account state
      localStorage.setItem("trading-mode", "live")
      localStorage.setItem("trader-mindset-live-mode", "true")
      localStorage.setItem(
        "trader-mindset-data",
        JSON.stringify({
          journalEntries: [],
          readinessEntries: [],
          trades: [],
          fiveStagesHistory: {},
        }),
      )
      localStorage.setItem("daily-tracker-entries", "[]")
      localStorage.setItem("journal-entries", "[]")
      localStorage.setItem("trade-records", "[]")
      localStorage.setItem("mindtrader-morning-checks", "[]")
      localStorage.setItem("daily-intentions", "[]")
      localStorage.setItem("trading-plans", "[]")

      console.log("[v0] DemoControls: Reset complete")

      toast({
        title: "Statistiky resetovány",
        description: "Všechna data byla smazána",
      })

      setTimeout(() => (window.location.href = "/"), 500)
    } catch (error) {
      console.error("[v0] DemoControls: Error resetting:", error)
      toast({ title: "Chyba", description: "Nepodařilo se resetovat", variant: "destructive" })
    }
  }

  const handleModeToggle = () => {
    const newMode = isLiveMode ? "virtual" : "live"
    localStorage.setItem("trading-mode", newMode)
    localStorage.setItem("trader-mindset-live-mode", newMode === "live" ? "true" : "false")
    setIsLiveMode(!isLiveMode)

    toast({
      title: newMode === "live" ? "Live Mode aktivován" : "Virtual Mode aktivován",
      description: newMode === "live" ? "Pracuješ s reálnými daty" : "Pracuješ s demo daty",
    })

    setTimeout(() => window.location.reload(), 300)
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 bg-slate-900/95 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20 w-64">
      <div
        className="p-3 cursor-pointer flex items-center justify-between border-b border-slate-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
          <Dices className="w-4 h-4" />
          Demo Controls
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Live/Virtual mode toggle */}
          <Button
            onClick={handleModeToggle}
            className={`w-full h-9 ${
              isLiveMode
                ? "bg-green-600/20 hover:bg-green-600/30 border-2 border-green-500/50"
                : "bg-red-600/20 hover:bg-red-600/30 border-2 border-red-500/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLiveMode ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
              {isLiveMode ? <Zap className="w-4 h-4 text-green-400" /> : <Shield className="w-4 h-4 text-red-400" />}
              <span className={`font-semibold text-xs ${isLiveMode ? "text-green-300" : "text-red-300"}`}>
                {isLiveMode ? "Live Mode" : "Virtual Mode"}
              </span>
            </div>
          </Button>

          {/* Date Simulator */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="text-xs text-gray-400">Simulované datum:</div>
            <div className="text-sm font-mono text-white bg-slate-800 px-2 py-1 rounded">
              {simulatedDate.toLocaleDateString("cs-CZ")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={handleAdvanceDay} className="h-8 text-xs bg-transparent">
                <Clock className="w-3 h-3 mr-1" /> +1 den
              </Button>
              <Button size="sm" variant="outline" onClick={handleAdvanceWeek} className="h-8 text-xs bg-transparent">
                <Calendar className="w-3 h-3 mr-1" /> +1 týden
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={handleResetDate} className="w-full h-7 text-xs text-gray-400">
              Reset na dnes
            </Button>
          </div>

          {/* Random Data Generators */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="text-xs text-gray-400">Generovat data:</div>
            <Button
              size="sm"
              onClick={handleGenerateRandomTrade}
              disabled={isGenerating}
              className="w-full h-8 bg-cyan-600 hover:bg-cyan-700 text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" /> Náhodný trade
            </Button>
          </div>

          {/* Reset Statistics */}
          <div className="pt-2 border-t border-slate-700">
            <Button
              size="sm"
              onClick={handleResetStatistics}
              disabled={isGenerating}
              className="w-full h-8 bg-red-600 hover:bg-red-700 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Resetovat statistiky
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
