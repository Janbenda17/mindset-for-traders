'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader, X, Plug } from 'lucide-react'
import Link from 'next/link'
import { connectMetaApi, disconnectMetaApi } from './actions'

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return supabaseInstance
}

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [metaApiConnected, setMetaApiConnected] = useState(false)
  const [connectedBroker, setConnectedBroker] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'mt5' | 'mt4'>('mt5')
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
      router.replace('/account/integrations')
    }
    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      setTimeout(() => {
        setSuccess('')
        setMetaApiConnected(true)
      }, 3000)
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

        const { data, error } = await getSupabase()
          .from('profiles')
          .select('metaapi_token, metaapi_account_id, mt4_broker')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('[v0] Error checking profile:', error)
          return
        }

        if (data) {
          console.log('[v0] Profile found:', data)
          setMetaApiConnected(!!data.metaapi_token && !!data.metaapi_account_id)
          setConnectedBroker(data.mt4_broker || null)
        }
      } catch (err) {
        console.error('[v0] Error checking integration status:', err)
      } finally {
        setChecking(false)
      }
    }

    checkIntegrationStatus()
  }, [user?.id])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in first</p>
      </div>
    )
  }

  const handleConnect = async () => {
    if (!metaApiLogin || !metaApiPassword || !metaApiBroker) {
      setError('Please fill in all fields')
      setTimeout(() => setError(''), 3000)
      return
    }

    setLoading(true)
    setError('')
    try {
      console.log('[v0] Connecting MetaTrader account via MetaApi...')
      const result = await connectMetaApi(user.id, {
        login: metaApiLogin,
        password: metaApiPassword,
        broker: metaApiBroker,
        platform,
      })

      if (!result?.success) {
        setError(result?.error || 'Failed to connect your MetaTrader account')
        setTimeout(() => setError(''), 6000)
        return
      }

      setMetaApiConnected(true)
      setConnectedBroker(metaApiBroker)
      setMetaApiLogin('')
      setMetaApiPassword('')
      setMetaApiBroker('')
      setSuccess('Account connected! Trades will sync every 30 seconds.')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect your account'
      setError(errorMsg)
      console.error('[v0] Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      console.log('[v0] Disconnecting MetaTrader account...')
      const result = await disconnectMetaApi(user.id)
      if (!result?.success) {
        setError(result?.error || 'Failed to disconnect')
        setTimeout(() => setError(''), 6000)
        return
      }
      setMetaApiConnected(false)
      setConnectedBroker(null)
      setSuccess('Disconnected')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to disconnect')
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
            <p className="text-slate-400 mt-1">Connect your trading account</p>
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

        {/* Single unified MetaTrader connect flow */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">MetaTrader Account</h2>
            <p className="text-sm text-slate-400 mt-1">
              Connect your MT4 or MT5 account to sync trades automatically, in real time, via MetaApi.
            </p>
          </div>

          {metaApiConnected ? (
            <Card className="bg-slate-900/50 border-emerald-600/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-300" />
                    <div>
                      <p className="font-semibold text-white">
                        Connected{connectedBroker ? `: ${connectedBroker}` : ''}
                      </p>
                      <p className="text-sm text-slate-400">Trades syncing every 30 seconds</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDisconnect}
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
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPlatform('mt5')}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        platform === 'mt5'
                          ? 'border-white bg-slate-800 text-white'
                          : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      MetaTrader 5
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('mt4')}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        platform === 'mt4'
                          ? 'border-white bg-slate-800 text-white'
                          : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      MetaTrader 4
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Enter your {platform === 'mt5' ? 'MT5' : 'MT4'} credentials. We connect securely via
                  MetaApi — your password is encrypted.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Login (Account Number)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 123456789"
                    value={metaApiLogin}
                    onChange={(e) => setMetaApiLogin(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Your trading account password"
                    value={metaApiPassword}
                    onChange={(e) => setMetaApiPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Broker server</label>
                  <Input
                    type="text"
                    placeholder="e.g., ICMarketsSC-Demo, Pepperstone-Live"
                    value={metaApiBroker}
                    onChange={(e) => setMetaApiBroker(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleConnect}
                    disabled={loading || !metaApiLogin || !metaApiPassword || !metaApiBroker}
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
