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
            {language === "cs" ? "Denní Záměr" : "Daily Intention"}
          </h1>
          <p className="text-gray-400">
            {language === "cs"
              ? "Nastav si cíle a strategii pro dnešní trading 🎯"
              : "Set your goals and strategy for today's trading 🎯"}
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
              💡 {language === "cs" ? "Tipy pro nastavení záměrů" : "Tips for setting intentions"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-white font-semibold">{language === "cs" ? "Buď konkrétní" : "Be specific"}</p>
                  <p className="text-sm text-gray-400">
                    {language === "cs"
                      ? "Místo 'chci vydělat peníze' napiš 'chci udělat 2-3 kvalitní obchody s riskem max 1%'"
                      : "Instead of 'I want to make money' write 'I want to make 2-3 quality trades with max 1% risk'"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="text-white font-semibold">
                    {language === "cs" ? "Risk management first" : "Risk management first"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "cs"
                      ? "Vždy nejdřív nastav maximální risk, který jsi dnes ochoten ztratit. Bez toho NEOBCHODUJ!"
                      : "Always set the maximum risk you're willing to lose today first. Don't trade without it!"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="text-white font-semibold">
                    {language === "cs" ? "Emotional state matters" : "Emotional state matters"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "cs"
                      ? "Jak se chceš cítit během tradingu? Klidný, trpělivý, soustředěný? Napiš to a pamatuj na to během dne."
                      : "How do you want to feel while trading? Calm, patient, focused? Write it down and remember it during the day."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-white font-semibold">
                    {language === "cs" ? "Co se chceš naučit?" : "What do you want to learn?"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === "cs"
                      ? "Každý den je příležitost se zlepšit. Co konkrétně dnes chceš procvičit nebo zjistit?"
                      : "Every day is an opportunity to improve. What specifically do you want to practice or find out today?"}
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
