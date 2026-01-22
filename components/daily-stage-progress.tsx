"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDailyStage } from "@/contexts/daily-stage-context"
import { useData } from "@/contexts/data-context"
import { Check, Lock, ArrowRight, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

export function DailyStageProgress() {
  const { stages, currentStage, getProgress } = useDailyStage()
  const { isLiveMode } = useData()
  const progress = getProgress()

  const isWeeklyStageDay = () => {
    const today = new Date().getDay()
    return today === 0 // Sunday
  }

  const visibleStages = stages.filter((stage) => {
    // Show weekly summary only on Sunday
    if (stage.name === "weekly-summary") {
      return isWeeklyStageDay()
    }
    return true
  })

  return (
    <Card className="psyche-card border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-slate-900/40 to-purple-900/20 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Your Daily Trading Flow</CardTitle>
              <p className="text-sm text-gray-400 mt-1">Complete each stage to build a consistent trading routine</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{progress}%</div>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {stages.filter((s) => s.completed).length} of {visibleStages.length} stages completed
            </span>
            <span>Keep going! 🚀</span>
          </div>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {visibleStages.map((stage) => {
            const isActive = stage.id === currentStage
            const isCompleted = stage.completed
            const isLocked = !stage.unlocked && !isCompleted

            return (
              <div
                key={stage.id}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer group ${
                  isCompleted
                    ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/15 hover:shadow-lg hover:shadow-green-500/20"
                    : isActive
                      ? "bg-purple-500/10 border-purple-500/50 ring-2 ring-purple-500/30 hover:bg-purple-500/15 hover:shadow-lg hover:shadow-purple-500/20"
                      : isLocked
                        ? "bg-slate-800/30 border-slate-700/30 opacity-60"
                        : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-slate-600/20"
                }`}
              >
                {/* Hover tooltip for all modes and states - positioned on the right */}
                {!isCompleted && (
                  <div className="absolute -right-24 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className={`px-3 py-2 text-white text-xs font-semibold rounded-lg whitespace-nowrap ${
                      isLocked ? 'bg-slate-600' : isActive ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {isLocked ? 'Odemknuto po Stage ' + (stage.id - 1) : 'Klikni pro náhled'}
                    </div>
                    <div className={`w-2 h-2 absolute top-1/2 -left-1 transform -translate-y-1/2 ${
                      isLocked ? 'bg-slate-600' : isActive ? 'bg-purple-600' : 'bg-blue-600'
                    }`} style={{clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)'}} />
                  </div>
                )}
                {/* Stage Number Badge */}
                <div className="absolute -top-2 -left-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-purple-500 text-white"
                          : "bg-slate-700 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stage.id}
                  </div>
                </div>

                {/* Current Badge */}
                {isActive && !isCompleted && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    Current
                  </Badge>
                )}

                <div className="flex items-start space-x-3 mb-3">
                  <div className="text-3xl">{stage.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold mb-1 ${isLocked ? "text-gray-500" : "text-white"}`}>{stage.title}</h4>
                    <p className={`text-xs ${isLocked ? "text-gray-600" : "text-gray-400"}`}>{stage.description}</p>
                  </div>
                  {isLocked && <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                </div>

                {/* Completed Time */}
                {isCompleted && stage.completedAt && (
                  <div className="flex items-center space-x-1 text-xs text-green-400 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>
                      Completed at{" "}
                      {new Date(stage.completedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-3">
                  {isCompleted ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400"
                    >
                      <Link href={stage.href}>
                        <Check className="w-4 h-4 mr-2" />
                        View Results
                      </Link>
                    </Button>
                  ) : isActive ? (
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                    >
                      <Link href={stage.href}>
                        Start Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  ) : isLocked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full bg-slate-800/50 border-slate-700/30 text-gray-500 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-gray-300"
                    >
                      <Link href={stage.href}>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Motivational Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">
                {progress === 100
                  ? "🎉 Amazing! You've completed all stages today!"
                  : progress >= 50
                    ? "💪 Great progress! Keep pushing forward!"
                    : "🌅 Let's start your trading day right!"}
              </h4>
              <p className="text-sm text-gray-400">
                {progress === 100
                  ? "You're building excellent trading discipline. See you tomorrow!"
                  : progress >= 50
                    ? "You're more than halfway through your daily routine. Don't stop now!"
                    : "Each stage you complete brings you closer to trading mastery."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
