"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertTriangle, Target, Award, Brain, Calendar, Loader2 } from "lucide-react"
import { useAIInsights } from "@/contexts/ai-insights-context"

export default function AIInsightsPage() {
  const { insights, isLoading, lastGenerated, generateInsights } = useAIInsights()
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly")

  const handleGenerate = () => {
    generateInsights(selectedPeriod)
  }

  return (
    <div className="min-h-screen bg-transparent pt-20">
      <div className="max-w-7xl p-6 space-y-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="h-10 w-10 text-purple-400" />
              AI Insights Engine
            </h1>
            <p className="text-gray-400">Predictive analysis powered by advanced AI</p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
              <TabsList className="bg-slate-800">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleGenerate} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-4" />
              <p className="text-white font-semibold mb-2">Analyzing your trading data...</p>
              <p className="text-slate-400 text-sm">This may take a few moments</p>
            </CardContent>
          </Card>
        ) : insights ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-white">Key Insights</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Important patterns discovered in your data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.keyInsights?.map((insight, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                    >
                      <span className="text-purple-400 font-bold">{i + 1}.</span>
                      <span className="text-slate-200">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Predictions */}
            <Card className="bg-slate-900/50 border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white">Predictions</CardTitle>
                </div>
                <CardDescription className="text-slate-400">What to expect based on current trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.predictions?.map((prediction, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                    >
                      <TrendingUp className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200">{prediction}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-900/50 border-green-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-white">Recommendations</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Actionable steps to improve your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.recommendations?.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400 font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-slate-200">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <CardTitle className="text-white">Risk Factors</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Potential issues to watch out for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.riskFactors?.map((risk, i) => (
                    <div key={i} className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="text-slate-200">{risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card className="bg-slate-900/50 border-emerald-500/30 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" />
                  <CardTitle className="text-white">Your Strengths</CardTitle>
                </div>
                <CardDescription className="text-slate-400">What you're doing well - keep it up!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {insights.strengths?.map((strength, i) => (
                    <Badge
                      key={i}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-sm"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Brain className="h-16 w-16 text-purple-400 mb-4" />
              <p className="text-white font-semibold mb-2">No insights generated yet</p>
              <p className="text-slate-400 text-sm mb-6">Click "Generate Insights" to analyze your trading data</p>
              <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </Button>
            </CardContent>
          </Card>
        )}

        {lastGenerated && (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Last updated: {lastGenerated.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
