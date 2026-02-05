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
            Denní Záměr
          </h1>
          <p className="text-gray-400">
            Nastav si cíle a strategii pro dnešní trading 🎯
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
              💡 Tipy pro nastavení záměrů
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-white font-semibold">Buď konkrétní</p>
                  <p className="text-sm text-gray-400">
                    Místo 'chci vydělat peníze' napiš 'chci udělat 2-3 kvalitní obchody s riskem max 1%'
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="text-white font-semibold">
                    Risk management first
                  </p>
                  <p className="text-sm text-gray-400">
                    Vždy nejdřív nastav maximální risk, který jsi dnes ochoten ztratit. Bez toho NEOBCHODUJ!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="text-white font-semibold">
                    Emotional state matters
                  </p>
                  <p className="text-sm text-gray-400">
                    Jak se chceš cítit během tradingu? Klidný, trpělivý, soustředěný? Napiš to a pamatuj na to během dne.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-white font-semibold">
                    Co se chceš naučit?
                  </p>
                  <p className="text-sm text-gray-400">
                    Každý den je příležitost se zlepšit. Co konkrétně dnes chceš procvičit nebo zjistit?
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
