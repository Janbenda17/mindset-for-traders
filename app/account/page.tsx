"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlanSelector } from "@/components/plan-selector"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { BarChart, Brain, DollarSign, PercentIcon } from "lucide-react"

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth()
  const { currentPlan } = useSubscription()
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgradeSuccess = searchParams?.get("upgrade") === "success"
  const [resetSuccess, setResetSuccess] = useState(false)
  const [userData, setUserData] = useState({
    metrics: {
      totalProfit: 0,
      mentalStability: 0,
      winRate: 0,
      totalTrades: 0,
    },
  })

  // Function to load user data
  const loadUserData = () => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("user-data")
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setUserData({
            metrics: {
              totalProfit: parsedData.metrics?.totalProfit || 0,
              mentalStability: parsedData.metrics?.mentalStability || 0,
              winRate: parsedData.metrics?.winRate || 0,
              totalTrades: parsedData.metrics?.totalTrades || 0,
            },
          })
        } catch (error) {
          console.error("Error parsing user data:", error)
          // If there's an error, reset to defaults
          setUserData({
            metrics: {
              totalProfit: 0,
              mentalStability: 0,
              winRate: 0,
              totalTrades: 0,
            },
          })
        }
      }
    }
  }

  // Load user data from localStorage
  useEffect(() => {
    loadUserData()
  }, [])

  // Function to reset all user analytics
  const resetAnalytics = () => {
    try {
      if (typeof window === "undefined") return

      // Create a fresh empty data structure
      const emptyUserData = {
        metrics: {
          totalProfit: 0,
          totalTrades: 0,
          winRate: 0,
          averageProfit: 0,
          averageLoss: 0,
          profitFactor: 0,
          mentalStability: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
        },
        mentalScores: [],
        journalEntries: [],
        affirmations: [],
        tradingHistory: [],
      }

      // Save the reset data
      localStorage.setItem("user-data", JSON.stringify(emptyUserData))

      // Also reset session data
      sessionStorage.removeItem("session-initialized")
      localStorage.removeItem("mindtrader-form-data")

      // Update the UI with the reset data
      setUserData({
        metrics: {
          totalProfit: 0,
          mentalStability: 0,
          winRate: 0,
          totalTrades: 0,
        },
      })

      // Show success message
      setResetSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false)
      }, 3000)

      // Force reload the page to ensure all components update
      window.location.reload()
    } catch (error) {
      console.error("Error resetting analytics:", error)
      alert("There was an error resetting your data. Please try again.")
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and subscription</p>
      </div>

      {resetSuccess && (
        <Alert className="mb-6 border-green-500 text-green-500">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Analytics Reset</AlertTitle>
          <AlertDescription className="text-green-500">
            All your analytics data has been reset successfully.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${userData?.metrics?.totalProfit || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mental Stability</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.metrics?.mentalStability || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <PercentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.metrics?.winRate || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.metrics?.totalTrades || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Plan</Label>
                <div className="rounded-md border p-4">
                  <div className="font-medium">{currentPlan} Plan</div>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan === "FREE"
                      ? "Basic features for personal use"
                      : currentPlan === "BASIC"
                        ? "Essential features for traders"
                        : currentPlan === "PRO"
                          ? "Advanced features for serious traders"
                          : "All features for professional traders"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Change Plan</Label>
                <PlanSelector />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <a href="/pricing">View Pricing</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button variant="destructive" onClick={logout}>
                  Log Out
                </Button>
                <Button variant="outline" className="text-destructive">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your trading data and analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Reset Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  This will reset all your trading metrics, mental scores, and history. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end">
                <Button variant="destructive" onClick={resetAnalytics}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset My Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Data</CardTitle>
              <CardDescription>View your current data values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">Metrics</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total Profit:</div>
                    <div>${userData?.metrics?.totalProfit || 0}</div>
                    <div>Mental Stability:</div>
                    <div>{userData?.metrics?.mentalStability || 0}%</div>
                    <div>Win Rate:</div>
                    <div>{userData?.metrics?.winRate || 0}%</div>
                    <div>Total Trades:</div>
                    <div>{userData?.metrics?.totalTrades || 0}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {upgradeSuccess && (
        <div className="mb-6">
          <Alert className="border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Subscription Updated</AlertTitle>
            <AlertDescription className="text-green-500">
              Your subscription has been successfully updated to the {currentPlan} plan.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
