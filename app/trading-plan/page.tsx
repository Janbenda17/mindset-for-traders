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
  const isEn = language === "en"

  const txt = {
    title: isEn ? "Trading Plan" : "Obchodní plán",
    subtitle: isEn ? "Stage 3: Create today's trading plan" : "Etapa 3: Vytvoř si dnešní obchodní plán",
    liveMode: "🔴 Live Mode",
    demoMode: "🎮 Demo Mode",
    whyImportant: isEn ? "💡 Why Is a Trading Plan Important?" : "💡 Proč je obchodní plán důležitý?",
    emotionalTitle: isEn ? "Eliminates Emotional Decision Making" : "Eliminuje emoční rozhodování",
    emotionalDesc: isEn ? "When you have a clear plan BEFOREHAND, you don't make impulsive decisions during trading." : "Pokud máš jasný plán PŘEDEM, neuděláš během obchodování impulsivní rozhodnutí.",
    setupsTitle: isEn ? "Defines Specific Setups" : "Definuje specifické setupy",
    setupsDesc: isEn ? "Instead of 'I'll find something', you have clarity - I'll look for ABC setup on EUR/USD during London session." : "Místo 'Najdu něco', máš jasnost - budu hledat ABC setup na EUR/USD během londýnské session.",
    capitalTitle: isEn ? "Protects Your Capital" : "Chrání tvůj kapitál",
    capitalDesc: isEn ? "Clear rules for entry, exit, SL and max number of trades = protection against losses." : "Jasná pravidla pro vstup, výstup, SL a maximální počet obchodů = ochrana proti ztrátám.",
    reviewTitle: isEn ? "Enables Review and Improvement" : "Umožňuje kontrolu a zlepšení",
    reviewDesc: isEn ? "In the evening, compare what you planned vs. what you did. That's how you improve!" : "Večer porovnej co jsi plánoval vs co jsi dělal. Takto se zlepšuješ!",
    timeTitle: isEn ? "Saves Time and Energy" : "Ušetří čas a energii",
    timeDesc: isEn ? "You don't have to 'figure things out' during trading. Everything is prepared, you just execute." : "Nemusíš během obchodování 'vymýšlet'. Všechno je připraveno, jen provádíš.",
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              {txt.title}
            </h1>
            <p className="text-muted-foreground">{txt.subtitle}</p>
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
            {txt.whyImportant}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-white font-semibold">
                  {txt.emotionalTitle}
                </p>
                <p className="text-sm text-gray-400">
                  {txt.emotionalDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-white font-semibold">
                  {txt.setupsTitle}
                </p>
                <p className="text-sm text-gray-400">
                  {txt.setupsDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="text-white font-semibold">
                  {txt.capitalTitle}
                </p>
                <p className="text-sm text-gray-400">
                  {txt.capitalDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-white font-semibold">
                  {txt.reviewTitle}
                </p>
                <p className="text-sm text-gray-400">
                  {txt.reviewDesc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-white font-semibold">
                  {txt.timeTitle}
                </p>
                <p className="text-sm text-gray-400">
                  {txt.timeDesc}
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
