'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Target, Calendar as CalendarIcon, TrendingUp, CheckCircle2, Moon, ArrowRight, Sparkles, Sun, Shield, Brain, Zap, AlertTriangle, Heart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DailyTrackerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('today')
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [todayEntry, setTodayEntry] = useState(null)
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Demo data
  const virtualData = [
    {
      date: new Date().toLocaleDateString('cs-CZ'),
      morningCheck: {
        sleepHours: 7.5,
        sleepQuality: 8,
        energyLevel: 8,
        focus: 7,
        stressLevel: 3,
        emotionalState: 7
      },
      intention: {
        goals: 'Focus na EUR/USD, max 2 trades',
        maxRiskPercent: 2,
        emotionalGoal: 'Disciplína a patience'
      },
      stagesCompleted: 2
    }
  ]

  useEffect(() => {
    if (!user) {
      setIsLiveMode(false)
      setEntries(virtualData)
      setTodayEntry(virtualData[0])
      setIsLoading(false)
      return
    }

    // Load real data from Supabase
    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const { data, error } = await supabase
          .from('daily_tracker')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (error) throw error

        setEntries(data || [])
        const today_entry = data?.find((d) => d.date === today)
        setTodayEntry(today_entry)
      } catch (error) {
        console.error('[v0] Error loading daily tracker:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Moon className="h-12 w-12 text-cyan-400" />
          </div>
          <p className="text-white">Načítám tvůj denní tracking...</p>
        </div>
      </div>
    )
  }

  const stageData = [
    {
      id: 1,
      name: 'Ranní rutina',
      icon: Sun,
      href: '/morning-check'
    },
    {
      id: 2,
      name: 'Denní záměr',
      icon: Target,
      href: '/daily-intention'
    },
    {
      id: 3,
      name: 'Denní shrnutí',
      icon: Shield,
      href: '/daily-summary'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Daily Tracker
              </h1>
              <p className="text-gray-400 mt-2">Sleduj svůj denní progress a výkonnost</p>
            </div>
            <Badge
              className={`md:text-base text-sm md:px-6 px-4 md:py-2 py-1 rounded-full ${
                isLiveMode
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-sky-500/20 text-sky-400 border-sky-500/30'
              }`}
            >
              {isLiveMode ? '🔴 Live' : '🎮 Virtual'}
            </Badge>
          </div>
        </motion.div>

        {/* Virtual Mode Banner */}
        {!isLiveMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 backdrop-blur-sm border border-amber-500/30 rounded-lg py-3 px-4 flex items-center gap-3 mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-amber-100">
              <span className="font-bold text-white">Virtual Mode</span> – Demo data pro náhled
            </span>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="today" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500">
              <Target className="h-4 w-4 mr-2" />
              Dnes
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Historie
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            {todayEntry ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Morning Check Card */}
                {todayEntry.morningCheck && (
                  <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-cyan-400" />
                        Ranní Kontrola
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Spánek</div>
                          <div className="text-2xl font-bold text-white">{todayEntry.morningCheck.sleepHours}h</div>
                          <div className="text-xs text-gray-400 mt-1">kvalita {todayEntry.morningCheck.sleepQuality}/10</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Energie</div>
                          <div className="text-2xl font-bold text-white">{todayEntry.morningCheck.energyLevel}/10</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Soustředění</div>
                          <div className="text-2xl font-bold text-white">{todayEntry.morningCheck.focus}/10</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Stres</div>
                          <div className="text-2xl font-bold text-white">{todayEntry.morningCheck.stressLevel}/10</div>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">Nálada</div>
                          <div className="text-2xl font-bold text-white">{todayEntry.morningCheck.emotionalState}/10</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Daily Intention Card */}
                {todayEntry.intention && (
                  <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        Denní Cíle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-sm text-blue-300 font-semibold mb-1">Cíl</div>
                        <div className="text-white">{todayEntry.intention.goals}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-sm text-blue-300 font-semibold mb-1">Max Riziko</div>
                          <div className="text-white text-lg font-bold">{todayEntry.intention.maxRiskPercent}%</div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-sm text-blue-300 font-semibold mb-1">Emoční Cíl</div>
                          <div className="text-white">{todayEntry.intention.emotionalGoal}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stages Progress */}
                <Card className="border-green-500/30 bg-gradient-to-br from-green-900/20 to-slate-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      Fáze Dne ({todayEntry.stagesCompleted}/3)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {stageData.map((stage, index) => (
                        <div
                          key={stage.id}
                          className={`p-4 rounded-lg border transition-all ${
                            index < todayEntry.stagesCompleted
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-slate-700/20 border-slate-600/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                index < todayEntry.stagesCompleted
                                  ? 'bg-green-500/20 border-green-500'
                                  : 'border-slate-600'
                              }`}
                            >
                              {index < todayEntry.stagesCompleted && (
                                <div className="h-2 w-2 bg-green-400 rounded-full" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-white">Fáze {stage.id}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-300 mb-3">{stage.name}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(stage.href)}
                            className="w-full"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-slate-700/50 bg-slate-800/30">
                <CardContent className="p-16 text-center">
                  <CalendarIcon className="h-24 w-24 mx-auto mb-6 text-slate-600" />
                  <h3 className="text-2xl font-bold text-slate-400 mb-2">Zatím nic</h3>
                  <p className="text-gray-400 mb-6">Začni vyplněním Ranní Kontroly</p>
                  <Button onClick={() => router.push('/morning-check')} size="lg">
                    Začít
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {entries && entries.length > 0 ? (
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer"
                      onClick={() => setActiveTab('today')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-semibold text-white">{entry.date}</div>
                              <div className="text-sm text-gray-400">{entry.stagesCompleted}/3 fází hotovo</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <span className="text-sm text-green-400">Hotovo</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-slate-700/50 bg-slate-800/30">
                <CardContent className="p-16 text-center">
                  <Moon className="h-24 w-24 mx-auto mb-6 text-slate-600" />
                  <h3 className="text-2xl font-bold text-slate-400 mb-2">Žádná data</h3>
                  <p className="text-gray-400">Tvoje historii zde uvidíš později</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
