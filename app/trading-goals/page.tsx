"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, Sparkles, Loader, Shield, Target, Zap,
  Brain, CheckCircle2, AlertTriangle, TrendingDown, Flame, Lock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"
import { cn } from "@/lib/utils"

interface Goal {
  id: string
  period: "weekly" | "monthly"
  goal: string
  focusArea?: string
  why?: string
  startDate: string
  endDate: string
  milestones: string[]
  aiGenerated: boolean
  createdAt: string
}

const DEMO_GOALS: Goal[] = [
  {
    id: "demo-weekly-1",
    period: "weekly",
    goal: "Drž se max. 2% rizika na obchod a max. 3 obchody denně",
    focusArea: "Risk management",
    why: "Posledních pár týdnů jsem viděl, že větší velikost pozice po ztrátě mi škodí víc, než pomáhá.",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    milestones: [
      "Nastavit fixní velikost pozice na 2 % equity před session",
      "Zapsat každý obchod do deníku ihned po uzavření",
      "Po 3. obchodu zavřít platformu bez ohledu na výsledek",
    ],
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-monthly-1",
    period: "monthly",
    goal: "Zvýšit win rate na A+ setupech nad 55 %",
    focusArea: "Selektivita setupů",
    why: "Chci obchodovat méně, ale kvalitněji — soustředit se jen na nejsilnější signály z mého playbooku.",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    milestones: [
      "Definovat přesná kritéria A+ setupu a držet se jich",
      "Týdně revidovat obchody, které nesplňovaly kritéria, a proč jsem je vzal",
      "Sledovat win rate jen na obchodech splňujících kritéria",
    ],
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  },
]

// 7-day discipline calendar — last 7 trading days
const DISCIPLINE_CALENDAR = [
  { day: "Po",    score: 100, winRate: 100, pnl: "+$340",   clean: true  },
  { day: "Út",    score: 83,  winRate: 67,  pnl: "+$210",   clean: true  },
  { day: "St",    score: 67,  winRate: 33,  pnl: "−$180",   clean: false },
  { day: "Čt",    score: 100, winRate: 100, pnl: "+$520",   clean: true  },
  { day: "Pá",    score: 17,  winRate: 14,  pnl: "−$1,660", clean: false },
  { day: "Po",    score: 100, winRate: 100, pnl: "+$180",   clean: true  },
  { day: "Dnes",  score: 83,  winRate: 67,  pnl: "+$120",   clean: true  },
]

const IMPACT_DATA = {
  withRoutine:    { winRate: 71, avgPnl: "+$348", days: 18 },
  withoutRoutine: { winRate: 24, avgPnl: "−$290", days: 11 },
}

// Demo stats — in live mode these would come from Supabase journal aggregation
const DEMO_STATS = {
  dailyProcessScore: 83,      // % of today's process habits completed
  dailyProcessMax: 100,
  drawdownShield: 17,         // % remaining — intentionally low to show pulsing danger state
  drawdownUsed: 1660,         // $1,660 used of $2,000 weekly limit
  drawdownMax: 2000,
  monthlyHabitScore: 70,      // % of days this month with clean process
  monthlyDaysClean: 21,
  monthlyDaysTotal: 30,
  badHabits: [
    { id: "revenge",    label: "Revenge Trade",                    sublabel: "tento týden",   limit: 0, used: 0 },
    { id: "fomo",       label: "FOMO Exit",                        sublabel: "tento měsíc",   limit: 3, used: 1 },
    { id: "overtrade",  label: "Overtrading Day",                  sublabel: "tento měsíc",   limit: 5, used: 2 },
    { id: "rulebreak",  label: "Porušení plánu",                   sublabel: "tento týden",   limit: 2, used: 0 },
    { id: "3loss",      label: "Trading after 3 consecutive losses", sublabel: "tento týden", limit: 0, used: 0 },
  ],
  processRules: [
    {
      id: "3loss-rule",
      label: "No execution after 3 consecutive losses",
      description: "Po 3 prohrách v řadě okamžitě zavři platformu. Bez výjimky, bez 'ještě jeden pokus'.",
      status: "active" as const,
      icon: "🛑",
    },
    {
      id: "breathwork",
      label: "Meditation / Breathwork before NY Session Open",
      description: "Minimálně 5 minut dechového cvičení nebo meditace před 15:30 CET každý den.",
      status: "active" as const,
      icon: "🧘",
    },
    {
      id: "routine-match",
      label: "100% Morning Routine Match",
      description: "Všechny checkboxy ranní rutiny musí být zelené než otevřeš první chart.",
      status: "active" as const,
      icon: "☀️",
    },
  ],
}

