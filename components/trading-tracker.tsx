"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { getTodayDateString } from "@/utils/date-utils"
import {
  Users,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Share2,
  Trophy,
  Target,
  DollarSign,
  Clock,
  Eye,
  Heart,
  BarChart3,
} from "lucide-react"

interface GroupTrade {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  date: string
  symbol: string
  type: "long" | "short"
  entryPrice: number
  exitPrice?: number
  profitLoss?: number
  status: "open" | "closed"
  notes: string
  likes: number
  comments: number
  views: number
  isLiked: boolean
  timeAgo: string
  confidence: number
  tags: string[]
}

// Demo group trades data
const DEMO_GROUP_TRADES: GroupTrade[] = [
  {
    id: "group-1",
    userId: "user-1",
    userName: "TradingPro_CZ",
    userAvatar: "/trader-avatar.png",
    date: getTodayDateString(),
    symbol: "EUR/USD",
    type: "long",
    entryPrice: 1.085,
    exitPrice: 1.089,
    profitLoss: 400,
    status: "closed",
    notes:
      "Perfektní breakout z consolidace! ECB hawkish stance pomohl. Držel jsem podle plánu a vzal zisk na resistance.",
    likes: 12,
    comments: 5,
    views: 45,
    isLiked: false,
    timeAgo: "před 2 hodinami",
    confidence: 9,
    tags: ["breakout", "ECB", "resistance"],
  },
  {
    id: "group-2",
    userId: "user-2",
    userName: "ForexMaster",
    userAvatar: "/forex-trader.png",
    date: getTodayDateString(),
    symbol: "GBP/JPY",
    type: "short",
    entryPrice: 185.2,
    status: "open",
    notes: "Vstupuji na rejection z klíčové resistance. SL na 186.00, TP na 183.50. Risk/reward 1:2.3",
    likes: 8,
    comments: 3,
    views: 32,
    isLiked: true,
    timeAgo: "před 1 hodinou",
    confidence: 8,
    tags: ["resistance", "rejection", "swing"],
  },
  {
    id: "group-3",
    userId: "user-3",
    userName: "ScalpingKing",
    userAvatar: "/scalper-avatar.png",
    date: getTodayDateString(),
    symbol: "USD/JPY",
    type: "long",
    entryPrice: 148.15,
    exitPrice: 148.45,
    profitLoss: 150,
    status: "closed",
    notes: "Rychlý scalp na London open. Vysoká volatilita, perfektní execution. In and out za 15 minut! 💪",
    likes: 15,
    comments: 7,
    views: 67,
    isLiked: true,
    timeAgo: "před 4 hodinami",
    confidence: 7,
    tags: ["scalping", "london-open", "volatility"],
  },
  {
    id: "group-4",
    userId: "user-4",
    userName: "SwingTrader_Pro",
    userAvatar: "/swing-trader.png",
    date: getTodayDateString(),
    symbol: "AUD/USD",
    type: "long",
    entryPrice: 0.672,
    status: "open",
    notes: "Dlouhodobější pozice na AUD strength. RBA hawkish, commodities bullish. Držím několik dní. Target 0.6850",
    likes: 6,
    comments: 2,
    views: 28,
    isLiked: false,
    timeAgo: "před 6 hodinami",
    confidence: 8,
    tags: ["swing", "RBA", "commodities", "long-term"],
  },
  {
    id: "group-5",
    userId: "user-5",
    userName: "CryptoForex_CZ",
    userAvatar: "/crypto-trader.png",
    date: getTodayDateString(),
    symbol: "BTC/USD",
    type: "short",
    entryPrice: 43500,
    exitPrice: 42800,
    profitLoss: -350,
    status: "closed",
    notes: "Bohužel špatný timing. BTC překvapivě silný, stopped out. Poučení: čekat na lepší confirmation.",
    likes: 4,
    comments: 8,
    views: 52,
    isLiked: false,
    timeAgo: "včera",
    confidence: 6,
    tags: ["BTC", "stop-loss", "lesson-learned"],
  },
]

