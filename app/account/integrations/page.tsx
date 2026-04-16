'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  AlertCircle,
  Loader,
  X,
  Plug,
  ChevronLeft,
  TrendingUp,
  Heart,
  Shield,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { ensureProfileExists, updateAppleHealth } from './actions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Translation helper
const useTranslation = () => {
  const [language, setLanguage] = useState<'cs' | 'en'>('cs')

  useEffect(() => {
    const stored = localStorage.getItem('language') as 'cs' | 'en' | null
    if (stored) setLanguage(stored)
  }, [])

  const t = {
    cs: {
      back: 'Zpět na účet',
      title: 'Integrace',
      subtitle: 'Propojte své obchodní a zdravotní účty',
      brokerSection: 'Obchodní účty',
      brokerDescription: 'Automatická synchronizace vašich obchodů z MetaTraderu',
      selectBroker: 'Vyberte svého brokera',
      loginTitle: 'Přihlášení do',
      accountLogin: 'Číslo obchodního účtu',
      accountLoginPlaceholder: 'Např. 123456789',
      password: 'Heslo',
      passwordPlaceholder: 'Heslo k obchodnímu účtu',
      security: 'Vaše přihlašovací údaje jsou šifrované a bezpečné.',
      connectAccount: 'Propojit účet',
      connecting: 'Propojování...',
      cancel: 'Zrušit',
      connected: 'Propojeno',
      syncingTrades: 'Vaše obchody se automaticky synchronizují',
      disconnect: 'Odpojit',
      healthSection: 'Zdravotní data',
      healthDescription: 'Sledujte spánek, srdeční rytmus a celkovou kondici',
      appleHealthTitle: 'Apple Health',
      appleHealthDesc:
        'Propojte Apple Health pro sledování spánku, srdečního rytmu a dalších metrik, které ovlivňují vaše obchodování.',
      connectAppleHealth: 'Propojit Apple Health',
      appleHealthConnected: 'Apple Health propojeno',
      trackingHealth: 'Vaše zdravotní data se sledují',
      fillFields: 'Vyplňte prosím všechna pole',
      disconnectError: 'Nepodařilo se odpojit',
      connectError: 'Nepodařilo se propojit',
      successConnected: 'Úspěšně propojeno!',
      successDisconnected: 'Úspěšně odpojeno',
      privacyNote: 'Soukromí a bezpečnost',
      privacyDesc:
        'Všechna data jsou šifrovaná pomocí AES-256. Vaše hesla se nikdy neukládají v čitelné podobě.',
    },
    en: {
      back: 'Back to Account',
      title: 'Integrations',
      subtitle: 'Connect your trading and health accounts',
      brokerSection: 'Trading Accounts',
      brokerDescription: 'Automatic sync of your trades from MetaTrader',
      selectBroker: 'Select your broker',
      loginTitle: 'Login to',
      accountLogin: 'Trading Account Login',
      accountLoginPlaceholder: 'E.g. 123456789',
      password: 'Password',
      passwordPlaceholder: 'Your trading account password',
      security: 'Your credentials are encrypted and secure.',
      connectAccount: 'Connect Account',
      connecting: 'Connecting...',
      cancel: 'Cancel',
      connected: 'Connected',
      syncingTrades: 'Your trades are syncing automatically',
      disconnect: 'Disconnect',
      healthSection: 'Health Data',
      healthDescription: 'Track sleep, heart rate and overall recovery',
      appleHealthTitle: 'Apple Health',
      appleHealthDesc:
        'Connect Apple Health to track sleep quality, heart rate and other metrics that affect your trading performance.',
      connectAppleHealth: 'Connect Apple Health',
      appleHealthConnected: 'Apple Health Connected',
      trackingHealth: 'Your health data is being tracked',
      fillFields: 'Please fill in all fields',
      disconnectError: 'Failed to disconnect',
      connectError: 'Failed to connect',
      successConnected: 'Successfully connected!',
      successDisconnected: 'Successfully disconnected',
      privacyNote: 'Privacy & Security',
      privacyDesc:
        'All data is encrypted using AES-256. Your passwords are never stored in readable form.',
    },
  }

  return { t: t[language], language }
}

