"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { metatraderAPI, type MT5Trade } from "@/lib/trading-platforms/metatrader"
import { tradingviewAPI, type TradingViewChart } from "@/lib/trading-platforms/tradingview"
import { useToast } from "@/hooks/use-toast"

interface TradingIntegrationContextType {
  // MetaTrader
  mt5Connected: boolean
  connectMT5: (accountId: string, server: string, login: string, password: string) => Promise<boolean>
  disconnectMT5: () => Promise<void>
  importMT5Trades: (startDate: Date, endDate: Date) => Promise<MT5Trade[]>

  // TradingView
  tvConnected: boolean
  connectTV: (apiKey: string) => Promise<boolean>
  disconnectTV: () => Promise<void>
  fetchTVCharts: () => Promise<TradingViewChart[]>

  // General
  isImporting: boolean
  lastImportTime: Date | null
}

const TradingIntegrationContext = createContext<TradingIntegrationContextType | undefined>(undefined)

export function TradingIntegrationProvider({ children }: { children: React.ReactNode }) {
  const [mt5Connected, setMt5Connected] = useState(false)
  const [tvConnected, setTvConnected] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [lastImportTime, setLastImportTime] = useState<Date | null>(null)
  const { toast } = useToast()

  const connectMT5 = useCallback(
    async (accountId: string, server: string, login: string, password: string) => {
      try {
        const success = await metatraderAPI.connect(accountId, server, login, password)
        setMt5Connected(success)

        if (success) {
          toast({
            title: "MetaTrader 5 Connected",
            description: "Successfully connected to your MT5 account.",
          })
        }

        return success
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MetaTrader 5. Please check your credentials.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const disconnectMT5 = useCallback(async () => {
    await metatraderAPI.disconnect()
    setMt5Connected(false)
    toast({
      title: "Disconnected",
      description: "MetaTrader 5 has been disconnected.",
    })
  }, [toast])

  const importMT5Trades = useCallback(
    async (startDate: Date, endDate: Date) => {
      setIsImporting(true)
      try {
        const trades = await metatraderAPI.fetchTrades(startDate, endDate)
        setLastImportTime(new Date())

        toast({
          title: "Import Successful",
          description: `Imported ${trades.length} trades from MetaTrader 5.`,
        })

        return trades
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import trades from MetaTrader 5.",
          variant: "destructive",
        })
        return []
      } finally {
        setIsImporting(false)
      }
    },
    [toast],
  )

  const connectTV = useCallback(
    async (apiKey: string) => {
      try {
        const success = await tradingviewAPI.connect(apiKey)
        setTvConnected(success)

        if (success) {
          toast({
            title: "TradingView Connected",
            description: "Successfully connected to TradingView.",
          })
        }

        return success
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to TradingView. Please check your API key.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const disconnectTV = useCallback(async () => {
    await tradingviewAPI.disconnect()
    setTvConnected(false)
    toast({
      title: "Disconnected",
      description: "TradingView has been disconnected.",
    })
  }, [toast])

  const fetchTVCharts = useCallback(async () => {
    try {
      const charts = await tradingviewAPI.fetchCharts()
      return charts
    } catch (error) {
      toast({
        title: "Fetch Failed",
        description: "Failed to fetch charts from TradingView.",
        variant: "destructive",
      })
      return []
    }
  }, [toast])

  return (
    <TradingIntegrationContext.Provider
      value={{
        mt5Connected,
        connectMT5,
        disconnectMT5,
        importMT5Trades,
        tvConnected,
        connectTV,
        disconnectTV,
        fetchTVCharts,
        isImporting,
        lastImportTime,
      }}
    >
      {children}
    </TradingIntegrationContext.Provider>
  )
}

export function useTradingIntegration() {
  const context = useContext(TradingIntegrationContext)
  if (context === undefined) {
    throw new Error("useTradingIntegration must be used within a TradingIntegrationProvider")
  }
  return context
}
