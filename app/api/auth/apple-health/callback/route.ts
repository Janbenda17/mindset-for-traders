import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Apple Health OAuth callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Verify state
    const storedState = request.cookies.get('terra_oauth_state')?.value
    if (state !== storedState) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 })
    }

    if (error) {
      console.error('[v0] Apple Health error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=apple_health_failed`
      )
    }

    if (!code) {
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 })
    }

    // Exchange code for Terra API token
    const tokenResponse = await fetch('https://www.terraapi.com/api/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TERRA_API_KEY}`,
      },
      body: JSON.stringify({
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    const tokenData = await tokenResponse.json()
    const terraUserId = tokenData.user.user_id
    const terraReferenceId = tokenData.user.reference_id

    // Get current user from cookie
    const cookieHeader = request.headers.get('cookie')
    // Parse auth from session...
    // For now, we'll get user_id from request (you'll need to implement proper session handling)
    const userId = request.nextUrl.searchParams.get('user_id')

    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
    }

    // Save Terra ID to user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        terra_id: terraUserId,
        terra_reference_id: terraReferenceId,
        sleep_sync_enabled: true,
        last_health_sync: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?success=apple_health_connected`
    )
  } catch (error) {
    console.error('[v0] Apple Health callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=callback_failed`
    )
  }
}
