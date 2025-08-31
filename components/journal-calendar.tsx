"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { getJournalEntries } from "@/utils/storage-utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface JournalCalendarProps {
  onDateSelect: (date: Date | undefined) => void
}

export function JournalCalendar({ onDateSelect }: JournalCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [journalEntries, setJournalEntries] = useState<any[]>([])

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    const entries = getJournalEntries()
    setJournalEntries(entries)
  }

  const getDayContent = (day: Date) => {
    const formattedDay = format(day, "yyyy-MM-dd")
    const entriesForDay = journalEntries.filter((entry) => entry.date === formattedDay)

    if (entriesForDay.length > 0) {
      const hasProfit = entriesForDay.some((entry) => entry.profitLoss > 0)
      const hasLoss = entriesForDay.some((entry) => entry.profitLoss < 0)

      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <span>{day.getDate()}</span>
          <div className="absolute -top-1 -right-1 flex gap-1">
            <Badge
              className={`h-3 w-3 p-0 flex items-center justify-center text-xs ${
                hasProfit && hasLoss
                  ? "bg-yellow-500"
                  : hasProfit
                    ? "bg-green-500"
                    : hasLoss
                      ? "bg-red-500"
                      : "bg-blue-500"
              }`}
            >
              {entriesForDay.length}
            </Badge>
          </div>
        </div>
      )
    }
    return day.getDate()
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onDateSelect(selectedDate)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deníkový kalendář</CardTitle>
        <CardDescription>Vyberte datum pro zobrazení záznamů. Barevné tečky označují dny s záznamy.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
            components={{
              DayContent: ({ date: day }) => getDayContent(day),
            }}
          />

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Ziskové obchody</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Ztrátové obchody</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Smíšené</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Ostatní záznamy</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
