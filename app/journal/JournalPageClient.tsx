"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalCalendar } from "@/components/journal-calendar"
import { JournalEntries } from "@/components/journal-entries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function JournalPageClient() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const { language } = useLanguage()
  const isEn = language === "en"

  const txt = {
    title: isEn ? "Trading Journal" : "Obchodní deník",
    subtitle: isEn ? "Record your thoughts, emotions, and lessons from trading." : "Zaznamenávej své myšlenky, emoce a lekce z obchodování.",
    allRecords: isEn ? "All Journal Records" : "Všechny záznamy deníku",
    recordsFor: (date: string) => isEn ? `Records for ${date}` : `Záznamy za ${date}`,
    allRecords2: isEn ? "All your journal records." : "Všechny tvé záznamy v deníku.",
  }

  return (
    <div className="grid gap-6 p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold">{txt.title}</h1>
      <p className="text-muted-foreground">{txt.subtitle}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <JournalCalendar onDateSelect={setSelectedDate} />
        <JournalEntryForm selectedDate={selectedDate} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{txt.allRecords}</CardTitle>
          <CardDescription>
            {selectedDate ? txt.recordsFor(selectedDate.toLocaleDateString()) : txt.allRecords2}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JournalEntries selectedDate={selectedDate} />
        </CardContent>
      </Card>
    </div>
  )
}
