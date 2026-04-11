import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Encrypt credentials using encryption key
function encryptCredentials(login: string, password: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey, 'hex'),
    iv
  )

  let encrypted = cipher.update(JSON.stringify({ login, password }), 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return `${iv.toString('hex')}:${encrypted}`
}

// Save MT5 credentials
export async function POST(request: NextRequest) {
  try {
    const { userId, broker, login, password } = await request.json()
    const encryptionKey = process.env.ENCRYPTION_KEY

    if (!encryptionKey) {
      throw new Error('Encryption key not configured')
    }

    // Encrypt credentials
    const encrypted = encryptCredentials(login, password, encryptionKey)

    // Save to profile - store encrypted credentials
    // In real implementation, you'd store these in a separate secure table
    const { error } = await supabase
      .from('profiles')
      .update({
        mt4_api_key: `${broker}:${encrypted}`,
        trades_sync_enabled: true,
        last_trades_sync: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Credentials saved securely',
    })
  } catch (error) {
    console.error('[v0] Credential save error:', error)
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    )
  }
}
