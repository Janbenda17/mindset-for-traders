"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useLossReset } from "@/contexts/loss-reset-context"
import { Check, X } from "lucide-react"

const ACTIVITY_COPY = {
  "calm-mentor": {
    "cold-shower": {
      during: [
        "Dýchej zhluboka...",
        "Soustřeď se na pocit vody",
        "Jsi v bezpečí, jen cítíš chlad",
        "Skoro hotovo, zvládáš to skvěle",
      ],
      completion: "Výborně. Tvůj nervový systém je teď v klidu.",
    },
    physical: {
      during: [
        "Pomalu, soustřeď se na techniku",
        "Dýchej pravidelně",
        "Cítíš, jak se napětí uvolňuje?",
        "Poslední opakování, máš to",
      ],
      completion: "Skvělá práce. Endorfiny jsou na cestě.",
    },
    meditation: {
      during: [
        "Sleduj svůj dech...",
        "Když mysl odbíhá, je to normální",
        "Jemně se vrať k dechu",
        "Jsi přítomný, tady a teď",
      ],
      completion: "Krásně. Tvá mysl je teď čistší.",
    },
    write: {
      during: ["Piš rychle, bez editace", "Nechej to jen vytéct"],
      completion: "Díky za upřímnost. Teď to můžeme zpracovat.",
    },
    walk: {
      during: ["Všímej si okolí", "Cítíš vzduch na kůži?", "Každý krok tě vrací do rovnováhy", "Skoro u cíle"],
      completion: "Výborně. Změna prostředí udělala své.",
    },
  },
  "strict-coach": {
    "cold-shower": {
      during: [
        "Dýchej. Kontroluj dech.",
        "Soustřeď se. Žádné myšlenky.",
        "Chlad = reset. Přijmi to.",
        "Poslední vteřiny. Dokonči to.",
      ],
      completion: "Hotovo. Systém resetován.",
    },
    physical: {
      during: ["Technika. Pomalu.", "Dýchej. Nepospíchej.", "Cítíš napětí? Ven s ním.", "Dokonči to pořádně."],
      completion: "Dobře. Napětí pryč.",
    },
    meditation: {
      during: ["Dech. Nic jiného.", "Mysl odbíhá? Vrať ji.", "Soustředění. Tady a teď.", "Dokonči to."],
      completion: "Hotovo. Mysl čistá.",
    },
    write: {
      during: ["Piš. Bez přemýšlení.", "Ven s tím."],
      completion: "Dobře. Teď to zpracujeme.",
    },
    walk: {
      during: ["Choď. Všímej si okolí.", "Žádné myšlenky na trading.", "Každý krok = reset.", "Skoro hotovo."],
      completion: "Hotovo. Prostředí změněno.",
    },
  },
}

export function LossResetActivityScreen() {
  const { currentSession, coachTone, availableActivities, completeActivity, cancelReset } = useLossReset()
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [writeInput, setWriteInput] = useState({ feeling: "", nextTime: "" })
  const [currentTip, setCurrentTip] = useState(0)

  const activity = availableActivities.find((a) => a.id === currentSession?.activity)
  const copy = ACTIVITY_COPY[coachTone][currentSession?.activity || "cold-shower"]

  useEffect(() => {
    if (activity && activity.completionType === "timer") {
      setTimeLeft(activity.duration)
    }
  }, [activity])

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Change tip every 30 seconds
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % copy.during.length)
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(tipInterval)
    }
  }, [isRunning, timeLeft, copy.during.length])

  if (!currentSession || !activity) return null

  const progress = activity.completionType === "timer" ? ((activity.duration - timeLeft) / activity.duration) * 100 : 0

  const handleStart = () => {
    setIsRunning(true)
  }

  const handleComplete = () => {
    if (activity.completionType === "input") {
      // Save write input
      localStorage.setItem("loss-reset-write", JSON.stringify(writeInput))
    }
    completeActivity()
  }

  const canComplete =
    activity.completionType === "manual" ||
    (activity.completionType === "timer" && timeLeft === 0) ||
    (activity.completionType === "input" && writeInput.feeling && writeInput.nextTime)

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{activity.icon}</span>
              <div>
                <CardTitle>{activity.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Instrukce:</h3>
            <ul className="space-y-1">
              {activity.instructions.map((instruction, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* Timer for timer-based activities */}
          {activity.completionType === "timer" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold tabular-nums">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{copy.during[currentTip]}</p>
              </div>

              <Progress value={progress} className="h-2" />

              {!isRunning && timeLeft > 0 && (
                <Button onClick={handleStart} className="w-full" size="lg">
                  Spustit timer
                </Button>
              )}

              {timeLeft === 0 && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-medium">{copy.completion}</p>
                </div>
              )}
            </div>
          )}

          {/* Manual completion */}
          {activity.completionType === "manual" && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-lg font-medium mb-4">{copy.during[0]}</p>
                <p className="text-sm text-muted-foreground">Až dokončíš, klikni na tlačítko níže</p>
              </div>
            </div>
          )}

          {/* Write input */}
          {activity.completionType === "input" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">1. Co jsem právě cítil?</label>
                <Textarea
                  value={writeInput.feeling}
                  onChange={(e) => setWriteInput({ ...writeInput, feeling: e.target.value })}
                  placeholder="Piš rychle, bez editace..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">2. Co udělám příště jinak?</label>
                <Textarea
                  value={writeInput.nextTime}
                  onChange={(e) => setWriteInput({ ...writeInput, nextTime: e.target.value })}
                  placeholder="Konkrétní akce..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Complete button */}
          <Button onClick={handleComplete} disabled={!canComplete} className="w-full" size="lg">
            {canComplete ? "Dokončit reset" : "Dokonči aktivitu"}
          </Button>

          <Button onClick={cancelReset} variant="ghost" className="w-full">
            Zrušit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
