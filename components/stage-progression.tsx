"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Clock, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Stage {
  id: number
  title: string
  description: string
  icon: any
  color: string
}

interface DailyStages {
  id: string
  current_stage: number
  morning_check_completed: boolean
  daily_intention_completed: boolean
  trading_plan_completed: boolean
  record_trades_completed: boolean
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Ranní kontrola",
    description: "Spusť ranní mindfulness check-in",
    icon: Clock,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Denní záměr",
    description: "Nastavte si denní cíle a záměry",
    icon: Play,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Trading plán",
    description: "Připravte svůj trading plán na den",
    icon: Clock,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Zaznamenat obchody",
    description: "Zaznamenat a analyzovat vaše obchody",
    icon: Play,
    color: "from-green-500 to-emerald-500",
  },
]

export function StageProgression() {
  const [stages, setStages] = useState<DailyStages | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStages()
  }, [])

  const fetchStages = async () => {
    try {
      const res = await fetch("/api/stages/get")
      if (res.ok) {
        const data = await res.json()
        setStages(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching stages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStageComplete = async (stageId: number) => {
    try {
      const res = await fetch("/api/stages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageId, completed: true }),
      })

      if (res.ok) {
        const data = await res.json()
        setStages(data)
      }
    } catch (error) {
      console.error("[v0] Error updating stage:", error)
    }
  }

  if (loading || !stages) {
    return null
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Denní průběh</h3>
        <span className="text-sm text-muted-foreground">Etapa {stages.current_stage} z 4</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${(stages.current_stage / 4) * 100}%` }}
        />
      </div>

      {/* Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {STAGES.map((stage) => {
          const isCompleted =
            stage.id === 1
              ? stages.morning_check_completed
              : stage.id === 2
                ? stages.daily_intention_completed
                : stage.id === 3
                  ? stages.trading_plan_completed
                  : stages.record_trades_completed

          const isCurrent = stages.current_stage === stage.id
          const isLocked = stages.current_stage < stage.id

          const Icon = stage.icon

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isCompleted
                  ? "border-green-500 bg-green-500/10"
                  : isCurrent
                    ? "border-blue-500 bg-blue-500/10"
                    : isLocked
                      ? "border-slate-700 bg-slate-900/50 opacity-50"
                      : "border-slate-700 bg-slate-900/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {isCurrent && !isCompleted && (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 animate-pulse" />
                    )}
                    {isLocked && <Lock className="w-5 h-5 text-slate-500" />}
                    {!isCompleted && !isCurrent && !isLocked && <Icon className="w-5 h-5 text-slate-400" />}
                    <h4 className="font-semibold text-foreground">{stage.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
              </div>

              {isCurrent && !isCompleted && (
                <Button
                  onClick={() => handleStageComplete(stage.id)}
                  className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  size="sm"
                >
                  Dokončit {stage.title}
                </Button>
              )}

              {isCompleted && <p className="text-xs text-green-500 mt-2 font-semibold">✓ Hotovo</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