const BROKERS = [
  { id: 'mt5-demo', name: 'MetaTrader 5', type: 'Demo', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
  { id: 'mt5-live', name: 'MetaTrader 5', type: 'Live', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  { id: 'mt4-demo', name: 'MetaTrader 4', type: 'Demo', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
  { id: 'mt4-live', name: 'MetaTrader 4', type: 'Live', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
]

export default function IntegrationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ login: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<string | null>(null)
  const [appleHealthConnected, setAppleHealthConnected] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checking, setChecking] = useState(true)

  // Check integration status on mount
  useEffect(() => {
    if (!user?.id) return

    const checkIntegrationStatus = async () => {
      try {
        setChecking(true)
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
          if (data.mt4_broker) setConnected(data.mt4_broker)
          setAppleHealthConnected(!!data.apple_health_connected)
        }
      } catch (err) {
        console.error('[v0] Error checking integration status:', err)
      } finally {
        setChecking(false)
      }
    }

    checkIntegrationStatus()
  }, [user?.id])

  const handleBrokerConnect = async () => {
    if (!selectedBroker || !credentials.login || !credentials.password) {
      setError(t.fillFields)
      setTimeout(() => setError(''), 3000)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/brokers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          broker: selectedBroker,
          login: credentials.login,
          password: credentials.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || t.connectError)

      setConnected(selectedBroker)
      setCredentials({ login: '', password: '' })
      setSelectedBroker(null)
      setSuccess(t.successConnected)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.connectError)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectBroker = async () => {
    if (!connected) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          mt4_login: null,
          mt4_password: null,
          mt4_broker: null,
          trades_sync_enabled: false,
        })
        .eq('user_id', user!.id)
      if (error) throw error
      setConnected(null)
      setSuccess(t.successDisconnected)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(t.disconnectError)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleAppleHealthConnect = async () => {
    setLoading(true)
    try {
      await ensureProfileExists(user!.id)
      await updateAppleHealth(user!.id, true)
      setAppleHealthConnected(true)
      setSuccess(t.successConnected)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(t.connectError)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnectAppleHealth = async () => {
    setLoading(true)
    try {
      await updateAppleHealth(user!.id, false)
      setAppleHealthConnected(false)
      setSuccess(t.successDisconnected)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(t.disconnectError)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <p className="text-gray-400">Please log in first</p>
      </div>
    )
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  const selectedBrokerInfo = BROKERS.find((b) => b.id === selectedBroker)
  const connectedBrokerInfo = BROKERS.find((b) => b.id === connected)

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.back}
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30">
            <Plug className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
            <p className="text-gray-400 mt-1">{t.subtitle}</p>
          </div>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-600/50 rounded-xl flex gap-3 items-start backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-200 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-xl flex gap-3 items-start backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* MetaTrader Section */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-purple-900/10 to-slate-900/90 border-slate-700/50 backdrop-blur-xl mb-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <TrendingUp className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t.brokerSection}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{t.brokerDescription}</p>
              </div>
            </div>

            {connected && connectedBrokerInfo ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {connectedBrokerInfo.name} · {connectedBrokerInfo.type}
                    </p>
                    <p className="text-xs text-emerald-300/80 mt-0.5">{t.syncingTrades}</p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnectBroker}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  {t.disconnect}
                </Button>
              </div>
            ) : selectedBroker && selectedBrokerInfo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedBrokerInfo.color}`}>
                      <selectedBrokerInfo.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {t.loginTitle} {selectedBrokerInfo.name} {selectedBrokerInfo.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBroker(null)
                      setCredentials({ login: '', password: '' })
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      {t.accountLogin}
                    </label>
                    <Input
                      type="text"
                      placeholder={t.accountLoginPlaceholder}
                      value={credentials.login}
                      onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
                      className="bg-slate-800/60 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      {t.password}
                    </label>
                    <Input
                      type="password"
                      placeholder={t.passwordPlaceholder}
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                      }
                      className="bg-slate-800/60 border-slate-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 py-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    {t.security}
                  </div>

                  <Button
                    onClick={handleBrokerConnect}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        {t.connecting}
                      </>
                    ) : (
                      <>
                        {t.connectAccount}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-3">{t.selectBroker}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BROKERS.map((broker) => {
                    const Icon = broker.icon
                    return (
                      <button
                        key={broker.id}
                        onClick={() => setSelectedBroker(broker.id)}
                        className="group p-4 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-600 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${broker.color} group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{broker.name}</p>
                            <p className="text-xs text-gray-400">{broker.type}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Apple Health Section */}
        <Card className="bg-gradient-to-br from-slate-900/90 via-red-900/10 to-slate-900/90 border-slate-700/50 backdrop-blur-xl mb-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                <Heart className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t.healthSection}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{t.healthDescription}</p>
              </div>
            </div>

            {appleHealthConnected ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Check className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.appleHealthConnected}</p>
                    <p className="text-xs text-emerald-300/80 mt-0.5">{t.trackingHealth}</p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnectAppleHealth}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  {t.disconnect}
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{t.appleHealthTitle}</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-4">{t.appleHealthDesc}</p>
                    <Button
                      onClick={handleAppleHealthConnect}
                      disabled={loading}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin mr-2" />
                          {t.connecting}
                        </>
                      ) : (
                        <>
                          {t.connectAppleHealth}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-200 text-sm">{t.privacyNote}</h4>
                <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">{t.privacyDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
