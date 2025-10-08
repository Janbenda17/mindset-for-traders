"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserData } from "@/utils/storage-utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function MindTraderPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Ahoj! Jsem MindTrader AI, tvůj osobní psychologický kouč pro trading. Jak se dnes cítíš? Můžeme si promluvit o tvém trading mindset, emocích nebo jakémkoli problému, který tě trápí.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentState, setCurrentState] = useState({
    mood: 7,
    stress: 5,
    confidence: 7,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load current state from latest mood entry
    const userData = getUserData()
    const moodEntries = userData.moodEntries || []
    if (moodEntries.length > 0) {
      const latest = moodEntries[moodEntries.length - 1]
      setCurrentState({
        mood: latest.mood || 7,
        stress: latest.stress || 5,
        confidence: latest.confidence || 7,
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("📤 Sending request to API...")

      const response = await fetch("/api/mindtrader/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input.trim() }),
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const data = await response.json()
      console.log("✅ Response data:", data)

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      toast({
        title: "✅ Odpověď přijata",
        description: "MindTrader AI odpověděl na tvou zprávu",
      })
    } catch (error: any) {
      console.error("❌ Error:", error)

      toast({
        title: "❌ Chyba",
        description: error.message || "Nepodařilo se získat odpověď od AI",
        variant: "destructive",
      })

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Omlouvám se, ale vyskytla se chyba: ${error.message}. Zkus to prosím znovu.`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickQuestions = [
    "Jak se dnes cítím pro trading?",
    "Jak zvládnout ztrátu?",
    "Jak bojovat se strachem?",
    "Jak zlepšit disciplínu?",
  ]

  const getReadinessScore = () => {
    const score = (currentState.mood * 0.4 + (10 - currentState.stress) * 0.3 + currentState.confidence * 0.3) * 10
    return Math.round(score)
  }

  const getReadinessColor = (score: number) => {
    if (score >= 75) return "text-green-400"
    if (score >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">MindTrader AI</h1>
              <p className="text-gray-400">Tvůj osobní psychologický kouč pro trading</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Current State Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-sm">Aktuální stav</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Nálada</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{currentState.mood}/10</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Stres</span>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {currentState.stress}/10
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Důvěra</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {currentState.confidence}/10
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Trading Readiness</span>
                    <span className={`text-2xl font-bold ${getReadinessColor(getReadinessScore())}`}>
                      {getReadinessScore()}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        getReadinessScore() >= 75
                          ? "bg-green-500"
                          : getReadinessScore() >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${getReadinessScore()}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Questions */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-sm">Rychlé otázky</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2 px-3 bg-slate-800/50 border-slate-700 text-gray-300 hover:bg-slate-800 hover:text-white text-sm"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl h-[calc(100vh-250px)]">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-slate-800/80 text-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {message.role === "assistant" && (
                            <div className="p-2 bg-purple-500/20 rounded-lg mt-1">
                              <Brain className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <span className="text-xs opacity-60 mt-2 block">
                              {message.timestamp.toLocaleTimeString("cs-CZ", {
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
                      <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Brain className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            <span className="text-sm text-gray-400">MindTrader přemýšlí...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-700 p-4 bg-slate-900/30">
                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Napiš svou zprávu... (Shift+Enter pro nový řádek)"
                      className="flex-1 min-h-[60px] max-h-[120px] bg-slate-800 border-slate-700 text-white resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-[60px] px-6"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Použij Shift+Enter pro nový řádek, Enter pro odeslání
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
