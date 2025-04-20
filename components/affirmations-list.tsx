"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookmarkIcon, Star } from "lucide-react"

export function AffirmationsList() {
  const [favorites, setFavorites] = useState<number[]>([])

  const affirmations = [
    {
      id: 1,
      text: "I trust my trading system and follow it with discipline.",
      category: "Discipline",
    },
    {
      id: 2,
      text: "I am patient and only take high-probability setups.",
      category: "Patience",
    },
    {
      id: 3,
      text: "I accept losses as part of the trading process.",
      category: "Resilience",
    },
    {
      id: 4,
      text: "I trade the market as it is, not as I wish it to be.",
      category: "Objectivity",
    },
    {
      id: 5,
      text: "I maintain emotional balance regardless of profit or loss.",
      category: "Emotional Control",
    },
    {
      id: 6,
      text: "I focus on the process, not the outcome of each trade.",
      category: "Process-Oriented",
    },
    {
      id: 7,
      text: "I am detached from money when making trading decisions.",
      category: "Detachment",
    },
    {
      id: 8,
      text: "I am constantly learning and improving my trading skills.",
      category: "Growth Mindset",
    },
  ]

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {affirmations.map((affirmation) => (
        <Card key={affirmation.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs px-2 py-1 rounded-full bg-muted">{affirmation.category}</span>
              <Button variant="ghost" size="icon" onClick={() => toggleFavorite(affirmation.id)}>
                <Star
                  className={`h-4 w-4 ${favorites.includes(affirmation.id) ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
              </Button>
            </div>
            <blockquote className="text-base italic">"{affirmation.text}"</blockquote>
            <div className="flex justify-end mt-2">
              <Button variant="ghost" size="sm">
                <BookmarkIcon className="mr-2 h-4 w-4" />
                Set as Daily
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
