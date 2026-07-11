'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Brain, ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import {
  SELF_REPORT_QUESTIONS,
  SELF_REPORT_OPTIONS,
  scoreSelfReport,
  type SelfReportProfile,
} from '@/lib/self-report-score'

const TOTAL = SELF_REPORT_QUESTIONS.length

export default function OnboardingPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const isEn = language === 'en'

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL).fill(null))
  const [profile, setProfile] = useState<SelfReportProfile | null>(null)

  const handleAnswer = (optionIndex: number) => {
    const next = [...answers]
    next[step] = optionIndex
    setAnswers(next)

    if (step === TOTAL - 1) {
      const result = scoreSelfReport(next as number[])
      setProfile(result)
      try {
        if (typeof window !== 'undefined' && (window as any).clarity) {
          ;(window as any).clarity('event', 'onboarding_quiz_completed')
        }
      } catch {}
    } else {
      setStep(step + 1)
    }
  }

  const skip = () => router.push('/daily-tracker')

  const colorClasses = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    orange: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  } as const

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
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
        {!profile && (
          <button
            onClick={skip}
            className="absolute -top-10 right-0 text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono uppercase tracking-wide"
          >
            {isEn ? 'Skip' : 'Přeskočit'}
          </button>
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
                    className={`h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-500 ${
                      i <= step ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs font-mono uppercase tracking-[0.2em] text-fuchsia-400 mb-3">
              {isEn ? `Question ${step + 1} of ${TOTAL}` : `Otázka ${step + 1} z ${TOTAL}`}
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
                  {isEn ? SELF_REPORT_QUESTIONS[step].textEn : SELF_REPORT_QUESTIONS[step].textCz}
                </h2>

                <div className="space-y-2.5">
                  {SELF_REPORT_OPTIONS.map((opt, i) => (
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
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
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
                <span className="text-3xl font-black text-white">{profile.score}%</span>
              </div>
            </div>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-[0.15em] mb-4 border ${colorClasses[profile.color].bg} ${colorClasses[profile.color].border} ${colorClasses[profile.color].text}`}
            >
              {isEn ? profile.labelEn : profile.label}
            </span>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8">
              {isEn ? profile.diagnosisEn : profile.diagnosisCz}
            </p>

            <div className="rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-5 mb-4">
              <p className="text-white font-bold text-base sm:text-lg mb-1.5">
                {isEn ? 'Ready to actually move forward as a trader?' : 'Chceš se v tradingu fakt posunout dál?'}
              </p>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                {isEn
                  ? "This is just the surface. Your full breakdown — all 6 categories, concrete fixes, and results checked against your real trades — is unlocked with Premium."
                  : 'Tohle je jen špička ledovce. Tvůj kompletní rozbor — všech 6 kategorií, konkrétní kroky k nápravě a ověření na reálných obchodech — je odemčený v Premium.'}
              </p>
              <Link href="/upgrade">
                <Button className="w-full h-11 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-semibold rounded-lg">
                  {isEn ? 'Uncover all my mistakes' : 'Odhalit všechny moje chyby'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <button
              onClick={skip}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {isEn ? 'First, let me just try the app' : 'Nejdřív chci appku jen vyzkoušet'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
