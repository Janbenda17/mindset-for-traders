"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Target, AlertTriangle, Trophy, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { TopNavigation } from "@/components/top-navigation"

const bonusItems = [
  {
    name: "Trading Rutiny",
    href: "/routines",
    icon: Sun,
    description: "Vytvoř si své ranní a večerní trading rutiny pro maximální výkon",
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-500/10 to-orange-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    name: "Trading Cíle",
    href: "/trading-goals",
    icon: Target,
    description: "Nastav si konkrétní cíle a sleduj svůj pokrok směrem k úspěchu",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    name: "Záznam Chyb",
    href: "/fail-log",
    icon: AlertTriangle,
    description: "Dokumentuj své chyby a poučuj se z nich pro lepší trading",
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-500/10 to-pink-500/10",
    borderColor: "border-red-500/30",
  },
  {
    name: "Odměny",
    href: "/rewards",
    icon: Trophy,
    description: "Motivuj se odměnami za dosažení svých trading cílů",
    color: "from-yellow-500 to-amber-500",
    bgColor: "from-yellow-500/10 to-amber-500/10",
    borderColor: "border-yellow-500/30",
  },
  {
    name: "Identita Tradera",
    href: "/trading-identity",
    icon: User,
    description: "Definuj svou identitu tradera a drž se svých principů",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-500/10 to-pink-500/10",
    borderColor: "border-purple-500/30",
  },
]

export default function BonusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <TopNavigation />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                NOVÉ
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Bonusové Nástroje
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Rozšířené nástroje pro maximalizaci tvého trading potenciálu a osobního rozvoje
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
                  
                  {/* Gradient overlay on hover */}
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
                    Proč používat bonusové nástroje?
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Tyto nástroje jsou navrženy, aby ti pomohly budovat konzistentní trading rutiny, 
                    učit se ze svých chyb a udržet motivaci na tvé cestě k úspěšnému tradingu. 
                    Každý nástroj se zaměřuje na specifickou oblast osobního a profesního rozvoje tradera.
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
