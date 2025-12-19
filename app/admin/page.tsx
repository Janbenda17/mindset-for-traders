"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Calendar, Trash2 } from "lucide-react"

interface RegisteredUser {
  id: string
  email: string
  name: string
  stripeCustomerId?: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])

  useEffect(() => {
    // Only owner can access
    if (!user?.isOwner) {
      router.push("/")
      return
    }

    // Load all registered users
    const users = JSON.parse(localStorage.getItem("trader-mindset-registered-users") || "[]")
    setRegisteredUsers(users)
  }, [user, router])

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Opravdu chcete smazat tohoto uživatele?")) return

    const users = registeredUsers.filter((u) => u.id !== userId)
    localStorage.setItem("trader-mindset-registered-users", JSON.stringify(users))
    setRegisteredUsers(users)

    // Also clean up user's data
    localStorage.removeItem(`user-${userId}-mindtrader-trades`)
    localStorage.removeItem(`user-${userId}-mindtrader-morning-checks`)
    localStorage.removeItem(`user-${userId}-user-journal-entries`)
  }

  if (!user?.isOwner) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Správa registrovaných uživatelů</p>
        </div>
        <Badge variant="default" className="h-8">
          <Users className="mr-2 h-4 w-4" />
          {registeredUsers.length} uživatelů
        </Badge>
      </div>

      <div className="grid gap-4">
        {registeredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Žádní registrovaní uživatelé</p>
              <p className="text-sm text-muted-foreground">Zatím se nikdo nezaregistroval</p>
            </CardContent>
          </Card>
        ) : (
          registeredUsers.map((regUser) => (
            <Card key={regUser.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{regUser.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {regUser.email}
                  </CardDescription>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(regUser.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Smazat
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    ID: {regUser.id.slice(0, 8)}...
                  </div>
                  {regUser.stripeCustomerId && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">Stripe: {regUser.stripeCustomerId}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
