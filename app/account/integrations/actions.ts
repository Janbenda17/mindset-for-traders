'use server'

import { createClient } from '@supabase/supabase-js'
import { metaApiClient } from '@/lib/integrations/metaapi'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function ensureProfileExists(userId: string) {
  try {
    console.log('[v0] Ensuring profile exists for user:', userId)

    // Check if profile exists
    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('[v0] Error checking profile:', selectError)
      throw selectError
    }

    if (profile) {
      console.log('[v0] Profile already exists')
      return { success: true, created: false }
    }

    // Create profile with service role key (bypasses RLS)
    console.log('[v0] Creating new profile for user:', userId)
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
      })

    if (insertError) {
      console.error('[v0] Error creating profile:', insertError)
      throw insertError
    }

    console.log('[v0] Profile created successfully')
    return { success: true, created: true }
  } catch (err) {
    console.error('[v0] Error in ensureProfileExists:', err)
    throw err
  }
}

export async function disconnectMetaApi(userId: string) {
  try {
    console.log('[v0] Disconnecting MetaApi for user:', userId)

    const { error } = await supabase
      .from('profiles')
      .update({
        metaapi_account_id: null,
        metaapi_token: null,
        trades_sync_enabled: false,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Error disconnecting MetaApi:', error)
      throw error
    }

    console.log('[v0] MetaApi disconnected successfully')
    return { success: true }
  } catch (err) {
    console.error('[v0] Error in disconnectMetaApi:', err)
    throw err
  }
}

export async function connectMetaApi(
  userId: string,
  credentials: { login: string; password: string; broker: string }
) {
  try {
    console.log('[v0] Connecting MetaApi for user:', userId, 'broker:', credentials.broker)

    // Validate credentials
    if (!credentials.login || !credentials.password || !credentials.broker) {
      throw new Error('Missing MT5 credentials')
    }

    // Authenticate with MetaApi using credentials
    const accountId = await metaApiClient.authenticateWithCredentials(credentials)

    // Save MetaApi connection
    const { error } = await supabase
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
      throw error
    }

    console.log('[v0] MetaApi connected successfully with account:', accountId)
    return { success: true, accountId }
  } catch (err) {
    console.error('[v0] Error in connectMetaApi:', err)
    throw new Error('Failed to connect MetaApi. Check your credentials.')
  }
}
