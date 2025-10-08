"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  DollarSign,
  BarChart3,
  Brain,
  Target,
  Edit,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Activity,
} from "lucide-react"
import { getJournalEntries, deleteJournalEntry, type JournalEntry } from "@/utils/storage-utils"
import { formatDate, getRelativeDate, isSameDay } from "@/utils/date-utils"

interface JournalEntriesProps {
  selectedDate?: Date
  limit?: number
  showFilters?: boolean
}

export function JournalEntries({ selectedDate, limit, showFilters = true }: JournalEntriesProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    dateRange: "all",
    profitability: "all",
  })

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [entries, filters, selectedDate])

  const loadEntries = () => {
    setIsLoading(true)
    try {
      const journalEntries = getJournalEntries()
      setEntries(journalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (error) {
      console.error("Error loading journal entries:", error)
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...entries]

    if (selectedDate) {
      filtered = filtered.filter((entry) => isSameDay(entry.date, selectedDate))
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((entry) => entry.type === filters.type)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.pair?.toLowerCase().includes(searchLower) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    if (filters.dateRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (filters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          cutoffDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((entry) => new Date(entry.date) >= cutoffDate)
    }

    if (filters.profitability !== "all") {
      filtered = filtered.filter((entry) => {
        if (!entry.profitLoss && entry.profitLoss !== 0) return filters.profitability === "neutral"
        if (entry.profitLoss > 0) return filters.profitability === "profit"
        if (entry.profitLoss < 0) return filters.profitability === "loss"
        return filters.profitability === "neutral"
      })
    }

    if (limit) {
      filtered = filtered.slice(0, limit)
    }

    setFilteredEntries(filtered)
  }

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const handleDelete = async (entryId: string) => {
    if (confirm("Opravdu chcete smazat tento záznam?")) {
      deleteJournalEntry(entryId)
      loadEntries()
    }
  }

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "trade":
        return <BarChart3 className="w-4 h-4" />
      case "journal":
        return <BookOpen className="w-4 h-4" />
      case "behavior":
        return <Brain className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case "trade":
        return "Obchod"
      case "journal":
        return "Deník"
      case "behavior":
        return "Chování"
      default:
        return "Ostatní"
    }
  }

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case "trade":
        return "bg-blue-50 text-blue-800 border-blue-200"
      case "journal":
        return "bg-gray-50 text-gray-800 border-gray-200"
      case "behavior":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-800 border-gray-200"
    }
  }

  const getProfitLossColor = (profitLoss: number | undefined) => {
    if (!profitLoss && profitLoss !== 0) return "text-gray-600"
    return profitLoss >= 0 ? "text-green-600" : "text-red-600"
  }

  const getMoodColor = (mood: number | undefined) => {
    if (!mood) return "bg-gray-200"
    if (mood >= 8) return "bg-blue-600"
    if (mood >= 6) return "bg-blue-400"
    if (mood >= 4) return "bg-blue-300"
    return "bg-gray-400"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtry a vyhledávání
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Vyhledávání</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Hledat v záznamech..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Typ záznamu</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny typy</SelectItem>
                    <SelectItem value="trade">Obchody</SelectItem>
                    <SelectItem value="journal">Deník</SelectItem>
                    <SelectItem value="behavior">Chování</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Časové období</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny záznamy</SelectItem>
                    <SelectItem value="today">Dnes</SelectItem>
                    <SelectItem value="week">Tento týden</SelectItem>
                    <SelectItem value="month">Tento měsíc</SelectItem>
                    <SelectItem value="quarter">Čtvrtletí</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ziskovost</Label>
                <Select
                  value={filters.profitability}
                  onValueChange={(value) => setFilters({ ...filters, profitability: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny</SelectItem>
                    <SelectItem value="profit">Ziskové</SelectItem>
                    <SelectItem value="loss">Ztrátové</SelectItem>
                    <SelectItem value="neutral">Neutrální</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEntries.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              {filteredEntries.length} {filteredEntries.length === 1 ? "záznam" : "záznamů"}
            </Badge>
            {selectedDate && (
              <Badge variant="secondary" className="px-3 py-1">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(selectedDate)}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedDate ? "Žádné záznamy pro vybrané datum" : "Žádné záznamy"}
              </h3>
              <p className="text-gray-600">
                {selectedDate
                  ? "Pro tento den nejsou k dispozici žádné záznamy."
                  : "Zatím nemáte žádné záznamy v deníku. Začněte psát svůj první záznam!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id)

            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${getEntryTypeColor(entry.type)}`}>
                        {getEntryIcon(entry.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>
                          <Badge variant="outline" className={`text-xs ${getEntryTypeColor(entry.type)}`}>
                            {getEntryTypeLabel(entry.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {getRelativeDate(entry.date)}
                          </span>
                          {entry.pair && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {entry.pair}
                            </span>
                          )}
                          {entry.profitLoss !== undefined && (
                            <span
                              className={`flex items-center gap-1 font-medium ${getProfitLossColor(entry.profitLoss)}`}
                            >
                              <DollarSign className="w-3 h-3" />
                              {entry.profitLoss >= 0 ? "+" : ""}
                              {entry.profitLoss.toFixed(2)} USD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood)}`}></div>
                          <span className="text-xs text-gray-600">{entry.mood}/10</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(entry.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-2">{entry.content}</p>
                  </div>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {entry.tags.slice(0, isExpanded ? entry.tags.length : 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {!isExpanded && entry.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.tags.length - 3} více
                        </Badge>
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Obsah:</Label>
                        <p className="text-gray-700 mt-1 whitespace-pre-wrap">{entry.content}</p>
                      </div>

                      {entry.type === "trade" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {entry.direction && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Směr:</Label>
                              <div className="flex items-center gap-1 mt-1">
                                {entry.direction === "LONG" ? (
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                )}
                                <span className={entry.direction === "LONG" ? "text-green-600" : "text-red-600"}>
                                  {entry.direction}
                                </span>
                              </div>
                            </div>
                          )}

                          {entry.entryPrice && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Vstupní cena:</Label>
                              <p className="text-gray-900 mt-1">{entry.entryPrice}</p>
                            </div>
                          )}

                          {entry.exitPrice && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Výstupní cena:</Label>
                              <p className="text-gray-900 mt-1">{entry.exitPrice}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Upravit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Smazat
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default JournalEntries
