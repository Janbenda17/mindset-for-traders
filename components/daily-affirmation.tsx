"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState("I trust my trading system and follow it with discipline.")

  const affirmations = [
    "I trust my trading system and follow it with discipline.",
    "I am patient and only take high-probability setups.",
    "I accept losses as part of the trading process.",
    "I trade the market as it is, not as I wish it to be.",
    "I maintain emotional balance regardless of profit or loss.",
    "I focus on the process, not the outcome of each trade.",
    "I am detached from money when making trading decisions.",
  ]

  const getRandomAffirmation = () => {
    const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)]
    setAffirmation(newAffirmation)
  }

  return (
    <div className="space-y-4">
      <blockquote className="text-xl font-serif italic text-center p-4 border-l-4 border-primary bg-muted/50">
        "{affirmation}"
      </blockquote>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={getRandomAffirmation}>
          <RefreshCw className="mr-2 h-4 w-4" />
          New Affirmation
        </Button>
      </div>
    </div>
  )
}
