"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, X } from "lucide-react"
import { useData } from "@/contexts/data-context"
import type { DisciplineDay } from "@/lib/discipline-matrix"

interface JournalAiSearchProps {
  onResults: (matchedDates: Set<string> | null, matchedDays: DisciplineDay[], summary: string | null) => void
}

const EXAMPLE_QUERIES = [
  "kdy jsem dělal revenge trading",
  "ukaž mi bezchybné dny",
  "dny kde jsem porušil plán",
  "dny bez self-reportu",
]

export default function JournalAiSearch({ onResults }: JournalAiSearchProps) {
  const { getAllTrades, getAllJournalEntries } = useData()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeQuery, setActiveQuery] = useState<string | null>(null)

  const runSearch = async (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      const trades = getAllTrades?.() || []
      const journalEntries = getAllJournalEntries?.() || []
      const res = await fetch("/api/journal/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, trades, journalEntries }),
      })
      if (!res.ok) throw new Error("Vyhledávání selhalo")
      const data = await res.json()
      setActiveQuery(trimmed)
      onResults(new Set<string>(data.matchedDates || []), data.matchedDays || [], data.summary || null)
    } catch (e: any) {
      setError(e?.message || "Vyhledávání selhalo, zkus to znovu")
      onResults(null, [], null)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setActiveQuery(null)
    setError(null)
    onResults(null, [], null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch(query)
            }}
            placeholder="Zeptej se na svou disciplínu, např. 'kdy jsem dělal revenge trading'..."
            className="pl-9 bg-slate-900/60 border-slate-600 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          onClick={() => runSearch(query)}
          disabled={loading || !query.trim()}
          className="bg-purple-600 hover:bg-purple-700 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hledat"}
        </Button>
        {activeQuery && (
          <Button variant="outline" onClick={clearSearch} className="border-slate-600 text-gray-300 shrink-0" size="icon">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {!activeQuery && (
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_QUERIES.map((eq) => (
            <button
              key={eq}
              onClick={() => {
                setQuery(eq)
                runSearch(eq)
              }}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-700/60 text-gray-400 hover:bg-slate-700 hover:text-gray-200 transition-colors"
            >
              {eq}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
