'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader, X, Plug, Lock, Hash, Server, ShieldCheck, Zap } from 'lucide-react'
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
  const { user, authReady } = useAuth()
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

  // Not logged in - send straight to login instead of showing an inline message
  useEffect(() => {
    if (authReady && !user) {
      router.replace('/login')
    }
  }, [authReady, user, router])

  // Check integration status on mount
  useEffect(() => {
    if (!user?.id) return

    const checkIntegrationStatus = async () => {
      try {
        setChecking(true)
        console.log('[v0] Checking integration status for user:', user.id)

        const { data, error } = await getSupabase()
          .from('profiles')
          .select('metaapi_token, metaapi_account_id, metaapi_broker')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          console.error('[v0] Error checking profile:', error)
          return
        }

        if (data) {
          console.log('[v0] Profile found:', data)
          setMetaApiConnected(!!data.metaapi_token && !!data.metaapi_account_id)
          setConnectedBroker(data.metaapi_broker || null)
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
        <Loader className="w-6 h-6 animate-spin text-slate-500" />
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
      setSuccess(
        result.connected
          ? 'Account connected! Trades will sync every 30 seconds.'
          : 'Account created and logging into your broker - this can take a minute on first connect. Trades will start syncing automatically once it finishes.',
      )
      setTimeout(() => setSuccess(''), 8000)
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
        <div className="flex items-center gap-2 text-sm">
          <Link href="/account" className="text-slate-400 hover:text-slate-300 transition-colors">
            Account
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-medium">Integrations</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20 flex-shrink-0">
            <Plug className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Connected Services</h1>
            <p className="text-slate-400 mt-1">Connect your trading account to sync data automatically</p>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-lg flex gap-3 items-start backdrop-blur-sm">
            <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-300 text-sm font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex gap-3 items-start backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Single unified MetaTrader connect flow */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">MetaTrader Account</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Connect your MT4 or MT5 account to sync trades automatically, in real time, via MetaApi.
              </p>
            </div>
          </div>

          {metaApiConnected ? (
            <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900/50 border-emerald-600/50 overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 flex-shrink-0">
                      <span className="absolute inline-flex h-2.5 w-2.5 top-0 right-0 rounded-full bg-emerald-400 animate-pulse" />
                      <Check className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Connected{connectedBroker ? `: ${connectedBroker}` : ''}
                      </p>
                      <p className="text-sm text-emerald-300/80">Trades syncing every 30 seconds</p>
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
            <Card className="bg-slate-900 border-slate-700 shadow-xl shadow-black/20">
              <CardContent className="pt-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPlatform('mt5')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        platform === 'mt5'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      MetaTrader 5
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('mt4')}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        platform === 'mt4'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      MetaTrader 4
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-slate-400">
                    Enter your {platform === 'mt5' ? 'MT5' : 'MT4'} credentials. Connection is encrypted
                    end-to-end via MetaApi — your password is never stored in plain text.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Login (Account Number)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="e.g., 123456789"
                      value={metaApiLogin}
                      onChange={(e) => setMetaApiLogin(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Your trading account password"
                      value={metaApiPassword}
                      onChange={(e) => setMetaApiPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Broker Server
                  </label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="e.g., ICMarketsSC-Demo, Pepperstone-Live"
                      value={metaApiBroker}
                      onChange={(e) => setMetaApiBroker(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleConnect}
                    disabled={loading || !metaApiLogin || !metaApiPassword || !metaApiBroker}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
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
                  <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-3">
                    <Lock className="w-3 h-3" />
                    Secured connection · Powered by MetaApi
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
