"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
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
  Brain,
  Flame,
  Sparkles,
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

  const [step, setStep] = useState<
    | "overview"
    | "frustration-check"
    | "mode-select"
    | "activity-select"
    | "activity"
    | "write-inputs"
    | "completion"
    | "history"
  >("overview")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const [frustrationBefore, setFrustrationBefore] = useState(5)
  const [frustrationAfter, setFrustrationAfter] = useState(5)
  const [frustrationNote, setFrustrationNote] = useState("")
  const [completionNote, setCompletionNote] = useState("")

  const [writeInputs, setWriteInputs] = useState({
    whatHappened: "",
    whatIFelt: "",
    whatNextTime: "",
    lesson: "",
  })

  useEffect(() => {
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

  const handleActivityComplete = () => {
    completeActivity()
    setStep("completion")
  }

  const handleFinalComplete = async (goToAI: boolean) => {
    // Save frustration data to localStorage
    const lossResetData = {
      frustrationBefore,
      frustrationAfter,
      frustrationNote,
      completionNote,
      writeInputs,
      improvement: frustrationBefore - frustrationAfter,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("loss-reset-last-data", JSON.stringify(lossResetData))

    // Award 10 XP for loss reset (max 1x per day)
    try {
      const xpResponse = await fetch("/api/xp/award", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "loss_reset" }),
      })
      const xpData = await xpResponse.json()
      if (xpData.success) {
        console.log("[v0] Loss reset XP awarded:", xpData.xpAwarded)
      } else if (!xpData.alreadyClaimed) {
        console.error("[v0] Failed to award loss reset XP:", xpData.error)
      }
    } catch (error) {
      console.error("[v0] Error awarding loss reset XP:", error)
    }

    if (goToAI) {
      // Create prefill prompt for MindTrader AI
      let prompt = `Právě jsem dokončil Loss Reset.\n\n`
      prompt += `Frustrace PŘED: ${frustrationBefore}/10\n`
      prompt += `Frustrace PO: ${frustrationAfter}/10\n`
      prompt += `Zlepšení: ${frustrationBefore - frustrationAfter > 0 ? "+" : ""}${frustrationBefore - frustrationAfter} bodů\n\n`

      if (frustrationNote) {
        prompt += `Co se stalo: ${frustrationNote}\n\n`
      }

      if (writeInputs.whatHappened || writeInputs.whatIFelt) {
        prompt += `Moje reflexe:\n`
        if (writeInputs.whatHappened) prompt += `- Co se stalo: ${writeInputs.whatHappened}\n`
        if (writeInputs.whatIFelt) prompt += `- Co jsem cítil: ${writeInputs.whatIFelt}\n`
        if (writeInputs.whatNextTime) prompt += `- Příště udělám: ${writeInputs.whatNextTime}\n`
        if (writeInputs.lesson) prompt += `- Ponaučení: ${writeInputs.lesson}\n`
        prompt += "\n"
      }

      if (completionNote) {
        prompt += `Poznámka po resetu: ${completionNote}\n\n`
      }

      prompt += `Pomoz mi zpracovat tuto situaci a připravit se na další trading.`

      localStorage.setItem("mindtrader-ai-prefill", prompt)
      router.push("/mindtrader?tab=ai")
    } else {
      router.push("/")
    }
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

  const getFrustrationColor = (level: number) => {
    if (level <= 3) return "bg-green-500"
    if (level <= 5) return "bg-yellow-500"
    if (level <= 7) return "bg-orange-500"
    return "bg-red-500"
  }

  const getFrustrationLabel = (level: number) => {
    if (level <= 2) return "Klidný"
    if (level <= 4) return "Mírně frustrovaný"
    if (level <= 6) return "Frustrovaný"
    if (level <= 8) return "Velmi frustrovaný"
    return "Extrémně frustrovaný"
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

        {/* OVERVIEW */}
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
                <Button onClick={() => setStep("frustration-check")} className="w-full" size="lg">
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

        {step === "frustration-check" && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                <Flame className="h-8 w-8 text-orange-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Jak se teď cítíš?</CardTitle>
              <p className="text-gray-400 mt-2">Ohodnoť svou frustraci na škále 1-10</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Frustration Scale */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Klidný</span>
                  <span className="text-sm text-gray-400">Extrémně frustrovaný</span>
                </div>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFrustrationBefore(level)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        frustrationBefore === level
                          ? `${getFrustrationColor(level)} text-white scale-110 shadow-lg`
                          : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <Badge className={`${getFrustrationColor(frustrationBefore)} text-white px-4 py-1`}>
                    {getFrustrationLabel(frustrationBefore)}
                  </Badge>
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Co se stalo? <span className="text-gray-500">(nepovinné)</span>
                </label>
                <Textarea
                  placeholder="Napiš, co se stalo... (např. 'Dostal jsem 3 stoploss za sebou')"
                  value={frustrationNote}
                  onChange={(e) => setFrustrationNote(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Button onClick={() => setStep("mode-select")} className="w-full" size="lg">
                  Pokračovat k resetu
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={() => setStep("overview")} variant="ghost" className="w-full">
                  Zpět
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HISTORY */}
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

        {/* MODE SELECT */}
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
                  // Check if it's write activity
                  if (randomActivity.id === "write") {
                    setStep("write-inputs")
                  } else {
                    setStep("activity")
                  }
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

              <Button onClick={() => setStep("frustration-check")} variant="ghost" className="w-full">
                Zpět
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ACTIVITY SELECT */}
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
                    if (activity.id === "write") {
                      setStep("write-inputs")
                    } else {
                      setStep("activity")
                    }
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

        {step === "write-inputs" && (
          <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">✍️</div>
              <CardTitle className="text-xl font-bold text-white">Write Reset</CardTitle>
              <p className="text-gray-400 mt-2">Zapiš si své myšlenky a emoce</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Co se stalo? <span className="text-red-400">*</span>
                </label>
                <Textarea
                  placeholder="Popiš situaci..."
                  value={writeInputs.whatHappened}
                  onChange={(e) => setWriteInputs({ ...writeInputs, whatHappened: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Co jsem cítil? <span className="text-red-400">*</span>
                </label>
                <Textarea
                  placeholder="Jaké emoce jsi prožíval..."
                  value={writeInputs.whatIFelt}
                  onChange={(e) => setWriteInputs({ ...writeInputs, whatIFelt: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Co udělám příště jinak? <span className="text-gray-500">(nepovinné)</span>
                </label>
                <Textarea
                  placeholder="Jaké změny provedu..."
                  value={writeInputs.whatNextTime}
                  onChange={(e) => setWriteInputs({ ...writeInputs, whatNextTime: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Jaké ponaučení si beru? <span className="text-gray-500">(nepovinné)</span>
                </label>
                <Textarea
                  placeholder="Hlavní lekce..."
                  value={writeInputs.lesson}
                  onChange={(e) => setWriteInputs({ ...writeInputs, lesson: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleActivityComplete}
                  className="w-full"
                  size="lg"
                  disabled={!writeInputs.whatHappened || !writeInputs.whatIFelt}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Dokončit Write Reset
                </Button>
                <Button onClick={() => setStep("activity-select")} variant="ghost" className="w-full">
                  Zpět
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ACTIVITY (for non-write activities) */}
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
                  <Progress
                    value={(((currentSession.duration || 1) - timeRemaining) / (currentSession.duration || 1)) * 100}
                    className="h-2"
                  />
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
                <Button
                  onClick={handleActivityComplete}
                  className="w-full"
                  size="lg"
                  disabled={
                    availableActivities.find((a) => a.id === currentSession.activity)?.completionType === "timer" &&
                    timeRemaining > 0
                  }
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {availableActivities.find((a) => a.id === currentSession.activity)?.completionType === "timer" &&
                  timeRemaining > 0
                    ? "Počkej na dokončení..."
                    : "Dokončit reset"}
                </Button>

                <Button onClick={handleCancel} variant="outline" className="w-full bg-transparent">
                  <X className="mr-2 h-4 w-4" />
                  Zrušit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "completion" && (
          <Card className="border-green-500/30 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Reset dokončen!</CardTitle>
              <p className="text-gray-400 mt-2">Jak se teď cítíš?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frustration After Scale */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Klidný</span>
                  <span className="text-sm text-gray-400">Stále frustrovaný</span>
                </div>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFrustrationAfter(level)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        frustrationAfter === level
                          ? `${getFrustrationColor(level)} text-white scale-110 shadow-lg`
                          : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <Badge className={`${getFrustrationColor(frustrationAfter)} text-white px-4 py-1`}>
                    {getFrustrationLabel(frustrationAfter)}
                  </Badge>
                </div>
              </div>

              {/* Comparison */}
              <Card className="border-slate-700 bg-slate-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">PŘED</p>
                    <div
                      className={`w-12 h-12 rounded-full ${getFrustrationColor(frustrationBefore)} flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {frustrationBefore}
                    </div>
                  </div>
                  <div className="text-center">
                    <ChevronRight className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">PO</p>
                    <div
                      className={`w-12 h-12 rounded-full ${getFrustrationColor(frustrationAfter)} flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {frustrationAfter}
                    </div>
                  </div>
                  <div className="text-center ml-4">
                    <p className="text-xs text-gray-400 mb-1">ZLEPŠENÍ</p>
                    <div
                      className={`text-2xl font-bold ${frustrationBefore - frustrationAfter > 0 ? "text-green-400" : frustrationBefore - frustrationAfter < 0 ? "text-red-400" : "text-gray-400"}`}
                    >
                      {frustrationBefore - frustrationAfter > 0 ? "+" : ""}
                      {frustrationBefore - frustrationAfter}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Optional Note */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Poznámka <span className="text-gray-500">(nepovinné)</span>
                </label>
                <Textarea
                  placeholder="Jak ti reset pomohl? Co si odnášíš?"
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleFinalComplete(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Zpracovat v MindTrader AI
                </Button>
                <Button onClick={() => handleFinalComplete(false)} variant="outline" className="w-full">
                  Dokončit a vrátit se
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
