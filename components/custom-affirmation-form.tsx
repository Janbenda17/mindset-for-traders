"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CustomAffirmationForm() {
  const [affirmation, setAffirmation] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({ affirmation, category })
    // Reset form
    setAffirmation("")
    setCategory("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="affirmation">Your Affirmation</Label>
        <Textarea
          id="affirmation"
          placeholder="Write a positive, present-tense statement that addresses your specific trading challenge..."
          rows={4}
          value={affirmation}
          onChange={(e) => setAffirmation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="discipline">Discipline</SelectItem>
            <SelectItem value="patience">Patience</SelectItem>
            <SelectItem value="resilience">Resilience</SelectItem>
            <SelectItem value="objectivity">Objectivity</SelectItem>
            <SelectItem value="emotional-control">Emotional Control</SelectItem>
            <SelectItem value="process-oriented">Process-Oriented</SelectItem>
            <SelectItem value="detachment">Detachment</SelectItem>
            <SelectItem value="growth-mindset">Growth Mindset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tips for Effective Affirmations:</Label>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>Use present tense ("I am..." not "I will...")</li>
          <li>Keep it positive (what you want, not what you don't want)</li>
          <li>Make it specific to your trading challenges</li>
          <li>Use emotional language that resonates with you</li>
          <li>Keep it concise and memorable</li>
        </ul>
      </div>

      <Button type="submit" className="w-full">
        Save Custom Affirmation
      </Button>
    </form>
  )
}
