"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Zap, Gift } from "lucide-react"

export default function CheckoutSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(5)

  const checkoutUrl = searchParams.get("url")

  useEffect(() => {
    if (!checkoutUrl) {
      // No checkout URL provided, redirect back to upgrade
      router.push("/upgrade")
      return
    }

    // Start countdown for automatic redirect
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => prev - 1)
    }, 1000)

    // Auto-redirect after 5 seconds
    const timeout = setTimeout(() => {
      setIsRedirecting(true)
      window.location.href = checkoutUrl
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [checkoutUrl, router])

  const handleProceedToCheckout = () => {
    setIsRedirecting(true)
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Offer Card */}
        <Card className="relative border-2 border-yellow-500 shadow-2xl">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 text-lg">
              Speciální nabídka
            </Badge>
          </div>

          <CardHeader className="text-center pt-8">
            <CardTitle className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
              <Gift className="h-8 w-8 text-yellow-500" />
              14 Dní Zdarma
            </CardTitle>
            <p className="text-xl text-gray-300">Žádná kreditní karta nyní nezbytná</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Trial Details */}
            <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">14 Dní Bezplatného Přístupu</h3>
                  <p className="text-gray-400">Plný přístup ke všem premium funkcím bez poplatku</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Zap className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Potom 1499 Kč/měsíc</h3>
                  <p className="text-gray-400">Sleva 40% z běžné ceny (2499 Kč)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Zrušte Kdykoli</h3>
                  <p className="text-gray-400">Bez poplatků, bez dlouhodobých závazků</p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 bg-slate-900/30 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Co Získáte</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Neomezený obchodní deník
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Pokročilé analýzy a reporty
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  MindTrader AI Pro
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Export dat a reportů
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  Risk management nástroje
                </li>
              </ul>
            </div>

            {/* Proceed Button */}
            <Button
              onClick={handleProceedToCheckout}
              disabled={isRedirecting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-semibold"
            >
              {isRedirecting ? "Přesměrování na bezpečný checkout..." : "Pokračovat na Checkout"}
            </Button>

            {/* Auto-redirect info */}
            {!isRedirecting && (
              <p className="text-center text-sm text-gray-400">
                Automatické přesměrování za <span className="font-semibold text-yellow-400">{redirectCountdown}s</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            ← Vrátit se zpět
          </Button>
        </div>
      </div>
    </div>
  )
}
