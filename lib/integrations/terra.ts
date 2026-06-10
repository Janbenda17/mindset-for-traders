import axios from 'axios'

const TERRA_API_BASE = 'https://api.tryterra.co/v2'

interface TerraSyncData {
  sleep?: {
    duration_seconds: number
    start_time: string
    end_time: string
  }
  heart_rate?: {
    avg: number
    max: number
    min: number
  }
  steps?: number
  active_minutes?: number
  calories?: number
  stress?: {
    level: number
  }
}

export class TerraClient {
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.apiKey = process.env.TERRA_API_KEY || ''
    this.apiSecret = process.env.TERRA_API_SECRET || ''

    if (!this.apiKey || !this.apiSecret) {
      console.warn('[Terra] API credentials not configured')
    }
  }

  /**
   * Generate OAuth URL for user to connect Apple Health
   */
  generateOAuthUrl(redirectUrl: string): string {
    const clientId = process.env.TERRA_CLIENT_ID || ''
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUrl,
      response_type: 'code',
      scope: 'activity sleep heart_rate stress',
    })
    return `https://api.tryterra.co/oauth?${params.toString()}`
  }

  /**
   * Exchange OAuth code for user token
   */
  async exchangeOAuthCode(code: string): Promise<{
    userId: string
    accessToken: string
    referenceId: string
  }> {
    try {
      const response = await axios.post(`${TERRA_API_BASE}/auth/user/create`, {
        code,
        client_id: process.env.TERRA_CLIENT_ID,
        client_secret: process.env.TERRA_API_SECRET,
      })

      return {
        userId: response.data.user_id,
        accessToken: response.data.access_token,
        referenceId: response.data.reference_id,
      }
    } catch (err) {
      console.error('[Terra] OAuth exchange failed:', err)
      throw new Error('Failed to exchange OAuth code')
    }
  }

  /**
   * Get latest health data for a user
   */
  async getLatestData(terraUserId: string): Promise<TerraSyncData> {
    try {
      const response = await axios.get(
        `${TERRA_API_BASE}/user/${terraUserId}/latest?with_samples=true`,
        {
          headers: this.getAuthHeaders(),
        }
      )

      const data = response.data.data

      return {
        sleep: data.sleep?.[0]
          ? {
              duration_seconds: data.sleep[0].duration_seconds,
              start_time: data.sleep[0].start_time,
              end_time: data.sleep[0].end_time,
            }
          : undefined,
        heart_rate: data.heart_rate?.[0]
          ? {
              avg: data.heart_rate[0].avg_heart_rate,
              max: data.heart_rate[0].max_heart_rate,
              min: data.heart_rate[0].min_heart_rate,
            }
          : undefined,
        steps: data.activity?.[0]?.steps,
        active_minutes: data.activity?.[0]?.active_minutes,
        calories: data.activity?.[0]?.calories,
        stress: data.mental_state?.[0]?.stress_level
          ? { level: data.mental_state[0].stress_level }
          : undefined,
      }
    } catch (err) {
      console.error('[Terra] Failed to get latest data:', err)
      throw new Error('Failed to fetch health data')
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex')

    return signature === expectedSignature
  }

  private getAuthHeaders() {
    return {
      'X-API-Key': this.apiKey,
      'X-API-Secret': this.apiSecret,
      'Content-Type': 'application/json',
    }
  }
}

export const terraClient = new TerraClient()
