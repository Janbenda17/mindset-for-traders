import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { metaApiClient } from '@/lib/integrations/metaapi'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * OAuth callback from MetaApi.cloud
 * Handles authorization code exchange and account setup
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // User ID
    const error = searchParams.get('error')

    console.log('[v0] MetaApi OAuth callback received:', { code: !!code, state, error })

    // Check for errors from MetaApi
    if (error) {
      console.error('[v0] MetaApi OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/integrations?error=MetaApi+connection+failed`
      )
    }

    if (!code || !state) {
      console.error('[v0] Missing authorization code or state')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/integrations?error=Invalid+callback`
      )
    }

    // Exchange code for access token
    const { access_token, account_id } = await metaApiClient.exchangeCodeForToken(code)
    
    console.log('[v0] Got MetaApi access token for account:', account_id)

    // Validate token and authenticate account
    await metaApiClient.authenticateAccount(access_token, account_id)

    // Save MetaApi connection to user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        metaapi_token: access_token,
        metaapi_account_id: account_id,
        trades_sync_enabled: true,
      })
      .eq('user_id', state)

    if (updateError) {
      console.error('[v0] Error saving MetaApi token:', updateError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/integrations?error=Failed+to+save+connection`
      )
    }

    console.log('[v0] MetaApi connection saved for user:', state)

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/account/integrations?success=MetaApi+connected+successfully`
    )
  } catch (error) {
    console.error('[v0] OAuth callback error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/account/integrations?error=${encodeURIComponent(errorMsg)}`
    )
  }
}
