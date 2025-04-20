import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoodPerformanceCorrelation } from "@/components/mood-performance-correlation"
import { TradingConsistencyChart } from "@/components/trading-consistency-chart"
import { EmotionalPatterns } from "@/components/emotional-patterns"

export default function AnalyticsPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mindset Analytics</h1>
        <p className="text-muted-foreground">Analyze the relationship between your mindset and trading performance</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Emotional Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood vs. Performance</CardTitle>
                <CardDescription>Correlation between your emotional state and trading results</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <MoodPerformanceCorrelation />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Consistency</CardTitle>
                <CardDescription>How your mindset affects trading discipline</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TradingConsistencyChart />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Mindset Summary</CardTitle>
                <CardDescription>Track your psychological progress over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Monthly summary visualization will appear here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mood">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Mood Analysis</CardTitle>
              <CardDescription>Insights into how your emotions affect your trading decisions</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">Detailed mood analysis visualization will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Trading Patterns</CardTitle>
              <CardDescription>Identify recurring emotional responses to market conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <EmotionalPatterns />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
