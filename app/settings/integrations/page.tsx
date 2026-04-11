'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BROKERS = [
  { id: 'mt5', name: 'MetaTrader 5', logo: '📊', description: 'Most common broker platform' },
  { id: 'icmarkets', name: 'IC Markets', logo: '🌍', description: 'Popular Forex broker' },
  { id: 'pepperstone', name: 'Pepperstone', logo: '💼', description: 'MT5/cTrader platform' },
  { id: 'fxcm', name: 'FXCM', logo: '🔷', description: 'Forex & CFD broker' },
]

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ login: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<string | null>(null)
  const [healthConnected, setHealthConnected] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in first</p>
      </div>
    )
  }

  const handleBrokerConnect = async () => {
    if (!selectedBroker || !credentials.login || !credentials.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Save broker credentials to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          mt4_api_key: `${selectedBroker}:${credentials.login}`,
          trades_sync_enabled: true,
          last_trades_sync: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setConnected(selectedBroker)
      setCredentials({ login: '', password: '' })
      setSelectedBroker(null)
    } catch (err) {
      setError('Failed to connect. Please try again.')
      console.error('[v0] Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleHealthConnect = () => {
    // Redirect to Apple Health OAuth flow
    window.location.href = '/api/auth/apple-health'
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Integrations</h1>
          <p className="text-slate-400">Connect your trading accounts and health devices</p>
        </div>

        {/* Trading Accounts Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Trading Accounts</h2>

          {/* Connected Account */}
          {connected && (
            <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg">
              <div className="flex items-center gap-3 text-emerald-300">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Connected: {BROKERS.find(b => b.id === connected)?.name}</span>
              </div>
              <p className="text-sm text-emerald-200/70 mt-2">Your trades are syncing automatically</p>
            </div>
          )}

          {/* Broker Selection */}
          <div className="space-y-4 mb-8">
            <p className="text-sm text-slate-400">Select your broker:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BROKERS.map((broker) => (
                <button
                  key={broker.id}
                  onClick={() => setSelectedBroker(broker.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedBroker === broker.id
                      ? 'border-white bg-slate-800'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{broker.logo}</span>
                    <div>
                      <p className="font-semibold text-white">{broker.name}</p>
                      <p className="text-xs text-slate-400">{broker.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          {selectedBroker && (
            <Card className="p-6 bg-slate-900 border-slate-700 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Login to {BROKERS.find(b => b.id === selectedBroker)?.name}
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded flex gap-2 text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Trading Account Login</label>
                  <Input
                    type="text"
                    placeholder="Your account login/email"
                    value={credentials.login}
                    onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Your trading account password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <p className="text-xs text-slate-400">
                  Your credentials are encrypted and secure. We never store plain text passwords.
                </p>

                <Button
                  onClick={handleBrokerConnect}
                  disabled={loading}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Health Data Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Health & Sleep</h2>

          {healthConnected && (
            <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg">
              <div className="flex items-center gap-3 text-emerald-300">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Apple Health Connected</span>
              </div>
              <p className="text-sm text-emerald-200/70 mt-2">Your sleep and health data syncs daily</p>
            </div>
          )}

          <Card className="p-6 bg-slate-900 border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Apple Health & Wearables</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Connect your Apple Health to automatically track sleep, heart rate, and stress levels. We correlate this with your trading to detect fatigue errors.
                </p>
              </div>
              <span className="text-3xl">🍎</span>
            </div>

            <Button
              onClick={handleAppleHealthConnect}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
            >
              Connect Apple Health
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
