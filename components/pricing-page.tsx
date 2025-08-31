"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, Shield, Headphones } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"

export function PricingPage() {
  const { plan, upgradeToPremium, isActive, daysRemaining } = useSubscription()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    upgradeToPremium()
    setIsLoading(false)
  }

  const features = {
    free: [
      "Základní mood tracking",
      "Jednoduchý trading deník",
      "Základní statistiky",
      "Denní afirmace",
      "Komunitní přístup",
    ],
    premium: [
      "Pokročilé analytics",
      "AI MindTrader kouč",
      "Detailní trading deník",
      "Export dat (CSV, PDF)",
      "Pokročilé grafy a metriky",
      "Emocionální analýzy",
      "Risk management nástroje",
      "Prioritní podpora",
      "Vlastní afirmace",
      "Team Club premium funkce",
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Vyberte si svůj plán</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Začněte zdarma a upgradujte kdykoli pro přístup k pokročilým funkcím
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={`relative ${plan === "free" && !isActive ? "ring-2 ring-blue-500" : ""}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Free</CardTitle>
              {plan === "free" && !isActive && <Badge variant="secondary">Aktuální plán</Badge>}
            </div>
            <CardDescription>Perfektní pro začátečníky</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">0 Kč</span>
              <span className="text-gray-600">/měsíc</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full bg-transparent" disabled={plan === "free" && !isActive}>
              {plan === "free" && !isActive ? "Aktuální plán" : "Přejít na Free"}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={`relative ${isActive ? "ring-2 ring-yellow-500" : "ring-2 ring-blue-500"}`}>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1">
              <Star className="h-4 w-4 mr-1" />
              Nejpopulárnější
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center">
                <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                Premium
              </CardTitle>
              {isActive && (
                <Badge variant="default" className="bg-yellow-500">
                  Aktivní ({daysRemaining} dní)
                </Badge>
              )}
            </div>
            <CardDescription>Pro seriózní tradery</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">59 Kč</span>
              <span className="text-gray-600">/měsíc</span>
            </div>
            {!isActive && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Zap className="h-4 w-4 mr-1" />7 dní zdarma
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleUpgrade}
              disabled={isLoading || isActive}
            >
              {isLoading ? (
                "Aktivuji..."
              ) : isActive ? (
                "Aktivní Premium"
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Začít 7denní trial
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Comparison */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Porovnání funkcí</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Bezpečnost dat</CardTitle>
                <CardDescription>Vaše data jsou v bezpečí</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Všechna data jsou uložena lokálně ve vašem prohlížeči. Žádné sdílení s třetími stranami.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle>Rychlý start</CardTitle>
                <CardDescription>Začněte během minut</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Žádná složitá registrace. Začněte trackovat své emoce a výkonnost okamžitě.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Headphones className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Podpora 24/7</CardTitle>
                <CardDescription>Jsme tu pro vás</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Premium uživatelé mají prioritní přístup k naší podpoře a komunitě expertů.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Často kladené otázky</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mohu zrušit kdykoli?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ano, můžete zrušit své předplatné kdykoli. Žádné skryté poplatky nebo závazky.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Co zahrnuje 7denní trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Plný přístup ke všem Premium funkcím po dobu 7 dní zdarma. Žádná platební karta není vyžadována.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jsou moje data v bezpečí?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ano, všechna data jsou uložena lokálně ve vašem prohlížeči. Nemáme přístup k vašim osobním trading
                datům.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
