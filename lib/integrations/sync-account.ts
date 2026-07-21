import { metaApiClient } from './metaapi'

// Deliberately a minimal structural type instead of importing SupabaseClient
// from '@supabase/supabase-js' - this function is called with clients from
// both '@supabase/supabase-js' (actions.ts) and '@supabase/ssr' (the cron
// route), and only ever needs `.from(...)`. Pinning to the full
// SupabaseClient<Database> generic type risked a cross-package structural
// mismatch between the two client constructors for no real benefit here.
interface MinimalSupabaseClient {
  from: (table: string) => any
}

/**
 * Pulls account info + trades (both full closed history and any currently
 * open positions) from MetaApi and upserts them into mt4_trades, for one
 * connected account. Shared by:
 *  - confirmBrokerConnection() in app/account/integrations/actions.ts,
 *    called once right when a broker connection is first confirmed, so a
 *    user's past trades show up immediately instead of only appearing
 *    after the next daily cron run.
 *  - app/api/cron/mt5-sync/route.ts, the once-a-day background sync that
 *    keeps everyone's data current after the initial connect.
 *
 * Kept deliberately best-effort per call: a MetaApi hiccup on one account
 * should never take down a whole cron run, and should never block the
 * connect flow from reporting success (the connection itself already
 * succeeded - trade import is a bonus, not a precondition).
 */
export async function syncMetaApiAccount(
  supabase: MinimalSupabaseClient,
  userId: string,
  accountId: string,
  opts: { closedTradesDaysBack?: number; closedTradesLimit?: number } = {},
): Promise<{ success: boolean; importedCount: number; error?: string }> {
  const { closedTradesDaysBack = 730, closedTradesLimit = 1000 } = opts

  try {
    const [accountInfo, closedTrades, openTrades] = await Promise.all([
      metaApiClient.getAccountInfo(accountId),
      metaApiClient.getClosedTrades(accountId, closedTradesDaysBack, closedTradesLimit).catch((err) => {
        console.error('[v0] Failed to fetch closed trade history for', userId, err)
        return []
      }),
      metaApiClient.getTrades(accountId).catch((err) => {
        console.error('[v0] Failed to fetch open positions for', userId, err)
        return []
      }),
    ])

    const nowIso = new Date().toISOString()

    // Account snapshot row (balance/equity), same convention the old cron
    // job used - a synthetic "trade" row with a fixed trade_id so it
    // upserts in place rather than accumulating one row per sync.
    const { error: accountError } = await supabase.from('mt4_trades').upsert(
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
        updated_at: nowIso,
      },
      { onConflict: 'user_id,trade_id' },
    )

    if (accountError) {
      console.error('[v0] Failed to upsert account snapshot for', userId, accountError)
      return { success: false, importedCount: 0, error: accountError.message }
    }

    // Closed trades (the actual history backfill) + any still-open
    // positions, deduped by trade_id via upsert - safe to call repeatedly
    // (e.g. every cron run) without creating duplicates.
    const allTrades = [...closedTrades, ...openTrades]

    if (allTrades.length === 0) {
      await supabase.from('profiles').update({ last_trades_sync: nowIso }).eq('user_id', userId)
      return { success: true, importedCount: 0 }
    }

    const { error: tradesError } = await supabase.from('mt4_trades').upsert(
      allTrades.map((trade) => ({
        user_id: userId,
        trade_id: trade.id,
        symbol: trade.symbol,
        trade_type: trade.type,
        volume: trade.volume,
        entry_price: trade.entry_price,
        exit_price: trade.current_price,
        entry_time: trade.entry_time,
        exit_time: trade.exit_time ?? trade.entry_time,
        date: (trade.entry_time || nowIso).slice(0, 10),
        status: trade.status,
        profit_loss: trade.profit,
        profit_loss_pips: trade.profit_pips,
        duration_seconds:
          trade.exit_time && trade.entry_time
            ? Math.max(
                0,
                Math.round(
                  (new Date(trade.exit_time).getTime() - new Date(trade.entry_time).getTime()) / 1000,
                ),
              )
            : 0,
        source: 'metaapi',
        updated_at: nowIso,
      })),
      { onConflict: 'user_id,trade_id' },
    )

    if (tradesError) {
      console.error('[v0] Failed to upsert trades for', userId, tradesError)
      return { success: false, importedCount: 0, error: tradesError.message }
    }

    await supabase.from('profiles').update({ last_trades_sync: nowIso }).eq('user_id', userId)

    console.log(`[v0] Synced MetaApi account for ${userId}: ${closedTrades.length} closed, ${openTrades.length} open`)

    return { success: true, importedCount: closedTrades.length }
  } catch (err) {
    console.error('[v0] syncMetaApiAccount failed for', userId, err)
    return { success: false, importedCount: 0, error: err instanceof Error ? err.message : 'Sync failed' }
  }
}
