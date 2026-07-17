"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Gift,
  Shield,
  Zap,
  Clock,
} from "lucide-react"
import Link from "next/link"

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cI8wQ6U01QIfee8jy18601"

export default function WelcomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    setUserEmail(user.email)
  }, [user, router])

  if (!user) {
    return null
  }

  const stripeUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(userEmail)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 blur-3xl -z-10 animate-pulse" />

          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mb-6 shadow-2xl shadow-green-500/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-lg opacity-50 animate-pulse" />
            <CheckCircle className="w-12 h-12 text-white relative z-10" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Vítejte,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              {user.name}!
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Váš účet byl úspěšně vytvořen 🎉</p>
        </div>

        {/* Premium Upsell Card */}
        <Card className="bg-gradient-to-br from-green-600 to-emerald-600 border-0 shadow-2xl shadow-green-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <CardContent className="pt-8 pb-8 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Gift className="w-8 h-8 text-white animate-bounce" />
              <h2 className="text-3xl font-bold text-white">Odemkněte Premium</h2>
            </div>
            <p className="text-center text-green-50 text-lg mb-6">
              Získejte okamžitý přístup ke všem funkcím Trader Mindset
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <CheckCircle className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Aktivace ihned</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <CheckCircle className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Plný přístup</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <CheckCircle className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Kdykoli zrušit</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <CheckCircle className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">1149 Kč/měsíc</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={stripeUrl} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-green-600 font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:scale-105 transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Aktivovat Premium
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-xl bg-transparent"
                >
                  Prozatím přeskočit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">MindTrader AI</h3>
              <p className="text-gray-400 mb-4">
                Pokročilá AI analýza vašeho tradingu s personalizovanými doporučeními a insights
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Chytré trading insights
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Emotivní analýza
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Pattern detection
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pokročilé Analytics</h3>
              <p className="text-gray-400 mb-4">Detailní statistiky a analýzy vašeho trading performance</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Win rate tracking
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Risk management
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Performance grafy
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Daily Tracker</h3>
              <p className="text-gray-400 mb-4">Sledujte své denní návyky a jejich vliv na trading výkon</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Spánek & energie
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Mentální stav
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  AI skóre
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="pt-6 pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Team Club</h3>
              <p className="text-gray-400 mb-4">Připojte se ke komunitě traderů a sdílejte zkušenosti</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Mentoring program
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Trading challenges
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  Live sessions
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/30">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-sm text-gray-300 font-semibold">Zabezpečená platba</p>
            <p className="text-xs text-gray-500">Stripe & SSL</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-300 font-semibold">Okamžitý přístup</p>
            <p className="text-xs text-gray-500">Ihned po aktivaci</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-300 font-semibold">Zrušit kdykoli</p>
            <p className="text-xs text-gray-500">Bez závazků</p>
          </div>
        </div>
      </div>
    </div>
  )
}
