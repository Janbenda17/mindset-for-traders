"use client"

import { useDailyStage as useDailyStageContext } from "@/contexts/daily-stage-context"

export function useDailyStage() {
  return useDailyStageContext()
}
