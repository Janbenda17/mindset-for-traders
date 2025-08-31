"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function AccountPage() {
  const { user, updateUserName, isLoading: authLoading } = useAuth()
  const { subscription, isLoading: subscriptionLoading } = useSubscription()
  const [name, setName] = useState(user?.name || "")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setName(user.name || "")
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserName(name)
      toast({
        title: "Úspěch",
        description: "Jméno účtu bylo aktualizováno.",
      })
    } catch (error) {
      console.error("Failed to update user name:", error)
      toast({
        title: "Chyba",
        description: "Nepodařilo se aktualizovat jméno účtu.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading = authLoading || subscriptionLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Přístup odepřen</CardTitle>
            <CardDescription>Pro zobrazení této stránky se musíte přihlásit.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Nastavení účtu</h1>
      <p className="text-muted-foreground">Spravujte informace o svém profilu a předplatném.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informace o profilu</CardTitle>
            <CardDescription>Aktualizujte své jméno a e-mailovou adresu.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Jméno</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={user.email} disabled readOnly />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Ukládání..." : "Uložit změny"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stav předplatného</CardTitle>
            <CardDescription>Zobrazte podrobnosti o svém aktuálním plánu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Aktuální plán</Label>
              <p className="text-lg font-semibold capitalize">{subscription?.plan || "Free"}</p>
            </div>
            {subscription?.plan === "premium" && subscription.endDate && (
              <div className="space-y-2">
                <Label>Platí do</Label>
                <p className="text-sm">{new Date(subscription.endDate).toLocaleDateString()}</p>
              </div>
            )}
            {subscription?.plan === "free" && (
              <Button asChild>
                <a href="/upgrade">Upgrade na Premium</a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
