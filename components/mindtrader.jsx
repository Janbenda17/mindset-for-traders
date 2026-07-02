"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  ArrowRight,
  BarChart2,
  TrendingUp,
  Brain,
  Target,
  Zap,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Heart,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Crown,
  Lock,
  Rocket,
  AlertCircle,
} from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useSubscription } from "@/contexts/subscription-context"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [aiPersonality, setAiPersonality] = useState("calm")
  const [sessionMode, setSessionMode] = useState("coach")
  const [userMood, setUserMood] = useState(7)
  const [userStress, setUserStress] = useState(4)
  const [userEnergy, setUserEnergy] = useState(7)
  const [userConfidence, setUserConfidence] = useState(7)
  const [apiError, setApiError] = useState(null)

  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const { plan, isActive } = useSubscription()

  const isPremium = plan === "premium" && isActive

  const [quickPrompts] = useState([
    "Jak zvládnout ztrátu po špatném obchodu?",
    "Mám strach z dalšího obchodu, co dělat?",
    "Jak si udržet disciplínu při tradingu?",
    "Proč pořád porušuji svůj trading plán?",
    "Jak se zbavit FOMO při tradingu?",
    "Mám problém s risk managementem",
    "Jak zlepšit svou psychickou odolnost?",
    "Revenge trading - jak se tomu vyhnout?",
  ])

  const premiumFeatures = [
    { text: "Unlimited AI conversations", icon: MessageSquare },
    { text: "Advanced personality modes", icon: Brain },
    { text: "Voice recognition & TTS", icon: Volume2 },
    { text: "Session history export", icon: Download },
    { text: "Priority AI processing", icon: Zap },
    { text: "Custom AI training", icon: Target },
  ]

  const aiPersonalities = {
    calm: {
      name: "🧘 Calm Mentor",
      description: "Klidný a terapeutický přístup",
      color: "from-blue-500 to-indigo-500",
      icon: Heart,
      locked: false,
    },
    strict: {
      name: "⚡ Strict Coach",
      description: "Přímý a výkonnostní",
      color: "from-red-500 to-orange-500",
      icon: Target,
      locked: !isPremium,
    },
    analytical: {
      name: "🔬 Analytical Expert",
      description: "Datově orientovaný",
      color: "from-purple-500 to-pink-500",
      icon: BarChart2,
      locked: !isPremium,
    },
    balanced: {
      name: "💬 Balanced Coach",
      description: "Kombinace empatie a výkonu",
      color: "from-green-500 to-emerald-500",
      icon: Zap,
      locked: !isPremium,
    },
  }

  const sessionModes = {
    coach: {
      name: "💬 Coaching",
      description: "Běžná koučovací konverzace",
      icon: MessageSquare,
      locked: false,
    },
    analyst: {
      name: "📊 Analysis",
      description: "Detailní analýza výkonnosti",
      icon: BarChart2,
      locked: !isPremium,
    },
    reflection: {
      name: "🧠 Reflection",
      description: "Hluboká sebereflexe",
      icon: Brain,
      locked: !isPremium,
    },
    mentor: {
      name: "🎯 Mentoring",
      description: "Dlouhodobý rozvoj",
      icon: Target,
      locked: !isPremium,
    },
  }

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      try {
        const allTrades = getAllTrades()
        const allJournalEntries = getAllJournalEntries()

        if (isLiveMode && allTrades.length === 0) {
          setMoodData([
            { date: "Pon", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Úte", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Stř", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Čtv", mood: 0, confidence: 0, stress: 0, energy: 0 },
            { date: "Pát", mood: 0, confidence: 0, stress: 0, energy: 0 },
          ])

          setTradeData([
            { date: "Pon", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Úte", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Stř", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Čtv", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
            { date: "Pát", profit: 0, trades: 0, winRate: 0, avgHold: 0 },
          ])

          setInsights([
            "Zatím nemáte dostatek dat pro analýzu. Začněte zaznamenávat své obchody a náladu.",
            "Sledujte své obchodní vzorce pro získání přehledů.",
            "Zaznamenávejte svou náladu a sebedůvěru pro korelační analýzu.",
            "Používejte analytiky pro zlepšení svých obchodních rozhodnutí.",
          ])
        } else {
          const moodDataSample = [
            { date: "Pon", mood: 8, confidence: 7, stress: 3, energy: 8 },
            { date: "Úte", mood: 6, confidence: 5, stress: 6, energy: 6 },
            { date: "Stř", mood: 4, confidence: 3, stress: 8, energy: 4 },
            { date: "Čtv", mood: 7, confidence: 6, stress: 4, energy: 7 },
            { date: "Pát", mood: 9, confidence: 8, stress: 2, energy: 9 },
          ]

          const tradeDataSample = [
            { date: "Pon", profit: 250, trades: 5, winRate: 80, avgHold: 2.5 },
            { date: "Úte", profit: 150, trades: 8, winRate: 62, avgHold: 1.8 },
            { date: "Stř", profit: -200, trades: 10, winRate: 40, avgHold: 0.9 },
            { date: "Čtv", profit: 180, trades: 6, winRate: 67, avgHold: 3.2 },
            { date: "Pát", profit: 320, trades: 4, winRate: 75, avgHold: 4.1 },
          ]

          const insightsSample = [
            "Vaše úspěšnost je o 25% vyšší v dny, kdy je vaše nálada nad 7 body",
            "Máte tendenci k přetradování (více než 8 obchodů denně), když je vaše sebedůvěra pod 5 body",
            "Vaše nejvyšší zisky korelují s vysokou náladou (8+) a střední sebedůvěrou (6-7)",
            "Zvažte pauzu, když vaše nálada klesne pod 5 bodů - historická data ukazují 70% ztrátových obchodů v tyto dny",
            "Vaše nejlepší obchody mají průměrnou dobu držení 3+ hodin",
            "Stres nad 6 bodů snižuje vaši úspěšnost o průměrně 15%",
          ]

          setMoodData(moodDataSample)
          setTradeData(tradeDataSample)
          setInsights(insightsSample)
        }

        const correlationData = moodData.map((item, index) => ({
          date: item.date,
          mood: item.mood,
          confidence: item.confidence,
          stress: item.stress,
          energy: item.energy,
          profit: tradeData[index]?.profit || 0,
          trades: tradeData[index]?.trades || 0,
          winRate: tradeData[index]?.winRate || 0,
        }))

        setCorrelationData(correlationData)
      } catch (error) {
        console.error("Error loading MindTrader data:", error)
        setMoodData([])
        setTradeData([])
        setCorrelationData([])
        setInsights([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isLiveMode, getAllTrades, getAllJournalEntries])

  const averageMood =
    moodData.length > 0 ? (moodData.reduce((sum, item) => sum + item.mood, 0) / moodData.length).toFixed(1) : "0.0"
  const totalProfit = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.profit, 0) : 0
  const averageWinRate =
    tradeData.length > 0
      ? (tradeData.reduce((sum, item) => sum + item.winRate, 0) / tradeData.length).toFixed(1)
      : "0.0"
  const totalTrades = tradeData.length > 0 ? tradeData.reduce((sum, item) => sum + item.trades, 0) : 0
  const averageStress =
    moodData.length > 0
      ? (moodData.reduce((sum, item) => sum + (item.stress || 0), 0) / moodData.length).toFixed(1)
      : "0.0"

  // Calculate readiness score based on mood, stress, confidence
  const readinessScore = Math.round(((userMood + userConfidence + (10 - userStress) + userEnergy) / 40) * 100)

  const startListening = () => {
    if (!isPremium) return
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "cs-CZ"
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setPrompt(transcript)
      }
      recognition.start()
    }
  }

  const speakResponse = (text) => {
    if (!isPremium || !voiceEnabled) return
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "cs-CZ"
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    const userMessageCount = conversationHistory.filter((m) => m.type === "user").length
    if (!isPremium && userMessageCount >= 3) {
      setResponse(
        "🔒 **Free Plan Limit Reached**\n\nYou've used all 3 free AI messages. Upgrade to Premium for unlimited AI conversations!\n\n**Premium Benefits:**\n✓ Unlimited AI messages\n✓ Advanced personalities\n✓ Voice features\n✓ Priority processing\n\nUpgrade now to continue chatting!",
      )
      return
    }

    setIsGenerating(true)
    setApiError(null)

    const userMessage = {
      type: "user",
      content: prompt,
      timestamp: new Date(),
      mood: userMood,
      stress: userStress,
      energy: userEnergy,
      confidence: userConfidence,
      sessionMode,
      personality: aiPersonality,
    }
    setConversationHistory((prev) => [...prev, userMessage])

    try {
      // Prepare all trades data for AI context
      const allTrades = getAllTrades()
      const tradesForAI = allTrades.map((trade) => ({
        id: trade.id,
        date: trade.date,
        pair: trade.pair,
        type: trade.type,
        pnl: trade.pnl,
        notes: trade.notes,
        mood: trade.mood,
        confidence: trade.confidence,
        stress: trade.stress,
      }))

      // Prepare all journal entries for AI context
      const allJournals = getAllJournalEntries()
      const journalsForAI = allJournals.map((journal) => ({
        id: journal.id,
        date: journal.date,
        title: journal.title,
        content: journal.content,
        type: journal.type,
        mood: journal.mood,
        confidence: journal.confidence,
        stress: journal.stress,
        tags: journal.tags || [],
      }))

      // Prepare mood history
      const moodHistoryForAI = moodData.map((m) => ({
        date: m.date,
        mood: m.mood,
        stress: m.stress,
        confidence: m.confidence,
        notes: "",
      }))

      // Calculate stats
      const stats = {
        totalPnL: totalProfit,
        winRate: Number.parseFloat(averageWinRate),
        totalTrades: totalTrades,
        averageMood: Number.parseFloat(averageMood),
        consecutiveWins: 0, // Calculate if needed
        consecutiveLosses: 0, // Calculate if needed
      }

      // Call the API endpoint
      const response = await fetch("/api/mindtrader/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          personality: aiPersonality,
          mode: sessionMode,
          context: {
            mood: userMood,
            stress: userStress,
            confidence: userConfidence,
            readiness: readinessScore,
          },
          userData: {
            trades: tradesForAI,
            journals: journalsForAI,
            moodHistory: moodHistoryForAI,
            stats: stats,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get AI response")
      }

      const data = await response.json()
      const aiResponse = data.response

      const aiMessage = {
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
        personality: aiPersonality,
        sessionMode,
        usingMockAI: data.usingMockAI || false,
      }
      setConversationHistory((prev) => [...prev, aiMessage])
      setResponse(aiResponse)
      setPrompt("")

      // Speak response if voice is enabled and premium
      if (voiceEnabled && isPremium) {
        setTimeout(() => speakResponse(aiResponse), 500)
      }
    } catch (error) {
      console.error("Error calling MindTrader AI:", error)
      setApiError(error.message)

      // Add error message to conversation
      const errorMessage = {
        type: "ai",
        content: `⚠️ **Error**: ${error.message}\n\nPlease try again or contact support if the issue persists.`,
        timestamp: new Date(),
        personality: aiPersonality,
        sessionMode,
        isError: true,
      }
      setConversationHistory((prev) => [...prev, errorMessage])
      setResponse(errorMessage.content)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt)
  }

  const clearConversation = () => {
    setConversationHistory([])
    setResponse("")
    setApiError(null)
    stopSpeaking()
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response)
    }
  }

  const exportConversation = () => {
    if (!isPremium) return
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

  const moodDistribution = [
    { name: "Výborná (8-10)", value: moodData.filter((d) => d.mood >= 8).length, color: "#10B981" },
    { name: "Dobrá (6-7)", value: moodData.filter((d) => d.mood >= 6 && d.mood < 8).length, color: "#F59E0B" },
    { name: "Špatná (1-5)", value: moodData.filter((d) => d.mood < 6).length, color: "#EF4444" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Premium Status Badge */}
          <div className="flex items-center justify-center">
            <Badge
              className={
                isPremium
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-sm"
                  : "bg-gray-700 text-gray-200 border-gray-600 px-4 py-2 text-sm"
              }
            >
              <Crown className="w-4 h-4 mr-2" />
              {isPremium ? "✨ Premium Active" : "🆓 Free Plan - Limited Features"}
            </Badge>
          </div>

          {/* Upgrade Banner for Free Users */}
          {!isPremium && (
            <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-yellow-900/20 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse"></div>
              <CardContent className="p-6 relative">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl animate-pulse">
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">🚀 Unlock Full AI Power</h3>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-bounce">
                          <Sparkles className="w-3 h-3 mr-1" />
                          50% OFF
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-lg mb-3 font-medium">
                        You're on Free Plan - Only 3 AI messages available
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {premiumFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-3 bg-white/80 rounded-xl p-6 shadow-xl">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm line-through">2999 Kč/month</p>
                      <p className="text-5xl font-bold text-gray-900">1499 Kč</p>
                      <p className="text-yellow-600 text-lg font-bold">💰 Save 50% Today!</p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-2xl shadow-yellow-500/50 text-lg px-8 py-6"
                    >
                      <Link href="/pricing">
                        <Rocket className="w-5 h-5 mr-2" />
                        Upgrade to Premium Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">😊 Průměrná nálada</CardTitle>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{averageMood}/10</div>
                <Progress value={Number.parseFloat(averageMood) * 10} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">💰 Celkový P&L</CardTitle>
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalProfit >= 0 ? "+" : ""}${totalProfit}
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">🎯 Win Rate</CardTitle>
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{averageWinRate}%</div>
                <Progress value={Number.parseFloat(averageWinRate)} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium">😰 Průměrný stres</CardTitle>
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold">{averageStress}/10</div>
                <Progress value={Number.parseFloat(averageStress)} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview">📊 Přehled</TabsTrigger>
              <TabsTrigger value="mood">🧠 Analýza</TabsTrigger>
              <TabsTrigger value="correlation">📈 Korelace</TabsTrigger>
              <TabsTrigger value="ai" className="relative">
                🤖 AI Kouč
                {!isPremium && (
                  <Badge className="absolute -top-1 -right-1 h-4 px-1 text-xs bg-yellow-500">
                    <Lock className="w-3 h-3" />
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle>📈 Obchodní výkonnost</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tradeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="profit" stroke="#8884d8" />
                        <Line type="monotone" dataKey="winRate" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle>😊 Rozložení nálady</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {moodDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mood" className="space-y-4">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>🧠 Sledování nálady</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="mood" stroke="#8884d8" />
                      <Line type="monotone" dataKey="confidence" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="stress" stroke="#ff7300" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>📊 Korelace nálady a výkonnosti</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={correlationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="profit" fill="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />🤖 MindTrader AI Kouč (ChatGPT Powered)
                    </div>
                    {!isPremium && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Lock className="w-3 h-3 mr-1" />
                        {3 - conversationHistory.filter((m) => m.type === "user").length}/3 free messages
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isPremium
                      ? "✨ Powered by ChatGPT - Unlimited conversations with advanced AI"
                      : "🆓 Free plan: 3 messages only. Upgrade for unlimited ChatGPT access!"}
                  </CardDescription>

                  {/* API Status Indicator */}
                  {apiError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>API Error:</strong> {apiError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Premium Upsell for Free Users */}
                  {!isPremium && (
                    <div className="mt-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                      <h4 className="font-bold text-lg mb-3 flex items-center text-gray-900">
                        <Crown className="w-5 h-5 mr-2 text-yellow-600" />🎯 Premium ChatGPT Features
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {premiumFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                            <feature.icon className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      >
                        <Link href="/pricing">
                          <Rocket className="w-4 h-4 mr-2" />
                          Upgrade to Premium - Save 50%
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* AI Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">🎭 AI Personality</Label>
                      {Object.entries(aiPersonalities).map(([key, personality]) => (
                        <Button
                          key={key}
                          variant={aiPersonality === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => !personality.locked && setAiPersonality(key)}
                          disabled={personality.locked}
                          className={`w-full justify-start ${personality.locked ? "opacity-50" : ""}`}
                        >
                          <personality.icon className="w-4 h-4 mr-2" />
                          {personality.name}
                          {personality.locked && <Lock className="w-3 h-3 ml-auto text-yellow-600" />}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">🎯 Session Mode</Label>
                      {Object.entries(sessionModes).map(([key, mode]) => (
                        <Button
                          key={key}
                          variant={sessionMode === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => !mode.locked && setSessionMode(key)}
                          disabled={mode.locked}
                          className={`w-full justify-start ${mode.locked ? "opacity-50" : ""}`}
                        >
                          <mode.icon className="w-4 h-4 mr-2" />
                          {mode.name}
                          {mode.locked && <Lock className="w-3 h-3 ml-auto text-yellow-600" />}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">😊 Nálada: {userMood}/10</Label>
                        <Slider value={[userMood]} onValueChange={(v) => setUserMood(v[0])} max={10} min={1} step={1} />
                      </div>
                      <div>
                        <Label className="text-sm">😰 Stres: {userStress}/10</Label>
                        <Slider
                          value={[userStress]}
                          onValueChange={(v) => setUserStress(v[0])}
                          max={10}
                          min={1}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">💪 Sebedůvěra: {userConfidence}/10</Label>
                        <Slider
                          value={[userConfidence]}
                          onValueChange={(v) => setUserConfidence(v[0])}
                          max={10}
                          min={1}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">⚡ Energie: {userEnergy}/10</Label>
                        <Slider
                          value={[userEnergy]}
                          onValueChange={(v) => setUserEnergy(v[0])}
                          max={10}
                          min={1}
                          step={1}
                        />
                      </div>
                      <div className="pt-2 border-t">
                        <Label className="text-sm font-bold">📊 Readiness Score</Label>
                        <div className="text-2xl font-bold text-blue-600">{readinessScore}%</div>
                        <Progress value={readinessScore} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Voice Controls */}
                  <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => isPremium && setVoiceEnabled(!voiceEnabled)}
                        disabled={!isPremium}
                        className={!isPremium ? "opacity-50" : ""}
                      >
                        {voiceEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                        Voice {voiceEnabled ? "On" : "Off"}
                        {!isPremium && <Lock className="w-3 h-3 ml-2" />}
                      </Button>
                    </div>
                    {conversationHistory.length > 0 && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={exportConversation} disabled={!isPremium}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                          {!isPremium && <Lock className="w-3 h-3 ml-2" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearConversation}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Quick Prompts */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">⚡ Rychlé otázky:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {quickPrompts.map((qp, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickPrompt(qp)}
                          disabled={
                            isGenerating ||
                            (!isPremium && conversationHistory.filter((m) => m.type === "user").length >= 3)
                          }
                          className="text-left justify-start h-auto py-2"
                        >
                          <Zap className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="text-xs">{qp}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Conversation */}
                  {conversationHistory.length > 0 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                      {conversationHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-lg p-4 ${
                              msg.type === "user"
                                ? "bg-blue-500 text-white"
                                : msg.isError
                                  ? "bg-red-50 border border-red-200"
                                  : "bg-white border border-gray-200 shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {msg.type === "ai" && <Brain className="w-4 h-4" />}
                              <span className="text-xs font-medium">
                                {msg.type === "user" ? "Vy" : "AI"}
                                {msg.usingMockAI && " (Mock)"}
                              </span>
                              <span className="text-xs opacity-70">
                                {msg.timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <Textarea
                        placeholder="Zeptejte se AI kouče na cokoliv o tradingu, emocích, strategii..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        disabled={
                          isGenerating ||
                          (!isPremium && conversationHistory.filter((m) => m.type === "user").length >= 3)
                        }
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={startListening}
                        disabled={!isPremium || isGenerating}
                        className="absolute bottom-2 right-2"
                      >
                        {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={
                        isGenerating ||
                        !prompt.trim() ||
                        (!isPremium && conversationHistory.filter((m) => m.type === "user").length >= 3)
                      }
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />🤖 Generuji odpověď z ChatGPT...
                        </>
                      ) : !isPremium && conversationHistory.filter((m) => m.type === "user").length >= 3 ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />🔒 Upgrade for More Messages
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />🚀 Ask ChatGPT AI Coach
                        </>
                      )}
                    </Button>
                    {!isPremium && (
                      <p className="text-center text-xs text-gray-500">
                        {3 - conversationHistory.filter((m) => m.type === "user").length} free ChatGPT messages
                        remaining
                      </p>
                    )}
                  </form>

                  {/* Response */}
                  {response && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>🤖 ChatGPT Response</Label>
                        <Button variant="ghost" size="sm" onClick={copyResponse}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                        <div className="text-sm whitespace-pre-wrap">{response}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
