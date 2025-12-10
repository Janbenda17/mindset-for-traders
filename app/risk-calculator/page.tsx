"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  AlertTriangle,
  Info,
  Copy,
  Check,
  BarChart3,
  Lock,
  Zap,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/data-context"
import Link from "next/link"

const instruments = {
  forex: [
    { symbol: "EUR/USD", pipValue: 10, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "GBP/USD", pipValue: 10, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "USD/JPY", pipValue: 9.1, pipSize: 0.01, lotSize: 100000 },
    { symbol: "USD/CHF", pipValue: 10.2, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "AUD/USD", pipValue: 10, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "USD/CAD", pipValue: 7.6, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "NZD/USD", pipValue: 10, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "EUR/GBP", pipValue: 12.7, pipSize: 0.0001, lotSize: 100000 },
    { symbol: "EUR/JPY", pipValue: 9.1, pipSize: 0.01, lotSize: 100000 },
    { symbol: "GBP/JPY", pipValue: 9.1, pipSize: 0.01, lotSize: 100000 },
  ],
  crypto: [
    { symbol: "BTC/USD", pipValue: 1, pipSize: 1, lotSize: 1 },
    { symbol: "ETH/USD", pipValue: 1, pipSize: 0.1, lotSize: 1 },
    { symbol: "XRP/USD", pipValue: 1, pipSize: 0.0001, lotSize: 1 },
    { symbol: "SOL/USD", pipValue: 1, pipSize: 0.01, lotSize: 1 },
  ],
  indices: [
    { symbol: "US30 (Dow)", pipValue: 1, pipSize: 1, lotSize: 1 },
    { symbol: "US100 (Nasdaq)", pipValue: 1, pipSize: 0.25, lotSize: 1 },
    { symbol: "US500 (S&P)", pipValue: 1, pipSize: 0.25, lotSize: 1 },
    { symbol: "GER40 (DAX)", pipValue: 1, pipSize: 0.1, lotSize: 1 },
  ],
  commodities: [
    { symbol: "XAU/USD (Gold)", pipValue: 1, pipSize: 0.01, lotSize: 100 },
    { symbol: "XAG/USD (Silver)", pipValue: 5, pipSize: 0.001, lotSize: 5000 },
    { symbol: "WTI (Oil)", pipValue: 1, pipSize: 0.01, lotSize: 1000 },
    { symbol: "BRENT (Oil)", pipValue: 1, pipSize: 0.01, lotSize: 1000 },
  ],
  stocks: [
    { symbol: "AAPL", pipValue: 1, pipSize: 0.01, lotSize: 1 },
    { symbol: "TSLA", pipValue: 1, pipSize: 0.01, lotSize: 1 },
    { symbol: "NVDA", pipValue: 1, pipSize: 0.01, lotSize: 1 },
    { symbol: "META", pipValue: 1, pipSize: 0.01, lotSize: 1 },
    { symbol: "GOOGL", pipValue: 1, pipSize: 0.01, lotSize: 1 },
    { symbol: "AMZN", pipValue: 1, pipSize: 0.01, lotSize: 1 },
  ],
}

const allInstruments = [
  ...instruments.forex,
  ...instruments.crypto,
  ...instruments.indices,
  ...instruments.commodities,
  ...instruments.stocks,
]

