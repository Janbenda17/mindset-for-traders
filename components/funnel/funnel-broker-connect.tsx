'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FunnelBrokerConnectProps {
  onNext: () => void
  onBack: () => void
}

export function FunnelBrokerConnect({ onNext, onBack }: FunnelBrokerConnectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5">
              <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
              <span className="text-xs font-mono text-fuchsia-400">Step 3 of 3</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-white mb-2"
          >
            Connect your broker
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400"
          >
            Optional — AI will analyze your real trades for better insights
          </motion.p>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-12"
        >
          <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 space-y-4">
            <h3 className="font-semibold text-white mb-4">What you'll unlock:</h3>
            {[
              'Real-time trade analysis and psychology feedback',
              'Automated pattern detection from your trades',
              'AI-powered risk management alerts',
              'Weekly performance insights & breakdowns',
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col gap-3"
        >
          <Link href="/account/integrations" className="w-full">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold rounded-xl h-12 group"
            >
              <Lock className="w-4 h-4 mr-2" />
              Connect MetaTrader 5
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Button
            onClick={onNext}
            variant="outline"
            size="lg"
            className="w-full rounded-xl h-12 border-slate-700 hover:bg-slate-800/50 text-slate-200"
          >
            Skip for now, take me to the app
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-200 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
