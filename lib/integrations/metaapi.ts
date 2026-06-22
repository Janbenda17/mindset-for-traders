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
   * Create a provisioning profile for a broker server, then create the
   * MetaTrader account itself using that profile. This is the real two-step
   * flow MetaApi requires - the old code tried to create an account directly
   * with no profile and against a host that doesn't exist.
   *
   * version 5 = MetaTrader 5, version 4 = MetaTrader 4.
   */
  async authenticateWithCredentials(credentials: {
    login: string
    password: string
    broker: string
    platform?: 'mt4' | 'mt5'
  }): Promise<string> {
    if (!this.apiKey) {
      throw new Error('MetaApi is not configured on the server (missing METAAPI_API_KEY).')
    }

    const version = credentials.platform === 'mt4' ? 4 : 5

    try {
      console.log('[v0] Creating MetaApi provisioning profile for broker:', credentials.broker)

      const profileResponse = await fetch(`${this.provisioningBaseUrl}/users/current/provisioning-profiles`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({
          name: `profile-${credentials.login}-${Date.now()}`,
          version,
          brokerTimezone: 'EET',
          brokerDSTSwitchTimezone: 'EET',
        }),
      })

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text()
        console.error('[v0] Failed to create provisioning profile:', profileResponse.status, errorText)
        throw new Error(`MetaApi rejected the provisioning profile (${profileResponse.status}): ${errorText}`)
      }

      const profile = await profileResponse.json()
      const provisioningProfileId = profile.id

      if (!provisioningProfileId) {
        throw new Error('MetaApi did not return a provisioning profile id')
      }

      console.log('[v0] Creating MetaApi account for login:', credentials.login)

      const accountResponse = await fetch(`${this.provisioningBaseUrl}/users/current/accounts`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({
          login: credentials.login,
          password: credentials.password,
          name: `MT-${credentials.login}`,
          server: credentials.broker,
          provisioningProfileId,
          magic: Math.floor(Math.random() * 900000) + 100000,
          application: 'MetaApi',
          type: 'cloud-g2',
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
      return accountId
    } catch (error) {
      console.error('[v0] MetaApi authentication with credentials failed:', error)
      throw error instanceof Error
        ? error
        : new Error('Failed to connect to MT5. Check your credentials and broker name.')
    }
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
        connected: account.connectionStatus === 'connected',
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
   * Fetch open positions for an account.
   * NOTE: not currently called from any route/component in this app - kept
   * for future use. MetaApi's real history (closed trades) lives behind a
   * separate "deals by time range" endpoint, not a single /trades list; if
   * this is wired up later it needs both open-positions and deals calls.
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
