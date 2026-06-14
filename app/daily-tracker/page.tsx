'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Target, Shield, CheckCircle2, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function DailyTrackerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [todayEntry, setTodayEntry] = useState(null)
  const [entries, setEntries] = useState([])
  const [aiGenerating, setAiGenerating] = useState(false)

  // Demo data
  const demoData = {
    date: new Date().toLocaleDateString('cs-CZ'),
    intentions: {
      maxLoss: 2,
      targetTrades: 3,
      focus: 'EUR/USD, GBP/USD',
      emotionalGoal: 'Patience a discipline',
      aiGenerated: true,
      aiNotes: 'AI analyzovala včerajší data z brokera:\n• 2 prohraná trades (EUR/USD -150 due to breakout, GBP/USD -80 due to news)\n• Hlavní lesson: Brání si o 30min před zpravami\n• Doporučuji: Redukovat risk o 50% dnes, fokus na pull-backs'
    },
    trades: [
      { pair: 'EUR/USD', result: '+150', time: '10:30', loss: false },
      { pair: 'GBP/USD', result: '+220', time: '14:15', loss: false },
      { pair: 'USD/JPY', result: '-80', time: '16:45', loss: true }
    ],
    summary: {
      totalResult: '+290',
      winRate: '67%',
      bestTrade: 'GBP/USD +220',
      lesson: 'Příliš dlouho jsem setrvál v USD/JPY'
    },
    stagesCompleted: 2
  }

  // History entries - Only Daily Summary (bez intentions)
  const historyData = [
    {
      date: '14.6.2026',
      summary: {
        totalResult: '+470',
        winRate: '100%',
        bestTrade: 'Gold +320',
        lesson: 'Breakout strategie funguje perfektně na Gold, pokračuj v tomto'
      }
    },
    {
      date: '13.6.2026',
      summary: {
        totalResult: '+15',
        winRate: '50%',
        bestTrade: 'GBP/JPY +120',
        lesson: 'Volatilita byla vysoká - měl jsem zmenšit lot size a být trpělivější s entry'
      }
    },
    {
      date: '12.6.2026',
      summary: {
        totalResult: '+320',
        winRate: '67%',
        bestTrade: 'EUR/USD +200',
        lesson: 'Breakouty fungují - měl jsem udržet pozici v USD/JPY déle'
      }
    }
  ]

  useEffect(() => {
    setIsLoading(false)
    setTodayEntry(demoData)
    // History only shows Stage 2 (Daily Intentions), not Summary
    setEntries(historyData)
  }, [])

  const handleGenerateAI = async () => {
    setAiGenerating(true)
    try {
      // Simulate AI generation
      await new Promise(r => setTimeout(r, 1500))
      
      const aiIntentions = {
        maxLoss: 2,
        targetTrades: 3,
        focus: 'EUR/USD, GBP/USD',
        emotionalGoal: 'Patience a discipline',
        aiGenerated: true,
        aiNotes: 'AI analyzovala včerajší data - 2 prohrané trades → redukuji risk o 50%'
      }
      
      setTodayEntry(prev => ({
        ...prev,
        intentions: aiIntentions
      }))
      
      toast({
        title: 'AI Intentions Generated',
        description: 'Your trading intentions are ready for today'
      })
    } finally {
      setAiGenerating(false)
    }
  }

  const stages = [
    {
      id: 2,
      name: 'Daily Intentions',
      icon: Target,
      completed: todayEntry?.stagesCompleted >= 1
    },
    {
      id: 3,
      name: 'Daily Summary',
      icon: Shield,
      completed: todayEntry?.stagesCompleted >= 2
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-2">Daily Tracker</h1>
          <p className="text-slate-400">Your trading day at a glance</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            {todayEntry ? (
              <>
                {/* Stage Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        Today's Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {stages.map((stage) => {
                          const Icon = stage.icon
                          return (
                            <motion.div
                              key={stage.id}
                              whileHover={{ y: -4 }}
                              className={`p-4 rounded-xl transition-all border-2 ${
                                stage.completed
                                  ? 'bg-green-500/10 border-green-500/50'
                                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <Icon className={`h-5 w-5 ${stage.completed ? 'text-green-400' : 'text-slate-400'}`} />
                                {stage.completed && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                              </div>
                              <h3 className="font-semibold text-white text-sm">{stage.name}</h3>
                              <p className="text-xs text-slate-400 mt-1">
                                {stage.completed ? 'Completed' : 'Pending'}
                              </p>
                            </motion.div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Stage 2: Daily Intentions (AI Generated) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-cyan-400" />
                        Daily Intentions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Max Loss</p>
                          <p className="text-lg font-bold text-cyan-400">{todayEntry?.intentions?.maxLoss}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Target Trades</p>
                          <p className="text-lg font-bold text-cyan-400">{todayEntry?.intentions?.targetTrades}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-2">Focus Areas</p>
                        <p className="text-sm text-slate-300">{todayEntry?.intentions?.focus}</p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 mb-2">Emotional Goal</p>
                        <p className="text-sm text-slate-300">{todayEntry?.intentions?.emotionalGoal}</p>
                      </div>

                      {todayEntry?.intentions?.aiNotes && (
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                          <p className="text-xs text-cyan-300 font-bold mb-2">AI Analysis</p>
                          <p className="text-xs text-cyan-200 whitespace-pre-wrap">{todayEntry.intentions.aiNotes}</p>
                        </div>
                      )}

                      {!todayEntry?.intentions?.aiGenerated && (
                        <Button 
                          onClick={handleGenerateAI}
                          disabled={aiGenerating}
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Stage 3: Daily Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="border border-green-500/30 bg-gradient-to-br from-green-500/10 to-slate-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Shield className="h-5 w-5 text-green-400" />
                        Daily Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Trades List */}
                      <div>
                        <p className="text-xs text-slate-400 mb-2 font-bold">Today's Trades</p>
                        <div className="space-y-2">
                          {todayEntry?.trades?.map((trade, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                              <div>
                                <p className="text-sm font-semibold text-slate-300">{trade.pair}</p>
                                <p className="text-xs text-slate-400">{trade.time}</p>
                              </div>
                              <p className={`text-sm font-bold ${trade.loss ? 'text-red-400' : 'text-green-400'}`}>
                                {trade.result}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                          <label className="text-xs text-slate-400">Total Result</label>
                          <p className={`text-2xl font-bold ${todayEntry.summary?.totalResult.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {todayEntry.summary?.totalResult}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                          <label className="text-xs text-slate-400">Win Rate</label>
                          <p className="text-2xl font-bold text-white">{todayEntry.summary?.winRate}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <label className="text-xs text-slate-400">Best Trade</label>
                        <p className="text-sm text-green-400 font-semibold">{todayEntry.summary?.bestTrade}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <label className="text-xs text-amber-300 font-bold">Lesson Learned</label>
                        <p className="text-sm text-amber-200 mt-1">{todayEntry.summary?.lesson}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              <Card className="border border-slate-800 bg-slate-900">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No entry for today yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab - Complete Daily Summary with All Data */}
          <TabsContent value="history" className="space-y-4">
            {entries.length > 0 ? (
              entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all">
                    <CardContent className="p-4 space-y-4">
                      {/* Date & Result Header */}
                      <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                        <div>
                          <p className="text-sm text-slate-400 font-semibold">{entry.date}</p>
                          <p className={`text-xl font-bold mt-1 ${entry.summary?.totalResult?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {entry.summary?.totalResult}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Win Rate</p>
                          <p className="text-lg font-bold text-cyan-400">{entry.summary?.winRate}</p>
                        </div>
                      </div>

                      {/* Trades List */}
                      {entry.trades?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-2 font-bold">Trades ({entry.trades.length})</p>
                          <div className="space-y-1">
                            {entry.trades.map((trade, j) => (
                              <div key={j} className="flex justify-between items-center p-2 rounded bg-slate-800/50">
                                <span className="text-sm text-slate-300">{trade.pair} @ {trade.time}</span>
                                <span className={`text-sm font-semibold ${trade.loss ? 'text-red-400' : 'text-green-400'}`}>
                                  {trade.result}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best Trade & Lesson */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-2 rounded bg-slate-800/50">
                          <p className="text-xs text-slate-400">Best Trade</p>
                          <p className="text-sm text-green-400 font-semibold">{entry.summary?.bestTrade}</p>
                        </div>
                        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs text-amber-300 font-bold">Lesson</p>
                          <p className="text-xs text-amber-200 mt-1">{entry.summary?.lesson}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="border border-slate-800 bg-slate-900">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No history yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
