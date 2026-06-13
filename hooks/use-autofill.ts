import { useCallback, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getLosingTradesToday, generateFailLogSuggestions, saveFailLog, type FailLogSuggestion } from '@/lib/services/autofill-logs'
import { generateDailyIntentions, saveIntentions, type DailyIntention } from '@/lib/services/autofill-intentions'

export interface AutofillState {
  stage: 'idle' | 'analyzing' | 'generating' | 'complete'
  failLog?: FailLogSuggestion
  intentions?: DailyIntention
  error?: string
}

export function useAutofill() {
  const { user } = useAuth()
  const [state, setState] = useState<AutofillState>({ stage: 'idle' })

  const triggerAutofill = useCallback(
    async (morningCheckData: any) => {
      if (!user) {
        console.error('[v0] No user for autofill')
        return
      }

      try {
        setState({ stage: 'analyzing' })

        // Step 1: Fetch losing trades from broker
        const losingTrades = await getLosingTradesToday()

        // Step 2: Generate fail log suggestions
        const failLogSuggestion = await generateFailLogSuggestions(
          losingTrades,
          morningCheckData.emotionalState || 'neutral',
          morningCheckData.tradingIdentity
        )

        // Step 3: Generate daily intentions
        setState({ stage: 'generating' })
        const intentions = await generateDailyIntentions(
          user.id,
          morningCheckData.emotionalState || 'neutral',
          morningCheckData.tradingIdentity
        )

        // Save to database
        await Promise.all([
          saveFailLog(user.id, failLogSuggestion),
          saveIntentions(user.id, intentions)
        ])

        setState({
          stage: 'complete',
          failLog: failLogSuggestion,
          intentions
        })
      } catch (error) {
        console.error('[v0] Autofill error:', error)
        setState({
          stage: 'idle',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    },
    [user]
  )

  const reset = useCallback(() => {
    setState({ stage: 'idle' })
  }, [])

  return {
    ...state,
    triggerAutofill,
    reset
  }
}
