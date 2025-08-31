import { MindTraderPro } from "@/components/mindtrader-pro"

export default function MindTraderProPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">MindTrader AI Pro</h1>
      <p className="text-muted-foreground">Váš osobní AI kouč pro obchodní psychologii s pokročilými funkcemi.</p>
      <MindTraderPro />
    </div>
  )
}
