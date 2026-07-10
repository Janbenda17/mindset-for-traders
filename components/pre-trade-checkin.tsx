"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TradeCheckin {
  id: string
  pair: string
  openedAt: string
  confidenceBefore: number
  emotionBefore: string
  followedPlan: "yes" | "no" | "partial" | null
  closedAt?: string
}

const EMOTIONS = [
  { key: "calm", label: "Klidný", emoji: "🧘" },
  { key: "energized", label: "Nabitý", emoji: "⚡" },
  { key: "nervous", label: "Nervózní", emoji: "😰" },
  { key: "frustrated", label: "Frustrovaný", emoji: "😤" },
  { key: "focused", label: "Soustředěný", emoji: "🎯" },
]

interface Props {
  checkins: TradeCheckin[]
  onChange: (checkins: TradeCheckin[]) => void
}

export default function PreTradeCheckin({ checkins, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [pair, setPair] = useState("")
  const [confidence, setConfidence] = useState<number | null>(null)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const openTrades = checkins.filter((c) => !c.closedAt)
  const closedTrades = checkins.filter((c) => c.closedAt)

  const handleSubmit = () => {
    if (!pair.trim() || confidence === null || emotion === null) return
    const now = new Date()
    const checkin: TradeCheckin = {
      id: `checkin-${Date.now()}`,
      pair: pair.trim().toUpperCase(),
      openedAt: now.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }),
      confidenceBefore: confidence,
      emotionBefore: emotion,
      followedPlan: null,
    }
    onChange([...checkins, checkin])
    setPair("")
    setConfidence(null)
    setEmotion(null)
    setOpen(false)
  }

  const handleClose = (id: string, followedPlan: "yes" | "no" | "partial") => {
    const now = new Date()
    onChange(
      checkins.map((c) =>
        c.id === id
          ? {
              ...c,
              followedPlan,
              closedAt: now.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }),
            }
          : c,
      ),
    )
  }

  const handleDelete = (id: string) => {
    onChange(checkins.filter((c) => c.id !== id))
  }

  const confidenceColor = (v: number) => {
    if (v <= 4) return "text-rose-400 border-rose-500/50 bg-rose-500/10"
    if (v <= 6) return "text-amber-400 border-amber-500/50 bg-amber-500/10"
    return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10"
  }

  return (
    <Card className="border border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-950">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-2 text-white font-bold hover:text-blue-300 transition-colors"
          >
            <Zap className="h-4 w-4 text-blue-400" />
            Pre-Trade Check-in
            {openTrades.length > 0 && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                {openTrades.length} otevřených
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>
          {!open && (
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Nový obchod
            </Button>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* New trade form */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-4"
                  >
                    {/* Pair input */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Nástroj</p>
                      <input
                        value={pair}
                        onChange={(e) => setPair(e.target.value)}
                        placeholder="GBP/USD, EUR/USD, XAU/USD..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => e.key === "Enter" && confidence !== null && emotion && handleSubmit()}
                      />
                    </div>

                    {/* Confidence 1-10 */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                        Sebejistota v tento setup
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                          <button
                            key={v}
                            onClick={() => setConfidence(v)}
                            className={cn(
                              "w-9 h-9 rounded-lg border text-sm font-bold transition-all",
                              confidence === v
                                ? confidenceColor(v)
                                : "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-white",
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      {confidence !== null && (
                        <p className="text-xs mt-1.5 text-slate-400">
                          {confidence <= 4
                            ? "Nízká sebejistota — zvažuj, jestli vůbec vstupovat"
                            : confidence <= 6
                              ? "Střední — setup splňuje základní kritéria"
                              : "Vysoká sebejistota — silný setup"}
                        </p>
                      )}
                    </div>

                    {/* Emotion */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Jak se cítíš?</p>
                      <div className="flex gap-2 flex-wrap">
                        {EMOTIONS.map((e) => (
                          <button
                            key={e.key}
                            onClick={() => setEmotion(e.key)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                              emotion === e.key
                                ? "border-blue-500/50 bg-blue-500/15 text-blue-200"
                                : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600",
                            )}
                          >
                            <span>{e.emoji}</span> {e.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={handleSubmit}
                        disabled={!pair.trim() || confidence === null || emotion === null}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4"
                      >
                        Uložit & otevřít obchod
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-slate-400 hover:text-white text-xs h-8 px-3"
                      >
                        Zrušit
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Open trades waiting for close */}
              {openTrades.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Otevřené pozice</p>
                  {openTrades.map((c) => (
                    <OpenTradeRow key={c.id} checkin={c} onClose={handleClose} onDelete={handleDelete} />
                  ))}
                </div>
              )}

              {/* Closed trades summary */}
              {closedTrades.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Uzavřené dnes</p>
                  {closedTrades.map((c) => (
                    <ClosedTradeRow key={c.id} checkin={c} onDelete={handleDelete} />
                  ))}
                </div>
              )}

              {checkins.length === 0 && !open && (
                <p className="text-xs text-slate-500 text-center py-2">
                  Klikni na "Nový obchod" před každým vstupem do trhu
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

function OpenTradeRow({
  checkin,
  onClose,
  onDelete,
}: {
  checkin: TradeCheckin
  onClose: (id: string, plan: "yes" | "no" | "partial") => void
  onDelete: (id: string) => void
}) {
  const [closing, setClosing] = useState(false)
  const emotionEmoji = EMOTIONS.find((e) => e.key === checkin.emotionBefore)?.emoji ?? "❓"

  return (
    <div className="rounded-lg border border-blue-500/20 bg-slate-900/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">{checkin.pair}</span>
          <span className="text-xs text-slate-500">{checkin.openedAt}</span>
          <span className="text-xs">{emotionEmoji}</span>
          <Badge
            className={cn(
              "text-[10px] border",
              checkin.confidenceBefore >= 7
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : checkin.confidenceBefore >= 5
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/30",
            )}
          >
            {checkin.confidenceBefore}/10 sebejistota
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {!closing ? (
            <Button
              size="sm"
              onClick={() => setClosing(true)}
              variant="outline"
              className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Zavřít obchod
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Dodržel jsi plán?</span>
              <button
                onClick={() => onClose(checkin.id, "yes")}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" /> Ano
              </button>
              <button
                onClick={() => onClose(checkin.id, "partial")}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <MinusCircle className="h-3 w-3" /> Částečně
              </button>
              <button
                onClick={() => onClose(checkin.id, "no")}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <XCircle className="h-3 w-3" /> Ne
              </button>
            </div>
          )}
          <button
            onClick={() => onDelete(checkin.id)}
            className="text-slate-600 hover:text-slate-400 transition-colors text-xs"
            title="Smazat"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

function ClosedTradeRow({
  checkin,
  onDelete,
}: {
  checkin: TradeCheckin
  onDelete: (id: string) => void
}) {
  const emotionEmoji = EMOTIONS.find((e) => e.key === checkin.emotionBefore)?.emoji ?? "❓"
  const planLabel =
    checkin.followedPlan === "yes"
      ? { text: "Plán dodržen ✅", cls: "text-emerald-400" }
      : checkin.followedPlan === "partial"
        ? { text: "Částečně ⚠️", cls: "text-amber-400" }
        : { text: "Plán porušen ❌", cls: "text-rose-400" }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-4 py-3 flex items-center justify-between gap-3 flex-wrap opacity-80">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="text-white font-semibold text-sm">{checkin.pair}</span>
        <span>{checkin.openedAt} → {checkin.closedAt}</span>
        <span>{emotionEmoji}</span>
        <span className="text-slate-500">{checkin.confidenceBefore}/10</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-xs font-medium", planLabel.cls)}>{planLabel.text}</span>
        <button
          onClick={() => onDelete(checkin.id)}
          className="text-slate-700 hover:text-slate-500 transition-colors text-xs"
        >
          ×
        </button>
      </div>
    </div>
  )
}
