import { TradingTracker } from "@/components/trading-tracker"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getTradingData } from "@/utils/storage-utils"
import { formatDateTime } from "@/utils/date-utils"
import { Badge } from "@/components/ui/badge"

export default function TradingTrackerPage() {
  const tradingEntries = getTradingData()

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Obchodní deník</h1>
      <p className="text-muted-foreground">Zaznamenejte a sledujte své obchody pro lepší analýzu.</p>

      <TradingTracker />

      <Card>
        <CardHeader>
          <CardTitle>Poslední obchody</CardTitle>
          <CardDescription>Přehled vašich nedávných obchodních záznamů.</CardDescription>
        </CardHeader>
        <CardContent>
          {tradingEntries.length === 0 ? (
            <p className="text-center text-muted-foreground">Zatím žádné obchodní záznamy.</p>
          ) : (
            <div className="grid gap-4">
              {tradingEntries.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <div>
                    <p className="text-sm font-medium">{entry.symbol}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.type === "long" ? "default" : "secondary"}>{entry.type}</Badge>
                    <Badge
                      variant={
                        entry.outcome === "profit" ? "default" : entry.outcome === "loss" ? "destructive" : "outline"
                      }
                    >
                      {entry.outcome}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Zisk/Ztráta: ${entry.profitLoss.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Vstup: {entry.entryPrice} | Výstup: {entry.exitPrice}
                    </p>
                  </div>
                  {entry.notes && (
                    <div className="md:col-span-3 text-sm text-muted-foreground mt-2">
                      <p className="font-medium">Poznámky:</p>
                      <p>{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
