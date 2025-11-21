"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertOctagon, Play, Pause, Brain, Wind, Eye, TrendingUp } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  Bar,
} from "recharts"

const radarData = [
  { subject: "Disciplína", value: 85 || 0 },
  { subject: "Strategie", value: 92 || 0 },
  { subject: "Psychologie", value: 65 || 0 },
  { subject: "Risk Mgmt", value: 78 || 0 },
  { subject: "Zdraví", value: 70 || 0 },
  { subject: "Rutina", value: 88 || 0 },
]

const mentalPnlData = [
  { day: "Po", mental: 85 || 0, pnl: 280 || 0, cumPnl: 280 || 0 },
  { day: "Út", mental: 72 || 0, pnl: 150 || 0, cumPnl: 430 || 0 },
  { day: "St", mental: 90 || 0, pnl: 420 || 0, cumPnl: 850 || 0 },
  { day: "Čt", mental: 45 || 0, pnl: -200 || 0, cumPnl: 650 || 0 },
  { day: "Pá", mental: 88 || 0, pnl: 320 || 0, cumPnl: 970 || 0 },
  { day: "Po", mental: 65 || 0, pnl: 90 || 0, cumPnl: 1060 || 0 },
  { day: "Út", mental: 95 || 0, pnl: 480 || 0, cumPnl: 1540 || 0 },
  { day: "St", mental: 40 || 0, pnl: -180 || 0, cumPnl: 1360 || 0 },
  { day: "Čt", mental: 80 || 0, pnl: 210 || 0, cumPnl: 1570 || 0 },
  { day: "Pá", mental: 92 || 0, pnl: 390 || 0, cumPnl: 1960 || 0 },
]

