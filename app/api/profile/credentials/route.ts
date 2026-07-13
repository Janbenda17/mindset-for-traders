import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseInstance
}

// Verify the caller is logged in and only ever acting on their own userId.
//
// Both handlers used to trust a `userId` passed straight from the request
// body/query string with no check at all - anyone could read or overwrite
// ANY user's encrypted broker (MT4/MT5) login+password just by passing a
// different UUID. This checks the real signed-in user (from the Supabase
// session cookie, not anything the client can fake) and rejects the request
// unless it matches the userId being acted on.
async function requireOwnUser(requestedUserId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (user.id !== requestedUserId) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true as const }
}

// Encrypt credentials using encryption key
function encryptCredentials(login: string, password: string, encryptionKey: string): string {
  try {
    const iv = crypto.randomBytes(16)
    // Ensure we have a 32-byte key for aes-256-cbc
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

// Decrypt credentials (for verification)
function decryptCredentials(encryptedData: string, encryptionKey: string): { login: string; password: string } {
  try {
    const [ivHex, encrypted] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const key = Buffer.from(encryptionKey.padEnd(64, '0'), 'hex').slice(0, 32)
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  } catch (error) {
    console.error('[v0] Decryption error:', error)
    throw new Error('Failed to decrypt credentials')
  }
}

// Save MT5/MetaTrader credentials
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

    const auth = await requireOwnUser(userId)
    if (!auth.ok) return auth.response

    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      console.error('[v0] ENCRYPTION_KEY not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Encryption key not set' },
        { status: 500 }
      )
    }

    console.log('[v0] Encrypting credentials for broker:', broker)

    // Encrypt credentials
    const encrypted = encryptCredentials(login, password, encryptionKey)

    console.log('[v0] Saving encrypted credentials to profile')

    // Save to profile
    const { error, data } = await getSupabase()
      .from('profiles')
      .update({
        mt4_api_key: `${broker}:${encrypted}`,
        trades_sync_enabled: true,
        last_trades_sync: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('[v0] Error saving credentials:', error)
      throw error
    }

    console.log('[v0] Credentials saved successfully for broker:', broker)

    return NextResponse.json({
      success: true,
      message: 'Credentials saved securely',
      broker,
    })
  } catch (error) {
    console.error('[v0] Credential save error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check if credentials exist for a broker
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      )
    }

    const auth = await requireOwnUser(userId)
    if (!auth.ok) return auth.response

    const { data, error } = await getSupabase()
      .from('profiles')
      .select('mt4_api_key, trades_sync_enabled')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('[v0] Error fetching credentials:', error)
      throw error
    }

    const hasCredentials = !!data.mt4_api_key
    const [broker] = data.mt4_api_key?.split(':') || [null]

    return NextResponse.json({
      hasCredentials,
      broker,
      trades_sync_enabled: data.trades_sync_enabled,
    })
  } catch (error) {
    console.error('[v0] Error checking credentials:', error)
    return NextResponse.json(
      { error: 'Failed to check credentials' },
      { status: 500 }
    )
  }
}
