import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseInstance
}

export async function POST(request: NextRequest) {
  try {
    const { mt4_webhook_token, terra_id } = await request.json()
    
    // Get user ID from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user session to extract user_id
    const { data: { user }, error: authError } = await getSupabase().auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Update profile with integrations
    const { error: updateError } = await getSupabase()
      .from('profiles')
      .update({
        mt4_webhook_token: mt4_webhook_token || null,
        terra_id: terra_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[v0] Error updating integrations:', updateError)
      return NextResponse.json(
        { error: 'Failed to save integrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Integrations saved successfully',
    })
  } catch (error) {
    console.error('[v0] Integration save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
