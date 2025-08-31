"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const patterns = [
  { name: "Reversal na podpoře", frequency: "Vysoká", impact: "Pozitivní" },
  { name: "Breakout selhání", frequency: "Střední", impact: "Negativní" },
  { name: "Trend pokračování (flag)", frequency: "Vysoká", impact: "Pozitivní" },
  { name: "Dvojitý vrchol", frequency: "Nízká", impact: "Negativní" },
]

export function TradingPatternsDetector() {
  const [period, setPeriod] = useState("month")

  // Sample data for behavioral patterns
  const behavioralPatterns = [
    { name: "Overtrading", frequency: 35, impact: -2.5, emotionalTrigger: "Anxiety" },
    { name: "Moving Stops", frequency: 28, impact: -1.8, emotionalTrigger: "Fear" },
    { name: "Early Exit", frequency: 42, impact: -1.2, emotionalTrigger: "Impatience" },
    { name: "FOMO Entry", frequency: 30, impact: -2.2, emotionalTrigger: "Greed" },
    { name: "Revenge Trading", frequency: 15, impact: -3.5, emotionalTrigger: "Anger" },
  ]

  // Sample data for market condition patterns
  const marketPatterns = [
    { condition: "High Volatility", winRate: 45, avgReturn: -0.8, emotionalScore: 4.5 },
    { condition: "Low Volatility", winRate: 68, avgReturn: 1.5, emotionalScore: 7.2 },
    { condition: "Trending Market", winRate: 72, avgReturn: 2.1, emotionalScore: 7.8 },
    { condition: "Ranging Market", winRate: 58, avgReturn: 0.7, emotionalScore: 6.5 },
    { condition: "News Events", winRate: 40, avgReturn: -1.2, emotionalScore: 3.8 },
  ]

  // Sample data for time-based patterns
  const timePatterns = [
    { time: "Monday Morning", trades: 15, winRate: 60, emotionalScore: 7.2 },
    { time: "Friday Afternoon", trades: 18, winRate: 45, emotionalScore: 5.5 },
    { time: "Mid-Week", trades: 25, winRate: 68, emotionalScore: 7.5 },
    { time: "Market Open", trades: 22, winRate: 55, emotionalScore: 6.2 },
    { time: "Market Close", trades: 20, winRate: 50, emotionalScore: 5.8 },
  ]

  // Sample data for success patterns
  const successPatterns = [
    { pattern: "Morning Preparation", adherence: 75, impact: 2.2 },
    { pattern: "Strict Stop Loss", adherence: 68, impact: 1.8 },
    { pattern: "Trading Journal", adherence: 82, impact: 2.5 },
    { pattern: "Emotional Check-in", adherence: 60, impact: 1.5 },
    { pattern: "Post-Trade Review", adherence: 55, impact: 1.2 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Trading Pattern Analysis</h3>
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

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Behavioral Pattern</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Early Exit</div>
                <p className="text-xs text-muted-foreground">Triggered by: Impatience</p>
              </div>
              <Badge variant="destructive">-1.2% Impact</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Market Condition</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Trending Market</div>
                <p className="text-xs text-muted-foreground">Win Rate: 72%</p>
              </div>
              <Badge variant="default" className="bg-green-500">
                +2.1% Return
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="behavioral">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="market">Market Conditions</TabsTrigger>
          <TabsTrigger value="time">Time-Based</TabsTrigger>
          <TabsTrigger value="success">Success Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="behavioral" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Behavioral Pattern Analysis</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={behavioralPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="frequency" name="Frequency (%)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="impact" name="Performance Impact (%)" fill="#ff7675" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h5 className="font-medium mb-2">Emotional Triggers</h5>
                <div className="flex flex-wrap gap-2">
                  {behavioralPatterns.map((pattern) => (
                    <div key={pattern.name} className="flex items-center gap-2 border rounded-md p-2">
                      <span className="font-medium">{pattern.name}:</span>
                      <Badge variant="outline">{pattern.emotionalTrigger}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Market Condition Analysis</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="condition" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                    <Bar dataKey="avgReturn" name="Avg. Return (%)" fill="#82ca9d" />
                    <Bar dataKey="emotionalScore" name="Emotional Score (1-10)" fill="#ffd166" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Time-Based Pattern Analysis</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timePatterns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                      <Bar dataKey="emotionalScore" name="Emotional Score (1-10)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Trade Distribution by Time</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timePatterns}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ time, percent }) => `${time}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="trades"
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

        <TabsContent value="success" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Success Pattern Analysis</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={successPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pattern" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="adherence" name="Adherence (%)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="impact" name="Performance Impact (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Pattern Detection Insights</h3>
        <ul className="space-y-1 text-sm">
          <li>Early exits due to impatience are your most common behavioral pattern</li>
          <li>You perform best in trending markets with a 72% win rate</li>
          <li>Mid-week trading shows your highest win rate and emotional score</li>
          <li>Consistent journaling has the strongest positive impact on your performance</li>
          <li>High volatility markets correlate with lower emotional scores and performance</li>
        </ul>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detektor obchodních vzorců</CardTitle>
          <CardDescription>Identifikujte opakující se vzorce ve vašem obchodování.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patterns.map((pattern) => (
              <div key={pattern.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{pattern.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Frekvence: {pattern.frequency} | Dopad: {pattern.impact}
                  </p>
                </div>
                <Badge variant={pattern.impact === "Pozitivní" ? "default" : "destructive"}>{pattern.impact}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
