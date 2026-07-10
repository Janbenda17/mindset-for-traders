"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Target, AlertTriangle, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function BonusPage() {
  const { language } = useLanguage()
  const isEn = language === "en"

  const bonusItems = [
    {
      name: isEn ? "Trading Routines" : "Obchodní rutiny",
      href: "/routines",
      icon: Sun,
      description: isEn
        ? "Create your morning and evening trading routines for maximum performance"
        : "Vytvoř si ranní a večerní obchodní rutiny pro maximální výkon",
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-500/10 to-orange-500/10",
      borderColor: "border-amber-500/30",
    },
    {
      name: isEn ? "Trading Goals" : "Obchodní cíle",
      href: "/trading-goals",
      icon: Target,
      description: isEn
        ? "Set specific goals and track your progress towards success"
        : "Nastav si konkrétní cíle a sleduj svůj pokrok k úspěchu",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      name: isEn ? "Fail Log" : "Fail Log",
      href: "/fail-log",
      icon: AlertTriangle,
      description: isEn
        ? "Document your mistakes and learn from them for better trading"
        : "Dokumentuj své chyby a uč se z nich pro lepší obchodování",
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-500/10 to-pink-500/10",
      borderColor: "border-red-500/30",
    },
    {
      name: isEn ? "Rewards" : "Odměny",
      href: "/rewards",
      icon: Trophy,
      description: isEn
        ? "Motivate yourself with rewards for achieving your trading goals"
        : "Motivuj se odměnami za dosažení svých obchodních cílů",
      color: "from-yellow-500 to-amber-500",
      bgColor: "from-yellow-500/10 to-amber-500/10",
      borderColor: "border-yellow-500/30",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                {isEn ? "NEW" : "NOVÉ"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              {isEn ? "Bonus Tools" : "Bonusové nástroje"}
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              {isEn
                ? "Extended tools to maximize your trading potential and personal development"
                : "Rozšířené nástroje pro maximalizaci vašeho obchodního potenciálu a osobního rozvoje"}
            </p>
          </div>

          {/* Bonus Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonusItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <Card className={`group relative overflow-hidden border-2 ${item.borderColor} bg-gradient-to-br ${item.bgColor} hover:scale-105 transition-all duration-300 cursor-pointer h-full`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20`}>
                        <item.icon className={`w-8 h-8 text-white`} />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {item.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Info Box */}
          <Card className="mt-12 border-slate-700 bg-slate-800/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isEn ? "Why use bonus tools?" : "Proč používat bonusové nástroje?"}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {isEn
                      ? "These tools are designed to help you build consistent trading routines, learn from your mistakes, and maintain motivation on your journey to successful trading. Each tool focuses on a specific area of trader's personal and professional development."
                      : "Tyto nástroje jsou navrženy tak, aby ti pomohly budovat konzistentní obchodní rutiny, učit se ze svých chyb a udržovat motivaci na cestě k úspěšnému obchodování. Každý nástroj se zaměřuje na konkrétní oblast osobního a profesního rozvoje obchodníka."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
