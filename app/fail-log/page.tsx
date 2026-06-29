"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Sparkles, Loader, TrendingDown, X,
  FlaskConical, AlertTriangle, Flame, Zap, Target, ChevronDown
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type EgoLevel = "full-amok" | "severe" | "mild"

interface SessionContext {
  confidence: number   // 1-10 morning confidence
  routineComplete: boolean
  session: "London" | "NY" | "Pre-Market" | "After-Hours"
}

interface FailLog {
  id: string
  date: string
  time?: string
  title: string
  rootCause: string
  category: string
  actionPlan: string
  lessonLearned: string
  severity: "high" | "medium" | "low"
  egoLevel?: EgoLevel
  sessionContext?: SessionContext
  trade?: { symbol: string; entry: number; exit: number; loss: number; timeInTrade?: string }
  aiGenerated: boolean
  autopsy?: string
}

// ── Category palette ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { color: string; hex: string; icon: string }> = {
  "Revenge Trading":    { color: "text-rose-400",   hex: "#f43f5e", icon: "💢" },
  "FOMO Entry":         { color: "text-amber-400",  hex: "#f59e0b", icon: "🎯" },
  "Overtrading":        { color: "text-orange-400", hex: "#f97316", icon: "📈" },
  "Position Sizing":    { color: "text-purple-400", hex: "#a855f7", icon: "⚖️" },
  "Panic Exit":         { color: "text-blue-400",   hex: "#3b82f6", icon: "🏃" },
  "Vstup bez plánu":    { color: "text-amber-400",  hex: "#f59e0b", icon: "🎯" },
}

function categoryMeta(cat: string) {
  return CATEGORY_META[cat] ?? { color: "text-slate-400", hex: "#64748b", icon: "⚠️" }
}

// ── Ego Level ────────────────────────────────────────────────────────────────

function deriveEgoLevel(severity: string): EgoLevel {
  if (severity === "high")   return "full-amok"
  if (severity === "medium") return "severe"
  return "mild"
}

