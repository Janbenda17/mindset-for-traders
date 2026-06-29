"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Shield, Brain, Zap, Target, TrendingUp,
  Crown, ChevronDown, Flame, RefreshCw, AlertTriangle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── DNA axis colors (fixed, applied to AI output) ────────────────────────────

const DNA_COLORS = ["#10b981", "#6366f1", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"]

// ── Scanning steps shown during analysis ─────────────────────────────────────

const SCAN_STEPS = [
  { icon: "📉", label: "Načítám fail logy posledních 10 dní...",      key: "failLogs"  },
  { icon: "🌅", label: "Analyzuji záznamy ranních rutin...",           key: "routines"  },
  { icon: "📊", label: "Zpracovávám obchodní záznamy...",             key: "trades"    },
  { icon: "🧠", label: "Mapuji emoční vzorce a triggery...",          key: "emotion"   },
  { icon: "⚡", label: "Identifikuji behaviorální fingerprint...",     key: "behavior"  },
  { icon: "🤖", label: "AI syntetizuje identity profil...",            key: "ai"        },
]

// ── Radar chart ───────────────────────────────────────────────────────────────

type DnaAxis = { label: string; value: number; color: string }

function RadarChart({ axes }: { axes: DnaAxis[] }) {
  const cx = 150, cy = 150, r = 110
  const n = axes.length
  const levels = [20, 40, 60, 80, 100]

  function pt(angle: number, val: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    const d = (val / 100) * r
    return { x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) }
  }

  const gridPts = (val: number) =>
    Array.from({ length: n }, (_, i) => pt((360 / n) * i, val)).map((p) => `${p.x},${p.y}`).join(" ")

  const dataPts = axes.map((a, i) => pt((360 / n) * i, a.value))
  const dataPath = dataPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
      {levels.map((lv) => (
        <polygon key={lv} points={gridPts(lv)} fill="none" stroke="rgb(51,65,85)" strokeWidth={lv === 100 ? 1.5 : 0.8} />
      ))}
      {axes.map((_, i) => {
        const p = pt((360 / n) * i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgb(51,65,85)" strokeWidth={0.8} />
      })}
      <motion.path d={dataPath} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={2}
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }} style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {dataPts.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={4} fill={axes[i].color}
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
        />
      ))}
      {axes.map((a, i) => {
        const p = pt((360 / n) * i, 121)
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle"
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} fill="#94a3b8" fontSize="10" fontWeight="600">{a.label}</text>
        )
      })}
      {dataPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y - 7} textAnchor="middle" fill={axes[i].color} fontSize="9" fontWeight="bold">
          {axes[i].value}
        </text>
      ))}
    </svg>
  )
}

// ── Evolution chart ───────────────────────────────────────────────────────────

type EvolutionPoint = { week: string; discipline: number; emotion: number; process: number }

