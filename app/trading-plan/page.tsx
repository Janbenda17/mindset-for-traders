"use client"

import { TradingPlan } from "@/components/trading-plan"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { useLanguage } from "@/contexts/language-context"
import { Suspense } from "react"
import TradingPlanLoading from "./loading"

export default function TradingPlanPage() {
  const { isLiveMode } = useData()
  const { language } = useLanguage()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Trading Plan
            </h1>
            <p className="text-muted-foreground">Stage 3: Create today's trading plan</p>
          </div>
        </div>
        <Badge className={isLiveMode ? "mt-4 bg-emerald-500/20 text-emerald-400" : "mt-4 bg-sky-500/20 text-sky-400"}>
          {isLiveMode ? "🔴 Live Mode" : "🎮 Demo Mode"}
        </Badge>
      </div>

      <Suspense fallback={<TradingPlanLoading />}>
        <TradingPlan />
      </Suspense>

      {/* Tips Section */}
      <Card className="mt-8 bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-blue-500/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            💡 Why Is a Trading Plan Important?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-white font-semibold">
                  Eliminates Emotional Decision Making
                </p>
                <p className="text-sm text-gray-400">
                  When you have a clear plan BEFOREHAND, you don't make impulsive decisions during trading.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-white font-semibold">
                  Defines Specific Setups
                </p>
                <p className="text-sm text-gray-400">
                  Instead of 'I'll find something', you have clarity - I'll look for ABC setup on EUR/USD during London session.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="text-white font-semibold">
                  Protects Your Capital
                </p>
                <p className="text-sm text-gray-400">
                  Clear rules for entry, exit, SL and max number of trades = protection against losses.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-white font-semibold">
                  Enables Review and Improvement
                </p>
                <p className="text-sm text-gray-400">
                  In the evening, compare what you planned vs. what you did. That's how you improve!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-white font-semibold">
                  Saves Time and Energy
                </p>
                <p className="text-sm text-gray-400">
                  You don't have to 'figure things out' during trading. Everything is prepared, you just execute.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 font-bold mb-2">⚠️ Golden Rule:</p>
            <p className="text-sm text-gray-300">
              If your setup is not in the trading plan, DON'T TRADE IT! Improvisation = losses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
