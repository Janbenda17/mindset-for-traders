"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { saveMoodEntry, getMoodEntries } from "@/utils/storage-utils"
import { useToast } from "@/components/ui/use-toast"
import { getTodayDateString } from "@/utils/date-utils"

export function MoodTracker() {
  const [mood, setMood] = useState(3) // Default mood
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load today's mood if it exists
    const today = getTodayDateString()
    const entries = getMoodEntries()
    const todayEntry = entries.find((entry) => entry.date === today)
    if (todayEntry) {
      setMood(todayEntry.mood)
      setNotes(todayEntry.notes || "")
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const today = getTodayDateString()
    const newMoodEntry = {
      date: today,
      mood: mood,
      notes: notes,
    }

    saveMoodEntry(newMoodEntry)
    setIsLoading(false)
    toast({
      title: "Nálada uložena",
      description: "Vaše denní nálada byla úspěšně zaznamenána.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sledování nálady</CardTitle>
        <CardDescription>Zaznamenejte svou denní náladu a pocity.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="mood">Jaká je dnes vaše nálada?</Label>
            <Slider
              id="mood"
              min={1}
              max={5}
              step={1}
              value={[mood]}
              onValueChange={(val) => setMood(val[0])}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 (Špatná)</span>
              <span>5 (Výborná)</span>
            </div>
            <p className="text-center text-lg font-semibold mt-2">Aktuální nálada: {mood}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Poznámky (volitelné)</Label>
            <Textarea
              id="notes"
              placeholder="Zaznamenejte, co ovlivnilo vaši náladu dnes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Ukládání..." : "Uložit náladu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
