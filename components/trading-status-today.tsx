'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { useData } from '@/contexts/data-context'
import { generateDemoDailyTrackerData } from '@/data/demo-daily-tracker'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react'
import { format, subDays } from 'date-fns'

export function TradingStatusToday() {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const { isLiveMode } = useData()
  const [todayData, setTodayData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const txt = {
    tradingStatusToday: isEn ? 'Your Trading Status Today' : 'Tvůj Trading Status Dnes',
    subtitle: isEn 
      ? 'Your preparation determines decision quality. AI analyzes your psychological state and recommends optimal trading windows or when to rest.'
      : 'Tvá příprava určuje kvalitu rozhodnutí. AI analyzuje tvůj psychologický stav a doporučuje optimální trading okna nebo kdy si odpočinout.',
    morningRoutineNotCompleted: isEn ? 'Morning Routine Not Completed' : 'Morning Routine Není Hotova',
    completeForAnalysis: isEn 
      ? 'Complete your morning routine for detailed AI analysis of your psychological state and trading readiness.'
      : 'Hotovo tvoj morning routine pro detailní AI analýzu tvého psychologického stavu a obchodní připravenosti.',
    startMorningRoutine: isEn ? 'Start Morning Routine' : 'Zahájit Morning Routine',
    readinessScore: isEn ? 'Readiness Score' : 'Skóre Připravenosti',
    keyInsights: isEn ? 'Key Insights' : 'Klíčové Poznatky',
    recommendations: isEn ? 'Recommendations' : 'Doporučení',
    strengths: isEn ? 'Your Strengths' : 'Tvé Silné Stránky',
    riskFactors: isEn ? 'Risk Factors to Watch' : 'Rizikové Faktory',
    detailedAnalysis: isEn ? 'Detailed Analysis' : 'Detailní Analýza',
    viewFullReport: isEn ? 'View Full Report' : 'Zobrazit Plnou Zprávu',
  }

  useEffect(() => {
    const loadTodayData = async () => {
      try {
        setLoading(true)
        
        if (!isLiveMode) {
          // Load demo data for today
          const allData = generateDemoDailyTrackerData()
          const today = allData.find(d => d.date === format(new Date(), 'yyyy-MM-dd'))
          
          if (today) {
            setTodayData(today)
          }
        }
      } catch (error) {
        console.error('[TradingStatusToday] Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTodayData()
  }, [isLiveMode])

  if (loading) {
    return null
  }

  // Show empty state if no routine completed
  if (!todayData?.insights) {
    return (
      <Card className="border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-800/30 mb-8">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            {txt.tradingStatusToday}
          </CardTitle>
          <CardDescription className="text-gray-400">{txt.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-4 inline-block">
              {txt.morningRoutineNotCompleted}
            </Badge>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              {txt.completeForAnalysis}
            </p>
            <Link href="/morning-check">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                {txt.startMorningRoutine}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const insights = todayData.insights
  const readinessScore = todayData.morningCheck?.score || 0
  const scoreColor = readinessScore >= 75 ? 'text-green-400' : readinessScore >= 65 ? 'text-yellow-400' : 'text-red-400'
  const scoreBgColor = readinessScore >= 75 ? 'bg-green-500/10' : readinessScore >= 65 ? 'bg-yellow-500/10' : 'bg-red-500/10'

  return (
    <Card className="border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-800/30 mb-8">
      <CardHeader className="border-b border-slate-700/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              {txt.tradingStatusToday}
            </CardTitle>
            <CardDescription className="text-gray-400">{txt.subtitle}</CardDescription>
          </div>
          <Link href="/daily-tracker">
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              {txt.viewFullReport}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Readiness Score */}
        <div className={`${scoreBgColor} border border-slate-700 rounded-lg p-4 flex items-center justify-between`}>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{txt.readinessScore}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${scoreColor}`}>{readinessScore}</span>
              <span className="text-gray-400 text-sm">/100</span>
            </div>
          </div>
          <div className="h-20 w-20 rounded-full border-4 border-slate-700 flex items-center justify-center">
            <div className={`h-16 w-16 rounded-full ${scoreBgColor} flex items-center justify-center border-2 ${scoreColor} border-current`}>
              <span className={`text-xl font-bold ${scoreColor}`}>{readinessScore}%</span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            {txt.keyInsights}
          </h3>
          <ul className="space-y-2">
            {insights.keyInsights?.slice(0, 2).map((insight: string, idx: number) => (
              <li key={idx} className="text-gray-300 text-sm flex gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {txt.recommendations}
          </h3>
          <ul className="space-y-2">
            {insights.recommendations?.slice(0, 2).map((rec: string, idx: number) => (
              <li key={idx} className="text-gray-300 text-sm flex gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Factors and Strengths */}
        <div className="grid grid-cols-2 gap-4">
          {insights.riskFactors?.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
              <p className="text-red-400 text-xs font-semibold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {txt.riskFactors}
              </p>
              <ul className="space-y-1">
                {insights.riskFactors.slice(0, 2).map((risk: string, idx: number) => (
                  <li key={idx} className="text-gray-300 text-xs">• {risk}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.strengths?.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
              <p className="text-green-400 text-xs font-semibold mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {txt.strengths}
              </p>
              <ul className="space-y-1">
                {insights.strengths.slice(0, 2).map((strength: string, idx: number) => (
                  <li key={idx} className="text-gray-300 text-xs">✓ {strength}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link href="/daily-tracker" className="block">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
            {txt.detailedAnalysis}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