function shieldColor(pct: number) {
  if (pct > 75) return { stroke: "#10b981", text: "text-emerald-400", label: "Bezpečná zóna" }
  if (pct > 50) return { stroke: "#3b82f6", text: "text-blue-400",    label: "Pozor" }
  if (pct > 25) return { stroke: "#f59e0b", text: "text-amber-400",   label: "Varování!" }
  return           { stroke: "#f43f5e", text: "text-rose-400",         label: "KRITICKÉ" }
}

function habitStatusColor(used: number, limit: number): string {
  if (limit === 0) return used === 0 ? "text-emerald-400" : "text-rose-400"
  const ratio = used / limit
  if (ratio === 0) return "text-emerald-400"
  if (ratio < 0.5) return "text-emerald-400"
  if (ratio < 1) return "text-amber-400"
  return "text-rose-500"
}

function habitBarColor(used: number, limit: number): string {
  if (limit === 0) return used === 0 ? "bg-emerald-500" : "bg-rose-500"
  const ratio = used / limit
  if (ratio < 0.5) return "bg-emerald-500"
  if (ratio < 1) return "bg-amber-500"
  return "bg-rose-500"
}

interface GaugeProps {
  value: number       // 0–100 (percentage)
  size?: number
  strokeWidth?: number
  color: string
  children: React.ReactNode
}

function CircularGauge({ value, size = 140, strokeWidth = 10, color, children }: GaugeProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, Math.max(0, value)) / 100)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(30,41,59)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

