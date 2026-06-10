'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader, X, Plug } from 'lucide-react'
import Link from 'next/link'
import { ensureProfileExists, updateAppleHealth, connectVital, connectMetaApi, disconnectMetaApi } from './actions'

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
  const searchParams = useSearchParams()
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ login: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<string | null>(null)
  const [appleHealthConnected, setAppleHealthConnected] = useState(false)
  const [vitalConnected, setVitalConnected] = useState(false)
  const [metaApiConnected, setMetaApiConnected] = useState(false)
  const [metaApiLogin, setMetaApiLogin] = useState('')
  const [metaApiPassword, setMetaApiPassword] = useState('')
  const [metaApiBroker, setMetaApiBroker] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checking, setChecking] = useState(true)

  // Handle OAuth callback messages
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      setTimeout(() => setError(''), 5000)
      // Clean up URL
      router.replace('/account/integrations')
    }
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      setTimeout(() => {
        setSuccess('')
        setMetaApiConnected(true)
      }, 3000)
      // Clean up URL
      router.replace('/account/integrations')
    }
  }, [searchParams, router])

  // Check integration status on mount
  useEffect(() => {
    if (!user?.id) return

    const checkIntegrationStatus = async () => {
      try {
        setChecking(true)
        console.log('[v0] Checking integration status for user:', user.id)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('mt4_broker, apple_health_connected')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('[v0] Error checking profile:', error)
          return
        }

        if (data) {
          console.log('[v0] Profile found:', data)
          if (data.mt4_broker) {
            setConnected(data.mt4_broker)
          }
          setAppleHealthConnected(!!data.apple_health_connected)
          setVitalConnected(!!data.vital_id)
          setMetaApiConnected(!!data.metaapi_token && !!data.metaapi_account_id)
        }
      } catch (err) {
        console.error('[v0] Error checking integration status:', err)
      } finally {
        setChecking(false)
      }
    }

    checkIntegrationStatus()
  }, [user?.id])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(`Connection failed: ${errorParam}`)
      window.history.replaceState({}, '', '/account/integrations')
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

  const handleVitalConnect = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('[v0] Connecting to Vital (Apple Health)...')
      await ensureProfileExists(user.id)
      
      // Get Vital OAuth URL from server action
      const result = await connectVital(user.id)
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start Vital connection'
      setError(errorMsg)
      console.error('[v0] Vital connection error:', err)
      setLoading(false)
    }
  }

  const handleMetaApiConnect = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('[v0] Initiating MetaApi OAuth...')
      await ensureProfileExists(user.id)
      
      // Get MetaApi OAuth URL from server action
      const result = await connectMetaApi(user.id)
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start MetaApi connection'
      setError(errorMsg)
      console.error('[v0] MetaApi connection error:', err)
      setLoading(false)
    }
  }

  const handleMetaApiDisconnect = async () => {
    setLoading(true)
    try {
      console.log('[v0] Disconnecting MetaApi...')
      await disconnectMetaApi(user.id)
      setMetaApiConnected(false)
      setSuccess('MetaApi disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect MetaApi')
      console.error('[v0] Disconnect error:', err)
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
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="space-y-6">
      {/* Header with Back Link */}
      <div className="flex items-center gap-2">
        <Link href="/account" className="text-slate-400 hover:text-slate-300 transition-colors">
          Account
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 font-medium">Integrations</span>
      </div>

      <div className="flex items-start gap-3">
        <Plug className="w-6 h-6 text-white mt-1" />
        <div>
          <h1 className="text-3xl font-bold text-white">Connected Services</h1>
          <p className="text-slate-400 mt-1">Connect your trading and health accounts</p>
        </div>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg flex gap-3 items-start">
          <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-300">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* MetaTrader Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">MetaTrader Accounts</h2>
          <p className="text-sm text-slate-400 mt-1">Connect your trading accounts to sync trades automatically</p>
        </div>

        {connected ? (
          <Card className="bg-slate-900/50 border-emerald-600/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <div>
                    <p className="font-semibold text-white">Connected: {BROKERS.find(b => b.id === connected)?.name}</p>
                    <p className="text-sm text-slate-400">Your trades are syncing automatically</p>
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
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BROKERS.map((broker) => (
                <button
                  key={broker.id}
                  onClick={() => setSelectedBroker(broker.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedBroker === broker.id
                      ? 'border-white bg-slate-800'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{broker.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{broker.name}</p>
                      <p className="text-xs text-slate-400">{broker.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedBroker && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Login to {BROKERS.find(b => b.id === selectedBroker)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Trading Account Login</label>
                    <Input
                      type="text"
                      placeholder="Your account login number"
                      value={credentials.login}
                      onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <Input
                      type="password"
                      placeholder="Your trading account password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <p className="text-xs text-slate-400">
                    Your credentials are encrypted and secure. We connect to MetaTrader to collect your trades.
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleBrokerConnect}
                      disabled={loading}
                      className="flex-1 bg-white text-slate-900 hover:bg-slate-100 font-medium"
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
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Apple Health / Vital Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Health & Sleep Tracking</h2>
          <p className="text-sm text-slate-400 mt-1">Connect Apple Health via Vital to track sleep, heart rate, and stress</p>
        </div>

        {vitalConnected ? (
          <Card className="bg-slate-900/50 border-emerald-600/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <div>
                    <p className="font-semibold text-white">Vital Connected (Apple Health)</p>
                    <p className="text-sm text-slate-400">Health data syncing in real-time</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setVitalConnected(false)
                    setSuccess('Vital disconnected')
                  }}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-400 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🍎</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Apple Health</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Connect your Apple Health to track sleep quality, heart rate, HRV, and stress levels that affect trading performance.
                  </p>
                  <Button
                    onClick={handleVitalConnect}
                    disabled={loading}
                    className="bg-white text-slate-900 hover:bg-slate-100 font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect Apple Health
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MetaApi Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">MetaApi - Live Trading</h2>
          <p className="text-sm text-slate-400 mt-1">Connect MetaTrader 5 via MetaApi for real-time trade syncing</p>
        </div>

        {metaApiConnected ? (
          <Card className="bg-slate-900/50 border-emerald-600/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-300" />
                  <div>
                    <p className="font-semibold text-white">MetaApi Connected</p>
                    <p className="text-sm text-slate-400">Trades syncing every 30 seconds</p>
                  </div>
                </div>
                <Button
                  onClick={handleMetaApiDisconnect}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-400 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🚀</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">MetaTrader 5</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Connect your MetaTrader 5 account securely via MetaApi. Your credentials are never stored — handled directly by MetaApi.
                  </p>
                  <Button
                    onClick={handleMetaApiConnect}
                    disabled={loading}
                    className="bg-white text-slate-900 hover:bg-slate-100 font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Redirecting to MetaApi...
                      </>
                    ) : (
                      <>
                        Connect via MetaApi.cloud
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}
