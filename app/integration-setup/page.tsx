'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Copy, Check, AlertCircle, Zap, Apple, Cloud } from 'lucide-react'

export default function IntegrationSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [mt4Token, setMt4Token] = useState('')
  const [terraId, setTerraId] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/trades/webhook`
  const generatedToken = user?.id?.substring(0, 12) + '-mt4-' + Date.now()

  const handleSave = async () => {
    if (!mt4Token && !terraId) {
      setError('Please enter at least one integration')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/profile/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt4_webhook_token: mt4Token || undefined,
          terra_id: terraId || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to save integrations')
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
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
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">MetaTrader Automation</h2>
                <p className="text-slate-400">Every trade automatically synced to MindTrader</p>
              </div>
            </div>

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

              {/* Step 3: Input Token */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Step 3: Paste Your Webhook Token Here</h3>
                <input
                  type="text"
                  value={mt4Token}
                  onChange={(e) => setMt4Token(e.target.value)}
                  placeholder="Paste your webhook token here"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">Paste the token you generated above</p>
              </div>

              {/* EA Script Instructions */}
              <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Next: Install EA Script in MetaTrader</h4>
                <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Download the MindTrader EA script</li>
                  <li>Open MetaTrader → File → Open Data Folder</li>
                  <li>Go to MQL4/Experts and paste the EA script</li>
                  <li>In MetaTrader, paste this webhook URL in the EA settings</li>
                  <li>Paste your webhook token in the EA settings</li>
                  <li>Attach the EA to your chart - trades auto-sync now!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Apple Health Setup */}
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Apple className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Apple Health Integration</h2>
                <p className="text-slate-400">Sleep data syncs automatically every morning</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Terra API ID</h3>
                <input
                  type="text"
                  value={terraId}
                  onChange={(e) => setTerraId(e.target.value)}
                  placeholder="Paste your Terra API reference ID"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">You&apos;ll get this from Terra API console after connecting Apple Health</p>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                <h4 className="text-sm font-semibold text-green-300 mb-2">How to get your Terra API ID:</h4>
                <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://terra.co" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">terra.co</a></li>
                  <li>Sign up and connect your Apple Health</li>
                  <li>Copy your &quot;reference_id&quot; from the API console</li>
                  <li>Paste it above</li>
                  <li>Your sleep data will sync every morning automatically!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading || (!mt4Token && !terraId)}
              className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Integrations'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              Skip for Now
            </Button>
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