function EvolutionChart({ data }: { data: EvolutionPoint[] }) {
  const W = 480, H = 100, PAD = 24
  const chartW = W - PAD * 2
  const n = data.length

  function linePoints(key: keyof EvolutionPoint) {
    return data.map((d, i) => {
      const x = PAD + (i / (n - 1)) * chartW
      const y = H - PAD - ((Number(d[key]) / 100) * (H - PAD * 2))
      return `${x},${y}`
    }).join(" ")
  }

  const lines = [
    { key: "discipline" as const, color: "#10b981", label: "Disciplína" },
    { key: "emotion"    as const, color: "#f59e0b", label: "Emoce" },
    { key: "process"    as const, color: "#6366f1", label: "Proces" },
  ]

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[25, 50, 75, 100].map((lv) => {
          const y = H - PAD - ((lv / 100) * (H - PAD * 2))
          return (
            <g key={lv}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgb(51,65,85)" strokeWidth={0.5} strokeDasharray="3,3" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fill="#475569" fontSize="8">{lv}</text>
            </g>
          )
        })}
        {lines.map(({ key, color }) => (
          <motion.polyline key={key} points={linePoints(key)} fill="none" stroke={color} strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}
        {data.map((d, i) => {
          const x = PAD + (i / (n - 1)) * chartW
          return <text key={i} x={x} y={H - 4} textAnchor="middle" fill="#475569" fontSize="9">{d.week}</text>
        })}
      </svg>
      <div className="flex items-center gap-4 justify-center">
        {lines.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-5 h-0.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Phase = "idle" | "scanning" | "done" | "error"

interface ScanSummary {
  daysAnalyzed: number
  trades: number
  failLogs: number
  routines: number
  totalRoutines: number
  winRate: number
  topCategory: string
}

interface Profile {
  archetypeCode: string
  archetypeName: string
  archetypeTagline: string
  archetypeDescription: string
  archetypeStats: { label: string; value: string }[]
  dnaAxes: { label: string; value: number }[]
  shadowPatterns: {
    name: string; trigger: string; frequency: string
    riskLevel: string; description: string
  }[]
  behavioralFingerprint: {
    label: string; you: number; avg: number; unit: string; invert?: boolean
  }[]
  evolution: EvolutionPoint[]
  manifesto: string
}

const RISK_COLOR: Record<string, string> = {
  "Kritické": "#f43f5e",
  "Vysoké":   "#f59e0b",
  "Střední":  "#6366f1",
}

export default function TraderIdentityPage() {
  const [phase, setPhase]               = useState<Phase>("idle")
  const [scanStep, setScanStep]         = useState(-1)
  const [scanSummary, setScanSummary]   = useState<ScanSummary | null>(null)
  const [profile, setProfile]           = useState<Profile | null>(null)
  const [manifestoOpen, setManifestoOpen] = useState(false)
  const [expandRoadmap, setExpandRoadmap] = useState(false)
  const [errorMsg, setErrorMsg]         = useState("")
  const fetchStarted = useRef(false)

  // Start scanning animation, fire API call in parallel
  const startAnalysis = async () => {
    setPhase("scanning")
    setScanStep(0)
    fetchStarted.current = false

    // Advance scan steps visually (500ms each for first 5, then 1.5s for AI step)
    const delays = [500, 500, 500, 500, 500, 1500]
    let i = 0
    const advance = () => {
      i++
      if (i < SCAN_STEPS.length) {
        setScanStep(i)
        setTimeout(advance, delays[i])
      }
    }
    setTimeout(advance, delays[0])

    // Parallel: actually call the API
    try {
      const res  = await fetch("/api/trading-identity/analyze", { method: "POST" })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "API error")

      // Wait until scan animation finishes (total ~4s) before revealing
      const totalDelay = delays.reduce((s, d) => s + d, 0)
      const elapsed = Date.now()
      const remaining = Math.max(0, totalDelay - (Date.now() - elapsed) + 400)

      setTimeout(() => {
        setScanSummary(data.scanSummary)
        setProfile(data.profile)
        setPhase("done")
      }, remaining)
    } catch (err) {
      setTimeout(() => {
        setErrorMsg(err instanceof Error ? err.message : "Analýza selhala")
        setPhase("error")
      }, 3500)
    }
  }

  // ── IDLE state ───────────────────────────────────────────────────────────

  if (phase === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/bonus" className="inline-flex mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Zpět</span>
            </div>
          </Link>

          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <div className="w-20 h-20 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-violet-400" />
              </div>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 border text-xs font-mono mb-4">
                DNA SCAN
              </Badge>
              <h1 className="text-4xl font-black text-white mb-3">Trader Identity</h1>
              <p className="text-slate-400 leading-relaxed mb-3">
                AI analyzuje tvých <span className="text-violet-300 font-semibold">posledních 10 dní</span> obchodních dat —
                fail logy, rutiny, trade záznamy — a vytvoří přesný psychologický profil.
              </p>
              <p className="text-slate-500 text-sm mb-8">
                Ne kdo chceš být. Kdo skutečně jsi.
              </p>

              {/* What gets scanned */}
              <div className="grid grid-cols-3 gap-3 mb-8 text-left">
                {[
                  { icon: "📉", label: "Fail logy",    desc: "Incidenty a vzorce" },
                  { icon: "🌅", label: "Rutiny",        desc: "10denní konzistence" },
                  { icon: "📊", label: "Obchody",       desc: "Win rate a chování" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <p className="text-xl mb-1">{item.icon}</p>
                    <p className="text-xs font-semibold text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={startAnalysis}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                Spustit AI analýzu
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // ── SCANNING state ────────────────────────────────────────────────────────

  if (phase === "scanning") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-8">
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 border text-xs font-mono mb-3">
                ANALÝZA PROBÍHÁ
              </Badge>
              <h2 className="text-2xl font-black text-white">Skenuji 10 dní dat...</h2>
              <p className="text-slate-400 text-sm mt-1">Identifikuji tvůj trading fingerprint</p>
            </div>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-6 space-y-3">
                {SCAN_STEPS.map((step, i) => {
                  const state = i < scanStep ? "done" : i === scanStep ? "active" : "pending"
                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: state === "pending" ? 0.3 : 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-base w-5 shrink-0">{step.icon}</span>
                      <span className={cn(
                        "text-sm flex-1",
                        state === "done"    ? "text-emerald-400"
                        : state === "active" ? "text-white"
                        : "text-slate-600"
                      )}>
                        {step.label}
                      </span>
                      <span className="w-5 text-right shrink-0">
                        {state === "done"
                          ? <span className="text-emerald-400 text-sm">✓</span>
                          : state === "active"
                          ? <span className="inline-block w-2 h-2 bg-violet-400 rounded-full animate-ping" />
                          : null}
                      </span>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                animate={{ width: `${((scanStep + 1) / SCAN_STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── ERROR state ───────────────────────────────────────────────────────────

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Analýza selhala</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => { setPhase("idle"); setScanStep(-1) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  // ── DONE state — full profile ──────────────────────────────────────────────

  if (!profile) return null

  const dnaAxes: DnaAxis[] = (profile.dnaAxes ?? []).map((a, i) => ({
    ...a,
    color: DNA_COLORS[i] ?? "#6366f1",
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back + re-analyze */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/bonus" className="inline-flex">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Zpět</span>
            </div>
          </Link>
          <button
            onClick={() => { setPhase("idle"); setProfile(null); setScanSummary(null); setScanStep(-1) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-xs text-slate-400"
          >
            <RefreshCw className="w-3 h-3" />
            Nová analýza
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-4xl font-bold text-white">Trader Identity</h1>
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 border text-xs font-mono">DNA SCAN</Badge>
          </div>
          {scanSummary && (
            <p className="text-slate-400 text-sm">
              Analyzováno <span className="text-violet-300 font-semibold">{scanSummary.daysAnalyzed} dní</span> ·{" "}
              {scanSummary.trades} obchodů · {scanSummary.failLogs} incidentů · rutina {scanSummary.routines}/{scanSummary.totalRoutines} dní
            </p>
          )}
        </div>

        {/* ── Archetype ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-indigo-950/40 border-violet-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 pointer-events-none" />
            <CardContent className="p-7">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-5 h-5 text-violet-400" />
                    <span className="text-xs font-mono text-violet-400 tracking-[0.2em] uppercase">
                      Archetype {profile.archetypeCode}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-wide mb-1">{profile.archetypeName}</h2>
                  <p className="text-slate-400 text-sm italic mb-4">{profile.archetypeTagline}</p>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-xl">{profile.archetypeDescription}</p>
                </div>
                <div className="shrink-0 hidden md:flex flex-col gap-2">
                  {(profile.archetypeStats ?? []).map((s) => (
                    <div key={s.label} className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-right">
                      <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                      <p className="text-sm font-bold text-violet-300">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Behavioral Fingerprint ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-amber-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Behavioral Fingerprint</p>
                  <p className="text-[11px] text-slate-400">Tvůj profil vs. průměrný retail trader</p>
                </div>
              </div>
              <div className="space-y-4">
                {(profile.behavioralFingerprint ?? []).map((row, i) => {
                  const youBetter = row.invert ? row.you < row.avg : row.you > row.avg
                  const youColor  = youBetter ? "#10b981" : "#f43f5e"
                  const maxVal    = Math.max(row.you, row.avg, 1)
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-slate-300 font-medium">{row.label}</p>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span style={{ color: youColor }} className="font-bold">{row.you} {row.unit}</span>
                          <span className="text-slate-600">vs.</span>
                          <span className="text-slate-500">{row.avg} {row.unit} průměr</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { label: "Ty", val: row.you, color: youColor },
                          { label: "Průměr", val: row.avg, color: "#475569" },
                        ].map((bar) => (
                          <div key={bar.label}>
                            <p className="text-[9px] text-slate-600 mb-0.5">{bar.label}</p>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: bar.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(bar.val / maxVal) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + i * 0.08 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── DNA Radar + Evolution ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Neural Trading DNA</p>
                    <p className="text-[11px] text-slate-400">6 psychologických dimenzí</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  {dnaAxes.length > 0 && <RadarChart axes={dnaAxes} />}
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {dnaAxes.map((a) => (
                    <div key={a.label} className="flex items-center justify-between px-2 py-1 rounded bg-slate-800/40">
                      <span className="text-[11px] text-slate-400">{a.label}</span>
                      <span className="text-[11px] font-bold" style={{ color: a.color }}>{a.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Identity Evolution</p>
                    <p className="text-[11px] text-slate-400">6týdenní trajektorie — trend je jasný</p>
                  </div>
                </div>
                {profile.evolution?.length > 0 && <EvolutionChart data={profile.evolution} />}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {profile.evolution?.length > 1 && [
                    { label: "Disciplína", key: "discipline" as const, color: "#10b981" },
                    { label: "Emoce",      key: "emotion"    as const, color: "#f59e0b" },
                    { label: "Proces",     key: "process"    as const, color: "#6366f1" },
                  ].map((m) => {
                    const first = profile.evolution[0][m.key]
                    const last  = profile.evolution[profile.evolution.length - 1][m.key]
                    return (
                      <div key={m.label} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
                        <p className="text-xl font-bold" style={{ color: m.color }}>{last}</p>
                        <p className="text-[10px] text-emerald-400">+{Number(last) - Number(first)} za 6T</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Shadow Patterns ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-rose-500/20 rounded-lg">
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Shadow Patterns</p>
                  <p className="text-[11px] text-slate-400">Identifikované psychologické sabotéry z tvých dat</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(profile.shadowPatterns ?? []).map((p, i) => {
                  const col = RISK_COLOR[p.riskLevel] ?? "#6366f1"
                  return (
                    <motion.div key={p.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                      className="p-4 rounded-xl border"
                      style={{ backgroundColor: col + "0d", borderColor: col + "33" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                        <Badge className="text-[10px] border shrink-0 ml-2" style={{ backgroundColor: col + "22", color: col, borderColor: col + "44" }}>
                          {p.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{p.description}</p>
                      <div className="pt-2 border-t" style={{ borderColor: col + "22" }}>
                        <p className="text-[10px] text-slate-500">
                          <span className="font-semibold" style={{ color: col }}>Trigger: </span>{p.trigger}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          <span className="font-semibold" style={{ color: col }}>Frekvence: </span>{p.frequency}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Iron Manifesto ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <button onClick={() => setManifestoOpen(!manifestoOpen)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">The Iron Manifesto</p>
                    <p className="text-[11px] text-slate-400">Tvůj osobní závazek — generovaný AI z tvých dat</p>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", manifestoOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {manifestoOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden"
                  >
                    <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className="ml-2 text-slate-500 text-[10px] tracking-widest uppercase font-mono">
                          Iron Manifesto · {profile.archetypeCode} · {profile.archetypeName}
                        </span>
                      </div>
                      <pre className="font-mono text-[12px] leading-loose text-slate-200 whitespace-pre-wrap">
                        {profile.manifesto}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
