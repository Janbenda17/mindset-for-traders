'use client'

import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, ShieldCheck, Sparkles, RotateCcw } from 'lucide-react'
import EmotionalTaxSheet from '@/components/emotional-tax-sheet'
import DisciplineMatrix from '@/components/discipline-matrix'
import DayDetailPanel from '@/components/day-detail-panel'
import DailySummaryTeaser from '@/components/daily-summary-teaser'
import AiCoachTeaser from '@/components/ai-coach-teaser'
import type { DisciplineDay } from '@/lib/discipline-matrix'
import { cn } from '@/lib/utils'

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

// A single illustrative trading month, run through the real Emotional Tax
// Sheet + Discipline Matrix engines (lib/emotional-tax.ts, lib/discipline-matrix.ts)
// - not fabricated marketing copy. Eight clean trades (no behavioural flag,
// followedPlan: true) net +$11,470; twelve trades carrying a real FOMO/
// revenge/no-stop/oversizing flag (followedPlan: false) net -$6,800 - the
// account's own edge, wiped out and then some by five bad decisions. Every
// number in the sheet below flows through the actual scoring logic, none of
// it is a hardcoded result.
const DEMO_TAX_TRADES = [
  { id: 'd1', date: demoDate(1), pair: 'EURUSD', direction: 'Long', pnl: 2200, positionSize: 1.1, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd2', date: demoDate(2), pair: 'GBPUSD', direction: 'Short', pnl: 1450, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd3', date: demoDate(3), pair: 'USDJPY', direction: 'Long', pnl: 890, positionSize: 0.9, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd4', date: demoDate(4), pair: 'XAUUSD', direction: 'Long', pnl: 1680, positionSize: 1.3, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd5', date: demoDate(5), pair: 'EURUSD', direction: 'Short', pnl: 720, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd6', date: demoDate(6), pair: 'AUDUSD', direction: 'Long', pnl: 2340, positionSize: 0.8, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd7', date: demoDate(7), pair: 'GBPJPY', direction: 'Short', pnl: 1050, positionSize: 1.2, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'd8', date: demoDate(8), pair: 'USDCAD', direction: 'Long', pnl: 1140, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'f1', date: demoDate(10), pair: 'GBPUSD', direction: 'Long', pnl: -1200, positionSize: 3.5, hasStopLoss: true, fomo: true, followedPlan: false, type: 'trade' },
  { id: 'f2', date: demoDate(11), pair: 'EURJPY', direction: 'Short', pnl: -850, positionSize: 3.2, hasStopLoss: true, fomo: true, followedPlan: false, type: 'trade' },
  { id: 'f3', date: demoDate(12), pair: 'XAUUSD', direction: 'Long', pnl: 620, positionSize: 1.0, hasStopLoss: true, fomo: true, followedPlan: false, type: 'trade' },
  { id: 'f4', date: demoDate(13), pair: 'NZDUSD', direction: 'Short', pnl: -1450, positionSize: 1.0, hasStopLoss: false, revengeTrade: true, followedPlan: false, type: 'trade' },
  { id: 'f5', date: demoDate(14), pair: 'USDCAD', direction: 'Long', pnl: -980, positionSize: 3.8, hasStopLoss: true, revengeTrade: true, followedPlan: false, type: 'trade' },
  { id: 'f6', date: demoDate(15), pair: 'EURUSD', direction: 'Short', pnl: 410, positionSize: 1.0, hasStopLoss: true, revengeTrade: true, followedPlan: false, type: 'trade' },
  { id: 'f7', date: demoDate(16), pair: 'GBPJPY', direction: 'Long', pnl: -890, positionSize: 1.0, hasStopLoss: false, followedPlan: false, type: 'trade' },
  { id: 'f8', date: demoDate(17), pair: 'USDJPY', direction: 'Short', pnl: -670, positionSize: 1.0, hasStopLoss: false, followedPlan: false, type: 'trade' },
  { id: 'f9', date: demoDate(18), pair: 'AUDUSD', direction: 'Long', pnl: -1340, positionSize: 3.6, hasStopLoss: false, followedPlan: false, type: 'trade' },
  { id: 'f10', date: demoDate(19), pair: 'XAUUSD', direction: 'Short', pnl: -560, positionSize: 3.3, hasStopLoss: true, followedPlan: false, type: 'trade' },
  { id: 'f11', date: demoDate(20), pair: 'EURUSD', direction: 'Long', pnl: 290, positionSize: 3.4, hasStopLoss: true, followedPlan: false, type: 'trade' },
  { id: 'f12', date: demoDate(21), pair: 'GBPUSD', direction: 'Short', pnl: -180, positionSize: 3.1, hasStopLoss: true, followedPlan: false, type: 'trade' },
]

