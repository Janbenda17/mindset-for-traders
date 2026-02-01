"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertOctagon, Brain, Wind, Eye, TrendingUp } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
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
  { day: "Po", mental: 85 || 0, pnl: 280 || 0, cumPnl: 280 || 0, size: 100 },
  { day: "Út", mental: 72 || 0, pnl: 150 || 0, cumPnl: 430 || 0, size: 100 },
  { day: "St", mental: 90 || 0, pnl: 420 || 0, cumPnl: 850 || 0, size: 100 },
  { day: "Čt", mental: 45 || 0, pnl: -200 || 0, cumPnl: 650 || 0, size: 100 },
  { day: "Pá", mental: 88 || 0, pnl: 320 || 0, cumPnl: 970 || 0, size: 100 },
  { day: "Po", mental: 65 || 0, pnl: 90 || 0, cumPnl: 1060 || 0, size: 100 },
  { day: "Út", mental: 95 || 0, pnl: 480 || 0, cumPnl: 1540 || 0, size: 100 },
  { day: "St", mental: 40 || 0, pnl: -180 || 0, cumPnl: 1360 || 0, size: 100 },
  { day: "Čt", mental: 80 || 0, pnl: 210 || 0, cumPnl: 1570 || 0, size: 100 },
  { day: "Pá", mental: 92 || 0, pnl: 390 || 0, cumPnl: 1960 || 0, size: 100 },
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
      <Card className={`${readinessBg} border-2 overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Brain className="w-32 h-32" />
        </div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  Psychological Readiness
                </h2>
                <p className="text-muted-foreground">Profesionální analýza před-obchodního stavu</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Focus</span>
                    <span className="text-xs font-bold">{focusScore}%</span>
                  </div>
                  <Progress value={focusScore} className="h-2" />
                </div>
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Calm</span>
                    <span className="text-xs font-bold">{calmScore}%</span>
                  </div>
                  <Progress value={calmScore} className="h-2" />
                </div>
                <div className="bg-background/50 p-3 rounded-lg border">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Bias Free</span>
                    <span className="text-xs font-bold">{biasScore}%</span>
                  </div>
                  <Progress value={biasScore} className="h-2" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-l pl-6 border-border/50">
              <div className="text-center">
                <div className="text-5xl font-black tracking-tighter mb-1">{readinessScore}</div>
                <Badge variant={readinessScore > 80 ? "default" : "secondary"}>READINESS SCORE</Badge>
              </div>
              <Button
                size="lg"
                className={`h-16 px-8 text-lg font-bold shadow-xl transition-all hover:scale-105 ${isTrading ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                onClick={() => setIsTrading(!isTrading)}
              >
                {isTrading ? "STOP TRADING" : "START SESSION"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mental Performance vs P&L Correlation</CardTitle>
            <CardDescription>
              Jasná vizualizace: Každý bod představuje jeden obchodní den. Vidíte přímou souvislost mezi stavem mysli a
              výsledkem.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[480px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="mental"
                  name="Mental Score"
                  unit="%"
                  domain={[0, 100]}
                  label={{ value: "Mental Score (%)", position: "bottom", offset: 0 }}
                />
                <YAxis
                  type="number"
                  dataKey="pnl"
                  name="P&L"
                  unit="$"
                  label={{ value: "Daily P&L ($)", angle: -90, position: "left" }}
                />
                <ZAxis type="number" range={[100, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-bold mb-1">{data.day}</p>
                          <p className="text-sm">
                            Mental Score: <span className="font-bold">{data.mental}%</span>
                          </p>
                          <p className={`text-sm ${data.pnl > 0 ? "text-green-500" : "text-red-500"}`}>
                            P&L:{" "}
                            <span className="font-bold">
                              {data.pnl > 0 ? "+" : ""}
                              {data.pnl}$
                            </span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Trading Days" data={mentalPnlData} fill="#8884d8">
                  {mentalPnlData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            <div className="mt-6 p-5 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Silná Korelace</p>
                    <p className="text-sm text-muted-foreground">
                      Data ukazují, že při Mental Score nad 80% máte 3x vyšší šanci na ziskový den.
                    </p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Průměrný P&L (High Focus)</p>
                  <p className="text-2xl font-black text-green-500">+$380</p>
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
              <CardDescription>Vaše silné a slabé stránky v jedné grafice.</CardDescription>
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
                    fillOpacity={0.5} // Ensure fill opacity is visible
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
