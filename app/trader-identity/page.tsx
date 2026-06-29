"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Shield, Brain, Zap, Target, TrendingUp,
  AlertTriangle, Crown, ChevronDown, Flame
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Trader DNA dimensions ─────────────────────────────────────────────────────

const DNA_AXES = [
  { label: "Disciplína",        value: 85, color: "#10b981" },
  { label: "Trpělivost",        value: 72, color: "#6366f1" },
  { label: "Risk Control",      value: 91, color: "#3b82f6" },
  { label: "Emoční stabilita",  value: 58, color: "#f59e0b" },
  { label: "Proces",            value: 88, color: "#8b5cf6" },
  { label: "Adaptabilita",      value: 64, color: "#ec4899" },
]

// ── 6-week identity evolution ─────────────────────────────────────────────────

const EVOLUTION = [
  { week: "T-5", discipline: 54, emotion: 38, process: 61 },
  { week: "T-4", discipline: 62, emotion: 44, process: 67 },
  { week: "T-3", discipline: 71, emotion: 51, process: 74 },
  { week: "T-2", discipline: 78, emotion: 53, process: 82 },
  { week: "T-1", discipline: 82, emotion: 56, process: 87 },
  { week: "Nyní", discipline: 85, emotion: 58, process: 88 },
]

// ── Shadow patterns ───────────────────────────────────────────────────────────

const SHADOW_PATTERNS = [
  {
    name: "Post-Loss Escalation",
    trigger: "Po stopce v prvních 90 minutách seance",
    frequency: "3× za 30 dní",
    riskLevel: "Kritické",
    description: "Amygdala přebírá kontrolu. Revenge trade se zdá jako logický krok — není.",
    color: "#f43f5e",
  },
  {
    name: "Winning Streak Overconfidence",
    trigger: "Po 3+ vítězných obchodech v sérii",
    frequency: "2× za 30 dní",
    riskLevel: "Vysoké",
    description: "Pocit neporazitelnosti → sizing creep → ztráta přebije celý winning streak.",
    color: "#f59e0b",
  },
  {
    name: "Friday Fatigue Syndrome",
    trigger: "Páteční odpoledne, 15:00–17:00 CET",
    frequency: "Každý pátek",
    riskLevel: "Střední",
    description: "Kumulovaná únava týdne. Rozhodovací schopnost klesá o ~40 %.",
    color: "#6366f1",
  },
]

// ── Archetype ─────────────────────────────────────────────────────────────────

const ARCHETYPE = {
  code: "IS-91",
  name: "THE IRON SNIPER",
  tagline: "Čeká. Kalkuluje. Stiskne spoušť jednou — a trefí.",
  description:
    "Tvůj profil odpovídá nejméně 4 % traderů. Kombinuješ extrémní risk discipline (91/100) s procesní konzistencí (88/100), ale Achillova pata je emoční spirála po stopce. Tvůj edge není ve frekvenci obchodů — je v schopnosti čekat na perfektní setup a pak ho provést bez váhání.",
  stats: [
    { label: "Identity Strength", value: "79 / 100" },
    { label: "Archetype Rarity",  value: "Top 4 %" },
    { label: "Edge Type",         value: "Process-First" },
  ],
}

// ── Iron Manifesto ────────────────────────────────────────────────────────────

const MANIFESTO = `Já, Iron Sniper, přijímám tuto pravdu:

Nejsem zde, abych obchodoval každý den.
Jsem zde, abych obchodoval správně.

Moje čísla mluví jasně:
→ S čistou rutinou: 71 % win rate
→ Po stopce bez pauzy: 17 % win rate

Když trh nenabídne setup — neobchoduji.
Když cítím hněv — nezadávám příkaz.
Když mám winning streak — nezdviguji lot.

Trh ti nic nedluží.
Disciplína není omezení. Je to edge.

Tento závazek platí: vždy.`

// ── Radar chart (SVG hexagon) ─────────────────────────────────────────────────

function RadarChart({ axes }: { axes: typeof DNA_AXES }) {
  const cx = 150, cy = 150, r = 110
  const n = axes.length
  const levels = [20, 40, 60, 80, 100]

  function point(angle: number, val: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    const d = (val / 100) * r
    return { x: cx + d * Math.cos(rad), y: cy + d * Math.sin(rad) }
  }

  const gridPoints = (val: number) =>
    Array.from({ length: n }, (_, i) => point((360 / n) * i, val))
      .map((p) => `${p.x},${p.y}`)
      .join(" ")

  const dataPoints = axes.map((a, i) => point((360 / n) * i, a.value))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
      {/* Grid rings */}
      {levels.map((lv) => (
        <polygon
          key={lv}
          points={gridPoints(lv)}
          fill="none"
          stroke="rgb(51,65,85)"
          strokeWidth={lv === 100 ? 1.5 : 0.8}
        />
      ))}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const p = point((360 / n) * i, 100)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgb(51,65,85)" strokeWidth={0.8} />
      })}

      {/* Data polygon */}
      <motion.path
        d={dataPath}
        fill="rgba(99,102,241,0.15)"
        stroke="#6366f1"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={axes[i].color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
        />
      ))}

      {/* Labels */}
      {axes.map((a, i) => {
        const p = point((360 / n) * i, 118)
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle"
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} fill="#94a3b8" fontSize="10" fontWeight="600">
            {a.label}
          </text>
        )
      })}

      {/* Values on dots */}
      {dataPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y - 7} textAnchor="middle" fill={axes[i].color} fontSize="9" fontWeight="bold">
          {axes[i].value}
        </text>
      ))}
    </svg>
  )
}

