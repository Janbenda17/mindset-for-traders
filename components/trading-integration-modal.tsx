"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTradingIntegration } from "@/contexts/trading-integration-context"
import { TrendingUp, Activity, Loader2 } from "lucide-react"

interface TradingIntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TradingIntegrationModal({ open, onOpenChange }: TradingIntegrationModalProps) {
  const { mt5Connected, connectMT5, tvConnected, connectTV } = useTradingIntegration()

  // MT5 Form
  const [mt5AccountId, setMt5AccountId] = useState("")
  const [mt5Server, setMt5Server] = useState("")
  const [mt5Login, setMt5Login] = useState("")
  const [mt5Password, setMt5Password] = useState("")
  const [mt5Loading, setMt5Loading] = useState(false)

  // TradingView Form
  const [tvApiKey, setTvApiKey] = useState("")
  const [tvLoading, setTvLoading] = useState(false)

  const handleMT5Connect = async () => {
    setMt5Loading(true)
    try {
      await connectMT5(mt5AccountId, mt5Server, mt5Login, mt5Password)
      onOpenChange(false)
    } finally {
      setMt5Loading(false)
    }
  }

  const handleTVConnect = async () => {
    setTvLoading(true)
    try {
      await connectTV(tvApiKey)
      onOpenChange(false)
    } finally {
      setTvLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Connect Trading Platform</DialogTitle>
          <DialogDescription className="text-slate-400">
            Connect your trading platform to automatically import trades and charts.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metatrader" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="metatrader" className="data-[state=active]:bg-slate-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              MetaTrader 5
            </TabsTrigger>
            <TabsTrigger value="tradingview" className="data-[state=active]:bg-slate-700">
              <Activity className="w-4 h-4 mr-2" />
              TradingView
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metatrader" className="space-y-4 mt-4">
            {mt5Connected ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Already Connected</h3>
                <p className="text-sm text-slate-400">Your MetaTrader 5 account is connected.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mt5-account" className="text-slate-200">
                    Account ID
                  </Label>
                  <Input
                    id="mt5-account"
                    placeholder="12345678"
                    value={mt5AccountId}
                    onChange={(e) => setMt5AccountId(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mt5-server" className="text-slate-200">
                    Server
                  </Label>
                  <Input
                    id="mt5-server"
                    placeholder="MetaQuotes-Demo"
                    value={mt5Server}
                    onChange={(e) => setMt5Server(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mt5-login" className="text-slate-200">
                    Login
                  </Label>
                  <Input
                    id="mt5-login"
                    placeholder="Your MT5 login"
                    value={mt5Login}
                    onChange={(e) => setMt5Login(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mt5-password" className="text-slate-200">
                    Password
                  </Label>
                  <Input
                    id="mt5-password"
                    type="password"
                    placeholder="Your MT5 password"
                    value={mt5Password}
                    onChange={(e) => setMt5Password(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button
                  onClick={handleMT5Connect}
                  disabled={mt5Loading || !mt5AccountId || !mt5Server || !mt5Login || !mt5Password}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {mt5Loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Connect MetaTrader 5
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  Your credentials are encrypted and stored securely.
                </p>
              </>
            )}
          </TabsContent>

          <TabsContent value="tradingview" className="space-y-4 mt-4">
            {tvConnected ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Already Connected</h3>
                <p className="text-sm text-slate-400">Your TradingView account is connected.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tv-api-key" className="text-slate-200">
                    API Key
                  </Label>
                  <Input
                    id="tv-api-key"
                    type="password"
                    placeholder="Enter your TradingView API key"
                    value={tvApiKey}
                    onChange={(e) => setTvApiKey(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-400">Get your API key from TradingView Settings → API Access</p>
                </div>

                <Button
                  onClick={handleTVConnect}
                  disabled={tvLoading || !tvApiKey}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {tvLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Connect TradingView
                </Button>

                <p className="text-xs text-slate-400 text-center">Your API key is encrypted and stored securely.</p>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
