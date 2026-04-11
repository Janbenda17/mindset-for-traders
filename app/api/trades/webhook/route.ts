import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return hash === signature
}

// MetaTrader webhook - receives closed trades from MT4/MT5 Expert Advisor
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const trade = JSON.parse(body)

    // MetaTrader EA pošle:
    // {
    //   webhook_token: "unique-user-token",
    //   trade_id: "MT4-12345",
    //   symbol: "EURUSD",
    //   type: "buy/sell",
    //   entry_price: 1.0850,
    //   exit_price: 1.0845,
    //   volume: 1.0,
    //   profit_loss: 50,
    //   entry_time: "2026-04-11T10:00:00Z",
    //   exit_time: "2026-04-11T10:20:00Z"
    // }

    const { webhook_token, trade_id, symbol, type, entry_price, exit_price, volume, profit_loss, entry_time, exit_time } = trade

    if (!webhook_token) {
      return NextResponse.json(
        { error: 'Missing webhook token' },
        { status: 401 }
      )
    }

    // Find user by webhook token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, mt4_api_key')
      .eq('mt4_webhook_token', webhook_token)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      )
    }

    const userId = profile.user_id
    const apiKey = profile.mt4_api_key

    // Verify signature if API key is provided
    const signature = request.headers.get('x-signature')
    if (apiKey && signature) {
      const isValid = verifyWebhookSignature(body, signature, apiKey)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        )
      }
    }

    // Validate required fields
    const requiredFields = ['trade_id', 'symbol', 'type', 'entry_price', 'exit_price', 'volume', 'profit_loss', 'entry_time', 'exit_time']
    for (const field of requiredFields) {
      if (!(field in trade)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Calculate additional fields
    const entryTime = new Date(entry_time)
    const exitTime = new Date(exit_time)
    const durationSeconds = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000)
    const pips = ((exit_price - entry_price) / (symbol.includes('JPY') ? 0.01 : 0.0001)).toFixed(2)
    const date = entryTime.toISOString().split('T')[0]

    // Insert trade into database
    const { data: insertedTrade, error: insertError } = await supabase
      .from('mt4_trades')
      .insert({
        user_id: userId,
        trade_id,
        symbol,
        trade_type: type,
        entry_price: parseFloat(String(entry_price)),
        exit_price: parseFloat(String(exit_price)),
        volume: parseFloat(String(volume)),
        profit_loss: parseFloat(String(profit_loss)),
        profit_loss_pips: parseFloat(pips),
        entry_time: entryTime.toISOString(),
        exit_time: exitTime.toISOString(),
        duration_seconds: durationSeconds,
        date,
      })
      .select()

    if (insertError) {
      console.error('[v0] Error inserting trade:', insertError)
      return NextResponse.json(
        { error: 'Failed to save trade' },
        { status: 500 }
      )
    }

    // Update last sync timestamp
    await supabase
      .from('profiles')
      .update({ last_trades_sync: new Date().toISOString() })
      .eq('user_id', userId)

    // Trigger correlation analysis
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze/correlations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tradeId: insertedTrade[0]?.id,
        date,
        profitLoss: profit_loss,
      }),
    }).catch((err) => console.error('[v0] Correlation trigger failed:', err))

    return NextResponse.json({
      success: true,
      message: 'Trade recorded successfully',
      trade: insertedTrade[0],
    })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
