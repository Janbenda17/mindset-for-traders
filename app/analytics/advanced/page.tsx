import { AdvancedPerformanceMetrics } from "@/components/advanced-performance-metrics"
import { TradeBreakdownAnalysis } from "@/components/trade-breakdown-analysis"
import { RiskManagementAnalyzer } from "@/components/risk-management-analyzer"
import { PsychologicalMetricsTracker } from "@/components/psychological-metrics-tracker"
import { TradingPatternsDetector } from "@/components/trading-patterns-detector"

export default function AdvancedAnalyticsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Pokročilá analýza</h1>
      <p className="text-muted-foreground">Hlubší pohled na vaše obchodní a psychologické metriky.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdvancedPerformanceMetrics />
        <TradeBreakdownAnalysis />
        <RiskManagementAnalyzer />
        <TradingPatternsDetector />
        <PsychologicalMetricsTracker />
      </div>
    </div>
  )
}
