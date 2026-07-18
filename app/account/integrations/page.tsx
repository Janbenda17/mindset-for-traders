'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, AlertCircle, Loader, X, Plug, Lock, Hash, Server, Zap, Sparkles, Upload, FileText, Mail } from 'lucide-react'
import Link from 'next/link'
import { connectMetaApi, disconnectMetaApi, confirmBrokerConnection, uploadTradeHistoryCsv, sendFinishSetupEmail } from './actions'

// Best-guess default MT4/5 live-server names for the brokers most commonly
// used by CZ/SK retail traders. Picking one just pre-fills the "Broker
// server" field with a reasonable starting point instead of a blank box -
// the field stays editable, since brokers often run several numbered
// servers (Live01, Live02, ...) and the exact one depends on which account
// the trader was assigned. This is a starting guess, not a promise of an
// exact match.
const COMMON_BROKERS: { label: string; server: string }[] = [
  { label: 'XTB', server: 'XTB-Real' },
  { label: 'Purple Trading', server: 'PurpleTradingSC-Live' },
  { label: 'IC Markets', server: 'ICMarketsSC-Live01' },
  { label: 'Pepperstone', server: 'Pepperstone-Live01' },
  { label: 'Admirals (Admiral Markets)', server: 'AdmiralsGroup-Live' },
  { label: 'RoboForex', server: 'RoboForex-ECN' },
  { label: 'FTMO', server: 'FTMO-Server' },
  { label: 'FXTM', server: 'FXTM-Live' },
]

let supabaseInstance: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  supabaseInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return supabaseInstance
}

