"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts"
import { getUserData } from "@/utils/storage-utils"

interface MoodEntry {
  id: string
  date: string
  mood: string
  confidence: number
  notes?: string
}

interface ChartDataPoint {
  date: string
  mood: number
  stress: number
  confidence: number
  fullDate: string
}

const MOOD_VALUES: Record<string, number> = {
  "Very Anxious": 1,
  Anxious: 2,
  Worried: 3,
  Neutral: 4,
  Calm: 5,
  Confident: 6,
  Optimistic: 7,
  "Very Optimistic": 8,
}

const MOOD_COLORS: Record<string, string> = {
  "Very Anxious": "#ef4444",
  Anxious: "#f97316",
  Worried: "#eab308",
  Neutral: "#6b7280",
  Calm: "#22c55e",
  Confident: "#3b82f6",
  Optimistic: "#8b5cf6",
  "Very Optimistic": "#06b6d4",
}

export function MoodTrendsChart({ data }: any[]) {
  const [moodData, setMoodData] = useState<MoodEntry[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Group by date and calculate averages
    const groupedByDate = data.reduce(
      (acc, entry) => {
        const date = entry.date
        if (!acc[date]) {
          acc[date] = {
            mood: [],
            confidence: [],
            stress: [],
          }
        }

        if (entry.mood) acc[date].mood.push(entry.mood)
        if (entry.confidenceLevel) acc[date].confidence.push(entry.confidenceLevel)
        if (entry.stressLevel) acc[date].stress.push(entry.stressLevel)

        return acc
      },
      {} as Record<string, any>,
    )

    return Object.entries(groupedByDate)
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString("cs-CZ", {
          month: "short",
          day: "numeric",
        }),
        mood:
          values.mood.length > 0 ? values.mood.reduce((a: number, b: number) => a + b, 0) / values.mood.length : null,
        confidence:
          values.confidence.length > 0
            ? values.confidence.reduce((a: number, b: number) => a + b, 0) / values.confidence.length
            : null,
        stress:
          values.stress.length > 0
            ? values.stress.reduce((a: number, b: number) => a + b, 0) / values.stress.length
            : null,
        fullDate: date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
  }, [data])

  useEffect(() => {
    loadMoodData()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadMoodData()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const loadMoodData = () => {
    const userData = getUserData()
    setMoodData(userData.moodEntries || [])
  }

  const getMoodDistribution = () => {
    const distribution = moodData.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(distribution).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / moodData.length) * 100),
    }))
  }

  const getConfidenceDistribution = () => {
    const ranges = {
      "Very Low (1-2)": 0,
      "Low (3-4)": 0,
      "Medium (5-6)": 0,
      "High (7-8)": 0,
      "Very High (9-10)": 0,
    }

    moodData.forEach((entry) => {
      const conf = entry.confidence
      if (conf <= 2) ranges["Very Low (1-2)"]++
      else if (conf <= 4) ranges["Low (3-4)"]++
      else if (conf <= 6) ranges["Medium (5-6)"]++
      else if (conf <= 8) ranges["High (7-8)"]++
      else ranges["Very High (9-10)"]++
    })

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
      percentage: moodData.length ? Math.round((count / moodData.length) * 100) : 0,
    }))
  }

  const getStatistics = () => {
    if (!moodData.length) return null

    const moodValues = moodData.map((entry) => MOOD_VALUES[entry.mood] || 4)
    const confidenceValues = moodData.map((entry) => entry.confidence)

    const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length
    const avgConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length

    const mostCommonMood = getMoodDistribution().sort((a, b) => b.count - a.count)[0]

    return {
      totalEntries: moodData.length,
      averageMood: avgMood.toFixed(1),
      averageConfidence: avgConfidence.toFixed(1),
      mostCommonMood: mostCommonMood?.mood || "N/A",
    }
  }

  const stats = getStatistics()

  if (!moodData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trendy nálady</CardTitle>
          <CardDescription>Sledujte své emocionální stavy v průběhu času.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No mood data available. Start logging your mood to see trends.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trendy nálady</CardTitle>
        <CardDescription>Sledujte své emocionální stavy v průběhu času.</CardDescription>
        <div className="flex gap-2">
          <Badge
            variant={timeRange === "7d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("7d")}
          >
            7 Days
          </Badge>
          <Badge
            variant={timeRange === "30d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("30d")}
          >
            30 Days
          </Badge>
          <Badge
            variant={timeRange === "90d" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTimeRange("90d")}
          >
            90 Days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} tick={{ fill: "#666" }} />
                  <YAxis domain={[0, 10]} fontSize={12} tick={{ fill: "#666" }} />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      const labels = {
                        mood: "Nálada",
                        confidence: "Sebedůvěra",
                        stress: "Stres",
                      }
                      return [value ? `${value.toFixed(1)}/10` : "N/A", labels[name as keyof typeof labels] || name]
                    }}
                    labelFormatter={(label) => `Datum: ${label}`}
                  />
                  <Area type="monotone" dataKey="mood" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="stress"
                    stackId="3"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMoodDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mood" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Confidence Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getConfidenceDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.totalEntries}</div>
                    <p className="text-xs text-muted-foreground">Total Entries</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.averageMood}</div>
                    <p className="text-xs text-muted-foreground">Average Mood</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.averageConfidence}</div>
                    <p className="text-xs text-muted-foreground">Average Confidence</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-bold">{stats.mostCommonMood}</div>
                    <p className="text-xs text-muted-foreground">Most Common Mood</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mood Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getMoodDistribution().map(({ mood, count, percentage }) => (
                    <div key={mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: MOOD_COLORS[mood] || "#6b7280" }}
                        />
                        <span className="text-sm">{mood}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
