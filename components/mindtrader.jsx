"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { AlertCircle, ArrowRight, BarChart2, LineChartIcon, PieChart, TrendingUp, TrendingDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MindTrader() {
  const [activeTab, setActiveTab] = useState("overview")
  const [moodData, setMoodData] = useState([])
  const [tradeData, setTradeData] = useState([])
  const [correlationData, setCorrelationData] = useState([])
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulated data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const moodDataSample = [
        { date: "Mon", mood: 8, confidence: 7 },
        { date: "Tue", mood: 6, confidence: 5 },
        { date: "Wed", mood: 4, confidence: 3 },
        { date: "Thu", mood: 7, confidence: 6 },
        { date: "Fri", mood: 9, confidence: 8 },
      ]

      const tradeDataSample = [
        { date: "Mon", profit: 250, trades: 5, winRate: 80 },
        { date: "Tue", profit: 150, trades: 8, winRate: 62 },
        { date: "Wed", profit: -200, trades: 10, winRate: 40 },
        { date: "Thu", profit: 180, trades: 6, winRate: 67 },
        { date: "Fri", profit: 320, trades: 4, winRate: 75 },
      ]

      const correlationDataSample = moodDataSample.map((item, index) => ({
        date: item.date,
        mood: item.mood,
        confidence: item.confidence,
        profit: tradeDataSample[index].profit,
        trades: tradeDataSample[index].trades,
        winRate: tradeDataSample[index].winRate,
      }))

      const insightsSample = [
        "Your win rate is 25% higher on days when your mood score is above 7",
        "You tend to overtrade (more than 8 trades per day) when your confidence is below 5",
        "Your highest profits correlate with high mood (8+) and moderate confidence (6-7)",
        "Consider taking a break when your mood score falls below 5 - historical data shows 70% of trades are losses on these days",
      ]

      setMoodData(moodDataSample)
      setTradeData(tradeDataSample)
      setCorrelationData(correlationDataSample)
      setInsights(insightsSample)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Calculate summary metrics
  const averageMood =
    moodData.length > 0 ? (moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length).toFixed(1) : "N/A"

  const totalProfit = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.profit, 0) : 0

  const averageWinRate =
    tradeData.length > 0
      ? (tradeData.reduce((sum, item) => sum + item.winRate, 0) / tradeData.length).toFixed(1)
      : "N/A"

  const totalTrades = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.trades, 0) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMood}/10</div>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Last 5 trading days"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              ${totalProfit}
            </div>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Last 5 trading days"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWinRate}%</div>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Last 5 trading days"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading..." : "Last 5 trading days"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood Analysis</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Performance Overview</CardTitle>
              <CardDescription>Your trading performance over the last 5 trading days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Profit/Loss ($)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="winRate" name="Win Rate (%)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mindset Insight</AlertTitle>
            <AlertDescription>{isLoading ? "Analyzing your trading patterns..." : insights[0]}</AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood and Confidence Tracking</CardTitle>
              <CardDescription>Your psychological state during trading sessions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" name="Mood (1-10)" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="confidence" name="Confidence (1-10)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mindset Insight</AlertTitle>
            <AlertDescription>{isLoading ? "Analyzing your mood patterns..." : insights[1]}</AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood-Performance Correlation</CardTitle>
              <CardDescription>How your psychological state affects trading results</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="profit" name="Profit/Loss ($)" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="mood" name="Mood (1-10)" stroke="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Correlation Insight</AlertTitle>
              <AlertDescription>{isLoading ? "Analyzing correlations..." : insights[2]}</AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Recommendation</AlertTitle>
              <AlertDescription>{isLoading ? "Generating recommendations..." : insights[3]}</AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button asChild>
          <a href="/analytics/advanced">
            View Advanced Analytics
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
