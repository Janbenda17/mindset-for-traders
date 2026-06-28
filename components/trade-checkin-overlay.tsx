"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MinusCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTradeCheckin } from "@/contexts/trade-checkin-context"

const EMOTIONS = [
  { key: "calm", label: "Klidný", emoji: "🧘" },
  { key: "energized", label: "Nabitý", emoji: "⚡" },
  { key: "nervous", label: "Nervózní", emoji: "😰" },
  { key: "frustrated", label: "Frustrovaný", emoji: "😤" },
  { key: "focused", label: "Soustředěný", emoji: "🎯" },
]

function confidenceStyle(v: number) {
  if (v <= 4) return "border-rose-500 bg-rose-500/20 text-rose-300 scale-110"
  if (v <= 6) return "border-amber-500 bg-amber-500/20 text-amber-300 scale-110"
  return "border-emerald-500 bg-emerald-500/20 text-emerald-300 scale-110"
}

export default function TradeCheckinOverlay() {
  const { pending, submitOpen, submitClose, dismiss } = useTradeCheckin()
  const [confidence, setConfidence] = useState<number | null>(null)
  const [emotion, setEmotion] = useState<string | null>(null)

  const resetForm = () => {
    setConfidence(null)
    setEmotion(null)
  }

  const handleDismiss = () => {
    resetForm()
    dismiss()
  }

  const handleSubmitOpen = async () => {
    if (!pending || confidence === null || emotion === null) return
    await submitOpen(pending.tradeId, confidence, emotion)
    resetForm()
  }

  const handleSubmitClose = async (followedPlan: "yes" | "no" | "partial") => {
    if (!pending) return
    await submitClose(pending.tradeId, followedPlan)
    resetForm()
  }

  return (
    <AnimatePresence>
      {pending && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel — slides in from right, covers ~half the screen */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-l border-slate-700 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div
              className={cn(
                "px-6 py-5 border-b border-slate-800 flex items-start justify-between gap-4",
                pending.phase === "open"
                  ? "bg-blue-500/10 border-b-blue-500/20"
                  : "bg-purple-500/10 border-b-purple-500/20",
              )}
            >
              <div>
                <p
                  className={cn(
                    "text-xs uppercase tracking-widest font-semibold mb-1",
                    pending.phase === "open" ? "text-blue-400" : "text-purple-400",
                  )}
                >
                  {pending.phase === "open" ? "🟢 Právě jsi otevřel obchod" : "🔴 Právě jsi zavřel obchod"}
                </p>
                <h2 className="text-3xl font-black text-white">{pending.pair}</h2>
                {pending.phase === "close" && pending.pnl !== undefined && (
                  <p
                    className={cn(
                      "text-2xl font-bold mt-1",
                      pending.pnl >= 0 ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {pending.pnl >= 0 ? "+" : ""}${Math.round(pending.pnl)}
                  </p>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {pending.phase === "open" ? (
                <>
                  {/* Confidence */}
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">
                      Jak moc věříš tomuto vstupu?
                    </p>
                    <p className="text-xs text-slate-500 mb-4">Sebejistota v setup — 1 = vůbec, 10 = naprosto přesvědčen</p>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                        <button
                          key={v}
                          onClick={() => setConfidence(v)}
                          className={cn(
                            "h-14 rounded-xl border-2 text-xl font-black transition-all",
                            confidence === v
                              ? confidenceStyle(v)
                              : "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-white hover:scale-105",
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    {confidence !== null && (
                      <p className="text-xs mt-3 text-slate-400">
                        {confidence <= 3
                          ? "⚠️ Velmi nízká sebejistota — zvažuj, jestli vůbec vstupovat"
                          : confidence <= 5
                            ? "Střední sebejistota — setup splňuje základní kritéria"
                            : confidence <= 7
                              ? "Dobrá sebejistota — solidní setup"
                              : "💪 Vysoká sebejistota — silný setup, důvěřuj procesu"}
                      </p>
                    )}
                  </div>

                  {/* Emotion */}
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">Jak se teď cítíš?</p>
                    <p className="text-xs text-slate-500 mb-4">Emoční stav před vstupem do trhu</p>
                    <div className="flex flex-col gap-3">
                      {EMOTIONS.map((e) => (
                        <button
                          key={e.key}
                          onClick={() => setEmotion(e.key)}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                            emotion === e.key
                              ? "border-blue-500 bg-blue-500/15 text-white"
                              : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-white",
                          )}
                        >
                          <span className="text-2xl">{e.emoji}</span>
                          <span className="font-semibold">{e.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Close phase — only plan adherence */
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Dodržel jsi svůj plán?</p>
                  <p className="text-xs text-slate-500 mb-6">Buď upřímný — nikdo jiný to neuvidí</p>
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handleSubmitClose("yes")}
                      className="flex items-center gap-4 px-5 py-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all group"
                    >
                      <CheckCircle2 className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-emerald-300">Ano, dodržel jsem plán</p>
                        <p className="text-xs text-slate-400 mt-0.5">Vstoupil jsem dle pravidel a dodržel stop-loss</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSubmitClose("partial")}
                      className="flex items-center gap-4 px-5 py-5 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all"
                    >
                      <MinusCircle className="w-7 h-7 text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-amber-300">Částečně</p>
                        <p className="text-xs text-slate-400 mt-0.5">Některá pravidla jsem dodržel, jiná ne</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSubmitClose("no")}
                      className="flex items-center gap-4 px-5 py-5 rounded-xl border-2 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-all"
                    >
                      <XCircle className="w-7 h-7 text-rose-400 flex-shrink-0" />
                      <div>
                        <p className="text-lg font-bold text-rose-300">Ne, porušil jsem plán</p>
                        <p className="text-xs text-slate-400 mt-0.5">Impulzivní vstup nebo porušení risk managementu</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — only for open phase */}
            {pending.phase === "open" && (
              <div className="px-6 py-5 border-t border-slate-800 flex gap-3">
                <Button
                  onClick={handleSubmitOpen}
                  disabled={confidence === null || emotion === null}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold disabled:opacity-40"
                >
                  Uložit a obchodovat
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-slate-500 hover:text-white h-12 px-4"
                >
                  Přeskočit
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
