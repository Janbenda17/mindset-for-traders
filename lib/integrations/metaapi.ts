/**
 * MetaApi Client
 * Universal proxy for MT4/MT5 trading terminals
 * Handles account connection, live trades, and equity tracking
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
  private baseUrl = 'https://api-v1.metaapi.cloud'
  private clientId: string
  private clientSecret: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.METAAPI_API_KEY || ''
    this.clientId = process.env.METAAPI_CLIENT_ID || process.env.NEXT_PUBLIC_METAAPI_CLIENT_ID || ''
    this.clientSecret = process.env.METAAPI_CLIENT_SECRET || ''
    
    if (!this.apiKey) {
      console.warn('[v0] METAAPI_API_KEY is not configured')
    }
    if (!this.clientId) {
      console.warn('[v0] METAAPI_CLIENT_ID is not configured - OAuth will not work')
    }
  }

  /**
   * Generate MetaApi OAuth2 authorization URL
   * User will authenticate on MetaApi.cloud with their MT5 credentials
   */
  getOAuthUrl(userId: string): string {
    if (!this.clientId) {
      throw new Error('MetaApi OAuth is not configured. Please set METAAPI_CLIENT_ID in environment variables.')
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/callbacks/metaapi`
    
    // MetaApi OAuth2 endpoint
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: userId,
      scope: 'accounts:read trades:read',
    })

    return `https://auth.metaapi.cloud/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{ access_token: string; account_id: string }> {
    try {
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/callbacks/metaapi`
      
      const response = await fetch('https://auth.metaapi.cloud/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: redirectUri,
        }).toString(),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`OAuth token exchange failed: ${error}`)
      }

      const data = await response.json()
      
      // Fetch the primary account ID from the token
      const accountInfo = await this.getAccountsFromToken(data.access_token)
      const primaryAccountId = accountInfo[0]?.id || ''

      return {
        access_token: data.access_token,
        account_id: primaryAccountId,
      }
    } catch (error) {
      console.error('[v0] OAuth token exchange failed:', error)
      throw error
    }
  }

  /**
   * Get user's accounts from OAuth token
   */
  private async getAccountsFromToken(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts with token: ${response.statusText}`)
      }

      const data = await response.json()
      return data.accounts || []
    } catch (error) {
      console.error('[v0] Failed to fetch accounts from token:', error)
      return []
    }
  }

  /**
   * Connect to a MetaTrader account via MetaApi
   * User must provide MetaApi account ID and API key
   */
  async connectAccount(
    accountId: string,
    brokerName: string,
  ): Promise<MetaApiConnection> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
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
        `${this.baseUrl}/accounts/${accountId}/account-information`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch account info: ${response.statusText}`,
        )
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
   * Fetch open and recently closed trades
   */
  async getTrades(accountId: string, limit = 50): Promise<MetaApiTrade[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}/trades?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch trades: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform MetaApi trade format to ours
      return (data.trades || []).map(
        (trade: Record<string, any>): MetaApiTrade => ({
          id: trade.id || trade.ticket?.toString() || '',
          symbol: trade.symbol || '',
          type: trade.type === 0 ? 'BUY' : 'SELL',
          volume: trade.volume || 0,
          entry_price: trade.openPrice || 0,
          current_price: trade.currentPrice || trade.closePrice || 0,
          profit: trade.profit || 0,
          profit_pips: trade.profitInPips || 0,
          entry_time: new Date(trade.openTime).toISOString(),
          exit_time: trade.closeTime
            ? new Date(trade.closeTime).toISOString()
            : undefined,
          status: trade.state === 'CLOSED' ? 'CLOSED' : 'OPEN',
        }),
      )
    } catch (error) {
      console.error('[v0] Failed to fetch trades from MetaApi:', error)
      throw error
    }
  }

  /**
   * Get account history stats (daily P&L, win rate, etc.)
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

      // Filter trades from today
      const todaysTrades = trades.filter((t) =>
        t.entry_time.startsWith(today),
      )

      // Calculate stats
      const closedTrades = todaysTrades.filter((t) => t.status === 'CLOSED')
      const winningTrades = closedTrades.filter((t) => t.profit > 0)
      const losingTrades = closedTrades.filter((t) => t.profit <= 0)

      return {
        daily_pnl: closedTrades.reduce((sum, t) => sum + t.profit, 0),
        total_trades_today: todaysTrades.length,
        winning_trades: winningTrades.length,
        losing_trades: losingTrades.length,
        win_rate:
          closedTrades.length > 0
            ? (winningTrades.length / closedTrades.length) * 100
            : 0,
      }
    } catch (error) {
      console.error('[v0] Failed to calculate account stats:', error)
      throw error
    }
  }

  /**
   * Authenticate with MT5 credentials (login, password, broker)
   * Creates a MetaApi account for the user and returns account ID
   */
  async authenticateWithCredentials(credentials: {
    login: string
    password: string
    broker: string
  }): Promise<string> {
    try {
      console.log('[v0] Authenticating with MT5 credentials for broker:', credentials.broker)

      // Create a MetaApi account using the provided MT5 credentials
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `MT5-${credentials.login}`,
          type: 'mt5',
          login: credentials.login,
          password: credentials.password,
          server: credentials.broker,
          platformType: 'mt5',
          tags: ['trader-mindset'],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create MetaApi account: ${error}`)
      }

      const data = await response.json()
      const accountId = data.id

      if (!accountId) {
        throw new Error('No account ID returned from MetaApi')
      }

      console.log('[v0] MetaApi account created:', accountId)
      return accountId
    } catch (error) {
      console.error('[v0] MetaApi authentication with credentials failed:', error)
      throw new Error('Failed to connect to MT5. Check your credentials and broker name.')
    }
  }

  /**
   * Authenticate and connect user's MetaApi account via OAuth token
   */
  async authenticateAccount(accessToken: string, accountId: string): Promise<string> {
    try {
      console.log('[v0] Authenticating MetaApi account with token')

      // Validate the token by fetching account info
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to validate MetaApi account: ${response.statusText}`)
      }

      console.log('[v0] MetaApi account authenticated:', accountId)
      return accountId
    } catch (error) {
      console.error('[v0] MetaApi authentication failed:', error)
      throw new Error('Failed to authenticate MetaApi account.')
    }
  }
}

export default MetaApiClient

// Export singleton instance
export const metaApiClient = new MetaApiClient()
