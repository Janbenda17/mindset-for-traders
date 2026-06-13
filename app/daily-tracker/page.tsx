"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useDailyStage } from "@/hooks/use-daily-stage"
import { useLiveMode } from "@/contexts/live-mode-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Clock, Target, Zap, TrendingUp, Lock, Sun, Moon, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGES = [
  {
    id: 1,
    name: "Morning Check",
    description: "Mental & Physical Readiness",
    icon: Sun,
    href: "/morning-check",
    color: "from-orange-500 to-rose-500",
    accentColor: "text-orange-400"
  },
  {
    id: 2,
    name: "Daily Intention",
    description: "Set Your Focus",
    icon: Target,
    href: "/daily-intention",
    color: "from-blue-500 to-cyan-500",
    accentColor: "text-blue-400"
  },
  {
    id: 3,
    name: "Trading Plan",
    description: "Strategy & Risk",
    icon: Zap,
    href: "/trading-plan",
    color: "from-purple-500 to-pink-500",
    accentColor: "text-purple-400"
  },
  {
    id: 4,
    name: "Daily Summary",
    description: "Trades & Emotions",
    icon: TrendingUp,
    href: "/daily-summary",
    color: "from-green-500 to-emerald-500",
    accentColor: "text-green-400"
  }
]

export default function DailyTrackerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { stages, completeStage } = useDailyStage()
  const { isLiveMode } = useLiveMode()
  const [activeStage, setActiveStage] = useState<number | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  // Calculate completion
  useEffect(() => {
    if (stages) {
      const completed = stages.filter((s: any) => s.completed).length
      setCompletionPercentage(Math.round((completed / STAGES.length) * 100))
    }
  }, [stages])

  const handleStageClick = (stageId: number) => {
    const stage = STAGES[stageId - 1]
    setActiveStage(stageId)
    setTimeout(() => router.push(stage.href), 300)
  }

  const getStageStatus = (stageId: number) => {
    if (!stages) return "locked"
    const isCompleted = stages[stageId - 1]?.completed
    const isPrevCompleted = stageId === 1 || stages[stageId - 2]?.completed
    return isCompleted ? "completed" : isPrevCompleted ? "unlocked" : "locked"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white">Daily Trading Routine</h1>
                <p className="text-muted-foreground">Track your mental state, plan your trades, and review your performance</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
                <p className="text-sm text-muted-foreground">Daily Progress</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={completionPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Today's Journey</span>
                <span className="text-primary font-semibold">{stages?.filter((s: any) => s.completed).length || 0}/{STAGES.length} Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stage cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STAGES.map((stage, idx) => {
            const status = getStageStatus(stage.id)
            const Icon = stage.icon
            const isActive = activeStage === stage.id

            const stageGradients: Record<number, string> = {
              1: "bg-gradient-to-br from-orange-500 to-rose-500",
              2: "bg-gradient-to-br from-blue-500 to-cyan-500",
              3: "bg-gradient-to-br from-purple-500 to-pink-500",
              4: "bg-gradient-to-br from-green-500 to-emerald-500"
            }

            return (
              <div key={stage.id} className="group">
                <button
                  onClick={() => handleStageClick(stage.id)}
                  disabled={status === "locked"}
                  className={cn(
                    "w-full h-32 rounded-2xl border-2 transition-all duration-300",
                    "flex flex-col items-center justify-center gap-2 p-4",
                    status === "completed" && cn(stageGradients[stage.id], "border-white/20 shadow-lg shadow-primary/20"),
                    status === "unlocked" && "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
                    status === "locked" && "bg-card/50 border-border/50 opacity-50 cursor-not-allowed",
                    isActive && "ring-2 ring-primary/50 scale-105"
                  )}
                >
                  <div className={cn("relative", status === "completed" ? "text-white" : stage.accentColor)}>
                    <Icon className="w-8 h-8" />
                    {status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 absolute -top-2 -right-2 text-white bg-green-500 rounded-full" />
                    )}
                    {status === "locked" && (
                      <Lock className="w-4 h-4 absolute -top-2 -right-2 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-white">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* Content tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-max bg-card border border-border">
            <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {completionPercentage === 0 ? (
              <Card className="border-border/50">
                <CardContent className="pt-12 pb-12">
                  <div className="flex flex-col items-center justify-center gap-6 text-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Sun className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="text-xl font-semibold text-white">Start Your Daily Routine</h3>
                      <p className="text-muted-foreground">Begin with Morning Check to assess your mental state and readiness for trading today</p>
                    </div>
                    <Button
                      onClick={() => handleStageClick(1)}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white gap-2"
                    >
                      <Sun className="w-5 h-5" />
                      Start Morning Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Today's Performance
                  </CardTitle>
                  <CardDescription>Your trading metrics and psychological state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Readiness</p>
                      <p className="text-2xl font-bold text-primary">--</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Focus Level</p>
                      <p className="text-2xl font-bold text-blue-400">--</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Trades</p>
                      <p className="text-2xl font-bold text-cyan-400">--</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">P&L</p>
                      <p className="text-2xl font-bold text-green-400">--</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle>Weekly Insights</CardTitle>
                <CardDescription>Patterns and recommendations from your trading data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-white font-semibold mb-2">Consistency Trend</p>
                    <p className="text-sm text-muted-foreground">Your trading performance is improving. Keep up the discipline.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm text-white font-semibold mb-2">Best Trading Window</p>
                    <p className="text-sm text-muted-foreground">You trade best between 10:00 - 14:00 UTC</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
