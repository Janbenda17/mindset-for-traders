"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Calendar, TrendingUp, FileText, Target } from "lucide-react"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalCalendar } from "@/components/journal-calendar"
import JournalEntries from "@/components/journal-entries"
import { getJournalEntries } from "@/utils/storage-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [entries, setEntries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    const journalEntries = getJournalEntries()
    setEntries(journalEntries)
  }

  const handleEntryAdded = () => {
    loadEntries()
    setShowForm(false)
  }

  const totalEntries = entries.length
  const thisWeekEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  }).length

  const thisMonthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return entryDate >= monthAgo
  }).length

  const averageMood =
    entries.length > 0 ? entries.reduce((sum, entry) => sum + (entry.mood || 5), 0) / entries.length : 0

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nový záznam do deníku</h1>
            <p className="text-gray-600 mt-2">Zaznamenejte své myšlenky a obchody</p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Zpět na přehled
          </Button>
        </div>
        <JournalEntryForm selectedDate={selectedDate} onEntryAdded={handleEntryAdded} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Deník</h1>
          <p className="text-gray-600 mt-2">Zaznamenávejte své obchody a emoce</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nový záznam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové záznamy</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">+{thisWeekEntries} tento týden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tento měsíc</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthEntries}</div>
            <p className="text-xs text-muted-foreground">Aktivní záznamy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná nálada</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMood.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">z 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Úspěšnost</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.length > 0
                ? Math.round((entries.filter((e) => e.profitLoss > 0).length / entries.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Ziskové obchody</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Přehled</TabsTrigger>
          <TabsTrigger value="calendar">Kalendář</TabsTrigger>
          <TabsTrigger value="entries">Všechny záznamy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {totalEntries === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Vítejte v Trading Deníku</CardTitle>
                <CardDescription>Začněte zaznamenávat své obchody a myšlenky</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Zatím žádné záznamy</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Začněte psát svůj první záznam do deníku. Zaznamenávejte své obchody, emoce a ponaučení pro lepší
                    výsledky.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Vytvořit první záznam
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Nedávné záznamy
                  </CardTitle>
                  <CardDescription>Vaše poslední 5 záznamů</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entries
                      .slice(-5)
                      .reverse()
                      .map((entry, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{entry.title || entry.pair}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString("cs-CZ")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.content || entry.notes || "Bez poznámek"}
                          </p>
                          {entry.profitLoss !== undefined && (
                            <div className="mt-2">
                              <span
                                className={`text-sm font-medium ${
                                  entry.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {entry.profitLoss >= 0 ? "+" : ""}
                                {entry.profitLoss.toFixed(2)} USD
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rychlé akce</CardTitle>
                  <CardDescription>Často používané funkce</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Přidat nový obchod
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveTab("calendar")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Zobrazit kalendář
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveTab("entries")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Všechny záznamy
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <JournalCalendar onDateSelect={setSelectedDate} />
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? `Záznamy pro ${selectedDate.toLocaleDateString("cs-CZ")}` : "Vyberte datum"}
                </CardTitle>
                <CardDescription>
                  {selectedDate ? "Záznamy pro vybrané datum" : "Klikněte na datum v kalendáři pro zobrazení záznamů"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <JournalEntries selectedDate={selectedDate} />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Vyberte datum v kalendáři</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Všechny deníkové záznamy</CardTitle>
              <CardDescription>Kompletní přehled všech vašich záznamů</CardDescription>
            </CardHeader>
            <CardContent>
              <JournalEntries />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
