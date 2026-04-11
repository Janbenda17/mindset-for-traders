import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initiate Apple Health OAuth flow
// In production, you'd use Terra API to handle this
export async function GET(request: NextRequest) {
  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/apple-health/callback`
    const clientId = process.env.TERRA_CLIENT_ID
    const state = Math.random().toString(36).substring(7)

    // Store state in session/cookie for verification
    const response = NextResponse.redirect(
      `https://www.terraapicom.com/api/auth/apple?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`
    )

    response.cookies.set('terra_oauth_state', state, {
      maxAge: 600,
      httpOnly: true,
      secure: true,
    })

    return response
  } catch (error) {
    console.error('[v0] Apple Health OAuth error:', error)
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 })
  }
}
