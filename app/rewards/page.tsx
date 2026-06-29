"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Star, Trophy, Flame, Shield, Zap, Lock,
  CheckCircle2, Crown, Target, Brain, TrendingUp, ChevronDown
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Level system ──────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1,  name: "Raw Trader",         xpMin: 0,     xpMax: 500,   color: "#64748b" },
  { level: 2,  name: "Aware Trader",        xpMin: 500,   xpMax: 1200,  color: "#6366f1" },
  { level: 3,  name: "Mindful Trader",      xpMin: 1200,  xpMax: 2500,  color: "#3b82f6" },
  { level: 4,  name: "Process Trader",      xpMin: 2500,  xpMax: 4500,  color: "#06b6d4" },
  { level: 5,  name: "Consistent Trader",   xpMin: 4500,  xpMax: 7500,  color: "#10b981" },
  { level: 6,  name: "Disciplined Trader",  xpMin: 7500,  xpMax: 12000, color: "#f59e0b" },
  { level: 7,  name: "Iron Trader",         xpMin: 12000, xpMax: 18000, color: "#f97316" },
  { level: 8,  name: "Elite Trader",        xpMin: 18000, xpMax: 26000, color: "#ec4899" },
  { level: 9,  name: "Apex Trader",         xpMin: 26000, xpMax: 36000, color: "#a855f7" },
  { level: 10, name: "Mind Master",         xpMin: 36000, xpMax: 50000, color: "#fbbf24" },
]

const CURRENT_XP = 9_240
const CURRENT_LEVEL = LEVELS[5]   // level 6
const NEXT_LEVEL    = LEVELS[6]   // level 7
const XP_IN_LEVEL   = CURRENT_XP - CURRENT_LEVEL.xpMin
const XP_TO_NEXT    = NEXT_LEVEL.xpMin - CURRENT_LEVEL.xpMin
const PROGRESS_PCT  = (XP_IN_LEVEL / XP_TO_NEXT) * 100

// ── Achievements ──────────────────────────────────────────────────────────────

type AchievementStatus = "unlocked" | "progress" | "locked"

interface Achievement {
  id: string
  icon: string
  title: string
  description: string
  xp: number
  status: AchievementStatus
  progress?: number
  target?: number
  unlockedAt?: string
  category: "foundation" | "discipline" | "elite"
}

const ACHIEVEMENTS: Achievement[] = [
  // Foundation
  { id: "a1",  icon: "🔥", title: "First Flame",        description: "Dokonči svoji první ranní rutinu",                     xp: 75,   status: "unlocked",  category: "foundation", unlockedAt: "15.5.2025" },
  { id: "a2",  icon: "📋", title: "The Planner",         description: "Nastav si cíle 7 dní v řadě",                          xp: 150,  status: "unlocked",  category: "foundation", unlockedAt: "22.5.2025" },
  { id: "a3",  icon: "🧘", title: "Zen Entry",           description: "Dokonči pre-trade dechové cvičení 5× za sebou",        xp: 200,  status: "unlocked",  category: "foundation", unlockedAt: "29.5.2025" },
  { id: "a4",  icon: "🛡️", title: "Drawdown Guardian",  description: "Udržuj drawdown <2 % po 10 obchodech v řadě",          xp: 250,  status: "unlocked",  category: "foundation", unlockedAt: "3.6.2025"  },
  // Discipline
  { id: "a5",  icon: "⚡", title: "Iron 5",              description: "5 po sobě jdoucích čistých disciplinových dnů",       xp: 500,  status: "unlocked",  category: "discipline", unlockedAt: "8.6.2025"  },
  { id: "a6",  icon: "🎯", title: "Sniper Week",         description: "Win rate >60 % celý týden",                           xp: 400,  status: "unlocked",  category: "discipline", unlockedAt: "10.6.2025" },
  { id: "a7",  icon: "🚫", title: "No Revenge",          description: "14 dní bez jediného revenge tradu",                   xp: 600,  status: "unlocked",  category: "discipline", unlockedAt: "17.6.2025" },
  { id: "a8",  icon: "📉", title: "Loss Learner",        description: "Zapiš fail log do 1h po stopce — 5×",                 xp: 300,  status: "unlocked",  category: "discipline", unlockedAt: "20.6.2025" },
  { id: "a9",  icon: "🧠", title: "Process First",       description: "30 dní po sobě process score >80 %",                  xp: 1000, status: "progress", progress: 22, target: 30, category: "discipline" },
  // Elite
  { id: "a10", icon: "👑", title: "Iron Month",          description: "30 po sobě jdoucích čistých dnů",                     xp: 1500, status: "progress", progress: 22, target: 30, category: "elite" },
  { id: "a11", icon: "🏆", title: "Elite Streak",        description: "50denní obchodní streak",                             xp: 2000, status: "progress", progress: 31, target: 50, category: "elite" },
  { id: "a12", icon: "🔬", title: "Autopsy Master",      description: "Dokonči 20 AI Autopsies",                              xp: 800,  status: "progress", progress: 11, target: 20, category: "elite" },
  { id: "a13", icon: "💎", title: "Diamond Hands",       description: "Drž pozici až do TP bez panic exitu — 20×",           xp: 1200, status: "locked",   progress: 0,  target: 20, category: "elite" },
  { id: "a14", icon: "🌅", title: "Dawn Ritual",         description: "60 ranních rutin v řadě",                             xp: 1500, status: "locked",   progress: 0,  target: 60, category: "elite" },
  { id: "a15", icon: "⚔️", title: "Zero Incident Week", description: "Celý týden bez incidentu — 4×",                       xp: 1000, status: "locked",   progress: 2,  target: 4,  category: "elite" },
  { id: "a16", icon: "🎖️", title: "Mind Master",        description: "Dosáhni Level 10 — absolutní vrchol",                 xp: 5000, status: "locked",   progress: 0,  target: 1,  category: "elite" },
]

