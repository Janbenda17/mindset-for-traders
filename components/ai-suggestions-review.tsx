'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Edit2, AlertCircle, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface FailLogReview {
  trades: any[]
  rootCauses: string[]
  lessons: string[]
  preventionSteps: string[]
}

interface IntentionsReview {
  maxDailyLoss: number
  targetTrades: number
  focusAreas: string[]
  keyBehaviors: string[]
  emotionalFocal: string
}

interface AISuggestionsReviewProps {
  failLog?: FailLogReview
  intentions?: IntentionsReview
  onAccept: () => void
  onEdit: () => void
  isLoading?: boolean
}

export function AISuggestionsReview({
  failLog,
  intentions,
  onAccept,
  onEdit,
  isLoading
}: AISuggestionsReviewProps) {
  const [accepted, setAccepted] = useState(false)

  if (accepted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mb-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">AI Insights Accepted!</h3>
            <p className="text-slate-400">
              Your daily tracking is now auto-populated. Start your trading day with AI-guided clarity.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {failLog && (
        <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Fail Log Analysis ({failLog.trades.length} losing trades detected)
                  </h3>
                </div>
              </div>

              {failLog.rootCauses.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-orange-300 uppercase tracking-wider">
                    Root Causes Identified
                  </h4>
                  <div className="space-y-2">
                    {failLog.rootCauses.map((cause, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10"
                      >
                        <span className="text-orange-400 font-bold text-sm mt-0.5">•</span>
                        <span className="text-sm text-slate-300">{cause}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {failLog.preventionSteps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
                    Prevention Steps
                  </h4>
                  <div className="space-y-2">
                    {failLog.preventionSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
                      >
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {intentions && (
        <Card className="border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Daily Intentions Generated
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                  <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                    Max Daily Loss
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">
                    ${intentions.maxDailyLoss}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
                    Target Trades
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {intentions.targetTrades}
                  </div>
                </div>
              </div>

              {intentions.focusAreas.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                    Focus Areas for Today
                  </h4>
                  <div className="space-y-2">
                    {intentions.focusAreas.map((area, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
                      >
                        <span className="text-cyan-400 font-bold text-sm mt-0.5">→</span>
                        <span className="text-sm text-slate-300">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                  Emotional Focal Point
                </div>
                <p className="text-white font-semibold italic">{intentions.emotionalFocal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => {
            setAccepted(true)
            onAccept()
          }}
          disabled={isLoading}
          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold gap-2"
        >
          <Check className="w-5 h-5" />
          Accept AI Suggestions
        </Button>

        <Button
          onClick={onEdit}
          disabled={isLoading}
          variant="outline"
          className="flex-1 h-12 gap-2"
        >
          <Edit2 className="w-5 h-5" />
          Edit
        </Button>
      </div>
    </motion.div>
  )
}
