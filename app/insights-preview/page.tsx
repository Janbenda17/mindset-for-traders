'use client'

import { useState } from 'react'
import { AITradingInsightsEnhanced } from '@/components/ai-trading-insights-enhanced'
import { sampleInsights, criticalInsights, perfectMorningInsights } from '@/lib/sample-insights'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InsightsPreviewPage() {
  const [currentInsights, setCurrentInsights] = useState(sampleInsights)
  const [loading, setLoading] = useState(false)

  const handleLoadMixed = () => {
    setLoading(true)
    setTimeout(() => {
      setCurrentInsights(sampleInsights)
      setLoading(false)
    }, 500)
  }

  const handleLoadCritical = () => {
    setLoading(true)
    setTimeout(() => {
      setCurrentInsights(criticalInsights)
      setLoading(false)
    }, 500)
  }

  const handleLoadPerfect = () => {
    setLoading(true)
    setTimeout(() => {
      setCurrentInsights(perfectMorningInsights)
      setLoading(false)
    }, 500)
  }

  const handleActionClick = (insight: any) => {
    console.log('Action clicked:', insight.id, insight.actionText)
    alert(`Action: ${insight.actionText}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white">Enhanced AI Trading Insights Preview</h1>
          <p className="text-gray-400">
            Testovací stránka pro zobrazení různých insight scenářů
          </p>
        </div>

        {/* Control Panel */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Demo Controls</CardTitle>
            <CardDescription>Vyberte scénář pro zobrazení</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleLoadMixed} variant="outline" className="bg-blue-500/20 border-blue-500">
              Mixed Scenario (Default)
            </Button>
            <Button onClick={handleLoadCritical} variant="outline" className="bg-red-500/20 border-red-500">
              Critical Alerts
            </Button>
            <Button onClick={handleLoadPerfect} variant="outline" className="bg-green-500/20 border-green-500">
              Perfect Morning
            </Button>

            <div className="flex-1 flex items-center justify-end">
              <span className="text-sm text-gray-400">
                {loading ? 'Loading...' : `${currentInsights.length} insights loaded`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Insights Display */}
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-400">
                  {currentInsights.filter((i) => i.priority === 'critical').length}
                </div>
                <div className="text-xs text-red-300">Critical</div>
              </CardContent>
            </Card>

            <Card className="bg-orange-500/10 border-orange-500/30">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-400">
                  {currentInsights.filter((i) => i.priority === 'high').length}
                </div>
                <div className="text-xs text-orange-300">High</div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-400">
                  {currentInsights.filter((i) => i.priority === 'medium').length}
                </div>
                <div className="text-xs text-yellow-300">Medium</div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-400">
                  {currentInsights.filter((i) => i.priority === 'low').length}
                </div>
                <div className="text-xs text-green-300">Low</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Component */}
          <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <AITradingInsightsEnhanced
              insights={currentInsights}
              loading={loading}
              onActionClick={handleActionClick}
            />
          </div>
        </div>

        {/* Info Panel */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">📚 Component Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <div>
              ✅ <strong>Readiness Score</strong> - Visual progress bar s semaforovým systémem
            </div>
            <div>
              ✅ <strong>Critical Alerts</strong> - Zvýrazněné kritické upozornění na začátku
            </div>
            <div>
              ✅ <strong>Tabbed Interface</strong> - Kategorizace insights pro lepší přehled
            </div>
            <div>
              ✅ <strong>Priority System</strong> - Čtyři úrovně priority s barvami
            </div>
            <div>
              ✅ <strong>Action Buttons</strong> - Interaktivní tlačítka pro actionable insights
            </div>
            <div>
              ✅ <strong>Summary Stats</strong> - Počty insights v jednotlivých prioritách
            </div>
            <div>
              ✅ <strong>Responsive Design</strong> - Mobile-first, works on all devices
            </div>
            <div>
              ✅ <strong>Dark Mode Ready</strong> - Plná podpora pro dark theme
            </div>
          </CardContent>
        </Card>

        {/* JSON Data */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">📊 Insights Data Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 p-4 rounded text-xs text-green-400 overflow-x-auto max-h-64">
              {JSON.stringify(currentInsights[0], null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
