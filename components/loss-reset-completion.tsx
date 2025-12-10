"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLossReset } from "@/contexts/loss-reset-context"
import { Check, ArrowRight, TrendingUp, TrendingDown, MessageSquare } from "lucide-react"

export function LossResetCompletion() {
  const router = useRouter()
  const { currentSession, coachTone, cancelReset } = useLossReset()
  const [frustrationAfter, setFrustrationAfter] = useState<number>(5)
  const [notesAfter, setNotesAfter] = useState("")
  const [frustrationBefore, setFrustrationBefore] = useState<number>(5)
  const [notesBefore, setNotesBefore] = useState("")

  useEffect(() => {
    const storedBefore = localStorage.getItem("loss-reset-frustration-before")
    if (storedBefore) {
      const data = JSON.parse(storedBefore)
      setFrustrationBefore(data.frustrationBefore || 5)
      setNotesBefore(data.notesBefore || "")
    }
  }, [])

  if (!currentSession?.completed) return null

  const improvement = frustrationBefore - frustrationAfter

  const handleContinueToAI = () => {
    // Save all data
    const resetData = {
      sessionId: currentSession.id,
      frustrationBefore,
      frustrationAfter,
      improvement,
      notesBefore,
      notesAfter,
      activity: currentSession.activity,
      date: new Date().toISOString(),
    }

    const existingData = JSON.parse(localStorage.getItem("loss-reset-mood-data") || "[]")
    localStorage.setItem("loss-reset-mood-data", JSON.stringify([...existingData, resetData]))

    let aiPrompt = ""
    if (notesBefore || notesAfter) {
      aiPrompt = `Právě jsem dokončil Loss Reset. Před resetem (frustrace ${frustrationBefore}/10): ${notesBefore || "bez poznámky"}. Po resetu (frustrace ${frustrationAfter}/10): ${notesAfter || "bez poznámky"}. Zlepšení: ${improvement > 0 ? "+" : ""}${improvement} bodů.`
    } else {
      aiPrompt = `Ztratil jsem obchod, udělal jsem loss reset (${currentSession.activity}). Před resetem jsem měl frustraci ${frustrationBefore}/10, teď mám ${frustrationAfter}/10. ${improvement > 0 ? `Zlepšil jsem se o ${improvement} bodů.` : improvement < 0 ? `Bohužel se mi zhoršilo o ${Math.abs(improvement)} bodů.` : "Zůstalo to stejné."}`
    }

    // Store prompt for AI
    localStorage.setItem("mindtrader-ai-prefill", aiPrompt)

    cancelReset()
    router.push("/mindtrader")
  }

  const handleClose = () => {
    // Save data even if not going to AI
    const resetData = {
      sessionId: currentSession.id,
      frustrationBefore,
      frustrationAfter,
      improvement,
      notesBefore,
      notesAfter,
      activity: currentSession.activity,
      date: new Date().toISOString(),
    }

    const existingData = JSON.parse(localStorage.getItem("loss-reset-mood-data") || "[]")
    localStorage.setItem("loss-reset-mood-data", JSON.stringify([...existingData, resetData]))

    cancelReset()
  }

  const calmCopy = {
    title: "Jsi zpět v klidu",
    message:
      "Skvělá práce. Udělal jsi přesně to, co profesionálové – zastavil ses, resetoval a teď jsi připravený pokračovat s čistou hlavou.",
  }

  const strictCopy = {
    title: "Reset dokončen",
    message: "Dobře. Zastavil ses včas. Teď zpracujeme, co se stalo, a nastavíme plán, aby se to neopakovalo.",
  }

  const copy = coachTone === "calm-mentor" ? calmCopy : strictCopy

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
            </div>
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">{copy.message}</p>

          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <h4 className="font-medium text-center text-sm">Jak se cítíš teď po resetu?</h4>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Klid</span>
                <span>Stále frustrovaný</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFrustrationAfter(num)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                      frustrationAfter === num
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
            </div>

            <div
              className={`text-center p-3 rounded-lg ${
                improvement > 0 ? "bg-green-500/10" : improvement < 0 ? "bg-red-500/10" : "bg-yellow-500/10"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {improvement > 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : improvement < 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : null}
                <span
                  className={`text-lg font-bold ${
                    improvement > 0 ? "text-green-500" : improvement < 0 ? "text-red-500" : "text-yellow-500"
                  }`}
                >
                  {frustrationBefore}/10 → {frustrationAfter}/10
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {improvement >= 3
                  ? "Výborně! Loss Reset ti opravdu pomohl."
                  : improvement >= 1
                    ? "Dobrý pokrok. Zkus příště delší aktivitu."
                    : improvement === 0
                      ? "Beze změny. Možná zkus jinou aktivitu."
                      : "Někdy to chce víc času. Nevzdávej to."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Poznámka (nepovinné)</label>
              <Textarea
                value={notesAfter}
                onChange={(e) => setNotesAfter(e.target.value)}
                placeholder="Jak se teď cítíš? Co ti pomohlo?"
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleContinueToAI} className="w-full" size="lg">
              <MessageSquare className="mr-2 h-4 w-4" />
              Zpracovat v MindTrader AI
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button onClick={handleClose} variant="outline" className="w-full bg-transparent">
              Zavřít (uloženo do historie)
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            +50 XP • Discipline +10 • Readiness -5 (realisticky)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
