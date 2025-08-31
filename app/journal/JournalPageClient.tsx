"use client"

import { useState } from "react"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalCalendar } from "@/components/journal-calendar"
import { JournalEntries } from "@/components/journal-entries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function JournalPageClient() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  return (
    <div className="grid gap-6 p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold">Obchodní deník</h1>
      <p className="text-muted-foreground">Zaznamenejte své myšlenky, emoce a lekce z obchodování.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <JournalCalendar onDateSelect={setSelectedDate} />
        <JournalEntryForm selectedDate={selectedDate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Všechny deníkové záznamy</CardTitle>
          <CardDescription>
            {selectedDate ? `Záznamy pro ${selectedDate.toLocaleDateString()}` : "Všechny vaše deníkové záznamy."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JournalEntries selectedDate={selectedDate} />
        </CardContent>
      </Card>
    </div>
  )
}
