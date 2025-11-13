"use client"

import { Flame } from "lucide-react"
import { useStreak } from "@/contexts/streak-context"

interface StreakBadgeProps {
  type: "journaling" | "morningCheck" | "dailyTracker"
  size?: "sm" | "md" | "lg"
}

export function StreakBadge({ type, size = "md" }: StreakBadgeProps) {
  const { streaks } = useStreak()
  const streak = streaks[type]

  const getColor = () => {
    if (streak.current >= 100) return "text-purple-400"
    if (streak.current >= 30) return "text-orange-400"
    if (streak.current >= 7) return "text-yellow-400"
    return "text-slate-500"
  }

  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3"
      case "lg":
        return "h-6 w-6"
      default:
        return "h-4 w-4"
    }
  }

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-xs"
      case "lg":
        return "text-lg"
      default:
        return "text-sm"
    }
  }

  if (streak.current === 0) return null

  return (
    <div className="inline-flex items-center gap-1">
      <Flame className={`${getSize()} ${getColor()}`} />
      <span className={`${getTextSize()} font-bold ${getColor()}`}>{streak.current}</span>
    </div>
  )
}
