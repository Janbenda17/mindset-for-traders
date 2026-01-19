"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useLiveMode } from "@/contexts/live-mode-context"
import { useAuth } from "@/contexts/auth-context"
import { getDemoTrades, type DemoTrade } from "@/lib/demo/demo-trades"
import { useRouter, useParams } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ObchodDetailPage() {
  const { isLiveMode } = useLiveMode()
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [trade, setTrade] = useState<DemoTrade | null>(null)

  useEffect(() => {
    if (!isLiveMode && user && params.id) {
      const allTrades = getDemoTrades(user.id)
      const foundTrade = allTrades.find((t) => t.id === params.id)
      setTrade(foundTrade || null)
    }
  }, [isLiveMode, user, params.id])

  if (!trade) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-slate-400">Obchod nenalezen</p>
          <Button variant="outline" onClick={() => router.push("/obchod/historie")} className="mt-4">
            Zpět na historii
          </Button>
        </div>
      </div>
    )
  }

  const isWin = trade.pnl > 0
  const isBreakeven = trade.pnl === 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zpět
      </Button>

      {/* Header Summary */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{trade.pair}</h1>
                <Badge variant={trade.direction === "LONG" ? "default" : "destructive"} className="text-lg px-3 py-1">
                  {trade.direction}
                </Badge>
                {isWin ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : isBreakeven ? (
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(trade.created_at).toLocaleDateString("cs-CZ")} {trade.time}
                </span>
                <span>•</span>
                <span>{trade.session}</span>
                <span>•</span>
                <span>{trade.tradeType}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">P&L</div>
              <div
                className={cn(
                  "text-4xl font-bold",
                  isWin ? "text-emerald-400" : isBreakeven ? "text-slate-400" : "text-red-400",
                )}
              >
                {trade.pnl > 0 ? "+" : ""}${trade.pnl}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {trade.pips > 0 ? "+" : ""}
                {trade.pips} pips • RR {trade.rr}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Section */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Plán obchodu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Setup</div>
                  <div className="text-white font-medium">{trade.setup}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Timeframe</div>
                  <div className="text-white font-medium">{trade.timeframe}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Bias</div>
                  <div className="text-white font-medium">{trade.bias}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Session</div>
                  <div className="text-white font-medium">{trade.session}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Důvod vstupu</div>
                <div className="text-white bg-slate-700/50 p-3 rounded">{trade.entryReason}</div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Tržní podmínky</div>
                <div className="text-white bg-slate-700/50 p-3 rounded">{trade.marketConditions}</div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Section */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Exekuce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Entry</div>
                  <div className="text-white font-mono font-medium">{trade.entry}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Stop Loss</div>
                  <div className="text-red-400 font-mono font-medium">{trade.stopLoss}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Take Profit</div>
                  <div className="text-emerald-400 font-mono font-medium">{trade.takeProfit}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Exit</div>
                  <div className="text-white font-mono font-medium">{trade.exitPrice}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Velikost pozice</div>
                  <div className="text-white font-medium">{trade.positionSize} lots</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Risk %</div>
                  <div className="text-white font-medium">{trade.riskPercent}%</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Důvod exitu</div>
                <div className="text-white bg-slate-700/50 p-3 rounded">{trade.exitReason}</div>
              </div>
            </CardContent>
          </Card>

          {/* Psychology Section */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Psychologie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-2">Před obchodem</div>
                  <Badge variant="outline" className="w-full justify-center">
                    {trade.emotionBefore}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">Během obchodu</div>
                  <Badge variant="outline" className="w-full justify-center">
                    {trade.emotionDuring}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">Po obchodu</div>
                  <Badge variant="outline" className="w-full justify-center">
                    {trade.emotionAfter}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Confidence</span>
                    <span className="text-white font-medium">{trade.confidence}/10</span>
                  </div>
                  <Progress value={trade.confidence * 10} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Mood</span>
                    <span className="text-white font-medium">{trade.mood}/10</span>
                  </div>
                  <Progress value={trade.mood * 10} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Stress Level</span>
                    <span className="text-white font-medium">{trade.stressLevel}/10</span>
                  </div>
                  <Progress value={trade.stressLevel * 10} className="h-2 [&>div]:bg-red-400" />
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Poznámky</div>
                <div className="text-white bg-slate-700/50 p-3 rounded">{trade.notes || "—"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Outcome Analysis */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Analýza výsledku</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trade.whatWorked && (
                <div>
                  <div className="text-sm text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Co fungovalo
                  </div>
                  <div className="text-white bg-emerald-500/10 border border-emerald-500/30 p-3 rounded">
                    {trade.whatWorked}
                  </div>
                </div>
              )}

              {trade.whatDidntWork && (
                <div>
                  <div className="text-sm text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Co nefungovalo
                  </div>
                  <div className="text-white bg-red-500/10 border border-red-500/30 p-3 rounded">
                    {trade.whatDidntWork}
                  </div>
                </div>
              )}

              {trade.mistakes.length > 0 && (
                <div>
                  <div className="text-sm text-orange-400 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Chyby
                  </div>
                  <div className="space-y-2">
                    {trade.mistakes.map((mistake, i) => (
                      <div key={i} className="text-white bg-orange-500/10 border border-orange-500/30 p-2 rounded">
                        • {mistake}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Kontrola plánu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Dodržení plánu</span>
                {trade.followedPlan ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Předčasný exit</span>
                {trade.exitedEarly ? (
                  <CheckCircle className="w-5 h-5 text-orange-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Váhání</span>
                {trade.missedDueToHesitation ? (
                  <CheckCircle className="w-5 h-5 text-orange-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Revenge trade</span>
                {trade.revengeTrade ? (
                  <CheckCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Tagy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
