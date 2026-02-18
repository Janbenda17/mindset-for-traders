'use client'

import { useState, useCallback } from 'react'
import { TradeInsight } from '@/lib/insight-engine'
import { useToast } from '@/components/ui/use-toast'

export function useMorningInsights() {
  const [insights, setInsights] = useState<TradeInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const { toast } = useToast()

  const generateInsights = useCallback(async (morningCheckData: any) => {
    setInsightsLoading(true)
    try {
      console.log('[v0] Generating morning insights...', morningCheckData)

      const response = await fetch('/api/ai-insights/morning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          morningCheckData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate insights')
      }

      const data = await response.json()
      console.log('[v0] Generated insights:', data.insights)

      setInsights(data.insights || [])

      toast({
        title: '✅ AI Insights Generated',
        description: `Generated ${data.insights?.length || 0} personalized trading insights`,
        duration: 3000,
      })

      return data.insights
    } catch (error) {
      console.error('[v0] Error generating insights:', error)
      toast({
        title: '⚠️ Insights Error',
        description: 'Could not generate AI insights, using fallback',
        variant: 'destructive',
      })
      return []
    } finally {
      setInsightsLoading(false)
    }
  }, [toast])

  const handleActionClick = useCallback((insight: TradeInsight) => {
    console.log('[v0] Action clicked for insight:', insight.id, insight.actionText)

    // Depending on action text, perform different actions
    switch (insight.id) {
      case 'sleep_low':
      case 'energy_low':
      case 'stress_high':
        toast({
          title: '💡 Tip',
          description: insight.actionText,
          duration: 5000,
        })
        break
      case 'low_readiness':
        console.log('[v0] Switching to demo mode')
        break
      case 'revenge_trading':
        toast({
          title: '⚠️ Disciplína Aktivovaná',
          description: 'Zavedl si striktní kontrolu pro prevenci revenge trading',
        })
        break
      default:
        toast({
          title: '📌 Akce',
          description: insight.actionText,
        })
    }
  }, [toast])

  return {
    insights,
    insightsLoading,
    generateInsights,
    handleActionClick,
  }
}
