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

export const dynamic = "force-dynamic"

function CheckoutSuccessContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { checkSubscriptionStatus } = useSubscription()
  
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 15 // Max 30 seconds (15 checks x 2 seconds)
  const [hasStopped, setHasStopped] = useState(false)

  useEffect(() => {
    if (!user?.email || hasStopped) {
      return
    }

    if (pollCount > maxPolls) {
      console.log("[v0] [CHECKOUT] Max polls reached, stopping")
      setHasStopped(true)
      setSuccess(true)
      setVerifying(false)
      setTimeout(() => router.push("/account"), 1000)
      return
    }

    const timer = setTimeout(async () => {
      console.log(`[v0] [CHECKOUT] Poll #${pollCount + 1}/${maxPolls}`)
      
      try {
        const response = await fetch(`/api/subscription/check-payment?email=${encodeURIComponent(user.email)}`)
        const data = await response.json()

        console.log("[v0] [CHECKOUT] Check response:", { success: data.success, isPremium: data.isPremium, pollCount: pollCount + 1 })

        if (data.success && data.isPremium) {
          console.log("[v0] [CHECKOUT] ✓ Premium confirmed!")
          await checkSubscriptionStatus()
          setSuccess(true)
          setVerifying(false)
          setHasStopped(true)
          setTimeout(() => router.push("/"), 1000)
          return
        }

        // Continue polling
        setPollCount(prev => prev + 1)
      } catch (err) {
        console.error("[v0] [CHECKOUT] Error:", err)
        setError("Chyba při ověření. Zkuste to prosím znovu.")
        setVerifying(false)
        setHasStopped(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [user?.email, pollCount, maxPolls, hasStopped, router, checkSubscriptionStatus])

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
