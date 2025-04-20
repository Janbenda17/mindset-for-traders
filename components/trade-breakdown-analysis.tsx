"use client"

import { useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TradeBreakdownAnalysis() {
  const [period, setPeriod] = useState("month")

  // Sample data for trade breakdown by asset class
  const assetClassData = [
    { name: "Stocks", value: 45, fill: "#0088FE" },
    { name: "Forex", value: 25, fill: "#00C49F" },
    { name: "Crypto", value: 20, fill: "#FFBB28" },
    { name: "Commodities", value: 10, fill: "#FF8042" },
  ]

  // Sample data for trade breakdown by time of day
  const timeOfDayData = [
    { name: "Pre-Market", wins: 12, losses: 8 },
    { name: "Morning", wins: 25, losses: 15 },
    { name: "Afternoon", wins: 18, losses: 22 },
    { name: "Evening", wins: 10, losses: 5 },
  ]

  // Sample data for trade breakdown by emotional state
  const emotionalStateData = [
    { state: "Calm", winRate: 72, avgReturn: 1.8, tradeCount: 35 },
    { state: "Focused", winRate: 68, avgReturn: 1.5, tradeCount: 42 },
    { state: "Anxious", winRate: 45, avgReturn: -0.7, tradeCount: 28 },
    { state: "Excited", winRate: 52, avgReturn: 0.3, tradeCount: 25 },
    { state: "Frustrated", winRate: 38, avgReturn: -1.2, tradeCount: 18 },
  ]

  // Sample data for trade breakdown by strategy
  const strategyData = [
    { name: "Trend Following", performance: 2.5, consistency: 75, emotionalDifficulty: 40 },
    { name: "Breakout", performance: 1.8, consistency: 65, emotionalDifficulty: 60 },
    { name: "Mean Reversion", performance: 3.2, consistency: 55, emotionalDifficulty: 80 },
    { name: "Momentum", performance: 2.1, consistency: 70, emotionalDifficulty: 50 },
    { name: "Scalping", performance: 1.2, consistency: 60, emotionalDifficulty: 85 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trade Breakdown Analysis</h3>
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

      <Tabs defaultValue="asset">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="asset">By Asset</TabsTrigger>
          <TabsTrigger value="time">By Time</TabsTrigger>
          <TabsTrigger value="emotion">By Emotion</TabsTrigger>
          <TabsTrigger value="strategy">By Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="asset" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Trade Distribution by Asset Class</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetClassData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assetClassData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} trades`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Performance by Asset Class</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Stocks", winRate: 65, avgReturn: 1.2 },
                        { name: "Forex", winRate: 58, avgReturn: 0.8 },
                        { name: "Crypto", winRate: 52, avgReturn: 2.1 },
                        { name: "Commodities", winRate: 60, avgReturn: 1.5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                      <Bar dataKey="avgReturn" name="Avg. Return (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Wins vs. Losses by Time of Day</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="wins" name="Wins" fill="#82ca9d" />
                      <Bar dataKey="losses" name="Losses" fill="#ff7675" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Win Rate by Day of Week</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Monday", winRate: 62 },
                        { name: "Tuesday", winRate: 58 },
                        { name: "Wednesday", winRate: 65 },
                        { name: "Thursday", winRate: 55 },
                        { name: "Friday", winRate: 50 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emotion" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Performance by Emotional State</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionalStateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="state" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                      <Bar dataKey="avgReturn" name="Avg. Return (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Trade Count by Emotional State</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emotionalStateData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ state, percent }) => `${state}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="tradeCount"
                      >
                        <Cell fill="#0088FE" />
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                        <Cell fill="#FF8042" />
                        <Cell fill="#FF6B6B" />
                      </Pie>
                      <Tooltip formatter={(value) => `${value} trades`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Strategy Performance Comparison</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strategyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="performance" name="Performance (%)" fill="#8884d8" />
                      <Bar dataKey="consistency" name="Consistency (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Strategy Psychological Profile</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={strategyData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Performance (%)"
                        dataKey="performance"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Emotional Difficulty (%)"
                        dataKey="emotionalDifficulty"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Key Insights</h3>
        <ul className="space-y-1 text-sm">
          <li>Your highest win rate occurs during morning trading sessions (62.5%)</li>
          <li>Emotional states of "Calm" and "Focused" correlate with significantly higher returns</li>
          <li>Mean Reversion strategy shows the highest performance but also high emotional difficulty</li>
          <li>Crypto trades have the highest average return but lower win rate than other asset classes</li>
        </ul>
      </div>
    </div>
  )
}
