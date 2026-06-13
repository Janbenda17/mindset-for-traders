'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FunnelWelcomeProps {
  onNext: () => void
  userName?: string
}

export function FunnelWelcome({ onNext, userName }: FunnelWelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mx-auto mb-8 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center"
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl font-black text-white mb-4"
        >
          Welcome{userName && `, ${userName}`}!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-slate-300 mb-8 leading-relaxed"
        >
          Let's set up your trading psychology journey in 3 simple steps.
        </motion.p>

        {/* Steps preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mb-12 text-left"
        >
          {[
            'Understand your trader profile',
            'Set up your daily routine',
            'Connect your broker (optional)',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/50 flex items-center justify-center text-xs font-bold text-fuchsia-400">
                {i + 1}
              </div>
              <span className="text-slate-300">{step}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onNext}
            size="lg"
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold rounded-xl h-12 group"
          >
            Start Setup
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Skip option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onNext}
          className="mt-4 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          Skip for now →
        </motion.button>
      </motion.div>
    </div>
  )
}
