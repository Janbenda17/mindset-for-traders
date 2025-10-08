"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, ArrowRight, Loader2 } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { checkSubscriptionStatus } = useSubscription()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationSuccess, setVerificationSuccess] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      verifySession(sessionId)
    } else {
      setIsVerifying(false)
    }
  }, [searchParams])

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/subscription/verify-session?session_id=${sessionId}`)
      const data = await response.json()

      if (data.success) {
        setVerificationSuccess(true)
        // Refresh subscription status
        await checkSubscriptionStatus()
      }
    } catch (error) {
      console.error("Error verifying session:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleContinue = () => {
    router.push("/")
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Ověřujeme vaši platbu...</h2>
            <p className="text-gray-600">Prosím počkejte, zpracováváme vaše předplatné.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Platba úspěšná!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold text-yellow-800 mb-1">Premium aktivován!</h3>
            <p className="text-sm text-yellow-700">
              Váš 7-denní trial začal. Po trialu bude automaticky strženo €59/měsíc.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <h4 className="font-medium text-gray-900">Co máte nyní k dispozici:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Neomezený trading deník
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Pokročilé analýzy a reporty
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                MindTrader AI Pro
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Export dat a prioritní podpora
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Začít používat Premium
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-gray-500">Fakturu a detaily předplatného najdete v nastavení účtu.</p>
        </CardContent>
      </Card>
    </div>
  )
}
