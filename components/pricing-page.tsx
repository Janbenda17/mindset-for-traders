"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Crown, Loader2, ArrowRight, TrendingUp, Brain, Target } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function PricingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPremium, isLoading } = useSubscription()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const plan = "free" // Declare plan variable
  const isActive = false // Declare isActive variable
  const daysRemaining = 0 // Declare daysRemaining variable

  // If user is premium, redirect to dashboard
  if (!isLoading && isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Máš Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Jsi již přihlášen k našemu Premium plánu. Přejeď do Live Mode pro přístup k pokročilým funkcím.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Zpět na Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/auth/sign-up")
      return
    }

    setIsLoadingCheckout(true)
    try {
      console.log("[v0] Starting checkout for user:", user.email)
      
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: "premium" }),
      })

      const data = await response.json()
      console.log("[v0] Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout")
      }

      if (data.url) {
        console.log("[v0] Redirecting to checkout...")
        // Use a link redirect instead of window.location
        const link = document.createElement("a")
        link.href = data.url
        link.click()
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("[v0] Checkout error:", error)
      alert("Chyba: " + (error instanceof Error ? error.message : "Neznámá chyba"))
      setIsLoadingCheckout(false)
    }
  }

  const features = {
    free: [
      "Pouze Virtuální Režim",
      "Průzkum rozhraní a funkcí",
      "Základní deník (Virtuální data)",
      "Základní mood tracking",
      "Komunitní přístup",
    ],
    premium: [
      "Přepnutí do Live Režimu",
      "Reálné statistiky a trading",
      "Pokročilé analytics & grafy",
      "AI MindTrader kouč (Neomezeně)",
      "Detailní trading deník s fotkami",
      "Export dat (CSV, PDF)",
      "Hloubkové emocionální analýzy",
      "Risk management kalkulačka",
      "Prioritní podpora 24/7",
      "Team Club premium funkce",
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            🚀 Investujte do své psychologie
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Vyberte si plán pro{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              ziskový trading
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Profesionální nástroje pro ovládnutí vaší mysli a trhů. Začněte zdarma, upgradujte pro maximální výkon.
          </p>

          {/* Billing Toggle (Visual only for now as requested) */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billingCycle === "monthly" ? "text-gray-900 dark:text-white" : "text-gray-500",
              )}
            >
              Měsíčně
            </span>
            <button
              onClick={() => setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                billingCycle === "yearly" ? "text-gray-900 dark:text-white" : "text-gray-500",
              )}
            >
              Ročně <span className="text-green-500 text-xs ml-1 font-bold">(-20%)</span>
            </span>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card
            className={cn(
              "relative flex flex-col border-2 transition-all duration-300 hover:shadow-xl",
              plan === "free" && !isActive
                ? "border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-gray-900/50"
                : "border-gray-200 dark:border-gray-800",
            )}
          >
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl font-bold">Starter</CardTitle>
                {plan === "free" && !isActive && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    Aktuální plán
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                Virtuální režim pro seznámení s platformou bez rizika.
              </CardDescription>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold tracking-tight">0 Kč</span>
                <span className="text-gray-500 ml-2 text-lg">/měsíc</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-8">
              <Button
                variant="outline"
                className="w-full h-12 text-lg font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                disabled={plan === "free" && !isActive}
              >
                {plan === "free" && !isActive ? "Váš aktuální plán" : "Začít zdarma"}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card
            className={cn(
              "relative flex flex-col border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl",
              isActive ? "border-yellow-500/50 shadow-yellow-500/10" : "border-blue-600 shadow-blue-600/10",
            )}
          >
            <div className="absolute -top-5 left-0 right-0 flex justify-center">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1.5 text-sm font-semibold shadow-lg uppercase tracking-wide">
                <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                Doporučeno
              </Badge>
            </div>
            <CardHeader className="pb-8 pt-10 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl font-bold flex items-center text-blue-700 dark:text-blue-400">
                  <Crown className="h-6 w-6 mr-2 text-yellow-500 fill-yellow-500" />
                  Pro Trader
                </CardTitle>
                {isActive && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Aktivní ({daysRemaining} dní)
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                Odemkněte Live Režim a začněte budovat reálnou kariéru.
              </CardDescription>
              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {billingCycle === "monthly" ? "1499 Kč" : "1199 Kč"}
                </span>
                <span className="text-gray-500 ml-2 text-lg">/měsíc</span>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-sm text-green-600 font-medium mt-2">Ušetříte 3 600 Kč ročně</p>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-8 pb-8">
              <Button
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                onClick={handleUpgrade}
                disabled={isActive || isLoadingCheckout}
              >
                {isLoadingCheckout ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Přesměrování na platbu...
                  </>
                ) : isActive ? (
                  "Váš plán je aktivní"
                ) : (
                  <>
                    Upgradovat na Live
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4 w-full">Bez závazků. Zrušit můžete kdykoli.</p>
            </CardFooter>
          </Card>
        </div>

        {/* Value Props */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Proč upgradovat na Premium?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Trading není jen o strategii, je to o hlavě. Premium vám dává nástroje k ovládnutí vaší psychologie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Psycholog</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Váš osobní kouč dostupný 24/7. Analyzuje vaše emoce a dává okamžitou zpětnou vazbu, abyste nedělali
                chyby z emocí.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hloubková Analytika</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Odhalte skryté vzorce ve vašem chování. Zjistěte, kdy obchodujete nejlépe a kdy byste raději neměli
                obchodovat vůbec.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rychlejší Progres</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Tradeři s deníkem a reflexí dosahují ziskovosti o 40% rychleji. Premium nástroje tento proces ještě
                urychlují.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Často kladené otázky</h2>
          <div className="space-y-4">
            {[
              {
                q: "Mohu zrušit předplatné kdykoli?",
                a: "Ano, samozřejmě. Předplatné můžete zrušit jedním kliknutím v nastavení účtu. Žádné skryté poplatky nebo výpovědní lhůty.",
              },
              {
                q: "Jaký je rozdíl mezi Virtuálním a Live režimem?",
                a: "Virtuální režim slouží pouze k prohlídce aplikace s testovacími daty. Live režim vám umožní zadávat vlastní obchody, sledovat reálné statistiky a využívat AI kouče naplno.",
              },
              {
                q: "Jsou moje data v bezpečí?",
                a: "Absolutně. Používáme šifrování na úrovni bankovních standardů. Vaše obchodní data jsou soukromá a nikdy je nesdílíme s třetími stranami.",
              },
              {
                q: "Mohu přejít z měsíčního na roční plán?",
                a: "Ano, změnu můžete provést kdykoli v nastavení. Při přechodu na roční plán okamžitě získáte slevu 20%.",
              },
            ].map((faq, i) => (
              <Card
                key={i}
                className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
              >
                <CardHeader className="py-5">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="pb-5 pt-0">
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
