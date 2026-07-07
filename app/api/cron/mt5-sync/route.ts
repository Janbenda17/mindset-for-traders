import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { metaApiClient } from '@/lib/integrations/metaapi'

/**
 * GET /api/cron/mt5-sync
 * Vercel Cron Job - runs once a day. Vercel's Hobby plan rejects any cron
 * schedule that would fire more than once per day, so sub-daily scheduling
 * (e.g. every minute) isn't available unless the project is on a paid plan.
 * Syncs live MT5 trades and account data for all connected users.
 *
 * This previously lived at the repo-root `api/cron/mt5-sync.ts`, which is
 * NOT a route the Next.js App Router serves (only files under `app/api/**`
 * are), so this job never actually ran in production - connected accounts
 * never got their trades/balance synced after the initial connect.
 */
export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get('authorization')
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Create Supabase admin client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      },
    )

    // Get all users with MT5 integration enabled
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, metaapi_token, metaapi_account_id, metaapi_broker')
      .eq('trades_sync_enabled', true)
      .not('metaapi_account_id', 'is', null)

    if (profileError) {
      console.error('[v0] Failed to fetch profiles:', profileError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 },
      )
    }

    if (!profiles || profiles.length === 0) {
      console.log('[v0] No users with MT5 sync enabled')
      return NextResponse.json(
        { message: 'No users to sync', count: 0 },
        { status: 200 },
      )
    }

    console.log(`[v0] Syncing MT5 data for ${profiles.length} users...`)

    let syncedCount = 0
    let errorCount = 0

    // Process each user's MT5 data
    for (const profile of profiles) {
      try {
        const userId = profile.user_id || profile.id
        const accessToken = profile.metaapi_token
        const accountId = profile.metaapi_account_id

        // Fetch account info using access token
        const accountInfo = await metaApiClient.getAccountInfo(accountId)

        // Fetch trades
        const trades = await metaApiClient.getTrades(accountId)

        // Fetch stats
        const stats = await metaApiClient.getAccountStats(accountId)

        // Upsert account balance to trades table (or create separate account_stats)
        const nowIso = new Date().toISOString()
        const { error: accountError } = await supabase
          .from('mt4_trades')
          .upsert(
            {
              user_id: userId,
              trade_id: '_ACCOUNT_',
              symbol: '_ACCOUNT_',
              trade_type: 'ACCOUNT',
              volume: 0,
              entry_price: accountInfo.balance,
              exit_price: accountInfo.equity,
              entry_time: nowIso,
              exit_time: nowIso,
              date: nowIso.slice(0, 10),
              profit_loss: accountInfo.profit,
              duration_seconds: 0,
              source: 'metaapi',
              created_at: nowIso,
            },
            {
              onConflict: 'user_id,trade_id',
            },
          )

        if (accountError) {
          console.error(
            `[v0] Failed to upsert account data for user ${userId}:`,
            accountError,
          )
          errorCount++
          continue
        }

        // Upsert trades
        const { error: tradesError } = await supabase
          .from('mt4_trades')
          .upsert(
            trades.map((trade) => ({
              user_id: userId,
              trade_id: trade.id,
              symbol: trade.symbol,
              trade_type: trade.type,
              volume: trade.volume,
              entry_price: trade.entry_price,
              exit_price: trade.current_price,
              entry_time: trade.entry_time,
              exit_time: trade.exit_time ?? null,
              date: (trade.entry_time || new Date().toISOString()).slice(0, 10),
              status: trade.status,
              profit_loss: trade.profit,
              profit_loss_pips: trade.profit_pips,
              duration_seconds: trade.exit_time
                ? Math.round(
                    (new Date(trade.exit_time).getTime() -
                      new Date(trade.entry_time).getTime()) /
                      1000,
                  )
                : 0,
              source: 'metaapi',
              created_at: new Date().toISOString(),
            })),
            {
              onConflict: 'user_id,trade_id',
            },
          )

        if (tradesError) {
          console.error(
            `[v0] Failed to upsert trades for user ${userId}:`,
            tradesError,
          )
          errorCount++
          continue
        }

        // Update last sync timestamp
        await supabase
          .from('profiles')
          .update({
            last_trades_sync: new Date().toISOString(),
          })
          .eq('user_id', userId)

        syncedCount++
        console.log(
          `[v0] Synced MT5 data for user ${userId}: ${trades.length} trades, ${stats.daily_pnl.toFixed(2)} daily P&L`,
        )
      } catch (error) {
        console.error(`[v0] Error syncing user ${profile.id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json(
      {
        message: 'MT5 sync completed',
        synced: syncedCount,
        errors: errorCount,
        total: profiles.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[v0] MT5 sync cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 },
    )
  }
}
