"use client"

import { useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RiskManagementAnalyzer() {
  const [period, setPeriod] = useState("month")

  // Sample data for risk metrics over time
  const riskOverTimeData = [
    { date: "Week 1", riskRewardRatio: 1.5, maxDrawdown: 2.1, winRate: 60, emotionalScore: 7.2 },
    { date: "Week 2", riskRewardRatio: 1.8, maxDrawdown: 1.8, winRate: 65, emotionalScore: 7.5 },
    { date: "Week 3", riskRewardRatio: 1.2, maxDrawdown: 3.2, winRate: 52, emotionalScore: 5.8 },
    { date: "Week 4", riskRewardRatio: 2.1, maxDrawdown: 1.5, winRate: 68, emotionalScore: 8.1 },
    { date: "Week 5", riskRewardRatio: 1.7, maxDrawdown: 2.3, winRate: 62, emotionalScore: 7.0 },
    { date: "Week 6", riskRewardRatio: 1.3, maxDrawdown: 2.8, winRate: 55, emotionalScore: 6.2 },
  ]

  // Sample data for position sizing analysis
  const positionSizingData = [
    { size: "1% of Capital", winRate: 65, avgReturn: 1.2, emotionalDifficulty: 3 },
    { size: "2% of Capital", winRate: 62, avgReturn: 1.8, emotionalDifficulty: 4 },
    { size: "3% of Capital", winRate: 58, avgReturn: 2.2, emotionalDifficulty: 6 },
    { size: "5% of Capital", winRate: 52, avgReturn: 2.5, emotionalDifficulty: 8 },
    { size: ">5% of Capital", winRate: 45, avgReturn: 3.0, emotionalDifficulty: 9 },
  ]

  // Sample data for risk vs. emotional state
  const riskEmotionData = [
    { emotionalScore: 9, riskTaken: 1.2, performance: 1.5, trades: 5 },
    { emotionalScore: 8, riskTaken: 1.5, performance: 1.8, trades: 8 },
    { emotionalScore: 7, riskTaken: 1.8, performance: 1.5, trades: 12 },
    { emotionalScore: 6, riskTaken: 2.2, performance: 1.0, trades: 15 },
    { emotionalScore: 5, riskTaken: 2.5, performance: 0.5, trades: 18 },
    { emotionalScore: 4, riskTaken: 3.0, performance: -0.8, trades: 22 },
    { emotionalScore: 3, riskTaken: 3.5, performance: -1.5, trades: 25 },
  ]

  const riskData = [
    { metric: "Průměrné R-násobky", value: "1.5R" },
    { metric: "Největší ztráta (R)", value: "-2.5R" },
    { metric: "Největší zisk (R)", value: "5.0R" },
    { metric: "Risk/Reward Ratio", value: "1:2.5" },
    { metric: "Počet po sobě jdoucích ztrát", value: "4" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyzátor řízení rizik</CardTitle>
          <CardDescription>Vyhodnoťte efektivitu vašeho řízení rizik.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metrika</TableHead>
                <TableHead className="text-right">Hodnota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskData.map((item) => (
                <TableRow key={item.metric}>
                  <TableCell>{item.metric}</TableCell>
                  <TableCell className="text-right font-medium">{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Risk Management Analysis</h3>
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

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Risk-Reward Ratio</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">1.7:1</div>
            <p className="text-xs text-muted-foreground">Target: 2:1 or higher</p>
            <Progress value={85} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">Target: Under 5%</p>
            <Progress value={64} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Consistency</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">Target: 90%+</p>
            <Progress value={72} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overtime">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overtime">Risk Over Time</TabsTrigger>
          <TabsTrigger value="sizing">Position Sizing</TabsTrigger>
          <TabsTrigger value="emotion">Risk vs. Emotion</TabsTrigger>
        </TabsList>

        <TabsContent value="overtime" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Risk Metrics Over Time</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="riskRewardRatio"
                      name="Risk-Reward Ratio"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="maxDrawdown" name="Max Drawdown (%)" stroke="#ff7675" />
                    <Line type="monotone" dataKey="emotionalScore" name="Emotional Score (1-10)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sizing" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Position Sizing Analysis</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={positionSizingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="size" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                    <Bar dataKey="avgReturn" name="Avg. Return (%)" fill="#82ca9d" />
                    <Bar dataKey="emotionalDifficulty" name="Emotional Difficulty (1-10)" fill="#ff7675" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotion" className="pt-4">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Risk vs. Emotional State</h4>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis
                      type="number"
                      dataKey="emotionalScore"
                      name="Emotional Score"
                      domain={[0, 10]}
                      label={{ value: "Emotional Score (1-10)", position: "bottom" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="riskTaken"
                      name="Risk Taken"
                      label={{ value: "Risk Taken (%)", angle: -90, position: "left" }}
                    />
                    <ZAxis type="number" dataKey="performance" range={[50, 400]} name="Performance" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => {
                        if (name === "Performance") return [`${value.toFixed(2)}%`, name]
                        return [value, name]
                      }}
                    />
                    <Legend />
                    <Scatter name="Risk vs. Emotion" data={riskEmotionData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Risk Management Insights</h3>
        <ul className="space-y-1 text-sm">
          <li>Your risk-reward ratio decreases as your emotional score drops below 6</li>
          <li>Position sizes above 3% of capital significantly increase emotional difficulty</li>
          <li>Your best performance occurs with a risk-reward ratio between 1.5-2.0</li>
          <li>Higher emotional scores correlate with more disciplined risk management</li>
          <li>Trading frequency increases as emotional score decreases, suggesting potential overtrading</li>
        </ul>
      </div>
    </div>
  )
}
