'use server'

import { createClient } from '@supabase/supabase-js'
import { metaApiClient } from '@/lib/integrations/metaapi'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return supabaseInstance
}

/**
 * Real count of profiles that have ever connected a broker (metaapi_account_id
 * is set). Used for an honest social-proof line on the integrations page -
 * "X traders have already connected their account" - as an alternative to a
 * fabricated countdown/reserved-slot claim. This is a genuine COUNT() against
 * the profiles table, not a simulated or illustrative number.
 */
export async function getConnectedTradersCount(): Promise<number | null> {
  try {
    const { count, error } = await getSupabase()
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })
      .not('metaapi_account_id', 'is', null)

    if (error) {
      console.error('[v0] Error counting connected traders:', error)
      return null
    }

    return count ?? null
  } catch (err) {
    console.error('[v0] Exception counting connected traders:', err)
    return null
  }
}

export async function ensureProfileExists(userId: string) {
  try {
    console.log('[v0] Ensuring profile exists for user:', userId)

    const { data: profile, error: selectError } = await getSupabase()
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('[v0] Error checking profile:', selectError)
      return { success: false, error: selectError.message || 'Failed to check profile' }
    }

    if (profile) {
      console.log('[v0] Profile already exists')
      return { success: true, created: false }
    }

    console.log('[v0] Creating new profile for user:', userId)
    const { error: insertError } = await getSupabase()
      .from('profiles')
      .insert({
        user_id: userId,
      })

    if (insertError) {
      console.error('[v0] Error creating profile:', insertError)
      return { success: false, error: insertError.message || 'Failed to create profile' }
    }

    console.log('[v0] Profile created successfully')
    return { success: true, created: true }
  } catch (err) {
    console.error('[v0] Error in ensureProfileExists:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to ensure profile exists' }
  }
}

export async function disconnectMetaApi(userId: string) {
  try {
    console.log('[v0] Disconnecting MetaApi for user:', userId)

    const { error } = await getSupabase()
      .from('profiles')
      .update({
        metaapi_account_id: null,
        metaapi_token: null,
        metaapi_broker: null,
        mt4_broker: null,
        mt4_login: null,
        mt4_password: null,
        trades_sync_enabled: false,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('[v0] Error disconnecting MetaApi:', error)
      return { success: false, error: error.message || 'Failed to disconnect MetaApi' }
    }

    console.log('[v0] MetaApi disconnected successfully')
    return { success: true }
  } catch (err) {
    console.error('[v0] Error in disconnectMetaApi:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to disconnect MetaApi' }
  }
}

export async function connectMetaApi(
  userId: string,
  credentials: { login: string; password: string; broker: string; platform?: 'mt4' | 'mt5' }
) {
  try {
    console.log('[v0] Connecting MetaApi for user:', userId, 'broker:', credentials.broker)

    if (!credentials.login || !credentials.password || !credentials.broker) {
      return { success: false, error: 'Missing MT5 credentials' }
    }

    if (!process.env.METAAPI_API_KEY) {
      console.error('[v0] METAAPI_API_KEY is not configured')
      return { success: false, error: 'MetaApi is not configured on the server (missing API key). Please contact support.' }
    }

    let accountId: string
    try {
      const result = await metaApiClient.authenticateWithCredentials(credentials)
      accountId = result.accountId
    } catch (authErr) {
      console.error('[v0] MetaApi authentication failed:', authErr)
      return {
        success: false,
        error: authErr instanceof Error ? authErr.message : 'Failed to connect to MT5. Check your credentials and broker name.',
      }
    }

    // Persist the account right away, before waiting on the broker login to
    // finish. The account is already created and deploying on MetaApi's side
    // at this point - if we waited to save until after a full CONNECTED
    // check and the request got cut off (slow broker login, function
    // timeout), the credentials the user just entered would be lost and
    // they'd have to reconnect from scratch even though a MetaApi account
    // was already spun up for them.
    const { error } = await getSupabase()
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
      return { success: false, error: error.message || 'Failed to save MetaApi connection' }
    }

    // IMPORTANT: the trial used to be started right here, unconditionally,
    // the instant the account was saved - before we had any idea whether
    // the broker login actually succeeded. A bad login/password/server only
    // surfaces as MetaApi's DEPLOY_FAILED state after 10-40s, which is far
    // longer than a single server action can safely block for (Vercel's
    // Hobby plan kills serverless functions at 10s, and this file can't
    // export maxDuration since Next.js only allows that from route/page
    // files, not 'use server' action files). The old code's synchronous
    // 6-second wait would time out long before a real failure could show
    // up, the timeout was silently swallowed, and the trial had *already*
    // been granted above regardless - so a mistyped password or wrong
    // broker server name burned a user's one-time 3-day trial for nothing.
    //
    // Fix: this action now only creates + saves the account and returns
    // immediately (fast, well within the timeout). Trial activation moved
    // to confirmBrokerConnection() below, which the client
    // (app/account/integrations/page.tsx) calls repeatedly every few
    // seconds via its own short-lived requests - each poll is fast, so
    // there's no function-timeout risk no matter how long the broker takes
    // to actually connect. The trial is granted only once MetaApi confirms
    // connectionStatus === 'CONNECTED'.
    console.log('[v0] MetaApi account saved, pending connection confirmation:', accountId)
    return { success: true, accountId, pending: true }
  } catch (err) {
    console.error('[v0] Error in connectMetaApi:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to connect MetaApi. Check your credentials.' }
  }
}

