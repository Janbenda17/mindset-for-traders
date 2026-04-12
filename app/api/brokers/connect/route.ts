import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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

    // Encrypt credentials
    const encryptedPassword = encryptCredentials(login, password, encryptionKey)

    console.log('[v0] Saving encrypted credentials to profile')

    // Save to profile with new columns
    const { error, data } = await supabase
      .from('profiles')
      .update({
        mt4_broker: broker,
        mt4_login: login,
        mt4_password: encryptedPassword,
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

    console.log('[v0] MetaTrader credentials saved successfully for broker:', broker)

    return NextResponse.json({
      success: true,
      message: 'MetaTrader account connected successfully',
      broker,
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
