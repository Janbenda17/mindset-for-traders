/**
 * MetaApi Client
 * Universal proxy for MT4/MT5 trading terminals
 * Handles account connection, live trades, and equity tracking
 *
 * Endpoints below match the real MetaApi.cloud REST API:
 * https://metaapi.cloud/docs/provisioning/  (provisioning profiles + accounts)
 * https://metaapi.cloud/docs/client/        (live account state)
 *
 * The previous version of this file pointed every call at
 * 'https://api-v1.metaapi.cloud', which is not a real MetaApi host and used an
 * 'X-API-Key' header instead of the 'auth-token' header MetaApi actually
 * expects - every request silently/loudly failed regardless of credentials.
 */

export interface MetaApiAccountInfo {
  balance: number
  equity: number
  profit: number
  margin_used: number
  free_margin: number
  margin_level: number
}

export interface MetaApiTrade {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  volume: number
  entry_price: number
  current_price: number
  profit: number
  profit_pips: number
  entry_time: string // ISO
  exit_time?: string // ISO
  status: 'OPEN' | 'CLOSED'
}

/**
 * Raw MetaApi "deal" record from the history-deals endpoint. A deal is a
 * single ledger entry (open a position, close a position, partial close,
 * balance adjustment, etc) - NOT the same thing as a "trade". A closed
 * trade has to be reconstructed by pairing a DEAL_ENTRY_IN deal (the open)
 * with the DEAL_ENTRY_OUT deal that closed the same positionId. See
 * getClosedTrades() below.
 */
interface MetaApiDeal {
  id: string
  positionId?: string
  type?: string
  entryType?: string
  symbol?: string
  volume?: number
  price?: number
  commission?: number
  swap?: number
  profit?: number
  time: string
}

interface MetaApiConnection {
  account_id: string
  api_key: string
  broker: string
  connected: boolean
}

export class MetaApiClient {
  private apiKey: string
  // Provisioning API: create/read accounts + provisioning profiles.
  private provisioningBaseUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'
  // Client API: read live account info / trading state for a deployed account.
  private clientBaseUrl = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai'
  private clientId: string
  private clientSecret: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.METAAPI_API_KEY || ''
    this.clientId = process.env.METAAPI_CLIENT_ID || process.env.NEXT_PUBLIC_METAAPI_CLIENT_ID || ''
    this.clientSecret = process.env.METAAPI_CLIENT_SECRET || ''

