'use server'

import { createClient } from '@supabase/supabase-js'
import { metaApiClient } from '@/lib/integrations/metaapi'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseInstance
}

/**
 * Real count of profiles that have ever connected a broker (metaapi_account_id
 * is set). Used for an honest social-proof line on the integrations page -
 * "X traders have already connected their account" - as an alternative to a
 * fabricated countdown/reserved-slot claim. This is a genuine COUNT() against
 * the profiles table, not a simulated or illustrative number.
 */
export async function getConnectedTradersCount(): Promise<number | null> {
  try {
    const { count, error } = await getSupabase()
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })
      .not('metaapi_account_id', 'is', null)

    if (error) {
      console.error('[v0] Error counting connected traders:', error)
      return null
    }

    return count ?? null
  } catch (err) {
    console.error('[v0] Exception counting connected traders:', err)
    return null
  }
}

export async function ensureProfileExists(userId: string) {
  try {
    console.log('[v0] Ensuring profile exists for user:', userId)

    const { data: profile, error: selectError } = await getSupabase()
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('[v0] Error checking profile:', selectError)
      return { success: false, error: selectError.message || 'Failed to check profile' }
    }

    if (profile) {
      console.log('[v0] Profile already exists')
      return { success: true, created: false }
    }

    console.log('[v0] Creating new profile for user:', userId)
    const { error: insertError } = await getSupabase()
      .from('profiles')
      .insert({
        user_id: userId,
      })

    if (insertError) {
      console.error('[v0] Error creating profile:', insertError)
      return { success: false, error: insertError.message || 'Failed to create profile' }
    }

    console.log('[v0] Profile created successfully')
    return { success: true, created: true }
  } catch (err) {
    console.error('[v0] Error in ensureProfileExists:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to ensure profile exists' }
  }
}

