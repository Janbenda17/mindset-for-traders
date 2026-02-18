import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeInsights } from '@/lib/insight-engine'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = data.user.id
    const body = await request.json()
    const { morningCheckData } = body

    if (!morningCheckData) {
      return NextResponse.json(
        { error: 'Morning check data is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Morning Insights - Analyzing for user:', userId)

    // Generate insights using the insight engine
    const insights = await analyzeInsights(userId, morningCheckData)

    console.log('[v0] Morning Insights - Generated', insights.length, 'insights')

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Morning Insights Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate morning insights',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
