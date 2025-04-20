"use client"

import type React from "react"

import { useSubscription, type SubscriptionPlan } from "@/contexts/subscription-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface LockedFeatureProps {
  featureId: string
  title: string
  description: string
  children?: React.ReactNode
}

export function LockedFeature({ featureId, title, description, children }: LockedFeatureProps) {
  const { hasAccess, getRequiredPlan } = useSubscription()
  const router = useRouter()

  const requiredPlan = getRequiredPlan(featureId)
  const planNames: Record<SubscriptionPlan, string> = {
    FREE: "Free",
    BASIC: "Basic",
    PRO: "Pro",
    PRO_PLUS: "Pro+",
  }

  if (hasAccess(featureId)) {
    return <>{children}</>
  }

  return (
    <Card className="border-dashed border-2 bg-muted/50">
      <CardHeader className="text-center">
        <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Tato funkce je dostupná pouze v plánu {requiredPlan ? planNames[requiredPlan] : "vyšším"} a vyšším.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => router.push("/upgrade")}>Upgrade Plan</Button>
      </CardFooter>
    </Card>
  )
}
