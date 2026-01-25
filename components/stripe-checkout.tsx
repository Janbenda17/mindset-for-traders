'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { startCheckoutSession } from '@/app/actions/stripe'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  email: string
  name: string
  onBack: () => void
  onSuccess?: () => void
}

export default function StripeCheckout({ email, name, onBack, onSuccess }: StripeCheckoutProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  const fetchClientSecret = useCallback(
    async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("[v0] StripeCheckout: Fetching client secret for", email)
        const secret = await startCheckoutSession(email, name)
        console.log("[v0] StripeCheckout: Got client secret")
        return secret
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Neznámá chyba"
        console.error("[v0] StripeCheckout: Error:", errorMessage)
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [email, name]
  )

  // Monitor payment completion - check subscription status every 2 seconds after checkout loads
  useEffect(() => {
    if (!isPaid && !isLoading) {
      // Set up polling to check payment status
      const interval = setInterval(async () => {
        try {
          const response = await fetch("/api/subscription/status", {
            credentials: "include",
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log("[v0] StripeCheckout: Subscription check - isPremium:", data.isPremium)
            
            if (data.isPremium) {
              console.log("[v0] StripeCheckout: ✓ Payment successful! User is now premium")
              setIsPaid(true)
              clearInterval(interval)
              
              // Wait 1 second then call success callback
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess()
                }
              }, 1000)
            }
          }
        } catch (err) {
          console.error("[v0] StripeCheckout: Status check error:", err)
        }
      }, 2000)
      
      return () => clearInterval(interval)
    }
  }, [isPaid, isLoading, onSuccess])

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-900">
              ✓ Platba byla úspěšně zpracována! Váš účet je nyní Premium. Aktualizuji...
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onBack}
          disabled={isLoading}
          className="mb-4"
        >
          ← Zpět na ceníky
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Chyba: {error}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Alert className="mb-4">
            <AlertDescription>
              Načítám formulář pro platbu...
            </AlertDescription>
          </Alert>
        )}

        <div id="checkout" className="w-full">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  )
}