const EGO_META: Record<EgoLevel, { label: string; className: string }> = {
  "full-amok": { label: "Full Amok 🔥",   className: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  "severe":    { label: "Severe Tilt",    className: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  "mild":      { label: "Mild Slip",      className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
}

// ── Demo data ────────────────────────────────────────────────────────────────

const today = new Date()
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10)

const DEMO_FAIL_LOGS: FailLog[] = [
  {
    id: "demo-1",
    date: daysAgo(1),
    time: "15:47",
    title: "Revenge trade — zdvojnásobení lotu po stopce na zlatě",
    rootCause: "Hned po stopce na zlatě jsem otočil pozici do protisměru s dvojnásobnou velikostí lotu. Žádný setup, žádná analýza — čistá emoce.",
    category: "Revenge Trading",
    actionPlan: "Po jakékoliv stopce: 30 minut pryč od platformy. Bez výjimky. Nastavit timer.",
    lessonLearned: "Trh není tvůj nepřítel. Po stopce jsem nebojoval s trhem — bojoval jsem sám se sebou a prohrál.",
    severity: "high",
    sessionContext: { confidence: 3, routineComplete: false, session: "London" },
    trade: { symbol: "XAU/USD", entry: 2015.4, exit: 2008.2, loss: 610, timeInTrade: "22 min" },
    aiGenerated: false,
    autopsy: `🔬 AI AUTOPSY — Identifikovaný vzorec: Emoční eskalaace po stopce

⏱ Incident window: Pátek 15:47 CET — 41 minut před uzavřením evropské seance
📋 Kontext ranní rutiny: Confidence Level nahlášen 3/10 při otevření platformy. Červený příznak ignorován.
🧠 Psychologický trigger: Typická "loss aversion spiral" — ztráta $420 aktivovala amygdalu, racionální kůra přešla do offline režimu.
🔗 Vzorec: 3 identické incidenty za posledních 30 dní — vždy pátek odpoledne, vždy po první stopce.
⚡ Brutální pravda: Dvojnásobný lot ve 15:47 nebyla obchodní rozhodnutí. Bylo to hazardování z únavy. Trh ti nedlužil nic. Ty sis dlužil pauzu.
🛡️ Protokol prevence: Mid-Day Reset v 13:00 → snížená únava → 73 % nižší pravděpodobnost Revenge tradu odpoledne.`,
  },
  {
    id: "demo-2",
    date: daysAgo(1),
    time: "10:23",
    title: "Vstup proti silnému trendu na EUR/USD bez potvrzení",
    rootCause: "Vstup do shortu proti silnému bullish trendu jen na pocit, že cena je 'už moc vysoko'. Bez žádného reversal setupu ani potvrzení na vyšším TF.",
    category: "FOMO Entry",
    actionPlan: "Před každým vstupem povinná kontrola trendu na denním a 4H grafu. Obchodovat pouze ve směru trendu.",
    lessonLearned: "Trh může zůstat 'moc vysoko' mnohem déle, než vydrží účet. Pocit není setup.",
    severity: "medium",
    sessionContext: { confidence: 6, routineComplete: true, session: "London" },
    trade: { symbol: "EUR/USD", entry: 1.0850, exit: 1.0910, loss: 420, timeInTrade: "45 min" },
    aiGenerated: false,
    autopsy: `🔬 AI AUTOPSY — Identifikovaný vzorec: Opinion trading bez setupu

⏱ Incident window: Pátek 10:23 CET — 8 minut po otevření londýnské seance
📋 Kontext: Denní svíčka EUR/USD: +85 pips. Týdenní trend: silně bullish. Ignorováno.
🧠 Psychologický trigger: "Contrarian bias" — přirozená touha být "chytřejší než dav" vedla ke vstupu bez důkazu.
🔗 Vzorec: 2 podobné vstupy "proti trendu" za 14 dní. Oba ztrátové. Win rate těchto vstupů: 0 %.
⚡ Brutální pravda: Nebyl to obchod. Bylo to sázení na vlastní ego. EUR/USD ti nedal žádný signal k shortu — ty sis ho vymyslel.
🛡️ Protokol prevence: Checklist před vstupem: "Souhlasí tento vstup s trendem na denním TF?" → ANO nebo NEHRAJ.`,
  },
  {
    id: "demo-3",
    date: daysAgo(3),
    time: "14:12",
    title: "Overtrading — 7 obchodů v jeden den, 5 ztrátových",
    rootCause: "Po dvou úspěšných obchodech ráno jsem pokračoval v hledání dalších setupů celé odpoledne, i když trh byl bez jasných signálů.",
    category: "Overtrading",
    actionPlan: "Denní limit max. 3 obchody. Po dosažení limitu okamžitě zavřít platformu — i když 'vypadá' další setup.",
    lessonLearned: "Kvalita setupů exponenciálně klesá s každým dalším obchodem. Nejlepší obchody jsou první 1–2 v session.",
    severity: "medium",
    sessionContext: { confidence: 8, routineComplete: true, session: "NY" },
    trade: { symbol: "GBP/USD", entry: 1.2650, exit: 1.2618, loss: 180, timeInTrade: "15 min" },
    aiGenerated: false,
    autopsy: `🔬 AI AUTOPSY — Identifikovaný vzorec: Gambler's fallacy po winning streak

⏱ Incident window: Středa 14:12 CET — 5. obchod dne, 3. za odpoledne
📋 Kontext: Ranní rutina splněna na 100 %. Ráno 2/2 winning trades. Pak: chyba přebytečné sebedůvěry.
🧠 Psychologický trigger: "Hot hand fallacy" — po dvou výhrách mozek věří, že je ve stavu flow a každý obchod bude úspěšný.
🔗 Vzorec: V dnech s >3 obchody: win rate 28 %. V dnech s ≤3 obchody: win rate 67 %.
⚡ Brutální pravda: Ty jsi nevydělal víc protože jsi obchodoval víc. Ty jsi prohrál protože jsi neodešel když byl čas. Disciplína = vědět kdy přestat.
🛡️ Protokol prevence: Trading Goals → Daily Process Score počítá "překročení daily trade limitu" jako incident. Viditelný červený štítek zastaví příště.`,
  },
  {
    id: "demo-4",
    date: daysAgo(3),
    time: "09:05",
    title: "Pozice 5× větší než risk management plán",
    rootCause: "Vzal jsem 5% riziko místo 1% protože setup 'vypadal perfektně'. Ztráta pětkrát větší než plán.",
    category: "Position Sizing",
    actionPlan: "Fixní risk calculator před každým obchodem. Bez výjimky. Feeling o setupu neznamená 5× lot.",
    lessonLearned: "Nejlepší setup světa nezasluhuje porušení risk managementu. Právě proto, že vypadá perfektně, je nebezpečný.",
    severity: "medium",
    sessionContext: { confidence: 9, routineComplete: true, session: "Pre-Market" },
    trade: { symbol: "BTC/USD", entry: 43200, exit: 42650, loss: 340, timeInTrade: "1h 20min" },
    aiGenerated: false,
    autopsy: `🔬 AI AUTOPSY — Identifikovaný vzorec: Overconfidence sizing

⏱ Incident window: Středa 09:05 CET — 5 minut po otevření platformy
📋 Kontext: BTC setup byl technicky validní. Problém nebyl ve vstupu — byl ve velikosti.
🧠 Psychologický trigger: "Conviction bias" — čím více věříš v setup, tím více chceš vsadit. Přesně to je trap.
🔗 Vzorec: 4× za tento měsíc position sizing překročen. Průměrná ztráta na těchto obchodech: 2.8× větší než standard.
⚡ Brutální pravda: Pětkrát větší lot ti nedal 5× větší pravděpodobnost výhry. Dal ti 5× větší ztrátu.
🛡️ Protokol prevence: Risk calculator jako mandatory checklist item v ranní rutině. Max 1 click — systém ti nedovolí zadat >2% bez potvrzení.`,
  },
  {
    id: "demo-5",
    date: daysAgo(7),
    time: "16:55",
    title: "Panic exit 2 minuty před TP — ztráta potenciálního zisku $800",
    rootCause: "Pozice šla správným směrem, TP zbývalo 12 pips. Panika z protichodného pohybu 3 pips mě přiměla zavřít ručně.",
    category: "Panic Exit",
    actionPlan: "Nastavit TP a SL a pak ZAVŘÍT obrazovku. Pokud sleduješ každou svíčku, budeš manuálně zasahovat.",
    lessonLearned: "Největší ztráty nejsou vždy záporné číslo. Ztráta zisku z paniky je ztráta stejně reálná jako stopka.",
    severity: "low",
    sessionContext: { confidence: 7, routineComplete: true, session: "NY" },
    trade: { symbol: "EUR/USD", entry: 1.0820, exit: 1.0847, loss: 0, timeInTrade: "2h 10min" },
    aiGenerated: false,
    autopsy: `🔬 AI AUTOPSY — Identifikovaný vzorec: Screen addiction → Panic exit

⏱ Incident window: Čtvrtek 16:55 CET — 5 minut před uzavřením US seance
📋 Kontext: Pozice 98 % cesty k TP. Tři-pipový pullback → ruční uzavření → TP bylo hit za 4 minuty.
🧠 Psychologický trigger: "Loss aversion" v kombinaci se "screen time addiction" — nemohl jsi přestat sledovat svíčky.
🔗 Vzorec: Za tento měsíc 3 předčasné výstupy před TP. Ušlý zisk celkem: $1,840.
⚡ Brutální pravda: Zaplatil jsi $800 za privilegium sledovat graf v reálném čase. Set and forget je strategie, ne lenost.
🛡️ Protokol prevence: Po zadání TP/SL → minimalizuj platformu. Bad Habits Quota: "FOMO Exit" počítá každý ruční exit před TP.`,
  },
]

// ── Donut chart ───────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutSlicePath(cx: number, cy: number, outerR: number, innerR: number, start: number, end: number) {
  const oStart = polarToCartesian(cx, cy, outerR, start)
  const oEnd   = polarToCartesian(cx, cy, outerR, end)
  const iStart = polarToCartesian(cx, cy, innerR, end)
  const iEnd   = polarToCartesian(cx, cy, innerR, start)
  const large  = end - start > 180 ? 1 : 0
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${iEnd.x} ${iEnd.y}`,
    "Z",
  ].join(" ")
}

interface SliceData { category: string; count: number; hex: string }

function DonutChart({ data, active, onSelect }: {
  data: SliceData[]
  active: string | null
  onSelect: (cat: string | null) => void
}) {
  const total = data.reduce((s, d) => s + d.count, 0)
  let angle = 0

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[180px]">
      {data.map((seg) => {
        const sweep = (seg.count / total) * 360
        const start = angle
        angle += sweep
        const isActive = active === seg.category
        const isInactive = active !== null && !isActive
        const d = donutSlicePath(100, 100, 85, 55, start, angle - 0.5)
        return (
          <path
            key={seg.category}
            d={d}
            fill={seg.hex}
            opacity={isInactive ? 0.25 : isActive ? 1 : 0.85}
            className="cursor-pointer transition-all duration-200"
            style={{ transform: isActive ? `scale(1.04)` : "scale(1)", transformOrigin: "100px 100px" }}
            onClick={() => onSelect(isActive ? null : seg.category)}
          />
        )
      })}
      <text x="100" y="95"  textAnchor="middle" fill="white"   fontSize="26" fontWeight="bold">{total}</text>
      <text x="100" y="115" textAnchor="middle" fill="#94a3b8" fontSize="11">incidents</text>
    </svg>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FailLogPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
  const { isEn } = useLanguage()
  const [failLogs, setFailLogs] = useState<FailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openAutopsy, setOpenAutopsy] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fail-logs-ai")
      if (stored) setFailLogs(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const generateFailLogsWithAI = async () => {
    try {
      setGenerating(true)
      const response = await fetch("/api/fail-log/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      if (data.success && data.logs) {
        setFailLogs(data.logs)
        localStorage.setItem("fail-logs-ai", JSON.stringify(data.logs))
        toast({ title: isEn ? "Done!" : "Hotovo!", description: isEn ? "Fail logs analyzed by AI" : "Fail logy analyzovány AI" })
      } else {
        throw new Error(data.error || "Unexpected response")
      }
    } catch (error) {
      toast({
        title: isEn ? "Error" : "Chyba",
        description: error instanceof Error ? error.message : isEn ? "Failed to analyze fail logs." : "Nepodařilo se analyzovat fail logy.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const displayLogs = failLogs.length > 0 ? failLogs : !isLiveMode ? DEMO_FAIL_LOGS : []
  const isShowingDemo = failLogs.length === 0 && !isLiveMode && displayLogs.length > 0

  // Chart data: aggregate by category
  const categoryMap: Record<string, number> = {}
  for (const log of displayLogs) {
    categoryMap[log.category] = (categoryMap[log.category] ?? 0) + 1
  }
  const chartData: SliceData[] = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count, hex: categoryMeta(category).hex }))

  // Filtered logs
  const filteredLogs = activeCategory
    ? displayLogs.filter((l) => l.category === activeCategory)
    : displayLogs

  const totalLoss = displayLogs.reduce((s, l) => s + (l.trade?.loss ?? 0), 0)
  const worstCategory = chartData[0]?.category ?? "—"

  // Pattern Intelligence: $ loss per category
  const lossPerCategory: Record<string, number> = {}
  for (const log of displayLogs) {
    if (log.trade?.loss) {
      lossPerCategory[log.category] = (lossPerCategory[log.category] ?? 0) + log.trade.loss
    }
  }
  const patternIntelligence = Object.entries(lossPerCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, loss]) => ({ category, loss, hex: categoryMeta(category).hex }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{isEn ? "Back" : "Zpět"}</span>
          </div>
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-4xl font-bold text-white">The Anomaly Ledger</h1>
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 border text-xs font-mono">BLACK BOX</Badge>
            </div>
            <p className="text-slate-400 text-sm max-w-lg">
              {isEn
                ? "Every other platform hides your mistakes. Here we expose them, dissect them and quantify them — because that's the only path to improvement."
                : "Všechny ostatní platformy schovávají tvoje chyby. Tady je vytahujeme na světlo, pitvujeme a kvantifikujeme — protože to je jediná cesta ke zlepšení."}
            </p>
          </div>
          <Button
            onClick={generateFailLogsWithAI}
            disabled={generating}
            className="shrink-0 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold"
          >
            {generating ? (
              <><Loader className="w-4 h-4 mr-2 animate-spin" />{isEn ? "Analyzing..." : "Generuji..."}</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />{isEn ? "Analyze with AI" : "Analyzovat s AI"}</>
            )}
          </Button>
        </div>

        {isShowingDemo && (
          <div className="inline-flex mb-6 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            {isEn ? "Demo data — this is what it looks like with your real MT5 trades" : "Ukázková data — takhle to bude vypadat s tvými reálnými obchody z MT5"}
          </div>
        )}
        {!isShowingDemo && <div className="mb-6" />}

        {/* ── Top section: Donut + Stats ── */}
        {displayLogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Donut chart card */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                  Top Failure Triggers
                  <span className="ml-2 text-slate-600 normal-case font-normal">({isEn ? "click to filter" : "klikni pro filtrování"})</span>
                </p>
                <div className="flex items-center gap-6">
                  <DonutChart data={chartData} active={activeCategory} onSelect={setActiveCategory} />
                  <div className="flex-1 space-y-2.5">
                    {chartData.map((seg) => {
                      const pct = Math.round((seg.count / displayLogs.length) * 100)
                      const isActive = activeCategory === seg.category
                      return (
                        <button
                          key={seg.category}
                          onClick={() => setActiveCategory(isActive ? null : seg.category)}
                          className={cn(
                            "w-full text-left group",
                            "rounded-lg p-2 transition-colors",
                            isActive ? "bg-slate-700/60" : "hover:bg-slate-800/50",
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                              <span>{categoryMeta(seg.category).icon}</span>
                              {seg.category}
                            </span>
                            <span className="text-xs font-bold" style={{ color: seg.hex }}>{pct}%</span>
                          </div>
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: seg.hex }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-rose-900/20 border-rose-500/20">
                <CardContent className="p-4">
                  <TrendingDown className="w-4 h-4 text-rose-400 mb-2" />
                  <p className="text-2xl font-bold text-white">${totalLoss.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{isEn ? "Total loss from incidents" : "Celková ztráta z incidentů"}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{displayLogs.length}</p>
                  <p className="text-xs text-slate-400">{isEn ? "Total incidents" : "Celkem incidentů"}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-4">
                  <Flame className="w-4 h-4 text-orange-400 mb-2" />
                  <p className="text-lg font-bold text-white leading-tight">{worstCategory}</p>
                  <p className="text-xs text-slate-400">{isEn ? "Most frequent pattern" : "Nejčastější vzorec"}</p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-900/20 border-emerald-500/20">
                <CardContent className="p-4">
                  <Target className="w-4 h-4 text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {displayLogs.filter((l) => (l.egoLevel ?? deriveEgoLevel(l.severity)) === "mild").length}
                  </p>
                  <p className="text-xs text-slate-400">{isEn ? "Mild incidents (controlled)" : "Mild incidentů (pod kontrolou)"}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ── Pattern Intelligence ── */}
        {patternIntelligence.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800 mb-6">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-violet-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Pattern Intelligence</p>
                  <p className="text-[11px] text-slate-400">{isEn ? "Where are you losing the most? Category ranking by loss" : "Kde tě to stojí nejvíc peněz? Žebříček kategorií podle ztráty"}</p>
                </div>
              </div>
              <div className="space-y-3">
                {patternIntelligence.map((item, i) => {
                  const maxLoss = patternIntelligence[0].loss
                  const pct = Math.round((item.loss / maxLoss) * 100)
                  const meta = categoryMeta(item.category)
                  return (
                    <div key={item.category} className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500 w-3 font-mono">{i + 1}</span>
                      <span className="text-sm w-4">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-200 truncate">{item.category}</span>
                          <span className="text-xs font-bold text-rose-300 ml-2 shrink-0">−${item.loss.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.hex }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-violet-900/10 border border-violet-500/20">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-violet-300 font-bold">{patternIntelligence[0]?.category}</span>{" "}
                  {isEn
                    ? `is your biggest saboteur — −$${patternIntelligence[0]?.loss.toLocaleString()} from ${displayLogs.length} incidents. Focus prevention here first.`
                    : `je tvůj největší sabotér — −$${patternIntelligence[0]?.loss.toLocaleString()} ze ${displayLogs.length} incidentů. Fokusuj prevenci tady jako první.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Active filter bar ── */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 w-fit"
            >
              <span className="text-xs text-slate-400">{isEn ? "Filter:" : "Filtr:"}</span>
              <span className="text-xs font-semibold text-white">{categoryMeta(activeCategory).icon} {activeCategory}</span>
              <button onClick={() => setActiveCategory(null)} className="ml-1 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Incident Log ── */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">{isEn ? "Loading..." : "Načítám..."}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl text-center">
            <FlaskConical className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-300 font-medium mb-1">
              {activeCategory
                ? (isEn ? `No incidents in category "${activeCategory}"` : `Žádné incidenty kategorie "${activeCategory}"`)
                : (isEn ? "No records" : "Žádné záznamy")}
            </p>
            <p className="text-sm text-slate-500">
              {activeCategory
                ? (isEn ? "Try another filter or click to clear" : "Zkus jiný filtr nebo klikni pro zrušení")
                : (isEn ? "Click Analyze with AI" : "Klikni na Analyzovat s AI")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const ego = log.egoLevel ?? deriveEgoLevel(log.severity)
              const egoMeta = EGO_META[ego]
              const catMeta = categoryMeta(log.category)
              const isOpen = openAutopsy === log.id

              return (
                <Card
                  key={log.id}
                  className={cn(
                    "border transition-all duration-200",
                    ego === "full-amok"
                      ? "bg-rose-950/20 border-rose-800/40 hover:border-rose-600/50"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-600",
                  )}
                >
                  <CardContent className="p-5 space-y-4">

                    {/* Row 1: title + badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                          <h3 className="text-base font-bold text-white leading-tight">{log.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(log.date).toLocaleDateString(isEn ? "en-US" : "cs-CZ", { weekday: "long", day: "numeric", month: "long" })}
                          {log.time && <span className="ml-1.5">· {log.time} CET</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        {log.trade && log.trade.loss > 0 && (
                          <Badge className="text-xs border font-mono font-bold bg-rose-950/60 text-rose-300 border-rose-500/50">
                            💸 Financial Leak: −${log.trade.loss.toLocaleString()}
                          </Badge>
                        )}
                        <Badge className={cn("text-xs border font-medium", egoMeta.className)}>
                          Ego Level: {egoMeta.label}
                        </Badge>
                        <Badge className="text-xs border" style={{
                          backgroundColor: catMeta.hex + "22",
                          color: catMeta.hex,
                          borderColor: catMeta.hex + "55",
                        }}>
                          {catMeta.icon} {log.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Row 2: Session context */}
                    {log.sessionContext && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50">
                          <span className="text-[10px] text-slate-500">Confidence:</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 10 }, (_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-3 rounded-sm"
                                style={{
                                  backgroundColor: i < log.sessionContext!.confidence
                                    ? log.sessionContext!.confidence <= 3 ? "#f43f5e"
                                    : log.sessionContext!.confidence <= 6 ? "#f59e0b"
                                    : "#10b981"
                                    : "rgb(51,65,85)",
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold" style={{
                            color: log.sessionContext.confidence <= 3 ? "#f43f5e"
                              : log.sessionContext.confidence <= 6 ? "#f59e0b"
                              : "#10b981"
                          }}>{log.sessionContext.confidence}/10</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold",
                          log.sessionContext.routineComplete
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        )}>
                          {log.sessionContext.routineComplete ? (isEn ? "✅ Routine done" : "✅ Rutina splněna") : (isEn ? "❌ Routine skipped" : "❌ Rutina přeskočena")}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50">
                          <span className="text-[10px] text-slate-400 font-medium">{log.sessionContext.session} Session</span>
                        </div>
                      </div>
                    )}

                    {/* Row 3: 3-col info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/30">
                        <p className="text-[10px] font-semibold text-rose-400 mb-1 uppercase tracking-wide">{isEn ? "Root Cause" : "Kořenová příčina"}</p>
                        <p className="text-xs text-slate-200 leading-relaxed">{log.rootCause}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/30">
                        <p className="text-[10px] font-semibold text-amber-400 mb-1 uppercase tracking-wide">The Lesson Learned</p>
                        <p className="text-xs text-slate-200 leading-relaxed italic">{log.lessonLearned}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
                        <p className="text-[10px] font-semibold text-emerald-400 mb-1 uppercase tracking-wide">{isEn ? "Prevention Protocol" : "Protokol prevence"}</p>
                        <p className="text-xs text-slate-200 leading-relaxed">{log.actionPlan}</p>
                      </div>
                    </div>

                    {/* Row 4: trade metrics */}
                    {log.trade && (
                      <div className="flex items-center flex-wrap gap-4 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <span className="font-bold text-white text-sm">{log.trade.symbol}</span>
                        <span className="text-slate-400 text-xs">Entry <span className="text-white font-medium">{log.trade.entry}</span></span>
                        <span className="text-slate-400 text-xs">Exit <span className="text-white font-medium">{log.trade.exit}</span></span>
                        {log.trade.timeInTrade && (
                          <span className="text-slate-400 text-xs">{isEn ? "Time" : "Čas"} <span className="text-white font-medium">{log.trade.timeInTrade}</span></span>
                        )}
                        {log.trade.loss > 0 && (
                          <span className="ml-auto font-bold text-rose-400">−${log.trade.loss.toFixed(2)}</span>
                        )}
                      </div>
                    )}

                    {/* Row 5: AI Autopsy button + expandable panel */}
                    <div>
                      <button
                        onClick={() => setOpenAutopsy(isOpen ? null : log.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                          "border",
                          isOpen
                            ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                            : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-violet-900/20 hover:border-violet-600/40 hover:text-violet-300",
                        )}
                      >
                        <FlaskConical className="w-4 h-4" />
                        Trigger AI Autopsy
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-violet-500/30 font-mono text-xs leading-relaxed">
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="ml-2 text-slate-500 text-[10px] tracking-widest uppercase">AI Autopsy · {log.id}</span>
                              </div>
                              {log.autopsy ? (
                                <pre className="whitespace-pre-wrap text-slate-300 text-[11px] leading-loose">
                                  {log.autopsy}
                                </pre>
                              ) : (
                                <div className="space-y-2 text-slate-300 text-[11px]">
                                  <p className="text-violet-400 font-bold">🔬 AI AUTOPSY — {log.title}</p>
                                  <p className="text-slate-500">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                                  <p>📋 <span className="text-slate-400">Kořenová příčina:</span> {log.rootCause}</p>
                                  <p>⚡ <span className="text-slate-400">Kategorie:</span> <span style={{ color: catMeta.hex }}>{log.category}</span></p>
                                  <p>🛡️ <span className="text-slate-400">Protokol:</span> {log.actionPlan}</p>
                                  <p className="text-amber-400 mt-2">💡 {log.lessonLearned}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
