"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Send, Loader2, Heart, Target, Zap, AlertCircle, BarChart2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useLanguage } from "@/contexts/language-context"
import { getUserStorageKey } from "@/utils/storage-namespace"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  mode?: string
  personality?: string
  type?: "chat" | "insight" | "recovery" | "report"
}

interface ReadinessFactors {
  sleep: number
  stress: number
  routine: number
  weather: number
  nutrition: number
  mood: number
  previousResults: number
}

interface DailyEntry {
  id: string
  date: string
  weather: { condition: string; mood_impact: number }
  sleep: { bedtime: string; wake_time: string; quality: number }
  exercise: { type: string; duration: number; intensity: number }
  nutrition: { quality: number; water_intake: number }
  mental_state: { stress_level: number; focus_level: number; confidence: number; mood: number }
  trading_psychology: { patience: number; emotional_control: number }
  trading_session: {
    trades_taken: number
    profit_loss: number
    followed_plan: number
    journal_reviewed: boolean
    meditation: number
    screen_time: number
  }
  notes: string
  wins: string
  improvements: string
  ai_score: number
  sleep_hours: number
}

export function MindTraderAI() {
  const { t, language } = useLanguage()
  const { isLiveMode, getAllTrades, getAllJournalEntries } = useData()
  const { plan, isActive } = useSubscription()
  const { toast } = useToast()

  const isPremium = plan === "premium" && isActive

  // AI State
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // AI Configuration
  const [aiMode, setAiMode] = useState<"mind" | "analytics" | "coach">("mind")
  const [aiPersonality, setAiPersonality] = useState<"calm" | "strict" | "analytical" | "balanced">("calm")

  // Readiness Data (loaded from Daily Tracker)
  const [readinessScore, setReadinessScore] = useState<number | null>(null)
  const [readinessFactors, setReadinessFactors] = useState<ReadinessFactors>({
    sleep: 7,
    stress: 5,
    routine: 7,
    weather: 7,
    nutrition: 7,
    mood: 7,
    previousResults: 7,
  })

  // Voice
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Recovery Mode
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  // Persistent message counter for Virtual Mode
  const [virtualMessageCount, setVirtualMessageCount] = useState(0)
  const [liveMessageCount, setLiveMessageCount] = useState(0)
  const [liveMessageDate, setLiveMessageDate] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Load readiness data from Daily Tracker
  useEffect(() => {
    loadReadinessFromTracker()

    // Check for losses in recent trades to trigger recovery mode
    const today = new Date().toISOString().split("T")[0]
    const todayTrades = trades.filter((t: any) => t.date === today || t.closeDate === today)

    const totalLoss = todayTrades.reduce((sum: number, trade: any) => {
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
  }, [isLiveMode, getAllTrades, isRecoveryMode])

  const loadReadinessFromTracker = () => {
    try {
      const storageKey = isLiveMode ? "daily-tracker-entries-live" : "daily-tracker-entries-virtual"
      const stored = localStorage.getItem(storageKey)

      if (stored) {
        const entries: DailyEntry[] = JSON.parse(stored)
        const today = new Date().toISOString().split("T")[0]
        const todayEntry = entries.find((e) => e.date === today)

        if (todayEntry) {
          // Load from today's entry
          setReadinessScore(todayEntry.ai_score)
          setReadinessFactors({
            sleep: todayEntry.sleep.quality,
            stress: todayEntry.mental_state.stress_level,
            routine: todayEntry.trading_session.followed_plan,
            weather: todayEntry.weather.mood_impact,
            nutrition: todayEntry.nutrition.quality,
            mood: todayEntry.mental_state.mood,
            previousResults: Math.min(10, Math.max(1, (todayEntry.trading_session.profit_loss / 100) * 10 + 5)),
          })
        } else {
          setReadinessScore(null)
        }
      } else {
        setReadinessScore(null)
      }
    } catch (error) {
      console.error("Error loading readiness from tracker:", error)
      setReadinessScore(null)
    }
  }

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
    loadReadinessFromTracker()

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
          parsed.map((msg: any) => ({
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
  }, [isLiveMode, getAllTrades, isRecoveryMode])

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
    }
  }, [messages])

  // AI Personalities
  const personalities = {
    calm: {
      name: language === "cs" ? "🧘 Klidný Mentor" : "🧘 Calm Mentor",
      description: language === "cs" ? "Klidný, empatický, pomáhá s emocemi" : "Calm, empathetic, helps with emotions",
      icon: Heart,
      color: "from-blue-500 to-indigo-500",
      locked: false,
    },
    strict: {
      name: language === "cs" ? "⚡ Přísný Kouč" : "⚡ Strict Coach",
      description: language === "cs" ? "Přímý, tlačí na disciplínu" : "Direct, pushes for discipline",
      icon: Target,
      color: "from-red-500 to-orange-500",
      locked: false,
    },
    analytical: {
      name: language === "cs" ? "🧩 Analytický Poradce" : "🧩 Analytical Advisor",
      description: language === "cs" ? "Datově orientovaný, vědecký" : "Data-driven, scientific",
      icon: BarChart2,
      color: "from-purple-500 to-pink-500",
      locked: false,
    },
    balanced: {
      name: language === "cs" ? "💬 Vyvážená Podpora" : "💬 Balanced Support",
      description: language === "cs" ? "Mix empatie a výkonu" : "Mix of empathy and performance",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      locked: false,
    },
  }

  // AI Modes
  const modes = {
    mind: {
      name: language === "cs" ? "🧠 MIND AI" : "🧠 MIND AI",
      description:
        language === "cs"
          ? "Tvůj psychologický parťák - okamžitá pomoc s emocemi"
          : "Your psychological partner - instant emotional help",
      icon: Brain,
      locked: false,
    },
    analytics: {
      name: language === "cs" ? "📊 ANALYTICS AI" : "📊 ANALYTICS AI",
      description:
        language === "cs"
          ? "Chytrá výkonnostní analýza - rozbor podle dat"
          : "Smart performance analysis - data-driven insights",
      icon: BarChart2,
      locked: false,
    },
    coach: {
      name: language === "cs" ? "🎯 COACH AI" : "🎯 COACH AI",
      description: language === "cs" ? "Osobní trenér disciplíny a růstu" : "Personal discipline and growth trainer",
      icon: Target,
      locked: false,
    },
  }

  // Quick Prompts
  const quickPrompts =
    language === "cs"
      ? [
          "Jak se zotavit po ztrátě?",
          "Jak zvládat strach?",
          "Pomoz mi s disciplínou",
          "Porušil jsem plán, co dělat?",
          "Jak překonat FOMO?",
          "Jak zlepšit risk management?",
          "Jak posílit mentální sílu?",
          "Jak se vyhnout revenge trading?",
        ]
      : [
          "How to recover after a loss?",
          "How to manage fear?",
          "Help me with discipline",
          "I violated my plan, what to do?",
          "How to overcome FOMO?",
          "How to improve risk management?",
          "How to strengthen mental power?",
          "How to avoid revenge trading?",
        ]

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage =
        language === "cs"
          ? `Ahoj! Jsem tvůj MindTrader AI kouč. 🧠\n\nViděl jsem tvoje data a jsem tady, abych ti pomohl s psychologií tradování.\n\nTvoje aktuální readiness skóre: ${readinessScore !== null ? readinessScore + "%" : "Není dostupné"}\n\nCo tě trápí? Jak ti můžu pomoct?`
          : `Hi! I'm your MindTrader AI coach. 🧠\n\nI've seen your data and I'm here to help you with trading psychology.\n\nYour current readiness score: ${readinessScore !== null ? readinessScore + "%" : "Not available"}\n\nWhat's troubling you? How can I help?`

      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
          type: "chat",
        },
      ])
    }
  }, [])

  const triggerRecoveryMode = () => {
    const recoveryMessage =
      language === "cs"
        ? `🚨 Recovery Mode aktivní - AI detekoval obtížný den. Následuj doporučení níže.\n\n1. **Dýchání** - 4-7-8 technika (4s nádech, 7s hold, 8s výdech)\n2. **Zapiš si myšlenky** - Co cítíš právě teď?\n3. **Odpočinek** - Minimálně 2 hodiny pauza\n4. **Návrat** - Až readiness >70%\n\nNejlepší obchod = žádný obchod. 💪`
        : `🚨 Recovery Mode active - AI detected a difficult day. Follow recommendations below.\n\n1. **Breathing** - 4-7-8 technique (4s inhale, 7s hold, 8s exhale)\n2. **Journal** - What are you feeling right now?\n3. **Rest** - Minimum 2 hours break\n4. **Return** - When readiness >70%\n\nBest trade = no trade. 💪`

    const recoveryMsg: Message = {
      role: "assistant",
      content: recoveryMessage,
      timestamp: new Date(),
      type: "recovery",
    }
    setMessages((prev) => [...prev, recoveryMsg])
  }

  const formatAIResponse = (text: string): string => {
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

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const isAnalyticsMode = aiMode === "analytics"

      const response = await fetch("/api/mindtrader/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          personality: aiPersonality,
          mode: aiMode,
          context: {
            mood: 5,
            stress: 5,
            confidence: 5,
            readiness: 50,
            sleep: 7,
            energy: 5,
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
            moodHistory: isAnalyticsMode
              ? moodEntries.slice(0, 7).map((m) => ({
                  date: m.date,
                  mood: m.mood,
                  stress: m.stress,
                  confidence: m.confidence,
                  notes: m.notes,
                }))
              : [],
            patterns: isAnalyticsMode
              ? {
                  fomoRate: "0",
                  revengeRate: "0",
                  overconfidenceRate: "0",
                  fearRate: "0",
                }
              : null,
            morningCheck: null,
            stats: {
              totalPnL: 0,
              winRate: 0,
              totalTrades: trades.length,
              averageMood: 5,
              consecutiveWins: 0,
              consecutiveLosses: 0,
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        role: "assistant",
        content: formatAIResponse(data.response),
        timestamp: new Date(),
        mode: aiMode,
        personality: aiPersonality,
      }

      setMessages((prev) => [...prev, aiMessage])

      if (!isLiveMode) {
        incrementVirtualMessageCount()
      } else {
        incrementLiveMessageCount()
      }

      toast({
        title: language === "cs" ? "Odpověď přijata" : "Response received",
        description: language === "cs" ? "AI ti odpověděl" : "AI has responded",
      })
    } catch (error) {
      console.error("Error calling MindTrader AI:", error)

      // Fallback mock response if API fails
      const mockResponse =
        language === "cs"
          ? `Rozumím tvou situaci. Podle tvých dat vidím, že máš readiness ${readinessScore !== null ? readinessScore + "%" : "Není dostupné"}.\n\nTvoje nálada je ${readinessFactors.mood}/10, stres ${readinessFactors.stress}/10.\n\n${readinessFactors.stress > 6 ? "Vysoký stres ovlivňuje tvoje rozhodování." : "Tvůj mentální stav je v pořádku."}\n\n${readinessScore !== null && readinessScore < 60 ? "🛑 Dej si pauzu, readiness je pod 60%. Dnes neobchoduj." : readinessScore !== null && readinessScore < 75 ? "⚠️ Readiness 60-74%. Buď opatrný a redukuj risk o 50%." : "✅ Readiness 75%+. Můžeš obchodovat podle plánu."}\n\nPamatuj: každý den je nový start.`
          : `I understand your situation. Based on your data, I see your readiness is ${readinessScore !== null ? readinessScore + "%" : "Not available"}.\n\nYour mood is ${readinessFactors.mood}/10, stress ${readinessFactors.stress}/10.\n\n${readinessFactors.stress > 6 ? "High stress is affecting your decision-making." : "Your mental state is okay."}\n\n${readinessScore !== null && readinessScore < 60 ? "🛑 Take a break, readiness is below 60%. Don't trade today." : readinessScore !== null && readinessScore < 75 ? "⚠️ Readiness 60-74%. Be cautious and reduce risk by 50%." : "✅ Readiness 75%+. You can trade according to your plan."}\n\nRemember: every day is a fresh start.`

      const fallbackMessage: Message = {
        role: "assistant",
        content: formatAIResponse(mockResponse),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, fallbackMessage])

      toast({
        title: language === "cs" ? "Offline režim" : "Offline mode",
        description:
          language === "cs"
            ? "Používám lokální AI odpověď (API nedostupné)"
            : "Using local AI response (API unavailable)",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateInsights = async () => {
    setIsLoading(true)
    try {
      const insightMessage =
        language === "cs"
          ? `📊 AI INSIGHTS - POSLEDNÍ TÝDEN\n\n🧠 Co se děje:\n- Tvůj průměrný readiness score: ${readinessScore !== null ? readinessScore + "%" : "Není dostupné"}\n- Spánek: ${readinessFactors.sleep}/10\n- Stres: ${readinessFactors.stress}/10\n- Nálada: ${readinessFactors.mood}/10\n\n💡 Proč se to děje:\n${readinessFactors.sleep < 7 ? "- Nedostatečný spánek ovlivňuje výkon\n" : ""}${readinessFactors.stress > 6 ? "- Vysoký stres snižuje koncentraci\n" : ""}${trades.length === 0 ? "- Zatím nemám dostatek dat z obchodů\n" : ""}\n\n🎯 Co udělat dál:\n1. ${readinessFactors.sleep < 7 ? "Zlepši kvalitu spánku (cíl 7-9h)" : "Udržuj dobré spánkové návyky"}\n2. ${readinessFactors.stress > 6 ? "Sniž stres (meditace, procházky)" : "Pokračuj v dobrém managementu stresu"}\n3. Pravidelně zapisuj do journalu\n\nDisciplína = dlouhodobý úspěch! 💪`
          : `📊 AI INSIGHTS - LAST WEEK\n\n🧠 What's happening:\n- Your average readiness score: ${readinessScore !== null ? readinessScore + "%" : "Not available"}\n- Sleep: ${readinessFactors.sleep}/10\n- Stress: ${readinessFactors.stress}/10\n- Mood: ${readinessFactors.mood}/10\n\n💡 Why it's happening:\n${readinessFactors.sleep < 7 ? "- Insufficient sleep affects performance\n" : ""}${readinessFactors.stress > 6 ? "- High stress reduces concentration\n" : ""}${trades.length === 0 ? "- Not enough trading data yet\n" : ""}\n\n🎯 What to do next:\n1. ${readinessFactors.sleep < 7 ? "Improve sleep quality (target 7-9h)" : "Maintain good sleep habits"}\n2. ${readinessFactors.stress > 6 ? "Reduce stress (meditation, walks)" : "Continue good stress management"}\n3. Journal regularly\n\nDisciplína = long-term success! 💪`

      const insightMsg: Message = {
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
        title: language === "cs" ? "Premium funkce" : "Premium feature",
        description:
          language === "cs"
            ? "Report Builder je dostupný pouze v Premium plánu."
            : "Report Builder is available only in Premium plan.",
        variant: "destructive",
      })
      return
    }

    const reportContent =
      language === "cs"
        ? `# MindTrader AI Report\n\n**Datum:** ${new Date().toLocaleDateString("cs-CZ")}\n**Readiness Score:** ${readinessScore !== null ? readinessScore + "%" : "Není dostupné"}\n\n## 📊 Přehled výkonu\n\n- Celkový počet obchodů: ${trades.length}\n- Průměrná nálada: ${readinessFactors.mood}/10\n- Úroveň stresu: ${readinessFactors.stress}/10\n\n## 🧠 Psychologické poznatky\n\n${readinessFactors.stress > 6 ? "⚠️ Vysoký stres může ovlivňovat rozhodování\n" : "✅ Stres je pod kontrolou\n"}${readinessFactors.sleep < 7 ? "⚠️ Nedostatečný spánek snižuje výkon\n" : "✅ Kvalita spánku je dobrá\n"}\n## 🎯 Doporučení\n\n1. Pokračuj v pravidelném journalingu\n2. Sleduj své readiness score před obchodováním\n3. Respektuj své mentální limity\n\n---\n\n*Vygenerováno MindTrader AI*`
        : `# MindTrader AI Report\n\n**Date:** ${new Date().toLocaleDateString("en-US")}\n**Readiness Score:** ${readinessScore !== null ? readinessScore + "%" : "Not available"}\n\n## 📊 Performance Overview\n\n- Total trades: ${trades.length}\n- Average mood: ${readinessFactors.mood}/10\n- Stress level: ${readinessFactors.stress}/10\n\n## 🧠 Psychological Insights\n\n${readinessFactors.stress > 6 ? "⚠️ High stress may affect decision-making\n" : "✅ Stress is under control\n"}${readinessFactors.sleep < 7 ? "⚠️ Insufficient sleep reduces performance\n" : "✅ Sleep quality is good\n"}\n## 🎯 Recommendations\n\n1. Continue regular journaling\n2. Monitor readiness score before trading\n3. Respect your mental limits\n\n---\n\n*Generated by MindTrader AI*`

    const blob = new Blob([reportContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindtrader-report-${new Date().toISOString().split("T")[0]}.md`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: language === "cs" ? "Report vygenerován" : "Report generated",
      description: language === "cs" ? "Report byl stažen" : "Report has been downloaded",
    })
  }

  const getReadinessColor = (score: number | null) => {
    if (score === null) return "text-gray-500"
    if (score >= 75) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getReadinessStatus = (score: number | null) => {
    if (score === null) return language === "cs" ? "Není dostupné" : "Not available"
    if (score >= 75) return language === "cs" ? "Dobré podmínky ✅" : "Good conditions ✅"
    if (score >= 60) return language === "cs" ? "Buď opatrný ⚠️" : "Be cautious ⚠️"
    return language === "cs" ? "Neobchoduj 🛑" : "Don't trade 🛑"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="md:p-6 p-4 border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="md:text-3xl text-2xl font-bold text-slate-900 dark:text-white">MindTrader AI</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {language === "cs" ? "Tvůj osobní psychologický kouč" : "Your personal psychological coach"}
              </p>
            </div>
          </div>
        </div>

        {isRecoveryMode && (
          <Alert className="mx-4 mt-4 border-orange-400 bg-orange-50 dark:bg-orange-950 border-2">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-900 dark:text-orange-200 font-medium">
              {language === "cs" ? "🚨 Recovery Mode aktivní - Dej si pauzu" : "🚨 Recovery Mode active - Take a break"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 md:p-6 p-4 h-[calc(100vh-160px)]">
          {/* Sidebar - Desktop Only */}
          <div className="lg:col-span-1 space-y-4 lg:block hidden overflow-y-auto">
            <Card className="bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {language === "cs" ? "Readiness" : "Readiness"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getReadinessColor(readinessScore)}`}>
                    {readinessScore !== null ? readinessScore + "%" : "—"}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    {getReadinessStatus(readinessScore)}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === "cs" ? "Režim AI" : "AI Mode"}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(modes).map(([key, mode]) => {
                      const Icon = mode.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setAiMode(key as any)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all font-medium text-sm ${
                            aiMode === key
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-950 text-slate-900 dark:text-amber-200"
                              : "border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
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

          {/* Main Chat Area */}
          <div className="lg:col-span-4 col-span-1 h-full flex flex-col">
            <Card className="h-full flex flex-col bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages Area */}
                <ScrollArea className="flex-1 md:p-6 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`md:max-w-[75%] max-w-[85%] rounded-lg md:p-4 p-3 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white shadow-md"
                              : message.type === "recovery"
                                ? "bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-100 border-2 border-orange-300 dark:border-orange-700"
                                : message.type === "insight"
                                  ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-100"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          <p className="md:text-base text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {message.content}
                          </p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {message.timestamp.toLocaleTimeString(language === "cs" ? "cs-CZ" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Loading State */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[75%] rounded-lg p-4 bg-slate-100 dark:bg-slate-700">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {language === "cs" ? "Analyzuji tvá data..." : "Analyzing your data..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                  <div className="md:px-6 px-4 py-3 border-t">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 block">
                      {language === "cs" ? "Rychlé dotazy:" : "Quick prompts:"}
                    </Label>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                      {quickPrompts.slice(0, 4).map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-left justify-start h-auto py-2 text-xs font-medium border-slate-300 dark:border-slate-600 hover:bg-amber-50 dark:hover:bg-slate-700 bg-transparent"
                          onClick={() => setInput(prompt)}
                        >
                          <Zap className="w-4 h-4 mr-2 flex-shrink-0 text-amber-600" />
                          <span className="truncate">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t md:p-4 p-3 bg-slate-50 dark:bg-slate-900">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder={language === "cs" ? "Napiš zprávu..." : "Type your message..."}
                        className="md:min-h-[60px] min-h-[70px] md:max-h-[100px] max-h-[120px] resize-none text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="md:h-[60px] h-[70px] px-4 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                  {!isLiveMode && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                      {language === "cs" ? `Virtual: ${virtualMessageCount}/3` : `Virtual: ${virtualMessageCount}/3`}
                    </p>
                  )}
                </div>

                {/* Mobile Mode Selector */}
                <div className="lg:hidden border-t md:p-4 p-3 bg-slate-100 dark:bg-slate-900">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <Label className="text-xs font-semibold whitespace-nowrap">
                      {language === "cs" ? "Režim:" : "Mode:"}
                    </Label>
                    {Object.entries(modes).map(([key, mode]) => (
                      <Button
                        key={key}
                        variant={aiMode === key ? "default" : "outline"}
                        size="sm"
                        className="whitespace-nowrap text-xs font-medium"
                        onClick={() => setAiMode(key as any)}
                      >
                        {mode.name.split(" ")[1]}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
