"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { getJournalEntries } from "@/utils/storage-utils"

interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  timestamp: number
  type?: string
  profitLoss?: number
  pair?: string
  tradeType?: string
}

export function RecentJournals() {
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentEntries()

    // Listen for storage updates
    const handleStorageUpdate = (event: any) => {
      if (event.detail?.key === "trader-mindset-data") {
        loadRecentEntries()
      }
    }

    window.addEventListener("storage-updated", handleStorageUpdate)
    return () => window.removeEventListener("storage-updated", handleStorageUpdate)
  }, [])

  const loadRecentEntries = () => {
    try {
      const journalEntries = getJournalEntries()
      const recent = journalEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 5) // Get last 5 entries

      setRecentEntries(recent)
    } catch (error) {
      console.error("Error loading recent journal entries:", error)
      setRecentEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const getEntryIcon = (entry: JournalEntry) => {
    if (entry.type === "trade" && entry.profitLoss !== undefined) {
      if (entry.profitLoss > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
      if (entry.profitLoss < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
      return <Minus className="h-4 w-4 text-gray-600" />
    }
    return <BookOpen className="h-4 w-4 text-blue-600" />
  }

  const getEntryTypeLabel = (entry: JournalEntry) => {
    if (entry.type === "trade") return "Trade"
    if (entry.type === "behavior") return "Behavior"
    return "Journal"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Nedávné záznamy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Poslední deníkové záznamy
        </CardTitle>
        <CardDescription>Rychlý přehled vašich nedávných reflexí a obchodů.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-center text-muted-foreground mb-4">Zatím žádné deníkové záznamy.</p>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/journal">Vytvořit první záznam</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getEntryIcon(entry)}
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getEntryTypeLabel(entry)} • {new Date(entry.date).toLocaleDateString("cs-CZ")}
                      </p>
                    </div>
                  </div>
                  {entry.profitLoss !== undefined && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        entry.profitLoss >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {entry.profitLoss >= 0 ? "+" : ""}
                      {entry.profitLoss.toFixed(2)} USD
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                {entry.pair && (
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {entry.pair} {entry.tradeType}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/journal">Zobrazit všechny záznamy</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
