"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLossReset } from "@/contexts/loss-reset-context"
import { Check, ArrowRight } from "lucide-react"

export function LossResetCompletion() {
  const router = useRouter()
  const { currentSession, coachTone, cancelReset } = useLossReset()

  if (!currentSession?.completed) return null

  const handleContinueToAI = () => {
    // Navigate to MindTrader AI with context
    router.push("/mindtrader-ai?context=loss-reset")
    cancelReset()
  }

  const calmCopy = {
    title: "Jsi zpět v klidu",
    message:
      "Skvělá práce. Udělal jsi přesně to, co profesionálové – zastavil ses, resetoval a teď jsi připravený pokračovat s čistou hlavou.",
    cta: "Teď to společně zpracujeme v MindTrader AI a uložíme do Recovery Logu.",
  }

  const strictCopy = {
    title: "Reset dokončen",
    message: "Dobře. Zastavil ses včas. Teď zpracujeme, co se stalo, a nastavíme plán, aby se to neopakovalo.",
    cta: "Pokračuj do MindTrader AI pro rychlou reflexi.",
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

          <div className="space-y-3">
            <Button onClick={handleContinueToAI} className="w-full" size="lg">
              {copy.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button onClick={cancelReset} variant="outline" className="w-full bg-transparent">
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
