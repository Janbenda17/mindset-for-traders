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

// Apple Health OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const origin = request.nextUrl?.origin || request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    console.log('[v0] Apple Health callback - origin:', origin, 'code:', code ? 'present' : 'missing')

    // Verify state
    const storedState = request.cookies.get('terra_oauth_state')?.value
    if (state !== storedState) {
      console.error('[v0] Apple Health state mismatch:', { received: state, stored: storedState })
      return NextResponse.redirect(`${origin}/settings/integrations?error=invalid_state`)
    }

    if (error) {
      console.error('[v0] Apple Health OAuth error:', error)
      return NextResponse.redirect(
        `${origin}/settings/integrations?error=apple_health_failed&error_desc=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      console.error('[v0] No authorization code received')
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 })
    }

    const terraApiKey = process.env.TERRA_API_KEY
    if (!terraApiKey) {
      console.error('[v0] TERRA_API_KEY not configured')
      throw new Error('Terra API key not configured')
    }

    // Exchange code for Terra API token
    console.log('[v0] Exchanging code for Terra token...')
    const tokenResponse = await fetch('https://www.terraapi.com/api/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${terraApiKey}`,
      },
      body: JSON.stringify({
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[v0] Token exchange failed:', tokenResponse.status, errorText)
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    const terraUserId = tokenData.user?.user_id
    const terraReferenceId = tokenData.user?.reference_id

    if (!terraUserId) {
      console.error('[v0] No Terra user ID in response:', tokenData)
      throw new Error('No Terra user ID received')
    }

    // Get current user from auth header or cookies
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null

    // Try from auth header first
    if (authHeader) {
      try {
        const { data: { user } } = await getSupabase().auth.getUser(authHeader.replace('Bearer ', ''))
        userId = user?.id || null
      } catch (e) {
        console.log('[v0] Auth header method failed, trying session...')
      }
    }

    // If not found, try from session cookies
    if (!userId) {
      const { data: { session } } = await getSupabase().auth.getSession()
      userId = session?.user?.id || null
    }

    if (!userId) {
      console.error('[v0] No user found in session or auth header')
      return NextResponse.redirect(`${origin}/auth/login?redirectedFrom=/settings/integrations`)
    }

    console.log('[v0] Saving Terra integration for user:', userId)

    // Save Terra ID to user profile
    const { error: updateError } = await getSupabase()
      .from('profiles')
      .update({
        terra_id: terraUserId,
        terra_reference_id: terraReferenceId,
        sleep_sync_enabled: true,
        last_health_sync: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('[v0] Error updating profile:', updateError)
      throw updateError
    }

    console.log('[v0] Apple Health integration successful')

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${origin}/settings/integrations?success=apple_health_connected`
    )
  } catch (error) {
    console.error('[v0] Apple Health callback error:', error)
    const origin = request.nextUrl?.origin || request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(
      `${origin}/settings/integrations?error=callback_failed&error_msg=${encodeURIComponent(String(error))}`
    )
  }
}
