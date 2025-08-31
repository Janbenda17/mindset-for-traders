"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function PlanSelector() {
  const { user } = useAuth()
  const { subscription, subscribe, isLoading: isSubscribing } = useSubscription()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubscribe = async (plan: "free" | "premium") => {
    if (!user) {
      router.push("/login")
      toast({
        title: "Přihlášení nutné",
        description: "Pro výběr plánu se musíte nejprve přihlásit.",
        variant: "destructive",
      })
      return
    }

    if (plan === "free") {
      toast({
        title: "Již na bezplatném plánu",
        description: "Již používáte bezplatný plán.",
      })
      return
    }

    try {
      const success = await subscribe(plan)
      if (success) {
        toast({
          title: "Předplatné úspěšné",
          description: "Váš plán byl úspěšně aktualizován na Premium!",
        })
        router.push("/") // Redirect to dashboard or home page
      } else {
        toast({
          title: "Chyba předplatného",
          description: "Nepodařilo se aktualizovat váš plán. Zkuste to prosím znovu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Chyba",
        description: "Při zpracování vašeho předplatného došlo k chybě.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">Vyberte si svůj plán</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Získejte přístup k nástrojům, které potřebujete k ovládnutí své obchodní psychologie.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Free Plan Card */}
        <Card className="flex flex-col justify-between border-2 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Zdarma</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Základní nástroje pro začátek
            </CardDescription>
            <div className="text-center text-4xl font-bold text-gray-900 dark:text-gray-50 mt-4">
              $0<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/měsíc</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Denní afirmace
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Sledování nálady
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Základní deník
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Základní analýza
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-transparent"
              variant="outline"
              onClick={() => handleSubscribe("free")}
              disabled={isSubscribing}
            >
              {isSubscribing ? "Načítání..." : "Aktuální plán"}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan Card */}
        <Card className="flex flex-col justify-between border-2 border-blue-500 shadow-lg dark:border-blue-400">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-600 dark:text-blue-300">Premium</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Odemkněte plný potenciál pro mistrovství v obchodování
            </CardDescription>
            <div className="text-center text-4xl font-bold text-gray-900 dark:text-gray-50 mt-4">
              $59<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/měsíc</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Vše z bezplatného plánu
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              **Pokročilá analýza**
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              **MindTrader AI**
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              **Vlastní afirmace**
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              **Pokročilý obchodní deník**
            </div>
            <div className="flex items-center text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              **3-denní bezplatná zkušební verze**
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleSubscribe("premium")}
              disabled={isSubscribing}
            >
              {isSubscribing ? "Přihlašování..." : "Začít 3-denní zkušební verzi"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
