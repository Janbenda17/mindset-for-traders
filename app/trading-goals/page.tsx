"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"

interface Goal {
  id: string
  period: 'weekly' | 'monthly'
  goal: string
  focusArea?: string
  why?: string
  startDate: string
  endDate: string
  milestones: string[]
  aiGenerated: boolean
  createdAt: string
}

const DEMO_GOALS: Goal[] = [
  {
    id: 'demo-weekly-1',
    period: 'weekly',
    goal: 'Drž se max. 2% rizika na obchod a max. 3 obchody denně',
    focusArea: 'Risk management',
    why: 'Posledních pár týdnů jsem viděl, že větší velikost pozice po ztrátě mi škodí víc, než pomáhá.',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    milestones: [
      'Nastavit fixní velikost pozice na 2 % equity před session',
      'Zapsat každý obchod do deníku ihned po uzavření',
      'Po 3. obchodu zavřít platformu bez ohledu na výsledek',
    ],
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-monthly-1',
    period: 'monthly',
    goal: 'Zvýšit win rate na A+ setupech nad 55 %',
    focusArea: 'Selektivita setupů',
    why: 'Chci obchodovat méně, ale kvalitněji - soustředit se jen na nejsilnější signály z mého playbooku.',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    milestones: [
      'Definovat přesná kritéria A+ setupu a držet se jich',
      'Týdně revidovat obchody, které nesplňovaly kritéria, a proč jsem je vzal',
      'Sledovat win rate jen na obchodech splňujících kritéria',
    ],
    aiGenerated: false,
    createdAt: new Date().toISOString(),
  },
]

export default function TradingGoalsPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const stored = localStorage.getItem('trading-goals-ai')
      if (stored) {
        setGoals(JSON.parse(stored))
      }
    } catch (error) {
      console.error('[v0] Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateGoalsWithAI = async () => {
    try {
      setGenerating(true)
      console.log('[v0] Starting goal generation...')
      
      const response = await fetch('/api/goals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('[v0] API response status:', response.status)
      
      if (!response.ok) {
        const text = await response.text()
        console.error('[v0] API error response:', text)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] API data received:', data)

      if (data.success && data.goals) {
        setGoals(data.goals)
        localStorage.setItem('trading-goals-ai', JSON.stringify(data.goals))
        toast({
          title: 'Hotovo!',
          description: 'Týdenní a měsíční cíle byly vygenerovány AI'
        })
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (error) {
      console.error('[v0] Error generating goals:', error)
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Nepodařilo se vygenerovat cíle. Zkuste znovu.',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  // In demo mode, show example goals until the user has real ones (own or AI-generated)
  const displayGoals = goals.length > 0 ? goals : !isLiveMode ? DEMO_GOALS : []
  const isShowingDemo = goals.length === 0 && !isLiveMode && displayGoals.length > 0

  const weeklyGoals = displayGoals.filter(g => g.period === 'weekly')
  const monthlyGoals = displayGoals.filter(g => g.period === 'monthly')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Zpět</span>
          </div>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Obchodní Cíle</h1>
          <p className="text-slate-400">Týdenní a měsíční cíle generované AI</p>
          {isShowingDemo && (
            <div className="inline-flex mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              Ukázková data — takhle to bude vypadat s tvými vlastními cíli
            </div>
          )}
        </div>

        <Button
          onClick={generateGoalsWithAI}
          disabled={generating}
          className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
        >
          {generating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generuji...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Vygenerovat s AI
            </>
          )}
        </Button>

        {/* Weekly Goals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Tydenni Cil</h2>
          <div className="grid gap-4">
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-900 border-slate-700 hover:border-blue-500/50 transition-all">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-white leading-snug flex-1">{goal.goal}</h3>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {goal.focusArea && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 border text-xs">
                            {goal.focusArea}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(goal.startDate).toLocaleDateString('cs-CZ')} – {new Date(goal.endDate).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                    {goal.why && (
                      <p className="text-sm text-slate-400 italic border-l-2 border-blue-500/40 pl-3">{goal.why}</p>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Jak to dosáhnout</p>
                      <ul className="space-y-2">
                        {goal.milestones.map((m, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-lg text-center text-slate-400">
                Klikněte na "Vygenerovat s AI"
              </div>
            )}
          </div>
        </div>

        {/* Monthly Goals */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Mesicni Cil</h2>
          <div className="grid gap-4">
            {monthlyGoals.length > 0 ? (
              monthlyGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-900 border-slate-700 hover:border-green-500/50 transition-all">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-white leading-snug flex-1">{goal.goal}</h3>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {goal.focusArea && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border text-xs">
                            {goal.focusArea}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(goal.startDate).toLocaleDateString('cs-CZ')} – {new Date(goal.endDate).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                    {goal.why && (
                      <p className="text-sm text-slate-400 italic border-l-2 border-green-500/40 pl-3">{goal.why}</p>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Jak to dosáhnout</p>
                      <ul className="space-y-2">
                        {goal.milestones.map((m, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-green-400 font-bold shrink-0">{i + 1}.</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-lg text-center text-slate-400">
                Klikněte na "Vygenerovat s AI"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
