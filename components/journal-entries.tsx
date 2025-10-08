"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, TrendingUp, BookOpen, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { getUserData } from "@/utils/storage-utils"

interface JournalEntry {
  id: string
  date: string
  type: "trade" | "reflection" | "analysis"
  title: string
  content: string
  mood?: number
  outcome?: "win" | "loss" | "breakeven"
  profit?: number
  tags?: string[]
}

export function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [selectedFilter, setSelectedFilter] = useState<"all" | "trade" | "reflection" | "analysis">("all")

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, selectedFilter])

  const loadEntries = () => {
    const userData = getUserData()
    const journalEntries = userData.journalEntries || []
    setEntries(journalEntries)
  }

  const filterEntries = () => {
    if (selectedFilter === "all") {
      setFilteredEntries(entries)
    } else {
      setFilteredEntries(entries.filter((entry) => entry.type === selectedFilter))
    }
  }

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case "win":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "loss":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "breakeven":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "trade":
        return <TrendingUp className="w-4 h-4" />
      case "reflection":
        return <BookOpen className="w-4 h-4" />
      case "analysis":
        return <Calendar className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatProfit = (profit?: number) => {
    if (!profit) return null
    const isPositive = profit > 0
    return (
      <div className={`flex items-center gap-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span className="font-semibold">
          {isPositive ? "+" : ""}
          {profit.toFixed(2)} Kč
        </span>
      </div>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Journal záznamy
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className={selectedFilter === "all" ? "bg-purple-600" : "bg-transparent border-slate-600 text-slate-300"}
            >
              Vše
            </Button>
            <Button
              variant={selectedFilter === "trade" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("trade")}
              className={
                selectedFilter === "trade" ? "bg-purple-600" : "bg-transparent border-slate-600 text-slate-300"
              }
            >
              Obchody
            </Button>
            <Button
              variant={selectedFilter === "reflection" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("reflection")}
              className={
                selectedFilter === "reflection" ? "bg-purple-600" : "bg-transparent border-slate-600 text-slate-300"
              }
            >
              Reflexe
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Zatím nemáte žádné záznamy</p>
              <p className="text-slate-500 text-sm mt-2">Začněte psát svůj trading deník</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">{getTypeIcon(entry.type)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{entry.title}</h3>
                          <p className="text-sm text-slate-400">{formatDate(entry.date)}</p>
                        </div>
                      </div>
                      {entry.outcome && (
                        <Badge className={getOutcomeColor(entry.outcome)}>
                          {entry.outcome === "win" ? "Win" : entry.outcome === "loss" ? "Loss" : "Breakeven"}
                        </Badge>
                      )}
                    </div>

                    <p className="text-slate-300 text-sm mb-3 line-clamp-3">{entry.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {entry.mood && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Nálada:</span>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {entry.mood}/10
                            </Badge>
                          </div>
                        )}
                        {entry.profit !== undefined && formatProfit(entry.profit)}
                      </div>
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          {entry.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default JournalEntries
