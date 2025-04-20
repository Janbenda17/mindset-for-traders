"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function JournalEntryForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({ title, content, mood })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Entry Title</Label>
        <Input
          id="title"
          placeholder="Summarize your trading day"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mood">Mood</Label>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger>
            <SelectValue placeholder="Select your mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="optimistic">Optimistic</SelectItem>
            <SelectItem value="confident">Confident</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="anxious">Anxious</SelectItem>
            <SelectItem value="frustrated">Frustrated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Journal Entry</Label>
        <Textarea
          id="content"
          placeholder="Reflect on your trading decisions, emotions, and lessons learned..."
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Save Journal Entry
      </Button>
    </form>
  )
}