// ── Recent XP events ──────────────────────────────────────────────────────────

const XP_EVENTS = [
  { label: "Ranní rutina dokončena",    xp: 25,  time: "Dnes 07:12",      icon: "🌅" },
  { label: "Clean Discipline Day",      xp: 50,  time: "Dnes 00:00",      icon: "⚡" },
  { label: "Fail Log zápis",            xp: 50,  time: "Včera 16:23",     icon: "📉" },
  { label: "AI Autopsy spuštěna",       xp: 100, time: "Včera 16:25",     icon: "🔬" },
  { label: "Trading Streak — Day 31",   xp: 80,  time: "Včera 00:00",     icon: "🔥" },
  { label: "Process Score 91 %",        xp: 45,  time: "2 dny zpět",      icon: "🎯" },
  { label: "Mid-Day Reset dokončen",    xp: 20,  time: "2 dny zpět",      icon: "🧘" },
]

// ── Category meta ─────────────────────────────────────────────────────────────

const CAT_META = {
  foundation: { label: "Základy",   color: "#3b82f6", icon: Target  },
  discipline:  { label: "Disciplína", color: "#10b981", icon: Shield  },
  elite:       { label: "Elite",     color: "#a855f7", icon: Crown   },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "foundation" | "discipline" | "elite">("all")
  const [expandRoadmap, setExpandRoadmap] = useState(false)

  const unlocked = ACHIEVEMENTS.filter((a) => a.status === "unlocked").length
  const totalXpEarned = ACHIEVEMENTS.filter((a) => a.status === "unlocked").reduce((s, a) => s + a.xp, 0)

  const filtered = activeCategory === "all"
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter((a) => a.category === activeCategory)

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
            <h1 className="text-4xl font-bold text-white">Achievement Vault</h1>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border text-xs font-mono">XP SYSTEM</Badge>
          </div>
          <p className="text-slate-400 text-sm max-w-lg">
            Každé správné rozhodnutí se počítá. Disciplína se tady mění na čísla — a čísla nelžou.
          </p>
        </div>

        {/* ── Level card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-amber-950/20 border-amber-500/25">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-orange-600/5 pointer-events-none" />
            <CardContent className="p-7">
              <div className="flex items-start justify-between gap-6 mb-5">
                <div>
                  <p className="text-xs font-mono text-amber-400/70 tracking-[0.18em] uppercase mb-1">
                    Level {CURRENT_LEVEL.level}
                  </p>
                  <h2 className="text-3xl font-black text-white">{CURRENT_LEVEL.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Další úroveň: <span className="text-amber-300 font-semibold">{NEXT_LEVEL.name}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500 mb-0.5">Mind Points</p>
                  <p className="text-4xl font-black text-amber-300">{CURRENT_XP.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(NEXT_LEVEL.xpMin - CURRENT_XP).toLocaleString()} XP do levelu {NEXT_LEVEL.level}
                  </p>
                </div>
              </div>

              {/* XP progress bar */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{CURRENT_LEVEL.name} · {CURRENT_LEVEL.xpMin.toLocaleString()} XP</span>
                  <span>{NEXT_LEVEL.name} · {NEXT_LEVEL.xpMin.toLocaleString()} XP</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${CURRENT_LEVEL.color}, ${NEXT_LEVEL.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${PROGRESS_PCT}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
                <p className="text-right text-xs text-amber-400 font-semibold">{Math.round(PROGRESS_PCT)} % dokončeno</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Odemknuto", value: `${unlocked}/${ACHIEVEMENTS.length}`, icon: Trophy, color: "text-yellow-400" },
                  { label: "XP z odznaků", value: totalXpEarned.toLocaleString(), icon: Star,   color: "text-purple-400" },
                  { label: "Streak",       value: "31 dní",                          icon: Flame,  color: "text-orange-400" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-center">
                    <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Level roadmap ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <button
                onClick={() => setExpandRoadmap(!expandRoadmap)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Rank Progression Road</p>
                    <p className="text-[11px] text-slate-400">10 úrovní od Raw Tradera po Mind Mastera</p>
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", expandRoadmap && "rotate-180")} />
              </button>

              <AnimatePresence>
                {expandRoadmap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 flex items-center gap-0 overflow-x-auto pb-2">
                      {LEVELS.map((lv, i) => {
                        const isPast    = lv.level < CURRENT_LEVEL.level
                        const isCurrent = lv.level === CURRENT_LEVEL.level
                        const isFuture  = lv.level > CURRENT_LEVEL.level
                        return (
                          <div key={lv.level} className="flex items-center shrink-0">
                            <div className="flex flex-col items-center">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                                  isCurrent
                                    ? "border-amber-400 text-amber-300 scale-110"
                                    : isPast
                                    ? "border-emerald-500/60 text-emerald-400"
                                    : "border-slate-700 text-slate-600",
                                )}
                                style={isCurrent ? { boxShadow: `0 0 12px ${lv.color}55` } : {}}
                              >
                                {isPast ? "✓" : lv.level}
                              </div>
                              <p className={cn(
                                "text-[9px] mt-1 text-center max-w-[56px] leading-tight",
                                isCurrent ? "text-amber-300 font-semibold" : isPast ? "text-emerald-400/70" : "text-slate-600"
                              )}>
                                {lv.name.split(" ")[0]}
                              </p>
                            </div>
                            {i < LEVELS.length - 1 && (
                              <div className={cn("w-8 h-0.5 mx-0.5 shrink-0",
                                isPast ? "bg-emerald-500/50" : "bg-slate-700"
                              )} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Recent XP feed ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Recent XP Activity</p>
                  <p className="text-[11px] text-slate-400">Každé správné rozhodnutí se zaznamenává</p>
                </div>
              </div>
              <div className="space-y-2">
                {XP_EVENTS.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-6 text-center">{ev.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-slate-200">{ev.label}</p>
                        <p className="text-[10px] text-slate-500">{ev.time}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">+{ev.xp} XP</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Achievement Vault ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Category filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { key: "all",        label: "Vše",        count: ACHIEVEMENTS.length },
              { key: "foundation", label: "Základy",    count: ACHIEVEMENTS.filter(a => a.category === "foundation").length },
              { key: "discipline", label: "Disciplína", count: ACHIEVEMENTS.filter(a => a.category === "discipline").length },
              { key: "elite",      label: "Elite",      count: ACHIEVEMENTS.filter(a => a.category === "elite").length },
            ].map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key as typeof activeCategory)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  activeCategory === c.key
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500",
                )}
              >
                {c.label}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  activeCategory === c.key ? "bg-amber-500/30 text-amber-200" : "bg-slate-700 text-slate-500"
                )}>{c.count}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((badge, i) => {
              const pct = badge.target ? Math.round(((badge.progress ?? 0) / badge.target) * 100) : 0
              const catMeta = CAT_META[badge.category]
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Card className={cn(
                    "border transition-all duration-200 h-full",
                    badge.status === "unlocked"
                      ? "bg-gradient-to-br from-amber-950/20 to-slate-900/50 border-amber-500/25 hover:border-amber-500/50"
                      : badge.status === "progress"
                      ? "bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40"
                      : "bg-slate-900/30 border-slate-800 opacity-60"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0",
                          badge.status === "unlocked" ? "bg-amber-500/15" : "bg-slate-800/60",
                        )}>
                          {badge.status === "locked"
                            ? <Lock className="w-5 h-5 text-slate-600" />
                            : badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className={cn(
                              "text-sm font-bold leading-tight",
                              badge.status === "unlocked" ? "text-white" : badge.status === "progress" ? "text-slate-200" : "text-slate-500"
                            )}>{badge.title}</p>
                            {badge.status === "unlocked"
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              : badge.status === "progress"
                              ? <span className="text-[10px] font-mono text-indigo-400 shrink-0">{pct}%</span>
                              : <Lock className="w-3 h-3 text-slate-600 shrink-0" />}
                          </div>
                          <p className={cn("text-[11px] leading-relaxed", badge.status === "locked" ? "text-slate-600" : "text-slate-400")}>
                            {badge.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar for in-progress */}
                      {badge.status === "progress" && badge.target && (
                        <div className="mb-3">
                          <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-indigo-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + i * 0.03 }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{badge.progress}/{badge.target}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge
                          className="text-[10px] border"
                          style={{ backgroundColor: catMeta.color + "18", color: catMeta.color, borderColor: catMeta.color + "40" }}
                        >
                          {catMeta.label}
                        </Badge>
                        <span className={cn(
                          "text-xs font-bold",
                          badge.status === "unlocked" ? "text-amber-400" : "text-slate-500"
                        )}>
                          {badge.status === "unlocked" ? `+${badge.xp} XP` : `${badge.xp} XP`}
                        </span>
                      </div>

                      {badge.status === "unlocked" && badge.unlockedAt && (
                        <p className="text-[10px] text-slate-600 mt-2">Odemknuto {badge.unlockedAt}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
