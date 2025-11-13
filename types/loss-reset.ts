export type LossResetMode = "user-choice" | "ai-recommended" | "random"
export type LossResetActivity = "cold-shower" | "physical" | "meditation" | "write" | "walk"
export type CoachTone = "calm-mentor" | "strict-coach"

export interface LossResetSession {
  id: string
  triggeredAt: Date
  triggeredBy: "auto" | "manual"
  mode: LossResetMode
  activity: LossResetActivity
  duration: number
  completed: boolean
  completedAt?: Date
  context: {
    lastTrade?: {
      pnl: number
      time: Date
    }
    emotion?: string
    readinessScore?: number
  }
  aiReflection?: {
    tags: string[]
    recommendations: string[]
    motivationalMessage: string
  }
}

export interface ActivityConfig {
  id: LossResetActivity
  name: string
  description: string
  why: string
  duration: number
  instructions: string[]
  icon: string
  color: string
  completionType: "timer" | "manual" | "input"
  cooldown?: number // hours
}
