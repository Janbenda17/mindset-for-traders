"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Send,
  Loader2,
  Heart,
  Target,
  Zap,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  RefreshCw,
  Sparkles,
  BarChart2,
  Wind,
  Activity,
  Moon,
  Utensils,
  Lock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserData } from "@/utils/storage-utils"
import { useData } from "@/contexts/data-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useLanguage } from "@/contexts/language-context"

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
  const [aiMode, setAiMode] = useState<"coach" | "analyst" | "mentor">("coach")
  const [aiPersonality, setAiPersonality] = useState<"calm" | "strict" | "analytical" | "balanced">("calm")

  // Readiness Data (loaded from Daily Tracker)
  const [readinessScore, setReadinessScore] = useState(0)
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

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userData = getUserData()
  const moodEntries = userData.moodEntries || []
  const journalEntries = getAllJournalEntries()
  const trades = getAllTrades()

  // Load readiness data from Daily Tracker
  useEffect(() => {
    loadReadinessFromTracker()
  }, [isLiveMode])

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

          // Check if should activate recovery mode
          const shouldActivateRecovery =
            todayEntry.ai_score < 50 ||
            todayEntry.mental_state.stress_level > 7 ||
            todayEntry.mental_state.mood < 4 ||
            todayEntry.trading_session.profit_loss < -500

          if (shouldActivateRecovery && !isRecoveryMode) {
            setIsRecoveryMode(true)
            setTimeout(() => {
              triggerRecoveryMode()
            }, 500)
          }
        } else {
          // Use defaults if no entry for today
          setReadinessScore(70)
        }
      }
    } catch (error) {
      console.error("Error loading readiness from tracker:", error)
    }
  }

  useEffect(() => {
    if (!isLiveMode) {
      const stored = localStorage.getItem("mindtrader-virtual-message-count")
      if (stored) {
        setVirtualMessageCount(Number.parseInt(stored, 10))
      }
    }
  }, [isLiveMode])

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
    coach: {
      name: language === "cs" ? "🧠 Mind Coach" : "🧠 Mind Coach",
      description: language === "cs" ? "Psychologická podpora s emocemi" : "Psychological support with emotions",
      icon: Brain,
      locked: false,
    },
    analyst: {
      name: language === "cs" ? "📊 Trade Analyst" : "📊 Trade Analyst",
      description: language === "cs" ? "Analyzuje obchody a výsledky" : "Analyzes trades and results",
      icon: TrendingUp,
      locked: false,
    },
    mentor: {
      name: language === "cs" ? "🎓 Mentor Assistant" : "🎓 Mentor Assistant",
      description: language === "cs" ? "Pomáhá koučům s mentoring" : "Helps coaches with mentoring",
      icon: Users,
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
          ? `Ahoj! Jsem tvůj MindTrader AI kouč. 🧠\n\nViděl jsem tvoje data a jsem tady, abych ti pomohl s psychologií tradování.\n\nTvoje aktuální readiness skóre: ${readinessScore}%\n\nCo tě trápí? Jak ti můžu pomoct?`
          : `Hi! I'm your MindTrader AI coach. 🧠\n\nI've seen your data and I'm here to help you with trading psychology.\n\nYour current readiness score: ${readinessScore}%\n\nWhat's troubling you? How can I help?`

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (!isLiveMode && virtualMessageCount >= 3) {
      toast({
        title: language === "cs" ? "Limit dosažen" : "Limit reached",
        description:
          language === "cs"
            ? "Virtual Mode má limit 3 zpráv celkově. Přepni na Live Mode pro neomezené zprávy."
            : "Virtual Mode has a 3 message limit total. Switch to Live Mode for unlimited messages.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      mode: aiMode,
      personality: aiPersonality,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    if (!isLiveMode) {
      incrementVirtualMessageCount()
    }

    try {
      const dailyTrackerKey = isLiveMode ? "daily-tracker-entries-live" : "daily-tracker-entries-virtual"
      const storedTracker = localStorage.getItem(dailyTrackerKey)
      let realMood = 5
      let realStress = 5
      let realConfidence = 5
      let realReadiness = 50

      if (storedTracker) {
        const trackerEntries = JSON.parse(storedTracker)
        const today = new Date().toISOString().split("T")[0]
        const todayEntry = trackerEntries.find((e: any) => e.date === today)

        if (todayEntry) {
          realMood = todayEntry.mental_state?.mood || 5
          realStress = todayEntry.mental_state?.stress_level || 5
          realConfidence = todayEntry.mental_state?.confidence || 5
          realReadiness = todayEntry.ai_score || 50
        }
      }

      // Calculate stats from trades
      const recentTrades = trades.slice(0, 20)
      const totalPnL = recentTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
      const winningTrades = recentTrades.filter((t) => (t.pnl || 0) > 0).length
      const winRate = recentTrades.length > 0 ? (winningTrades / recentTrades.length) * 100 : 0

      const consecutiveLosses = (() => {
        let losses = 0
        for (const trade of recentTrades) {
          if ((trade.pnl || 0) < 0) losses++
          else break
        }
        return losses
      })()

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
            mood: realMood,
            stress: realStress,
            confidence: realConfidence,
            readiness: realReadiness,
          },
          userData: {
            trades: recentTrades.map((t) => ({
              id: t.id,
              date: t.date,
              pair: t.pair,
              type: t.type,
              pnl: t.pnl,
              notes: t.notes,
              mood: t.mood,
              confidence: t.confidence,
              stress: t.stress,
            })),
            journals: journalEntries.slice(0, 10).map((j) => ({
              id: j.id,
              date: j.date,
              title: j.title,
              content: j.content || "",
              type: j.type,
              mood: j.mood,
              confidence: j.confidence,
              stress: j.stress,
              tags: j.tags,
            })),
            moodHistory: moodEntries.slice(0, 7).map((m) => ({
              date: m.date,
              mood: m.mood,
              stress: m.stress,
              confidence: m.confidence,
              notes: m.notes,
            })),
            stats: {
              totalPnL,
              winRate,
              totalTrades: recentTrades.length,
              averageMood: realMood,
              consecutiveWins: 0,
              consecutiveLosses,
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

      toast({
        title: language === "cs" ? "Odpověď přijata" : "Response received",
        description: language === "cs" ? "AI ti odpověděl" : "AI has responded",
      })
    } catch (error) {
      console.error("Error calling MindTrader AI:", error)

      // Fallback mock response if API fails
      const mockResponse =
        language === "cs"
          ? `Rozumím tvé situaci. Podle tvých dat vidím, že máš readiness ${readinessScore}%.\n\nTvoje nálada je ${readinessFactors.mood}/10, stres ${readinessFactors.stress}/10.\n\n${readinessFactors.stress > 6 ? "Vysoký stres ovlivňuje tvoje rozhodování." : "Tvůj mentální stav je v pořádku."}\n\n${readinessScore < 60 ? "Dej si pauzu, readiness je pod 60%." : "Můžeš obchodovat, ale buď opatrný."}\n\nPamatuj: každý den je nový start.`
          : `I understand your situation. Based on your data, I see your readiness is ${readinessScore}%.\n\nYour mood is ${readinessFactors.mood}/10, stress ${readinessFactors.stress}/10.\n\n${readinessFactors.stress > 6 ? "High stress is affecting your decision-making." : "Your mental state is okay."}\n\n${readinessScore < 60 ? "Take a break, readiness is below 60%." : "You can trade, but be careful."}\n\nRemember: every day is a fresh start.`

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
          ? `📊 AI INSIGHTS - POSLEDNÍ TÝDEN\n\n🧠 Co se děje:\n- Tvůj průměrný readiness score: ${readinessScore}%\n- Spánek: ${readinessFactors.sleep}/10\n- Stres: ${readinessFactors.stress}/10\n- Nálada: ${readinessFactors.mood}/10\n\n💡 Proč se to děje:\n${readinessFactors.sleep < 7 ? "- Nedostatečný spánek ovlivňuje výkon\n" : ""}${readinessFactors.stress > 6 ? "- Vysoký stres snižuje koncentraci\n" : ""}${trades.length === 0 ? "- Zatím nemám dostatek dat z obchodů\n" : ""}\n\n🎯 Co udělat dál:\n1. ${readinessFactors.sleep < 7 ? "Zlepši kvalitu spánku (cíl 7-9h)" : "Udržuj dobré spánkové návyky"}\n2. ${readinessFactors.stress > 6 ? "Sniž stres (meditace, procházky)" : "Pokračuj v dobrém managementu stresu"}\n3. Pravidelně zapisuj do journalu\n\nDisciplína = dlouhodobý úspěch! 💪`
          : `📊 AI INSIGHTS - LAST WEEK\n\n🧠 What's happening:\n- Your average readiness score: ${readinessScore}%\n- Sleep: ${readinessFactors.sleep}/10\n- Stress: ${readinessFactors.stress}/10\n- Mood: ${readinessFactors.mood}/10\n\n💡 Why it's happening:\n${readinessFactors.sleep < 7 ? "- Insufficient sleep affects performance\n" : ""}${readinessFactors.stress > 6 ? "- High stress reduces concentration\n" : ""}${trades.length === 0 ? "- Not enough trading data yet\n" : ""}\n\n🎯 What to do next:\n1. ${readinessFactors.sleep < 7 ? "Improve sleep quality (target 7-9h)" : "Maintain good sleep habits"}\n2. ${readinessFactors.stress > 6 ? "Reduce stress (meditation, walks)" : "Continue good stress management"}\n3. Journal regularly\n\nDisciplína = long-term success! 💪`

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
        ? `# MindTrader AI Report\n\n**Datum:** ${new Date().toLocaleDateString("cs-CZ")}\n**Readiness Score:** ${readinessScore}%\n\n## 📊 Přehled výkonu\n\n- Celkový počet obchodů: ${trades.length}\n- Průměrná nálada: ${readinessFactors.mood}/10\n- Úroveň stresu: ${readinessFactors.stress}/10\n\n## 🧠 Psychologické poznatky\n\n${readinessFactors.stress > 6 ? "⚠️ Vysoký stres může ovlivňovat rozhodování\n" : "✅ Stres je pod kontrolou\n"}${readinessFactors.sleep < 7 ? "⚠️ Nedostatečný spánek snižuje výkon\n" : "✅ Kvalita spánku je dobrá\n"}\n## 🎯 Doporučení\n\n1. Pokračuj v pravidelném journalingu\n2. Sleduj své readiness score před obchodováním\n3. Respektuj své mentální limity\n\n---\n\n*Vygenerováno MindTrader AI*`
        : `# MindTrader AI Report\n\n**Date:** ${new Date().toLocaleDateString("en-US")}\n**Readiness Score:** ${readinessScore}%\n\n## 📊 Performance Overview\n\n- Total trades: ${trades.length}\n- Average mood: ${readinessFactors.mood}/10\n- Stress level: ${readinessFactors.stress}/10\n\n## 🧠 Psychological Insights\n\n${readinessFactors.stress > 6 ? "⚠️ High stress may affect decision-making\n" : "✅ Stress is under control\n"}${readinessFactors.sleep < 7 ? "⚠️ Insufficient sleep reduces performance\n" : "✅ Sleep quality is good\n"}\n## 🎯 Recommendations\n\n1. Continue regular journaling\n2. Monitor readiness score before trading\n3. Respect your mental limits\n\n---\n\n*Generated by MindTrader AI*`

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

  const getReadinessColor = (score: number) => {
    if (score >= 75) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getReadinessStatus = (score: number) => {
    if (score >= 75) return language === "cs" ? "Výborné" : "Excellent"
    if (score >= 50) return language === "cs" ? "Dobré" : "Good"
    return language === "cs" ? "Slabé" : "Poor"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {language === "cs" ? "MindTrader AI" : "MindTrader AI"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === "cs" ? "Tvůj osobní psychologický kouč 24/7" : "Your personal psychology coach 24/7"}
                </p>
              </div>
            </div>
            <Badge className={isPremium ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gray-700"}>
              {isPremium ? (language === "cs" ? "Premium" : "Premium") : language === "cs" ? "Free" : "Free"}
            </Badge>
          </div>

          {/* Recovery Mode Alert */}
          {isRecoveryMode && (
            <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                {language === "cs"
                  ? "🚨 Recovery Mode aktivní - AI detekoval obtížný den. Následuj doporučení níže."
                  : "🚨 Recovery Mode active - AI detected a difficult day. Follow recommendations below."}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Readiness Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{language === "cs" ? "Readiness Score" : "Readiness Score"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getReadinessColor(readinessScore)}`}>{readinessScore}%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getReadinessStatus(readinessScore)}
                    </p>
                  </div>
                  <Progress value={readinessScore} className="h-2" />

                  {/* Readiness Factors Display */}
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === "cs" ? "Načteno z Daily Trackeru:" : "Loaded from Daily Tracker:"}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-blue-500" />
                          <Label className="text-xs">{language === "cs" ? "Spánek" : "Sleep"}</Label>
                        </div>
                        <span className="text-xs font-medium">{readinessFactors.sleep}/10</span>
                      </div>
                      <Progress value={readinessFactors.sleep * 10} className="h-1" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-red-500" />
                          <Label className="text-xs">{language === "cs" ? "Stres" : "Stress"}</Label>
                        </div>
                        <span className="text-xs font-medium">{readinessFactors.stress}/10</span>
                      </div>
                      <Progress value={readinessFactors.stress * 10} className="h-1" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-green-500" />
                          <Label className="text-xs">{language === "cs" ? "Rutina" : "Routine"}</Label>
                        </div>
                        <span className="text-xs font-medium">{readinessFactors.routine}/10</span>
                      </div>
                      <Progress value={readinessFactors.routine * 10} className="h-1" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-orange-500" />
                          <Label className="text-xs">{language === "cs" ? "Výživa" : "Nutrition"}</Label>
                        </div>
                        <span className="text-xs font-medium">{readinessFactors.nutrition}/10</span>
                      </div>
                      <Progress value={readinessFactors.nutrition * 10} className="h-1" />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 bg-transparent"
                      onClick={loadReadinessFromTracker}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      {language === "cs" ? "Obnovit data" : "Refresh data"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{language === "cs" ? "AI Nastavení" : "AI Configuration"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{language === "cs" ? "Režim AI" : "AI Mode"}</Label>
                    <div className="space-y-1">
                      {Object.entries(modes).map(([key, mode]) => (
                        <Button
                          key={key}
                          variant={aiMode === key ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => !mode.locked && setAiMode(key as any)}
                          disabled={mode.locked}
                        >
                          <mode.icon className="w-3 h-3 mr-2" />
                          {mode.name}
                          {mode.locked && <Lock className="w-3 h-3 ml-auto" />}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{language === "cs" ? "Osobnost AI" : "AI Personality"}</Label>
                    <div className="space-y-1">
                      {Object.entries(personalities).map(([key, personality]) => (
                        <Button
                          key={key}
                          variant={aiPersonality === key ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => !personality.locked && setAiPersonality(key as any)}
                          disabled={personality.locked}
                        >
                          <personality.icon className="w-3 h-3 mr-2" />
                          {personality.name}
                          {personality.locked && <Lock className="w-3 h-3 ml-auto" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{language === "cs" ? "Rychlé akce" : "Quick Actions"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" className="w-full" onClick={generateInsights} disabled={isLoading}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Generovat Insights" : "Generate Insights"}
                  </Button>
                  <Button size="sm" className="w-full" onClick={generateReport} disabled={isLoading || !isPremium}>
                    <FileText className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Generovat Report" : "Generate Report"}
                    {!isPremium && <Lock className="w-3 h-3 ml-auto" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setMessages([])
                      setIsRecoveryMode(false)
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === "cs" ? "Vymazat chat" : "Clear chat"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-200px)]">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-4 ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                : message.type === "recovery"
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                  : message.type === "insight"
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {message.role === "assistant" && (
                                <div className="p-2 bg-white/20 rounded-lg mt-1">
                                  <Brain className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                <span className="text-xs opacity-60 mt-2 block">
                                  {message.timestamp.toLocaleTimeString(language === "cs" ? "cs-CZ" : "en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-2xl p-4 bg-slate-100 dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Brain className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {language === "cs" ? "Analyzuji..." : "Analyzing..."}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Quick Prompts */}
                  {messages.length <= 1 && (
                    <div className="px-6 py-3 border-t">
                      <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                        {language === "cs" ? "Rychlé dotazy:" : "Quick prompts:"}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {quickPrompts.slice(0, 4).map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-left justify-start h-auto py-2 text-xs bg-transparent"
                            onClick={() => setInput(prompt)}
                          >
                            <Zap className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{prompt}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="border-t p-4 bg-slate-50 dark:bg-slate-900">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSend()
                            }
                          }}
                          placeholder={
                            language === "cs"
                              ? "Napiš zprávu... (Enter = odeslat, Shift+Enter = nový řádek)"
                              : "Type a message... (Enter = send, Shift+Enter = new line)"
                          }
                          className="min-h-[60px] max-h-[120px] resize-none"
                          disabled={isLoading}
                        />
                      </div>
                      <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-[60px] px-6">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {!isLiveMode && (
                        <>
                          {language === "cs"
                            ? `Virtual Mode: ${virtualMessageCount}/3 zpráv použito`
                            : `Virtual Mode: ${virtualMessageCount}/3 messages used`}
                        </>
                      )}
                      {isLiveMode && (
                        <>{language === "cs" ? "Live Mode: Neomezené zprávy" : "Live Mode: Unlimited messages"}</>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
