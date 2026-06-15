import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { grok } from '@ai-sdk/grok'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Fail log generate API called')
    
    // Demo fail logs - ve skutečné aplikaci by se načítaly z databáze z MT4 trades
    const demoFailLogs = [
      {
        symbol: 'EURUSD',
        entry: 1.0850,
        exit: 1.0820,
        loss: 150
      },
      {
        symbol: 'GBPUSD',
        entry: 1.2650,
        exit: 1.2600,
        loss: 250
      }
    ]

    const failLogsText = demoFailLogs.map(t => 
      `${t.symbol}: Entry ${t.entry} → Exit ${t.exit}, Loss: $${t.loss}`
    ).join('\n')

    const prompt = `Analyze these failing trades and generate AI-powered insights in Czech:

Today's Losing Trades:
${failLogsText}

For each trade, provide:
1. Root cause (category)
2. What to learn from this
3. How to prevent it next time

Respond ONLY with valid JSON (no markdown):
{
  "logs": [
    {
      "title": "Trade title with symbol and loss",
      "rootCause": "Category (e.g., poor entry timing, risk management failure)",
      "lessonLearned": "What this teaches us",
      "actionPlan": "Specific action to prevent this"
    }
  ]
}`

    console.log('[v0] Calling Grok AI for fail log analysis...')

    const result = await generateText({
      model: grok('grok-2-1212'),
      prompt
    })

    console.log('[v0] AI response received:', result.text.substring(0, 100))

    let parsed
    try {
      parsed = JSON.parse(result.text)
    } catch (e) {
      console.log('[v0] First JSON parse failed, trying regex extraction')
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    }

    if (!parsed || !parsed.logs) {
      throw new Error('Failed to parse AI response')
    }

    const today = new Date().toISOString().split('T')[0]
    const logs = parsed.logs.map((log: any, i: number) => ({
      id: `fail-${Date.now()}-${i}`,
      date: today,
      title: log.title || `Trade neúspěšný #${i + 1}`,
      rootCause: log.rootCause || 'Neznámá příčina',
      actionPlan: log.actionPlan || 'Vylepšit analýzu',
      lessonLearned: log.lessonLearned || 'Zlepšit disciplínu',
      trade: demoFailLogs[i],
      aiGenerated: true
    }))

    console.log('[v0] Fail logs generated successfully')

    return NextResponse.json({
      success: true,
      logs
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Error generating fail logs:', errorMsg, error)
    return NextResponse.json(
      { 
        success: false,
        error: errorMsg,
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    )
  }
}
