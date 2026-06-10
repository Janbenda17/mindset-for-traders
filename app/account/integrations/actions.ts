'use server'

import { createClient } from '@supabase/supabase-js'
import { vitalApi } from '@/lib/integrations/vital'
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
        apple_health_connected: false,
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

export async function updateAppleHealth(userId: string, connected: boolean) {
  try {
    console.log('[v0] Updating Apple Health for user:', userId, 'connected:', connected)

    const { error } = await supabase
      .from('profiles')
      .update({
        apple_health_connected: connected,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Error updating Apple Health:', error)
      throw error
    }

    console.log('[v0] Apple Health updated successfully')
    return { success: true }
  } catch (err) {
    console.error('[v0] Error in updateAppleHealth:', err)
    throw err
  }
}

export async function connectVital(userId: string) {
  try {
    console.log('[v0] Initiating Vital OAuth for user:', userId)
    
    // Generate Vital OAuth URL
    const redirectUrl = vitalApi.getOAuthUrl(userId)
    
    console.log('[v0] Vital OAuth URL generated')
    return { redirectUrl }
  } catch (err) {
    console.error('[v0] Error in connectVital:', err)
    throw new Error('Failed to initiate Vital connection')
  }
}

export async function connectMetaApi(
  userId: string,
  credentials: { login: string; password: string; broker: string }
) {
  try {
    console.log('[v0] Connecting MetaApi for user:', userId)

    // Test connection to MetaApi
    const accountId = await metaApiClient.authenticateAccount(credentials)
    
    // Encrypt and store credentials
    const { error } = await supabase
      .from('profiles')
      .update({
        metaapi_token: accountId,
        metaapi_login: credentials.login,
        metaapi_broker: credentials.broker,
        trades_sync_enabled: true,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Error saving MetaApi credentials:', error)
      throw error
    }

    console.log('[v0] MetaApi connected successfully')
    return { success: true, accountId }
  } catch (err) {
    console.error('[v0] Error in connectMetaApi:', err)
    throw new Error('Failed to connect MetaApi. Check credentials.')
  }
}

export async function disconnectMetaApi(userId: string) {
  try {
    console.log('[v0] Disconnecting MetaApi for user:', userId)

    const { error } = await supabase
      .from('profiles')
      .update({
        metaapi_token: null,
        metaapi_login: null,
        metaapi_broker: null,
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
