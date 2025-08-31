"use client"

import type React from "react"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { cs } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Plus, Save, AlertCircle, Brain, TrendingUp, TrendingDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Sample data for trades
const generateTradeData = () => {
  const data = []
  const today = new Date()
  const tags = [
    "FOMO",
    "Revenge",
    "Brzy vystoupeno",
    "Pozdě vystoupeno",
    "Váhání",
    "Dle plánu",
    "Impulsivní",
    "Reentry",
    "Proti trendu",
    "Bez SL",
  ]
  const symbols = ["EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF", "EURGBP", "EURJPY", "GBPJPY"]

  for (let i = 20; i >= 0; i--) {
    const date = subDays(today, i)
    const result = Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : -Math.floor(Math.random() * 300) - 50
    const matchedPlan = Math.random() > 0.3
    const exitedEarly = Math.random() > 0.7
    const missedDueToHesitation = Math.random() > 0.7
    const revengeTrade = Math.random() > 0.8
    const appliedTags = []

    // Add 1-3 random tags
    const numTags = Math.floor(Math.random() * 3) + 1
    for (let j = 0; j < numTags; j++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)]
      if (!appliedTags.includes(randomTag)) {
        appliedTags.push(randomTag)
      }
    }

    data.push({
      id: i,
      date: format(date, "yyyy-MM-dd"),
      formattedDate: format(date, "d. MMMM", { locale: cs }),
      shortDate: format(date, "d. M."),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      result,
      matchedPlan,
      exitedEarly,
      missedDueToHesitation,
      revengeTrade,
      tags: appliedTags,
      notes: Math.random() > 0.7 ? "Poznámka k obchodu..." : "",
    })
  }

  return data
}

const behaviorData = [
  { date: "2023-10-26", emotion: "Klid", action: "Dodržel plán", outcome: "Pozitivní" },
  { date: "2023-10-25", emotion: "Frustrace", action: "Předčasný vstup", outcome: "Negativní" },
  { date: "2023-10-24", emotion: "Sebevědomí", action: "Agresivní pozice", outcome: "Pozitivní" },
  { date: "2023-10-23", emotion: "Strach", action: "Předčasný výstup", outcome: "Negativní" },
]

