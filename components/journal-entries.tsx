"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState("")

  const journals = [
    {
      id: 1,
      date: "2023-04-18",
      mood: "Optimistic",
      title: "Stayed disciplined during market volatility",
      content:
        "Today I managed to stick to my trading plan despite high market volatility. I felt the urge to overtrade but remembered my morning affirmation about patience.",
    },
    {
      id: 2,
      date: "2023-04-17",
      mood: "Anxious",
      title: "Struggled with FOMO",
      content:
        "Missed a good entry and spent the day fighting FOMO. Need to work on accepting missed opportunities as part of trading.",
    },
    {
      id: 3,
      date: "2023-04-16",
      mood: "Neutral",
      title: "Followed my system perfectly",
      content:
        "Neither excited nor disappointed today. Simply executed my strategy as planned. This emotional neutrality led to good decisions.",
    },
    {
      id: 4,
      date: "2023-04-15",
      mood: "Frustrated",
      title: "Broke my rules and paid the price",
      content:
        "Ignored my stop loss and turned a small loss into a big one. Need to work on accepting small losses as part of the process.",
    },
    {
      id: 5,
      date: "2023-04-14",
      mood: "Confident",
      title: "Trusted my analysis and won",
      content:
        "My analysis indicated a reversal against the trend. I took the trade despite doubts and it worked out well. Confidence in my system is growing.",
    },
  ]

  const filteredJournals = journals.filter(
    (journal) =>
      journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search journal entries..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredJournals.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">No journal entries found</p>
      ) : (
        <div className="space-y-4">
          {filteredJournals.map((journal) => (
            <div key={journal.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{journal.title}</h3>
                  <p className="text-sm text-muted-foreground">{journal.date}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{journal.mood}</span>
              </div>
              <p className="text-sm text-muted-foreground">{journal.content}</p>
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
