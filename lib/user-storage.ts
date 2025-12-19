"use client"

import { useAuth } from "@/contexts/auth-context"

/**
 * COMPLETE USER DATA ISOLATION
 * Every user gets their own storage namespace
 * Format: user-{userId}-{key}
 */

export function getUserStorageKey(userId: string | null | undefined, key: string): string {
  if (!userId) return key
  return `user-${userId}-${key}`
}

export function useUserStorage() {
  const { user } = useAuth()

  return {
    // Core trading data
    getTradesKey: () => getUserStorageKey(user?.id, "mindtrader-trades"),
    getCheckKey: () => getUserStorageKey(user?.id, "mindtrader-morning-checks"),
    getJournalKey: () => getUserStorageKey(user?.id, "journal-entries"),
    getPlansKey: () => getUserStorageKey(user?.id, "trading-plans"),
    getIntentionsKey: () => getUserStorageKey(user?.id, "daily-intentions"),
    getProfileKey: () => getUserStorageKey(user?.id, "trader-mindset-profile"),
    getIdentityKey: () => getUserStorageKey(user?.id, "trading-identity-profile"),
    getStyleKey: () => getUserStorageKey(user?.id, "trader-mindset-trading-style"),
    getMoodKey: () => getUserStorageKey(user?.id, "trader-mindset-mood-entries"),
    getTrackerKey: () => getUserStorageKey(user?.id, "daily-tracker-entries"),
    getStagesKey: () => getUserStorageKey(user?.id, "daily-stages"),
    getGamificationKey: () => getUserStorageKey(user?.id, "gamification-data"),
    getStreakKey: () => getUserStorageKey(user?.id, "streak-data"),
    getMilestonesKey: () => getUserStorageKey(user?.id, "milestones"),
    getLossResetKey: () => getUserStorageKey(user?.id, "loss-reset-sessions"),
    getGoalsKey: () => getUserStorageKey(user?.id, "trading-goals"),
    getRoutinesKey: () => getUserStorageKey(user?.id, "trading-routines"),
    getReviewsKey: () => getUserStorageKey(user?.id, "weekly-reviews"),
    getAiPrefillKey: () => getUserStorageKey(user?.id, "mindtrader-ai-prefill"),
    getMessageCountKey: () => getUserStorageKey(user?.id, "mindtrader-message-count"),
    getTeamPostsKey: () => getUserStorageKey(user?.id, "team-club-posts"),
    getTeamQAKey: () => getUserStorageKey(user?.id, "team-club-qa"),
    getTeamStoriesKey: () => getUserStorageKey(user?.id, "team-club-stories"),
    getTeamBuddiesKey: () => getUserStorageKey(user?.id, "team-club-buddies"),
    getActionFlowsKey: () => getUserStorageKey(user?.id, "mindtrader-action-flows"),
  }
}

/**
 * Clear ALL data for a user when they logout or delete account
 */
export function clearUserData(userId: string | null | undefined) {
  if (!userId) return

  const keys = [
    "mindtrader-trades",
    "mindtrader-morning-checks",
    "journal-entries",
    "trading-plans",
    "daily-intentions",
    "trader-mindset-profile",
    "trading-identity-profile",
    "trader-mindset-trading-style",
    "trader-mindset-mood-entries",
    "daily-tracker-entries",
    "daily-stages",
    "gamification-data",
    "streak-data",
    "milestones",
    "loss-reset-sessions",
    "trading-goals",
    "trading-routines",
    "weekly-reviews",
    "mindtrader-ai-prefill",
    "mindtrader-message-count",
    "team-club-posts",
    "team-club-qa",
    "team-club-stories",
    "team-club-buddies",
    "mindtrader-action-flows",
  ]

  keys.forEach((key) => {
    localStorage.removeItem(getUserStorageKey(userId, key))
  })
}