    if (!this.apiKey) {
      console.warn('[v0] METAAPI_API_KEY is not configured')
    }
  }

  private authHeaders() {
    return {
      'auth-token': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Create the MetaTrader account directly, relying on MetaApi's automatic
   * broker settings detection (matched by the `server` name). Provisioning
   * profiles are only needed for brokers MetaApi can't auto-detect, and they
   * only become usable once a servers.dat/.srv file is uploaded to them - a
   * step this app has no way to perform, so creating one here just produced
   * an inactive profile and every account creation failed with "You can
   * create accounts using active profiles only."
   *
   * Deliberately does NOT wait for connectionStatus === CONNECTED - that can
   * take 10-40s on a first connect, well past the timeout most serverless
   * platforms give a single request. The caller is expected to persist the
   * returned accountId right away and poll/verify the CONNECTED status
   * separately (see waitUntilConnected), so a slow or killed request can't
   * lose the account credentials the user just entered.
   */
  async authenticateWithCredentials(credentials: {
    login: string
    password: string
    broker: string
    platform?: 'mt4' | 'mt5'
  }): Promise<{ accountId: string }> {
    if (!this.apiKey) {
      throw new Error('MetaApi is not configured on the server (missing METAAPI_API_KEY).')
    }

    const platform = credentials.platform === 'mt4' ? 'mt4' : 'mt5'

    try {
      console.log('[v0] Creating MetaApi account for login:', credentials.login)

      const accountResponse = await fetch(`${this.provisioningBaseUrl}/users/current/accounts`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({
          login: credentials.login,
          password: credentials.password,
          name: `MT-${credentials.login}`,
          server: credentials.broker,
          platform,
          magic: Math.floor(Math.random() * 900000) + 100000,
          type: 'cloud-g2',
          // 'high' reliability requires a topped-up/funded MetaApi.cloud
          // account and MetaApi rejects account creation with a 403
          // ForbiddenError ("To allow high reliability please top up your
          // account") otherwise - which is exactly what was happening for
          // every single MT4/MT5 connection attempt in production. 'regular'
          // reliability works on the free/pay-as-you-go MetaApi plan.
          reliability: 'regular',
        }),
      })

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text()
        console.error('[v0] Failed to create MetaApi account:', accountResponse.status, errorText)
        throw new Error(`MetaApi rejected the account (${accountResponse.status}): ${errorText}`)
      }

      const account = await accountResponse.json()
      const accountId = account.id

      if (!accountId) {
        throw new Error('No account ID returned from MetaApi')
      }

      console.log('[v0] MetaApi account created:', accountId)

      // Creating the account only registers it with MetaApi - it starts out
      // UNDEPLOYED and never runs until explicitly deployed. Without this,
      // the account object exists but no terminal is ever started, so it
      // never actually logs into the broker and connectionStatus stays
      // DISCONNECTED forever.
      //
      // Deploy is best-effort here, not fatal: MetaApi's account-creation
      // endpoint can return an id before the account is queryable from the
      // deploy endpoint yet (eventual consistency that in practice has been
      // observed to take longer than any reasonable synchronous retry
      // budget). The expensive/billed step - creating the account - already
      // succeeded, so a deploy hiccup here must not throw away the account
      // the caller is about to persist. waitUntilConnected() below re-tries
      // deploy on every poll while the account is still undeployed, so a
      // slow-to-appear account still gets deployed once it settles.
      try {
        await this.deployAccount(accountId)
      } catch (deployError) {
        console.warn(
          '[v0] Initial deploy attempt failed, will retry during connection polling:',
          deployError instanceof Error ? deployError.message : deployError,
        )
      }

      return { accountId }
    } catch (error) {
      console.error('[v0] MetaApi authentication with credentials failed:', error)
      throw error instanceof Error
        ? error
        : new Error('Failed to connect to MT5. Check your credentials and broker name.')
    }
  }

  /**
   * Start the MetaApi trading terminal for a freshly created account. A
   * created account is UNDEPLOYED and inert until this is called.
   *
   * MetaApi's account-creation endpoint returns before the new account is
   * necessarily readable from every backend it operates (eventual
   * consistency), so calling /deploy immediately afterwards can 404 with
   * "Trading account with id X not found" even though the account was just
   * created successfully - and in practice this has been observed to take
   * several seconds to clear, not just one retry. Retry with a growing
   * delay (up to ~15s total) before giving up - this is a timing issue, not
   * a real error, and the account creation itself (the expensive/billed
   * part) already succeeded.
   */
  async deployAccount(accountId: string, attempt = 0): Promise<void> {
    const maxAttempts = 6
    const response = await fetch(`${this.provisioningBaseUrl}/users/current/accounts/${accountId}/deploy`, {
      method: 'POST',
      headers: this.authHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (response.status === 404 && attempt < maxAttempts) {
        const delayMs = 1500 + attempt * 500
        console.warn(
          `[v0] Deploy 404 for freshly created account ${accountId} (eventual consistency) - retrying in ${delayMs}ms, attempt ${attempt + 1}/${maxAttempts}`,
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        return this.deployAccount(accountId, attempt + 1)
      }

      console.error('[v0] Failed to deploy MetaApi account:', response.status, errorText)
      throw new Error(`Failed to deploy MT account (${response.status}): ${errorText}`)
    }
  }

  /**
   * Single, fast status check - one GET request, no polling loop. Used by
   * the client-side polling in app/account/integrations/actions.ts
   * (confirmBrokerConnection) so connection verification never has to run
   * inside one long-lived serverless invocation. A first-time demo
   * connection typically takes 10-40s to go CONNECTED; a genuinely bad
   * login/password/server usually surfaces as DEPLOY_FAILED well before
   * that. Returns null if the account can't be read at all (transient
   * MetaApi/network error - caller should treat this as "still pending",
   * not as a failure).
   */
  async getConnectionState(accountId: string): Promise<{ connectionStatus: string; state: string } | null> {
    try {
      const response = await fetch(`${this.provisioningBaseUrl}/users/current/accounts/${accountId}`, {
        method: 'GET',
        headers: this.authHeaders(),
      })

      if (!response.ok) return null

      const account = await response.json()

      // Same one-shot redeploy safety net as waitUntilConnected below: a
      // fresh account can still be UNDEPLOYED if the very first deploy()
      // call 404'd on eventual-consistency grounds. Firing a redeploy here
      // too means accounts get unstuck even if every waitUntilConnected
      // caller is gone and only client-side polling is checking on them.
      if (account.state === 'UNDEPLOYED') {
        fetch(`${this.provisioningBaseUrl}/users/current/accounts/${accountId}/deploy`, {
          method: 'POST',
          headers: this.authHeaders(),
        }).catch(() => {})
      }

      return { connectionStatus: account.connectionStatus, state: account.state }
    } catch {
      return null
    }
  }

  /**
   * Poll the account until MetaApi reports it as actually logged into the
   * broker, or bail out after the timeout. A first-time demo connection
   * typically takes 10-40s; a genuinely bad login/password/server usually
   * surfaces as a DEPLOY_FAILED state well before the timeout.
   *
   * NOTE: not called from the broker-connect flow anymore (see
   * app/account/integrations/actions.ts) - a single synchronous wait inside
   * one server action can't reliably cover a 10-40s connect without hitting
   * Vercel's serverless function timeout, which was the root cause of the
   * "trial starts even on a failed broker login" bug (the old 6s wait would
   * time out, get swallowed, and the trial had already been granted
   * unconditionally beforehand). Kept for any future server-side/background
   * caller that genuinely runs long enough to use it (e.g. a cron).
   */
  async waitUntilConnected(accountId: string, timeoutMs = 30000, intervalMs = 3000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs
    let redeployAttempted = false

    while (Date.now() < deadline) {
      const response = await fetch(`${this.provisioningBaseUrl}/users/current/accounts/${accountId}`, {
        method: 'GET',
        headers: this.authHeaders(),
      })

      if (response.ok) {
        const account = await response.json()

        if (account.connectionStatus === 'CONNECTED') {
          return true
        }

        if (account.state === 'DEPLOY_FAILED') {
          throw new Error(
            'MetaApi could not start the trading account. Double-check your login, password and broker server name.',
          )
        }

        // The account is now visible but the very first deploy() call (in
        // authenticateWithCredentials) may have 404'd before it was, and
        // that failure is deliberately swallowed there. Now that we can see
        // the account, make one single un-retried attempt to (re)deploy it -
        // do this once per wait to avoid hammering the endpoint every poll.
        // A single POST /deploy is idempotent/safe to call on an account
        // that's already deploying or deployed.
        if (!redeployAttempted && account.state === 'UNDEPLOYED') {
          redeployAttempted = true
          try {
            const deployResponse = await fetch(
              `${this.provisioningBaseUrl}/users/current/accounts/${accountId}/deploy`,
              { method: 'POST', headers: this.authHeaders() },
            )
            if (!deployResponse.ok) {
              console.warn(
                '[v0] Redeploy attempt during connection wait failed:',
                deployResponse.status,
                await deployResponse.text(),
              )
            }
          } catch (redeployError) {
            console.warn('[v0] Redeploy attempt during connection wait errored:', redeployError)
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    return false
  }

  /**
   * Connect to a MetaTrader account via MetaApi (re-checks deployment status)
   */
  async connectAccount(accountId: string, brokerName: string): Promise<MetaApiConnection> {
    try {
      const response = await fetch(`${this.provisioningBaseUrl}/users/current/accounts/${accountId}`, {
        method: 'GET',
        headers: this.authHeaders(),
      })

      if (!response.ok) {
        throw new Error(`MetaApi connection failed: ${response.statusText}`)
      }

      const account = await response.json()

      return {
        account_id: accountId,
        api_key: this.apiKey,
        broker: brokerName,
        connected: account.connectionStatus === 'CONNECTED',
      }
    } catch (error) {
      console.error('[v0] MetaApi account connection failed:', error)
      throw error
    }
  }

  /**
   * Fetch live account info (balance, equity, margin)
   */
  async getAccountInfo(accountId: string): Promise<MetaApiAccountInfo> {
    try {
      const response = await fetch(
        `${this.clientBaseUrl}/users/current/accounts/${accountId}/account-information`,
        {
          method: 'GET',
          headers: this.authHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch account info: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        balance: data.balance || 0,
        equity: data.equity || 0,
        profit: data.profit || 0,
        margin_used: data.margin || 0,
        free_margin: data.freeMargin || 0,
        margin_level: data.marginLevel || 0,
      }
    } catch (error) {
      console.error('[v0] Failed to get account info from MetaApi:', error)
      throw error
    }
  }

  /**
   * Fetch open positions for an account. This only ever returns positions
   * that are still open right now - see getClosedTrades() above for actual
   * trade history.
   */
  async getTrades(accountId: string, limit = 50): Promise<MetaApiTrade[]> {
    try {
      const response = await fetch(
        `${this.clientBaseUrl}/users/current/accounts/${accountId}/positions`,
        {
          method: 'GET',
          headers: this.authHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch trades: ${response.statusText}`)
      }

      const data = await response.json()
      const positions = Array.isArray(data) ? data : []

      return positions.slice(0, limit).map(
        (trade: Record<string, any>): MetaApiTrade => ({
          id: trade.id || trade.ticket?.toString() || '',
          symbol: trade.symbol || '',
          type: trade.type === 'POSITION_TYPE_BUY' ? 'BUY' : 'SELL',
          volume: trade.volume || 0,
          entry_price: trade.openPrice || 0,
          current_price: trade.currentPrice || 0,
          profit: trade.profit || 0,
          profit_pips: trade.profitInPips || 0,
          entry_time: trade.time ? new Date(trade.time).toISOString() : new Date().toISOString(),
          exit_time: undefined,
          status: 'OPEN',
        }),
      )
    } catch (error) {
      console.error('[v0] Failed to fetch trades from MetaApi:', error)
      throw error
    }
  }

  /**
   * Fetch raw deals (the ledger entries behind MT4/5 history) for an
   * account within a time range. This is the real "trade history" endpoint
   * - getTrades() above only ever returns currently-open positions, never
   * anything closed, which is why connecting a broker never backfilled a
   * user's past trades before this. One page per call (MetaApi caps at
   * 1000); callers that need more than that should page with `offset`.
   */
  async getHistoryDeals(
    accountId: string,
    startTime: Date,
    endTime: Date,
    offset = 0,
    limit = 1000,
  ): Promise<MetaApiDeal[]> {
    try {
      const path = `${this.clientBaseUrl}/users/current/accounts/${accountId}/history-deals/time/${startTime.toISOString()}/${endTime.toISOString()}`
      const response = await fetch(`${path}?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: this.authHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch history deals: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('[v0] Failed to fetch history deals from MetaApi:', error)
      throw error
    }
  }

  /**
   * Reconstruct closed trades from the raw deal history, so a user's
   * previously-made trades show up as soon as they connect their broker
   * instead of only ever seeing trades made after connecting. A closed
   * trade in MT4/5 is really two ledger deals - a DEAL_ENTRY_IN (opened
   * the position) and a DEAL_ENTRY_OUT (closed it), linked by
   * `positionId`. The OUT deal carries the realized profit for that close,
   * which is what matters most for a trading journal; entry price/time
   * come from the matching IN deal when it's found within the same fetched
   * window (a position opened before `daysBack` won't have its IN deal in
   * range - in that case we fall back to the OUT deal's own price/time so
   * the trade still imports with the correct P&L, just without an accurate
   * open price). Deals with no symbol (balance adjustments, credits,
   * pure commission entries) are skipped - they aren't trades.
   */
  async getClosedTrades(accountId: string, daysBack = 730, limit = 1000): Promise<MetaApiTrade[]> {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const deals = await this.getHistoryDeals(accountId, startTime, endTime, 0, limit)

    const openByPosition = new Map<string, MetaApiDeal>()
    for (const deal of deals) {
      if (deal.entryType === 'DEAL_ENTRY_IN' && deal.positionId) {
        openByPosition.set(deal.positionId, deal)
      }
    }

    const closingDeals = deals.filter(
      (deal) =>
        deal.symbol &&
        (deal.entryType === 'DEAL_ENTRY_OUT' || deal.entryType === 'DEAL_ENTRY_OUT_BY'),
    )

    return closingDeals.map((deal): MetaApiTrade => {
      const openDeal = deal.positionId ? openByPosition.get(deal.positionId) : undefined
      // Commission/swap are usually posted on the closing deal - fold them
      // into the realized P&L so it matches what the terminal shows.
      const profit = (deal.profit || 0) + (deal.commission || 0) + (deal.swap || 0)

      return {
        id: deal.positionId || deal.id,
        symbol: deal.symbol || '',
        type: deal.type === 'DEAL_TYPE_SELL' ? 'SELL' : 'BUY',
        volume: deal.volume || openDeal?.volume || 0,
        entry_price: openDeal?.price ?? deal.price ?? 0,
        current_price: deal.price || 0,
        profit,
        profit_pips: 0,
        entry_time: openDeal ? new Date(openDeal.time).toISOString() : new Date(deal.time).toISOString(),
        exit_time: new Date(deal.time).toISOString(),
        status: 'CLOSED',
      }
    })
  }

  /**
   * Get account history stats (daily P&L, win rate, etc.)
   * NOTE: not currently called from any route/component in this app.
   */
  async getAccountStats(accountId: string): Promise<{
    daily_pnl: number
    total_trades_today: number
    winning_trades: number
    losing_trades: number
    win_rate: number
  }> {
    try {
      const trades = await this.getTrades(accountId)
      const today = new Date().toISOString().split('T')[0]

      const todaysTrades = trades.filter((t) => t.entry_time.startsWith(today))
      const closedTrades = todaysTrades.filter((t) => t.status === 'CLOSED')
      const winningTrades = closedTrades.filter((t) => t.profit > 0)
      const losingTrades = closedTrades.filter((t) => t.profit <= 0)

      return {
        daily_pnl: closedTrades.reduce((sum, t) => sum + t.profit, 0),
        total_trades_today: todaysTrades.length,
        winning_trades: winningTrades.length,
        losing_trades: losingTrades.length,
        win_rate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      }
    } catch (error) {
      console.error('[v0] Failed to calculate account stats:', error)
      throw error
    }
  }
}

export default MetaApiClient

// Export singleton instance
export const metaApiClient = new MetaApiClient()