export default function TradingGoalsPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("trading-goals-ai")
      if (stored) setGoals(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const generateGoalsWithAI = async () => {
    try {
      setGenerating(true)
      const response = await fetch("/api/goals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      if (data.success && data.goals) {
        setGoals(data.goals)
        localStorage.setItem("trading-goals-ai", JSON.stringify(data.goals))
        toast({ title: "Hotovo!", description: "Procesní cíle vygenerovány AI" })
      } else {
        throw new Error(data.error || "Unexpected response")
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: error instanceof Error ? error.message : "Nepodařilo se vygenerovat cíle.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const displayGoals = goals.length > 0 ? goals : !isLiveMode ? DEMO_GOALS : []
  const isShowingDemo = goals.length === 0 && !isLiveMode && displayGoals.length > 0
  const weeklyGoals = displayGoals.filter((g) => g.period === "weekly")
  const monthlyGoals = displayGoals.filter((g) => g.period === "monthly")

  const stats = DEMO_STATS
  const shield = shieldColor(stats.drawdownShield)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Zpět</span>
          </div>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Disciplined Goals</h1>
            <p className="text-slate-400 text-sm max-w-lg">
              Žádné finanční targety. Tvůj jediný cíl je dodržet proces — zisk je vedlejší produkt železné disciplíny.
            </p>
          </div>
          <Button
            onClick={generateGoalsWithAI}
            disabled={generating}
            className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          >
            {generating ? (
              <><Loader className="w-4 h-4 mr-2 animate-spin" />Generuji...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Vygenerovat s AI</>
            )}
          </Button>
        </div>

        {isShowingDemo && (
          <div className="inline-flex mb-8 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            Ukázková data — takhle to bude vypadat s tvými vlastními výsledky
          </div>
        )}
        {!isShowingDemo && <div className="mb-8" />}

        {/* ── 3 Circular Gauges ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {/* 1. Daily Process Score */}
          <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-900/60 border-emerald-500/20">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 self-start">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Daily Process Score</span>
              </div>
              <CircularGauge value={stats.dailyProcessScore} color="#10b981">
                <span className="text-3xl font-bold text-white">{stats.dailyProcessScore}%</span>
                <span className="text-[10px] text-emerald-400 font-semibold">DNES</span>
              </CircularGauge>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">
                  {stats.dailyProcessScore === 100 ? "Perfektní den! 🌟" : `${Math.round(stats.dailyProcessScore / 100 * 6)}/6 návyků`}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">I při ztrátě může svítit 100 %</p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Weekly Drawdown Shield */}
          <Card className={cn(
            "border transition-colors",
            stats.drawdownShield > 50
              ? "bg-gradient-to-br from-blue-900/30 to-slate-900/60 border-blue-500/20"
              : stats.drawdownShield > 20
              ? "bg-gradient-to-br from-amber-900/30 to-slate-900/60 border-amber-500/20"
              : "bg-gradient-to-br from-rose-900/30 to-slate-900/60 border-rose-500/40"
          )}>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 self-start">
                <Shield className={cn("w-4 h-4", stats.drawdownShield <= 20 && "animate-pulse")} style={{ color: shield.stroke }} />
                <span className={cn("text-xs font-semibold uppercase tracking-wide", stats.drawdownShield <= 20 && "animate-pulse")} style={{ color: shield.stroke }}>
                  Max Drawdown Shield
                </span>
              </div>
              {/* Pulsing danger ring when below 20% */}
              <div className={cn("relative", stats.drawdownShield <= 20 && "animate-pulse")}>
                <CircularGauge value={stats.drawdownShield} color={shield.stroke}>
                  <span className={cn("text-3xl font-bold", stats.drawdownShield <= 20 ? "text-rose-300" : "text-white")}>
                    {stats.drawdownShield}%
                  </span>
                  <span className={cn("text-[10px] font-semibold", shield.text)}>{shield.label}</span>
                </CircularGauge>
                {stats.drawdownShield <= 20 && (
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-30 pointer-events-none" />
                )}
              </div>
              <div className="text-center">
                <p className={cn("text-sm font-semibold", stats.drawdownShield <= 20 ? "text-rose-300" : "text-white")}>
                  ${(stats.drawdownMax - stats.drawdownUsed).toLocaleString()} zbývá
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  z ${stats.drawdownMax.toLocaleString()} týdenního limitu
                </p>
                {stats.drawdownShield <= 20 && (
                  <p className="text-[10px] text-rose-300 mt-1 font-bold animate-pulse">🚨 ZAVŘI PLATFORMU HNED!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Monthly Habit Score */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/60 border-purple-500/20">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 self-start">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Monthly Habit Score</span>
              </div>
              <CircularGauge value={stats.monthlyHabitScore} color="#a855f7">
                <span className="text-3xl font-bold text-white">{stats.monthlyHabitScore}%</span>
                <span className="text-[10px] text-purple-400 font-semibold">ČERVEN</span>
              </CircularGauge>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">
                  {stats.monthlyDaysClean}/{stats.monthlyDaysTotal} čistých dní
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Dny bez porušení plánu</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 7-Day Discipline Calendar ────────────────────────────── */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">7-Day Discipline Calendar</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Disciplína = zelená. Vidíš ten vzorec?</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Čistý den</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />Incident</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DISCIPLINE_CALENDAR.map((d, i) => {
                const scoreColor = d.score >= 90 ? "#10b981" : d.score >= 60 ? "#f59e0b" : "#f43f5e"
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <p className="text-[10px] text-slate-500 font-medium">{d.day}</p>
                    <motion.div
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                      className="w-full rounded-md flex flex-col items-center justify-center py-2.5 px-1"
                      style={{
                        backgroundColor: scoreColor + "22",
                        border: `1px solid ${scoreColor}44`,
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: scoreColor }}>{d.score}%</span>
                    </motion.div>
                    <p className={cn("text-[10px] font-semibold", d.pnl.startsWith("+") ? "text-emerald-400" : "text-rose-400")}>{d.pnl}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Discipline Impact on Win Rate ─────────────────────────── */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Disciplína → Win Rate korelace</p>
                <p className="text-[11px] text-slate-400">Posledních 29 obchodních dní tvých dat</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* With routine */}
              <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/20">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-3">Dny s čistou disciplínou</p>
                <p className="text-3xl font-bold text-emerald-300">{IMPACT_DATA.withRoutine.winRate}%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">win rate</p>
                <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-semibold">{IMPACT_DATA.withRoutine.avgPnl}</span>
                  <span className="text-[10px] text-slate-500">{IMPACT_DATA.withRoutine.days} dní</span>
                </div>
              </div>
              {/* Without routine */}
              <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-500/20">
                <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide mb-3">Dny s incidentem</p>
                <p className="text-3xl font-bold text-rose-300">{IMPACT_DATA.withoutRoutine.winRate}%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">win rate</p>
                <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between">
                  <span className="text-xs text-rose-300 font-semibold">{IMPACT_DATA.withoutRoutine.avgPnl}</span>
                  <span className="text-[10px] text-slate-500">{IMPACT_DATA.withoutRoutine.days} dní</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-emerald-400 font-bold">+47pp rozdíl ve win rate</span> mezi čistými a incidentovými dny.{" "}
                Disciplína není jen pocit — je to edge v číslech.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Bad Habits Quota ─────────────────────────────────────── */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/20 rounded-lg">
                <Lock className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Bad Habits Quota</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Limity na nešvary — překročit = ztráta disciplíny, ne jenom peněz</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.badHabits.map((h) => {
                const isHardStop = h.limit === 0
                const atLimit = h.used >= h.limit && !isHardStop
                const pct = isHardStop ? (h.used > 0 ? 100 : 0) : Math.min(100, (h.used / h.limit) * 100)
                const statusText = isHardStop
                  ? h.used === 0 ? "✅ Perfect" : `🚨 ${h.used}× PORUŠENO`
                  : h.used === h.limit ? `🔴 Limit vyčerpán` : `${h.limit - h.used} zbývá`

                return (
                  <div key={h.id} className={cn(
                    "rounded-xl p-4 border transition-colors",
                    h.used === 0 || (h.limit === 0 && h.used === 0)
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : atLimit || (isHardStop && h.used > 0)
                      ? "bg-rose-500/10 border-rose-500/30"
                      : "bg-slate-800/50 border-slate-700/50"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{h.label}</p>
                        <p className="text-[10px] text-slate-500">{h.sublabel}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-xs font-bold", habitStatusColor(h.used, h.limit))}>{statusText}</p>
                        {!isHardStop && (
                          <p className="text-[10px] text-slate-500">{h.used}/{h.limit}</p>
                        )}
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", habitBarColor(h.used, h.limit))}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-semibold">Proč tohle funguje: </span>
                Obyčejné aplikace ti říkají, abys vydělal $500 denně — a tím tě nutí hazardovat. Tady je tvůj jediný cíl udržet Bad Habits Quota na nule. Zisk je pak přirozeným výsledkem železné disciplíny.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Process Rules (Iron Discipline Laws) ─────────────────── */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Iron Discipline Laws</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Pevná pravidla, která nesmíš nikdy porušit — bez výjimky, bez diskuze</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {stats.processRules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                <span className="text-xl shrink-0 mt-0.5">{rule.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{rule.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{rule.description}</p>
                </div>
                <Badge className="shrink-0 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 border text-[10px]">
                  ACTIVE
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── AI-Generated Process Goals ───────────────────────────── */}
        {displayGoals.length > 0 && (
          <>
            {/* Weekly */}
            {weeklyGoals.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Týdenní procesní cíl</h2>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border text-xs">Tento týden</Badge>
                </div>
                <div className="grid gap-4">
                  {weeklyGoals.map((goal) => (
                    <Card key={goal.id} className="bg-slate-900 border-slate-700 hover:border-amber-500/40 transition-all">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-white leading-snug flex-1">{goal.goal}</h3>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {goal.focusArea && (
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border text-xs">
                                {goal.focusArea}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(goal.startDate).toLocaleDateString("cs-CZ")} –{" "}
                              {new Date(goal.endDate).toLocaleDateString("cs-CZ")}
                            </span>
                          </div>
                        </div>
                        {goal.why && (
                          <p className="text-sm text-slate-400 italic border-l-2 border-amber-500/40 pl-3">{goal.why}</p>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Jak to dosáhnout</p>
                          <ul className="space-y-2">
                            {goal.milestones.map((m, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly */}
            {monthlyGoals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">Měsíční procesní cíl</h2>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 border text-xs">Tento měsíc</Badge>
                </div>
                <div className="grid gap-4">
                  {monthlyGoals.map((goal) => (
                    <Card key={goal.id} className="bg-slate-900 border-slate-700 hover:border-purple-500/40 transition-all">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-white leading-snug flex-1">{goal.goal}</h3>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {goal.focusArea && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 border text-xs">
                                {goal.focusArea}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(goal.startDate).toLocaleDateString("cs-CZ")} –{" "}
                              {new Date(goal.endDate).toLocaleDateString("cs-CZ")}
                            </span>
                          </div>
                        </div>
                        {goal.why && (
                          <p className="text-sm text-slate-400 italic border-l-2 border-purple-500/40 pl-3">{goal.why}</p>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Jak to dosáhnout</p>
                          <ul className="space-y-2">
                            {goal.milestones.map((m, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {displayGoals.length === 0 && (
          <div className="p-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl text-center text-slate-400">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="font-medium text-slate-300 mb-1">Žádné cíle zatím</p>
            <p className="text-sm">Klikni na "Vygenerovat s AI" a AI analyzuje tvůj obchodní styl</p>
          </div>
        )}

      </div>
    </div>
  )
}