/**
 * Shared trial-grant logic used by both the broker-connect path
 * (confirmBrokerConnection) and the CSV-import path (uploadTradeHistoryCsv)
 * below. Same "already had a trial / has real Stripe history / already
 * premium" guard either way, so neither path can ever re-grant a trial or
 * stack on top of a paid subscription - the trial is a one-time thing,
 * regardless of which activation route the user took to get it.
 */
async function grantAppTrialIfEligible(userId: string): Promise<{ trialStarted: boolean }> {
  try {
    const { data: prof } = await getSupabase()
      .from('profiles')
      .select('trial_ends_at, subscription_status, is_premium')
      .eq('user_id', userId)
      .maybeSingle()

    const REAL_STRIPE_SUBSCRIPTION_STATUSES = [
      'trialing', 'active', 'past_due', 'canceled', 'unpaid',
      'incomplete', 'incomplete_expired', 'paused',
    ]
    const hasStripeHistory = REAL_STRIPE_SUBSCRIPTION_STATUSES.includes(prof?.subscription_status ?? '')
    const alreadyHadTrial = !!prof?.trial_ends_at

    const updates: Record<string, unknown> = { trading_mode: 'live' }
    let trialStarted = false
    if (!alreadyHadTrial && !hasStripeHistory && !prof?.is_premium) {
      const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      updates.trial_ends_at = trialEndsAt
      trialStarted = true
      console.log('[v0] Starting 3-day app trial (no card) for user:', userId, 'ends:', trialEndsAt)
    }

    const { error } = await getSupabase().from('profiles').update(updates).eq('user_id', userId)
    if (error) {
      console.error('[v0] Error granting app trial:', error)
      return { trialStarted: false }
    }

    return { trialStarted }
  } catch (err) {
    console.error('[v0] Exception granting app trial:', err)
    return { trialStarted: false }
  }
}

/**
 * Poll-friendly, single-shot connection check. Called repeatedly from the
 * client (every few seconds, see app/account/integrations/page.tsx) right
 * after connectMetaApi() returns, until MetaApi reports the account as
 * CONNECTED or DEPLOY_FAILED (or the client gives up after its own
 * timeout). Each call is a single fast MetaApi GET request, so there's no
 * risk of hitting a serverless function timeout no matter how long the
 * broker takes to actually log in.
 *
 * The 3-day app trial (no card) is granted here, and ONLY here, and ONLY
 * once connectionStatus is genuinely 'CONNECTED' - never on a timeout,
 * never optimistically. See the long comment in connectMetaApi() above for
 * why this moved out of that action.
 */
