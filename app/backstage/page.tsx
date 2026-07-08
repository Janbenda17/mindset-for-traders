'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Lock, Users, Eye, Clock, TrendingUp, LogOut } from 'lucide-react'

interface Stats {
  range: string
  totalSessions: number
  totalPageviews: number
  avgSessionSeconds: number
  sessionsToPricing: number
  pricingConversionRate: number
  topPages: { path: string; views: number; avgSeconds: number }[]
}

const RANGES: { value: string; label: string }[] = [
  { value: 'today', label: 'Dnes' },
  { value: '7d', label: '7 dní' },
  { value: '30d', label: '30 dní' },
  { value: 'all', label: 'Vše' },
]

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}m ${rest}s`
}

export default function BackstagePage() {
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [range, setRange] = useState('7d')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState('')

  const loadStats = async (selectedRange: string) => {
    setLoadingStats(true)
    try {
      const res = await fetch(`/api/backstage/stats?range=${selectedRange}`)
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      if (res.ok) {
        setStats(await res.json())
        setAuthed(true)
        setStatsError('')
        return
      }
      // Logged in successfully but the stats query itself failed (e.g. the
      // analytics_pageviews table hasn't been created yet in Supabase) -
      // surface that instead of silently dropping back to the login form,
      // which otherwise looks exactly like "nothing happened."
      const body = await res.json().catch(() => null)
      setStatsError(body?.error || `Nepodařilo se načíst data (HTTP ${res.status})`)
    } catch (err) {
      setStatsError('Nepodařilo se spojit se serverem')
    } finally {
      setLoadingStats(false)
      setChecking(false)
    }
  }

  useEffect(() => {
    loadStats(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (authed) loadStats(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    try {
      const res = await fetch('/api/backstage/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setLoginError('Špatné heslo')
        return
      }
      setPassword('')
      await loadStats(range)
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/backstage/logout', { method: 'POST' })
    setAuthed(false)
    setStats(null)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Zadej heslo</span>
          </div>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
          />
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          {statsError && (
            <p className="text-sm text-amber-400">
              Heslo bylo v pořádku, ale nepodařilo se načíst data: {statsError}
            </p>
          )}
          <button
            type="submit"
            disabled={loggingIn || !password}
            className="w-full rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-semibold py-2.5 transition-colors"
          >
            {loggingIn ? 'Ověřuji…' : 'Vstoupit'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Návštěvnost</h1>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg bg-slate-900 border border-slate-800 p-1">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    range === r.value ? 'bg-fuchsia-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Odhlásit
            </button>
          </div>
        </div>

        {loadingStats || !stats ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Návštěvníci" value={stats.totalSessions.toLocaleString('cs-CZ')} />
              <StatCard icon={Eye} label="Zobrazení stránek" value={stats.totalPageviews.toLocaleString('cs-CZ')} />
              <StatCard icon={Clock} label="Průměrný čas na webu" value={formatDuration(stats.avgSessionSeconds)} />
              <StatCard
                icon={TrendingUp}
                label="Přešli na pricing"
                value={`${stats.sessionsToPricing} (${stats.pricingConversionRate}%)`}
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="font-semibold">Nejnavštěvovanější stránky</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-800">
                      <th className="px-5 py-2 font-medium">Stránka</th>
                      <th className="px-5 py-2 font-medium">Zobrazení</th>
                      <th className="px-5 py-2 font-medium">Průměrný čas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages.map((p) => (
                      <tr key={p.path} className="border-b border-slate-800/50 last:border-0">
                        <td className="px-5 py-2.5 font-mono text-slate-300 whitespace-nowrap">{p.path}</td>
                        <td className="px-5 py-2.5 text-slate-400">{p.views}</td>
                        <td className="px-5 py-2.5 text-slate-400">{formatDuration(p.avgSeconds)}</td>
                      </tr>
                    ))}
                    {stats.topPages.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                          Zatím žádná data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Poznámka: čas na stránce se zaznamená, až ji návštěvník opustí nebo přepne kartu - právě
              rozečtená stránka se v datech objeví až po odchodu.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
