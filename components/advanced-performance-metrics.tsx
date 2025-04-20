"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdvancedPerformanceMetrics() {
  const [timeframe, setTimeframe] = useState("month")

  // Sample data - in a real app this would come from an API or database
  const monthlyData = [
    { date: "Jan", performance: 2.3, winRate: 62, tradeCount: 45, emotionalScore: 7.2 },
    { date: "Feb", performance: 1.7, winRate: 58, tradeCount: 38, emotionalScore: 6.8 },
    { date: "Mar", performance: -0.8, winRate: 43, tradeCount: 52, emotionalScore: 4.5 },
    { date: "Apr", performance: 3.2, winRate: 67, tradeCount: 41, emotionalScore: 8.1 },
    { date: "May", performance: 2.1, winRate: 61, tradeCount: 39, emotionalScore: 7.5 },
    { date: "Jun", performance: -1.2, winRate: 40, tradeCount: 48, emotionalScore: 4.2 },
  ]

  const weeklyData = [
    { date: "Week 1", performance: 0.8, winRate: 60, tradeCount: 10, emotionalScore: 7.0 },
    { date: "Week 2", performance: 1.2, winRate: 65, tradeCount: 12, emotionalScore: 7.5 },
    { date: "Week 3", performance: -0.5, winRate: 45, tradeCount: 11, emotionalScore: 5.0 },
    { date: "Week 4", performance: 1.5, winRate: 70, tradeCount: 10, emotionalScore: 8.0 },
  ]

  const data = timeframe === "month" ? monthlyData : weeklyData

  // Calculate key metrics
  const averagePerformance = data.reduce((sum, item) => sum + item.performance, 0) / data.length
  const averageWinRate = data.reduce((sum, item) => sum + item.winRate, 0) / data.length
  const totalTrades = data.reduce((sum, item) => sum + item.tradeCount, 0)
  const averageEmotionalScore = data.reduce((sum, item) => sum + item.emotionalScore, 0) / data.length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Performance Overview</h3>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{averagePerformance.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{averageWinRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{totalTrades}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emotional Score</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{averageEmotionalScore.toFixed(1)}/10</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="performance"
                  name="Performance (%)"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="winRate" name="Win Rate (%)" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="performance" name="Performance (%)" stroke="#8884d8" yAxisId="left" />
                <Line
                  type="monotone"
                  dataKey="emotionalScore"
                  name="Emotional Score (1-10)"
                  stroke="#ff7300"
                  yAxisId="right"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="combined" className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar dataKey="tradeCount" name="Trade Count" fill="#8884d8" yAxisId="right" />
                <Line type="monotone" dataKey="performance" name="Performance (%)" stroke="#ff7300" yAxisId="left" />
                <Area
                  type="monotone"
                  dataKey="emotionalScore"
                  name="Emotional Score"
                  fill="#82ca9d"
                  stroke="#82ca9d"
                  yAxisId="left"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Key Insights</h3>
        <ul className="space-y-1 text-sm">
          <li>Your performance is strongly correlated with your emotional score (r=0.87)</li>
          <li>Trading volume increases during periods of lower emotional scores</li>
          <li>Your best performance occurs when your emotional score is above 7.0</li>
          <li>Win rate drops significantly when emotional score falls below 5.0</li>
        </ul>
      </div>
    </div>
  )
}
