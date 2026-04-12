'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Copy, Check, AlertCircle, Zap, Apple, Cloud, ArrowRight } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function IntegrationSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [healthConnected, setHealthConnected] = useState(false)
  const [metatraderConnected, setMetatraderConnected] = useState(false)

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/trades/webhook`
  const generatedToken = user?.id?.substring(0, 12) + '-mt4-' + Date.now()

  // Check integration status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('mt4_api_key, terra_id, sleep_sync_enabled')
          .eq('user_id', user?.id)
          .single()

        if (data) {
          setMetatraderConnected(!!data.mt4_api_key)
          setHealthConnected(!!data.terra_id && data.sleep_sync_enabled)
        }
      } catch (err) {
        console.error('[v0] Error checking integration status:', err)
      }
    }

    if (user?.id) checkStatus()
  }, [user?.id])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleOpenIntegrations = () => {
    router.push('/settings/integrations')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Connect Your Accounts</h1>
          <p className="text-lg text-slate-400">One-time setup. Everything else is automatic.</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 bg-green-900/30 border border-green-600/50 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-200">Integrations saved successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <div className="space-y-8">
          {/* MetaTrader Setup */}
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">MetaTrader Automation</h2>
                <p className="text-slate-400">Every trade automatically synced to MindTrader</p>
                {metatraderConnected && (
                  <div className="flex items-center gap-2 mt-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                )}
              </div>
            </div>

            {!metatraderConnected ? (
              <div className="space-y-6">
                {/* Step 1: Generate Token */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Step 1: Copy Your Webhook Token</h3>
                  <div className="bg-slate-800/80 rounded-lg p-4 flex items-center justify-between">
                    <code className="text-sm text-slate-200 font-mono">{generatedToken}</code>
                    <button
                      onClick={() => copyToClipboard(generatedToken, 'mt4-token')}
                      className="p-2 hover:bg-slate-700 rounded transition-colors"
                    >
                      {copiedField === 'mt4-token' ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Confirm you have this token copied</p>
                </div>

                {/* Step 2: Webhook URL */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Step 2: Copy Your Webhook URL</h3>
                  <div className="bg-slate-800/80 rounded-lg p-4 flex items-center justify-between">
                    <code className="text-sm text-slate-200 font-mono truncate">{webhookUrl}</code>
                    <button
                      onClick={() => copyToClipboard(webhookUrl, 'webhook-url')}
                      className="p-2 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                    >
                      {copiedField === 'webhook-url' ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">You&apos;ll need this for the EA script</p>
                </div>

                {/* Call to Action */}
                <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-300 mb-3">Ready to connect?</h4>
                  <Button
                    onClick={handleOpenIntegrations}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Open Integration Center
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <p className="text-green-300 text-sm">Your MetaTrader account is connected and syncing trades automatically.</p>
              </div>
            )}
          </div>

          {/* Apple Health Setup */}
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Apple className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">Apple Health Integration</h2>
                <p className="text-slate-400">Sleep data syncs automatically every morning</p>
                {healthConnected && (
                  <div className="flex items-center gap-2 mt-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                )}
              </div>
            </div>

            {!healthConnected ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-300 mb-3">Connect Apple Health:</h4>
                  <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                    <li>Click the button below to authorize Apple Health</li>
                    <li>Your sleep and health data will sync daily</li>
                    <li>We&apos;ll correlate it with your trading performance</li>
                  </ol>
                </div>

                <Button
                  onClick={handleOpenIntegrations}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Open Integration Center
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <p className="text-green-300 text-sm">Your Apple Health is connected and syncing daily.</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">How it works:</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-slate-500 mt-1">→</span>
                <span>Every time you close a trade in MT4, it automatically sends the data to MindTrader</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-500 mt-1">→</span>
                <span>Every morning, Apple Health sleep data syncs to your dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-500 mt-1">→</span>
                <span>Our AI analyzes the correlation and detects Fatigue Errors automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-500 mt-1">→</span>
                <span>You get insights without writing anything - completely automatic!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
