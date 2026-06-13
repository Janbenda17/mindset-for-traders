'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface FunnelTraderProfileProps {
  onNext: (profile: string) => void
  onBack: () => void
}

const TRADER_TYPES = [
  {
    id: 'scalper',
    title: 'Scalper',
    description: 'Quick trades, high volume, emotional discipline needed',
    icon: '⚡',
  },
  {
    id: 'daytrader',
    title: 'Day Trader',
    description: 'Intraday positions, pattern recognition, momentum focus',
    icon: '📈',
  },
  {
    id: 'swingtrader',
    title: 'Swing Trader',
    description: 'Multi-day holds, technical analysis, patience required',
    icon: '📊',
  },
  {
    id: 'longterm',
    title: 'Long-Term',
    description: 'Weekly/monthly trades, trend following, conviction plays',
    icon: '🎯',
  },
]

export function FunnelTraderProfile({ onNext, onBack }: FunnelTraderProfileProps) {
  const [selected, setSelected] = useState<string | null>(null)

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
              <span className="text-xs font-mono text-fuchsia-400">Step 1 of 3</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-white mb-2"
          >
            What's your trading style?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400"
          >
            This helps us understand your psychology challenges
          </motion.p>
        </div>

        {/* Options grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {TRADER_TYPES.map((type, i) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => setSelected(type.id)}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                selected === type.id
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20'
                  : 'border-slate-700 bg-slate-900/50 hover:border-fuchsia-500/50 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{type.icon}</span>
                {selected === type.id && (
                  <div className="w-5 h-5 rounded-full bg-fuchsia-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-white text-lg mb-1">{type.title}</h3>
              <p className="text-sm text-slate-400">{type.description}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4"
        >
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1 rounded-xl h-12 border-slate-700 hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => selected && onNext(selected)}
            disabled={!selected}
            size="lg"
            className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl h-12 group"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
