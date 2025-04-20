import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedPerformanceMetrics } from "@/components/advanced-performance-metrics"
import { TradeBreakdownAnalysis } from "@/components/trade-breakdown-analysis"
import { RiskManagementAnalyzer } from "@/components/risk-management-analyzer"
import { PsychologicalMetricsTracker } from "@/components/psychological-metrics-tracker"
import { TradingPatternsDetector } from "@/components/trading-patterns-detector"

export default function AdvancedAnalyticsPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">Deep analysis of your trading performance and psychological patterns</p>
      </div>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="breakdown">Trade Breakdown</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Trading Patterns</TabsTrigger>
          <TabsTrigger value="psychological">Psychological</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Performance Metrics</CardTitle>
              <CardDescription>
                Comprehensive analysis of your trading performance correlated with psychological factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedPerformanceMetrics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Trade Breakdown Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your trades by various factors including time, asset class, and emotional state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TradeBreakdownAnalysis />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Analyzer</CardTitle>
              <CardDescription>
                Analyze how your risk management practices correlate with your emotional state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskManagementAnalyzer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Trading Patterns Detector</CardTitle>
              <CardDescription>
                Identify recurring patterns in your trading behavior and their relationship to market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TradingPatternsDetector />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="psychological">
          <Card>
            <CardHeader>
              <CardTitle>Psychological Metrics Tracker</CardTitle>
              <CardDescription>
                Track key psychological metrics over time and their impact on your trading performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PsychologicalMetricsTracker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
