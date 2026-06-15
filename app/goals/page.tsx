'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Target, Calendar, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TradeGoal {
  id: string
  title: string
  description: string
  goal_type: 'weekly' | 'monthly'
  target_value: string
  start_date: string
  target_date: string
  status: string
  focus_area?: string
  milestones?: string[]
  metadata?: any
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<TradeGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/trading-goals')
      const data = await response.json()
      
      if (data.ok) {
        setGoals(data.data || [])
      }
    } catch (error) {
      console.error('[v0] Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateGoals = async () => {
    try {
      setGenerating(true)
      
      const response = await fetch('/api/goals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_user', // Replace with actual user from auth
          date: new Date().toISOString().split('T')[0],
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Goals Generated',
          description: 'Your weekly and monthly goals have been created by AI',
          duration: 3000,
        })
        fetchGoals()
      } else {
        throw new Error(data.error || 'Failed to generate goals')
      }
    } catch (error) {
      console.error('[v0] Error generating goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate goals',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const weeklyGoals = goals.filter(g => g.goal_type === 'weekly')
  const monthlyGoals = goals.filter(g => g.goal_type === 'monthly')

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Trading Goals</h1>
            <p className="text-slate-400 mt-1">AI-generated weekly and monthly objectives</p>
          </div>
          <Button
            onClick={generateGoals}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </div>

        {/* Weekly Goals */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Weekly Goals
          </h2>
          <div className="space-y-4">
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-900/50 border-blue-500/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-blue-400">{goal.title}</CardTitle>
                        <CardDescription className="text-slate-300 mt-1">{goal.description}</CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">Active</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Target</p>
                        <p className="text-white font-semibold">{goal.target_value}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Focus Area</p>
                        <p className="text-white font-semibold">{goal.focus_area || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Start Date</p>
                        <p className="text-white">{new Date(goal.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Target Date</p>
                        <p className="text-white">{new Date(goal.target_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <p className="text-slate-400">No weekly goals yet. Click "Generate with AI" to create one.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Monthly Goals */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Monthly Goals
          </h2>
          <div className="space-y-4">
            {monthlyGoals.length > 0 ? (
              monthlyGoals.map(goal => (
                <Card key={goal.id} className="bg-slate-900/50 border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-purple-400">{goal.title}</CardTitle>
                        <CardDescription className="text-slate-300 mt-1">{goal.description}</CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">Active</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Success Metric</p>
                        <p className="text-white font-semibold">{goal.target_value}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Period</p>
                        <p className="text-white">{new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.target_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Weekly Milestones</p>
                        <ul className="space-y-1">
                          {goal.milestones.map((milestone, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-purple-400">•</span>
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-6 text-center">
                  <p className="text-slate-400">No monthly goals yet. Click "Generate with AI" to create one.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