export async function confirmBrokerConnection(userId: string, accountId: string) {
  try {
    const state = await metaApiClient.getConnectionState(accountId)

    // Transient read failure (network blip, MetaApi hiccup) - tell the
    // client to keep polling rather than surfacing a scary error for
    // something that isn't actually a connection failure.
    if (!state) {
      return { connected: false, failed: false, pending: true }
    }

    if (state.state === 'DEPLOY_FAILED') {
      console.warn('[v0] MetaApi account failed to deploy (bad credentials/server):', accountId)

      // Clear the broken credentials so the user gets a clean retry instead
      // of being stuck looking "connected" with an account that will never
      // come online.
      await getSupabase()
        .from('profiles')
        .update({
          metaapi_account_id: null,
          metaapi_token: null,
          metaapi_broker: null,
          trades_sync_enabled: false,
        })
        .eq('user_id', userId)

      return {
        connected: false,
        failed: true,
        error: 'Could not log into your broker with those details. Double-check your account number, investor password and broker server name, then try again.',
      }
    }

    if (state.connectionStatus !== 'CONNECTED') {
      return { connected: false, failed: false, pending: true }
    }

    // Genuinely connected - now, and only now, grant the one-time 3-day app
    // trial (no card) and flip the account into LIVE mode.
    const { trialStarted } = await grantAppTrialIfEligible(userId)

    return { connected: true, failed: false, trialStarted }
  } catch (err) {
    console.error('[v0] Error in confirmBrokerConnection:', err)
    // Treat unexpected errors as "keep polling" rather than a hard failure -
    // don't want a transient exception to falsely tell the user their login
    // was wrong.
    return { connected: false, failed: false, pending: true }
  }
}

interface ParsedCsvTrade {
  tradeId: string
  symbol: string
  tradeType: string | null
  entryPrice: number
  exitPrice: number
  volume: number
  entryTime: string
  exitTime: string
  profitLoss: number
}

// MT4/MT5 "Statement" CSV export parser. The standard export (Terminal ->
// History tab -> right-click -> Save as Report -> CSV) has a header row
// with columns roughly: Ticket, Open Time, Type, Size, Item, Price, S/L,
// T/P, Close Time, Price, Commission, Taxes, Swap, Profit - notably with
// the word "Price" appearing TWICE (open price, then close price, in that
// column order), so those two are matched positionally rather than by name.
// This is a best-effort parser for that one dominant format (this product
// is MT4/5-specific), not a universal broker-statement parser - rows that
// don't look like real trades (balance/credit/deposit lines some exports
// include, or rows missing a symbol/profit value) are silently skipped
// rather than guessed at.
function parseMt4Mt5Csv(csvText: string): { trades: ParsedCsvTrade[]; totalDataRows: number } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) return { trades: [], totalDataRows: 0 }

  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','
  const normalize = (h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const header = lines[0].split(delimiter).map(normalize)

  const findCol = (...names: string[]) => {
    for (const name of names) {
      const idx = header.indexOf(name)
      if (idx !== -1) return idx
    }
    return -1
  }

  const idxTicket = findCol('ticket', 'order', 'orderid', 'id')
  const idxSymbol = findCol('item', 'symbol', 'instrument')
  const idxType = findCol('type', 'side')
  const idxSize = findCol('size', 'volume', 'lots')
  const idxOpenTime = findCol('opentime', 'entrytime')
  const idxCloseTime = findCol('closetime', 'exittime')
  const idxProfit = findCol('profit', 'pl', 'pnl', 'profitloss')

  const priceIndexes = header.reduce<number[]>((acc, h, i) => (h === 'price' ? [...acc, i] : acc), [])
  const idxOpenPrice = priceIndexes[0] ?? -1
  const idxClosePrice = priceIndexes[1] ?? -1

  // Can't find the two fields every real trade row must have - not a
  // recognizable MT4/5 statement export.
  if (idxSymbol === -1 || idxProfit === -1) {
    return { trades: [], totalDataRows: lines.length - 1 }
  }

  const toNumber = (raw: string | undefined) => {
    if (raw === undefined) return NaN
    return Number(raw.replace(/\s/g, '').replace(',', '.'))
  }

  const toIso = (raw: string | undefined) => {
    if (!raw) return new Date().toISOString()
    // MT4/5 export dates as "YYYY.MM.DD HH:MM" or "YYYY.MM.DD HH:MM:SS".
    const normalized = raw.replace(/^(\d{4})\.(\d{2})\.(\d{2})/, '$1-$2-$3')
    const d = new Date(normalized)
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  }

  const trades: ParsedCsvTrade[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim())
    const symbol = cols[idxSymbol]
    const profitLoss = toNumber(cols[idxProfit])

    if (!symbol || Number.isNaN(profitLoss)) continue
    if (/^(balance|credit|deposit|withdrawal)$/i.test(symbol)) continue

    trades.push({
      tradeId: idxTicket !== -1 && cols[idxTicket] ? cols[idxTicket] : `csv-${Date.now()}-${i}`,
      symbol,
      tradeType: idxType !== -1 ? cols[idxType]?.toLowerCase() || null : null,
      entryPrice: (() => {
        const n = toNumber(cols[idxOpenPrice])
        return Number.isFinite(n) ? n : 0
      })(),
      exitPrice: (() => {
        const n = toNumber(cols[idxClosePrice])
        return Number.isFinite(n) ? n : 0
      })(),
      volume: (() => {
        const n = toNumber(cols[idxSize])
        return Number.isFinite(n) ? n : 0
      })(),
      entryTime: toIso(cols[idxOpenTime]),
      exitTime: toIso(cols[idxCloseTime]),
      profitLoss,
    })
  }

  return { trades, totalDataRows: lines.length - 1 }
}

