"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Calendar, Trash2, Loader2, Zap, CheckCircle2, AlertCircle, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ensureOwnerLiveMode } from "@/lib/owner-utils" // Import the ensureOwnerLiveMode function

interface RegisteredUser {
  id: string
  email: string
  name: string
  mode?: string
  isOwner?: boolean
  stripeCustomerId?: string
  createdAt: string
}

export default function AdminPage() {
  const { user, isLoading, authReady } = useAuth()
  const router = useRouter()
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, string>>({})
  const [launchDayTest, setLaunchDayTest] = useState<string>("")
  const [sanityCheck, setSanityCheck] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Wait for auth to be ready before doing anything
    if (!authReady) {
      console.log("[v0] Admin: Waiting for auth to be ready...")
      return
    }

    // Only owner can access
    if (!user?.isOwner) {
      console.log("[v0] Admin: User is not owner, redirecting to /")
      router.push("/")
      return
    }

    console.log("[v0] Admin: Auth ready and user is owner, loading data...")
    loadUsers()
    runSanityCheck()

    // Ensure honza.newage@gmail.com is in LIVE mode (owner account)
    ensureOwnerLiveMode().then((success) => {
      if (success) {
        setTestResults((prev) => ({
          ...prev,
          "Owner Live Mode": "✅ honza.newage@gmail.com set to LIVE mode",
        }))
      }
    })
  }, [user, router, authReady])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, trading_mode, role, stripe_customer_id, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      const users = data.map((profile) => ({
        id: profile.user_id,
        email: profile.email || "",
        name: profile.full_name || "",
        mode: profile.trading_mode || "virtual",
        isOwner: profile.role === "owner",
        stripeCustomerId: profile.stripe_customer_id || undefined,
        createdAt: profile.created_at,
      }))

      setRegisteredUsers(users)
    } catch (error) {
      console.error("Error loading users:", error)
      setTestResults((prev) => ({ ...prev, "Load Users": "❌ Failed to load users" }))
    } finally {
      setLoading(false)
    }
  }

  const runSanityCheck = async () => {
    const checks: Record<string, boolean> = {}
    try {
      // Check 1: Database connectivity
      const { data: dbTest, error: dbError } = await supabase.from("profiles").select("count", { count: "exact" })
      checks["Database Connected"] = !dbError

      // Check 2: Supabase auth working
      const { data: { session } } = await supabase.auth.getSession()
      checks["Auth Session Valid"] = !!session

      // Check 3: Owner account exists
      const ownerExists = registeredUsers.some((u) => u.isOwner)
      checks["Owner Account Exists"] = ownerExists

      // Check 4: At least one user registered
      checks["Users Registered"] = registeredUsers.length > 0

      // Check 5: Profiles have mode field
      const profilesWithMode = registeredUsers.filter((u) => u.mode).length
      checks["Mode Field Populated"] = profilesWithMode > 0

      setSanityCheck(checks)
    } catch (error) {
      console.error("Sanity check failed:", error)
    }
  }

  const switchUserMode = async (userId: string, newMode: "live" | "virtual") => {
    try {
      setUpdating(userId)
      const { error } = await supabase
        .from("profiles")
        .update({ trading_mode: newMode })
        .eq("user_id", userId)

      if (error) throw error

      // Update local state
      setRegisteredUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, mode: newMode } : u))
      )

      setTestResults((prev) => ({
        ...prev,
        [`Switch ${userId.slice(0, 8)}...`]: `✅ User switched to ${newMode.toUpperCase()} mode`,
      }))
    } catch (error) {
      console.error("Error switching mode:", error)
      setTestResults((prev) => ({
        ...prev,
        [`Switch ${userId.slice(0, 8)}...`]: "❌ Failed to switch mode",
      }))
    } finally {
      setUpdating(null)
    }
  }

  const testLaunchDay = () => {
    const now = new Date()
    const launchDate = new Date("2025-02-01T16:00:00")
    const timeUntilLaunch = launchDate.getTime() - now.getTime()
    const hoursUntilLaunch = Math.floor(timeUntilLaunch / (1000 * 60 * 60))
    const minutesUntilLaunch = Math.floor((timeUntilLaunch % (1000 * 60 * 60)) / (1000 * 60))

    if (timeUntilLaunch <= 0) {
      setLaunchDayTest("🚀 LAUNCH DAY ACTIVE! Landing page should show post-launch state")
    } else {
      setLaunchDayTest(`⏱️ ${hoursUntilLaunch}h ${minutesUntilLaunch}m until launch (Feb 1, 4:00 PM)`)
    }

    setTestResults((prev) => ({
      ...prev,
      "Launch Day Test": timeUntilLaunch <= 0 ? "✅ Launch is active!" : "⏳ Countdown active",
    }))
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
      setTestResults((prev) => ({
        ...prev,
        [`Delete ${userId.slice(0, 8)}...`]: "✅ User deleted",
      }))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Chyba při mazání uživatele")
      setTestResults((prev) => ({
        ...prev,
        [`Delete ${userId.slice(0, 8)}...`]: "❌ Failed to delete",
      }))
    } finally {
      setDeleting(null)
    }
  }

  if (!user?.isOwner) {
    return null
  }

  // Wait for auth to be ready and data to load
  if (!authReady || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Správa a testování aplikace</p>
        </div>
        <Badge variant="default" className="h-8">
          <Users className="mr-2 h-4 w-4" />
          {registeredUsers.length} uživatelů
        </Badge>
      </div>

      <Tabs defaultValue="users" className="w-full flex-1 overflow-hidden flex flex-col">
        <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
          <TabsTrigger value="users">Uživatelé</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="sanity">Sanity Check</TabsTrigger>
          <TabsTrigger value="launch">Launch Day</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4 overflow-y-auto pr-4">
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
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {regUser.name}
                        {regUser.isOwner && <Badge className="bg-purple-600">Owner</Badge>}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {regUser.email}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => switchUserMode(regUser.id, regUser.mode === "live" ? "virtual" : "live")}
                        disabled={updating === regUser.id}
                      >
                        {updating === regUser.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        {regUser.mode === "live" ? "→ Virtual" : "→ Live"}
                      </Button>
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant={regUser.mode === "live" ? "default" : "secondary"}>
                          {regUser.mode?.toUpperCase() || "VIRTUAL"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(regUser.createdAt).toLocaleDateString("cs-CZ")}
                      </div>
                      {regUser.stripeCustomerId && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">Stripe: {regUser.stripeCustomerId.slice(0, 12)}...</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* TESTING TAB */}
          <TabsContent value="testing" className="space-y-4 overflow-y-auto pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Test Mode
                </CardTitle>
                <CardDescription>Spusť testy a výsledky zde vidíš</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(testResults).map(([test, result]) => (
                    <div key={test} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                      <span className="font-medium text-sm">{test}</span>
                      <span className="text-sm">{result}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={runSanityCheck} className="w-full bg-transparent" variant="outline">
                  Re-run Sanity Check
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SANITY CHECK TAB */}
          <TabsContent value="sanity" className="space-y-4 overflow-y-auto pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Kontrola všech systémů</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(sanityCheck).map(([check, passed]) => (
                  <div key={check} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <span className="font-medium text-sm">{check}</span>
                    {passed ? (
                      <Badge className="bg-green-600">✓ OK</Badge>
                    ) : (
                      <Badge variant="destructive">✗ FAILED</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LAUNCH DAY TAB */}
          <TabsContent value="launch" className="space-y-4 overflow-y-auto pr-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Launch Day Test
                </CardTitle>
                <CardDescription>Testuj launch day chování</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testLaunchDay} className="w-full" variant="default">
                  Test Launch Day Status
                </Button>
                {launchDayTest && (
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">
                    <p className="text-lg font-semibold">{launchDayTest}</p>
                  </div>
                )}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Launch Date: 1.2.2025 v 16:00 CET</p>
                  <p>• Po launchingu se landing page přepne na post-launch view</p>
                  <p>• Countdown se skryje a zobrazí se tlačítko "Vstoupit"</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
