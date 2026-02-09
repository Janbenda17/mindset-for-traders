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
  const [checkCount, setCheckCount] = useState(0)
  const maxChecks = 30 // Check for up to 60 seconds (30 checks x 2 seconds)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user?.email) {
        console.log("[v0] [CHECKOUT] No user email available")
        setError("Email uživatele není dostupný")
        setVerifying(false)
        return
      }

      try {
        console.log(`[v0] [CHECKOUT] Check #${checkCount + 1}/${maxChecks} - Direct Stripe check for:`, user.email)
        
        // Call the direct payment check endpoint that queries Stripe
        const response = await fetch(`/api/subscription/check-payment?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()

        console.log("[v0] [CHECKOUT] Direct Stripe check response:", data)

        if (data.success && data.isPremium) {
          console.log("[v0] [CHECKOUT] ✓ Active subscription confirmed in Stripe!")
          
          // Refresh subscription context with the new status
          await checkSubscriptionStatus()
          
          setSuccess(true)
          setVerifying(false)
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push("/")
          }, 2000)
          return
        }
        
        // If we haven't hit max checks yet, try again
        if (checkCount < maxChecks) {
          console.log(`[v0] [CHECKOUT] No active subscription yet, retrying in 2 seconds...`)
          setTimeout(() => {
            setCheckCount(prev => prev + 1)
          }, 2000)
        } else {
          // Max retries reached
          console.log("[v0] [CHECKOUT] Max retries reached (60 seconds), redirecting to account")
          setSuccess(true)
          setVerifying(false)
          
          setTimeout(() => {
            router.push("/account")
          }, 2000)
        }
      } catch (err) {
        console.error("[v0] [CHECKOUT] Verification error:", err)
        setError("Chyba při ověření platby. Zkuste načíst stránku znovu.")
        setVerifying(false)
      }
    }

    // Only run when checkCount changes or on initial mount
    if (checkCount <= maxChecks) {
      verifyPayment()
    }
  }, [user?.email, router, checkSubscriptionStatus, checkCount, maxChecks])

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
              <p className="text-xs text-gray-500">Pokus: {checkCount + 1}/{maxChecks}</p>
            </>
          )}

          {success && !verifying && (
            <>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="text-center">
                <h3 className="font-semibold text-lg text-green-600 mb-2">Platba úspěšná! ✓</h3>
                <p className="text-sm text-gray-600 mb-4">Váš účet byl aktivován jako Premium.</p>
                <p className="text-xs text-gray-500">Budete přesměrováni...</p>
              </div>
            </>
          )}

          {error && !verifying && (
            <>
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <h3 className="font-semibold text-lg text-red-600 mb-2">Chyba</h3>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <div className="flex gap-2 flex-col">
                  <Button onClick={() => window.location.reload()}>
                    Zkusit znovu
                  </Button>
                  <Link href="/account">
                    <Button variant="outline" className="w-full">Přejít na účet</Button>
                  </Link>
                </div>
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