/**
 * Alternative to broker connect for anyone unwilling to hand over even a
 * read-only investor password - the trust-free escape hatch: export your
 * own closed-trades statement from MT4/5 and upload the file, no login, no
 * account linking. Real parsing (see parseMt4Mt5Csv above), not a fake
 * "processing" spinner - if the file genuinely doesn't parse we say so
 * instead of pretending it worked. The 3-day trial is granted through the
 * exact same one-time-only guard as the broker-connect path
 * (grantAppTrialIfEligible), and only once at least one real trade row was
 * actually imported.
 */
export async function uploadTradeHistoryCsv(userId: string, csvText: string) {
  try {
    if (!csvText || csvText.trim().length === 0) {
      return { success: false, error: 'The file is empty.' }
    }

    const { trades, totalDataRows } = parseMt4Mt5Csv(csvText)

    if (trades.length === 0) {
      return {
        success: false,
        error:
          totalDataRows === 0
            ? 'The file is empty.'
            : "Couldn't find recognizable trade data in this file. Export your closed-trades statement from MT4/MT5 as CSV (Terminal → History → right-click → Save as Report) and try again.",
      }
    }

    const rows = trades.map((t) => ({
      user_id: userId,
      trade_id: t.tradeId,
      symbol: t.symbol,
      trade_type: t.tradeType,
      entry_price: t.entryPrice,
      exit_price: t.exitPrice,
      volume: t.volume,
      entry_time: t.entryTime,
      exit_time: t.exitTime,
      profit_loss: t.profitLoss,
      date: t.exitTime.slice(0, 10),
      status: 'CLOSED',
      source: 'csv_import',
    }))

    const { error: insertError } = await getSupabase()
      .from('mt4_trades')
      .upsert(rows, { onConflict: 'user_id,trade_id' })

    if (insertError) {
      console.error('[v0] Error inserting CSV-imported trades:', insertError)
      return { success: false, error: 'Failed to save your trade history. Please try again.' }
    }

    const { trialStarted } = await grantAppTrialIfEligible(userId)

    return { success: true, importedCount: trades.length, trialStarted }
  } catch (err) {
    console.error('[v0] Error in uploadTradeHistoryCsv:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Failed to process your file.' }
  }
}
