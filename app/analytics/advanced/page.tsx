"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Target, Activity, BarChart3, PieChart, Download, RefreshCw, Sparkles } from "lucide-react"
import { AdvancedPerformanceMetrics } from "@/components/advanced-performance-metrics"
import { TradeBreakdownAnalysis } from "@/components/trade-breakdown-analysis"
import { RiskManagementAnalyzer } from "@/components/risk-management-analyzer"
import { TradingPatternsDetector } from "@/components/trading-patterns-detector"
import { PsychologicalMetricsTracker } from "@/components/psychological-metrics-tracker"
import { MoodPerformanceCorrelation } from "@/components/mood-performance-correlation"
import { TradingConsistencyChart } from "@/components/trading-consistency-chart"
import { EmotionalPatterns } from "@/components/emotional-patterns"

export default function AdvancedAnalyticsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              Advanced Analytics
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </h1>
            <p className="text-gray-400 mt-2">Pokročilé AI analýzy s hlubokými insights do vašeho tradingu</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh AI
            </Button>
            <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* AI Insights Banner */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">AI Trading Insights</h3>
                <p className="text-gray-300">
                  Naše AI analyzovala vaše trading vzory a identifikovala klíčové oblasti pro zlepšení. Aktuální
                  confidence score: <span className="text-green-400 font-semibold">87%</span>
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                <Zap className="w-4 h-4 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 grid grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="psychology" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Psychology
            </TabsTrigger>
            <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-600">
              <PieChart className="w-4 h-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="correlation" className="data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              Correlation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvancedPerformanceMetrics />
              <TradeBreakdownAnalysis />
            </div>
            <TradingConsistencyChart />
          </TabsContent>

          <TabsContent value="psychology" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PsychologicalMetricsTracker />
              <EmotionalPatterns />
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <TradingPatternsDetector />
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <RiskManagementAnalyzer />
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6">
            <MoodPerformanceCorrelation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
