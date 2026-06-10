import crypto from 'crypto'

interface VitalHealthData {
  sleep?: {
    total_sleep_duration: number // seconds
    sleep_start_time: string // ISO
    sleep_end_time: string // ISO
    sleep_efficiency?: number
  }
  heart_rate?: {
    average: number
    min: number
    max: number
  }
  heart_rate_variability?: {
    average: number
  }
  activity?: {
    steps: number
    calories_active: number
    calories_total: number
    active_duration: number // seconds
  }
  body?: {
    temperature?: number
    weight?: number
  }
  stress?: {
    average: number // 0-100
  }
}

interface VitalWebhookPayload {
  event: string
  user_id: string
  data: VitalHealthData
  timestamp: number
}

/**
 * Vital API Client
 * Handles OAuth flow, data fetching, and webhook verification
 */
export class VitalClient {
  private apiKey: string
  private webhookSecret: string
  private baseUrl = 'https://api.vital.co/v1'

  constructor() {
    this.apiKey = process.env.VITAL_API_KEY || ''
    this.webhookSecret = process.env.VITAL_WEBHOOK_SECRET || ''

    if (!this.apiKey) {
      throw new Error('VITAL_API_KEY is not configured')
    }
    if (!this.webhookSecret) {
      console.warn('VITAL_WEBHOOK_SECRET not set - webhook verification disabled')
    }
  }

  /**
   * Generate Vital OAuth URL for user to authenticate
   * User will be redirected to Vital to connect their Apple Health
   */
  getOAuthUrl(userId?: string): string {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/callbacks/vital`
    
    // Vital OAuth endpoint - direct link to their OAuth authorize
    const params = new URLSearchParams({
      client_id: process.env.VITAL_CLIENT_ID || 'default',
      redirect_uri: redirectUri,
      response_type: 'code',
      state: userId || '',
      scope: 'read sleep heart_rate activity',
    })

    return `https://vital.co/oauth/authorize?${params.toString()}`
  }

  /**
   * Get user health data from Vital API
   * Requires user ID from Vital after OAuth
   */
  async getUserHealthData(vitalUserId: string): Promise<VitalHealthData> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${vitalUserId}/data`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch health data: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[v0] Failed to fetch health data:', error)
      throw error
    }
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCode(code: string): Promise<{ access_token: string }> {
    const response = await fetch(`${this.baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      throw new Error(`Vital OAuth exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Fetch latest health data for a user
   */
  async getHealthData(userId: string, date?: string): Promise<VitalHealthData> {
    const params = new URLSearchParams({
      user_id: userId,
      date: date || new Date().toISOString().split('T')[0],
    })

    const response = await fetch(`${this.baseUrl}/user/health?${params}`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Vital health data: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Verify webhook signature from Vital
   * Returns true if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('[v0] Webhook verification skipped - secret not configured')
      return true
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  }

  /**
   * Parse and validate webhook payload
   */
  parseWebhook(payload: string, signature: string): VitalWebhookPayload {
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature')
    }

    return JSON.parse(payload) as VitalWebhookPayload
  }
}

export default VitalClient

// Export singleton instance
export const vitalApi = new VitalClient()
