"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Calendar, Trash2, Loader2, Download } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface RegisteredUser {
  id: string
  email: string
  name: string
  stripeCustomerId?: string
  createdAt: string
}

interface WaitlistEmail {
  id: string
  email: string
  discountCode: string
  status: string
  createdAt: string
  notifiedLaunchDay: boolean
  notifiedOneDayBefore: boolean
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [waitlistEmails, setWaitlistEmails] = useState<WaitlistEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    // Only owner can access
    if (!user?.isOwner) {
      router.push("/")
      return
    }

    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load registered users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, full_name, stripe_customer_id, created_at")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      const users = usersData.map((profile) => ({
        id: profile.id,
        email: profile.email || "",
        name: profile.full_name || "",
        stripeCustomerId: profile.stripe_customer_id || undefined,
        createdAt: profile.created_at,
      }))

      setRegisteredUsers(users)

      // Load waitlist emails
      const { data: waitlistData, error: waitlistError } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false })

      if (waitlistError) throw waitlistError

      const waitlist = waitlistData.map((item) => ({
        id: item.id,
        email: item.email,
        discountCode: item.discount_code,
        status: item.status,
        createdAt: item.created_at,
        notifiedLaunchDay: item.notified_launch_day,
        notifiedOneDayBefore: item.notified_one_day_before,
      }))

      setWaitlistEmails(waitlist)
    } catch (error) {
      console.error("Error loading data:", error)
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
      }

      const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId)

      if (profileError) throw profileError

      setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Chyba při mazání uživatele")
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteWaitlistEmail = async (emailId: string) => {
    if (!confirm("Opravdu chcete odstranit z waitlistu?")) return

    try {
      setDeleting(emailId)
      const { error } = await supabase.from("waitlist").delete().eq("id", emailId)

      if (error) throw error

      setWaitlistEmails((prev) => prev.filter((e) => e.id !== emailId))
    } catch (error) {
      console.error("Error deleting waitlist email:", error)
      alert("Chyba při mazání emailu")
    } finally {
      setDeleting(null)
    }
  }

  const exportWaitlist = () => {
    const csv = "Email,Discount Code,Status,Joined Date\n" +
      waitlistEmails.map(e => `${e.email},${e.discountCode},${e.status},${new Date(e.createdAt).toLocaleDateString("cs-CZ")}`).join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
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
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Správa aplikace</p>
      </div>

      {/* Waitlist Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Waitlist</h2>
            <p className="text-muted-foreground">Emaily z Early Access waitlistu</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportWaitlist} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Badge variant="default" className="h-8">
              <Mail className="mr-2 h-4 w-4" />
              {waitlistEmails.length} emailů
            </Badge>
          </div>
        </div>

        <div className="grid gap-2">
          {waitlistEmails.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Žádné emaily na waitlistu</p>
                <p className="text-sm text-muted-foreground">Zatím se nikdo nezaregistroval na early access</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {waitlistEmails.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.email}</p>
                      <div className="flex gap-2 mt-2 text-sm">
                        <Badge variant="outline">{item.discountCode}</Badge>
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status === "active" ? "Aktivní" : item.status}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("cs-CZ")}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWaitlistEmail(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registered Users Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Registrovaní uživatelé</h2>
            <p className="text-muted-foreground">Správa uživatelů aplikace</p>
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
    </div>
  )
}
