"use client"

import { MorningAssessment } from "@/components/morning-assessment"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { Sun, TrendingUp, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function MorningCheckPage() {
  const { isLiveMode } = useData()
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <Sun className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Morning Check
                    </h1>
                    <p className="text-muted-foreground">
                      {isLiveMode
                        ? "Morning assessment of your trading readiness 🌅"
                        : "Demo - Try morning routine! 🎮"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  className={
                    isLiveMode
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-base px-6 py-2 rounded-full"
                      : "bg-sky-500/20 text-sky-400 border-sky-500/30 text-base px-6 py-2 rounded-full"
                  }
                >
                  {isLiveMode ? "🔴 Live" : "🎮 Virtual"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-orange-500/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Sun className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="font-bold text-white">Morning Routine</h3>
              </div>
              <p className="text-sm text-gray-400">
                Discover your trading readiness before opening the platform
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-green-500/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-bold text-white">GO/NO-GO</h3>
              </div>
              <p className="text-sm text-gray-400">
                Get clear decision whether to trade today or take a break
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm border border-purple-500/30 hover:scale-105 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-white">Only 5 minutes</h3>
              </div>
              <p className="text-sm text-gray-400">
                Quick assessment of your sleep, energy and mental state
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Assessment Component */}
        <MorningAssessment />
      </div>
    </div>
  )
}
