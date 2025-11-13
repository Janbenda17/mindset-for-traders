"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertTriangle, Target, Award, RefreshCw, Loader2 } from "lucide-react"
import { useAIInsights } from "@/contexts/ai-insights-context"

export function AIInsightsCard() {
  const { insights, isLoading, lastGenerated, generateInsights } = useAIInsights()

  useEffect(() => {
    // Auto-generate insights on mount if not generated recently
    if (!lastGenerated || Date.now() - lastGenerated.getTime() > 24 * 60 * 60 * 1000) {
      generateInsights()
    }
  }, [lastGenerated, generateInsights])

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">AI Insights</CardTitle>
          </div>
          <Button
            onClick={() => generateInsights()}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className="text-purple-400 hover:text-purple-300"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-slate-400">AI-powered analysis of your trading psychology</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : insights ? (
          <>
            {/* Key Insights */}
            {insights.keyInsights && insights.keyInsights.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h3 className="font-semibold text-white">Key Insights</h3>
                </div>
                <ul className="space-y-2">
                  {insights.keyInsights.slice(0, 3).map((insight, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predictions */}
            {insights.predictions && insights.predictions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <h3 className="font-semibold text-white">Predictions</h3>
                </div>
                <ul className="space-y-2">
                  {insights.predictions.slice(0, 2).map((prediction, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{prediction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  <h3 className="font-semibold text-white">Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {insights.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {insights.riskFactors && insights.riskFactors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <h3 className="font-semibold text-white">Risk Factors</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.riskFactors.slice(0, 3).map((risk, i) => (
                    <Badge key={i} variant="outline" className="border-yellow-500/30 text-yellow-300">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {insights.strengths && insights.strengths.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Strengths</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.strengths.slice(0, 3).map((strength, i) => (
                    <Badge key={i} variant="outline" className="border-emerald-500/30 text-emerald-300">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {lastGenerated && (
              <p className="text-xs text-slate-500 text-center pt-2">Last updated: {lastGenerated.toLocaleString()}</p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No insights generated yet</p>
            <Button onClick={() => generateInsights()} className="bg-purple-600 hover:bg-purple-700">
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