export async function disconnectMetaApi(userId: string) {
  try {
    console.log('[v0] Disconnecting MetaApi for user:', userId)

    const { error } = await getSupabase()
      .from('profiles')
      .update({
        metaapi_account_id: null,
        metaapi_token: null,
        metaapi_broker: null,
        mt4_broker: null,
        mt4_login: null,
        mt4_password: null,
        trades_sync_enabled: false,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Error disconnecting MetaApi:', error)
      return { success: false, error: error.message || 'Failed to disconnect MetaApi' }
    }

    console.log('[v0] MetaApi disconnected successfully')
    return { success: true }
  } catch (err) {
    console.error('[v0] Error in disconnectMetaApi:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to disconnect MetaApi' }
  }
}

export async function connectMetaApi(
  userId: string,
  credentials: { login: string; password: string; broker: string; platform?: 'mt4' | 'mt5' }
) {
  try {
    console.log('[v0] Connecting MetaApi for user:', userId, 'broker:', credentials.broker)

    if (!credentials.login || !credentials.password || !credentials.broker) {
      return { success: false, error: 'Missing MT5 credentials' }
    }

    if (!process.env.METAAPI_API_KEY) {
      console.error('[v0] METAAPI_API_KEY is not configured')
      return { success: false, error: 'MetaApi is not configured on the server (missing API key). Please contact support.' }
    }

    let accountId: string
    try {
      const result = await metaApiClient.authenticateWithCredentials(credentials)
      accountId = result.accountId
    } catch (authErr) {
      console.error('[v0] MetaApi authentication failed:', authErr)
      return {
        success: false,
        error: authErr instanceof Error ? authErr.message : 'Failed to connect to MT5. Check your credentials and broker name.',
      }
    }

    // Persist the account right away, before waiting on the broker login to
    // finish. The account is already created and deploying on MetaApi's side
    // at this point - if we waited to save until after a full CONNECTED
    // check and the request got cut off (slow broker login, function
    // timeout), the credentials the user just entered would be lost and
    // they'd have to reconnect from scratch even though a MetaApi account
    // was already spun up for them.
    const { error } = await getSupabase()
      .from('profiles')
      .update({
        metaapi_account_id: accountId,
        metaapi_token: process.env.METAAPI_API_KEY,
        metaapi_broker: credentials.broker,
        trades_sync_enabled: true,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Error saving MetaApi account:', error)
      return { success: false, error: error.message || 'Failed to save MetaApi connection' }
    }

    // IMPORTANT: the trial used to be started right here, unconditionally,
    // the instant the account was saved - before we had any idea whether
    // the broker login actually succeeded. A bad login/password/server only
    // surfaces as MetaApi's DEPLOY_FAILED state after 10-40s, which is far
    // longer than a single server action can safely block for (Vercel's
    // Hobby plan kills serverless functions at 10s, and this file can't
    // export maxDuration since Next.js only allows that from route/page
    // files, not 'use server' action files). The old code's synchronous
    // 6-second wait would time out long before a real failure could show
    // up, the timeout was silently swallowed, and the trial had *already*
    // been granted above regardless - so a mistyped password or wrong
    // broker server name burned a user's one-time 3-day trial for nothing.
    //
    // Fix: this action now only creates + saves the account and returns
    // immediately (fast, well within the timeout). Trial activation moved
    // to confirmBrokerConnection() below, which the client
    // (app/account/integrations/page.tsx) calls repeatedly every few
    // seconds via its own short-lived requests - each poll is fast, so
    // there's no function-timeout risk no matter how long the broker takes
    // to actually connect. The trial is granted only once MetaApi confirms
    // connectionStatus === 'CONNECTED'.
    console.log('[v0] MetaApi account saved, pending connection confirmation:', accountId)
    return { success: true, accountId, pending: true }
  } catch (err) {
    console.error('[v0] Error in connectMetaApi:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to connect MetaApi. Check your credentials.' }
  }
}

/**
 * Poll-friendly, single-shot connection check. Called repeatedly from the
 * client (every few seconds, see app/account/integrations/page.tsx) right
 * after connectMetaApi() returns, until MetaApi reports the account as
 * CONNECTED or DEPLOY_FAILED (or the client gives up after its own
 * timeout). Each call is a single fast MetaApi GET request, so there's no
 * risk of hitting a serverless function timeout no matter how long the
 * broker takes to actually log in.
 *
 * The 3-day app trial (no card) is granted here, and ONLY here, and ONLY
 * once connectionStatus is genuinely 'CONNECTED' - never on a timeout,
 * never optimistically. See the long comment in connectMetaApi() above for
 * why this moved out of that action.
 */
export async function confirmBrokerConnection(userId: string, accountId: string) {
  try {
    const state = await metaApiClient.getConnectionState(accountId)

    // Transient read failure (network blip, MetaApi hiccup) - tell the
    // client to keep polling rather than surfacing a scary error for
    // something that isn't actually a connection failure.
    if (!state) {
      return { connected: false, failed: false, pending: true }
    }

    if (state.state === 'DEPLOY_FAILED') {
      console.warn('[v0] MetaApi account failed to deploy (bad credentials/server):', accountId)

      // Clear the broken credentials so the user gets a clean retry instead
      // of being stuck looking "connected" with an account that will never
      // come online.
      await getSupabase()
        .from('profiles')
        .update({
          metaapi_account_id: null,
          metaapi_token: null,
          metaapi_broker: null,
          trades_sync_enabled: false,
        })
        .eq('user_id', userId)

      return {
        connected: false,
        failed: true,
        error: 'Could not log into your broker with those details. Double-check your account number, investor password and broker server name, then try again.',
      }
    }

    if (state.connectionStatus !== 'CONNECTED') {
      return { connected: false, failed: false, pending: true }
    }

    // Genuinely connected - now, and only now, grant the one-time 3-day app
    // trial (no card) and flip the account into LIVE mode. Same "already
    // had a trial / has real Stripe history / already premium" guard as
    // before so this never re-grants a trial. See /api/subscription/status
    // for how trial_ends_at is read back as isTrialing/hasTrialEnded.
    let trialStarted = false
    try {
      const { data: prof } = await getSupabase()
        .from('profiles')
        .select('trial_ends_at, subscription_status, is_premium')
        .eq('user_id', userId)
        .maybeSingle()

      const REAL_STRIPE_SUBSCRIPTION_STATUSES = [
        'trialing', 'active', 'past_due', 'canceled', 'unpaid',
        'incomplete', 'incomplete_expired', 'paused',
      ]
      const hasStripeHistory = REAL_STRIPE_SUBSCRIPTION_STATUSES.includes(prof?.subscription_status ?? '')
      const alreadyHadTrial = !!prof?.trial_ends_at

      const updates: Record<string, unknown> = { trading_mode: 'live' }
      if (!alreadyHadTrial && !hasStripeHistory && !prof?.is_premium) {
        const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        updates.trial_ends_at = trialEndsAt
        trialStarted = true
        console.log('[v0] Starting 3-day app trial (no card) for user:', userId, 'ends:', trialEndsAt, '- confirmed CONNECTED')
      }

      const { error: trialError } = await getSupabase()
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)

      if (trialError) {
        console.error('[v0] Error starting app trial / enabling live mode:', trialError)
        trialStarted = false
      }
    } catch (trialErr) {
      console.error('[v0] Exception starting app trial:', trialErr)
    }

    return { connected: true, failed: false, trialStarted }
  } catch (err) {
    console.error('[v0] Error in confirmBrokerConnection:', err)
    // Treat unexpected errors as "keep polling" rather than a hard failure -
    // don't want a transient exception to falsely tell the user their login
    // was wrong.
    return { connected: false, failed: false, pending: true }
  }
}
