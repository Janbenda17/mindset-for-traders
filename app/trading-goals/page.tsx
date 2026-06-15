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


  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "profit" as Goal["category"],
    targetValue: 0,
    currentValue: 0,
    unit: "$",
    deadline: "",
    priority: "medium" as Goal["priority"],
    notificationsEnabled: true,
    reminderFrequency: "weekly" as Goal["reminderFrequency"],
  })

  useEffect(() => {
    if (isLiveMode) {
      const saved = storage.get<Goal[]>("trading-goals", [])
      setGoals(saved)
    } else {
      setGoals(demoGoals(isEn))
    }

    checkAndSendReminders()
  }, [isLiveMode, user?.id, isEn])

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals)
    if (isLiveMode) {
      storage.set("trading-goals", updatedGoals)
    }
  }

  const checkAndSendReminders = () => {
    const goals = storage.get<Goal[]>("trading-goals", [])
    const now = new Date()
    let updated = false

    goals.forEach((goal) => {
      if (!goal.notificationsEnabled || goal.status !== "active" || goal.reminderFrequency === "none") return

      const lastReminder = goal.lastReminderSent ? new Date(goal.lastReminderSent) : null
      const shouldSend =
        !lastReminder ||
        (goal.reminderFrequency === "daily" && now.getTime() - lastReminder.getTime() > 24 * 60 * 60 * 1000) ||
        (goal.reminderFrequency === "weekly" && now.getTime() - lastReminder.getTime() > 7 * 24 * 60 * 60 * 1000)

      if (shouldSend) {
        sendGoalReminder(goal)
        goal.lastReminderSent = now.toISOString()
        updated = true
      }
    })

    if (updated) {
      storage.set("trading-goals", goals)
      setGoals(goals)
    }
  }

  const sendGoalReminder = (goal: Goal) => {
    if (!("Notification" in window)) return

    if (Notification.permission === "granted") {
      const progress = goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0
      const daysRemaining = getDaysRemaining(goal.deadline)

      new Notification("Trading Goal - Reminder", {
        body: `${goal.title}\nProgress: ${progress}% | ${daysRemaining} days remaining`,
        icon: "/favicon.ico",
        tag: `goal-${goal.id}`,
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }

  const toggleNotifications = (goalId: string) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newEnabled = !g.notificationsEnabled
        if (newEnabled && "Notification" in window && Notification.permission !== "granted") {
          Notification.requestPermission()
        }
        return { ...g, notificationsEnabled: newEnabled }
      }
      return g
    })
    saveGoals(updated)

    const goal = updated.find((g) => g.id === goalId)
    toast({
      title: goal?.notificationsEnabled ? "Notifications enabled" : "Notifications disabled",
      description: `Reminders for "${goal?.title}" have been ${goal?.notificationsEnabled ? "enabled" : "disabled"}`,
    })
  }

  const updateReminderFrequency = (goalId: string, frequency: Goal["reminderFrequency"]) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return { ...g, reminderFrequency: frequency }
      }
      return g
    })
    saveGoals(updated)
  }

  const addGoal = () => {
    if (!newGoal.title || !newGoal.deadline) {
      toast({ title: "Error", description: "Fill in name and deadline", variant: "destructive" })
      return
    }

    if (newGoal.notificationsEnabled && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    saveGoals([...goals, goal])
    setNewGoal({
      title: "",
      description: "",
      category: "profit",
      targetValue: 0,
      currentValue: 0,
      unit: "$",
      deadline: "",
      priority: "medium",
      notificationsEnabled: true,
      reminderFrequency: "weekly",
    })
    setIsAddingGoal(false)
    toast({ title: "Goal added", description: "New trading goal has been created" })
  }

  const updateProgress = (goalId: string, newValue: number) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const isCompleted = newValue >= g.targetValue
        if (isCompleted && g.status !== "completed") {
          if (g.notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
            new Notification("Goal achieved! 🎉", {
              body: `Congratulations! You achieved the goal "${g.title}"`,
              icon: "/favicon.ico",
            })
          }
        }
        return {
          ...g,
          currentValue: newValue,
          status: isCompleted ? ("completed" as const) : g.status,
        }
      }
      return g
    })
    saveGoals(updated)

    const goal = updated.find((g) => g.id === goalId)
    if (goal?.status === "completed") {
      toast({ title: "Congratulations!", description: `Goal "${goal.title}" has been achieved!` })
    }
  }

  const deleteGoal = (goalId: string) => {
    saveGoals(goals.filter((g) => g.id !== goalId))
    toast({ title: "Deleted", description: "Goal has been removed" })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profit":
        return TrendingUp
      case "skills":
        return Star
      case "discipline":
        return Target
      case "mindset":
        return Flame
      default:
        return Flag
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "profit":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "skills":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "discipline":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "mindset":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return ""
    }
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const overallProgress = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0

  const getDaysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button */}
        <Link href="/bonus" className="inline-flex mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Back</span>
          </div>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Goal Tracking</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Trading{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Goals</span>
            </h1>
            <p className="text-gray-400">Track your progress and achieve your goals</p>
          </div>

          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">New Trading Goal</DialogTitle>
                <DialogDescription>Define your new goal</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Goal Name</Label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g. Achieve 10% monthly profit"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Detailed description of the goal..."
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(v) => setNewGoal({ ...newGoal, category: v as Goal["category"] })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="profit">Profit</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="discipline">Discipline</SelectItem>
                        <SelectItem value="mindset">Mindset</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Priority</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(v) => setNewGoal({ ...newGoal, priority: v as Goal["priority"] })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Target Value</Label>
                    <Input
                      type="number"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Unit</Label>
                    <Input
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      placeholder="$, %, trades"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Current</Label>
                    <Input
                      type="number"
                      value={newGoal.currentValue}
                      onChange={(e) => setNewGoal({ ...newGoal, currentValue: Number(e.target.value) })}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Deadline</Label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <Label className="text-gray-300">Reminders</Label>
                    </div>
                    <Switch
                      checked={newGoal.notificationsEnabled}
                      onCheckedChange={(checked) => setNewGoal({ ...newGoal, notificationsEnabled: checked })}
                    />
                  </div>

                  {newGoal.notificationsEnabled && (
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Reminder Frequency</Label>
                      <Select
                        value={newGoal.reminderFrequency}
                        onValueChange={(v) =>
                          setNewGoal({ ...newGoal, reminderFrequency: v as Goal["reminderFrequency"] })
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="none">No Reminders</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button onClick={addGoal} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Goals</p>
                <p className="text-2xl font-bold text-white">{activeGoals.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{completedGoals.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Overall Progress</p>
                <p className="text-2xl font-bold text-white">{overallProgress.toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Bell className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">With Reminders</p>
                <p className="text-2xl font-bold text-white">{goals.filter((g) => g.notificationsEnabled).length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        {activeGoals.length === 0 && completedGoals.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700/50 border-dashed">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No goals</h3>
              <p className="text-gray-400 mb-6">Start by setting your first trading goal</p>
              <Button onClick={() => setIsAddingGoal(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Active Goals
                </h2>
                <div className="grid gap-4">
                  {activeGoals.map((goal) => {
                    const CategoryIcon = getCategoryIcon(goal.category)
                    const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0
                    const daysRemaining = getDaysRemaining(goal.deadline)

                    return (
                      <Card key={goal.id} className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${getCategoryColor(goal.category).split(" ")[0]}`}>
                                <CategoryIcon className={`w-6 h-6 ${getCategoryColor(goal.category).split(" ")[1]}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                                  <Badge className={getCategoryColor(goal.category)} variant="outline">
                                    {goal.category}
                                  </Badge>
                                  <Badge className={getPriorityColor(goal.priority)} variant="outline">
                                    {goal.priority}
                                  </Badge>
                                  {goal.notificationsEnabled && (
                                    <Badge
                                      className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                                      variant="outline"
                                    >
                                      <Bell className="w-3 h-3 mr-1" />
                                      {goal.reminderFrequency === "daily" ? "Daily" : "Weekly"}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm">{goal.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleNotifications(goal.id)}
                                title={goal.notificationsEnabled ? "Disable reminders" : "Enable reminders"}
                              >
                                {goal.notificationsEnabled ? (
                                  <Bell className="w-4 h-4 text-purple-400" />
                                ) : (
                                  <BellOff className="w-4 h-4 text-gray-500" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-white font-medium">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2 bg-slate-700" />

                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className={`${daysRemaining < 7 ? "text-red-400" : "text-gray-400"}`}>
                                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Deadline passed"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={goal.currentValue}
                                  onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                                  className="w-24 h-8 bg-slate-700 border-slate-600 text-white text-sm"
                                />
                                <span className="text-gray-400 text-sm">{goal.unit}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-400" />
                  Completed Goals
                </h2>
                <div className="grid gap-4">
                  {completedGoals.map((goal) => {
                    const CategoryIcon = getCategoryIcon(goal.category)

                    return (
                      <Card key={goal.id} className="bg-green-500/5 border-green-500/20">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{goal.title}</h3>
                            <p className="text-sm text-gray-400">
                              Achieved: {goal.currentValue} {goal.unit}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
