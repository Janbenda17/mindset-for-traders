"use client"

import { useSubscription, type SubscriptionPlan } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export function PlanSelector() {
  const { currentPlan, setPlan } = useSubscription()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(currentPlan)

  // Update selected plan when currentPlan changes
  useEffect(() => {
    setSelectedPlan(currentPlan)
  }, [currentPlan])

  const handlePlanChange = (value: string) => {
    const plan = value as SubscriptionPlan
    setSelectedPlan(plan)
    setPlan(plan)

    // Update user plan in localStorage
    if (user) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      userData.plan = plan
      localStorage.setItem("user", JSON.stringify(userData))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Current Plan:</span>
      <Select value={selectedPlan} onValueChange={handlePlanChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FREE">
            Free{" "}
            <Badge variant="outline" className="ml-2">
              0 Kč
            </Badge>
          </SelectItem>
          <SelectItem value="BASIC">
            Basic{" "}
            <Badge variant="outline" className="ml-2">
              9 €
            </Badge>
          </SelectItem>
          <SelectItem value="PRO">
            Pro{" "}
            <Badge variant="outline" className="ml-2">
              19 €
            </Badge>
          </SelectItem>
          <SelectItem value="PRO_PLUS">
            Pro+{" "}
            <Badge variant="outline" className="ml-2">
              29 €
            </Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
