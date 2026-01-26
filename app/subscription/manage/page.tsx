"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Crown, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ManageSubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Musíte být přihlášeni.</p>
            <Button asChild className="w-full">
              <Link href="/login">Přihlásit se</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Opravdu chcete zrušit předplatné? Přístup vám zůstane do konce aktuálního období.")) {
      return
    }

    try {
      setIsCanceling(true)
      setError(null)

      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      const data = await response.json()
      setCancelSuccess(true)

      // Redirect back after 3 seconds
      setTimeout(() => {
        router.push("/account")
      }, 3000)
    } catch (err) {
      console.error("Cancel error:", err)
      setError(err instanceof Error ? err.message : "Chyba při zrušení předplatného")
    } finally {
      setIsCanceling(false)
    }
  }

  if (cancelSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-800">Předplatné zrušeno</h2>
            <p className="text-gray-600 mb-4">
              Vaše předplatné bude zrušeno na konci aktuálního období. Přístup vám zůstane až do té doby.
            </p>
            <p className="text-sm text-gray-500">Vrátíme vás na účet...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/account" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Zpět na účet
        </Link>

        <div className="space-y-6">
          {/* Current Subscription Card */}
          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Vaše Premium předplatné
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Status:</p>
                <p className="text-lg font-semibold text-yellow-800">Aktivní</p>
                <p className="text-sm text-gray-600 mt-4">Email: {user.email}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Button asChild variant="outline" className="w-full">
                  <a href="/api/subscription/billing-portal" target="_blank" rel="noopener noreferrer">
                    Spravovat na Stripe
                  </a>
                </Button>
                <Button 
                  variant="default" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/account" className="w-full">Zpět na účet</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone - Cancel Subscription */}
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Zrušit předplatné
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-100">
                <AlertDescription className="text-red-800">
                  Po zrušení bude vaše předplatné aktivní až do konce aktuálního období. Poté ztratíte přístup k premium funkcím.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                variant="destructive"
                className="w-full py-3"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rušim...
                  </>
                ) : (
                  "Zrušit předplatné"
                )}
              </Button>

              <p className="text-xs text-gray-600">
                Pokud si to rozmyslíte, můžete se znovu přihlásit na upgrade stránce.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
