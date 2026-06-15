import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { grok } from '@ai-sdk/grok'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Goals generate API called')
    
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const monthEnd = new Date(today)
    monthEnd.setMonth(today.getMonth() + 1)
    monthEnd.setDate(0)

    const prompt = `You are a professional trading psychology coach. Generate ONE realistic and specific trading goal for the current week and ONE for the current month. 

    Respond ONLY with valid JSON (no markdown, no extra text):
    {
      "weeklyGoal": {
        "goal": "specific goal (max 100 chars)",
        "milestones": ["milestone 1", "milestone 2", "milestone 3"],
        "startDate": "${weekStart.toISOString().split('T')[0]}",
        "endDate": "${weekEnd.toISOString().split('T')[0]}"
      },
      "monthlyGoal": {
        "goal": "specific goal (max 100 chars)",
        "milestones": ["milestone 1", "milestone 2", "milestone 3", "milestone 4"],
        "startDate": "${today.toISOString().split('T')[0]}",
        "endDate": "${monthEnd.toISOString().split('T')[0]}"
      }
    }
    
    Make goals SMART and focused on trading psychology, discipline, or profit targets. Goals should be in Czech language.`

    console.log('[v0] Calling Grok AI for goal generation...')
    
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

    if (!parsed) {
      throw new Error('Failed to parse AI response')
    }

    const goals = [
      {
        id: `weekly-${Date.now()}`,
        period: 'weekly',
        goal: parsed.weeklyGoal.goal,
        startDate: parsed.weeklyGoal.startDate,
        endDate: parsed.weeklyGoal.endDate,
        milestones: parsed.weeklyGoal.milestones,
        metrics: {},
        aiGenerated: true,
        createdAt: new Date().toISOString()
      },
      {
        id: `monthly-${Date.now()}`,
        period: 'monthly',
        goal: parsed.monthlyGoal.goal,
        startDate: parsed.monthlyGoal.startDate,
        endDate: parsed.monthlyGoal.endDate,
        milestones: parsed.monthlyGoal.milestones,
        metrics: {},
        aiGenerated: true,
        createdAt: new Date().toISOString()
      }
    ]

    console.log('[v0] Goals generated successfully')

    return NextResponse.json({
      success: true,
      goals
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Error generating goals:', errorMsg, error)
    
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
