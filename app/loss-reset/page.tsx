"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLossReset } from "@/contexts/loss-reset-context"
import {
  User,
  Shuffle,
  ChevronRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  Play,
  History,
  ArrowLeft,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"
import { useRouter } from "next/navigation"

const COPY = {
  "calm-mentor": {
    intro: {
      title: "Moment na reset",
      description: "Detekovali jsme, že by ti mohl pomoct krátký reset. Vyber si, jak chceš pokračovat.",
      subtitle: "Není to o tom utéct před ztrátou, ale vrátit se silnější.",
    },
    modes: {
      "user-choice": {
        title: "Vyberu si sám",
        description: "Ty víš nejlépe, co teď potřebuješ",
      },
      random: {
        title: "Překvap mě",
        description: "Náhodná aktivita může být osvěžující",
      },
    },
  },
  "strict-coach": {
    intro: {
      title: "Stop. Reset.",
      description: "Teď potřebuješ přerušit pattern. Vyber režim a jdeme na to.",
      subtitle: "Profesionálové se zastaví dřív, než je pozdě.",
    },
    modes: {
      "user-choice": {
        title: "Vlastní výběr",
        description: "Vezmi to do svých rukou",
      },
      random: {
        title: "Náhodný výběr",
        description: "Překvapení může být efektivní",
      },
    },
  },
}

export default function LossResetPage() {
  const router = useRouter()
  const {
    currentSession,
    mode,
    coachTone,
    selectMode,
    cancelReset,
    recentSessions,
    availableActivities,
    startReset,
    selectActivity,
    completeActivity,
  } = useLossReset()
  const [step, setStep] = useState<"overview" | "intro" | "mode-select" | "activity-select" | "activity" | "history">(
    "overview",
  )
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    // Auto-start reset when page loads
    if (!currentSession) {
      startReset("manual")
    }
  }, [])

  useEffect(() => {
    if (step === "activity" && currentSession?.activity) {
      const activity = availableActivities.find((a) => a.id === currentSession.activity)
      if (activity && activity.completionType === "timer") {
        setTimeRemaining(activity.duration)
        setIsTimerRunning(true)
      }
    }
  }, [step, currentSession?.activity])

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isTimerRunning, timeRemaining])

  const copy = COPY[coachTone]

  const todaySessions = recentSessions.filter(
    (s) => new Date(s.triggeredAt).toDateString() === new Date().toDateString(),
  )
  const completedSessions = recentSessions.filter((s) => s.completed)
  const completionRate = recentSessions.length > 0 ? (completedSessions.length / recentSessions.length) * 100 : 0

  const handleComplete = () => {
    completeActivity()
    router.push("/")
  }

  const handleCancel = () => {
    cancelReset()
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950 to-slate-950"></div>

      <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na dashboard
          </Button>
        </div>

        {step === "overview" && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Loss Reset System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-white">Co to dělá?</h3>
                <p className="text-sm text-gray-300">
                  Loss Reset je vědecky podložený systém, který ti pomůže přerušit emoční smyčku po ztrátě a předejít
                  revenge tradingu. Každá aktivita má specifický efekt na nervový systém a pomáhá obnovit sebekontrolu.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-white">Tvoje statistiky</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-purple-500/30 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Dnes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-400">{todaySessions.length}</div>
                      <p className="text-xs text-gray-400">resetů provedeno</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Celkem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-400">{recentSessions.length}</div>
                      <p className="text-xs text-gray-400">všech resetů</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Úspěšnost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-400">{completionRate.toFixed(0)}%</div>
                      <p className="text-xs text-gray-400">dokončených resetů</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30 bg-slate-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-400">Dokončeno/Nedokončeno</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-400">
                        {completedSessions.length}/{recentSessions.length - completedSessions.length}
                      </div>
                      <p className="text-xs text-gray-400">úspěch/zrušeno</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => setStep("mode-select")} className="w-full" size="lg">
                  <Play className="mr-2 h-5 w-5" />
                  Spustit Loss Reset
                </Button>

                <Button onClick={() => setStep("history")} variant="outline" className="w-full">
                  <History className="mr-2 h-4 w-4" />
                  Zobrazit historii
                </Button>

                <Button onClick={handleCancel} variant="ghost" className="w-full">
                  Zrušit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "history" && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Historie resetů</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {recentSessions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Zatím žádné resety</p>
                  <p className="text-sm">Spusť Loss Reset po ztrátě nebo ručně</p>
                </div>
              ) : (
                recentSessions.map((session) => {
                  const activity = availableActivities.find((a) => a.id === session.activity)
                  return (
                    <Card key={session.id} className="border-slate-700 bg-slate-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{activity?.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-white">{activity?.name}</h3>
                                {session.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-400" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {format(new Date(session.triggeredAt), "PPp", { locale: cs })}
                              </p>
                            </div>
                          </div>

                          <Badge variant={session.triggeredBy === "auto" ? "default" : "secondary"} className="text-xs">
                            {session.triggeredBy === "auto" ? "AI" : "Ruční"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </CardContent>
            <div className="p-6 pt-0">
              <Button onClick={() => setStep("overview")} variant="outline" className="w-full">
                Zpět
              </Button>
            </div>
          </Card>
        )}

        {step === "mode-select" && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Vyber režim resetu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Card
                className="p-4 cursor-pointer transition-all hover:border-purple-500 border-slate-700 bg-slate-800/50"
                onClick={() => {
                  selectMode("user-choice")
                  setStep("activity-select")
                }}
              >
                <div className="flex items-start gap-3">
                  <User className="h-6 w-6 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{copy.modes["user-choice"].title}</h3>
                    <p className="text-sm text-gray-400">{copy.modes["user-choice"].description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>

              <Card
                className="p-4 cursor-pointer transition-all hover:border-purple-500 border-slate-700 bg-slate-800/50"
                onClick={() => {
                  selectMode("random")
                  const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)]
                  selectActivity(randomActivity.id)
                  setStep("activity")
                }}
              >
                <div className="flex items-start gap-3">
                  <Shuffle className="h-6 w-6 text-purple-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{copy.modes["random"].title}</h3>
                    <p className="text-sm text-gray-400">{copy.modes["random"].description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>

              <Button onClick={() => setStep("overview")} variant="ghost" className="w-full">
                Zpět
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "activity-select" && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Vyber aktivitu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {availableActivities.map((activity) => (
                <Card
                  key={activity.id}
                  className="p-4 cursor-pointer transition-all hover:border-purple-500 border-slate-700 bg-slate-800/50"
                  onClick={() => {
                    selectActivity(activity.id)
                    setStep("activity")
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{activity.name}</h3>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{Math.floor(activity.duration / 60)} min</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              ))}
            </CardContent>
            <div className="p-6 pt-0">
              <Button onClick={() => setStep("mode-select")} variant="ghost" className="w-full">
                Zpět
              </Button>
            </div>
          </Card>
        )}

        {step === "activity" && currentSession?.activity && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">
                  {availableActivities.find((a) => a.id === currentSession.activity)?.icon}
                </span>
                {availableActivities.find((a) => a.id === currentSession.activity)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {availableActivities.find((a) => a.id === currentSession.activity)?.completionType === "timer" && (
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-purple-400">{formatTime(timeRemaining)}</div>
                  <Progress value={(timeRemaining / (currentSession.duration || 1)) * 100} className="h-2" />
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold text-white">Instrukce:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  {availableActivities
                    .find((a) => a.id === currentSession.activity)
                    ?.instructions.map((instruction, i) => (
                      <li key={i}>{instruction}</li>
                    ))}
                </ol>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Proč to funguje?</h4>
                <p className="text-sm text-gray-300">
                  {availableActivities.find((a) => a.id === currentSession.activity)?.why}
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleComplete} className="w-full" size="lg" disabled={timeRemaining > 0}>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {timeRemaining > 0 ? "Počkej na dokončení..." : "Dokončit reset"}
                </Button>

                <Button onClick={handleCancel} variant="outline" className="w-full bg-transparent">
                  <X className="mr-2 h-4 w-4" />
                  Zrušit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
