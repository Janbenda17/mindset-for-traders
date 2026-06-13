'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Clock, Sun, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface FunnelDailyRoutineProps {
  onNext: (routine: any) => void
  onBack: () => void
}

export function FunnelDailyRoutine({ onNext, onBack }: FunnelDailyRoutineProps) {
  const [morningTime, setMorningTime] = useState('06:00')
  const [marketOpen, setMarketOpen] = useState('09:30')
  const [focusAreas, setFocusAreas] = useState<string[]>([])

  const FOCUS_AREAS = [
    { id: 'discipline', label: 'Discipline & rules', icon: '📋' },
    { id: 'emotions', label: 'Emotion management', icon: '🧠' },
    { id: 'losses', label: 'Loss handling', icon: '📉' },
    { id: 'fomo', label: 'FOMO prevention', icon: '⚠️' },
  ]

  const toggleFocus = (id: string) => {
    setFocusAreas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleNext = () => {
    onNext({
      morningTime,
      marketOpen,
      focusAreas: focusAreas.length > 0 ? focusAreas : ['discipline', 'emotions'],
    })
  }

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
              <span className="text-xs font-mono text-fuchsia-400">Step 2 of 3</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-black text-white mb-2"
          >
            Set your daily routine
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400"
          >
            We'll send reminders at the right time
          </motion.p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-8 mb-8"
        >
          {/* Time selectors */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-3">
                <Sun className="w-4 h-4 text-fuchsia-400" />
                Morning check-in time
              </label>
              <input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-fuchsia-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-2">
                ✓ Best before market opens - assess mood & mindset
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-3">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Market open time
              </label>
              <input
                type="time"
                value={marketOpen}
                onChange={(e) => setMarketOpen(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-2">
                ✓ For trading reminders and AI alerts
              </p>
            </div>
          </div>

          {/* Focus areas */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-3">
              <Clock className="w-4 h-4 text-pink-400" />
              What to focus on? (pick at least 1)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FOCUS_AREAS.map((area, i) => (
                <motion.button
                  key={area.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  onClick={() => toggleFocus(area.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    focusAreas.includes(area.id)
                      ? 'border-fuchsia-500 bg-fuchsia-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-fuchsia-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{area.icon}</div>
                  <div className="text-sm font-medium text-white">{area.label}</div>
                </motion.button>
              ))}
            </div>
          </div>
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
            onClick={handleNext}
            size="lg"
            className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold rounded-xl h-12 group"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
