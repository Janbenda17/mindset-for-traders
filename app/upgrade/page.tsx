"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Crown, Check, Zap, Star, Brain, BarChart3, Target, Calendar } from "lucide-react"

export default function UpgradePage() {
  const { user } = useAuth()
  const { subscribe, upgradeToPremium, startTrial, isPremium, isLoading } = useSubscription()
  const router = useRouter()
  const { toast } = useToast()

  const freeFeatures = ["Základní deník tradingu", "Jednoduché analýzy", "Denní afirmace", "Základní MindTrader AI"]

  const premiumFeatures = [
    "Neomezený deník s pokročilými funkcemi",
    "Detailní analýzy a reporty",
    "Personalizované afirmace",
    "Pokročilý MindTrader AI Pro",
    "Export dat a reportů",
    "Prioritní zákaznická podpora",
    "Pokročilé psychologické metriky",
    "Osobní cíle a sledování pokroku",
  ]

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Přihlášení nutné",
        description: "Pro upgrade se musíte nejprve přihlásit.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const success = await subscribe("premium")
      if (success) {
        toast({
          title: "Upgrade úspěšný!",
          description: "Vítejte v Premium! Všechny funkce jsou nyní odemčené.",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Při upgradu došlo k chybě. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    }
  }

  const handleStartTrial = () => {
    if (!user) {
      toast({
        title: "Přihlášení nutné",
        description: "Pro trial se musíte nejprve přihlásit.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    startTrial()
    toast({
      title: "Trial aktivován!",
      description: "Váš 3-denní Premium trial byl úspěšně aktivován.",
    })
    router.push("/")
  }

  if (isPremium) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Jste Premium člen!</h1>
        <p className="text-xl text-gray-600">Děkujeme za vaši podporu. Máte přístup ke všem funkcím.</p>
        <Button asChild size="lg">
          <a href="/">Zpět na dashboard</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Upgrade na Premium</h1>
        <p className="text-gray-600 mt-2">Odemkněte plný potenciál své trading psychologie</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <Card className="border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Free plán</CardTitle>
            <CardDescription>Základní funkce zdarma</CardDescription>
            <div className="text-3xl font-bold text-gray-900 mt-4">$0</div>
            <p className="text-sm text-gray-600">navždy zdarma</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-6 bg-transparent" disabled>
              Aktuální plán
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 relative">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
            <Star className="w-3 h-3 mr-1" />
            Nejpopulárnější
          </Badge>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-blue-800">Premium plán</CardTitle>
            <CardDescription className="text-blue-700">Všechny funkce a pokročilé analýzy</CardDescription>
            <div className="text-3xl font-bold text-blue-900 mt-4">$59</div>
            <p className="text-sm text-blue-600">za měsíc</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-800">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-3 mt-6">
              <Button
                onClick={handleStartTrial}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Zap className="w-4 h-4 mr-2" />
                {isLoading ? "Načítání..." : "Začít 3-denní trial zdarma"}
              </Button>
              <Button onClick={handleUpgrade} variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                <Crown className="w-4 h-4 mr-2" />
                {isLoading ? "Načítání..." : "Upgradovat za $59/měsíc"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Porovnání funkcí</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">AI Asistent</h3>
              <p className="text-sm text-gray-600">Pokročilé AI analýzy a personalizované rady</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Detailní analýzy</h3>
              <p className="text-sm text-gray-600">Pokročilé reporty a psychologické metriky</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Osobní cíle</h3>
              <p className="text-sm text-gray-600">Nastavte a sledujte své trading cíle</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Export dat</h3>
              <p className="text-sm text-gray-600">Exportujte své data a reporty</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <Crown className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Připraveni na upgrade?</h3>
          <p className="text-blue-100 mb-6 text-lg">
            Odemkněte všechny Premium funkce a posuňte svou trading psychologii na další úroveň
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartTrial}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Zap className="w-5 h-5 mr-2" />
              Začít trial zdarma
            </Button>
            <Button
              onClick={handleUpgrade}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              disabled={isLoading}
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgradovat za $59/měsíc
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
