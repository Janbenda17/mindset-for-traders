"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Smile,
  Meh,
  Frown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalRecentEntriesProps {
  entries: any[]
  isEn?: boolean
}

type FilterType = "all" | "trade" | "journal" | "win" | "loss"

// Map a textual emotion to a sentiment so we can colour-code the entry.
const POSITIVE_EMOTIONS = ["confident", "calm", "focused", "disciplined", "excited", "happy", "klidný", "soustředěný"]
const NEGATIVE_EMOTIONS = ["anxious", "nervous", "stressed", "fearful", "angry", "frustrated", "nervózní", "vystresovaný"]

function emotionSentiment(emotion?: string): "positive" | "negative" | "neutral" {
  if (!emotion) return "neutral"
  const e = emotion.toLowerCase()
  if (POSITIVE_EMOTIONS.some((p) => e.includes(p))) return "positive"
  if (NEGATIVE_EMOTIONS.some((n) => e.includes(n))) return "negative"
  return "neutral"
}

function EmotionIcon({ emotion }: { emotion?: string }) {
  const sentiment = emotionSentiment(emotion)
  if (sentiment === "positive") return <Smile className="w-3.5 h-3.5 text-emerald-400" />
  if (sentiment === "negative") return <Frown className="w-3.5 h-3.5 text-rose-400" />
  return <Meh className="w-3.5 h-3.5 text-gray-400" />
}

export default function JournalRecentEntries({ entries, isEn = false }: JournalRecentEntriesProps) {
  const [filter, setFilter] = useState<FilterType>("all")
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState(false)

  const txt = {
    title: isEn ? "Recent Entries" : "Nedávné záznamy",
    subtitle: isEn ? "Your latest trades and notes" : "Tvé poslední obchody a poznámky",
    searchPlaceholder: isEn ? "Search pair, note, emotion…" : "Hledat pár, poznámku, emoci…",
    all: isEn ? "All" : "Vše",
    trades: isEn ? "Trades" : "Obchody",
    journal: isEn ? "Notes" : "Poznámky",
    wins: isEn ? "Wins" : "Výhry",
    losses: isEn ? "Losses" : "Ztráty",
    empty: isEn ? "No entries match your filter" : "Žádné záznamy neodpovídají filtru",
    showMore: isEn ? "Show all" : "Zobrazit vše",
    showLess: isEn ? "Show less" : "Zobrazit méně",
    note: isEn ? "Note" : "Poznámka",
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries
      .filter((e) => {
        const pnl = e.profitLoss ?? e.pnl ?? 0
        if (filter === "trade" && e.type !== "trade") return false
        if (filter === "journal" && e.type !== "journal") return false
        if (filter === "win" && !(e.type === "trade" && pnl > 0)) return false
        if (filter === "loss" && !(e.type === "trade" && pnl < 0)) return false
        if (q) {
          const haystack = [e.title, e.pair, e.notes, e.content, e.emotion, ...(e.tags || [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          if (!haystack.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [entries, filter, query])

  const visible = expanded ? filtered : filtered.slice(0, 6)

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: txt.all },
    { key: "trade", label: txt.trades },
    { key: "win", label: txt.wins },
    { key: "loss", label: txt.losses },
    { key: "journal", label: txt.journal },
  ]

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base md:text-lg">{txt.title}</h3>
              <p className="text-gray-400 text-xs">{txt.subtitle}</p>
            </div>
          </div>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={txt.searchPlaceholder}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all",
                filter === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-900/50 text-gray-400 hover:text-white hover:bg-slate-700/50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">{txt.empty}</div>
        ) : (
          <div className="space-y-2">
            {visible.map((entry) => {
              const isTrade = entry.type === "trade"
              const pnl = entry.profitLoss ?? entry.pnl ?? 0
              const isWin = pnl > 0
              const isLong = entry.direction === "long"
              const dateLabel = new Date(entry.date).toLocaleDateString(isEn ? "en-US" : "cs-CZ", {
                day: "numeric",
                month: "short",
              })
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border bg-slate-900/40 transition-colors hover:bg-slate-900/70",
                    isTrade
                      ? isWin
                        ? "border-emerald-500/20"
                        : "border-rose-500/20"
                      : "border-slate-700",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isTrade ? (isWin ? "bg-emerald-500/15" : "bg-rose-500/15") : "bg-blue-500/15",
                    )}
                  >
                    {isTrade ? (
                      isWin ? (
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-rose-400" />
                      )
                    ) : (
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm truncate">
                        {entry.pair || entry.title || txt.note}
                      </span>
                      {isTrade && entry.direction && (
                        <Badge
                          className={cn(
                            "text-[10px] px-1.5 py-0 border-0",
                            isLong ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300",
                          )}
                        >
                          {isLong ? (
                            <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                          )}
                          {entry.direction.toUpperCase()}
                        </Badge>
                      )}
                      {entry.emotion && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <EmotionIcon emotion={entry.emotion} />
                          {entry.emotion}
                        </span>
                      )}
                    </div>
                    {(entry.notes || entry.content) && (
                      <p className="text-gray-400 text-xs truncate mt-0.5">{entry.notes || entry.content}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    {isTrade && (
                      <p className={cn("font-bold text-sm", isWin ? "text-emerald-400" : "text-rose-400")}>
                        {isWin ? "+" : ""}${pnl.toLocaleString(isEn ? "en-US" : "cs-CZ")}
                      </p>
                    )}
                    <p className="text-gray-500 text-[10px]">{dateLabel}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length > 6 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full mt-3 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {expanded ? txt.showLess : `${txt.showMore} (${filtered.length})`}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
