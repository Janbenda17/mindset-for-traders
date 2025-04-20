"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"
import { cs } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, TrendingUp, Brain, Moon, Activity } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data - in a real app, this would come from an API or database
const generateHistoryData = () => {
  const data = []
  const today = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i)
    const mentalScore = Math.floor(Math.random() * 30) + 60 // 60-90
    const sleepHours = Math.floor(Math.random() * 3) + 6 // 6-8
    const tradingResult = Math.floor(Math.random() * 2000) - 500 // -500 to 1500
    const mood = Math.floor(Math.random() * 5) + 5 // 5-10
    const exercise = Math.random() > 0.3 // 70% chance of exercise

    data.push({
      date: format(date, "yyyy-MM-dd"),
      formattedDate: format(date, "d. MMMM", { locale: cs }),
      shortDate: format(date, "d. M."),
      mentalScore,
      sleepHours,
      tradingResult,
      mood,
      exercise,
    })
  }

  return data
}

export function MindTraderHistory() {
  const [timeframe, setTimeframe] = useState("month")
  const [date, setDate] = useState<Date>()
  const historyData = generateHistoryData()

  // Calculate best and worst days
  const bestDay = [...historyData].sort((a, b) => b.mentalScore - a.mentalScore)[0]
  const worstDay = [...historyData].sort((a, b) => a.mentalScore - b.mentalScore)[0]
  const mostProfitableDay = [...historyData].sort((a, b) => b.tradingResult - a.tradingResult)[0]

  // Calculate correlations
  const sleepCorrelation =
    historyData.filter((day) => day.sleepHours >= 7).reduce((sum, day) => sum + day.tradingResult, 0) /
    historyData.filter((day) => day.sleepHours >= 7).length

  const exerciseCorrelation =
    historyData.filter((day) => day.exercise).reduce((sum, day) => sum + day.tradingResult, 0) /
    historyData.filter((day) => day.exercise).length

  const noExerciseCorrelation =
    historyData.filter((day) => !day.exercise).reduce((sum, day) => sum + day.tradingResult, 0) /
    historyData.filter((day) => !day.exercise).length

  // Filter data based on timeframe
  const filteredData = timeframe === "week" ? historyData.slice(-7) : timeframe === "month" ? historyData : historyData

  // Prepare correlation data for scatter plot
  const correlationData = historyData.map((day) => ({
    mentalScore: day.mentalScore,
    tradingResult: day.tradingResult,
    date: day.shortDate,
    size: day.sleepHours * 4, // Size of dot based on sleep
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trading History & Analytics</h2>
          <p className="text-muted-foreground">Track your mental and trading performance over time</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a specific date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nejlepší mentální den</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestDay.formattedDate}</div>
            <p className="text-xs text-muted-foreground">Skóre: {bestDay.mentalScore}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nejziskovější den</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostProfitableDay.formattedDate}</div>
            <p className="text-xs text-muted-foreground">Zisk: ${mostProfitableDay.tradingResult}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spánek vs. Výsledky</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(sleepCorrelation)}</div>
            <p className="text-xs text-muted-foreground">Průměrný zisk při spánku 7+ hodin</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Přehled</TabsTrigger>
          <TabsTrigger value="charts">Grafy</TabsTrigger>
          <TabsTrigger value="correlations">Korelace</TabsTrigger>
          <TabsTrigger value="table">Tabulka</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vývoj mentálního skóre a obchodních výsledků</CardTitle>
              <CardDescription>Sledujte, jak vaše mentální příprava ovlivňuje vaše obchodování</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortDate" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="mentalScore"
                    name="Mentální skóre (%)"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tradingResult"
                    name="Obchodní výsledek ($)"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Klíčové poznatky</CardTitle>
                <CardDescription>Automaticky zjištěné vzorce ve vašich datech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Spánek</Badge>
                    <span>
                      Dny se spánkem 7+ hodin mají o{" "}
                      {Math.round(
                        (sleepCorrelation /
                          (historyData.reduce((sum, day) => sum + day.tradingResult, 0) / historyData.length) -
                          1) *
                          100,
                      )}
                      % lepší výsledky
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">Cvičení</Badge>
                    <span>
                      Dny s cvičením mají o {Math.round((exerciseCorrelation / noExerciseCorrelation - 1) * 100)}% lepší
                      výsledky než dny bez cvičení
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500">Nálada</Badge>
                    <span>Vaše nejlepší dny mají průměrnou náladu {bestDay.mood}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doporučení pro zlepšení</CardTitle>
                <CardDescription>Personalizované tipy na základě vašich dat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Activity className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Zaměřte se na cvičení</p>
                      <p className="text-sm text-muted-foreground">
                        Vaše data ukazují, že cvičení výrazně zlepšuje vaše výsledky
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Moon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Prioritizujte spánek</p>
                      <p className="text-sm text-muted-foreground">
                        7+ hodin spánku je spojeno s vašimi nejlepšími obchodními dny
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Mentální příprava funguje</p>
                      <p className="text-sm text-muted-foreground">
                        Dny s mentálním skóre nad 80% mají 2.3x lepší výsledky
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Vývoj mentálního skóre</CardTitle>
                <CardDescription>Sledujte svůj mentální vývoj v čase</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortDate" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mentalScore"
                      name="Mentální skóre (%)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Obchodní výsledky</CardTitle>
                <CardDescription>Vaše zisky a ztráty v průběhu času</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="tradingResult"
                      name="Obchodní výsledek ($)"
                      fill={(datum) => (datum.tradingResult >= 0 ? "#82ca9d" : "#ff7675")}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spánek a cvičení</CardTitle>
                <CardDescription>Sledujte své fyzické návyky</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sleepHours" name="Hodiny spánku" fill="#8884d8" />
                    <Bar
                      dataKey="exercise"
                      name="Cvičení"
                      fill="#82ca9d"
                      // Convert boolean to number for the chart
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nálada</CardTitle>
                <CardDescription>Vývoj vaší nálady v průběhu času</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortDate" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" name="Nálada (1-10)" stroke="#ff7675" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Korelace mentálního skóre a obchodních výsledků</CardTitle>
              <CardDescription>Jak vaše mentální příprava ovlivňuje vaše zisky</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="mentalScore"
                    name="Mentální skóre"
                    domain={[50, 100]}
                    label={{ value: "Mentální skóre (%)", position: "bottom" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="tradingResult"
                    name="Obchodní výsledek"
                    label={{ value: "Obchodní výsledek ($)", angle: -90, position: "left" }}
                  />
                  <ZAxis type="number" dataKey="size" range={[50, 400]} name="Spánek" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    formatter={(value, name, props) => {
                      if (name === "Obchodní výsledek") return [`$${value}`, name]
                      if (name === "Mentální skóre") return [`${value}%`, name]
                      return [value, name]
                    }}
                    labelFormatter={(label) => `Den: ${correlationData[label].date}`}
                  />
                  <Legend />
                  <Scatter name="Mentální skóre vs. Výsledky" data={correlationData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Velikost bodu indikuje množství spánku (větší = více spánku)
              </p>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Korelační tabulka</CardTitle>
                <CardDescription>Jak spolu souvisí různé faktory</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faktor</TableHead>
                      <TableHead>Korelace s výsledky</TableHead>
                      <TableHead>Síla vlivu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Mentální skóre</TableCell>
                      <TableCell>0.78</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Silná</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Spánek (7+ hodin)</TableCell>
                      <TableCell>0.65</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Silná</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cvičení</TableCell>
                      <TableCell>0.52</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500">Střední</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Nálada</TableCell>
                      <TableCell>0.48</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500">Střední</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nejsilnější vzorce</CardTitle>
                <CardDescription>Automaticky zjištěné vzorce ve vašich datech</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="p-3 border rounded-md">
                    <p className="font-medium">Když máte mentální skóre nad 80% a spíte 7+ hodin:</p>
                    <p className="text-sm text-green-500 font-medium">+82% lepší obchodní výsledky</p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <p className="font-medium">Když cvičíte a máte náladu 8+:</p>
                    <p className="text-sm text-green-500 font-medium">+65% lepší obchodní výsledky</p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <p className="font-medium">Když máte mentální skóre pod 70% a necvičíte:</p>
                    <p className="text-sm text-red-500 font-medium">-45% horší obchodní výsledky</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historie obchodních dnů</CardTitle>
              <CardDescription>Detailní přehled vašich obchodních dnů</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Mentální skóre</TableHead>
                    <TableHead>Spánek</TableHead>
                    <TableHead>Cvičení</TableHead>
                    <TableHead>Nálada</TableHead>
                    <TableHead>Výsledek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{day.formattedDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {day.mentalScore}%{day.mentalScore >= 80 && <Badge className="bg-green-500">Vysoké</Badge>}
                          {day.mentalScore < 60 && <Badge className="bg-red-500">Nízké</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{day.sleepHours} h</TableCell>
                      <TableCell>{day.exercise ? "Ano" : "Ne"}</TableCell>
                      <TableCell>{day.mood}/10</TableCell>
                      <TableCell className={day.tradingResult >= 0 ? "text-green-500" : "text-red-500"}>
                        ${day.tradingResult}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Exportovat jako PDF
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
