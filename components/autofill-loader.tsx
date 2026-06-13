'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Zap, Brain, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface AutofillLoaderProps {
  stage: 'analyzing' | 'generating' | 'complete'
  message?: string
}

export function AutofillLoader({ stage, message }: AutofillLoaderProps) {
  const [displayMessage, setDisplayMessage] = useState(message)

  useEffect(() => {
    setDisplayMessage(message)
  }, [message])

  const stageMessages = {
    analyzing: 'Analyzing broker data...',
    generating: 'Generating AI insights...',
    complete: 'Ready to review!'
  }

  const icons = {
    analyzing: Zap,
    generating: Brain,
    complete: Lightbulb
  }

  const Icon = icons[stage]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={stage !== 'complete' ? { rotate: 360 } : {}}
              transition={stage !== 'complete' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
            >
              <Icon className="w-12 h-12 text-purple-400" />
            </motion.div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">
                {displayMessage || stageMessages[stage]}
              </h3>
              
              {stage === 'analyzing' && (
                <p className="text-sm text-slate-400">
                  Checking MT4 trades, identifying losses and patterns...
                </p>
              )}
              
              {stage === 'generating' && (
                <p className="text-sm text-slate-400">
                  Creating personalized fail log analysis and daily intentions...
                </p>
              )}

              {stage === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-green-400 font-semibold">
                    AI has auto-filled your daily planning
                  </p>
                </motion.div>
              )}
            </div>

            {stage !== 'complete' && (
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
