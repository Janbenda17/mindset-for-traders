"use client"

import { useSubscription, type SubscriptionPlan } from "@/contexts/subscription-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function PlanSelector() {
  const { currentPlan, setPlan } = useSubscription()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Aktuální plán:</span>
      <Select value={currentPlan} onValueChange={(value) => setPlan(value as SubscriptionPlan)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Vyberte plán" />
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
