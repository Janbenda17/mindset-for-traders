'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Target, TrendingUp, CheckCircle2, ArrowRight, Sparkles, Shield, Loader2 } from 'lucide-react'
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
  const [historyLoading, setHistoryLoading] = useState(false)

  // Demo data
  const demoData = {
    date: new Date().toLocaleDateString('cs-CZ'),
    intentions: {
      maxLoss: 2,
      targetTrades: 3,
      focus: 'EUR/USD, GBP/USD',
      emotionalGoal: 'Patience a discipline',
      aiGenerated: true,
      aiNotes: 'Generováno AI z broker dat - AI detekovala 2 prohraná trades z včerejška s lessons'
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

  // Load today's data and history
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setTodayEntry(demoData)
        
        // Load history from API
        setHistoryLoading(true)
        const historyResponse = await fetch('/api/daily-summary/history')
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          setEntries(historyData.summaries || [demoData])
        } else {
          setEntries([demoData])
        }
      } catch (error) {
        console.error('Error loading daily tracker data:', error)
        setEntries([demoData])
      } finally {
        setIsLoading(false)
        setHistoryLoading(false)
      }
    }
    
    loadData()
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
      href: '/daily-intention',
      completed: todayEntry?.stagesCompleted >= 1
    },
    {
      id: 3,
      name: 'Daily Summary',
      icon: Shield,
      href: '/daily-summary',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <TabsTrigger value="today" className="text-sm">
              Today
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              History
            </TabsTrigger>
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
                            <Link key={stage.id} href={stage.href}>
                              <motion.div
                                whileHover={{ y: -4 }}
                                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
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
                            </Link>
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
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Target className="h-5 w-5 text-cyan-400" />
                          Daily Intentions
                        </CardTitle>
                        {!todayEntry.intentions?.aiGenerated && (
                          <Button
                            onClick={handleGenerateAI}
                            disabled={aiGenerating}
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            {aiGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {todayEntry.intentions?.aiGenerated && (
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-300 flex items-start gap-2">
                          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{todayEntry.intentions.aiNotes}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 uppercase">Max Loss</label>
                          <p className="text-2xl font-bold text-white">{todayEntry.intentions?.maxLoss}%</p>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 uppercase">Target Trades</label>
                          <p className="text-2xl font-bold text-white">{todayEntry.intentions?.targetTrades}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-400 uppercase">Focus Areas</label>
                          <p className="text-sm text-slate-300">{todayEntry.intentions?.focus}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-400 uppercase">Emotional Goal</label>
                          <p className="text-sm text-slate-300">{todayEntry.intentions?.emotionalGoal}</p>
                        </div>
                      </div>

                      <Link href="/daily-intention">
                        <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                          Edit & Confirm
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
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
                        Today's Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
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
                          <label className="text-xs text-amber-300">Key Lesson</label>
                          <p className="text-sm text-amber-100 mt-1">{todayEntry.summary?.lesson}</p>
                        </div>

                        {todayEntry.trades?.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-xs text-slate-400 uppercase">Trades</label>
                            <div className="space-y-1">
                              {todayEntry.trades.map((trade, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
                                  <span className="text-sm text-slate-300">{trade.pair} @ {trade.time}</span>
                                  <span className={`text-sm font-semibold ${trade.loss ? 'text-red-400' : 'text-green-400'}`}>
                                    {trade.result}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {historyLoading ? (
              <Card className="border border-slate-800 bg-slate-900">
                <CardContent className="p-8 flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </CardContent>
              </Card>
            ) : entries.length > 0 ? (
              entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-slate-700 transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-400">{entry.date}</p>
                          <p className={`text-lg font-bold ${entry.summary?.totalResult?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {entry.summary?.totalResult}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Win Rate</p>
                          <p className="text-lg font-semibold text-white">{entry.summary?.winRate}</p>
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
