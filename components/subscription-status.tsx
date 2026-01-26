"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { Crown, CreditCard, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export function SubscriptionStatus() {
  const {
    plan,
    isActive,
    isPremium,
    daysRemaining,
    trialEndsAt,
    subscriptionId,
    customerId,
    isLoading,
    openBillingPortal,
    cancelSubscription,
    checkSubscriptionStatus,
  } = useSubscription()

  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null)

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/subscription/billing-portal", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to open billing portal")
      }

      const data = await response.json()
      if (data.url) {
        window.open(data.url, "_blank")
      }
    } catch (error) {
      console.error("Error opening billing portal:", error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Opravdu chcete zrušit předplatné? Zůstane aktivní do konce aktuálního období.")) {
      return
    }

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      const data = await response.json()
      
      // Show success toast
      console.log("[v0] Subscription canceled:", data.message)
      
      // Refresh subscription status
      await checkSubscriptionStatus()
    } catch (error) {
      console.error("[v0] Error canceling subscription:", error)
    }
  }

  const isTrialing = trialEndsAt && new Date(trialEndsAt) > new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Předplatné
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Aktuální plán:</span>
              <Badge variant={isPremium ? "default" : "secondary"} className="capitalize">
                {plan === "premium" ? "Premium" : "Free"}
              </Badge>
            </div>
            {isPremium && (
              <p className="text-sm text-gray-600 mt-1">
                {isTrialing ? `Trial končí za ${daysRemaining} dní` : "€59/měsíc"}
              </p>
            )}
          </div>
          {isPremium && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Aktivní</span>
            </div>
          )}
        </div>

        {/* Trial Information */}
        {isTrialing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Trial období</span>
            </div>
            <p className="text-sm text-blue-800">
              Váš trial končí {new Date(trialEndsAt).toLocaleDateString("cs-CZ")}. Po skončení trialu bude automaticky
              strženo €59/měsíc.
            </p>
          </div>
        )}

        {/* Free Plan Limitations */}
        {!isPremium && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-900">Omezení Free plánu</span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Maximálně 10 záznamů v deníku za měsíc</li>
              <li>• Základní analýzy</li>
              <li>• Omezený přístup k MindTrader AI</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {isPremium ? (
            <>
              <Button asChild className="w-full">
                <Link href="/subscription/manage">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Spravovat předplatné
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link href="/upgrade">
                <Crown className="h-4 w-4 mr-2" />
                Upgradovat na Premium
              </Link>
            </Button>
          )}
        </div>

        {/* Customer ID for debugging */}
        {customerId && <div className="text-xs text-gray-500 pt-2 border-t">Customer ID: {customerId}</div>}
      </CardContent>
    </Card>
  )
}
