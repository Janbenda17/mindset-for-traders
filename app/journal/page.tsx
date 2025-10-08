"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Calendar, FileText, Target, Sparkles, Heart, Brain, Lightbulb } from "lucide-react"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalCalendar } from "@/components/journal-calendar"
import JournalEntries from "@/components/journal-entries"
import { getJournalEntries } from "@/utils/storage-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopNavigation } from "@/components/top-navigation"

export default function JournalPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [entries, setEntries] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [totalProfit, setTotalProfit] = useState<number>(0)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    const journalEntries = getJournalEntries()
    setEntries(journalEntries)
    const calculatedTotalProfit = journalEntries.reduce((sum, entry) => sum + (entry.profitLoss || 0), 0)
    setTotalProfit(calculatedTotalProfit)
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
      <div className="min-h-screen relative overflow-hidden">
        <TopNavigation />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
                📝 Nový záznam do deníku
              </h1>
              <p className="text-xl text-gray-300 mb-2">Zaznamenejte své myšlenky a obchody</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="bg-white/10 backdrop-blur-sm border-gray-500 hover:bg-white/20 text-white"
            >
              Zpět na přehled
            </Button>
          </div>
          <JournalEntryForm selectedDate={selectedDate} onEntryAdded={handleEntryAdded} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <TopNavigation />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
              📖 Trading Deník
            </h1>
            <p className="text-xl text-gray-300 mb-2">Zaznamenávejte své obchody a emoce pro lepší výsledky</p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-5 h-5 mr-2" />✨ Nový záznam
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="psyche-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium mb-2">Celkový P&L</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {totalProfit >= 0 ? "+" : ""}${totalProfit.toLocaleString()}
                  </p>
                  <p className="text-purple-200 text-sm">
                    {totalEntries} obchodů • {totalEntries} záznamů
                  </p>
                </div>
                <div className="p-4 bg-purple-500/20 rounded-2xl">
                  <Heart className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="psyche-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm font-medium mb-2">Win Rate</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {entries.length > 0
                      ? Math.round((entries.filter((e) => e.profitLoss > 0).length / entries.length) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-emerald-200 text-sm">
                    {entries.filter((e) => e.profitLoss > 0).length} výher z {totalEntries}
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/20 rounded-2xl">
                  <Target className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="psyche-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium mb-2">Průměrná nálada</p>
                  <p className="text-3xl font-bold text-white mb-1">{averageMood.toFixed(1)}/10</p>
                  <p className="text-orange-200 text-sm">Celkové záznamy</p>
                </div>
                <div className="p-4 bg-orange-500/20 rounded-2xl">
                  <Brain className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="psyche-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-2">AI Insights</p>
                  <p className="text-3xl font-bold text-white mb-1">42</p>
                  <p className="text-blue-200 text-sm">Doporučení</p>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <Lightbulb className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
            >
              📊 Přehled
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
            >
              📅 Kalendář
            </TabsTrigger>
            <TabsTrigger
              value="entries"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              📝 Všechny záznamy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {totalEntries === 0 ? (
              <Card className="psyche-card">
                <CardHeader className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <span>🎉 Vítejte v Trading Deníku</span>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Začněte zaznamenávat své obchody a myšlenky pro lepší výsledky
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">✨ Zatím žádné záznamy</h3>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto text-lg">
                      Začněte psát svůj první záznam do deníku. Zaznamenávejte své obchody, emoce a ponaučení pro lepší
                      výsledky.
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus className="w-6 h-6 mr-3" />🚀 Vytvořit první záznam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="psyche-card">
                  <CardHeader className="bg-gradient-to-r from-green-900/30 to-emerald-900/30">
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <FileText className="w-5 h-5" />
                      <span>📄 Nedávné záznamy</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">Vaše poslední 5 záznamů</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {entries
                        .slice(-5)
                        .reverse()
                        .map((entry, index) => (
                          <div
                            key={index}
                            className="border border-slate-600/50 rounded-xl p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-white">{entry.title || entry.pair}</h4>
                              <span className="text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded-full">
                                {new Date(entry.date).toLocaleDateString("cs-CZ")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                              {entry.content || entry.notes || "Bez poznámek"}
                            </p>
                            {entry.profitLoss !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                                    entry.profitLoss >= 0
                                      ? "bg-green-900/50 text-green-400"
                                      : "bg-red-900/50 text-red-400"
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

                <Card className="psyche-card">
                  <CardHeader className="bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Sparkles className="w-5 h-5 text-white" />
                      <span>⚡ Rychlé akce</span>
                    </CardTitle>
                    <CardDescription className="text-gray-300">Často používané funkce</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus className="w-5 h-5 mr-3" />📝 Přidat nový obchod
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                      onClick={() => setActiveTab("calendar")}
                    >
                      <Calendar className="w-5 h-5 mr-3" />📅 Zobrazit kalendář
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                      onClick={() => setActiveTab("entries")}
                    >
                      <BookOpen className="w-5 h-5 mr-3" />📚 Všechny záznamy
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="psyche-card">
                <JournalCalendar onDateSelect={setSelectedDate} />
              </Card>
              <Card className="psyche-card">
                <CardHeader className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
                  <CardTitle className="text-white">
                    {selectedDate ? `📅 Záznamy pro ${selectedDate.toLocaleDateString("cs-CZ")}` : "🗓️ Vyberte datum"}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {selectedDate ? "Záznamy pro vybrané datum" : "Klikněte na datum v kalendáři pro zobrazení záznamů"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <JournalEntries selectedDate={selectedDate} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-300 text-lg">📅 Vyberte datum v kalendáři</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <Card className="psyche-card">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span>📚 Všechny deníkové záznamy</span>
                </CardTitle>
                <CardDescription className="text-gray-300">Kompletní přehled všech vašich záznamů</CardDescription>
              </CardHeader>
              <CardContent>
                <JournalEntries />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
