import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// MetaTrader webhook - dostane closed trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // MetaTrader EA pošle:
    // {
    //   api_key: "user's api key",
    //   symbol: "EURUSD",
    //   type: "buy/sell",
    //   entry_price: 1.0850,
    //   exit_price: 1.0845,
    //   size: 1.0,
    //   profit_loss: 50,
    //   duration_minutes: 20,
    //   timestamp: "2026-04-11T15:30:00Z"
    // }

    const { api_key, symbol, type, entry_price, exit_price, size, profit_loss, duration_minutes, timestamp } = body

    if (!api_key || !symbol || !entry_price || !exit_price) {
      return NextResponse.json(
        { error: 'Missing required trade data' },
        { status: 400 }
      )
    }

    // Find user by API key
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('mt4_api_key', api_key)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    const tradeDate = new Date(timestamp)
    const pnlPercent = ((exit_price - entry_price) / entry_price) * 100 * (type === 'sell' ? -1 : 1)

    // Store trade
    const { data: trade, error: insertError } = await supabase
      .from('mt4_trades')
      .insert({
        user_id: user.id,
        symbol,
        type,
        entry_price: parseFloat(entry_price),
        exit_price: parseFloat(exit_price),
        size: parseFloat(size),
        profit_loss: parseFloat(profit_loss),
        pnl_percent: pnlPercent,
        duration_minutes: parseInt(duration_minutes) || 0,
        closed_at: tradeDate.toISOString(),
        raw_data: body
      })
      .select()
      .single()

    if (insertError) {
      console.error('Trade insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to store trade' },
        { status: 500 }
      )
    }

    // Trigger correlation analysis
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze/correlations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user.id, 
        tradeId: trade.id,
        date: tradeDate.toISOString().split('T')[0]
      })
    }).catch(err => console.error('Correlation trigger failed:', err))

    return NextResponse.json({
      success: true,
      message: 'Trade recorded',
      tradeId: trade.id,
      pnlPercent
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
