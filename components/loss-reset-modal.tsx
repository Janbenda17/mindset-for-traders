"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useLossReset } from "@/contexts/loss-reset-context"
import type { LossResetMode, LossResetActivity } from "@/types/loss-reset"
import { User, Shuffle, ChevronRight, TrendingDown, Clock, CheckCircle2, Play, History } from "lucide-react"
import { format } from "date-fns"
import { cs } from "date-fns/locale"

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

export function LossResetModal() {
  const {
    isActive,
    currentSession,
    mode,
    coachTone,
    selectMode,
    cancelReset,
    recentSessions,
    availableActivities,
    startReset,
  } = useLossReset()
  const [step, setStep] = useState<
    "overview" | "frustration-check" | "intro" | "mode-select" | "activity-select" | "history"
  >("overview")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [frustrationBefore, setFrustrationBefore] = useState<number>(5)
  const [notesBefore, setNotesBefore] = useState("")

  useEffect(() => {
    if (isActive && !currentSession?.activity) {
      setIsModalOpen(true)
      setStep("overview")
    } else {
      setIsModalOpen(false)
    }
  }, [isActive, currentSession?.activity])

  const copy = COPY[coachTone]

  const todaySessions = recentSessions.filter(
    (s) => new Date(s.triggeredAt).toDateString() === new Date().toDateString(),
  )
  const completedSessions = recentSessions.filter((s) => s.completed)
  const completionRate = recentSessions.length > 0 ? (completedSessions.length / recentSessions.length) * 100 : 0

  const handleStartWithFrustration = () => {
    const frustrationData = {
      frustrationBefore,
      notesBefore,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("loss-reset-frustration-before", JSON.stringify(frustrationData))
    setStep("mode-select")
  }

  if (!isActive || !currentSession) return null

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && cancelReset()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        {step === "overview" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Loss Reset System</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Co to dělá?</h3>
                <p className="text-sm text-muted-foreground">
                  Loss Reset je vědecky podložený systém, který ti pomůže přerušit emoční smyčku po ztrátě a předejít
                  revenge tradingu. Každá aktivita má specifický efekt na nervový systém a pomáhá obnovit sebekontrolu.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Tvoje statistiky</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Dnes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-400">{todaySessions.length}</div>
                      <p className="text-xs text-muted-foreground">resetů provedeno</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Celkem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-400">{recentSessions.length}</div>
                      <p className="text-xs text-muted-foreground">všech resetů</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Úspěšnost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-400">{completionRate.toFixed(0)}%</div>
                      <p className="text-xs text-muted-foreground">dokončených resetů</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Dokončeno/Nedokončeno</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-400">
                        {completedSessions.length}/{recentSessions.length - completedSessions.length}
                      </div>
                      <p className="text-xs text-muted-foreground">úspěch/zrušeno</p>
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

                <Button onClick={cancelReset} variant="ghost" className="w-full">
                  Zavřít
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "frustration-check" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Jak se teď cítíš?</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ohodnoť svou aktuální úroveň frustrace (1 = klid, 10 = extrémní frustrace)
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Klid</span>
                      <span>Extrémní frustrace</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFrustrationBefore(num)}
                          className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                            frustrationBefore === num
                              ? num <= 3
                                ? "bg-green-500 text-white scale-110"
                                : num <= 6
                                  ? "bg-yellow-500 text-white scale-110"
                                  : "bg-red-500 text-white scale-110"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <span
                        className={`text-2xl font-bold ${
                          frustrationBefore <= 3
                            ? "text-green-500"
                            : frustrationBefore <= 6
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {frustrationBefore}/10
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {frustrationBefore <= 3 && "Jsi relativně v klidu"}
                        {frustrationBefore > 3 && frustrationBefore <= 6 && "Střední úroveň frustrace"}
                        {frustrationBefore > 6 && frustrationBefore <= 8 && "Vysoká frustrace - Loss Reset ti pomůže"}
                        {frustrationBefore > 8 && "Kritická úroveň - rozhodně potřebuješ reset"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Co se stalo? <span className="text-muted-foreground font-normal">(nepovinné)</span>
                  </label>
                  <Textarea
                    value={notesBefore}
                    onChange={(e) => setNotesBefore(e.target.value)}
                    placeholder="Např: Udělal jsem revenge trade, ztratil jsem X$, nebyl jsem disciplinovaný..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Toto se později použije pro AI analýzu v MindTrader AI
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleStartWithFrustration} className="w-full" size="lg">
                  Pokračovat k resetu
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

                <Button onClick={() => setStep("overview")} variant="ghost" className="w-full">
                  Zpět
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "history" && (
          <>
            <DialogHeader>
              <DialogTitle>Historie resetů</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-[400px] overflow-y-auto py-4">
              {recentSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Zatím žádné resety</p>
                  <p className="text-sm">Spusť Loss Reset po ztrátě nebo ručně</p>
                </div>
              ) : (
                recentSessions.map((session) => {
                  const activity = availableActivities.find((a) => a.id === session.activity)
                  return (
                    <Card key={session.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{activity?.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">{activity?.name}</h3>
                                {session.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-600" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
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
            </div>

            <Button onClick={() => setStep("overview")} variant="outline" className="w-full">
              Zpět
            </Button>
          </>
        )}

        {step === "intro" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{copy.intro.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">{copy.intro.description}</p>
                <p className="text-sm font-medium text-primary">{copy.intro.subtitle}</p>
              </div>

              {currentSession.triggeredBy === "auto" && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>AI detekce:</strong> Zaznamenali jsme pattern, který často vede k impulzivním rozhodnutím.
                  </p>
                </div>
              )}

              <Button onClick={() => setStep("mode-select")} className="w-full" size="lg">
                Pokračovat
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>

              <Button onClick={cancelReset} variant="ghost" className="w-full">
                Zrušit
              </Button>
            </div>
          </>
        )}

        {step === "mode-select" && (
          <>
            <DialogHeader>
              <DialogTitle>Vyber režim resetu</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <ModeCard
                mode="user-choice"
                icon={<User className="h-6 w-6" />}
                title={copy.modes["user-choice"].title}
                description={copy.modes["user-choice"].description}
                selected={mode === "user-choice"}
                onClick={() => {
                  selectMode("user-choice")
                  setStep("activity-select")
                }}
              />

              <ModeCard
                mode="random"
                icon={<Shuffle className="h-6 w-6" />}
                title={copy.modes["random"].title}
                description={copy.modes["random"].description}
                selected={mode === "random"}
                onClick={() => {
                  selectMode("random")
                  setStep("activity-select")
                }}
              />
            </div>

            <Button onClick={() => setStep("frustration-check")} variant="ghost" className="w-full">
              Zpět
            </Button>
          </>
        )}

        {step === "activity-select" && <LossResetActivitySelect onBack={() => setStep("mode-select")} />}
      </DialogContent>
    </Dialog>
  )
}

function ModeCard({
  mode,
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  mode: LossResetMode
  icon: React.ReactNode
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:border-primary ${
        selected ? "border-primary bg-primary/5" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-primary">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  )
}

function LossResetActivitySelect({ onBack }: { onBack: () => void }) {
  const { mode, availableActivities, selectActivity } = useLossReset()

  const handleActivitySelect = (activity: LossResetActivity) => {
    selectActivity(activity)
  }

  useEffect(() => {
    if (mode === "random") {
      const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)].id
      handleActivitySelect(randomActivity)
    }
  }, [mode])

  if (mode === "random") {
    return (
      <div className="py-8 text-center">
        <Shuffle className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-lg font-semibold">Vybírám náhodnou aktivitu...</p>
      </div>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Vyber aktivitu</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
        {availableActivities.map((activity) => (
          <Card
            key={activity.id}
            className="p-4 cursor-pointer transition-all hover:border-primary"
            onClick={() => handleActivitySelect(activity.id)}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{activity.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{activity.name}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{Math.floor(activity.duration / 60)} min</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={onBack} variant="ghost" className="w-full">
        Zpět
      </Button>
    </>
  )
}
