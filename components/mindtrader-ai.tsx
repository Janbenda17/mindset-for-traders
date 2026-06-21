"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, Loader2, Heart, Target, Zap, BarChart2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useLiveMode } from "@/contexts/live-mode-context"
import { getUserStorageKey } from "@/utils/storage-namespace"
import { useLanguage } from "@/contexts/language-context"

const GalaxyBackground = () => (
  <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-purple-900 to-slate-950 overflow-hidden pointer-events-none z-0">
    <div className="absolute inset-0">
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>

    <div className="absolute top-20 -left-32 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen opacity-30 blur-3xl animate-pulse" />
    <div
      className="absolute bottom-20 -right-32 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen opacity-25 blur-3xl animate-pulse"
      style={{ animationDelay: "0.7s" }}
    />
    <div
      className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse"
      style={{ animationDelay: "1.4s" }}
    />
    <div
      className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-fuchsia-600 rounded-full mix-blend-screen opacity-15 blur-3xl animate-pulse"
      style={{ animationDelay: "2.1s" }}
    />
  </div>
)

const MindTraderAI = () => {
  const { language } = useLanguage()
  const isEn = language === "en"

  const scenarios = [
    {
      id: "recovery",
      label: isEn ? "🔴 How to recover from loss?" : "🔴 Jak se zotavit po ztrátě?",
      content: isEn ? "How to recover from loss?" : "Jak se zotavit po ztrátě?"
    },
    {
      id: "fear",
      label: isEn ? "😰 How to handle fear?" : "😰 Jak zvládat strach?",
      content: isEn ? "How to handle fear?" : "Jak zvládat strach?"
    },
    {
      id: "discipline",
      label: isEn ? "⚠️ Help me with discipline" : "⚠️ Pomoz mi s disciplínou",
      content: isEn ? "Help me with discipline" : "Pomoz mi s disciplínou"
    },
    {
      id: "plan-violation",
      label: isEn ? "❌ I broke the plan, what to do?" : "❌ Porušil jsem plán, co dělat?",
      content: isEn ? "I broke the plan, what to do?" : "Porušil jsem plán, co dělat?"
    }
  ]

  const {
    isLiveMode,
    getAllTrades,
    getAllJournalEntries,
    getTraderProfile,
    currentMorningCheck,
    morningChecks,
  } = useData()
  const { plan, isActive } = useSubscription()
  const { toast } = useToast()

  const isPremium = plan === "premium" && isActive

  // AI State
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // AI Configuration
  const [aiMode, setAiMode] = useState("mind")
  const [aiPersonality, setAiPersonality] = useState("calm")

  // Voice
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Recovery Mode
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  // Persistent message counter for Virtual Mode
  const [virtualMessageCount, setVirtualMessageCount] = useState(0)
  const [liveMessageCount, setLiveMessageCount] = useState(0)
  const [liveMessageDate, setLiveMessageDate] = useState("")

  const messagesEndRef = useRef(null)

  const userData = getUserData()
  const moodEntries = userData.moodEntries || []

  const trades = getAllTrades() || []
  const journalEntries = getAllJournalEntries() || []

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefillPrompt = localStorage.getItem("mindtrader-ai-prefill")
      if (prefillPrompt) {
        setInput(prefillPrompt)
        localStorage.removeItem("mindtrader-ai-prefill")
      }
    }
  }, [])

  useEffect(() => {
    const prefill = localStorage.getItem("mindtrader-ai-prefill")
    if (prefill) {
      setInput(prefill)
      localStorage.removeItem("mindtrader-ai-prefill")
    }
  }, [])

  // Check for losses in recent trades to trigger recovery mode
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const todayTrades = trades.filter((t) => (t.recordedDate || t.date) === today || t.closeDate === today)

    const totalLoss = todayTrades.reduce((sum, trade) => {
      const pnl = trade.pnl || trade.profitLoss || 0
      return sum + (pnl < 0 ? pnl : 0)
    }, 0)

    console.log("[v0] MindTrader: Today's total loss:", totalLoss)

    if (totalLoss < -500 && !isRecoveryMode) {
      console.log("[v0] MindTrader: Activating recovery mode due to loss")
      setIsRecoveryMode(true)
      setTimeout(() => {
        triggerRecoveryMode()
      }, 500)
    }
  }, [trades, isRecoveryMode])

  useEffect(() => {
    if (!isLiveMode) {
      const stored = localStorage.getItem("mindtrader-virtual-message-count")
      if (stored) {
        setVirtualMessageCount(Number.parseInt(stored, 10))
      }
    } else {
      const storedCount = localStorage.getItem("mindtrader-live-message-count")
      const storedDate = localStorage.getItem("mindtrader-live-message-date")
      const today = new Date().toISOString().split("T")[0]

      if (storedDate === today && storedCount) {
        setLiveMessageCount(Number.parseInt(storedCount, 10))
        setLiveMessageDate(storedDate)
      } else {
        // Reset counter for new day
        setLiveMessageCount(0)
        setLiveMessageDate(today)
        localStorage.setItem("mindtrader-live-message-count", "0")
        localStorage.setItem("mindtrader-live-message-date", today)
      }
    }
  }, [isLiveMode])

  useEffect(() => {
    const messagesKey = getUserStorageKey("mindtrader-messages")
    const messagesDateKey = getUserStorageKey("mindtrader-messages-date")
    const recoveryKey = getUserStorageKey("mindtrader-recovery-mode")

    const storedMessages = localStorage.getItem(messagesKey)
    const storedDate = localStorage.getItem(messagesDateKey)
    const today = new Date().toDateString()

    if (storedDate !== today) {
      setMessages([])
      localStorage.removeItem(messagesKey)
      localStorage.setItem(messagesDateKey, today)
    } else if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages)
        setMessages(
          parsed.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        )
      } catch (error) {
        console.error("[v0] Failed to load messages:", error)
      }
    }

    const recoveryData = localStorage.getItem(recoveryKey)
    if (recoveryData) {
      try {
        const parsed = JSON.parse(recoveryData)
        if (parsed.isActive) {
          console.log("[v0] Recovery mode is active", parsed)
          setIsRecoveryMode(true)
        }
      } catch (error) {
        console.error("[v0] Failed to load recovery mode:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      const messagesKey = getUserStorageKey("mindtrader-messages")
      const messagesDateKey = getUserStorageKey("mindtrader-messages-date")

      const messagesToStore = messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }))
      localStorage.setItem(messagesKey, JSON.stringify(messagesToStore))
      localStorage.setItem(messagesDateKey, new Date().toDateString())
      
      // Scroll to the latest message
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // AI Personalities
  const personalities = {
    calm: {
      name: isEn ? "🧘 Calm Mentor" : "🧘 Klidný Mentor",
      description: isEn ? "Calm, empathetic, helps with emotions" : "Klidný, empatický, pomáhá s emocemi",
      icon: Heart,
      color: "from-blue-500 to-indigo-500",
      locked: false,
    },
    strict: {
      name: isEn ? "⚡ Strict Coach" : "⚡ Přísný Kouč",
      description: isEn ? "Direct, pushes for discipline" : "Přímý, tlačí na disciplínu",
      icon: Target,
      color: "from-red-500 to-orange-500",
      locked: false,
    },
    analytical: {
      name: isEn ? "🧩 Analytical Advisor" : "🧩 Analytický Poradce",
      description: isEn ? "Data-driven, scientific" : "Datově řízený, vědecký",
      icon: BarChart2,
      color: "from-purple-500 to-pink-500",
      locked: false,
    },
    balanced: {
      name: isEn ? "💬 Balanced Support" : "💬 Vyvážená Podpora",
      description: isEn ? "Mix of empathy and performance" : "Mix empatie a výkonu",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      locked: false,
    },
  }

  // AI Modes
  const modes = {
    mind: {
      name: isEn ? "🧠 MIND AI" : "🧠 MIND AI",
      description: isEn ? "Your psychological partner - instant emotional help" : "Tvůj psychologický partner - okamžitá emoční pomoc",
      icon: Brain,
      locked: false,
    },
    analytics: {
      name: isEn ? "📊 ANALYTICS AI" : "📊 ANALYTICS AI",
      description: isEn ? "Smart performance analysis - data-driven insights" : "Chytrá analýza výkonu - datové poznatky",
      icon: BarChart2,
      locked: false,
    },
    coach: {
      name: isEn ? "🎯 COACH AI" : "🎯 COACH AI",
      description: isEn ? "Personal discipline and growth trainer" : "Osobní trenér disciplíny a růstu",
      icon: Target,
      locked: false,
    },
  }

  // Quick Prompts
  const quickPrompts = isEn ? [
    "How to recover from loss?",
    "How to handle fear?",
    "Help me with discipline",
    "I broke the plan, what to do?",
    "How to overcome FOMO?",
    "How to improve risk management?",
    "How to strengthen mental power?",
    "How to avoid revenge trading?",
  ] : [
    "Jak se zotavit po ztrátě?",
    "Jak zvládat strach?",
    "Pomoz mi s disciplínou",
    "Porušil jsem plán, co dělat?",
    "Jak překonat FOMO?",
    "Jak zlepšit risk management?",
    "Jak posílit mentální sílu?",
    "Jak se vyhnout revenge tradingu?",
  ]

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = isEn
        ? `Hi! I'm your MindTrader AI coach. 🧠\n\nI've seen your data and I'm here to help you with trading psychology.\n\nWhat's bothering you? How can I help?`
        : `Ahoj! Jsem tvůj MindTrader AI kouč. 🧠\n\nVidím tvá data a jsem tady abych ti pomohl s psychologií tradingu.\n\nCo tě trápí? Jak ti mohu pomoci?`

      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
          type: "chat",
        },
      ])
    }
  }, [isEn])

  const triggerRecoveryMode = () => {
    const recoveryMessage = isEn
      ? `🚨 Recovery Mode active - AI detected a difficult day. Follow recommendations below.\n\n1. **Breathing** - 4-7-8 technique (4s inhale, 7s hold, 8s exhale)\n2. **Journal** - What are you feeling right now?\n3. **Rest** - Minimum 2 hours break\n4. **Return** - Come back when you're ready\n\nBest trade = no trade. 💪`
      : `🚨 Recovery Mode aktivní - AI detekovalo těžký den. Postupuj podle doporučení níže.\n\n1. **Dýchání** - technika 4-7-8 (nadech 4s, držení 7s, výdech 8s)\n2. **Deník** - Co teď cítíš?\n3. **Odpočinek** - Minimálně 2 hodiny pauza\n4. **Návrat** - Vraťse, až budeš připraven\n\nNejlepší trade = žádný trade. 💪`

    const recoveryMsg = {
      role: "assistant",
      content: recoveryMessage,
      timestamp: new Date(),
      type: "recovery",
    }
    setMessages((prev) => [...prev, recoveryMsg])
  }

  const formatAIResponse = (text) => {
    return text
      .replace(/[#*`]/g, "")
      .replace(/\*\*/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }

  const incrementVirtualMessageCount = () => {
    const newCount = virtualMessageCount + 1
    setVirtualMessageCount(newCount)
    localStorage.setItem("mindtrader-virtual-message-count", newCount.toString())
  }

  const incrementLiveMessageCount = () => {
    const today = new Date().toISOString().split("T")[0]
    const newCount = liveMessageCount + 1
    setLiveMessageCount(newCount)
    setLiveMessageDate(today)
    localStorage.setItem("mindtrader-live-message-count", newCount.toString())
    localStorage.setItem("mindtrader-live-message-date", today)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    // VIRTUAL MODE: Block free text input - only scénáře allowed
    if (!isLiveMode) {
      return // Do nothing - only scénáře can be clicked
    }

    const messageContent = input.trim()

    const userMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const traderProfile = getTraderProfile?.(30)
      const isAnalyticsMode = aiMode === "analytics"

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/mindtrader/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message: messageContent,
          personality: aiPersonality,
          mode: aiMode,
          language: language,
          isVirtualMode: !isLiveMode,
          context: {
            confidence: 5,
          },
          traderProfile: traderProfile || {
            performance: {
              totalTrades: 0,
              winRate: "0.0",
              totalPnL: "0.00",
            },
            psychology: {
              averageMood: "5.0",
              averageStress: "5.0",
              averageReadiness: "50.0",
            },
            patterns: {
              revengeTradeRate: "0.0",
              emotionalTrades: 0,
            },
          },
          userData: {
            trades: trades.slice(0, isAnalyticsMode ? 20 : 5).map((t) => ({
              id: t.id,
              date: t.date,
              pair: t.pair,
              type: t.type,
              pnl: t.pnl,
              notes: t.notes,
              ...(isAnalyticsMode && {
                mood: t.mood,
                confidence: t.confidenceBefore,
                stress: t.stressLevel,
                emotionBefore: t.emotionBefore,
                emotionDuring: t.emotionDuring,
                emotionAfter: t.emotionAfter,
                isRevengeTrade: t.isRevengeTrade,
                tags: t.tags,
              }),
            })),
            journals: journalEntries.slice(0, 5).map((j) => ({
              id: j.id,
              date: j.date,
              title: j.title,
              type: j.type,
              ...(isAnalyticsMode && {
                content: j.content || "",
                mood: j.mood,
                confidence: j.confidence,
                stress: j.stress,
                tags: j.tags,
              }),
            })),
            moodHistory: [],
            patterns: isAnalyticsMode
              ? {
                  fomoRate: "0",
                  revengeRate: traderProfile?.patterns?.revengeTradeRate || "0",
                  overconfidenceRate: "0",
                  fearRate: "0",
                }
              : null,
            stats: {
              totalPnL: Number(traderProfile?.performance?.totalPnL || 0),
              winRate: Number.parseFloat(String(traderProfile?.performance?.winRate || "0")),
              totalTrades: Number(traderProfile?.performance?.totalTrades || 0),
              averageMood: Number.parseFloat(String(traderProfile?.psychology?.averageMood || "5")),
              consecutiveWins: Number(traderProfile?.performance?.consecutiveWins || 0),
              consecutiveLosses: Number(traderProfile?.performance?.consecutiveLosses || 0),
            },
          },
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Chyba sítě" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("[v0] JSON parse error:", parseError)
        throw new Error("Neplatný formát odpovědi ze serveru")
      }

      if (!data.response) {
        throw new Error("Prázdná odpověď od AI")
      }

      const aiMessage = {
        role: "assistant",
        content: formatAIResponse(data.response),
        timestamp: new Date(),
        mode: aiMode,
        personality: aiPersonality,
        type: "chat",
      }

      setMessages((prev) => [...prev, aiMessage])

      if (!isLiveMode) {
        incrementVirtualMessageCount()
      } else {
        incrementLiveMessageCount()
      }

      toast({
        title: "Odpověď přijata",
        description: "AI ti odpověděl",
      })
    } catch (error) {
      console.error("[v0] AI Chat Error:", error)

      const errorMessage = {
        role: "assistant",
        content: error instanceof Error ? `⚠️ Chyba: ${error.message}` : "⚠️ Chyba: Nepodařilo se získat odpověď",
        timestamp: new Date(),
        type: "chat",
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Chyba",
        description: error instanceof Error ? error.message : "Nepodařilo se získat odpověď od AI",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateInsights = async () => {
    setIsLoading(true)
    try {
      const winningTrades = trades.filter((t) => (t.pnl || 0) > 0).length
      const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
      const revengeTrades = trades.filter((t) => t.isRevengeTrade).length

      const insightMessage =
        language === "cs"
          ? `📊 AI INSIGHTS - POSLEDNÍ TÝDEN\n\n🧠 Co se děje:\n- Počet obchodů: ${trades.length}\n- Win rate: ${winRate.toFixed(1)}%\n- Revenge obchody: ${revengeTrades}\n\n💡 Proč se to děje:\n${revengeTrades > 0 ? "- Revenge trading snižuje tvoji ziskovost\n" : ""}${trades.length === 0 ? "- Zatím nemám dostatek dat z obchodů\n" : ""}${winRate >= 50 ? "- Tvůj win rate je solidní, udržuj současný přístup\n" : ""}\n\n🎯 Co udělat dál:\n1. ${revengeTrades > 0 ? "Zaveď pravidlo '2 ztráty = konec dne'" : "Pokračuj v disciplinovaném přístupu"}\n2. Pravidelně zapisuj do journalu\n3. Sleduj setupy, které ti nejvíc vydělávají\n\nDisciplína = dlouhodobý úspěch! 💪`
          : `📊 AI INSIGHTS - LAST WEEK\n\n🧠 What's happening:\n- Trades: ${trades.length}\n- Win rate: ${winRate.toFixed(1)}%\n- Revenge trades: ${revengeTrades}\n\n💡 Why it's happening:\n${revengeTrades > 0 ? "- Revenge trading is reducing your profitability\n" : ""}${trades.length === 0 ? "- Not enough trading data yet\n" : ""}${winRate >= 50 ? "- Your win rate is solid, keep your current approach\n" : ""}\n\n🎯 What to do next:\n1. ${revengeTrades > 0 ? "Set a rule: '2 losses = end of day'" : "Keep up the disciplined approach"}\n2. Journal regularly\n3. Track which setups perform best\n\nDiscipline = long-term success! 💪`

      const insightMsg = {
        role: "assistant",
        content: formatAIResponse(insightMessage),
        timestamp: new Date(),
        type: "insight",
      }

      setMessages((prev) => [...prev, insightMsg])
    } catch (error) {
      console.error("Error generating insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async () => {
    if (!isPremium) {
      toast({
        title: "Premium funkce",
        description: "Report Builder je dostupný pouze v Premium plánu.",
        variant: "destructive",
      })
      return
    }

    const reportWinningTrades = trades.filter((t) => (t.pnl || 0) > 0).length
    const reportWinRate = trades.length > 0 ? (reportWinningTrades / trades.length) * 100 : 0
    const reportRevengeTrades = trades.filter((t) => t.isRevengeTrade).length
    const reportPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    const reportContent =
      language === "cs"
        ? `# MindTrader AI Report\n\n**Datum:** ${new Date().toLocaleDateString("cs-CZ")}\n\n## 📊 Přehled výkonu\n\n- Celkový počet obchodů: ${trades.length}\n- Win rate: ${reportWinRate.toFixed(1)}%\n- Celkové P&L: $${reportPnL.toFixed(0)}\n\n## 🧠 Chování a vzorce\n\n${reportRevengeTrades > 0 ? `⚠️ ${reportRevengeTrades} obchodů identifikováno jako revenge trading\n` : "✅ Žádné revenge obchody detekovány\n"}\n## 🎯 Doporučení\n\n1. Pokračuj v pravidelném journalingu\n2. Sleduj setupy s nejvyšší úspěšností\n3. Respektuj svůj trading plán\n\n---\n\n*Vygenerováno MindTrader AI*`
        : `# MindTrader AI Report\n\n**Date:** ${new Date().toLocaleDateString("en-US")}\n\n## 📊 Performance Overview\n\n- Total trades: ${trades.length}\n- Win rate: ${reportWinRate.toFixed(1)}%\n- Total P&L: $${reportPnL.toFixed(0)}\n\n## 🧠 Behavior & Patterns\n\n${reportRevengeTrades > 0 ? `⚠️ ${reportRevengeTrades} trades flagged as revenge trading\n` : "✅ No revenge trades detected\n"}\n## 🎯 Recommendations\n\n1. Continue regular journaling\n2. Track which setups perform best\n3. Respect your trading plan\n\n---\n\n*Generated by MindTrader AI*`

    const blob = new Blob([reportContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindtrader-report-${new Date().toISOString().split("T")[0]}.md`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Report vygenerován",
      description: "Report byl stažen",
    })
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 overflow-hidden">
      <GalaxyBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6">
        {/* Left Sidebar - AI Modes */}
        <div className="w-full lg:w-96 lg:h-[78vh] flex-shrink-0">
          <Card className="bg-gradient-to-b from-slate-900/90 to-slate-950/80 border-2 border-purple-500/30 backdrop-blur-xl lg:h-full shadow-2xl">
            <CardHeader className="pb-3 sm:pb-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/40 to-transparent p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  {isEn ? "AI Assistant" : "AI Assistant"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 lg:overflow-y-auto p-3 sm:p-4 lg:p-6">
              {/* AI Modes - Enhanced with better spacing */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">
                    {isEn ? "🤖 AI Modes" : "🤖 AI Modes"}
                  </p>
                  <div className="h-0.5 w-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                </div>
                <div className="space-y-3">
                  {Object.entries(modes).map(([key, mode]) => {
                    const Icon = mode.icon
                    return (
                      <button
                        key={key}
                        onClick={() => setAiMode(key)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 font-semibold text-sm group ${
                          aiMode === key
                            ? "border-amber-400 bg-gradient-to-r from-amber-950/80 to-amber-900/60 text-amber-100 shadow-lg shadow-amber-500/20"
                            : "border-purple-500/30 bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-purple-200 hover:border-purple-400/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              aiMode === key ? "bg-amber-400/20" : "bg-purple-500/20 group-hover:bg-purple-400/30"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{mode.name}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Chat Area - Enhanced */}
        <div className="flex-1 order-2 lg:order-2 flex flex-col lg:h-[78vh] min-h-0">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-2 border-purple-500/30 backdrop-blur-xl flex-1 flex flex-col shadow-2xl min-h-0">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {/* Messages Area - Enhanced with better spacing */}
              <ScrollArea className="flex-1 p-6 min-h-0">
                <div className="space-y-5">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative mx-auto w-16 h-16">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-lg opacity-30 animate-pulse" />
                          <div className="relative bg-slate-800 rounded-full flex items-center justify-center border border-purple-400/30">
                            <Brain className="w-8 h-8 text-purple-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-base font-bold text-purple-200">
                            {isEn ? "Let's Get Started!" : "Let's Get Started!"}
                          </p>
                          <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                            {isEn ? "Choose a mode and ask me anything" : "Choose a mode and ask me anything"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl p-4 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 font-medium"
                              : message.type === "recovery"
                                ? "bg-gradient-to-r from-orange-900 to-orange-950 text-orange-100 border border-orange-400/30 shadow-lg shadow-orange-500/10"
                                : message.type === "insight"
                                  ? "bg-gradient-to-r from-indigo-900 to-indigo-950 text-indigo-100 border border-indigo-400/30 shadow-lg shadow-indigo-500/10"
                                  : "bg-gradient-to-r from-slate-700 to-slate-800 text-slate-100 border border-purple-400/20 shadow-lg shadow-purple-500/10"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <span className="text-xs opacity-60 mt-2 block font-normal">
                            {message.timestamp.toLocaleTimeString(language === "cs" ? "cs-CZ" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="max-w-[70%] rounded-xl p-4 bg-gradient-to-r from-slate-700 to-slate-800 border border-purple-400/20 shadow-lg shadow-purple-500/10">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          <span className="text-sm text-slate-200 font-medium">
                            {language === "cs" ? "Myslím..." : "Thinking..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Prompts and Input - Enhanced */}
              <div className="border-t border-purple-500/20 bg-gradient-to-t from-slate-950/80 to-slate-950/40 p-3 sm:p-4 space-y-2 sm:space-y-3">
                {messages.length < 3 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {quickPrompts.slice(0, 4).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(prompt)}
                        className="text-xs p-3 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-200 hover:shadow-md hover:shadow-purple-500/10 font-medium truncate"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Input - Enhanced */}
                <div className="space-y-2">
                  {!isLiveMode && (
                    <div className="text-xs text-blue-400/70 text-center py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      Jen v live modu můžeš psát vlastní zprávy
                    </div>
                  )}
                  {!isLiveMode && messages.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Choose a scenario:</p>
                      <div className="flex flex-col gap-2">
                        {scenarios.map((scenario) => (
                          <Button
                            key={scenario.id}
                            onClick={() => {
                              setInput(scenario.content)
                              setTimeout(() => {
                                handleSendMessage()
                              }, 100)
                            }}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 justify-start text-left h-auto py-2 px-4"
                          >
                            {scenario.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : isLiveMode || messages.length > 0 ? (
                    <div className="flex gap-3">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={!isLiveMode}
                        className="bg-slate-800 border-2 border-purple-400/30 focus:border-purple-400/60 text-white placeholder-slate-500 resize-none h-10 min-h-10 rounded-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && isLiveMode) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim() || !isLiveMode}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
                        size="lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export { MindTraderAI }
export default MindTraderAI