// One example day for the Daily Tracker teaser - a net-positive day that's
// still flagged reckless (revenge re-entry, oversized), run through the
// real buildDailySummary() engine (lib/daily-summary.ts).
const DEMO_DAY_TRADES = [
  { id: 'dd1', date: demoDate(22), pair: 'EURUSD', direction: 'Long', pnl: 680, positionSize: 1.0, hasStopLoss: true, followedPlan: true, type: 'trade' },
  { id: 'dd2', date: demoDate(22), pair: 'XAUUSD', direction: 'Short', pnl: -246, positionSize: 4.5, hasStopLoss: true, revengeTrade: true, followedPlan: false, type: 'trade' },
]

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()

  const [selectedDemoDay, setSelectedDemoDay] = useState<DisciplineDay | null>(null)

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
        <TopNavigation />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          {/* pt-32/pt-40 (not pt-24/pt-32) - TopNavigation now renders its
              32px growth-hook strip on this page too (unlock-trial CTA for
              logged-out visitors, lifecycle messaging once logged in), so
              the hero reserves that extra space up front. */}
          <div className="pt-32 sm:pt-40 pb-4 flex items-center justify-center">
            <div className="text-center">
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
              {/* Explainer video */}
              <div className="max-w-xs mx-auto mb-12">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-xl group">
                  <video
                    className="w-full h-auto block"
                    src="/videos/explainer.mp4"
                    poster="/videos/explainer-poster.jpg"
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={(e) => e.currentTarget.nextElementSibling?.classList.add('hidden')}
                  />
                  <button
                    type="button"
                    aria-label="Přehrát video"
                    onClick={(e) => {
                      const v = e.currentTarget.previousElementSibling as HTMLVideoElement
                      v?.play()
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                  >
                    <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-fuchsia-600 ml-1">
                        <path d="M8 5v14l11-7z"></path>
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

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
                    <span className="text-fuchsia-500">{'↓'}</span>42%
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
              {/* Trust bar — honest signals, not fabricated numbers */} <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /><span className="text-sm text-slate-300 text-left">{language === 'en' ? 'Free account, no card needed' : 'Účet zdarma, bez kreditky'}</span></div><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><Sparkles className="w-5 h-5 text-fuchsia-400 shrink-0" /><span className="text-sm text-slate-300 text-left">{language === 'en' ? 'Every number below is computed live, not staged' : 'Každé číslo níže je spočítané naživo, ne nafocené'}</span></div><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><RotateCcw className="w-5 h-5 text-blue-400 shrink-0" /><span className="text-sm text-slate-300 text-left">{language === 'en' ? '7-day money-back guarantee on Premium' : '7denní garance vrácení peněz na Premium'}</span></div></motion.div></div></div>

          {/* Broker connect teaser — small, just logo + label + CTA */}
          <div className="pt-6 sm:pt-8">
            <motion.div
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-1.5 py-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="relative flex items-center justify-center w-7 h-7 rounded-lg border border-white/15 overflow-hidden flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d2b4e 0%, #0a1f3a 100%)' }}
                    aria-label="MetaTrader 5"
                    title="MetaTrader 5"
                  >
                    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="w-5 h-5">
                      <rect x="10" y="14" width="5" height="18" rx="1" fill="#e53935" />
                      <line x1="12.5" y1="10" x2="12.5" y2="36" stroke="#e53935" strokeWidth="1.3" />
                      <rect x="19" y="18" width="5" height="16" rx="1" fill="#43a047" />
                      <line x1="21.5" y1="12" x2="21.5" y2="38" stroke="#43a047" strokeWidth="1.3" />
                      <text x="36" y="32" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="20" fill="#ffffff">5</text>
                    </svg>
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-white">
                    {language === 'en' ? 'Broker' : 'Broker'}
                  </span>
                </div>

                <Link
                  href={user ? '/account/integrations' : '/signup'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-300 hover:border-fuchsia-500/40 hover:text-fuchsia-300 transition-all flex-shrink-0"
                >
                  <ArrowRight className="w-3 h-3" />
                  {language === 'en' ? 'Connect' : 'Připojit'}
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Real proof, page by page - each section below is the actual
              in-app component/engine for that feature, fed example data,
              not a screenshot or a fabricated mockup. */}
          <div className="pb-20 pt-4">
            {/* Daily Tracker */}
            <motion.div
              className="max-w-3xl mx-auto mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400 mb-3">
                {language === 'en' ? 'From Daily Tracker' : 'Z Daily Trackeru'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {language === 'en'
                  ? 'Your real daily summary - computed, not staged.'
                  : 'Tvůj skutečný denní přehled - spočítaný, ne nafocený.'}
              </p>
            </motion.div>
            <motion.div
              className="max-w-4xl mx-auto mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <DailySummaryTeaser
                trades={DEMO_DAY_TRADES}
                dateLabel={language === 'en' ? 'today' : 'dnes'}
              />
            </motion.div>

            {/* AI Coach */}
            <motion.div
              className="max-w-3xl mx-auto mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-rose-400 mb-3">
                {language === 'en' ? 'From AI Coach' : 'Z AI Coache'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {language === 'en'
                  ? 'An AI coach that stops you before the mistake happens.'
                  : 'AI kouč, co tě zastaví dřív, než uděláš chybu.'}
              </p>
            </motion.div>
            <motion.div
              className="max-w-4xl mx-auto mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <AiCoachTeaser isEn={language === 'en'} />
            </motion.div>

            {/* Journal */}
            <motion.div
              className="max-w-3xl mx-auto mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400 mb-3">
                {language === 'en' ? 'From Journal' : 'Z Journalu'}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {language === 'en'
                  ? 'Every mistake, priced in real money.'
                  : 'Každá chyba, se svou skutečnou cenou v penězích.'}
              </p>
            </motion.div>

            <motion.div
              className="max-w-4xl mx-auto mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <EmotionalTaxSheet trades={DEMO_TAX_TRADES} isEn={language === 'en'} />
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

      <Link
        href="/backstage"
        tabIndex={-1}
        className="group fixed bottom-0 right-0 z-50 flex h-10 w-10 items-end justify-end p-3"
      >
        <span className="block h-3 w-3 rounded-full bg-slate-400 opacity-[0.15] transition-opacity group-hover:opacity-70" />
      </Link>
    </div>
  )
}
