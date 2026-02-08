"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"

function CheckoutSuccessContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { checkSubscriptionStatus } = useSubscription()
  
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user?.email) {
        setError("Email uživatele není dostupný")
        setVerifying(false)
        return
      }

      try {
        console.log("[CHECKOUT] Verifying payment for email:", user.email)
        
        const response = await fetch(`/api/subscription/verify-email?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()

        console.log("[CHECKOUT] Email verification response:", data)

        if (response.ok && data.success && data.isPremium) {
          console.log("[CHECKOUT] Payment verified successfully!")
          
          // Wait a moment for database update, then check subscription status
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          console.log("[CHECKOUT] Refreshing subscription status...")
          await checkSubscriptionStatus()
          
          setSuccess(true)
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/")
          }, 3000)
        } else {
          setError(data.message || "Nepodařilo se ověřit platbu")
        }
      } catch (err) {
        console.error("[CHECKOUT] Verification error:", err)
        setError("Chyba při ověření platby")
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [user?.email, router, checkSubscriptionStatus])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ověření platby</CardTitle>
          <CardDescription>Prosím čekejte...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {verifying && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Ověřuji vaši platbu...</p>
            </>
          )}

          {success && !verifying && (
            <>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <h3 className="font-semibold text-lg text-green-600 mb-2">Platba úspěšná! ✓</h3>
                <p className="text-sm text-gray-600 mb-4">Váš účet byl aktivován jako Premium.</p>
                <p className="text-xs text-gray-500">Budete přesměrováni na domovskou stránku...</p>
              </div>
            </>
          )}

          {error && !verifying && (
            <>
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <h3 className="font-semibold text-lg text-red-600 mb-2">Chyba</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <Link href="/upgrade">
                  <Button className="w-full">Zpět na upgrade</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ověření platby</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Načítám...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
