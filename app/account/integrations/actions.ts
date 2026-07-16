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

    // Connecting a broker is THE activation moment, so it starts the 3-day
    // full-access trial (no card) and flips the account straight into LIVE
    // mode - the user never has to touch the virtual/live switch. The trial
    // is granted only once per user: if trial_ends_at was ever set before,
    // or the user already has a real Stripe subscription history, nothing
    // changes here. See /api/subscription/status for how trial_ends_at is
    // read back as isTrialing/hasTrialEnded.
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
        console.log('[v0] Starting 3-day app trial (no card) for user:', userId, 'ends:', trialEndsAt)
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

    // Best-effort short wait just to tell the user whether the broker login
    // already finished. Its outcome doesn't affect what's saved above - the
    // background sync job will pick up the connection once it goes CONNECTED
    // even if this wait times out first. Kept short (well under Vercel's
    // default 10s serverless timeout on the Hobby plan) since this file
    // can't export maxDuration - Next.js only allows async function exports
    // from a 'use server' file, so there's no way to extend this action's
    // own time budget.
    let connected = false
    try {
      connected = await metaApiClient.waitUntilConnected(accountId, 6000, 2000)
    } catch (waitErr) {
      console.warn('[v0] MetaApi account saved but broker login check failed:', waitErr)
    }

    console.log('[v0] MetaApi connected successfully with account:', accountId, 'connected:', connected, 'trialStarted:', trialStarted)
    return { success: true, accountId, connected, trialStarted }
  } catch (err) {
    console.error('[v0] Error in connectMetaApi:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to connect MetaApi. Check your credentials.' }
  }
}