export function TradingTracker() {
  const [groupTrades, setGroupTrades] = useState<GroupTrade[]>(DEMO_GROUP_TRADES)
  const [newTrade, setNewTrade] = useState({
    symbol: "",
    type: "long" as "long" | "short",
    entryPrice: "",
    notes: "",
    confidence: 7,
    tags: "",
  })
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "profitable">("recent")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trade: GroupTrade = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "Já",
      date: getTodayDateString(),
      symbol: newTrade.symbol,
      type: newTrade.type,
      entryPrice: Number(newTrade.entryPrice),
      status: "open",
      notes: newTrade.notes,
      likes: 0,
      comments: 0,
      views: 1,
      isLiked: false,
      timeAgo: "právě teď",
      confidence: newTrade.confidence,
      tags: newTrade.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    setGroupTrades([trade, ...groupTrades])

    toast({
      title: "Obchod sdílen",
      description: "Váš obchod byl úspěšně sdílen s komunitou.",
    })

    // Reset form
    setNewTrade({
      symbol: "",
      type: "long",
      entryPrice: "",
      notes: "",
      confidence: 7,
      tags: "",
    })
  }

  const handleLike = (tradeId: string) => {
    setGroupTrades((trades) =>
      trades.map((trade) =>
        trade.id === tradeId
          ? {
              ...trade,
              likes: trade.isLiked ? trade.likes - 1 : trade.likes + 1,
              isLiked: !trade.isLiked,
            }
          : trade,
      ),
    )
  }

  const filteredTrades = groupTrades.filter((trade) => {
    if (filter === "all") return true
    return trade.status === filter
  })

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes + b.comments - (a.likes + a.comments)
      case "profitable":
        return (b.profitLoss || 0) - (a.profitLoss || 0)
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  const stats = {
    totalTrades: groupTrades.length,
    openTrades: groupTrades.filter((t) => t.status === "open").length,
    totalPnL: groupTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0),
    avgConfidence: groupTrades.reduce((sum, t) => sum + t.confidence, 0) / groupTrades.length,
  }

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Aktivní obchody</p>
                <p className="text-xl font-bold text-blue-600">{stats.openTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <div>
                <p className="text-sm text-gray-600">Celkem obchodů</p>
                <p className="text-xl font-bold text-blue-700">{stats.totalTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Komunitní P&L</p>
                <p className={`text-xl font-bold ${stats.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${stats.totalPnL.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Průměrná důvěra</p>
                <p className="text-xl font-bold">{stats.avgConfidence.toFixed(1)}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share New Trade */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Sdílet obchod s komunitou</span>
          </CardTitle>
          <CardDescription>Podělte se o svůj obchod a získejte feedback od ostatních traderů</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="EUR/USD, BTC/USD..."
                  value={newTrade.symbol}
                  onChange={(e) => setNewTrade({ ...newTrade, symbol: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <Select
                  value={newTrade.type}
                  onValueChange={(value: "long" | "short") => setNewTrade({ ...newTrade, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryPrice">Vstupní cena</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.0001"
                  placeholder="0.00"
                  value={newTrade.entryPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidence">Důvěra (1-10)</Label>
                <Select
                  value={newTrade.confidence.toString()}
                  onValueChange={(value) => setNewTrade({ ...newTrade, confidence: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tagy (oddělené čárkou)</Label>
                <Input
                  id="tags"
                  placeholder="breakout, resistance, scalping..."
                  value={newTrade.tags}
                  onChange={(e) => setNewTrade({ ...newTrade, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Analýza a poznámky</Label>
              <Textarea
                id="notes"
                placeholder="Popište svou analýzu, důvod vstupu, risk management..."
                value={newTrade.notes}
                onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                rows={3}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Sdílet obchod
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            Všechny ({groupTrades.length})
          </Button>
          <Button variant={filter === "open" ? "default" : "outline"} size="sm" onClick={() => setFilter("open")}>
            Otevřené ({stats.openTrades})
          </Button>
          <Button variant={filter === "closed" ? "default" : "outline"} size="sm" onClick={() => setFilter("closed")}>
            Uzavřené ({groupTrades.length - stats.openTrades})
          </Button>
        </div>

        <Select value={sortBy} onValueChange={(value: "recent" | "popular" | "profitable") => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Nejnovější</SelectItem>
            <SelectItem value="popular">Nejpopulárnější</SelectItem>
            <SelectItem value="profitable">Nejziskovější</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Community Trades Feed */}
      <div className="space-y-4">
        {sortedTrades.map((trade) => (
          <Card key={trade.id} className="hover:shadow-md transition-shadow border-blue-100">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={trade.userAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{trade.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{trade.userName}</p>
                    <p className="text-sm text-gray-500 flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{trade.timeAgo}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={trade.status === "open" ? "default" : "secondary"}>
                    {trade.status === "open" ? "Otevřeno" : "Uzavřeno"}
                  </Badge>
                  <Badge variant="outline">Důvěra: {trade.confidence}/10</Badge>
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Symbol</p>
                  <p className="font-semibold text-lg">{trade.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Typ</p>
                  <div className="flex items-center space-x-1">
                    {trade.type === "long" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-semibold ${trade.type === "long" ? "text-green-600" : "text-red-600"}`}>
                      {trade.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vstup</p>
                  <p className="font-semibold">{trade.entryPrice}</p>
                </div>
                {trade.status === "closed" && (
                  <div>
                    <p className="text-sm text-gray-600">P&L</p>
                    <p className={`font-semibold ${(trade.profitLoss || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {(trade.profitLoss || 0) >= 0 ? "+" : ""}${trade.profitLoss?.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <p className="text-gray-700 mb-4">{trade.notes}</p>

              {/* Tags */}
              {trade.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {trade.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(trade.id)}
                    className={trade.isLiked ? "text-red-600" : "text-gray-600"}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${trade.isLiked ? "fill-current" : ""}`} />
                    {trade.likes}
                  </Button>

                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {trade.comments}
                  </Button>

                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    {trade.views}
                  </div>
                </div>

                {trade.status === "closed" && trade.profitLoss && trade.profitLoss > 0 && (
                  <Trophy className="w-5 h-5 text-yellow-600" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
