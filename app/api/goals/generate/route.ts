import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { grok } from '@ai-sdk/grok'

export async function POST(request: NextRequest) {
  try {
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

    const result = await generateText({
      model: grok('grok-2-1212'),
      prompt
    })

    let parsed
    try {
      parsed = JSON.parse(result.text)
    } catch (e) {
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

    return NextResponse.json({
      success: true,
      goals
    })
  } catch (error) {
    console.error('[v0] Error generating goals:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