// Purely decorative, blurred behind the Hard Wall card - gives a preview
// that the app is real and full-featured without revealing (or letting
// anyone interact with) anything real. pointer-events-none + select-none +
// aria-hidden so it can never be clicked, tabbed to, or mistaken for real
// data by a screen reader.
function DashboardMockup() {
  const bars = [40, 65, 35, 80, 55, 90, 45, 70, 60, 85, 50, 75]
  return (
    <div aria-hidden="true" className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 rounded bg-slate-700/60" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg bg-fuchsia-600/40" />
          <div className="h-8 w-8 rounded-full bg-slate-700/60" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['+18.4%', '2 341 Kč', '76%'].map((val, i) => (
          <div key={i} className="rounded-xl bg-slate-800/70 border border-slate-700/60 p-3">
            <div className="h-2.5 w-16 rounded bg-slate-600/60 mb-2" />
            <div className="h-5 w-20 rounded bg-emerald-500/40 text-transparent select-none">{val}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-slate-800/70 border border-slate-700/60 p-4 h-40 flex items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-fuchsia-600/50 to-purple-500/40"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-xl bg-slate-800/70 border border-slate-700/60 p-3 h-16" />
        <div className="rounded-xl bg-slate-800/70 border border-slate-700/60 p-3 h-16" />
      </div>
    </div>
  )
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
  // True while we're polling MetaApi to confirm the broker login actually
  // succeeded (see confirmBrokerConnection in ./actions - the trial only
  // gets granted once this resolves to a genuine CONNECTED state, never
  // optimistically).
  const [verifying, setVerifying] = useState(false)

  // CSV escape hatch - for anyone who won't hand over even a read-only
  // investor password. Collapsed by default so it doesn't compete with the
  // primary broker-connect path, but always available.
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvUploading, setCsvUploading] = useState(false)

  // "Email me a link to finish later" - for anyone who lands here without
  // their MT4/5 investor password or broker server name handy right now
  // (very common on mobile, away from the desktop terminal where that info
  // actually lives). Fires immediately on click, separate from the
  // automatic 24h/72h signup-funnel reminder emails.
  const [selectedBrokerLabel, setSelectedBrokerLabel] = useState('')
  const [sendingFinishEmail, setSendingFinishEmail] = useState(false)
  const [finishEmailSent, setFinishEmailSent] = useState(false)

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
          .select('metaapi_token, metaapi_account_id, metaapi_broker, trial_ends_at')
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

          // Self-heal: if an account was saved but we never got to confirm
          // the login (tab closed mid-poll, browser crash, etc.), silently
          // re-check it now in the background. This either finally grants
          // the trial for a connection that succeeded after the user left,
          // or clears out a broken account so a retry isn't blocked -
          // instead of leaving it stuck forever in limbo.
          if (data.metaapi_account_id && !data.trial_ends_at) {
            confirmBrokerConnection(user.id, data.metaapi_account_id).then((result) => {
              if (result.failed) {
                setMetaApiConnected(false)
                setConnectedBroker(null)
              }
            }).catch(() => {})
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    )
  }

  const handleConnect = async () => {
    if (!metaApiLogin || !metaApiPassword || !metaApiBroker) {
      setError('Vyplň prosím všechna pole')
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
        setError(result?.error || 'Nepodařilo se připojit tvůj MetaTrader účet')
        setTimeout(() => setError(''), 6000)
        return
      }

      const accountId = (result as any).accountId as string
      setMetaApiConnected(true)
      setConnectedBroker(metaApiBroker)
      setMetaApiLogin('')
      setMetaApiPassword('')
      setMetaApiBroker('')

      try {
        if (typeof window !== 'undefined' && (window as any).clarity) {
          ;(window as any).clarity('event', 'broker_connected')
        }
      } catch {}

      // The account is saved, but MetaApi hasn't confirmed the broker login
      // yet - it can take up to 10-40s, and a wrong password/server only
      // shows up as a failure in that window. Poll a few seconds at a time
      // (each check is a fast, independent request, so this can safely run
      // as long as it needs to without risking a server timeout) instead of
      // granting the trial optimistically.
      setVerifying(true)
      setSuccess('Přihlašuji se k tvému brokerovi - první připojení může trvat až minutu...')

      const maxAttempts = 20 // ~60s at 3s intervals
      let attempt = 0
      let settled = false

      while (attempt < maxAttempts && !settled) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        attempt++

        const confirmResult = await confirmBrokerConnection(user.id, accountId)

        if (confirmResult.failed) {
          settled = true
          setVerifying(false)
          setMetaApiConnected(false)
          setConnectedBroker(null)
          setSuccess('')
          setError(confirmResult.error || 'Nepodařilo se připojit k tvému brokerovi. Zkontroluj údaje a zkus to znovu.')
          setTimeout(() => setError(''), 8000)
          break
        }

        if (confirmResult.connected) {
          settled = true
          setVerifying(false)

          try {
            if (confirmResult.trialStarted && typeof window !== 'undefined' && (window as any).clarity) {
              ;(window as any).clarity('event', 'trial_started')
            }
          } catch {}

          if (confirmResult.trialStarted) {
            // Broker connect just started the 3-day full-access trial and
            // switched the account to LIVE mode. Take the user straight
            // into the app with the product tour queued up (see
            // components/product-tour.tsx FORCE_SHOW_KEY) so the first
            // thing they experience is their own data, not a settings page.
            setSuccess('Připojeno! Tvůj 3denní plný přístup právě začal - přesměrovávám tě na dashboard...')
            try {
              localStorage.setItem('mindtrader-show-tour', 'true')
            } catch {}
            setTimeout(() => {
              window.location.href = '/daily-tracker'
            }, 1500)
          } else {
            setSuccess('Účet připojen! Obchody se budou synchronizovat automaticky jednou denně.')
            setTimeout(() => setSuccess(''), 8000)
          }
          break
        }
        // Still pending - keep polling.
      }

      if (!settled) {
        // Gave up on active polling, but the account is still trying to
        // connect in the background - don't tell the user it failed.
        setVerifying(false)
        setSuccess(
          'Stále se připojuji k tvému brokerovi - trvá to déle než obvykle. Obnov tuto stránku za minutu, mezitím budeme dál kontrolovat.',
        )
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Nepodařilo se připojit tvůj účet'
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

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setCsvFile(file || null)
  }

  const handleCsvUpload = async () => {
    if (!csvFile) return

    setCsvUploading(true)
    setError('')
    try {
      const text = await csvFile.text()
      const result = await uploadTradeHistoryCsv(user.id, text)

      if (!result.success) {
        setError(result.error || 'Nepodařilo se zpracovat soubor')
        setTimeout(() => setError(''), 8000)
        return
      }

      try {
        if (typeof window !== 'undefined' && (window as any).clarity) {
          ;(window as any).clarity('event', 'csv_trade_import')
        }
      } catch {}

      if (result.trialStarted) {
        setSuccess(`Nahráno ${result.importedCount} obchodů! Tvůj 3denní plný přístup právě začal - přesměrovávám tě na dashboard...`)
        try {
          localStorage.setItem('mindtrader-show-tour', 'true')
        } catch {}
        setTimeout(() => {
          window.location.href = '/daily-tracker'
        }, 1500)
      } else {
        setSuccess(`Nahráno ${result.importedCount} obchodů!`)
        setTimeout(() => setSuccess(''), 6000)
      }
    } catch (err) {
      setError('Nepodařilo se přečíst soubor')
      console.error('[v0] CSV upload error:', err)
    } finally {
      setCsvUploading(false)
    }
  }

  const handleSendFinishEmail = async () => {
    if (!user.email) return
    setSendingFinishEmail(true)
    setError('')
    try {
      const result = await sendFinishSetupEmail(user.id, user.email, user.name)
      if (!result?.success) {
        setError(result?.error || 'Nepodařilo se odeslat email')
        setTimeout(() => setError(''), 6000)
        return
      }
      setFinishEmailSent(true)
      try {
        if (typeof window !== 'undefined' && (window as any).clarity) {
          ;(window as any).clarity('event', 'finish_setup_email_sent')
        }
      } catch {}
    } catch (err) {
      setError('Nepodařilo se odeslat email')
      console.error('[v0] Send finish-setup email error:', err)
    } finally {
      setSendingFinishEmail(false)
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

        {metaApiConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">MetaTrader Account</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Connect your MT4 or MT5 account to sync trades automatically via MetaApi.
                </p>
              </div>
            </div>
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
                      <p className="text-sm text-emerald-300/80">Trades sync automatically once a day</p>
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
          </div>
        ) : (
          <div className="relative">
            {/* Blurred dashboard preview - purely decorative background, never
                interactive. Gives a sense that there's a real, full app
                waiting on the other side of this step without resurrecting
                the old navigable sample-data mode (that was deliberately
                removed - see app/onboarding/page.tsx - because it gave
                never-activated users a dead-end place to wander instead of
                activating). This is just a static mockup, not a route. */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl blur-md opacity-30 pointer-events-none select-none">
              <DashboardMockup />
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950 pointer-events-none rounded-2xl" />

            {/* Hard Wall card */}
            <div className="relative rounded-2xl border-2 border-fuchsia-500/40 shadow-2xl shadow-fuchsia-900/20 p-1">
              <div className="rounded-xl bg-slate-950/90 backdrop-blur-xl p-5 sm:p-7 space-y-5">
                <div className="text-center">
                  <div className="inline-flex p-2.5 rounded-xl bg-fuchsia-500/20 mb-3">
                    <Sparkles className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Připoj brokera a odemkni dashboard</h2>
                  <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Jen pro čtení · 2 minuty · 3 dny zdarma, bez karty
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Platforma
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

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Přihlášení (číslo účtu)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="např. 123456789"
                      value={metaApiLogin}
                      onChange={(e) => setMetaApiLogin(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Heslo
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="Tvé investorské (read-only) heslo"
                      value={metaApiPassword}
                      onChange={(e) => setMetaApiPassword(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50"
                    />
                  </div>
                  {/* Short, always-visible - the single biggest source of
                      hesitation on this page, so it can't be missed, but
                      kept to one line so it doesn't drown out the form. */}
                  <p className="mt-2 text-xs text-slate-400">
                    💡 Investorské (read-only) heslo - s ním nejde vybírat peníze ani zadávat obchody.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Broker server
                  </label>

                  {/* Nevíš přesný název serveru? Vyber svého brokera a
                      předvyplníme nejběžnější variantu - pole zůstává
                      editovatelné, protože brokeři mívají víc očíslovaných
                      serverů (Live01, Live02...) a přesný název záleží na
                      tvém konkrétním účtu. */}
                  <Select
                    value={selectedBrokerLabel}
                    onValueChange={(label) => {
                      setSelectedBrokerLabel(label)
                      const broker = COMMON_BROKERS.find((b) => b.label === label)
                      if (broker) setMetaApiBroker(broker.server)
                    }}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300 h-10 mb-2 text-sm">
                      <SelectValue placeholder="Nevíš přesný server? Vyber svého brokera" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      {COMMON_BROKERS.map((b) => (
                        <SelectItem key={b.label} value={b.label}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="např. ICMarketsSC-Demo"
                      value={metaApiBroker}
                      onChange={(e) => setMetaApiBroker(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10 h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Přesný název najdeš v MT4/5 terminálu na přihlašovací obrazovce - klidně uprav, pokud se liší.
                  </p>
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
                        Připojuji...
                      </>
                    ) : (
                      <>
                        Připojit účet
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-3">
                    <Lock className="w-3 h-3" />
                    Pouze pro čtení · Zabezpečené přes MetaApi
                  </p>

                  {/* For anyone who lands here without their investor
                      password / broker server name at hand right now -
                      common on mobile, away from the desktop terminal.
                      Sends an immediate reminder link instead of losing
                      them outright. */}
                  <div className="mt-3 text-center">
                    {finishEmailSent ? (
                      <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Odkaz odeslán na tvůj email
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendFinishEmail}
                        disabled={sendingFinishEmail}
                        className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Mail className="w-3 h-3" />
                        {sendingFinishEmail
                          ? 'Odesílám...'
                          : 'Nemáš teď údaje po ruce? Pošli si odkaz emailem'}
                      </button>
                    )}
                  </div>
                </div>

                {/* CSV escape hatch - for the most trust-averse visitors.
                    Deliberately understated (a text link, not a button) so
                    it doesn't compete with the primary broker-connect path,
                    but it's always right there instead of hidden in a menu
                    somewhere. */}
                <div className="pt-3 border-t border-slate-800 text-center">
                  {!showCsvUpload ? (
                    <button
                      type="button"
                      onClick={() => setShowCsvUpload(true)}
                      className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
                    >
                      Nechceš zadávat údaje? Nahraj historii ručně přes CSV/Excel
                    </button>
                  ) : (
                    <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-4 space-y-3 text-left">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Exportuj si historii uzavřených obchodů přímo ze své platformy (Terminal → History → pravý
                        klik → Save as Report) jako CSV a nahraj soubor sem. Žádná hesla, žádné propojování účtu -
                        čistá anonymní data.
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs cursor-pointer hover:border-slate-600 transition-colors">
                          <Upload className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span className="truncate flex-1">
                            {csvFile ? csvFile.name : 'Vybrat CSV soubor...'}
                          </span>
                          <input type="file" accept=".csv" onChange={handleCsvFileSelect} className="hidden" />
                        </label>
                        {csvFile && <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      </div>
                      <Button
                        onClick={handleCsvUpload}
                        disabled={!csvFile || csvUploading}
                        variant="outline"
                        className="w-full h-10 border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
                      >
                        {csvUploading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                            Zpracovávám...
                          </>
                        ) : (
                          'Nahrát a odemknout dashboard'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