export function MindTraderBehavior() {
  const [activeTab, setActiveTab] = useState("entry")
  const [date, setDate] = useState<Date>(new Date())
  const [symbol, setSymbol] = useState("")
  const [matchedPlan, setMatchedPlan] = useState<string>("yes")
  const [exitedEarly, setExitedEarly] = useState<string>("no")
  const [missedDueToHesitation, setMissedDueToHesitation] = useState<string>("no")
  const [revengeTrade, setRevengeTrade] = useState<string>("no")
  const [notes, setNotes] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [tradeData, setTradeData] = useState(generateTradeData())
  const [timeframe, setTimeframe] = useState("week")

  // Available tags
  const availableTags = [
    "FOMO",
    "Revenge",
    "Brzy vystoupeno",
    "Pozdě vystoupeno",
    "Váhání",
    "Dle plánu",
    "Impulsivní",
    "Reentry",
    "Proti trendu",
    "Bez SL",
  ]

  // Filter data based on timeframe
  const filteredData = timeframe === "week" ? tradeData.slice(-7) : timeframe === "month" ? tradeData : tradeData

  // Calculate statistics
  const matchedPlanPercentage =
    filteredData.length > 0
      ? Math.round((filteredData.filter((trade) => trade.matchedPlan).length / filteredData.length) * 100)
      : 0
  const exitedEarlyPercentage =
    filteredData.length > 0
      ? Math.round((filteredData.filter((trade) => trade.exitedEarly).length / filteredData.length) * 100)
      : 0
  const missedDueToHesitationPercentage =
    filteredData.length > 0
      ? Math.round((filteredData.filter((trade) => trade.missedDueToHesitation).length / filteredData.length) * 100)
      : 0
  const revengeTradePercentage =
    filteredData.length > 0
      ? Math.round((filteredData.filter((trade) => trade.revengeTrade).length / filteredData.length) * 100)
      : 0

  // Calculate tag statistics
  const tagStats = availableTags
    .map((tag) => {
      const tradesWithTag = filteredData.filter((trade) => trade.tags.includes(tag))
      const count = tradesWithTag.length
      const winRate =
        tradesWithTag.length > 0
          ? Math.round((tradesWithTag.filter((trade) => trade.result > 0).length / tradesWithTag.length) * 100)
          : 0
      const avgResult =
        tradesWithTag.length > 0
          ? Math.round(tradesWithTag.reduce((sum, trade) => sum + trade.result, 0) / tradesWithTag.length)
          : 0

      return {
        tag,
        count,
        winRate,
        avgResult,
      }
    })
    .sort((a, b) => b.count - a.count)

  // Prepare data for charts
  const behaviorChartData = [
    { name: "Dle plánu", value: matchedPlanPercentage },
    { name: "Brzy vystoupeno", value: exitedEarlyPercentage },
    { name: "Váhání", value: missedDueToHesitationPercentage },
    { name: "Revenge", value: revengeTradePercentage },
  ]

  const tagFrequencyData = tagStats.slice(0, 5).map((stat) => ({
    name: stat.tag,
    count: stat.count,
  }))

  const tagPerformanceData = tagStats.slice(0, 5).map((stat) => ({
    name: stat.tag,
    avgResult: stat.avgResult,
  }))

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create new trade entry
    const newTrade = {
      id: tradeData.length,
      date: format(date, "yyyy-MM-dd"),
      formattedDate: format(date, "d. MMMM", { locale: cs }),
      shortDate: format(date, "d. M."),
      symbol: symbol,
      result: 0, // This would be filled later
      matchedPlan: matchedPlan === "yes",
      exitedEarly: exitedEarly === "yes",
      missedDueToHesitation: missedDueToHesitation === "yes",
      revengeTrade: revengeTrade === "yes",
      tags: selectedTags,
      notes: notes,
    }

    // Add to trade data
    setTradeData([...tradeData, newTrade])

    // Reset form
    setSymbol("")
    setMatchedPlan("yes")
    setExitedEarly("no")
    setMissedDueToHesitation("no")
    setRevengeTrade("no")
    setNotes("")
    setSelectedTags([])

    // Show success message
    alert("Obchodní chování bylo úspěšně zaznamenáno!")
  }

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
      setNewTag("")
    }
  }

  // Handle selecting a predefined tag
  const handleSelectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Obchodní chování</h2>
          <p className="text-muted-foreground">Analyzujte své obchodní chování a identifikujte vzorce</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Vyberte časové období" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Poslední týden</SelectItem>
              <SelectItem value="month">Poslední měsíc</SelectItem>
              <SelectItem value="all">Vše</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obchody dle plánu</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchedPlanPercentage}%</div>
            <p className="text-xs text-muted-foreground">Obchodů odpovídajících plánu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brzy vystoupeno</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exitedEarlyPercentage}%</div>
            <p className="text-xs text-muted-foreground">Obchodů s předčasným výstupem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Váhání</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missedDueToHesitationPercentage}%</div>
            <p className="text-xs text-muted-foreground">Obchodů zmeškaných kvůli váhání</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenge obchody</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revengeTradePercentage}%</div>
            <p className="text-xs text-muted-foreground">Obchodů ze msty</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry">Záznam chování</TabsTrigger>
          <TabsTrigger value="history">Historie</TabsTrigger>
          <TabsTrigger value="analysis">Analýza</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Záznam obchodního chování</CardTitle>
              <CardDescription>Zaznamenejte své chování během obchodování</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Datum obchodu</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Vyberte datum</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => date && setDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="Např. EURUSD, AAPL, BTC/USD"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Odpovídal vstup plánu?</Label>
                    <RadioGroup value={matchedPlan} onValueChange={setMatchedPlan}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="matched-plan-yes" />
                        <Label htmlFor="matched-plan-yes">Ano</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partially" id="matched-plan-partially" />
                        <Label htmlFor="matched-plan-partially">Částečně</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="matched-plan-no" />
                        <Label htmlFor="matched-plan-no">Ne</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Nevystoupil jsi moc brzo?</Label>
                    <RadioGroup value={exitedEarly} onValueChange={setExitedEarly}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="exited-early-yes" />
                        <Label htmlFor="exited-early-yes">Ano</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="exited-early-no" />
                        <Label htmlFor="exited-early-no">Ne</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Ujel ti obchod, protože jsi váhal?</Label>
                    <RadioGroup value={missedDueToHesitation} onValueChange={setMissedDueToHesitation}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="missed-hesitation-yes" />
                        <Label htmlFor="missed-hesitation-yes">Ano</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="missed-hesitation-no" />
                        <Label htmlFor="missed-hesitation-no">Ne</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Zadal jsi revenge trade?</Label>
                    <RadioGroup value={revengeTrade} onValueChange={setRevengeTrade}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="revenge-yes" />
                        <Label htmlFor="revenge-yes">Ano</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tempted" id="revenge-tempted" />
                        <Label htmlFor="revenge-tempted">Měl jsem chuť</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="revenge-no" />
                        <Label htmlFor="revenge-no">Ne</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tagy obchodu</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleSelectTag(tag)}
                      >
                        {tag} ✕
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nový tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Label className="text-sm">Často používané tagy:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleSelectTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Poznámky (volitelné)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Další poznámky k obchodu..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Uložit záznam
                </Button>
              </form>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Proč je to důležité?</AlertTitle>
            <AlertDescription>
              Zaznamenávání obchodního chování vám pomůže identifikovat vzorce, které vedou k úspěchu nebo neúspěchu.
              Postupem času uvidíte, jaké chování je třeba změnit pro lepší výsledky.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historie obchodního chování</CardTitle>
              <CardDescription>Přehled vašeho obchodního chování v čase</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Dle plánu</TableHead>
                    <TableHead>Brzy vystoupeno</TableHead>
                    <TableHead>Váhání</TableHead>
                    <TableHead>Revenge</TableHead>
                    <TableHead>Tagy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.formattedDate}</TableCell>
                      <TableCell>{trade.symbol}</TableCell>
                      <TableCell>
                        {trade.matchedPlan ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/10">
                            Ano
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/10">
                            Ne
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trade.exitedEarly ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10">
                            Ano
                          </Badge>
                        ) : (
                          <Badge variant="outline">Ne</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trade.missedDueToHesitation ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10">
                            Ano
                          </Badge>
                        ) : (
                          <Badge variant="outline">Ne</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trade.revengeTrade ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/10">
                            Ano
                          </Badge>
                        ) : (
                          <Badge variant="outline">Ne</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {trade.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nejčastější tagy</CardTitle>
              <CardDescription>Přehled nejčastěji používaných tagů</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tagStats.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {tagStats.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} obchodů`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tag</TableHead>
                        <TableHead>Počet</TableHead>
                        <TableHead>Win Rate</TableHead>
                        <TableHead>Průměrný výsledek</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tagStats.slice(0, 5).map((stat) => (
                        <TableRow key={stat.tag}>
                          <TableCell>
                            <Badge variant="outline">{stat.tag}</Badge>
                          </TableCell>
                          <TableCell>{stat.count}</TableCell>
                          <TableCell>{stat.winRate}%</TableCell>
                          <TableCell className={stat.avgResult >= 0 ? "text-green-500" : "text-red-500"}>
                            ${stat.avgResult}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analýza obchodního chování</CardTitle>
              <CardDescription>Vizualizace vašeho obchodního chování v čase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={behaviorChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="value" name="Procento obchodů" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Frekvence tagů</CardTitle>
                <CardDescription>Jak často se vyskytují jednotlivé tagy</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagFrequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} obchodů`} />
                    <Bar dataKey="count" name="Počet obchodů" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Výkonnost podle tagů</CardTitle>
                <CardDescription>Průměrný výsledek obchodů podle tagů</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="avgResult" name="Průměrný výsledek" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Klíčové poznatky</CardTitle>
              <CardDescription>Automaticky zjištěné vzorce ve vašem obchodním chování</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Váhání vás stojí peníze</AlertTitle>
                <AlertDescription>
                  Když vám ujel obchod kvůli váhání 3× za týden, vaše mentální skóre kleslo o 15%. Pracujte na
                  rozhodnosti a důvěře ve svůj plán.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Obchody dle plánu mají 2.3× lepší výsledky</AlertTitle>
                <AlertDescription>
                  Obchody, které odpovídaly vašemu plánu, mají výrazně lepší výsledky než ty, které se od plánu
                  odchýlily. Držte se svého plánu!
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Revenge obchody jsou ztrátové v 78% případů</AlertTitle>
                <AlertDescription>
                  Obchody zadané ze msty po předchozí ztrátě jsou ztrátové v 78% případů. Když zaznamenáte ztrátu,
                  udělejte si přestávku.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Brzy vystoupeno = ztracené zisky</AlertTitle>
                <AlertDescription>
                  Obchody s tagem "Brzy vystoupeno" mají průměrný zisk $120, zatímco podobné obchody bez předčasného
                  výstupu mají průměrný zisk $320.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analýza chování MindTrader AI</CardTitle>
              <CardDescription>Přehled vašich emocionálních reakcí a obchodních akcí.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Emoce</TableHead>
                    <TableHead>Akce</TableHead>
                    <TableHead>Výsledek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {behaviorData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.emotion}</TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell>
                        <Badge variant={entry.outcome === "Pozitivní" ? "default" : "destructive"}>
                          {entry.outcome}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
