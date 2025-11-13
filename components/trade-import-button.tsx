"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useTradingIntegration } from "@/contexts/trading-integration-context"
import { TradingIntegrationModal } from "./trading-integration-modal"
import { useToast } from "@/hooks/use-toast"
import { getUserData, setUserData } from "@/utils/storage-utils"

export function TradeImportButton() {
  const { mt5Connected, importMT5Trades, isImporting } = useTradingIntegration()
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()

  const handleImport = async () => {
    if (!mt5Connected) {
      setShowModal(true)
      return
    }

    // Import trades from last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const trades = await importMT5Trades(startDate, endDate)

    if (trades.length > 0) {
      // Convert MT5 trades to journal entries
      const userData = getUserData()

      trades.forEach((trade) => {
        const entry = {
          id: `mt5-${trade.ticket}`,
          date: trade.closeTime,
          type: "trade" as const,
          title: `${trade.type.toUpperCase()} ${trade.symbol}`,
          content: trade.comment,
          pair: trade.symbol,
          direction: trade.type,
          entryPrice: trade.openPrice,
          exitPrice: trade.closePrice,
          quantity: trade.volume,
          pnl: trade.profit + trade.commission + trade.swap,
          profitLoss: trade.profit > 0 ? "profit" : "loss",
          tags: ["auto-imported", "mt5"],
        }

        // Check if entry already exists
        const exists = userData.journalEntries.some((e) => e.id === entry.id)
        if (!exists) {
          userData.journalEntries.push(entry)
        }
      })

      setUserData(userData)

      toast({
        title: "Trades Imported",
        description: `Successfully imported ${trades.length} trades to your journal.`,
      })
    }
  }

  return (
    <>
      <Button
        onClick={handleImport}
        disabled={isImporting}
        variant="outline"
        className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
      >
        {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        {mt5Connected ? "Import Trades" : "Connect Platform"}
      </Button>

      <TradingIntegrationModal open={showModal} onOpenChange={setShowModal} />
    </>
  )
}
