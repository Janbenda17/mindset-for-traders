"use client"

import type React from "react"

import { useSubscription } from "@/contexts/subscription-context"
import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface LockedFeatureProps {
  feature: string
  title: string
  description: string
  children: React.ReactNode
}

export function LockedFeature({ feature, title, description, children }: LockedFeatureProps) {
  const { subscription, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="text-xl">Načítání...</CardTitle>
        <CardDescription>Kontrola stavu předplatného.</CardDescription>
      </Card>
    )
  }

  if (subscription?.plan === "premium") {
    return <>{children}</>
  }

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="mb-4">{description}</CardDescription>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild>
          <Link href="/upgrade">Upgrade na Premium</Link>
        </Button>
        <p className="text-sm text-muted-foreground">Odemkněte tuto a mnoho dalších funkcí.</p>
      </CardFooter>
    </Card>
  )
}
