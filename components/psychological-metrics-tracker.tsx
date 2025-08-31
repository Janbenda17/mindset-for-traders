"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const metrics = [
  { name: "Disciplína", value: 85 },
  { name: "Trpělivost", value: 70 },
  { name: "Emocionální kontrola", value: 90 },
  { name: "Odolnost vůči stresu", value: 75 },
]

export function PsychologicalMetricsTracker() {
  const [period, setPeriod] = useState("month")

  // Sample data for psychological metrics over time
  const metricsOverTimeData = [
    { date: "Week 1", discipline: 65, patience: 70, confidence: 75, detachment: 60, focus: 80 },
    { date: "Week 2", discipline: 70, patience: 75, confidence: 80, detachment: 65, focus: 85 },
    { date: "Week 3", discipline: 60, patience: 65, confidence: 70, detachment: 55, focus: 75 },
    { date: "Week 4", discipline: 75, patience: 80, confidence: 85, detachment: 70, focus: 90 },
    { date: "Week 5", discipline: 80, patience: 85, confidence: 90, detachment: 75, focus: 95 },
    { date: "Week 6", discipline: 75, patience: 80, confidence: 85, detachment: 70, focus: 90 },
  ]

  // Sample data for emotional balance
  const emotionalBalanceData = [
    { date: "Mon", fear: 60, greed: 40, balance: 50 },
    { date: "Tue", fear: 45, greed: 55, balance: 60 },
    { date: "Wed", fear: 30, greed: 70, balance: 40 },
    { date: "Thu", fear: 50, greed: 50, balance: 70 },
    { date: "Fri", fear: 55, greed: 45, balance: 65 },
  ]

  // Sample data for psychological profile
  const psychologicalProfileData = [
    { metric: "Discipline", score: 75, optimal: 90 },
    { metric: "Patience", score: 80, optimal: 90 },
    { metric: "Confidence", score: 85, optimal: 85 },
    { metric: "Detachment", score: 70, optimal: 90 },
    { metric: "Focus", score: 90, optimal: 90 },
    { metric: "Adaptability", score: 65, optimal: 80 },
    { metric: "Resilience", score: 80, optimal: 90 },
  ]

  // Calculate current psychological metrics
  const currentMetrics = {
    discipline: metricsOverTimeData[metricsOverTimeData.length - 1].discipline,
    patience: metricsOverTimeData[metricsOverTimeData.length - 1].patience,
    confidence: metricsOverTimeData[metricsOverTimeData.length - 1].confidence,
    detachment: metricsOverTimeData[metricsOverTimeData.length - 1].detachment,
    focus: metricsOverTimeData[metricsOverTimeData.length - 1].focus,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sledování psychologických metrik</CardTitle>
          <CardDescription>Vizualizujte svůj pokrok v klíčových psychologických oblastech.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{metric.name}</p>
                <span className="text-sm text-muted-foreground">{metric.value}%</span>
              </div>
              <Progress value={metric.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Psychological Metrics Tracker</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Discipline</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{currentMetrics.discipline}%</div>
            <Progress value={currentMetrics.discipline} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patience</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{currentMetrics.patience}%</div>
            <Progress value={currentMetrics.patience} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{currentMetrics.confidence}%</div>
            <Progress value={currentMetrics.confidence} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Detachment</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{currentMetrics.detachment}%</div>
            <Progress value={currentMetrics.detachment} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Focus</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{currentMetrics.focus}%</div>
            <Progress value={currentMetrics.focus} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics Over Time</TabsTrigger>
          <TabsTrigger value="balance">Emotional Balance</TabsTrigger>
          <TabsTrigger value="profile">Psychological Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Psychological Metrics Over Time</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="discipline"
                      name="Discipline"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="patience" name="Patience" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#ffc658" />
                    <Line type="monotone" dataKey="detachment" name="Detachment" stroke="#ff7675" />
                    <Line type="monotone" dataKey="focus" name="Focus" stroke="#6c5ce7" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Emotional Balance Analysis</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emotionalBalanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="fear"
                      name="Fear Level"
                      fill="#ff7675"
                      stroke="#ff7675"
                      fillOpacity={0.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="greed"
                      name="Greed Level"
                      fill="#74b9ff"
                      stroke="#74b9ff"
                      fillOpacity={0.5}
                    />
                    <Line type="monotone" dataKey="balance" name="Emotional Balance" stroke="#6c5ce7" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Psychological Profile</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={psychologicalProfileData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Current Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Optimal Score" dataKey="optimal" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip formatter={(value) => `${value}%`} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Psychological Gap Analysis</h4>
                <div className="space-y-4">
                  {psychologicalProfileData.map((item) => (
                    <div key={item.metric} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.metric}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.score}% / {item.optimal}%
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                          <div
                            style={{ width: `${item.score}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                          ></div>
                          <div
                            style={{ width: `${item.optimal - item.score}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-muted-foreground/20"
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Psychological Insights</h3>
        <ul className="space-y-1 text-sm">
          <li>Your focus and confidence metrics are strongest, while detachment needs improvement</li>
          <li>Your emotional balance fluctuates mid-week, with greed overtaking fear</li>
          <li>Discipline and patience show steady improvement over the past 6 weeks</li>
          <li>Your psychological profile is closest to optimal in the focus dimension</li>
          <li>The largest gap in your profile is in the detachment dimension (20% below optimal)</li>
        </ul>
      </div>
    </div>
  )
}
