'use client'

import Link from 'next/link'
import { TopNavigation } from '@/components/top-navigation'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import EmotionalTaxSheet from '@/components/emotional-tax-sheet'
import DisciplineMatrix from '@/components/discipline-matrix'
import DayDetailPanel from '@/components/day-detail-panel'
import DailySummaryTeaser from '@/components/daily-summary-teaser'
import AiCoachTeaser from '@/components/ai-coach-teaser'
import type { DisciplineDay } from '@/lib/discipline-matrix'
import { cn } from '@/lib/utils'

// Dates are anchored to the CURRENT month for the same reason as the
// homepage's demo data - see app/page.tsx for the full rationale.
const now = new Date()
const DEMO_YEAR = now.getFullYear()
const DEMO_MONTH = now.getMonth() // 0-indexed
function demoDate(day: number) {
  return `${DEMO_YEAR}-${String(DEMO_MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Same illustrative trading month as the homepage demo, run through the
// real Emotional Tax Sheet + Discipline Matrix engines - not fabricated data.
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

export default function ProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const [selectedDemoDay, setSelectedDemoDay] = useState<DisciplineDay | null>(null)

  const isEn = language === 'en'

  const handleCtaClick = () => {
    router.push(user ? '/upgrade' : '/signup')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <TopNavigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-24">
        {/* Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-fuchsia-400 mb-4">
            {isEn ? 'Product tour' : 'Prohlídka produktu'}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[1.05] text-balance">
            {isEn ? 'Every feature, running on real data.' : 'Každá funkce, na reálných datech.'}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? "These aren't screenshots or mockups - it's the actual app, fed example trades."
              : 'Tohle nejsou screenshoty ani mockupy - je to skutečná aplikace, jen s ukázkovými obchody.'}
          </p>
        </motion.div>

        {/* Daily Tracker */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400 mb-3">
            {isEn ? 'From Daily Tracker' : 'Z Daily Trackeru'}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {isEn
              ? 'Your real daily summary - computed, not staged.'
              : 'Tvůj skutečný denní přehled - spočítaný, ne nafocený.'}
          </p>
        </motion.div>
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <DailySummaryTeaser
            trades={DEMO_DAY_TRADES}
            dateLabel={isEn ? 'today' : 'dnes'}
          />
        </motion.div>

        {/* AI Coach */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-rose-400 mb-3">
            {isEn ? 'From AI Coach' : 'Z AI Coache'}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {isEn
              ? 'An AI coach that stops you before the mistake happens.'
              : 'AI kouč, co tě zastaví dřív, než uděláš chybu.'}
          </p>
        </motion.div>
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <AiCoachTeaser isEn={isEn} />
        </motion.div>

        {/* Journal */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400 mb-3">
            {isEn ? 'From Journal' : 'Z Journalu'}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {isEn
              ? 'Every mistake, priced in real money.'
              : 'Každá chyba, se svou skutečnou cenou v penězích.'}
          </p>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <EmotionalTaxSheet trades={DEMO_TAX_TRADES} isEn={isEn} />
        </motion.div>

        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3">
            {isEn ? 'Click any day for the full breakdown · live in-app feature' : 'Klikni na den pro detailní rozbor · živá funkce z aplikace'}
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

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleCtaClick}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:from-fuchsia-400 hover:to-purple-500 font-bold text-base px-8 py-6 rounded-lg shadow-lg shadow-fuchsia-500/30 border border-white/10"
          >
            {isEn ? 'Get Started Free' : 'Začít zdarma'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              {isEn ? '← Back to homepage' : '← Zpět na homepage'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
