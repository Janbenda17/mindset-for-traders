// Demo Account Reset Utility
// This function resets all localStorage data to completely empty state for testing

export function resetDemoAccount() {
  console.log("[v0] Starting Demo account reset...")

  const keysToKeep = ["trader-mindset-user", "trader-mindset-registered-users", "trader-mindset-subscription"]

  // Get all keys
  const allKeys = Object.keys(localStorage)

  // Remove everything except keys to keep
  allKeys.forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key)
    }
  })

  localStorage.setItem("trading-mode", "live")
  localStorage.setItem("trader-mindset-live-mode", "true")
  localStorage.setItem("trader-mindset-onboarding-completed", "true") // Skip onboarding
  localStorage.setItem("mindtrader-show-tour", "true") // Show product tour

  // Trading data - all empty
  localStorage.setItem("daily-tracker-entries", JSON.stringify([]))
  localStorage.setItem("journal-entries", JSON.stringify([]))
  localStorage.setItem("trade-records", JSON.stringify([]))
  localStorage.setItem("trading-plans", JSON.stringify([]))
  localStorage.setItem("daily-intentions", JSON.stringify([]))
  localStorage.setItem("mindtrader-morning-checks", JSON.stringify([]))
  localStorage.setItem("user-trades", JSON.stringify([]))
  localStorage.setItem("user-journal-entries", JSON.stringify([]))

  // Five stages
  localStorage.setItem("five-stages-data", JSON.stringify({}))
  localStorage.setItem("daily-stages", JSON.stringify([]))
  localStorage.setItem("daily-stages-date", new Date().toISOString().split("T")[0])

  // Gamification
  const emptyGamification = {
    xp: 0,
    level: 1,
    achievements: [],
    dailyXPLog: {},
  }
  localStorage.setItem("gamification-data", JSON.stringify(emptyGamification))

  // Team Club
  localStorage.setItem("team-club-posts", JSON.stringify([]))
  localStorage.setItem("team-club-qa", JSON.stringify([]))
  localStorage.setItem("team-club-stories", JSON.stringify([]))
  localStorage.setItem("team-club-buddies", JSON.stringify([]))
  localStorage.setItem("team-club-challenges", JSON.stringify([]))
  localStorage.setItem("team-club-leaderboard", JSON.stringify([]))
  localStorage.setItem("teamclub-daily-limits", JSON.stringify({}))
  localStorage.setItem("teamclub-reported-posts", JSON.stringify([]))
  localStorage.setItem("teamclub-reports", JSON.stringify([]))

  // Fail Log
  localStorage.setItem("fail-log-entries", JSON.stringify([]))

  // Trading Goals
  localStorage.setItem("trading-goals", JSON.stringify([]))

  // Routines
  localStorage.setItem("trading-routines", JSON.stringify({}))
  localStorage.setItem("routine-history", JSON.stringify([]))

  // Weekly Reviews
  localStorage.setItem("weekly-reviews", JSON.stringify([]))

  // Loss Reset
  localStorage.setItem("loss-reset-sessions", JSON.stringify([]))
  localStorage.setItem("loss-reset-mood-data", JSON.stringify([]))

  // Streaks
  localStorage.setItem("streak-data", JSON.stringify({}))

  // Milestones
  localStorage.setItem("milestones", JSON.stringify({}))

  // Mood entries
  localStorage.setItem("trader-mindset-mood-entries", JSON.stringify([]))
  localStorage.setItem("user-mood-entries", JSON.stringify([]))

  // Profile
  localStorage.setItem("trader-mindset-profile", JSON.stringify({}))
  localStorage.setItem("trading-identity-profile", JSON.stringify({}))

  // Action flows
  localStorage.setItem("mindtrader-action-flows", JSON.stringify([]))

  // Notifications
  localStorage.setItem("trader-mindset-notifications", JSON.stringify([]))

  // AI message counters
  localStorage.setItem("mindtrader-virtual-message-count", "0")
  localStorage.setItem("mindtrader-live-message-count", "0")
  localStorage.setItem("mindtrader-live-message-date", new Date().toISOString().split("T")[0])

  console.log("[v0] Demo account reset complete - all data cleared")
}
