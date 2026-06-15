"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Goal {
  id: string
  period: 'weekly' | 'monthly'
  goal: string
  startDate: string
  endDate: string
  milestones: string[]
  metrics: Record<string, any>
  aiGenerated: boolean
  createdAt: string
}

export default function TradingGoalsPage() {
  const { toast } = useToast()
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
      const response = await fetch('/api/goals/generate', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success && data.goals) {
        setGoals(data.goals)
        localStorage.setItem('trading-goals-ai', JSON.stringify(data.goals))
        toast({
          title: 'Hotovo!',
          description: 'Týdenní a měsíční cíle byly vygenerovány AI'
        })
      }
    } catch (error) {
      console.error('[v0] Error generating goals:', error)
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se vygenerovat cíle',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  const weeklyGoals = goals.filter(g => g.period === 'weekly')
  const monthlyGoals = goals.filter(g => g.period === 'monthly')

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
          <h2 className="text-2xl font-bold text-white mb-4">Týdenní Cíle</h2>
          <div className="grid gap-4">
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-600/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex-1">{goal.goal}</h3>
                      <Badge className="bg-blue-500/20 text-blue-300">
                        {new Date(goal.startDate).toLocaleDateString('cs-CZ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Milestones:</p>
                      <ul className="space-y-1">
                        {goal.milestones.map((m, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-blue-400">•</span>
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
          <h2 className="text-2xl font-bold text-white mb-4">Měsíční Cíle</h2>
          <div className="grid gap-4">
            {monthlyGoals.length > 0 ? (
              monthlyGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-800/50 border-slate-700 hover:border-green-600/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex-1">{goal.goal}</h3>
                      <Badge className="bg-green-500/20 text-green-300">
                        {new Date(goal.startDate).toLocaleDateString('cs-CZ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Milestones:</p>
                      <ul className="space-y-1">
                        {goal.milestones.map((m, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <span className="text-green-400">•</span>
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
