"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
  Heart,
  ArrowRight,
  Sparkles,
  BarChart3,
  Download,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { cn } from "@/lib/utils"

// Simulovaná AI analýza dat
function generateAIAnalysis() {
  const days = 30
  const performanceData = []
  const moodData = []

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    performanceData.push({
      date: date.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" }),
      pnl: Math.round((Math.random() - 0.4) * 500),
      winRate: Math.round(40 + Math.random() * 40),
    })

    moodData.push({
      date: date.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" }),
      mood: Math.round(50 + Math.random() * 40),
      discipline: Math.round(50 + Math.random() * 40),
      confidence: Math.round(50 + Math.random() * 40),
    })
  }

  const emotionalPatterns = [
    { name: "FOMO", count: Math.round(Math.random() * 15), impact: -120, color: "#ef4444" },
    { name: "Revenge Trading", count: Math.round(Math.random() * 10), impact: -200, color: "#dc2626" },
    { name: "Overconfidence", count: Math.round(Math.random() * 12), impact: -80, color: "#f59e0b" },
    { name: "Fear", count: Math.round(Math.random() * 8), impact: -60, color: "#eab308" },
  ]

  const correlations = [
    {
      factor: "Spánek (>7h)",
      impact: "+23%",
      description: "Výrazně lepší výkon po kvalitním spánku",
      positive: true,
    },
    {
      factor: "Pondělí",
      impact: "-15%",
      description: "Horší výsledky na začátku týdne",
      positive: false,
    },
    {
      factor: "Ranní obchody",
      impact: "+18%",
      description: "Vyšší win rate v ranních hodinách",
      positive: true,
    },
    {
      factor: "Po ztrátě",
      impact: "-31%",
      description: "Revenge trading po předchozí ztrátě",
      positive: false,
    },
  ]

  const actionPlan = [
    {
      priority: "high",
      title: "Eliminuj revenge trading",
      description: "Po ztrátě si dej 30min pauzu. Tento pattern tě stojí -31% výkonu.",
      impact: "Potenciální zlepšení: +$1,200/měsíc",
    },
    {
      priority: "high",
      title: "Optimalizuj spánkový režim",
      description: "Cíl: min. 7h spánku. Tvé data ukazují +23% lepší výkon.",
      impact: "Očekávané zlepšení: +$800/měsíc",
    },
    {
      priority: "medium",
      title: "Přesuň obchody na ráno",
      description: "Tvoje win rate je o 18% vyšší v ranních hodinách (6-10h).",
      impact: "Potenciální nárůst: +$500/měsíc",
    },
    {
      priority: "medium",
      title: "Přehodnoť pondělní strategii",
      description: "Pondělky mají -15% horší výsledky. Zvol opatrnější approach.",
      impact: "Možné ušetření: +$300/měsíc",
    },
    {
      priority: "low",
      title: "Denní psychologický check-in",
      description: "5min ranní rutina pro mentální přípravu zvyšuje disciplínu o 12%.",
      impact: "Long-term benefit: lepší konzistence",
    },
  ]

  return {
    summary: {
      totalPnL: Math.round((Math.random() - 0.3) * 5000),
      avgWinRate: Math.round(45 + Math.random() * 20),
      trades: Math.round(80 + Math.random() * 40),
      bestDay: "Středa",
      worstDay: "Pondělí",
      emotionalScore: Math.round(60 + Math.random() * 25),
      disciplineScore: Math.round(65 + Math.random() * 20),
    },
    performanceData,
    moodData,
    emotionalPatterns,
    correlations,
    actionPlan,
  }
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "quarter">("month")
  const analysis = useMemo(() => generateAIAnalysis(), [])

  const priorityColors = {
    high: "bg-red-500/20 text-red-300 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              MindTrader Analytics
            </h1>
            <p className="text-gray-300 text-lg">AI analýza tvého trading chování a psychologie</p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-slate-600">
              {(["week", "month", "quarter"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    timeframe === period
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-slate-700",
                  )}
                >
                  {period === "week" ? "Týden" : period === "month" ? "Měsíc" : "Čtvrtletí"}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-slate-800/80 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700 hover:text-white"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* AI Badge - OPRAVENO */}
        <Card className="bg-slate-800/90 backdrop-blur-sm border-purple-400/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/30 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">AI Analýza vygenerována</p>
                <p className="text-gray-200">Založeno na {analysis.summary.trades} obchodech za poslední měsíc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 p-1">
            <TabsTrigger
              value="summary"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Sparkles className="w-4 h-4" />
              AI Summary
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <BarChart3 className="w-4 h-4" />
              Výkon
            </TabsTrigger>
            <TabsTrigger
              value="psychology"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Brain className="w-4 h-4" />
              Psychologie
            </TabsTrigger>
            <TabsTrigger
              value="correlations"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Activity className="w-4 h-4" />
              Korelace
            </TabsTrigger>
            <TabsTrigger
              value="action"
              className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Target className="w-4 h-4" />
              Akční plán
            </TabsTrigger>
          </TabsList>

          {/* AI SUMMARY TAB */}
          <TabsContent value="summary" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                className={cn(
                  "bg-slate-800/80 backdrop-blur-sm border",
                  analysis.summary.totalPnL > 0 ? "border-green-500/40" : "border-red-500/40",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-200 font-medium">Total P&L</p>
                    {analysis.summary.totalPnL > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      analysis.summary.totalPnL > 0 ? "text-green-400" : "text-red-400",
                    )}
                  >
                    ${Math.abs(analysis.summary.totalPnL)}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">{analysis.summary.trades} obchodů</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-200 font-medium">Win Rate</p>
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analysis.summary.avgWinRate}%</p>
                  <p className="text-gray-300 text-sm mt-1">Průměrná úspěšnost</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-200 font-medium">Emoční skóre</p>
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analysis.summary.emotionalScore}%</p>
                  <p className="text-gray-300 text-sm mt-1">Psychická stabilita</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-200 font-medium">Disciplína</p>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analysis.summary.disciplineScore}%</p>
                  <p className="text-gray-300 text-sm mt-1">Dodržování plánu</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  Klíčová zjištění AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold mb-1">Nejlepší den: {analysis.summary.bestDay}</p>
                    <p className="text-gray-200">
                      Tvůj win rate je nejvyšší uprostřed týdne. Zkus přesunout více obchodů na tento den.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold mb-1">Největší problém: {analysis.summary.worstDay}</p>
                    <p className="text-gray-200">
                      Výrazně horší výsledky na začátku týdne. Možná potřebuješ změnit ranní rutinu nebo trading
                      strategii.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold mb-1">Psychologický pattern</p>
                    <p className="text-gray-200">
                      Tvá disciplína klesá po sérii ztrát. Doporučuji implementovat pravidlo "po 2 ztrátách = konec
                      dne".
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VÝKON TAB */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">P&L Vývoj</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Line type="monotone" dataKey="pnl" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Win Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PSYCHOLOGIE TAB */}
          <TabsContent value="psychology" className="space-y-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Emoční metríky</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysis.moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                    <Line type="monotone" dataKey="mood" stroke="#f472b6" name="Nálada" strokeWidth={2} />
                    <Line type="monotone" dataKey="discipline" stroke="#8b5cf6" name="Disciplína" strokeWidth={2} />
                    <Line type="monotone" dataKey="confidence" stroke="#3b82f6" name="Sebevědomí" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Emoční patterny</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.emotionalPatterns.map((pattern) => (
                    <div
                      key={pattern.name}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pattern.color }} />
                        <div>
                          <p className="text-white font-medium">{pattern.name}</p>
                          <p className="text-gray-300 text-sm">{pattern.count} případů</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-semibold">${pattern.impact}</p>
                        <p className="text-gray-300 text-sm">Celkový dopad</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KORELACE TAB */}
          <TabsContent value="correlations" className="space-y-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Faktory ovlivňující výkon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.correlations.map((corr, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border-l-4",
                        corr.positive ? "bg-green-500/10 border-green-500" : "bg-red-500/10 border-red-500",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-semibold">{corr.factor}</p>
                            <Badge
                              className={cn(
                                "text-xs",
                                corr.positive
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30",
                              )}
                            >
                              {corr.impact}
                            </Badge>
                          </div>
                          <p className="text-gray-200">{corr.description}</p>
                        </div>
                        {corr.positive ? (
                          <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AKČNÍ PLÁN TAB */}
          <TabsContent value="action" className="space-y-6">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-400" />
                  Personalizovaný akční plán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.actionPlan.map((action, index) => (
                    <Card
                      key={index}
                      className={cn(
                        "bg-slate-700/50 border",
                        action.priority === "high" && "border-red-500/40",
                        action.priority === "medium" && "border-yellow-500/40",
                        action.priority === "low" && "border-blue-500/40",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <Badge className={priorityColors[action.priority]}>
                              {action.priority === "high" && "Vysoká priorita"}
                              {action.priority === "medium" && "Střední priorita"}
                              {action.priority === "low" && "Nízká priorita"}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2">{action.title}</h3>
                            <p className="text-gray-200 mb-3">{action.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-300 font-medium">{action.impact}</span>
                            </div>
                          </div>
                          <Button size="sm" className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Celkový potenciál - OPRAVENO */}
            <Card className="bg-slate-800/90 backdrop-blur-sm border-purple-400/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/30 rounded-lg">
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg mb-1">Celkový potenciál zlepšení</p>
                    <p className="text-gray-200">Implementací těchto změn můžeš zvýšit měsíční profit o cca $2,800</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
