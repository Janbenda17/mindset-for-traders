import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { metaApiClient } from '@/lib/integrations/metaapi'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Encrypt credentials using AES-256-CBC
function encryptCredentials(login: string, password: string, encryptionKey: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const key = Buffer.from(encryptionKey.padEnd(64, '0'), 'hex').slice(0, 32)
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(JSON.stringify({ login, password }), 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('[v0] Encryption error:', error)
    throw new Error('Failed to encrypt credentials')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, broker, login, password } = await request.json()
    
    // Validate inputs
    if (!userId || !broker || !login || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, broker, login, password' },
        { status: 400 }
      )
    }

    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      console.error('[v0] ENCRYPTION_KEY not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Encryption key not set' },
        { status: 500 }
      )
    }

    console.log('[v0] Connecting to MetaTrader broker:', broker)

    // Encrypt credentials (kept as backup/reference, not used for live sync)
    const encryptedPassword = encryptCredentials(login, password, encryptionKey)

    // Actually register the account with MetaApi.cloud so the cron sync
    // (api/cron/mt5-sync.ts) has a real metaapi_account_id to pull data from.
    // Without this step, credentials were saved but never linked to MetaApi,
    // so trades/balance never synced and "Your XP" / dashboard stats never
    // received real trading data.
    console.log('[v0] Authenticating with MetaApi for broker:', broker)
    const accountId = await metaApiClient.authenticateWithCredentials({ login, password, broker })

    console.log('[v0] Saving credentials and MetaApi account link to profile')

    // Use upsert to handle case where profile doesn't exist yet
    const { error, data } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        mt4_broker: broker,
        mt4_login: login,
        mt4_password: encryptedPassword,
        metaapi_account_id: accountId,
        metaapi_token: process.env.METAAPI_API_KEY,
        metaapi_broker: broker,
        trades_sync_enabled: true,
        last_trades_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()

    if (error) {
      console.error('[v0] Error saving credentials:', error)
      throw error
    }

    console.log('[v0] MetaTrader account connected and linked to MetaApi:', accountId)

    return NextResponse.json({
      success: true,
      message: 'MetaTrader account connected successfully',
      broker,
      accountId,
    })
  } catch (error) {
    console.error('[v0] Connection error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect MetaTrader account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