export function MindTraderBehavior() {
  const [flowState, setFlowState] = useState([50])
  const [stressLevel, setStressLevel] = useState([30])
  const [isTrading, setIsTrading] = useState(false)

  const [biases, setBiases] = useState({
    fomo: false,
    revenge: false,
    gambler: false,
    confirmation: false,
    sunkCost: false,
  })

  const toggleBias = (bias: keyof typeof biases) => {
    setBiases((prev) => ({ ...prev, [bias]: !prev[bias] }))
  }

  const detectedBiasesCount = Object.values(biases).filter(Boolean).length
  const riskLevel = detectedBiasesCount > 2 ? "Vysoké" : detectedBiasesCount > 0 ? "Střední" : "Nízké"

  const readinessScore = Math.round(((flowState[0] || 0) + (100 - (stressLevel[0] || 0))) / 2) || 0
  const focusScore = flowState[0] || 0
  const calmScore = 100 - (stressLevel[0] || 0) || 0
  const biasScore = 100 - detectedBiasesCount * 20 || 0

  const readinessColor =
    readinessScore > 80 ? "text-green-500" : readinessScore > 50 ? "text-amber-500" : "text-red-500"
  const readinessBg =
    readinessScore > 80
      ? "bg-green-50 dark:bg-green-950/20 border-green-300"
      : readinessScore > 50
        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300"
        : "bg-red-50 dark:bg-red-950/20 border-red-300"

  return (
    <div className="space-y-6">
      <Card className={`${readinessBg} border-2`}>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* Left: Detailed breakdown */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Psychological Readiness</h2>
                  <p className="text-sm text-muted-foreground">Professional pre-trade mental state assessment</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Focus</p>
                    </div>
                    <span className="text-sm font-black text-purple-600">{focusScore}%</span>
                  </div>
                  <Progress value={focusScore} className="h-3" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {focusScore > 80 ? "🎯 Excellent" : focusScore > 50 ? "✓ Good" : "⚠ Poor"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Calm</p>
                    </div>
                    <span className="text-sm font-black text-blue-600">{calmScore}%</span>
                  </div>
                  <Progress value={calmScore} className="h-3" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {calmScore > 80 ? "😌 Relaxed" : calmScore > 50 ? "😐 Moderate" : "😰 Stressed"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bias Control</p>
                    </div>
                    <Badge
                      variant={
                        detectedBiasesCount > 2 ? "destructive" : detectedBiasesCount > 0 ? "secondary" : "default"
                      }
                      className="text-xs"
                    >
                      {detectedBiasesCount}
                    </Badge>
                  </div>
                  <Progress value={biasScore} className="h-3" />
                  <p className="text-xs text-muted-foreground font-medium">Risk: {riskLevel}</p>
                </div>
              </div>
            </div>

            {/* Right: Overall score and CTA */}
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:border-l lg:pl-8">
              <div className="text-center px-8 py-6 rounded-2xl border-2 border-primary/30 bg-background/60 shadow-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-bold">
                  Overall Readiness
                </div>
                <div className={`text-7xl font-black ${readinessColor} mb-3`}>{readinessScore}</div>
                <Badge
                  variant={readinessScore > 80 ? "default" : readinessScore > 50 ? "secondary" : "destructive"}
                  className="text-sm px-4 py-1"
                >
                  {readinessScore > 80 ? "✓ OPTIMAL" : readinessScore > 50 ? "⚠ CAUTION" : "✕ HIGH RISK"}
                </Badge>
              </div>

              <Button
                size="lg"
                variant={isTrading ? "destructive" : "default"}
                className="gap-3 min-w-[200px] h-20 text-lg font-bold"
                onClick={() => setIsTrading(!isTrading)}
              >
                {isTrading ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                {isTrading ? "End Session" : "Start Trading"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mental State & Trading Performance</CardTitle>
            <CardDescription>
              Jasná korelace: Vyšší mental score = Vyšší profit. Žádný zmatek, prostě vidět souvislost.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mentalPnlData}>
                <defs>
                  <linearGradient id="mentalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                  label={{ value: "Mental Score (%)", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `$${val}`}
                  label={{ value: "Daily P&L ($)", angle: 90, position: "insideRight", style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "2px solid #8b5cf6",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    padding: "16px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Mental Score") return [`${value || 0}%`, "🧠 Mental State"]
                    if (name === "Daily P&L") return [`$${value || 0}`, "💰 Daily P&L"]
                    return [value || 0, name]
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="mental"
                  name="Mental Score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#mentalGrad)"
                />
                <Bar yAxisId="right" dataKey="pnl" name="Daily P&L" radius={[4, 4, 0, 0]}>
                  {mentalPnlData.map((entry, index) => (
                    <rect key={`bar-${index}`} fill={(entry.pnl || 0) > 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-6 p-5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border-2 border-purple-300 dark:border-purple-700">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-7 h-7 text-purple-600 mt-1" />
                <div>
                  <p className="text-base font-bold text-purple-900 dark:text-purple-100 mb-2">
                    🔬 Correlation Coefficient: <span className="text-2xl">0.91</span>
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Velmi silná pozitivní korelace!</strong> Když je mental score nad 85, průměrný P&L je{" "}
                    <span className="text-green-600 font-bold">+$380</span>. Pod 50 je průměr{" "}
                    <span className="text-red-600 font-bold">-$190</span>. Závěr: Prioritizujte mentální přípravu před
                    každou seancí.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Psychologický Profil</CardTitle>
              <CardDescription>Vyplněný střed ukazuje vaše aktuální skóre v každé kategorii.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid strokeOpacity={0.3} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value || 0}%`, "Current Score"]}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={detectedBiasesCount > 2 ? "border-red-500/70 bg-red-50/60 dark:bg-red-950/20" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertOctagon className="w-5 h-5" />
                Cognitive Bias Detector
              </CardTitle>
              <CardDescription>
                Risk Level:{" "}
                <span
                  className={
                    detectedBiasesCount > 2
                      ? "text-red-600 font-bold"
                      : detectedBiasesCount > 0
                        ? "text-amber-600 font-bold"
                        : "text-green-600 font-bold"
                  }
                >
                  {riskLevel}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="fomo" className="cursor-pointer font-medium">
                  FOMO Trading
                </Label>
                <Switch id="fomo" checked={biases.fomo} onCheckedChange={() => toggleBias("fomo")} />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="revenge" className="cursor-pointer font-medium">
                  Revenge Trading
                </Label>
                <Switch id="revenge" checked={biases.revenge} onCheckedChange={() => toggleBias("revenge")} />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="gambler" className="cursor-pointer font-medium">
                  Gambler's Fallacy
                </Label>
                <Switch id="gambler" checked={biases.gambler} onCheckedChange={() => toggleBias("gambler")} />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label htmlFor="confirmation" className="cursor-pointer font-medium">
                  Confirmation Bias
                </Label>
                <Switch
                  id="confirmation"
                  checked={biases.confirmation}
                  onCheckedChange={() => toggleBias("confirmation")}
                />
              </div>

              {detectedBiasesCount > 0 && (
                <div className="mt-4 p-4 bg-background border-2 border-amber-500 dark:border-amber-600 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-amber-700 dark:text-amber-500 block mb-2 text-sm">
                        ⚠ Warning Detected
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {detectedBiasesCount} cognitive biases aktivních.
                        {detectedBiasesCount > 2
                          ? " SILNĚ DOPORUČUJEME ZASTAVIT TRADING."
                          : " Zvažte kratší pauzu před pokračováním."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Real-Time Zone Tracker
          </CardTitle>
          <CardDescription>
            Upravte svůj mentální stav v reálném čase. Používejte před a během tradingu pro optimální performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-6 h-6 text-purple-500" />
                <span className="font-bold text-lg">Focus Level</span>
                {flowState[0] > 80 && (
                  <Badge variant="default" className="bg-purple-600">
                    🎯 FLOW STATE
                  </Badge>
                )}
              </div>
              <div className="flex justify-between text-sm font-medium mb-3 px-1">
                <span className="text-muted-foreground">Rozptýlený</span>
                <span className="text-primary">Soustředěný</span>
                <span className="text-purple-600 font-bold">THE ZONE</span>
              </div>
              <Slider value={flowState} onValueChange={setFlowState} max={100} step={1} className="py-4" />
              <p className="text-sm text-muted-foreground">
                Aktuální: <span className="font-bold text-foreground text-lg">{flowState[0] || 0}%</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <Wind className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-lg">Stress Level</span>
                {(stressLevel[0] || 0) > 75 && <Badge variant="destructive">⚠️ TILT WARNING</Badge>}
              </div>
              <div className="flex justify-between text-sm font-medium mb-3 px-1">
                <span className="text-green-500">Klidný</span>
                <span className="text-amber-500">Napjatý</span>
                <span className="text-red-600 font-bold">TILT ZONE</span>
              </div>
              <Slider value={stressLevel} onValueChange={setStressLevel} max={100} step={1} className="py-4" />
              <p className="text-sm text-muted-foreground">
                Aktuální: <span className="font-bold text-foreground text-lg">{stressLevel[0] || 0}%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
