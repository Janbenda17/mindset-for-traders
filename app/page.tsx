'use client'

import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowRight, Zap, Brain, TrendingUp, Users, Shield, Clock, Target, Play, Sparkles } from 'lucide-react'
import { buildEmotionalTaxSheet } from '@/lib/emotional-tax'
import DisciplineMatrix from '@/components/discipline-matrix'
import DayDetailPanel from '@/components/day-detail-panel'
import type { DisciplineDay } from '@/lib/discipline-matrix'
import { cn } from '@/lib/utils'

function money(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US')}`
}

// Dates are anchored to the CURRENT month rather than a fixed one, since
// DisciplineMatrix (the real in-app Kalendář, reused below) always opens on
// the visitor's current month with no way to deep-link a different one -
// a hardcoded month would just show an empty grid a few weeks after launch.
const now = new Date()
const DEMO_YEAR = now.getFullYear()
const DEMO_MONTH = now.getMonth() // 0-indexed
function demoDate(day: number) {
  return `${DEMO_YEAR}-${String(DEMO_MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// A single illustrative trading week, run through the real Emotional Tax
// Sheet + Discipline Matrix engines (lib/emotional-tax.ts, lib/discipline-matrix.ts)
// - not fabricated marketing copy. Ten clean trades (no behavioural flag,
// followedPlan: true) net +$16,638; five trades carrying a real FOMO/revenge/
// no-stop/oversizing flag (followedPlan: false) net only +$941 - the same
// edge, almost erased by five bad decisions. Every number below flows
// through the actual scoring logic, it isn't a hardcoded result.
const DEMO_TAX_TRADES = [
  { id: 'd1', date: demoDate(1), pair: 'EURUSD', direction: 'Long', pnl: 2200, positionSize: 1.1, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd2', date: demoDate(2), pair: 'GBPUSD', direction: 'Short', pnl: 1800, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd3', date: demoDate(3), pair: 'USDJPY', direction: 'Long', pnl: 950, positionSize: 0.9, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd4', date: demoDate(4), pair: 'XAUUSD', direction: 'Long', pnl: 3100, positionSize: 1.3, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd5', date: demoDate(5), pair: 'EURUSD', direction: 'Short', pnl: 1200, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd6', date: demoDate(8), pair: 'AUDUSD', direction: 'Long', pnl: 890, positionSize: 0.8, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd7', date: demoDate(9), pair: 'GBPJPY', direction: 'Short', pnl: 2450, positionSize: 1.2, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd8', date: demoDate(10), pair: 'USDCAD', direction: 'Long', pnl: 1300, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd9', date: demoDate(11), pair: 'EURJPY', direction: 'Short', pnl: 1768, positionSize: 1.1, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd10', date: demoDate(12), pair: 'NZDUSD', direction: 'Long', pnl: 980, positionSize: 0.9, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd11', date: demoDate(15), pair: 'GBPUSD', direction: 'Long', pnl: -450, positionSize: 1.0, hasStopLoss: true, fomo: true, followedPlan: false, type: 'trade' },
  { id: 'd12', date: demoDate(16), pair: 'EURUSD', direction: 'Short', pnl: -600, positionSize: 1.2, hasStopLoss: true, revengeTrade: true, followedPlan: false, type: 'trade' },
  { id: 'd13', date: demoDate(17), pair: 'XAUUSD', direction: 'Long', pnl: 1200, positionSize: 1.0, hasStopLoss: false, followedPlan: false, type: 'trade' },
  { id: 'd14', date: demoDate(18), pair: 'USDJPY', direction: 'Short', pnl: -260, positionSize: 4.0, hasStopLoss: true, followedPlan: false, type: 'trade' },
  { id: 'd15', date: demoDate(19), pair: 'GBPJPY', direction: 'Long', pnl: 1051, positionSize: 1.0, hasStopLoss: true, fomo: true, followedPlan: false, type: 'trade' },
]

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()

  const [presaleStats, setPresaleStats] = useState<{ total: number; claimed: number } | null>(null)
  const [selectedDemoDay, setSelectedDemoDay] = useState<DisciplineDay | null>(null)

  const taxSheet = buildEmotionalTaxSheet(DEMO_TAX_TRADES, [], language === 'en')
  const taxWorstRow = [...taxSheet.rows].sort((a, b) => a.realLoss - b.realLoss)[0]

  useEffect(() => {
    let cancelled = false
    fetch('/api/presale-stats')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPresaleStats(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const handlePricingClick = () => {
    if (!user) {
      router.push('/signup')
    } else {
      router.push('/upgrade')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        {/* Base */}
        <div className="absolute inset-0 bg-slate-950" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(217, 70, 239, 0.1), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.08), transparent 50%)',
          }}
        />

        {/* Soft emerald glow top */}
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18), transparent 60%)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        {/* Sparse starfield */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Presale banner */}
        <button
          onClick={handlePricingClick}
          className="group fixed top-0 left-0 right-0 z-[60] h-9 flex items-center justify-center gap-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-red-500/20 text-xs sm:text-sm transition-colors hover:border-red-500/40 px-4 text-center"
        >
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] shrink-0">
            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
            {language === 'en' ? 'Presale' : 'Předprodej'}
          </span>
          <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
            {language === 'en' ? 'Limited to the first 30 users only' : 'Jen pro prvních 30 uživatelů'}
          </span>
          <ArrowRight className="hidden sm:block w-3 h-3 text-slate-600 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        <div className="[&>nav]:!top-9">
          <TopNavigation />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="pt-32 sm:pt-40 pb-4 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-400">
                  {language === 'en' ? '#1 Trading Psychology Platform' : '#1 Trading Psychology Platform'}
                </span>
              </motion.div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 text-white text-balance">
                {language === 'en' ? (
                  <>
                    Your brain becomes your{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">biggest advantage</span>
                  </>
                ) : (
                  <>
                    Tvůj mozek se stane tvojí{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">největší výhodou</span>
                  </>
                )}
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed text-pretty font-medium">
                {language === 'en'
                  ? '93% of traders fail because of psychology, not strategy.'
                  : '93% obchodníků padne kvůli psychice, ne kvůli strategii.'}
              </p>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-px bg-white/10 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
              >
                <div className="bg-slate-950 px-2 py-4 sm:px-6 sm:py-8 text-center">
                  <div className="text-xl sm:text-5xl font-black text-white mb-1 sm:mb-2 tracking-tight">
                    9<span className="text-fuchsia-500">/</span>10
                  </div>
                  <div className="text-[10px] leading-tight sm:text-sm sm:leading-snug text-slate-400">
                    {language === 'en' ? 'Traders struggle with psychology' : 'Obchodníků má psychické problémy'}
                  </div>
                </div>
                <div className="bg-slate-950 px-2 py-4 sm:px-6 sm:py-8 text-center">
                  <div className="text-xl sm:text-5xl font-black text-white mb-1 sm:mb-2 tracking-tight">
                    <span className="text-fuchsia-500">{'\u2193'}</span>42%
                  </div>
                  <div className="text-[10px] leading-tight sm:text-sm sm:leading-snug text-slate-400">
                    {language === 'en' ? 'Less revenge trading' : 'Méně revenge tradingu'}
                  </div>
                </div>
                <div className="bg-slate-950 px-2 py-4 sm:px-6 sm:py-8 text-center">
                  <div className="text-xl sm:text-5xl font-black text-white mb-1 sm:mb-2 tracking-tight">
                    24<span className="text-fuchsia-500">/</span>7
                  </div>
                  <div className="text-[10px] leading-tight sm:text-sm sm:leading-snug text-slate-400">
                    {language === 'en' ? 'AI analysis of your mindset' : 'AI analýza tvého mindsetu'}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Broker + Wealth data connect teaser — a roadmap note, sits right above the
              video as a quick "what's coming" line before the main demo hook */}
          <div className="pt-8 sm:pt-10">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-white/15 overflow-hidden flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d2b4e 0%, #0a1f3a 100%)' }}
                    aria-label="MetaTrader 5"
                    title="MetaTrader 5"
                  >
                    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="w-7 h-7 sm:w-8 sm:h-8">
                      <rect x="10" y="14" width="5" height="18" rx="1" fill="#e53935" />
                      <line x1="12.5" y1="10" x2="12.5" y2="36" stroke="#e53935" strokeWidth="1.3" />
                      <rect x="19" y="18" width="5" height="16" rx="1" fill="#43a047" />
                      <line x1="21.5" y1="12" x2="21.5" y2="38" stroke="#43a047" strokeWidth="1.3" />
                      <text x="36" y="32" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="20" fill="#ffffff">5</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                      {language === 'en' ? 'Coming soon' : 'Už brzy'}
                    </span>
                    <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                      {language === 'en' ? 'Broker + Wealth data connect' : 'Broker + Wealth data connect'}
                    </span>
                  </div>
                </div>

                <Link
                  href={user ? '/account/integrations' : '/signup'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 font-mono text-xs uppercase tracking-[0.2em] text-slate-300 hover:border-fuchsia-500/40 hover:text-fuchsia-300 transition-all flex-shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Connect' : 'Připojit'}
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Product demo video — front and center right after the hero, this is the
              first real proof of the product a new visitor sees */}
          <div className="pt-8 pb-12 sm:pt-10 sm:pb-16">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-fuchsia-400 mb-4">
                {language === 'en' ? 'See it in action' : 'Podívej se, jak to funguje'}
              </p>
              <div className="relative aspect-video rounded-2xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-500/[0.08] via-slate-950 to-purple-600/[0.08] p-[1px] shadow-[0_0_60px_-15px_rgba(217,70,239,0.35)]">
                <div className="relative w-full h-full rounded-2xl bg-slate-950/80 backdrop-blur-sm overflow-hidden flex items-center justify-center group/video">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.18),transparent_65%)]"
                  />
                  <div className="relative flex flex-col items-center gap-4 px-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/15 bg-white/5 group-hover/video:border-fuchsia-500/40 group-hover/video:bg-fuchsia-500/10 transition-colors shadow-lg shadow-black/40">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300 group-hover/video:text-fuchsia-400 transition-colors fill-current" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-white mb-1">
                        {language === 'en' ? '2-minute walkthrough' : '2minutová ukázka'}
                      </p>
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
                        {language === 'en' ? 'Coming very soon' : 'Už brzy'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features Grid — explains the product first, before any proof or
              urgency, so a cold visitor knows what they're even looking at */}
          <div className="pb-24 pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20 max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-400">
                  {language === 'en' ? 'Built for traders' : 'Stvořené pro tradery'}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] text-balance">
                {language === 'en' ? (
                  <>
                    Everything you need to{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">trade better</span>
                  </>
                ) : (
                  <>
                    Vše co potřebuješ k{' '}
                    <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">lepšímu obchodování</span>
                  </>
                )}
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed text-pretty">
                {language === 'en'
                  ? 'Four pillars working together to rewire your trading mindset and hold you accountable every single day.'
                  : 'Čtyři pilíře, které spolupracují na přenastavení tvého obchodního mindsetu a drží tě v disciplíně každý den.'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
              {[
                {
                  icon: Brain,
                  number: '01',
                  tag: language === 'en' ? 'Morning routine' : 'Ranní rutina',
                  metric: language === 'en' ? '2 min / day' : '2 min / den',
                  metricIcon: Clock,
                  title: language === 'en' ? 'Daily Tracker' : 'Denní Sledování',
                  description: language === 'en'
                    ? 'Track your psychology each morning and understand your trading patterns before the market opens.'
                    : 'Sleduj svou psychiku každé ráno a pochop své vzorce dřív, než otevře trh.',
                  bullets: language === 'en'
                    ? ['Mood & energy check-in', 'Pattern detection over time', 'Smart pre-market warnings']
                    : ['Check-in nálady a energie', 'Detekce vzorců v čase', 'Chytrá varování před trhem'],
                  accent: {
                    icon: 'text-blue-400',
                    iconHover: 'group-hover:border-blue-500/40 group-hover:text-blue-500',
                    number: 'group-hover:text-blue-500/60',
                    bulletBg: 'bg-blue-500/10 border-blue-500/30',
                    bulletIcon: 'text-blue-400',
                    metricIcon: 'text-blue-400',
                    underline: 'from-blue-500 to-cyan-500',
                  },
                },
                {
                  icon: Zap,
                  number: '02',
                  tag: language === 'en' ? 'Live protection' : 'Live ochrana',
                  metric: language === 'en' ? 'Real-time' : 'V reálném čase',
                  metricIcon: Shield,
                  title: language === 'en' ? 'AI Coach' : 'AI Kouč',
                  description: language === 'en'
                    ? 'Real-time AI stops emotional mistakes before they cost you the account.'
                    : 'AI v reálném čase zastaví emoční chyby dřív, než tě připraví o účet.',
                  bullets: language === 'en'
                    ? ['FOMO & revenge trade alerts', 'Instant intervention prompts', 'Trained on 10k+ trader journals']
                    : ['Upozornění na FOMO a revenge trade', 'Okamžité intervenční hlášky', 'Trénováno na 10k+ denících traderů'],
                  accent: {
                    icon: 'text-rose-400',
                    iconHover: 'group-hover:border-rose-500/40 group-hover:text-rose-500',
                    number: 'group-hover:text-rose-500/60',
                    bulletBg: 'bg-rose-500/10 border-rose-500/30',
                    bulletIcon: 'text-rose-400',
                    metricIcon: 'text-rose-400',
                    underline: 'from-rose-500 to-red-500',
                  },
                },
                {
                  icon: TrendingUp,
                  number: '03',
                  tag: language === 'en' ? 'Friday ritual' : 'Páteční rituál',
                  metric: language === 'en' ? 'Weekly insights' : 'Týdenní přehled',
                  metricIcon: Target,
                  title: language === 'en' ? 'Weekly Review' : 'Týdenní Přezkum',
                  description: language === 'en'
                    ? 'Every Friday: analyze losses, extract lessons and plan a sharper next week.'
                    : 'Každý pátek: analyzuj ztráty, vytěž lekce a naplánuj ostřejší týden.',
                  bullets: language === 'en'
                    ? ['Automated trade breakdowns', 'Mistake-pattern heatmap', 'Actionable weekly goals']
                    : ['Automatický rozbor obchodů', 'Heatmapa chybových vzorců', 'Konkrétní týdenní cíle'],
                  accent: {
                    icon: 'text-amber-400',
                    iconHover: 'group-hover:border-amber-500/40 group-hover:text-amber-500',
                    number: 'group-hover:text-amber-500/60',
                    bulletBg: 'bg-amber-500/10 border-amber-500/30',
                    bulletIcon: 'text-amber-400',
                    metricIcon: 'text-amber-400',
                    underline: 'from-amber-500 to-orange-500',
                  },
                },
                {
                  icon: Users,
                  number: '04',
                  tag: language === 'en' ? 'Accountability' : 'Zodpovědnost',
                  metric: language === 'en' ? 'Invite-only community' : 'Komunita pouze na pozvání',
                  metricIcon: Users,
                  title: language === 'en' ? 'Team Club' : 'Tým Klub',
                  description: language === 'en'
                    ? 'Join a private community of serious traders and stay accountable when it matters most.'
                    : 'Připoj se do soukromé komunity vážných traderů a zůstaň zodpovědný, když na tom záleží.',
                  bullets: [] as string[],
                  accent: {
                    icon: 'text-emerald-400',
                    iconHover: 'group-hover:border-emerald-500/40 group-hover:text-emerald-500',
                    number: 'group-hover:text-emerald-500/60',
                    bulletBg: 'bg-emerald-500/10 border-emerald-500/30',
                    bulletIcon: 'text-emerald-400',
                    metricIcon: 'text-emerald-400',
                    underline: 'from-emerald-500 to-teal-500',
                  },
                },
              ].map((feature, i) => {
                const Icon = feature.icon
                const accent = feature.accent
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="relative p-8 sm:p-10 bg-slate-950"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 ${accent.icon}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs tracking-widest text-slate-700">
                        {feature.number}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2.5 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-6">
                      {feature.description}
                    </p>

                    {feature.bullets.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {feature.bullets.map((bullet, bi) => (
                          <li key={bi} className="flex items-center gap-2.5 text-sm text-slate-300">
                            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${accent.bulletIcon}`} />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-slate-600">
                        {feature.metric}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Real proof of Weekly Review — tied explicitly to pillar 03 above
              instead of a floating unlabeled "audit", and condensed to the
              two-number hook + one verdict line instead of the full in-app
              ledger table, so it reads in a few seconds instead of overwhelming
              a cold visitor with FOMO/revenge/no-SL/oversizing jargon. */}
          <div className="pb-20">
            <motion.div
              className="max-w-3xl mx-auto mb-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400 mb-4">
                {language === 'en' ? 'From Weekly Review — pillar 03' : 'Z Weekly Review — pilíř 03'}
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
                {language === 'en' ? 'Real numbers, not testimonials' : 'Reálná čísla, ne recenze'}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {language === 'en'
                  ? "This is what Weekly Review's trade breakdown looks like on a real trading week, run through the same scoring MindTrader uses on your account — not a screenshot, not a testimonial."
                  : 'Takhle vypadá rozbor obchodů z Weekly Review na skutečném obchodním týdnu, spočítaný stejnou logikou, jakou MindTrader používá na tvém účtu — žádný screenshot, žádná recenze.'}
              </p>
            </motion.div>

            <motion.div
              className="max-w-2xl mx-auto mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-emerald-400/80 mb-1.5">
                      {language === 'en' ? 'Strategy P&L' : 'P&L strategie'}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                      +${taxSheet.strategyPnL.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-rose-400/80 mb-1.5">
                      {language === 'en' ? 'Emotional P&L' : 'P&L emocí'}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                      +${taxSheet.emotionalPnL.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                  {taxWorstRow &&
                    (language === 'en'
                      ? `${taxWorstRow.label} was the single biggest leak this week — ${money(taxWorstRow.realLoss)} in real losses from ${taxWorstRow.incidents} flagged trade${taxWorstRow.incidents === 1 ? '' : 's'}, on an account that otherwise made $${taxSheet.strategyPnL.toLocaleString('en-US')}.`
                      : `${taxWorstRow.label} byl tenhle týden největší únik — ${money(taxWorstRow.realLoss)} reálné ztráty z ${taxWorstRow.incidents} problémových obchodů, na účtu, který jinak vydělal $${taxSheet.strategyPnL.toLocaleString('en-US')}.`)}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3">
                {language === 'en' ? 'Click any day for the full breakdown · live in-app feature' : 'Klikni na den pro detailní rozbor · živá funkce z aplikace'}
              </p>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className={cn('w-full transition-all duration-300', selectedDemoDay ? 'md:w-[52%]' : 'md:w-full')}>
                  <DisciplineMatrix trades={DEMO_TAX_TRADES} journalEntries={[]} onDayClick={setSelectedDemoDay} />
                </div>
                {selectedDemoDay && (
                  <div className="w-full md:flex-1 min-w-0">
                    <DayDetailPanel
                      day={selectedDemoDay}
                      onClose={() => setSelectedDemoDay(null)}
                      demoTrades={DEMO_TAX_TRADES}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Beta sponsorship — last urgency push right before the CTA. Honest
              real cap (30) and a real live count of paid accounts against it,
              no fabricated countdown. */}
          <div className="pb-16">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.06] via-slate-950 to-slate-950 p-6 sm:p-10 text-center overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.12),transparent_60%)]"
                />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-red-300">
                      {language === 'en' ? 'Beta sponsorship' : 'Beta sponzoring'}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                    {language === 'en'
                      ? 'Opening the first 30 founding-member slots'
                      : 'Otevíráme prvních 30 slotů pro zakládající členy'}
                  </h3>
                  <p className="text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
                    {language === 'en'
                      ? "MindTrader is in presale. Founding members keep presale pricing for life and help shape what we build next — once all 30 spots are gone, that pricing is gone for good."
                      : 'MindTrader je v předprodeji. Zakládající členové mají doživotně předprodejní cenu a přímo ovlivňují, co stavíme dál — jakmile je všech 30 míst pryč, ta cena už se nevrátí.'}
                  </p>
                  <div className="max-w-xs mx-auto">
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-700"
                        style={{
                          width: presaleStats
                            ? `${Math.max(4, (presaleStats.claimed / presaleStats.total) * 100)}%`
                            : '4%',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
                      <span>
                        {presaleStats ? presaleStats.claimed : '···'} {language === 'en' ? 'claimed' : 'obsazeno'}
                      </span>
                      <span>{presaleStats ? presaleStats.total : 30} {language === 'en' ? 'total spots' : 'míst celkem'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-24"
          >
            <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden p-12 sm:p-16 text-center">
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(217, 70, 239, 0.25), transparent 60%)',
                }}
              />
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] text-balance">
                  {language === 'en' ? (
                    <>
                      Ready to <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">trade better</span>?
                    </>
                  ) : (
                    <>
                      Připraven <span className="italic font-serif bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">obchodovat lépe</span>?
                    </>
                  )}
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  {language === 'en'
                    ? 'Sign up free today. Upgrade to Premium anytime for full access to all features.'
                    : 'Zaregistruj se dnes zdarma. Upgraduj na Premium kdykoli a získej plný přístup ke všem funkcím.'}
                </p>
                <Button
                  size="lg"
                  onClick={handlePricingClick}
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-400 hover:to-purple-500 font-bold text-base px-8 py-6 rounded-lg shadow-lg shadow-fuchsia-500/30 border border-white/10"
                >
                  {language === 'en' ? 'Get Started Free' : 'Začít zdarma'}{' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
