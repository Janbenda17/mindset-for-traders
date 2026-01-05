"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, AlertCircle, Database, RefreshCw, Trash2, Download } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useGamification } from "@/contexts/gamification-context"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface SystemCheck {
  name: string
  status: "working" | "warning" | "error" | "not-tested"
  message: string
  dataCount?: number
}

export default function SystemStatusPage() {
  const { isLiveMode } = useData()
  const { xp, level } = useGamification()
  const { user } = useAuth()

  const [checks, setChecks] = useState<SystemCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    runSystemChecks()
  }, [isLiveMode, isMounted])

  const runSystemChecks = () => {
    if (typeof window === "undefined" || !isMounted) return
    setLoading(true)
    const results: SystemCheck[] = []

    // Check 1: Trades data
    try {
      const tradesData = localStorage.getItem("mindtrader-trades")
      const trades = tradesData ? JSON.parse(tradesData) : null
      results.push({
        name: "Trading Data (Obchody)",
        status: trades && Array.isArray(trades) && trades.length > 0 ? "working" : "warning",
        message:
          trades && Array.isArray(trades)
            ? `${trades.length} obchodů uloženo v localStorage`
            : "Žádné obchody nenalezeny - zkus přidat obchod v sekci Obchod",
        dataCount: trades?.length || 0,
      })
    } catch (error) {
      console.error("Error in runSystemChecks:", error)
    }

    // Check 2: Morning Checks
    const morningChecks = localStorage.getItem("mindtrader-morning-checks")
    const checksData = morningChecks ? JSON.parse(morningChecks) : null
    results.push({
      name: "Morning Checks (Ranní kontroly)",
      status: checksData && Array.isArray(checksData) && checksData.length > 0 ? "working" : "warning",
      message:
        checksData && Array.isArray(checksData)
          ? `${checksData.length} ranních kontrol uloženo`
          : "Žádné morning checks - zkus vyplnit Stage 1 v Daily Tracker",
      dataCount: checksData?.length || 0,
    })

    // Check 3: Daily Tracker
    const dailyEntries = localStorage.getItem("mindtrader-daily-entries")
    const entries = dailyEntries ? JSON.parse(dailyEntries) : null
    results.push({
      name: "Daily Tracker (Denní záznamy)",
      status: entries && Array.isArray(entries) && entries.length > 0 ? "working" : "warning",
      message:
        entries && Array.isArray(entries)
          ? `${entries.length} denních záznamů uloženo`
          : "Žádné daily entries - zkus vyplnit všechny stages v Daily Tracker",
      dataCount: entries?.length || 0,
    })

    // Check 4: Journal Entries
    const journalData = localStorage.getItem("journal-entries")
    const journal = journalData ? JSON.parse(journalData) : null
    results.push({
      name: "Journal Entries (Deník)",
      status: journal && Array.isArray(journal) && journal.length > 0 ? "working" : "warning",
      message:
        journal && Array.isArray(journal)
          ? `${journal.length} journal entries uloženo`
          : "Žádný journal - journal entries se vytváří automaticky při obchodech",
      dataCount: journal?.length || 0,
    })

    // Check 5: Gamification (XP/Level)
    results.push({
      name: "Gamification System (Level & XP)",
      status: xp > 0 || level > 1 ? "working" : "warning",
      message: `Level ${level}, ${xp} XP - systém funguje${xp === 0 ? " (zatím žádné aktivity)" : ""}`,
      dataCount: xp,
    })

    // Check 6: Initial Capital Setting
    const initialCapital = localStorage.getItem("initial-capital")
    results.push({
      name: "Počáteční kapitál (Settings)",
      status: initialCapital ? "working" : "warning",
      message: initialCapital
        ? `Nastaveno: $${Number.parseInt(initialCapital).toLocaleString()}`
        : "Není nastaveno - použije se default $10,000. Změň v Settings.",
      dataCount: initialCapital ? Number.parseInt(initialCapital) : 10000,
    })

    // Check 7: MindTrader Messages
    const mindtraderMessages = localStorage.getItem("mindtrader-messages")
    const messages = mindtraderMessages ? JSON.parse(mindtraderMessages) : null
    results.push({
      name: "MindTrader AI Chat",
      status: messages && Array.isArray(messages) && messages.length > 0 ? "working" : "warning",
      message:
        messages && Array.isArray(messages)
          ? `${messages.length} zpráv v historii (resetuje se denně)`
          : "Žádná chat historie - zkus napsat zprávu v MindTrader",
      dataCount: messages?.length || 0,
    })

    // Check 8: Profile Data
    const profileData = localStorage.getItem("trader-mindset-profile")
    results.push({
      name: "Trading Profile (Onboarding)",
      status: profileData ? "working" : "warning",
      message: profileData ? "Profil vyplněn ✓" : "Profil není vyplněn - aktivuj Live Mode pro onboarding",
      dataCount: profileData ? 1 : 0,
    })

    setChecks(results)
    setLoading(false)
  }

  const generateDemoData = () => {
    const demoTrades = [
      {
        id: `trade-${Date.now()}-1`,
        symbol: "EURUSD",
        direction: "long",
        entryPrice: 1.085,
        exitPrice: 1.088,
        lotSize: 0.1,
        pnl: 30,
        date: new Date().toISOString(),
        timeframe: "15m",
        entryReason: "Breakout nad resistance",
        exitReason: "Target hit",
        emotionBefore: "Confident",
        emotionDuring: "Calm",
        emotionAfter: "Happy",
        confidenceBefore: 8,
        stressLevel: 3,
        mood: 8,
        followedPlan: true,
      },
      {
        id: `trade-${Date.now()}-2`,
        symbol: "GBPUSD",
        direction: "short",
        entryPrice: 1.265,
        exitPrice: 1.262,
        lotSize: 0.1,
        pnl: 30,
        date: new Date(Date.now() - 86400000).toISOString(),
        timeframe: "1h",
        entryReason: "Trend following",
        exitReason: "Take profit",
        emotionBefore: "Focused",
        emotionDuring: "Neutral",
        emotionAfter: "Satisfied",
        confidenceBefore: 7,
        stressLevel: 4,
        mood: 7,
        followedPlan: true,
      },
      {
        id: `trade-${Date.now()}-3`,
        symbol: "USDJPY",
        direction: "long",
        entryPrice: 149.5,
        exitPrice: 149.2,
        lotSize: 0.1,
        pnl: -30,
        date: new Date(Date.now() - 172800000).toISOString(),
        timeframe: "4h",
        entryReason: "Support bounce",
        exitReason: "Stop loss hit",
        emotionBefore: "Anxious",
        emotionDuring: "Stressed",
        emotionAfter: "Disappointed",
        confidenceBefore: 5,
        stressLevel: 7,
        mood: 4,
        followedPlan: false,
      },
      {
        id: `trade-${Date.now()}-4`,
        symbol: "BTCUSD",
        direction: "long",
        entryPrice: 42000,
        exitPrice: 42500,
        lotSize: 0.01,
        pnl: 50,
        date: new Date(Date.now() - 259200000).toISOString(),
        timeframe: "1d",
        entryReason: "Bullish divergence",
        exitReason: "Partial profit",
        emotionBefore: "Excited",
        emotionDuring: "Hopeful",
        emotionAfter: "Happy",
        confidenceBefore: 9,
        stressLevel: 2,
        mood: 9,
        followedPlan: true,
      },
      {
        id: `trade-${Date.now()}-5`,
        symbol: "XAUUSD",
        direction: "short",
        entryPrice: 2050,
        exitPrice: 2040,
        lotSize: 0.05,
        pnl: 50,
        date: new Date(Date.now() - 345600000).toISOString(),
        timeframe: "1h",
        entryReason: "Resistance rejection",
        exitReason: "Target reached",
        emotionBefore: "Confident",
        emotionDuring: "Calm",
        emotionAfter: "Satisfied",
        confidenceBefore: 8,
        stressLevel: 3,
        mood: 8,
        followedPlan: true,
      },
    ]

    localStorage.setItem("mindtrader-trades", JSON.stringify(demoTrades))

    const morningCheck = {
      id: `check-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      sleepQuality: 8,
      sleepHours: 7.5,
      energyLevel: 8,
      stressLevel: 3,
      focus: 8,
      physicalHealth: 8,
      emotionalState: 8,
      exercise: true,
      exerciseMinutes: 30,
      meditation: true,
      meditationMinutes: 15,
      morningRoutine: true,
      hydration: true,
      score: 85,
    }

    const existingChecks = JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]")
    existingChecks.push(morningCheck)
    localStorage.setItem("mindtrader-morning-checks", JSON.stringify(existingChecks))

    localStorage.setItem("initial-capital", "10000")

    runSystemChecks()

    alert("Demo data vygenerována! Refresh stránku pro zobrazení změn.")
  }

  const clearAllData = () => {
    if (confirm("Opravdu chceš smazat VŠECHNA data? Tato akce je nevratná!")) {
      const keysToDelete = [
        "mindtrader-trades",
        "mindtrader-morning-checks",
        "mindtrader-daily-entries",
        "journal-entries",
        "mindtrader-messages",
        "initial-capital",
      ]

      keysToDelete.forEach((key) => localStorage.removeItem(key))
      runSystemChecks()
      alert("Všechna data smazána!")
    }
  }

  const resetWejzrAccount = () => {
    if (confirm("Opravdu chceš resetovat účet wejzr a smazat všechna jeho data? Tato akce je nevratná!")) {
      const keysToDelete = [
        "mindtrader-trades",
        "mindtrader-morning-checks",
        "mindtrader-daily-entries",
        "journal-entries",
        "mindtrader-messages",
        "initial-capital",
        "trader-mindset-gamification",
        "mindtrader-show-tour",
        "trader-mindset-onboarding-completed",
      ]

      keysToDelete.forEach((key) => localStorage.removeItem(key))
      runSystemChecks()
      alert("Účet wejzr byl resetován! Uživatel může začít od nuly.")
    }
  }

  const exportData = () => {
    const data = {
      trades: JSON.parse(localStorage.getItem("mindtrader-trades") || "[]"),
      morningChecks: JSON.parse(localStorage.getItem("mindtrader-morning-checks") || "[]"),
      dailyEntries: JSON.parse(localStorage.getItem("mindtrader-daily-entries") || "[]"),
      journalEntries: JSON.parse(localStorage.getItem("journal-entries") || "[]"),
      profile: JSON.parse(localStorage.getItem("trader-mindset-profile") || "null"),
      initialCapital: localStorage.getItem("initial-capital"),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindtrader-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  const resetAllTrades = async () => {
    if (
      !confirm(
        "Opravdu chceš smazat VŠECHNY OBCHODY ze VŠECH ÚČTŮ? Tato akce je nevratná a smaže data z Supabase i localStorage!",
      )
    ) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) {
        console.error("Error deleting from Supabase:", error)
        alert(`Chyba při mazání z Supabase: ${error.message}`)
        return
      }

      const allKeys = Object.keys(localStorage)
      const tradeKeys = allKeys.filter((key) => key.includes("mindtrader-trades"))
      tradeKeys.forEach((key) => localStorage.removeItem(key))

      runSystemChecks()
      alert(`Všechny obchody byly smazány! (${tradeKeys.length} localStorage klíčů + Supabase data)`)
    } catch (error) {
      console.error("Error resetting trades:", error)
      alert(`Chyba: ${error}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Funguje</Badge>
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Varování</Badge>
      case "error":
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Chyba</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Netestováno</Badge>
    }
  }

  const workingCount = checks.filter((c) => c.status === "working").length
  const warningCount = checks.filter((c) => c.status === "warning").length
  const errorCount = checks.filter((c) => c.status === "error").length
  const healthPercentage = checks.length > 0 ? (workingCount / checks.length) * 100 : 0

  if (!isMounted || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Načítání system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Status Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Přehled funkčnosti všech systémů v {isLiveMode ? "Live" : "Virtual"} módu
          </p>
        </div>
        <Badge
          className={
            isLiveMode
              ? "bg-green-500/20 text-green-300 border-green-500/30"
              : "bg-red-500/20 text-red-300 border-red-500/30"
          }
        >
          {isLiveMode ? "🔴 Live Mode" : "🎮 Virtual Mode"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Celkový stav systému</CardTitle>
          <CardDescription>Health score: {healthPercentage.toFixed(0)}%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={healthPercentage} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-3xl font-bold text-green-400">{workingCount}</div>
              <div className="text-sm text-muted-foreground">Funguje</div>
            </div>
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Varování</div>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-3xl font-bold text-red-400">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Chyby</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={runSystemChecks} variant="outline" className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Refresh Kontroly
        </Button>
        <Button onClick={generateDemoData} variant="outline" className="gap-2 bg-transparent">
          <Database className="w-4 h-4" />
          Generovat Demo Data
        </Button>
        <Button onClick={exportData} variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Exportovat Data
        </Button>
        <Button onClick={resetWejzrAccount} variant="destructive" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Reset účtu wejzr
        </Button>
        <Button onClick={resetAllTrades} variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700">
          <Trash2 className="w-4 h-4" />
          Reset VŠECH obchodů (ALL USERS)
        </Button>
        <Button onClick={clearAllData} variant="destructive" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Smazat Všechna Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailní přehled systémů</CardTitle>
          <CardDescription>Status každého modulu aplikace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index}>
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(check.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{check.name}</h3>
                      {getStatusBadge(check.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.dataCount !== undefined && check.dataCount > 0 && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {check.dataCount} {check.name.includes("kapitál") ? "USD" : "items"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                {index < checks.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>localStorage Inspector</CardTitle>
          <CardDescription>Raw data v localStorage (pro debugging)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs font-mono">
            {[
              "mindtrader-trades",
              "mindtrader-morning-checks",
              "mindtrader-daily-entries",
              "journal-entries",
              "mindtrader-messages",
              "initial-capital",
              "trader-mindset-gamification",
              "mindtrader-show-tour",
              "trader-mindset-onboarding-completed",
            ].map((key) => {
              const data = typeof window !== "undefined" ? localStorage.getItem(key) : null
              return (
                <div key={key} className="p-3 bg-slate-900 rounded border border-slate-700">
                  <div className="text-blue-400 mb-1">{key}:</div>
                  <div className="text-gray-400 break-all max-h-20 overflow-y-auto">
                    {data ? data.substring(0, 200) + (data.length > 200 ? "..." : "") : "null"}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