// ── Evolution mini-chart ──────────────────────────────────────────────────────

function EvolutionChart() {
  const W = 480, H = 100, PAD = 24
  const chartW = W - PAD * 2
  const n = EVOLUTION.length

  function linePoints(key: "discipline" | "emotion" | "process") {
    return EVOLUTION.map((d, i) => {
      const x = PAD + (i / (n - 1)) * chartW
      const y = H - PAD - ((d[key] / 100) * (H - PAD * 2))
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
        {/* Grid */}
        {[25, 50, 75, 100].map((lv) => {
          const y = H - PAD - ((lv / 100) * (H - PAD * 2))
          return (
            <g key={lv}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgb(51,65,85)" strokeWidth={0.5} strokeDasharray="3,3" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fill="#475569" fontSize="8">{lv}</text>
            </g>
          )
        })}

        {/* Lines */}
        {lines.map(({ key, color }) => (
          <motion.polyline
            key={key}
            points={linePoints(key)}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}

        {/* Week labels */}
        {EVOLUTION.map((d, i) => {
          const x = PAD + (i / (n - 1)) * chartW
          return (
            <text key={i} x={x} y={H - 4} textAnchor="middle" fill="#475569" fontSize="9">
              {d.week}
            </text>
          )
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

export default function TraderIdentityPage() {
  const [manifestoOpen, setManifestoOpen] = useState(false)

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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-4xl font-bold text-white">Trader Identity</h1>
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 border text-xs font-mono">DNA SCAN</Badge>
          </div>
          <p className="text-slate-400 text-sm max-w-lg">
            Behaviorální profil vygenerovaný z tvých obchodních dat, fail logů a rutinní konzistence. Ne kdo chceš být — kdo skutečně jsi.
          </p>
        </div>

        {/* ── Archetype Card ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-indigo-950/40 border-violet-500/30">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 pointer-events-none" />
            <CardContent className="p-7">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-5 h-5 text-violet-400" />
                    <span className="text-xs font-mono text-violet-400 tracking-[0.2em] uppercase">Archetype {ARCHETYPE.code}</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-wide mb-1">{ARCHETYPE.name}</h2>
                  <p className="text-slate-400 text-sm italic mb-4">{ARCHETYPE.tagline}</p>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-xl">{ARCHETYPE.description}</p>
                </div>
                <div className="shrink-0 hidden md:flex flex-col gap-2">
                  {ARCHETYPE.stats.map((s) => (
                    <div key={s.label} className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-right">
                      <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                      <p className="text-sm font-bold text-violet-300">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mobile stats */}
              <div className="flex md:hidden gap-2 mt-4 flex-wrap">
                {ARCHETYPE.stats.map((s) => (
                  <div key={s.label} className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                    <p className="text-xs font-bold text-violet-300">{s.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── DNA Radar + Evolution ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
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
                  <RadarChart axes={DNA_AXES} />
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {DNA_AXES.map((a) => (
                    <div key={a.label} className="flex items-center justify-between px-2 py-1 rounded bg-slate-800/40">
                      <span className="text-[11px] text-slate-400">{a.label}</span>
                      <span className="text-[11px] font-bold" style={{ color: a.color }}>{a.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evolution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-800 h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Identity Evolution</p>
                    <p className="text-[11px] text-slate-400">Posledních 6 týdnů — trend je jasný</p>
                  </div>
                </div>
                <EvolutionChart />
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Disciplína", current: 85, prev: 54, color: "#10b981" },
                    { label: "Emoce",      current: 58, prev: 38, color: "#f59e0b" },
                    { label: "Proces",     current: 88, prev: 61, color: "#6366f1" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-center">
                      <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
                      <p className="text-xl font-bold" style={{ color: m.color }}>{m.current}</p>
                      <p className="text-[10px] text-emerald-400">+{m.current - m.prev} za 6T</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Shadow Patterns ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 bg-rose-500/20 rounded-lg">
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Shadow Patterns</p>
                  <p className="text-[11px] text-slate-400">Identifikované psychologické sabotéry — viditelné až ze šesti týdnů dat</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SHADOW_PATTERNS.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                    className="p-4 rounded-xl border"
                    style={{ backgroundColor: p.color + "0d", borderColor: p.color + "33" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-bold text-white leading-tight">{p.name}</p>
                      <Badge
                        className="text-[10px] border shrink-0 ml-2"
                        style={{ backgroundColor: p.color + "22", color: p.color, borderColor: p.color + "44" }}
                      >
                        {p.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{p.description}</p>
                    <div className="pt-2 border-t" style={{ borderColor: p.color + "22" }}>
                      <p className="text-[10px] text-slate-500">
                        <span className="font-semibold" style={{ color: p.color }}>Trigger: </span>
                        {p.trigger}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold" style={{ color: p.color }}>Frekvence: </span>
                        {p.frequency}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Iron Manifesto ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <button
                onClick={() => setManifestoOpen(!manifestoOpen)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">The Iron Manifesto</p>
                    <p className="text-[11px] text-slate-400">Tvůj osobní obchodní závazek — generovaný z DNA profilu</p>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", manifestoOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {manifestoOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className="ml-2 text-slate-500 text-[10px] tracking-widest uppercase font-mono">
                          Iron Manifesto · {ARCHETYPE.code} · {ARCHETYPE.name}
                        </span>
                      </div>
                      <pre className="font-mono text-[12px] leading-loose text-slate-200 whitespace-pre-wrap">
                        {MANIFESTO}
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
