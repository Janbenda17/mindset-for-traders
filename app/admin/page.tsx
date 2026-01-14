"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Calendar, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface RegisteredUser {
  id: string
  email: string
  name: string
  stripeCustomerId?: string
  createdAt: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    // Only owner can access
    if (!user?.isOwner) {
      router.push("/")
      return
    }

    loadUsers()
  }, [user, router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, stripe_customer_id, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      const users = data.map((profile) => ({
        id: profile.id,
        email: profile.email || "",
        name: profile.full_name || "",
        stripeCustomerId: profile.stripe_customer_id || undefined,
        createdAt: profile.created_at,
      }))

      setRegisteredUsers(users)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Opravdu chcete smazat tohoto uživatele?")) return

    try {
      setDeleting(userId)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.error("Error deleting auth user:", authError)
        // Continue to delete profile even if auth deletion fails
      }

      // Delete the profile (this will cascade delete related data due to foreign keys)
      const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId)

      if (profileError) throw profileError

      // Update local state
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Chyba při mazání uživatele")
    } finally {
      setDeleting(null)
    }
  }

  if (!user?.isOwner) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(regUser.id)}
                  disabled={deleting === regUser.id}
                >
                  {deleting === regUser.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Smazat
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(regUser.createdAt).toLocaleDateString("cs-CZ")}
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
