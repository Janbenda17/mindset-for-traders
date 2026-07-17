'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Brain, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle, Sparkles, Gift } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import {
  SELF_REPORT_QUESTIONS,
  SELF_REPORT_OPTIONS,
  STYLE_QUESTIONS,
  scoreSelfReport,
  buildArchetype,
  type SelfReportProfile,
  type ArchetypeResult,
} from '@/lib/self-report-score'

const SCORED_TOTAL = SELF_REPORT_QUESTIONS.length
const STYLE_TOTAL = STYLE_QUESTIONS.length
const TOTAL = SCORED_TOTAL + STYLE_TOTAL

export default function OnboardingPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const isEn = language === 'en'

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL).fill(null))
  const [profile, setProfile] = useState<SelfReportProfile | null>(null)
  const [archetype, setArchetype] = useState<ArchetypeResult | null>(null)

  const isStyleStep = step >= SCORED_TOTAL
  const currentOptions = isStyleStep
    ? null // style questions carry their own custom option labels
    : SELF_REPORT_OPTIONS

  const handleAnswer = (optionIndex: number) => {
    const next = [...answers]
    next[step] = optionIndex
    setAnswers(next)

    if (step === TOTAL - 1) {
      const scored = next.slice(0, SCORED_TOTAL) as number[]
      const styleAnswers = next.slice(SCORED_TOTAL) as number[]
      const result = scoreSelfReport(scored)
      const arch = buildArchetype(styleAnswers, result.score)
      setProfile(result)
      setArchetype(arch)
      try {
        if (typeof window !== 'undefined' && (window as any).clarity) {
          ;(window as any).clarity('event', 'onboarding_quiz_completed')
        }
      } catch {}
    } else {
      setStep(step + 1)
    }
  }

  // Used to send the user to /daily-tracker for a sample-data tour. Now that
  // ClientLayout's Hard Wall redirects any never-activated user (no broker
  // connected, no subscription) straight back out of every app page except
  // /account/integrations, that destination no longer works - so "skipping"
  // the quiz now goes straight to the real activation step instead.
  const skip = () => router.push('/account/integrations')

  const colorClasses = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    orange: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  } as const

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-10 overflow-y-auto relative">
      {/* Background glow, consistent with rest of app */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <div className="absolute inset-0 bg-slate-950" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(217, 70, 239, 0.1), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.08), transparent 50%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* In-flow, not absolutely positioned above the card - the old
            `absolute -top-10` placement could land underneath ClientLayout's
            fixed top nav (z-50) on shorter/mobile viewports, where the card
            renders closer to the top of the screen. That made the button
            invisible and unclickable (a dead click) instead of just
            unclickable-looking - Clarity recordings flagged repeated dead
            clicks on this page, and this negative-offset absolute button was
            the only element positioned in a way that could actually overlap
            the fixed nav. Keeping it in normal flow guarantees it always
            renders below the pt-24 spacer ClientLayout reserves for the nav. */}
        {!profile && (
          <div className="flex justify-end mb-2">
            <button
              onClick={skip}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono uppercase tracking-wide"
            >
              {isEn ? 'Skip' : 'Přeskočit'}
            </button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded-2xl mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MindTrader</h1>
        </div>

        {!profile ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            {/* Progress bar */}
            <div className="flex items-center gap-1.5 mb-8">
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i < SCORED_TOTAL
                        ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    } ${i <= step ? 'w-full' : 'w-0'}`}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-400 mb-3">
              {isStyleStep
                ? isEn
                  ? `Style ${step - SCORED_TOTAL + 1} of ${STYLE_TOTAL}`
                  : `Styl ${step - SCORED_TOTAL + 1} z ${STYLE_TOTAL}`
                : isEn
                  ? `Question ${step + 1} of ${SCORED_TOTAL}`
                  : `Otázka ${step + 1} z ${SCORED_TOTAL}`}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-8">
                  {isStyleStep
                    ? isEn
                      ? STYLE_QUESTIONS[step - SCORED_TOTAL].textEn
                      : STYLE_QUESTIONS[step - SCORED_TOTAL].textCz
                    : isEn
                      ? SELF_REPORT_QUESTIONS[step].textEn
                      : SELF_REPORT_QUESTIONS[step].textCz}
                </h2>

                <div className="space-y-2.5">
                  {isStyleStep
                    ? (isEn
                        ? STYLE_QUESTIONS[step - SCORED_TOTAL].optionsEn
                        : STYLE_QUESTIONS[step - SCORED_TOTAL].optionsCz
                      ).map((label, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className="w-full text-left px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 font-medium hover:border-cyan-500/50 hover:bg-cyan-500/[0.06] hover:text-white transition-all"
                      >
                          {label}
                        </button>
                      ))
                    : currentOptions!.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className="w-full text-left px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 font-medium hover:border-fuchsia-500/50 hover:bg-fuchsia-500/[0.06] hover:text-white transition-all"
                      >
                          {isEn ? opt.labelEn : opt.labelCz}
                        </button>
                      ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8"
          >
            {/* Unlocked-trial hook — the very first thing they see when the
                quiz result renders. Frames broker connect as a reward they
                just earned for finishing the quiz (gamified "you unlocked X"
                framing), not a demand. Links straight to broker connect. */}
            <Link
              href="/account/integrations"
              onClick={() => {
                try {
                  if (typeof window !== 'undefined' && (window as any).clarity) {
                    ;(window as any).clarity('event', 'onboarding_unlock_banner_cta')
                  }
                } catch {}
              }}
              className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-orange-500/5 p-4 mb-4 flex items-start gap-3 hover:border-amber-500/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
                <Gift className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {isEn ? "You've unlocked a 3-day free trial →" : 'Právě jsi odemkl/a 3denní free trial →'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEn
                    ? 'Connect your broker and try the software on your own trades — free, no card needed.'
                    : 'Napoj brokera a vyzkoušej si software na vlastních datech — zdarma, bez karty.'}
                </p>
              </div>
            </Link>

            {/* The "See your dashboard, based on your type" sample-data tour
                banner that used to live here sent users to /daily-tracker in
                Virtual Mode. It's removed: ClientLayout's Hard Wall now
                redirects any never-activated user (no broker connected, no
                subscription) out of every app page except
                /account/integrations, so that link would just bounce them
                straight back here. The unlock-trial banner above and the
                connect CTA below are the only two forward paths now. */}

            {/* Archetype title */}
            {archetype && (
              <div className="text-center mb-6">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400 mb-2">
                  {isEn ? 'Your trader type' : 'Tvůj typ tradera'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {isEn ? archetype.titleEn : archetype.titleCz}
                </h2>
              </div>
            )}

            {/* Score gauge */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${
                    profile.color === 'emerald' ? '#34d399' : profile.color === 'orange' ? '#fbbf24' : '#f87171'
                  } ${profile.score * 3.6}deg, rgb(30 41 59) 0deg)`,
                }}
              />
              <div className="absolute inset-[6px] rounded-full bg-slate-950 flex flex-col items-center justify-center">
                <ShieldCheck className={`h-4 w-4 mb-1 ${colorClasses[profile.color].text}`} />
                <span className="text-2xl font-black text-white">{profile.score}%</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-[0.15em] border ${colorClasses[profile.color].bg} ${colorClasses[profile.color].border} ${colorClasses[profile.color].text}`}
              >
                {isEn ? profile.labelEn : profile.label}
              </span>
            </div>

            {/* Strength */}
            {(profile.strengthCz || profile.strengthEn) && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 mb-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> {isEn ? 'Your strength' : 'Co ti jde dobře'}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isEn ? profile.strengthEn : profile.strengthCz}
                </p>
              </div>
            )}

            {/* Primary weakness */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 mb-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-red-400 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> {isEn ? 'Your biggest pattern' : 'Tvůj hlavní vzorec'}
              </p>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {isEn ? profile.primaryEn : profile.primaryCz}
              </p>
              {(profile.secondaryCz || profile.secondaryEn) && (
                <p className="text-sm text-slate-400 leading-relaxed mt-2 pt-2 border-t border-red-500/10">
                  {isEn ? profile.secondaryEn : profile.secondaryCz}
                </p>
              )}
            </div>

            {/* Style-contextualized insight */}
            {archetype && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4 mb-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-cyan-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {isEn ? 'Insight for your style' : 'Insight pro tvůj styl'}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isEn ? archetype.styleContextEn : archetype.styleContextCz}
                </p>
                {(archetype.bonusCz || archetype.bonusEn) && (
                  <p className="text-sm text-slate-400 leading-relaxed mt-2 pt-2 border-t border-cyan-500/10">
                    {isEn ? archetype.bonusEn : archetype.bonusCz}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-5 mb-4">
              <p className="text-white font-bold text-base sm:text-lg mb-1.5">
                {isEn ? 'Ready to actually move forward as a trader?' : 'Chceš se v tradingu fakt posunout dál?'}
              </p>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                {isEn
                  ? 'This result is based on your quiz answers. Connect your MT4/MT5 account and get the same kind of analysis on your real trades for 3 days, free — no card. The AI coach and live analysis switch on the moment you connect.'
                  : 'Tenhle výsledek vychází z tvých odpovědí v kvízu. Připoj svůj MT4/MT5 účet a dostaneš stejnou analýzu na svých reálných obchodech na 3 dny zdarma — bez karty. AI kouč a živá analýza se zapnou hned po připojení.'}
              </p>
              <Link
                href="/account/integrations"
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && (window as any).clarity) {
                      ;(window as any).clarity('event', 'onboarding_connect_cta')
                    }
                  } catch {}
                }}
              >
                <Button className="w-full h-11 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-semibold rounded-lg">
                  {isEn ? 'Connect broker & unlock everything' : 'Připojit brokera a odemknout vše'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* The old "Skip the tour, go straight to the dashboard" link
                that lived here also pointed at /daily-tracker and is removed
                for the same reason as the tour banner above - the dashboard
                isn't reachable pre-broker-connect anymore, and it was
                redundant with the "Connect broker & unlock everything"
                button right above it, which is now the only way forward. */}
          </motion.div>
        )}
      </div>
    </div>
  )
}
