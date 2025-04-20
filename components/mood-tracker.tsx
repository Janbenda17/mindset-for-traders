"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react"

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedConfidence, setSelectedConfidence] = useState<string | null>(null)

  const moods = [
    { value: "optimistic", icon: Smile, label: "Optimistic" },
    { value: "neutral", icon: Meh, label: "Neutral" },
    { value: "anxious", icon: Frown, label: "Anxious" },
  ]

  const confidenceLevels = [
    { value: "high", icon: ThumbsUp, label: "High" },
    { value: "low", icon: ThumbsDown, label: "Low" },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mood" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mood">Current Mood</TabsTrigger>
          <TabsTrigger value="confidence">Trading Confidence</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-3 gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon
          return (
            <Card
              key={mood.value}
              className={`p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${
                selectedMood === mood.value ? "border-2 border-primary" : ""
              }`}
              onClick={() => setSelectedMood(mood.value)}
            >
              <Icon className="h-10 w-10 mb-2" />
              <span>{mood.label}</span>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {confidenceLevels.map((level) => {
          const Icon = level.icon
          return (
            <Card
              key={level.value}
              className={`p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${
                selectedConfidence === level.value ? "border-2 border-primary" : ""
              }`}
              onClick={() => setSelectedConfidence(level.value)}
            >
              <Icon className="h-10 w-10 mb-2" />
              <span>{level.label}</span>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Tracking your mood helps correlate emotional states with trading performance
        </p>
        <Button>Log Mood</Button>
      </div>
    </div>
  )
}
