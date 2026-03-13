"use client"

import { DailyIntention } from "@/components/daily-intention"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useLanguage } from "@/contexts/language-context"

export default function DailyIntentionPage() {
  const { isLiveMode } = useData()
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-12">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Daily Intention
          </h1>
          <p className="text-gray-400">
            Set your goals and strategy for today's trading 🎯
          </p>
          <Badge className={isLiveMode ? "mt-4 bg-emerald-500/20 text-emerald-400" : "mt-4 bg-sky-500/20 text-sky-400"}>
            {isLiveMode ? "🔴 Live Mode" : "🎮 Demo Mode"}
          </Badge>
        </div>

        {/* Main Component */}
        <DailyIntention />

        {/* Tips Section */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-blue-500/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              💡 Tips for Setting Intentions
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-white font-semibold">Be Specific</p>
                  <p className="text-sm text-gray-400">
                    Instead of 'I want to make money' write 'I want to make 2-3 quality trades with max 1% risk'
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="text-white font-semibold">
                    Risk Management First
                  </p>
                  <p className="text-sm text-gray-400">
                    Always set your maximum risk first - the amount you're willing to lose today. Without this - DO NOT TRADE!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="text-white font-semibold">
                    Emotional State Matters
                  </p>
                  <p className="text-sm text-gray-400">
                    How do you want to feel during trading? Calm, patient, focused? Write it down and remember it throughout the day.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-white font-semibold">
                    What Do You Want to Learn?
                  </p>
                  <p className="text-sm text-gray-400">
                    Every day is an opportunity to improve. What specifically do you want to practice or discover today?
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
