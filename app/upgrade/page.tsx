"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription, type SubscriptionPlan } from "@/contexts/subscription-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const { user } = useAuth()
  const { currentPlan, setPlan } = useSubscription()
  const router = useRouter()

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setIsLoading(true)
    setSelectedPlan(plan)

    try {
      // In a real app, this would be an API call to upgrade the subscription
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update the user's plan
      setPlan(plan)

      // Update user plan in localStorage
      if (user) {
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        userData.plan = plan
        localStorage.setItem("user", JSON.stringify(userData))
      }

      // Redirect to account page
      router.push("/account?upgrade=success")
    } catch (error) {
      console.error("Upgrade error:", error)
    } finally {
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upgrade Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Choose the plan that best fits your trading needs</p>
      </div>

      <Tabs defaultValue="monthly" className="w-full max-w-3xl mx-auto mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
            Monthly
          </TabsTrigger>
          <TabsTrigger value="yearly" onClick={() => setBillingCycle("yearly")}>
            Yearly <Badge className="ml-2 bg-green-500/20 text-green-700">Save 20%</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {/* FREE Plan */}
        <Card className={`flex flex-col border-2 ${currentPlan === "FREE" ? "border-primary" : ""}`}>
          <CardHeader>
            <CardTitle>FREE</CardTitle>
            <CardDescription>Basic journal for beginner traders</CardDescription>
            <div className="mt-4 text-3xl font-bold">0 Kč</div>
            <p className="text-sm text-muted-foreground">Forever free</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Basic journal (mood, sleep, food)</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Mental score calculation</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Daily records</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === "FREE" ? "secondary" : "default"}
              disabled={currentPlan === "FREE" || isLoading}
              onClick={() => handleUpgrade("FREE")}
            >
              {isLoading && selectedPlan === "FREE" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === "FREE" ? (
                "Current Plan"
              ) : (
                "Downgrade"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* BASIC Plan */}
        <Card className={`flex flex-col border-2 ${currentPlan === "BASIC" ? "border-primary" : ""}`}>
          <CardHeader>
            <CardTitle>BASIC</CardTitle>
            <CardDescription>For traders who want to track their progress</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              {billingCycle === "monthly" ? "9 €" : "86 €"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">~{billingCycle === "monthly" ? "220 Kč" : "2 100 Kč"}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Everything in FREE plan</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>History records</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Weekly overview</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Export to PDF</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Motivation + quotes</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === "BASIC" ? "secondary" : "default"}
              disabled={currentPlan === "BASIC" || isLoading}
              onClick={() => handleUpgrade("BASIC")}
            >
              {isLoading && selectedPlan === "BASIC" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === "BASIC" ? (
                "Current Plan"
              ) : currentPlan === "FREE" ? (
                "Upgrade"
              ) : (
                "Downgrade"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* PRO Plan */}
        <Card className={`flex flex-col border-2 ${currentPlan === "PRO" ? "border-primary" : ""} relative`}>
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
            <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle>PRO</CardTitle>
            <CardDescription>For advanced traders who want to analyze their behavior</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              {billingCycle === "monthly" ? "19 €" : "182 €"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">~{billingCycle === "monthly" ? "460 Kč" : "4 400 Kč"}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Everything in BASIC plan</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Behavior pattern analysis</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Notifications / reminders</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Trading behavior reflection</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Custom weights and overviews</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === "PRO" ? "secondary" : "default"}
              disabled={currentPlan === "PRO" || isLoading}
              onClick={() => handleUpgrade("PRO")}
            >
              {isLoading && selectedPlan === "PRO" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === "PRO" ? (
                "Current Plan"
              ) : currentPlan === "PRO_PLUS" ? (
                "Downgrade"
              ) : (
                "Upgrade"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* PRO+ Plan */}
        <Card className={`flex flex-col border-2 ${currentPlan === "PRO_PLUS" ? "border-primary" : ""}`}>
          <CardHeader>
            <CardTitle>PRO+</CardTitle>
            <CardDescription>For professional traders and mentors</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              {billingCycle === "monthly" ? "29 €" : "278 €"}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">~{billingCycle === "monthly" ? "700 Kč" : "6 700 Kč"}</p>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Everything in PRO plan</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>MetaTrader integration</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Mental AI coach</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Sharing with mentor / coach</span>
              </li>
              <li className="flex items-start">
                <Check className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                <span>Personalized stress management strategies</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === "PRO_PLUS" ? "secondary" : "default"}
              disabled={currentPlan === "PRO_PLUS" || isLoading}
              onClick={() => handleUpgrade("PRO_PLUS")}
            >
              {isLoading && selectedPlan === "PRO_PLUS" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentPlan === "PRO_PLUS" ? (
                "Current Plan"
              ) : (
                "Upgrade"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  )
}
