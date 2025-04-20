import { MindTrader } from "@/components/mindtrader"

export default function MindTraderPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">MindTrader Dashboard</h1>
        <p className="text-muted-foreground">
          Integrate your trading data with psychological insights for improved performance
        </p>
      </div>

      <MindTrader />
    </div>
  )
}
