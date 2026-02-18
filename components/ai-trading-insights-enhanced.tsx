'use client'

import React, { useState } from 'react'
import { TradeInsight } from '@/lib/insight-engine'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AITradingInsightsEnhancedProps {
  insights: TradeInsight[]
  loading?: boolean
  onActionClick?: (insight: TradeInsight) => void
}

const priorityColors = {
  critical: 'border-red-500 bg-red-50 dark:bg-red-950',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
  medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  low: 'border-green-500 bg-green-50 dark:bg-green-950',
}

const categoryLabels = {
  morning: '🌅 Ranní příprava',
  performance: '📊 Výkon',
  risk: '⚠️ Risk management',
  psychology: '🧠 Psychologie',
  market: '📈 Market',
  checklist: '✅ Checklist',
}

export function AITradingInsightsEnhanced({
  insights,
  loading = false,
  onActionClick,
}: AITradingInsightsEnhancedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Calculate readiness score from insights
  const readinessScore = calculateReadinessScore(insights)

  // Filter insights by category
  const filteredInsights =
    activeCategory === 'all' ? insights : insights.filter((i) => i.category === activeCategory)

  // Group insights by category
  const groupedByCategory = insights.reduce(
    (acc, insight) => {
      if (!acc[insight.category]) {
        acc[insight.category] = []
      }
      acc[insight.category].push(insight)
      return acc
    },
    {} as Record<string, TradeInsight[]>
  )

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ delay: '0.2s' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ delay: '0.4s' }} />
            <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              AI generuje insights...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Readiness Score Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Trading Readiness Score</span>
            <span className="text-2xl font-bold text-blue-600">{readinessScore.toFixed(0)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={readinessScore} className="h-3" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getReadinessMessage(readinessScore)}
          </p>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {insights.some((i) => i.priority === 'critical') && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400">🚨 KRITICKÉ UPOZORNĚNÍ</h3>
          {insights
            .filter((i) => i.priority === 'critical')
            .map((insight) => (
              <InsightCard key={insight.id} insight={insight} onActionClick={onActionClick} />
            ))}
        </div>
      )}

      {/* Tabs for different categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1 lg:grid-cols-7">
          <TabsTrigger value="all" className="text-xs">
            Všechny
          </TabsTrigger>
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {items.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-3 mt-4">
          {filteredInsights.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Žádné insights v této kategorii
            </p>
          ) : (
            filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onActionClick={onActionClick}
                expanded={expandedId === insight.id}
                onExpandChange={(id) => setExpandedId(expandedId === id ? null : id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-sm">📋 Shrnutí</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {insights.filter((i) => i.priority === 'critical').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Kritické</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {insights.filter((i) => i.priority === 'high').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Vysoké</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {insights.filter((i) => i.priority === 'medium').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Střední</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter((i) => i.priority === 'low').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Nízké</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface InsightCardProps {
  insight: TradeInsight
  onActionClick?: (insight: TradeInsight) => void
  expanded?: boolean
  onExpandChange?: (id: string) => void
}

function InsightCard({ insight, onActionClick, expanded, onExpandChange }: InsightCardProps) {
  return (
    <Card
      className={`border-l-4 transition-all ${priorityColors[insight.priority]} cursor-pointer`}
      onClick={() => onExpandChange?.(insight.id)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{insight.icon}</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
              {insight.value && (
                <span className="ml-auto text-sm font-bold text-gray-700 dark:text-gray-300">
                  {insight.value}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{insight.description}</p>

            {/* Trend indicator */}
            {insight.trend && (
              <div className="mt-2 flex items-center space-x-1 text-xs">
                <span className={insight.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                  {insight.trend === 'up' ? '📈 Trend nahoru' : '📉 Trend dolů'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {insight.actionable && insight.actionText && (
          <Button
            size="sm"
            className="mt-3 w-full"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onActionClick?.(insight)
            }}
          >
            {insight.actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function calculateReadinessScore(insights: TradeInsight[]): number {
  // Calculate based on priorities
  let score = 100

  insights.forEach((insight) => {
    switch (insight.priority) {
      case 'critical':
        score -= 25
        break
      case 'high':
        score -= 10
        break
      case 'medium':
        score -= 5
        break
      default:
        break
    }
  })

  return Math.max(0, Math.min(100, score))
}

function getReadinessMessage(score: number): string {
  if (score >= 80) return '✅ Jsi připraven! Ideální podmínky pro trading.'
  if (score >= 60) return '🟡 Akceptabilní. Zvýšená opatrnost je doporučena.'
  if (score >= 40) return '🟠 Rizikové. Zvažte zkrácení nebo demo trading.'
  return '🔴 Není připraveno. Zvažte den mimo trading.'
}
