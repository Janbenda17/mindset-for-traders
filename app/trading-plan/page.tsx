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
            <p className="text-muted-foreground">Stage 3: Vytvoř dnešní trading plán</p>
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
            💡 Proč je trading plán důležitý?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-white font-semibold">
                  Eliminuje emocionální rozhodování
                </p>
                <p className="text-sm text-gray-400">
                  Když máš jasný plán PŘEDEM, neděláš impulzivní rozhodnutí během tradingu.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-white font-semibold">
                  Definuje konkrétní setupy
                </p>
                <p className="text-sm text-gray-400">
                  Místo 'něco najdu' máš jasno - budu hledat ABC setup na EUR/USD v Londýnské session.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="text-white font-semibold">
                  Chrání tvůj kapitál
                </p>
                <p className="text-sm text-gray-400">
                  Jasná pravidla pro entry, exit, SL a max počet tradů = ochrana před ztrátami.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-white font-semibold">
                  Umožňuje review a zlepšování
                </p>
                <p className="text-sm text-gray-400">
                  Večer srovnáš, co jsi naplánoval vs. co jsi udělal. Takhle se zlepšuješ!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-white font-semibold">
                  Šetří čas a energii
                </p>
                <p className="text-sm text-gray-400">
                  Nemusíš během tradingu 'vymýšlet'. Všechno máš připravené, jen to provedeš.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 font-bold mb-2">⚠️ Zlaté pravidlo:</p>
            <p className="text-sm text-gray-300">
              Pokud tvůj setup není v trading plánu, tak ho NE-TRADUJ! Improvizace = ztráty.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
