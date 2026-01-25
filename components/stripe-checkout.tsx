'use client'

import { useCallback, useState } from 'react'
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
