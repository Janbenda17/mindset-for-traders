"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  ArrowRight,
  BarChart2,
  LineChartIcon,
  PieChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Lightbulb,
  Target,
  Zap,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUpIcon,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Star,
  Heart,
  Shield,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MindTrader() {
  const [activeTab, setActiveTab] = useState("overview")
  const [moodData, setMoodData] = useState([])
  const [tradeData, setTradeData] = useState([])
  const [correlationData, setCorrelationData] = useState([])
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const [quickPrompts] = useState([
    "Jak zvládnout ztrátu po špatném obchodu?",
    "Mám strach z dalšího obchodu, co dělat?",
    "Jak si udržet disciplínu při tradingu?",
    "Proč pořád porušuji svůj trading plán?",
    "Jak se zbavit FOMO při tradingu?",
    "Mám problém s risk managementem",
    "Jak zlepšit svou psychickou odolnost?",
    "Revenge trading - jak se tomu vyhnout?",
    "Jak správně nastavit stop loss?",
    "Kdy zvýšit velikost pozice?",
    "Jak analyzovat své chyby?",
    "Strategie pro stresové situace",
  ])

  // Load data from localStorage or use demo data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      try {
        // Check if user data exists in localStorage
        const userData = localStorage.getItem("user-data")
        const user = localStorage.getItem("user")

        if (userData && user) {
          const parsedUserData = JSON.parse(userData)
          const parsedUser = JSON.parse(user)

          // If this is a new user or data was reset, show zeros
          if (parsedUser.isDemo === false || (parsedUserData.metrics && parsedUserData.metrics.totalProfit === 0)) {
            // Use empty data for new users
            setMoodData([
              { date: "Pon", mood: 0, confidence: 0 },
              { date: "Úte", mood: 0, confidence: 0 },
              { date: "Stř", mood: 0, confidence: 0 },
              { date: "Čtv", mood: 0, confidence: 0 },
              { date: "Pát", mood: 0, confidence: 0 },
            ])

            setTradeData([
              { date: "Pon", profit: 0, trades: 0, winRate: 0 },
              { date: "Úte", profit: 0, trades: 0, winRate: 0 },
              { date: "Stř", profit: 0, trades: 0, winRate: 0 },
              { date: "Čtv", profit: 0, trades: 0, winRate: 0 },
              { date: "Pát", profit: 0, trades: 0, winRate: 0 },
            ])

            setInsights([
              "Zatím nemáte dostatek dat pro analýzu. Začněte zaznamenávat své obchody a náladu.",
              "Sledujte své obchodní vzorce pro získání přehledů.",
              "Zaznamenávejte svou náladu a sebedůvěru pro korelační analýzu.",
              "Používejte analytiky pro zlepšení svých obchodních rozhodnutí.",
            ])
          } else {
            // Use sample data for demo or existing users
            const moodDataSample = [
              { date: "Pon", mood: 8, confidence: 7 },
              { date: "Úte", mood: 6, confidence: 5 },
              { date: "Stř", mood: 4, confidence: 3 },
              { date: "Čtv", mood: 7, confidence: 6 },
              { date: "Pát", mood: 9, confidence: 8 },
            ]

            const tradeDataSample = [
              { date: "Pon", profit: 250, trades: 5, winRate: 80 },
              { date: "Úte", profit: 150, trades: 8, winRate: 62 },
              { date: "Stř", profit: -200, trades: 10, winRate: 40 },
              { date: "Čtv", profit: 180, trades: 6, winRate: 67 },
              { date: "Pát", profit: 320, trades: 4, winRate: 75 },
            ]

            const insightsSample = [
              "Vaše úspěšnost je o 25% vyšší v dny, kdy je vaše nálada nad 7 body",
              "Máte tendenci k přetradování (více než 8 obchodů denně), když je vaše sebedůvěra pod 5 body",
              "Vaše nejvyšší zisky korelují s vysokou náladou (8+) a střední sebedůvěrou (6-7)",
              "Zvažte pauzu, když vaše nálada klesne pod 5 bodů - historická data ukazují 70% ztrátových obchodů v tyto dny",
            ]

            setMoodData(moodDataSample)
            setTradeData(tradeDataSample)
            setInsights(insightsSample)
          }

          // Create correlation data
          const correlationData = moodData.map((item, index) => ({
            date: item.date,
            mood: item.mood,
            confidence: item.confidence,
            profit: tradeData[index]?.profit || 0,
            trades: tradeData[index]?.trades || 0,
            winRate: tradeData[index]?.winRate || 0,
          }))

          setCorrelationData(correlationData)
        } else {
          // Default to sample data if no user data exists
          const moodDataSample = [
            { date: "Pon", mood: 8, confidence: 7 },
            { date: "Úte", mood: 6, confidence: 5 },
            { date: "Stř", mood: 4, confidence: 3 },
            { date: "Čtv", mood: 7, confidence: 6 },
            { date: "Pát", mood: 9, confidence: 8 },
          ]

          const tradeDataSample = [
            { date: "Pon", profit: 250, trades: 5, winRate: 80 },
            { date: "Úte", profit: 150, trades: 8, winRate: 62 },
            { date: "Stř", profit: -200, trades: 10, winRate: 40 },
            { date: "Čtv", profit: 180, trades: 6, winRate: 67 },
            { date: "Pát", profit: 320, trades: 4, winRate: 75 },
          ]

          const correlationDataSample = moodDataSample.map((item, index) => ({
            date: item.date,
            mood: item.mood,
            confidence: item.confidence,
            profit: tradeDataSample[index].profit,
            trades: tradeDataSample[index].trades,
            winRate: tradeDataSample[index].winRate,
          }))

          const insightsSample = [
            "Vaše úspěšnost je o 25% vyšší v dny, kdy je vaše nálada nad 7 body",
            "Máte tendenci k přetradování (více než 8 obchodů denně), když je vaše sebedůvěra pod 5 body",
            "Vaše nejvyšší zisky korelují s vysokou náladou (8+) a střední sebedůvěrou (6-7)",
            "Zvažte pauzu, když vaše nálada klesne pod 5 bodů - historická data ukazují 70% ztrátových obchodů v tyto dny",
          ]

          setMoodData(moodDataSample)
          setTradeData(tradeDataSample)
          setCorrelationData(correlationDataSample)
          setInsights(insightsSample)
        }
      } catch (error) {
        console.error("Error loading MindTrader data:", error)
        // Fallback to empty data on error
        setMoodData([])
        setTradeData([])
        setCorrelationData([])
        setInsights([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Listen for storage events to update data when it changes
    window.addEventListener("storage", loadData)

    return () => {
      window.removeEventListener("storage", loadData)
    }
  }, [])

  // Calculate summary metrics
  const averageMood =
    moodData.length > 0 ? (moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length).toFixed(1) : "0.0"

  const totalProfit = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.profit, 0) : 0

  const averageWinRate =
    tradeData.length > 0
      ? (tradeData.reduce((sum, item) => sum + item.winRate, 0) / tradeData.length).toFixed(1)
      : "0.0"

  const totalTrades = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.trades, 0) : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Add user message to conversation
    const userMessage = { type: "user", content: prompt, timestamp: new Date() }
    setConversationHistory((prev) => [...prev, userMessage])

    // Simulate AI response with more sophisticated logic
    await new Promise((resolve) => setTimeout(resolve, 2500))

    let aiResponse = ""

    // Generate contextual response based on prompt content
    if (prompt.toLowerCase().includes("ztráta") || prompt.toLowerCase().includes("loss")) {
      aiResponse = `Rozumím, že prožíváte ztrátu. To je přirozenou součástí tradingu. Zde je můj personalizovaný plán pro vás:

🎯 **Okamžité kroky:**
1. **Zastavte trading na 24 hodin** - dejte si čas na zpracování
2. **Analyzujte obchod objektivně** - co bylo správně, co ne
3. **Zkontrolujte risk management** - dodrželi jste pravidla?

📊 **Na základě vašich dat:**
- Vaše průměrná nálada je ${averageMood}/10 - ${averageMood > 6 ? "dobré" : "potřebuje zlepšení"}
- Win rate ${averageWinRate}% je ${averageWinRate > 60 ? "solidní" : "potřebuje práci"}
- ${totalProfit >= 0 ? "Celkově jste v zisku" : "Pracujte na konzistentnosti"}

💡 **Doporučení:**
- Snižte velikost pozic o 50% na příštích 5 obchodů
- Používejte pouze A+ setupy podle vaší strategie
- Veďte si detailní deník emocí před každým obchodem

🧠 **Psychologická podpora:**
- Ztráty jsou součástí hry - i nejlepší tradeři mají win rate 60-70%
- Zaměřte se na proces, ne na výsledek jednotlivých obchodů
- Praktikujte mindfulness 10 minut denně

Pamatujte: Každý profesionální trader má ztráty. Klíčem je, jak na ně reagujete.`
    } else if (prompt.toLowerCase().includes("strach") || prompt.toLowerCase().includes("fear")) {
      aiResponse = `Strach je normální emoce v tradingu. Pojďme ho překonat systematicky:

🧠 **Psychologická analýza:**
Strach často vzniká z:
- Předchozích ztrát (${totalProfit < 0 ? "vidím, že máte záporný P&L" : "vaše výsledky jsou pozitivní"})
- Nejistoty v analýze
- Příliš velkého rizika na obchod

🛡️ **Strategie překonání strachu:**
1. **Micro-pozice** - začněte s 0.01 loty
2. **Demo trading** - obnovte si sebedůvěru
3. **Breathing exercise** - 4-7-8 technika před každým obchodem
4. **Positive visualization** - představte si úspěšný obchod

📈 **Postupné budování sebedůvěry:**
- Týden 1: Pouze demo + analýza
- Týden 2: Micro pozice (0.01)
- Týden 3: Malé pozice (0.05)
- Týden 4: Normální velikost

🎯 **Praktická cvičení:**
- Napište si 3 důvody, proč věříte ve svou strategii
- Vizualizujte úspěšný obchod každé ráno
- Používejte afirmace: "Jsem disciplinovaný trader"

Strach je ochranný mechanismus. Respektujte ho, ale nenechte ho ovládat vaše rozhodování.`
    } else if (prompt.toLowerCase().includes("disciplína") || prompt.toLowerCase().includes("plán")) {
      aiResponse = `Disciplína je základ úspěšného tradingu. Vytvořme systém pro její udržení:

📋 **Váš disciplinární plán:**
1. **Ranní rutina** (před otevřením trhů):
   - Přečtěte si svůj trading plán
   - Zkontrolujte ekonomický kalendář
   - Nastavte si denní risk limit

2. **Během tradingu:**
   - Checklist před každým obchodem
   - Stop loss VŽDY před vstupem
   - Žádné "jen se podívám" obchody

3. **Večerní review:**
   - Zhodnoťte dodržení pravidel
   - Zapište si emoce a ponaučení
   - Připravte se na další den

🎯 **Konkrétní pravidla pro vás:**
- Maximálně ${Math.max(3, Math.floor(totalTrades / 5))} obchodů denně
- Risk max 1% účtu na obchod
- Trading pouze v ${averageMood > 6 ? "dobré náladě (6+)" : "optimální náladě (7+)"}

💪 **Motivační systém:**
- 5 disciplinovaných dní = odměna
- Porušení pravidla = den pauzy
- Týdenní review s body za disciplínu

🔧 **Nástroje pro disciplínu:**
- Alarm pro konec trading session
- Automatické stop lossy
- Trading journal s hodnocením disciplíny

Disciplína není omezení - je to svoboda od emocí.`
    } else if (prompt.toLowerCase().includes("fomo")) {
      aiResponse = `FOMO (Fear of Missing Out) je jeden z největších nepřátel tradera. Pojďme ho porazit:

🚨 **Rozpoznání FOMO:**
- Rychlé rozhodování bez analýzy
- Vstup do obchodu "protože se trh hýbe"
- Pocit, že "musím být v trhu"
- Sledování cizích signálů místo vlastní analýzy

🛑 **Anti-FOMO strategie:**
1. **Pause Rule** - 5 minut čekání před každým obchodem
2. **Checklist** - všechny podmínky musí být splněny
3. **Opportunity Journal** - zapisujte "zmeškaté" příležitosti a sledujte, kolik jich skutečně bylo ziskových

📊 **Vaše FOMO analýza:**
- Průměrně ${totalTrades} obchodů týdně - ${totalTrades > 25 ? "možná příliš mnoho" : "rozumné množství"}
- Win rate ${averageWinRate}% - ${averageWinRate < 50 ? "FOMO může snižovat kvalitu" : "dobré filtrování"}

🎯 **Praktická cvičení:**
1. **Meditation** - 10 minut denně
2. **Missed Trade Log** - zapisujte "zmeškaté" obchody
3. **Quality over Quantity** - cíl: méně obchodů, vyšší kvalita

💡 **Mindset shift:**
"Trh bude tu i zítra. Lepší je počkat na perfektní setup než riskovat na průměrném."

🔄 **Denní rutina proti FOMO:**
- Ráno: Naplánujte max 3 obchody
- Během dne: Držte se plánu
- Večer: Zhodnoťte kvalitu vs kvantitu

Pamatujte: Nejlepší obchodníci často sedí a čekají.`
    } else if (prompt.toLowerCase().includes("stop loss") || prompt.toLowerCase().includes("sl")) {
      aiResponse = `Stop Loss je váš nejlepší přítel v tradingu. Zde je kompletní průvodce:

🎯 **Základní pravidla:**
1. **Vždy nastavte SL před vstupem** - nikdy ne až po otevření pozice
2. **Respektujte technické úrovně** - support/resistance, swing high/low
3. **Dodržujte risk management** - max 1-2% účtu na obchod

📊 **Metody nastavení SL:**
1. **Technický SL:**
   - Pod/nad klíčovou úrovní
   - Za swing high/low
   - Pod/nad moving average

2. **Procentní SL:**
   - Fixní % z entry ceny
   - Vhodné pro začátečníky

3. **ATR Stop Loss:**
   - Založený na volatilitě
   - 1.5-2x ATR od entry

💡 **Pro vaše data:**
- S win rate ${averageWinRate}% můžete použít širší SL
- ${totalProfit >= 0 ? "Vaše zisky ukazují dobré SL nastavení" : "Zkuste užší SL pro lepší R:R"}

🚫 **Časté chyby:**
- Posouvání SL proti sobě
- Příliš úzký SL (noise trading)
- Žádný SL "jen na chvilku"

Pamatujte: SL není selhání, je to pojistka!`
    } else if (prompt.toLowerCase().includes("pozice") || prompt.toLowerCase().includes("size")) {
      aiResponse = `Správná velikost pozice je klíčová pro dlouhodobý úspěch:

📏 **Základní pravidla:**
1. **Nikdy neriskujte více než 1-2% účtu** na jeden obchod
2. **Velikost pozice = Risk / (Entry - Stop Loss)**
3. **Začněte malými pozicemi** a postupně zvyšujte

🧮 **Výpočet pozice:**
Příklad: Účet $10,000, risk 1% = $100
Entry: $50, SL: $48, Risk per share: $2
Pozice: $100 / $2 = 50 akcií

📊 **Na základě vašich dat:**
- Win rate ${averageWinRate}% - ${averageWinRate > 60 ? "můžete zvážit mírně větší pozice" : "držte se konzervativních pozic"}
- ${totalProfit >= 0 ? "Vaše pozice fungují dobře" : "Zkuste menší pozice pro stabilitu"}

📈 **Postupné zvyšování:**
1. **Měsíc 1-3:** Max 0.5% risk
2. **Měsíc 4-6:** Max 1% risk
3. **Měsíc 7+:** Max 2% risk (jen pro zkušené)

⚠️ **Varování:**
- Nikdy "all-in" na jeden obchod
- Nezvyšujte pozice po ztrátách
- Respektujte své emocionální limity

Velikost pozice = kontrola nad riskem = dlouhodobý úspěch!`
    } else {
      // Generic response with more personality
      aiResponse = `Děkuji za vaši otázku! Jako váš AI trading kouč jsem tu, abych vám pomohl. Na základě analýzy vašich dat:

📊 **Vaše aktuální metriky:**
- Průměrná nálada: ${averageMood}/10 ${averageMood > 7 ? "🟢" : averageMood > 5 ? "🟡" : "🔴"}
- Win rate: ${averageWinRate}% ${averageWinRate > 60 ? "🎯" : "📈"}
- Celkový P&L: ${totalProfit >= 0 ? "+" : ""}${totalProfit} USD ${totalProfit >= 0 ? "💰" : "📉"}
- Počet obchodů: ${totalTrades} ${totalTrades > 20 ? "⚡" : "🎯"}

🎯 **Personalizovaná doporučení:**
${averageMood < 6 ? "• 🧠 Zaměřte se na zlepšení mentálního stavu před tradingem" : "• ✅ Vaše mentální stav je dobrý, udržujte současný přístup"}
${averageWinRate < 50 ? "• 📚 Pracujte na zlepšení kvality vstupů - analyzujte neúspěšné obchody" : "• 🎯 Vaše win rate je solidní, zaměřte se na optimalizaci R:R"}
${totalProfit < 0 ? "• 🛡️ Snižte velikost pozic a zaměřte se na konzistentnost" : "• 📈 Udržujte současný přístup a postupně zvyšujte pozice"}

💡 **Další kroky:**
1. 🔍 Analyzujte své nejlepší obchody a identifikujte společné vzorce
2. ✅ Vytvořte si checklist pro vstup do pozice
3. 📊 Pravidelně reviewujte své výsledky

🤖 **Tip:** Zkuste některou z rychlých otázek níže pro konkrétnější radu!

Jsem tu pro vás 24/7. Ptejte se na cokoliv ohledně trading psychologie! 🚀`
    }

    const aiMessage = { type: "ai", content: aiResponse, timestamp: new Date() }
    setConversationHistory((prev) => [...prev, aiMessage])
    setResponse(aiResponse)
    setPrompt("")
    setIsGenerating(false)
  }

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt)
  }

  const clearConversation = () => {
    setConversationHistory([])
    setResponse("")
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response)
    }
  }

  const exportConversation = () => {
    const conversationText = conversationHistory
      .map((msg) => `${msg.type === "user" ? "Vy" : "MindTrader AI"}: ${msg.content}`)
      .join("\n\n")

    const blob = new Blob([conversationText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindtrader-conversation-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Průměrná nálada</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{averageMood}/10</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={Number.parseFloat(averageMood) * 10} className="flex-1 h-2" />
              <Badge
                variant={
                  Number.parseFloat(averageMood) > 7
                    ? "default"
                    : Number.parseFloat(averageMood) > 5
                      ? "secondary"
                      : "destructive"
                }
              >
                {Number.parseFloat(averageMood) > 7
                  ? "Výborná"
                  : Number.parseFloat(averageMood) > 5
                    ? "Dobrá"
                    : "Potřebuje práci"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Celkový P&L</CardTitle>
            {totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalProfit >= 0 ? "+" : ""}${totalProfit}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={totalProfit >= 0 ? "default" : "destructive"}>
                {totalProfit >= 0 ? "Zisk" : "Ztráta"}
              </Badge>
              {totalProfit >= 0 && (
                <Badge variant="outline" className="text-green-600">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  Rostoucí
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{averageWinRate}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={Number.parseFloat(averageWinRate)} className="flex-1 h-2" />
              <Badge
                variant={
                  Number.parseFloat(averageWinRate) > 60
                    ? "default"
                    : Number.parseFloat(averageWinRate) > 45
                      ? "secondary"
                      : "destructive"
                }
              >
                {Number.parseFloat(averageWinRate) > 60
                  ? "Výborný"
                  : Number.parseFloat(averageWinRate) > 45
                    ? "Dobrý"
                    : "Slabý"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">Celkem obchodů</CardTitle>
            <BarChart2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{totalTrades}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">{Math.round(totalTrades / 5)} obchodů/den</Badge>
              <Badge variant={totalTrades > 25 ? "destructive" : totalTrades > 15 ? "secondary" : "default"}>
                {totalTrades > 25 ? "Vysoká frekvence" : totalTrades > 15 ? "Střední" : "Konzervativní"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Načítání..." : "Posledních 5 obchodních dní"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Přehled</TabsTrigger>
          <TabsTrigger value="mood">Analýza nálady</TabsTrigger>
          <TabsTrigger value="correlation">Korelace</TabsTrigger>
          <TabsTrigger value="ai" className="relative">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Kouč
            {conversationHistory.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">{conversationHistory.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Přehled obchodní výkonnosti
              </CardTitle>
              <CardDescription>Vaše obchodní výkonnost za posledních 5 obchodních dní</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <p>Načítání dat grafů...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      name="Zisk/Ztráta ($)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="winRate" name="Win Rate (%)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Personalizovaný insight</AlertTitle>
            <AlertDescription className="text-blue-700">
              {isLoading ? "Analyzuji vaše obchodní vzorce..." : insights[0]}
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Sledování nálady a sebedůvěry
              </CardTitle>
              <CardDescription>Váš psychologický stav během obchodních sezení</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <p>Načítání dat grafů...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" name="Nálada (1-10)" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="confidence" name="Sebedůvěra (1-10)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Psychologický insight</AlertTitle>
            <AlertDescription className="text-orange-700">
              {isLoading ? "Analyzuji vaše nálady..." : insights[1]}
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Korelace nálady a výkonnosti
              </CardTitle>
              <CardDescription>Jak váš psychologický stav ovlivňuje obchodní výsledky</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <p>Načítání dat grafů...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="profit" name="Zisk/Ztráta ($)" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="mood" name="Nálada (1-10)" stroke="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Korelační insight</AlertTitle>
              <AlertDescription className="text-green-700">
                {isLoading ? "Analyzuji korelace..." : insights[2]}
              </AlertDescription>
            </Alert>

            <Alert className="border-purple-200 bg-purple-50">
              <Target className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">Doporučení k akci</AlertTitle>
              <AlertDescription className="text-purple-700">
                {isLoading ? "Generuji doporučení..." : insights[3]}
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                MindTrader AI Kouč Pro
              </CardTitle>
              <CardDescription>
                Váš pokročilý AI kouč pro obchodní psychologii s hlubokým porozuměním vašim datům a emocím.
              </CardDescription>
              {conversationHistory.length > 0 && (
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {conversationHistory.length} zpráv v konverzaci
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={exportConversation}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearConversation}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Nová konverzace
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Features Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <Brain className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Psychologická analýza</h4>
                    <p className="text-xs text-blue-600">Hlubší porozumění emocím</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <Target className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">Personalizované rady</h4>
                    <p className="text-xs text-green-600">Na základě vašich dat</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <Star className="w-8 h-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-purple-800">24/7 dostupnost</h4>
                    <p className="text-xs text-purple-600">Vždy tu pro vás</p>
                  </div>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Rychlé otázky pro začátek:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickPrompts.slice(0, 8).map((quickPrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3 bg-transparent hover:bg-blue-50 border-blue-200"
                      onClick={() => handleQuickPrompt(quickPrompt)}
                      disabled={isGenerating}
                    >
                      <Zap className="w-3 h-3 mr-2 flex-shrink-0 text-blue-500" />
                      <span className="text-xs">{quickPrompt}</span>
                    </Button>
                  ))}
                </div>

                {quickPrompts.length > 8 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {quickPrompts.slice(8).map((quickPrompt, index) => (
                      <Button
                        key={index + 8}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2 px-3 bg-transparent hover:bg-purple-50 border-purple-200"
                        onClick={() => handleQuickPrompt(quickPrompt)}
                        disabled={isGenerating}
                      >
                        <Brain className="w-3 h-3 mr-2 flex-shrink-0 text-purple-500" />
                        <span className="text-xs">{quickPrompt}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversation History */}
              {conversationHistory.length > 0 && (
                <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white">
                  {conversationHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                            : "bg-white border border-gray-200 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.type === "ai" && <Brain className="w-4 h-4 text-purple-500" />}
                          {message.type === "user" && <Heart className="w-4 h-4 text-blue-200" />}
                          <span className="text-xs font-medium">
                            {message.type === "user" ? "Vy" : "MindTrader AI Pro"}
                          </span>
                          <span className={`text-xs ${message.type === "user" ? "text-blue-200" : "text-gray-500"}`}>
                            {message.timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Zeptejte se MindTrader AI Pro
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Popište svou obchodní situaci, emocionální stav, nebo se zeptejte na konkrétní radu... Čím více detailů, tím lepší odpověď dostanete! 🚀"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    disabled={isGenerating}
                    className="resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>💡 Tip: Buďte konkrétní pro nejlepší rady</span>
                    <span>{prompt.length}/1000</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzuji a generuji odpověď...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Získat personalizovanou radu od AI
                    </>
                  )}
                </Button>
              </form>

              {/* Latest Response */}
              {response && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      Nejnovější odpověď od MindTrader AI Pro
                    </Label>
                    <Button variant="ghost" size="sm" onClick={copyResponse}>
                      <Copy className="w-4 h-4 mr-2" />
                      Kopírovat
                    </Button>
                  </div>
                  <div className="p-6 border rounded-lg bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200 shadow-sm">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{response}</div>
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Bezpečné a soukromé</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <span>AI poháněné</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Personalizované</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <a href="/analytics/advanced">
            <Sparkles className="mr-2 h-4 w-4" />
            Pokročilé analytiky
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
