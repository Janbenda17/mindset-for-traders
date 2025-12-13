"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Dices, TrendingUp, Clock, RotateCcw, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  generateRandomTrade,
  getSimulatedDate,
  setSimulatedDate as saveSimulatedDate,
} from "@/utils/random-data-generator"
import { useAuth } from "@/contexts/auth-context"
import { saveJournalEntry } from "@/utils/storage-utils"

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
    console.log("[v0] DemoControls: handleGenerateRandomTrade called")
    setIsGenerating(true)
    try {
      console.log("[v0] DemoControls: Generating random trade for date:", simulatedDate.toISOString())
      const trade = generateRandomTrade(simulatedDate)
      console.log("[v0] DemoControls: Trade generated:", trade)

      // This ensures trade is saved to trader-mindset-data.journalEntries in live mode
      saveJournalEntry(trade)
      console.log("[v0] DemoControls: Trade saved via saveJournalEntry()")

      toast({
        title: "✅ Obchod vytvořen",
        description: `${trade.pair} ${trade.tradeType} | P/L: $${trade.profitLoss.toFixed(2)} | ${trade.pips} pips`,
      })

      setTimeout(() => {
        console.log("[v0] DemoControls: Reloading page...")
        window.location.reload()
      }, 800)
      onDataGenerated?.()
    } catch (error) {
      console.error("[v0] DemoControls: Error generating trade:", error)
      toast({ title: "Chyba", description: "Nepodařilo se vytvořit obchod", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAdvanceDay = () => {
    console.log("[v0] DemoControls: Advancing day...")
    const newDate = new Date(simulatedDate)
    newDate.setDate(newDate.getDate() + 1)

    // Save new simulated date
    setSimulatedDate(newDate)
    saveSimulatedDate(newDate)

    // Set new date string for daily-stages - this will trigger reset in DailyStageContext
    const newDateString = newDate.toDateString()
    localStorage.setItem("daily-stages-date", newDateString)
    localStorage.removeItem("daily-stages")

    console.log("[v0] DemoControls: Date advanced to", newDate.toLocaleDateString("cs-CZ"))

    toast({
      title: "Den posunut",
      description: `Nové datum: ${newDate.toLocaleDateString("cs-CZ")} - Daily tracker resetován`,
    })

    setTimeout(() => window.location.reload(), 500)
  }

  const handleAdvanceWeek = () => {
    console.log("[v0] DemoControls: Advancing week...")
    const newDate = new Date(simulatedDate)
    newDate.setDate(newDate.getDate() + 7)

    setSimulatedDate(newDate)
    saveSimulatedDate(newDate)

    const newDateString = newDate.toDateString()
    localStorage.setItem("daily-stages-date", newDateString)
    localStorage.removeItem("daily-stages")

    console.log("[v0] DemoControls: Date advanced to", newDate.toLocaleDateString("cs-CZ"))

    toast({
      title: "Týden posunut",
      description: `Nové datum: ${newDate.toLocaleDateString("cs-CZ")} - Daily tracker resetován`,
    })

    setTimeout(() => window.location.reload(), 500)
  }

  const handleResetDate = () => {
    const today = new Date()
    setSimulatedDate(today)
    saveSimulatedDate(today)
    localStorage.setItem("daily-stages-date", today.toDateString())
    localStorage.removeItem("daily-stages")
    toast({ title: "Datum resetováno", description: "Nastaveno na dnešek" })
    setTimeout(() => (window.location.href = "/"), 500)
  }

  const handleResetStatistics = () => {
    if (!confirm("Opravdu chcete resetovat VŠECHNY statistiky? Tato akce je nevratná!")) return

    try {
      console.log("[v0] DemoControls: Resetting all statistics...")

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
      localStorage.setItem("user-trades", "[]")
      localStorage.setItem("journal-entries", "[]")
      localStorage.setItem("user-journal-entries", "[]")
      localStorage.setItem("daily-tracker-entries", "[]")
      localStorage.setItem("mindtrader-morning-checks", "[]")
      localStorage.setItem("daily-intentions", "[]")
      localStorage.setItem("trading-plans", "[]")
      localStorage.setItem("daily-stages-date", new Date().toDateString())

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

  const handleGenerateRandom5Stages = () => {
    console.log("[v0] DemoControls: handleGenerateRandom5Stages called - START")
    setIsGenerating(true)
    try {
      console.log("[v0] DemoControls: Generating random 5 stages for date:", simulatedDate.toISOString())

      const dateStr = simulatedDate.toISOString().split("T")[0]
      const baseTime = simulatedDate.getTime()

      const randomSleepQuality = Math.floor(Math.random() * 3) + 7 // 7-10
      const randomSleepHours = Math.floor(Math.random() * 3) + 6 // 6-9
      const randomHydration = Math.floor(Math.random() * 3) + 7
      const randomStress = Math.floor(Math.random() * 4) + 3 // 3-7
      const randomFocus = Math.floor(Math.random() * 3) + 7
      const randomMood = ["Klidný", "Sebevědomý", "Pozitivní", "Energický", "Neutrální"][Math.floor(Math.random() * 5)]
      const randomMeditationTime = Math.floor(Math.random() * 25) + 5 // 5-30 min
      const randomScore = Math.floor(Math.random() * 25) + 65 // 65-90

      // Complete all stages with unique random data
      const allStages = [
        {
          id: 1,
          name: "morning-assessment",
          title: "Morning Assessment",
          description: "Check your physical and mental state",
          icon: "🌅",
          href: "/morning-check",
          completed: true,
          unlocked: true,
          completedAt: new Date(baseTime - 4 * 60 * 60 * 1000).toISOString(),
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
          completedAt: new Date(baseTime - 3 * 60 * 60 * 1000).toISOString(),
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
          completedAt: new Date(baseTime - 2 * 60 * 60 * 1000).toISOString(),
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
          completedAt: new Date(baseTime - 1 * 60 * 60 * 1000).toISOString(),
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
          completedAt: new Date(baseTime).toISOString(),
        },
      ]

      console.log("[v0] DemoControls: Saving stages to localStorage:", allStages)
      localStorage.setItem("daily-stages", JSON.stringify(allStages))
      localStorage.setItem("daily-stages-date", simulatedDate.toDateString())

      const morningCheck = {
        id: `morning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: dateStr,
        sleepQuality: randomSleepQuality,
        sleepHours: randomSleepHours,
        exercised: Math.random() > 0.4,
        exerciseType: ["Běh", "Posilovna", "Jóga", "Procházka"][Math.floor(Math.random() * 4)],
        exerciseDuration: Math.floor(Math.random() * 40) + 20,
        hydration: randomHydration,
        stressLevel: randomStress,
        focus: randomFocus,
        emotionalState: randomMood,
        meditationTime: randomMeditationTime,
        morningRoutine: Math.random() > 0.3,
        physicalHealth: Math.floor(Math.random() * 3) + 7,
        score: randomScore,
      }

      console.log("[v0] DemoControls: Generated morning check:", morningCheck)
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      const filteredChecks = morningChecks.filter((c: any) => c.date !== dateStr)
      filteredChecks.push(morningCheck)
      localStorage.setItem("mindtrader-morning-checks", JSON.stringify(filteredChecks))
      console.log("[v0] DemoControls: Saved morning checks, count:", filteredChecks.length)

      const dailyGoals = [
        "Udržet disciplínu a dodržovat risk management",
        "Čekat na A+ setupy, žádné FOMO",
        "Maximálně 3 trades, kvalita nad kvantitou",
        "Dodržet trading plán bez výjimek",
        "Být trpělivý a nenutit trades",
      ]
      const intention = {
        id: `intention-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: dateStr,
        dailyGoal: dailyGoals[Math.floor(Math.random() * dailyGoals.length)],
        emotionalTarget: ["Zůstat klidný", "Být trpělivý", "Udržet disciplínu"][Math.floor(Math.random() * 3)],
        maxRisk: ["1%", "1.5%", "2%"][Math.floor(Math.random() * 3)],
        profitTarget: `$${Math.floor(Math.random() * 500) + 200}`,
        tradingHours: ["1-2 hodiny", "2-3 hodiny", "3-4 hodiny"][Math.floor(Math.random() * 3)],
        timestamp: baseTime - 3 * 60 * 60 * 1000,
      }

      console.log("[v0] DemoControls: Generated intention:", intention)
      const intentions = JSON.parse(localStorage.getItem("daily-intentions") || "[]")
      const filteredIntentions = intentions.filter((i: any) => i.date !== dateStr)
      filteredIntentions.push(intention)
      localStorage.setItem("daily-intentions", JSON.stringify(filteredIntentions))
      console.log("[v0] DemoControls: Saved intentions, count:", filteredIntentions.length)

      const strategies = [
        "Breakout na EUR/USD a GBP/USD",
        "Pullback trading na major pairs",
        "Trend following na trending markets",
        "Range trading na choppy days",
        "Reversal setups na klíčových levelech",
      ]
      const plan = {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: dateStr,
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        keyLevels: `${(1 + Math.random() * 0.1).toFixed(4)} support, ${(1.1 + Math.random() * 0.1).toFixed(4)} resistance`,
        entryRules: "Breakout s retestem, volume confirmation, clean price action",
        exitRules: `Target ${Math.floor(Math.random() * 40) + 20}-${Math.floor(Math.random() * 40) + 50} pips, stop ${Math.floor(Math.random() * 15) + 10} pips`,
        riskManagement: `Max ${Math.floor(Math.random() * 2) + 1}% per trade, max ${Math.floor(Math.random() * 3) + 2} trades denně`,
        marketConditions: ["Trending market", "Range-bound", "High volatility", "Low volatility"][
          Math.floor(Math.random() * 4)
        ],
        timestamp: baseTime - 2 * 60 * 60 * 1000,
      }

      console.log("[v0] DemoControls: Generated plan:", plan)
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      const filteredPlans = plans.filter((p: any) => p.date !== dateStr)
      filteredPlans.push(plan)
      localStorage.setItem("trading-plans", JSON.stringify(filteredPlans))
      console.log("[v0] DemoControls: Saved plans, count:", filteredPlans.length)

      // Also save to daily-tracker-entries for analytics
      const trackerEntry = {
        id: `tracker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: dateStr,
        readinessScore: morningCheck.score,
        mood: morningCheck.emotionalState,
        sleepHours: morningCheck.sleepHours,
        sleepQuality: morningCheck.sleepQuality,
        exercised: morningCheck.exercised,
        meditationMinutes: morningCheck.meditationTime,
        completedStages: 5,
      }

      console.log("[v0] DemoControls: Generated tracker entry:", trackerEntry)
      const trackerEntries = JSON.parse(localStorage.getItem("daily-tracker-entries") || "[]")
      const filteredTracker = trackerEntries.filter((t: any) => t.date !== dateStr)
      filteredTracker.push(trackerEntry)
      localStorage.setItem("daily-tracker-entries", JSON.stringify(filteredTracker))
      console.log("[v0] DemoControls: Saved tracker entries, count:", filteredTracker.length)

      console.log("[v0] DemoControls: 5 stages generation COMPLETE")

      toast({
        title: "✅ 5 Stages vyplněny",
        description: `Všechny stages byly náhodně vyplněny pro ${simulatedDate.toLocaleDateString("cs-CZ")}`,
      })

      setTimeout(() => {
        console.log("[v0] DemoControls: Reloading page...")
        window.location.reload()
      }, 800)
    } catch (error) {
      console.error("[v0] DemoControls: Error generating 5 stages:", error)
      toast({ title: "Chyba", description: "Nepodařilo se vyplnit 5 stages", variant: "destructive" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearCurrentDayData = () => {
    if (!confirm("Smazat všechna data pro dnešní den?")) return

    try {
      console.log("[v0] DemoControls: Clearing current day data...")

      const dateStr = simulatedDate.toISOString().split("T")[0]

      // Clear morning checks for current date
      const morningChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
      const filteredMorning = morningChecks.filter((c: any) => c.date !== dateStr)
      localStorage.setItem("mindtrader-morning-checks", JSON.stringify(filteredMorning))

      // Clear daily intentions for current date
      const intentions = JSON.parse(localStorage.getItem("daily-intentions") || "[]")
      const filteredIntentions = intentions.filter((i: any) => i.date !== dateStr)
      localStorage.setItem("daily-intentions", JSON.stringify(filteredIntentions))

      // Clear trading plans for current date
      const plans = JSON.parse(localStorage.getItem("trading-plans") || "[]")
      const filteredPlans = plans.filter((p: any) => p.date !== dateStr)
      localStorage.setItem("trading-plans", JSON.stringify(filteredPlans))

      // Clear daily tracker entries for current date
      const trackerEntries = JSON.parse(localStorage.getItem("daily-tracker-entries") || "[]")
      const filteredTracker = trackerEntries.filter((t: any) => t.date !== dateStr)
      localStorage.setItem("daily-tracker-entries", JSON.stringify(filteredTracker))

      // Clear daily stages
      localStorage.removeItem("daily-stages")
      localStorage.removeItem("daily-stages-date")

      console.log("[v0] DemoControls: Current day data cleared")

      toast({
        title: "Data smazána",
        description: "Všechna data pro dnešní den byla smazána",
      })

      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      console.error("[v0] DemoControls: Error clearing data:", error)
      toast({ title: "Chyba", description: "Nepodařilo se smazat data", variant: "destructive" })
    }
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
            <Button
              size="sm"
              onClick={handleGenerateRandom5Stages}
              disabled={isGenerating}
              className="w-full h-8 bg-purple-600 hover:bg-purple-700 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" /> Vyplnit 5 Stages
            </Button>
          </div>

          {/* Clear Current Day Data */}
          <Button
            size="sm"
            onClick={handleClearCurrentDayData}
            disabled={isGenerating}
            className="w-full h-8 bg-orange-600 hover:bg-orange-700 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Smazat dnešní data
          </Button>

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
