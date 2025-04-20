import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalEntries } from "@/components/journal-entries"

export default function JournalPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground">Record your thoughts, emotions, and lessons from your trades</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
            <CardDescription>Reflect on your trading day</CardDescription>
          </CardHeader>
          <CardContent>
            <JournalEntryForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal Calendar</CardTitle>
            <CardDescription>View your journaling consistency</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border rounded-md">
            <p className="text-muted-foreground">Calendar visualization will appear here</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Journal Entries</CardTitle>
            <CardDescription>Your trading reflections and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <JournalEntries />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline">Load More</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
