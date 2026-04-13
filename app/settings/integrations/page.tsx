'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BROKERS = [
  { id: 'mt5-demo', name: 'MetaTrader 5 Demo', logo: '📊', description: 'Demo trading account' },
  { id: 'mt5-live', name: 'MetaTrader 5 Live', logo: '📊', description: 'Live trading account' },
  { id: 'mt4-demo', name: 'MetaTrader 4 Demo', logo: '📈', description: 'Demo trading account' },
  { id: 'mt4-live', name: 'MetaTrader 4 Live', logo: '📈', description: 'Live trading account' },
]

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ login: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checking, setChecking] = useState(true)

  // Check integration status on mount
  useEffect(() => {
    if (!user?.id) return

    const checkIntegrationStatus = async () => {
      try {
        setChecking(true)
        const { data } = await supabase
          .from('profiles')
          .select('mt4_broker, terra_id, sleep_sync_enabled')
          .eq('user_id', user.id)
          .single()

        if (data) {
          if (data.mt4_broker) {
            setConnected(data.mt4_broker)
          }
        }
      } catch (err) {
        console.error('[v0] Error checking integration status:', err)
      } finally {
        setChecking(false)
      }
    }

    checkIntegrationStatus()
  }, [user?.id])

  // Check for query parameters (success/error from oauth callback)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const successParam = searchParams.get('success')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(`Connection failed: ${errorParam}`)
      window.history.replaceState({}, '', '/settings/integrations')
      setTimeout(() => setError(''), 5000)
    }
  }, [])

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
      setTimeout(() => setError(''), 3000)
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[v0] Connecting to MetaTrader...')

      const response = await fetch('/api/brokers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          broker: selectedBroker,
          login: credentials.login,
          password: credentials.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to MetaTrader')
      }

      console.log('[v0] MetaTrader connected successfully')
      setConnected(selectedBroker)
      setCredentials({ login: '', password: '' })
      setSelectedBroker(null)
      setSuccess(`${BROKERS.find(b => b.id === selectedBroker)?.name} connected successfully! Trades are now syncing.`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
      setError(errorMessage)
      console.error('[v0] Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectBroker = async () => {
    if (!connected) return

    setLoading(true)
    try {
      console.log('[v0] Disconnecting MetaTrader...')

      const { error } = await supabase
        .from('profiles')
        .update({
          mt4_login: null,
          mt4_password: null,
          mt4_broker: null,
          trades_sync_enabled: false,
        })
        .eq('user_id', user.id)

      if (error) throw error

      console.log('[v0] MetaTrader disconnected')
      setConnected(null)
      setSuccess('MetaTrader disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect')
      console.error('[v0] Disconnection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleHealthConnect = () => {
    console.log('[v0] Initiating Apple Health OAuth flow...')
    window.location.href = '/api/auth/apple-health'
  }

  const handleDisconnectAppleHealth = async () => {
    setLoading(true)
    try {
      console.log('[v0] Disconnecting Apple Health...')

      const { error } = await supabase
        .from('profiles')
        .update({
          terra_id: null,
          terra_reference_id: null,
          sleep_sync_enabled: false,
        })
        .eq('user_id', user.id)

      if (error) throw error

      console.log('[v0] Apple Health disconnected')
      setHealthConnected(false)
      setSuccess('Apple Health disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect Apple Health')
      console.error('[v0] Apple Health disconnection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleHealthConnect = () => {
    console.log('[v0] Initiating Apple Health OAuth flow...')
    window.location.href = '/api/auth/apple-health'
  }

  const handleDisconnectAppleHealth = async () => {
    setLoading(true)
    try {
      console.log('[v0] Disconnecting Apple Health...')

      const { error } = await supabase
        .from('profiles')
        .update({
          terra_id: null,
          terra_reference_id: null,
          sleep_sync_enabled: false,
        })
        .eq('user_id', user.id)

      if (error) throw error

      console.log('[v0] Apple Health disconnected')
      setHealthConnected(false)
      setSuccess('Apple Health disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect Apple Health')
      console.error('[v0] Apple Health disconnection error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Integrations</h1>
          <p className="text-slate-400">Connect your MetaTrader account to sync trades automatically</p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg flex gap-3 items-start">
            <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-300">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Trading Accounts Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Trading Accounts</h2>

          {/* Connected Account */}
          {connected && (
            <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-300">
                  <Check className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Connected: {BROKERS.find(b => b.id === connected)?.name}</p>
                    <p className="text-sm text-emerald-200/70">Your trades are syncing automatically</p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnectBroker}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-400 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Broker Selection */}
          {!connected && (
            <>
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Trading Account Login</label>
                      <Input
                        type="text"
                        placeholder="Your account login number"
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
                      🔒 Your credentials are encrypted and secure. We automatically connect to MetaTrader to collect your trades.
                    </p>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleBrokerConnect}
                        disabled={loading}
                        className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-bold"
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
                      <Button
                        onClick={() => {
                          setSelectedBroker(null)
                          setCredentials({ login: '', password: '' })
                        }}
                        disabled={loading}
                        variant="ghost"
                        className="text-slate-400"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
