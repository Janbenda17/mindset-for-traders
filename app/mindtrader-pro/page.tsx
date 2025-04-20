import { MindTraderPro } from "@/components/mindtrader-pro"

export default function MindTraderProPage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">MindTrader PRO</h1>
        <p className="text-muted-foreground">Professional mental training system for traders with expert guidance</p>
      </div>

      <MindTraderPro />
    </div>
  )
}