export default function RiskCalculatorPage() {
  const { toast } = useToast()
  const { isLiveMode } = useData()
  const [copied, setCopied] = useState(false)

  const [accountBalance, setAccountBalance] = useState(10000)

  useEffect(() => {
    // Load balance from trader profile
    const profile = localStorage.getItem("trader-mindset-profile")
    if (profile) {
      try {
        const parsed = JSON.parse(profile)
        if (parsed.accountSize) {
          setAccountBalance(Number(parsed.accountSize))
        }
      } catch (e) {
        console.error("Error parsing profile:", e)
      }
    }
  }, [])

  const [selectedInstrument, setSelectedInstrument] = useState("EUR/USD")
  const [instrumentCategory, setInstrumentCategory] = useState<keyof typeof instruments>("forex")
  const [customPipValue, setCustomPipValue] = useState<number | null>(null)

  const [riskPercent, setRiskPercent] = useState(1)
  const [entryPrice, setEntryPrice] = useState(1.085)
  const [stopLossPips, setStopLossPips] = useState(20)
  const [takeProfitPips, setTakeProfitPips] = useState(40)

  const [compoundStartBalance, setCompoundStartBalance] = useState(10000)
  const [compoundMonthlyReturn, setCompoundMonthlyReturn] = useState(5)
  const [compoundMonths, setCompoundMonths] = useState(12)
  const [compoundMonthlyDeposit, setCompoundMonthlyDeposit] = useState(0)

  const [drawdownStartBalance, setDrawdownStartBalance] = useState(10000)
  const [drawdownPercent, setDrawdownPercent] = useState(20)
  const [consecutiveLosses, setConsecutiveLosses] = useState(5)
  const [riskPerTrade, setRiskPerTrade] = useState(2)

  // Load compound start balance from profile too
  useEffect(() => {
    const profile = localStorage.getItem("trader-mindset-profile")
    if (profile) {
      try {
        const parsed = JSON.parse(profile)
        if (parsed.accountSize) {
          setCompoundStartBalance(Number(parsed.accountSize))
          setDrawdownStartBalance(Number(parsed.accountSize))
        }
      } catch (e) {
        console.error("Error parsing profile:", e)
      }
    }
  }, [])

  const currentInstrument = allInstruments.find((i) => i.symbol === selectedInstrument) || allInstruments[0]
  const pipValue = customPipValue || currentInstrument.pipValue
  const pipSize = currentInstrument.pipSize
  const lotSize = currentInstrument.lotSize

  const riskAmount = accountBalance * (riskPercent / 100)
  const stopLossPrice = entryPrice - stopLossPips * pipSize
  const takeProfitPrice = entryPrice + takeProfitPips * pipSize
  const positionSizeLots = stopLossPips > 0 ? riskAmount / (stopLossPips * pipValue) : 0
  const positionSizeUnits = positionSizeLots * lotSize
  const potentialLoss = riskAmount
  const potentialProfit = positionSizeLots * takeProfitPips * pipValue
  const riskRewardRatio = stopLossPips > 0 ? takeProfitPips / stopLossPips : 0
  const winRateNeeded = riskRewardRatio > 0 ? (1 / (1 + riskRewardRatio)) * 100 : 0

  const compoundResults = useMemo(() => {
    const results = []
    let balance = compoundStartBalance
    for (let month = 1; month <= compoundMonths; month++) {
      const monthlyGain = balance * (compoundMonthlyReturn / 100)
      balance = balance + monthlyGain + compoundMonthlyDeposit
      results.push({
        month,
        balance: balance,
        totalDeposits: compoundStartBalance + compoundMonthlyDeposit * month,
        profit: balance - compoundStartBalance - compoundMonthlyDeposit * month,
      })
    }
    return results
  }, [compoundStartBalance, compoundMonthlyReturn, compoundMonths, compoundMonthlyDeposit])

  const finalCompoundBalance = compoundResults[compoundResults.length - 1]?.balance || compoundStartBalance
  const totalCompoundProfit = finalCompoundBalance - compoundStartBalance - compoundMonthlyDeposit * compoundMonths
  const totalCompoundReturn = ((finalCompoundBalance - compoundStartBalance) / compoundStartBalance) * 100

  const drawdownResults = useMemo(() => {
    const results = []
    let balance = drawdownStartBalance
    for (let trade = 1; trade <= consecutiveLosses; trade++) {
      const loss = balance * (riskPerTrade / 100)
      balance = balance - loss
      const drawdownSoFar = ((drawdownStartBalance - balance) / drawdownStartBalance) * 100
      results.push({
        trade,
        balanceAfter: balance,
        lossAmount: loss,
        drawdownPercent: drawdownSoFar,
      })
    }
    return results
  }, [drawdownStartBalance, consecutiveLosses, riskPerTrade])

  const worstDrawdown = drawdownResults[drawdownResults.length - 1]?.drawdownPercent || 0
  const balanceAfterDrawdown = drawdownResults[drawdownResults.length - 1]?.balanceAfter || drawdownStartBalance
  const recoveryNeeded = ((drawdownStartBalance - balanceAfterDrawdown) / balanceAfterDrawdown) * 100

  // Recovery from specific drawdown
  const recoveryFromDrawdown = useMemo(() => {
    const lostAmount = drawdownStartBalance * (drawdownPercent / 100)
    const remainingBalance = drawdownStartBalance - lostAmount
    const recoveryPercent = (lostAmount / remainingBalance) * 100
    return recoveryPercent
  }, [drawdownStartBalance, drawdownPercent])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Zkopírováno",
      description: "Hodnota byla zkopírována do schránky",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const getRiskColor = (percent: number) => {
    if (percent <= 1) return "text-green-400"
    if (percent <= 2) return "text-yellow-400"
    if (percent <= 3) return "text-orange-400"
    return "text-red-400"
  }

  const getRRColor = (ratio: number) => {
    if (ratio >= 3) return "text-green-400"
    if (ratio >= 2) return "text-blue-400"
    if (ratio >= 1) return "text-yellow-400"
    return "text-red-400"
  }

  const handleCategoryChange = (category: keyof typeof instruments) => {
    setInstrumentCategory(category)
    setSelectedInstrument(instruments[category][0].symbol)
    if (category === "forex") setEntryPrice(1.085)
    else if (category === "crypto") setEntryPrice(45000)
    else if (category === "indices") setEntryPrice(18500)
    else if (category === "commodities") setEntryPrice(2050)
    else if (category === "stocks") setEntryPrice(185)
  }

  if (!isLiveMode) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto relative z-10 pt-20">
          <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Risk Kalkulátor je dostupný pouze v Live režimu</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Pro přístup k profesionálním nástrojům pro výpočet velikosti pozice, compound growth a drawdown analýzu
                musíte přepnout na Live režim.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                  >
                    Zpět na Dashboard
                  </Button>
                </Link>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Přepnout na Live režim
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Risk Management Tools</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Risk{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Kalkulátor</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Profesionální nástroje pro výpočet velikosti pozice, risk/reward a compound growth
          </p>
        </div>

        <Tabs defaultValue="position" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-slate-800/50 border border-slate-700/50 p-1 rounded-xl">
            <TabsTrigger value="position" className="data-[state=active]:bg-blue-600 rounded-lg">
              <Target className="w-4 h-4 mr-2" />
              Velikost Pozice
            </TabsTrigger>
            <TabsTrigger value="compound" className="data-[state=active]:bg-blue-600 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Compound
            </TabsTrigger>
            <TabsTrigger value="drawdown" className="data-[state=active]:bg-blue-600 rounded-lg">
              <TrendingDown className="w-4 h-4 mr-2" />
              Drawdown
            </TabsTrigger>
          </TabsList>

          {/* Position Size Calculator */}
          <TabsContent value="position" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Vstupní Parametry
                  </CardTitle>
                  <CardDescription>Zadejte parametry obchodu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Kategorie trhu</Label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(instruments) as Array<keyof typeof instruments>).map((cat) => (
                        <Button
                          key={cat}
                          variant={instrumentCategory === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryChange(cat)}
                          className={
                            instrumentCategory === cat
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-slate-600 text-gray-300 hover:bg-slate-700"
                          }
                        >
                          {cat === "forex"
                            ? "Forex"
                            : cat === "crypto"
                              ? "Krypto"
                              : cat === "indices"
                                ? "Indexy"
                                : cat === "commodities"
                                  ? "Komodity"
                                  : "Akcie"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Instrument / Pár</Label>
                    <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                        <SelectValue placeholder="Vyberte instrument" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {instruments[instrumentCategory].map((inst) => (
                          <SelectItem
                            key={inst.symbol}
                            value={inst.symbol}
                            className="text-white hover:bg-slate-700 focus:bg-slate-700"
                          >
                            {inst.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Pip Value: ${pipValue} | Pip Size: {pipSize} | Lot Size: {lotSize.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Velikost účtu ($)</Label>
                      <span className="text-xs text-blue-400">Z profilu</span>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        value={accountBalance}
                        onChange={(e) => setAccountBalance(Number(e.target.value))}
                        className="pl-9 bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Risk na obchod (%)</Label>
                      <span className={`font-bold ${getRiskColor(riskPercent)}`}>{riskPercent}%</span>
                    </div>
                    <Slider
                      value={[riskPercent]}
                      onValueChange={([v]) => setRiskPercent(v)}
                      max={10}
                      min={0.25}
                      step={0.25}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.25% (Konzervativní)</span>
                      <span>10% (Agresivní)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Entry Price</Label>
                    <Input
                      type="number"
                      step={pipSize}
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(Number(e.target.value))}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Stop Loss (pips)</Label>
                      <Input
                        type="number"
                        value={stopLossPips}
                        onChange={(e) => setStopLossPips(Number(e.target.value))}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                      <p className="text-xs text-gray-500">SL Price: {stopLossPrice.toFixed(pipSize < 0.01 ? 5 : 2)}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Take Profit (pips)</Label>
                      <Input
                        type="number"
                        value={takeProfitPips}
                        onChange={(e) => setTakeProfitPips(Number(e.target.value))}
                        className="bg-slate-900/50 border-slate-600 text-white"
                      />
                      <p className="text-xs text-gray-500">
                        TP Price: {takeProfitPrice.toFixed(pipSize < 0.01 ? 5 : 2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Výsledky Výpočtu
                  </CardTitle>
                  <CardDescription>{selectedInstrument}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Velikost Pozice</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(positionSizeLots.toFixed(2))}
                        className="h-6 px-2"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{positionSizeLots.toFixed(2)} lots</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {positionSizeUnits.toLocaleString()} units | ${(positionSizeUnits * entryPrice).toFixed(2)}{" "}
                      hodnota
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Max. Ztráta</p>
                      <p className="text-xl font-bold text-red-400">-${potentialLoss.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{stopLossPips} pips</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Potenciální Zisk</p>
                      <p className="text-xl font-bold text-green-400">+${potentialProfit.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{takeProfitPips} pips</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400">Risk:Reward Ratio</span>
                      <span className={`text-2xl font-bold ${getRRColor(riskRewardRatio)}`}>
                        1:{riskRewardRatio.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                        style={{
                          width: `${Math.min(riskRewardRatio * 25, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Špatný (1:1)</span>
                      <span>Dobrý (1:2)</span>
                      <span>Výborný (1:3+)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300 text-sm">Min. Win Rate pro profit</span>
                    </div>
                    <span className="text-purple-400 font-bold">{winRateNeeded.toFixed(1)}%</span>
                  </div>

                  {riskPercent > 2 && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                      <p className="text-orange-300 text-sm">
                        Risk nad 2% je považován za agresivní. Doporučujeme 0.5-1% pro konzistentní trading.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compound" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Compound Growth Kalkulátor
                  </CardTitle>
                  <CardDescription>Simulace růstu účtu s compound efektem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Počáteční kapitál ($)</Label>
                      <span className="text-xs text-green-400">Z profilu</span>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        value={compoundStartBalance}
                        onChange={(e) => setCompoundStartBalance(Number(e.target.value))}
                        className="pl-9 bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Měsíční výnos (%)</Label>
                      <span className="text-green-400 font-bold">{compoundMonthlyReturn}%</span>
                    </div>
                    <Slider
                      value={[compoundMonthlyReturn]}
                      onValueChange={([v]) => setCompoundMonthlyReturn(v)}
                      max={20}
                      min={1}
                      step={0.5}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1% (Konzervativní)</span>
                      <span>20% (Agresivní)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Počet měsíců</Label>
                      <span className="text-blue-400 font-bold">{compoundMonths} měsíců</span>
                    </div>
                    <Slider
                      value={[compoundMonths]}
                      onValueChange={([v]) => setCompoundMonths(v)}
                      max={60}
                      min={1}
                      step={1}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 měsíc</span>
                      <span>5 let</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Měsíční vklad ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        value={compoundMonthlyDeposit}
                        onChange={(e) => setCompoundMonthlyDeposit(Number(e.target.value))}
                        className="pl-9 bg-slate-900/50 border-slate-600 text-white"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Volitelný pravidelný měsíční vklad</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Projekce Růstu
                  </CardTitle>
                  <CardDescription>Za {compoundMonths} měsíců</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">Konečný Zůstatek</p>
                    <p className="text-3xl font-bold text-green-400">
                      ${finalCompoundBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">+{totalCompoundReturn.toFixed(1)}% celkový výnos</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Čistý Zisk</p>
                      <p className="text-xl font-bold text-blue-400">
                        +${totalCompoundProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Celkové Vklady</p>
                      <p className="text-xl font-bold text-purple-400">
                        $
                        {(compoundStartBalance + compoundMonthlyDeposit * compoundMonths).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Průběh po měsících</p>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                      {compoundResults.map((r) => (
                        <div
                          key={r.month}
                          className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg text-sm"
                        >
                          <span className="text-gray-400">Měsíc {r.month}</span>
                          <span className="text-green-400 font-medium">
                            ${r.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <p className="text-yellow-300 text-sm">
                      Toto je teoretická projekce. Reálné výsledky se mohou lišit v závislosti na tržních podmínkách.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="drawdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    Drawdown Analyzér
                  </CardTitle>
                  <CardDescription>Analýza dopadu ztrátových sérií</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Velikost účtu ($)</Label>
                      <span className="text-xs text-red-400">Z profilu</span>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="number"
                        value={drawdownStartBalance}
                        onChange={(e) => setDrawdownStartBalance(Number(e.target.value))}
                        className="pl-9 bg-slate-900/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Risk na obchod (%)</Label>
                      <span className={`font-bold ${getRiskColor(riskPerTrade)}`}>{riskPerTrade}%</span>
                    </div>
                    <Slider
                      value={[riskPerTrade]}
                      onValueChange={([v]) => setRiskPerTrade(v)}
                      max={10}
                      min={0.5}
                      step={0.5}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-300">Počet ztrátových obchodů za sebou</Label>
                      <span className="text-red-400 font-bold">{consecutiveLosses}x</span>
                    </div>
                    <Slider
                      value={[consecutiveLosses]}
                      onValueChange={([v]) => setConsecutiveLosses(v)}
                      max={20}
                      min={1}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="p-4 bg-slate-900/50 rounded-xl space-y-3">
                    <p className="text-gray-300 text-sm font-medium">Recovery Kalkulačka</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-gray-400 text-sm">Drawdown (%)</Label>
                        <span className="text-red-400 font-bold">{drawdownPercent}%</span>
                      </div>
                      <Slider
                        value={[drawdownPercent]}
                        onValueChange={([v]) => setDrawdownPercent(v)}
                        max={90}
                        min={5}
                        step={5}
                        className="py-2"
                      />
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">
                        Pro návrat z {drawdownPercent}% drawdownu potřebujete
                      </p>
                      <p className="text-xl font-bold text-orange-400">+{recoveryFromDrawdown.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Analýza Ztrátové Série
                  </CardTitle>
                  <CardDescription>
                    {consecutiveLosses}x ztráta s {riskPerTrade}% riskem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-gray-400 text-sm mb-2">Maximální Drawdown</p>
                    <p className="text-3xl font-bold text-red-400">-{worstDrawdown.toFixed(1)}%</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Zůstatek: ${balanceAfterDrawdown.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Ztraceno</p>
                      <p className="text-xl font-bold text-orange-400">
                        -$
                        {(drawdownStartBalance - balanceAfterDrawdown).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Pro Recovery</p>
                      <p className="text-xl font-bold text-yellow-400">+{recoveryNeeded.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Průběh drawdownu</p>
                    <div className="space-y-1">
                      {drawdownResults.map((r) => (
                        <div
                          key={r.trade}
                          className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">#{r.trade}</span>
                            <span className="text-red-400">-${r.lossAmount.toFixed(0)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">
                              ${r.balanceAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-red-400 text-xs">-{r.drawdownPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                    <p className="text-red-300 text-sm">
                      {riskPerTrade > 2
                        ? "Vysoký risk! S tímto nastavením můžete rychle ztratit významnou část účtu."
                        : "Pamatujte: I s nízkým riskem může série ztrát být psychicky náročná."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
